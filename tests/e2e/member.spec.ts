import { test, expect } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
const base = 'http://localhost:3102';
test('portail commun : inscription pseudo, session normale, refus admin, déconnexion et reconnexion', async ({
  page,
}, info) => {
  const username = 'etudiant_' + randomUUID().slice(0, 8),
    password = randomBytes(20).toString('hex');
  await page.goto(base + '/');
  const nav = page.getByRole('navigation', { name: 'Navigation principale' });
  await nav.getByRole('link', { name: 'Connexion', exact: true }).click();
  await expect(page).toHaveURL(base + '/connexion');
  await page.getByRole('link', { name: 'Créer un compte', exact: true }).click();
  await page.getByLabel('Pseudo', { exact: true }).fill(username);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByLabel('Confirmer le mot de passe', { exact: true }).fill(password);
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
  await page.getByRole('button', { name: 'Créer mon compte', exact: true }).click();
  await expect(page).toHaveURL(base + '/quiz/niveaux');
  await nav.getByRole('link', { name: 'Mon compte', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mon compte', exact: true })).toBeVisible();
  await expect(page.getByText(username, { exact: true })).toBeVisible();
  expect(await nav.getByRole('link', { name: /Administration/ }).count()).toBe(0);
  const view = await (await page.request.get(base + '/api/compte/session')).json();
  expect(view).toEqual({ mode: 'member', href: '/compte', label: 'Mon compte' });
  expect((await page.request.get(base + '/api/admin/export-commandes')).status()).toBe(401);
  expect(
    (
      await page.request.post(base + '/api/admin/mutate', {
        headers: { origin: base },
        data: { command: 'stock', input: { ownerSlot: 1 } },
      })
    ).status(),
  ).toBe(401);
  if (info.project.name.includes('mobile')) await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  mkdirSync('test-results/member-captures', { recursive: true });
  await page.screenshot({
    path: `test-results/member-captures/${info.project.name}-compte.png`,
    fullPage: true,
  });
  await page.goto(base + '/admin');
  await expect(page).toHaveURL(base + '/connexion');
  await expect(page.getByRole('heading', { name: 'Connexion', exact: true })).toBeVisible();
  await nav.getByRole('link', { name: 'Mon compte', exact: true }).click();
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await expect(page).toHaveURL(base + '/connexion');
  expect((await (await page.request.get(base + '/api/compte/session')).json()).mode).toBe(
    'anonymous',
  );
  await page.getByLabel('Pseudo ou e-mail administrateur').fill(username.toUpperCase());
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByLabel('Mot de passe', { exact: true }).press('Enter');
  await expect(page).toHaveURL(base + '/quiz/niveaux');
  await expect(nav.getByRole('link', { name: 'Mon compte', exact: true })).toBeVisible();
});
test('une inscription ne peut pas demander des privilèges admin, un pseudo réservé ou une origine étrangère', async ({
  request,
}) => {
  const password = randomBytes(20).toString('hex');
  for (const input of [
    { username: 'admin', password },
    { username: 'etudiant_' + randomUUID().slice(0, 8), password, ownerSlot: 1 },
    { username: 'etudiant_' + randomUUID().slice(0, 8), password, role: 'admin' },
  ])
    expect(
      (
        await request.post(base + '/api/auth/sign-up/username', {
          headers: { origin: base },
          data: input,
        })
      ).status(),
    ).toBe(403);
  expect(
    (
      await request.post(base + '/api/auth/sign-up/username', {
        headers: { origin: 'https://foreign.invalid' },
        data: { username: 'etudiant_' + randomUUID().slice(0, 8), password },
      })
    ).status(),
  ).toBe(403);
});
