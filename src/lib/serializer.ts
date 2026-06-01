import type { FunnelNode, FunnelPage, FunnelProject } from '@/store/funnel-store';
import { uid } from '@/store/funnel-store';

// ─── Constants ────────────────────────────────────────────────────────────────

const VOID_TAGS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr']);
const TEXT_TAGS = new Set(['h1','h2','h3','h4','h5','h6','p','a','span','button','label','li','small','strong','em','blockquote','td','th']);

// ─── Node → HTML ──────────────────────────────────────────────────────────────

export function nodeToHTML(node: FunnelNode, indent = 0): string {
  const pad = '  '.repeat(indent);
  const tag = node.tag || 'div';
  const attrsStr = serializeAttrs(node);
  const styleStr = serializeInlineStyle(node);
  const idAttr = `data-pc-id="${node.id}" data-pc-type="${node.type || 'element'}"`;
  const allAttrs = [idAttr, attrsStr, styleStr].filter(Boolean).join(' ');
  const open = `<${tag} ${allAttrs}>`;

  if (VOID_TAGS.has(tag)) {
    return `${pad}<${tag} ${allAttrs}>`;
  }

  if (node.children && node.children.length > 0) {
    const inner = node.children.map(c => nodeToHTML(c, indent + 1)).join('\n');
    return `${pad}${open}\n${inner}\n${pad}</${tag}>`;
  }

  if (node.text !== undefined && node.text !== null) {
    return `${pad}${open}${escapeText(node.text)}</${tag}>`;
  }

  return `${pad}${open}</${tag}>`;
}

// For export — clean HTML without data-pc-* attributes
export function nodeToExportHTML(node: FunnelNode, indent = 0): string {
  const pad = '  '.repeat(indent);
  const tag = node.tag || 'div';
  const attrsStr = serializeAttrs(node);
  const styleStr = serializeInlineStyle(node);
  const allAttrs = [attrsStr, styleStr].filter(Boolean).join(' ');
  const open = `<${tag}${allAttrs ? ' ' + allAttrs : ''}>`;

  if (VOID_TAGS.has(tag)) {
    return `${pad}<${tag}${allAttrs ? ' ' + allAttrs : ''}>`;
  }

  if (node.children && node.children.length > 0) {
    const inner = node.children.map(c => nodeToExportHTML(c, indent + 1)).join('\n');
    return `${pad}${open}\n${inner}\n${pad}</${tag}>`;
  }

  if (node.text !== undefined && node.text !== null) {
    return `${pad}${open}${escapeText(node.text)}</${tag}>`;
  }

  return `${pad}${open}</${tag}>`;
}

function serializeAttrs(node: FunnelNode): string {
  if (!node.attrs) return '';
  return Object.entries(node.attrs)
    .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
    .join(' ');
}

function serializeInlineStyle(node: FunnelNode): string {
  if (!node.styles) return '';
  const parts = Object.entries(node.styles).map(([k, v]) => `${camelToKebab(k)}: ${v}`);
  if (!parts.length) return '';
  return `style="${escapeAttr(parts.join('; '))}"`;
}

