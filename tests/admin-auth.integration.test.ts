import { beforeAll, afterAll, it, expect, vi } from 'vitest';
import { randomBytes } from 'node:crypto';
import { createOTP } from '@better-auth/utils/otp';
import { base32 } from '@better-auth/utils/base32';
import { applySetCookies } from 'better-auth/cookies';
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
import { db } from '../src/lib/db';
import { createOwnerAuth } from '../src/lib/admin/auth';
import { adminAuthHandler } from '../src/lib/admin/auth-handler';
import { requireOwnerSession } from '../src/lib/admin/session-core';
import { POST as upload } from '../src/app/api/admin/couvertures/route';
import { GET as exportOrders } from '../src/app/api/admin/export-commandes/route';
import { POST as mutate } from '../src/app/api/admin/mutate/route';
const email = 'owner-integration@example.invalid',
  password = randomBytes(32).toString('hex');
const origin = 'http://localhost:3102',
  jar = new Headers({
    'content-type': 'application/json',
    origin,
    'x-forwarded-for': '127.0.0.201',
  });
let secret = '',
  backup: string[] = [];
async function auth(path: string, body: unknown, headers = jar) {
  const response = await adminAuthHandler(
    new Request(origin + '/api/auth/' + path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }),
  );
  applySetCookies(headers, response.headers.getSetCookie());
  return response;
}
beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test'))
    throw new Error('Base de test isolée obligatoire');
  vi.stubEnv('ADMIN_ENABLED', 'true');
  vi.stubEnv('ADMIN_DATA_ENABLED', 'true');
  vi.stubEnv('ADMIN_EMAIL', email);
  vi.stubEnv('APP_URL', origin);
  vi.stubEnv('BETTER_AUTH_SECRET', randomBytes(48).toString('hex'));
  await db.user.deleteMany();
  await db.rateLimit.deleteMany();
  await db.verification.deleteMany();
  const response = await createOwnerAuth(true).api.signUpEmail({
    body: { email, password, name: 'Propriétaire fixture' },
    headers: jar,
    asResponse: true,
  });
  expect(response.status).toBe(200);
  applySetCookies(jar, response.headers.getSetCookie());
});
afterAll(async () => {
  await db.user.deleteMany();
  await db.rateLimit.deleteMany();
  await db.verification.deleteMany();
  vi.unstubAllEnvs();
});
it('refuse anonymes et session avec mot de passe seul, sans accès aux commandes', async () => {
  await expect(requireOwnerSession(new Headers())).rejects.toMatchObject({ status: 401 });
  await expect(requireOwnerSession(jar)).rejects.toMatchObject({ status: 403 });
  const count = await db.inventoryMovement.count();
  const response = await mutate(
    new Request(origin + '/api/admin/mutate', {
      method: 'POST',
      headers: jar,
      body: JSON.stringify({ command: 'stock', input: {} }),
    }),
  );
  expect(response.status).toBe(403);
  expect(
    (
      await upload(
        new Request(origin + '/api/admin/couvertures', {
          method: 'POST',
          headers: jar,
          body: new FormData(),
        }),
      )
    ).status,
  ).toBe(403);
  expect(
    (await exportOrders(new Request(origin + '/api/admin/export-commandes', { headers: jar })))
      .status,
  ).toBe(403);
  expect(await db.inventoryMovement.count()).toBe(count);
});
it('aucune inscription publique, second compte et changement de configuration propriétaire refusés', async () => {
  expect((await auth('sign-up/email', { email: 'other@example.invalid', password })).status).toBe(
    404,
  );
  await expect(
    db.user.create({
      data: {
        id: crypto.randomUUID(),
        email: 'other@example.invalid',
        name: 'Interdit',
        ownerSlot: 2,
      },
    }),
  ).rejects.toThrow();
  expect(await db.user.count()).toBe(1);
  vi.stubEnv('ADMIN_EMAIL', 'other@example.invalid');
  await expect(requireOwnerSession(jar)).rejects.toMatchObject({ status: 401 });
  vi.stubEnv('ADMIN_EMAIL', email);
});
it('enrôle le TOTP réel ; un code invalide ne donne aucune preuve MFA', async () => {
  const setup = await auth('two-factor/enable', { password, method: 'totp' });
  expect(setup.status).toBe(200);
  const data = await setup.json();
  secret = new URL(data.totpURI).searchParams.get('secret')!;
  backup = data.backupCodes;
  expect((await auth('two-factor/verify-totp', { code: 'invalid' })).status).toBe(401);
  await expect(requireOwnerSession(jar)).rejects.toMatchObject({ status: 403 });
  expect(await db.adminMfaProof.count()).toBe(0);
});
it('vérifie le TOTP via Better Auth et associe une preuve à la session réellement émise', async () => {
  const code = await createOTP(base32.decode(secret)).totp();
  const response = await auth('two-factor/verify-totp', { code });
  expect(response.status).toBe(200);
  const actor = await requireOwnerSession(jar);
  expect(actor.id).toBeTruthy();
  const proof = await db.adminMfaProof.findUniqueOrThrow({ where: { sessionId: actor.sessionId } });
  expect(proof.expiresAt.getTime()).toBeGreaterThan(Date.now());
  expect(response.headers.get('set-cookie')).toContain('HttpOnly');
  expect(response.headers.get('set-cookie')).toContain('SameSite=Lax');
});
it('refuse CSRF, options de confiance et redirection externe, et expiration idle', async () => {
  const other = new Headers(jar);
  other.set('origin', 'https://evil.example');
  expect((await auth('sign-out', {}, other)).status).toBe(403);
  expect((await auth('two-factor/verify-totp', { code: '000000', trustDevice: true })).status).toBe(
    403,
  );
  expect(
    (await auth('sign-in/email', { email, password, callbackURL: 'https://evil.example' })).status,
  ).toBe(403);
  const actor = await requireOwnerSession(jar);
  await db.adminMfaProof.update({
    where: { sessionId: actor.sessionId },
    data: { lastSeenAt: new Date(Date.now() - 31 * 60000) },
  });
  await expect(requireOwnerSession(jar)).rejects.toMatchObject({ status: 403 });
  const code = await createOTP(base32.decode(secret)).totp();
  expect((await auth('two-factor/verify-totp', { code })).status).toBe(200);
  await expect(requireOwnerSession(jar)).resolves.toBeDefined();
});
it('déconnexion révoque la session et une reconnexion exige le second facteur ; secours utilisable une seule fois', async () => {
  const old = new Headers(jar);
  expect((await auth('sign-out', {})).status).toBe(200);
  await expect(requireOwnerSession(old)).rejects.toMatchObject({ status: 401 });
  const signin = await auth('sign-in/email', { email, password });
  expect(signin.status).toBe(200);
  expect((await signin.json()).twoFactorRedirect).toBe(true);
  await expect(requireOwnerSession(jar)).rejects.toMatchObject({ status: 401 });
  expect((await auth('two-factor/verify-backup-code', { code: backup[0] })).status).toBe(200);
  await expect(requireOwnerSession(jar)).resolves.toBeDefined();
  expect((await auth('two-factor/verify-backup-code', { code: backup[0] })).status).toBe(401);
});
it('révocation de toutes les sessions invalide même le cookie courant', async () => {
  const response = await mutate(
    new Request(origin + '/api/admin/mutate', {
      method: 'POST',
      headers: jar,
      body: JSON.stringify({ command: 'revoke-sessions', input: { confirmed: true } }),
    }),
  );
  expect(response.status).toBe(200);
  await expect(requireOwnerSession(jar)).rejects.toMatchObject({ status: 401 });
});
it('limitation persistante des tentatives et fermeture par défaut', async () => {
  const headers = new Headers({
    'content-type': 'application/json',
    origin,
    'x-forwarded-for': '127.0.0.202',
  });
  let status = 0;
  for (let i = 0; i < 12; i++)
    status = (await auth('sign-in/email', { email, password: 'incorrect-fixture' }, headers))
      .status;
  expect(status).toBe(429);
  expect(await db.rateLimit.count()).toBeGreaterThan(0);
  vi.stubEnv('ADMIN_ENABLED', 'false');
  expect((await auth('sign-in/email', { email, password })).status).toBe(503);
  await expect(requireOwnerSession(jar)).rejects.toMatchObject({ status: 503 });
});
it('changement du mot de passe sous MFA révoque toutes les sessions et n’expose aucun jeton JSON', async () => {
  vi.stubEnv('ADMIN_ENABLED', 'true');
  const code = () => createOTP(base32.decode(secret)).totp();
  expect((await auth('sign-in/email', { email, password })).status).toBe(200);
  expect((await auth('two-factor/verify-totp', { code: await code() })).status).toBe(200);
  const replacement = randomBytes(32).toString('hex');
  const changed = await auth('change-password', {
    currentPassword: password,
    newPassword: replacement,
    revokeOtherSessions: true,
  });
  expect(changed.status).toBe(200);
  expect(await changed.json()).toEqual({ ok: true });
  await expect(requireOwnerSession(jar)).rejects.toMatchObject({ status: 401 });
  const fresh = new Headers({
    'content-type': 'application/json',
    origin,
    'x-forwarded-for': '127.0.0.203',
  });
  expect((await auth('sign-in/email', { email, password }, fresh)).status).toBe(401);
  const signin = await auth('sign-in/email', { email, password: replacement }, fresh);
  expect(signin.status).toBe(200);
  expect(await signin.json()).toEqual({ twoFactorRedirect: true });
  expect(
    (await adminAuthHandler(new Request(origin + '/api/auth/get-session', { headers: fresh })))
      .status,
  ).toBe(404);
});
