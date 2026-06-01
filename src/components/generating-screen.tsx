'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui-store';
import { useFunnelStore } from '@/store/funnel-store';
import { htmlToSections } from '@/lib/serializer';
import { uid } from '@/store/funnel-store';
import { CheckCircle, Loader2 } from 'lucide-react';

const BUILD_STEPS = [
  'Analyzing your funnel strategy...',
  'Crafting high-converting copy...',
  'Designing landing page sections...',
  'Building thank-you + OTO pages...',
  'Applying design system & polish...',
];

const STEP_DURATION = 720;

interface GeneratedFunnelPage {
  name: string;
  slug: string;
  html: string;
}

interface GeneratedFunnel {
  name: string;
  pages: GeneratedFunnelPage[];
  css: string;
  js: string;
}

export default function GeneratingScreen() {
  const router = useRouter();
  const { prompt, setScreen } = useUIStore();
  const { setProject } = useFunnelStore();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Redirect to start if no prompt
  useEffect(() => {
    if (!prompt) {
      router.replace('/');
    }
  }, [prompt, router]);

  // Run build steps animation + API call
  useEffect(() => {
    if (!prompt || hasFetched.current) return;
    hasFetched.current = true;

    // Animate steps
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      if (stepIdx < BUILD_STEPS.length) {
        setCompletedSteps(prev => [...prev, stepIdx]);
        stepIdx++;
        setCurrentStep(stepIdx);
        setProgress(Math.round((stepIdx / BUILD_STEPS.length) * 85));
      }
    }, STEP_DURATION);

    // Kick off API call
    const fetchFunnel = async () => {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json() as GeneratedFunnel & { error?: string };

        if (!res.ok) {
          throw new Error(data.error || `API error ${res.status}`);
        }

        clearInterval(stepInterval);
        setCompletedSteps([0, 1, 2, 3, 4]);
        setProgress(100);

        // Parse each page's HTML into sections
        const pages = data.pages.map(page => ({
          id: uid('page'),
          name: page.name,
          slug: page.slug,
          sections: htmlToSections(page.html),
        }));

        setProject({
          id: uid('proj'),
          name: data.name || 'My Funnel',
          pages,
          globalCSS: data.css || '',
          globalJS: data.js || '',
          meta: { created: Date.now(), modified: Date.now() },
        });

        setTimeout(() => {
          setScreen('builder');
          router.push('/builder');
        }, 600);

      } catch (err) {
        clearInterval(stepInterval);
        const msg = err instanceof Error ? err.message : 'Generation failed. Please try again.';
        setError(msg);
        setCompletedSteps([0, 1, 2, 3, 4]);
        setProgress(100);

        // Still navigate to builder with empty project after error
        setTimeout(() => {
          setScreen('builder');
          router.push('/builder');
        }, 3000);
      }
    };

    fetchFunnel();

    return () => clearInterval(stepInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center aurora-bg dot-grid">
      <div className="max-w-2xl w-full mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'oklch(from var(--accent) l c h / 0.12)', color: 'var(--accent-dark)' }}>
            Building Your Funnel
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bricolage)' }}>
            AI is crafting your funnel
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {prompt ? `"${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}"` : 'Generating...'}
          </p>
        </div>

        {/* Glass card */}
        <div className="glass rounded-2xl p-8 shadow-xl mb-6"
          style={{ boxShadow: '0 8px 40px oklch(from var(--accent) l c h / 0.12)' }}>
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--accent-dark), var(--accent), var(--accent-light))',
                }}
              />
            </div>
          </div>

          {/* Build steps */}
          <div className="space-y-4">
            {BUILD_STEPS.map((step, idx) => {
              const isComplete = completedSteps.includes(idx);
              const isActive = currentStep === idx && !isComplete;

              return (
                <div key={step} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                    {isComplete ? (
                      <CheckCircle size={20} style={{ color: 'var(--accent)' }} />
                    ) : isActive ? (
                      <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: 'var(--surface-border)' }} />
                    )}
                  </div>
                  <span
                    className="text-sm transition-all"
                    style={{
                      color: isComplete ? 'var(--text-primary)' : isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: 'oklch(0.62 0.2 22 / 0.1)', color: 'oklch(0.4 0.2 22)' }}>
              <strong>Error:</strong> {error}
              <br />
              <span className="text-xs mt-1 block" style={{ color: 'var(--text-secondary)' }}>
                Redirecting to builder...
              </span>
            </div>
          )}
        </div>

        {/* Skeleton preview */}
        <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid var(--surface-border)' }}>
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--surface-border)' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
          </div>
          {/* Skeleton content */}
          <div className="p-4 space-y-3" style={{ background: 'var(--surface)' }}>
            <div className="skeleton h-6 w-2/3 mx-auto" />
            <div className="skeleton h-4 w-1/2 mx-auto" />
            <div className="flex gap-3 justify-center mt-4">
              <div className="skeleton h-9 w-28" />
              <div className="skeleton h-9 w-24" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="skeleton h-16" />
              <div className="skeleton h-16" />
              <div className="skeleton h-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
