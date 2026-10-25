'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, LockKeyhole } from 'lucide-react';
import { useCart } from './cart-provider';
import { money, shipping, europeanCountries } from '@/lib/rules';
import { Button } from './ui/button';
import { ShippingProgress } from './shipping-progress';
import { BookImage } from './book-image';
type Book = {
  id: string;
  titleFr: string;
  imagePath: string;
  priceCents: number;
  available: number;
};
export function CartCheckout({
  products,
  allowed,
  checkout = false,
  paymentAvailable = true,
}: {
  products: Book[];
  allowed: string[];
  checkout?: boolean;
  paymentAvailable?: boolean;
}) {
  const { items, setQuantity } = useCart();
  const [country, setCountry] = useState(allowed.includes('FR') ? 'FR' : (allowed[0] ?? ''));
  const [postal, setPostal] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lines = items.map((i) => ({ ...i, product: products.find((p) => p.id === i.productId) }));
  const invalid = lines.some((i) => !i.product || i.quantity > (i.product?.available ?? 0));
  const subtotal = lines.reduce((sum, i) => sum + (i.product?.priceCents ?? 0) * i.quantity, 0);
  let fee = 0;
  try {
    fee = shipping(subtotal, country, postal || '75001', allowed);
  } catch {
    fee = country === 'FR' ? (subtotal >= 5000 ? 0 : 400) : 2000;
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(form), items }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const url = new URL(data.url);
      if (url.hostname !== 'checkout.stripe.com')
        throw new Error('Redirection de paiement refusée.');
      window.location.assign(url.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
      setBusy(false);
    }
  }
  if (!items.length)
    return (
      <div className="empty-state">
        <span className="eyebrow">CHAQUE CHEMIN COMMENCE PAR UN LIVRE</span>
        <h2>Votre panier attend sa première lecture.</h2>
        <p>Découvrez notre sélection d’ouvrages en arabe.</p>
        <Button asChild>
          <Link href="/#catalogue">
            Découvrir nos livres <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    );
  const summary = (
    <aside className="order-summary">
      <span className="eyebrow">VOTRE SÉLECTION</span>
      <h2>Récapitulatif</h2>
      {checkout &&
        lines.map((i) => (
          <div className="summary-row" key={i.productId}>
            <span>
              {i.quantity} × {i.product?.titleFr ?? 'Livre indisponible'}
            </span>
            <span>{money((i.product?.priceCents ?? 0) * i.quantity)}</span>
          </div>
        ))}
      <div className="summary-row">
        <span>Sous-total</span>
        <strong>{money(subtotal)}</strong>
      </div>
      <div className="summary-row">
        <span>Livraison {checkout ? '' : 'estimée'}</span>
        <strong>{fee === 0 ? 'Offerte' : money(fee)}</strong>
      </div>
      <div className="summary-row total">
        <span>Total</span>
        <strong>{money(subtotal + fee)}</strong>
      </div>
      <p className="muted">
        Les prix, frais et disponibilités seront vérifiés côté serveur avant le paiement.
      </p>
      <ShippingProgress
        subtotal={subtotal}
        country={country}
        itemCount={items.reduce((sum, i) => sum + i.quantity, 0)}
      />
      {!checkout &&
        (invalid ? (
          <Button disabled>Stock insuffisant — modifiez votre panier</Button>
        ) : (
          <Button asChild>
            <Link href="/commande">
              Passer commande <ArrowRight size={17} />
            </Link>
          </Button>
        ))}
      <p className="payment-note">
        <LockKeyhole size={15} /> Carte bancaire · Stripe test uniquement
      </p>
    </aside>
  );
  return (
    <div className="checkout-layout">
      {checkout ? (
        <form onSubmit={submit} className="checkout-form">
          <div className="test-notice">
            <strong>Paiement en mode test — aucun débit réel</strong>
            <span>Utilisez uniquement des coordonnées fictives et une carte de test Stripe.</span>
          </div>
          {!paymentAvailable && (
            <div className="form-error" role="alert">
              Le paiement de test n’est pas encore disponible sur ce site. Vous pouvez préparer
              votre panier ; la commande sera possible dès l’activation du paiement.
            </div>
          )}
          <h2>Vos coordonnées</h2>
          <label>
            E-mail
            <input name="email" type="email" autoComplete="email" required maxLength={254} />
          </label>
          <h2>Adresse de livraison</h2>
          <label>
            Prénom et nom du destinataire
            <input name="recipient" autoComplete="name" required minLength={3} maxLength={120} />
          </label>
          <label>
            Adresse
            <input
              name="address"
              autoComplete="address-line1"
              required
              minLength={5}
              maxLength={200}
            />
          </label>
          <label>
            Complément d’adresse <small>(facultatif)</small>
            <input name="addressExtra" autoComplete="address-line2" maxLength={200} />
          </label>
          <div className="form-row">
            <label>
              Code postal
              <input
                name="postalCode"
                autoComplete="postal-code"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                required
                minLength={3}
                maxLength={12}
              />
            </label>
            <label>
              Ville
              <input
                name="city"
                autoComplete="address-level2"
                required
                minLength={2}
                maxLength={100}
              />
            </label>
          </div>
          <label>
            Pays
            <select name="countryCode" value={country} onChange={(e) => setCountry(e.target.value)}>
              {allowed.map((c) => (
                <option key={c} value={c}>
                  {europeanCountries[c]}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            En continuant, vous acceptez le traitement des coordonnées nécessaires à votre commande
            de test. <Link href="/informations#confidentialite">En savoir plus</Link>.
          </p>
          {invalid && (
            <p className="form-error" role="alert">
              Un livre n’est plus disponible dans la quantité demandée. Modifiez votre panier.
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button disabled={busy || invalid || !paymentAvailable} type="submit">
            {busy ? 'Préparation du paiement…' : 'Payer par carte (test)'} <ArrowRight size={16} />
          </Button>
        </form>
      ) : (
        <div>
          <div className="cart-lines">
            {lines.map((i) => (
              <div className="cart-line" key={i.productId}>
                {i.product && (
                  <div className="cart-thumbnail">
                    <BookImage src={i.product.imagePath} title={i.product.titleFr} />
                  </div>
                )}
                <div className="cart-line-info">
                  <h2>{i.product?.titleFr ?? 'Livre indisponible'}</h2>
                  <p>{money(i.product?.priceCents ?? 0)}</p>
                  {i.quantity > (i.product?.available ?? 0) && (
                    <p className="form-error" id="stock">
                      Stock disponible : {i.product?.available ?? 0}
                    </p>
                  )}
                  <div className="quantity-controls">
                    <button
                      aria-label={`Diminuer la quantité de ${i.product?.titleFr}`}
                      onClick={() => setQuantity(i.productId, i.quantity - 1)}
                    >
                      <Minus size={15} />
                    </button>
                    <span aria-label="Quantité">{i.quantity}</span>
                    <button
                      aria-label={`Augmenter la quantité de ${i.product?.titleFr}`}
                      disabled={i.quantity >= (i.product?.available ?? 0)}
                      onClick={() => setQuantity(i.productId, i.quantity + 1)}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
                <button
                  className="remove-button"
                  aria-label={`Retirer ${i.product?.titleFr}`}
                  onClick={() => setQuantity(i.productId, 0)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <label className="destination-label">
            Estimer la livraison
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              {allowed.map((c) => (
                <option key={c} value={c}>
                  {europeanCountries[c]}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            France métropolitaine : 4 €, offerts dès 50 €. Europe desservie : 20 €.
          </p>
          <Link href="/#catalogue" className="text-link">
            ← Continuer mes découvertes
          </Link>
        </div>
      )}
      {summary}
    </div>
  );
}
