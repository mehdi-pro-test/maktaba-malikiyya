import { notFound } from 'next/navigation';
import { productEditions } from '@/data/product-details';
import Link from 'next/link';
import { catalog } from '@/lib/catalog';
import { money } from '@/lib/rules';
import { visibleCategories } from '@/data/categories';
import { AddToCart } from '@/components/cart-provider';
import { BookImage } from '@/components/book-image';
import { CategoryTabs } from '@/components/category-tabs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Books } from '@/components/books';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = visibleCategories().find((c) => c.slug === slug);
  const product = c ? null : (await catalog()).find((p) => p.slug === slug);
  return { title: c ? `Catégorie ${c.nameFr}` : (product?.titleFr ?? 'Ouvrage en arabe') };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = visibleCategories().find((c) => c.slug === slug);
  if (category)
    return (
      <section className="section-wrap category-page">
        <Breadcrumbs items={[{ label: 'Livres', href: '/livres' }, { label: category.nameFr }]} />
        <span className="eyebrow">LIVRES / {category.nameFr.toUpperCase()}</span>
        <h1>Catégorie {category.nameFr}</h1>
        <p>{category.description}</p>
        <CategoryTabs selected={category.slug} />
        <Books category={category.slug} />
      </section>
    );
  const p = (await catalog()).find((p) => p.slug === slug);
  if (!p) notFound();
  const c = visibleCategories().find((c) => c.slug === p.category);
  return (
    <section className="section-wrap product-page">
      <Breadcrumbs
        items={[
          { label: 'Livres', href: '/livres' },
          { label: c?.nameFr ?? p.category, href: `/livres/${p.category}` },
          { label: p.titleFr },
        ]}
      />
      <Link className="text-link" href={`/livres/${p.category}`}>
        ← Retour à la sélection
      </Link>
      <div className="product-layout">
        <div className={`book-visual ${p.category}`}>
          <BookImage src={p.imagePath} title={p.titleFr} altText={p.imageAlt ?? undefined} />
          <span className="visual-caption">
            {p.imageAlt
              ? 'Couverture fournie par la librairie · édition à vérifier.'
              : 'Visuel provisoire · aucune édition représentée'}
          </span>
        </div>
        <div>
          <span className="eyebrow">
            {c?.nameFr.toUpperCase() ?? p.category.toUpperCase()} · OUVRAGE EN ARABE
          </span>
          <h1>{p.titleFr}</h1>
          <p lang="ar" dir="rtl" className="arabic product-arabic">
            {p.titleAr}
          </p>
          <p className="product-price">
            {p.priceCents === null ? 'Prix à venir' : money(p.priceCents)}
          </p>
          <p>
            Un ouvrage pour accompagner votre cheminement dans les sciences islamiques.{' '}
            {productEditions[p.id]
              ? `Édition : ${productEditions[p.id]}.`
              : 'Les informations d’édition seront précisées ultérieurement.'}
          </p>
          {p.descriptionFr && <p className="product-description">{p.descriptionFr}</p>}
          {p.descriptionAr && (
            <p className="product-description" lang="ar" dir="rtl">
              {p.descriptionAr}
            </p>
          )}
          {p.status === 'DRAFT' ? (
            <div className="draft-message">
              <span className="eyebrow">BIENTÔT DISPONIBLE</span>
              <p>
                Le prix, le stock et l’édition de cet ouvrage restent à confirmer. L’achat n’est pas
                encore ouvert.
              </p>
              <button className="button" disabled>
                Bientôt disponible
              </button>
            </div>
          ) : (
            <>
              <p className="stock">{p.available} exemplaire(s) disponible(s)</p>
              <AddToCart
                id={p.id}
                stock={p.available}
                title={p.titleFr}
                priceCents={p.priceCents}
                imagePath={p.imagePath}
              />
            </>
          )}
          <div className="product-shipping">
            France métropolitaine : 4 €, offerts dès 50 € d’achats.
            <br />
            Autres pays européens desservis : 20 €.
            <br />
            Paiement par carte en mode test uniquement.
          </div>
        </div>
      </div>
    </section>
  );
}
