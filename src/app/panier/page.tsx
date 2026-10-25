import { purchasableCatalog } from '@/lib/catalog';
import { countries } from '@/lib/rules';
import { CartCheckout } from '@/components/cart-checkout';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Votre panier' };
export default async function Page() {
  const products = await purchasableCatalog();
  return (
    <section className="section-wrap cart-page">
      <span className="eyebrow">VOTRE PROCHAINE LECTURE</span>
      <h1>Votre panier</h1>
      <CartCheckout products={products} allowed={countries()} />
    </section>
  );
}
