import { test, expect } from '@playwright/test';
import { liveBank } from '../fixtures/quiz-live-bank';
for (const [bookId, poolSize, target] of [
  ['bidayat-al-mujtahid', 150, 5],
  ['al-istidhkar', 60, 10],
] as const)
  test(`Ultime ${bookId} : dix parmi ${poolSize}, score ${target}/10 et Rejouer`, async ({
    page,
    request,
  }) => {
    test.setTimeout(90000);
    const path = `/quiz/niveaux/ultime/${bookId}`;
    const allowed = liveBank.questions.filter((q) => q.bookId === bookId);
    expect(allowed).toHaveLength(poolSize);
    const html = await (await request.get(path)).text();
    for (const q of allowed) expect(html).not.toContain(q.id);
    const payloads: string[] = [];
    await page.route('**/quiz/niveaux/ultime/**', async (route) => {
      if (route.request().method() === 'POST' && route.request().headers()['next-action']) {
        const response = await route.fetch();
        payloads.push(await response.text());
        await route.fulfill({ response });
      } else await route.continue();
    });
    await page.goto(path);
    if (bookId === 'bidayat-al-mujtahid') {
      const ownerIds = liveBank.questions
        .filter((q) => q.id.includes('-v13-ultime-'))
        .map((q) => q.id);
      const scripts = await page
        .locator('script[src]')
        .evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute('src')!).filter((src) => src.includes('/_next/')),
        );
      for (const src of scripts) {
        const js = await (await request.get(src)).text();
        for (const id of ownerIds) expect(js).not.toContain(id);
      }
    }
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
