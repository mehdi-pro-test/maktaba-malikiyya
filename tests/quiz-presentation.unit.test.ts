import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { library, bookQuestions } from '../src/lib/quiz-v12-data';
import { questionPresentation } from '../src/lib/quiz-presentation';
import { syntheticPool } from './fixtures/quiz-pool';
it('fournit le vrai ouvrage et son niveau pour chacune des 610 questions, sans modifier réponses et sources', () => {
  for (const b of library)
    for (const q of bookQuestions(b.level, b.id)) {
      expect(q.origin).toMatchObject({ bookId: b.id, titleFr: b.titleFr, titleAr: b.titleAr });
      expect(q.origin?.levelLabel).toBeTruthy();
      expect(q.correctOptionIds).toHaveLength(1);
      expect(q.sources?.length).toBeGreaterThan(0);
    }
});
it('sépare les anciennes instructions de validation sans modifier les données ni les citations', () => {
  let count = 0;
  for (const b of library)
    for (const q of bookQuestions(b.level, b.id)) {
      const before = structuredClone(q),
        display = questionPresentation(q);
      if (display.editorialNotice) {
        count++;
        expect(display.editorialNotice).toContain(
          'ne constitue pas une certification indépendante',
        );
        expect(display.explanation).not.toMatch(/avant publication|reste soumise|doit être relue/);
        expect(q.explanationFr.startsWith(display.explanation)).toBe(true);
        for (const source of q.sources ?? [])
          if (q.explanationFr.includes(source.reference!.quoteAr))
            expect(display.explanation).toContain(source.reference!.quoteAr);
      } else expect(display.explanation).toBe(q.explanationFr);
      expect(q).toEqual(before);
    }
  expect(count).toBe(270);
});
it('ne réécrit aucune réserve ou explication inconnue et préserve les fixtures sans provenance', () => {
  const q = syntheticPool(1)[0];
  q.explanationFr = 'Une explication à vérifier avant publication.';
  expect(questionPresentation(q)).toEqual({
    explanation: q.explanationFr,
    editorialNotice: undefined,
  });
  expect(q.origin).toBeUndefined();
});
