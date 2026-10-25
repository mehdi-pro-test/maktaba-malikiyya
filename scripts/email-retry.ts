import 'dotenv/config';
import { db } from '../src/lib/db';
import { deliverEmail } from '../src/lib/email';
// Recover a crashed sender after 10 minutes. Provider idempotency key remains identical.
await db.emailDelivery.updateMany({
  where: { status: 'SENDING', updatedAt: { lt: new Date(Date.now() - 600000) } },
  data: { status: 'FAILED' },
});
for (const d of await db.emailDelivery.findMany({
  where: { status: { in: ['PENDING', 'FAILED', 'NOT_CONFIGURED'] } },
}))
  await deliverEmail(d.orderId);
await db.$disconnect();
