// ============================================================================
// Publisher — renders a funnel to static HTML for serving
// ============================================================================
// Takes the editable data (sections JSONB, global CSS/JS, settings) and
// produces a complete HTML document for each page, with GA/pixel injected.

import { nodeToHTML } from './serializer';
import type { FunnelNode } from '@/store/funnel-store';

interface FunnelSettings {
  ga_id?: string;           // Google Analytics Measurement ID (G-XXXXXXXXXX)
  fb_pixel_id?: string;     // Facebook Pixel ID
  custom_head_html?: string; // Arbitrary HTML injected into <head>
  favicon_url?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
}

interface PublishPageInput {
  name: string;
  slug: string;
  sections: FunnelNode[];
}

interface PublishFunnelInput {
  name: string;
  slug: string;
  globalCSS: string;
  globalJS: string;
  settings: FunnelSettings;
  pages: PublishPageInput[];
}

/**
 * Build the <head> analytics/tracking snippets from funnel settings.
 */
function analyticsSnippets(settings: FunnelSettings): string {
  const parts: string[] = [];

  // Google Analytics (gtag.js)
  if (settings.ga_id) {
    parts.push(`
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${settings.ga_id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${settings.ga_id}');
    </script>`);
  }

  // Facebook Pixel
  if (settings.fb_pixel_id) {
    parts.push(`
    <!-- Facebook Pixel -->
    <script>
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${settings.fb_pixel_id}');
      fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${settings.fb_pixel_id}&ev=PageView&noscript=1"/></noscript>`);
  }

  // Custom head HTML (arbitrary tracking, meta tags, fonts, etc.)
  if (settings.custom_head_html) {
    parts.push(`\n    <!-- Custom Head -->\n    ${settings.custom_head_html}`);
  }

  return parts.join('\n');
}

/**
 * Render a single page to a complete HTML document.
 */
export function renderPage(
  page: PublishPageInput,
  funnel: PublishFunnelInput
): string {
  const { settings } = funnel;

  // Render each section's node tree to HTML
  const bodyHTML = page.sections
    .map((section) => nodeToHTML(section))
    .join('\n');

  const title = settings.meta_title
    ? `${page.name} — ${settings.meta_title}`
    : `${page.name} — ${funnel.name}`;

  const description = settings.meta_description || `${funnel.name} — ${page.name}`;
  const favicon = settings.favicon_url || '/favicon.ico';
  const ogImage = settings.og_image || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(title)}</title>
    <meta name="description" content="${escapeHTML(description)}">
    ${ogImage ? `<meta property="og:image" content="${escapeHTML(ogImage)}">` : ''}
    <meta property="og:title" content="${escapeHTML(title)}">
    <meta property="og:description" content="${escapeHTML(description)}">
    <link rel="icon" href="${escapeHTML(favicon)}">
    ${analyticsSnippets(settings)}
    <link rel="stylesheet" href="styles.css">
</head>
<body>
${bodyHTML}
    <script src="script.js"></script>
</body>
</html>`;
}

/**
 * Render all pages + assets for a funnel.
 * Returns a map of filename → content.
 */
export function renderFunnel(funnel: PublishFunnelInput): Record<string, string> {
  const files: Record<string, string> = {};

  // CSS
  const cssReset = `*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}img{max-width:100%;height:auto}a{text-decoration:none}`;
  files['styles.css'] = cssReset + '\n' + (funnel.globalCSS || '');

  // JS
  files['script.js'] = funnel.globalJS || '';

  // Pages
  for (const page of funnel.pages) {
    const filename = page.slug === 'index' ? 'index.html' : `${page.slug}.html`;
    files[filename] = renderPage(page, funnel);
  }

  return files;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
