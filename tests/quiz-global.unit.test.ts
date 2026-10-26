import { beforeEach, expect, it, vi } from 'vitest';
import { syntheticPool } from './fixtures/quiz-pool';
import { sampleTen, drawGlobalQuestions, drawQuestions } from '../src/lib/quiz-draw';
import { assembleGlobalPool } from '../src/lib/quiz-global-pool';
const data = vi.hoisted(() => ({ globalQuestions: vi.fn() }));
vi.mock('../src/lib/quiz-global-data', () => data);
vi.mock('server-only', () => ({}));
import { startGlobalQuizAttempt } from '../src/app/quiz/actions';
beforeEach(() => vi.clearAllMocks());
for (const size of [9, 10, 200, 201, 610, 1000])
  it(`tire sans doublon parmi ${size}, sans mutation`, () => {
    const pool = syntheticPool(size),
      original = structuredClone(pool);
    for (const rng of [() => 0, () => 0.999999999, () => 0.42]) {
      const draw = drawGlobalQuestions(pool, rng);
      expect(draw).toHaveLength(size < 10 ? 0 : 10);
      expect(new Set(draw.map((q) => q.id)).size).toBe(draw.length);
      expect(draw.every((q) => pool.includes(q))).toBe(true);
    }
    expect(pool).toEqual(original);
  });
it('conserve le plafond par ouvrage et refuse IDs dupliqués, brouillons et RNG invalides', () => {
  expect(() => drawQuestions(syntheticPool(201))).toThrow(/200/);
  const pool = syntheticPool(10);
  expect(() => sampleTen([...pool, pool[0]])).toThrow(/dupliqué/);
  expect(() =>
    drawGlobalQuestions([
      { ...pool[0], status: 'draft' } as unknown as (typeof pool)[0],
      ...pool.slice(1),
    ]),
  ).toThrow(/publiée/);
  for (const v of [-1, 1, NaN, Infinity]) expect(() => sampleTen(pool, () => v)).toThrow(/Aléa/);
});
it('agrège les seules questions publiées des livres disponibles et inclut les ajouts futurs', () => {
  const pool = syntheticPool(12);
  const books = [
    { level: 'a', id: 'a', available: true },
    { level: 'b', id: 'b', available: false },
  ];
  const read = vi.fn(() => [
    pool[0],
    { ...pool[1], status: 'draft' } as unknown as (typeof pool)[0],
  ]);
  expect(assembleGlobalPool(books, read)).toEqual([pool[0]]);
  expect(read).toHaveBeenCalledExactlyOnceWith('a', 'a');
  read.mockReturnValue([pool[0], pool[2]]);
  expect(assembleGlobalPool(books, read)).toEqual([pool[0], pool[2]]);
  expect(() => assembleGlobalPool([...books, books[0]], read)).toThrow(/dupliqué/);
});
it('renvoie dix questions du serveur à chaque appel et ne fait confiance à aucun pool client', async () => {
  data.globalQuestions.mockReturnValue(syntheticPool(610));
  const first = await startGlobalQuizAttempt();
  expect(first).toHaveLength(10);
  expect(new Set(first.map((q) => q.id)).size).toBe(10);
  data.globalQuestions.mockReturnValue(syntheticPool(9));
  expect(await startGlobalQuizAttempt()).toEqual([]);
  expect(data.globalQuestions).toHaveBeenCalledTimes(2);
});
it('distribution uniforme par question : 10 000 simulations reproductibles, livres de tailles différentes', () => {
  // Fixed seed avoids flaky assertions. Pool split 10/30, no quota per book.
  let state = 42;
  const rng = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32;
  const pool = syntheticPool(40),
    first = Array(40).fill(0),
    included = Array(40).fill(0);
  for (let n = 0; n < 10000; n++) {
    const draw = sampleTen(pool, rng);
    first[pool.indexOf(draw[0])]++;
    for (const q of draw) included[pool.indexOf(q)]++;
  }
  expect(first.every((n) => n > 175 && n < 325)).toBe(true);
  expect(included.every((n) => n > 2250 && n < 2750)).toBe(true);
  expect(included.slice(10).reduce((a, b) => a + b, 0) / 100000).toBeCloseTo(0.75, 1);
});
