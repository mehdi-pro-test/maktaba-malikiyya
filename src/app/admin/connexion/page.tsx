import Link from 'next/link';
import { adminConfig, adminEnabled } from '@/lib/admin/config';
import { LoginForm } from '@/components/admin/auth-forms';
export default function Page() {
  let ready = false;
  try {
    adminConfig();
    ready = adminEnabled();
  } catch {}
  return (
    <section className="admin-login">
      <span className="eyebrow">ESPACE PROPRIÉTAIRE</span>
      <h1>Connexion privée</h1>
      {ready ? (
        <>
          <p>Mot de passe et second facteur obligatoires. Aucune inscription publique.</p>
          <LoginForm />
        </>
      ) : (
        <p>
          Administration désactivée ou configuration incomplète. Aucun accès aux données privées
          n’est ouvert.
        </p>
      )}
      <Link href="/">Retour à la librairie</Link>
    </section>
  );
}
