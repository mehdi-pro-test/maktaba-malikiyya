import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  researchBankSchema,
  bankDigest,
  validateReviewReport,
  publicLibrary,
} from '../src/lib/quiz-v12';
const bank = researchBankSchema.parse(
  JSON.parse(
    await readFile(new URL('../src/data/quiz-v1.2/research.json', import.meta.url), 'utf8'),
  ),
);
const path = process.argv[2];
if (!path) {
  console.log(`SHA256 canonique de la banque : ${bankDigest(bank)}`);
  console.log('Validation : npx tsx scripts/quiz-review.ts rapport.json [--import]');
} else {
  const report = validateReviewReport(bank, JSON.parse(await readFile(resolve(path), 'utf8')));
  if (process.argv[3] && process.argv[3] !== '--import') throw new Error('Option inconnue');
  if (process.argv[3] === '--import')
    await writeFile(
      new URL('../src/data/quiz-v1.2/reviews.json', import.meta.url),
      JSON.stringify(report, null, 2) + '\n',
    );
  console.log(
    `${report.reviews.length} décisions cohérentes avec cette banque. Ne certifie pas l’identité ni la compétence du relecteur.`,
  );
  console.log(
    `${publicLibrary(bank, report).filter((b) => b.available).length} lots activables ; aucune donnée religieuse ni aucun statut modifié par cet import.`,
  );
}
