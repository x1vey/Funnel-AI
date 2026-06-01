// ============================================================================
// Supabase — browser client (use in Client Components)
// ============================================================================
// This client runs in the browser and carries the user's session via cookies.
// Every query it makes is subject to Row Level Security: the user can only ever
// read/write their own rows. The anon key is safe to expose — RLS is the guard.
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
