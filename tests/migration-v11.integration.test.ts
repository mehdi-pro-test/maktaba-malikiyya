import { beforeAll, afterAll, it, expect } from 'vitest';
import { Client } from 'pg';
import { readFile } from 'node:fs/promises';
let client: Client;
let before: unknown[];
beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test'))
    throw new Error('Base de test obligatoire');
  client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query('CREATE SCHEMA migration_v11_test');
  await client.query('SET search_path TO migration_v11_test');
  await client.query(
    await readFile('prisma/migrations/202610250001_initial/migration.sql', 'utf8'),
  );
  await client.query(
    `INSERT INTO "Product" (id,slug,"titleFr","titleAr",category,"imagePath","priceCents","stockOnHand","updatedAt") VALUES ('moshaf-coran','moshaf-coran','Coran','قرآن','coran','/images/coran.svg',1000,7,now()), ('sahih-al-bukhari','sahih-al-bukhari','Bukhari','البخاري','hadith','/images/bukhari.svg',10000,3,now())`,
  );
  await client.query(
    `INSERT INTO "Order" (id,reference,"tokenHash",email,recipient,address,"postalCode",city,"countryCode","subtotalCents","shippingCents","totalCents","updatedAt") VALUES ('v1-order','V1-FIXTURE','fixturehash','fixture@example.com','Client fictif','Rue fictive','75001','Paris','FR',1000,400,1400,now())`,
  );
  await client.query(
    `INSERT INTO "OrderItem" (id,"orderId","productId","titleFr","titleAr","unitPriceCents",quantity) VALUES ('v1-line','v1-order','moshaf-coran','Coran','قرآن',1000,1)`,
  );
  await client.query(
    `INSERT INTO "StockReservation" (id,"orderId","productId",quantity,"expiresAt") VALUES ('v1-reservation','v1-order','moshaf-coran',1,now()+interval '30 minutes')`,
  );
  before = await snapshot();
  await client.query(
    await readFile('prisma/migrations/202610250002_categories_drafts/migration.sql', 'utf8'),
  );
});
async function snapshot() {
  const rows = [];
  for (const sql of [
    'SELECT id,slug,"titleFr","titleAr",category,"imagePath","priceCents","stockOnHand",active,"updatedAt" FROM "Product" ORDER BY id',
    'SELECT * FROM "Order" ORDER BY id',
    'SELECT * FROM "OrderItem" ORDER BY id',
    'SELECT * FROM "StockReservation" ORDER BY id',
    'SELECT * FROM "WebhookEvent" ORDER BY "eventId"',
    'SELECT * FROM "EmailDelivery" ORDER BY id',
  ])
    rows.push((await client.query(sql)).rows);
  return rows;
}

afterAll(async () => {
  if (client) {
    await client.query('SET search_path TO public');
    await client.query('DROP SCHEMA IF EXISTS migration_v11_test CASCADE');
    await client.end();
  }
});
it('conserve intégralement prix, stocks, commandes, lignes et réservations V1', async () =>
  expect(await snapshot()).toEqual(before));
it('backfill les relations de catégories sans modifier les identifiants', async () =>
  expect((await client.query('SELECT id,"categoryId" FROM "Product" ORDER BY id')).rows).toEqual([
    { id: 'moshaf-coran', categoryId: 'coran' },
    { id: 'sahih-al-bukhari', categoryId: 'hadith' },
  ]));
it('les requêtes V1 continuent de voir exactement deux produits achetables aux prix V1', async () => {
  const result = await client.query(
    'SELECT id,"priceCents" FROM "Product" WHERE active=true ORDER BY "priceCents"',
  );
  expect(result.rows).toEqual([
    { id: 'moshaf-coran', priceCents: 1000 },
    { id: 'sahih-al-bukhari', priceCents: 10000 },
  ]);
});