function escapeAttr(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeText(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function camelToKebab(s: string): string {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function kebabToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// ─── HTML → Nodes ─────────────────────────────────────────────────────────────

export function htmlToSections(html: string): FunnelNode[] {
  if (typeof window === 'undefined') return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__root__">${html}</div>`, 'text/html');
  const root = doc.getElementById('__root__');
  if (!root) return [];
  return Array.from(root.children).map(child => domToNode(child as HTMLElement, true));
}

export function htmlToNode(html: string): FunnelNode | null {
  if (typeof window === 'undefined') return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__root__">${html}</div>`, 'text/html');
  const root = doc.getElementById('__root__');
  if (!root?.firstElementChild) return null;
  return domToNode(root.firstElementChild as HTMLElement, false);
}

function domToNode(el: HTMLElement, isTopLevel: boolean): FunnelNode {
  const node: FunnelNode = {
    id: el.getAttribute('data-pc-id') || uid(isTopLevel ? 'sec' : 'el'),
    type: isTopLevel ? 'section' : 'element',
    tag: el.tagName.toLowerCase(),
    attrs: {},
    styles: {},
  };

  if (isTopLevel) node.freeform = true;

  for (const attr of Array.from(el.attributes)) {
    if (attr.name === 'style') {
      node.styles = parseInlineStyle(attr.value);
    } else if (attr.name !== 'data-pc-id' && attr.name !== 'data-pc-type') {
      node.attrs![attr.name] = attr.value;
    }
  }

  if (Object.keys(node.attrs!).length === 0) delete node.attrs;
  if (Object.keys(node.styles!).length === 0) delete node.styles;

  if (el.children.length > 0) {
    node.children = Array.from(el.children).map(c => domToNode(c as HTMLElement, false));
  } else {
    const text = el.textContent?.trim();
    if (text) node.text = text;
  }

  return node;
}

function parseInlineStyle(str: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!str) return out;
  for (const decl of str.split(';')) {
    const m = decl.match(/^\s*([\w-]+)\s*:\s*(.+?)\s*$/);
    if (m) out[kebabToCamel(m[1])] = m[2];
  }
  return out;
}

// ─── CSS Scoping ──────────────────────────────────────────────────────────────

export function scopeCSS(css: string, prefix: string): string {
  if (!css || !css.trim()) return '';
  let out = '', i = 0;
  const n = css.length;
  const skipWs = () => { while (i < n && /\s/.test(css[i])) i++; };

  while (i < n) {
    skipWs();
    if (i >= n) break;

    if (css[i] === '@') {
      const start = i;
      while (i < n && css[i] !== '{' && css[i] !== ';') i++;
      const prelude = css.slice(start, i);

      if (css[i] === ';') { out += prelude + ';'; i++; continue; }
      i++; // consume {
      let depth = 1;
      const bstart = i;
      while (i < n && depth > 0) {
        if (css[i] === '{') depth++;
        else if (css[i] === '}') depth--;
        if (depth > 0) i++;
      }
      const inner = css.slice(bstart, i); i++;

      out += /^@(media|supports)/i.test(prelude.trim())
        ? `${prelude}{${scopeCSS(inner, prefix)}}`
        : `${prelude}{${inner}}`;
      continue;
    }

    const selStart = i;
    while (i < n && css[i] !== '{') i++;
    const selector = css.slice(selStart, i); i++;
    let depth = 1;
    const bstart = i;
    while (i < n && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      if (depth > 0) i++;
    }
    const body = css.slice(bstart, i); i++;

    const scoped = selector.split(',').map(s => {
      s = s.trim();
      if (!s) return s;
      if (/^(html|body|:root)\b/i.test(s)) return s.replace(/^(html|body|:root)/i, prefix);
      return `${prefix} ${s}`;
    }).join(', ');

    out += `${scoped}{${body}}`;
  }

  return out;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function buildPageHTML(
  page: FunnelPage,
  project: FunnelProject,
  { cssHref = 'styles.css', jsSrc = 'script.js' } = {}
): string {
  const body = page.sections.map(s => nodeToExportHTML(s, 1)).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeText(project.name)} - ${escapeText(page.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="${cssHref}">
</head>
<body>
${body}
  <script src="${jsSrc}"></script>
</body>
</html>`;
}

export function buildExportCSS(project: FunnelProject): string {
  return `/* Reset */
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #111; }
img { max-width: 100%; display: block; }
a { color: inherit; }

/* Project CSS */
${project.globalCSS || ''}
`;
}

export function buildExportJS(project: FunnelProject): string {
  return project.globalJS || '';
}

// ─── Canvas Render ────────────────────────────────────────────────────────────

export function renderNodesToDOM(nodes: FunnelNode[], container: HTMLElement): void {
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const node of nodes) {
    frag.appendChild(createDOMElement(node));
  }
  container.appendChild(frag);
}

function createDOMElement(node: FunnelNode): HTMLElement {
  const tag = node.tag || 'div';
  const el = document.createElement(tag);

  if (node.attrs) {
    for (const [k, v] of Object.entries(node.attrs)) {
      try { el.setAttribute(k, v); } catch { /* ignore invalid attrs */ }
    }
  }

  if (node.styles) {
    for (const [k, v] of Object.entries(node.styles)) {
      try { el.style.setProperty(camelToKebab(k), v); } catch { /* ignore */ }
    }
  }

  el.setAttribute('data-pc-id', node.id);
  el.setAttribute('data-pc-type', node.type || 'element');
  if (node.freeform) el.setAttribute('data-pc-freeform', 'true');

  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      el.appendChild(createDOMElement(child));
    }
  } else if (node.text !== undefined && !VOID_TAGS.has(tag)) {
    el.textContent = node.text;
  }

  return el;
}
