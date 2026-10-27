import { it, expect } from 'vitest';
import { Client } from 'pg';
import { readFile } from 'node:fs/promises';
it('migration comptes : conserve le propriétaire, son compte et sa session, permet plusieurs membres sans second propriétaire', async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test'))
    throw Error('Base de test isolée obligatoire');
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query('CREATE SCHEMA member_migration_test');
  try {
    await c.query('SET search_path TO member_migration_test');
    for (const name of [
      '202610250001_initial',
      '202610250002_categories_drafts',
      '202610250003_akhdari_active',
      '202610260001_admin_unique',
    ])
      await c.query(await readFile('prisma/migrations/' + name + '/migration.sql', 'utf8'));
    await c.query(
      `INSERT INTO "User"(id,name,email,"emailVerified","twoFactorEnabled","updatedAt")VALUES('owner','Propriétaire','owner@example.invalid',true,true,now())`,
    );
    await c.query(
      `INSERT INTO "Account"(id,"accountId","providerId","userId",password,"updatedAt")VALUES('account','owner','credential','owner','hash-fixture',now())`,
    );
    await c.query(
      `INSERT INTO "Session"(id,token,"userId","expiresAt","updatedAt")VALUES('session','opaque-fixture','owner',now()+interval '1 hour',now())`,
    );
    const before = await c.query('SELECT * FROM "User"');
    const account = await c.query('SELECT * FROM "Account"');
    const session = await c.query('SELECT * FROM "Session"');
    await c.query(
      await readFile('prisma/migrations/202610260002_member_accounts/migration.sql', 'utf8'),
    );
    const fields = Object.keys(before.rows[0])
      .map((k) => '"' + k + '"')
      .join(',');
    expect((await c.query('SELECT ' + fields + ' FROM "User"')).rows).toEqual(before.rows);
    expect((await c.query('SELECT * FROM "Account"')).rows).toEqual(account.rows);
    expect((await c.query('SELECT * FROM "Session"')).rows).toEqual(session.rows);
    for (const name of ['alice', 'bob'])
      await c.query(
        `INSERT INTO "User"(id,name,email,username,"updatedAt")VALUES($1,$1,$2,$1,now())`,
        [name, name + '@accounts.maktaba.invalid'],
      );
    expect(
      (await c.query('SELECT count(*)::int AS n FROM "User" WHERE "ownerSlot" IS NULL')).rows[0].n,
    ).toBe(2);
    await expect(
      c.query(
        `INSERT INTO "User"(id,name,email,"ownerSlot","updatedAt")VALUES('intrus','Intrus','intrus@example.invalid',1,now())`,
      ),
    ).rejects.toThrow();
    await expect(
      c.query(`UPDATE "User" SET "ownerSlot"=1 WHERE username='alice'`),
    ).rejects.toThrow();
  } finally {
    await c.query('SET search_path TO public');
    await c.query('DROP SCHEMA member_migration_test CASCADE');
    await c.end();
  }
});
