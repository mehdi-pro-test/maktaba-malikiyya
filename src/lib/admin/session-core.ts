import 'server-only';
import { db } from '../db';
import { ownerAuth } from './auth';
import { adminConfig, adminEnabled } from './config';
export class AdminAccessError extends Error {
  constructor(
    public status: number,
    message = 'Accès administrateur refusé',
  ) {
    super(message);
  }
}
export async function ownerIdentity(requestHeaders: Headers) {
  if (!adminEnabled()) throw new AdminAccessError(503, 'Administration désactivée');
  const config = adminConfig();
  const session = await ownerAuth().api.getSession({ headers: requestHeaders });
  if (
    !session ||
    session.user.email.toLowerCase() !== config.email ||
    !session.user.emailVerified ||
    (config.userId && session.user.id !== config.userId)
  )
    throw new AdminAccessError(401);
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.ownerSlot !== 1) throw new AdminAccessError(403);
  return { ...session, user };
}
export async function requireOwnerSession(requestHeaders: Headers) {
  const identity = await ownerIdentity(requestHeaders);
  const proof = await db.adminMfaProof.findUnique({ where: { sessionId: identity.session.id } });
  const now = Date.now();
  if (
    !identity.user.twoFactorEnabled ||
    !proof ||
    proof.expiresAt.getTime() <= now ||
    now - proof.lastSeenAt.getTime() > 30 * 60 * 1000
  )
    throw new AdminAccessError(403, 'Second facteur requis ou session expirée');
  if (now - proof.lastSeenAt.getTime() > 60000)
    await db.adminMfaProof.update({
      where: { sessionId: identity.session.id },
      data: { lastSeenAt: new Date() },
    });
  return { id: identity.user.id, sessionId: identity.session.id };
}
