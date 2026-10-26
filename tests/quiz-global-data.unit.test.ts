import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { eligibleForGlobalQuiz } from '../src/lib/quiz-global-quality';
import { library, bookQuestions } from '../src/lib/quiz-v12-data';
import { globalQuestions, globalQuestionCount } from '../src/lib/quiz-global-data';
it('projection serveur réelle : tous les ouvrages et niveaux, chaque question une seule fois', () => {
  const pool = globalQuestions();
  expect(pool).toEqual(
    library
      .filter((b) => b.available)
      .flatMap((b) => bookQuestions(b.level, b.id).filter(eligibleForGlobalQuiz)),
  );
  expect(pool).toHaveLength(469);
  expect(globalQuestionCount()).toBe(pool.length);
  expect(new Set(pool.map((q) => q.id)).size).toBe(pool.length);
  expect(pool.every((q) => q.status === 'published')).toBe(true);
  expect(new Set(library.filter((b) => b.available).map((b) => b.level)).size).toBe(5);
  expect(library.filter((b) => b.available)).toHaveLength(15);
});
