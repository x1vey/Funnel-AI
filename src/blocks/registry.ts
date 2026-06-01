// ============================================================================
// Block Registry — Every reusable section/element for the builder
// ============================================================================
// Each block is a clean HTML structure with data attributes for the editor.
// The AI doesn't generate HTML — it picks blocks from here and applies CSS + copy.
//
// TO ADD A NEW BLOCK: add an entry to the appropriate category array below.
// The builder will automatically pick it up.
//
// Structure:
//   - Every block is wrapped in a <div data-block="type"> for the editor
//   - Every editable element has data-el="name" for click-to-edit
//   - Inline styles are applied by the AI or the user in the editor
//   - The HTML is intentionally unstyled — CSS is applied separately
// ============================================================================

export interface BlockDefinition {
  id: string;
  name: string;
  category: BlockCategory;
  description: string;
  /** Which page types this block is commonly used on */
  pageTypes: string[];
  /** The clean HTML template — divs with data attributes, no inline styles */
  html: string;
  /** Default inline styles applied when the block is first dropped */
  defaultStyles?: string;
  /** Thumbnail icon (emoji or lucide icon name) */
  icon: string;
  /** Tags for search */
  tags: string[];
}

export type BlockCategory =
  | 'navigation'
  | 'hero'
  | 'social-proof'
  | 'features'
  | 'content'
  | 'testimonials'
  | 'pricing'
  | 'cta'
  | 'media'
  | 'stats'
  | 'forms'
  | 'footer'
  | 'urgency'
  | 'product';

// ============================================================================
// NAVIGATION
// ============================================================================
const navigation: BlockDefinition[] = [
  {
    id: 'navbar-standard',
    name: 'Navbar',
    category: 'navigation',
    description: 'Logo left, nav links center, CTA button right',
    pageTypes: ['landing', 'sales', 'optin', 'oto', 'thank_you'],
    icon: '🧭',
    tags: ['header', 'menu', 'navigation', 'logo'],
    html: `<div data-block="navbar" data-el="navbar">
  <div data-el="logo">Brand</div>
  <div data-el="nav-links">
    <a data-el="nav-link" href="#features">Features</a>
    <a data-el="nav-link" href="#pricing">Pricing</a>
    <a data-el="nav-link" href="#testimonials">Testimonials</a>
    <a data-el="nav-link" href="#about">About</a>
  </div>
  <div data-el="nav-cta">
    <a data-el="cta-button" href="#cta">Get Started</a>
  </div>
</div>`,
  },
  {
    id: 'navbar-minimal',
    name: 'Minimal Navbar',
    category: 'navigation',
    description: 'Logo left, single CTA right — no nav links',
    pageTypes: ['optin', 'oto', 'thank_you', 'downsell'],
    icon: '➖',
    tags: ['header', 'simple', 'clean'],
    html: `<div data-block="navbar-minimal" data-el="navbar">
  <div data-el="logo">Brand</div>
  <div data-el="nav-cta">
    <a data-el="cta-button" href="#cta">Get Started</a>
  </div>
</div>`,
  },
];

