'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useFunnelStore } from '@/store/funnel-store';
import { renderNodesToDOM, scopeCSS } from '@/lib/serializer';
import { getPanelItem } from '@/blocks/elements';
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
    addSection,
    addElement,
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

  // ─── Drop new items from the side panel ─────────────────────────────────────
  const handleDragOver = useCallback((e: DragEvent) => {
    if (!e.dataTransfer?.types.includes('application/x-funnel-item')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!canvasRef.current) return;

    // We can't read the payload during dragover (browser security), so we use a
    // global hint set on dragstart to know whether it's a section or element.
    const kind = (window as unknown as { __pcDragKind?: string }).__pcDragKind;

    if (kind === 'element') {
      const target = findElementDropTarget(canvasRef.current, e.clientX, e.clientY);
      highlightDropContainer(canvasRef.current, target?.parentId ?? null);
      if (target) {
        updateChildDropIndicator(canvasRef.current, target.parentId, target.index);
      } else {
        clearDropIndicators(canvasRef.current);
      }
    } else {
      highlightDropContainer(canvasRef.current, null);
      updateDropIndicator(canvasRef.current, e.clientY, null);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    if (!canvasRef.current) return;
    // Only clear if leaving the canvas entirely
    if (!canvasRef.current.contains(e.relatedTarget as Node)) {
      clearDropIndicators(canvasRef.current);
      highlightDropContainer(canvasRef.current, null);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    const raw = e.dataTransfer?.getData('application/x-funnel-item');
    if (!raw || !canvasRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    clearDropIndicators(canvas);
    highlightDropContainer(canvas, null);
    document.body.classList.remove('pc-panel-dragging');

    let payload: { itemId: string; kind: string };
    try { payload = JSON.parse(raw); } catch { return; }

    const item = getPanelItem(payload.itemId);
    if (!item) return;
    const node = item.make();

    if (payload.kind === 'section') {
      const idx = findSectionInsertIndex(canvas, e.clientY);
      const created = addSection(node, idx);
      setSelectedElement(created.id);
    } else {
      // Element drop — find the container under the cursor
      const target = findElementDropTarget(canvas, e.clientX, e.clientY);
      if (target) {
        addElement(target.parentId, node, target.index);
      } else {
        // No container under cursor — wrap the element in a fresh blank section
        const created = addSection({
          type: 'section',
          tag: 'section',
          styles: { padding: '60px 40px', background: '#ffffff' },
          children: [],
        });
        addElement(created.id, node);
        setSelectedElement(created.id);
      }
    }
  }, [addSection, addElement, setSelectedElement]);

  // ─── Attach/detach event listeners ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('dblclick', handleDblClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('dragleave', handleDragLeave);
    canvas.addEventListener('drop', handleDrop);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('dblclick', handleDblClick);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('dragover', handleDragOver);
      canvas.removeEventListener('dragleave', handleDragLeave);
      canvas.removeEventListener('drop', handleDrop);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleClick, handleDblClick, handleMouseDown, handleMouseMove, handleMouseUp, handleDragOver, handleDragLeave, handleDrop]);

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
              Drag a section or element from the left panel to start building.
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

// Containers that can accept dropped elements
const CONTAINER_TAGS = new Set(['div', 'section', 'header', 'footer', 'main', 'nav', 'aside', 'article', 'ul', 'ol', 'form']);

// Find the best container + insertion index for an element drop at (x, y)
function findElementDropTarget(canvas: HTMLElement, x: number, y: number): { parentId: string; index: number } | null {
  const stack = document.elementsFromPoint(x, y);
  for (const raw of stack) {
    if (!canvas.contains(raw)) continue;
    const pc = (raw as HTMLElement).closest('[data-pc-id]') as HTMLElement | null;
    if (!pc || !canvas.contains(pc)) continue;

    const tag = pc.tagName.toLowerCase();
    if (CONTAINER_TAGS.has(tag)) {
      return { parentId: pc.getAttribute('data-pc-id')!, index: childInsertIndex(pc, y) };
    }

    // Leaf element (h1, p, a…) → drop into its nearest container parent
    const parent = pc.parentElement?.closest('[data-pc-id]') as HTMLElement | null;
    if (parent && canvas.contains(parent)) {
      return { parentId: parent.getAttribute('data-pc-id')!, index: childInsertIndex(parent, y) };
    }
  }
  return null;
}

// Index among a container's direct [data-pc-id] children, based on cursor Y
function childInsertIndex(container: HTMLElement, clientY: number): number {
  const children = Array.from(container.children).filter(
    c => (c as HTMLElement).hasAttribute('data-pc-id')
  ) as HTMLElement[];
  for (let i = 0; i < children.length; i++) {
    const r = children[i].getBoundingClientRect();
    if (clientY < r.top + r.height / 2) return i;
  }
  return children.length;
}

// Outline the container an element will drop into
function highlightDropContainer(canvas: HTMLElement, parentId: string | null) {
  canvas.querySelectorAll('[data-pc-drop-target]').forEach(el => el.removeAttribute('data-pc-drop-target'));
  if (!parentId) return;
  const el = canvas.querySelector(`[data-pc-id="${parentId}"]`);
  if (el) el.setAttribute('data-pc-drop-target', 'true');
}

// Insertion line between a container's children
function updateChildDropIndicator(canvas: HTMLElement, parentId: string, index: number) {
  clearDropIndicators(canvas);
  const container = canvas.querySelector(`[data-pc-id="${parentId}"]`) as HTMLElement | null;
  if (!container) return;

  const children = Array.from(container.children).filter(
    c => (c as HTMLElement).hasAttribute('data-pc-id')
  ) as HTMLElement[];

  const canvasRect = canvas.getBoundingClientRect();
  const ind = document.createElement('div');
  ind.className = 'drop-indicator';
  ind.style.position = 'absolute';
  ind.style.zIndex = '9999';
  ind.style.height = '3px';
  ind.style.background = 'var(--accent, #6366f1)';
  ind.style.borderRadius = '2px';

  if (children.length === 0) {
    const r = container.getBoundingClientRect();
    ind.style.left = `${r.left - canvasRect.left + 8}px`;
    ind.style.width = `${r.width - 16}px`;
    ind.style.top = `${r.top - canvasRect.top + r.height / 2}px`;
  } else if (index >= children.length) {
    const r = children[children.length - 1].getBoundingClientRect();
    ind.style.left = `${r.left - canvasRect.left}px`;
    ind.style.width = `${r.width}px`;
    ind.style.top = `${r.bottom - canvasRect.top}px`;
  } else {
    const r = children[index].getBoundingClientRect();
    ind.style.left = `${r.left - canvasRect.left}px`;
    ind.style.width = `${r.width}px`;
    ind.style.top = `${r.top - canvasRect.top - 1}px`;
  }

  canvas.style.position = 'relative';
  canvas.appendChild(ind);
}
