import { siteSessionView } from '@/lib/site-session';
export async function GET(request: Request) {
  try {
    return Response.json(await siteSessionView(request.headers), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return Response.json(
      { mode: 'anonymous', href: '/connexion', label: 'Connexion' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
