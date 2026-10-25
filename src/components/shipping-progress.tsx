import { shippingProgress } from '@/lib/shipping-progress';
import { money } from '@/lib/rules';
export function ShippingProgress({
  subtotal,
  country,
  itemCount,
}: {
  subtotal: number;
  country: string;
  itemCount: number;
}) {
  const state = shippingProgress(subtotal, country, itemCount);
  return (
    <div className="shipping-progress">
      <p aria-live="polite">
        {state.message ??
          `Encore ${money(state.remaining)} pour la livraison offerte en France métropolitaine`}
      </p>
      {state.showBar && (
        <div
          role="progressbar"
          aria-label="Progression vers la livraison offerte"
          aria-valuemin={0}
          aria-valuemax={50}
          aria-valuenow={Math.min(50, subtotal / 100)}
          aria-valuetext={state.message ?? `${money(state.remaining)} restants`}
          className="shipping-track"
        >
          <span style={{ width: `${state.percent}%` }} />
        </div>
      )}
    </div>
  );
}
