// Single editorial configuration for navigation, category cards and idempotent category seed.
// Add a child here, then run db:seed on the intended database. No commerce data is reset.
export const bookCategories = [
  {
    id: 'coran',
    slug: 'coran',
    nameFr: 'Coran',
    description: 'Le texte en arabe, au cœur de votre bibliothèque.',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'hadith',
    slug: 'hadith',
    nameFr: 'Hadith',
    description: 'Les recueils et les sciences du hadith pour accompagner votre étude.',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'fiqh',
    slug: 'fiqh',
    nameFr: 'Fiqh',
    description: 'La jurisprudence islamique, des fondements à la pratique.',
    sortOrder: 3,
    active: true,
  },
];
export const visibleCategories = () =>
  bookCategories.filter((c) => c.active).sort((a, b) => a.sortOrder - b.sortOrder);
