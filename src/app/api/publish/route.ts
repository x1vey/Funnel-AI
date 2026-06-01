// ============================================================================
// POST /api/publish — Publish a funnel (render pages → store in DB → return URL)
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderFunnel } from '@/lib/publisher';
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

  // Upsert published pages
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

  // Upsert published assets (CSS + JS)
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
  const publishedUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/f/${funnel.slug}`;
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
    pages: pages.map((p: { slug: string }) => ({
      slug: p.slug,
      url: p.slug === 'index'
        ? `${publishedUrl}`
        : `${publishedUrl}/${p.slug}`,
    })),
  });
}
