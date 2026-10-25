import 'dotenv/config';
import type Stripe from 'stripe';
import { db } from '../src/lib/db';
import { stripeClient } from '../src/lib/payments';
import { applySession } from '../src/lib/orders';
import { deliverEmail } from '../src/lib/email';
const stripe = stripeClient();
for (const order of await db.order.findMany({ where: { status: 'PENDING_PAYMENT' } })) {
  let session: Stripe.Checkout.Session | null = order.stripeSessionId
    ? await stripe.checkout.sessions.retrieve(order.stripeSessionId)
    : null;
  if (!session) {
    // Resolve ambiguous create timeouts without releasing potentially paid stock.
    for await (const candidate of stripe.checkout.sessions.list({
      created: { gte: Math.floor(order.createdAt.getTime() / 1000) - 60 },
      limit: 100,
    })) {
      if (candidate.metadata?.orderId === order.id) {
        session = candidate;
        break;
      }
    }
  }
  if (!session) {
    console.log('Commande sans session : vérification manuelle nécessaire', order.reference);
    continue;
  }
  if (session.status === 'open' && session.expires_at * 1000 < Date.now())
    session = await stripe.checkout.sessions.expire(session.id);
  if (session.status === 'complete' && session.payment_status === 'paid') {
    await applySession(`reconcile-paid-${session.id}`, 'checkout.session.completed', session);
    await deliverEmail(order.id);
  } else if (session.status === 'expired')
    await applySession(`reconcile-expired-${session.id}`, 'checkout.session.expired', session);
}
await db.$disconnect();
