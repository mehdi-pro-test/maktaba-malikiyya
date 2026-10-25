import { createHash } from 'node:crypto';
import { z } from 'zod';
import { publishedQuestions, type QuizQuestion } from './quiz';

export const quizLevels = [
  { id: 'debutant', label: 'Débutant' },
  { id: 'intermediaire', label: 'Intermédiaire' },
  { id: 'avance', label: 'Avancé' },
  { id: 'ultime', label: 'Ultime' },
  { id: 'usul', label: 'Oussoul al-fiqh malikite' },
] as const;
const level = z.enum(['debutant', 'intermediaire', 'avance', 'ultime', 'usul']);
const text = z
  .string()
  .min(1)
  .refine((v) => v.trim().length > 0 && !/[<>]/.test(v), 'Texte brut requis');
const arabic = text.refine((v) => /[\u0600-\u06ff]/.test(v), 'Texte arabe requis');
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const status = z.enum(['draft', 'review', 'published']);
const https = z
  .string()
  .url()
  .refine((v) => {
    const u = new URL(v);
    return u.protocol === 'https:' && !u.username && !u.password;
  }, 'URL HTTPS sans identifiants requise');
const sha = z.string().regex(/^[a-f0-9]{64}$/);
const sourceSchema = z
  .object({
    id: slug,
    url: https,
    kind: z.enum([
      'primary-transcription',
      'primary-facsimile',
      'primary-embedded-commentary',
      'primary-gloss',
    ]),
    consultedAt: z.iso.date(),
    edition: text.nullable(),
    note: text,
    sha256: sha,
  })
  .strict();
const referenceSchema = z
  .object({
    sourceId: slug,
    workTitleAr: arabic,
    authorAr: arabic,
    sectionAr: arabic,
    locator: z.string(),
    quoteAr: arabic.max(1000),
    quoteLayer: z.enum(['author', 'matn', 'commentary', 'gloss', 'poem', 'quoted-poem']),
    edition: text.nullable(),
    printedPage: z.number().int().positive().nullable(),
    pdfPage: z.number().int().positive().nullable(),
    url: https,
    textCheck: z.enum(['matched-transcription', 'read-facsimile']),
  })
  .strict()
  .superRefine((r, ctx) => {
    if (r.printedPage && (!r.pdfPage || r.textCheck !== 'read-facsimile'))
      ctx.addIssue({ code: 'custom', message: 'Page imprimée sans contrôle du fac-similé' });
  });
const questionSchema = z
  .object({
    id: slug,
    bookId: slug,
    level,
    status,
    questionFr: text,
    options: z.array(z.object({ id: slug, textFr: text }).strict()).length(4),
    correctOptionId: slug,
    explanationFr: text,
    references: z.array(referenceSchema).min(1),
    scholarlyReview: z
      .object({
        status: z.enum(['pending', 'approved', 'rejected']),
        reviewer: text.nullable(),
        reviewedAt: z.iso.date().nullable(),
        notes: text,
      })
      .strict(),
  })
  .strict()
  .superRefine((q, ctx) => {
    const ids = q.options.map((o) => o.id);
    if (
      new Set(ids).size !== 4 ||
      new Set(q.options.map((o) => o.textFr.trim().toLocaleLowerCase('fr'))).size !== 4 ||
      !ids.includes(q.correctOptionId)
    )
      ctx.addIssue({ code: 'custom', message: 'Choix distincts et réponse existante requis' });
  });
const bookSchema = z
  .object({
    id: slug,
    level,
    titleAr: arabic,
    titleFr: text.optional(),
    authorAr: arabic,
    defaultSectionAr: arabic,
    status,
    reviewer: text.nullable(),
    reviewedAt: z.iso.date().nullable(),
  })
  .strict();
export const researchBankSchema = z
  .object({
    schemaVersion: z.literal('1.2-research-1'),
    createdAt: z.iso.date(),
    status,
    publicationAllowed: z.boolean(),
    notice: text,
    books: z.array(bookSchema).min(1),
    sources: z.array(sourceSchema).min(1),
    questions: z.array(questionSchema).min(1),
  })
  .strict()
  .superRefine((data, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
    for (const ids of [
      data.books.map((b) => b.id),
      data.sources.map((s) => s.id),
      data.questions.map((q) => q.id),
    ])
      if (new Set(ids).size !== ids.length) fail('Identifiant dupliqué');
    if (
      new Set(data.questions.map((q) => q.questionFr.trim().toLocaleLowerCase('fr'))).size !==
      data.questions.length
    )
      fail('Question dupliquée');
    const books = new Map(data.books.map((b) => [b.id, b]));
    const sources = new Map(data.sources.map((s) => [s.id, s]));
    for (const q of data.questions) {
      const b = books.get(q.bookId);
      if (!b || b.level !== q.level) fail('Ouvrage ou niveau incohérent');
      for (const r of q.references) {
        const s = sources.get(r.sourceId);
        if (!s || s.url !== r.url || s.edition !== r.edition)
          fail('Référence absente ou incohérente');
        if (b && (r.workTitleAr !== b.titleAr || r.authorAr !== b.authorAr))
          fail('Attribution incohérente');
      }
    }
    for (const b of data.books)
      if (data.questions.filter((q) => q.bookId === b.id).length !== 10)
        fail('Dix questions par ouvrage requises');
  });
