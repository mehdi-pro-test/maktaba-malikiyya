// Textual signals only. Never decides doctrinal equivalence or edits supplied content.
export type EditorialText = { id: string; bookId: string; questionFr: string; quoteAr: string };
const stop = new Set(
  'le la les un une des du de d l et ou en au aux dans pour par sur qui que quel quelle quels quelles est sont il elle ils elles selon signifie dit donne appelle texte chapitre'.split(
    ' ',
  ),
);
export function comparisonWords(value: string) {
  return (
    value
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLocaleLowerCase('fr')
      .match(/[\p{L}\p{N}]+/gu) ?? []
  ).filter((w) => !stop.has(w));
}
export function potentialEditorialCollisions(
  existing: EditorialText[],
  additions: EditorialText[],
) {
  const pairs: {
    questionId: string;
    comparedId: string;
    score: number;
    sharedQuote: boolean;
    questionFr: string;
    comparedQuestionFr: string;
    status: 'editorial-review-required';
  }[] = [];
  for (let i = 0; i < additions.length; i++) {
    const q = additions[i];
    const a = new Set(comparisonWords(q.questionFr));
    for (const other of [...existing, ...additions.slice(0, i)]) {
      if (q.bookId !== other.bookId) continue;
      const b = new Set(comparisonWords(other.questionFr));
      const score = (2 * [...a].filter((w) => b.has(w)).length) / (a.size + b.size || 1);
      const quote = (s: string) =>
        s
          .normalize('NFKD')
          .replace(/\p{M}|ـ/gu, '')
          .replace(/\s+/g, ' ')
          .trim();
      const sharedQuote = quote(q.quoteAr) === quote(other.quoteAr);
      if (score >= 0.45 || sharedQuote)
        pairs.push({
          questionId: q.id,
          comparedId: other.id,
          score: Math.round(score * 1000) / 1000,
          sharedQuote,
          questionFr: q.questionFr,
          comparedQuestionFr: other.questionFr,
          status: 'editorial-review-required',
        });
    }
  }
  return pairs;
}
