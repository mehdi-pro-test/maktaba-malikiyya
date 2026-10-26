'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="admin-login">
      <h1>Chargement impossible</h1>
      <p>
        Aucune modification n’est confirmée. Vérifiez votre connexion et votre session, puis
        réessayez.
      </p>
      <button className="button" onClick={reset}>
        Réessayer
      </button>
      <a href="/admin/connexion">Revenir à la connexion</a>
    </section>
  );
}
