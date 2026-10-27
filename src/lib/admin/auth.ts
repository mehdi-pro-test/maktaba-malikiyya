import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { twoFactor, username } from 'better-auth/plugins';
import { memberUsername, memberEmail } from '../site-auth-rules';
import { db } from '../db';
import { adminConfig, memberAccountsEnabled } from './config';
export function createOwnerAuth(bootstrap = false, registration = false) {
  const config = adminConfig();
  return betterAuth({
    database: prismaAdapter(db, { provider: 'postgresql', transaction: true }),
    baseURL: config.url,
    basePath: '/api/auth',
    secret: config.secret,
    trustedOrigins: [config.url],
    emailAndPassword: {
      enabled: true,
      disableSignUp: !(bootstrap || (registration && memberAccountsEnabled())),
      minPasswordLength: 14,
      maxPasswordLength: 128,
    },
    session: { expiresIn: 8 * 60 * 60, updateAge: 10 * 60, cookieCache: { enabled: false } },
    user: {
      changeEmail: { enabled: false },
      deleteUser: { enabled: false },
      additionalFields: {
        ownerSlot: { type: 'number', required: false, input: false, returned: false },
      },
    },
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
        '/sign-up/email': { window: 3600, max: 5 },
        '/sign-in/username': { window: 900, max: 10 },
        '/two-factor/*': { window: 60, max: 10 },
      },
    },
    plugins: [
      ...(memberAccountsEnabled()
        ? [
            username({
              minUsernameLength: 3,
              maxUsernameLength: 30,
              usernameValidator: (v) => memberUsername.safeParse(v).success,
            }),
          ]
        : []),
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
            if (bootstrap) {
              if (
                user.email.toLowerCase() !== config.email ||
                (await db.user.count({ where: { ownerSlot: 1 } }))
              )
                throw new Error('Création de propriétaire refusée');
              return { data: { ...user, ownerSlot: 1, emailVerified: true } };
            }
            const supplied = memberUsername.safeParse((user as { username?: unknown }).username);
            if (
              !registration ||
              !memberAccountsEnabled() ||
              !supplied.success ||
              user.email !== memberEmail(supplied.data) ||
              user.email.toLowerCase() === config.email
            )
              throw new Error('Inscription refusée');
            return { data: { ...user, ownerSlot: undefined, emailVerified: false } };
          },
        },
      },
    },
    logger: { level: 'error', disabled: true },
  });
}
let instance: ReturnType<typeof createOwnerAuth> | undefined;
export const ownerAuth = () => (instance ??= createOwnerAuth());
