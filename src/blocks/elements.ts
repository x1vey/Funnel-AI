// ============================================================================
// Element & Layout Factories — draggable items for the builder side panel
// ============================================================================
// Each factory returns a fresh FunnelNode (with unique ids on every call) that
// can be dropped onto the canvas. Three groups:
//   - ELEMENTS: individual pieces (heading, text, button, image, etc.)
//   - LAYOUTS:  empty containers (blank section, 1/2/3-column rows, container)
//   - PREBUILT: fully-styled sections (hero, features, testimonials, etc.)
//
// TO ADD A NEW ITEM: add an entry to the relevant array. The side panel and
// canvas drop logic pick it up automatically.
// ============================================================================

import { uid, type FunnelNode } from '@/store/funnel-store';

export type DragKind = 'element' | 'section';

export interface PanelItem {
  id: string;          // unique key for this panel item
  name: string;
  icon: string;        // emoji or short label
  kind: DragKind;      // element → drops into a container; section → top-level
  /** Factory produces a fresh node (with new ids) each call */
  make: () => Omit<FunnelNode, 'id'>;
}

// ─── helpers ────────────────────────────────────────────────────────────────
function el(
  tag: string,
  styles: Record<string, string>,
  text?: string,
  children?: FunnelNode[],
  attrs?: Record<string, string>
): FunnelNode {
  const node: FunnelNode = { id: uid('el'), type: 'element', tag, styles };
  if (text !== undefined) node.text = text;
  if (children) node.children = children;
  if (attrs) node.attrs = attrs;
  return node;
}

function section(
  styles: Record<string, string>,
  children: FunnelNode[],
  tag = 'section'
): Omit<FunnelNode, 'id'> {
  return { type: 'section', tag, styles, children };
}

// ============================================================================
// ELEMENTS — individual draggable pieces
// ============================================================================
export const ELEMENTS: PanelItem[] = [
  {
    id: 'el-heading',
    name: 'Heading',
    icon: 'H',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'h2',
      styles: { fontSize: '36px', fontWeight: '800', color: '#111111', lineHeight: '1.2', margin: '0 0 16px' },
      text: 'Your Heading Here',
    }),
  },
  {
    id: 'el-subheading',
    name: 'Subheading',
    icon: 'h',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'h3',
      styles: { fontSize: '22px', fontWeight: '600', color: '#333333', lineHeight: '1.3', margin: '0 0 12px' },
      text: 'A supporting subheading',
    }),
  },
  {
    id: 'el-text',
    name: 'Paragraph',
    icon: '¶',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'p',
      styles: { fontSize: '17px', color: '#555555', lineHeight: '1.7', margin: '0 0 16px' },
      text: 'Write your body copy here. Keep it focused on the reader and the benefit they get.',
    }),
  },
  {
    id: 'el-button',
    name: 'Button',
    icon: '▭',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'a',
      styles: {
        display: 'inline-block', padding: '16px 40px', background: '#D4A843', color: '#ffffff',
        fontSize: '16px', fontWeight: '700', borderRadius: '6px', textDecoration: 'none',
        letterSpacing: '0.04em', textAlign: 'center',
      },
      text: 'Click Here →',
      attrs: { href: '#' },
    }),
  },
  {
    id: 'el-image',
    name: 'Image',
    icon: '🖼',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'img',
      styles: { width: '100%', maxWidth: '600px', height: 'auto', borderRadius: '8px', display: 'block' },
      attrs: { src: 'https://placehold.co/600x400/1a1a2e/666', alt: 'Image' },
    }),
  },
  {
    id: 'el-divider',
    name: 'Divider',
    icon: '─',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'div',
      styles: { width: '100%', height: '1px', background: '#e0e0e0', margin: '24px 0' },
    }),
  },
  {
    id: 'el-spacer',
    name: 'Spacer',
    icon: '↕',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'div',
      styles: { width: '100%', height: '48px' },
    }),
  },
  {
    id: 'el-icon',
    name: 'Icon / Emoji',
    icon: '★',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'div',
      styles: { fontSize: '48px', lineHeight: '1', margin: '0 0 16px' },
      text: '🔥',
    }),
  },
  {
    id: 'el-list',
    name: 'Bullet List',
    icon: '☰',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'ul',
      styles: { listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '12px' },
      children: [
        el('li', { fontSize: '17px', color: '#444', lineHeight: '1.5' }, '✓ First key benefit goes here'),
        el('li', { fontSize: '17px', color: '#444', lineHeight: '1.5' }, '✓ Second benefit that matters'),
        el('li', { fontSize: '17px', color: '#444', lineHeight: '1.5' }, '✓ Third compelling reason'),
      ],
    }),
  },
  {
    id: 'el-input',
    name: 'Input Field',
    icon: '⌨',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'input',
      styles: {
        width: '100%', maxWidth: '360px', padding: '14px 16px', fontSize: '16px',
        border: '1px solid #ccc', borderRadius: '6px', outline: 'none',
      },
      attrs: { type: 'email', placeholder: 'Enter your email' },
    }),
  },
  {
    id: 'el-video',
    name: 'Video Embed',
    icon: '▶',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'div',
      styles: {
        width: '100%', maxWidth: '720px', aspectRatio: '16/9', background: '#000',
        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '48px',
      },
      text: '▶',
    }),
  },
  {
    id: 'el-countdown',
    name: 'Countdown Timer',
    icon: '⏰',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'div',
      styles: {
        display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center',
        fontSize: '40px', fontWeight: '900', color: '#111', fontVariantNumeric: 'tabular-nums',
      },
      attrs: { 'data-countdown': '15' },
      text: '00 : 15 : 00',
    }),
  },
];

