import { beforeEach, it, expect, vi } from 'vitest';
import { syntheticPool } from './fixtures/quiz-pool';
const mocks = vi.hoisted(() => ({
  currentQuizData: vi.fn(),
  bookQuestions: vi.fn(),
  findQuizBook: vi.fn(),
  globalQuestions: vi.fn(),
  currentGlobalQuestions: vi.fn(),
}));
vi.mock('../src/lib/quiz-v12-data', () => mocks);
vi.mock('../src/lib/quiz-global-data', () => mocks);
vi.mock('../src/lib/admin/config', () => ({ quizDbEnabled: () => true }));
import { startQuizAttempt, startGlobalQuizAttempt } from '../src/app/quiz/actions';
beforeEach(() => vi.clearAllMocks());
it('banque DB par ouvrage supérieure à 200 : dix publiées sans envoyer la banque complète', async () => {
  mocks.currentQuizData.mockResolvedValue({
    library: [{ id: 'fixture', level: 'debutant', available: true }],
    pools: new Map([['fixture', syntheticPool(201)]]),
  });
  expect(await startQuizAttempt('debutant', 'fixture')).toHaveLength(10);
  expect(mocks.bookQuestions).not.toHaveBeenCalled();
  mocks.currentQuizData.mockResolvedValue({
    library: [{ id: 'fixture', level: 'debutant', available: false }],
    pools: new Map([['fixture', syntheticPool(9)]]),
  });
  expect(await startQuizAttempt('debutant', 'fixture')).toEqual([]);
});
it('global DB recalculé à chaque appel, aucune lecture des seules données canoniques', async () => {
  mocks.currentGlobalQuestions.mockResolvedValue(syntheticPool(1000));
  expect(await startGlobalQuizAttempt()).toHaveLength(10);
  mocks.currentGlobalQuestions.mockResolvedValue(syntheticPool(9));
  expect(await startGlobalQuizAttempt()).toEqual([]);
  expect(mocks.currentGlobalQuestions).toHaveBeenCalledTimes(2);
  expect(mocks.globalQuestions).not.toHaveBeenCalled();
});
