'use client';
import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { Button } from './ui/button';
export type MiniProduct = {
  id: string;
  title: string;
  priceCents: number;
  imagePath: string;
  available: number;
};
type Line = { productId: string; quantity: number };
type Context = {
  items: Line[];
  setQuantity: (id: string, q: number) => void;
  clear: () => void;
  message: string;
  miniOpen: boolean;
  miniProducts: Record<string, MiniProduct>;
  miniTrigger: HTMLElement | null;
  openMini: (product: MiniProduct, trigger: HTMLElement) => void;
  closeMini: () => void;
};
const CartContext = createContext<Context | null>(null);
const subscribe = () => () => {};
export function CartProvider({ children }: { children: React.ReactNode }) {
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [items, setItems] = useState<Line[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const data = JSON.parse(localStorage.getItem('maktaba-cart') ?? '[]');
      return Array.isArray(data)
        ? data.filter(
            (i: Line) =>
              typeof i.productId === 'string' &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0 &&
              i.quantity <= 10,
          )
        : [];
    } catch {
      return [];
    }
  });
  const [message, setMessage] = useState('');
  const [miniOpen, setMiniOpen] = useState(false);
  const [miniTrigger, setMiniTrigger] = useState<HTMLElement | null>(null);
  const [miniProducts, setMiniProducts] = useState<Record<string, MiniProduct>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const parsed = JSON.parse(localStorage.getItem('maktaba-cart-products') ?? '{}');
      return Object.fromEntries(
        Object.entries(parsed).filter(([key, value]) => {
          const p = value as MiniProduct;
          return (
            p &&
            p.id === key &&
            typeof p.title === 'string' &&
            Number.isSafeInteger(p.priceCents) &&
            p.priceCents >= 0 &&
            typeof p.imagePath === 'string' &&
            p.imagePath.startsWith('/images/') &&
            Number.isInteger(p.available)
          );
        }),
      ) as Record<string, MiniProduct>;
    } catch {
      return {};
    }
  });
  const closeMini = useCallback(() => setMiniOpen(false), []);
  const openMini = (product: MiniProduct, trigger: HTMLElement) => {
    setMiniProducts((prev) => ({ ...prev, [product.id]: product }));
    setMiniTrigger(trigger);
    setMiniOpen(true);
  };

  const clear = useCallback(() => setItems([]), []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem('maktaba-cart', JSON.stringify(items));
        localStorage.setItem('maktaba-cart-products', JSON.stringify(miniProducts));
      } catch {
        /* The cart remains usable if browser storage is full or unavailable. */
      }
    }
  }, [items, ready, miniProducts]);
  const setQuantity = (id: string, q: number) => {
    setItems((prev) =>
      q <= 0
        ? prev.filter((i) => i.productId !== id)
        : [...prev.filter((i) => i.productId !== id), { productId: id, quantity: Math.min(10, q) }],
    );
    setMessage(q > 0 ? 'Panier mis à jour.' : 'Livre retiré du panier.');
  };
  return (
    <CartContext.Provider
      value={{
        items: ready ? items : [],
        setQuantity,
        clear,
        message,
        miniOpen,
        miniProducts,
        miniTrigger,
        openMini,
        closeMini,
      }}
    >
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </CartContext.Provider>
  );
}
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('Cart provider missing');
  return ctx;
}
export function CartCount() {
  const { items } = useCart();
  return <span className="cart-count">{items.reduce((n, i) => n + i.quantity, 0)}</span>;
}
export function AddToCart({
  id,
  stock,
  title,
  priceCents,
  imagePath,
}: {
  id: string;
  stock: number;
  title: string;
  priceCents: number;
  imagePath: string;
}) {
  const { items, setQuantity, openMini } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantityInput] = useState(1);
  const inCart = items.find((i) => i.productId === id)?.quantity ?? 0;
  return (
    <div className="add-area">
      <div className="add-controls">
        <label className="sr-only" htmlFor={`quantity-${id}`}>
          Quantité pour ce livre
        </label>
        <select
          id={`quantity-${id}`}
          value={quantity}
          onChange={(e) => setQuantityInput(Number(e.target.value))}
          disabled={!stock}
        >
          {Array.from({ length: Math.max(1, Math.min(stock, 10)) }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <Button
          disabled={inCart + quantity > stock || stock === 0}
          onClick={(event) => {
            setQuantity(id, inCart + quantity);
            openMini({ id, title, priceCents, imagePath, available: stock }, event.currentTarget);
            setAdded(true);
          }}
        >
          {stock === 0 ? 'Indisponible' : added ? 'Ajouté au panier ✓' : 'Ajouter au panier'}
        </Button>
      </div>
      {inCart > 0 && <small>{inCart} exemplaire(s) dans votre panier</small>}
    </div>
  );
}
