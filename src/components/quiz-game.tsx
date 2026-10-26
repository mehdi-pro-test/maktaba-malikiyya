'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, RotateCcw, Sparkles, Check, X } from 'lucide-react';
import type { QuizQuestion as Question } from '@/lib/quiz';
export type QuizContext = {
  mode?: 'global';
  titleFr: string;
  titleAr: string;
  levelLabel: string;
  returnHref: string;
  returnLabel: string;
};
const returnLink = (context?: QuizContext) => ({
  href: context?.returnHref ?? '/livres',
  label: context?.returnLabel ?? 'Retour aux livres',
});
import { visibleCategories } from '@/data/categories';
import { questionPresentation } from '@/lib/quiz-presentation';
import { isCorrect, quizScore } from '@/lib/quiz';
function QuestionSources({ question }: { question: Question }) {
  if (question.sources?.some((s) => s.reference))
    return (
      <div className="quiz-primary-sources" aria-label="Références arabes de la correction">
        {question.sources.map((source, index) => {
          const r = source.reference;
          return (
            <div className="quiz-primary-reference" key={`${source.url}-${index}`}>
              {r?.textCheck === 'requires-editorial-collation' && (
                <p className="muted">
                  Validation éditoriale du propriétaire. Collation de la citation et vérification
                  des attributions non attestées.
                </p>
              )}
              {r && (
                <>
                  <p lang="ar" dir="rtl">
                    <strong>{r.workTitleAr}</strong> — {r.authorAr}
                  </p>
                  <p lang="ar" dir="rtl">
                    {r.sectionAr}
                  </p>
                  <blockquote lang="ar" dir="rtl">
                    {r.quoteAr}
                  </blockquote>
                  {r.edition && <p>Édition : {r.edition}</p>}
                  {r.printedPage && <p>Page imprimée : {r.printedPage}</p>}
                  {r.pdfPage && <p>Page du PDF : {r.pdfPage}</p>}
                  {r.locator && <p>{r.locator}</p>}
                </>
              )}
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                Consulter le passage arabe
              </a>
            </div>
          );
        })}
      </div>
    );
  return question.sources?.length ? (
    <p className="muted">
      Sources :{' '}
      {question.sources.map((source, index) => (
        <span key={source.url}>
          {index > 0 && ' · '}
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.title}
          </a>
        </span>
      ))}
    </p>
  ) : null;
}
function QuestionExplanation({ question }: { question: Question }) {
  const presentation = questionPresentation(question);
  return (
    <>
      <p>
        <ArabicText text={presentation.explanation} />
      </p>
      {presentation.editorialNotice && (
        <p className="quiz-editorial-notice">{presentation.editorialNotice}</p>
      )}
    </>
  );
}
function QuestionOrigin({ question }: { question: Question }) {
  return question.origin ? (
    <p className="quiz-question-origin">
      <strong>{question.origin.titleFr}</strong> · {question.origin.levelLabel}
      <span lang="ar" dir="rtl">
        {question.origin.titleAr}
      </span>
    </p>
  ) : null;
}
function ArabicText({ text }: { text: string }) {
  return (
    <>
      {text.split(/([\u0600-\u06ff][\u0600-\u06ff\s]*)/g).map((part, i) =>
        /[\u0600-\u06ff]/.test(part) ? (
          <span key={i} lang="ar" dir="rtl">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
export function QuizIntro({
  count,
  start,
  context,
  pending = false,
}: {
  count: number;
  start: () => void;
  pending?: boolean;
  context?: QuizContext;
}) {
  return (
    <div className="quiz-intro">
      <div className="quiz-emblem" aria-hidden="true">
        <Sparkles size={37} />
      </div>
      <span className="eyebrow">LE QUIZ DE LA MAKTABA</span>
      <h1>
        {context ? (
          <>
            {context.titleFr}
            <br />
            <em lang="ar" dir="rtl">
              {context.titleAr}
            </em>
          </>
        ) : (
          <>
            Un peu de jeu.
            <br />
            <em>Beaucoup à apprendre.</em>
          </>
        )}
      </h1>
      {context && (
        <p>
          {context.mode === 'global'
            ? 'Tous les niveaux et ouvrages · 10 questions tirées de toute la bibliothèque'
            : `${context.levelLabel} · Un quiz par ouvrage`}
        </p>
      )}
      <p>
        Explorez vos connaissances en sciences islamiques.
        <br />
        Un moment pour réfléchir, une occasion de progresser.
      </p>
      <div className="quiz-intro-facts">
        <span>
          <BookOpen size={17} />
          10 questions par partie ({count} questions dans la banque)
        </span>
        <span>Sans chrono. À votre rythme.</span>
      </div>
      <button className="button" onClick={start} disabled={pending}>
        {pending ? 'Chargement…' : 'Commencer le quiz'} <ArrowRight size={18} />
      </button>
      <p className="muted">Sans compte et sans enregistrement de votre score.</p>
    </div>
  );
}
function QuizQuestion({
  question,
  selected,
  validated,
  toggle,
}: {
  question: Question;
  selected: string[];
  validated: boolean;
  toggle: (id: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label={
        question.type === 'multiple'
          ? `Choix multiples : sélectionner ${question.requiredSelectionCount} réponses`
          : 'Choisir une réponse'
      }
      className={`quiz-choices ${question.type === 'single' && question.options.every((option) => /^\d+$/.test(option.label)) ? 'quiz-number-choices' : ''}`}
    >
      {question.options.map((option, index) => {
        const picked = selected.includes(option.id);
        const correct = question.correctOptionIds.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={picked}
            disabled={validated}
            className={`quiz-choice ${picked ? 'selected' : ''} ${validated && correct ? 'correct' : ''} ${validated && picked && !correct ? 'incorrect' : ''}`}
            onClick={() => toggle(option.id)}
          >
            <span className="quiz-choice-index" aria-hidden="true">
              {question.type === 'single' ? '0' + (index + 1) : String.fromCharCode(65 + index)}
            </span>
            <span className="quiz-choice-label">
              {option.label}
              {option.arabic && (
                <span lang="ar" dir="rtl">
                  {option.arabic}
                </span>
              )}
            </span>
            <span className="quiz-choice-indicator" aria-hidden="true">
              {validated ? (
                correct ? (
                  <Check size={19} />
                ) : picked ? (
                  <X size={19} />
                ) : null
              ) : picked ? (
                <Check size={18} />
              ) : null}
            </span>
            {validated && (
              <span className="quiz-choice-state">
                {correct ? 'Bonne réponse' : picked ? 'Votre réponse, incorrecte' : ''}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
function QuizResults({
  all,
  answers,
  replay,
  context,
  pending,
}: {
  all: Question[];
  answers: Record<string, string[]>;
  replay: () => void;
  pending?: boolean;
  context?: QuizContext;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const score = quizScore(all, answers);
  return (
    <div className="quiz-results">
      <span className="eyebrow">LE SAVOIR SE CULTIVE</span>
      <h1 ref={ref} tabIndex={-1}>
        Chaque question est un pas de plus.
      </h1>
      <div
        className="quiz-final-score"
        aria-live="polite"
        aria-label={`Score final : ${score} sur ${all.length}`}
      >
        {score}
        <span>/{all.length}</span>
      </div>
      <p>
        {score === all.length
          ? 'Une belle maîtrise de ces notions. Continuez à explorer !'
          : 'Le plus important : repartir avec quelque chose de nouveau.'}
      </p>
      <div className="quiz-recap">
        {all.map((q, index) => (
          <article key={q.id}>
            <span className="eyebrow">
              QUESTION {index + 1} ·{' '}
              {isCorrect(q, answers[q.id] ?? []) ? 'BONNE RÉPONSE' : 'À REVOIR'}
            </span>
            <h2>{q.promptFr}</h2>
            <QuestionOrigin question={q} />
            <QuestionExplanation question={q} />
            <QuestionSources question={q} />
          </article>
        ))}
      </div>
      <div className="quiz-result-actions">
        <button className="button" onClick={replay} disabled={pending}>
          <RotateCcw size={17} />
          {pending ? 'Chargement…' : 'Rejouer'}
        </button>
        <Link href={returnLink(context).href} className="text-link">
          {returnLink(context).label} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
export function QuizGame({
  questions: initialQuestions = [],
  context,
  availableCount,
  loadAttempt,
}: {
  questions?: Question[];
  context?: QuizContext;
  availableCount?: number;
  loadAttempt?: () => Promise<Question[]>;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const loading = useRef(false);
  const count = availableCount ?? initialQuestions.length;
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [finished, setFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (started && !finished) {
      heading.current?.focus({ preventScroll: true });
      // Keep the book/level visible when advancing, while the heading owns keyboard focus.
      const origin = heading.current?.closest('.quiz-game')?.querySelector('.quiz-question-origin');
      (origin ?? heading.current)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [started, index, finished]);
  if (count < 10)
    return (
      <div className="quiz-intro">
        <span className="eyebrow">LE QUIZ DE LA MAKTABA</span>
        <h1>Le quiz se prépare.</h1>
        <p>Aucune question n’est disponible pour le moment.</p>
        <Link className="button" href={returnLink(context).href}>
          {returnLink(context).label}
        </Link>
      </div>
    );
  const replay = () => {
    if (loading.current) return;
    loading.current = true;
    setError('');
    startTransition(async () => {
      try {
        const next = loadAttempt ? await loadAttempt() : [...initialQuestions];
        if (next.length !== 10 || new Set(next.map((q) => q.id)).size !== 10) {
          setError('Ce quiz est en préparation. Revenez aux niveaux ou réessayez plus tard.');
          return;
        }
        setQuestions(next);
        setIndex(0);
        setSelected([]);
        setAnswers({});
        setFinished(false);
        setStarted(true);
      } catch {
        setError('Le quiz n’a pas pu démarrer. Veuillez réessayer.');
      } finally {
        loading.current = false;
      }
    });
  };
  if (!started || finished)
    return (
      <>
        {error && <p role="alert">{error}</p>}
        {finished ? (
          <QuizResults
            all={questions}
            answers={answers}
            replay={replay}
            context={context}
            pending={pending}
          />
        ) : (
          <QuizIntro count={count} start={replay} context={context} pending={pending} />
        )}
      </>
    );
  const q = questions[index];
  const validated = Boolean(answers[q.id]);
  const correct = isCorrect(q, selected);
  const required = q.type === 'multiple' ? q.requiredSelectionCount! : 1;
  const score = quizScore(questions, answers);
  const toggle = (id: string) => {
    if (validated) return;
    setSelected((prev) =>
      q.type === 'single' ? [id] : prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  return (
    <div className="quiz-game">
      <div className="quiz-topline">
        <span className="eyebrow">LE QUIZ DE LA MAKTABA</span>
        <Link href={returnLink(context).href} className="quiz-exit">
          Quitter <X size={14} />
        </Link>
      </div>
      {context && (
        <p className="quiz-book-context">
          {context.levelLabel} · {context.titleFr}{' '}
          <span lang="ar" dir="rtl">
            {context.titleAr}
          </span>
        </p>
      )}
      <div className="quiz-progress-label">
        <span>
          Question {index + 1} sur {questions.length}
        </span>
        <span aria-live="polite">
          Score : {score}/{questions.length}
        </span>
      </div>
      <div
        className="quiz-track"
        role="progressbar"
        aria-label="Progression du quiz"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={index + (validated ? 1 : 0)}
      >
        <span style={{ width: `${((index + (validated ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>
      <QuestionOrigin question={q} />
      <div className="quiz-question-heading">
        <span className="eyebrow">
          {visibleCategories()
            .find((c) => c.slug === q.category)
            ?.nameFr.toUpperCase() ?? 'CONNAISSANCES'}{' '}
          · LE SAVOIR EN QUESTIONS
        </span>
        <h1 ref={heading} tabIndex={-1}>
          {q.promptFr}
        </h1>
        <p id="quiz-instruction">
          {q.instructionFr ?? 'Sélectionne une seule réponse.'}{' '}
          {q.type === 'multiple' && (
            <span>
              {selected.length}/{required} sélectionnées
            </span>
          )}
        </p>
      </div>
      <QuizQuestion question={q} selected={selected} validated={validated} toggle={toggle} />
      {validated && (
        <div className={`quiz-feedback ${correct ? 'success' : 'review'}`} role="status">
          <strong>{correct ? 'Bonne réponse !' : 'Pas tout à fait — voici la correction.'}</strong>
          <QuestionExplanation question={q} />
          <QuestionSources question={q} />
        </div>
      )}
      <div className="quiz-bottom">
        <span className="muted">
          {validated
            ? 'Un peu plus de savoir, à chaque question.'
            : q.type === 'multiple'
              ? `Choisissez exactement ${required} réponses avant de valider.`
              : 'Prenez le temps de réfléchir.'}
        </span>
        {validated ? (
          <button
            className="button"
            onClick={() => {
              if (index + 1 === questions.length) setFinished(true);
              else {
                setIndex(index + 1);
                setSelected([]);
              }
            }}
          >
            {index + 1 === questions.length ? 'Voir mon résultat' : 'Question suivante'}
            <ArrowRight size={17} />
          </button>
        ) : (
          <button
            className="button"
            disabled={selected.length !== required}
            onClick={() => {
              if (!validated && selected.length === required)
                setAnswers((prev) => ({ ...prev, [q.id]: [...selected] }));
            }}
          >
            Valider ma réponse <Check size={17} />
          </button>
        )}
      </div>
    </div>
  );
}
