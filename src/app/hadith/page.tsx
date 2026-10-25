import { Books } from '@/components/books';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Catégorie Hadith' };
export default function Page() {
  return (
    <section className="section-wrap category-page">
      <span className="eyebrow">LA MAKTABA / HADITH</span>
      <h1>Catégorie Hadith</h1>
      <p>Retrouvez ici les recueils et ouvrages de sciences du hadith en arabe.</p>
      <Books category="hadith" />
    </section>
  );
}
