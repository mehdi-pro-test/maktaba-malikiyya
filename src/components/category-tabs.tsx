import Link from 'next/link';
import { visibleCategories } from '@/data/categories';
export function CategoryTabs({ selected }: { selected?: string }) {
  return (
    <nav className="catalog-tabs" aria-label="Catégories de livres">
      <Link
        href="/livres"
        className={!selected ? 'active' : ''}
        aria-current={!selected ? 'page' : undefined}
      >
        Tous les ouvrages
      </Link>
      {visibleCategories().map((c) => (
        <Link
          key={c.id}
          href={`/livres/${c.slug}`}
          className={selected === c.slug ? 'active' : ''}
          aria-current={selected === c.slug ? 'page' : undefined}
        >
          {c.nameFr}
        </Link>
      ))}
    </nav>
  );
}