// ============================================================================
// HERO
// ============================================================================
const hero: BlockDefinition[] = [
  {
    id: 'hero-centered',
    name: 'Hero — Centered',
    category: 'hero',
    description: 'Centered headline, subtitle, and dual CTA buttons with dark background',
    pageTypes: ['landing', 'sales'],
    icon: '🎯',
    tags: ['hero', 'headline', 'cta', 'centered'],
    html: `<div data-block="hero-centered" data-el="hero">
  <div data-el="hero-inner">
    <div data-el="eyebrow">NOW AVAILABLE</div>
    <div data-el="headline">Your Powerful Headline Goes Here</div>
    <div data-el="subheadline">A compelling subtitle that explains the value proposition in one or two sentences.</div>
    <div data-el="cta-group">
      <a data-el="cta-primary" href="#cta">Get Started Free →</a>
      <a data-el="cta-secondary" href="#demo">Watch Demo</a>
    </div>
  </div>
</div>`,
  },
  {
    id: 'hero-split',
    name: 'Hero — Split (Text + Image)',
    category: 'hero',
    description: 'Text on the left, image on the right — classic split layout',
    pageTypes: ['landing', 'sales', 'optin'],
    icon: '⬜',
    tags: ['hero', 'split', 'image', 'two-column'],
    html: `<div data-block="hero-split" data-el="hero">
  <div data-el="hero-text">
    <div data-el="eyebrow">INTRODUCING</div>
    <div data-el="headline">Transform Your Business Starting Today</div>
    <div data-el="subheadline">Join thousands of entrepreneurs who have already made the shift.</div>
    <div data-el="cta-group">
      <a data-el="cta-primary" href="#cta">Start Now →</a>
    </div>
  </div>
  <div data-el="hero-image">
    <img data-el="image" src="https://placehold.co/640x480/1a1a2e/666" alt="Hero image" />
  </div>
</div>`,
  },
  {
    id: 'hero-video',
    name: 'Hero — Video Background',
    category: 'hero',
    description: 'Centered text overlay on a full-width video/image background',
    pageTypes: ['landing', 'sales'],
    icon: '🎬',
    tags: ['hero', 'video', 'background', 'fullscreen'],
    html: `<div data-block="hero-video" data-el="hero">
  <div data-el="hero-bg">
    <img data-el="bg-image" src="https://placehold.co/1920x1080/0a0a1a/333" alt="Background" />
  </div>
  <div data-el="hero-overlay">
    <div data-el="eyebrow">FREE MASTERCLASS</div>
    <div data-el="headline">Unlock Your Full Potential</div>
    <div data-el="subheadline">Watch the free training that changed everything for 50,000+ people.</div>
    <div data-el="cta-group">
      <a data-el="cta-primary" href="#watch">▶ Watch Now</a>
    </div>
  </div>
</div>`,
  },
];

// ============================================================================
// SOCIAL PROOF
// ============================================================================
const socialProof: BlockDefinition[] = [
  {
    id: 'logos-bar',
    name: 'Logo Bar — "As Seen In"',
    category: 'social-proof',
    description: 'Row of brand/publication logos',
    pageTypes: ['landing', 'sales', 'optin'],
    icon: '🏢',
    tags: ['logos', 'trust', 'brands', 'featured'],
    html: `<div data-block="logos-bar" data-el="logos-section">
  <div data-el="logos-label">As Featured In</div>
  <div data-el="logos-row">
    <div data-el="logo-item">Forbes</div>
    <div data-el="logo-item">Inc.</div>
    <div data-el="logo-item">Fortune</div>
    <div data-el="logo-item">Entrepreneur</div>
    <div data-el="logo-item">TechCrunch</div>
  </div>
</div>`,
  },
  {
    id: 'stats-bar',
    name: 'Stats Bar',
    category: 'social-proof',
    description: 'Row of impressive numbers with labels',
    pageTypes: ['landing', 'sales'],
    icon: '📊',
    tags: ['stats', 'numbers', 'metrics', 'proof'],
    html: `<div data-block="stats-bar" data-el="stats-section">
  <div data-el="stat-item">
    <div data-el="stat-number">50M+</div>
    <div data-el="stat-label">Lives Changed</div>
  </div>
  <div data-el="stat-item">
    <div data-el="stat-number">6,000+</div>
    <div data-el="stat-label">Events Hosted</div>
  </div>
  <div data-el="stat-item">
    <div data-el="stat-number">35+</div>
    <div data-el="stat-label">Years Experience</div>
  </div>
  <div data-el="stat-item">
    <div data-el="stat-number">100+</div>
    <div data-el="stat-label">Countries Reached</div>
  </div>
</div>`,
  },
];

