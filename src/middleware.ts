// ============================================================================
// Middleware — custom domain routing + auth session refresh
// ============================================================================
// Two jobs:
// 1. If the request comes in on a custom domain (not our app domain), rewrite
//    it to /f/[slug]/[page] so the published funnel is served.
// 2. Refresh the Supabase auth session on every request (standard Supabase SSR).
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Our own app hostnames — requests to these are NOT custom domains
const APP_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  // Add your production domain here, or read from env:
  ...(process.env.NEXT_PUBLIC_APP_DOMAIN ? [process.env.NEXT_PUBLIC_APP_DOMAIN] : []),
]);

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host')?.split(':')[0] || '';
  const pathname = req.nextUrl.pathname;

  // ---- Custom domain routing ----
  // If the hostname is NOT our app, it's a custom domain → serve the funnel
  const isAppHost = APP_HOSTS.has(hostname) || hostname.endsWith('.vercel.app');

  if (!isAppHost && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
    // Look up which funnel this domain belongs to
    // We can't do a DB call in edge middleware efficiently, so we use a
    // convention: rewrite to /f/_custom/[page] and let the route handler
    // do the DB lookup using the Host header.
    const pagePath = pathname === '/' ? 'index' : pathname.slice(1);
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = `/f/_custom/${pagePath}`;
    // Pass the original host so the route handler can look up the domain
    const response = NextResponse.rewrite(rewriteUrl);
    response.headers.set('x-custom-domain', hostname);
    return response;
  }

  // ---- Supabase auth session refresh ----
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This refreshes the session if expired — important for server components
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Run on all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
