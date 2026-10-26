'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LogoutButton } from './auth-forms';
const links = [
  ['/admin', 'Tableau de bord'],
  ['/admin/commandes', 'Commandes'],
  ['/admin/catalogue', 'Catalogue'],
  ['/admin/stocks', 'Stocks'],
  ['/admin/quiz', 'Quiz'],
  ['/admin/activite', 'Activité'],
  ['/admin/compte', 'Mon compte'],
];
export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    [open, setOpen] = useState(false);
  return (
    <div className="admin-frame">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          Maktaba Malikiyya<span>Administration privée</span>
        </Link>
        <button
          className="admin-menu-toggle"
          aria-expanded={open}
          aria-controls="admin-nav"
          onClick={() => setOpen(!open)}
        >
          Menu administration
        </button>
        <nav id="admin-nav" className={open ? 'open' : ''} aria-label="Administration">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                path === href || (href !== '/admin' && path.startsWith(href + '/'))
                  ? 'page'
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </aside>
      <div className="admin-content">
        <p className="admin-test-badge">
          STRIPE TEST · Aucun chiffre présenté comme un revenu réel
        </p>
        {children}
      </div>
    </div>
  );
}
