'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFunnelStore } from '@/store/funnel-store';
import { useUIStore } from '@/store/ui-store';
import { applyTheme } from '@/lib/themes';
import Toolbar from './toolbar';
import PageTabs from './page-tabs';
import ChatPanel from './chat-panel';
import Canvas from './canvas';
import LibraryDrawer from './library-drawer';
import ExportModal from './export-modal';

export default function BuilderLayout() {
  const router = useRouter();
  const { project, theme, device } = useFunnelStore();

  // Apply theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Redirect to start if no pages
  useEffect(() => {
    if (project.pages.length === 0) {
      // Don't redirect if we just got here — give it a moment
      const timeout = setTimeout(() => {
        if (useFunnelStore.getState().project.pages.length === 0) {
          router.replace('/');
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [project.pages.length, router]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--builder-bg)' }}
    >
      {/* Top toolbar */}
      <Toolbar />

      {/* Page tabs */}
      <PageTabs />

      {/* Main builder area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Chat panel */}
        <ChatPanel />

        {/* Canvas area */}
        <Canvas device={device} />
      </div>

      {/* Overlays */}
      <LibraryDrawer />
      <ExportModal />
    </div>
  );
}
