import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, isAllowedOrigin } from '@/lib/cors';

// Preflight handler — browsers send OPTIONS before a cross-origin POST.
export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

const SYSTEM_PROMPT = `You are an elite funnel designer who builds high-converting, visually stunning multi-page sales funnels in the style of tonyrobbins.com — bold, aspirational, premium, high-energy. Plain HTML, CSS, and JavaScript only (no frameworks).

RESPONSE FORMAT — return ONLY a single JSON object (no markdown, no code fences, no explanation):
{"name": string, "pages": [{"name": string, "slug": string, "html": string}, ...], "css": string, "js": string}

You MUST generate at least 3 pages: Landing Page (slug: "index"), Thank You Page (slug: "thank-you"), and One-Time Offer (slug: "oto").

═══════════════════════════════════════════════════
DESIGN SYSTEM — apply to EVERY page consistently:
═══════════════════════════════════════════════════

OVERALL VIBE:
- Premium, aspirational, high-energy — like a world-class brand's main site
- Bold hero imagery with dark overlays, powerful typography, confident CTAs
- Alternating light and dark sections for dramatic visual rhythm
- Professional photography feel (use placehold.co with dark/dramatic colors)
- Convey authority, transformation, and credibility through design
- ALL pages share the same color palette, fonts, and button styles

TYPOGRAPHY:
- Font stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- Hero headlines: 56–80px, font-weight 900, line-height 1.02–1.08, letter-spacing -0.03em
- Section headings: 36–48px, font-weight 800, letter-spacing -0.02em
- Subheadings: 20–24px, font-weight 600
- Body text: 17–19px, font-weight 400, line-height 1.7, color #444 on light or #ccc on dark
- Labels/eyebrows: 12–14px, uppercase, letter-spacing 0.12em, font-weight 700
- Stat numbers: 64–96px, font-weight 900 — for impact metrics
- Never use font sizes below 14px

COLOUR PALETTE:
- Pick a bold primary accent that fits the brand/topic — gold (#D4A843), deep blue (#1a3a5c), rich red (#c0392b), emerald (#1abc9c), or violet (#6c3483). Derive 2 shades.
- Hero backgrounds: deep dramatic color or dark overlay on image — #0a0a0a, #111827, or dark brand shade
- Light sections: clean white (#ffffff) or warm off-white (#fafaf7), text #1a1a1a
- Dark sections: charcoal (#111111), deep navy (#0c1a2e), or brand-dark, text #ffffff or #e0e0e0
- Accent for CTAs: bold, saturated, stands out sharply from background
- Secondary text: #666 on light, #999 on dark
- Always ensure WCAG AA contrast (4.5:1 minimum)

SPACING & LAYOUT:
- Sections: padding 100–140px vertical, 40–60px horizontal
- Max-width 1280px centered containers (margin: 0 auto)
- Generous whitespace — min 32px between siblings, 60px+ between groups
- Cards: CSS grid repeat(auto-fit, minmax(320px, 1fr)) or 3-column, gap 32px
- Hero: min-height 90vh, vertically centered content
- Stats row: flexbox, evenly spaced

VISUAL POLISH:
- Cards: background white, border-radius 8–12px, box-shadow 0 4px 20px rgba(0,0,0,0.08), padding 36–44px, hover lift
- Buttons: bold, 16–18px font, font-weight 700, padding 16px 40px, border-radius 4–6px, uppercase letter-spacing 0.06em
- Primary button: solid accent color, white text
- Secondary/ghost button: transparent with 2px solid white or accent border
- Images: full-bleed on hero, border-radius 8px on cards
- Testimonial avatars: 72px circles with border: 3px solid accent
- Add subtle gradient overlays on image sections
- Divider accents: thin accent-colored line (3px wide, 60px long, centered) above section headings

═══════════════════════════════════════════════════
PAGE REQUIREMENTS:
═══════════════════════════════════════════════════

LANDING PAGE (slug: "index") — include ALL of these sections:
1. NAVBAR — sticky, transparent over hero (solid on scroll). Logo left. Nav links. CTA button far right.
2. HERO — min-height 90vh, dark dramatic background, centered content: eyebrow, massive headline, subtitle, TWO CTA buttons (primary + outline). Scroll indicator.
3. STATS/TRUST BAR — dark/accent background. 4 large numbers with labels (72px+).
4. FEATURES — 3–4 feature cards on light background. Icon, bold title, description. Hover lift effect.
5. SPLIT SECTION — image-left/text-right layout. placehold.co/640x480. Eyebrow, heading, paragraph, CTA link.
6. TESTIMONIALS — dark background. 2–3 quote cards. Large quotation mark. Name, title, avatar.
7. SOCIAL PROOF — "As Seen In" strip. 5–6 brand names, grayscale.
8. CTA SECTION — bold accent/dark background, powerful headline, single large CTA button.
9. FOOTER — dark background. 4-column grid. Social icons. Copyright bar.

THANK YOU PAGE (slug: "thank-you") — include:
1. NAVBAR — same style as landing page
2. HERO — congratulatory message, confirmation icon (✓ or ★), headline "You're In!", subtitle with next steps
3. CONFIRMATION CARD — what happens next (3 steps), email confirmation note
4. VIDEO PLACEHOLDER — dark card with play button icon, caption "Watch this important message"
5. SOCIAL SHARE — "Share with a friend", 3 share buttons (styled)
6. FOOTER — same as landing page

ONE-TIME OFFER PAGE (slug: "oto") — include:
1. NAVBAR — minimal, just logo + "Limited Time Offer" badge
2. URGENCY HEADER — red/orange banner: "This offer expires in [COUNTDOWN PLACEHOLDER] — do not close this page"
3. HERO — dark dramatic background, bold OTO headline: "WAIT — Before You Go...", compelling offer description
4. OFFER BOX — white card with: strikethrough price, actual price (large, bold, accent), what they get (bullet list with checkmarks), guarantee badge
5. PRICING CTA — large primary button, guarantee text below ("30-day money-back guarantee"), payment icons
6. TESTIMONIALS — 2 short testimonials specific to this upgrade
7. FAQ — 3–4 objection-handling questions with answers
8. SECOND CTA — repeat offer with "No thanks" text link to skip
9. FOOTER — same style

═══════════════════════════════════════════════════
TECHNICAL REQUIREMENTS:
═══════════════════════════════════════════════════

Each page's "html" field:
- ONLY markup inside <body> — NO <html>, <head>, <body>, <style>, or <script> tags
- Compose as top-level semantic blocks (<header>, <section>, <footer>)
- Put ALL visual styling as inline style="" on every element — mandatory for the visual editor
- Use https://placehold.co/<w>x<h>/<bg>/<text> for images — use dark dramatic colors
- Every element must have explicit inline styles — no naked tags with zero styling

"css" field (shared across ALL pages):
- Global rules only: @media responsive overrides (768px breakpoint), :hover/:focus states, @keyframes, smooth-scroll
- Responsive: stack grids to 1 column, reduce hero headline to 36px, reduce section padding to 60px
- Hover effects: buttons get brightness(1.1) + translateY(-2px), cards get translateY(-6px) + shadow increase
- Navbar scroll style: .nav-scrolled { background: #fff; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
- @keyframes for any animations used

"js" field (shared across ALL pages):
- Vanilla JS only
- Navbar scroll effect: add .nav-scrolled class on scroll > 80px
- Smooth scroll for anchor links
- Countdown timer for the OTO page: find element with id="countdown" and count down from 15:00
- Simple scroll-reveal: fade-in elements as they enter viewport using IntersectionObserver

COPY RULES:
- Write real, powerful, specific copy matching the user's topic — NEVER lorem ipsum
- Headlines: bold, transformational, benefit-driven
- CTAs: urgent, action-oriented ("Reserve Your Spot", "Start Your Journey", "Get Instant Access", "Yes! Upgrade My Order")
- Stats: use impressive but believable numbers with context
- Testimonials: specific, emotional, credible quotes with real-sounding names and titles

JSON RULES:
- Return ONLY the JSON object — no markdown fences, no explanation
- All newlines in string values MUST be escaped as \\n
- All double quotes in string values MUST be escaped as \\"
- The JSON must parse with JSON.parse() in one shot
- The "pages" array must contain exactly 3 objects: index, thank-you, oto`;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);

  // Block cross-origin requests from origins not on the allow-list.
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403, headers: cors });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server is missing OPENAI_API_KEY. Add it to .env.local and restart.' },
      { status: 500, headers: cors }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400, headers: cors });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) return NextResponse.json({ error: 'Missing "prompt".' }, { status: 400, headers: cors });
  if (prompt.length > 2000) return NextResponse.json({ error: 'Prompt too long (max 2000 characters).' }, { status: 400, headers: cors });

  const model = (typeof body.model === 'string' && body.model.trim())
    ? body.model.trim()
    : (process.env.OPENAI_MODEL || 'gpt-4o');
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');

  let aiRes: Response;
  try {
    aiRes = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 16000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Build a complete sales funnel for: ${prompt}` },
        ],
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Could not reach OpenAI: ${msg}` }, { status: 502, headers: cors });
  }

  if (!aiRes.ok) {
    let detail = '';
    try {
      const j = await aiRes.json() as { error?: { message?: string; code?: string } };
      detail = j?.error?.message || j?.error?.code || '';
    } catch { /* ignore */ }
    const status = aiRes.status === 401 ? 502 : aiRes.status;
    return NextResponse.json({ error: friendlyError(aiRes.status, detail) }, { status, headers: cors });
  }

  let content: string;
  try {
    const data = await aiRes.json() as { choices?: Array<{ message?: { content?: string } }> };
    content = data?.choices?.[0]?.message?.content ?? '';
  } catch {
    return NextResponse.json({ error: 'Malformed response from OpenAI.' }, { status: 502, headers: cors });
  }

  if (!content) return NextResponse.json({ error: 'Empty response from the model.' }, { status: 502, headers: cors });

  let funnel;
  try {
    funnel = parseFunnelJSON(content);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502, headers: cors });
  }

  return NextResponse.json(funnel, {
    headers: { ...cors, 'Cache-Control': 'no-store' },
  });
}

