import { create } from 'zustand';
import type { FlowPage } from '@/components/flow-editor';

export type Screen = 'start' | 'generating' | 'builder';

// The steps within the start screen
export type StartStep = 'home' | 'choose-funnel' | 'flow-editor' | 'prompt';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface UIState {
  screen: Screen;
  startStep: StartStep;
  prompt: string;
  selectedFunnelType: string | null;   // preset ID from funnel-presets.ts
  selectedFunnelName: string | null;   // preset name (for display)
  flowPages: FlowPage[];              // the pages to generate, in order
  chatMessages: ChatMessage[];
  isTyping: boolean;
  libraryOpen: boolean;
  exportModalOpen: boolean;

  setScreen: (screen: Screen) => void;
  setStartStep: (step: StartStep) => void;
  setPrompt: (prompt: string) => void;
  setSelectedFunnel: (id: string, name: string) => void;
  setFlowPages: (pages: FlowPage[]) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setTyping: (typing: boolean) => void;
  setLibraryOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  clearMessages: () => void;
  resetStartFlow: () => void;
}

let msgCounter = 0;
function msgId() { return `msg_${Date.now()}_${++msgCounter}`; }

export const useUIStore = create<UIState>((set) => ({
  screen: 'start',
  startStep: 'home',
  prompt: '',
  selectedFunnelType: null,
  selectedFunnelName: null,
  flowPages: [],
  chatMessages: [],
  isTyping: false,
  libraryOpen: false,
  exportModalOpen: false,

  setScreen: (screen) => set({ screen }),
  setStartStep: (startStep) => set({ startStep }),
  setPrompt: (prompt) => set({ prompt }),

  setSelectedFunnel: (id, name) => set({
    selectedFunnelType: id,
    selectedFunnelName: name,
  }),

  setFlowPages: (flowPages) => set({ flowPages }),

  addMessage: (role, content) =>
    set((s) => ({
      chatMessages: [
        ...s.chatMessages,
        { id: msgId(), role, content, timestamp: Date.now() },
      ],
    })),

  setTyping: (isTyping) => set({ isTyping }),
  setLibraryOpen: (libraryOpen) => set({ libraryOpen }),
  setExportModalOpen: (exportModalOpen) => set({ exportModalOpen }),
  clearMessages: () => set({ chatMessages: [] }),

  resetStartFlow: () => set({
    startStep: 'home',
    selectedFunnelType: null,
    selectedFunnelName: null,
    flowPages: [],
    prompt: '',
  }),
}));
