import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import rawBase from '../src/data/quiz-v1.2/research.json';
import rawReviews from '../src/data/quiz-v1.2/reviews.json';
import bank from '../src/data/quiz-v1.3-ultime-190/01-BANQUE-190-QUESTIONS-ULTIME.json';
import decision from '../src/data/quiz-v1.3-ultime-190/08-VALIDATION-PROPRIETAIRE-190.json';
import integrity from '../src/data/quiz-v1.3-ultime-190/integrity.json';
import hashes from '../docs/quiz-v1.3-ultime-190/IMPORT-SHA256.json';
import { researchBankSchema, validateReviewReport, playableBook } from '../src/lib/quiz-v12';
import { editorialLots } from '../src/lib/quiz-v13-lots';
import { candidateBatchSchema, inspectCandidateLots } from '../src/lib/quiz-v13-editorial';
import { inspectUltimeOwnerBank, ownerBankDigest } from '../src/lib/quiz-ultime-editorial';
import { drawPublishedQuestions } from '../src/lib/quiz-draw';
const base = researchBankSchema.parse(rawBase),
  reviews = validateReviewReport(base, rawReviews);
const existing = [
  ...base.questions,
  ...editorialLots.flatMap((l) => candidateBatchSchema.parse(l.batch).questions),
];
const inspect = (b: unknown = bank, d: unknown = decision, i: unknown = integrity) =>
  inspectUltimeOwnerBank(base, existing, b, d, i);
describe('190 questions éditorialement approuvées, sources distinctes', () => {
  it('préserve tout le ZIP et les données canoniques sans compter deux fois les exports', () => {
    for (const [name, sha] of Object.entries(hashes))
      expect(
        createHash('sha256')
          .update(readFileSync(`docs/quiz-v1.3-ultime-190/source/${name}`))
          .digest('hex'),
      ).toBe(sha);
    for (const name of [
      '01-BANQUE-190-QUESTIONS-ULTIME.json',
      '08-VALIDATION-PROPRIETAIRE-190.json',
    ])
      expect(readFileSync(`src/data/quiz-v1.3-ultime-190/${name}`)).toEqual(
        readFileSync(`docs/quiz-v1.3-ultime-190/source/${name}`),
      );
    expect(integrity.rawBankSha256).toBe(decision.newOwnerApprovedBankSha256);
    expect(integrity.canonicalBankSha256).toBe(ownerBankDigest(bank));
    const result = inspect();
    expect(result.questions).toHaveLength(190);
    expect(result.byBook.get('bidayat-al-mujtahid')).toHaveLength(140);
    expect(result.byBook.get('al-istidhkar')).toHaveLength(50);
  });
  it('conserve les 20 historiques, tous les ajouts, les autres ouvrages et les scores sur dix', () => {
    const result = inspect(),
      prior = inspectCandidateLots(base, editorialLots);
    let total = 0;
    for (const b of base.books) {
      const history = playableBook(base, reviews, b.level, b.id);
      expect(history).toHaveLength(10);
      const pool = [
        ...history,
        ...(prior.approvedByBook.get(b.id) ?? []),
        ...(result.byBook.get(b.id) ?? []),
      ];
      if (b.id === 'bidayat-al-mujtahid') expect(pool).toHaveLength(150);
      else if (b.id === 'al-istidhkar') expect(pool).toHaveLength(60);
      else expect(pool).toHaveLength(b.level === 'usul' ? 10 : 40);
      expect(history.every((q) => pool.some((p) => p.id === q.id))).toBe(true);
      expect(drawPublishedQuestions(pool, () => 0.5)).toHaveLength(10);
      total += pool.length;
    }
    expect(total).toBe(610);
  });
  it('inclut réellement la 150e question dans les positions éligibles du tirage', () => {
    const result = inspect();
    const history = playableBook(base, reviews, 'ultime', 'bidayat-al-mujtahid');
    const pool = [...history, ...result.byBook.get('bidayat-al-mujtahid')!];
    let first = true;
    const draw = drawPublishedQuestions(pool, () => {
      if (first) {
        first = false;
        return 0;
      }
      return 0.999999;
    });
    expect(draw[0].id).toBe(pool[149].id);
    expect(draw).toHaveLength(10);
  });
  it('affiche la base propriétaire sans inventer une certification de citation ou d’attribution', () => {
    const result = inspect();
    expect(result.policy).toBe('owner-editorial-approval');
    expect(result.decision.independentReligiousReviewer).toBeNull();
    expect(result.bank.questions.every((q) => q.scholarlyReview.status === 'not-attested')).toBe(
      true,
    );
    expect(
      result.questions.every(
        (q) =>
          q.publicationBasis === 'owner-editorial-approval' &&
          q.sourceVerification === 'not-attested' &&
          q.sources?.every((s) => s.reference?.textCheck === 'requires-editorial-collation'),
      ),
    ).toBe(true);
    expect(JSON.stringify(result.questions)).not.toContain('read-facsimile');
    expect(JSON.stringify(result.questions)).not.toContain('citationVerified');
  });
  it('rejette les contenus modifiés, IDs dupliqués et décisions d’un autre lot', () => {
    const changed = structuredClone(bank);
    changed.questions[0].explanationFr += ' Modifié.';
    expect(() => inspect(changed)).toThrow(/Empreinte/);
    const other = structuredClone(decision);
    other.questions[0].questionId = 'unknown';
    expect(() => inspect(bank, other)).toThrow(/périmètre/);
    const duplicate = structuredClone(bank);
    duplicate.questions[1].id = duplicate.questions[0].id;
    // Hash recomputed solely to reach the structural duplicate check in this negative test.
    expect(() =>
      inspect(duplicate, decision, {
        ...integrity,
        canonicalBankSha256: ownerBankDigest(duplicate),
      }),
    ).toThrow(/dupliquée/);
    expect(() =>
      inspect(bank, { ...decision, newOwnerApprovedBankSha256: '0'.repeat(64) }),
    ).toThrow(/Empreinte/);
  });
  it('n’expose ni une décision retirée, ni une question jamais approuvée, ni une fausse attestation', () => {
    expect(
      inspect(bank, { ...decision, publicationAuthorizationByOwner: false }).questions,
    ).toEqual([]);
    expect(inspect(bank, { ...decision, decision: 'pending' }).questions).toEqual([]);
    const partial = structuredClone(decision);
    partial.questions[0].ownerDecision = 'pending';
    const result = inspect(bank, partial);
    expect(result.questions).toHaveLength(189);
    expect(result.questions.some((q) => q.id === partial.questions[0].questionId)).toBe(false);
    const draft = structuredClone(bank);
    draft.questions[0].status = 'draft';
    expect(() =>
      inspect(draft, decision, { ...integrity, canonicalBankSha256: ownerBankDigest(draft) }),
    ).toThrow();
    const fake = structuredClone(bank);
    fake.questions[0].scholarlyReview.status = 'approved';
    expect(() =>
      inspect(fake, decision, { ...integrity, canonicalBankSha256: ownerBankDigest(fake) }),
    ).toThrow();
  });
});
