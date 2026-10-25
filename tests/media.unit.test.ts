import { vi, it, expect } from 'vitest';
vi.mock('@/data/cover-references.json', () => ({
  default: {
    covers: [
      {
        productId: 'rights-pending',
        realCoverPath: '/images/books/a.webp',
        reusePermissionConfirmed: false,
        editionVerified: true,
        productionUse: true,
      },
      {
        productId: 'edition-pending',
        realCoverPath: '/images/books/a.webp',
        reusePermissionConfirmed: true,
        editionVerified: false,
        productionUse: true,
      },
      {
        productId: 'not-published',
        realCoverPath: '/images/books/a.webp',
        reusePermissionConfirmed: true,
        editionVerified: true,
        productionUse: false,
      },
      {
        productId: 'approved',
        realCoverPath: '/images/books/a.webp',
        reusePermissionConfirmed: true,
        editionVerified: true,
        productionUse: true,
      },
      {
        productId: 'hotlink',
        realCoverPath: 'https://third-party.example/a.webp',
        reusePermissionConfirmed: true,
        editionVerified: true,
        productionUse: true,
      },
      {
        productId: 'traversal',
        realCoverPath: '/images/books/../a.webp',
        reusePermissionConfirmed: true,
        editionVerified: true,
        productionUse: true,
      },
    ],
  },
}));
import { coverPath } from '../src/lib/media';
it.each(['rights-pending', 'edition-pending', 'not-published', 'hotlink', 'traversal', 'unknown'])(
  'conserve le repli pour %s',
  (id) => expect(coverPath(id, '/images/coran.svg')).toBe('/images/coran.svg'),
);
it('sélectionne uniquement un chemin local approuvé et une édition validée', () =>
  expect(coverPath('approved', '/images/coran.svg')).toBe('/images/books/a.webp'));
