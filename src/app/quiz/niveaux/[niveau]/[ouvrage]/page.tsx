import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QuizGame } from '@/components/quiz-game';
import { findQuizBook, library } from '@/lib/quiz-v12-data';
import { startQuizAttempt } from '@/app/quiz/actions';
import { quizLevels } from '@/lib/quiz-v12';
export const dynamicParams = false;
export function generateStaticParams() {
  return library.map((b) => ({ niveau: b.level, ouvrage: b.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ niveau: string; ouvrage: string }>;
}) {
  const { niveau, ouvrage } = await params;
  return { title: `Quiz · ${findQuizBook(niveau, ouvrage)?.titleFr ?? 'Ouvrage introuvable'}` };
}
export default async function Page({
  params,
}: {
  params: Promise<{ niveau: string; ouvrage: string }>;
}) {
  const { niveau, ouvrage } = await params;
  const book = findQuizBook(niveau, ouvrage);
  const level = quizLevels.find((l) => l.id === niveau);
  if (!book || !level) notFound();
  const back = `/quiz/niveaux/${niveau}`;
  if (!book.available)
    return (
      <section className="section-wrap quiz-preparation">
        <Link className="text-link" href={back}>
          ← Parcours {level.label}
        </Link>
        <span className="eyebrow">{level.label}</span>
        <h1>{book.titleFr}</h1>
        <p className="quiz-book-arabic" lang="ar" dir="rtl">
          {book.titleAr}
        </p>
        <p lang="ar" dir="rtl">
          {book.authorAr}
        </p>
        <h2>Quiz en préparation</h2>
        <p>
          Les questions de cet ouvrage sont en cours de relecture. Revenez découvrir le quiz
          lorsqu’il sera prêt.
        </p>
        <Link className="button" href="/quiz/niveaux">
          Voir les quiz par niveau
        </Link>
      </section>
    );
  return (
    <section className="quiz-shell">
      <nav className="quiz-path-link" aria-label="Parcours de quiz">
        <Link href={back}>← Parcours {level.label}</Link>
      </nav>
      <QuizGame
        availableCount={book.approvedCount}
        loadAttempt={startQuizAttempt.bind(null, niveau, ouvrage)}
        context={{
          titleFr: book.titleFr,
          titleAr: book.titleAr,
          levelLabel: level.label,
          returnHref: '/quiz/niveaux',
          returnLabel: 'Retour aux niveaux',
        }}
      />
    </section>
  );
}
