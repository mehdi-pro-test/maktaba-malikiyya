import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
// Separate Next test application. No fixture route exists in the production application.
for (const target of [0, 5, 10])
  test(`Fixture seulement : score ${target}/10, correction arabe et rejouer`, async ({
    page,
  }, testInfo) => {
    await page.goto('http://127.0.0.1:3101');
    await expect(page.getByText(/Fixture synthétique/)).toBeVisible();
    await page.getByRole('button', { name: 'Commencer le quiz' }).click();
    for (let i = 0; i < 10; i++) {
      await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
      await expect(page.getByRole('button', { name: 'Valider ma réponse' })).toBeDisabled();
      await expect(page.getByText('نص تجريبي للاختبار فقط', { exact: true })).toHaveCount(0);
      const choice = page.getByRole('button', {
        name: i < target ? 'Premier choix' : 'Deuxième choix',
        exact: true,
      });
      await choice.focus();
      await page.keyboard.press('Enter');
      const validate = page.getByRole('button', { name: 'Valider ma réponse' });
      await validate.dblclick();
      await expect(
        page.getByText(`Score : ${Math.min(i + 1, target)}/10`, { exact: true }),
      ).toBeVisible();
      await expect(page.getByText('نص تجريبي للاختبار فقط', { exact: true })).toBeVisible();
      const link = page.getByRole('link', { name: 'Consulter le passage arabe' });
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      if (i === 0) {
        expect(
          (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
            .violations,
        ).toEqual([]);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await page.screenshot({
          path: `test-results/quiz-v12-fixture-${target}-${testInfo.project.name}.png`,
          fullPage: true,
        });
      }
      await page
        .getByRole('button', { name: i === 9 ? 'Voir mon résultat' : 'Question suivante' })
        .click();
    }
    await expect(page.getByLabel(`Score final : ${target} sur 10`)).toBeVisible();
    await expect(page.locator('.quiz-recap article')).toHaveCount(10);
    await expect(page.getByRole('link', { name: 'Retour aux niveaux' })).toBeVisible();
    await page.getByRole('button', { name: 'Rejouer' }).click();
    await expect(page.getByText('Score : 0/10', { exact: true })).toBeVisible();
    await expect(page.getByText('Question 1 sur 10')).toBeVisible();
  });
