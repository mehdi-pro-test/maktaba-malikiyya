import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import Stripe from 'stripe';
import { db } from '../src/lib/db';
import { reserveOrder, applySession } from '../src/lib/orders';
import { deliverEmail } from '../src/lib/email';
import { GET } from '../src/app/api/orders/route';
import { POST as webhook } from '../src/app/api/webhooks/stripe/route';
import { POST as checkout } from '../src/app/api/checkout/route';
// Offline fixtures exclusively: no request to Stripe or Resend occurs in this suite.
const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendEmail };
  },
}));
const fixtureClient = new Stripe('sk_test_OFFLINE_FIXTURE_NOT_A_CREDENTIAL');
vi.mock('../src/lib/payments', async (original) => ({
  ...(await original<typeof import('../src/lib/payments')>()),
  stripeClient: () => fixtureClient,
}));
const input = (quantity = 1, email = 'test@example.com') => ({
  items: [{ productId: 'moshaf-coran', quantity }],
  email,
  recipient: 'Client Test',
  address: '1 rue fictive',
  postalCode: '75001',
  city: 'Paris',
  countryCode: 'FR',
});
function session(orderId: string, amount = 1400, status: 'complete' | 'expired' = 'complete') {
  return {
    id: `cs_test_${orderId}`,
    object: 'checkout.session',
    livemode: false,
    metadata: { orderId },
    payment_status: status === 'complete' ? 'paid' : 'unpaid',
    status,
    amount_total: amount,
    currency: 'eur',
  } as unknown as Stripe.Checkout.Session;
}
beforeEach(async () => {
  if (!process.env.DATABASE_URL?.includes('maktaba_test'))
    throw new Error('Tests destructifs : DATABASE_URL doit désigner maktaba_test.');
  await db.$executeRawUnsafe(
    'TRUNCATE "EmailDelivery","WebhookEvent","StockReservation","OrderItem","Order","Product" CASCADE',
  );
  await db.product.create({
    data: {
      id: 'moshaf-coran',
      slug: 'moshaf-coran',
      titleFr: 'Coran (Moshaf)',
      titleAr: 'مصحف القرآن الكريم',
      category: 'coran',
      imagePath: '/images/coran.svg',
      priceCents: 1000,
      stockOnHand: 10,
    },
  });
  sendEmail.mockReset();
  vi.stubEnv('APP_URL', 'http://localhost:3000');
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_OFFLINE_TEST_FIXTURE');
  vi.stubEnv('RESEND_API_KEY', '');
  vi.stubEnv('RESEND_FROM_EMAIL', '');
});
afterAll(async () => {
  vi.unstubAllEnvs();
  await db.$disconnect();
});
describe('Commandes réelles en PostgreSQL, prestataires simulés', () => {
  it('réserve sans vendre puis paiement idempotent sous concurrence', async () => {
    const { order, token } = await reserveOrder(input());
    expect(order.totalCents).toBe(1400);
    expect(
      (await db.product.findUniqueOrThrow({ where: { id: 'moshaf-coran' } })).stockOnHand,
    ).toBe(10);
    await Promise.all([
      applySession('evt_1', 'checkout.session.completed', session(order.id)),
      applySession('evt_1', 'checkout.session.completed', session(order.id)),
      applySession('evt_2', 'checkout.session.completed', session(order.id)),
    ]);
    expect(
      (await db.product.findUniqueOrThrow({ where: { id: 'moshaf-coran' } })).stockOnHand,
    ).toBe(9);
    expect(await db.emailDelivery.count()).toBe(1);
    expect(await db.order.count({ where: { status: 'PAID' } })).toBe(1);
    await deliverEmail(order.id);
    expect(
      (await db.emailDelivery.findUniqueOrThrow({ where: { orderId: order.id } })).status,
    ).toBe('NOT_CONFIGURED');
    const response = await GET(new Request(`http://localhost:3000/api/orders?token=${token}`));
    const safe = await response.json();
    expect(safe.reference).toBe(order.reference);
    expect(safe).not.toHaveProperty('email');
    expect(safe).not.toHaveProperty('address');
    expect(
      (await GET(new Request(`http://localhost:3000/api/orders?token=${order.id}`))).status,
    ).toBe(404);
  });
  it('le dernier livre ne peut être réservé que par un acheteur', async () => {
    await db.product.update({ where: { id: 'moshaf-coran' }, data: { stockOnHand: 1 } });
    const results = await Promise.allSettled([
      reserveOrder(input(1, 'a@example.com')),
      reserveOrder(input(1, 'b@example.com')),
    ]);
    expect(results.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
    expect(await db.stockReservation.count({ where: { status: 'ACTIVE' } })).toBe(1);
  });
  it('agrège les lignes doublées et refuse la sur-réservation', async () => {
    await expect(
      reserveOrder({
        ...input(),
        items: [
          { productId: 'moshaf-coran', quantity: 6 },
          { productId: 'moshaf-coran', quantity: 5 },
        ],
      }),
    ).rejects.toThrow();
    expect(await db.order.count()).toBe(0);
  });
  it('respecte le seuil de gratuité à 50 €', async () =>
    expect((await reserveOrder(input(5))).order.totalCents).toBe(5000));
  it('applique 20 € hors France', async () =>
    expect(
      (await reserveOrder({ ...input(), countryCode: 'BE', postalCode: '1000' })).order.totalCents,
    ).toBe(3000));
  it('ne libère jamais une réservation sur la seule horloge locale', async () => {
    const { order } = await reserveOrder(input());
    await db.stockReservation.updateMany({ data: { expiresAt: new Date(0) } });
    expect(
      (await db.stockReservation.findFirstOrThrow({ where: { orderId: order.id } })).status,
    ).toBe('ACTIVE');
  });
  it('expiration vérifiée libère sans décrément puis paiement tardif exige revue', async () => {
    const { order } = await reserveOrder(input());
    await applySession('expired', 'checkout.session.expired', session(order.id, 1400, 'expired'));
    expect((await db.stockReservation.findFirstOrThrow()).status).toBe('RELEASED');
    await applySession('late', 'checkout.session.completed', session(order.id));
    expect((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe(
      'REQUIRES_REVIEW',
    );
    expect((await db.product.findFirstOrThrow()).stockOnHand).toBe(10);
  });
  it('montant incorrect exige revue sans vendre', async () => {
    const { order } = await reserveOrder(input());
    await applySession('wrong', 'checkout.session.completed', session(order.id, 1));
    expect((await db.order.findFirstOrThrow()).status).toBe('REQUIRES_REVIEW');
    expect((await db.product.findFirstOrThrow()).stockOnHand).toBe(10);
  });
  it('ne paie pas via un retour navigateur et refuse session différente', async () => {
    const { order, token } = await reserveOrder(input());
    await GET(new Request(`http://localhost:3000/api/orders?token=${token}`));
    expect((await db.order.findFirstOrThrow()).status).toBe('PENDING_PAYMENT');
    await db.order.update({ where: { id: order.id }, data: { stripeSessionId: 'cs_other' } });
    await expect(
      applySession('different', 'checkout.session.completed', session(order.id)),
    ).rejects.toThrow('incohérente');
  });
  it('vérifie une vraie signature Stripe hors réseau puis refuse sa falsification', async () => {
    const { order } = await reserveOrder(input());
    const payload = JSON.stringify({
      id: 'evt_signed',
      type: 'checkout.session.completed',
      livemode: false,
      data: { object: session(order.id) },
    });
    const signature = fixtureClient.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    });
    const request = () =>
      new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': signature },
        body: payload,
      });
    expect((await webhook(request())).status).toBe(200);
    expect((await webhook(request())).status).toBe(200);
    expect((await db.product.findFirstOrThrow()).stockOnHand).toBe(9);
    expect(
      (
        await webhook(
          new Request('http://localhost:3000/api/webhooks/stripe', {
            method: 'POST',
            headers: { 'stripe-signature': 'invalid' },
            body: payload,
          }),
        )
      ).status,
    ).toBe(400);
  });
  it('rejette les requêtes cross-origin avant toute mutation', async () => {
    const r = await checkout(
      new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { origin: 'https://evil.example' },
        body: JSON.stringify(input()),
      }),
    );
    expect(r.status).toBe(403);
    expect(await db.order.count()).toBe(0);
  });
  it('création de Checkout utilise les prix serveur et la carte exclusivement', async () => {
    const create = vi.spyOn(fixtureClient.checkout.sessions, 'create').mockResolvedValue({
      id: 'cs_test_mock',
      url: 'https://checkout.stripe.com/c/pay/cs_test_mock',
      livemode: false,
    } as Stripe.Response<Stripe.Checkout.Session>);
    const r = await checkout(
      new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { origin: 'http://localhost:3000' },
        body: JSON.stringify(input()),
      }),
    );
    expect(r.status).toBe(200);
    const args = create.mock.calls[0][0] as Stripe.Checkout.SessionCreateParams;
    expect(args.payment_method_types).toEqual(['card']);
    expect(args.line_items?.[0].price_data?.unit_amount).toBe(1000);
    expect(args.line_items?.[1].price_data?.unit_amount).toBe(400);
    create.mockRestore();
  });
  it('ne crée ni commande ni paiement pour un prix injecté', async () => {
    const r = await checkout(
      new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { origin: 'http://localhost:3000' },
        body: JSON.stringify({ ...input(), price: 0 }),
      }),
    );
    expect(r.status).toBe(400);
    expect(await db.order.count()).toBe(0);
  });
  it('refuse un événement live', async () => {
    const { order } = await reserveOrder(input());
    await expect(
      applySession('live', 'checkout.session.completed', { ...session(order.id), livemode: true }),
    ).rejects.toThrow('live');
    expect((await db.product.findFirstOrThrow()).stockOnHand).toBe(10);
  });
  it('envoi e-mail concurrent unique et clé d’idempotence stable', async () => {
    const { order } = await reserveOrder(input());
    await applySession('email-paid', 'checkout.session.completed', session(order.id));
    vi.stubEnv('RESEND_API_KEY', 'OFFLINE_FIXTURE');
    vi.stubEnv('RESEND_FROM_EMAIL', 'test@example.com');
    sendEmail.mockResolvedValue({ data: { id: 'offline-message' }, error: null });
    await Promise.all([deliverEmail(order.id), deliverEmail(order.id)]);
    await deliverEmail(order.id);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0][1]).toEqual({
      idempotencyKey: `order-confirmation/${order.id}`,
    });
    expect((await db.emailDelivery.findFirstOrThrow()).status).toBe('SENT');
  });
  it('panne e-mail : paiement conservé et réessai sans nouvelle vente', async () => {
    const { order } = await reserveOrder(input());
    await applySession('email-fail', 'checkout.session.completed', session(order.id));
    vi.stubEnv('RESEND_API_KEY', 'OFFLINE_FIXTURE');
    vi.stubEnv('RESEND_FROM_EMAIL', 'test@example.com');
    sendEmail.mockResolvedValueOnce({ error: { message: 'offline failure' }, data: null });
    await deliverEmail(order.id);
    expect((await db.emailDelivery.findFirstOrThrow()).status).toBe('FAILED');
    expect((await db.order.findFirstOrThrow()).status).toBe('PAID');
    sendEmail.mockResolvedValueOnce({ data: { id: 'offline-retry' }, error: null });
    await deliverEmail(order.id);
    expect((await db.emailDelivery.findFirstOrThrow()).status).toBe('SENT');
    expect(sendEmail.mock.calls[0][1]).toEqual(sendEmail.mock.calls[1][1]);
    expect((await db.product.findFirstOrThrow()).stockOnHand).toBe(9);
  });
  it('une reprise e-mail après rétention fournisseur nécessite une revue', async () => {
    const { order } = await reserveOrder(input());
    await applySession('email-old', 'checkout.session.completed', session(order.id));
    await db.emailDelivery.update({
      where: { orderId: order.id },
      data: { status: 'FAILED', attempts: 1, createdAt: new Date(Date.now() - 25 * 3600000) },
    });
    vi.stubEnv('RESEND_API_KEY', 'OFFLINE_FIXTURE');
    vi.stubEnv('RESEND_FROM_EMAIL', 'test@example.com');
    await deliverEmail(order.id);
    expect(sendEmail).not.toHaveBeenCalled();
    expect((await db.emailDelivery.findFirstOrThrow()).status).toBe('REQUIRES_REVIEW');
  });
  it('une expiration reçue après paiement ne rétablit pas le stock', async () => {
    const { order } = await reserveOrder(input());
    await applySession('paid-before-expire', 'checkout.session.completed', session(order.id));
    await applySession(
      'expired-after-paid',
      'checkout.session.expired',
      session(order.id, 1400, 'expired'),
    );
    expect((await db.order.findFirstOrThrow()).status).toBe('PAID');
    expect((await db.stockReservation.findFirstOrThrow()).status).toBe('CONSUMED');
    expect((await db.product.findFirstOrThrow()).stockOnHand).toBe(9);
  });
  it('prix et titres figés malgré un changement du catalogue après réservation', async () => {
    const { order } = await reserveOrder(input());
    await db.product.update({
      where: { id: 'moshaf-coran' },
      data: { priceCents: 2000, titleFr: 'Titre modifié' },
    });
    await applySession('snapshot-paid', 'checkout.session.completed', session(order.id));
    expect((await db.orderItem.findFirstOrThrow()).unitPriceCents).toBe(1000);
    expect((await db.orderItem.findFirstOrThrow()).titleFr).toBe('Coran (Moshaf)');
    expect((await db.order.findFirstOrThrow()).status).toBe('PAID');
  });
  it('refuse le JSON invalide et les corps trop volumineux sans mutation', async () => {
    const request = (body: string) =>
      new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { origin: 'http://localhost:3000' },
        body,
      });
    expect((await checkout(request('{invalid'))).status).toBe(400);
    expect((await checkout(request('x'.repeat(12001)))).status).toBe(413);
    expect(await db.order.count()).toBe(0);
  });
  it('refuse le checkout sans webhook configuré avant toute réservation', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
    const response = await checkout(
      new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { origin: 'http://localhost:3000' },
        body: JSON.stringify(input()),
      }),
    );
    expect(response.status).toBe(503);
    expect(await db.order.count()).toBe(0);
    expect(await db.stockReservation.count()).toBe(0);
  });
  it('l’API refuse Akhdari sans créer de session Stripe même si les services sont configurés', async () => {
    const create = vi.spyOn(fixtureClient.checkout.sessions, 'create');
    const response = await checkout(
      new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { origin: 'http://localhost:3000' },
        body: JSON.stringify({
          ...input(),
          items: [{ productId: 'mukhtasar-al-akhdari', quantity: 1 }],
        }),
      }),
    );
    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
    expect(await db.order.count()).toBe(0);
    expect(await db.stockReservation.count()).toBe(0);
    create.mockRestore();
  });
});
