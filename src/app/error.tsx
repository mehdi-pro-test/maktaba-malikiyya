'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="section-wrap empty-state">
      <h1>La bibliothèque est momentanément indisponible.</h1>
      <p>Nous n’avons pas pu charger le catalogue. Réessayez dans un instant.</p>
      <button className="button" onClick={reset}>
        Réessayer
      </button>
    </section>
  );
}
