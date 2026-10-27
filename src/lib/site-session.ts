import 'server-only';
import { ownerAuth } from './admin/auth';
import { db } from './db';
import { adminConfig, adminEnabled, memberAccountsEnabled } from './admin/config';
import { requireOwnerSession } from './admin/session-core';
export async function siteIdentity(headers: Headers) {
  if ((!adminEnabled() && !memberAccountsEnabled()) || !headers.get('cookie')) return null;
  const session = await ownerAuth().api.getSession({ headers });
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      ownerSlot: true,
      username: true,
      name: true,
      email: true,
      emailVerified: true,
      twoFactorEnabled: true,
    },
  });
  if (!user) return null;
  return { user, sessionId: session.session.id };
}
export async function siteSessionView(headers: Headers) {
  const identity = await siteIdentity(headers);
  if (!identity) return { mode: 'anonymous' as const, href: '/connexion', label: 'Connexion' };
  if (identity.user.ownerSlot === null)
    return { mode: 'member' as const, href: '/compte', label: 'Mon compte' };
  const c = adminConfig();
  if (
    identity.user.ownerSlot !== 1 ||
    identity.user.email.toLowerCase() !== c.email ||
    !identity.user.emailVerified ||
    (c.userId && c.userId !== identity.user.id)
  )
    return { mode: 'anonymous' as const, href: '/connexion', label: 'Connexion' };
  try {
    await requireOwnerSession(headers);
    return { mode: 'admin' as const, href: '/admin', label: 'Administration' };
  } catch {
    return {
      mode: 'owner-pending' as const,
      href: identity.user.twoFactorEnabled ? '/connexion' : '/admin/activation',
      label: 'Sécuriser la connexion',
    };
  }
}
