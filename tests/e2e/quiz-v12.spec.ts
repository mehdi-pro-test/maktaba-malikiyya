import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import raw from '../../src/data/quiz-v1.2/research.json' with { type: 'json' };
test('Cinq parcours, quinze ouvrages approuvés et navigation clavier', async ({ page }) => {
  await page.goto('/');
  const header = page.getByRole('navigation', { name: 'Navigation principale', exact: true });
  await expect(header.getByRole('link', { name: 'Quiz', exact: true })).toHaveAttribute(
    'href',
    '/quiz/niveaux',
  );
  await header.getByRole('link', { name: 'Quiz', exact: true }).click();
  await expect(header.getByRole('link', { name: 'Quiz', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('link', { name: /quiz classique/i })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Les quiz par niveau.' })).toBeVisible();
  await expect(page.locator('.quiz-level')).toHaveCount(5);
  await expect(page.locator('.quiz-book-card')).toHaveCount(15);
  await expect(
    page.locator('.quiz-book-card').getByText('DISPONIBLE', { exact: true }),
  ).toHaveCount(15);
  await page.getByRole('heading', { name: 'Débutant', exact: true }).getByRole('link').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/quiz\/niveaux\/debutant$/);
  await expect(page.locator('.quiz-book-card')).toHaveCount(3);
  await page.getByRole('link', { name: 'Mukhtasar al-Akhdari', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Commencer le quiz' })).toBeVisible();
  await expect(page.locator('[lang="ar"][dir="rtl"]').first()).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.goto('/quiz/niveaux/avance');
  await expect(page.locator('.quiz-level .eyebrow').first()).toHaveText('PARCOURS 3');
});
test('Les quinze quiz réels sont jouables et montrent la source arabe après validation', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const b of raw.books) {
    await page.goto(`/quiz/niveaux/${b.level}/${b.id}`);
    await expect(
      page.getByText('10 questions par partie (10 questions dans la banque)', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Commencer le quiz' }).click();
    await expect(page.locator('.quiz-game h1')).toBeVisible();
    const prompt = await page.locator('.quiz-game h1').innerText();
    const q = raw.questions.find((q) => q.bookId === b.id && q.questionFr === prompt)!;
    expect(q).toBeDefined();
    await expect(page.getByRole('heading', { name: q.questionFr, exact: true })).toBeVisible();
    await expect(page.getByLabel('Références arabes de la correction')).toHaveCount(0);
    await page
      .getByRole('button', {
        name: q.options.find((o) => o.id === q.correctOptionId)!.textFr,
        exact: true,
      })
      .click();
    await page.getByRole('button', { name: 'Valider ma réponse' }).click();
    await expect(page.getByText('Score : 1/10', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Références arabes de la correction')).toContainText(
      q.references[0].quoteAr,
    );
  }
});
test('Les brouillons restent fermés sans divulgation ; les mauvais slugs restent 404', async ({
  request,
  page,
}) => {
  const fixture = await request.get('http://127.0.0.1:3101/preparation');
  expect(fixture.status()).toBe(200);
  const html = await fixture.text();
  await page.goto('http://127.0.0.1:3101/preparation');
  await expect(
    page.locator('.quiz-book-card').getByText('EN PRÉPARATION', { exact: true }),
  ).toHaveCount(15);
  await expect(page.getByRole('button', { name: 'Commencer le quiz' })).toHaveCount(0);
  expect(html).not.toContain('correctOptionId');
  for (const q of raw.questions) {
    expect(html).not.toContain(q.questionFr);
    expect(html).not.toContain(q.references[0].quoteAr);
  }
  for (const route of [
    '/quiz/niveaux/inconnu',
    '/quiz/niveaux/debutant/inconnu',
    '/quiz/niveaux/ultime/moukhtassar-al-akhdari',
  ])
    expect((await request.get(route)).status()).toBe(404);
});
test('Catalogue à 320px : liens tactiles, aucune largeur débordante et accessibilité', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/quiz/niveaux');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  const box = await page.locator('.quiz-book-card .text-link').first().boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await page.screenshot({
    path: `test-results/quiz-v12-catalogue-320-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test('Ancienne adresse redirigée, aucun accès au classique et accueil actualisé', async ({
  page,
  request,
}) => {
  const response = await request.get('/quiz', { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe('/quiz/niveaux');
  await page.goto('/quiz');
  await expect(page).toHaveURL(/\/quiz\/niveaux$/);
  await expect(page.getByRole('heading', { name: 'Les quiz par niveau.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Commencer le quiz' })).toHaveCount(0);
  await page.goto('/');
  await expect(page.locator('.quiz-teaser')).toContainText('15 quiz par niveau et par ouvrage');
  await expect(page.locator('.quiz-teaser')).toContainText('150 questions disponibles.');
  await page.getByRole('link', { name: 'Découvrir les quiz', exact: true }).click();
  await expect(page).toHaveURL(/\/quiz\/niveaux$/);
});
