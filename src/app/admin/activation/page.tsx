import { redirect } from 'next/navigation';
import { ownerIdentity, AdminAccessError } from '@/lib/admin/session';
import { ActivationForm, LogoutButton } from '@/components/admin/auth-forms';
export default async function Page() {
  try {
    const identity = await ownerIdentity();
    if (identity.user.twoFactorEnabled) redirect('/admin');
  } catch (error) {
    if (error instanceof AdminAccessError) redirect('/admin/connexion');
    throw error;
  }
  return (
    <section className="admin-login">
      <h1>Activer le second facteur</h1>
      <ActivationForm />
      <LogoutButton />
    </section>
  );
}
