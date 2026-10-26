import type { Metadata } from 'next';
import './admin.css';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Administration privée — Maktaba Malikiyya',
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="admin-area">{children}</div>;
}
