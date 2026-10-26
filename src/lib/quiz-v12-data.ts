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
