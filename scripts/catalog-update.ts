import 'dotenv/config';
import { parseArgs } from 'node:util';
import { commerceTransaction } from '../src/lib/orders';
import { db } from '../src/lib/db';
const { values } = parseArgs({
  options: {
    id: { type: 'string' },
    price: { type: 'string' },
    stock: { type: 'string' },
    'title-fr': { type: 'string' },
    'title-ar': { type: 'string' },
    image: { type: 'string' },
    active: { type: 'string' },
  },
});
if (!values.id) throw new Error('--id requis');
const integer = (v: string) => {
  const n = Number(v);
  if (!Number.isSafeInteger(n) || n < 0 || n > 10000000)
    throw new Error('Entier positif ou nul requis');
  return n;
};
await commerceTransaction(async (tx) => {
  const data: {
    priceCents?: number;
    stockOnHand?: number;
    titleFr?: string;
    titleAr?: string;
    imagePath?: string;
    active?: boolean;
  } = {};
  if (values.price !== undefined) data.priceCents = integer(values.price);
  if (values.stock !== undefined) {
    data.stockOnHand = integer(values.stock);
    const reserved = await tx.stockReservation.aggregate({
      where: { productId: values.id, status: 'ACTIVE' },
      _sum: { quantity: true },
    });
    if (data.stockOnHand < (reserved._sum.quantity ?? 0))
      throw new Error('Stock inférieur aux réservations actives.');
  }
  if (values['title-fr']) data.titleFr = values['title-fr'];
  if (values['title-ar']) data.titleAr = values['title-ar'];
  if (values.image) {
    if (!/^\/images\/[a-zA-Z0-9._-]+\.(svg|png|jpg|jpeg|webp)$/.test(values.image))
      throw new Error('Chemin local /images/fichier requis');
    data.imagePath = values.image;
  }
  if (values.active !== undefined) {
    if (!['true', 'false'].includes(values.active)) throw new Error('--active true|false');
    data.active = values.active === 'true';
  }
  await tx.product.update({ where: { id: values.id }, data });
});
await db.$disconnect();
console.log('Catalogue mis à jour.');
