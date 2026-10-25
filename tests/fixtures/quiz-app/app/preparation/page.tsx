import original from '../../../../../docs/quiz-v1.2/recherche/banque-150-questions.json';
import { researchBankSchema, publicLibrary } from '../../../../../src/lib/quiz-v12';
import { QuizLibrary } from '../../../../../src/components/quiz-library';
export default function Page() {
  const bank = researchBankSchema.parse(original);
  const books = publicLibrary(bank, { schemaVersion: '1.2-review-1', reviews: [] });
  return (
    <section className="section-wrap quiz-library-page">
      <h1>Fixture : ouvrages en préparation</h1>
      <QuizLibrary books={books} />
    </section>
  );
}
