'use client';

import { useState, useRef } from 'react';
import { type FunnelPagePreset } from '@/blocks/funnel-presets';
import {
  GripVertical, X, Plus, ChevronRight, ArrowRight, ChevronDown,
} from 'lucide-react';

// All page types users can add
const PAGE_TYPE_OPTIONS = [
  { type: 'landing', name: 'Landing Page', icon: '🎯' },
  { type: 'optin', name: 'Opt-In Page', icon: '📧' },
  { type: 'thank_you', name: 'Thank You Page', icon: '✅' },
  { type: 'oto', name: 'One-Time Offer (OTO)', icon: '🎁' },
  { type: 'downsell', name: 'Downsell Page', icon: '💰' },
  { type: 'sales', name: 'Sales Page', icon: '📝' },
  { type: 'confirmation', name: 'Order Confirmation', icon: '🧾' },
  { type: 'custom', name: 'Custom Page', icon: '✨' },
];

// Default blocks for each page type when adding manually
const DEFAULT_BLOCKS: Record<string, string[]> = {
  landing: ['navbar-standard', 'hero-centered', 'features-3col', 'testimonials-cards', 'cta-banner', 'footer-standard'],
  optin: ['navbar-minimal', 'hero-centered', 'optin-form', 'footer-minimal'],
  thank_you: ['navbar-minimal', 'thank-you-hero', 'footer-minimal'],
  oto: ['countdown-bar', 'navbar-minimal', 'oto-offer', 'cta-with-guarantee', 'footer-minimal'],
  downsell: ['navbar-minimal', 'hero-centered', 'cta-with-guarantee', 'footer-minimal'],
  sales: ['navbar-minimal', 'hero-centered', 'features-3col', 'testimonials-cards', 'pricing-3tier', 'cta-banner', 'faq-section', 'footer-standard'],
  confirmation: ['navbar-minimal', 'thank-you-hero', 'footer-minimal'],
  custom: ['navbar-minimal', 'hero-centered', 'footer-minimal'],
};

export interface FlowPage {
  id: string;
  name: string;
  slug: string;
  type: string;
  blocks: string[];
}

interface Props {
  funnelName: string;
  initialPages: FunnelPagePreset[];
  onConfirm: (pages: FlowPage[]) => void;
  onBack: () => void;
}

let _id = 0;
function flowId() { return `flow_${Date.now()}_${++_id}`; }

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'page';
}

