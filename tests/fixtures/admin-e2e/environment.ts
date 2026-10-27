import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
export type AdminE2EConfig = {
  databaseURL: string;
  controlURL: string;
  email: string;
  password: string;
  authSecret: string;
  totpSecret?: string;
  backupCodes?: string[];
  paidOrderId?: string;
  pendingOrderId?: string;
  ownerId?: string;
};
export function adminE2EConfig(): AdminE2EConfig {
  if (!process.env.MAKTABA_ADMIN_E2E_FILE) {
    const source = new URL(
      process.env.DATABASE_URL ?? 'postgresql://maktaba@127.0.0.1:5432/maktaba_test',
    );
    if (
      !['127.0.0.1', 'localhost', 'postgres'].includes(source.hostname) ||
      !source.pathname.startsWith('/maktaba_test')
    )
      throw new Error('Recette admin : PostgreSQL local maktaba_test obligatoire.');
    const control = new URL(source);
    control.pathname = '/postgres';
    source.pathname = '/maktaba_test_admin_e2e_' + randomUUID().slice(0, 8);
    const path = join(mkdtempSync(join(tmpdir(), 'maktaba-admin-e2e-')), 'config.json');
    writeFileSync(
      path,
      JSON.stringify({
        databaseURL: source.href,
        controlURL: control.href,
        email: 'owner-' + randomUUID().slice(0, 8) + '@example.invalid',
        password: randomBytes(32).toString('hex'),
        authSecret: randomBytes(48).toString('hex'),
      }),
      { mode: 0o600 },
    );
    process.env.MAKTABA_ADMIN_E2E_FILE = path;
  }
  return JSON.parse(readFileSync(process.env.MAKTABA_ADMIN_E2E_FILE, 'utf8'));
}
export function adminE2EEnv(config: AdminE2EConfig) {
  return {
    DATABASE_URL: config.databaseURL,
    ADMIN_ENABLED: 'true',
    MEMBER_ACCOUNTS_ENABLED: 'true',
    ADMIN_DATA_ENABLED: 'true',
    QUIZ_DB_ENABLED: 'true',
    ADMIN_EMAIL: config.email,
    ADMIN_USER_ID: '',
    BETTER_AUTH_SECRET: config.authSecret,
    APP_URL: 'http://localhost:3102',
    STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
    RESEND_API_KEY: '',
    RESEND_FROM_EMAIL: '',
    BLOB_READ_WRITE_TOKEN: '',
    ADMIN_BLOB_HOST: '',
    SHIPPING_ALLOWED_COUNTRIES: 'FR,BE,DE,ES,IT,LU,NL',
  };
}
