import { beforeEach, afterAll, it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const store = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock('@vercel/blob', () => ({ put: store.put }));
import sharp from 'sharp';
import { db } from '../src/lib/db';
import { uploadCover, selectCover } from '../src/lib/admin/covers';
import { purchasableCatalog } from '../src/lib/catalog';
const actor = { id: 'owner-cover-fixture' };
async function image() {
  const bytes = await sharp({
    create: { width: 40, height: 60, channels: 3, background: '#183e32' },
  })
    .png()
    .toBuffer();
  return new File([new Uint8Array(bytes)], 'fixture.png', { type: 'image/png' });
}
beforeEach(async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test')) throw new Error('Base locale requise');
  await db.$executeRawUnsafe(
    'TRUNCATE "InventoryMovement","OrderFulfillmentEvent","ProductCoverAsset","AdminAuditEvent","EmailDelivery","StockReservation","OrderItem","Order","Product" CASCADE',
  );
  await db.product.create({
    data: {
      id: 'cover-fixture',
      slug: 'cover-fixture',
      titleFr: 'Livre fixture',
      titleAr: 'كتاب تجريبي',
      category: 'fiqh',
      imagePath: '/images/book-fallback.svg',
      priceCents: 1500,
      stockOnHand: 15,
    },
  });
  vi.stubEnv('ADMIN_DATA_ENABLED', 'true');
  vi.stubEnv('ADMIN_BLOB_HOST', 'fixture.public.blob.vercel-storage.com');
  vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'offline-contract-fixture-not-a-credential');
  store.put.mockReset();
  store.put.mockImplementation(async (key: string) => ({
    url: 'https://fixture.public.blob.vercel-storage.com/' + key,
  }));
});
afterAll(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "InventoryMovement","OrderFulfillmentEvent","ProductCoverAsset","AdminAuditEvent","EmailDelivery","StockReservation","OrderItem","Order","Product" CASCADE',
  );
  vi.unstubAllEnvs();
});
it('contrat hors réseau : réencode, enregistre la version et donne priorité à la couverture admin', async () => {
  const first = await uploadCover(actor, {
    productId: 'cover-fixture',
    version: 0,
    alt: 'Couverture fixture',
    rights: true,
    file: await image(),
  });
  const asset = await db.productCoverAsset.findUniqueOrThrow({ where: { id: first } });
  expect(asset.mime).toBe('image/webp');
  expect(asset.usageRightsAttested).toBe(true);
  expect(store.put).toHaveBeenCalledTimes(1);
  expect((await purchasableCatalog()).find((p) => p.id === 'cover-fixture')?.imagePath).toBe(
    asset.url,
  );
  const second = await uploadCover(actor, {
    productId: 'cover-fixture',
    version: 1,
    alt: 'Autre couverture fixture',
    rights: true,
    file: await image(),
  });
  expect(second).not.toBe(first);
  expect(await db.productCoverAsset.count()).toBe(2);
  await selectCover(actor, 'cover-fixture', first, 2);
  expect(
    (await db.product.findUniqueOrThrow({ where: { id: 'cover-fixture' } })).coverAssetId,
  ).toBe(first);
  expect((await db.product.findUniqueOrThrow({ where: { id: 'cover-fixture' } })).stockOnHand).toBe(
    15,
  );
});
it('configuration absente, droits non déclarés et conflit ne publient aucune nouvelle couverture', async () => {
  vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
  await expect(
    uploadCover(actor, {
      productId: 'cover-fixture',
      version: 0,
      alt: 'Fixture',
      rights: true,
      file: await image(),
    }),
  ).rejects.toThrow(/non configuré/);
  expect(store.put).not.toHaveBeenCalled();
  vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'offline-contract-fixture-not-a-credential');
  await expect(
    uploadCover(actor, {
      productId: 'cover-fixture',
      version: 0,
      alt: 'Fixture',
      rights: false,
      file: await image(),
    }),
  ).rejects.toThrow(/Droits/);
  store.put.mockImplementation(async (key: string) => {
    await db.product.update({
      where: { id: 'cover-fixture' },
      data: { version: { increment: 1 } },
    });
    return { url: 'https://fixture.public.blob.vercel-storage.com/' + key };
  });
  await expect(
    uploadCover(actor, {
      productId: 'cover-fixture',
      version: 0,
      alt: 'Fixture',
      rights: true,
      file: await image(),
    }),
  ).rejects.toThrow(/modifié/);
  expect(await db.productCoverAsset.count()).toBe(0);
  expect(
    (await db.product.findUniqueOrThrow({ where: { id: 'cover-fixture' } })).coverAssetId,
  ).toBeNull();
});
