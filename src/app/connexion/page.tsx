import Link from 'next/link';
import { LoginForm } from '@/components/admin/auth-forms';
import { adminEnabled, memberAccountsEnabled, adminConfig } from '@/lib/admin/config';
import '../admin/admin.css';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Connexion', robots: { index: false, follow: false } };
export default function Page() {
  let ready = false;
  try {
    adminConfig();
    ready = adminEnabled() || memberAccountsEnabled();
  } catch {}
  return (
    <section className="admin-area account-portal">
      <div className="admin-login">
        <span className="eyebrow">VOTRE ESPACE MAKTABA</span>
        <h1>Connexion</h1>
        {ready ? (
          <>
            <p>
              Connectez-vous avec votre pseudo. Le propriétaire utilise son adresse e-mail et son
              second facteur.
            </p>
            <LoginForm members={memberAccountsEnabled()} />
            {memberAccountsEnabled() && (
              <p>
                Pas encore de compte ? <Link href="/inscription">Créer un compte</Link>
              </p>
            )}
          </>
        ) : (
          <p>La connexion est momentanément indisponible.</p>
        )}
        <Link href="/quiz/niveaux">Continuer vers les quiz sans compte</Link>
      </div>
    </section>
  );
}
