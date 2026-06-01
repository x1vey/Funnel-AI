'use client';

import { useState } from 'react';
import { useFunnelStore } from '@/store/funnel-store';
import { Plus, X, ChevronDown } from 'lucide-react';
import { uid } from '@/store/funnel-store';

const PAGE_TEMPLATES = [
  { name: 'Thank You', slug: 'thank-you' },
  { name: 'One-Time Offer', slug: 'oto' },
  { name: 'Downsell', slug: 'downsell' },
  { name: 'Order Confirmation', slug: 'confirmation' },
  { name: 'Custom Page', slug: 'custom' },
];

export default function PageTabs() {
  const { project, currentPageId, setCurrentPage, addPage, removePage, renamePage } = useFunnelStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  function handleAddPage(name: string, slug: string) {
    addPage({ name, slug, sections: [] });
    setShowAddMenu(false);
  }

  function startRename(pageId: string, currentName: string) {
    setEditingPageId(pageId);
    setEditingName(currentName);
  }

  function commitRename(pageId: string) {
    if (editingName.trim()) {
      renamePage(pageId, editingName.trim());
    }
    setEditingPageId(null);
    setEditingName('');
  }

  return (
    <div className="flex items-center gap-1 px-4 overflow-x-auto" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--surface-border)', minHeight: '40px' }}>
      {project.pages.map(page => (
        <div key={page.id} className="group flex items-center gap-1 relative">
          {editingPageId === page.id ? (
            <input
              autoFocus
              value={editingName}
              onChange={e => setEditingName(e.target.value)}
              onBlur={() => commitRename(page.id)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename(page.id);
                if (e.key === 'Escape') { setEditingPageId(null); }
              }}
              className="px-2 py-1 rounded text-xs font-medium outline-none border"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                borderColor: 'var(--accent)',
                width: '120px',
              }}
            />
          ) : (
            <button
              onClick={() => setCurrentPage(page.id)}
              onDoubleClick={() => startRename(page.id, page.name)}
              className="px-3 py-1.5 rounded-t text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background: currentPageId === page.id ? 'var(--bg-secondary)' : 'transparent',
                color: currentPageId === page.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: currentPageId === page.id ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {page.name}
            </button>
          )}

          {project.pages.length > 1 && editingPageId !== page.id && (
            <button
              onClick={e => { e.stopPropagation(); removePage(page.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"
              title="Remove page"
            >
              <X size={12} style={{ color: 'oklch(0.62 0.2 22)' }} />
            </button>
          )}
        </div>
      ))}

      {/* Add page button */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium ml-1 transition-all hover:opacity-70"
          style={{ color: 'var(--accent)' }}
        >
          <Plus size={13} />
          Add Page
          <ChevronDown size={12} />
        </button>

        {showAddMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
            <div
              className="absolute top-full left-0 mt-1 rounded-xl shadow-xl z-50 overflow-hidden"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                minWidth: '180px',
              }}
            >
              {PAGE_TEMPLATES.map(t => (
                <button
                  key={t.slug}
                  onClick={() => handleAddPage(t.name, t.slug)}
                  className="w-full text-left px-4 py-2.5 text-sm transition-all hover:opacity-70"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.name}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--surface-border)' }}>
                <button
                  onClick={() => handleAddPage('Custom Page', `custom-${uid('p')}`)}
                  className="w-full text-left px-4 py-2.5 text-sm transition-all hover:opacity-70"
                  style={{ color: 'var(--accent)' }}
                >
                  + Blank page
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
