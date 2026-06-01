// ============================================================================
// CORS policy for Funnel AI API routes
// ============================================================================
// Browsers enforce CORS on cross-origin fetches. Same-origin calls (the builder
// UI calling its own /api/* on the same Vercel domain) do NOT need CORS — but
// we set it explicitly so that:
//   1. A documented allow-list exists (not "*").
//   2. If you later call the API from a different origin (a marketing site, a
//      mobile webview, a custom-domain published funnel), you only edit ONE list.
//
// Configure allowed origins via the ALLOWED_ORIGINS env var (comma-separated),
// e.g.  ALLOWED_ORIGINS="https://funnel-ai.vercel.app,https://app.yourdomain.com"
// In development, localhost origins are always allowed.
// ============================================================================

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3030',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3030',
];

function allowedOrigins(): string[] {
  const fromEnv = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Vercel automatically sets VERCEL_PROJECT_PRODUCTION_URL (without protocol).
  const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prodUrl) fromEnv.push(`https://${prodUrl}`);

  if (process.env.NODE_ENV !== 'production') {
    return [...new Set([...fromEnv, ...DEV_ORIGINS])];
  }
  return [...new Set(fromEnv)];
}

// Resolve the CORS headers for a given request origin.
// If the origin is on the allow-list, echo it back (required when credentials
// are used — you cannot use "*" with credentials). Otherwise omit the header,
// which causes the browser to block the cross-origin response.
export function corsHeaders(origin: string | null): Record<string, string> {
  const list = allowedOrigins();
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };

  if (origin && list.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return headers;
}

// True if the request origin is allowed (or is a same-origin / no-origin call,
// which browsers don't tag with an Origin header for simple navigations).
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // same-origin or server-to-server
  return allowedOrigins().includes(origin);
}
