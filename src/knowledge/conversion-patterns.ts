// ============================================================================
// Conversion Patterns — what makes funnels convert
// ============================================================================
// High-converting funnel design patterns distilled from direct response
// marketing, used to teach the AI what elements to include and why.

export const CONVERSION_PATTERNS = [
  {
    name: 'Above-the-Fold CTA',
    rule: 'The primary CTA must be visible without scrolling. Hero = headline + sub + CTA button.',
    why: 'Most visitors decide within 3 seconds. If the CTA is below the fold, you lose them.',
  },
  {
    name: 'Single Clear Next Step',
    rule: 'Every page has ONE primary action. Remove navigation links that compete with the CTA.',
    why: 'Choice paralysis kills conversion. One button, one outcome.',
  },
  {
    name: 'Social Proof Stack',
    rule: 'Layer 3+ types: logos ("As seen in…"), stats ("10,000+ users"), testimonials (name + photo + quote), star ratings.',
    why: 'Different proof types reach different objection layers.',
  },
  {
    name: 'Objection Handling via FAQ',
    rule: 'Include a FAQ section that answers the top 5 objections: price, time, trust, complexity, competition.',
    why: 'Unaddressed objections = lost sales. FAQ is the cheapest way to handle them.',
  },
  {
    name: 'Visual Hierarchy',
    rule: 'Headline (60–80px) > subhead (20–24px) > body (17px). Accent color only on CTAs + key elements.',
    why: 'The eye follows size and color. If everything is bold, nothing is.',
  },
  {
    name: 'Risk Reversal',
    rule: 'Every paid page needs a guarantee: money-back, free trial, or "keep everything even if you cancel".',
    why: 'Risk reversal removes the last barrier between desire and action.',
  },
  {
    name: 'Urgency & Scarcity',
    rule: 'Use real deadlines (countdown timer), limited quantities, or "early-bird pricing ends [date]".',
    why: 'Without urgency, people bookmark instead of buy. Real scarcity > fake scarcity.',
  },
  {
    name: 'Price Anchoring',
    rule: 'Show the value first ($2,997), then the price ($297). Stack bonuses to increase perceived value.',
    why: 'The brain evaluates price relative to context. Anchor high, then reveal the deal.',
  },
  {
    name: 'Emotional → Logical',
    rule: 'Lead with emotion (story, pain, aspiration), close with logic (features, specs, guarantee).',
    why: 'People buy on emotion and justify with logic.',
  },
  {
    name: 'Exit Intent / Downsell',
    rule: 'If someone skips the OTO, show a downsell — smaller offer, lower price, payment plan.',
    why: 'A "no" to $297 is often a "yes" to $47. Capture the intent at a lower threshold.',
  },
  {
    name: 'Consistent Brand Across Pages',
    rule: 'Every page in the funnel shares the same colors, fonts, button styles, logo, and tone.',
    why: 'Visual inconsistency breaks trust. The funnel should feel like one seamless experience.',
  },
  {
    name: 'Mobile First',
    rule: 'Stack columns at 768px, hero headline drops to 36px, buttons go full-width, padding reduces.',
    why: '60%+ of funnel traffic is mobile. If it doesn\'t work on a phone, it doesn\'t work.',
  },
];

/**
 * System prompt fragment for conversion patterns.
 */
export function conversionPrompt(): string {
  return `CONVERSION OPTIMIZATION (apply to every generated funnel):
${CONVERSION_PATTERNS.map((p) => `- ${p.name}: ${p.rule}`).join('\n')}`;
}
