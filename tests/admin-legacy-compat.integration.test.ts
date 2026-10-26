import { it, expect } from 'vitest';
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
it('le code V1.4 fermé reste compatible avec la base V1.1 avant toute migration admin', async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test')) throw new Error('Base de test requise');
  const name = 'maktaba_test_legacy_' + randomUUID().replaceAll('-', ''),
    url = new URL(process.env.DATABASE_URL),
    controlUrl = new URL(url);
  controlUrl.pathname = '/postgres';
  const control = new Client({ connectionString: controlUrl.href });
  await control.connect();
  await control.query(`CREATE DATABASE "${name}"`);
  url.pathname = '/' + name;
  const client = new Client({ connectionString: url.href });
  try {
    await client.connect();
    for (const dir of [
      '202610250001_initial',
      '202610250002_categories_drafts',
      '202610250003_akhdari_active',
    ])
      await client.query(await readFile('prisma/migrations/' + dir + '/migration.sql', 'utf8'));
    await client.query(
      `INSERT INTO "Product" (id,slug,"titleFr","titleAr",category,"imagePath","priceCents","stockOnHand",active,"updatedAt") VALUES ('compat-book','compat-book','Livre fixture','كتاب تجريبي','fiqh','/images/book-fallback.svg',1500,3,true,now())`,
    );
    const { stdout } = await promisify(execFile)(
      process.execPath,
      ['--import', 'tsx', 'tests/fixtures/legacy-shop-probe.ts'],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: url.href,
          ADMIN_ENABLED: 'false',
          ADMIN_DATA_ENABLED: 'false',
          QUIZ_DB_ENABLED: 'false',
          RESEND_API_KEY: '',
          RESEND_FROM_EMAIL: '',
          SHIPPING_ALLOWED_COUNTRIES: 'FR',
        },
        timeout: 25000,
      },
    );
    expect(JSON.parse(stdout.trim())).toEqual({ catalog: true, stock: 2, payment: 'PAID' });
  } finally {
    await client.end();
    await control.query(`DROP DATABASE "${name}" WITH (FORCE)`);
    await control.end();
  }
});
