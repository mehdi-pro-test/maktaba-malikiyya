import { Resend } from 'resend';
import { db } from './db';
import { money } from './rules';
export async function deliverEmail(orderId: string) {
  const delivery = await db.emailDelivery.findUnique({
    where: { orderId },
    include: { order: { include: { items: true } } },
  });
  if (!delivery || delivery.status === 'SENT') return;
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    await db.emailDelivery.update({ where: { orderId }, data: { status: 'NOT_CONFIGURED' } });
    return;
  }
  // Retry only within Resend's 24h idempotency retention. Older unknown outcomes need manual verification.
  if (delivery.attempts > 0 && Date.now() - delivery.createdAt.getTime() > 23 * 3600000) {
    await db.emailDelivery.update({ where: { orderId }, data: { status: 'REQUIRES_REVIEW' } });
    return;
  }
  const claimed = await db.emailDelivery.updateMany({
    where: { orderId, status: { in: ['PENDING', 'FAILED', 'NOT_CONFIGURED'] } },
    data: { status: 'SENDING', attempts: { increment: 1 } },
  });
  if (!claimed.count) return;
  const o = delivery.order;
  try {
    const result = await new Resend(process.env.RESEND_API_KEY).emails.send(
      {
        from: process.env.RESEND_FROM_EMAIL,
        to: o.email,
        subject: `Confirmation ${o.reference} — paiement de test`,
        text: `Merci pour votre commande ${o.reference}.\nPaiement de test — aucune somme débitée.\n\n${o.items.map((i) => `${i.quantity} × ${i.titleFr} : ${money(i.unitPriceCents * i.quantity)}`).join('\n')}\nSous-total : ${money(o.subtotalCents)}\nLivraison : ${money(o.shippingCents)}\nTotal : ${money(o.totalCents)}\nDestination : ${o.city}, ${o.countryCode}`,
      },
      { idempotencyKey: `order-confirmation/${orderId}` },
    );
    if (result.error) throw new Error('Provider refused');
    await db.emailDelivery.update({
      where: { orderId },
      data: { status: 'SENT', providerMessageId: result.data?.id },
    });
  } catch {
    await db.emailDelivery.update({ where: { orderId }, data: { status: 'FAILED' } });
  }
}
