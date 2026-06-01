// ============================================================================
// Supabase — admin client (SERVER ONLY — never import in a Client Component)
// ============================================================================
// Uses the service-role key, which BYPASSES Row Level Security. Use it only for
// trusted server-side work that legitimately needs cross-user access, e.g.:
//   - writing a generation audit-log row keyed to a user
//   - enforcing quotas
//   - background/cron jobs
// NEVER expose the service-role key to the browser. There is no NEXT_PUBLIC_
// prefix on purpose — Next.js will not ship it to the client.
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set (server-only env var).');
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
