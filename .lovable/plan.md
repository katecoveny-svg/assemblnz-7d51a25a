

## Pricing Page Branding Refresh

The pricing page is mostly well-structured but has several elements that don't match the premium glassmorphism branding used across the rest of the site.

### What needs fixing

1. **FAQ section uses flat card styling** -- `bg-card border-border` instead of the glassmorphism treatment (rgba(14,14,26,0.7) + backdrop-blur + border-white/[0.06])
2. **Section dividers are plain** -- basic `border-t border-border` lines instead of subtle gradient glow lines like the premium cards use
3. **Bottom CTA section looks generic** -- needs glass card wrapper and neon glow treatment on the "Browse agents" button
4. **Missing font-jakarta on body text** -- several `<p>` and `<span>` elements lack explicit font-jakarta class
5. **HELM section needs visual distinction** -- add a subtle purple-tinted glass background or a top-edge glow to differentiate it from the business plans section
6. **Trust signals bar is barely visible** -- needs slightly more contrast and a glass container

### Files to modify

**`src/pages/PricingPage.tsx`** (single file, all changes):
- FAQ accordion items: replace `rounded-xl border border-border bg-card` with glassmorphism inline styles matching the plan cards
- Section `border-t border-border` dividers: replace with gradient glow `<div>` elements (green → cyan → pink, 1px height, partial opacity)
- Bottom CTA: wrap in a glassmorphism card with neon border glow
- Add `font-jakarta` to body/label text elements that are missing it
- HELM section: add a subtle purple top-edge gradient glow line
- Trust signals: wrap in a subtle glass container with slightly increased text opacity

### No new files or dependencies needed

All changes are CSS/className updates within the existing PricingPage component, using the same glassmorphism patterns already established in the plan cards above.

