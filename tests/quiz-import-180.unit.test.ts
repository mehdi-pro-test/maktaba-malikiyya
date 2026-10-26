import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import raw from '../src/data/quiz-v1.2/research.json';
import { researchBankSchema } from '../src/lib/quiz-v12';
import {
  candidateBatchSchema,
  candidateDigest,
  inspectCandidateLots,
} from '../src/lib/quiz-v13-editorial';
import { editorialLots } from '../src/lib/quiz-v13-lots';
import { pending180Lots, pending180Files } from '../src/lib/quiz-v13-pending-180';
import { validateOwnerApproval } from '../src/lib/quiz-owner-approval';
import { potentialEditorialCollisions } from '../src/lib/quiz-editorial-collisions';
import hashes from '../docs/quiz-v1.3-import-180/IMPORT-SHA256.json';
const base = researchBankSchema.parse(raw);
const directory = 'src/data/quiz-v1.3-pending-180';
const files = pending180Lots.map((lot, i) => ({
  name: pending180Files[i],
  sha256: createHash('sha256')
    .update(readFileSync(`${directory}/${pending180Files[i]}`))
    .digest('hex'),
  batch: lot.batch,
}));
const owner = JSON.parse(readFileSync(`${directory}/owner-approval.json`, 'utf8'));
describe('Import des 180 QCM sans publication', () => {
  it('préserve les six banques et tout le ZIP fourni octet pour octet', () => {
    for (const [file, sha] of Object.entries(hashes))
      expect(
        createHash('sha256')
          .update(readFileSync(`docs/quiz-v1.3-import-180/source/${file}`))
          .digest('hex'),
      ).toBe(sha);
    for (const file of files)
      expect(readFileSync(`${directory}/${file.name}`)).toEqual(
        readFileSync(`docs/quiz-v1.3-import-180/source/banques/${file.name}`),
      );
    expect(readFileSync(`${directory}/owner-approval.json`)).toEqual(
      readFileSync(
        'docs/quiz-v1.3-import-180/source/validation-proprietaire/APPROBATION-PROPRIETAIRE-180.json',
      ),
    );
  });
  it('parse 6 fois 30, conserve couches/provenance et ne publie aucune des 180', () => {
    const banks = pending180Lots.map((l) => candidateBatchSchema.parse(l.batch));
    expect(banks.map((b) => b.questions.length)).toEqual([30, 30, 30, 30, 30, 30]);
    expect(banks.map((b) => b.questions[0].source.quoteLayer)).toEqual([
      'matn',
      'poem',
      'matn',
      'matn',
      'commentary',
      'gloss',
    ]);
    expect(
      banks
        .flatMap((b) => b.questions)
        .every(
          (q) =>
            q.source.quoteIsCertifiedVerbatim === false && q.distractorsReviewRequired === true,
        ),
    ).toBe(true);
    const result = inspectCandidateLots(base, pending180Lots);
    expect(result.approved).toHaveLength(0); // archival lots alone are still non-publishable
    expect(base.questions.length + inspectCandidateLots(base, editorialLots).approved.length).toBe(
      420,
    );
    expect(result.inventory.map((b) => b.approved)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(
      new Set(
        [
          ...base.questions,
          ...banks.flatMap((b) => b.questions),
          ...editorialLots
            .filter((l) => candidateBatchSchema.parse(l.batch).questions[0].level === 'debutant')
            .flatMap((l) => candidateBatchSchema.parse(l.batch).questions),
        ].map((q) => q.id),
      ).size,
    ).toBe(420);
  });
  it('active les 180 vérifications déclarées avec six rapports distincts et conserve les anciens lots', () => {
    const active = inspectCandidateLots(base, editorialLots);
    expect(active.approved).toHaveLength(270);
    expect(active.inventory.map((i) => i.approved)).toEqual(Array(9).fill(30));
    for (const lot of editorialLots.slice(3)) {
      const report = lot.report as {
        reviews: {
          citationVerified: boolean;
          attributionVerified: boolean;
          deduplicationReviewed: boolean;
          distractorsReviewed: boolean;
        }[];
      };
      expect(report.reviews).toHaveLength(30);
      expect(
        report.reviews.every(
          (r) =>
            r.citationVerified &&
            r.attributionVerified &&
            r.deduplicationReviewed &&
            r.distractorsReviewed,
        ),
      ).toBe(true);
    }
  });
  it('enregistre les 180 approbations éditoriales avec attestations nulles', () => {
    const approval = validateOwnerApproval(owner, files);
    expect(approval.questions).toHaveLength(180);
    expect(approval.publicationAllowedByThisRecordAlone).toBe(false);
    expect(
      approval.questions.every(
        (q) => q.citationVerified === null && q.attributionVerified === null,
      ),
    ).toBe(true);
    expect(() =>
      inspectCandidateLots(base, [{ batch: files[0].batch, report: approval }]),
    ).toThrow();
    expect(() =>
      validateOwnerApproval(owner, [{ ...files[0], sha256: '0'.repeat(64) }, ...files.slice(1)]),
    ).toThrow(/Empreinte/);
    const invalid = structuredClone(owner);
    invalid.questions[0].questionId = 'inconnu';
    expect(() => validateOwnerApproval(invalid, files)).toThrow(/Périmètre/);
    const forged = structuredClone(owner);
    forged.questions[0].citationVerified = true;
    expect(() => validateOwnerApproval(forged, files)).toThrow();
  });
  it('refuse les champs de provenance supprimés et les doublons', () => {
    const batch = structuredClone(pending180Lots[0].batch) as Record<string, unknown>;
    const parsed = candidateBatchSchema.parse(batch);
    delete parsed.questions[0].source.quoteLayer;
    expect(candidateBatchSchema.safeParse(parsed).success).toBe(false);
    expect(() => inspectCandidateLots(base, [...pending180Lots, pending180Lots[0]])).toThrow(
      /dupliquée/,
    );
  });
  it('réclame aussi la revue des distracteurs et de la déduplication pour le nouveau format', () => {
    // Entirely synthetic item and report; never approve supplied religious text in a test.
    const batch = candidateBatchSchema.parse(structuredClone(pending180Lots[0].batch));
    const book = base.books.find((b) => b.id === batch.bookId)!;
    batch.questions = [
      {
        ...batch.questions[0],
        id: 'synthetic-new-format',
        questionFr: 'Question synthétique de validation ?',
        options: ['a', 'b', 'c', 'd'].map((id) => ({ id, textFr: `Choix fictif ${id}` })),
        correctOptionId: 'a',
        explanationFr: 'Correction de test.',
        source: {
          workTitleAr: book.titleAr,
          authorAr: book.authorAr,
          chapterAr: 'باب تجريبي',
          quoteAr: 'نص تجريبي',
          url: 'https://example.test/ar',
          quoteLayer: 'commentary',
          verification: 'transcription-provisional-to-collate',
          quoteIsCertifiedVerbatim: false,
          edition: null,
          printedPage: null,
        },
      },
    ];
    const report = {
      schemaVersion: '1.3-review-1',
      batchSha256: candidateDigest(batch),
      publicationAllowed: true,
      reviews: [
        {
          questionId: 'synthetic-new-format',
          decision: 'approved',
          reviewerName: 'Relecteur fictif',
          reviewedAt: '2026-10-26',
          citationVerified: true,
          attributionVerified: true,
          notes: 'Validation de fixture seulement.',
        },
      ],
    };
    expect(() => inspectCandidateLots(base, [{ batch, report }])).toThrow(/Déduplication/);
    const complete = {
      ...report,
      reviews: report.reviews.map((r) => ({
        ...r,
        deduplicationReviewed: true,
        distractorsReviewed: true,
      })),
    };
    const playable = inspectCandidateLots(base, [{ batch, report: complete }]).approved;
    expect(playable).toHaveLength(1);
    expect(playable[0].sources![0].reference!.quoteLayer).toBe('commentary');
    expect(() =>
      inspectCandidateLots(base, [
        {
          batch,
          report: {
            ...complete,
            reviews: complete.reviews.map((r) => ({ ...r, citationVerified: false })),
          },
        },
      ]),
    ).toThrow(/non vérifiée/);
  });
  it('signale des rapprochements textuels sans les déclarer équivalents', () => {
    const rows = potentialEditorialCollisions(
      [
        {
          id: 'old',
          bookId: 'one',
          questionFr: 'Question synthétique alpha beta gamma',
          quoteAr: 'نص تجريبي',
        },
      ],
      [
        {
          id: 'new',
          bookId: 'one',
          questionFr: 'Question synthétique alpha beta delta',
          quoteAr: 'نص تجريبي',
        },
      ],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('editorial-review-required');
  });
});
