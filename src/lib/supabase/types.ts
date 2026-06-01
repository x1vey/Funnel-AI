// ============================================================================
// Database types — mirror of db/schema.sql
// ============================================================================
// Keep in sync with the SQL schema. For a fully generated version run:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
// This hand-written version covers the app's needs.

export type Plan = 'free' | 'pro' | 'business';
export type Theme = 'coral' | 'indigo' | 'rose';
export type FunnelStatus = 'draft' | 'published' | 'archived';
export type GenerationStatus = 'pending' | 'succeeded' | 'failed';
export type PageType =
  | 'landing' | 'thank_you' | 'oto' | 'downsell'
  | 'confirmation' | 'optin' | 'sales' | 'custom';

// The editable element tree stored in funnel_pages.sections (JSONB)
export interface FunnelNode {
  id: string;
  type: 'section' | 'element';
  tag: string;
  attrs?: Record<string, string>;
  styles?: Record<string, string>;
  text?: string;
  children?: FunnelNode[];
  freeform?: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  monthly_generation_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Funnel {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  source_prompt: string | null;
  global_css: string;
  global_js: string;
  theme: Theme;
  status: FunnelStatus;
  published_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FunnelPage {
  id: string;
  funnel_id: string;
  name: string;
  slug: string;
  page_type: PageType;
  sections: FunnelNode[];
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  owner_id: string;
  funnel_id: string | null;
  prompt: string;
  model: string;
  status: GenerationStatus;
  error_message: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  duration_ms: number | null;
  created_at: string;
}

export interface Asset {
  id: string;
  owner_id: string;
  funnel_id: string | null;
  storage_path: string;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface CustomDomain {
  id: string;
  owner_id: string;
  funnel_id: string;
  domain: string;
  verified: boolean;
  verification_token: string | null;
  created_at: string;
}
