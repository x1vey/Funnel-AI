# Funnel AI — Database Design

> **Stack:** PostgreSQL on **Supabase** (Postgres + Auth + Storage + RLS).
> Drops into Vercel cleanly; RLS policies key off `auth.uid()`.
> Schema lives in [`db/schema.sql`](../db/schema.sql) — run it in the Supabase SQL Editor.

---

## 1. Design principles

| Principle | Decision |
|---|---|
| **Isolation** | Every owned row has `owner_id` (or inherits ownership via a parent). RLS denies cross-user access by default. |
| **Pages = rows, trees = JSONB** | Each funnel page is its own row (clean reordering, per-page type, add/delete). The deeply-nested element tree inside a page is JSONB — it's a document, loaded/saved whole. |
| **Auth = Supabase Auth** | `auth.users` is managed by Supabase. We mirror app-facing fields into `public.profiles` (1:1). |
| **Published output is static** | Published funnels are exported as static HTML/CSS/JS. The DB only needs owner-scoped access. (Optional public-read policies are included but commented out.) |
| **Service role is server-only** | The only key that bypasses RLS is `SUPABASE_SERVICE_ROLE_KEY`, used solely in trusted server code (audit log, quotas). Never shipped to the browser. |

---

## 2. Entity relationship overview

```
auth.users (Supabase-managed)
   │ 1:1
   ▼
profiles
   │
   │ 1:N (owner_id)
   ▼
funnels ──────────────┬───────────────┬──────────────────┐
   │ 1:N              │ 1:N           │ 1:N              │ 1:N
   ▼                  ▼               ▼                  ▼
funnel_pages      generations      assets          custom_domains
(sections JSONB)  (AI audit log)   (media meta)    (published domains)
```

- A **user** has many **funnels**.
- A **funnel** has many **pages** (landing, thank-you, OTO, …), shares one `global_css` + `global_js`.
- A **funnel** has many **generations** (audit log of AI calls), **assets** (uploads), and **custom_domains**.

---

## 3. Tables

### `profiles` — app-facing user data (1:1 with `auth.users`)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | FK → `auth.users.id`, cascade delete |
| `email`, `full_name`, `avatar_url` | text | mirrored from auth on signup |
| `plan` | text | `free` \| `pro` \| `business` |
| `monthly_generation_limit` | int | soft quota, default 10 |
| `created_at`, `updated_at` | timestamptz | |

A trigger (`handle_new_user`) auto-creates this row on signup.

### `funnels` — a funnel project
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `owner_id` | uuid | FK → `auth.users`, cascade |
| `name`, `slug`, `description` | text | `slug` unique per owner |
| `source_prompt` | text | original prompt (for re-generation) |
| `global_css`, `global_js` | text | **shared across all pages** |
| `theme` | text | `coral` \| `indigo` \| `rose` |
| `status` | text | `draft` \| `published` \| `archived` |
| `published_url`, `published_at` | | set on publish |

Indexed on `owner_id`, `(owner_id, status)`, `(owner_id, updated_at desc)`.

### `funnel_pages` — individual pages
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `funnel_id` | uuid | FK → `funnels`, cascade |
| `name`, `slug` | text | `slug` = export filename (`index`, `thank-you`, `oto`); unique per funnel |
| `page_type` | text | `landing` \| `thank_you` \| `oto` \| `downsell` \| `confirmation` \| `optin` \| `sales` \| `custom` |
| `sections` | **jsonb** | the editable `FunnelNode[]` tree |
| `position` | int | ordering within the funnel |

> **Why JSONB for `sections`?** The element tree is read and written as a whole every time a page opens in the editor. It's a document with arbitrary nesting — modelling each element as a row would mean hundreds of joins per page load and complex tree-rebuild logic, with no querying benefit (you never query "all `<h1>` elements across funnels"). JSONB is the right fit. If you later need analytics on elements, add a GIN index on `sections`.

### `generations` — AI generation audit log
Tracks every `/api/generate` call: `prompt`, `model`, `status`, token counts, `duration_ms`, `error_message`. Powers quota enforcement and debugging.

### `assets` — uploaded media metadata
Binary lives in Supabase **Storage** (`funnel-assets` bucket); this table holds the `storage_path` + dimensions + mime. Path convention: `{owner_id}/{uuid}.png` so storage RLS can scope by folder.

### `custom_domains` — domains for published funnels
`domain` (unique), `verified`, `verification_token`.

---

## 4. Row Level Security (RLS)

**RLS is enabled on every table.** With RLS on and no matching policy, Postgres **denies** the row. So the policies are the *only* path to data.

