-- ============================================================================
-- Migration 001: Publishing, Analytics, and Custom Domains
-- ============================================================================
-- Run AFTER schema.sql. Adds settings column for GA/pixel/scripts,
-- published_pages for serving, and hosting metadata.
-- ============================================================================

-- 1. Add settings JSONB to funnels (GA, pixel, favicon, custom head scripts)
alter table public.funnels
  add column if not exists settings jsonb not null default '{}'::jsonb;

comment on column public.funnels.settings is
  'Funnel settings: { ga_id, fb_pixel_id, custom_head_html, favicon_url, meta_title, meta_description, og_image }';

-- 2. Published pages — the static HTML served to visitors
-- When a user publishes, we render each page to final HTML and store it here.
-- This decouples the editable tree (funnel_pages.sections) from the served output.
create table if not exists public.published_pages (
  id          uuid primary key default gen_random_uuid(),
  funnel_id   uuid not null references public.funnels (id) on delete cascade,
  -- The page slug determines the URL path: / = index, /thank-you, /oto
  slug        text not null,
  -- The fully rendered HTML document (complete <html>...) ready to serve
  html        text not null,
  -- Version tracking: bumped each publish so CDN can cache-bust
  version     int not null default 1,
  published_at timestamptz not null default now(),

  unique (funnel_id, slug)
);

comment on table public.published_pages is 'Rendered static HTML pages, served to visitors on the published funnel URL.';

create index if not exists published_pages_funnel_idx on public.published_pages (funnel_id);

-- RLS: public read (visitors need to see published pages), owner write
alter table public.published_pages enable row level security;

drop policy if exists published_pages_public_read on public.published_pages;
drop policy if exists published_pages_owner_write on public.published_pages;

-- Anyone can read published pages (they're public websites)
create policy published_pages_public_read on public.published_pages
  for select using (true);

-- Only the funnel owner can insert/update/delete
create policy published_pages_owner_write on public.published_pages
  for all using (public.owns_funnel(funnel_id))
  with check (public.owns_funnel(funnel_id));

-- 3. Enhance custom_domains with hosting metadata
alter table public.custom_domains
  add column if not exists ssl_status text not null default 'pending'
    check (ssl_status in ('pending', 'provisioning', 'active', 'error')),
  add column if not exists dns_type text not null default 'CNAME'
    check (dns_type in ('CNAME', 'A')),
  add column if not exists dns_value text not null default '';

comment on column public.custom_domains.dns_type is 'CNAME or A record the user needs to set.';
comment on column public.custom_domains.dns_value is 'The value to point to (e.g. cname.vercel-dns.com or an IP).';

-- 4. Published assets (CSS + JS) — one per funnel, shared across pages
create table if not exists public.published_assets (
  id          uuid primary key default gen_random_uuid(),
  funnel_id   uuid not null references public.funnels (id) on delete cascade,
  -- 'css' or 'js'
  asset_type  text not null check (asset_type in ('css', 'js')),
  content     text not null default '',
  version     int not null default 1,
  published_at timestamptz not null default now(),

  unique (funnel_id, asset_type)
);

alter table public.published_assets enable row level security;

create policy published_assets_public_read on public.published_assets
  for select using (true);

create policy published_assets_owner_write on public.published_assets
  for all using (public.owns_funnel(funnel_id))
  with check (public.owns_funnel(funnel_id));

-- ============================================================================
-- DONE. Run this after schema.sql.
-- ============================================================================
