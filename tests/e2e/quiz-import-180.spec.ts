import { test, expect } from '@playwright/test';
import { pending180Lots } from '../../src/lib/quiz-v13-pending-180';
import { candidateBatchSchema } from '../../src/lib/quiz-v13-editorial';
const banks = pending180Lots.map((l) => candidateBatchSchema.parse(l.batch));
test('Les 180 ajouts éditoriaux restent absents du HTML, du JavaScript et des tentatives publiques', async ({
  page,
  request,
}) => {
  test.setTimeout(90000);
  const forbidden = banks.flatMap((b) => b.questions).map((q) => q.id);
  let lastPayload = '';
  await page.route('**/quiz/niveaux/**', async (route) => {
    if (route.request().method() === 'POST' && route.request().headers()['next-action']) {
      const response = await route.fetch();
      lastPayload = await response.text();
      await route.fulfill({ response });
    } else await route.continue();
  });
  await page.goto('/quiz/niveaux');
  await expect(page.locator('.quiz-book-card')).toHaveCount(15);
  await expect(
    page.getByText('10 questions par partie (40 questions dans la banque)', { exact: true }),
  ).toHaveCount(3);
  await expect(
    page.getByText('10 questions par partie (10 questions dans la banque)', { exact: true }),
  ).toHaveCount(12);
  const scripts = await page
    .locator('script[src]')
    .evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute('src')!).filter((s) => s.includes('/_next/')),
    );
  for (const src of scripts) {
    const js = await (await request.get(src)).text();
    for (const id of forbidden) expect(js).not.toContain(id);
  }
  for (const bank of banks) {
    const path = `/quiz/niveaux/${bank.questions[0].level}/${bank.bookId}`;
    const html = await (await request.get(path)).text();
    for (const q of bank.questions) {
      expect(html).not.toContain(q.id);
      expect(html).not.toContain(q.questionFr);
    }
    await page.goto(path);
    await expect(
      page.getByText('10 questions par partie (10 questions dans la banque)', { exact: true }),
    ).toBeVisible();
    lastPayload = '';
    await page.getByRole('button', { name: 'Commencer le quiz' }).click();
    await expect(page.getByText('Question 1 sur 10', { exact: true })).toBeVisible();
    expect(lastPayload).toContain('correctOptionIds');
    for (const id of forbidden) expect(lastPayload).not.toContain(id);
  }
});
