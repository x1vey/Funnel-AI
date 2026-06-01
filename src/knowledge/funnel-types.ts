// ============================================================================
// Funnel Types — what kinds of funnels exist and what pages they need
// ============================================================================
// This is fed to the AI system prompt and used in the "Add Page" menu so the
// builder always knows the purpose and structure of each funnel type.

export interface FunnelTypeDefinition {
  id: string;
  name: string;
  description: string;
  /** Pages this funnel type typically includes, in order */
  pages: {
    slug: string;
    name: string;
    type: string;
    purpose: string;
    /** Key sections this page should have */
    sections: string[];
  }[];
  /** Industries/use cases this funnel fits */
  useCases: string[];
}

export const FUNNEL_TYPES: FunnelTypeDefinition[] = [
  {
    id: 'lead-magnet',
    name: 'Lead Magnet Funnel',
    description: 'Capture emails with a free offer (PDF, checklist, video), then present an upsell.',
    pages: [
      {
        slug: 'index', name: 'Opt-In Page', type: 'optin',
        purpose: 'Collect email in exchange for a free resource',
        sections: ['hero-with-form', 'benefit-bullets', 'social-proof', 'about-author', 'faq'],
      },
      {
        slug: 'thank-you', name: 'Thank You Page', type: 'thank_you',
        purpose: 'Confirm delivery, build excitement, present next step',
        sections: ['confirmation-message', 'delivery-instructions', 'what-to-expect', 'share-cta'],
      },
      {
        slug: 'oto', name: 'One-Time Offer', type: 'oto',
        purpose: 'Present a discounted paid offer while attention is highest',
        sections: ['urgency-header', 'problem-agitation', 'offer-reveal', 'pricing-with-discount', 'guarantee', 'countdown-timer'],
      },
    ],
    useCases: ['coaches', 'consultants', 'info products', 'SaaS', 'agencies'],
  },
  {
    id: 'webinar',
    name: 'Webinar Funnel',
    description: 'Drive registrations for a live or automated webinar, then sell at the end.',
    pages: [
      {
        slug: 'index', name: 'Registration Page', type: 'landing',
        purpose: 'Get people to register for the webinar',
        sections: ['hero-with-date', 'what-youll-learn', 'host-bio', 'urgency-countdown', 'registration-form'],
      },
      {
        slug: 'thank-you', name: 'Confirmation Page', type: 'thank_you',
        purpose: 'Confirm registration, add to calendar, share',
        sections: ['confirmation', 'calendar-add', 'pre-webinar-video', 'share-buttons'],
      },
      {
        slug: 'replay', name: 'Replay Page', type: 'sales',
        purpose: 'Watch the replay + present the offer',
        sections: ['video-embed', 'offer-section', 'bonuses', 'testimonials', 'faq', 'cta'],
      },
    ],
    useCases: ['courses', 'coaching', 'high-ticket services', 'SaaS demos'],
  },
  {
    id: 'product-launch',
    name: 'Product Launch Funnel',
    description: 'Build anticipation with a sequence of pages leading to a time-limited offer.',
    pages: [
      {
        slug: 'index', name: 'Landing Page', type: 'landing',
        purpose: 'The main pitch — hero, features, social proof, CTA',
        sections: ['hero', 'stats-bar', 'features', 'split-section', 'testimonials', 'logos', 'cta', 'footer'],
      },
      {
        slug: 'thank-you', name: 'Thank You Page', type: 'thank_you',
        purpose: 'Confirmation + what happens next + share',
        sections: ['thank-you-hero', 'next-steps', 'share-section', 'footer'],
      },
      {
        slug: 'oto', name: 'Upgrade / OTO', type: 'oto',
        purpose: 'One-time upgrade offer at a steep discount',
        sections: ['urgency-banner', 'hero', 'comparison-table', 'pricing', 'guarantee', 'countdown', 'cta'],
      },
      {
        slug: 'downsell', name: 'Downsell', type: 'downsell',
        purpose: 'Cheaper alternative if they skip the OTO',
        sections: ['empathy-headline', 'lighter-offer', 'pricing', 'no-risk-guarantee', 'cta'],
      },
    ],
    useCases: ['SaaS', 'physical products', 'courses', 'apps', 'books'],
  },
  {
    id: 'sales-letter',
    name: 'Long-Form Sales Letter',
    description: 'A single powerful page that tells a story, builds desire, and closes the sale.',
    pages: [
      {
        slug: 'index', name: 'Sales Page', type: 'sales',
        purpose: 'The full pitch — story, proof, offer, close',
        sections: ['pre-headline', 'hero-headline', 'story-opening', 'problem', 'agitation', 'solution-reveal',
                   'features-benefits', 'social-proof', 'offer-stack', 'bonuses', 'guarantee', 'scarcity', 'final-cta', 'faq', 'ps-section'],
      },
      {
        slug: 'order', name: 'Order Confirmation', type: 'confirmation',
        purpose: 'Thank them, confirm the purchase, set expectations',
        sections: ['order-confirmed', 'what-happens-next', 'access-instructions', 'support-info'],
      },
    ],
    useCases: ['info products', 'high-ticket coaching', 'supplements', 'events', 'masterminds'],
  },
  {
    id: 'tripwire',
    name: 'Tripwire Funnel',
    description: 'A low-ticket front-end offer ($7–$47) that converts cold traffic into buyers, then upsells.',
    pages: [
      {
        slug: 'index', name: 'Tripwire Page', type: 'sales',
        purpose: 'Sell a low-ticket product to turn a lead into a buyer',
        sections: ['hero', 'problem', 'solution', 'what-you-get', 'pricing-anchored', 'guarantee', 'cta'],
      },
      {
        slug: 'oto', name: 'Upsell', type: 'oto',
        purpose: 'Offer the full product/bundle at a discount',
        sections: ['congrats-header', 'exclusive-offer', 'comparison', 'pricing', 'countdown', 'cta'],
      },
      {
        slug: 'thank-you', name: 'Thank You', type: 'thank_you',
        purpose: 'Deliver access + welcome to the ecosystem',
        sections: ['confirmation', 'access-links', 'community-invite', 'next-steps'],
      },
    ],
    useCases: ['info products', 'templates', 'mini-courses', 'software tools', 'ebooks'],
  },
  {
    id: 'squeeze',
    name: 'Squeeze Page',
    description: 'Ultra-simple single-page opt-in: headline + email form + maybe a video. Maximum conversion.',
    pages: [
      {
        slug: 'index', name: 'Squeeze Page', type: 'optin',
        purpose: 'Collect emails with minimal distraction',
        sections: ['headline', 'video-or-image', 'email-form', 'trust-line'],
      },
      {
        slug: 'thank-you', name: 'Thank You', type: 'thank_you',
        purpose: 'Confirm + next step',
        sections: ['confirmation', 'check-inbox', 'share'],
      },
    ],
    useCases: ['any lead generation', 'newsletter signups', 'waitlists'],
  },
];

/**
 * Get the system prompt fragment that teaches the AI about funnel structures.
 * Injected into the system prompt so the AI knows what pages + sections to generate.
 */
export function funnelKnowledgePrompt(): string {
  return FUNNEL_TYPES.map((ft) => {
    const pages = ft.pages
      .map((p) => `  - ${p.name} (slug: "${p.slug}", type: ${p.type}): ${p.purpose}\n    Sections: ${p.sections.join(', ')}`)
      .join('\n');
    return `### ${ft.name}\n${ft.description}\nPages:\n${pages}`;
  }).join('\n\n');
}
