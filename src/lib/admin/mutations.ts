import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { commerceTransaction } from '../orders';
import { bookCategories } from '@/data/categories';
import { stockInput, fulfillmentInput, productInput } from './validation';
export type OwnerActor = { id: string };
export class AdminConflict extends Error {}
const digest = (input: unknown) => createHash('sha256').update(JSON.stringify(input)).digest('hex');
export async function audit(
  tx: Prisma.TransactionClient,
  actor: OwnerActor,
  action: string,
  entityType: string,
  entityId: string,
  before: Prisma.InputJsonValue | undefined,
  after: Prisma.InputJsonValue | undefined,
  reason: string,
) {
  await tx.adminAuditEvent.create({
    data: {
      actorId: actor.id,
      action,
      entityType,
      entityId,
      priorSummary: before,
      nextSummary: after,
      reason,
      correlationId: randomUUID(),
    },
  });
}
export async function adjustStock(actor: OwnerActor, raw: unknown) {
  const input = stockInput.parse(raw),
    hash = digest(input);
  return commerceTransaction(async (tx) => {
    const prior = await tx.inventoryMovement.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (prior) {
      if (prior.requestDigest !== hash)
        throw new AdminConflict('Clé déjà utilisée pour une autre opération');
      return prior;
    }
    const p = await tx.product.findUniqueOrThrow({ where: { id: input.productId } });
    const reserved =
      (
        await tx.stockReservation.aggregate({
          where: { productId: p.id, status: 'ACTIVE' },
          _sum: { quantity: true },
        })
      )._sum.quantity ?? 0;
    if (input.mode === 'COUNT' && input.expectedOnHand !== p.stockOnHand)
      throw new AdminConflict('Le stock a changé depuis votre comptage. Actualisez.');
    const after =
      input.mode === 'COUNT'
        ? input.quantity
        : p.stockOnHand + (input.mode === 'ADD' ? input.quantity : -input.quantity);
    if (after < reserved || after < 0 || after > 100000)
      throw new AdminConflict(
        'Le stock physique ne peut pas être inférieur aux réservations actives.',
      );
    if (
      input.relatedOrderId &&
      !(await tx.order.findUnique({ where: { id: input.relatedOrderId } }))
    )
      throw new AdminConflict('Commande inconnue');
    await tx.product.update({
      where: { id: p.id },
      data: { stockOnHand: after, version: { increment: 1 } },
    });
    const movement = await tx.inventoryMovement.create({
      data: {
        productId: p.id,
        type: input.mode,
        delta: after - p.stockOnHand,
        beforeOnHand: p.stockOnHand,
        afterOnHand: after,
        reservedAtChange: reserved,
        reason: input.reason,
        adminId: actor.id,
        relatedOrderId: input.relatedOrderId,
        idempotencyKey: input.idempotencyKey,
        requestDigest: hash,
      },
    });
    await audit(
      tx,
      actor,
      'stock.adjust',
      'product',
      p.id,
      { stockOnHand: p.stockOnHand },
      { stockOnHand: after, reserved },
      input.reason,
    );
    return movement;
  });
}
const transitions: Record<string, string[]> = {
  UNFULFILLED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};
