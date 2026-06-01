'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useFunnelStore } from '@/store/funnel-store';
import { renderNodesToDOM, scopeCSS } from '@/lib/serializer';
import ContextBar from './context-bar';

const CANVAS_SCOPE = '.funnel-canvas-root';

interface CanvasProps {
  device: 'desktop' | 'tablet' | 'mobile';
}

const DEVICE_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

export default function Canvas({ device }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    project,
    currentPageId,
    selectedElementId,
    setSelectedElement,
    updateText,
    updateStyle,
    moveNode,
    findNode,
    findParent,
  } = useFunnelStore();

  const currentPage = project.pages.find(p => p.id === currentPageId);

  // ─── Inject scoped global style ────────────────────────────────────────────
  useEffect(() => {
    if (!styleRef.current) {
      const style = document.createElement('style');
      style.id = 'funnel-canvas-global';
      document.head.appendChild(style);
      styleRef.current = style;
    }

    const scoped = scopeCSS(project.globalCSS || '', CANVAS_SCOPE);
    styleRef.current.textContent = scoped;
  }, [project.globalCSS]);

  // ─── Render nodes to real DOM ───────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return;
    renderNodesToDOM(currentPage?.sections ?? [], canvasRef.current);

    // Restore selection visual
    if (selectedElementId) {
      const el = canvasRef.current.querySelector(`[data-pc-id="${selectedElementId}"]`);
      if (el) el.setAttribute('data-pc-selected', 'true');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage?.sections, currentPageId]);

  // ─── Update selection visual without full re-render ─────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.querySelectorAll('[data-pc-selected="true"]')
      .forEach(el => el.removeAttribute('data-pc-selected'));

    if (selectedElementId) {
      const el = canvasRef.current.querySelector(`[data-pc-id="${selectedElementId}"]`);
      if (el) el.setAttribute('data-pc-selected', 'true');
    }
  }, [selectedElementId]);

  // ─── Click handler ──────────────────────────────────────────────────────────
  const handleClick = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    const target = (e.target as HTMLElement).closest('[data-pc-id]') as HTMLElement | null;
    if (!target) {
      setSelectedElement(null);
      return;
    }
    e.stopPropagation();
    const id = target.getAttribute('data-pc-id')!;
    setSelectedElement(id);
  }, [setSelectedElement]);

  // ─── Double-click: inline text edit ────────────────────────────────────────
  const handleDblClick = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    const target = (e.target as HTMLElement).closest('[data-pc-id]') as HTMLElement | null;
    if (!target) return;

    const id = target.getAttribute('data-pc-id')!;
    const node = useFunnelStore.getState().findNode(id);
    if (!node) return;

    // Only text-leaf nodes
    const TEXT_TAGS = new Set(['h1','h2','h3','h4','h5','h6','p','a','span','button','label','li','small','strong','em','blockquote']);
    if (!TEXT_TAGS.has(node.tag)) return;
    if (target.getAttribute('contenteditable') === 'true') return;

    e.preventDefault();

    target.setAttribute('contenteditable', 'true');
    target.focus();

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(target);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    const commit = () => {
      target.removeAttribute('contenteditable');
      const newText = target.textContent || '';
      target.removeEventListener('blur', commit);
      target.removeEventListener('keydown', onKey);
      if (newText !== node.text) {
        updateText(id, newText);
      }
    };

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        commit();
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        target.textContent = node.text || '';
        commit();
      }
    };

    target.addEventListener('blur', commit);
    target.addEventListener('keydown', onKey);
  }, [updateText]);

  // ─── Drag-and-drop (move nodes) ─────────────────────────────────────────────
  const dragState = useRef<{
    active: boolean;
    id: string;
    el: HTMLElement;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    moved: boolean;
    mode: 'free' | 'flow' | 'section';
    dropTarget: { parentId: string; index: number } | null;
  } | null>(null);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    if (!canvasRef.current) return;

    const target = (e.target as HTMLElement).closest('[data-pc-id]') as HTMLElement | null;
    if (!target) return;

    const id = target.getAttribute('data-pc-id')!;
    const currentSel = useFunnelStore.getState().selectedElementId;
    if (id !== currentSel) return; // must be selected first

    if (target.getAttribute('contenteditable') === 'true') return;

    const node = useFunnelStore.getState().findNode(id);
    if (!node) return;

    const parent = useFunnelStore.getState().findParent(id);
    let mode: 'free' | 'flow' | 'section';

    if (node.type === 'section') mode = 'section';
    else if (parent?.freeform) mode = 'free';
    else mode = 'flow';

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elRect = target.getBoundingClientRect();

    dragState.current = {
      active: true,
      id,
      el: target,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: elRect.left - canvasRect.left,
      startTop: elRect.top - canvasRect.top,
      moved: false,
      mode,
      dropTarget: null,
    };

    if (mode === 'free') {
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current?.active || !canvasRef.current) return;
    const d = dragState.current;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    if (!d.moved) {
      d.moved = true;
      d.el.setAttribute('data-pc-dragging', 'true');
      document.body.classList.add('pc-dragging');
    }

    if (d.mode === 'free') {
      d.el.style.position = 'absolute';
      d.el.style.left = `${Math.max(0, d.startLeft + dx)}px`;
      d.el.style.top = `${Math.max(0, d.startTop + dy)}px`;
    } else if (d.mode === 'section') {
      window.getSelection()?.removeAllRanges();
      // Show insertion indicator
      updateDropIndicator(canvasRef.current, e.clientY, null);
    } else {
      window.getSelection()?.removeAllRanges();
    }
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!dragState.current?.active) return;
    const d = dragState.current;
    dragState.current = null;
    d.el.removeAttribute('data-pc-dragging');
    document.body.classList.remove('pc-dragging');

    clearDropIndicators(canvasRef.current);

    if (!d.moved) return;

    if (d.mode === 'free') {
      updateStyle(d.id, 'position', 'absolute');
      updateStyle(d.id, 'left', d.el.style.left);
      updateStyle(d.id, 'top', d.el.style.top);
    } else if (d.mode === 'section' && canvasRef.current) {
      const idx = findSectionInsertIndex(canvasRef.current, e.clientY);
      const store = useFunnelStore.getState();
      const page = store.project.pages.find(p => p.id === store.currentPageId);
      if (!page) return;

      // Get section index for move
      const sectionIds = page.sections.map(s => s.id).filter(id => id !== d.id);
      const adjustedIdx = Math.min(idx, sectionIds.length);

      // We'll implement this as moveNode to a container
      // For section reordering, we directly manipulate via zustand
      const sections = [...page.sections];
      const fromIdx = sections.findIndex(s => s.id === d.id);
      if (fromIdx >= 0) {
        const [removed] = sections.splice(fromIdx, 1);
        const toIdx = Math.max(0, Math.min(idx, sections.length));
        sections.splice(toIdx, 0, removed);
        // Batch update via setting project directly
        useFunnelStore.setState(state => ({
          project: {
            ...state.project,
            pages: state.project.pages.map(p =>
              p.id === state.currentPageId ? { ...p, sections } : p
            ),
          },
        }));
      }
    }
  }, [updateStyle]);

  // ─── Attach/detach event listeners ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('dblclick', handleDblClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('dblclick', handleDblClick);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleClick, handleDblClick, handleMouseDown, handleMouseMove, handleMouseUp]);

  // ─── Cleanup style on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);

  const isEmpty = !currentPage || currentPage.sections.length === 0;

  return (
    <div
      ref={wrapperRef}
      className="flex-1 overflow-auto"
      style={{ background: 'var(--builder-bg)', padding: '24px' }}
    >
      {/* Device frame */}
      <div
        style={{
          width: DEVICE_WIDTHS[device],
          maxWidth: '100%',
          margin: '0 auto',
          minHeight: '600px',
          background: '#ffffff',
          boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Context bar positioned inside canvas frame */}
        <div style={{ position: 'relative' }}>
          <ContextBar canvasRef={canvasRef} />
        </div>

        {/* The actual canvas root */}
        <div
          ref={canvasRef}
          className={`funnel-canvas-root ${CANVAS_SCOPE.slice(1)}`}
          style={{ position: 'relative', minHeight: '400px' }}
        />

        {/* Empty state */}
        {isEmpty && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            style={{ background: '#fafafa', zIndex: 0 }}
          >
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              This page is empty
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Use the "Add Section" button in the toolbar to add content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findSectionInsertIndex(canvas: HTMLElement, clientY: number): number {
  const sections = Array.from(canvas.querySelectorAll(':scope > [data-pc-type="section"]'));
  for (let i = 0; i < sections.length; i++) {
    const r = sections[i].getBoundingClientRect();
    if (clientY < r.top + r.height / 2) return i;
  }
  return sections.length;
}

function updateDropIndicator(canvas: HTMLElement, clientY: number, _draggingId: string | null) {
  clearDropIndicators(canvas);
  const idx = findSectionInsertIndex(canvas, clientY);
  const sections = Array.from(canvas.querySelectorAll(':scope > [data-pc-type="section"]'));

  const ind = document.createElement('div');
  ind.className = 'drop-indicator';
  ind.style.position = 'absolute';
  ind.style.left = '0';
  ind.style.right = '0';
  ind.style.zIndex = '9999';

  const canvasRect = canvas.getBoundingClientRect();

  if (sections.length === 0) {
    ind.style.top = '0';
  } else if (idx >= sections.length) {
    const r = sections[sections.length - 1].getBoundingClientRect();
    ind.style.top = `${r.bottom - canvasRect.top - 1}px`;
  } else {
    const r = sections[idx].getBoundingClientRect();
    ind.style.top = `${r.top - canvasRect.top - 1}px`;
  }

  canvas.style.position = 'relative';
  canvas.appendChild(ind);
}

function clearDropIndicators(canvas: HTMLElement | null) {
  if (!canvas) return;
  canvas.querySelectorAll('.drop-indicator').forEach(el => el.remove());
}
