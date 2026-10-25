'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { visibleCategories } from '@/data/categories';
export function Navigation() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const path = usePathname();
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  return (
    <nav aria-label="Navigation principale">
      <Link href="/" aria-current={path === '/' ? 'page' : undefined}>
        Accueil
      </Link>
      <div
        className="books-menu"
        ref={ref}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            button.current?.focus();
          }
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
        }}
      >
        <div className="books-menu-parent">
          <Link href="/livres" aria-current={path === '/livres' ? 'page' : undefined}>
            Livres
          </Link>
          <button
            ref={button}
            type="button"
            aria-expanded={open}
            aria-controls="book-subcategories"
            aria-label="Afficher les catégories de livres"
            onClick={() => setOpen(!open)}
          >
            <ChevronDown size={15} />
          </button>
        </div>
        {open && (
          <div className="books-submenu" id="book-subcategories">
            <Link href="/livres" onClick={() => setOpen(false)}>
              Tous les livres
            </Link>
            {visibleCategories().map((c) => (
              <Link key={c.id} href={`/livres/${c.slug}`} onClick={() => setOpen(false)}>
                {c.nameFr}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Link
        href="/quiz/niveaux"
        aria-current={
          path === '/quiz/niveaux' || path.startsWith('/quiz/niveaux/') ? 'page' : undefined
        }
      >
        Quiz
      </Link>
    </nav>
  );
}
