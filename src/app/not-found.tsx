import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="section-wrap empty-state">
      <h1>Cette page attend encore son histoire.</h1>
      <p>Le livre ou la page recherchée est introuvable.</p>
      <Link href="/" className="button">
        Retour à la librairie
      </Link>
    </div>
  );
}
