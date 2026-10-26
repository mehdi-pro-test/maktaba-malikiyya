import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import raw from '../src/data/quiz-v1.2/research.json';
import rawReviews from '../src/data/quiz-v1.2/reviews.json';
import { researchBankSchema, validateReviewReport, playableBook } from '../src/lib/quiz-v12';
import { editorialLots } from '../src/lib/quiz-v13-lots';
import { candidateBatchSchema, inspectCandidateLots } from '../src/lib/quiz-v13-editorial';
import { ultimeAdditions } from '../src/lib/quiz-ultime-data';
import { normalizedStem } from '../src/lib/quiz-ultime-editorial';
import { MAX_APPROVED_POOL } from '../src/lib/quiz-draw';
import { potentialEditorialCollisions } from '../src/lib/quiz-editorial-collisions';
const base = researchBankSchema.parse(raw),
  reviews = validateReviewReport(base, rawReviews);
const oldAdditions = inspectCandidateLots(base, editorialLots);
const old = [
  ...base.questions,
  ...editorialLots.flatMap((l) => candidateBatchSchema.parse(l.batch).questions),
];
const approved = ultimeAdditions(base, old);
const root = 'docs/quiz-v1.3-ultime-190/source';
const source = readFileSync(`${root}/01-BANQUE-190-QUESTIONS-ULTIME.json`);
const sourceHash = createHash('sha256').update(source).digest('hex');
const manifest = JSON.parse(readFileSync(`${root}/05-INVENTAIRE-ET-CONTROLES.json`, 'utf8'));
if (
  manifest.originalBankSha256 !== approved.decision.originalResearchBankSha256 ||
  manifest.approvedBankSha256 !== sourceHash
)
  throw new Error('Empreintes du manifeste différentes');
const exportsMatch = ['bidayat-al-mujtahid', 'al-istidhkar'].every(
  (id) =>
    JSON.stringify(
      JSON.parse(
        readFileSync(
          `${root}/02-BANQUE-${id}-${id === 'bidayat-al-mujtahid' ? 140 : 50}.json`,
          'utf8',
        ),
      ).questions,
    ) === JSON.stringify(approved.bank.questions.filter((q) => q.bookId === id)),
);
if (!exportsMatch) throw new Error('Export divergent');
const separateSources = JSON.parse(
  readFileSync(`${root}/03-REFERENCES-SOURCES-ARABES.json`, 'utf8'),
);
const withoutState = (v: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(v).filter(([k]) => k !== 'editorialValidation'));
if (
  JSON.stringify(separateSources.map(withoutState)) !==
  JSON.stringify(approved.bank.sources.map(withoutState))
)
  throw new Error('Notices de sources divergentes');
const oldTexts = [
  ...base.questions.map((q) => ({
    id: q.id,
    bookId: q.bookId,
    questionFr: q.questionFr,
    quoteAr: q.references[0].quoteAr,
  })),
  ...editorialLots.flatMap((l) =>
    candidateBatchSchema.parse(l.batch).questions.map((q) => ({ ...q, quoteAr: q.source.quoteAr })),
  ),
];
const newTexts = approved.bank.questions.map((q) => ({ ...q, quoteAr: q.references[0].quoteAr }));
const inventory = base.books.map((b) => ({
  bookId: b.id,
  previous:
    playableBook(base, reviews, b.level, b.id).length +
    (oldAdditions.approvedByBook.get(b.id)?.length ?? 0),
  newOwnerApproved: approved.byBook.get(b.id)?.length ?? 0,
  total:
    playableBook(base, reviews, b.level, b.id).length +
    (oldAdditions.approvedByBook.get(b.id)?.length ?? 0) +
    (approved.byBook.get(b.id)?.length ?? 0),
}));
console.log(
  JSON.stringify(
    {
      baseCommit: '0633b61cf14dfaac1bf40b5f540ee9abbcca9a52',
      sourceHash,
      approvedHashMatches: sourceHash === approved.decision.newOwnerApprovedBankSha256,
      originalResearchHashDeclared: approved.decision.originalResearchBankSha256,
      originalResearchPayloadAvailable: false,
      originalResearchHashCheck:
        'Comparé au manifeste, non recalculable : le payload de recherche avant approbation n’est pas fourni.',
      subExportsMatch: exportsMatch,
      sourceNoticesMatchExceptEditorialState: true,
      originalSourceState: 'pending',
      separateSourceState: 'owner-approved-corpus; source-collation-not-independently-attested',
      imported: 190,
      maxQuestionsPerPool: MAX_APPROVED_POOL,
      uniqueIds: new Set([...old, ...approved.bank.questions].map((q) => q.id)).size,
      uniqueNormalizedPrompts: new Set(
        [...old, ...approved.bank.questions].map((q) => normalizedStem(q.questionFr)),
      ).size,
      ownerApprovalCount: approved.decision.questions.filter((q) => q.ownerDecision === 'approved')
        .length,
      publicationBasis: approved.policy,
      sourceVerification: approved.sourceVerification,
      independentScholarlyReview: 'not-attested',
      inventory,
      total: inventory.reduce((s, b) => s + b.total, 0),
      potentialCollisions: potentialEditorialCollisions(oldTexts, newTexts),
      limits:
        'Rapprochements textuels non exhaustifs, pas de certificat d’absence de doublon doctrinal ni de collation arabe. Décision éditoriale déjà acquise ; aucune nouvelle validation des questions demandée.',
    },
    null,
    2,
  ),
);
