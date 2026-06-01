'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useFunnelStore } from '@/store/funnel-store';
import { exportFunnelAsZip } from '@/lib/exporter';
import { buildExportCSS, buildExportJS } from '@/lib/serializer';
import { X, Download, Copy, Globe, Link, Check } from 'lucide-react';

export default function ExportModal() {
  const { exportModalOpen, setExportModalOpen } = useUIStore();
  const { project } = useFunnelStore();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!exportModalOpen) return null;

  async function handleExportZip() {
    setExporting(true);
    try {
      await exportFunnelAsZip(project);
    } finally {
      setExporting(false);
    }
  }

  async function handleCopyHTML() {
    const { buildPageHTML } = await import('@/lib/serializer');
    const page = project.pages[0];
    if (!page) return;
    const html = buildPageHTML(page, project);
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const options = [
    {
      icon: Download,
      title: 'Download ZIP',
      desc: `${project.pages.length} HTML files + styles.css + script.js`,
      action: handleExportZip,
      loading: exporting,
      primary: true,
    },
    {
      icon: copied ? Check : Copy,
      title: copied ? 'Copied!' : 'Copy HTML',
      desc: 'Copy the landing page HTML to clipboard',
      action: handleCopyHTML,
      loading: false,
      primary: false,
    },
    {
      icon: Globe,
      title: 'Publish to Web',
      desc: 'Deploy to a hosted URL instantly (coming soon)',
      action: () => alert('Publishing coming soon!'),
      loading: false,
      primary: false,
      disabled: true,
    },
    {
      icon: Link,
      title: 'Connect Domain',
      desc: 'Use your own domain name (coming soon)',
      action: () => alert('Custom domain coming soon!'),
      loading: false,
      primary: false,
      disabled: true,
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={() => setExportModalOpen(false)}
      />

      <div
        className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Export Funnel</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {project.name} · {project.pages.length} pages
            </p>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1.5 rounded-lg hover:opacity-60 transition-opacity"
          >
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Pages summary */}
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Pages included</p>
          <div className="flex flex-wrap gap-2">
            {project.pages.map(page => (
              <span
                key={page.id}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'oklch(from var(--accent) l c h / 0.1)', color: 'var(--accent-dark)' }}
              >
                {page.slug}.html
              </span>
            ))}
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              styles.css
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              script.js
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.title}
                onClick={opt.action}
                disabled={opt.loading || opt.disabled}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: opt.primary ? 'var(--accent)' : 'var(--bg-secondary)',
                  border: `1px solid ${opt.primary ? 'transparent' : 'var(--surface-border)'}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: opt.primary ? 'rgba(255,255,255,0.2)' : 'var(--surface)',
                  }}
                >
                  <Icon size={18} style={{ color: opt.primary ? 'white' : 'var(--accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: opt.primary ? 'white' : 'var(--text-primary)' }}>
                    {opt.loading ? 'Preparing...' : opt.title}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: opt.primary ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-5">
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            Generated files work on any web host — Netlify, Vercel, GitHub Pages, cPanel, etc.
          </p>
        </div>
      </div>
    </>
  );
}
