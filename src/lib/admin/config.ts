import { z } from 'zod';
export const adminDataEnabled = () => process.env.ADMIN_DATA_ENABLED === 'true';
export const adminEnabled = () => process.env.ADMIN_ENABLED === 'true' && adminDataEnabled();
export const quizDbEnabled = () => process.env.QUIZ_DB_ENABLED === 'true' && adminDataEnabled();
export const memberAccountsEnabled = () =>
  process.env.MEMBER_ACCOUNTS_ENABLED === 'true' && adminDataEnabled();
export function adminConfig() {
  const parsed = z
    .object({
      email: z.email(),
      secret: z.string().min(32),
      url: z.url(),
      userId: z.string().optional(),
    })
    .parse({
      email: process.env.ADMIN_EMAIL?.toLowerCase(),
      secret: process.env.BETTER_AUTH_SECRET,
      url: process.env.APP_URL,
      userId: process.env.ADMIN_USER_ID || undefined,
    });
  const url = new URL(parsed.url);
  if (
    url.username ||
    url.password ||
    (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname))
  )
    throw new Error('Configuration admin invalide');
  return { ...parsed, url: url.origin };
}
export class AdminOriginError extends Error {}
export function assertSameOrigin(headers: Headers) {
  if (headers.get('origin') !== adminConfig().url) throw new AdminOriginError('Origine refusée');
}