// ============================================================================
// FEATURES
// ============================================================================
const features: BlockDefinition[] = [
  {
    id: 'features-3col',
    name: 'Features — 3 Column Grid',
    category: 'features',
    description: 'Three feature cards with icon, title, and description',
    pageTypes: ['landing', 'sales'],
    icon: '⚡',
    tags: ['features', 'grid', 'cards', 'benefits'],
    html: `<div data-block="features-3col" data-el="features-section">
  <div data-el="section-header">
    <div data-el="section-eyebrow">WHY CHOOSE US</div>
    <div data-el="section-title">Everything you need to succeed</div>
    <div data-el="section-subtitle">Powerful tools designed for results.</div>
  </div>
  <div data-el="features-grid">
    <div data-el="feature-card">
      <div data-el="feature-icon">⚡</div>
      <div data-el="feature-title">Lightning Fast</div>
      <div data-el="feature-desc">Get results in minutes, not months. Our system is built for speed.</div>
    </div>
    <div data-el="feature-card">
      <div data-el="feature-icon">🔒</div>
      <div data-el="feature-title">Proven System</div>
      <div data-el="feature-desc">Battle-tested by thousands of successful entrepreneurs.</div>
    </div>
    <div data-el="feature-card">
      <div data-el="feature-icon">📊</div>
      <div data-el="feature-title">Track Everything</div>
      <div data-el="feature-desc">Real-time analytics so you always know what's working.</div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'features-pillars',
    name: 'Pillars Grid',
    category: 'features',
    description: 'Horizontal pillars/categories — like topic navigation',
    pageTypes: ['landing'],
    icon: '🏛️',
    tags: ['pillars', 'categories', 'topics', 'grid'],
    html: `<div data-block="features-pillars" data-el="pillars-section">
  <div data-el="section-title">Master Every Area</div>
  <div data-el="pillars-grid">
    <div data-el="pillar-item">
      <div data-el="pillar-name">Mindset</div>
      <div data-el="pillar-link">Explore →</div>
    </div>
    <div data-el="pillar-item">
      <div data-el="pillar-name">Wealth</div>
      <div data-el="pillar-link">Explore →</div>
    </div>
    <div data-el="pillar-item">
      <div data-el="pillar-name">Health</div>
      <div data-el="pillar-link">Explore →</div>
    </div>
    <div data-el="pillar-item">
      <div data-el="pillar-name">Relationships</div>
      <div data-el="pillar-link">Explore →</div>
    </div>
    <div data-el="pillar-item">
      <div data-el="pillar-name">Business</div>
      <div data-el="pillar-link">Explore →</div>
    </div>
  </div>
</div>`,
  },
];

// ============================================================================
// CONTENT (split sections, text blocks)
// ============================================================================
const content: BlockDefinition[] = [
  {
    id: 'split-image-left',
    name: 'Split — Image Left, Text Right',
    category: 'content',
    description: 'Two-column: image on the left, text + CTA on the right',
    pageTypes: ['landing', 'sales', 'oto'],
    icon: '◧',
    tags: ['split', 'two-column', 'image', 'text'],
    html: `<div data-block="split-image-left" data-el="split-section">
  <div data-el="split-image">
    <img data-el="image" src="https://placehold.co/640x480/1a1a2e/666" alt="Feature image" />
  </div>
  <div data-el="split-text">
    <div data-el="eyebrow">THE SOLUTION</div>
    <div data-el="headline">A headline that speaks to your audience</div>
    <div data-el="body-text">A paragraph explaining the value, the transformation, or the benefit. Keep it focused on the reader, not on you.</div>
    <a data-el="cta-link" href="#">Learn More →</a>
  </div>
</div>`,
  },
  {
    id: 'split-image-right',
    name: 'Split — Text Left, Image Right',
    category: 'content',
    description: 'Two-column: text + CTA on the left, image on the right',
    pageTypes: ['landing', 'sales', 'oto'],
    icon: '◨',
    tags: ['split', 'two-column', 'image', 'text'],
    html: `<div data-block="split-image-right" data-el="split-section">
  <div data-el="split-text">
    <div data-el="eyebrow">HOW IT WORKS</div>
    <div data-el="headline">Simple steps to get started</div>
    <div data-el="body-text">Walk the reader through the process. Make it feel easy and achievable. Remove friction.</div>
    <a data-el="cta-link" href="#">Get Started →</a>
  </div>
  <div data-el="split-image">
    <img data-el="image" src="https://placehold.co/640x480/1a1a2e/666" alt="Feature image" />
  </div>
</div>`,
  },
  {
    id: 'video-section',
    name: 'Video + Text',
    category: 'content',
    description: 'Video embed or thumbnail with text alongside',
    pageTypes: ['landing', 'sales', 'optin', 'thank_you'],
    icon: '▶️',
    tags: ['video', 'media', 'embed', 'youtube'],
    html: `<div data-block="video-section" data-el="video-section">
  <div data-el="video-text">
    <div data-el="headline">See it in action</div>
    <div data-el="body-text">Watch how our system works and hear from real customers who've transformed their results.</div>
    <a data-el="cta-link" href="#">Watch Full Video →</a>
  </div>
  <div data-el="video-embed">
    <div data-el="video-placeholder">
      <img data-el="video-thumb" src="https://placehold.co/640x360/111/333" alt="Video thumbnail" />
      <div data-el="play-button">▶</div>
    </div>
  </div>
</div>`,
  },
];

// ============================================================================
// TESTIMONIALS
// ============================================================================
const testimonials: BlockDefinition[] = [
  {
    id: 'testimonials-cards',
    name: 'Testimonial Cards',
    category: 'testimonials',
    description: 'Grid of quote cards with name, role, and avatar',
    pageTypes: ['landing', 'sales', 'oto'],
    icon: '💬',
    tags: ['testimonials', 'quotes', 'social-proof', 'reviews'],
    html: `<div data-block="testimonials-cards" data-el="testimonials-section">
  <div data-el="section-header">
    <div data-el="section-title">What people are saying</div>
  </div>
  <div data-el="testimonials-grid">
    <div data-el="testimonial-card">
      <div data-el="quote">"This changed everything for me. I went from struggling to thriving in just 90 days."</div>
      <div data-el="author-row">
        <div data-el="avatar"></div>
        <div data-el="author-info">
          <div data-el="author-name">Sarah Johnson</div>
          <div data-el="author-role">CEO, GrowthCo</div>
        </div>
      </div>
    </div>
    <div data-el="testimonial-card">
      <div data-el="quote">"The ROI was immediate. We saw a 300% increase in conversions within the first month."</div>
      <div data-el="author-row">
        <div data-el="avatar"></div>
        <div data-el="author-info">
          <div data-el="author-name">Michael Chen</div>
          <div data-el="author-role">Marketing Director, TechStart</div>
        </div>
      </div>
    </div>
    <div data-el="testimonial-card">
      <div data-el="quote">"I've tried everything. This is the only system that actually delivered on its promises."</div>
      <div data-el="author-row">
        <div data-el="avatar"></div>
        <div data-el="author-info">
          <div data-el="author-name">Emily Rodriguez</div>
          <div data-el="author-role">Founder, ScaleUp Labs</div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'testimonial-featured',
    name: 'Featured Testimonial — Large Quote',
    category: 'testimonials',
    description: 'Single large centered quote with large quotation marks',
    pageTypes: ['landing', 'sales'],
    icon: '❝',
    tags: ['testimonial', 'quote', 'featured', 'large'],
    html: `<div data-block="testimonial-featured" data-el="testimonial-section">
  <div data-el="quote-mark">"</div>
  <div data-el="quote">This is the single best investment I've ever made in my business. The results speak for themselves.</div>
  <div data-el="author-row">
    <div data-el="avatar"></div>
    <div data-el="author-info">
      <div data-el="author-name">James Mitchell</div>
      <div data-el="author-role">CEO, Enterprise Solutions Inc.</div>
    </div>
  </div>
</div>`,
  },
];

