import type { QuizQuestion } from './quiz';
/** Consume only the existing public projection; unavailable books are never loaded. */
export function assembleGlobalPool(
  books: readonly { level: string; id: string; available: boolean }[],
  questionsFor: (level: string, id: string) => readonly QuizQuestion[],
): QuizQuestion[] {
  const pool = books
    .filter((b) => b.available)
    .flatMap((b) => questionsFor(b.level, b.id).filter((q) => q.status === 'published'));
  if (new Set(pool.map((q) => q.id)).size !== pool.length)
    throw new Error('Identifiant dupliqué dans la banque globale');
  return pool;
}
