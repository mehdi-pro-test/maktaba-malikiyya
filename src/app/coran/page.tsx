import { Books } from '@/components/books';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Catégorie Coran' };
export default function Page() {
  return (
    <section className="section-wrap category-page">
      <span className="eyebrow">LA MAKTABA / CORAN</span>
      <h1>Catégorie Coran</h1>
      <p>Retrouvez ici les exemplaires du Coran en arabe disponibles dans notre catalogue.</p>
      <Books category="coran" />
    </section>
  );
}
