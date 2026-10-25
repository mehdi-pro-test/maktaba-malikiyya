import 'dotenv/config';
import { Client } from 'pg';
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
// Apply committed Prisma-generated SQL with a PostgreSQL transaction and checksum journal.
// Keeps deployment independent of native engine downloads.
// Only initial installation in an empty dedicated production DB may run from vercel-build.
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(741826)');
  await client.query(
    'CREATE TABLE IF NOT EXISTS "_MaktabaMigration" (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())',
  );
  const dirs = (
    await readdir(new URL('../prisma/migrations/', import.meta.url), { withFileTypes: true })
  )
    .filter((d) => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const dir of dirs) {
    const sql = await readFile(
      new URL(`../prisma/migrations/${dir.name}/migration.sql`, import.meta.url),
      'utf8',
    );
    const checksum = createHash('sha256').update(sql).digest('hex');
    const prior = await client.query('SELECT checksum FROM "_MaktabaMigration" WHERE name=$1', [
      dir.name,
    ]);
    if (prior.rowCount) {
      if (prior.rows[0].checksum !== checksum)
        throw new Error(`Migration déjà appliquée modifiée : ${dir.name}`);
      continue;
    }
    await client.query(sql);
    await client.query('INSERT INTO "_MaktabaMigration" (name,checksum) VALUES ($1,$2)', [
      dir.name,
      checksum,
    ]);
    console.log('Migration appliquée :', dir.name);
  }
  await client.query('COMMIT');
  console.log('Migrations à jour.');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
