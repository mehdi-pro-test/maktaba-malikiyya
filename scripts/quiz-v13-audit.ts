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
import { editorialLots } from '../src/lib/quiz-v13-lots';
import { pending180Lots } from '../src/lib/quiz-v13-pending-180';
const bank = researchBankSchema.parse(raw);
const report = validateReviewReport(bank, reviews);
const directory = 'docs/quiz-v1.3-pack/recherche-v1.3';
const lots = readdirSync(directory)
  .filter((f) => f.endsWith('-candidats.json'))
  .map((f) => ({ batch: JSON.parse(readFileSync(`${directory}/${f}`, 'utf8')) }));
const delivered = inspectCandidateLots(bank, [...lots, ...pending180Lots]);
const audit = inspectCandidateLots(bank, editorialLots);
console.log(
  JSON.stringify(
    {
      baselineDigest: bankDigest(bank),
      approvalsV12: report.reviews.length,
      books: publicLibrary(bank, report).map((b) => ({
        bookId: b.id,
        published: b.available ? 10 + (audit.approvedByBook.get(b.id)?.length ?? 0) : 0,
        draft:
          delivered.inventory
            .filter((i) => i.bookId === b.id)
            .reduce((sum, i) => sum + i.written, 0) - (audit.approvedByBook.get(b.id)?.length ?? 0),
      })),
      candidateBatches: audit.inventory,
      publishedV13: audit.approved.length,
      attributionDifferencesRecorded: audit.attributionDifferences,
      note: `Contrôle structurel ; ${audit.approved.length} approbations supplémentaires fondées sur les confirmations déclarées du propriétaire. Aucun contrôle religieux indépendant par Codex. Provenance conservée ; aucun fichier modifié.`,
    },
    null,
    2,
  ),
);
