import Stripe from 'stripe';
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith('sk_test_'))
    throw new Error(
      'Paiement indisponible : configurez une clé Stripe de test. Les clés live sont interdites.',
    );
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
}
function validatedOrigin(value: string) {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' &&
    !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))
  )
    throw new Error('APP_URL doit utiliser HTTPS hors environnement local.');
  return url.origin;
}
export function appUrl(requestOrigin?: string) {
  // Only configuration supplied by the deployment platform is trusted, never Host/X-Forwarded-Host.
  const platformOrigins =
    process.env.VERCEL === '1'
      ? [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
          .filter((host): host is string => Boolean(host))
          .map((host) => validatedOrigin(`https://${host}`))
      : [];
  const canonical = process.env.APP_URL
    ? validatedOrigin(process.env.APP_URL)
    : (platformOrigins[0] ?? 'http://localhost:3000');
  return requestOrigin && [canonical, ...platformOrigins].includes(requestOrigin)
    ? requestOrigin
    : canonical;
}
export function checkoutAvailable() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') && process.env.STRIPE_WEBHOOK_SECRET,
  );
}
