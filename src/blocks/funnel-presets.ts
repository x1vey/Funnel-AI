// ============================================================================
// Funnel Presets — predefined funnel structures users can choose from
// ============================================================================
// When a user starts, they pick a funnel type. Each type defines:
//   - Which pages to create
//   - Which blocks each page starts with (from the registry)
//   - The order of blocks on each page
//
// TO ADD A NEW FUNNEL TYPE: add an entry to FUNNEL_PRESETS below.
// The start screen and API will automatically pick it up.
// ============================================================================

export interface FunnelPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Who this funnel is for */
  audience: string;
  /** Pages in this funnel, in order */
  pages: FunnelPagePreset[];
}

export interface FunnelPagePreset {
  name: string;
  slug: string;
  type: string;
  /** Block IDs from the registry, in the order they appear on the page */
  blocks: string[];
}

export const FUNNEL_PRESETS: FunnelPreset[] = [
  {
    id: 'lead-magnet',
    name: 'Lead Magnet Funnel',
    description: 'Capture emails with a free offer, then upsell.',
    icon: '🧲',
    audience: 'Coaches, consultants, info products',
    pages: [
      {
        name: 'Opt-In Page',
        slug: 'index',
        type: 'optin',
        blocks: ['navbar-minimal', 'hero-centered', 'optin-form', 'features-3col', 'testimonials-cards', 'faq-section', 'footer-minimal'],
      },
      {
        name: 'Thank You',
        slug: 'thank-you',
        type: 'thank_you',
        blocks: ['navbar-minimal', 'thank-you-hero', 'footer-minimal'],
      },
      {
        name: 'One-Time Offer',
        slug: 'oto',
        type: 'oto',
        blocks: ['countdown-bar', 'navbar-minimal', 'oto-offer', 'features-3col', 'testimonial-featured', 'cta-with-guarantee', 'faq-section', 'footer-minimal'],
      },
    ],
  },
  {
    id: 'product-launch',
    name: 'Product Launch Funnel',
    description: 'Full sales funnel with landing page, thank you, upsell, and downsell.',
    icon: '🚀',
    audience: 'SaaS, apps, physical products, courses',
    pages: [
      {
        name: 'Landing Page',
        slug: 'index',
        type: 'landing',
        blocks: ['navbar-standard', 'hero-centered', 'logos-bar', 'stats-bar', 'features-3col', 'split-image-left', 'split-image-right', 'testimonials-cards', 'pricing-3tier', 'cta-banner', 'faq-section', 'footer-standard'],
      },
      {
        name: 'Thank You',
        slug: 'thank-you',
        type: 'thank_you',
        blocks: ['navbar-minimal', 'thank-you-hero', 'video-section', 'footer-minimal'],
      },
      {
        name: 'Upgrade Offer',
        slug: 'oto',
        type: 'oto',
        blocks: ['countdown-bar', 'navbar-minimal', 'oto-offer', 'testimonial-featured', 'cta-with-guarantee', 'footer-minimal'],
      },
    ],
  },
  {
    id: 'webinar',
    name: 'Webinar Funnel',
    description: 'Drive registrations for a live or recorded webinar, then sell.',
    icon: '🎥',
    audience: 'Courses, coaching, high-ticket services',
    pages: [
      {
        name: 'Registration Page',
        slug: 'index',
        type: 'optin',
        blocks: ['navbar-minimal', 'hero-split', 'stats-bar', 'features-3col', 'testimonials-cards', 'optin-form', 'footer-minimal'],
      },
      {
        name: 'Confirmation',
        slug: 'thank-you',
        type: 'thank_you',
        blocks: ['navbar-minimal', 'thank-you-hero', 'footer-minimal'],
      },
      {
        name: 'Replay + Offer',
        slug: 'replay',
        type: 'sales',
        blocks: ['navbar-minimal', 'hero-video', 'features-3col', 'testimonials-cards', 'pricing-3tier', 'cta-with-guarantee', 'faq-section', 'footer-minimal'],
      },
    ],
  },
  {
    id: 'sales-letter',
    name: 'Long-Form Sales Page',
    description: 'A single powerful page that tells a story and closes the sale.',
    icon: '📝',
    audience: 'Info products, coaching, supplements, events',
    pages: [
      {
        name: 'Sales Page',
        slug: 'index',
        type: 'sales',
        blocks: ['navbar-minimal', 'hero-centered', 'logos-bar', 'split-image-left', 'features-3col', 'split-image-right', 'stats-bar', 'testimonials-cards', 'testimonial-featured', 'pricing-3tier', 'cta-with-guarantee', 'faq-section', 'cta-banner', 'footer-standard'],
      },
      {
        name: 'Order Confirmation',
        slug: 'confirmation',
        type: 'confirmation',
        blocks: ['navbar-minimal', 'thank-you-hero', 'footer-minimal'],
      },
    ],
  },
  {
    id: 'tripwire',
    name: 'Tripwire Funnel',
    description: 'Low-ticket front-end offer ($7–$47) that converts cold traffic, then upsells.',
    icon: '🪤',
    audience: 'Templates, mini-courses, ebooks, tools',
    pages: [
      {
        name: 'Tripwire Page',
        slug: 'index',
        type: 'sales',
        blocks: ['navbar-minimal', 'hero-centered', 'features-3col', 'testimonial-featured', 'cta-with-guarantee', 'footer-minimal'],
      },
      {
        name: 'Upsell',
        slug: 'oto',
        type: 'oto',
        blocks: ['countdown-bar', 'navbar-minimal', 'oto-offer', 'features-3col', 'cta-with-guarantee', 'footer-minimal'],
      },
      {
        name: 'Thank You',
        slug: 'thank-you',
        type: 'thank_you',
        blocks: ['navbar-minimal', 'thank-you-hero', 'footer-minimal'],
      },
    ],
  },
  {
    id: 'squeeze',
    name: 'Squeeze Page',
    description: 'Ultra-simple email capture — headline, form, done. Maximum conversion.',
    icon: '📧',
    audience: 'Any lead generation, newsletters, waitlists',
    pages: [
      {
        name: 'Squeeze Page',
        slug: 'index',
        type: 'optin',
        blocks: ['hero-centered', 'optin-form', 'footer-minimal'],
      },
      {
        name: 'Thank You',
        slug: 'thank-you',
        type: 'thank_you',
        blocks: ['thank-you-hero', 'footer-minimal'],
      },
    ],
  },
];

/** Get a preset by ID */
export function getPreset(id: string): FunnelPreset | undefined {
  return FUNNEL_PRESETS.find((p) => p.id === id);
}

/** Get all presets */
export function getAllPresets(): FunnelPreset[] {
  return FUNNEL_PRESETS;
}
