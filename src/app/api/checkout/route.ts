import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { stripeClient, appUrl } from '@/lib/payments';
import { reserveOrder } from '@/lib/orders';
import { db } from '@/lib/db';
import { readLimitedBody } from '@/lib/request';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const origin = appUrl();
    if (request.headers.get('origin') !== origin)
      return NextResponse.json({ error: 'Origine de la demande refusée.' }, { status: 403 });
    const body = await readLimitedBody(request, 12000);
    if (body.length > 12000)
      return NextResponse.json({ error: 'Demande trop volumineuse.' }, { status: 413 });
    const stripe = stripeClient(); // Fail BEFORE reserving inventory if credentials missing/live.
    const { order, token } = await reserveOrder(JSON.parse(body));
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        payment_method_types: ['card'],
        client_reference_id: order.id,
        metadata: { orderId: order.id },
        customer_email: order.email,
        expires_at: Math.floor(Date.now() / 1000) + 1800,
        line_items: [
          ...order.items.map((i) => ({
            price_data: {
              currency: 'eur',
              product_data: { name: i.titleFr },
              unit_amount: i.unitPriceCents,
            },
            quantity: i.quantity,
          })),
          ...(order.shippingCents
            ? [
                {
                  price_data: {
                    currency: 'eur',
                    product_data: { name: 'Livraison' },
                    unit_amount: order.shippingCents,
                  },
                  quantity: 1,
                },
              ]
            : []),
        ],
        success_url: `${origin}/commande/confirmation?token=${token}`,
        cancel_url: `${origin}/panier?annulation=1`,
      },
      { idempotencyKey: `checkout/${order.id}` },
    );
    if (session.livemode || !session.url) throw new Error('Session de test indisponible.');
    await db.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    return NextResponse.json({ url: session.url }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof RangeError)
      return NextResponse.json({ error: 'Demande trop volumineuse.' }, { status: 413 });
    if (error instanceof SyntaxError)
      return NextResponse.json({ error: 'Demande JSON invalide.' }, { status: 400 });
    if (error instanceof ZodError)
      return NextResponse.json(
        { error: 'Vérifiez les quantités, votre e-mail et tous les champs de livraison.' },
        { status: 400 },
      );
    const safe =
      error instanceof Error &&
      /Stock insuffisant|indisponible|métropolitaine|desservi|attente|clé Stripe de test/.test(
        error.message,
      );
    return NextResponse.json(
      {
        error: safe
          ? (error as Error).message
          : 'La commande ne peut pas être créée. Réessayez ultérieurement.',
      },
      { status: safe ? 400 : 503 },
    );
  }
}
