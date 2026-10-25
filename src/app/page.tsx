import Link from 'next/link';
import { library } from '@/lib/quiz-v12-data';
import { ArrowRight, BookOpen, Truck, ShieldCheck } from 'lucide-react';
import { Books } from '@/components/books';
import { visibleCategories } from '@/data/categories';
import { CategoryTabs } from '@/components/category-tabs';
import { Button } from '@/components/ui/button';
export const dynamic = 'force-dynamic';
export default function Home() {
  const availableQuizCount = library.filter((book) => book.available).length;
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-label">
            <span />
            LA TRADITION DU SAVOIR, SIMPLEMENT
          </div>
          <h1>
            Les livres demeurent.
            <br />
            Le savoir <em>grandit.</em>
          </h1>
          <p>
            Des ouvrages en arabe pour les étudiants en sciences islamiques, à prix accessibles.
            <br className="desktop-break" /> Une bibliothèque qui vous accompagne.
          </p>
          <Button asChild>
            <Link href="/livres">
              Découvrir nos livres <ArrowRight size={17} />
            </Link>
          </Button>
          <div className="hero-footnote">
            <span className="gold-line" />
            Lire. Comprendre. Transmettre.
          </div>
        </div>
        <div
          className="hero-scene"
          role="img"
          aria-label="Illustration originale d’une bibliothèque chaleureuse : livres anciens, arche et tasse de thé matcha"
        >
          <div className="scene-arch" />
          <div className="scene-window" />
          <div className="scene-shelf shelf-one">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="scene-shelf shelf-two">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="scene-table" />
          <div className="scene-book book-back" />
          <div className="scene-book book-front">
            <span>مكتبة</span>
            <small>LE GOÛT DU SAVOIR</small>
          </div>
          <div className="tea-cup">
            <div />
          </div>
          <div className="scene-note">Un livre, un moment, un chemin.</div>
        </div>
      </section>
      <section className="trust-strip">
        <div>
          <BookOpen size={22} />
          <p>
            Des ouvrages en arabe<small>Au service de votre apprentissage</small>
          </p>
        </div>
        <div>
          <Truck size={24} />
          <p>
            Une livraison accessible<small>4 € en France · offerte dès 50 €</small>
          </p>
        </div>
        <div>
          <ShieldCheck size={23} />
          <p>
            Achetez en toute simplicité<small>Sans compte · carte en mode test</small>
          </p>
        </div>
      </section>
      <section className="catalog-section section-wrap" id="catalogue">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LA SÉLECTION DE LA MAKTABA</span>
            <h2>Votre prochain chapitre.</h2>
          </div>
          <p>
            Des essentiels pour étudier,
            <br />
            et de nouvelles lectures à découvrir.
          </p>
        </div>
        <div className="category-cards">
          {visibleCategories().map((c) => (
            <Link key={c.id} href={`/livres/${c.slug}`}>
              <span className="eyebrow">LIVRES / {String(c.sortOrder).padStart(2, '0')}</span>
              <h3>{c.nameFr}</h3>
              <p>{c.description}</p>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
        <CategoryTabs />
        <Books />
      </section>
      <section className="quiz-teaser section-wrap">
        <div>
          <span className="eyebrow">LE PLAISIR D’APPRENDRE</span>
          <h2>Et si le savoir se jouait ?</h2>
          <p>
            {availableQuizCount} quiz par niveau et par ouvrage, à votre rythme.
            <br />
            {availableQuizCount * 10} questions disponibles.
          </p>
        </div>
        <Button asChild>
          <Link href="/quiz/niveaux">
            Découvrir les quiz <ArrowRight size={16} />
          </Link>
        </Button>
      </section>
      <section className="philosophy section-wrap">
        <div className="philosophy-monogram" aria-hidden="true">
          M<span>LE SAVOIR SE TRANSMET</span>
        </div>
        <div>
          <span className="eyebrow">BIENVENUE CHEZ VOUS</span>
          <h2>
            Une maktaba pensée
            <br />
            pour votre cheminement.
          </h2>
          <p>
            Nous croyons que l’accès au savoir commence par un livre. Maktaba Malikiya rapproche les
            étudiants francophones des ouvrages en arabe, avec une idée simple : rendre l’étude plus
            accessible.
          </p>
          <Link className="text-link" href="/informations">
            L’esprit de la librairie <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="closing-note">
        <span className="eyebrow">LE TEMPS D’UN LIVRE</span>
        <p>
          Installez-vous. Ouvrez un livre.
          <br />
          <em>Le reste peut attendre.</em>
        </p>
      </section>
    </>
  );
}
