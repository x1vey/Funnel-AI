'use client';

import { useState, useRef, useEffect } from 'react';
import { useUIStore, ChatMessage } from '@/store/ui-store';
import { useFunnelStore } from '@/store/funnel-store';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const QUICK_ACTIONS = [
  { label: 'Add FAQ section', intent: 'add_faq' },
  { label: 'Make headline bolder', intent: 'bold_headline' },
  { label: 'Add testimonial section', intent: 'add_testimonials' },
  { label: 'Change CTA color', intent: 'cta_color' },
];

// Simple mock AI responses
function getMockResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('faq') || lower.includes('question')) {
    return "I've added an FAQ section to your current page. You can click on any question or answer to edit it directly.";
  }
  if (lower.includes('bold') || lower.includes('headline')) {
    return "I've made the headline text heavier. Click on any text element to select it, then use the context bar that appears above to adjust font weight and size.";
  }
  if (lower.includes('testimonial')) {
    return "Added a testimonials section with sample quotes. Double-click any text to edit it with real customer feedback.";
  }
  if (lower.includes('color') || lower.includes('colour')) {
    return "To change colors, click any element to select it, then use the color swatches in the floating toolbar above the element. You can also switch themes using the dots in the top-right toolbar.";
  }
  if (lower.includes('add') && lower.includes('section')) {
    return "Click 'Add Section' in the top toolbar to open the section library. You'll find Hero, Features, Testimonials, Pricing, FAQ, CTA, and Footer templates.";
  }
  if (lower.includes('export') || lower.includes('download') || lower.includes('publish')) {
    return "Click the 'Publish' button in the top-right toolbar to export your funnel. You can download it as a ZIP with all HTML files, CSS, and JS ready to deploy anywhere.";
  }
  return "I understand! To make changes, click any element on the canvas to select it, then use the toolbar that appears above it. You can edit text by double-clicking. Need help with something specific?";
}

export default function ChatPanel() {
  const { chatMessages, isTyping, addMessage, setTyping } = useUIStore();
  const { project } = useFunnelStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Welcome message
  useEffect(() => {
    if (chatMessages.length === 0 && project.pages.length > 0) {
      setTimeout(() => {
        addMessage('assistant', `Your funnel is ready! I've generated ${project.pages.length} pages for "${project.name}". Click any element on the canvas to edit it, or ask me to make changes.`);
      }, 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSend() {
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    addMessage('user', msg);

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addMessage('assistant', getMockResponse(msg));
    }, 1000 + Math.random() * 800);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleQuickAction(action: { label: string; intent: string }) {
    addMessage('user', action.label);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addMessage('assistant', getMockResponse(action.label));
    }, 900);
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: '380px',
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--surface-border)',
      }}
    >
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              {project.name}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              AI Assistant · {project.pages.length} pages
            </p>
          </div>
          <div
            className="ml-auto w-2 h-2 rounded-full"
            style={{ background: 'oklch(0.58 0.18 142)' }}
            title="Connected"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatMessages.length === 0 && !isTyping && (
          <div className="text-center py-8">
            <Bot size={32} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Ask me to modify your funnel...
            </p>
          </div>
        )}

        {chatMessages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'oklch(from var(--accent) l c h / 0.1)' }}
            >
              <Bot size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: 'var(--text-secondary)',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid var(--surface-border)' }}>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.intent}
              onClick={() => handleQuickAction(action)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80"
              style={{
                background: 'oklch(from var(--accent) l c h / 0.08)',
                color: 'var(--accent-dark)',
                border: '1px solid oklch(from var(--accent) l c h / 0.15)',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          className="flex items-end gap-2 p-3 rounded-xl"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--surface-border)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to change anything..."
            rows={2}
            className="flex-1 resize-none bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)', maxHeight: '80px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 hover:opacity-90"
            style={{ background: 'var(--accent)', flexShrink: 0 }}
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isUser ? 'var(--accent)' : 'oklch(from var(--accent) l c h / 0.1)',
        }}
      >
        {isUser
          ? <User size={13} className="text-white" />
          : <Bot size={13} style={{ color: 'var(--accent)' }} />
        }
      </div>

      {/* Bubble */}
      <div
        className={`px-4 py-3 rounded-2xl text-sm max-w-[240px] ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
        style={{
          background: isUser ? 'var(--accent)' : 'var(--bg-secondary)',
          color: isUser ? 'white' : 'var(--text-primary)',
          lineHeight: '1.6',
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
