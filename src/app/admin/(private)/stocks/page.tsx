import { StocksPage } from '@/components/admin/pages';
import type { Search } from '@/lib/admin/read';
export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  return <StocksPage search={await searchParams} />;
}
