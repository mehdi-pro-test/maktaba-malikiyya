import { parisMidnight, nextDay } from './http';
import 'server-only';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '../db';
import { requireOwnerPage } from './session';
import { library, bookQuestions } from '../quiz-v12-data';
import { coverStorageReady } from './covers';
import { quizDbEnabled } from './config';
export type Search = Record<string, string | string[] | undefined>;
export const queryText = (s: Search, key: string) =>
  typeof s[key] === 'string' ? (s[key] as string) : '';
export function orderFilters(search: Search): Prisma.OrderWhereInput {
  const q = queryText(search, 'q').slice(0, 200),
    payment = queryText(search, 'paiement'),
    shipping = queryText(search, 'livraison'),
    country = queryText(search, 'pays').trim().toUpperCase();
  const start = z.iso.date().safeParse(queryText(search, 'debut')),
    end = z.iso.date().safeParse(queryText(search, 'fin'));
  return {
    ...(q
      ? {
          OR: [
            { reference: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(/^[A-Z]{2}$/.test(country) ? { countryCode: country } : {}),
    ...(['PAID', 'PENDING_PAYMENT', 'EXPIRED', 'REQUIRES_REVIEW'].includes(payment)
      ? { status: payment }
      : {}),
    ...(['UNFULFILLED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(shipping)
      ? { fulfillmentStatus: shipping }
      : {}),
    ...(start.success || end.success
      ? {
          createdAt: {
            ...(start.success ? { gte: parisMidnight(start.data) } : {}),
            ...(end.success ? { lt: parisMidnight(nextDay(end.data)) } : {}),
          },
        }
      : {}),
  };
}
export async function dashboard() {
  await requireOwnerPage();
  const [paid, prepare, pending, review, revenue, products, reservations, recent, activity] =
    await Promise.all([
      db.order.count({ where: { status: 'PAID' } }),
      db.order.count({
        where: { status: 'PAID', fulfillmentStatus: { in: ['UNFULFILLED', 'PREPARING'] } },
      }),
      db.order.count({ where: { status: 'PENDING_PAYMENT' } }),
      db.order.count({ where: { status: 'REQUIRES_REVIEW' } }),
      db.order.aggregate({ where: { status: 'PAID' }, _sum: { totalCents: true } }),
      db.product.findMany({ where: { active: true } }),
      db.stockReservation.groupBy({
        by: ['productId'],
        where: { status: 'ACTIVE' },
        _sum: { quantity: true },
      }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reference: true,
          status: true,
          fulfillmentStatus: true,
          totalCents: true,
          createdAt: true,
        },
      }),
      db.adminAuditEvent.findMany({ take: 8, orderBy: { occurredAt: 'desc' } }),
    ]);
  const low = products
    .map((p) => ({
      ...p,
      reserved: reservations.find((r) => r.productId === p.id)?._sum.quantity ?? 0,
    }))
    .map((p) => ({ ...p, available: Math.max(0, p.stockOnHand - p.reserved) }))
    .filter((p) => p.available <= p.lowStockThreshold);
  return {
    paid,
    prepare,
    pending,
    review,
    revenue: revenue._sum.totalCents ?? 0,
    low,
    recent,
    activity,
  };
}
export async function orders(search: Search) {
  await requireOwnerPage();
  const page = Math.max(1, Math.min(10000, Math.floor(Number(queryText(search, 'page'))) || 1)),
    where = orderFilters(search);
  const [rows, count] = await Promise.all([
    db.order.findMany({
      where,
      take: 25,
      skip: (page - 1) * 25,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        email: true,
        countryCode: true,
        carrier: true,
        trackingNumber: true,
        status: true,
        fulfillmentStatus: true,
        totalCents: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
  ]);
  return { rows, count, page };
}
export async function orderDetail(id: string) {
  await requireOwnerPage();
  return db.order.findUnique({
    where: { id },
    include: {
      items: true,
      fulfillmentEvents: { orderBy: { createdAt: 'desc' } },
      emailDelivery: true,
    },
  });
}
export async function stockData() {
  await requireOwnerPage();
  const [products, reservations, movements] = await Promise.all([
    db.product.findMany({ orderBy: { titleFr: 'asc' } }),
    db.stockReservation.groupBy({
      by: ['productId'],
      where: { status: 'ACTIVE' },
      _sum: { quantity: true },
    }),
    db.inventoryMovement.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { titleFr: true } } },
    }),
  ]);
  return {
    products: products
      .map((p) => ({
        ...p,
        reserved: reservations.find((r) => r.productId === p.id)?._sum.quantity ?? 0,
      }))
      .map((p) => ({ ...p, available: Math.max(0, p.stockOnHand - p.reserved) })),
    movements,
  };
}
function productVisibility<T extends { active: boolean; adminStatus: string }>(product: T): T {
  return {
    ...product,
    adminStatus:
      !product.active && product.adminStatus === 'PUBLISHED' ? 'ARCHIVED' : product.adminStatus,
  };
}
export async function catalogData() {
  await requireOwnerPage();
  return {
    products: (await db.product.findMany({ orderBy: { titleFr: 'asc' } })).map(productVisibility),
    drafts: await db.catalogDraft.findMany({
      where: { status: 'DRAFT' },
      orderBy: { titleFr: 'asc' },
    }),
  };
}
export async function productDetail(id?: string) {
  await requireOwnerPage();
  const product = id
    ? await db.product.findUnique({
        where: { id },
        include: { coverAssets: { orderBy: { createdAt: 'desc' } } },
      })
    : null;
  return {
    product: product ? productVisibility(product) : null,
    categories: await db.category.findMany({
      where: { active: true, parent: { slug: 'livres', active: true } },
      orderBy: { sortOrder: 'asc' },
    }),
    historicalDraft: id ? await db.catalogDraft.findUnique({ where: { id } }) : null,
    storageReady: coverStorageReady(),
  };
}
export async function quizData() {
  await requireOwnerPage();
  return {
    books: library,
    baseline: library.flatMap((b) => bookQuestions(b.level, b.id)),
    records: await db.quizQuestionRecord.findMany({
      include: { activeRevision: true, revisions: { orderBy: { revision: 'desc' } } },
    }),
    enabled: quizDbEnabled(),
  };
}
export async function activityData() {
  await requireOwnerPage();
  return db.adminAuditEvent.findMany({ take: 100, orderBy: { occurredAt: 'desc' } });
}
