'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from './cart-provider';
import { BookImage } from './book-image';
import { ShippingProgress } from './shipping-progress';
import { money } from '@/lib/rules';
export function MiniCart() {
  const { miniOpen, miniProducts, miniTrigger, closeMini, items, setQuantity } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const [country, setCountry] = useState('FR');
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (miniOpen && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLButtonElement>('button')?.focus();
    } else if (!miniOpen && dialog.open) {
      dialog.close();
      if (miniTrigger?.isConnected) miniTrigger.focus();
    }
  }, [miniOpen, miniTrigger]);
  const complete = items.every((i) => miniProducts[i.productId]);
  const subtotal = items.reduce(
    (sum, i) => sum + (miniProducts[i.productId]?.priceCents ?? 0) * i.quantity,
    0,
  );
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <dialog
      ref={ref}
      className="mini-cart"
      aria-labelledby="mini-cart-title"
      onCancel={(e) => {
        e.preventDefault();
        closeMini();
      }}
      onClose={closeMini}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const nodes = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),select:not([disabled]),input:not([disabled]),[tabindex="0"]',
          ),
        ).filter((el) => el.getClientRects().length > 0);
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <div className="mini-cart-heading">
        <span className="eyebrow">VOTRE SÉLECTION</span>
        <button type="button" aria-label="Fermer le mini-panier" onClick={closeMini}>
          <X size={21} />
        </button>
      </div>
      <h2 id="mini-cart-title">
        <ShoppingBag size={24} /> Votre panier
      </h2>
      <p>{count} exemplaire(s), autant de chemins à explorer.</p>
      <div className="mini-cart-lines">
        {items.map((i) => {
          const p = miniProducts[i.productId];
          return (
            <article key={i.productId} className="mini-cart-line">
              {p && (
                <div className="cart-thumbnail">
                  <BookImage src={p.imagePath} title={p.title} />
                </div>
              )}
              <div>
                <h3>{p?.title ?? 'Ouvrage dans votre panier'}</h3>
                {p && <p>{money(p.priceCents * i.quantity)}</p>}
                <div className="quantity-controls">
                  <button
                    type="button"
                    aria-label={`Diminuer ${p?.title ?? 'ce livre'} dans le mini-panier`}
                    onClick={() => setQuantity(i.productId, i.quantity - 1)}
                  >
                    <Minus size={15} />
                  </button>
                  <span>{i.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Augmenter ${p?.title ?? 'ce livre'} dans le mini-panier`}
                    disabled={!p || i.quantity >= p.available}
                    onClick={() => setQuantity(i.productId, i.quantity + 1)}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {complete ? (
        <>
          <div className="summary-row">
            <span>Sous-total estimé</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <label>
            Destination de l’estimation
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="FR">France métropolitaine</option>
              <option value="EU">Autre pays européen desservi</option>
            </select>
          </label>
          <ShippingProgress subtotal={subtotal} country={country} itemCount={count} />
          <div className="summary-row">
            <span>Livraison estimée</span>
            <strong>
              {!count
                ? '—'
                : country === 'FR'
                  ? subtotal >= 5000
                    ? 'Offerte'
                    : money(400)
                  : money(2000)}
            </strong>
          </div>
        </>
      ) : (
        <p>Ouvrez votre panier pour actualiser le détail de tous vos livres.</p>
      )}
      <p className="muted">
        Les prix et disponibilités seront vérifiés côté serveur avant le paiement.
      </p>
      <Link className="button" href="/panier" onClick={closeMini}>
        Voir le panier
      </Link>
      <button className="continue-shopping" type="button" onClick={closeMini}>
        Continuer mes découvertes
      </button>
    </dialog>
  );
}
