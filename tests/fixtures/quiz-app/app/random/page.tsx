'use client';
import { useState } from 'react';
import { QuizGame } from '../../../../../src/components/quiz-game';
import { syntheticAttempt } from '../actions';
export default function Page() {
  const [renders, setRenders] = useState(0);
  return (
    <section className="quiz-shell">
      <p>Fixture synthétique : banque de 100. Aucun contenu religieux.</p>
      <button onClick={() => setRenders(renders + 1)}>Rerender de test : {renders}</button>
      <QuizGame
        availableCount={100}
        loadAttempt={syntheticAttempt}
        context={{
          titleFr: 'Banque synthétique',
          titleAr: 'كتاب تجريبي',
          levelLabel: 'Test',
          returnHref: '/random',
          returnLabel: 'Retour au test',
        }}
      />
    </section>
  );
}
