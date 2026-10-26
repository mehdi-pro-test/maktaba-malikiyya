import { beforeEach, afterAll, it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { db } from '../src/lib/db';
import {
  saveQuizDraft,
  publishQuizRevision,
  archiveQuizQuestion,
  restoreHistoricalQuiz,
} from '../src/lib/admin/quiz';
import { library, bookQuestions, currentQuizData } from '../src/lib/quiz-v12-data';
import { currentGlobalQuestions } from '../src/lib/quiz-global-data';
const actor = { id: 'owner-quiz-fixture' },
  bookId = 'moukhtassar-al-akhdari';
const content = (prompt = 'Question synthétique de recette uniquement') => ({
  questionFr: prompt,
  options: ['a', 'b', 'c', 'd'].map((id, i) => ({
    id,
    textFr: 'Proposition synthétique ' + (i + 1),
  })),
  correctOptionId: 'a',
  explanationFr: 'Explication synthétique de test, aucun contenu religieux rédigé.',
  reference: {
    workTitleAr: 'كتاب تجريبي',
    authorAr: 'مؤلف تجريبي',
    sectionAr: 'باب تجريبي',
    quoteAr: 'نص تجريبي للاختبار فقط',
    url: 'https://example.test/fixture',
    edition: null,
    printedPage: null,
    pdfPage: null,
  },
});
const draft = (extra = {}) => ({
  creationKey: crypto.randomUUID(),
  bookId,
  version: 0,
  content: content(),
  globalEligible: true,
  sourceVerification: 'NOT_ATTESTED',
  reason: 'Recette de révision synthétique',
  ...extra,
});
async function publish(id: string) {
  const record = await db.quizQuestionRecord.findUniqueOrThrow({
    where: { id },
    include: { revisions: { orderBy: { revision: 'desc' } } },
  });
  return publishQuizRevision(actor, {
    id,
    version: record.version,
    revisionId: record.revisions[0].id,
    confirmed: true,
    reason: 'Publication explicite de recette',
  });
}
beforeEach(async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test')) throw new Error('Base isolée requise');
  await db.$executeRawUnsafe(
    'TRUNCATE "QuizQuestionRevision","QuizQuestionRecord","AdminAuditEvent" CASCADE',
  );
  vi.stubEnv('ADMIN_DATA_ENABLED', 'true');
  vi.stubEnv('QUIZ_DB_ENABLED', 'true');
});
afterAll(async () => {
  await db.$executeRawUnsafe('TRUNCATE "QuizQuestionRevision","QuizQuestionRecord" CASCADE');
  vi.unstubAllEnvs();
});
it('overlay vide : 610 questions exactement identiques, 469 en global', async () => {
  const data = await currentQuizData();
  for (const b of library) expect(data.pools.get(b.id)).toEqual(bookQuestions(b.level, b.id));
  expect(data.library.reduce((n, b) => n + b.approvedCount, 0)).toBe(610);
  expect(await currentGlobalQuestions()).toHaveLength(469);
});
it('un brouillon incomplet ne fuit pas ; publication sourcée visible sans redéploiement', async () => {
  const empty = content();
  empty.options[1].textFr = '';
  empty.reference.quoteAr = '';
  const bad = await saveQuizDraft(actor, draft({ content: empty }));
  await expect(publish(bad)).rejects.toThrow();
  const input = draft(),
    id = await saveQuizDraft(actor, input);
  expect(await currentGlobalQuestions()).toHaveLength(469);
  expect(await saveQuizDraft(actor, input)).toBe(id);
  expect(await db.quizQuestionRecord.count()).toBe(2);
  await publish(id);
  const after = await currentQuizData();
  expect(after.pools.get(bookId)).toHaveLength(41);
  expect((await currentGlobalQuestions()).some((q) => q.id === id)).toBe(true);
  const q = after.pools.get(bookId)!.find((q) => q.id === id)!;
  expect(q.sourceVerification).toBe('not-attested');
  expect(q.sources![0].reference!.quoteAr).toBe('نص تجريبي للاختبار فقط');
});
it('modifier une historique conserve la version publiée jusqu’à publication puis permet de restaurer une révision', async () => {
  const old = bookQuestions('debutant', bookId)[0];
  await saveQuizDraft(
    actor,
    draft({ id: old.id, content: content('Énoncé synthétique remplacé pour le test') }),
  );
  expect((await currentQuizData()).pools.get(bookId)!.find((q) => q.id === old.id)?.promptFr).toBe(
    old.promptFr,
  );
  await publish(old.id);
  expect(
    (await currentQuizData()).pools.get(bookId)!.find((q) => q.id === old.id)?.promptFr,
  ).toContain('synthétique');
  const r = await db.quizQuestionRecord.findUniqueOrThrow({
      where: { id: old.id },
      include: { activeRevision: true },
    }),
    first = r.activeRevision!;
  await saveQuizDraft(
    actor,
    draft({
      id: old.id,
      version: r.version,
      content: content('Deuxième énoncé synthétique de test'),
    }),
  );
  await publish(old.id);
  const latest = await db.quizQuestionRecord.findUniqueOrThrow({ where: { id: old.id } });
  await publishQuizRevision(actor, {
    id: old.id,
    version: latest.version,
    revisionId: first.id,
    confirmed: true,
    reason: 'Retour à la première révision de test',
  });
  expect(
    (await db.quizQuestionRevision.findUniqueOrThrow({ where: { id: first.id } })).ownerPublishedAt,
  ).toEqual(first.ownerPublishedAt);
  expect((await currentQuizData()).pools.get(bookId)!.find((q) => q.id === old.id)?.promptFr).toBe(
    'Énoncé synthétique remplacé pour le test',
  );
  expect(bookQuestions('debutant', bookId)[0]).toEqual(old);
});
it('une exclusion qualité historique ne peut pas être contournée par un override', async () => {
  const id = 'moukhtassar-khalil-v13-ia-013';
  await saveQuizDraft(actor, draft({ id, bookId: 'moukhtassar-khalil' }));
  await publish(id);
  expect((await currentQuizData()).pools.get('moukhtassar-khalil')!.some((q) => q.id === id)).toBe(
    true,
  );
  expect((await currentGlobalQuestions()).some((q) => q.id === id)).toBe(false);
});
it('archivage retire les nouvelles tentatives, restauration rend la dernière publiée, tentative déjà tirée immuable', async () => {
  const old = bookQuestions('debutant', bookId)[0],
    started = structuredClone(old);
  await archiveQuizQuestion(actor, {
    id: old.id,
    version: 0,
    archived: true,
    confirmed: true,
    reason: 'Retrait synthétique de recette',
  });
  expect((await currentQuizData()).pools.get(bookId)!.some((q) => q.id === old.id)).toBe(false);
  expect(started).toEqual(old);
  await archiveQuizQuestion(actor, {
    id: old.id,
    version: 1,
    archived: false,
    confirmed: true,
    reason: 'Restauration de recette',
  });
  expect((await currentQuizData()).pools.get(bookId)!.some((q) => q.id === old.id)).toBe(true);
});
it('moins de dix questions : ouvrage indisponible et ses restantes exclues du global', async () => {
  const book = library.find((b) => b.level === 'usul')!,
    q = bookQuestions(book.level, book.id)[0];
  await archiveQuizQuestion(actor, {
    id: q.id,
    version: 0,
    archived: true,
    confirmed: true,
    reason: 'Recette du seuil de disponibilité',
  });
  const data = await currentQuizData();
  expect(data.library.find((b) => b.id === book.id)?.available).toBe(false);
  expect(data.pools.get(book.id)).toHaveLength(9);
  expect((await currentGlobalQuestions()).some((q) => q.origin?.bookId === book.id)).toBe(false);
});
it('concurrence : une seule révision gagne, pages non attestées et doublons refusés à publication', async () => {
  const id = bookQuestions('debutant', bookId)[0].id;
  const outcomes = await Promise.allSettled([
    saveQuizDraft(actor, draft({ id })),
    saveQuizDraft(actor, draft({ id })),
  ]);
  expect(outcomes.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
  expect(await db.quizQuestionRevision.count()).toBe(1);
  const c = content();
  const withPage = { ...c, reference: { ...c.reference, printedPage: 12 } };
  const newId = await saveQuizDraft(actor, draft({ content: withPage }));
  await expect(publish(newId)).rejects.toThrow(/collation/);
  const duplicate = await saveQuizDraft(
    actor,
    draft({ content: content(bookQuestions('debutant', bookId)[1].promptFr) }),
  );
  await expect(publish(duplicate)).rejects.toThrow(/même énoncé/);
});

it('restaure exactement la baseline, tandis que désactiver l’admin seul conserve les publications DB', async () => {
  const old = bookQuestions('debutant', bookId)[0];
  await saveQuizDraft(
    actor,
    draft({ id: old.id, content: content('Énoncé de remplacement synthétique') }),
  );
  await publish(old.id);
  vi.stubEnv('ADMIN_ENABLED', 'false');
  expect((await currentQuizData()).pools.get(bookId)!.find((q) => q.id === old.id)?.promptFr).toBe(
    'Énoncé de remplacement synthétique',
  );
  const record = await db.quizQuestionRecord.findUniqueOrThrow({ where: { id: old.id } });
  await restoreHistoricalQuiz(actor, {
    id: old.id,
    version: record.version,
    confirmed: true,
    reason: 'Restauration exacte de la baseline',
  });
  expect((await currentQuizData()).pools.get(bookId)!.find((q) => q.id === old.id)).toEqual(old);
});
