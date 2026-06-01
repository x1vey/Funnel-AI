-- ============================================================================
-- Funnel AI — Database Schema (PostgreSQL / Supabase)
-- ============================================================================
-- Run this in the Supabase SQL Editor (or via `supabase db push`).
-- It is idempotent-ish: safe to re-run during development, but review before
-- running against production (it drops nothing).
--
-- Auth model: Supabase Auth provides `auth.users`. Every owned row references
-- `auth.uid()`. Row Level Security (RLS) guarantees one user can never read or
-- write another user's data.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. PROFILES  — public mirror of auth.users (1:1)
-- ============================================================================
-- Supabase keeps private auth data in auth.users. We keep app-facing profile
-- data here so the client can read it under RLS.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  full_name     text,
  avatar_url    text,
  plan          text not null default 'free'
                  check (plan in ('free', 'pro', 'business')),
  -- soft monthly quota for AI generations; enforced in app + optionally a trigger
  monthly_generation_limit int not null default 10,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'App-facing user profile, 1:1 with auth.users.';

-- ============================================================================
-- 2. FUNNELS  — a funnel project (a set of pages sharing one CSS + one JS)
-- ============================================================================
create table if not exists public.funnels (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade,
  name          text not null default 'Untitled Funnel',
  -- url-safe identifier, unique per owner (used in export folder name + routing)
  slug          text not null default 'untitled-funnel',
  description   text,
  -- the prompt the user originally typed (handy for re-generation / history)
  source_prompt text,
  -- shared assets across every page in the funnel
  global_css    text not null default '',
  global_js     text not null default '',
  theme         text not null default 'indigo'
                  check (theme in ('coral', 'indigo', 'rose')),
  status        text not null default 'draft'
                  check (status in ('draft', 'published', 'archived')),
  published_url text,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique (owner_id, slug)
);

comment on table public.funnels is 'A funnel project owned by one user. Pages live in funnel_pages.';

create index if not exists funnels_owner_idx        on public.funnels (owner_id);
create index if not exists funnels_owner_status_idx on public.funnels (owner_id, status);
create index if not exists funnels_updated_idx      on public.funnels (owner_id, updated_at desc);

-- ============================================================================
-- 3. FUNNEL_PAGES  — individual pages (landing, thank-you, OTO, …)
-- ============================================================================
-- Each page belongs to a funnel. The element tree (sections + nested children)
-- is stored as JSONB — it's a document, not relational data, and is always
-- read/written as a whole when the page loads into the editor.
create table if not exists public.funnel_pages (
  id          uuid primary key default gen_random_uuid(),
  funnel_id   uuid not null references public.funnels (id) on delete cascade,
  name        text not null default 'Untitled Page',
  -- file name on export: index, thank-you, oto, downsell, confirmation, …
  slug        text not null default 'index',
  -- semantic role, drives the "+ Add Page" menu and AI generation
  page_type   text not null default 'landing'
                  check (page_type in
                    ('landing', 'thank_you', 'oto', 'downsell',
                     'confirmation', 'optin', 'sales', 'custom')),
  -- the editable element tree: FunnelNode[] exactly as the Zustand store holds it
  sections    jsonb not null default '[]'::jsonb,
  -- ordering of pages within the funnel
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique (funnel_id, slug)
);

comment on table public.funnel_pages is 'One page of a funnel. `sections` is the JSONB element tree.';

create index if not exists funnel_pages_funnel_idx     on public.funnel_pages (funnel_id);
create index if not exists funnel_pages_funnel_pos_idx on public.funnel_pages (funnel_id, position);

-- ============================================================================
-- 4. GENERATIONS  — log of every AI generation (audit, quota, debugging)
-- ============================================================================
create table if not exists public.generations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade,
  -- nullable: a generation may happen before a funnel row is created
  funnel_id     uuid references public.funnels (id) on delete set null,
  prompt        text not null,
  model         text not null default 'gpt-4o',
  status        text not null default 'pending'
                  check (status in ('pending', 'succeeded', 'failed')),
  error_message text,
  prompt_tokens int,
  completion_tokens int,
  total_tokens  int,
  duration_ms   int,
  created_at    timestamptz not null default now()
);

comment on table public.generations is 'Audit log of AI generation calls for quota + debugging.';

create index if not exists generations_owner_idx      on public.generations (owner_id, created_at desc);
create index if not exists generations_owner_month_idx on public.generations (owner_id, created_at);

-- ============================================================================
-- 5. ASSETS  — user-uploaded media (images, logos)
-- ============================================================================
-- Binary lives in Supabase Storage; this row is metadata + the storage path.
create table if not exists public.assets (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  funnel_id   uuid references public.funnels (id) on delete set null,
  -- path within the storage bucket, e.g. "{owner_id}/{uuid}.png"
  storage_path text not null,
  file_name   text,
  mime_type   text,
  size_bytes  bigint,
  width       int,
  height      int,
  created_at  timestamptz not null default now()
);

comment on table public.assets is 'Metadata for user uploads; binary is in Supabase Storage.';

create index if not exists assets_owner_idx  on public.assets (owner_id, created_at desc);
create index if not exists assets_funnel_idx on public.assets (funnel_id);

-- ============================================================================
-- 6. CUSTOM_DOMAINS  — optional custom domains for published funnels
-- ============================================================================
create table if not exists public.custom_domains (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  funnel_id   uuid not null references public.funnels (id) on delete cascade,
  domain      text not null unique,
  verified    boolean not null default false,
  verification_token text,
  created_at  timestamptz not null default now()
);

