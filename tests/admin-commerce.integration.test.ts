import { beforeEach, afterAll, it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { db } from '../src/lib/db';
import { adjustStock, fulfillOrder, saveProduct } from '../src/lib/admin/mutations';
import { reserveOrder, applySession } from '../src/lib/orders';
import type Stripe from 'stripe';
const actor = { id: 'owner-domain-fixture' };
const orderInput = {
  items: [{ productId: 'fixture-admin-book', quantity: 2 }],
  email: 'fixture@example.invalid',
  recipient: 'Client fixture',
  address: 'Adresse fixture',
  postalCode: '75001',
  city: 'Paris',
  countryCode: 'FR',
};
const session = (order: { id: string; totalCents: number }) =>
  ({
    id: 'cs_test_' + order.id,
    object: 'checkout.session',
    livemode: false,
    metadata: { orderId: order.id },
    payment_status: 'paid',
    status: 'complete',
    amount_total: order.totalCents,
    currency: 'eur',
  }) as unknown as Stripe.Checkout.Session;
const stock = (quantity = 3) => ({
  productId: 'fixture-admin-book',
  mode: 'ADD' as const,
  quantity,
  expectedOnHand: 15,
  reason: 'Réapprovisionnement de recette',
  idempotencyKey: crypto.randomUUID(),
});
beforeEach(async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test'))
    throw new Error('Base de test obligatoire');
  await db.$executeRawUnsafe(
    'TRUNCATE "InventoryMovement","OrderFulfillmentEvent","AdminAuditEvent","ProductCoverAsset","EmailDelivery","WebhookEvent","StockReservation","OrderItem","Order","Product" CASCADE',
  );
  await db.category.upsert({
    where: { id: 'livres' },
    create: { id: 'livres', slug: 'livres', nameFr: 'Livres' },
    update: { active: true },
  });
  await db.category.upsert({
    where: { id: 'fiqh' },
    create: { id: 'fiqh', slug: 'fiqh', nameFr: 'Fiqh', parentId: 'livres' },
    update: { active: true, parentId: 'livres' },
  });
  await db.product.create({
    data: {
      id: 'fixture-admin-book',
      slug: 'fixture-admin-book',
      titleFr: 'Livre fixture',
      titleAr: 'كتاب تجريبي',
      category: 'fiqh',
      categoryId: 'fiqh',
      imagePath: '/images/book-fallback.svg',
      priceCents: 1500,
      stockOnHand: 15,
    },
  });
  vi.stubEnv('SHIPPING_ALLOWED_COUNTRIES', 'FR,BE');
});
afterAll(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "InventoryMovement","OrderFulfillmentEvent","AdminAuditEvent","ProductCoverAsset","EmailDelivery","WebhookEvent","StockReservation","OrderItem","Order","Product" CASCADE',
  );
  vi.unstubAllEnvs();
});
it('affiche physique 15, réservé 4, disponible 11 et refuse de descendre sous les réservations', async () => {
  await reserveOrder({ ...orderInput, items: [{ productId: 'fixture-admin-book', quantity: 4 }] });
  const p = await db.product.findUniqueOrThrow({ where: { id: 'fixture-admin-book' } }),
    r = await db.stockReservation.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { quantity: true },
    });
  expect(p.stockOnHand).toBe(15);
  expect(r._sum.quantity).toBe(4);
  expect(p.stockOnHand - r._sum.quantity!).toBe(11);
  await expect(adjustStock(actor, { ...stock(), mode: 'COUNT', quantity: 3 })).rejects.toThrow(
    /réservations/,
  );
  expect(await db.inventoryMovement.count()).toBe(0);
});
it('une entrée envoyée deux fois ne double ni stock ni journal et lie la clé à son contenu', async () => {
  const input = stock();
  await Promise.all([adjustStock(actor, input), adjustStock(actor, input)]);
  expect((await db.product.findUniqueOrThrow({ where: { id: input.productId } })).stockOnHand).toBe(
    18,
  );
  expect(await db.inventoryMovement.count()).toBe(1);
  expect(await db.adminAuditEvent.count()).toBe(1);
  await expect(adjustStock(actor, { ...input, quantity: 9 })).rejects.toThrow(/Clé/);
});
it('paiement et entrée simultanés : stock 15 - 2 + 3, sans double débit du webhook', async () => {
  const { order } = await reserveOrder(orderInput),
    input = stock();
  await Promise.all([
    applySession('evt_test_concurrent', 'checkout.session.completed', session(order)),
    adjustStock(actor, input),
  ]);
  await applySession('evt_test_concurrent', 'checkout.session.completed', session(order));
  expect((await db.product.findUniqueOrThrow({ where: { id: input.productId } })).stockOnHand).toBe(
    16,
  );
  expect(await db.stockReservation.count({ where: { status: 'CONSUMED' } })).toBe(1);
  expect(await db.inventoryMovement.count()).toBe(1);
});
it('un comptage ancien ne remplace pas une vente confirmée', async () => {
  const { order } = await reserveOrder(orderInput);
  await applySession('evt_count', 'checkout.session.completed', session(order));
  await expect(adjustStock(actor, { ...stock(), mode: 'COUNT', quantity: 20 })).rejects.toThrow(
    /comptage/,
  );
  expect(
    (await db.product.findUniqueOrThrow({ where: { id: 'fixture-admin-book' } })).stockOnHand,
  ).toBe(13);
});
it('interdit toute expédition non payée et ne réécrit jamais le statut Stripe', async () => {
  const { order } = await reserveOrder(orderInput);
  const step = {
    orderId: order.id,
    version: 0,
    status: 'PREPARING',
    carrier: 'Transport fixture',
    trackingNumber: 'REF-FIXTURE',
    note: 'Note privée',
    reason: 'Préparation de recette',
    idempotencyKey: crypto.randomUUID(),
  };
  await expect(fulfillOrder(actor, step)).rejects.toThrow(/paiement/);
  await applySession('evt_fulfill', 'checkout.session.completed', session(order));
  await Promise.all([fulfillOrder(actor, step), fulfillOrder(actor, step)]);
  expect(await db.orderFulfillmentEvent.count()).toBe(1);
  await fulfillOrder(actor, {
    ...step,
    status: 'SHIPPED',
    version: 1,
    idempotencyKey: crypto.randomUUID(),
  });
  await fulfillOrder(actor, {
    ...step,
    status: 'DELIVERED',
    version: 2,
    idempotencyKey: crypto.randomUUID(),
  });
  const done = await db.order.findUniqueOrThrow({ where: { id: order.id } });
  expect(done.status).toBe('PAID');
  expect(done.fulfillmentStatus).toBe('DELIVERED');
  expect(done.shippedAt).toBeTruthy();
  expect(done.deliveredAt).toBeTruthy();
  await expect(fulfillOrder(actor, { ...step, status: 'PAID' })).rejects.toThrow();
  const audit = JSON.stringify(await db.adminAuditEvent.findMany());
  expect(audit).not.toContain('Note privée');
  expect(audit).not.toContain('REF-FIXTURE');
});
it('catalogue versionné : ancien titre/prix de commande intacts, stock hors formulaire et slug immuable', async () => {
  const { order } = await reserveOrder(orderInput),
    old = await db.orderItem.findFirstOrThrow({ where: { orderId: order.id } });
  const input = {
    id: 'fixture-admin-book',
    version: 0,
    slug: 'fixture-admin-book',
    titleFr: 'Nouveau titre fixture',
    titleAr: 'كتاب تجريبي',
    descriptionFr: 'Description enregistrée',
    descriptionAr: '',
    categoryId: 'fiqh',
    priceCents: 1900,
    lowStockThreshold: 4,
    status: 'PUBLISHED',
  };
  await saveProduct(actor, input);
  const item = await db.orderItem.findUniqueOrThrow({ where: { id: old.id } });
  expect(item.titleFr).toBe('Livre fixture');
  expect(item.unitPriceCents).toBe(1500);
  await expect(saveProduct(actor, input)).rejects.toThrow(/modifié/);
  await expect(saveProduct(actor, { ...input, version: 1, slug: 'autre-lien' })).rejects.toThrow(
    /immuable/,
  );
  await expect(saveProduct(actor, { ...input, version: 1, stockOnHand: 500 })).rejects.toThrow();
  await expect(saveProduct(actor, { ...input, version: undefined })).rejects.toThrow();
  await saveProduct(actor, { ...input, version: 1, status: 'ARCHIVED' });
  expect((await db.product.findUniqueOrThrow({ where: { id: input.id } })).active).toBe(false);
  expect(await db.orderItem.count({ where: { productId: input.id } })).toBe(1);
});
it('crée en brouillon à zéro et impose une catégorie cohérente', async () => {
  const input = {
    slug: 'nouveau-fixture',
    titleFr: 'Nouveau livre',
    titleAr: 'كتاب تجريبي',
    descriptionFr: '',
    descriptionAr: '',
    categoryId: 'fiqh',
    priceCents: 1200,
    lowStockThreshold: 3,
    status: 'PUBLISHED',
  };
  const id = await saveProduct(actor, input),
    p = await db.product.findUniqueOrThrow({ where: { id } });
  expect(p.active).toBe(false);
  expect(p.adminStatus).toBe('DRAFT');
  expect(p.stockOnHand).toBe(0);
  expect(p.category).toBe('fiqh');
  await expect(saveProduct(actor, { ...input, slug: 'fiqh' })).rejects.toThrow(/réservé/);
});
it('les journaux stock et audit sont append-only en SQL', async () => {
  const movement = await adjustStock(actor, stock());
  await expect(
    db.inventoryMovement.update({ where: { id: movement.id }, data: { reason: 'Altération' } }),
  ).rejects.toThrow(/Append-only/);
  const event = await db.adminAuditEvent.findFirstOrThrow();
  await expect(db.adminAuditEvent.delete({ where: { id: event.id } })).rejects.toThrow(
    /Append-only/,
  );
});
