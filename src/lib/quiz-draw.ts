import type { QuizQuestion } from './quiz';

export const ATTEMPT_SIZE = 10;
export const MAX_APPROVED_POOL = 100;
/** Fisher–Yates on a copy. RNG must return a value in [0, 1). */
export function drawQuestions<T extends { id: string }>(
  pool: readonly T[],
  random: () => number = Math.random,
): T[] {
  if (pool.length > MAX_APPROVED_POOL)
    throw new Error('Banque supérieure à 100 : règle éditoriale requise');
  if (new Set(pool.map((q) => q.id)).size !== pool.length) throw new Error('Identifiant dupliqué');
  if (pool.length < ATTEMPT_SIZE) return [];
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Aléa invalide');
    const j = Math.floor(value * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, ATTEMPT_SIZE);
}
/** Recheck the server-owned public projection before sampling. Never accept a client pool. */
export function drawPublishedQuestions(pool: readonly QuizQuestion[], random?: () => number) {
  if (pool.some((q) => q.status !== 'published')) throw new Error('Question non publiée');
  return drawQuestions(pool, random);
}
