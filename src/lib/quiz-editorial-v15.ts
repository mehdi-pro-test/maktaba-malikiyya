import { createHash } from 'node:crypto';
import { z } from 'zod';
import raw from '../data/quiz-v1.5/editorial.json' with { type: 'json' };
import type { QuizQuestion } from './quiz';
const entrySchema = z
  .object({
    questionId: z.string(),
    originalSha256: z.string().regex(/^[a-f0-9]{64}$/),
    wrongOptions: z
      .array(z.object({ id: z.string(), label: z.string().min(1).max(700) }).strict())
      .length(3),
    promptFr: z.string().min(1).max(1500).optional(),
  })
  .strict();
const data = z
  .object({
    schemaVersion: z.literal(1),
    authorization: z
      .object({
        basis: z.literal('owner-delegated-editorial-validation'),
        date: z.string(),
        scope: z.literal('distractors-and-question-clarity'),
        reviewer: z.literal('assistant'),
        independentSourceCollation: z.literal(false),
      })
      .strict(),
    reviewedQuestionIds: z.array(z.string()),
    entries: z.array(entrySchema),
  })
  .strict()
  .parse(raw);
if (
  new Set(data.entries.map((e) => e.questionId)).size !== data.entries.length ||
  new Set(data.reviewedQuestionIds).size !== 610
)
  throw new Error('Inventaire éditorial incohérent');
const revisions = new Map(data.entries.map((e) => [e.questionId, e]));
export function editorialQuestionFingerprint(
  q: Pick<QuizQuestion, 'id' | 'promptFr' | 'options' | 'correctOptionIds'>,
) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        id: q.id,
        promptFr: q.promptFr,
        options: q.options,
        correctOptionIds: q.correctOptionIds,
      }),
    )
    .digest('hex');
}
/** Original archives and citations stay byte-identical. Explicit DB revisions take precedence later. */
export function applyEditorialV15<
  T extends Pick<QuizQuestion, 'id' | 'promptFr' | 'options' | 'correctOptionIds'>,
>(q: T): T {
  const revision = revisions.get(q.id);
  if (!revision) return q;
  if (editorialQuestionFingerprint(q) !== revision.originalSha256)
    throw new Error('Révision éditoriale périmée : ' + q.id);
  const wrong = new Map(revision.wrongOptions.map((o) => [o.id, o.label]));
  if (
    wrong.size !== 3 ||
    [...wrong].some(
      ([id]) => q.correctOptionIds.includes(id) || !q.options.some((o) => o.id === id),
    )
  )
    throw new Error('Révision de réponse correcte interdite : ' + q.id);
  const options = q.options.map((o) => (wrong.has(o.id) ? { ...o, label: wrong.get(o.id)! } : o));
  if (new Set(options.map((o) => o.label.trim().toLocaleLowerCase('fr'))).size !== 4)
    throw new Error('Choix équivoques ou répétés : ' + q.id);
  return { ...q, promptFr: revision.promptFr ?? q.promptFr, options };
}
export const editorialV15Inventory = {
  reviewed: data.reviewedQuestionIds.length,
  rewritten: data.entries.length,
  promptsClarified: data.entries.filter((e) => e.promptFr).length,
};