### The core rule
Every policy reduces to: **you can only touch rows you own.**

- **Direct ownership** (`funnels`, `generations`, `assets`, `custom_domains`, `profiles`):
  ```sql
  using (auth.uid() = owner_id)        -- read/update/delete
  with check (auth.uid() = owner_id)   -- insert/update
  ```
- **Inherited ownership** (`funnel_pages`): ownership flows through the parent funnel via a `SECURITY DEFINER` helper:
  ```sql
  create function owns_funnel(f_id uuid) returns boolean ... 
    select exists(select 1 from funnels where id = f_id and owner_id = auth.uid());

  -- policy:
  using (public.owns_funnel(funnel_id))
  ```

### Why one user can never see another's data
1. `auth.uid()` returns the JWT's user id — **set by Supabase, not forgeable by the client**.
2. Every `SELECT` is rewritten by Postgres to append the policy's `USING` clause. A query for someone else's funnel returns **zero rows** — not an error, just nothing.
3. Inserts/updates are checked against `WITH CHECK`, so a user can't write a row with someone else's `owner_id`.
4. The browser only ever uses the **anon key**, which has no special privileges — RLS is fully in force.

### Storage RLS
The `funnel-assets` bucket allows **public read** (published pages reference image URLs) but **write/delete only within your own `{user_id}/` folder**:
```sql
(storage.foldername(name))[1] = auth.uid()::text
```

### Optional public read
If you ever serve published funnels *from the DB* instead of static export, uncomment the `*_public_read` policies in the schema — they expose only rows where `status = 'published'`.

---

## 5. CORS

Configured in [`src/lib/cors.ts`](../src/lib/cors.ts), applied in [`src/app/api/generate/route.ts`](../src/app/api/generate/route.ts).

- **Same-origin calls** (the builder calling its own `/api/*` on the same Vercel domain) don't need CORS at all — they just work.
- **Cross-origin calls** are gated by an **allow-list** (not `*`):
  - Dev: `localhost:3000/3030` always allowed.
  - Prod: Vercel's `VERCEL_PROJECT_PRODUCTION_URL` + anything in the `ALLOWED_ORIGINS` env var.
- An `OPTIONS` handler answers preflight requests.
- Disallowed origins get **403**; the `Access-Control-Allow-Origin` header is only echoed for allow-listed origins (required because we use credentials — `*` is illegal with credentials).

> **Note:** CORS protects the browser-to-API boundary. It is **not** a data-isolation mechanism — that's RLS's job. The two are complementary: CORS controls *who can call the API from a browser*, RLS controls *what data any authenticated request can touch*.

---

## 6. Environment variables

| Variable | Exposure | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | anon key (RLS-guarded) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** | bypasses RLS — audit log, quotas |
| `OPENAI_API_KEY` | **server-only** | AI generation |
| `OPENAI_MODEL` | server-only | default `gpt-4o` |
| `ALLOWED_ORIGINS` | server-only | extra CORS origins |

Set all of these in **Vercel → Project → Settings → Environment Variables**, and in `.env.local` for local dev. See [`.env.example`](../.env.example).

---

## 7. Client usage

| File | Client | Runs in | RLS |
|---|---|---|---|
| `src/lib/supabase/client.ts` | browser | Client Components | ✅ enforced |
| `src/lib/supabase/server.ts` | server | Server Components, Route Handlers | ✅ enforced (acts as the user) |
| `src/lib/supabase/admin.ts` | service-role | trusted server only | ⛔ bypassed (use sparingly) |

```ts
// Client Component — list MY funnels (RLS returns only mine)
const supabase = createClient();
const { data } = await supabase
  .from('funnels')
  .select('*')
  .order('updated_at', { ascending: false });
```

---

## 8. Typical query patterns

```sql
-- A user's funnels (newest first) — RLS auto-filters to owner
select * from funnels order by updated_at desc;

-- A funnel with all its pages, in order
select p.* from funnel_pages p
where p.funnel_id = $1
order by p.position;

-- This month's generation count (for quota)
select count(*) from generations
where created_at >= date_trunc('month', now());

-- Save an edited page (whole tree at once)
update funnel_pages set sections = $1 where id = $2;
```

---

## 9. Migration & next steps

- **Apply schema:** paste `db/schema.sql` into the Supabase SQL Editor, run once.
- **Generate types (optional):** `npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts` to replace the hand-written types.
- **Future tables to consider:** `funnel_versions` (snapshot history beyond in-memory undo), `team_members` (if you add collaboration — would need a membership-based RLS policy instead of owner-only), `analytics_events` (page views / conversions on published funnels).
