import { z } from 'zod';
const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  arabic: z.string().optional(),
});
const questionSchema = z
  .object({
    id: z.string().min(1),
    status: z.literal('published'),
    category: z.string().min(1),
    origin: z
      .object({
        bookId: z.string().min(1),
        titleFr: z.string().min(1),
        titleAr: z.string().min(1),
        levelLabel: z.string().min(1),
      })
      .optional(),
    publicationBasis: z.literal('owner-editorial-approval').optional(),
    sourceVerification: z.enum(['not-attested', 'owner-collated']).optional(),
    globalEligible: z.boolean().optional(),
    sources: z
      .array(
        z.object({
          title: z.string().min(1),
          reference: z
            .object({
              workTitleAr: z.string(),
              authorAr: z.string(),
              sectionAr: z.string(),
              quoteAr: z.string(),
              quoteLayer: z.string(),
              textCheck: z
                .enum([
                  'requires-editorial-collation',
                  'matched-transcription',
                  'read-facsimile',
                  'owner-collated',
                ])
                .optional(),
              locator: z.string(),
              edition: z.string().nullable(),
              printedPage: z.number().nullable(),
              pdfPage: z.number().nullable(),
            })
            .optional(),
          url: z
            .string()
            .url()
            .refine((value) => value.startsWith('https://')),
        }),
      )
      .optional(),
    order: z.number().int(),
    type: z.enum(['single', 'multiple']),
    promptFr: z.string().min(1),
    instructionFr: z.string().optional(),
    options: z.array(optionSchema).min(2),
    correctOptionIds: z.array(z.string()).min(1),
    requiredSelectionCount: z.number().int().positive().optional(),
    explanationFr: z.string().min(1),
  })
  .superRefine((q, ctx) => {
    const ids = q.options.map((o) => o.id);
    if (
      new Set(ids).size !== ids.length ||
      new Set(q.correctOptionIds).size !== q.correctOptionIds.length ||
      q.correctOptionIds.some((id) => !ids.includes(id))
    )
      ctx.addIssue({ code: 'custom', message: 'Choix incohérents' });
    if (q.type === 'single' && q.correctOptionIds.length !== 1)
      ctx.addIssue({ code: 'custom', message: 'Une seule réponse correcte attendue' });
    if (
      q.type === 'multiple' &&
      (!q.requiredSelectionCount ||
        q.requiredSelectionCount !== q.correctOptionIds.length ||
        q.requiredSelectionCount > q.options.length)
    )
      ctx.addIssue({ code: 'custom', message: 'Nombre de sélections invalide' });
  });
export type QuizQuestion = z.infer<typeof questionSchema>;
export function publishedQuestions(data: unknown): QuizQuestion[] {
  const raw = z.object({ questions: z.array(z.unknown()) }).safeParse(data);
  if (!raw.success) return [];
  const parsed = raw.data.questions
    .map((q) => questionSchema.safeParse(q))
    .filter((p) => p.success)
    .map((p) => p.data);
  const ids = new Set<string>();
  return parsed
    .sort((a, b) => a.order - b.order)
    .filter((q) => {
      if (ids.has(q.id)) return false;
      ids.add(q.id);
      return true;
    });
}
export function isCorrect(q: QuizQuestion, selected: string[]) {
  return (
    selected.length === q.correctOptionIds.length &&
    new Set(selected).size === selected.length &&
    selected.every((id) => q.correctOptionIds.includes(id))
  );
}
export function quizScore(all: QuizQuestion[], answers: Record<string, string[]>) {
  return all.reduce((sum, q) => sum + (isCorrect(q, answers[q.id] ?? []) ? 1 : 0), 0);
}
