// Synthetic editorial approval is confined to test fixtures. Never import in src/.
import raw from '../../src/data/quiz-v1.2/research.json';
import { researchBankSchema, bankDigest, type ReviewReport } from '../../src/lib/quiz-v12';
export function fixtureBank() {
  const data = researchBankSchema.parse(structuredClone(raw));
  data.publicationAllowed = true;
  for (const [index, b] of data.books.entries()) {
    b.titleAr = `كتاب تجريبي ${index + 1}`;
    b.authorAr = 'مؤلف تجريبي';
    b.status = index === 0 ? 'published' : 'review';
    b.reviewer = null;
    b.reviewedAt = null;
  }
  for (const s of data.sources) {
    s.url = `https://example.test/ar/${s.id}`;
    s.edition = null;
  }
  for (const [index, q] of data.questions.entries()) {
    const b = data.books.find((b) => b.id === q.bookId)!;
    q.questionFr = `Question fictive ${index + 1} : quel est le premier choix ?`;
    q.options = ['Premier choix', 'Deuxième choix', 'Troisième choix', 'Quatrième choix'].map(
      (textFr, i) => ({ id: String.fromCharCode(97 + i), textFr }),
    );
    q.correctOptionId = 'a';
    q.explanationFr = 'Correction fictive réservée au test du moteur.';
    q.status = q.bookId === data.books[0].id ? 'published' : 'review';
    q.scholarlyReview = {
      status: 'pending',
      reviewer: null,
      reviewedAt: null,
      notes: 'Fixture synthétique uniquement.',
    };
    for (const r of q.references) {
      r.workTitleAr = b.titleAr;
      r.authorAr = b.authorAr;
      r.quoteAr = 'نص تجريبي للاختبار فقط';
      r.url = `https://example.test/ar/${r.sourceId}`;
      r.edition = null;
      r.printedPage = null;
      r.pdfPage = null;
    }
  }
  return researchBankSchema.parse(data);
}
export function fixtureReport(bank = fixtureBank()): ReviewReport {
  const digest = bankDigest(bank);
  return {
    schemaVersion: '1.2-review-1',
    reviews: bank.questions
      .filter((q) => q.bookId === bank.books[0].id)
      .map((q) => ({
        bankSha256: digest,
        questionId: q.id,
        decision: 'approved',
        reviewerName: 'Relecteur fictif — tests uniquement',
        reviewedAt: bank.createdAt,
        notes: 'Validation artificielle, fixture exclusivement.',
      })),
  };
}
