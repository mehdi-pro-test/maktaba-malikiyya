import { QuizGame } from '../../../../src/components/quiz-game';
import { playableBook } from '../../../../src/lib/quiz-v12';
import { fixtureBank, fixtureReport } from '../../quiz-v12';
export default function Page() {
  const bank = fixtureBank();
  return (
    <section className="quiz-shell">
      <p>Fixture synthétique réservée aux tests. Aucun contenu religieux validé.</p>
      <QuizGame
        questions={playableBook(bank, fixtureReport(bank), bank.books[0].level, bank.books[0].id)}
        context={{
          titleFr: 'Ouvrage fictif de test',
          titleAr: 'كتاب تجريبي',
          levelLabel: 'Parcours de test',
          returnHref: '/quiz/niveaux',
          returnLabel: 'Retour aux niveaux',
        }}
      />
    </section>
  );
}
