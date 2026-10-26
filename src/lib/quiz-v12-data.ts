import type { QuizQuestion } from './quiz';
// This module is imported exclusively by server pages and editorial scripts.
import 'server-only';
import rawBank from '@/data/quiz-v1.2/research.json';
import rawReviews from '@/data/quiz-v1.2/reviews.json';
import { researchBankSchema, validateReviewReport, publicLibrary, playableBook } from './quiz-v12';
import { inspectCandidateLots } from './quiz-v13-editorial';
import { editorialLots } from './quiz-v13-lots';
import { ultimeAdditions } from './quiz-ultime-data';
import { candidateBatchSchema } from './quiz-v13-editorial';
import { quizLevels } from './quiz-v12';
import { MAX_APPROVED_POOL } from './quiz-draw';
const bank = researchBankSchema.parse(rawBank);
const reviews = validateReviewReport(bank, rawReviews);
const additions = inspectCandidateLots(bank, editorialLots).approvedByBook;
const ultime = ultimeAdditions(bank, [
  ...bank.questions,
  ...editorialLots.flatMap((l) => candidateBatchSchema.parse(l.batch).questions),
]);
const pools = new Map(
  bank.books.map((b) => {
    const baseline = playableBook(bank, reviews, b.level, b.id);
    // Existing book authorization remains mandatory for additive lots.
    const pool = baseline.length
      ? [...baseline, ...(additions.get(b.id) ?? []), ...(ultime.byBook.get(b.id) ?? [])]
      : [];
    if (pool.length > MAX_APPROVED_POOL)
      throw new Error(`Banque supérieure à ${MAX_APPROVED_POOL} : ${b.id}`);
    return [b.id, pool] as const;
  }),
);
export const library = publicLibrary(bank, reviews).map((b) => ({
  ...b,
  approvedCount: pools.get(b.id)?.length ?? 0,
  available: b.available && (pools.get(b.id)?.length ?? 0) >= 10,
}));
export function findQuizBook(level: string, id: string) {
  return library.find((b) => b.level === level && b.id === id);
}
export function bookQuestions(level: string, id: string) {
  const book = findQuizBook(level, id);
  if (!book?.available) return [];
  return (pools.get(id) ?? []).map((q) => ({
    ...q,
    origin: {
      bookId: book.id,
      titleFr: book.titleFr,
      titleAr: book.titleAr,
      levelLabel: quizLevels.find((l) => l.id === book.level)!.label,
    },
  }));
}

/** Dynamic DB layer is opt-in after the additive migration. Canonical exports stay immutable. */
export async function currentQuizData() {
  const { quizDbEnabled } = await import('./admin/config');
  const pools = new Map<string, QuizQuestion[]>(
    library.map((b) => [b.id, bookQuestions(b.level, b.id)]),
  );
  if (!quizDbEnabled()) return { library, pools };
  const [{ readQuizOverlay }, { mergeQuizOverlay }] = await Promise.all([
    import('./quiz-overlay-data'),
    import('./quiz-overlay'),
  ]);
  const records = await readQuizOverlay();
  for (const b of library)
    pools.set(
      b.id,
      mergeQuizOverlay(pools.get(b.id) ?? [], records, {
        ...b,
        levelLabel: quizLevels.find((l) => l.id === b.level)!.label,
      }),
    );
  const current = library.map((b) => ({
    ...b,
    approvedCount: pools.get(b.id)!.length,
    available: b.available && pools.get(b.id)!.length >= 10,
    questionsToReview: Math.max(0, 10 - pools.get(b.id)!.length),
  }));
  return { library: current, pools };
}