// ============================================================================
// PRICING
// ============================================================================
const pricing: BlockDefinition[] = [
  {
    id: 'pricing-3tier',
    name: 'Pricing — 3 Tiers',
    category: 'pricing',
    description: 'Three pricing cards with a highlighted "popular" tier',
    pageTypes: ['landing', 'sales'],
    icon: '💰',
    tags: ['pricing', 'plans', 'tiers', 'subscription'],
    html: `<div data-block="pricing-3tier" data-el="pricing-section">
  <div data-el="section-header">
    <div data-el="section-title">Simple, transparent pricing</div>
    <div data-el="section-subtitle">No hidden fees. Cancel anytime.</div>
  </div>
  <div data-el="pricing-grid">
    <div data-el="pricing-card">
      <div data-el="plan-name">Starter</div>
      <div data-el="plan-price">$0</div>
      <div data-el="plan-period">/month</div>
      <div data-el="plan-desc">Perfect for getting started</div>
      <div data-el="plan-features">
        <div data-el="feature-item">✓ 1 funnel</div>
        <div data-el="feature-item">✓ 1,000 visitors/mo</div>
        <div data-el="feature-item">✓ Basic analytics</div>
      </div>
      <a data-el="plan-cta" href="#">Get Started</a>
    </div>
    <div data-el="pricing-card-featured">
      <div data-el="plan-badge">MOST POPULAR</div>
      <div data-el="plan-name">Pro</div>
      <div data-el="plan-price">$49</div>
      <div data-el="plan-period">/month</div>
      <div data-el="plan-desc">For serious marketers</div>
      <div data-el="plan-features">
        <div data-el="feature-item">✓ Unlimited funnels</div>
        <div data-el="feature-item">✓ 50,000 visitors/mo</div>
        <div data-el="feature-item">✓ Advanced analytics</div>
        <div data-el="feature-item">✓ A/B testing</div>
        <div data-el="feature-item">✓ Custom domains</div>
      </div>
      <a data-el="plan-cta" href="#">Start Free Trial</a>
    </div>
    <div data-el="pricing-card">
      <div data-el="plan-name">Enterprise</div>
      <div data-el="plan-price">$149</div>
      <div data-el="plan-period">/month</div>
      <div data-el="plan-desc">For teams and agencies</div>
      <div data-el="plan-features">
        <div data-el="feature-item">✓ Everything in Pro</div>
        <div data-el="feature-item">✓ Unlimited visitors</div>
        <div data-el="feature-item">✓ Priority support</div>
        <div data-el="feature-item">✓ White-label</div>
      </div>
      <a data-el="plan-cta" href="#">Contact Sales</a>
    </div>
  </div>
</div>`,
  },
];

