import { it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import sharp from 'sharp';
import { csvCell, quizContentSchema, productInput } from '../src/lib/admin/validation';
import { parisMidnight, nextDay, limitedText } from '../src/lib/admin/http';
import { sanitizeCover } from '../src/lib/admin/covers';
import { coverPath } from '../src/lib/media';
import { adminEnabled, quizDbEnabled } from '../src/lib/admin/config';
it('dates France : jours de changement été/hiver de 23 ou 25 heures', () => {
  const spring = parisMidnight('2026-03-29'),
    springEnd = parisMidnight(nextDay('2026-03-29'));
  expect((springEnd.getTime() - spring.getTime()) / 3600000).toBe(23);
  const autumn = parisMidnight('2026-10-25'),
    autumnEnd = parisMidnight(nextDay('2026-10-25'));
  expect((autumnEnd.getTime() - autumn.getTime()) / 3600000).toBe(25);
});
it('neutralise les formules CSV, quotes et retours ligne', () => {
  for (const text of ['=1+1', ' +SUM(A1)', '-cmd', '@formula', '\tvalue'])
    expect(csvCell(text)).toMatch(/^"'/);
  expect(csvCell('texte "cité"')).toBe('"texte ""cité"""');
});
it('limite le corps même sans Content-Length', async () => {
  await expect(
    limitedText(new Request('https://example.test', { method: 'POST', body: 'x'.repeat(50) }), 40),
  ).rejects.toThrow(/volumineuse/);
});
it('requiert des flags explicitement actifs', () => {
  vi.stubEnv('ADMIN_ENABLED', 'true');
  vi.stubEnv('ADMIN_DATA_ENABLED', 'false');
  vi.stubEnv('QUIZ_DB_ENABLED', 'true');
  expect(adminEnabled()).toBe(false);
  expect(quizDbEnabled()).toBe(false);
  vi.unstubAllEnvs();
});
it('réencode les images sûres en WebP sans métadonnées, rejette SVG, faux MIME et polyglotte', async () => {
  const png = await sharp({ create: { width: 30, height: 40, channels: 3, background: '#abcdef' } })
    .png()
    .toBuffer();
  const safe = await sanitizeCover(new File([png], 'couverture.png', { type: 'image/png' }));
  expect(safe.width).toBe(30);
  expect(safe.height).toBe(40);
  const metadata = await sharp(safe.buffer).metadata();
  expect(metadata.format).toBe('webp');
  expect(metadata.exif).toBeUndefined();
  await expect(
    sanitizeCover(new File(['<svg><script/></svg>'], 'image.svg', { type: 'image/svg+xml' })),
  ).rejects.toThrow();
  await expect(
    sanitizeCover(new File([png], 'image.jpg', { type: 'image/jpeg' })),
  ).rejects.toThrow();
  await expect(
    sanitizeCover(
      new File([Buffer.concat([png, Buffer.from('<script/>')])], 'image.png', {
        type: 'image/png',
      }),
    ),
  ).rejects.toThrow();
});
it('priorité couverture admin autorisée et rejet des URL arbitraires', () => {
  vi.stubEnv('ADMIN_BLOB_HOST', 'fixture.public.blob.vercel-storage.com');
  const url = 'https://fixture.public.blob.vercel-storage.com/covers/abc-123.webp';
  expect(
    coverPath('fixture', '/images/book-fallback.svg', {
      url,
      alt: 'Livre',
      usageRightsAttested: true,
    }),
  ).toBe(url);
  expect(
    coverPath('fixture', '/images/book-fallback.svg', {
      url: 'https://evil.example/image.webp',
      alt: 'Livre',
      usageRightsAttested: true,
    }),
  ).toBe('/images/book-fallback.svg');
  vi.unstubAllEnvs();
});
it('refuse un contournement du stock dans la fiche, une URL non HTTPS et des choix dupliqués', () => {
  expect(productInput.safeParse({ stockOnHand: 10 }).success).toBe(false);
  const content = {
    questionFr: 'Question synthétique',
    options: ['a', 'b', 'c', 'd'].map((id) => ({ id, textFr: 'Même choix' })),
    correctOptionId: 'a',
    explanationFr: 'Explication de fixture',
    reference: {
      workTitleAr: 'كتاب',
      authorAr: 'مؤلف',
      sectionAr: 'باب',
      quoteAr: 'نص',
      url: 'javascript:alert(1)',
      edition: null,
      printedPage: null,
      pdfPage: null,
    },
  };
  expect(quizContentSchema.safeParse(content).success).toBe(false);
});
