import { applyEditorialV15 } from '../../src/lib/quiz-editorial-v15';
// Current approved public corpus for assertions against a randomized live game.
import raw from '../../src/data/quiz-v1.2/research.json' with { type: 'json' };
import { researchBankSchema } from '../../src/lib/quiz-v12';
import { editorialLots } from '../../src/lib/quiz-v13-lots';
import { ultimeAdditions } from '../../src/lib/quiz-ultime-data';
import { inspectCandidateLots, candidateBatchSchema } from '../../src/lib/quiz-v13-editorial';
const base = researchBankSchema.parse(raw);
const approved = new Set(inspectCandidateLots(base, editorialLots).approved.map((q) => q.id));
const ultime = ultimeAdditions(base, [
  ...base.questions,
  ...editorialLots.flatMap((l) => candidateBatchSchema.parse(l.batch).questions),
]);
export const originalLiveBank = {
  books: base.books,
  questions: [
    ...base.questions,
    ...ultime.bank.questions.filter((q) => ultime.questions.some((p) => p.id === q.id)),
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
export const liveBank = {
  books: originalLiveBank.books,
  questions: originalLiveBank.questions.map((q) => {
    const current = applyEditorialV15({
      id: q.id,
      promptFr: q.questionFr,
      options: q.options.map((o) => ({ id: o.id, label: o.textFr })),
      correctOptionIds: [q.correctOptionId],
    });
    return {
      ...q,
      questionFr: current.promptFr,
      options: current.options.map((o) => ({ id: o.id, textFr: o.label })),
    };
  }),
};
