'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui-store';
import { useFunnelStore } from '@/store/funnel-store';
import { applyTheme, ThemeName } from '@/lib/themes';
import { ArrowRight, Zap, Layers, BarChart3, Globe, ArrowLeft } from 'lucide-react';
import FunnelChooser from './funnel-chooser';
import FlowEditor, { type FlowPage } from './flow-editor';
import { type FunnelPreset } from '@/blocks/funnel-presets';

const PLACEHOLDER_PROMPTS = [
  'Describe your funnel...',
  'Online course teaching cold email sales...',
  'Weight loss program for women over 45...',
  'Real estate investing for beginners...',
  'SaaS tool for freelance designers...',
];

const THEMES: { name: ThemeName; label: string; color: string }[] = [
  { name: 'indigo', label: 'Indigo', color: 'oklch(0.55 0.22 263)' },
  { name: 'coral', label: 'Coral', color: 'oklch(0.62 0.20 22)' },
  { name: 'rose', label: 'Rose', color: 'oklch(0.58 0.22 350)' },
];

export default function StartScreen() {
  const router = useRouter();
  const {
    startStep, setStartStep,
    setPrompt, setScreen,
    setSelectedFunnel, setFlowPages,
    selectedFunnelName, flowPages,
  } = useUIStore();
  const { theme, setTheme } = useFunnelStore();

  const [inputValue, setInputValue] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Apply theme on mount
  useEffect(() => { applyTheme(theme); }, [theme]);

  // Typewriter placeholder cycling
  useEffect(() => {
    if (startStep !== 'prompt') return;
    let charIdx = 0;
    let typing = true;
    const target = PLACEHOLDER_PROMPTS[placeholderIdx];

    const interval = setInterval(() => {
      if (typing) {
        charIdx++;
        setDisplayedPlaceholder(target.slice(0, charIdx));
        if (charIdx >= target.length) {
          typing = false;
          setTimeout(() => {
            const eraseInterval = setInterval(() => {
              charIdx--;
              setDisplayedPlaceholder(target.slice(0, charIdx));
              if (charIdx <= 0) {
                clearInterval(eraseInterval);
                setPlaceholderIdx(i => (i + 1) % PLACEHOLDER_PROMPTS.length);
              }
            }, 20);
          }, 2000);
          clearInterval(interval);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [placeholderIdx, startStep]);

  function handleThemeChange(name: ThemeName) {
    setTheme(name);
    applyTheme(name);
  }

  // Step 1: User selects a funnel type
  function handleFunnelSelect(preset: FunnelPreset) {
    setSelectedFunnel(preset.id, preset.name);
    setFlowPages(
      preset.pages.map((p, i) => ({
        id: `flow_${Date.now()}_${i}`,
        name: p.name,
        slug: p.slug,
        type: p.type,
        blocks: [...p.blocks],
      }))
    );
    setStartStep('flow-editor');
  }

  // Step 2: User confirms the page flow
  function handleFlowConfirm(pages: FlowPage[]) {
    setFlowPages(pages);
    setStartStep('prompt');
  }

  // Step 3: User enters prompt and generates
  function handleGenerate() {
    const p = inputValue.trim();
    if (!p) return;
    setPrompt(p);
    setScreen('generating');
    router.push('/generating');
  }

  // ---- Step progress indicator ----
  const steps = [
    { key: 'choose-funnel', label: 'Type' },
    { key: 'flow-editor', label: 'Pages' },
    { key: 'prompt', label: 'Prompt' },
  ];
  const stepIndex = steps.findIndex(s => s.key === startStep);

  return (
    <div className="min-h-screen aurora-bg dot-grid relative overflow-x-hidden">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--accent)' }}
          >
            F
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Funnel AI
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-full" style={{ background: 'var(--bg-secondary)' }}>
            {THEMES.map(t => (
              <button
                key={t.name}
                title={t.label}
                onClick={() => handleThemeChange(t.name)}
                className="w-5 h-5 rounded-full transition-all"
                style={{
                  background: t.color,
                  boxShadow: theme === t.name ? `0 0 0 2px white, 0 0 0 3px ${t.color}` : 'none',
                  transform: theme === t.name ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          <button
            className="w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center text-white"
            style={{ background: 'var(--accent)' }}
          >
            G
          </button>
        </div>
      </nav>

      {/* Step progress (only shown in multi-step flow) */}
      {startStep !== 'home' && (
        <div className="relative z-10 flex items-center justify-center gap-2 mb-8 mt-4">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer"
                onClick={() => {
                  if (i <= stepIndex) setStartStep(s.key as typeof startStep);
                }}
                style={{
                  background: i <= stepIndex ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: i <= stepIndex ? 'white' : 'var(--text-secondary)',
                  opacity: i <= stepIndex ? 1 : 0.5,
                }}
              >
                {i + 1}. {s.label}
              </div>
              {i < steps.length - 1 && (
                <ArrowRight size={12} style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* HOME — the hero / landing view */}
      {/* ============================================================ */}
      {startStep === 'home' && (
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'oklch(from var(--accent) l c h / 0.12)', color: 'var(--accent-dark)' }}>
            <Zap size={12} />
            AI-Powered Funnel Builder
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bricolage)' }}>
            Describe it.{' '}
            <br />
            <span className="shimmer-text">Watch it become a funnel.</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Type what you sell. Funnel AI generates a complete, high-converting multi-page funnel —
            landing page, thank-you page, upsell and more — in seconds.
          </p>

          {/* Big CTA to start the flow */}
          <button
            onClick={() => setStartStep('choose-funnel')}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-xl text-lg font-bold text-white transition-all hover:scale-105"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 6px 24px oklch(from var(--accent) l c h / 0.4)',
            }}
          >
            Build My Funnel
            <ArrowRight size={20} />
          </button>

          {/* Feature strip */}
          <div className="flex items-center justify-center gap-6 mt-12">
            {[
              { icon: Layers, label: 'Multi-page funnels' },
              { icon: BarChart3, label: 'High-converting copy' },
              { icon: Globe, label: 'One-click publish' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Icon size={16} style={{ color: 'var(--accent)' }} />
                {label}
              </div>
            ))}
          </div>

          {/* Browser mockup */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                boxShadow: '0 24px 80px oklch(from var(--accent) l c h / 0.15), 0 4px 16px rgba(0,0,0,0.08)',
                transform: 'perspective(1200px) rotateX(4deg)',
              }}
            >
              <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--surface-border)' }}>
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4 h-6 rounded-md flex items-center px-3 text-xs" style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}>
                  funnel.ai/preview
                </div>
              </div>
              <div className="h-64 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)' }}>
                <div className="text-center text-white px-8">
                  <div className="text-4xl font-black mb-3 tracking-tight">YOUR FUNNEL TITLE</div>
                  <p className="text-gray-400 text-sm mb-6">Powerful copy generated by AI, ready to convert</p>
                  <div className="flex gap-3 justify-center">
                    <div className="px-6 py-3 rounded text-sm font-bold" style={{ background: 'var(--accent)' }}>Get Started</div>
                    <div className="px-6 py-3 rounded text-sm font-bold border border-white/30">Learn More</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1 — Choose funnel type */}
      {/* ============================================================ */}
      {startStep === 'choose-funnel' && (
        <div className="relative z-10 px-6 pt-8 pb-24">
          <FunnelChooser onSelect={handleFunnelSelect} />
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2 — Flow editor (reorder / add / remove pages) */}
      {/* ============================================================ */}
      {startStep === 'flow-editor' && (
        <div className="relative z-10 px-6 pt-8 pb-24">
          <FlowEditor
            funnelName={selectedFunnelName || 'My Funnel'}
            initialPages={flowPages.map(p => ({
              name: p.name,
              slug: p.slug,
              type: p.type,
              blocks: p.blocks,
            }))}
            onConfirm={handleFlowConfirm}
            onBack={() => setStartStep('choose-funnel')}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3 — Prompt input */}
      {/* ============================================================ */}
      {startStep === 'prompt' && (
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-8 pb-24">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
              Step 3
            </p>
            <h2
              className="text-3xl font-black mb-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bricolage)' }}
            >
              Describe what you&apos;re selling
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              The AI will generate copy, choose colors, and style your {flowPages.length}-page funnel.
            </p>
          </div>

          {/* Summary of selected flow */}
          <div
            className="flex items-center justify-center gap-2 flex-wrap mb-6"
          >
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'oklch(from var(--accent) l c h / 0.12)', color: 'var(--accent-dark)' }}
            >
              {selectedFunnelName}
            </span>
            {flowPages.map((page, i) => (
              <span key={page.id} className="flex items-center gap-1">
                {i > 0 && <ArrowRight size={10} style={{ color: 'var(--text-secondary)' }} />}
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  {page.name}
                </span>
              </span>
            ))}
          </div>

          {/* Prompt composer */}
          <div
            className="glass rounded-2xl p-3 shadow-xl mb-6"
            style={{ boxShadow: '0 8px 40px oklch(from var(--accent) l c h / 0.15)' }}
          >
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder={displayedPlaceholder || 'Describe what you are selling...'}
              rows={4}
              className="w-full resize-none bg-transparent text-base outline-none px-3 pt-2 pb-1"
              style={{ color: 'var(--text-primary)', caretColor: 'var(--accent)' }}
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {inputValue.length}/2000
              </span>
              <button
                onClick={handleGenerate}
                disabled={!inputValue.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--accent)',
                  boxShadow: inputValue.trim() ? '0 4px 14px oklch(from var(--accent) l c h / 0.4)' : 'none',
                }}
              >
                Generate {flowPages.length}-Page Funnel
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Back button */}
          <div className="flex justify-center">
            <button
              onClick={() => setStartStep('flow-editor')}
              className="flex items-center gap-2 text-sm font-medium transition-all hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={14} />
              Back to page flow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
