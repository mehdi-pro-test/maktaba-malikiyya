import { z } from 'zod';
export const text = (max = 500) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((v) => !/[<>]/.test(v), 'Texte brut uniquement');
export const id = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-zA-Z0-9-]+$/);
const integer = z.number().int().min(0).max(100000);
export const stockInput = z
  .object({
    productId: id,
    mode: z.enum(['ADD', 'REMOVE', 'COUNT']),
    quantity: integer,
    expectedOnHand: integer,
    reason: text(),
    idempotencyKey: z.uuid(),
    relatedOrderId: id.optional(),
  })
  .strict()
  .refine((v) => v.mode === 'COUNT' || v.quantity > 0, 'Quantité positive requise');
export const fulfillmentInput = z
  .object({
    orderId: id,
    version: integer,
    status: z.enum(['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    carrier: z.string().trim().max(100),
    trackingNumber: z.string().trim().max(160),
    note: z.string().trim().max(2000),
    reason: text(),
    idempotencyKey: z.uuid(),
  })
  .strict();
export const productInput = z
  .object({
    id: id.optional(),
    version: integer.optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(120),
    titleFr: text(200),
    titleAr: text(300).refine((v) => /[\u0600-\u06ff]/.test(v), 'Titre arabe requis'),
    descriptionFr: z
      .string()
      .trim()
      .max(10000)
      .refine((v) => !/[<>]/.test(v)),
    descriptionAr: z
      .string()
      .trim()
      .max(10000)
      .refine((v) => !/[<>]/.test(v)),
    categoryId: id,
    priceCents: z.number().int().min(0).max(10000000),
    lowStockThreshold: integer,
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  })
  .strict()
  .refine((v) => !v.id || v.version !== undefined, 'Version requise pour une modification');
const ar = text(1500).refine((v) => /[\u0600-\u06ff]/.test(v), 'Texte arabe requis');
export const quizContentSchema = z
  .object({
    questionFr: text(1500),
    options: z
      .array(z.object({ id: z.enum(['a', 'b', 'c', 'd']), textFr: text(700) }).strict())
      .length(4),
    correctOptionId: z.enum(['a', 'b', 'c', 'd']),
    explanationFr: text(7000),
    reference: z
      .object({
        workTitleAr: ar,
        authorAr: ar,
        sectionAr: ar,
        quoteAr: ar,
        url: z.url().refine((v) => {
          const u = new URL(v);
          return u.protocol === 'https:' && !u.username && !u.password;
        }),
        edition: z.string().max(500).nullable(),
        printedPage: z.number().int().positive().nullable(),
        pdfPage: z.number().int().positive().nullable(),
      })
      .strict(),
  })
  .strict()
  .superRefine((q, ctx) => {
    if (
      new Set(q.options.map((o) => o.id)).size !== 4 ||
      new Set(q.options.map((o) => o.textFr.toLocaleLowerCase('fr'))).size !== 4
    )
      ctx.addIssue({ code: 'custom', message: 'Quatre choix distincts requis' });
  });
export const quizDraftContentSchema = z
  .object({
    questionFr: text(1500),
    options: z
      .array(z.object({ id: z.enum(['a', 'b', 'c', 'd']), textFr: z.string().max(700) }).strict())
      .length(4),
    correctOptionId: z.enum(['a', 'b', 'c', 'd']).nullable(),
    explanationFr: z.string().max(7000),
    reference: z
      .object({
        workTitleAr: z.string().max(1500),
        authorAr: z.string().max(1500),
        sectionAr: z.string().max(1500),
        quoteAr: z.string().max(1500),
        url: z.string().max(2000),
        edition: z.string().max(500).nullable(),
        printedPage: z.number().int().positive().nullable(),
        pdfPage: z.number().int().positive().nullable(),
      })
      .strict(),
  })
  .strict()
  .refine(
    (q) => new Set(q.options.map((o) => o.id)).size === 4,
    'Identifiants de choix distincts requis',
  );
export const quizSaveInput = z
  .object({
    id: id.optional(),
    creationKey: z.uuid().optional(),
    bookId: id,
    version: integer,
    content: quizDraftContentSchema,
    globalEligible: z.boolean(),
    sourceVerification: z.enum(['NOT_ATTESTED', 'OWNER_COLLATED']),
    reason: text(),
  })
  .strict()
  .refine((v) => !!v.id || !!v.creationKey, 'Clé de création requise');
export const quizPublishInput = z
  .object({ id, version: integer, revisionId: id, confirmed: z.literal(true), reason: text() })
  .strict();
export const quizArchiveInput = z
  .object({
    id,
    version: integer,
    archived: z.boolean(),
    confirmed: z.literal(true),
    reason: text(),
  })
  .strict();
export function csvCell(value: unknown) {
  let s = String(value ?? '');
  if (/^[\s]*[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export type QuizDraftContent = z.infer<typeof quizDraftContentSchema>;
