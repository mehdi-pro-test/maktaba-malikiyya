import { it, expect } from 'vitest';
import { Client } from 'pg';
import { readFile } from 'node:fs/promises';
it('migration V1.4 additive : garde prix, stocks, commandes, réservations et ajoute des valeurs neutres', async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test'))
    throw new Error('Base isolée obligatoire');
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query('CREATE SCHEMA admin_migration_test');
  try {
    await c.query('SET search_path TO admin_migration_test');
    for (const file of [
      '202610250001_initial',
      '202610250002_categories_drafts',
      '202610250003_akhdari_active',
    ])
      await c.query(await readFile('prisma/migrations/' + file + '/migration.sql', 'utf8'));
    await c.query(
      `INSERT INTO "Order" (id,reference,"tokenHash",email,recipient,address,"postalCode",city,"countryCode","subtotalCents","shippingCents","totalCents",status,"updatedAt") VALUES ('migration-order','MM-MIGRATION','hash-fixture','fixture@example.invalid','Client fixture','Adresse fixture','75001','Paris','FR',1500,400,1900,'PENDING_PAYMENT',now())`,
    );
    await c.query(
      `INSERT INTO "OrderItem" (id,"orderId","productId","titleFr","titleAr","unitPriceCents",quantity) VALUES ('migration-item','migration-order','mukhtasar-al-akhdari','Titre historique','كتاب',1500,1)`,
    );
    await c.query(
      `INSERT INTO "StockReservation" (id,"orderId","productId",quantity,"expiresAt") VALUES ('migration-reservation','migration-order','mukhtasar-al-akhdari',4,now()+interval '1 hour')`,
    );
    const tables = [
        'Product',
        'Order',
        'OrderItem',
        'StockReservation',
        'Category',
        'CatalogDraft',
      ],
      before = new Map<string, Record<string, unknown>[]>();
    for (const table of tables)
      before.set(table, (await c.query(`SELECT * FROM "${table}" ORDER BY id`)).rows);
    await c.query(
      await readFile('prisma/migrations/202610260001_admin_unique/migration.sql', 'utf8'),
    );
    for (const table of tables) {
      const old = before.get(table)!;
      if (!old.length) continue;
      const rows = (
        await c.query(
          `SELECT ${Object.keys(old[0])
            .map((key) => '"' + key + '"')
            .join(',')} FROM "${table}" ORDER BY id`,
        )
      ).rows;
      expect(rows).toEqual(old);
    }
    expect(
      (await c.query('SELECT "fulfillmentStatus","fulfillmentVersion" FROM "Order"')).rows,
    ).toEqual([{ fulfillmentStatus: 'UNFULFILLED', fulfillmentVersion: 0 }]);
    expect((await c.query('SELECT count(*)::int AS n FROM "QuizQuestionRecord"')).rows[0].n).toBe(
      0,
    );
    expect((await c.query('SELECT count(*)::int AS n FROM "User"')).rows[0].n).toBe(0);
  } finally {
    await c.query('SET search_path TO public');
    await c.query('DROP SCHEMA admin_migration_test CASCADE');
    await c.end();
  }
});
