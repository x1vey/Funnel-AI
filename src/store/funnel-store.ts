import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FunnelNode {
  id: string;
  type: 'section' | 'element';
  tag: string;
  attrs?: Record<string, string>;
  styles?: Record<string, string>;
  text?: string;
  children?: FunnelNode[];
  freeform?: boolean;
}

export interface FunnelPage {
  id: string;
  name: string;
  slug: string;
  sections: FunnelNode[];
}

export interface FunnelProject {
  id: string;
  name: string;
  pages: FunnelPage[];
  globalCSS: string;
  globalJS: string;
  meta: { created: number; modified: number };
}

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type ThemeName = 'coral' | 'indigo' | 'rose';

interface HistoryEntry {
  pages: FunnelPage[];
  globalCSS: string;
  globalJS: string;
}

interface FunnelState {
  project: FunnelProject;
  currentPageId: string | null;
  selectedElementId: string | null;
  device: DeviceMode;
  theme: ThemeName;
  history: HistoryEntry[];
  historyIndex: number;

  // Getters
  currentPage: () => FunnelPage | null;

  // Project mutations
  setProject: (project: FunnelProject) => void;
  setProjectName: (name: string) => void;
  setGlobalCSS: (css: string) => void;
  setGlobalJS: (js: string) => void;

  // Page mutations
  setCurrentPage: (pageId: string) => void;
  addPage: (page: Omit<FunnelPage, 'id'>) => void;
  removePage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;

  // Selection
  setSelectedElement: (id: string | null) => void;

  // Device / Theme
  setDevice: (device: DeviceMode) => void;
  setTheme: (theme: ThemeName) => void;

  // Node mutations
  addSection: (section: Omit<FunnelNode, 'id'>, index?: number) => FunnelNode;
  addElement: (parentId: string, element: Omit<FunnelNode, 'id'>, index?: number) => void;
  updateText: (nodeId: string, text: string) => void;
  updateStyle: (nodeId: string, prop: string, value: string) => void;
  updateStyles: (nodeId: string, styles: Record<string, string>) => void;
  updateAttrs: (nodeId: string, attrs: Record<string, string>) => void;
  moveNode: (nodeId: string, targetParentId: string, index: number) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Helpers
  findNode: (id: string) => FunnelNode | null;
  findParent: (id: string) => FunnelNode | null;
}

// ─── UID Generator ────────────────────────────────────────────────────────────

