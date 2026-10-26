import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { library, bookQuestions } from '../src/lib/quiz-v12-data';
import { globalQuestions } from '../src/lib/quiz-global-data';
import { globalQualityReview, eligibleForGlobalQuiz } from '../src/lib/quiz-global-quality';
import { drawGlobalQuestions } from '../src/lib/quiz-draw';
it('limite les exclusions au mode global : 610 publiées conservées, 141 motifs explicites, 469 éligibles', () => {
  const all = library.flatMap((b) => bookQuestions(b.level, b.id));
  const global = globalQuestions();
  expect(all).toHaveLength(610);
  expect(globalQualityReview.excluded).toHaveLength(141);
  expect(global).toHaveLength(469);
  for (const decision of globalQualityReview.excluded) {
    expect(all.filter((q) => q.id === decision.questionId)).toHaveLength(1);
    expect(global.some((q) => q.id === decision.questionId)).toBe(false);
  }
  for (const b of library) expect(global.some((q) => q.origin?.bookId === b.id)).toBe(true);
  for (let i = 0; i < 100; i++)
    expect(drawGlobalQuestions(global).every(eligibleForGlobalQuiz)).toBe(true);
});
it('exclut les cas rencontrés, préserve les versions par ouvrage et ne transforme pas une exclusion en dépublication', () => {
  for (const id of [
    'al-istidhkar-v13-ultime-039',
    'hashiyat-al-dasuqi-v13-ia-017',
    'moukhtassar-khalil-v13-ia-013',
    'al-istidhkar-v13-ultime-028',
  ]) {
    const q = library.flatMap((b) => bookQuestions(b.level, b.id)).find((q) => q.id === id)!;
    expect(q.status).toBe('published');
    expect(eligibleForGlobalQuiz(q)).toBe(false);
  }
});
