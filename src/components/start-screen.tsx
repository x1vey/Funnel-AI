'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui-store';
import { useFunnelStore } from '@/store/funnel-store';
import { applyTheme, ThemeName } from '@/lib/themes';
import { ArrowRight, Zap, ChevronRight, Layers, BarChart3, Globe } from 'lucide-react';

const EXAMPLE_PROMPTS = [
  'Online course on mastering LinkedIn for B2B sales',
  'Weight loss program for busy professionals over 40',
  'Real estate investment mentorship for beginners',
  'Productivity app for remote teams and founders',
  'Crypto trading education platform with signals',
  'High-ticket coaching on building a 7-figure agency',
];

const PLACEHOLDER_PROMPTS = [
  'Describe your funnel...',
  'Online course teaching cold email sales...',
  'Weight loss program for women over 45...',
  'Real estate investing for beginners...',
  'SaaS tool for freelance designers...',
];

const TEMPLATES = [
  { name: 'Course Launch', emoji: '🎓', desc: 'Online course + thank you + OTO upgrade', tag: 'Education' },
  { name: 'Coaching Funnel', emoji: '🔥', desc: 'Discovery call booking + follow-up sequence', tag: 'Coaching' },
  { name: 'Product Launch', emoji: '🚀', desc: 'Pre-launch + sales page + confirmation', tag: 'eCommerce' },
  { name: 'Lead Magnet', emoji: '🧲', desc: 'Free download + thank you + upsell', tag: 'Lead Gen' },
  { name: 'Webinar Funnel', emoji: '📡', desc: 'Registration + reminder + replay offer', tag: 'Events' },
  { name: 'SaaS Trial', emoji: '⚡', desc: 'Free trial + onboarding + upgrade offer', tag: 'Software' },
];

const THEMES: { name: ThemeName; label: string; color: string }[] = [
  { name: 'indigo', label: 'Indigo', color: 'oklch(0.55 0.22 263)' },
  { name: 'coral', label: 'Coral', color: 'oklch(0.62 0.20 22)' },
  { name: 'rose', label: 'Rose', color: 'oklch(0.58 0.22 350)' },
];

export default function StartScreen() {
  const router = useRouter();
  const { setPrompt, setScreen } = useUIStore();
  const { theme, setTheme } = useFunnelStore();
  const [inputValue, setInputValue] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Apply theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Typewriter placeholder cycling
  useEffect(() => {
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
  }, [placeholderIdx]);

  function handleSubmit(promptText?: string) {
    const p = (promptText || inputValue).trim();
    if (!p) return;
    setPrompt(p);
    setScreen('generating');
    router.push('/generating');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleThemeChange(name: ThemeName) {
    setTheme(name);
    applyTheme(name);
  }

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

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Templates', 'Pricing', 'Docs'].map(link => (
            <a
              key={link}
              href="#"
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              {link}
            </a>
          ))}
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

      {/* Hero */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold uppercase tracking-widest"
          style={{ background: 'oklch(from var(--accent) l c h / 0.12)', color: 'var(--accent-dark)' }}>
          <Zap size={12} />
          AI-Powered Funnel Builder
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bricolage)' }}>
          Describe it.{' '}
          <br />
          <span className="shimmer-text">Watch it become a funnel.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Type what you sell. Funnel AI generates a complete, high-converting multi-page funnel —
          landing page, thank-you page, upsell and more — in seconds.
        </p>

        {/* Composer */}
        <div className="glass rounded-2xl p-3 max-w-2xl mx-auto shadow-xl mb-4"
          style={{ boxShadow: '0 8px 40px oklch(from var(--accent) l c h / 0.15)' }}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={displayedPlaceholder || 'Describe your funnel...'}
            rows={3}
            className="w-full resize-none bg-transparent text-base outline-none px-3 pt-2 pb-1"
            style={{ color: 'var(--text-primary)', caretColor: 'var(--accent)' }}
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {inputValue.length}/2000
            </span>
            <button
              onClick={() => handleSubmit()}
              disabled={!inputValue.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 4px 14px oklch(from var(--accent) l c h / 0.4)',
              }}
            >
              Generate Funnel
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Example prompt chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {EXAMPLE_PROMPTS.map(prompt => (
            <button
              key={prompt}
              onClick={() => { setInputValue(prompt); textareaRef.current?.focus(); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
              style={{
                background: 'oklch(from var(--accent) l c h / 0.08)',
                color: 'var(--accent-dark)',
                border: '1px solid oklch(from var(--accent) l c h / 0.2)',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Product showcase strip */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-center gap-6 mb-4">
          {[
            { icon: Layers, label: 'Multi-page funnels' },
            { icon: BarChart3, label: 'High-converting copy' },
            { icon: Globe, label: 'Export & publish' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Icon size={16} style={{ color: 'var(--accent)' }} />
              {label}
            </div>
          ))}
        </div>

        {/* Browser mockup */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            boxShadow: '0 24px 80px oklch(from var(--accent) l c h / 0.15), 0 4px 16px rgba(0,0,0,0.08)',
            transform: 'perspective(1200px) rotateX(4deg)',
          }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--surface-border)' }}>
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4 h-6 rounded-md flex items-center px-3 text-xs" style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}>
              funnel.ai/preview
            </div>
          </div>
          {/* Preview area */}
          <div className="h-64 md:h-96 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)' }}>
            <div className="text-center text-white px-8">
              <div className="text-4xl font-black mb-3 tracking-tight">YOUR FUNNEL TITLE</div>
              <p className="text-gray-400 text-sm mb-6">Powerful copy generated by AI, ready to convert</p>
              <div className="flex gap-3 justify-center">
                <div className="px-6 py-3 rounded text-sm font-bold" style={{ background: 'var(--accent)', color: 'white' }}>
                  Get Started
                </div>
                <div className="px-6 py-3 rounded text-sm font-bold border border-white/30 text-white">
                  Learn More
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            Start with a template
          </p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Ready-made funnel structures
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {TEMPLATES.map(template => (
            <button
              key={template.name}
              onClick={() => {
                setInputValue(`${template.name}: ${template.desc}`);
                textareaRef.current?.focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group text-left p-5 rounded-xl transition-all hover:scale-102"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{template.emoji}</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'oklch(from var(--accent) l c h / 0.1)',
                    color: 'var(--accent-dark)',
                  }}
                >
                  {template.tag}
                </span>
              </div>
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                {template.name}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {template.desc}
              </p>
              <div className="flex items-center gap-1 mt-3 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }}>
                Use this template <ChevronRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
