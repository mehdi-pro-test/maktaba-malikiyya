import { describe, it, expect } from 'vitest';
import { shipping, checkoutSchema, money } from '../src/lib/rules';
import { stripeClient, appUrl } from '../src/lib/payments';
import { vi, afterEach } from 'vitest';
afterEach(() => vi.unstubAllEnvs());
describe('Livraison en centimes', () => {
  it.each([
    [1000, 400],
    [4000, 400],
    [4999, 400],
    [5000, 0],
    [10000, 0],
  ])('France : %i -> %i', (subtotal, expected) =>
    expect(shipping(subtotal, 'FR', '75001', ['FR'])).toBe(expected),
  );
  it.each([1000, 5000, 10000])('Europe : forfait permanent %i', (subtotal) =>
    expect(shipping(subtotal, 'BE', '1000', ['BE'])).toBe(2000),
  );
  it.each([
    '97100',
    '97200',
    '97300',
    '97400',
    '97500',
    '97600',
    '98000',
    '00000',
    '7500',
    'ABCDE',
  ])('Refuse code postal hors métropole %s', (postal) =>
    expect(() => shipping(1000, 'FR', postal, ['FR'])).toThrow(),
  );
  it('refuse pays absent', () =>
    expect(() => shipping(1000, 'US', '10001', ['FR', 'BE'])).toThrow('desservi'));
  it('accepte Corse', () => expect(shipping(1000, 'FR', '20000', ['FR'])).toBe(400));
});
describe('Validation & mode test', () => {
  const valid = {
    items: [{ productId: 'moshaf-coran', quantity: 1 }],
    email: 'test@example.com',
    recipient: 'Client Test',
    address: '1 rue de Test',
    postalCode: '75001',
    city: 'Paris',
    countryCode: 'FR',
  };
  it('accepte une commande invité', () =>
    expect(checkoutSchema.safeParse(valid).success).toBe(true));
  it.each([0, -1, 1.5, 11])('refuse quantité %i', (quantity) =>
    expect(
      checkoutSchema.safeParse({ ...valid, items: [{ productId: 'x', quantity }] }).success,
    ).toBe(false),
  );
  it('refuse les prix navigateur', () =>
    expect(
      checkoutSchema.safeParse({
        ...valid,
        items: [{ productId: 'x', quantity: 1, priceCents: 0 }],
      }).success,
    ).toBe(false));
  it('refuse email invalide', () =>
    expect(checkoutSchema.safeParse({ ...valid, email: 'non' }).success).toBe(false));
  it('refuse panier vide', () =>
    expect(checkoutSchema.safeParse({ ...valid, items: [] }).success).toBe(false));
  it('refuse clé live', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_OFFLINE_TEST_FIXTURE');
    expect(() => stripeClient()).toThrow('interdites');
  });
  it('refuse absence de clé', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    expect(() => stripeClient()).toThrow();
  });
  it('refuse APP_URL non sécurisé distant', () => {
    vi.stubEnv('APP_URL', 'http://example.com');
    expect(() => appUrl()).toThrow();
  });
  it('formate EUR', () => expect(money(1000)).toContain('10,00'));
});
