import type { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { legacyOrderSelect } from './legacy-select';
type Input = {
  reference: string;
  tokenHash: string;
  email: string;
  recipient: string;
  address: string;
  addressExtra?: string;
  postalCode: string;
  city: string;
  countryCode: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  items: {
    create: {
      productId: string;
      titleFr: string;
      titleAr: string;
      unitPriceCents: number;
      quantity: number;
    }[];
  };
  reservations: { create: { productId: string; quantity: number; expiresAt: Date }[] };
};
/** Same transaction and snapshots; no references to columns absent before V1.4. */
export async function createLegacyOrder(tx: Prisma.TransactionClient, data: Input) {
  const id = randomUUID();
  await tx.$executeRaw`INSERT INTO "Order" (id,reference,"tokenHash",email,recipient,address,"addressExtra","postalCode",city,"countryCode","subtotalCents","shippingCents","totalCents",status,"createdAt","updatedAt") VALUES (${id},${data.reference},${data.tokenHash},${data.email},${data.recipient},${data.address},${data.addressExtra ?? null},${data.postalCode},${data.city},${data.countryCode},${data.subtotalCents},${data.shippingCents},${data.totalCents},'PENDING_PAYMENT',now(),now())`;
  await tx.orderItem.createMany({
    data: data.items.create.map((item) => ({ ...item, orderId: id })),
  });
  await tx.stockReservation.createMany({
    data: data.reservations.create.map((reservation) => ({ ...reservation, orderId: id })),
  });
  return tx.order.findUniqueOrThrow({
    where: { id },
    select: { ...legacyOrderSelect, items: true },
  });
}
