import 'dotenv/config';
import { bookCategories } from '../src/data/categories';
import { db } from '../src/lib/db';
for (const c of bookCategories) {
  if (
    (await db.product.findUnique({ where: { slug: c.slug } })) ||
    (await db.catalogDraft.findUnique({ where: { slug: c.slug } }))
  )
    throw new Error(`Le slug de catégorie ${c.slug} est déjà utilisé par un ouvrage.`);
}
await db.category.upsert({
  where: { id: 'livres' },
  create: { id: 'livres', slug: 'livres', nameFr: 'Livres' },
  update: {},
});
for (const c of bookCategories) {
  const data = {
    id: c.id,
    slug: c.slug,
    nameFr: c.nameFr,
    sortOrder: c.sortOrder,
    active: c.active,
  };
  await db.category.upsert({
    where: { id: c.id },
    create: { ...data, parentId: 'livres' },
    update: { nameFr: c.nameFr, sortOrder: c.sortOrder, active: c.active },
  });
}
await db.catalogDraft.upsert({
  where: { id: 'mukhtasar-al-akhdari' },
  create: {
    id: 'mukhtasar-al-akhdari',
    slug: 'mukhtasar-al-akhdari',
    titleFr: 'Mukhtasar al-Akhdari',
    titleAr: 'مختصر الأخضري',
    categoryId: 'fiqh',
    imagePath: '/images/akhdari.svg',
  },
  update: {},
});
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
  await db.product.upsert({
    where: { id: p.id },
    create: { ...p, categoryId: p.category, stockOnHand: 10 },
    update: {},
  });
await db.$disconnect();
console.log('Catalogue initial disponible. Le seed préserve les produits et stocks existants.');
