'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useFunnelStore, FunnelNode } from '@/store/funnel-store';
import { uid } from '@/store/funnel-store';
import { X, Search } from 'lucide-react';

// ─── Section Templates ────────────────────────────────────────────────────────

function makeSection(tag: string, styles: Record<string, string>, children: FunnelNode[]): Omit<FunnelNode, 'id'> {
  return { type: 'section', tag, styles, freeform: true, children };
}

function el(tag: string, styles: Record<string, string>, text?: string, children?: FunnelNode[], attrs?: Record<string, string>): FunnelNode {
  const node: FunnelNode = { id: uid('el'), type: 'element', tag, styles };
  if (text !== undefined) node.text = text;
  if (children) node.children = children;
  if (attrs) node.attrs = attrs;
  return node;
}

const SECTION_TEMPLATES = [
  {
    name: 'Hero',
    emoji: '🚀',
    template: makeSection('section', {
      minHeight: '90vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 40px',
    }, [
      el('div', { maxWidth: '800px', margin: '0 auto', textAlign: 'center' }, undefined, [
        el('p', { fontSize: '13px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4A843', marginBottom: '20px' }, 'Your Category'),
        el('h1', { fontSize: '64px', fontWeight: '900', lineHeight: '1.04', letterSpacing: '-0.03em', color: '#ffffff', marginBottom: '24px' }, 'Your Powerful Headline'),
        el('p', { fontSize: '20px', color: '#aaaaaa', lineHeight: '1.7', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }, 'Compelling subtitle that explains the core benefit and builds desire.'),
        el('div', { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }, undefined, [
          el('a', { padding: '16px 40px', background: '#D4A843', color: '#fff', fontWeight: '700', borderRadius: '4px', textDecoration: 'none', fontSize: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'inline-block' }, 'Get Started', undefined, { href: '#' }),
          el('a', { padding: '16px 40px', border: '2px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: '700', borderRadius: '4px', textDecoration: 'none', fontSize: '16px', display: 'inline-block' }, 'Learn More', undefined, { href: '#' }),
        ]),
      ]),
    ]),
  },
  {
    name: 'Features',
    emoji: '⚡',
    template: makeSection('section', {
      padding: '100px 40px',
      background: '#ffffff',
    }, [
      el('div', { maxWidth: '1200px', margin: '0 auto' }, undefined, [
        el('div', { textAlign: 'center', marginBottom: '60px' }, undefined, [
          el('p', { fontSize: '13px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4A843', marginBottom: '12px' }, 'Features'),
          el('h2', { fontSize: '42px', fontWeight: '800', letterSpacing: '-0.02em', color: '#111', marginBottom: '16px' }, 'Everything You Need'),
          el('p', { fontSize: '18px', color: '#666', maxWidth: '500px', margin: '0 auto' }, 'Built for results, designed for simplicity.'),
        ]),
        el('div', { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }, undefined, [
          el('div', { background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }, undefined, [
            el('div', { fontSize: '40px', marginBottom: '20px' }, '🔥'),
            el('h3', { fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '12px' }, 'Feature One'),
            el('p', { fontSize: '16px', color: '#666', lineHeight: '1.7' }, 'Describe the key benefit of this feature in a clear, compelling way.'),
          ]),
          el('div', { background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }, undefined, [
            el('div', { fontSize: '40px', marginBottom: '20px' }, '⚡'),
            el('h3', { fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '12px' }, 'Feature Two'),
            el('p', { fontSize: '16px', color: '#666', lineHeight: '1.7' }, 'Another powerful benefit that solves a real problem for your audience.'),
          ]),
          el('div', { background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }, undefined, [
            el('div', { fontSize: '40px', marginBottom: '20px' }, '🎯'),
            el('h3', { fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '12px' }, 'Feature Three'),
            el('p', { fontSize: '16px', color: '#666', lineHeight: '1.7' }, 'The third pillar of your offer — make it feel irresistible.'),
          ]),
        ]),
      ]),
    ]),
  },
  {
    name: 'Testimonials',
    emoji: '💬',
    template: makeSection('section', {
      padding: '100px 40px',
      background: '#111111',
    }, [
      el('div', { maxWidth: '1200px', margin: '0 auto' }, undefined, [
        el('div', { textAlign: 'center', marginBottom: '60px' }, undefined, [
          el('p', { fontSize: '13px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4A843', marginBottom: '12px' }, 'Testimonials'),
          el('h2', { fontSize: '42px', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }, 'What Our Clients Say'),
        ]),
        el('div', { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }, undefined, [
          el('div', { background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)' }, undefined, [
            el('p', { fontSize: '22px', fontStyle: 'italic', color: '#e0e0e0', lineHeight: '1.6', marginBottom: '24px' }, '"This completely transformed my business. The results were incredible."'),
            el('div', { display: 'flex', alignItems: 'center', gap: '16px' }, undefined, [
              el('img', { width: '56px', height: '56px', borderRadius: '50%', border: '3px solid #D4A843', objectFit: 'cover' }, undefined, undefined, { src: 'https://placehold.co/56x56/1a1a2e/D4A843?text=JD', alt: 'Avatar' }),
              el('div', {}, undefined, [
                el('p', { fontWeight: '700', color: '#fff', fontSize: '15px' }, 'Jane Doe'),
                el('p', { color: '#999', fontSize: '13px' }, 'CEO, Company Inc.'),
              ]),
            ]),
          ]),
          el('div', { background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)' }, undefined, [
            el('p', { fontSize: '22px', fontStyle: 'italic', color: '#e0e0e0', lineHeight: '1.6', marginBottom: '24px' }, '"I was skeptical at first, but after just 30 days, everything changed."'),
            el('div', { display: 'flex', alignItems: 'center', gap: '16px' }, undefined, [
              el('img', { width: '56px', height: '56px', borderRadius: '50%', border: '3px solid #D4A843', objectFit: 'cover' }, undefined, undefined, { src: 'https://placehold.co/56x56/1a1a2e/D4A843?text=MS', alt: 'Avatar' }),
              el('div', {}, undefined, [
                el('p', { fontWeight: '700', color: '#fff', fontSize: '15px' }, 'Mark Smith'),
                el('p', { color: '#999', fontSize: '13px' }, 'Founder, Startup Co.'),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),
  },
  {
    name: 'CTA Section',
    emoji: '🎯',
    template: makeSection('section', {
      padding: '100px 40px',
      background: 'linear-gradient(135deg, #D4A843 0%, #c89030 100%)',
      textAlign: 'center',
    }, [
      el('div', { maxWidth: '700px', margin: '0 auto' }, undefined, [
        el('h2', { fontSize: '48px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em', marginBottom: '20px', lineHeight: '1.1' }, 'Ready to Transform Your Results?'),
        el('p', { fontSize: '20px', color: 'rgba(255,255,255,0.85)', marginBottom: '40px', lineHeight: '1.7' }, 'Join thousands of people who have already made the change. Your journey starts today.'),
        el('a', { display: 'inline-block', padding: '20px 56px', background: '#fff', color: '#D4A843', fontWeight: '900', borderRadius: '4px', textDecoration: 'none', fontSize: '18px', letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }, 'Start Now — It\'s Free', undefined, { href: '#' }),
      ]),
    ]),
  },
  {
    name: 'Stats Bar',
    emoji: '📊',
    template: makeSection('section', {
      padding: '60px 40px',
      background: '#0c1a2e',
    }, [
      el('div', { maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '40px' }, undefined, [
        el('div', { textAlign: 'center' }, undefined, [
          el('div', { fontSize: '72px', fontWeight: '900', color: '#D4A843', lineHeight: '1' }, '50M+'),
          el('p', { fontSize: '13px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginTop: '8px' }, 'Lives Changed'),
        ]),
        el('div', { textAlign: 'center' }, undefined, [
          el('div', { fontSize: '72px', fontWeight: '900', color: '#D4A843', lineHeight: '1' }, '6,000+'),
          el('p', { fontSize: '13px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginTop: '8px' }, 'Events Held'),
        ]),
        el('div', { textAlign: 'center' }, undefined, [
          el('div', { fontSize: '72px', fontWeight: '900', color: '#D4A843', lineHeight: '1' }, '35+'),
          el('p', { fontSize: '13px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginTop: '8px' }, 'Years Experience'),
        ]),
        el('div', { textAlign: 'center' }, undefined, [
          el('div', { fontSize: '72px', fontWeight: '900', color: '#D4A843', lineHeight: '1' }, '100+'),
          el('p', { fontSize: '13px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginTop: '8px' }, 'Countries'),
        ]),
      ]),
    ]),
  },
  {
    name: 'FAQ',
    emoji: '❓',
    template: makeSection('section', {
      padding: '100px 40px',
      background: '#fafaf7',
    }, [
      el('div', { maxWidth: '800px', margin: '0 auto' }, undefined, [
        el('div', { textAlign: 'center', marginBottom: '60px' }, undefined, [
          el('h2', { fontSize: '42px', fontWeight: '800', color: '#111', letterSpacing: '-0.02em' }, 'Frequently Asked Questions'),
        ]),
        el('div', { display: 'flex', flexDirection: 'column', gap: '24px' }, undefined, [
          el('div', { background: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }, undefined, [
            el('h3', { fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '12px' }, 'How does this work?'),
            el('p', { fontSize: '16px', color: '#555', lineHeight: '1.7' }, 'Answer this common question clearly and concisely. Address the specific concern or objection your audience has.'),
          ]),
          el('div', { background: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }, undefined, [
            el('h3', { fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '12px' }, 'What results can I expect?'),
            el('p', { fontSize: '16px', color: '#555', lineHeight: '1.7' }, 'Share realistic but compelling results. Use specific numbers and timeframes when possible.'),
          ]),
          el('div', { background: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }, undefined, [
            el('h3', { fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '12px' }, 'Is there a money-back guarantee?'),
            el('p', { fontSize: '16px', color: '#555', lineHeight: '1.7' }, 'Yes! We stand behind our product 100%. If you\'re not satisfied within 30 days, we\'ll refund every penny.'),
          ]),
        ]),
      ]),
    ]),
  },
  {
    name: 'Pricing',
    emoji: '💰',
    template: makeSection('section', {
      padding: '100px 40px',
      background: '#ffffff',
    }, [
      el('div', { maxWidth: '1100px', margin: '0 auto' }, undefined, [
        el('div', { textAlign: 'center', marginBottom: '60px' }, undefined, [
          el('h2', { fontSize: '42px', fontWeight: '800', color: '#111', letterSpacing: '-0.02em', marginBottom: '16px' }, 'Simple, Transparent Pricing'),
          el('p', { fontSize: '18px', color: '#666' }, 'Choose the plan that fits your goals.'),
        ]),
        el('div', { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'start' }, undefined, [
          el('div', { background: '#fff', border: '2px solid #eee', borderRadius: '12px', padding: '40px', textAlign: 'center' }, undefined, [
            el('p', { fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginBottom: '16px' }, 'Starter'),
            el('div', { fontSize: '56px', fontWeight: '900', color: '#111', marginBottom: '8px' }, '$97'),
            el('p', { fontSize: '14px', color: '#999', marginBottom: '32px' }, 'per month'),
            el('a', { display: 'block', padding: '14px 24px', background: '#111', color: '#fff', borderRadius: '4px', fontWeight: '700', textDecoration: 'none', textAlign: 'center', fontSize: '15px' }, 'Get Started', undefined, { href: '#' }),
          ]),
          el('div', { background: '#0c1a2e', border: '2px solid #D4A843', borderRadius: '12px', padding: '40px', textAlign: 'center', transform: 'scale(1.05)' }, undefined, [
            el('p', { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D4A843', marginBottom: '8px' }, '✦ Most Popular'),
            el('p', { fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', marginBottom: '16px' }, 'Pro'),
            el('div', { fontSize: '56px', fontWeight: '900', color: '#D4A843', marginBottom: '8px' }, '$297'),
            el('p', { fontSize: '14px', color: '#aaa', marginBottom: '32px' }, 'per month'),
            el('a', { display: 'block', padding: '14px 24px', background: '#D4A843', color: '#fff', borderRadius: '4px', fontWeight: '700', textDecoration: 'none', textAlign: 'center', fontSize: '15px' }, 'Get Started', undefined, { href: '#' }),
          ]),
        ]),
      ]),
    ]),
  },
  {
    name: 'Footer',
    emoji: '🦶',
    template: makeSection('footer', {
      padding: '80px 40px 40px',
      background: '#0a0a0a',
    }, [
      el('div', { maxWidth: '1200px', margin: '0 auto' }, undefined, [
        el('div', { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '60px' }, undefined, [
          el('div', {}, undefined, [
            el('h3', { fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '12px' }, 'Your Brand'),
            el('p', { fontSize: '14px', color: '#666', lineHeight: '1.8' }, 'Empowering people to achieve extraordinary results.'),
          ]),
          el('div', {}, undefined, [
            el('h4', { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#666', marginBottom: '20px' }, 'Quick Links'),
            el('ul', { listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '10px' }, undefined, [
              el('li', {}, undefined, [el('a', { color: '#999', textDecoration: 'none', fontSize: '14px' }, 'About', undefined, { href: '#' })]),
              el('li', {}, undefined, [el('a', { color: '#999', textDecoration: 'none', fontSize: '14px' }, 'Services', undefined, { href: '#' })]),
              el('li', {}, undefined, [el('a', { color: '#999', textDecoration: 'none', fontSize: '14px' }, 'Contact', undefined, { href: '#' })]),
            ]),
          ]),
        ]),
        el('div', { borderTop: '1px solid #222', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }, undefined, [
          el('p', { fontSize: '13px', color: '#555' }, '© 2025 Your Brand. All rights reserved.'),
          el('p', { fontSize: '13px', color: '#555' }, 'Privacy Policy · Terms of Service'),
        ]),
      ]),
    ]),
  },
];

// ─── Element Templates ────────────────────────────────────────────────────────

const ELEMENT_TEMPLATES: Array<{ name: string; emoji: string; template: Omit<FunnelNode, 'id'> }> = [
  {
    name: 'Heading',
    emoji: '🔤',
    template: { type: 'element' as const, tag: 'h2', styles: { fontSize: '36px', fontWeight: '800', color: '#111111', letterSpacing: '-0.02em', lineHeight: '1.2', marginBottom: '16px' }, text: 'Your Heading Here' },
  },
  {
    name: 'Paragraph',
    emoji: '📝',
    template: { type: 'element' as const, tag: 'p', styles: { fontSize: '18px', color: '#555555', lineHeight: '1.7', marginBottom: '16px', maxWidth: '600px' }, text: 'Your paragraph text here. Write compelling copy that speaks directly to your audience\'s desires and pain points.' },
  },
  {
    name: 'Button',
    emoji: '🔘',
    template: { type: 'element' as const, tag: 'a', styles: { display: 'inline-block', padding: '16px 40px', background: '#D4A843', color: '#ffffff', fontWeight: '700', fontSize: '16px', borderRadius: '4px', textDecoration: 'none', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }, text: 'Click Here', attrs: { href: '#' } },
  },
  {
    name: 'Image',
    emoji: '🖼️',
    template: { type: 'element' as const, tag: 'img', styles: { width: '100%', borderRadius: '8px', display: 'block' }, attrs: { src: 'https://placehold.co/800x400/111111/333333', alt: 'Image' } },
  },
  {
    name: 'Divider',
    emoji: '➖',
    template: { type: 'element' as const, tag: 'hr', styles: { border: 'none', borderTop: '1px solid #e0e0e0', margin: '40px 0' } },
  },
  {
    name: 'Spacer',
    emoji: '↕️',
    template: { type: 'element' as const, tag: 'div', styles: { height: '60px', display: 'block' } },
  },
  {
    name: 'Box',
    emoji: '📦',
    template: { type: 'element' as const, tag: 'div', styles: { background: '#f8f8f8', borderRadius: '12px', padding: '32px', border: '1px solid #e0e0e0' }, children: [] },
  },
  {
    name: 'Video Embed',
    emoji: '🎬',
    template: { type: 'element' as const, tag: 'div', styles: { background: '#111', borderRadius: '12px', padding: '80px 40px', textAlign: 'center', cursor: 'pointer' }, children: [
      { id: uid('el'), type: 'element' as const, tag: 'div', styles: { fontSize: '64px', marginBottom: '16px' }, text: '▶' },
      { id: uid('el'), type: 'element' as const, tag: 'p', styles: { fontSize: '16px', color: '#aaa' }, text: 'Click to play video' },
    ]},
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LibraryDrawer() {
  const { libraryOpen, setLibraryOpen } = useUIStore();
  const { addSection, addElement, selectedElementId, currentPageId, project } = useFunnelStore();
  const [tab, setTab] = useState<'sections' | 'elements'>('sections');
  const [search, setSearch] = useState('');

  if (!libraryOpen) return null;

  const currentPage = project.pages.find(p => p.id === currentPageId);
  const lastSectionId = currentPage?.sections[currentPage.sections.length - 1]?.id;

  function handleAddSection(template: Omit<FunnelNode, 'id'>) {
    addSection(template);
    setLibraryOpen(false);
  }

  function handleAddElement(template: Omit<FunnelNode, 'id'>) {
    const parentId = selectedElementId || lastSectionId;
    if (parentId) {
      addElement(parentId, template);
    } else {
      // No section exists, create a blank one first
      const sec = addSection({
        type: 'section', tag: 'section',
        styles: { padding: '60px 40px', background: '#ffffff', minHeight: '200px' },
        freeform: true, children: [],
      });
      addElement(sec.id, template);
    }
    setLibraryOpen(false);
  }

  const filteredSections = SECTION_TEMPLATES.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredElements = ELEMENT_TEMPLATES.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={() => setLibraryOpen(false)}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
        style={{
          width: '360px',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--surface-border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Add to Page</h3>
          <button onClick={() => setLibraryOpen(false)} className="p-1 rounded hover:opacity-60 transition-opacity">
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
            <Search size={14} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search sections & elements..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-3 gap-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          {(['sections', 'elements'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-xs font-semibold capitalize rounded-t transition-all"
              style={{
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
                background: 'transparent',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tab === 'sections' ? (
            filteredSections.map(item => (
              <button
                key={item.name}
                onClick={() => handleAddSection(item.template)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--surface-border)',
                }}
              >
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                </div>
              </button>
            ))
          ) : (
            filteredElements.map(item => (
              <button
                key={item.name}
                onClick={() => handleAddElement(item.template)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--surface-border)',
                }}
              >
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
