import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/env';
import { isAdminEmail } from '@/lib/admin/constants';

const ADMIN_LOGIN = '/admin/login';
const PUBLIC_AUTH_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  ADMIN_LOGIN,
];

/**
 * Refreshes Supabase auth cookies, enforces authentication across the boutique,
 * and guards admin-only routes.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLogin = pathname === ADMIN_LOGIN;
  const isPublicAuthRoute = PUBLIC_AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // Without credentials there is nothing to authenticate against.
  if (!isSupabaseConfigured) {
    if (isAdminRoute && !isAdminLogin) {
      const url = new URL(ADMIN_LOGIN, request.url);
      url.searchParams.set('error', 'unconfigured');
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Must be called before the response is returned so refreshed tokens are set.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If visitor is NOT authenticated:
  if (!user) {
    if (isAdminRoute) {
      if (isAdminLogin) return response;
      const url = new URL(ADMIN_LOGIN, request.url);
      url.searchParams.set('next', pathname + search);
      return NextResponse.redirect(url);
    }

    // Public auth routes (login, register, forgot-password, reset-password, callback)
    if (isPublicAuthRoute) {
      return response;
    }

    // All boutique storefront routes require login first.
    // Preserve what the user clicked/requested in `next` so they are returned there.
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  // If visitor IS authenticated:
  // If they visit the customer login or register page, send them to destination or home.
  if (pathname === '/login' || pathname === '/register') {
    const nextParam = request.nextUrl.searchParams.get('next');
    const safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
      ? nextParam
      : '/';
    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  // Handle /admin restricted area
  if (isAdminRoute) {
    let isAdmin = false;
    if (isAdminEmail(user.email)) {
      isAdmin = true;
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      isAdmin = profile?.role === 'admin';
    }

    // Already signed in as admin — skip the login screen
    if (isAdminLogin) {
      if (isAdmin) return NextResponse.redirect(new URL('/admin', request.url));
      return response;
    }

    if (!isAdmin) {
      const url = new URL(ADMIN_LOGIN, request.url);
      url.searchParams.set('error', 'not-admin');
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const middleware = proxy;

export const config = {
  // Everything except Next internals and static assets.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
};
