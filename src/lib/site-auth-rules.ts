import { z } from 'zod';
const reserved = new Set([
  'admin',
  'administrateur',
  'administrator',
  'root',
  'owner',
  'proprietaire',
  'support',
  'maktaba',
  'maktabamalikiyya',
]);
export const memberUsername = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/, 'Lettres, chiffres et tiret bas uniquement.')
  .transform((v) => v.toLowerCase())
  .refine((v) => !reserved.has(v), 'Ce pseudo est réservé.');
/** Internal unique identifier required by the auth provider; never a deliverable/verified email. */
export const memberEmail = (username: string) => `u-${username}@accounts.maktaba.invalid`;
export const registrationInput = z
  .object({ username: memberUsername, password: z.string().min(14).max(128) })
  .strict();
export const memberPasswordInput = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(14).max(128),
    revokeOtherSessions: z.literal(true),
  })
  .strict();
