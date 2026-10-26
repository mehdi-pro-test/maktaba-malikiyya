import { readFileSync, readdirSync } from 'node:fs';
import raw from '../src/data/quiz-v1.2/research.json';
import reviews from '../src/data/quiz-v1.2/reviews.json';
import {
  researchBankSchema,
  validateReviewReport,
  bankDigest,
  publicLibrary,
} from '../src/lib/quiz-v12';
import { inspectCandidateLots } from '../src/lib/quiz-v13-editorial';
const bank = researchBankSchema.parse(raw);
const report = validateReviewReport(bank, reviews);
const directory = 'docs/quiz-v1.3-pack/recherche-v1.3';
const lots = readdirSync(directory)
  .filter((f) => f.endsWith('-candidats.json'))
  .map((f) => ({ batch: JSON.parse(readFileSync(`${directory}/${f}`, 'utf8')) }));
const audit = inspectCandidateLots(bank, lots);
console.log(
  JSON.stringify(
    {
      baselineDigest: bankDigest(bank),
      approvalsV12: report.reviews.length,
      books: publicLibrary(bank, report).map((b) => ({
        bookId: b.id,
        published: b.available ? 10 : 0,
        draft: audit.inventory
          .filter((i) => i.bookId === b.id)
          .reduce((sum, i) => sum + i.written, 0),
      })),
      candidateBatches: audit.inventory,
      publishedV13: audit.approved.length,
      attributionDifferencesToReview: audit.attributionDifferences,
      note: 'Contrôle structurel seulement. Doublons sémantiques et exactitude religieuse à relire. Aucun fichier modifié.',
    },
    null,
    2,
  ),
);
