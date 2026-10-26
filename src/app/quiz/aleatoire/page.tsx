import Link from 'next/link';
import { QuizGame } from '@/components/quiz-game';
import { startGlobalQuizAttempt } from '@/app/quiz/actions';
import { currentGlobalQuestionCount } from '@/lib/quiz-global-data';
export const metadata = {
  title: 'Quiz aléatoire — Tous les ouvrages',
  description:
    'Dix questions tirées au hasard parmi tous les ouvrages et niveaux de la bibliothèque.',
};
export const dynamic = 'force-dynamic';
export default async function Page() {
  const count = await currentGlobalQuestionCount();
  return (
    <section className="quiz-shell quiz-global">
      <nav className="quiz-path-link" aria-label="Parcours de quiz">
        <Link href="/quiz/niveaux">← Retour aux niveaux</Link>
      </nav>
      <p className="quiz-global-selection-note">
        Des questions autonomes sélectionnées dans tous les niveaux et ouvrages.
      </p>
      <QuizGame
        availableCount={count}
        loadAttempt={startGlobalQuizAttempt}
        context={{
          mode: 'global',
          titleFr: 'Quiz aléatoire — Tous les ouvrages',
          titleAr: 'اختبار عشوائي',
          levelLabel: 'Tous les niveaux',
          returnHref: '/quiz/niveaux',
          returnLabel: 'Retour aux niveaux',
        }}
      />
    </section>
  );
}
