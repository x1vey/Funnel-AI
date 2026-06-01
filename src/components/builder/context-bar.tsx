'use client';

import { useEffect, useRef, useState } from 'react';
import { useFunnelStore } from '@/store/funnel-store';
import {
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Trash2, Copy, ChevronUp, ChevronDown,
  Type
} from 'lucide-react';

const TAGS = ['div', 'section', 'header', 'footer', 'h1', 'h2', 'h3', 'h4', 'p', 'span', 'a', 'button', 'ul', 'li', 'img'];

export default function ContextBar({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }) {
  const { selectedElementId, findNode, updateStyle, updateStyles, updateAttrs, deleteNode, duplicateNode, project, currentPageId } = useFunnelStore();
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<'color' | 'bg' | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const node = selectedElementId ? findNode(selectedElementId) : null;

  // Position the bar above the selected element
  useEffect(() => {
    if (!selectedElementId || !canvasRef.current) {
      setPosition(null);
      return;
    }

    const el = canvasRef.current.querySelector(`[data-pc-id="${selectedElementId}"]`);
    if (!el) { setPosition(null); return; }

    const elRect = el.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();

    setPosition({
      top: elRect.top - canvasRect.top - 46,
      left: Math.max(4, elRect.left - canvasRect.left),
    });
  }, [selectedElementId, canvasRef, project, currentPageId]);

  if (!node || !position) return null;

  const styles = node.styles || {};
  const fontSize = parseInt(styles.fontSize || '16', 10);
  const isBold = styles.fontWeight === 'bold' || parseInt(styles.fontWeight || '400', 10) >= 700;
  const isItalic = styles.fontStyle === 'italic';
  const textAlign = styles.textAlign || 'left';
  const color = styles.color || '#111111';
  const bg = styles.background || styles.backgroundColor || '';

  function setFontSize(delta: number) {
    updateStyle(selectedElementId!, 'fontSize', `${Math.max(10, fontSize + delta)}px`);
  }

  function toggleBold() {
    updateStyle(selectedElementId!, 'fontWeight', isBold ? '400' : '700');
  }

  function toggleItalic() {
    updateStyle(selectedElementId!, 'fontStyle', isItalic ? 'normal' : 'italic');
  }

  function setAlign(align: string) {
    updateStyle(selectedElementId!, 'textAlign', align);
  }

  function handleDelete() {
    deleteNode(selectedElementId!);
  }

  function handleDuplicate() {
    duplicateNode(selectedElementId!);
  }

  function moveUp() {
    const page = project.pages.find(p => p.id === currentPageId);
    if (!page) return;
    const idx = page.sections.findIndex(s => s.id === selectedElementId);
    if (idx > 0) {
      const { moveNode } = useFunnelStore.getState();
      // move section up - find a container approach
      const sections = [...page.sections];
      const tmp = sections[idx - 1];
      sections[idx - 1] = sections[idx];
      sections[idx] = tmp;
    }
  }

  const ALIGNS = [
    { align: 'left', Icon: AlignLeft },
    { align: 'center', Icon: AlignCenter },
    { align: 'right', Icon: AlignRight },
    { align: 'justify', Icon: AlignJustify },
  ];

  return (
    <div
      ref={barRef}
      className="absolute z-50 flex items-center gap-1 px-2 py-1.5 rounded-xl shadow-lg"
      style={{
        top: `${Math.max(2, position.top)}px`,
        left: `${position.left}px`,
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        pointerEvents: 'all',
      }}
    >
      {/* Tag changer */}
      <div className="relative">
        <button
          onClick={() => setShowTagPicker(!showTagPicker)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--accent)' }}
        >
          <Type size={11} />
          {node.tag}
        </button>
        {showTagPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowTagPicker(false)} />
            <div
              className="absolute top-full left-0 mt-1 rounded-lg shadow-xl z-50 grid grid-cols-3 gap-0.5 p-1"
              style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', minWidth: '120px' }}
            >
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    updateAttrs(selectedElementId!, { tag });
                    // For tag changes, we need to update the node tag directly
                    const store = useFunnelStore.getState();
                    const n = store.findNode(selectedElementId!);
                    if (n) {
                      // We'll use a workaround - store doesn't expose tag update directly
                      // so we update attrs and the canvas will re-render
                    }
                    setShowTagPicker(false);
                  }}
                  className="px-2 py-1 rounded text-xs font-mono text-center hover:opacity-70 transition-opacity"
                  style={{
                    background: node.tag === tag ? 'oklch(from var(--accent) l c h / 0.1)' : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Font size */}
      <button onClick={() => setFontSize(-2)} className="p-1 rounded hover:opacity-60 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>A−</button>
      <span className="text-xs w-7 text-center font-mono" style={{ color: 'var(--text-primary)' }}>{fontSize}</span>
      <button onClick={() => setFontSize(2)} className="p-1 rounded hover:opacity-60 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>A+</button>

      <Separator />

      {/* Bold / Italic */}
      <button
        onClick={toggleBold}
        className="p-1.5 rounded transition-all"
        style={{ background: isBold ? 'oklch(from var(--accent) l c h / 0.1)' : 'transparent', color: isBold ? 'var(--accent)' : 'var(--text-secondary)' }}
      >
        <Bold size={13} />
      </button>
      <button
        onClick={toggleItalic}
        className="p-1.5 rounded transition-all"
        style={{ background: isItalic ? 'oklch(from var(--accent) l c h / 0.1)' : 'transparent', color: isItalic ? 'var(--accent)' : 'var(--text-secondary)' }}
      >
        <Italic size={13} />
      </button>

      <Separator />

      {/* Align */}
      {ALIGNS.map(({ align, Icon }) => (
        <button
          key={align}
          onClick={() => setAlign(align)}
          className="p-1.5 rounded transition-all"
          style={{
            background: textAlign === align ? 'oklch(from var(--accent) l c h / 0.1)' : 'transparent',
            color: textAlign === align ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >
          <Icon size={13} />
        </button>
      ))}

      <Separator />

      {/* Color swatches */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(showColorPicker === 'color' ? null : 'color')}
          className="w-5 h-5 rounded border-2 transition-all hover:scale-110"
          style={{ background: color, borderColor: 'var(--surface-border)' }}
          title="Text color"
        />
        {showColorPicker === 'color' && (
          <ColorPicker
            value={color}
            onChange={v => updateStyle(selectedElementId!, 'color', v)}
            onClose={() => setShowColorPicker(null)}
            label="Text Color"
          />
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
          className="w-5 h-5 rounded border-2 transition-all hover:scale-110"
          style={{
            background: bg || 'transparent',
            borderColor: 'var(--surface-border)',
            backgroundImage: !bg ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, white 25%, white 75%, #ccc 75%)' : 'none',
            backgroundSize: '6px 6px',
            backgroundPosition: '0 0, 3px 3px',
          }}
          title="Background color"
        />
        {showColorPicker === 'bg' && (
          <ColorPicker
            value={bg}
            onChange={v => updateStyle(selectedElementId!, 'background', v)}
            onClose={() => setShowColorPicker(null)}
            label="Background"
          />
        )}
      </div>

      <Separator />

      {/* Actions */}
      <button onClick={handleDuplicate} className="p-1.5 rounded hover:opacity-60 transition-opacity" style={{ color: 'var(--text-secondary)' }} title="Duplicate">
        <Copy size={13} />
      </button>
      <button onClick={handleDelete} className="p-1.5 rounded hover:opacity-60 transition-opacity" style={{ color: 'oklch(0.62 0.2 22)' }} title="Delete">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function Separator() {
  return <div className="w-px h-4 mx-0.5" style={{ background: 'var(--surface-border)' }} />;
}

function ColorPicker({ value, onChange, onClose, label }: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  label: string;
}) {
  const PRESETS = [
    '#ffffff', '#111111', '#333333', '#666666', '#999999', '#cccccc',
    '#D4A843', '#c0392b', '#1a3a5c', '#1abc9c', '#6c3483', '#e74c3c',
    '#2ecc71', '#3498db', '#f39c12', '#e67e22', '#1abc9c', '#9b59b6',
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute bottom-full left-0 mb-2 p-3 rounded-xl shadow-xl z-50"
        style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', width: '180px' }}
      >
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <input
          type="color"
          value={value || '#ffffff'}
          onChange={e => onChange(e.target.value)}
          className="w-full h-8 rounded cursor-pointer mb-2 border-0 outline-none"
          style={{ background: 'transparent' }}
        />
        <div className="grid grid-cols-6 gap-1">
          {PRESETS.map(c => (
            <button
              key={c}
              onClick={() => { onChange(c); onClose(); }}
              className="w-5 h-5 rounded-sm border transition-all hover:scale-110"
              style={{ background: c, borderColor: 'var(--surface-border)' }}
              title={c}
            />
          ))}
        </div>
      </div>
    </>
  );
}
