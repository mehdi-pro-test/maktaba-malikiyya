// This module is imported exclusively by server pages and editorial scripts.
import 'server-only';
import rawBank from '@/data/quiz-v1.2/research.json';
import rawReviews from '@/data/quiz-v1.2/reviews.json';
import { researchBankSchema, validateReviewReport, publicLibrary, playableBook } from './quiz-v12';
const bank = researchBankSchema.parse(rawBank);
const reviews = validateReviewReport(bank, rawReviews);
export const library = publicLibrary(bank, reviews);
export function findQuizBook(level: string, id: string) {
  return library.find((b) => b.level === level && b.id === id);
}
export function bookQuestions(level: string, id: string) {
  return playableBook(bank, reviews, level, id);
}
