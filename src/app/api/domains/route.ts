// ============================================================================
// /api/domains — Manage custom domains for published funnels
// ============================================================================
// POST   — add a custom domain
// GET    — list domains for the current user
// DELETE — remove a domain
//
// Domain verification flow:
// 1. User adds domain (e.g. "launch.mybusiness.com")
// 2. We return DNS instructions (CNAME → cname.vercel-dns.com)
// 3. User sets the DNS record at their registrar
// 4. We verify via DNS lookup (separate cron or on-demand check)
// 5. SSL is auto-provisioned by Vercel once DNS propagates
//
// For Vercel hosting: use the Vercel API to add the domain to your project.
// For self-hosted: use Caddy/nginx with auto-SSL.
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

// GET /api/domains — list user's domains
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { data: domains } = await supabase
    .from('custom_domains')
    .select('*, funnels(name, slug)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ domains: domains || [] });
}

// POST /api/domains — add a custom domain
export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  let body: { domain: string; funnel_id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { domain, funnel_id } = body;
  if (!domain || !funnel_id) {
    return NextResponse.json({ error: 'Missing domain or funnel_id.' }, { status: 400 });
  }

  // Normalize domain (strip protocol, trailing slash, www)
  const cleanDomain = domain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '');

  // Verify the user owns this funnel (RLS handles it, but be explicit)
  const { data: funnel } = await supabase
    .from('funnels')
    .select('id')
    .eq('id', funnel_id)
    .single();

  if (!funnel) {
    return NextResponse.json({ error: 'Funnel not found.' }, { status: 404 });
  }

  // Generate a verification token
  const verificationToken = `funnel-ai-verify-${randomBytes(16).toString('hex')}`;

  // The DNS target — where the user points their CNAME.
  // For Vercel: cname.vercel-dns.com
  // For custom: your server's IP or hostname
  const dnsValue = process.env.CUSTOM_DOMAIN_CNAME || 'cname.vercel-dns.com';

  const { data: newDomain, error } = await supabase
    .from('custom_domains')
    .insert({
      owner_id: user.id,
      funnel_id,
      domain: cleanDomain,
      verification_token: verificationToken,
      dns_type: 'CNAME',
      dns_value: dnsValue,
      verified: false,
      ssl_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This domain is already registered.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optionally: call the Vercel API to add the domain to the project
  // await addDomainToVercel(cleanDomain);

  return NextResponse.json({
    domain: newDomain,
    dns_instructions: {
      type: 'CNAME',
      name: cleanDomain,
      value: dnsValue,
      note: `Add a CNAME record pointing "${cleanDomain}" to "${dnsValue}" at your domain registrar. SSL will be provisioned automatically once DNS propagates (usually 1–24 hours).`,
    },
  });
}

// DELETE /api/domains — remove a domain
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const domainId = searchParams.get('id');
  if (!domainId) return NextResponse.json({ error: 'Missing domain id.' }, { status: 400 });

  const { error } = await supabase
    .from('custom_domains')
    .delete()
    .eq('id', domainId)
    .eq('owner_id', user.id); // RLS enforces this too, but be explicit

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ deleted: true });
}
