// Local disposable fixture only. No test credentials are committed or printed.
import { Client } from 'pg';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { applySetCookies } from 'better-auth/cookies';
import { createOTP } from '@better-auth/utils/otp';
import { base32 } from '@better-auth/utils/base32';
import { adminE2EConfig } from '../tests/fixtures/admin-e2e/environment';
import { createOwnerAuth } from '../src/lib/admin/auth';
import { adminAuthHandler } from '../src/lib/admin/auth-handler';
import { db } from '../src/lib/db';
import { reserveOrder, applySession } from '../src/lib/orders';
import type Stripe from 'stripe';
const config = adminE2EConfig(),
  name = new URL(config.databaseURL).pathname.slice(1);
if (
  !/^maktaba_test_admin_e2e_[a-f0-9-]+$/.test(name) ||
  process.env.DATABASE_URL !== config.databaseURL
)
  throw new Error('Base locale de recette obligatoire.');
const control = new Client({ connectionString: config.controlURL });
await control.connect();
await control.query(`CREATE DATABASE "${name}"`);
await control.end();
try {
  execFileSync('npm', ['run', 'db:migrate'], { env: process.env, stdio: 'pipe' });
  execFileSync('npm', ['run', 'db:seed'], { env: process.env, stdio: 'pipe' });
  const headers = new Headers({
    origin: process.env.APP_URL!,
    'content-type': 'application/json',
    'x-forwarded-for': '127.0.0.211',
  });
  const signup = await createOwnerAuth(true).api.signUpEmail({
    body: { email: config.email, password: config.password, name: 'Propriétaire de recette' },
    headers,
    asResponse: true,
  });
  if (!signup.ok) throw new Error('Bootstrap fixture échoué');
  applySetCookies(headers, signup.headers.getSetCookie());
  const setup = await adminAuthHandler(
    new Request(process.env.APP_URL + '/api/auth/two-factor/enable', {
      method: 'POST',
      headers,
      body: JSON.stringify({ password: config.password, method: 'totp' }),
    }),
  );
  if (!setup.ok) throw new Error('Enrôlement fixture échoué');
  const data = await setup.json();
  applySetCookies(headers, setup.headers.getSetCookie());
  config.totpSecret = new URL(data.totpURI).searchParams.get('secret')!;
  config.backupCodes = data.backupCodes;
  const code = await createOTP(base32.decode(config.totpSecret)).totp();
  const verify = await adminAuthHandler(
    new Request(process.env.APP_URL + '/api/auth/two-factor/verify-totp', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code }),
    }),
  );
  if (!verify.ok) throw new Error('Vérification MFA fixture échouée');
  const owner = await db.user.findUniqueOrThrow({ where: { email: config.email } });
  config.ownerId = owner.id;
  await db.session.deleteMany({ where: { userId: owner.id } });
  const input = {
    items: [{ productId: 'mukhtasar-al-akhdari', quantity: 1 }],
    email: 'client-recette@example.invalid',
    recipient: 'Client de recette',
    address: 'Adresse synthétique de recette',
    postalCode: '75001',
    city: 'Paris',
    countryCode: 'FR',
  };
  const { order: paid } = await reserveOrder(input);
  await applySession('evt_test_admin_e2e', 'checkout.session.completed', {
    id: 'cs_test_admin_e2e',
    livemode: false,
    metadata: { orderId: paid.id },
    payment_status: 'paid',
    status: 'complete',
    amount_total: paid.totalCents,
    currency: 'eur',
  } as unknown as Stripe.Checkout.Session);
  config.paidOrderId = paid.id;
  const { order: pending } = await reserveOrder({
    ...input,
    email: 'pending-recette@example.invalid',
  });
  config.pendingOrderId = pending.id;
  writeFileSync(process.env.MAKTABA_ADMIN_E2E_FILE!, JSON.stringify(config), { mode: 0o600 });
  console.log('Recette admin locale préparée : propriétaire MFA, commandes et stock isolés.');
} finally {
  await db.$disconnect();
}
