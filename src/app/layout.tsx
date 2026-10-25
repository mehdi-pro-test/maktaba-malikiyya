import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';
import { CartProvider, CartCount } from '@/components/cart-provider';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'Maktaba Malikiya — Le savoir, à portée de main',
    template: '%s | Maktaba Malikiya',
  },
  description:
    'Des livres en arabe pour les étudiants en sciences islamiques, à prix accessibles en France. Boutique de démonstration, paiement test uniquement.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>
        <CartProvider>
          <a href="#contenu" className="skip-link">
            Aller au contenu
          </a>
          <div className="announcement">
            Le savoir se partage. <span>Livraison offerte en France métropolitaine dès 50 €</span>
            <span className="announcement-test">BOUTIQUE TEST · AUCUN DÉBIT RÉEL</span>
          </div>
          <header className="header">
            <Link href="/" aria-label="Maktaba Malikiya, accueil" className="wordmark">
              Maktaba <em>Malikiya</em>
              <small>LIBRAIRIE • SCIENCES ISLAMIQUES</small>
            </Link>
            <nav aria-label="Navigation principale">
              <Link href="/">Accueil</Link>
              <Link href="/coran">Coran</Link>
              <Link href="/hadith">Hadith</Link>
            </nav>
            <Link href="/panier" className="cart-link">
              <ShoppingBag size={19} />
              <span>Panier</span>
              <CartCount />
            </Link>
          </header>
          <main id="contenu">{children}</main>
          <footer>
            <div className="footer-top">
              <div>
                <Link href="/" className="wordmark">
                  Maktaba <em>Malikiya</em>
                </Link>
                <p>
                  Le savoir, à portée de main.
                  <br />
                  Votre librairie de sciences islamiques en arabe.
                </p>
              </div>
              <div>
                <span className="eyebrow">EXPLORER LA MAKTABA</span>
                <Link href="/coran">
                  Le Saint Coran <ArrowUpRight size={14} />
                </Link>
                <Link href="/hadith">
                  Les sciences du hadith <ArrowUpRight size={14} />
                </Link>
              </div>
              <div>
                <span className="eyebrow">UNE QUESTION ?</span>
                <Link href="/informations">Livraison & informations</Link>
                <Link href="/informations#confidentialite">Confidentialité & mentions légales</Link>
                <p>Paiements de test uniquement.</p>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© {new Date().getFullYear()} Maktaba Malikiya</span>
              <span>Des livres choisis. Un savoir à transmettre.</span>
              <span>FRANCE · EUR €</span>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
