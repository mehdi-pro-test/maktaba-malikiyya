import { createLegacyOrder } from './legacy-order-create';
import { adminDataEnabled } from './admin/config';
import { legacyProductSelect, legacyOrderSelect } from './legacy-select';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { db } from './db';
import { checkoutSchema, shipping } from './rules';
import type Stripe from 'stripe';
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
// One transaction-level lock shared by ALL inventory transitions. Simple and safe for a small shop.
export async function commerceTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
  return db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(741825)`;
      return fn(tx);
    },
    { maxWait: 15000, timeout: 20000 },
  );
}
export async function reserveOrder(input: unknown) {
  const data = checkoutSchema.parse(input);
  const token = randomBytes(32).toString('hex');
  const order = await commerceTransaction(async (tx) => {
    if (
      (await tx.order.count({
        where: {
          email: data.email,
          status: 'PENDING_PAYMENT',
          createdAt: { gte: new Date(Date.now() - 3600000) },
        },
      })) >= 3
    )
      throw new Error('Vous avez déjà plusieurs commandes en attente. Réessayez plus tard.');
    const quantities = new Map<string, number>();
    for (const item of data.items)
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    const items = [];
    let subtotal = 0;
    for (const [id, quantity] of [...quantities].sort()) {
      const product = await tx.product.findUnique({ where: { id }, select: legacyProductSelect });
      if (!product?.active || quantity > 10) throw new Error('Produit ou quantité indisponible.');
      const reserved = await tx.stockReservation.aggregate({
        where: { productId: id, status: 'ACTIVE' },
        _sum: { quantity: true },
      });
      if (product.stockOnHand - (reserved._sum.quantity ?? 0) < quantity)
        throw new Error(`Stock insuffisant pour ${product.titleFr}.`);
      subtotal += product.priceCents * quantity;
      items.push({
        productId: id,
        titleFr: product.titleFr,
        titleAr: product.titleAr,
        unitPriceCents: product.priceCents,
        quantity,
      });
    }
    const delivery = shipping(subtotal, data.countryCode, data.postalCode);
    const creation = {
      reference: `MM-${randomUUID().slice(0, 8).toUpperCase()}`,
      tokenHash: hashToken(token),
      email: data.email,
      recipient: data.recipient,
      address: data.address,
      addressExtra: data.addressExtra,
      postalCode: data.postalCode,
      city: data.city,
      countryCode: data.countryCode,
      subtotalCents: subtotal,
      shippingCents: delivery,
      totalCents: subtotal + delivery,
      items: { create: items },
      reservations: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          expiresAt: new Date(Date.now() + 31 * 60000),
        })),
      },
    };
    if (!adminDataEnabled()) return createLegacyOrder(tx, creation);
    return tx.order.create({ data: creation, select: { ...legacyOrderSelect, items: true } });
  });
  return { order, token };
}
export async function applySession(
  eventId: string,
  eventType: string,
  session: Stripe.Checkout.Session,
) {
  if (session.livemode) throw new Error('Événement live refusé.');
  return commerceTransaction(async (tx) => {
    if (await tx.webhookEvent.findUnique({ where: { eventId } })) return 'duplicate';
    const order = await tx.order.findUnique({
      where: { id: session.metadata?.orderId ?? '' },
      select: { ...legacyOrderSelect, reservations: true },
    });
    if (!order) throw new Error('Commande inconnue.');
    if (order.stripeSessionId && order.stripeSessionId !== session.id)
      throw new Error('Session incohérente.');
    // Supports webhook arriving before checkout response has been persisted.
    if (!order.stripeSessionId)
      await tx.order.update({
        select: { id: true },
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });
    const paid =
      eventType === 'checkout.session.completed' &&
      session.payment_status === 'paid' &&
      session.status === 'complete';
    const expired = eventType === 'checkout.session.expired' && session.status === 'expired';
    if (paid && order.status !== 'PAID') {
      const valid =
        order.status === 'PENDING_PAYMENT' &&
        session.amount_total === order.totalCents &&
        session.currency === 'eur' &&
        order.reservations.length > 0 &&
        order.reservations.every((r) => r.status === 'ACTIVE');
      if (!valid)
        await tx.order.update({
          select: { id: true },
          where: { id: order.id },
          data: { status: 'REQUIRES_REVIEW' },
        });
      else {
        for (const r of order.reservations) {
          const updated = await tx.product.updateMany({
            where: { id: r.productId, stockOnHand: { gte: r.quantity } },
            data: { stockOnHand: { decrement: r.quantity } },
          });
          if (updated.count !== 1) throw new Error('Incohérence de stock.');
        }
        await tx.stockReservation.updateMany({
          where: { orderId: order.id, status: 'ACTIVE' },
          data: { status: 'CONSUMED' },
        });
        await tx.order.update({
          select: { id: true },
          where: { id: order.id },
          data: { status: 'PAID' },
        });
        await tx.emailDelivery.upsert({
          where: { orderId: order.id },
          create: { orderId: order.id },
          update: {},
        });
      }
    } else if (expired && order.status === 'PENDING_PAYMENT') {
      await tx.stockReservation.updateMany({
        where: { orderId: order.id, status: 'ACTIVE' },
        data: { status: 'RELEASED' },
      });
      await tx.order.update({
        select: { id: true },
        where: { id: order.id },
        data: { status: 'EXPIRED' },
      });
    }
    await tx.webhookEvent.create({ data: { eventId, type: eventType } });
    return 'processed';
  });
}
