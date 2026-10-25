import { Books } from '@/components/books';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Les sciences du hadith' };
export default function Page() {
  return (
    <section className="section-wrap category-page">
      <span className="eyebrow">LA MAKTABA / HADITH</span>
      <h1>Les sciences du hadith</h1>
      <p>Des ouvrages en arabe pour accompagner votre étude.</p>
      <Books category="hadith" />
    </section>
  );
}
