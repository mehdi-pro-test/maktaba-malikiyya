import { z } from 'zod';
import raw from '@/data/quiz-global-quality.json' with { type: 'json' };
import type { QuizQuestion } from './quiz';
export const globalQualityReview = z
  .object({
    scope: z.literal('global-mode-only'),
    assessedAt: z.iso.date(),
    notice: z.string().min(1),
    excluded: z.array(
      z
        .object({
          questionId: z.string().min(1),
          reason: z.enum([
            'missing-context',
            'ambiguous-options',
            'off-topic-options',
            'quote-typography',
          ]),
        })
        .strict(),
    ),
  })
  .strict()
  .parse(raw);
const excludedIds = new Set(globalQualityReview.excluded.map((r) => r.questionId));
if (excludedIds.size !== globalQualityReview.excluded.length)
  throw new Error('Décision pédagogique dupliquée');
/** Publication approval is necessary, but unsuitable standalone questions stay out of this mode. */
export function eligibleForGlobalQuiz(question: QuizQuestion) {
  return question.status === 'published' && !excludedIds.has(question.id);
}
