import { test, expect } from '@playwright/test';
import { liveBank } from '../fixtures/quiz-live-bank';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';
test('Mode global : dix parmi tous les ouvrages, score 5/10, sources et Rejouer', async ({
  page,
  request,
}, testInfo) => {
  test.setTimeout(90000);
  const path = '/quiz/aleatoire';
  const allowed = liveBank.questions;
  const target = 5;
  const poolSize = allowed.length;
  const capture = async (name: string) => {
    if (['desktop', 'mobile'].includes(testInfo.project.name)) {
      mkdirSync('docs/quiz-global/captures', { recursive: true });
      await page.screenshot({
        path: `docs/quiz-global/captures/${testInfo.project.name}-${name}.png`,
        fullPage: true,
      });
    }
  };
  await page.goto('/quiz/niveaux');
  await expect(page.locator('.quiz-global-card')).toBeVisible();
  await expect(page.locator('.quiz-level')).toHaveCount(5);
  await capture('carte');
  await page.getByRole('link', { name: 'Lancer le mode aléatoire' }).click();
  await expect(page).toHaveURL(/\/quiz\/aleatoire$/);
  await capture('introduction');
  const html = await (await request.get(path)).text();
  for (const q of allowed) expect(html).not.toContain(q.id);
  const payloads: string[] = [];
  await page.route('**/quiz/aleatoire', async (route) => {
    if (route.request().method() === 'POST' && route.request().headers()['next-action']) {
      const response = await route.fetch();
      payloads.push(await response.text());
      await route.fulfill({ response });
    } else await route.continue();
  });

  const scripts = await page
    .locator('script[src]')
    .evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute('src')!).filter((src) => src.includes('/_next/')),
    );
  for (const src of scripts) {
    const js = await (await request.get(src)).text();
    for (const q of allowed) expect(js).not.toContain(q.id);
  }
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
  await expect(
    page.getByText(`10 questions par partie (${poolSize} questions dans la banque)`, {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Commencer le quiz' }).click();
  const prompts: string[] = [];
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('.quiz-game h1')).toBeVisible();
    const prompt = await page.locator('.quiz-game h1').innerText();
    prompts.push(prompt);
    const q = allowed.find((q) => q.questionFr === prompt)!;
    expect(q).toBeDefined();
    if (i === 0) await expect(page.locator('.quiz-game h1')).toBeFocused();
    await expect(page.getByLabel('Références arabes de la correction')).toHaveCount(0);
    const option = q.options.find((o) =>
      i < target ? o.id === q.correctOptionId : o.id !== q.correctOptionId,
    )!;
    await page.getByRole('button', { name: option.textFr, exact: true }).click();
    await expect(page.locator('.quiz-game h1')).toHaveText(prompt);
    await page.getByRole('button', { name: 'Valider ma réponse' }).click();
    await expect(
      page.getByText(`Score : ${Math.min(i + 1, target)}/10`, { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel('Références arabes de la correction')).toContainText(
      q.references[0].quoteAr,
    );
    if (q.id.includes('-v13-ultime-'))
      await expect(
        page.getByText(
          'Validation éditoriale du propriétaire. Collation de la citation et vérification des attributions non attestées.',
          { exact: true },
        ),
      ).toBeVisible();
    if (i === 0) {
      await expect(page.locator('blockquote[lang=ar][dir=rtl]')).toBeVisible();
      await capture('correction');
      const correctionAxe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(correctionAxe.violations).toEqual([]);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page
      .getByRole('button', { name: i === 9 ? 'Voir mon résultat' : 'Question suivante' })
      .click();
  }
  expect(new Set(prompts).size).toBe(10);
  await expect(page.getByLabel(`Score final : ${target} sur 10`)).toBeVisible();
  expect(await page.locator('.quiz-recap h2').allTextContents()).toEqual(prompts);
  await capture('resultat');
  expect(payloads).toHaveLength(1);
  const ids = [...payloads[0].matchAll(/"id":"([^"]+)"/g)]
    .map((m) => m[1])
    .filter((id) => liveBank.questions.some((q) => q.id === id));
  expect(new Set(ids).size).toBe(10);
  expect(ids.every((id) => allowed.some((q) => q.id === id))).toBe(true);
  await page.getByRole('button', { name: 'Rejouer', exact: true }).click();
  await expect(page.getByText('Question 1 sur 10', { exact: true })).toBeVisible();
  await expect(page.getByText('Score : 0/10', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Valider ma réponse' })).toBeDisabled();
  expect(payloads).toHaveLength(2);
});

test('Mode global : échec récupérable et double clic pendant un chargement', async ({ page }) => {
  await page.goto('/quiz/aleatoire');
  const intercept = async (route: import('@playwright/test').Route) => {
    if (route.request().method() === 'POST')
      await route.fulfill({ status: 503, body: 'Indisponible' });
    else await route.continue();
  };
  await page.route('**/quiz/aleatoire', intercept);
  await page.getByRole('button', { name: 'Commencer le quiz' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Veuillez réessayer');
  await page.unroute('**/quiz/aleatoire', intercept);
  let release!: () => void;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  let posts = 0;
  await page.route('**/quiz/aleatoire', async (route) => {
    if (route.request().method() === 'POST') {
      posts++;
      await wait;
    }
    await route.continue();
  });
  await page
    .getByRole('button', { name: 'Commencer le quiz' })
    .evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
  await expect(page.getByRole('button', { name: 'Chargement…' })).toBeDisabled();
  release();
  await expect(page.getByText('Question 1 sur 10', { exact: true })).toBeVisible();
  expect(posts).toBe(1);
});
