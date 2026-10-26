// Current approved public corpus for assertions against a randomized live game.
import raw from '../../src/data/quiz-v1.2/research.json' with { type: 'json' };
import { researchBankSchema } from '../../src/lib/quiz-v12';
import { editorialLots } from '../../src/lib/quiz-v13-lots';
import { inspectCandidateLots, candidateBatchSchema } from '../../src/lib/quiz-v13-editorial';
const base = researchBankSchema.parse(raw);
const approved = new Set(inspectCandidateLots(base, editorialLots).approved.map((q) => q.id));
export const liveBank = {
  books: base.books,
  questions: [
    ...base.questions,
    ...editorialLots.flatMap((lot) =>
      candidateBatchSchema
        .parse(lot.batch)
        .questions.filter((q) => approved.has(q.id))
        .map((q) => ({
          id: q.id,
          bookId: q.bookId,
          level: q.level,
          questionFr: q.questionFr,
          options: q.options,
          correctOptionId: q.correctOptionId,
          explanationFr: q.explanationFr,
          references: [{ quoteAr: q.source.quoteAr }],
        })),
    ),
  ],
};