export default function FlowEditor({ funnelName, initialPages, onConfirm, onBack }: Props) {
  const [pages, setPages] = useState<FlowPage[]>(
    initialPages.map((p) => ({
      id: flowId(),
      name: p.name,
      slug: p.slug,
      type: p.type,
      blocks: [...p.blocks],
    }))
  );
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Drag state
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // ---- Drag handlers ----
  function onDragStart(idx: number) {
    dragItem.current = idx;
    setDragIdx(idx);
  }

  function onDragEnter(idx: number) {
    dragOver.current = idx;
    setOverIdx(idx);
  }

  function onDragEnd() {
    if (dragItem.current !== null && dragOver.current !== null && dragItem.current !== dragOver.current) {
      const updated = [...pages];
      const [dragged] = updated.splice(dragItem.current, 1);
      updated.splice(dragOver.current, 0, dragged);

      // Re-slug the first page as 'index'
      const reSlug = updated.map((p, i) => ({
        ...p,
        slug: i === 0 && p.slug !== 'index' ? 'index' : p.slug,
      }));
      setPages(reSlug);
    }
    dragItem.current = null;
    dragOver.current = null;
    setDragIdx(null);
    setOverIdx(null);
  }

  // ---- Page operations ----
  function removePage(id: string) {
    if (pages.length <= 1) return; // must have at least 1 page
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  function addPage(type: string, name: string) {
    const slug = slugify(name);
    const blocks = DEFAULT_BLOCKS[type] || DEFAULT_BLOCKS['custom'];
    setPages((prev) => [
      ...prev,
      { id: flowId(), name, slug, type, blocks },
    ]);
    setAddMenuOpen(false);
  }

  function startRename(page: FlowPage) {
    setEditingId(page.id);
    setEditingName(page.name);
  }

  function confirmRename(id: string) {
    if (editingName.trim()) {
      setPages((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, name: editingName.trim(), slug: slugify(editingName.trim()) }
            : p
        )
      );
    }
    setEditingId(null);
    setEditingName('');
  }

  // Page type → icon
  function pageIcon(type: string): string {
    return PAGE_TYPE_OPTIONS.find((o) => o.type === type)?.icon || '📄';
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
          Step 2
        </p>
        <h2
          className="text-3xl font-black mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bricolage)' }}
        >
          Customize your funnel flow
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Drag to reorder, add or remove pages. This is what the AI will build.
        </p>
      </div>

      {/* Funnel name badge */}
      <div className="flex justify-center mb-6">
        <span
          className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{
            background: 'oklch(from var(--accent) l c h / 0.12)',
            color: 'var(--accent-dark)',
          }}
        >
          {funnelName}
        </span>
      </div>

      {/* Flow visualization */}
      <div className="space-y-0 mb-8">
        {pages.map((page, idx) => (
          <div key={page.id}>
            {/* Page card */}
            <div
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragEnter={() => onDragEnter(idx)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="relative flex items-center gap-3 p-4 rounded-xl transition-all"
              style={{
                background: 'var(--surface)',
                border: dragIdx === idx
                  ? '2px dashed var(--accent)'
                  : overIdx === idx && dragIdx !== idx
                    ? '2px solid var(--accent)'
                    : '1px solid var(--surface-border)',
                opacity: dragIdx === idx ? 0.5 : 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing" style={{ color: 'var(--text-secondary)' }}>
                <GripVertical size={18} />
              </div>

              {/* Step number */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                }}
              >
                {idx + 1}
              </div>

              {/* Icon */}
              <span className="text-xl flex-shrink-0">{pageIcon(page.type)}</span>

              {/* Name + type */}
              <div className="flex-1 min-w-0">
                {editingId === page.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => confirmRename(page.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmRename(page.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="text-sm font-bold bg-transparent outline-none border-b-2 w-full"
                    style={{
                      color: 'var(--text-primary)',
                      borderColor: 'var(--accent)',
                    }}
                  />
                ) : (
                  <div
                    className="text-sm font-bold cursor-pointer hover:underline"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => startRename(page)}
                    title="Click to rename"
                  >
                    {page.name}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    {page.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    /{page.slug === 'index' ? '' : page.slug}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    · {page.blocks.length} blocks
                  </span>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removePage(page.id)}
                disabled={pages.length <= 1}
                className="p-1.5 rounded-lg transition-all hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed"
                style={{ color: 'var(--text-secondary)' }}
                title="Remove page"
              >
                <X size={16} />
              </button>
            </div>

            {/* Arrow connector between pages */}
            {idx < pages.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="flex flex-col items-center">
                  <div className="w-px h-3" style={{ background: 'var(--surface-border)' }} />
                  <ArrowRight
                    size={14}
                    style={{ color: 'var(--accent)', transform: 'rotate(90deg)' }}
                  />
                  <div className="w-px h-3" style={{ background: 'var(--surface-border)' }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add page button */}
      <div className="relative flex justify-center mb-10">
        <button
          onClick={() => setAddMenuOpen(!addMenuOpen)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{
            background: 'var(--surface)',
            border: '1px dashed var(--surface-border)',
            color: 'var(--accent)',
          }}
        >
          <Plus size={16} />
          Add Page
          <ChevronDown size={14} className={`transition-transform ${addMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown menu */}
        {addMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setAddMenuOpen(false)} />
            <div
              className="absolute top-full mt-2 z-20 w-72 py-2 rounded-xl shadow-xl"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              }}
            >
              {PAGE_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => addPage(opt.type, opt.name)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all hover:bg-black/5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="font-medium">{opt.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            color: 'var(--text-primary)',
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => onConfirm(pages)}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
          style={{
            background: 'var(--accent)',
            boxShadow: '0 4px 14px oklch(from var(--accent) l c h / 0.4)',
          }}
        >
          Continue to Prompt
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
