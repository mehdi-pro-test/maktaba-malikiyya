import { NextResponse, type NextRequest } from 'next/server';
import { validQuizCataloguePath } from '@/lib/quiz-route';
/** Dynamic quiz pages may stream before notFound(); reject invalid routes before streaming. */
export function proxy(request: NextRequest) {
  if (!validQuizCataloguePath(request.nextUrl.pathname)) {
    return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
  }
  return NextResponse.next();
}
export const config = { matcher: '/quiz/niveaux/:path*' };
