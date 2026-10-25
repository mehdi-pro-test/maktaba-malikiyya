import { QuizGame } from '@/components/quiz-game';
import { questions } from '@/lib/quiz-data';
export const metadata = {
  title: 'Le quiz de la Maktaba',
  description:
    'Deux questions pour apprendre et tester vos connaissances, sans compte ni chronomètre.',
};
export default function Page() {
  return (
    <section className="quiz-shell">
      <QuizGame questions={questions} />
    </section>
  );
}
