import { notFound } from 'next/navigation';
import Link from 'next/link';
import { catalog } from '@/lib/catalog';
import { money } from '@/lib/rules';
import { AddToCart } from '@/components/cart-provider';
import { BookImage } from '@/components/book-image';
export const dynamic = 'force-dynamic';
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = (await catalog()).find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <section className="section-wrap product-page">
      <Link className="text-link" href={`/${p.category}`}>
        ← Retour à la sélection
      </Link>
      <div className="product-layout">
        <div className={`book-visual ${p.category}`}>
          <BookImage src={p.imagePath} title={p.titleFr} />
          <span className="visual-caption">Visuel provisoire · aucune édition représentée</span>
        </div>
        <div>
          <span className="eyebrow">{p.category.toUpperCase()} · OUVRAGE EN ARABE</span>
          <h1>{p.titleFr}</h1>
          <p lang="ar" dir="rtl" className="arabic product-arabic">
            {p.titleAr}
          </p>
          <p className="product-price">{money(p.priceCents)}</p>
          <p>
            Un ouvrage pour accompagner votre cheminement dans les sciences islamiques. Les
            informations d’édition seront précisées ultérieurement.
          </p>
          <p className="stock">{p.available} exemplaire(s) disponible(s)</p>
          <AddToCart id={p.id} stock={p.available} />
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
