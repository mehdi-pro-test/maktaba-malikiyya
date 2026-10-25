export function shippingProgress(subtotalCents: number, country: string, itemCount: number) {
  if (!itemCount)
    return {
      remaining: 5000,
      percent: 0,
      message: 'Ajoutez un livre pour préparer votre panier.',
      showBar: false,
    };
  if (country !== 'FR')
    return {
      remaining: 0,
      percent: 0,
      message: 'Livraison à 20 € pour ce pays, sans gratuité.',
      showBar: false,
    };
  const remaining = Math.max(0, 5000 - subtotalCents);
  return {
    remaining,
    percent: Math.min(100, Math.max(0, (subtotalCents / 5000) * 100)),
    message:
      remaining === 0 ? 'Vous profitez de la livraison offerte en France métropolitaine' : null,
    showBar: true,
  };
}
