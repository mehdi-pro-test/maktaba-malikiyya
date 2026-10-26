import { isDeepStrictEqual } from 'node:util';
import 'server-only';
import { db } from '../db';
import { library, bookQuestions } from '../quiz-v12-data';
import { globalQualityReview } from '../quiz-global-quality';
import { quizSaveInput, quizPublishInput, quizArchiveInput, quizContentSchema } from './validation';
import { audit, AdminConflict, type OwnerActor } from './mutations';
const excluded = new Set(globalQualityReview.excluded.map((q) => q.questionId));
export async function saveQuizDraft(actor: OwnerActor, raw: unknown) {
  const input = quizSaveInput.parse(raw),
    book = library.find((b) => b.id === input.bookId);
  if (!book) throw new AdminConflict('Ouvrage inconnu');
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(741827)`;
    const questionId = input.id ?? `admin-${input.creationKey}`;
    let record = await tx.quizQuestionRecord.findUnique({ where: { id: questionId } });
    const baseline = bookQuestions(book.level, book.id).find((q) => q.id === questionId);
    if (!input.id && record) {
      const original = await tx.quizQuestionRevision.findFirst({
        where: { recordId: record.id, revision: 1 },
      });
      if (
        record.bookId === book.id &&
        original?.createdBy === actor.id &&
        isDeepStrictEqual(original.content, input.content) &&
        original.sourceVerification === input.sourceVerification &&
        original.globalEligible === input.globalEligible &&
        original.reason === input.reason
      )
        return record.id;
      throw new AdminConflict('Clé de création déjà utilisée. Ouvrez le brouillon existant.');
    }
    if (!record) {
      if (input.id && !baseline) throw new AdminConflict('Question inconnue');
      if (input.version !== 0) throw new AdminConflict('Version périmée');
      record = await tx.quizQuestionRecord.create({
        data: { id: questionId, bookId: book.id, originId: baseline?.id },
      });
    }
    if (record.bookId !== book.id || record.version !== input.version)
      throw new AdminConflict('Question modifiée depuis votre ouverture. Actualisez.');
    const revision = await tx.quizQuestionRevision.create({
      data: {
        recordId: record.id,
        revision: record.version + 1,
        content: input.content,
        globalEligible: !excluded.has(questionId) && input.globalEligible,
        sourceVerification: input.sourceVerification,
        createdBy: actor.id,
        reason: input.reason,
      },
    });
    await tx.quizQuestionRecord.update({
      where: { id: record.id },
      data: { version: { increment: 1 } },
    });
    await audit(
      tx,
      actor,
      'quiz.save-draft',
      'question',
      record.id,
      { activeRevisionId: record.activeRevisionId, version: record.version },
      { draftRevisionId: revision.id, version: record.version + 1 },
      input.reason,
    );
    return record.id;
  });
}
export async function publishQuizRevision(actor: OwnerActor, raw: unknown) {
  const input = quizPublishInput.parse(raw);
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(741827)`;
    const record = await tx.quizQuestionRecord.findUniqueOrThrow({ where: { id: input.id } });
    if (record.version !== input.version) throw new AdminConflict('Question modifiée. Actualisez.');
    const revision = await tx.quizQuestionRevision.findUniqueOrThrow({
      where: { id: input.revisionId },
    });
    if (revision.recordId !== record.id)
      throw new AdminConflict('Révision étrangère à cette question');
    const content = quizContentSchema.parse(revision.content);
    if (
      revision.sourceVerification !== 'OWNER_COLLATED' &&
      (content.reference.edition || content.reference.printedPage || content.reference.pdfPage)
    )
      throw new AdminConflict(
        'Édition ou pagination : une collation déclarée par le propriétaire est nécessaire.',
      );
    // Reject another live question with an identical normalized prompt.
    const peers = await tx.quizQuestionRecord.findMany({
      where: { id: { not: record.id }, archivedAt: null, activeRevisionId: { not: null } },
      include: { activeRevision: true },
    });
    const normalized = (s: string) =>
      s.normalize('NFKC').trim().toLocaleLowerCase('fr').replace(/\s+/g, ' ');
    const baseline = library.flatMap((b) => bookQuestions(b.level, b.id));
    const overrides = new Set(peers.map((p) => p.id));
    if (
      [
        ...baseline
          .filter((q) => q.id !== record.id && !overrides.has(q.id))
          .map((q) => q.promptFr),
        ...peers.map((p) => quizContentSchema.parse(p.activeRevision!.content).questionFr),
      ].some((prompt) => normalized(prompt) === normalized(content.questionFr))
    )
      throw new AdminConflict('Une autre question publiée possède le même énoncé');
    const published =
      revision.status === 'PUBLISHED'
        ? await tx.quizQuestionRevision.create({
            data: {
              recordId: record.id,
              revision: record.version + 1,
              status: 'PUBLISHED',
              content,
              globalEligible: revision.globalEligible,
              sourceVerification: revision.sourceVerification,
              createdBy: actor.id,
              reason: input.reason,
              ownerApprovedBy: actor.id,
              ownerPublishedAt: new Date(),
            },
          })
        : await tx.quizQuestionRevision.update({
            where: { id: revision.id },
            data: { status: 'PUBLISHED', ownerApprovedBy: actor.id, ownerPublishedAt: new Date() },
          });
    await tx.quizQuestionRecord.update({
      where: { id: record.id },
      data: { activeRevisionId: published.id, archivedAt: null, version: { increment: 1 } },
    });
    await audit(
      tx,
      actor,
      'quiz.publish',
      'question',
      record.id,
      { activeRevisionId: record.activeRevisionId, version: record.version },
      { activeRevisionId: published.id, version: record.version + 1, ownerApprovedBy: actor.id },
      input.reason,
    );
    return record.id;
  });
}
export async function archiveQuizQuestion(actor: OwnerActor, raw: unknown) {
  const input = quizArchiveInput.parse(raw);
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(741827)`;
    let record = await tx.quizQuestionRecord.findUnique({ where: { id: input.id } });
    if (!record) {
      const b = library.find((b) => bookQuestions(b.level, b.id).some((q) => q.id === input.id));
      if (!b || input.version !== 0) throw new AdminConflict('Question inconnue');
      record = await tx.quizQuestionRecord.create({
        data: { id: input.id, originId: input.id, bookId: b.id },
      });
    }
    if (record.version !== input.version) throw new AdminConflict('Question modifiée. Actualisez.');
    await tx.quizQuestionRecord.update({
      where: { id: record.id },
      data: { archivedAt: input.archived ? new Date() : null, version: { increment: 1 } },
    });
    await audit(
      tx,
      actor,
      input.archived ? 'quiz.archive' : 'quiz.restore',
      'question',
      record.id,
      { archived: !!record.archivedAt },
      { archived: input.archived },
      input.reason,
    );
    return record.id;
  });
}
/** Restore the exact canonical version, including its original provenance, without patching JSON. */
export async function restoreHistoricalQuiz(actor: OwnerActor, raw: unknown) {
  const { z } = await import('zod');
  const input = z
    .object({
      id: z.string().min(1).max(160),
      version: z.number().int().min(0),
      confirmed: z.literal(true),
      reason: z.string().trim().min(3).max(500),
    })
    .strict()
    .parse(raw);
  const book = library.find((b) => bookQuestions(b.level, b.id).some((q) => q.id === input.id));
  if (!book) throw new AdminConflict('Cette question ne possède pas de version historique JSON.');
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(741827)`;
    const record = await tx.quizQuestionRecord.findUniqueOrThrow({ where: { id: input.id } });
    if (record.bookId !== book.id || record.version !== input.version)
      throw new AdminConflict('Question modifiée. Actualisez.');
    await tx.quizQuestionRecord.update({
      where: { id: record.id },
      data: { activeRevisionId: null, archivedAt: null, version: { increment: 1 } },
    });
    await audit(
      tx,
      actor,
      'quiz.restore-baseline',
      'question',
      record.id,
      { activeRevisionId: record.activeRevisionId, archived: !!record.archivedAt },
      { source: 'canonical-json', version: record.version + 1 },
      input.reason,
    );
    return record.id;
  });
}