export type ResearchBank = z.infer<typeof researchBankSchema>;
export type ResearchQuestion = ResearchBank['questions'][number];
export type ResearchReference = ResearchQuestion['references'][number];
export type ResearchBook = ResearchBank['books'][number];

/** Order-independent object keys; array order and all content remain significant. */
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
export function bankDigest(value: ResearchBank) {
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex');
}
export const reviewReportSchema = z
  .object({
    schemaVersion: z.literal('1.2-review-1'),
    reviews: z.array(
      z
        .object({
          bankSha256: sha,
          questionId: slug,
          decision: z.enum(['approved', 'changes-requested', 'rejected']),
          reviewerName: text,
          reviewedAt: z.iso.date(),
          notes: text,
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((report, ctx) => {
    const ids = report.reviews.map((r) => r.questionId);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: 'custom', message: 'Une seule décision par question et rapport' });
  });
export type ReviewReport = z.infer<typeof reviewReportSchema>;
export function validateReviewReport(bank: ResearchBank, value: unknown): ReviewReport {
  const report = reviewReportSchema.parse(value);
  const digest = bankDigest(bank);
  for (const r of report.reviews) {
    if (r.bankSha256 !== digest) throw new Error('Rapport périmé : empreinte de banque différente');
    if (!bank.questions.some((q) => q.id === r.questionId))
      throw new Error('Question inconnue dans la revue');
    if (r.reviewedAt < bank.createdAt || r.reviewedAt > new Date().toISOString().slice(0, 10))
      throw new Error('Date de revue incohérente');
  }
  return report;
}
const titles: Record<string, string> = {
  'moukhtassar-al-akhdari': 'Mukhtasar al-Akhdari',
  'matn-ibn-ashir': 'Matn Ibn Ashir',
  'al-achmawiyya': 'Al-Achmawiyya',
  'al-mouqaddima-al-izziyya': 'Al-Muqaddima al-Izziyya',
  'ashal-al-masalik': 'Ashal al-Masalik',
  'ar-risala-ibn-abi-zayd': 'La Risala d’Ibn Abi Zayd',
  'moukhtassar-khalil': 'Mukhtasar Khalil',
  'sharh-al-dardir': 'Le Grand Commentaire d’al-Dardir',
  'hashiyat-al-dasuqi': 'La Hashiya d’al-Dasuqi',
  'bidayat-al-mujtahid': 'Bidayat al-Mujtahid',
  'al-istidhkar': 'Al-Istidhkar',
  'issal-as-salik': 'Issal as-Salik',
  'al-waraqat-sharh-al-hattab': 'Al-Waraqat avec al-Hattab',
  'murtaqa-al-wusul': 'Murtaqa al-Wusul',
  'maraqi-as-suud': 'Maraqi as-Suud',
};
/** Public projection deliberately excludes draft prompts, answers, quotes and report details. */
export function publicLibrary(bank: ResearchBank, report: ReviewReport) {
  const checked = validateReviewReport(bank, report);
  return bank.books.map((b) => {
    const qs = bank.questions.filter((q) => q.bookId === b.id);
    const approved = qs.filter((q) =>
      checked.reviews.some((r) => r.questionId === q.id && r.decision === 'approved'),
    ).length;
    const available =
      bank.publicationAllowed &&
      b.status === 'published' &&
      qs.every((q) => q.status === 'published') &&
      approved === 10;
    return {
      id: b.id,
      level: b.level,
      titleAr: b.titleAr,
      authorAr: b.authorAr,
      titleFr: b.titleFr ?? titles[b.id] ?? b.id,
      available,
      questionsToReview: 10 - approved,
    };
  });
}
export type PublicBook = ReturnType<typeof publicLibrary>[number];
export function playableBook(
  bank: ResearchBank,
  report: ReviewReport,
  levelId: string,
  bookId: string,
): QuizQuestion[] {
  const b = publicLibrary(bank, report).find((b) => b.level === levelId && b.id === bookId);
  if (!b?.available) return [];
  return publishedQuestions({
    questions: bank.questions
      .filter((q) => q.bookId === b.id)
      .map((q, i) => ({
        id: q.id,
        status: 'published',
        category: 'fiqh',
        order: i + 1,
        type: 'single',
        promptFr: q.questionFr,
        options: q.options.map((o) => ({ id: o.id, label: o.textFr })),
        correctOptionIds: [q.correctOptionId],
        explanationFr: q.explanationFr,
        sources: q.references.map((r) => ({ title: r.workTitleAr, url: r.url, reference: r })),
      })),
  });
}
