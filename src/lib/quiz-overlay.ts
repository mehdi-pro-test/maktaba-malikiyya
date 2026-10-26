import type { QuizQuestion } from './quiz';
import { quizContentSchema } from './admin/validation';
export type OverlayRecord = {
  id: string;
  bookId: string;
  archivedAt: Date | null;
  activeRevision: {
    content: unknown;
    status: string;
    globalEligible: boolean;
    sourceVerification: string;
    ownerApprovedBy: string | null;
    ownerPublishedAt: Date | null;
  } | null;
};
/** Pure overlay: drafts never displace the last published version, archives remove by stable ID. */
export function mergeQuizOverlay(
  base: readonly QuizQuestion[],
  records: readonly OverlayRecord[],
  book: { id: string; titleFr: string; titleAr: string; levelLabel: string },
) {
  const byId = new Map(base.map((q) => [q.id, q]));
  for (const record of records.filter((r) => r.bookId === book.id)) {
    if (record.archivedAt) {
      byId.delete(record.id);
      continue;
    }
    const revision = record.activeRevision;
    if (!revision) continue;
    if (revision.status !== 'PUBLISHED' || !revision.ownerApprovedBy || !revision.ownerPublishedAt)
      throw new Error('Révision publique non autorisée');
    const content = quizContentSchema.parse(revision.content),
      ref = content.reference;
    const question: QuizQuestion = {
      id: record.id,
      status: 'published',
      category: 'fiqh',
      order: byId.size + 1,
      type: 'single',
      promptFr: content.questionFr,
      options: content.options.map((o) => ({ id: o.id, label: o.textFr })),
      correctOptionIds: [content.correctOptionId],
      explanationFr: content.explanationFr,
      publicationBasis: 'owner-editorial-approval',
      sourceVerification:
        revision.sourceVerification === 'OWNER_COLLATED' ? 'owner-collated' : 'not-attested',
      globalEligible: revision.globalEligible,
      origin: {
        bookId: book.id,
        titleFr: book.titleFr,
        titleAr: book.titleAr,
        levelLabel: book.levelLabel,
      },
      sources: [
        {
          title: ref.workTitleAr,
          url: ref.url,
          reference: {
            ...ref,
            quoteLayer: 'owner-provided',
            locator: '',
            textCheck:
              revision.sourceVerification === 'OWNER_COLLATED'
                ? 'owner-collated'
                : 'requires-editorial-collation',
          },
        },
      ],
    };
    byId.set(record.id, question);
  }
  return [...byId.values()];
}
