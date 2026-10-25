import { Confirmation } from '@/components/confirmation';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Confirmation de commande', referrer: 'no-referrer' as const };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <section className="section-wrap">
      <Confirmation token={token ?? ''} />
    </section>
  );
}