// ============================================================================
// LAYOUTS — empty containers to structure a page
// ============================================================================
export const LAYOUTS: PanelItem[] = [
  {
    id: 'layout-empty-section',
    name: 'Blank Section',
    icon: '▢',
    kind: 'section',
    make: () => section(
      { padding: '80px 40px', background: '#ffffff', minHeight: '160px' },
      [
        el('div', { maxWidth: '1200px', margin: '0 auto', minHeight: '80px' }, undefined, []),
      ]
    ),
  },
  {
    id: 'layout-1col',
    name: '1 Column',
    icon: '▯',
    kind: 'section',
    make: () => section(
      { padding: '60px 40px', background: '#ffffff' },
      [
        el('div', { maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '60px' }, undefined, []),
      ]
    ),
  },
  {
    id: 'layout-2col',
    name: '2 Columns',
    icon: '◫',
    kind: 'section',
    make: () => section(
      { padding: '60px 40px', background: '#ffffff' },
      [
        el('div', {
          maxWidth: '1100px', margin: '0 auto', display: 'grid',
          gridTemplateColumns: '1fr 1fr', gap: '32px',
        }, undefined, [
          el('div', { minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '12px' }, undefined, []),
          el('div', { minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '12px' }, undefined, []),
        ]),
      ]
    ),
  },
  {
    id: 'layout-3col',
    name: '3 Columns',
    icon: '⠿',
    kind: 'section',
    make: () => section(
      { padding: '60px 40px', background: '#ffffff' },
      [
        el('div', {
          maxWidth: '1200px', margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
        }, undefined, [
          el('div', { minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '12px' }, undefined, []),
          el('div', { minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '12px' }, undefined, []),
          el('div', { minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '12px' }, undefined, []),
        ]),
      ]
    ),
  },
  {
    id: 'layout-container',
    name: 'Container (in section)',
    icon: '⊡',
    kind: 'element',
    make: () => ({
      type: 'element', tag: 'div',
      styles: {
        padding: '24px', border: '1px dashed #ccc', borderRadius: '8px',
        minHeight: '80px', display: 'flex', flexDirection: 'column', gap: '12px',
      },
      children: [],
    }),
  },
];

