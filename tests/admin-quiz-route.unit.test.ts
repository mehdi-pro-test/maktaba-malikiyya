import { it, expect } from 'vitest';
import { validQuizCataloguePath } from '../src/lib/quiz-route';
import research from '../src/data/quiz-v1.2/research.json';
it('conserve les quinze routes et cinq niveaux, refuse les slugs inconnus ou déplacés', () => {
  expect(validQuizCataloguePath('/quiz/niveaux')).toBe(true);
  for (const book of research.books) {
    expect(validQuizCataloguePath('/quiz/niveaux/' + book.level)).toBe(true);
    expect(validQuizCataloguePath('/quiz/niveaux/' + book.level + '/' + book.id)).toBe(true);
  }
  for (const path of [
    '/quiz/niveaux/inconnu',
    '/quiz/niveaux/debutant/inconnu',
    '/quiz/niveaux/ultime/moukhtassar-al-akhdari',
    '/quiz/niveaux/debutant/moukhtassar-al-akhdari/suite',
    '/quiz/classique',
  ])
    expect(validQuizCataloguePath(path)).toBe(false);
});
