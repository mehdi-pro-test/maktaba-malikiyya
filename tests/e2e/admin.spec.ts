import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { createOTP } from '@better-auth/utils/otp';
import { base32 } from '@better-auth/utils/base32';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { adminE2EConfig } from '../fixtures/admin-e2e/environment';
import { liveBank } from '../fixtures/quiz-live-bank';
const base = 'http://localhost:3102';
const field = (page: Page, label: string, options?: { exact?: boolean }) =>
  page.getByLabel(label, options).filter({ visible: true });
const visibleText = (page: Page, text: string | RegExp, options?: { exact?: boolean }) =>
  page.getByText(text, options).filter({ visible: true });
const config = () => adminE2EConfig();
let client: PrismaClient;
test.beforeAll(() => {
  client = new PrismaClient({ adapter: new PrismaPg({ connectionString: config().databaseURL }) });
});
test.afterAll(async () => {
  await client?.$disconnect();
});
async function login(page: Page) {
  await page
    .context()
    .setExtraHTTPHeaders({ 'x-forwarded-for': '127.0.1.' + (Math.floor(Math.random() * 200) + 1) });
  await page.goto(base + '/connexion');
  await field(page, 'Pseudo ou e-mail administrateur').fill(config().email);
  await field(page, 'Mot de passe', { exact: true }).fill(config().password);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(field(page, 'Code de l’application d’authentification')).toBeVisible();
  const code = await createOTP(base32.decode(config().totpSecret!)).totp();
  await field(page, 'Code de l’application d’authentification').fill(code);
  await page.getByRole('button', { name: 'Vérifier le second facteur' }).click();
  await expect(page.getByRole('heading', { name: 'Tableau de bord', exact: true })).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: /Administration/ }),
  ).toBeVisible();
}
async function command(page: Page, command: string, input: unknown) {
  return page.request.post(base + '/api/admin/mutate', {
    headers: { origin: base },
    data: { command, input },
  });
}
async function capture(page: Page, name: string, project: string) {
  mkdirSync('test-results/admin-captures', { recursive: true });
  await page.screenshot({
    path: `test-results/admin-captures/${project}-${name}.png`,
    fullPage: true,
  });
}
test('anonyme et mot de passe seul : aucune donnée privée, aucune mutation, aucune inscription propriétaire', async ({
  page,
  request,
}) => {
  const q = await client.order.findUniqueOrThrow({ where: { id: config().paidOrderId! } });
  for (const path of [
    '/admin',
    '/admin/commandes',
    '/admin/commandes/' + q.id,
    '/admin/stocks',
    '/admin/catalogue',
    '/admin/quiz',
    '/admin/activite',
    '/admin/compte',
  ]) {
    const response = await request.get(base + path);
    const html = await response.text();
    expect(html).not.toContain(q.address);
    expect(html).not.toContain(q.email);
    expect(html).not.toContain(q.reference);
  }
  const denied = await request.post(base + '/api/admin/mutate', {
    headers: { origin: base },
    data: { command: 'stock', input: {} },
  });
  expect(denied.status()).toBe(401);
  expect(
    (
      await request.post(base + '/api/auth/sign-up/email', {
        headers: { origin: base },
        data: { email: 'other@example.invalid', password: 'invalid-fixture' },
      })
    ).status(),
  ).toBe(404);
  await page.goto(base + '/connexion');
  await field(page, 'Pseudo ou e-mail administrateur').fill(config().email);
  await field(page, 'Mot de passe', { exact: true }).fill(config().password);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(field(page, 'Code de l’application d’authentification')).toBeVisible();
  const blocked = await page.request.get(base + '/api/admin/export-commandes');
  expect([401, 403]).toContain(blocked.status());
});
test('parcours réel : connexion MFA, catalogue, stock, logistique, publication et archivage sans redéploiement', async ({
  page,
  browser,
}, info) => {
  test.setTimeout(180000);
  page.setDefaultTimeout(10000);
  await login(page);
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
  await capture(page, 'dashboard', info.project.name);
  const suffix = randomUUID().slice(0, 8),
    title = 'Livre de recette ' + suffix,
    slug = 'recette-' + suffix;
  await page.goto(base + '/admin/catalogue/nouveau');
  await expect(field(page, 'Titre français')).toHaveCount(1);
  await field(page, 'Titre français').fill(title);
  await field(page, 'Titre arabe').fill('كتاب تجريبي');
  await field(page, 'Lien du livre (immuable)').fill(slug);
  await field(page, 'Description française').fill(
    'Description synthétique enregistrée en PostgreSQL.',
  );
  await field(page, 'Prix en centimes EUR').fill('1500');
  await page
    .getByRole('checkbox', { name: 'Je confirme les informations et la visibilité.' })
    .check();
  await page.getByRole('button', { name: 'Créer le brouillon', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/catalogue\/[a-f0-9-]+$/);
  const productId = new URL(page.url()).pathname.split('/').pop()!;
  await expect(page.getByRole('button', { name: 'Enregistrer cette couverture' })).toBeDisabled();
  await expect(visibleText(page, /stockage persistant à configurer/)).toBeVisible();
  await page.goto(base + '/admin/stocks?produit=' + productId);
  await field(page, 'Quantité', { exact: true }).fill('3');
  await field(page, 'Motif', { exact: true }).fill('Réapprovisionnement synthétique de recette');
  await page.getByRole('checkbox', { name: /Je confirme le comptage/ }).check();
  await page.getByRole('button', { name: 'Enregistrer le mouvement' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Mouvement enregistré.' })).toBeVisible();
  expect((await client.product.findUniqueOrThrow({ where: { id: productId } })).stockOnHand).toBe(
    3,
  );
  await page.goto(base + '/admin/catalogue/' + productId);
  await page.getByRole('combobox', { name: /Visibilité/ }).selectOption('PUBLISHED');
  await page
    .getByRole('checkbox', { name: 'Je confirme les informations et la visibilité.' })
    .check();
  await page.getByRole('button', { name: 'Enregistrer le livre', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Fiche enregistrée.' })).toBeVisible();
  const publicProduct = await page.request.get(base + '/livres/' + slug);
  expect(publicProduct.status()).toBe(200);
  expect(await publicProduct.text()).toContain('Description synthétique enregistrée');
  // Offline paid fixture, never an administrator payment mutation or external Stripe call.
  const order = await client.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        reference: 'MM-E2E-' + suffix,
        tokenHash: randomUUID(),
        email: 'client-' + suffix + '@example.invalid',
        recipient: 'Client recette',
        address: 'Adresse synthétique',
        postalCode: '75001',
        city: 'Paris',
        countryCode: 'FR',
        subtotalCents: 1500,
        shippingCents: 400,
        totalCents: 1900,
        status: 'PAID',
        items: {
          create: {
            productId,
            titleFr: title,
            titleAr: 'كتاب تجريبي',
            unitPriceCents: 1500,
            quantity: 1,
          },
        },
      },
    });
    await tx.product.update({ where: { id: productId }, data: { stockOnHand: { decrement: 1 } } });
    return order;
  });
  await page.goto(base + '/admin/catalogue/' + productId);
  await field(page, 'Titre français').fill(title + ' modifié');
  await field(page, 'Prix en centimes EUR').fill('1900');
  await page
    .getByRole('checkbox', { name: 'Je confirme les informations et la visibilité.' })
    .check();
  await page.getByRole('button', { name: 'Enregistrer le livre', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Fiche enregistrée.' })).toBeVisible();
  await page.goto(base + '/admin/commandes?pays=FR&q=' + encodeURIComponent(order.reference));
  await expect(page.getByRole('link', { name: order.reference, exact: true })).toBeVisible();
  await expect(page.locator('td[data-label="Suivi"]:visible')).toHaveText('Non renseigné');
  await page.goto(base + '/admin/commandes?pays=DE&q=' + encodeURIComponent(order.reference));
  await expect(
    visibleText(page, 'Aucune commande correspondant aux filtres.', { exact: true }),
  ).toBeVisible();
  await page.goto(base + '/admin/commandes/' + order.id);
  await expect(visibleText(page, title + ' · 15,00 €', { exact: false })).toBeVisible();
  expect(await page.getByRole('button', { name: /marquer payée/i }).count()).toBe(0);
  await field(page, 'Nouvel état').selectOption('PREPARING');
  await field(page, 'Motif', { exact: true }).fill('Préparation de recette');
  await page.getByRole('checkbox', { name: 'Confirmer cette transition logistique' }).check();
  await page.getByRole('button', { name: 'Mettre à jour le suivi' }).click();
  await expect
    .poll(
      async () =>
        (await client.order.findUniqueOrThrow({ where: { id: order.id } })).fulfillmentStatus,
    )
    .toBe('PREPARING');
  await page.reload();
  await field(page, 'Nouvel état').selectOption('SHIPPED');
  await field(page, 'Transporteur').fill('Transport recette');
  await field(page, 'Numéro de suivi').fill('SUIVI-' + suffix);
  await field(page, 'Motif', { exact: true }).fill('Expédition de recette');
  await page.getByRole('checkbox', { name: 'Confirmer cette transition logistique' }).check();
  await page.getByRole('button', { name: 'Mettre à jour le suivi' }).click();
  await expect
    .poll(
      async () =>
        (await client.order.findUniqueOrThrow({ where: { id: order.id } })).fulfillmentStatus,
    )
    .toBe('SHIPPED');
  expect((await client.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('PAID');
  const shipped = await client.order.findUniqueOrThrow({ where: { id: order.id } });
  expect(
    (
      await command(page, 'fulfillment', {
        orderId: order.id,
        version: shipped.fulfillmentVersion,
        status: 'DELIVERED',
        carrier: shipped.carrier ?? '',
        trackingNumber: shipped.trackingNumber ?? '',
        note: 'Note de clôture synthétique',
        reason: 'Livraison synthétique de recette',
        idempotencyKey: randomUUID(),
      })
    ).ok(),
  ).toBe(true);
  await page.reload();
  await expect(visibleText(page, 'Note de clôture synthétique', { exact: true })).toBeVisible();
  await capture(page, 'commande', info.project.name);
  await page.goto(base + '/admin/commandes/' + config().pendingOrderId);
  await expect(page.getByRole('button', { name: 'Mettre à jour le suivi' })).toHaveCount(0);
  await page.goto(base + '/admin/quiz/nouvelle');
  const prompt = 'Question synthétique de recette ' + suffix;
  await field(page, 'Question française').fill(prompt);
  for (const [i, id] of ['A', 'B', 'C', 'D'].entries())
    await field(page, 'Proposition ' + id, { exact: true }).fill(
      'Choix synthétique ' + String.fromCharCode(65 + i),
    );
  await page.getByRole('radio', { name: 'Bonne réponse A', exact: true }).check();
  await field(page, 'Explication française').fill('Explication synthétique de test uniquement.');
  await field(page, 'Titre arabe', { exact: true }).fill('كتاب تجريبي');
  await field(page, 'Auteur arabe').fill('مؤلف تجريبي');
  await field(page, 'Chapitre arabe').fill('باب تجريبي');
  await field(page, 'Citation arabe exacte').fill('نص تجريبي للاختبار فقط');
  await field(page, 'URL de la source HTTPS').fill('https://example.test/fixture');
  await page.getByRole('checkbox', { name: /Cette question est autonome/ }).check();
  await field(page, 'Motif de cette révision').fill('Création synthétique en recette');
  await page.getByRole('button', { name: 'Prévisualiser côté joueur' }).click();
  await expect(
    page.getByRole('heading', { name: 'Aperçu du brouillon · non publié' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Enregistrer une révision en brouillon' }).click();
  await expect(page).toHaveURL(/\/admin\/quiz\/admin-[a-f0-9-]+$/);
  const questionId = new URL(page.url()).pathname.split('/').pop()!;
  const learnerContext = await browser.newContext(),
    learner = await learnerContext.newPage();
  await learner.goto(base + '/quiz/niveaux/debutant/moukhtassar-al-akhdari');
  await expect(
    visibleText(learner, '10 questions par partie (40 questions dans la banque)', { exact: true }),
  ).toBeVisible();
  expect(await learner.content()).not.toContain(prompt);
  const publication = page
    .locator('.admin-inline-form')
    .filter({ has: page.getByRole('button', { name: 'Publier cette révision', exact: true }) });
  await publication.getByLabel('Motif', { exact: true }).fill('Publication explicite de recette');
  await publication.getByRole('checkbox').check();
  await publication.getByRole('button', { name: 'Publier cette révision', exact: true }).click();
  await expect
    .poll(
      async () =>
        !!(await client.quizQuestionRecord.findUniqueOrThrow({ where: { id: questionId } }))
          .activeRevisionId,
    )
    .toBe(true);
  await learner.reload();
  await expect(
    visibleText(learner, '10 questions par partie (41 questions dans la banque)', { exact: true }),
  ).toBeVisible();
  await learner.goto(base + '/quiz/aleatoire');
  await expect(
    visibleText(learner, '10 questions par partie (470 questions dans la banque)', { exact: true }),
  ).toBeVisible();
  await page.goto(base + '/admin/quiz/' + questionId);
  await capture(page, 'quiz-editeur', info.project.name);
  // Freeze a real learner attempt, then withdraw its visible first question.
  await learner.goto(base + '/quiz/niveaux/debutant/moukhtassar-al-akhdari');
  await learner.getByRole('button', { name: 'Commencer le quiz' }).click();
  const visible = await learner.locator('.quiz-game h1').innerText();
  const baseline = liveBank.questions.find(
    (q) => q.bookId === 'moukhtassar-al-akhdari' && q.questionFr === visible,
  );
  const selectedId = baseline?.id ?? questionId;
  const record = await client.quizQuestionRecord.findUnique({ where: { id: selectedId } });
  expect(
    (
      await command(page, 'quiz-archive', {
        id: selectedId,
        version: record?.version ?? 0,
        archived: true,
        confirmed: true,
        reason: 'Retrait pendant une tentative de recette',
      })
    ).ok(),
  ).toBe(true);
  await expect(learner.locator('.quiz-game h1')).toHaveText(visible);
  const option = baseline
    ? baseline.options.find((o) => o.id === baseline.correctOptionId)!.textFr
    : 'Choix synthétique A';
  await learner.getByRole('button', { name: option, exact: true }).click();
  await learner.getByRole('button', { name: 'Valider ma réponse' }).click();
  await expect(visibleText(learner, 'Score : 1/10', { exact: true })).toBeVisible();
  const archived = await client.quizQuestionRecord.findUniqueOrThrow({ where: { id: selectedId } });
  expect(
    (
      await command(page, 'quiz-archive', {
        id: selectedId,
        version: archived.version,
        archived: false,
        confirmed: true,
        reason: 'Restauration de recette',
      })
    ).ok(),
  ).toBe(true);
  const own = await client.quizQuestionRecord.findUniqueOrThrow({ where: { id: questionId } });
  expect(
    (
      await command(page, 'quiz-archive', {
        id: questionId,
        version: own.version,
        archived: true,
        confirmed: true,
        reason: 'Fin de recette synthétique',
      })
    ).ok(),
  ).toBe(true);
  await learner.goto(base + '/quiz/aleatoire');
  await expect(
    visibleText(learner, '10 questions par partie (469 questions dans la banque)', { exact: true }),
  ).toBeVisible();
  await learnerContext.close();
  await page.goto(base + '/admin/activite');
  await expect(
    page
      .locator('.admin-panel')
      .filter({ hasText: questionId })
      .filter({ has: page.getByRole('heading', { name: 'Publication de question', exact: true }) }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await expect(page).toHaveURL(base + '/connexion');
  const after = await page.request.get(base + '/api/admin/export-commandes');
  expect(after.status()).toBe(401);
});
