import { beforeAll, afterAll, it, expect } from 'vitest';
import { db } from '../src/lib/db';
import { catalog } from '../src/lib/catalog';
import { reserveOrder } from '../src/lib/orders';
import { visibleCategories } from '../src/data/categories';
beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test'))
    throw new Error('Base de test obligatoire');
  await db.catalogDraft.upsert({
    where: { id: 'fixture-draft' },
    create: {
      id: 'fixture-draft',
      slug: 'fixture-draft',
      titleFr: 'Brouillon test',
      titleAr: 'مسودة',
      categoryId: 'fiqh',
      imagePath: '/images/akhdari.svg',
    },
    update: {},
  });
  await db.product.upsert({
    where: { id: 'moshaf-coran' },
    create: {
      id: 'moshaf-coran',
      slug: 'moshaf-coran',
      titleFr: 'Coran (Moshaf)',
      titleAr: 'مصحف القرآن الكريم',
      category: 'coran',
      categoryId: 'coran',
      imagePath: '/images/coran.svg',
      priceCents: 1000,
      stockOnHand: 10,
    },
    update: {},
  });
});
afterAll(async () => {
  await db.catalogDraft.deleteMany({ where: { id: 'fixture-draft' } });
  await db.$disconnect();
});
it('les trois disciplines sont enfants de Livres en base', async () => {
  const parent = await db.category.findUniqueOrThrow({
    where: { slug: 'livres' },
    include: { children: { orderBy: { sortOrder: 'asc' } } },
  });
  expect(parent.children.map((c) => c.slug)).toEqual(visibleCategories().map((c) => c.slug));
});
it('un brouillon conserve prix et stock inconnus', async () => {
  const result = await catalog('fiqh');
  expect(result.find((p) => p.id === 'fixture-draft')).toMatchObject({
    slug: 'fixture-draft',
    status: 'DRAFT',
    priceCents: null,
    stockOnHand: null,
    available: 0,
  });
});
it('un brouillon forcé dans le checkout ne crée ni commande ni réservation', async () => {
  const before = [await db.order.count(), await db.stockReservation.count()];
  await expect(
    reserveOrder({
      items: [{ productId: 'fixture-draft', quantity: 1 }],
      email: 'fixture@example.com',
      recipient: 'Client fictif',
      address: '1 rue fictive',
      postalCode: '75001',
      city: 'Paris',
      countryCode: 'FR',
    }),
  ).rejects.toThrow('indisponible');
  expect([await db.order.count(), await db.stockReservation.count()]).toEqual(before);
});
it('la contrainte SQL refuse un faux prix sur le brouillon', async () => {
  await expect(
    db.catalogDraft.update({ where: { id: 'fixture-draft' }, data: { priceCents: 0 } }),
  ).rejects.toThrow();
  expect(
    (await db.catalogDraft.findUniqueOrThrow({ where: { id: 'fixture-draft' } })).priceCents,
  ).toBeNull();
});
