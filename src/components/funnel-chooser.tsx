'use client';

import { useState } from 'react';
import { FUNNEL_PRESETS, type FunnelPreset } from '@/blocks/funnel-presets';
import { ChevronRight, Check } from 'lucide-react';

interface Props {
  onSelect: (preset: FunnelPreset) => void;
}

export default function FunnelChooser({ onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--accent)' }}
        >
          Step 1
        </p>
        <h2
          className="text-3xl font-black mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bricolage)' }}
        >
          What type of funnel are you building?
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Pick a structure. You can customize the pages in the next step.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {FUNNEL_PRESETS.map((preset) => {
          const isSelected = selected === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setSelected(preset.id)}
              className="group text-left p-5 rounded-xl transition-all relative"
              style={{
                background: 'var(--surface)',
                border: isSelected
                  ? '2px solid var(--accent)'
                  : '1px solid var(--surface-border)',
                boxShadow: isSelected
                  ? '0 4px 20px oklch(from var(--accent) l c h / 0.2)'
                  : '0 2px 8px rgba(0,0,0,0.04)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {/* Selected check */}
              {isSelected && (
                <div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--accent)' }}
                >
                  <Check size={14} color="white" strokeWidth={3} />
                </div>
              )}

              <div className="text-3xl mb-3">{preset.icon}</div>
              <h3
                className="font-bold text-base mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {preset.name}
              </h3>
              <p
                className="text-xs leading-relaxed mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                {preset.description}
              </p>

              {/* Page count */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'oklch(from var(--accent) l c h / 0.1)',
                    color: 'var(--accent-dark)',
                  }}
                >
                  {preset.pages.length} pages
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {preset.audience}
                </span>
              </div>

              {/* Page list preview */}
              <div className="flex flex-wrap gap-1">
                {preset.pages.map((page, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {page.name}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Continue button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            const preset = FUNNEL_PRESETS.find((p) => p.id === selected);
            if (preset) onSelect(preset);
          }}
          disabled={!selected}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'var(--accent)',
            boxShadow: selected
              ? '0 4px 14px oklch(from var(--accent) l c h / 0.4)'
              : 'none',
          }}
        >
          Customize Pages
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
