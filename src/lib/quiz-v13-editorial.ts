// Editorial parser/import contract. Not imported by any client component.
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { publishedQuestions, type QuizQuestion } from './quiz';
import type { ResearchBank } from './quiz-v12';
const text = z
  .string()
  .min(1)
  .refine((s) => s.trim().length > 0 && !/[<>]/.test(s));
const arabic = text.refine((s) => /[\u0600-\u06ff]/.test(s));
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const sha = z.string().regex(/^[a-f0-9]{64}$/);
const https = z
  .string()
  .url()
  .refine((s) => {
    const u = new URL(s);
    return u.protocol === 'https:' && !u.username && !u.password;
  });
export const candidateBatchSchema = z
  .object({
    schemaVersion: z.literal('1.3-research-candidates-1'),
    createdAt: z.iso.date(),
    bookId: id,
    status: z.literal('not-for-publication'),
    editorialReviewRequired: z.literal(true),
    notice: text,
    questions: z
      .array(
        z
          .object({
            id,
            bookId: id,
            level: z.enum(['debutant', 'intermediaire', 'avance', 'ultime', 'usul']),
            editorialStatus: z.literal('research-draft'),
            source: z
              .object({
                workTitleAr: arabic,
                authorAr: arabic,
                chapterAr: arabic,
                quoteAr: arabic.max(1000),
                url: https,
                verification: z.literal('consulted-online-transcription'),
                edition: z.null(),
                printedPage: z.null(),
              })
              .strict(),
            questionFr: text,
            options: z.array(z.object({ id, textFr: text }).strict()).length(4),
            correctOptionId: id,
            explanationFr: text,
            newComparedToV12: z.literal('manually-screened-not-approved'),
          })
          .strict()
          .superRefine((q, ctx) => {
            if (
              new Set(q.options.map((o) => o.id)).size !== 4 ||
              new Set(q.options.map((o) => normalizePrompt(o.textFr))).size !== 4 ||
              !q.options.some((o) => o.id === q.correctOptionId)
            )
              ctx.addIssue({
                code: 'custom',
                message: 'Choix distincts et réponse existante requis',
              });
          }),
      )
      .min(1)
      .max(100),
  })
  .strict()
  .superRefine((b, ctx) => {
    if (
      b.questions.some((q) => q.bookId !== b.bookId) ||
      new Set(b.questions.map((q) => q.id)).size !== b.questions.length
    )
      ctx.addIssue({ code: 'custom', message: 'Ouvrage incohérent ou identifiant dupliqué' });
  });
export type CandidateBatch = z.infer<typeof candidateBatchSchema>;
export function normalizePrompt(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('fr')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
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
export function candidateDigest(batch: CandidateBatch) {
  return createHash('sha256')
    .update(JSON.stringify(canonical(batch)))
    .digest('hex');
}
export const candidateReviewSchema = z
  .object({
    schemaVersion: z.literal('1.3-review-1'),
    batchSha256: sha,
    publicationAllowed: z.boolean(),
    reviews: z.array(
      z
        .object({
          questionId: id,
          decision: z.enum(['approved', 'changes-requested', 'rejected']),
          reviewerName: text,
          reviewedAt: z.iso.date(),
          citationVerified: z.boolean(),
          attributionVerified: z.boolean(),
          notes: text,
        })
        .strict(),
    ),
  })
  .strict();
export type CandidateLot = { batch: unknown; report?: unknown };
/** Additive lots: no change to V1.2 or reuse of its approvals. Missing report => no publication. */
export function inspectCandidateLots(base: ResearchBank, lots: CandidateLot[]) {
  const ids = new Set(base.questions.map((q) => q.id));
  const prompts = new Set(
    base.questions.map((q) => `${q.bookId}:${normalizePrompt(q.questionFr)}`),
  );
  const approved: QuizQuestion[] = [];
  const approvedByBook = new Map<string, QuizQuestion[]>();
  const attributionDifferences: string[] = [];
  const inventory: { bookId: string; written: number; approved: number; digest: string }[] = [];
  for (const lot of lots) {
    const batch = candidateBatchSchema.parse(lot.batch);
    const book = base.books.find((b) => b.id === batch.bookId);
    if (!book) throw new Error('Ouvrage inconnu');
    for (const q of batch.questions) {
      const key = `${q.bookId}:${normalizePrompt(q.questionFr)}`;
      if (ids.has(q.id) || prompts.has(key)) throw new Error('Question dupliquée');
      if (q.level !== book.level) throw new Error('Niveau incohérent');
      if (q.source.workTitleAr !== book.titleAr || q.source.authorAr !== book.authorAr)
        attributionDifferences.push(q.id);
      ids.add(q.id);
      prompts.add(key);
    }
    const digest = candidateDigest(batch);
    const report = lot.report === undefined ? undefined : candidateReviewSchema.parse(lot.report);
    if (report) {
      if (report.batchSha256 !== digest) throw new Error('Rapport V1.3 périmé');
      const reviewedIds = new Set<string>();
      const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      for (const r of report.reviews) {
        if (reviewedIds.has(r.questionId) || !batch.questions.some((q) => q.id === r.questionId))
          throw new Error('Revue dupliquée ou inconnue');
        if (r.reviewedAt < batch.createdAt || r.reviewedAt > today)
          throw new Error('Date de revue incohérente');
        if (r.decision === 'approved' && (!r.citationVerified || !r.attributionVerified))
          throw new Error('Citation ou attribution non vérifiée');
        reviewedIds.add(r.questionId);
      }
    }
    const eligible = batch.questions.filter(
      (q) =>
        report?.publicationAllowed &&
        report.reviews.some(
          (r) =>
            r.questionId === q.id &&
            r.decision === 'approved' &&
            r.citationVerified &&
            r.attributionVerified,
        ),
    );
    const adapted = publishedQuestions({
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
        sources: [
          {
            title: q.source.workTitleAr,
            url: q.source.url,
            reference: {
              workTitleAr: q.source.workTitleAr,
              authorAr: q.source.authorAr,
              sectionAr: q.source.chapterAr,
              quoteAr: q.source.quoteAr,
              quoteLayer: 'matn',
              locator: '',
              edition: q.source.edition,
              printedPage: q.source.printedPage,
              pdfPage: null,
            },
          },
        ],
      })),
    });
    if (adapted.length !== eligible.length) throw new Error('Adaptation invalide');
    approved.push(...adapted);
    approvedByBook.set(batch.bookId, [...(approvedByBook.get(batch.bookId) ?? []), ...adapted]);
    inventory.push({
      bookId: batch.bookId,
      written: batch.questions.length,
      approved: adapted.length,
      digest,
    });
  }
  return { approved, approvedByBook, inventory, attributionDifferences };
}
