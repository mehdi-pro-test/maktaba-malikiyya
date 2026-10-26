import { beforeEach, expect, it, vi } from 'vitest';
import { syntheticPool } from './fixtures/quiz-pool';
const data = vi.hoisted(() => ({ findQuizBook: vi.fn(), bookQuestions: vi.fn() }));
vi.mock('../src/lib/quiz-v12-data', () => data);
vi.mock('../src/lib/quiz-global-data', () => ({ globalQuestions: vi.fn() }));
import { startQuizAttempt } from '../src/app/quiz/actions';
beforeEach(() => {
  vi.clearAllMocks();
  data.findQuizBook.mockReturnValue({ available: true });
  data.bookQuestions.mockReturnValue(syntheticPool());
});
it('ne transmet que dix questions du pool serveur', async () => {
  const attempt = await startQuizAttempt('debutant', 'synthetic');
  expect(attempt).toHaveLength(10);
  expect(new Set(attempt.map((q) => q.id)).size).toBe(10);
  expect(data.bookQuestions).toHaveBeenCalledWith('debutant', 'synthetic');
});
it('refuse les entrées malformées et ne charge aucun livre indisponible', async () => {
  await expect(startQuizAttempt('../debutant', 'synthetic')).rejects.toThrow();
  expect(data.findQuizBook).not.toHaveBeenCalled();
  data.findQuizBook.mockReturnValue(undefined);
  expect(await startQuizAttempt('ultime', 'unknown')).toEqual([]);
  data.findQuizBook.mockReturnValue({ available: false });
  expect(await startQuizAttempt('debutant', 'draft')).toEqual([]);
  expect(data.bookQuestions).not.toHaveBeenCalled();
});
it('ne complète pas un pool inférieur à dix et refuse un pool excessif', async () => {
  data.bookQuestions.mockReturnValue(syntheticPool(9));
  expect(await startQuizAttempt('debutant', 'synthetic')).toEqual([]);
  data.bookQuestions.mockReturnValue(syntheticPool(201));
  await expect(startQuizAttempt('debutant', 'synthetic')).rejects.toThrow(/200/);
});
