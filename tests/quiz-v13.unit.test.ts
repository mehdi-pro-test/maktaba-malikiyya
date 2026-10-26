import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { drawQuestions, drawPublishedQuestions } from '../src/lib/quiz-draw';
import {
  candidateBatchSchema,
  candidateDigest,
  inspectCandidateLots,
  type CandidateBatch,
} from '../src/lib/quiz-v13-editorial';
import { researchBankSchema, bankDigest } from '../src/lib/quiz-v12';
import { quizScore } from '../src/lib/quiz';
import { syntheticPool } from './fixtures/quiz-pool';
import raw from '../src/data/quiz-v1.2/research.json';
import importedHashes from '../docs/quiz-v1.3/IMPORT-SHA256.json';
const base = researchBankSchema.parse(raw);
const directory = 'docs/quiz-v1.3-pack/recherche-v1.3';
const lots = readdirSync(directory)
  .filter((f) => f.endsWith('-candidats.json'))
  .map((f) => ({ batch: JSON.parse(readFileSync(`${directory}/${f}`, 'utf8')) }));
function rng(seed = 1) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}
function syntheticBatch(): CandidateBatch {
  // Replace EVERY editorial field; approvals below apply exclusively to this fake fixture.
  const book = base.books[0];
  return candidateBatchSchema.parse({
    schemaVersion: '1.3-research-candidates-1',
    createdAt: base.createdAt,
    bookId: book.id,
    status: 'not-for-publication',
    editorialReviewRequired: true,
    notice: 'Fixture synthétique uniquement.',
    questions: [
      {
        id: 'synthetic-editorial-1',
        bookId: book.id,
        level: 'debutant',
        editorialStatus: 'research-draft',
        source: {
          workTitleAr: 'كتاب تجريبي',
          authorAr: 'مؤلف تجريبي',
          chapterAr: 'باب تجريبي',
          quoteAr: 'نص تجريبي فقط',
          url: 'https://example.test/ar',
          verification: 'consulted-online-transcription',
          edition: null,
          printedPage: null,
        },
        questionFr: 'Question fictive de test sans contenu religieux ?',
        options: ['a', 'b', 'c', 'd'].map((id) => ({ id, textFr: `Choix fictif ${id}` })),
        correctOptionId: 'a',
        explanationFr: 'Explication de test.',
        newComparedToV12: 'manually-screened-not-approved',
      },
    ],
  });
}
function syntheticReport(batch = syntheticBatch()) {
  return {
    schemaVersion: '1.3-review-1',
    batchSha256: candidateDigest(batch),
    publicationAllowed: true,
    reviews: batch.questions.map((q) => ({
      questionId: q.id,
      decision: 'approved',
      reviewerName: 'Identité fictive de test',
      reviewedAt: base.createdAt,
      citationVerified: true,
      attributionVerified: true,
      notes: 'Rapport synthétique, aucun contenu réel approuvé.',
    })),
  };
}
describe('Tirage sans remise', () => {
  it.each([10, 100])('1000 tirages à partir de %i : dix uniques et entrée immuable', (size) => {
    const pool = syntheticPool(size);
    const snapshot = structuredClone(pool);
    const random = rng();
    for (let n = 0; n < 1000; n++) {
      const draw = drawPublishedQuestions(pool, random);
      expect(draw).toHaveLength(10);
      expect(new Set(draw.map((q) => q.id)).size).toBe(10);
      expect(draw.every((q) => pool.includes(q))).toBe(true);
    }
    expect(pool).toEqual(snapshot);
  });
  it('est reproductible et permet de nouveaux tirages indépendants', () => {
    const pool = syntheticPool();
    expect(drawQuestions(pool, rng(42))).toEqual(drawQuestions(pool, rng(42)));
    expect(drawQuestions(pool, () => 0)).not.toEqual(drawQuestions(pool, () => 0.99));
    const r = rng();
    const attempt = drawQuestions(pool, r);
    const before = [...attempt];
    quizScore(attempt, {});
    drawQuestions(pool, r);
    expect(attempt).toEqual(before);
  });
  it('respecte Fisher–Yates pour un aléa fixé', () => {
    expect(drawQuestions(syntheticPool(10), () => 0).map((q) => q.id)).toEqual([
      ...Array.from({ length: 9 }, (_, i) => `synthetic-${i + 2}`),
      'synthetic-1',
    ]);
  });
  it('bloque les cas limites et ne complète jamais une banque', () => {
    expect(drawQuestions(syntheticPool(9))).toEqual([]);
    expect(drawQuestions([])).toEqual([]);
    expect(() => drawQuestions(syntheticPool(101))).toThrow(/100/);
    expect(() => drawQuestions([...syntheticPool(10), syntheticPool(1)[0]])).toThrow(/dupliqué/);
    for (const n of [1, -1, NaN, Infinity])
      expect(() => drawQuestions(syntheticPool(), () => n)).toThrow(/Aléa/);
    const pool = syntheticPool();
    Object.assign(pool[0], { status: 'draft' });
    expect(() => drawPublishedQuestions(pool)).toThrow(/non publiée/);
  });
  it.each([0, 5, 10])('conserve le score %i/10 après tirage', (target) => {
    const draw = drawPublishedQuestions(syntheticPool(), rng());
    const answers = Object.fromEntries(draw.map((q, i) => [q.id, [i < target ? 'a' : 'b']]));
    expect(quizScore(draw, answers)).toBe(target);
    expect(draw.every((q) => q.sources?.[0].reference?.quoteAr === 'نص تجريبي فقط')).toBe(true);
  });
});
describe('Import éditorial additif', () => {
  it('conserve 150 questions V1.2 et 150 validations sans changer leur digest', () => {
    expect(base.questions).toHaveLength(150);
    expect(bankDigest(base)).toBe(
      'eb1b6ab9830e22a543603e0093f6c9ac100f6e9209cae403413c1528a26598fa',
    );
    for (const [file, hash] of Object.entries(BASELINE_HASHES))
      expect(createHash('sha256').update(readFileSync(file)).digest('hex')).toBe(hash);
  });
  it('préserve chaque fichier livré dans le pack sans réécriture', () => {
    for (const [file, hash] of Object.entries(importedHashes)) {
      expect(createHash('sha256').update(readFileSync(file)).digest('hex')).toBe(hash);
    }
  });
  it('parse les 90 vrais candidats sans jamais les publier', () => {
    const result = inspectCandidateLots(base, lots);
    expect(result.inventory.map((i) => i.written)).toEqual([30, 30, 30]);
    expect(result.approved).toEqual([]);
    expect(result.inventory.every((i) => i.approved === 0)).toBe(true);
    expect(result.attributionDifferences).toHaveLength(30); // titre alternatif Achmawiyya à relire
  });
  it('exige un rapport propre au lot pour toute extension future', () => {
    const batch = syntheticBatch();
    const report = syntheticReport(batch);
    expect(inspectCandidateLots(base, [{ batch }]).approved).toEqual([]);
    expect(inspectCandidateLots(base, [{ batch, report }]).approved).toHaveLength(1);
    expect(
      inspectCandidateLots(base, [{ batch, report: { ...report, publicationAllowed: false } }])
        .approved,
    ).toEqual([]);
    expect(() =>
      inspectCandidateLots(base, [{ batch, report: { ...report, batchSha256: bankDigest(base) } }]),
    ).toThrow(/périmé/);
    const changed = structuredClone(batch);
    changed.questions[0].explanationFr += ' Modifié.';
    expect(() => inspectCandidateLots(base, [{ batch: changed, report }])).toThrow(/périmé/);
    expect(() =>
      inspectCandidateLots(base, [
        { batch, report: { ...report, reviews: [report.reviews[0], report.reviews[0]] } },
      ]),
    ).toThrow(/dupliquée/);
    for (const field of ['citationVerified', 'attributionVerified'])
      expect(() =>
        inspectCandidateLots(base, [
          { batch, report: { ...report, reviews: [{ ...report.reviews[0], [field]: false }] } },
        ]),
      ).toThrow(/non vérifiée/);
    expect(
      inspectCandidateLots(base, [
        { batch, report: { ...report, reviews: [{ ...report.reviews[0], decision: 'rejected' }] } },
      ]).approved,
    ).toEqual([]);
  });
  it('prépare un pool additif de 100 avec 90 approbations synthétiques indépendantes', () => {
    const batch = syntheticBatch();
    batch.questions = Array.from({ length: 90 }, (_, i) => ({
      ...structuredClone(batch.questions[0]),
      id: `synthetic-editorial-${i + 1}`,
      questionFr: `Question fictive supplémentaire ${i + 1} ?`,
    }));
    const report = syntheticReport(batch);
    const imported = inspectCandidateLots(base, [{ batch, report }]);
    expect(imported.approvedByBook.get(batch.bookId)).toHaveLength(90);
    const pool = [...syntheticPool(10), ...imported.approved];
    expect(pool).toHaveLength(100);
    expect(drawPublishedQuestions(pool, rng())).toHaveLength(10);
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 2);
    const invalid = structuredClone(report);
    invalid.reviews[0].reviewedAt = tomorrow.toISOString().slice(0, 10);
    expect(() => inspectCandidateLots(base, [{ batch, report: invalid }])).toThrow(/Date/);
  });
  it('accepte également un lot synthétique pour un ouvrage hors débutant', () => {
    const batch = syntheticBatch();
    const book = base.books.find((b) => b.level === 'intermediaire')!;
    batch.bookId = book.id;
    batch.questions[0].bookId = book.id;
    batch.questions[0].level = 'intermediaire';
    expect(
      inspectCandidateLots(base, [{ batch, report: syntheticReport(batch) }]).approvedByBook.get(
        book.id,
      ),
    ).toHaveLength(1);
  });
  it('refuse doublons, statuts, choix, liens, pages et auteurs manquants', () => {
    const batch = syntheticBatch();
    expect(() => inspectCandidateLots(base, [{ batch }, { batch }])).toThrow(/dupliquée/);
    const duplicate = structuredClone(batch);
    duplicate.questions[0].questionFr = base.questions[0].questionFr;
    expect(() => inspectCandidateLots(base, [{ batch: duplicate }])).toThrow(/dupliquée/);
    for (const edit of [
      (b: CandidateBatch) => Object.assign(b.questions[0], { editorialStatus: 'published' }),
      (b: CandidateBatch) => Object.assign(b.questions[0], { correctOptionId: 'missing' }),
      (b: CandidateBatch) => Object.assign(b.questions[0].source, { url: 'http://example.test' }),
      (b: CandidateBatch) => Object.assign(b.questions[0].source, { printedPage: 1 }),
      (b: CandidateBatch) => Object.assign(b.questions[0].source, { authorAr: '' }),
    ]) {
      const invalid = structuredClone(batch);
      edit(invalid);
      expect(candidateBatchSchema.safeParse(invalid).success).toBe(false);
    }
  });
});

const BASELINE_HASHES = {
  'src/data/quiz-v1.2/research.json':
    'f75d72c597a9107fc581b4c9b702e6c8672c2aa4cf82cbeca04afb68783ab1d0',
  'src/data/quiz-v1.2/reviews.json':
    'c1a7855bf1b974b2a65c52608f4cb041380cc5bd6da60e456c3964eb777b21cd',
};
