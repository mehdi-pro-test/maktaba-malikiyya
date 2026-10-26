import Link from 'next/link';
import { quizLevels, type PublicBook } from '@/lib/quiz-v12';
export function QuizLibrary({
  books,
  levelId,
}: {
  books: (PublicBook & { approvedCount?: number })[];
  levelId?: string;
}) {
  return (
    <div className="quiz-library">
      {quizLevels
        .filter((l) => !levelId || l.id === levelId)
        .map((level) => {
          const list = books.filter((b) => b.level === level.id);
          const available = list.filter((b) => b.available).length;
          return (
            <section key={level.id} className="quiz-level" aria-labelledby={`level-${level.id}`}>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    PARCOURS {quizLevels.findIndex((entry) => entry.id === level.id) + 1}
                  </span>
                  <h2 id={`level-${level.id}`}>
                    <Link href={`/quiz/niveaux/${level.id}`}>{level.label}</Link>
                  </h2>
                </div>
                <p>
                  {available} quiz disponible{available === 1 ? '' : 's'} · {list.length} ouvrages
                </p>
              </div>
              <div className="quiz-book-grid">
                {list.map((book) => (
                  <article key={book.id} className="quiz-book-card">
                    <span className="eyebrow">
                      {book.available ? 'DISPONIBLE' : 'EN PRÉPARATION'}
                    </span>
                    <h3>
                      <Link href={`/quiz/niveaux/${book.level}/${book.id}`}>{book.titleFr}</Link>
                    </h3>
                    <p lang="ar" dir="rtl" className="quiz-book-arabic">
                      {book.titleAr}
                    </p>
                    <p>
                      {book.available
                        ? `${book.approvedCount ?? 10} questions disponibles · 10 par partie`
                        : `Relecture en cours · ${book.questionsToReview} questions à valider`}
                    </p>
                    <Link className="text-link" href={`/quiz/niveaux/${book.level}/${book.id}`}>
                      {book.available ? 'Ouvrir le quiz' : 'Découvrir l’ouvrage'} →
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}
