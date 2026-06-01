'use client';

import { useRouter } from 'next/navigation';
import { useFunnelStore, ThemeName } from '@/store/funnel-store';
import { useUIStore } from '@/store/ui-store';
import { applyTheme } from '@/lib/themes';
import { exportFunnelAsZip } from '@/lib/exporter';
import {
  ArrowLeft, Monitor, Tablet, Smartphone, Undo2, Redo2,
  Download, LayoutGrid, ExternalLink
} from 'lucide-react';

const DEVICE_ICONS = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

const THEMES: { name: ThemeName; color: string }[] = [
  { name: 'indigo', color: 'oklch(0.55 0.22 263)' },
  { name: 'coral', color: 'oklch(0.62 0.20 22)' },
  { name: 'rose', color: 'oklch(0.58 0.22 350)' },
];

export default function Toolbar() {
  const router = useRouter();
  const { project, device, theme, setDevice, setTheme, undo, redo, canUndo, canRedo } = useFunnelStore();
  const { setLibraryOpen, setExportModalOpen } = useUIStore();

  function handleThemeChange(name: ThemeName) {
    setTheme(name);
    applyTheme(name);
  }

  async function handleExport() {
    await exportFunnelAsZip(project);
  }

  return (
    <div
      className="flex items-center justify-between px-4 h-12 flex-shrink-0"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--surface-border)' }}
    >
      {/* Left: back + name */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div
          className="w-px h-4 mx-1"
          style={{ background: 'var(--surface-border)' }}
        />

        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'var(--accent)' }}
          >
            F
          </div>
          <span className="text-sm font-semibold truncate max-w-32" style={{ color: 'var(--text-primary)' }}>
            {project.name}
          </span>
        </div>
      </div>

      {/* Center: device + undo/redo */}
      <div className="flex items-center gap-1">
        {/* Device toggle */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
          {(Object.keys(DEVICE_ICONS) as (keyof typeof DEVICE_ICONS)[]).map(d => {
            const Icon = DEVICE_ICONS[d];
            return (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className="p-1.5 rounded-md transition-all"
                style={{
                  background: device === d ? 'var(--surface)' : 'transparent',
                  color: device === d ? 'var(--accent)' : 'var(--text-secondary)',
                  boxShadow: device === d ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
                title={d.charAt(0).toUpperCase() + d.slice(1)}
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--surface-border)' }} />

        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="p-1.5 rounded-md transition-all disabled:opacity-30"
          style={{ color: 'var(--text-secondary)' }}
          title="Undo"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="p-1.5 rounded-md transition-all disabled:opacity-30"
          style={{ color: 'var(--text-secondary)' }}
          title="Redo"
        >
          <Redo2 size={14} />
        </button>
      </div>

      {/* Right: theme + library + publish */}
      <div className="flex items-center gap-2">
        {/* Theme dots */}
        <div className="flex items-center gap-1">
          {THEMES.map(t => (
            <button
              key={t.name}
              title={t.name}
              onClick={() => handleThemeChange(t.name)}
              className="w-4 h-4 rounded-full transition-all"
              style={{
                background: t.color,
                boxShadow: theme === t.name ? `0 0 0 1.5px white, 0 0 0 2.5px ${t.color}` : 'none',
                transform: theme === t.name ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        <div className="w-px h-4" style={{ background: 'var(--surface-border)' }} />

        <button
          onClick={() => setLibraryOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
          style={{
            background: 'oklch(from var(--accent) l c h / 0.1)',
            color: 'var(--accent-dark)',
          }}
          title="Add sections"
        >
          <LayoutGrid size={13} />
          Add Section
        </button>

        <button
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
          style={{
            background: 'var(--accent)',
            boxShadow: '0 2px 8px oklch(from var(--accent) l c h / 0.35)',
          }}
        >
          <ExternalLink size={13} />
          Publish
        </button>
      </div>
    </div>
  );
}