comment on table public.custom_domains is 'Custom domains pointed at published funnels.';

create index if not exists custom_domains_owner_idx  on public.custom_domains (owner_id);
create index if not exists custom_domains_funnel_idx on public.custom_domains (funnel_id);

-- ============================================================================
-- HELPER: ownership check for child tables (avoids repeating the subquery)
-- ============================================================================
create or replace function public.owns_funnel(f_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.funnels f
    where f.id = f_id and f.owner_id = auth.uid()
  );
$$;

comment on function public.owns_funnel is 'True if the current auth user owns the given funnel.';

-- ============================================================================
-- TRIGGERS: keep updated_at fresh
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated     on public.profiles;
drop trigger if exists trg_funnels_updated       on public.funnels;
drop trigger if exists trg_funnel_pages_updated  on public.funnel_pages;

create trigger trg_profiles_updated    before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_funnels_updated     before update on public.funnels
  for each row execute function public.set_updated_at();
create trigger trg_funnel_pages_updated before update on public.funnel_pages
  for each row execute function public.set_updated_at();

-- ============================================================================
-- TRIGGER: auto-create a profile row whenever a user signs up
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Enable RLS on every table. With RLS on and no policy, access is DENIED by
-- default — so the policies below are the ONLY way data is reachable.
alter table public.profiles       enable row level security;
alter table public.funnels        enable row level security;
alter table public.funnel_pages   enable row level security;
alter table public.generations    enable row level security;
alter table public.assets         enable row level security;
alter table public.custom_domains enable row level security;

-- ---- PROFILES: a user sees and edits only their own profile ----------------
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists profiles_insert on public.profiles;

create policy profiles_select on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- no delete policy: profiles are removed via auth.users cascade only

-- ---- FUNNELS: full CRUD restricted to the owner ----------------------------
drop policy if exists funnels_select on public.funnels;
drop policy if exists funnels_insert on public.funnels;
drop policy if exists funnels_update on public.funnels;
drop policy if exists funnels_delete on public.funnels;

create policy funnels_select on public.funnels
  for select using (auth.uid() = owner_id);
create policy funnels_insert on public.funnels
  for insert with check (auth.uid() = owner_id);
create policy funnels_update on public.funnels
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy funnels_delete on public.funnels
  for delete using (auth.uid() = owner_id);

-- OPTIONAL — public read of PUBLISHED funnels (uncomment if you ever serve
-- published pages straight from the DB instead of static export). This lets
-- anonymous visitors read only rows whose status = 'published'.
-- create policy funnels_public_read on public.funnels
--   for select using (status = 'published');

-- ---- FUNNEL_PAGES: ownership flows through the parent funnel ----------------
drop policy if exists funnel_pages_select on public.funnel_pages;
drop policy if exists funnel_pages_insert on public.funnel_pages;
drop policy if exists funnel_pages_update on public.funnel_pages;
drop policy if exists funnel_pages_delete on public.funnel_pages;

create policy funnel_pages_select on public.funnel_pages
  for select using (public.owns_funnel(funnel_id));
create policy funnel_pages_insert on public.funnel_pages
  for insert with check (public.owns_funnel(funnel_id));
create policy funnel_pages_update on public.funnel_pages
  for update using (public.owns_funnel(funnel_id)) with check (public.owns_funnel(funnel_id));
create policy funnel_pages_delete on public.funnel_pages
  for delete using (public.owns_funnel(funnel_id));

-- OPTIONAL — public read of pages belonging to published funnels:
-- create policy funnel_pages_public_read on public.funnel_pages
--   for select using (exists (
--     select 1 from public.funnels f
--     where f.id = funnel_pages.funnel_id and f.status = 'published'));

-- ---- GENERATIONS: owner-only ------------------------------------------------
drop policy if exists generations_select on public.generations;
drop policy if exists generations_insert on public.generations;
drop policy if exists generations_update on public.generations;

create policy generations_select on public.generations
  for select using (auth.uid() = owner_id);
create policy generations_insert on public.generations
  for insert with check (auth.uid() = owner_id);
create policy generations_update on public.generations
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ---- ASSETS: owner-only -----------------------------------------------------
drop policy if exists assets_select on public.assets;
drop policy if exists assets_insert on public.assets;
drop policy if exists assets_delete on public.assets;

create policy assets_select on public.assets
  for select using (auth.uid() = owner_id);
create policy assets_insert on public.assets
  for insert with check (auth.uid() = owner_id);
create policy assets_delete on public.assets
  for delete using (auth.uid() = owner_id);

-- ---- CUSTOM_DOMAINS: owner-only ---------------------------------------------
drop policy if exists custom_domains_all on public.custom_domains;

create policy custom_domains_all on public.custom_domains
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ============================================================================
-- STORAGE BUCKET for assets (run once; safe to re-run)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('funnel-assets', 'funnel-assets', true)
on conflict (id) do nothing;

-- Storage RLS: a user may only write/delete within their own {user_id}/ prefix.
-- Public read is allowed because published pages reference image URLs directly.
drop policy if exists "assets_read_all"    on storage.objects;
drop policy if exists "assets_insert_own"  on storage.objects;
drop policy if exists "assets_update_own"  on storage.objects;
drop policy if exists "assets_delete_own"  on storage.objects;

create policy "assets_read_all" on storage.objects
  for select using (bucket_id = 'funnel-assets');

create policy "assets_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'funnel-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "assets_update_own" on storage.objects
  for update using (
    bucket_id = 'funnel-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "assets_delete_own" on storage.objects
  for delete using (
    bucket_id = 'funnel-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- DONE.
-- ============================================================================
