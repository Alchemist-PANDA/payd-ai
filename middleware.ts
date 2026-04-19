import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * PHASE 2 AUTH ENFORCEMENT (Temporary Dev Guard)
 * ENFORCED: Redirects to /login if no 'dev-session' cookie is present.
 * PRODUCTION: Replace with real Supabase createMiddlewareClient check.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/invoices') ||
    pathname.startsWith('/clients') ||
    pathname.startsWith('/action-queue') ||
    pathname.startsWith('/settings');

  if (isDashboardRoute) {
    const devSession = request.cookies.get('dev-session');

    // Log for debugging
    console.log(`[Middleware Check] Path: ${pathname}, Dev Session Cookie: ${!!devSession}`);

    // TEMPORARY: Allow access only if dev-session cookie is set
    // This prevents public exposure of tenant routes during development
    if (!devSession && process.env.NODE_ENV === 'development') {
      console.warn(`[Auth Guard] Unauthorized access to ${pathname} - Redirecting`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
