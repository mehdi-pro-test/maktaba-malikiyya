'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
export function AccountLink() {
  const path = usePathname();
  const [view, setView] = useState({ href: '/connexion', label: 'Connexion', mode: 'anonymous' });
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/compte/session', { cache: 'no-store', signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => {
        if (v && ['/connexion', '/compte', '/admin', '/admin/activation'].includes(v.href))
          setView(v);
        else setView({ href: '/connexion', label: 'Connexion', mode: 'anonymous' });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [path]);
  return (
    <Link
      href={view.href}
      className="account-link"
      aria-current={path === view.href ? 'page' : undefined}
    >
      {view.label}
      {view.mode === 'admin' && <span className="account-mode">Mode admin</span>}
    </Link>
  );
}
