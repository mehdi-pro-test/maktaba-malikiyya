import { db } from './db';
import { coverPath } from './media';
export async function purchasableCatalog(category?: string) {
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
    imagePath: coverPath(p.id, p.imagePath),
    available: Math.max(
      0,
      p.stockOnHand - (reservations.find((r) => r.productId === p.id)?._sum.quantity ?? 0),
    ),
  }));
}
export async function catalog(category?: string) {
  const [products, drafts] = await Promise.all([
    purchasableCatalog(category),
    db.catalogDraft.findMany({
      where: {
        status: 'DRAFT',
        category: { active: true, parent: { slug: 'livres', active: true } },
        ...(category ? { categoryId: category } : {}),
      },
      orderBy: { titleFr: 'asc' },
    }),
  ]);
  return [
    ...products.map((p) => ({ ...p, status: 'ACTIVE' as const })),
    ...drafts.map((p) => ({
      ...p,
      category: p.categoryId,
      status: 'DRAFT' as const,
      priceCents: null,
      stockOnHand: null,
      available: 0,
      imagePath: coverPath(p.id, p.imagePath),
    })),
  ];
}
export type CatalogBook = Awaited<ReturnType<typeof catalog>>[number];
