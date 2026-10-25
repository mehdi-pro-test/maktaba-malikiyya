import { beforeAll, afterAll, expect, it } from 'vitest';
import { Client } from 'pg';
import { checkDatabase } from '../src/lib/database-readiness';
let client: Client;
let isolatedUrl: string;
beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test'))
    throw new Error('Base maktaba_test obligatoire.');
  client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  // One isolated schema in the existing disposable test database; never modify shop tables.
  await client.query('CREATE SCHEMA readiness_test');
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('options', '-c search_path=readiness_test');
  isolatedUrl = url.href;
});
afterAll(async () => {
  if (client) {
    await client.query('DROP SCHEMA IF EXISTS readiness_test CASCADE');
    await client.end();
  }
});
it('explique une base non connectée sans tentative réseau', async () => {
  await expect(checkDatabase(undefined)).rejects.toMatchObject({ code: 'DATABASE_URL_MISSING' });
});
it('détecte une base connectée dont les tables sont absentes', async () => {
  await expect(checkDatabase(isolatedUrl)).rejects.toMatchObject({
    code: 'DATABASE_SCHEMA_MISSING',
  });
});
it('autorise une base vide pour l’initialisation explicite', async () => {
  await expect(checkDatabase(isolatedUrl, true)).resolves.toBe('EMPTY');
});
it('refuse d’initialiser une base contenant des tables étrangères', async () => {
  await client.query('CREATE TABLE readiness_test.other_project(id int)');
  await expect(checkDatabase(isolatedUrl, true)).rejects.toMatchObject({
    code: 'DATABASE_NOT_DEDICATED',
  });
  await client.query('DROP TABLE readiness_test.other_project');
});
it('remplace les erreurs de connexion par un diagnostic sans identifiants', async () => {
  await expect(
    checkDatabase('postgresql://fixture:OFFLINE_PASSWORD@127.0.0.1:1/maktaba_test'),
  ).rejects.toMatchObject({ code: 'DATABASE_UNREACHABLE' });
});