// ============================================================================
// CTA
// ============================================================================
const cta: BlockDefinition[] = [
  {
    id: 'cta-banner',
    name: 'CTA Banner — Full Width',
    category: 'cta',
    description: 'Bold full-width call-to-action with gradient background',
    pageTypes: ['landing', 'sales', 'optin', 'oto'],
    icon: '🔥',
    tags: ['cta', 'call-to-action', 'banner', 'conversion'],
    html: `<div data-block="cta-banner" data-el="cta-section">
  <div data-el="cta-inner">
    <div data-el="headline">Ready to get started?</div>
    <div data-el="subheadline">Join thousands who've already transformed their results.</div>
    <a data-el="cta-button" href="#">Get Instant Access →</a>
  </div>
</div>`,
  },
  {
    id: 'cta-with-guarantee',
    name: 'CTA with Guarantee',
    category: 'cta',
    description: 'CTA section with money-back guarantee badge',
    pageTypes: ['sales', 'oto'],
    icon: '🛡️',
    tags: ['cta', 'guarantee', 'risk-reversal', 'money-back'],
    html: `<div data-block="cta-guarantee" data-el="cta-section">
  <div data-el="cta-inner">
    <div data-el="headline">Try It Risk-Free</div>
    <div data-el="subheadline">If you don't see results in 30 days, get a full refund. No questions asked.</div>
    <a data-el="cta-button" href="#">Start My Free Trial →</a>
    <div data-el="guarantee-badge">
      <div data-el="guarantee-icon">🛡️</div>
      <div data-el="guarantee-text">30-Day Money-Back Guarantee</div>
    </div>
  </div>
</div>`,
  },
];

