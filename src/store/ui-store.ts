import { create } from 'zustand';

export type Screen = 'start' | 'generating' | 'builder';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface UIState {
  screen: Screen;
  prompt: string;
  chatMessages: ChatMessage[];
  isTyping: boolean;
  libraryOpen: boolean;
  exportModalOpen: boolean;

  setScreen: (screen: Screen) => void;
  setPrompt: (prompt: string) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setTyping: (typing: boolean) => void;
  setLibraryOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  clearMessages: () => void;
}

let msgCounter = 0;
function msgId() { return `msg_${Date.now()}_${++msgCounter}`; }

export const useUIStore = create<UIState>((set) => ({
  screen: 'start',
  prompt: '',
  chatMessages: [],
  isTyping: false,
  libraryOpen: false,
  exportModalOpen: false,

  setScreen: (screen) => set({ screen }),
  setPrompt: (prompt) => set({ prompt }),

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
}));
