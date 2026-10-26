import { test, expect } from '@playwright/test';
import { liveBank as bank } from '../fixtures/quiz-live-bank';
import AxeBuilder from '@axe-core/playwright';
const quizPath = '/quiz/niveaux/debutant/moukhtassar-al-akhdari';
const questions = bank.questions.filter((q) => q.bookId === 'moukhtassar-al-akhdari');
async function finishQuiz(page: import('@playwright/test').Page, correct: boolean) {
  for (let index = 0; index < 10; index++) {
    await expect(page.locator('.quiz-game h1')).toBeVisible();
    const prompt = await page.locator('.quiz-game h1').innerText();
    const q = questions.find((q) => q.questionFr === prompt)!;
    expect(q).toBeDefined();
    await expect(page.getByRole('button', { name: 'Valider ma réponse' })).toBeDisabled();
    const option = q.options.find((o) =>
      correct ? o.id === q.correctOptionId : o.id !== q.correctOptionId,
    )!;
    await page.getByRole('button', { name: option.textFr, exact: true }).click();
    await page.getByRole('button', { name: 'Valider ma réponse' }).click();
    await expect(
      page.getByText(`Score : ${correct ? index + 1 : 0}/10`, { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel('Références arabes de la correction')).toContainText(
      q.references[0].quoteAr,
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page
      .getByRole('button', { name: index === 9 ? 'Voir mon résultat' : 'Question suivante' })
      .click();
  }
}
test('Livres parent, catégories, Akhdari actif et redirections V1', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Navigation principale', exact: true })
    .getByRole('link', { name: 'Livres', exact: true })
    .click();
  await expect(page).toHaveURL(/\/livres$/);
  await page.getByRole('button', { name: 'Afficher les catégories de livres' }).click();
  await page
    .locator('#book-subcategories')
    .getByRole('link', { name: 'Fiqh', exact: true })
    .click();
  await expect(page).toHaveURL(/\/livres\/fiqh$/);
  await expect(page.getByRole('heading', { name: 'Mukhtasar al-Akhdari' })).toBeVisible();
  await expect(page.getByText('15,00 €', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ajouter au panier' })).toBeEnabled();
  await page.getByRole('link', { name: 'Mukhtasar al-Akhdari', exact: true }).click();
  await expect(page).toHaveURL(/\/livres\/mukhtasar-al-akhdari$/);
  await expect(page.getByText(/Édition : Maktaba Malikiyya/)).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Fil d’Ariane' })).toContainText(
    'LivresFiqhMukhtasar al-Akhdari',
  );
  await page.goto('/coran');
  await expect(page).toHaveURL(/\/livres\/coran$/);
  await expect(page.getByRole('heading', { name: 'Coran (Moshaf)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sahih al-Bukhari' })).toHaveCount(0);
  await page.goto('/hadith');
  await expect(page).toHaveURL(/\/livres\/hadith$/);
});
test('Mini-panier clavier, focus restauré et seuil France/Europe', async ({ page }) => {
  await page.goto('/livres/moshaf-coran');
  const add = page.getByRole('button', { name: 'Ajouter au panier' });
  await add.click();
  const drawer = page.getByRole('dialog', { name: 'Votre panier', exact: true });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('heading', { name: 'Coran (Moshaf)' })).toBeVisible();
  await expect(drawer.getByText(/Encore 40,00/)).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Fermer le mini-panier' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(drawer.getByRole('button', { name: 'Continuer mes découvertes' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(drawer.getByRole('button', { name: 'Fermer le mini-panier' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Ajouté au panier ✓' })).toBeFocused();
  await page.getByLabel('Quantité pour ce livre').selectOption('4');
  await page.getByRole('button', { name: 'Ajouté au panier ✓' }).click();
  await expect(
    drawer.getByText('Vous profitez de la livraison offerte en France métropolitaine'),
  ).toBeVisible();
  await drawer.getByLabel('Destination de l’estimation').selectOption('EU');
  await expect(drawer.getByRole('progressbar')).toHaveCount(0);
  await expect(drawer.getByText('Livraison à 20 € pour ce pays, sans gratuité.')).toBeVisible();
  await drawer.getByRole('link', { name: 'Voir le panier' }).click();
  await expect(
    page.getByText('Vous profitez de la livraison offerte en France métropolitaine'),
  ).toBeVisible();
  await page.getByLabel('Estimer la livraison').selectOption('BE');
  await expect(page.getByRole('progressbar')).toHaveCount(0);
  await expect(page.getByText(/70,00/)).toBeVisible();
});
test('Quiz ouvrage : sélection, score, correction, résultat et rejouer', async ({ page }) => {
  await page.goto(quizPath);
  await expect(
    page.getByText('10 questions par partie (40 questions dans la banque)', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Commencer le quiz' }).click();
  await finishQuiz(page, true);
  await expect(page.getByLabel('Score final : 10 sur 10')).toBeVisible();
  await page.getByRole('button', { name: 'Rejouer' }).click();
  await expect(page.getByText('Question 1 sur 10')).toBeVisible();
  await expect(page.getByText('Score : 0/10', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Valider ma réponse' })).toBeDisabled();
});
test('Quiz ouvrage : mauvaises réponses donnent 0/10 et correction lisible', async ({ page }) => {
  await page.goto(quizPath);
  await page.getByRole('button', { name: 'Commencer le quiz' }).click();
  await finishQuiz(page, false);
  await expect(page.getByLabel('Score final : 0 sur 10')).toBeVisible();
});
test('Accessibilité des nouveautés, mini-panier et quiz actifs', async ({ page }) => {
  for (const route of ['/livres', '/livres/fiqh', quizPath]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
  await page.getByRole('button', { name: 'Commencer le quiz' }).click();
  let results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
  await page.goto('/livres/moshaf-coran');
  await page.getByRole('button', { name: 'Ajouter au panier' }).click();
  results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(
    results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
});
test('320px, menu au clavier et reduced-motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/', '/livres', '/livres/fiqh', '/quiz']) {
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Afficher les catégories de livres' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#book-subcategories')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(
    page.locator('#book-subcategories').getByRole('link', { name: 'Tous les livres' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: 'Afficher les catégories de livres' }),
  ).toBeFocused();
  await expect(page.locator('#book-subcategories')).not.toBeVisible();
});

test('Panier invalide : aucune navigation active vers le checkout', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'maktaba-cart',
      JSON.stringify([{ productId: 'unknown-draft', quantity: 1 }]),
    ),
  );
  await page.goto('/panier');
  await expect(
    page.getByRole('button', { name: 'Stock insuffisant — modifiez votre panier' }),
  ).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Passer commande' })).toHaveCount(0);
});
test('Confirmation : un échec e-mail ne devient jamais un envoi annoncé', async ({ page }) => {
  await page.route('**/api/orders?token=failed-mail-fixture', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reference: 'MM-EMAIL-FAIL',
        status: 'PAID',
        totalCents: 1400,
        subtotalCents: 1000,
        shippingCents: 400,
        items: [{ titleFr: 'Coran (Moshaf)', quantity: 1, unitPriceCents: 1000 }],
        emailDelivery: { status: 'FAILED' },
      }),
    }),
  );
  await page.goto('/commande/confirmation?token=failed-mail-fixture');
  await expect(
    page.getByText(
      'Votre commande est confirmée. L’envoi de l’e-mail a échoué et nécessite un réessai.',
    ),
  ).toBeVisible();
  await expect(
    page.getByText('Votre e-mail de confirmation a été envoyé.', { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText('1 × Coran (Moshaf)', { exact: true })).toBeVisible();
});