// ============================================================================
// URGENCY (OTO / countdown / scarcity)
// ============================================================================
const urgency: BlockDefinition[] = [
  {
    id: 'countdown-bar',
    name: 'Countdown Timer Bar',
    category: 'urgency',
    description: 'Top banner with countdown timer — great for OTO pages',
    pageTypes: ['oto', 'downsell', 'sales'],
    icon: '⏰',
    tags: ['countdown', 'timer', 'urgency', 'scarcity'],
    html: `<div data-block="countdown-bar" data-el="countdown-section">
  <div data-el="urgency-text">⚡ This offer expires in:</div>
  <div data-el="countdown-timer">
    <div data-el="countdown-unit">
      <div data-el="countdown-number" data-countdown="hours">00</div>
      <div data-el="countdown-label">Hours</div>
    </div>
    <div data-el="countdown-separator">:</div>
    <div data-el="countdown-unit">
      <div data-el="countdown-number" data-countdown="minutes">15</div>
      <div data-el="countdown-label">Minutes</div>
    </div>
    <div data-el="countdown-separator">:</div>
    <div data-el="countdown-unit">
      <div data-el="countdown-number" data-countdown="seconds">00</div>
      <div data-el="countdown-label">Seconds</div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'oto-offer',
    name: 'One-Time Offer',
    category: 'urgency',
    description: 'Urgency-driven upsell block with crossed-out price',
    pageTypes: ['oto', 'downsell'],
    icon: '🎁',
    tags: ['oto', 'upsell', 'offer', 'discount', 'one-time'],
    html: `<div data-block="oto-offer" data-el="oto-section">
  <div data-el="oto-badge">ONE-TIME OFFER — DO NOT CLOSE THIS PAGE</div>
  <div data-el="headline">Wait! Here's a special upgrade just for you</div>
  <div data-el="subheadline">Get the complete package at 83% off — this offer will never appear again.</div>
  <div data-el="pricing-row">
    <div data-el="original-price">$297</div>
    <div data-el="offer-price">$47</div>
    <div data-el="savings-badge">Save $250</div>
  </div>
  <div data-el="cta-group">
    <a data-el="cta-yes" href="#">Yes! Upgrade My Order →</a>
    <a data-el="cta-no" href="#">No thanks, I'll pass on this</a>
  </div>
</div>`,
  },
];

// ============================================================================
// FORMS
// ============================================================================
const forms: BlockDefinition[] = [
  {
    id: 'optin-form',
    name: 'Email Opt-In Form',
    category: 'forms',
    description: 'Email capture form with headline and submit button',
    pageTypes: ['optin', 'landing'],
    icon: '📧',
    tags: ['form', 'email', 'optin', 'subscribe', 'lead-capture'],
    html: `<div data-block="optin-form" data-el="optin-section">
  <div data-el="form-inner">
    <div data-el="headline">Get Your Free Guide</div>
    <div data-el="subheadline">Enter your email and we'll send it right over.</div>
    <div data-el="form-fields">
      <input data-el="input-name" type="text" placeholder="Your name" />
      <input data-el="input-email" type="email" placeholder="Your best email" />
      <a data-el="submit-button" href="#">Send Me The Guide →</a>
    </div>
    <div data-el="privacy-text">We respect your privacy. Unsubscribe at any time.</div>
  </div>
</div>`,
  },
];

// ============================================================================
// FAQ
// ============================================================================
const faq: BlockDefinition[] = [
  {
    id: 'faq-section',
    name: 'FAQ — Accordion',
    category: 'content',
    description: 'Frequently asked questions with expandable answers',
    pageTypes: ['landing', 'sales', 'oto'],
    icon: '❓',
    tags: ['faq', 'questions', 'answers', 'accordion'],
    html: `<div data-block="faq" data-el="faq-section">
  <div data-el="section-title">Frequently Asked Questions</div>
  <div data-el="faq-list">
    <div data-el="faq-item">
      <div data-el="faq-question">Is there a free plan?</div>
      <div data-el="faq-answer">Yes — our free plan is generous and never expires. Start building today.</div>
    </div>
    <div data-el="faq-item">
      <div data-el="faq-question">Can I cancel anytime?</div>
      <div data-el="faq-answer">Absolutely. No contracts, no commitments. Cancel with one click.</div>
    </div>
    <div data-el="faq-item">
      <div data-el="faq-question">Do I need technical skills?</div>
      <div data-el="faq-answer">Not at all. If you can type, you can build a funnel. Our AI handles the rest.</div>
    </div>
    <div data-el="faq-item">
      <div data-el="faq-question">What kind of support do you offer?</div>
      <div data-el="faq-answer">Live chat during business hours, email support 24/7, and a comprehensive knowledge base.</div>
    </div>
  </div>
</div>`,
  },
];

// ============================================================================
// THANK YOU PAGE BLOCKS
// ============================================================================
const thankYou: BlockDefinition[] = [
  {
    id: 'thank-you-hero',
    name: 'Thank You — Confirmation',
    category: 'hero',
    description: 'Confirmation message with next steps',
    pageTypes: ['thank_you', 'confirmation'],
    icon: '✅',
    tags: ['thank-you', 'confirmation', 'success', 'next-steps'],
    html: `<div data-block="thank-you-hero" data-el="thankyou-section">
  <div data-el="success-icon">✅</div>
  <div data-el="headline">You're In! Check Your Email</div>
  <div data-el="subheadline">We've sent your free guide to your inbox. Here's what to do next:</div>
  <div data-el="steps-list">
    <div data-el="step-item">
      <div data-el="step-number">1</div>
      <div data-el="step-text">Check your email (including spam/promotions)</div>
    </div>
    <div data-el="step-item">
      <div data-el="step-number">2</div>
      <div data-el="step-text">Download the guide and read Chapter 1</div>
    </div>
    <div data-el="step-item">
      <div data-el="step-number">3</div>
      <div data-el="step-text">Join our community for live Q&A sessions</div>
    </div>
  </div>
</div>`,
  },
];

// ============================================================================
// FOOTER
// ============================================================================
const footer: BlockDefinition[] = [
  {
    id: 'footer-standard',
    name: 'Footer — Multi-Column',
    category: 'footer',
    description: 'Dark footer with link columns, social icons, and copyright',
    pageTypes: ['landing', 'sales', 'optin', 'thank_you', 'oto'],
    icon: '📐',
    tags: ['footer', 'links', 'social', 'copyright'],
    html: `<div data-block="footer" data-el="footer">
  <div data-el="footer-top">
    <div data-el="footer-brand">
      <div data-el="logo">Brand</div>
      <div data-el="tagline">Empowering entrepreneurs to build funnels that convert.</div>
    </div>
    <div data-el="footer-col">
      <div data-el="col-title">Product</div>
      <a data-el="footer-link" href="#">Features</a>
      <a data-el="footer-link" href="#">Pricing</a>
      <a data-el="footer-link" href="#">Templates</a>
    </div>
    <div data-el="footer-col">
      <div data-el="col-title">Company</div>
      <a data-el="footer-link" href="#">About</a>
      <a data-el="footer-link" href="#">Blog</a>
      <a data-el="footer-link" href="#">Contact</a>
    </div>
    <div data-el="footer-col">
      <div data-el="col-title">Legal</div>
      <a data-el="footer-link" href="#">Privacy Policy</a>
      <a data-el="footer-link" href="#">Terms of Service</a>
      <a data-el="footer-link" href="#">Refund Policy</a>
    </div>
  </div>
  <div data-el="footer-bottom">
    <div data-el="copyright">© 2026 Brand. All rights reserved.</div>
    <div data-el="social-links">
      <a data-el="social-link" href="#">Twitter</a>
      <a data-el="social-link" href="#">Instagram</a>
      <a data-el="social-link" href="#">YouTube</a>
      <a data-el="social-link" href="#">LinkedIn</a>
    </div>
  </div>
</div>`,
  },
  {
    id: 'footer-minimal',
    name: 'Footer — Minimal',
    category: 'footer',
    description: 'Simple one-line footer with logo, links, copyright',
    pageTypes: ['optin', 'oto', 'thank_you', 'downsell'],
    icon: '—',
    tags: ['footer', 'simple', 'minimal'],
    html: `<div data-block="footer-minimal" data-el="footer">
  <div data-el="footer-row">
    <div data-el="logo">Brand</div>
    <div data-el="footer-links">
      <a data-el="footer-link" href="#">Privacy</a>
      <a data-el="footer-link" href="#">Terms</a>
      <a data-el="footer-link" href="#">Support</a>
    </div>
    <div data-el="copyright">© 2026 Brand</div>
  </div>
</div>`,
  },
];

// ============================================================================
// MASTER REGISTRY
// ============================================================================
export const ALL_BLOCKS: BlockDefinition[] = [
  ...navigation,
  ...hero,
  ...socialProof,
  ...features,
  ...content,
  ...testimonials,
  ...pricing,
  ...cta,
  ...urgency,
  ...forms,
  ...faq,
  ...thankYou,
  ...footer,
];

/** Get all blocks for a specific category */
export function getBlocksByCategory(category: BlockCategory): BlockDefinition[] {
  return ALL_BLOCKS.filter((b) => b.category === category);
}

/** Get blocks suitable for a specific page type */
export function getBlocksForPageType(pageType: string): BlockDefinition[] {
  return ALL_BLOCKS.filter((b) => b.pageTypes.includes(pageType));
}

/** Search blocks by name, description, or tags */
export function searchBlocks(query: string): BlockDefinition[] {
  const q = query.toLowerCase();
  return ALL_BLOCKS.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.tags.some((t) => t.includes(q))
  );
}

/** Get a single block by ID */
export function getBlock(id: string): BlockDefinition | undefined {
  return ALL_BLOCKS.find((b) => b.id === id);
}

/** All unique categories in the registry */
export function getCategories(): BlockCategory[] {
  return [...new Set(ALL_BLOCKS.map((b) => b.category))];
}
