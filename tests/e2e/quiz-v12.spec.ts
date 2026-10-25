import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import raw from '../../src/data/quiz-v1.2/research.json' with { type: 'json' };
test('Cinq parcours, quinze ouvrages en préparation et navigation clavier', async ({ page }) => {
  await page.goto('/quiz');
  await page.getByRole('link', { name: 'Explorer les quiz par niveau' }).click();
  await expect(page.getByRole('heading', { name: 'Les quiz par niveau.' })).toBeVisible();
  await expect(page.locator('.quiz-level')).toHaveCount(5);
  await expect(page.locator('.quiz-book-card')).toHaveCount(15);
  await expect(
    page.locator('.quiz-book-card').getByText('EN PRÉPARATION', { exact: true }),
  ).toHaveCount(15);
  await page.getByRole('heading', { name: 'Débutant', exact: true }).getByRole('link').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/quiz\/niveaux\/debutant$/);
  await expect(page.locator('.quiz-book-card')).toHaveCount(3);
  await page.getByRole('link', { name: 'Mukhtasar al-Akhdari', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Quiz en préparation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Commencer le quiz' })).toHaveCount(0);
  await expect(page.locator('[lang="ar"][dir="rtl"]').first()).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('Tous les lots réels sont fermés sans divulgation des réponses dans le HTML/RSC', async ({
  request,
}) => {
  for (const b of raw.books) {
    const response = await request.get(`/quiz/niveaux/${b.level}/${b.id}`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('Quiz en préparation');
    const q = raw.questions.find((q) => q.bookId === b.id)!;
    expect(html).not.toContain(q.questionFr);
    expect(html).not.toContain(q.references[0].quoteAr);
    expect(html).not.toContain('correctOptionId');
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
