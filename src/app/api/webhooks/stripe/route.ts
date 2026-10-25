import { NextResponse } from 'next/server';
import { stripeClient } from '@/lib/payments';
import { applySession } from '@/lib/orders';
import { deliverEmail } from '@/lib/email';
import type Stripe from 'stripe';
import { readLimitedBody } from '@/lib/request';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET)
    return NextResponse.json({ error: 'Signature requise.' }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(
      await readLimitedBody(request, 1000000),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: 'Signature ou configuration invalide.' }, { status: 400 });
  }
  if (event.livemode) return NextResponse.json({ error: 'Mode live interdit.' }, { status: 400 });
  if (!['checkout.session.completed', 'checkout.session.expired'].includes(event.type))
    return NextResponse.json({ received: true });
  const session = event.data.object as Stripe.Checkout.Session;
  try {
    await applySession(event.id, event.type, session);
    if (session.metadata?.orderId) await deliverEmail(session.metadata.orderId);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Traitement temporairement indisponible.' }, { status: 503 });
  }
}