// ============================================================================
// PREBUILT SECTIONS — fully-styled, drop-ready
// ============================================================================
export const PREBUILT_SECTIONS: PanelItem[] = [
  {
    id: 'pre-hero',
    name: 'Hero',
    icon: '🚀',
    kind: 'section',
    make: () => section(
      { minHeight: '90vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 40px' },
      [
        el('div', { maxWidth: '800px', margin: '0 auto', textAlign: 'center' }, undefined, [
          el('p', { fontSize: '13px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4A843', marginBottom: '20px' }, 'Your Category'),
          el('h1', { fontSize: '64px', fontWeight: '900', lineHeight: '1.04', letterSpacing: '-0.03em', color: '#ffffff', marginBottom: '24px' }, 'Your Powerful Headline'),
          el('p', { fontSize: '20px', color: '#aaaaaa', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 40px' }, 'Compelling subtitle that explains the core benefit and builds desire.'),
          el('div', { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }, undefined, [
            el('a', { padding: '16px 40px', background: '#D4A843', color: '#fff', fontWeight: '700', borderRadius: '4px', textDecoration: 'none', fontSize: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'inline-block' }, 'Get Started', undefined, { href: '#' }),
            el('a', { padding: '16px 40px', border: '2px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: '700', borderRadius: '4px', textDecoration: 'none', fontSize: '16px', display: 'inline-block' }, 'Learn More', undefined, { href: '#' }),
          ]),
        ]),
      ]
    ),
  },
  {
    id: 'pre-features',
    name: 'Features (3-col)',
    icon: '⚡',
    kind: 'section',
    make: () => section(
      { padding: '100px 40px', background: '#ffffff' },
      [
        el('div', { maxWidth: '1200px', margin: '0 auto' }, undefined, [
          el('div', { textAlign: 'center', marginBottom: '60px' }, undefined, [
            el('h2', { fontSize: '42px', fontWeight: '800', letterSpacing: '-0.02em', color: '#111', marginBottom: '16px' }, 'Everything You Need'),
            el('p', { fontSize: '18px', color: '#666', maxWidth: '500px', margin: '0 auto' }, 'Built for results, designed for simplicity.'),
          ]),
          el('div', { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }, undefined, [
            el('div', { background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }, undefined, [
              el('div', { fontSize: '40px', marginBottom: '20px' }, '🔥'),
              el('h3', { fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '12px' }, 'Feature One'),
              el('p', { fontSize: '16px', color: '#666', lineHeight: '1.7' }, 'Describe the key benefit of this feature clearly.'),
            ]),
            el('div', { background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }, undefined, [
              el('div', { fontSize: '40px', marginBottom: '20px' }, '⚡'),
              el('h3', { fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '12px' }, 'Feature Two'),
              el('p', { fontSize: '16px', color: '#666', lineHeight: '1.7' }, 'Another powerful benefit that solves a real problem.'),
            ]),
            el('div', { background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }, undefined, [
              el('div', { fontSize: '40px', marginBottom: '20px' }, '🎯'),
              el('h3', { fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '12px' }, 'Feature Three'),
              el('p', { fontSize: '16px', color: '#666', lineHeight: '1.7' }, 'The third pillar of your offer — make it irresistible.'),
            ]),
          ]),
        ]),
      ]
    ),
  },
  {
    id: 'pre-cta',
    name: 'CTA Banner',
    icon: '🔥',
    kind: 'section',
    make: () => section(
      { padding: '90px 40px', background: 'linear-gradient(135deg, #D4A843, #c49230)', textAlign: 'center' },
      [
        el('div', { maxWidth: '700px', margin: '0 auto' }, undefined, [
          el('h2', { fontSize: '44px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em', marginBottom: '14px' }, 'Ready to Get Started?'),
          el('p', { fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }, 'Join thousands who have already transformed their results.'),
          el('a', { display: 'inline-block', padding: '18px 44px', background: '#fff', color: '#c49230', fontSize: '17px', fontWeight: '800', borderRadius: '8px', textDecoration: 'none' }, 'Get Instant Access →', undefined, { href: '#' }),
        ]),
      ]
    ),
  },
  {
    id: 'pre-testimonial',
    name: 'Testimonial',
    icon: '💬',
    kind: 'section',
    make: () => section(
      { padding: '100px 40px', background: '#111111', textAlign: 'center' },
      [
        el('div', { maxWidth: '760px', margin: '0 auto' }, undefined, [
          el('div', { fontSize: '80px', color: '#D4A843', lineHeight: '1', marginBottom: '8px', opacity: '0.4' }, '“'),
          el('p', { fontSize: '26px', fontWeight: '500', color: '#fff', lineHeight: '1.5', fontStyle: 'italic', marginBottom: '28px' }, 'This is the single best investment I have ever made. The results speak for themselves.'),
          el('div', { fontSize: '17px', fontWeight: '700', color: '#fff' }, 'James Mitchell'),
          el('div', { fontSize: '14px', color: '#999' }, 'CEO, Enterprise Solutions'),
        ]),
      ]
    ),
  },
  {
    id: 'pre-footer',
    name: 'Footer',
    icon: '📐',
    kind: 'section',
    make: () => section(
      { padding: '48px 40px', background: '#0a0a1a' },
      [
        el('div', { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }, undefined, [
          el('div', { fontSize: '20px', fontWeight: '800', color: '#fff' }, 'Brand'),
          el('div', { display: 'flex', gap: '24px' }, undefined, [
            el('a', { color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }, 'Privacy', undefined, { href: '#' }),
            el('a', { color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }, 'Terms', undefined, { href: '#' }),
            el('a', { color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }, 'Contact', undefined, { href: '#' }),
          ]),
          el('div', { color: 'rgba(255,255,255,0.4)', fontSize: '13px' }, '© 2026 Brand'),
        ]),
      ],
      'footer'
    ),
  },
];

// Lookup by panel-item id
const ALL_ITEMS = [...ELEMENTS, ...LAYOUTS, ...PREBUILT_SECTIONS];
export function getPanelItem(id: string): PanelItem | undefined {
  return ALL_ITEMS.find((i) => i.id === id);
}
