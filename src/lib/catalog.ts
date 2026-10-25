import { db } from './db';
export async function catalog(category?: string) {
  const products = await db.product.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    orderBy: { priceCents: 'asc' },
  });
  const reservations = await db.stockReservation.groupBy({
    by: ['productId'],
    where: { status: 'ACTIVE' },
    _sum: { quantity: true },
  });
  return products.map((p) => ({
    ...p,
    available: Math.max(
      0,
      p.stockOnHand - (reservations.find((r) => r.productId === p.id)?._sum.quantity ?? 0),
    ),
  }));
}
