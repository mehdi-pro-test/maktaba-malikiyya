import { test, expect } from '@playwright/test';
test('Découverte, panier, livraison et formulaire invité', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Les livres demeurent/ })).toBeVisible();
  await page.getByRole('link', { name: 'Découvrir nos livres' }).click();
  const coran = page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: 'Coran (Moshaf)' }) });
  await coran.getByRole('combobox').selectOption('3');
  await coran.getByRole('button', { name: 'Ajouter au panier' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Voir le panier' }).click();
  await expect(page.getByText('30,00', { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Diminuer la quantité de Coran (Moshaf)' }).click();
  await expect(page.getByText('24,00', { exact: false })).toBeVisible();
  await page.getByLabel('Estimer la livraison').selectOption('BE');
  await expect(page.getByText('40,00', { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Quantité', { exact: true })).toHaveText('2');
  await page.getByRole('link', { name: /Passer commande/ }).click();
  await expect(page.getByText('Paiement en mode test — aucun débit réel')).toBeVisible();
  await page.getByLabel('E-mail', { exact: true }).fill('demo@example.com');
  await page.getByLabel('Prénom et nom du destinataire').fill('Client Démonstration');
  await page.getByLabel('Adresse', { exact: true }).fill('1 rue de Test');
  await page.getByLabel('Code postal').fill('75001');
  await page.getByLabel('Ville', { exact: true }).fill('Paris');
  // No Stripe credentials in this browser suite: verify honest disabled integration response.
  await expect(page.getByRole('button', { name: 'Payer par carte (test)' })).toBeDisabled();
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'paiement de test n’est pas encore disponible',
  );
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
test('Catégories, fiche et suppression du panier', async ({ page }) => {
  await page.goto('/hadith');
  await expect(page.getByRole('heading', { name: 'Catégorie Hadith' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Coran (Moshaf)', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Sahih al-Bukhari', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sahih al-Bukhari' })).toBeVisible();
  await page.getByRole('button', { name: 'Ajouter au panier' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Voir le panier' }).click();
  await expect(page.getByRole('main').getByText('Offerte', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Retirer Sahih al-Bukhari' }).click();
  await expect(
    page.getByRole('heading', { name: 'Votre panier attend sa première lecture.' }),
  ).toBeVisible();
});
test('320px, clavier et confidentialité de confirmation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.goto('/commande/confirmation?token=guess');
  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    'Cette confirmation est introuvable.',
  );
});

test('Image indisponible : titre et ajout restent accessibles', async ({ page }) => {
  await page.route('**/images/coran.svg', (route) => route.abort());
  await page.goto('/livres/moshaf-coran');
  await expect(page.getByText('Illustration de remplacement', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ajouter au panier' })).toBeEnabled();
});

test('Confirmation : attend le serveur puis affiche la référence et vide le panier', async ({
  page,
}) => {
  // UI fixture only. This does not attest an external Stripe payment.
  let reads = 0;
  await page.route('**/api/orders?token=confirmation-fixture', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reference: 'MM-UI-FIXTURE',
        status: ++reads < 2 ? 'PENDING_PAYMENT' : 'PAID',
        totalCents: 1400,
        emailDelivery: reads < 2 ? null : { status: 'NOT_CONFIGURED' },
      }),
    }),
  );
  await page.goto('/livres/moshaf-coran');
  await page.getByRole('button', { name: 'Ajouter au panier' }).click();
  await page.goto('/commande/confirmation?token=confirmation-fixture');
  await expect(page.getByRole('heading', { name: 'En attente de confirmation.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Merci pour votre confiance.' })).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByText('MM-UI-FIXTURE', { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText(
      'L’e-mail n’a pas été envoyé : le service de messagerie n’est pas encore configuré.',
    ),
  ).toBeVisible();
  await page
    .getByRole('link', { name: /Panier/ })
    .first()
    .click();
  await expect(
    page.getByRole('heading', { name: 'Votre panier attend sa première lecture.' }),
  ).toBeVisible();
});
