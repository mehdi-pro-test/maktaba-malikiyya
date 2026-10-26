// Explicit owner-editorial publication contract, separate from source certification.
// Existing 1.3-review-1 gates are unchanged. This policy is authorized by the supplied owner decision.
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { publishedQuestions, type QuizQuestion } from './quiz';
import type { ResearchBank } from './quiz-v12';
const text = z
  .string()
  .min(1)
  .refine((v) => v.trim().length > 0 && !/[<>]/.test(v));
const arabic = text.refine((v) => /[\u0600-\u06ff]/.test(v));
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const bookId = z.enum(['bidayat-al-mujtahid', 'al-istidhkar']);
const domain = z.enum(['ibadat', 'muamalat', 'hudud']);
const sha = z.string().regex(/^[a-f0-9]{64}$/);
const https = z
  .string()
  .url()
  .refine((v) => {
    const u = new URL(v);
    return u.protocol === 'https:' && !u.username && !u.password;
  });
const ownerApproval = z
  .object({
    decision: z.literal('approved'),
    reviewer: text,
    reviewedAt: z.iso.date(),
    basis: text,
  })
  .strict();
const reference = z
  .object({
    workTitleAr: arabic,
    authorAr: arabic,
    sectionAr: arabic,
    quoteAr: arabic.max(1000),
    url: https,
    quoteLayer: z.literal('author-or-reported-view'),
    edition: z.null(),
    printedPage: z.null(),
    pdfPage: z.null(),
    textCheck: z.literal('requires-editorial-collation'),
  })
  .strict();
export const ultimeOwnerBankSchema = z
  .object({
    schemaVersion: z.literal('1.3-owner-editorial-approved-190-1'),
    createdAt: z.iso.date(),
    originRepo: z.literal('mehdi-pro-test/maktaba-malikiyya'),
    repoSnapshotSha: z.string().regex(/^[a-f0-9]{40}$/),
    status: z.literal('owner-approved'),
    publicationAllowed: z.boolean(),
    notice: text,
    books: z
      .array(
        z
          .object({
            id: bookId,
            titleAr: arabic,
            authorAr: arabic,
            level: z.literal('ultime'),
            existingPublishedQuestions: z.literal(10),
            coverage: z.array(domain).min(1),
            newOwnerApprovedQuestions: z.number().int().positive(),
          })
          .strict(),
      )
      .length(2),
    sources: z
      .array(
        z
          .object({
            id: z.string().regex(/^[A-Z]-[A-Z0-9]+$/),
            workTitleAr: arabic,
            authorAr: arabic,
            domain,
            chapterAr: arabic,
            url: https,
            sourceKind: z.literal('online-transcription'),
            edition: z.null(),
            printedPage: z.null(),
            editorialValidation: z.literal('pending'),
          })
          .strict(),
      )
      .length(22),
    questions: z
      .array(
        z
          .object({
            id: slug,
            bookId,
            level: z.literal('ultime'),
            domain,
            chapterAr: arabic,
            status: z.literal('owner-approved'),
            scholarlyReview: z
              .object({
                status: z.literal('not-attested'),
                reviewer: z.null(),
                reviewedAt: z.null(),
                notes: text,
              })
              .strict(),
            questionFr: text,
            options: z.array(z.object({ id: slug, textFr: text }).strict()).length(4),
            correctOptionId: slug,
            explanationFr: text,
            references: z.array(reference).min(1),
            reviewNote: text,
            ownerApproval,
          })
          .strict()
          .superRefine((q, ctx) => {
            if (
              new Set(q.options.map((o) => o.id)).size !== 4 ||
              new Set(q.options.map((o) => normalizedStem(o.textFr))).size !== 4 ||
              !q.options.some((o) => o.id === q.correctOptionId)
            )
              ctx.addIssue({
                code: 'custom',
                message: 'Choix distincts et réponse existante requis',
              });
          }),
      )
      .length(190),
    publicationMeaning: text,
    editorialOwnerApproval: ownerApproval,
  })
  .strict();
export type UltimeOwnerBank = z.infer<typeof ultimeOwnerBankSchema>;
export const ultimeOwnerDecisionSchema = z
  .object({
    schemaVersion: z.literal('owner-editorial-approval-190-v1'),
    recordedAt: z.iso.date(),
    owner: z.literal('mehdi-pro-test'),
    exactDeclaration: text,
    decision: z.enum(['owner-editorial-approved', 'pending', 'rejected']),
    approvalScope: z
      .object({
        books: z
          .object({ 'bidayat-al-mujtahid': z.literal(140), 'al-istidhkar': z.literal(50) })
          .strict(),
        questionCount: z.literal(190),
      })
      .strict(),
    publicationAuthorizationByOwner: z.boolean(),
    productionDeploymentAuthorizedByThisDeclaration: z.literal(false),
    independentReligiousReviewer: z.null(),
    citationsCheckedAgainstPrimaryEdition: z.literal('non explicitement attesté'),
    comparativeFiqhAttributionsChecked: z.literal('non explicitement attesté'),
    originalResearchBankSha256: sha,
    newOwnerApprovedBankSha256: sha,
    method: text,
    questions: z
      .array(
        z
          .object({
            questionId: slug,
            bookId,
            ownerDecision: z.enum(['approved', 'pending', 'rejected']),
          })
          .strict(),
      )
      .length(190),
  })
  .strict();
