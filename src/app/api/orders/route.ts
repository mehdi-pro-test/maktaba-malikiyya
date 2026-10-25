import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/orders';
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  if (!/^[a-f0-9]{64}$/.test(token))
    return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
  const order = await db.order.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      reference: true,
      status: true,
      totalCents: true,
      subtotalCents: true,
      shippingCents: true,
      items: { select: { titleFr: true, quantity: true, unitPriceCents: true } },
      emailDelivery: { select: { status: true } },
    },
  });
  return NextResponse.json(order ?? { error: 'Commande introuvable.' }, {
    status: order ? 200 : 404,
    headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
}