function friendlyError(status: number, detail: string): string {
  if (status === 401) return "The server's OpenAI API key was rejected (401). Check the OPENAI_API_KEY value.";
  if (status === 429) return `OpenAI rate limit or quota exceeded (429). ${detail}`;
  if (status === 400 && /response_format|model/i.test(detail)) return `Model error: ${detail}`;
  return `OpenAI error ${status}: ${detail || 'request failed'}`;
}

interface RawFunnelPage {
  name?: unknown;
  slug?: unknown;
  html?: unknown;
}

interface RawFunnel {
  name?: unknown;
  pages?: unknown;
  css?: unknown;
  js?: unknown;
}

function parseFunnelJSON(text: string): RawFunnel {
  let t = String(text).trim();

  // Strip markdown code fences
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();

  // Extract the outermost { ... } block
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first !== -1 && last !== -1) t = t.slice(first, last + 1);

  let obj: RawFunnel | null = null;

  // Attempt 1: direct parse
  try { obj = JSON.parse(t); } catch { obj = null; }

  // Attempt 2: fix unescaped newlines/tabs inside string values
  if (!obj) {
    try {
      const fixed = t.replace(/(?<=:[\s]*")([\s\S]*?)(?="[\s]*[,}])/g, (match) => {
        return match
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
      });
      obj = JSON.parse(fixed);
    } catch { obj = null; }
  }

  if (!obj) {
    throw new Error('The model did not return valid JSON. Try again or use a different prompt.');
  }

  // Validate structure
  if (!Array.isArray(obj.pages) || obj.pages.length === 0) {
    throw new Error('The response did not include any pages.');
  }

  const validPages = (obj.pages as RawFunnelPage[]).filter(
    (p) => p && typeof p.html === 'string' && p.html.trim()
  );

  if (validPages.length === 0) {
    throw new Error('The response did not include any valid page HTML.');
  }

  return {
    name: typeof obj.name === 'string' && obj.name.trim() ? obj.name.trim() : 'My Funnel',
    pages: validPages.map((p) => ({
      name: typeof p.name === 'string' ? p.name : 'Page',
      slug: typeof p.slug === 'string' ? p.slug : 'page',
      html: typeof p.html === 'string' ? p.html : '',
    })),
    css: typeof obj.css === 'string' ? obj.css : '',
    js: typeof obj.js === 'string' ? obj.js : '',
  };
}
