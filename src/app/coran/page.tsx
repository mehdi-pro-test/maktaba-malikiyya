import { Books } from '@/components/books';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Le Saint Coran' };
export default function Page() {
  return (
    <section className="section-wrap category-page">
      <span className="eyebrow">LA MAKTABA / CORAN</span>
      <h1>Le Saint Coran</h1>
      <p>Le texte en arabe, au cœur de votre bibliothèque.</p>
      <Books category="coran" />
    </section>
  );
}
