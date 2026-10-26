import Link from 'next/link';
import { QuizLibrary } from '@/components/quiz-library';
import { library } from '@/lib/quiz-v12-data';
export const metadata = {
  title: 'Quiz par niveau et par ouvrage',
  description:
    'Cinq parcours de fiqh malikite : découvrez les ouvrages et les quiz disponibles après relecture.',
};
export default function Page() {
  return (
    <section className="section-wrap quiz-library-page">
      <span className="eyebrow">APPRENDRE À SON RYTHME</span>
      <h1>Les quiz par niveau.</h1>
      <p>
        Choisissez un parcours, puis un ouvrage. Chaque quiz disponible propose dix questions, leur
        correction et les références arabes.
      </p>
      <p>Les quiz en préparation attendent la relecture de leurs questions.</p>
      <article className="quiz-global-card" aria-labelledby="global-quiz-title">
        <span className="eyebrow">TOUTE LA BIBLIOTHÈQUE</span>
        <h2 id="global-quiz-title">Mode aléatoire — Tous les ouvrages</h2>
        <p>
          Dix questions au hasard parmi tous les niveaux et ouvrages. À chaque partie, un nouveau
          tirage.
        </p>
        <Link className="button" href="/quiz/aleatoire">
          Lancer le mode aléatoire →
        </Link>
      </article>
      <QuizLibrary books={library} />
    </section>
  );
}
