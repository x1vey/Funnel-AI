// ============================================================================
// Copywriting Frameworks — direct response principles for AI-generated copy
// ============================================================================
// Injected into the system prompt so every generated funnel has professional copy.

export const COPY_FRAMEWORKS = {
  PAS: {
    name: 'Problem–Agitate–Solve',
    description: 'Name the problem, twist the knife, present the solution.',
    use: 'Hero sections, sales pages, OTO pages',
    example: 'Tired of losing leads? Every day without a funnel, 23 potential customers walk away. FunnelAI builds your entire sales funnel in 60 seconds.',
  },
  AIDA: {
    name: 'Attention–Interest–Desire–Action',
    description: 'Grab attention, build interest with specifics, create desire with benefits, call to action.',
    use: 'Landing pages, email opt-ins, ads',
    example: 'Attention: "97% of websites lose visitors in 3 seconds." Interest: "Here\'s what the top 3% do differently." Desire: "Imagine doubling your conversions this week." Action: "Get the free playbook →"',
  },
  BAB: {
    name: 'Before–After–Bridge',
    description: 'Paint the painful before, the dream after, and your product as the bridge.',
    use: 'Thank you pages, testimonial sections, short copy',
    example: 'Before: Spending 3 weeks building a landing page. After: A complete funnel live in 60 seconds. Bridge: FunnelAI.',
  },
  '4Ps': {
    name: 'Picture–Promise–Prove–Push',
    description: 'Paint a picture, make a promise, prove it, push to action.',
    use: 'OTO pages, upsells, long-form sales',
    example: 'Picture yourself with a funnel that runs 24/7. We promise 2x more leads in 30 days. 14,000 businesses already use it. Try it free today.',
  },
};

export const COPY_RULES = [
  'Headlines: benefit-driven, specific, urgent. "Ship 10x faster" not "Our product".',
  'Subheads: expand the headline promise in 1 sentence. Never repeat the headline.',
  'CTAs: action + outcome. "Start My Free Trial" not "Submit". "Get Instant Access" not "Learn More".',
  'Body: short paragraphs (2–3 sentences max). Conversational. Second person ("you").',
  'Social proof: specific numbers ("14,327 businesses"), named testimonials with role/company.',
  'Urgency: real scarcity or time limits, not fake. "Beta pricing ends Friday" > "Limited time!".',
  'Guarantee: explicit risk reversal. "30-day money-back, no questions asked."',
  'Stats: large bold numbers (72px+), always with context label below.',
  'Bullets: lead with the benefit, then the feature. "Save 10 hours/week with automated follow-ups."',
  'Price anchoring: show the higher price crossed out, then the actual price. "Was $297 → $47 today only."',
];

/**
 * System prompt fragment for copywriting.
 */
export function copywritingPrompt(): string {
  return `COPYWRITING RULES (apply to all generated copy):
${COPY_RULES.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Use the PAS (Problem–Agitate–Solve) framework for hero sections and sales pages.
Use AIDA for opt-in pages. Use Before–After–Bridge for testimonial sections.`;
}
