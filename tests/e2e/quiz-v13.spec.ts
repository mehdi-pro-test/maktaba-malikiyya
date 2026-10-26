import { test, expect } from '@playwright/test';
import draftA from '../../docs/quiz-v1.3-pack/recherche-v1.3/01-akhdari-30-candidats.json' with { type: 'json' };
import draftB from '../../docs/quiz-v1.3-pack/recherche-v1.3/02-ibn-ashir-30-candidats.json' with { type: 'json' };
import draftC from '../../docs/quiz-v1.3-pack/recherche-v1.3/03-achmawiyya-30-candidats.json' with { type: 'json' };
import bank from '../../src/data/quiz-v1.2/research.json' with { type: 'json' };
const path = '/quiz/niveaux/debutant/moukhtassar-al-akhdari';

test('Introduction sans banque ni brouillons ; démarrage serveur et stabilité de partie', async ({
  page,
  request,
}) => {
  const html = await (await request.get(path)).text();
  for (const q of [
    ...bank.questions,
    ...draftA.questions,
    ...draftB.questions,
    ...draftC.questions,
  ]) {
    expect(html).not.toContain(q.id);
    expect(html).not.toContain(q.questionFr);
  }
  expect(html).not.toContain('correctOptionIds');
  const actions: string[] = [];
  page.on('request', (req) => {
    if (req.method() === 'POST' && req.headers()['next-action']) actions.push(req.postData() ?? '');
  });
  await page.goto(path);
  await page.getByRole('button', { name: 'Commencer le quiz' }).click();
  await expect(page.locator('.quiz-game h1')).toBeFocused();
  expect(actions).toHaveLength(1);
  const prompt = await page.locator('.quiz-game h1').innerText();
  const q = bank.questions.find((q) => q.questionFr === prompt)!;
  expect(q.bookId).toBe('moukhtassar-al-akhdari');
  await page.getByRole('button', { name: q.options[0].textFr, exact: true }).click();
  await expect(page.locator('.quiz-game h1')).toHaveText(prompt);
  await page.getByRole('button', { name: q.options[1].textFr, exact: true }).click();
  await expect(page.locator('.quiz-game h1')).toHaveText(prompt);
  await page.getByRole('button', { name: 'Valider ma réponse' }).click();
  await expect(page.getByLabel('Références arabes de la correction')).toContainText(
    q.references[0].quoteAr,
  );
  expect(actions).toHaveLength(1);
});

for (const target of [0, 5, 10])
  test(`Banque synthétique 100 : score ${target}/10, dix IDs, rerender stable, Rejouer redemande dix`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    const responses: string[] = [];
    await page.route('**/random', async (route) => {
      if (route.request().method() === 'POST' && route.request().headers()['next-action']) {
        const response = await route.fetch();
        responses.push(await response.text());
        await route.fulfill({ response });
      } else await route.continue();
    });
    await page.goto('http://127.0.0.1:3101/random');
    await expect(page.getByText('10 questions par partie', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Commencer le quiz' }).click();
    const prompts: string[] = [];
    for (let i = 0; i < 10; i++) {
      await expect(page.getByText(`Question ${i + 1} sur 10`, { exact: true })).toBeVisible();
      const prompt = await page.locator('.quiz-game h1').innerText();
      prompts.push(prompt);
      await page.getByRole('button', { name: /Rerender de test/ }).click();
      await expect(page.locator('.quiz-game h1')).toHaveText(prompt);
      await expect(page.locator('blockquote')).toHaveCount(0);
      await page
        .getByRole('button', { name: i < target ? 'Premier choix' : 'Deuxième choix', exact: true })
        .click();
      await page.getByRole('button', { name: 'Valider ma réponse' }).click();
      await expect(page.locator('blockquote[lang="ar"][dir="rtl"]')).toHaveText('نص تجريبي فقط');
      await page
        .getByRole('button', { name: i === 9 ? 'Voir mon résultat' : 'Question suivante' })
        .click();
    }
    expect(new Set(prompts).size).toBe(10);
    await expect(page.getByLabel(`Score final : ${target} sur 10`)).toBeVisible();
    await expect(page.locator('.quiz-recap article')).toHaveCount(10);
    expect(await page.locator('.quiz-recap h2').allTextContents()).toEqual(prompts);
    expect(responses).toHaveLength(1);
    const payload = responses[0];
    expect(new Set(payload.match(/"id":"synthetic-\d+"/g)).size).toBe(10);
    await page.getByRole('button', { name: 'Rejouer', exact: true }).click();
    await expect(page.getByText('Question 1 sur 10', { exact: true })).toBeVisible();
    await expect(page.getByText('Score : 0/10', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Valider ma réponse' })).toBeDisabled();
    expect(responses).toHaveLength(2);
    expect(new Set(responses[1].match(/"id":"synthetic-\d+"/g)).size).toBe(10);
  });

test('Échec réseau : message accessible et nouvelle tentative possible', async ({ page }) => {
  await page.goto('http://127.0.0.1:3101/random');
  const intercept = async (route: import('@playwright/test').Route) => {
    if (route.request().method() === 'POST')
      await route.fulfill({ status: 503, body: 'Indisponible' });
    else await route.continue();
  };
  await page.route('**/random', intercept);
  await page.getByRole('button', { name: 'Commencer le quiz' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Veuillez réessayer');
  await expect(page.getByRole('button', { name: 'Commencer le quiz' })).toBeEnabled();
  await page.unroute('**/random', intercept);
  await page.getByRole('button', { name: 'Commencer le quiz' }).click();
  await expect(page.getByText('Question 1 sur 10', { exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
});
