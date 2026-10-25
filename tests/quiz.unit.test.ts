import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import source from '../src/data/quiz-v1.1.json';
import { isCorrect, publishedQuestions, quizScore } from '../src/lib/quiz';
import { QuizGame } from '../src/components/quiz-game';
import { shippingProgress } from '../src/lib/shipping-progress';
const all = publishedQuestions(source);
describe('Quiz éditorial approuvé', () => {
  it('charge exactement les deux questions valides, jamais les huit brouillons', () => {
    expect(source.questions).toHaveLength(10);
    expect(all.map((q) => q.id)).toEqual(['q01', 'q02']);
  });
  it('valide les quatre imams sans importance de l’ordre', () => {
    expect(isCorrect(all[0], ['ahmad', 'shafii', 'malik', 'abu-hanifa'])).toBe(true);
  });
  it.each([
    ['abu-hanifa', 'malik', 'shafii'],
    ['abu-hanifa', 'malik', 'shafii', 'bukhari'],
    ['abu-hanifa', 'malik', 'shafii', 'ahmad', 'muslim'],
    ['abu-hanifa', 'malik', 'shafii', 'shafii'],
  ])('refuse toute sélection partielle, fausse, surnuméraire ou dupliquée', (...ids) =>
    expect(isCorrect(all[0], ids)).toBe(false),
  );
  it.each(['n1', 'n3', 'n4'])(
    'ne compte pas %s comme nombre correct de catégories de tahara',
    (id) => expect(isCorrect(all[1], [id])).toBe(false),
  );
  it('la tahara a deux catégories et le feedback contient les deux termes approuvés', () => {
    expect(isCorrect(all[1], ['n2'])).toBe(true);
    expect(all[1].explanationFr).toContain('طهارة الحدث');
    expect(all[1].explanationFr).toContain('طهارة الخبث');
  });
  it('score 0,1,2 et ignore les slots manquants', () => {
    expect(quizScore(all, {})).toBe(0);
    expect(quizScore(all, { q02: ['n2'], q03: ['inventé'] })).toBe(1);
    expect(quizScore(all, { q01: all[0].correctOptionIds, q02: ['n2'] })).toBe(2);
  });
  it('rejette une publication incomplète ou dont la réponse ne correspond pas aux choix', () => {
    expect(
      publishedQuestions({
        questions: [
          { ...source.questions[0], explanationFr: '' },
          { ...source.questions[1], correctOptionIds: ['missing'] },
        ],
      }),
    ).toEqual([]);
  });
  it('un brouillon complet reste exclu tant qu’il n’est pas publié', () =>
    expect(
      publishedQuestions({ questions: [{ ...source.questions[0], status: 'draft' }] }),
    ).toEqual([]));
  it('affiche le quiz vide sans erreur', () => {
    const html = renderToStaticMarkup(createElement(QuizGame, { questions: [] }));
    expect(html).toContain('Aucune question n’est disponible');
    expect(html).not.toContain('Commencer le quiz');
  });
});
describe('Progression livraison', () => {
  it.each([
    [1000, 4000, 20],
    [4000, 1000, 80],
    [5000, 0, 100],
    [10000, 0, 100],
  ])('calcule %i centimes correctement', (subtotal, remaining, percent) =>
    expect(shippingProgress(subtotal, 'FR', 1)).toMatchObject({
      remaining,
      percent,
      showBar: true,
    }),
  );
  it.each([1000, 5000, 10000])('ne promet aucune gratuité Europe pour %i', (subtotal) =>
    expect(shippingProgress(subtotal, 'BE', 1)).toMatchObject({
      showBar: false,
      message: 'Livraison à 20 € pour ce pays, sans gratuité.',
    }),
  );
  it('ne propose pas de réduction sur panier vide', () =>
    expect(shippingProgress(0, 'FR', 0)).toMatchObject({ showBar: false }));
});
