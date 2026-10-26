import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { twoFactor } from 'better-auth/plugins';
import { db } from '../db';
import { adminConfig } from './config';
export function createOwnerAuth(bootstrap = false) {
  const config = adminConfig();
  return betterAuth({
    database: prismaAdapter(db, { provider: 'postgresql', transaction: true }),
    baseURL: config.url,
    basePath: '/api/auth',
    secret: config.secret,
    trustedOrigins: [config.url],
    emailAndPassword: {
      enabled: true,
      disableSignUp: !bootstrap,
      minPasswordLength: 14,
      maxPasswordLength: 128,
    },
    session: { expiresIn: 8 * 60 * 60, updateAge: 10 * 60, cookieCache: { enabled: false } },
    user: { changeEmail: { enabled: false }, deleteUser: { enabled: false } },
    advanced: {
      useSecureCookies: new URL(config.url).protocol === 'https:',
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
      ipAddress: {
        ipAddressHeaders: process.env.VERCEL ? ['x-vercel-forwarded-for'] : ['x-forwarded-for'],
      },
    },
    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 60,
      max: 60,
      customRules: {
        '/sign-in/email': { window: 900, max: 10 },
        '/two-factor/*': { window: 60, max: 10 },
      },
    },
    plugins: [
      twoFactor({
        issuer: 'Maktaba Malikiyya',
        skipVerificationOnEnable: false,
        accountLockout: { enabled: true, maxFailedAttempts: 10, durationSeconds: 900 },
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!bootstrap || user.email.toLowerCase() !== config.email || (await db.user.count()))
              throw new Error('Création de compte refusée');
            return { data: { ...user, emailVerified: true } };
          },
        },
      },
    },
    logger: { level: 'error', disabled: true },
  });
}
let instance: ReturnType<typeof createOwnerAuth> | undefined;
export const ownerAuth = () => (instance ??= createOwnerAuth());
