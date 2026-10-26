import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import raw from '../src/data/quiz-v1.2/research.json';
import { researchBankSchema } from '../src/lib/quiz-v12';
import { editorialLots } from '../src/lib/quiz-v13-lots';
import { pending180Lots, pending180Files } from '../src/lib/quiz-v13-pending-180';
import {
  candidateBatchSchema,
  candidateDigest,
  inspectCandidateLots,
} from '../src/lib/quiz-v13-editorial';
import { validateOwnerApproval } from '../src/lib/quiz-owner-approval';
import { potentialEditorialCollisions } from '../src/lib/quiz-editorial-collisions';
const base = researchBankSchema.parse(raw);
const directory = 'src/data/quiz-v1.3-pending-180';
const files = pending180Lots.map((lot, i) => ({
  name: pending180Files[i],
  sha256: createHash('sha256')
    .update(readFileSync(`${directory}/${pending180Files[i]}`))
    .digest('hex'),
  batch: lot.batch,
}));
const approval = validateOwnerApproval(
  JSON.parse(readFileSync(`${directory}/owner-approval.json`, 'utf8')),
  files,
);
const active = inspectCandidateLots(base, editorialLots);
const previousLots = editorialLots.filter(
  (l) => candidateBatchSchema.parse(l.batch).questions[0].level === 'debutant',
);
const previous = inspectCandidateLots(base, previousLots);
const combined = active;
const publishedIds = new Set(active.approved.map((q) => q.id));
const existing = [
  ...base.questions.map((q) => ({
    id: q.id,
    bookId: q.bookId,
    questionFr: q.questionFr,
    quoteAr: q.references[0].quoteAr,
  })),
  ...previousLots.flatMap((l) =>
    candidateBatchSchema.parse(l.batch).questions.map((q) => ({ ...q, quoteAr: q.source.quoteAr })),
  ),
];
const added = pending180Lots.flatMap((l) =>
  candidateBatchSchema.parse(l.batch).questions.map((q) => ({ ...q, quoteAr: q.source.quoteAr })),
);
const normalize = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('fr')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
const exactGlobalPrompts = added.flatMap((q, i) =>
  [...existing, ...added.slice(0, i)]
    .filter((p) => normalize(q.questionFr) === normalize(p.questionFr))
    .map((p) => ({ questionId: q.id, comparedId: p.id })),
);
console.log(
  JSON.stringify(
    {
      baseCommit: 'bc8df4071c87db6037afd86136b0c698406f6223',
      imported: 180,
      editorialApprovals: approval.questions.length,
      newPublished: combined.approved.length - previous.approved.length,
      publicTotal: base.questions.length + active.approved.length,
      files: files.map((f) => ({
        name: f.name,
        sha256: f.sha256,
        canonicalSha256: candidateDigest(candidateBatchSchema.parse(f.batch)),
      })),
      inventory: base.books.map((b) => ({
        bookId: b.id,
        level: b.level,
        published: 10 + (active.approvedByBook.get(b.id)?.length ?? 0),
        imported: added.filter((q) => q.bookId === b.id).length,
        missingCitationVerification: added.filter(
          (q) => q.bookId === b.id && !publishedIds.has(q.id),
        ).length,
        missingAttributionVerification: added.filter(
          (q) => q.bookId === b.id && !publishedIds.has(q.id),
        ).length,
      })),
      exactGlobalPrompts,
      potentialCollisions: potentialEditorialCollisions(existing, added),
      newAttributionDifferences: combined.attributionDifferences.filter((id) =>
        added.some((q) => q.id === id),
      ),
      limits:
        'Les 180 vérifications de citation, attribution, distracteurs et déduplication sont enregistrées sur la confirmation déclarée du propriétaire « verif ok / mets en prod ». Aucun contrôle religieux indépendant par Codex. Les 13 signalements et les sources d’origine restent conservés, sans correction de contenu.',
    },
    null,
    2,
  ),
);
