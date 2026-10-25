import Link from 'next/link';
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Fil d’Ariane">
      <ol>
        <li>
          <Link href="/">Accueil</Link>
        </li>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