const integritySchema = z.object({ rawBankSha256: sha, canonicalBankSha256: sha }).strict();
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b, 'en'))
        .map(([k, v]) => [k, canonical(v)]),
    );
  return value;
}
export function ownerBankDigest(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex');
}
export function normalizedStem(value: string) {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('fr')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}
export function inspectUltimeOwnerBank(
  base: ResearchBank,
  existing: { id: string; bookId: string; questionFr: string }[],
  raw: unknown,
  decisionValue: unknown,
  integrityValue: unknown,
) {
  const integrity = integritySchema.parse(integrityValue);
  const decision = ultimeOwnerDecisionSchema.parse(decisionValue);
  if (
    decision.newOwnerApprovedBankSha256 !== integrity.rawBankSha256 ||
    ownerBankDigest(raw) !== integrity.canonicalBankSha256
  )
    throw new Error('Empreinte du lot propriétaire différente');
  const bank = ultimeOwnerBankSchema.parse(raw);
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  if (decision.recordedAt < bank.createdAt || decision.recordedAt > today)
    throw new Error('Date de décision incohérente');
  const ids = new Set(existing.map((q) => q.id)),
    stems = new Set(existing.map((q) => `${q.bookId}:${normalizedStem(q.questionFr)}`));
  if (
    new Set(bank.books.map((b) => b.id)).size !== 2 ||
    new Set(bank.sources.map((s) => s.id)).size !== 22
  )
    throw new Error('Ouvrage ou source dupliqué');
  const expected = new Map<string, string>();
  for (const q of bank.questions) {
    if (ids.has(q.id) || stems.has(`${q.bookId}:${normalizedStem(q.questionFr)}`))
      throw new Error('Question propriétaire dupliquée');
    ids.add(q.id);
    stems.add(`${q.bookId}:${normalizedStem(q.questionFr)}`);
    expected.set(q.id, q.bookId);
    const book = base.books.find((b) => b.id === q.bookId),
      meta = bank.books.find((b) => b.id === q.bookId);
    if (
      !book ||
      book.level !== 'ultime' ||
      !meta ||
      book.titleAr !== meta.titleAr ||
      book.authorAr !== meta.authorAr ||
      !meta.coverage.includes(q.domain)
    )
      throw new Error('Ouvrage incohérent');
    if (
      q.ownerApproval.reviewedAt !== decision.recordedAt ||
      q.ownerApproval.reviewer !== bank.editorialOwnerApproval.reviewer ||
      q.ownerApproval.reviewedAt !== bank.editorialOwnerApproval.reviewedAt
    )
      throw new Error('Approbation individuelle incohérente');
    for (const r of q.references)
      if (
        r.workTitleAr !== book.titleAr ||
        r.authorAr !== book.authorAr ||
        r.sectionAr !== q.chapterAr ||
        !bank.sources.some(
          (s) =>
            s.url === r.url &&
            s.workTitleAr === r.workTitleAr &&
            s.authorAr === r.authorAr &&
            s.chapterAr === r.sectionAr &&
            s.domain === q.domain,
        )
      )
        throw new Error('Attribution ou référence incohérente');
  }
  for (const b of bank.books)
    if (
      bank.questions.filter((q) => q.bookId === b.id).length !==
        decision.approvalScope.books[b.id] ||
      b.newOwnerApprovedQuestions !== decision.approvalScope.books[b.id]
    )
      throw new Error('Périmètre quantitatif incohérent');
  const seen = new Set<string>();
  for (const r of decision.questions) {
    if (seen.has(r.questionId) || expected.get(r.questionId) !== r.bookId)
      throw new Error('Décision dupliquée ou hors périmètre');
    seen.add(r.questionId);
  }
  const eligible = bank.questions.filter(
    (q) =>
      bank.publicationAllowed &&
      decision.publicationAuthorizationByOwner &&
      decision.decision === 'owner-editorial-approved' &&
      decision.questions.some((r) => r.questionId === q.id && r.ownerDecision === 'approved'),
  );
  const questions = publishedQuestions({
    questions: eligible.map((q, i) => ({
      id: q.id,
      status: 'published',
      category: 'fiqh',
      order: i + 11,
      type: 'single',
      promptFr: q.questionFr,
      options: q.options.map((o) => ({ id: o.id, label: o.textFr })),
      correctOptionIds: [q.correctOptionId],
      explanationFr: q.explanationFr,
      publicationBasis: 'owner-editorial-approval',
      sourceVerification: 'not-attested',
      sources: q.references.map((r) => ({
        title: r.workTitleAr,
        url: r.url,
        reference: { ...r, locator: '' },
      })),
    })),
  });
  if (questions.length !== eligible.length) throw new Error('Adaptation propriétaire invalide');
  const byBook = new Map<string, QuizQuestion[]>();
  for (const b of bank.books)
    byBook.set(
      b.id,
      questions.filter((q) => eligible.some((item) => item.id === q.id && item.bookId === b.id)),
    );
  return {
    bank,
    decision,
    questions,
    byBook,
    policy: 'owner-editorial-approval' as const,
    sourceVerification: 'not-attested' as const,
  };
}
