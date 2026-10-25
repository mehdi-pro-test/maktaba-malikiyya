import 'dotenv/config';
import { db } from '../src/lib/db';
const products = [
  {
    id: 'moshaf-coran',
    slug: 'moshaf-coran',
    titleFr: 'Coran (Moshaf)',
    titleAr: 'مصحف القرآن الكريم',
    category: 'coran',
    imagePath: '/images/coran.svg',
    priceCents: 1000,
  },
  {
    id: 'sahih-al-bukhari',
    slug: 'sahih-al-bukhari',
    titleFr: 'Sahih al-Bukhari',
    titleAr: 'صحيح البخاري',
    category: 'hadith',
    imagePath: '/images/bukhari.svg',
    priceCents: 10000,
  },
];
for (const p of products)
  await db.product.upsert({ where: { id: p.id }, create: { ...p, stockOnHand: 10 }, update: {} });
await db.$disconnect();
console.log('Catalogue initial disponible. Le seed préserve les produits et stocks existants.');
