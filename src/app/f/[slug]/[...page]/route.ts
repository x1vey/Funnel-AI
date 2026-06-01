// ============================================================================
// GET /f/[slug]/[...page] — Serve a published funnel page
// ============================================================================
// This is what visitors see. The URL structure:
//   /f/my-funnel           → index.html (landing page)
//   /f/my-funnel/thank-you → thank-you page
//   /f/my-funnel/oto       → OTO page
//   /f/my-funnel/styles.css → shared CSS
//   /f/my-funnel/script.js  → shared JS
//
// Pages are served from the `published_pages` table (public read via RLS).
// No auth required — these are public websites.
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use a lightweight client (no auth needed for public reads)
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; page?: string[] }> }
): Promise<NextResponse> {
  const { slug, page } = await params;
  const pagePath = page?.[0] || 'index';

  const supabase = publicClient();

  // Find the funnel by slug
  const { data: funnel } = await supabase
    .from('funnels')
    .select('id, status')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!funnel) {
    return new NextResponse('Funnel not found.', { status: 404 });
  }

  // Serve CSS
  if (pagePath === 'styles.css') {
    const { data: asset } = await supabase
      .from('published_assets')
      .select('content')
      .eq('funnel_id', funnel.id)
      .eq('asset_type', 'css')
      .single();

    return new NextResponse(asset?.content || '', {
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  }

  // Serve JS
  if (pagePath === 'script.js') {
    const { data: asset } = await supabase
      .from('published_assets')
      .select('content')
      .eq('funnel_id', funnel.id)
      .eq('asset_type', 'js')
      .single();

    return new NextResponse(asset?.content || '', {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  }

  // Serve HTML page
  const { data: published } = await supabase
    .from('published_pages')
    .select('html')
    .eq('funnel_id', funnel.id)
    .eq('slug', pagePath)
    .single();

  if (!published) {
    return new NextResponse('Page not found.', { status: 404 });
  }

  // Fix asset URLs in the HTML to point to our serving route
  const baseUrl = `/f/${slug}`;
  const html = published.html
    .replace(/href="styles\.css"/g, `href="${baseUrl}/styles.css"`)
    .replace(/src="script\.js"/g, `src="${baseUrl}/script.js"`);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=3600',
    },
  });
}
