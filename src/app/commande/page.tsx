import { catalog } from '@/lib/catalog';
import { countries } from '@/lib/rules';
import { CartCheckout } from '@/components/cart-checkout';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Votre commande' };
export default async function Page() {
  return (
    <section className="section-wrap cart-page">
      <span className="eyebrow">PANIER / LIVRAISON / PAIEMENT TEST</span>
      <h1>Un pas de plus vers le savoir.</h1>
      <p>Commandez simplement, sans créer de compte.</p>
      <CartCheckout products={await catalog()} allowed={countries()} checkout />
    </section>
  );
}
