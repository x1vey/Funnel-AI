// ============================================================================
// POST /api/publish — Publish a funnel to Cloudflare Pages
// ============================================================================
// 1. Render each page to final static HTML (with GA/pixel injected)
// 2. Deploy all files to Cloudflare Pages via Direct Upload API
// 3. Get back a live URL: https://{funnel-slug}.pages.dev
// 4. Store published state in DB
//
// The user's funnel is live on the internet in seconds. No VPS needed.
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderFunnel } from '@/lib/publisher';
import { deploy } from '@/lib/cloudflare-pages';
import type { FunnelNode } from '@/store/funnel-store';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  // Parse body
  let body: { funnel_id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { funnel_id } = body;
  if (!funnel_id) {
    return NextResponse.json({ error: 'Missing funnel_id.' }, { status: 400 });
  }

  // Fetch the funnel (RLS ensures it's the user's)
  const { data: funnel, error: funnelError } = await supabase
    .from('funnels')
    .select('*')
    .eq('id', funnel_id)
    .single();

  if (funnelError || !funnel) {
    return NextResponse.json({ error: 'Funnel not found.' }, { status: 404 });
  }

  // Fetch all pages
  const { data: pages, error: pagesError } = await supabase
    .from('funnel_pages')
    .select('*')
    .eq('funnel_id', funnel_id)
    .order('position');

  if (pagesError || !pages || pages.length === 0) {
    return NextResponse.json({ error: 'Funnel has no pages.' }, { status: 400 });
  }

  // Render all pages to static HTML
  const rendered = renderFunnel({
    name: funnel.name,
    slug: funnel.slug,
    globalCSS: funnel.global_css,
    globalJS: funnel.global_js,
    settings: funnel.settings || {},
    pages: pages.map((p: { name: string; slug: string; sections: FunnelNode[] }) => ({
      name: p.name,
      slug: p.slug,
      sections: p.sections as FunnelNode[],
    })),
  });

  // ---- Deploy to Cloudflare Pages ----
  let publishedUrl: string;
  let deploymentId: string | null = null;

  const hasCfCredentials = process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID;

  if (hasCfCredentials) {
    try {
      const result = await deploy(funnel.slug, rendered);
      publishedUrl = result.url;
      deploymentId = result.deploymentId;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Cloudflare Pages deploy failed:', msg);
      // Fall back to self-hosted URL
      publishedUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/f/${funnel.slug}`;
    }
  } else {
    // No CF credentials — serve from our own /f/ route (fallback)
    publishedUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/f/${funnel.slug}`;
  }

  // ---- Also store in DB (backup + serves /f/ fallback route) ----
  for (const page of pages) {
    const filename = page.slug === 'index' ? 'index.html' : `${page.slug}.html`;
    const html = rendered[filename];
    if (!html) continue;

    await supabase
      .from('published_pages')
      .upsert(
        {
          funnel_id,
          slug: page.slug,
          html,
          version: (page.version || 0) + 1,
          published_at: new Date().toISOString(),
        },
        { onConflict: 'funnel_id,slug' }
      );
  }

  await supabase
    .from('published_assets')
    .upsert(
      { funnel_id, asset_type: 'css', content: rendered['styles.css'] || '', published_at: new Date().toISOString() },
      { onConflict: 'funnel_id,asset_type' }
    );
  await supabase
    .from('published_assets')
    .upsert(
      { funnel_id, asset_type: 'js', content: rendered['script.js'] || '', published_at: new Date().toISOString() },
      { onConflict: 'funnel_id,asset_type' }
    );

  // Update funnel status
  await supabase
    .from('funnels')
    .update({
      status: 'published',
      published_url: publishedUrl,
      published_at: new Date().toISOString(),
    })
    .eq('id', funnel_id);

  return NextResponse.json({
    url: publishedUrl,
    deployment_id: deploymentId,
    hosted_on: hasCfCredentials ? 'cloudflare_pages' : 'self_hosted',
    pages: pages.map((p: { slug: string; name: string }) => ({
      name: p.name,
      slug: p.slug,
      url: p.slug === 'index'
        ? publishedUrl
        : `${publishedUrl}/${p.slug}`,
    })),
  });
}
