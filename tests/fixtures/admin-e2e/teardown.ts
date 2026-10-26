import { Client } from 'pg';
import { rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { adminE2EConfig } from './environment';
export default async function teardown() {
  const config = adminE2EConfig(),
    name = new URL(config.databaseURL).pathname.slice(1);
  if (!/^maktaba_test_admin_e2e_[a-f0-9-]+$/.test(name))
    throw new Error('Nettoyage hors périmètre refusé');
  const client = new Client({ connectionString: config.controlURL });
  await client.connect();
  try {
    await client.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
  } finally {
    await client.end();
  }
  if (process.env.MAKTABA_ADMIN_E2E_FILE)
    rmSync(dirname(process.env.MAKTABA_ADMIN_E2E_FILE), { recursive: true, force: true });
}
