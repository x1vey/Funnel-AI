// ============================================================================
// Middleware — custom domain routing + auth session refresh
// ============================================================================
// Two jobs:
// 1. If the request comes in on a custom domain (not our app domain), rewrite
//    it to /f/[slug]/[page] so the published funnel is served.
// 2. Refresh the Supabase auth session on every request (standard Supabase SSR).
//
// DEFENSIVE: this runs on EVERY request. It must never throw, or the whole site
// returns MIDDLEWARE_INVOCATION_FAILED. So:
//   - Supabase logic only runs when both env vars are present.
//   - Everything is wrapped so a failure falls through to NextResponse.next().
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Our own app hostnames — requests to these are NOT custom domains
const APP_HOSTS = new Set<string>([
  'localhost',
  '127.0.0.1',
  ...(process.env.NEXT_PUBLIC_APP_DOMAIN ? [process.env.NEXT_PUBLIC_APP_DOMAIN] : []),
]);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export async function middleware(req: NextRequest) {
  try {
    const hostname = req.headers.get('host')?.split(':')[0] || '';
    const pathname = req.nextUrl.pathname;

    // ---- Custom domain routing ----
    // A request on a hostname that isn't ours (and isn't a Vercel preview URL)
    // is a custom domain pointing at a published funnel.
    const isAppHost =
      APP_HOSTS.has(hostname) ||
      hostname.endsWith('.vercel.app') ||
      hostname.endsWith('.pages.dev');

    if (!isAppHost && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
      const pagePath = pathname === '/' ? 'index' : pathname.slice(1);
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = `/f/_custom/${pagePath}`;
      const response = NextResponse.rewrite(rewriteUrl);
      response.headers.set('x-custom-domain', hostname);
      return response;
    }

    // ---- Supabase auth session refresh ----
    // Skip entirely if Supabase isn't configured yet (e.g. env vars not set on
    // Vercel). Without this guard, createServerClient(undefined, …) throws and
    // every request 500s with MIDDLEWARE_INVOCATION_FAILED.
    if (!SUPABASE_CONFIGURED) {
      return NextResponse.next({ request: req });
    }

    let response = NextResponse.next({ request: req });

    const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh the session if expired — important for server components
    await supabase.auth.getUser();

    return response;
  } catch (err) {
    // Never let middleware crash the request. Log and fall through.
    console.error('Middleware error (non-fatal):', err);
    return NextResponse.next({ request: req });
  }
}

export const config = {
  matcher: [
    // Run on all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
