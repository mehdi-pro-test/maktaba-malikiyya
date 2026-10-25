import Stripe from 'stripe';
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith('sk_test_'))
    throw new Error(
      'Paiement indisponible : configurez une clé Stripe de test. Les clés live sont interdites.',
    );
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
}
export function appUrl() {
  const url = new URL(process.env.APP_URL ?? 'http://localhost:3000');
  if (
    url.protocol !== 'https:' &&
    !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))
  )
    throw new Error('APP_URL doit utiliser HTTPS hors environnement local.');
  return url.origin;
}