let _counter = 0;
export function uid(prefix = 'n'): string {
  return `${prefix}_${Date.now().toString(36)}_${(++_counter).toString(36)}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clonePages(pages: FunnelPage[]): FunnelPage[] {
  return JSON.parse(JSON.stringify(pages));
}

function findNodeInTree(nodes: FunnelNode[], id: string): FunnelNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findParentInTree(nodes: FunnelNode[], id: string, parent: FunnelNode | null = null): FunnelNode | null {
  for (const node of nodes) {
    if (node.id === id) return parent;
    if (node.children) {
      const found = findParentInTree(node.children, id, node);
      if (found !== undefined) return found;
    }
  }
  return undefined as unknown as null;
}

function removeNodeFromTree(nodes: FunnelNode[], id: string): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1);
      return true;
    }
    if (nodes[i].children && removeNodeFromTree(nodes[i].children!, id)) return true;
  }
  return false;
}

function insertNodeIntoTree(nodes: FunnelNode[], parentId: string, node: FunnelNode, index?: number): boolean {
  for (const n of nodes) {
    if (n.id === parentId) {
      if (!n.children) n.children = [];
      if (index !== undefined && index >= 0) {
        n.children.splice(index, 0, node);
      } else {
        n.children.push(node);
      }
      return true;
    }
    if (n.children && insertNodeIntoTree(n.children, parentId, node, index)) return true;
  }
  return false;
}

function createDefaultProject(): FunnelProject {
  return {
    id: uid('proj'),
    name: 'My Funnel',
    pages: [],
    globalCSS: '',
    globalJS: '',
    meta: { created: Date.now(), modified: Date.now() },
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFunnelStore = create<FunnelState>()(
  persist(
    (set, get) => {
      function pushHistory() {
        const { project, history, historyIndex } = get();
        const entry: HistoryEntry = {
          pages: clonePages(project.pages),
          globalCSS: project.globalCSS,
          globalJS: project.globalJS,
        };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(entry);
        if (newHistory.length > 50) newHistory.shift();
        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      }

      function mutateProject(fn: (pages: FunnelPage[], project: FunnelProject) => void) {
        pushHistory();
        set((state) => {
          const project = { ...state.project, meta: { ...state.project.meta, modified: Date.now() } };
          const pages = clonePages(project.pages);
          fn(pages, project);
          return { project: { ...project, pages } };
        });
      }

      function getAllSections(state: FunnelState): FunnelNode[] {
        const page = state.project.pages.find(p => p.id === state.currentPageId);
        return page?.sections ?? [];
      }

      return {
        project: createDefaultProject(),
        currentPageId: null,
        selectedElementId: null,
        device: 'desktop',
        theme: 'indigo',
        history: [],
        historyIndex: -1,

        currentPage: () => {
          const { project, currentPageId } = get();
          return project.pages.find(p => p.id === currentPageId) ?? null;
        },

        setProject: (project) => {
          const firstPageId = project.pages[0]?.id ?? null;
          set({ project, currentPageId: firstPageId, selectedElementId: null, history: [], historyIndex: -1 });
        },

        setProjectName: (name) => {
          set((s) => ({ project: { ...s.project, name, meta: { ...s.project.meta, modified: Date.now() } } }));
        },

        setGlobalCSS: (css) => {
          pushHistory();
          set((s) => ({ project: { ...s.project, globalCSS: css, meta: { ...s.project.meta, modified: Date.now() } } }));
        },

        setGlobalJS: (js) => {
          pushHistory();
          set((s) => ({ project: { ...s.project, globalJS: js, meta: { ...s.project.meta, modified: Date.now() } } }));
        },

        setCurrentPage: (pageId) => set({ currentPageId: pageId, selectedElementId: null }),

        addPage: (page) => {
          const newPage: FunnelPage = { ...page, id: uid('page') };
          set((s) => ({
            project: {
              ...s.project,
              pages: [...s.project.pages, newPage],
              meta: { ...s.project.meta, modified: Date.now() },
            },
            currentPageId: newPage.id,
          }));
        },

        removePage: (pageId) => {
          set((s) => {
            const pages = s.project.pages.filter(p => p.id !== pageId);
            const currentPageId = s.currentPageId === pageId ? (pages[0]?.id ?? null) : s.currentPageId;
            return {
              project: { ...s.project, pages, meta: { ...s.project.meta, modified: Date.now() } },
              currentPageId,
            };
          });
        },

        renamePage: (pageId, name) => {
          set((s) => ({
            project: {
              ...s.project,
              pages: s.project.pages.map(p => p.id === pageId ? { ...p, name } : p),
              meta: { ...s.project.meta, modified: Date.now() },
            },
          }));
        },

        setSelectedElement: (id) => set({ selectedElementId: id }),

        setDevice: (device) => set({ device }),

        setTheme: (theme) => set({ theme }),

        addSection: (section, index) => {
          const newSection: FunnelNode = { ...section, id: uid('sec'), type: 'section' };
          mutateProject((pages) => {
            const { currentPageId } = get();
            const page = pages.find(p => p.id === currentPageId);
            if (!page) return;
            if (index !== undefined && index >= 0) {
              page.sections.splice(index, 0, newSection);
            } else {
              page.sections.push(newSection);
            }
          });
          return newSection;
        },

        addElement: (parentId, element, index) => {
          const newEl: FunnelNode = { ...element, id: uid('el'), type: 'element' };
          mutateProject((pages) => {
            const { currentPageId } = get();
            const page = pages.find(p => p.id === currentPageId);
            if (!page) return;
            insertNodeIntoTree(page.sections, parentId, newEl, index);
          });
        },

        updateText: (nodeId, text) => {
          mutateProject((pages) => {
            const { currentPageId } = get();
            const page = pages.find(p => p.id === currentPageId);
            if (!page) return;
            const node = findNodeInTree(page.sections, nodeId);
            if (node) node.text = text;
          });
        },

        updateStyle: (nodeId, prop, value) => {
          mutateProject((pages) => {
            const { currentPageId } = get();
            const page = pages.find(p => p.id === currentPageId);
            if (!page) return;
            const node = findNodeInTree(page.sections, nodeId);
            if (node) {
              if (!node.styles) node.styles = {};
              node.styles[prop] = value;
            }
          });
        },

        updateStyles: (nodeId, styles) => {
          mutateProject((pages) => {
            const { currentPageId } = get();
            const page = pages.find(p => p.id === currentPageId);
            if (!page) return;
            const node = findNodeInTree(page.sections, nodeId);
            if (node) {
              node.styles = { ...node.styles, ...styles };
            }
          });
        },

        updateAttrs: (nodeId, attrs) => {
          mutateProject((pages) => {
            const { currentPageId } = get();
            const page = pages.find(p => p.id === currentPageId);
            if (!page) return;
            const node = findNodeInTree(page.sections, nodeId);
            if (node) {
              node.attrs = { ...node.attrs, ...attrs };
            }
          });
        },

        moveNode: (nodeId, targetParentId, index) => {
          mutateProject((pages) => {
            const { currentPageId } = get();
            const page = pages.find(p => p.id === currentPageId);
            if (!page) return;
            const node = findNodeInTree(page.sections, nodeId);
            if (!node) return;
            const cloned = JSON.parse(JSON.stringify(node));
            removeNodeFromTree(page.sections, nodeId);
            insertNodeIntoTree(page.sections, targetParentId, cloned, index);
          });
        },

        deleteNode: (nodeId) => {
          mutateProject((pages) => {
            const { currentPageId } = get();
            const page = pages.find(p => p.id === currentPageId);
            if (!page) return;
            // Check if it's a section
            const sectionIdx = page.sections.findIndex(s => s.id === nodeId);
            if (sectionIdx >= 0) {
              page.sections.splice(sectionIdx, 1);
            } else {
              removeNodeFromTree(page.sections, nodeId);
            }
          });
          set((s) => s.selectedElementId === nodeId ? { selectedElementId: null } : {});
        },

        duplicateNode: (nodeId) => {
          mutateProject((pages) => {
            const { currentPageId } = get();
            const page = pages.find(p => p.id === currentPageId);
            if (!page) return;

            function reassignIds(node: FunnelNode): FunnelNode {
              const cloned: FunnelNode = { ...node, id: uid(node.type === 'section' ? 'sec' : 'el') };
              if (cloned.children) cloned.children = cloned.children.map(reassignIds);
              return cloned;
            }

            const sectionIdx = page.sections.findIndex(s => s.id === nodeId);
            if (sectionIdx >= 0) {
              const dup = reassignIds(page.sections[sectionIdx]);
              page.sections.splice(sectionIdx + 1, 0, dup);
              return;
            }
            const parent = findParentInTree(page.sections, nodeId);
            if (parent?.children) {
              const idx = parent.children.findIndex(c => c.id === nodeId);
              if (idx >= 0) {
                const dup = reassignIds(parent.children[idx]);
                parent.children.splice(idx + 1, 0, dup);
              }
            }
          });
        },

        undo: () => {
          const { history, historyIndex, project } = get();
          if (historyIndex <= 0) return;
          const newIndex = historyIndex - 1;
          const entry = history[newIndex];
          set({
            historyIndex: newIndex,
            project: { ...project, pages: clonePages(entry.pages), globalCSS: entry.globalCSS, globalJS: entry.globalJS },
            selectedElementId: null,
          });
        },

        redo: () => {
          const { history, historyIndex, project } = get();
          if (historyIndex >= history.length - 1) return;
          const newIndex = historyIndex + 1;
          const entry = history[newIndex];
          set({
            historyIndex: newIndex,
            project: { ...project, pages: clonePages(entry.pages), globalCSS: entry.globalCSS, globalJS: entry.globalJS },
            selectedElementId: null,
          });
        },

        canUndo: () => get().historyIndex > 0,
        canRedo: () => get().historyIndex < get().history.length - 1,

        findNode: (id) => {
          const { project, currentPageId } = get();
          const page = project.pages.find(p => p.id === currentPageId);
          if (!page) return null;
          return findNodeInTree(page.sections, id);
        },

        findParent: (id) => {
          const { project, currentPageId } = get();
          const page = project.pages.find(p => p.id === currentPageId);
          if (!page) return null;
          const result = findParentInTree(page.sections, id);
          return result ?? null;
        },
      };
    },
    {
      name: 'funnel-ai-project',
      partialize: (state) => ({ project: state.project, theme: state.theme }),
    }
  )
);
