import { describe, it, expect } from 'vitest';
import raw from '../src/data/quiz-v1.2/research.json';
import reports from '../src/data/quiz-v1.2/reviews.json';
import {
  researchBankSchema,
  publicLibrary,
  playableBook,
  bankDigest,
  validateReviewReport,
} from '../src/lib/quiz-v12';
import { quizScore } from '../src/lib/quiz';
import { fixtureBank, fixtureReport } from './fixtures/quiz-v12';
const bank = researchBankSchema.parse(raw);
describe('Banque V1.2 et publication', () => {
  it('importe les 150 questions sans perte de texte, réponse, ID ou provenance', () => {
    expect(bank).toEqual(raw);
    expect(bank.questions).toHaveLength(150);
    expect(bank.books).toHaveLength(15);
    expect(bank.books.filter((b) => b.level === 'debutant')).toHaveLength(3);
    for (const b of bank.books)
      expect(bank.questions.filter((q) => q.bookId === b.id)).toHaveLength(10);
  });
  it('ne rend aucun lot réel jouable et ne projette aucune correction au public', () => {
    const report = validateReviewReport(bank, reports);
    const pub = publicLibrary(bank, report);
    expect(pub.filter((b) => b.available)).toHaveLength(0);
    for (const b of bank.books) expect(playableBook(bank, report, b.level, b.id)).toEqual([]);
    const payload = JSON.stringify(pub);
    for (const q of bank.questions) {
      expect(payload).not.toContain(q.questionFr);
      expect(payload).not.toContain(q.explanationFr);
      expect(payload).not.toContain(q.references[0].quoteAr);
    }
  });
  it.each([
    'id',
    'options',
    'answer',
    'source',
    'url',
    'author',
    'book',
    'count',
    'markup',
  ] as const)('refuse une banque incohérente : %s', (kind) => {
    const data = structuredClone(raw);
    const q = data.questions[0];
    if (kind === 'id') data.questions[1].id = q.id;
    if (kind === 'options') q.options[1] = q.options[0];
    if (kind === 'answer') q.correctOptionId = 'absent';
    if (kind === 'source') q.references[0].sourceId = 'absent';
    if (kind === 'url') q.references[0].url = 'javascript:alert(1)';
    if (kind === 'author') q.references[0].authorAr = 'مؤلف آخر';
    if (kind === 'book') q.level = 'ultime';
    if (kind === 'count') data.questions.pop();
    if (kind === 'markup') q.questionFr = '<script>alert(1)</script>';
    expect(researchBankSchema.safeParse(data).success).toBe(false);
  });
  it('un changement de statut sans dix décisions de relecture ne publie rien', () => {
    const f = fixtureBank();
    const report = fixtureReport(f);
    report.reviews.pop();
    expect(publicLibrary(f, report)[0].available).toBe(false);
    expect(playableBook(f, report, f.books[0].level, f.books[0].id)).toEqual([]);
  });
  it('refuse la validation d’une version antérieure, y compris après modification d’une seule option', () => {
    const f = fixtureBank();
    const report = fixtureReport(f);
    f.questions[0].options[1].textFr += ' (modifié)';
    expect(() => validateReviewReport(f, report)).toThrow(/périmé/);
  });
  it('refuse les IDs inconnus, les doubles décisions et les dates impossibles', () => {
    const f = fixtureBank();
    const report = fixtureReport(f);
    expect(() =>
      validateReviewReport(f, { ...report, reviews: [...report.reviews, report.reviews[0]] }),
    ).toThrow();
    report.reviews[0].questionId = 'absent';
    expect(() => validateReviewReport(f, report)).toThrow(/inconnue/);
    const future = fixtureReport(f);
    future.reviews[0].reviewedAt = '2999-01-01';
    expect(() => validateReviewReport(f, future)).toThrow(/Date/);
  });
  it('ajoute un ouvrage de dix questions sans changer le moteur ou le schéma', () => {
    const f = fixtureBank();
    const first = f.books[0];
    f.books.push({
      ...first,
      id: 'ouvrage-fictif-additionnel',
      titleFr: 'Ouvrage fictif additionnel',
      status: 'review',
    });
    f.questions.push(
      ...f.questions
        .filter((q) => q.bookId === first.id)
        .map((q) => ({
          ...q,
          id: `nouveau-${q.id}`,
          bookId: 'ouvrage-fictif-additionnel',
          questionFr: `Autre fixture : ${q.questionFr}`,
          status: 'review' as const,
        })),
    );
    const extended = researchBankSchema.parse(f);
    expect(extended.questions).toHaveLength(160);
    expect(publicLibrary(extended, fixtureReport(extended))).toHaveLength(16);
  });
  it('une décision rejetée bloque le lot et les slugs croisés ou inconnus ne jouent pas', () => {
    const f = fixtureBank();
    const report = fixtureReport(f);
    report.reviews[0].decision = 'rejected';
    expect(publicLibrary(f, report)[0].available).toBe(false);
    expect(playableBook(f, report, 'ultime', f.books[0].id)).toEqual([]);
    expect(playableBook(f, report, 'debutant', 'inconnu')).toEqual([]);
  });
  it('le digest ignore l’ordre des clés mais conserve les contenus et l’ordre des questions', () => {
    const reordered = Object.fromEntries(Object.entries(bank).reverse());
    expect(bankDigest(reordered as typeof bank)).toBe(bankDigest(bank));
    const changed = structuredClone(bank);
    changed.questions.reverse();
    expect(bankDigest(changed)).not.toBe(bankDigest(bank));
  });
  it('adapte une fixture explicitement fictive au moteur historique et conserve ses références', () => {
    const f = fixtureBank();
    const qs = playableBook(f, fixtureReport(f), f.books[0].level, f.books[0].id);
    expect(qs).toHaveLength(10);
    expect(qs[0].sources?.[0].reference?.quoteAr).toContain('تجريبي');
    for (const n of [0, 5, 10])
      expect(
        quizScore(
          qs,
          Object.fromEntries(qs.map((q, i) => [q.id, i < n ? q.correctOptionIds : ['wrong']])),
        ),
      ).toBe(n);
    const answers = { [qs[0].id]: qs[0].correctOptionIds };
    expect(quizScore(qs, answers)).toBe(1);
    answers[qs[0].id] = qs[0].correctOptionIds;
    expect(quizScore(qs, answers)).toBe(1);
  });
});
