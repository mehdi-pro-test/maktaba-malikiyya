import { z } from 'zod';
import { limitedText } from './http';
import { memberAccountsEnabled } from './config';
import { registrationInput, memberUsername } from '../site-auth-rules';
import { siteSessionView } from '../site-session';
import { memberEmail } from '../site-auth-rules';
import { createOwnerAuth } from './auth';
import 'server-only';
import { applySetCookies } from 'better-auth/cookies';
import { db } from '../db';
import { ownerAuth } from './auth';
import { adminConfig, adminEnabled, assertSameOrigin } from './config';
import { ownerIdentity, requireOwnerSession } from './session-core';
const allowed = new Set([
  '/sign-in/email',
  '/sign-in/username',
  '/sign-up/username',
  '/sign-out',
  '/change-password',
  '/two-factor/enable',
  '/two-factor/verify-totp',
  '/two-factor/verify-backup-code',
  '/two-factor/generate-backup-codes',
]);
export async function adminAuthHandler(request: Request) {
  const responseHeaders = { 'Cache-Control': 'private, no-store' };
  if (!adminEnabled() && !memberAccountsEnabled())
    return Response.json(
      { error: 'Administration désactivée' },
      { status: 503, headers: responseHeaders },
    );
  const path = new URL(request.url).pathname.replace(/^\/api\/auth/, '');
  if (!allowed.has(path) || request.method !== 'POST')
    return Response.json(
      { error: 'Route non disponible' },
      { status: 404, headers: responseHeaders },
    );
  try {
    adminConfig();
    if (['/sign-in/username', '/sign-up/username'].includes(path) && !memberAccountsEnabled())
      return Response.json(
        { error: 'Inscription indisponible.' },
        { status: 503, headers: responseHeaders },
      );
    let sensitiveOwner: { id: string; sessionId: string } | undefined;
    if (request.method === 'POST') {
      assertSameOrigin(request.headers);
      if (Number(request.headers.get('content-length') ?? 0) > 8192)
        throw new Error('Requête trop volumineuse');
      const raw = await limitedText(request, 8192);
      const parsed = JSON.parse(raw);
      const schema =
        path === '/sign-up/username'
          ? registrationInput
          : path === '/sign-in/username'
            ? z.object({ username: memberUsername, password: z.string().max(128) }).strict()
            : path === '/change-password'
              ? z
                  .object({
                    currentPassword: z.string().max(128),
                    newPassword: z.string().min(14).max(128),
                    revokeOtherSessions: z.literal(true),
                  })
                  .strict()
              : path === '/sign-in/email'
                ? z.object({ email: z.email().max(254), password: z.string().max(128) }).strict()
                : path.includes('verify-')
                  ? z.object({ code: z.string().min(1).max(40) }).strict()
                  : path === '/two-factor/enable'
                    ? z
                        .object({
                          password: z.string().max(128),
                          method: z.literal('totp').optional(),
                        })
                        .strict()
                    : path === '/two-factor/generate-backup-codes'
                      ? z.object({ password: z.string().max(128) }).strict()
                      : z.object({}).strict();
      const body = schema.parse(parsed) as Record<string, unknown>;
      if (path === '/sign-up/username') {
        const username = body.username as string;
        body.email = memberEmail(username);
        body.name = username;
        body.displayUsername = username;
      }
      const safeHeaders = new Headers(request.headers);
      safeHeaders.delete('content-length');
      request = new Request(
        path === '/sign-up/username'
          ? new URL('/api/auth/sign-up/email', request.url)
          : request.url,
        {
          method: request.method,
          headers: safeHeaders,
          body: JSON.stringify(body),
        },
      );
      if (body.trustDevice || body.disableSession || (body.method && body.method !== 'totp'))
        throw new Error('Option non autorisée');
      if (path === '/two-factor/enable') {
        const identity = await ownerIdentity(request.headers);
        // Enrollment can occur with password-only session only before first activation.
        if (identity.user.twoFactorEnabled) await requireOwnerSession(request.headers);
        sensitiveOwner = { id: identity.user.id, sessionId: identity.session.id };
      }
      if (['/two-factor/generate-backup-codes', '/change-password'].includes(path))
        sensitiveOwner = await requireOwnerSession(request.headers);
    }
    const auth = path === '/sign-up/username' ? createOwnerAuth(false, true) : ownerAuth(),
      response = await auth.handler(request);
    if (
      request.method === 'POST' &&
      ['/two-factor/verify-totp', '/two-factor/verify-backup-code'].includes(path) &&
      response.ok
    ) {
      const merged = new Headers(request.headers);
      applySetCookies(merged, response.headers.getSetCookie());
      const identity = await ownerIdentity(merged);
      if (!identity.user.twoFactorEnabled)
        throw new Error('Activation du second facteur non confirmée');
      await db.$transaction(async (tx) => {
        await tx.adminMfaProof.upsert({
          where: { sessionId: identity.session.id },
          create: {
            sessionId: identity.session.id,
            expiresAt: new Date(
              Math.min(identity.session.expiresAt.getTime(), Date.now() + 8 * 3600000),
            ),
          },
          update: {
            verifiedAt: new Date(),
            lastSeenAt: new Date(),
            expiresAt: new Date(
              Math.min(identity.session.expiresAt.getTime(), Date.now() + 8 * 3600000),
            ),
          },
        });
        await tx.adminAuditEvent.create({
          data: {
            actorId: identity.user.id,
            action: 'auth.mfa',
            entityType: 'session',
            entityId: identity.session.id,
            correlationId: crypto.randomUUID(),
          },
        });
      });
    }
    if (response.ok && sensitiveOwner) {
      const merged = new Headers(request.headers);
      applySetCookies(merged, response.headers.getSetCookie());
      const current = path === '/change-password' ? null : await ownerIdentity(merged);
      await db.$transaction(async (tx) => {
        if (path === '/two-factor/enable')
          await tx.adminMfaProof.deleteMany({ where: { session: { userId: sensitiveOwner!.id } } });
        await tx.session.deleteMany({
          where: {
            userId: sensitiveOwner!.id,
            ...(current ? { id: { not: current.session.id } } : {}),
          },
        });
        await tx.adminAuditEvent.create({
          data: {
            actorId: sensitiveOwner!.id,
            action:
              path === '/change-password'
                ? 'auth.password-change'
                : path === '/two-factor/enable'
                  ? 'auth.mfa-enrollment'
                  : 'auth.recovery-codes',
            entityType: 'owner',
            entityId: sensitiveOwner!.id,
            correlationId: crypto.randomUUID(),
          },
        });
      });
    }
    if (!response.ok && response.status !== 429)
      await db.adminAuditEvent.create({
        data: {
          actorId: 'anonymous',
          action: 'auth.failed',
          entityType: 'authentication',
          entityId: 'owner',
          correlationId: crypto.randomUUID(),
        },
      });
    const safe = new Headers(response.headers);
    safe.set('Cache-Control', 'private, no-store');
    safe.delete('content-length');
    safe.set('Content-Type', 'application/json');
    const result = await response.json();
    // No session token is returned in JSON. Better Auth owns the signed HttpOnly cookies.
    const body = !response.ok
      ? { error: 'Connexion refusée. Vérifiez vos informations ou réessayez plus tard.' }
      : ['/sign-in/email', '/sign-in/username', '/sign-up/username'].includes(path)
        ? { twoFactorRedirect: result.twoFactorRedirect === true }
        : path === '/two-factor/enable'
          ? { totpURI: result.totpURI, backupCodes: result.backupCodes }
          : path === '/two-factor/generate-backup-codes'
            ? { backupCodes: result.backupCodes }
            : { ok: true };
    if (
      response.ok &&
      ['/sign-in/email', '/sign-in/username', '/sign-up/username'].includes(path) &&
      !('twoFactorRedirect' in result && result.twoFactorRedirect === true)
    ) {
      const merged = new Headers(request.headers);
      applySetCookies(merged, response.headers.getSetCookie());
      const view = await siteSessionView(merged);
      Object.assign(body, { redirectTo: view.mode === 'member' ? '/quiz/niveaux' : view.href });
    }
    return new Response(JSON.stringify(body), { status: response.status, headers: safe });
  } catch {
    return Response.json(
      { error: 'Connexion refusée ou configuration incomplète.' },
      { status: 403, headers: responseHeaders },
    );
  }
}
