import { siteIdentity } from '@/lib/site-session';
import { ownerAuth } from '@/lib/admin/auth';
import { assertSameOrigin, memberAccountsEnabled } from '@/lib/admin/config';
import { limitedText } from '@/lib/admin/http';
import { memberPasswordInput } from '@/lib/site-auth-rules';
import { db } from '@/lib/db';
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  try {
    if (!memberAccountsEnabled())
      return Response.json({ error: 'Indisponible' }, { status: 503, headers });
    const identity = await siteIdentity(request.headers);
    if (!identity) return Response.json({ error: 'Connexion requise' }, { status: 401, headers });
    if (identity.user.ownerSlot !== null)
      return Response.json(
        { error: 'Utilisez la sécurité du compte administrateur avec MFA.' },
        { status: 403, headers },
      );
    assertSameOrigin(request.headers);
    const body = memberPasswordInput.parse(JSON.parse(await limitedText(request, 8192)));
    const authHeaders = new Headers(request.headers);
    authHeaders.delete('content-length');
    const response = await ownerAuth().handler(
      new Request(new URL('/api/auth/change-password', request.url), {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(body),
      }),
    );
    if (!response.ok)
      return Response.json(
        { error: 'Modification refusée.' },
        { status: response.status, headers },
      );
    await db.session.deleteMany({ where: { userId: identity.user.id } });
    return Response.json({ ok: true }, { headers });
  } catch {
    return Response.json({ error: 'Modification refusée.' }, { status: 403, headers });
  }
}
