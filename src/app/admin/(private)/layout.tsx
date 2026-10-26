import { requireOwnerPage } from '@/lib/admin/session';
import { AdminShell } from '@/components/admin/shell';
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireOwnerPage();
  return <AdminShell>{children}</AdminShell>;
}
