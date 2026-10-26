// Purely synthetic pool: no religious question is authored for these tests.
import type { QuizQuestion } from '../../src/lib/quiz';
export function syntheticPool(size = 100): QuizQuestion[] {
  return Array.from({ length: size }, (_, i) => ({
    id: `synthetic-${i + 1}`,
    status: 'published',
    category: 'fiqh',
    order: i + 1,
    type: 'single',
    promptFr: `Question synthétique ${i + 1} : sélectionner le premier choix.`,
    options: [
      { id: 'a', label: 'Premier choix' },
      { id: 'b', label: 'Deuxième choix' },
    ],
    correctOptionIds: ['a'],
    explanationFr: 'Explication synthétique de test.',
    sources: [
      {
        title: 'كتاب تجريبي',
        url: 'https://example.test/ar',
        reference: {
          workTitleAr: 'كتاب تجريبي',
          authorAr: 'مؤلف تجريبي',
          sectionAr: 'باب تجريبي',
          quoteAr: 'نص تجريبي فقط',
          quoteLayer: 'matn',
          locator: '',
          edition: null,
          printedPage: null,
          pdfPage: null,
        },
      },
    ],
  }));
}
