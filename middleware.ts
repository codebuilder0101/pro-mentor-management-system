import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { safeInternalPath } from '@/lib/auth/safe-internal-path';
import { updateSession } from '@/lib/supabase/ssr-middleware';

function copySessionCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

function isPublicPath(pathname: string): boolean {
  if (pathname === '/signin' || pathname === '/signup') return true;
  if (pathname.startsWith('/api/')) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  const { response, user } = await updateSession(request);

  if (pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    const redirectRes = NextResponse.redirect(url);
    copySessionCookies(response, redirectRes);
    return redirectRes;
  }

  if (user && (pathname === '/signin' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    const nextRaw = url.searchParams.get('next');
    url.pathname = safeInternalPath(nextRaw);
    url.search = '';
    const redirectRes = NextResponse.redirect(url);
    copySessionCookies(response, redirectRes);
    return redirectRes;
  }

  if (user) {
    return response;
  }

  if (isPublicPath(pathname)) {
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = '/signin';
  url.search = '';
  const nextTarget = `${pathname}${search}`;
  url.searchParams.set('next', nextTarget);
  const redirectRes = NextResponse.redirect(url);
  copySessionCookies(response, redirectRes);
  return redirectRes;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
