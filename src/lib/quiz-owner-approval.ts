import { z } from 'zod';
import { candidateBatchSchema } from './quiz-v13-editorial';
const text = z.string().min(1);
export const ownerApprovalSchema = z
  .object({
    schemaVersion: z.literal('owner-approval-declaration-v1'),
    recordedAt: z.iso.date(),
    declarant: text,
    exactDeclaration: z.literal("j'ai validé les brouillons"),
    approvalScope: text,
    decision: z.literal('owner-editorial-approved'),
    independentReligiousReviewer: z.null(),
    citationsArabicVerifiedAgainstPrimaryEdition: z.literal('non explicitement attesté'),
    attributionsAuthorAndTextLayerVerified: z.literal('non explicitement attesté'),
    publicationAllowedByThisRecordAlone: z.literal(false),
    reason: text,
    originalFilesSha256: z.record(
      z.string().regex(/^[a-z0-9-]+\.json$/),
      z.string().regex(/^[a-f0-9]{64}$/),
    ),
    questions: z
      .array(
        z
          .object({
            questionId: text,
            bookId: text,
            ownerDecision: z.literal('approved-draft'),
            citationVerified: z.null(),
            attributionVerified: z.null(),
          })
          .strict(),
      )
      .length(180),
  })
  .strict();
/** Record the supplied editorial decision, never translate it into a publication review. */
export function validateOwnerApproval(
  value: unknown,
  files: { name: string; sha256: string; batch: unknown }[],
) {
  const approval = ownerApprovalSchema.parse(value);
  if (
    files.length !== 6 ||
    Object.keys(approval.originalFilesSha256).length !== 6 ||
    new Set(files.map((f) => f.name)).size !== 6
  )
    throw new Error('Six banques distinctes requises');
  const expected = new Map<string, string>();
  for (const file of files) {
    if (approval.originalFilesSha256[file.name] !== file.sha256)
      throw new Error('Empreinte source différente');
    const batch = candidateBatchSchema.parse(file.batch);
    if (batch.questions.length !== 30) throw new Error('Trente questions par lot requises');
    for (const q of batch.questions) {
      if (expected.has(q.id)) throw new Error('Identifiant dupliqué');
      expected.set(q.id, q.bookId);
    }
  }
  const seen = new Set<string>();
  for (const q of approval.questions) {
    if (seen.has(q.questionId) || expected.get(q.questionId) !== q.bookId)
      throw new Error('Périmètre de validation incohérent');
    seen.add(q.questionId);
  }
  if (seen.size !== expected.size) throw new Error('Validation incomplète');
  return approval;
}
