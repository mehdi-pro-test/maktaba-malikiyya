import research from '@/data/quiz-v1.2/research.json';
// Routing metadata only. No database call and no attempt/question sent to the client.
const books = research.books.map(({ id, level }) => ({ id, level }));
export function validQuizCataloguePath(pathname: string) {
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  if (segments[0] !== 'quiz' || segments[1] !== 'niveaux') return false;
  if (segments.length === 2) return true;
  if (segments.length === 3) return books.some((b) => b.level === segments[2]);
  return (
    segments.length === 4 && books.some((b) => b.level === segments[2] && b.id === segments[3])
  );
}
