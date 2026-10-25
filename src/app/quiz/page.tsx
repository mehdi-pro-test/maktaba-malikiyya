import Link from 'next/link';
import { QuizGame } from '@/components/quiz-game';
import { questions } from '@/lib/quiz-data';
export const metadata = {
  title: 'Le quiz de la Maktaba',
  description:
    'Dix questions pour apprendre et tester vos connaissances, sans compte ni chronomètre.',
};
export default function Page() {
  return (
    <section className="quiz-shell">
      <nav className="quiz-path-link" aria-label="Parcours de quiz">
        <Link className="text-link" href="/quiz/niveaux">
          Explorer les quiz par niveau →
        </Link>
      </nav>
      <QuizGame questions={questions} />
    </section>
  );
}
