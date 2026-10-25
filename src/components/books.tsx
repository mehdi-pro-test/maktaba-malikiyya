import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { catalog } from '@/lib/catalog';
import { money } from '@/lib/rules';
import { AddToCart } from './cart-provider';
import { visibleCategories } from '@/data/categories';
import { BookImage } from './book-image';
export async function Books({ category }: { category?: string }) {
  const books = await catalog(category);
  return (
    <div className="books-grid">
      {books.length === 0 ? (
        <p>Notre catalogue sera bientôt de retour.</p>
      ) : (
        books.map((p) => (
          <article className="book-card" key={p.id}>
            <Link className={`book-visual ${p.category}`} href={`/livres/${p.slug}`}>
              <span className="category-tag">
                {visibleCategories().find((c) => c.slug === p.category)?.nameFr ?? p.category}
              </span>
              <BookImage src={p.imagePath} title={p.titleFr} />
              <span className="visual-caption">Visuel provisoire</span>
              <span className="book-arrow">
                <ArrowUpRight size={21} />
              </span>
            </Link>
            <div className="book-info">
              <div>
                <span className="eyebrow">CATÉGORIE : {p.category.toUpperCase()}</span>
                <h3>
                  <Link href={`/livres/${p.slug}`}>{p.titleFr}</Link>
                </h3>
                <p lang="ar" dir="rtl" className="arabic">
                  {p.titleAr}
                </p>
              </div>
              <span className="price">
                {p.priceCents === null ? 'Prix à venir' : money(p.priceCents)}
              </span>
            </div>
            {p.status === 'DRAFT' ? (
              <div className="draft-message">
                <span className="draft-badge">Bientôt disponible</span>
                <button className="button" disabled>
                  Bientôt disponible
                </button>
              </div>
            ) : (
              <>
                <div className="stock">
                  {p.available > 0
                    ? `${p.available} exemplaires disponibles`
                    : 'Momentanément indisponible'}
                </div>
                <AddToCart
                  id={p.id}
                  stock={p.available}
                  title={p.titleFr}
                  priceCents={p.priceCents}
                  imagePath={p.imagePath}
                />
              </>
            )}
          </article>
        ))
      )}
    </div>
  );
}
