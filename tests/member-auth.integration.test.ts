import { beforeAll, afterAll, it, expect, vi } from 'vitest';
import { randomBytes } from 'node:crypto';
import { applySetCookies } from 'better-auth/cookies';
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
import { db } from '../src/lib/db';
import { adminAuthHandler } from '../src/lib/admin/auth-handler';
import { createOwnerAuth } from '../src/lib/admin/auth';
import { siteSessionView } from '../src/lib/site-session';
import { requireOwnerSession } from '../src/lib/admin/session-core';
import { POST as mutate } from '../src/app/api/admin/mutate/route';
import { POST as passwordChange } from '../src/app/api/compte/mot-de-passe/route';
const origin = 'http://localhost:3102';
const password = randomBytes(24).toString('hex');
let ip = 1;
const jar = () =>
  new Headers({ origin, 'content-type': 'application/json', 'x-forwarded-for': '127.0.2.' + ip++ });
const alice = jar(),
  bob = jar(),
  owner = jar();
async function auth(path: string, body: unknown, headers = alice) {
  const r = await adminAuthHandler(
    new Request(origin + '/api/auth/' + path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }),
  );
  applySetCookies(headers, r.headers.getSetCookie());
  return r;
}
beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test'))
    throw Error('Base locale de test requise');
  for (const [k, v] of Object.entries({
    ADMIN_ENABLED: 'true',
    ADMIN_DATA_ENABLED: 'true',
    MEMBER_ACCOUNTS_ENABLED: 'true',
    ADMIN_EMAIL: 'owner-members@example.invalid',
    APP_URL: origin,
    BETTER_AUTH_SECRET: randomBytes(48).toString('hex'),
  }))
    vi.stubEnv(k, v);
  await db.user.deleteMany();
  await db.verification.deleteMany();
  await db.rateLimit.deleteMany();
});
afterAll(async () => {
  await db.user.deleteMany();
  await db.verification.deleteMany();
  await db.rateLimit.deleteMany();
  vi.unstubAllEnvs();
});
it('inscrit deux comptes par pseudo, sans rôle propriétaire ni fausse validation e-mail', async () => {
  for (const [name, h] of [
    ['Etudiant_A', alice],
    ['Etudiant_B', bob],
  ] as const) {
    const r = await auth('sign-up/username', { username: name, password }, h);
    expect(r.status).toBe(200);
    const out = await r.json();
    expect(out.redirectTo).toBe('/quiz/niveaux');
    expect(out).not.toHaveProperty('token');
    expect(out).not.toHaveProperty('user');
  }
  const rows = await db.user.findMany();
  expect(rows).toHaveLength(2);
  expect(rows.every((u) => u.ownerSlot === null && !u.emailVerified)).toBe(true);
  expect(rows.map((u) => u.username).sort()).toEqual(['etudiant_a', 'etudiant_b']);
  expect(await siteSessionView(alice)).toMatchObject({ mode: 'member', href: '/compte' });
});
it('refuse tout rôle injecté et la création de pseudo réservé, même au premier utilisateur', async () => {
  for (const extra of [
    { ownerSlot: 1 },
    { role: 'admin' },
    { email: 'owner-members@example.invalid' },
    { emailVerified: true },
  ])
    expect(
      (await auth('sign-up/username', { username: 'autre_compte', password, ...extra }, jar()))
        .status,
    ).toBe(403);
  expect((await auth('sign-up/username', { username: 'ADMIN', password }, jar())).status).toBe(403);
  expect(
    (await auth('sign-up/email', { email: 'owner-members@example.invalid', password }, jar()))
      .status,
  ).toBe(404);
  expect(await db.user.count({ where: { ownerSlot: 1 } })).toBe(0);
});
it('normalise les pseudos, refuse les doublons et les erreurs de mot de passe', async () => {
  expect((await auth('sign-up/username', { username: 'ETUDIANT_A', password }, jar())).ok).toBe(
    false,
  );
  expect((await auth('sign-in/username', { username: 'ETUDIANT_A', password }, alice)).status).toBe(
    200,
  );
  expect(
    (await auth('sign-in/username', { username: 'etudiant_a', password: password + 'x' }, jar()))
      .ok,
  ).toBe(false);
});
it('un compte classique ne lit ni ne modifie aucune ressource admin, même avec des en-têtes forgés', async () => {
  const forged = new Headers(alice);
  forged.set('x-role', 'admin');
  forged.set('x-user-id', 'owner');
  await expect(requireOwnerSession(forged)).rejects.toMatchObject({ status: 401 });
  const before = await db.inventoryMovement.count();
  const r = await mutate(
    new Request(origin + '/api/admin/mutate', {
      method: 'POST',
      headers: forged,
      body: JSON.stringify({ command: 'stock', input: {} }),
    }),
  );
  expect(r.status).toBe(401);
  expect(await db.inventoryMovement.count()).toBe(before);
  expect((await auth('two-factor/enable', { password }, alice)).status).toBe(403);
});
it('la présence de membres ne bloque pas le bootstrap privé de l’unique propriétaire, toujours sans accès avant MFA', async () => {
  const r = await createOwnerAuth(true).api.signUpEmail({
    body: { email: 'owner-members@example.invalid', password, name: 'Propriétaire' },
    headers: owner,
    asResponse: true,
  });
  expect(r.status).toBe(200);
  applySetCookies(owner, r.headers.getSetCookie());
  expect(await db.user.count({ where: { ownerSlot: 1 } })).toBe(1);
  await expect(requireOwnerSession(owner)).rejects.toMatchObject({ status: 403 });
  expect(await siteSessionView(owner)).toMatchObject({
    mode: 'owner-pending',
    href: '/admin/activation',
  });
  await expect(
    db.user.create({
      data: {
        id: crypto.randomUUID(),
        email: 'second@example.invalid',
        name: 'Second',
        ownerSlot: 1,
      },
    }),
  ).rejects.toThrow();
});
it('refuse CSRF et interdit au propriétaire de contourner le MFA par le changement de mot de passe membre', async () => {
  const external = jar();
  external.set('origin', 'https://foreign.invalid');
  expect((await auth('sign-up/username', { username: 'intrus', password }, external)).status).toBe(
    403,
  );
  expect(
    (
      await passwordChange(
        new Request(origin + '/api/compte/mot-de-passe', {
          method: 'POST',
          headers: owner,
          body: JSON.stringify({
            currentPassword: password,
            newPassword: password + 'new',
            revokeOtherSessions: true,
          }),
        }),
      )
    ).status,
  ).toBe(403);
});
it('le changement de mot de passe révoque les sessions du membre concerné sans affecter les autres', async () => {
  const r = await passwordChange(
    new Request(origin + '/api/compte/mot-de-passe', {
      method: 'POST',
      headers: alice,
      body: JSON.stringify({
        currentPassword: password,
        newPassword: password + 'new',
        revokeOtherSessions: true,
      }),
    }),
  );
  expect(r.status).toBe(200);
  expect(await siteSessionView(alice)).toMatchObject({ mode: 'anonymous' });
  expect(await siteSessionView(bob)).toMatchObject({ mode: 'member' });
  expect(
    (await auth('sign-in/username', { username: 'etudiant_a', password: password + 'new' }, alice))
      .status,
  ).toBe(200);
  expect((await auth('sign-out', {}, alice)).status).toBe(200);
  expect(await siteSessionView(alice)).toMatchObject({ mode: 'anonymous' });
});
