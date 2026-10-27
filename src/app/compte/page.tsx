import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { siteIdentity, siteSessionView } from '@/lib/site-session';
import { LogoutButton, PasswordForm } from '@/components/admin/auth-forms';
import '../admin/admin.css';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mon compte', robots: { index: false, follow: false } };
export default async function Page() {
  const h = await headers();
  const identity = await siteIdentity(h);
  if (!identity) redirect('/connexion');
  if (identity.user.ownerSlot !== null) {
    const v = await siteSessionView(h);
    redirect(v.href);
  }
  return (
    <section className="admin-area account-portal">
      <div className="admin-login">
        <h1>Mon compte</h1>
        <p>
          Connecté sous le pseudo <strong>{identity.user.username}</strong>.
        </p>
        <p>Vous accédez à la boutique et aux quiz avec un compte classique.</p>
        <div className="admin-actions">
          <Link className="button" href="/quiz/niveaux">
            Accéder aux quiz
          </Link>
          <Link href="/livres">Voir les livres</Link>
          <LogoutButton destination="/connexion" />
        </div>
        <h2>Changer mon mot de passe</h2>
        <PasswordForm member />
      </div>
    </section>
  );
}
