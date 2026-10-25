import { z } from 'zod';
export const europeanCountries: Record<string, string> = {
  FR: 'France métropolitaine',
  BE: 'Belgique',
  DE: 'Allemagne',
  ES: 'Espagne',
  IT: 'Italie',
  LU: 'Luxembourg',
  NL: 'Pays-Bas',
  AT: 'Autriche',
  PT: 'Portugal',
  IE: 'Irlande',
  DK: 'Danemark',
  SE: 'Suède',
  FI: 'Finlande',
  PL: 'Pologne',
  CZ: 'Tchéquie',
  GR: 'Grèce',
};
export function countries() {
  return (process.env.SHIPPING_ALLOWED_COUNTRIES ?? 'FR,BE,DE,ES,IT,LU,NL')
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x in europeanCountries);
}
export function shipping(
  subtotal: number,
  country: string,
  postalCode: string,
  allowed = countries(),
) {
  if (!allowed.includes(country)) throw new Error('Ce pays n’est pas desservi.');
  if (country === 'FR') {
    if (!/^(?:0[1-9]|[1-8][0-9]|9[0-5])\d{3}$/.test(postalCode))
      throw new Error('Livraison en France métropolitaine uniquement.');
    return subtotal >= 5000 ? 0 : 400;
  }
  return 2000;
}
export const checkoutSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1).max(80),
            quantity: z.number().int().min(1).max(10),
          })
          .strict(),
      )
      .min(1)
      .max(20),
    email: z.email().max(254),
    recipient: z.string().trim().min(3).max(120),
    address: z.string().trim().min(5).max(200),
    addressExtra: z.string().trim().max(200).optional(),
    postalCode: z.string().trim().min(3).max(12),
    city: z.string().trim().min(2).max(100),
    countryCode: z.string().length(2),
  })
  .strict();
export const money = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
