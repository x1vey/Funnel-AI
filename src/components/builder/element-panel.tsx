'use client';

import { useState } from 'react';
import { ELEMENTS, LAYOUTS, PREBUILT_SECTIONS, type PanelItem } from '@/blocks/elements';
import { Search, Boxes, LayoutGrid, Shapes } from 'lucide-react';

type Tab = 'elements' | 'layouts' | 'sections';

const TABS: { key: Tab; label: string; icon: typeof Boxes }[] = [
  { key: 'elements', label: 'Elements', icon: Boxes },
  { key: 'layouts', label: 'Layout', icon: LayoutGrid },
  { key: 'sections', label: 'Sections', icon: Shapes },
];

export default function ElementPanel() {
  const [tab, setTab] = useState<Tab>('elements');
  const [query, setQuery] = useState('');

  const items: PanelItem[] =
    tab === 'elements' ? ELEMENTS : tab === 'layouts' ? LAYOUTS : PREBUILT_SECTIONS;

  const filtered = query.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    : items;

  function onDragStart(e: React.DragEvent, item: PanelItem) {
    // Payload the canvas drop handler reads
    e.dataTransfer.setData(
      'application/x-funnel-item',
      JSON.stringify({ itemId: item.id, kind: item.kind })
    );
    e.dataTransfer.effectAllowed = 'copy';
    document.body.classList.add('pc-panel-dragging');
    // Global hint — dragover can't read the payload, so it reads this instead
    (window as unknown as { __pcDragKind?: string }).__pcDragKind = item.kind;
  }

  function onDragEnd() {
    document.body.classList.remove('pc-panel-dragging');
    (window as unknown as { __pcDragKind?: string }).__pcDragKind = undefined;
  }

  return (
    <aside
      className="flex flex-col flex-shrink-0 h-full"
      style={{
        width: '280px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--surface-border)',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--surface-border)' }}>
        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Add to page
        </h3>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all"
              style={{
                background: tab === key ? 'var(--surface)' : 'transparent',
                color: tab === key ? 'var(--accent)' : 'var(--text-secondary)',
                boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-secondary)' }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--surface-border)',
            }}
          />
        </div>
      </div>

      {/* Hint */}
      <div className="px-4 pb-2">
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          Drag any item onto the canvas →
        </p>
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className={tab === 'sections' ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2'}>
          {filtered.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              onDragEnd={onDragEnd}
              className="group flex items-center gap-2 p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
              }}
              title={`Drag to add ${item.name}`}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold"
                style={{
                  background: 'oklch(from var(--accent) l c h / 0.1)',
                  color: 'var(--accent-dark)',
                }}
              >
                {item.icon}
              </div>
              <span
                className="text-xs font-medium leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.name}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div
              className="col-span-2 text-center text-xs py-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              Nothing matches &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
