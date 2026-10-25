import { Books } from '@/components/books';
import { CategoryTabs } from '@/components/category-tabs';
import { Breadcrumbs } from '@/components/breadcrumbs';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Tous les livres en arabe' };
export default function Page() {
  return (
    <section className="section-wrap category-page">
      <Breadcrumbs items={[{ label: 'Livres' }]} />
      <span className="eyebrow">LES LIVRES DE LA MAKTABA</span>
      <h1>Un livre, un nouveau chemin.</h1>
      <p>Parcourez nos ouvrages en arabe, classés par discipline.</p>
      <CategoryTabs />
      <Books />
    </section>
  );
}