export async function fulfillOrder(actor: OwnerActor, raw: unknown) {
  const input = fulfillmentInput.parse(raw),
    hash = digest(input);
  return commerceTransaction(async (tx) => {
    const prior = await tx.orderFulfillmentEvent.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (prior) {
      if (prior.requestDigest !== hash) throw new AdminConflict('Clé de suivi déjà utilisée');
      return prior;
    }
    const order = await tx.order.findUniqueOrThrow({ where: { id: input.orderId } });
    if (order.status !== 'PAID')
      throw new AdminConflict(
        'Le paiement Stripe doit être confirmé avant toute opération logistique.',
      );
    if (
      order.fulfillmentVersion !== input.version ||
      !transitions[order.fulfillmentStatus]?.includes(input.status)
    )
      throw new AdminConflict('Transition impossible ou commande modifiée. Actualisez.');
    const updated = await tx.order.updateMany({
      where: { id: order.id, fulfillmentVersion: input.version, status: 'PAID' },
      data: {
        fulfillmentStatus: input.status,
        fulfillmentVersion: { increment: 1 },
        carrier: input.carrier || null,
        trackingNumber: input.trackingNumber || null,
        internalNote: input.note || null,
        ...(input.status === 'SHIPPED' ? { shippedAt: new Date() } : {}),
        ...(input.status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
      },
    });
    if (updated.count !== 1) throw new AdminConflict('Commande modifiée');
    const event = await tx.orderFulfillmentEvent.create({
      data: {
        orderId: order.id,
        fromStatus: order.fulfillmentStatus,
        toStatus: input.status,
        carrier: input.carrier || null,
        trackingNumber: input.trackingNumber || null,
        reason: input.reason,
        adminId: actor.id,
        idempotencyKey: input.idempotencyKey,
        requestDigest: hash,
      },
    });
    // Notes, delivery addresses and tracking numbers are not copied into the general audit.
    await audit(
      tx,
      actor,
      'order.fulfillment',
      'order',
      order.id,
      { fulfillmentStatus: order.fulfillmentStatus },
      { fulfillmentStatus: input.status },
      input.reason,
    );
    return event;
  });
}
export async function saveProduct(actor: OwnerActor, raw: unknown) {
  const input = productInput.parse(raw);
  return commerceTransaction(async (tx) => {
    const category = await tx.category.findUnique({
      where: { id: input.categoryId },
      include: { parent: true },
    });
    if (
      !category?.active ||
      !category.parent?.active ||
      category.parent.slug !== 'livres' ||
      !bookCategories.some((c) => c.id === category.id && c.slug === category.slug && c.active)
    )
      throw new AdminConflict('Catégorie indisponible');
    if (bookCategories.some((c) => c.slug === input.slug))
      throw new AdminConflict('Ce slug est réservé aux catégories');
    if (input.status === 'PUBLISHED' && input.priceCents < 1)
      throw new AdminConflict('Prix obligatoire pour publication');
    const data = {
      titleFr: input.titleFr,
      titleAr: input.titleAr,
      descriptionFr: input.descriptionFr || null,
      descriptionAr: input.descriptionAr || null,
      categoryId: category.id,
      category: category.slug,
      priceCents: input.priceCents,
      lowStockThreshold: input.lowStockThreshold,
      adminStatus: input.status,
      active: input.status === 'PUBLISHED',
    };
    if (input.id) {
      const prior = await tx.product.findUniqueOrThrow({ where: { id: input.id } });
      if (prior.slug !== input.slug) throw new AdminConflict('Le lien du livre est immuable.');
      const result = await tx.product.updateMany({
        where: { id: prior.id, version: input.version },
        data: { ...data, version: { increment: 1 } },
      });
      if (result.count !== 1)
        throw new AdminConflict('Livre modifié depuis votre ouverture. Actualisez.');
      await audit(
        tx,
        actor,
        'product.update',
        'product',
        prior.id,
        {
          titleFr: prior.titleFr,
          titleAr: prior.titleAr,
          descriptionFr: prior.descriptionFr,
          descriptionAr: prior.descriptionAr,
          lowStockThreshold: prior.lowStockThreshold,
          adminStatus: prior.adminStatus,
          priceCents: prior.priceCents,
          active: prior.active,
          category: prior.category,
          categoryId: prior.categoryId,
        },
        data,
        'Modification de fiche',
      );
      return prior.id;
    }
    if (await tx.catalogDraft.findUnique({ where: { slug: input.slug } }))
      throw new AdminConflict('Un ouvrage en préparation utilise déjà ce lien');
    const p = await tx.product.create({
      data: {
        ...data,
        id: randomUUID(),
        slug: input.slug,
        imagePath: '/images/book-fallback.svg',
        stockOnHand: 0,
        active: false,
        adminStatus: 'DRAFT',
      },
    });
    await audit(
      tx,
      actor,
      'product.create',
      'product',
      p.id,
      undefined,
      { ...data, slug: p.slug, adminStatus: 'DRAFT', active: false, stockOnHand: 0 },
      'Création en brouillon, stock initial à enregistrer dans Stocks',
    );
    return p.id;
  });
}
export async function adoptCatalogDraft(actor: OwnerActor, draftId: string) {
  return commerceTransaction(async (tx) => {
    const draft = await tx.catalogDraft.findUniqueOrThrow({ where: { id: draftId } });
    const existing = await tx.product.findUnique({ where: { id: draft.id } });
    if (existing) return existing.id;
    if (draft.status !== 'DRAFT') throw new AdminConflict('Brouillon déjà traité');
    const category = await tx.category.findUniqueOrThrow({ where: { id: draft.categoryId } });
    const p = await tx.product.create({
      data: {
        id: draft.id,
        slug: draft.slug,
        titleFr: draft.titleFr,
        titleAr: draft.titleAr,
        category: category.slug,
        categoryId: category.id,
        imagePath: draft.imagePath,
        priceCents: draft.priceCents ?? 0,
        stockOnHand: 0,
        active: false,
        adminStatus: 'DRAFT',
      },
    });
    // Preserve the original row and any proposed quantity; never silently introduce stock.
    await tx.catalogDraft.update({ where: { id: draft.id }, data: { status: 'MANAGED' } });
    await audit(
      tx,
      actor,
      'product.adopt-draft',
      'product',
      p.id,
      { draftStatus: draft.status },
      { status: 'DRAFT', stockOnHand: 0 },
      'Brouillon historique conservé ; quantité à confirmer via Stocks',
    );
    return p.id;
  });
}
