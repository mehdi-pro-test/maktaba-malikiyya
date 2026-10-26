import { db } from '../../src/lib/db';
import { purchasableCatalog } from '../../src/lib/catalog';
import { reserveOrder, applySession } from '../../src/lib/orders';
import { deliverEmail } from '../../src/lib/email';
import type Stripe from 'stripe';
try {
  const catalog = await purchasableCatalog();
  if (!catalog.some((p) => p.id === 'compat-book')) throw new Error('Catalogue historique absent');
  const { order } = await reserveOrder({
    items: [{ productId: 'compat-book', quantity: 1 }],
    email: 'compat@example.invalid',
    recipient: 'Client fixture',
    address: 'Adresse fixture',
    postalCode: '75001',
    city: 'Paris',
    countryCode: 'FR',
  });
  const session = {
    id: 'cs_test_compat',
    livemode: false,
    metadata: { orderId: order.id },
    payment_status: 'paid',
    status: 'complete',
    amount_total: order.totalCents,
    currency: 'eur',
  } as unknown as Stripe.Checkout.Session;
  await applySession('evt_compat', 'checkout.session.completed', session);
  await deliverEmail(order.id);
  const stock = await db.product.findUniqueOrThrow({
      where: { id: 'compat-book' },
      select: { stockOnHand: true },
    }),
    paid = await db.order.findUniqueOrThrow({ where: { id: order.id }, select: { status: true } });
  console.log(JSON.stringify({ catalog: true, stock: stock.stockOnHand, payment: paid.status }));
} finally {
  await db.$disconnect();
}
