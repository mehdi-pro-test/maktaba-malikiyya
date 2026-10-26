import { legacyProductSelect } from './legacy-select';
import { adminDataEnabled } from './admin/config';
import { db } from './db';
import { coverPath, allowedCoverUrl } from './media';
export async function purchasableCatalog(category?: string) {
  const products = await db.product.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    select: legacyProductSelect,
    orderBy: { priceCents: 'asc' },
  });
  const reservations = await db.stockReservation.groupBy({
    by: ['productId'],
    where: { status: 'ACTIVE' },
    _sum: { quantity: true },
  });
  const managed = adminDataEnabled()
    ? await db.product.findMany({
        where: { id: { in: products.map((p) => p.id) } },
        select: {
          id: true,
          descriptionFr: true,
          descriptionAr: true,
          coverAsset: { select: { url: true, alt: true, usageRightsAttested: true } },
        },
      })
    : [];
  return products.map((p) => ({
    ...p,
    imageAlt:
      managed.find((m) => m.id === p.id)?.coverAsset?.usageRightsAttested &&
      allowedCoverUrl(managed.find((m) => m.id === p.id)!.coverAsset!.url)
        ? managed.find((m) => m.id === p.id)!.coverAsset!.alt
        : null,
    descriptionFr: managed.find((m) => m.id === p.id)?.descriptionFr ?? null,
    descriptionAr: managed.find((m) => m.id === p.id)?.descriptionAr ?? null,
    imagePath: coverPath(p.id, p.imagePath, managed.find((m) => m.id === p.id)?.coverAsset),
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
      imageAlt: null,
      descriptionFr: null,
      descriptionAr: null,
      priceCents: null,
      stockOnHand: null,
      available: 0,
      imagePath: coverPath(p.id, p.imagePath),
    })),
  ];
}
export type CatalogBook = Awaited<ReturnType<typeof catalog>>[number];
