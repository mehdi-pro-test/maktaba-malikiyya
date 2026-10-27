import Link from 'next/link';
import { RegistrationForm } from '@/components/registration-form';
import { memberAccountsEnabled, adminConfig } from '@/lib/admin/config';
import '../admin/admin.css';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Créer un compte', robots: { index: false, follow: false } };
export default function Page() {
  let ready = false;
  try {
    adminConfig();
    ready = memberAccountsEnabled();
  } catch {}
  return (
    <section className="admin-area account-portal">
      <div className="admin-login">
        <h1>Créer un compte</h1>
        {ready ? <RegistrationForm /> : <p>La création de comptes n’est pas encore disponible.</p>}
        <p>
          Déjà inscrit ? <Link href="/connexion">Se connecter</Link>
        </p>
      </div>
    </section>
  );
}
