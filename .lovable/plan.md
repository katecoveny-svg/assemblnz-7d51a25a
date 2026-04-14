

# Site Consistency & Design Audit — Full Alignment Plan

## Problems Found

### 1. WRONG PRICING in ContentHubCTA
`src/components/contenthub/ContentHubCTA.tsx` shows **setup fees as monthly prices**:
- Operator listed as "$1,490/mo" (should be $590/mo)
- Leader listed as "$1,990/mo" (should be $1,290/mo)
- Enterprise listed as "$2,990/mo" (should be $2,890/mo)

This is a serious error and directly contradicts PRICING-LOCKED.md.

### 2. WRONG KETE DESCRIPTIONS in KetePackSelector
`src/components/KetePackSelector.tsx`:
- Pikau described as "Security & Governance" — should be "Freight & Customs"
- Agent counts listed ("14 agents", "16 agents", "12 agents") — these are **forbidden phrases** per PRICING-LOCKED.md
- Pikau agents listed as "Enterprise" — meaningless

### 3. DUPLICATE CONTENT across pages
The site repeats the same information in multiple places with inconsistent presentation:
- **FAQ sections**: One in `src/components/FAQSection.tsx` (13 questions), another in `src/pages/Index.tsx` (5 questions), another in `src/pages/PricingPage.tsx` (11 questions) — three separate FAQ sets
- **Kete listings**: Defined in `src/data/pricing.ts`, then re-defined with different data in `KetePackSelector.tsx`, `Index.tsx` PACKS array, `PricingPage.tsx` KETE_DATA array, and `ContentHubCTA.tsx`
- **Trust pipeline**: Shown on both Index.tsx and PricingPage.tsx with different presentations
- **"How it works"**: OfferStack on PricingPage duplicates the How It Works section on Index

### 4. STYLE INCONSISTENCY
- `PricingPage.tsx` uses `font-display`/`font-body` CSS classes and `hsl(var(--primary))` tokens
- `Index.tsx` uses inline `fontFamily` declarations and hardcoded hex colors
- `ContentHubCTA.tsx` uses yet another styling approach with `hsl(var(--foreground))`
- Glass card styles differ between pages (some use `glass-card` class, others use inline styles)

### 5. STALE COMPONENTS
- `KetePackSelector.tsx` is a legacy component with wrong data — should import from `src/data/pricing.ts`
- `ContentHubCTA.tsx` appears to be from a content hub that was supposedly deleted in the navigation cleanup

---

## Plan

### Step 1: Fix ContentHubCTA pricing
Update the PLANS array to match PRICING-LOCKED.md:
- Family: $29/mo
- Operator: $590/mo  
- Leader: $1,290/mo
- Enterprise: $2,890/mo

All CTAs link to `/pricing`.

### Step 2: Fix KetePackSelector
- Import KETE from `src/data/pricing.ts` instead of hardcoding
- Remove agent counts (forbidden phrases)
- Fix Pikau subtitle to "Freight & Customs"
- Keep Toro as a separate entry with $29/mo

### Step 3: Consolidate Index.tsx data
- Replace the inline `PACKS` array with imports from `src/data/pricing.ts` KETE constant
- Remove the duplicate FAQ section from Index.tsx (keep the one in FAQSection.tsx as the single source, link to /pricing for pricing FAQs)
- Remove the 5-question FAQS array from Index.tsx entirely — the homepage doesn't need a FAQ when the pricing page has a comprehensive one

### Step 4: Consolidate PricingPage.tsx data
- Import PRICING, KETE, COMPARISON_FEATURES from `src/data/pricing.ts` for the tier cards instead of the separate TIERS array
- Remove the separate KETE_DATA array — use the imported KETE
- Remove duplicate FAQ — import and reuse the shared FAQSection component

### Step 5: Unify visual language
- Standardise Index.tsx to use the same design tokens as PricingPage (both should reference the same color constants)
- Ensure all glass cards use the `GlassPanel` component or the shared `glass-card` class — not ad-hoc inline styles
- Ensure MaungaBorder is used consistently on cards across both pages

### Step 6: Remove stale content
- Check if ContentHubCTA is actually rendered anywhere; if it's an orphan from the deleted ContentHub page, remove it entirely
- Remove any "Save 12% on annual plans with code ANNUAL12" line from PricingPage (line 228) — this isn't in PRICING-LOCKED.md and could be stale

---

### Files Modified
- `src/components/contenthub/ContentHubCTA.tsx` — fix prices or delete if orphaned
- `src/components/KetePackSelector.tsx` — import from pricing.ts, fix descriptions
- `src/pages/Index.tsx` — remove duplicate FAQ, use pricing.ts for kete data
- `src/pages/PricingPage.tsx` — import from pricing.ts, remove duplicate data, remove unapproved promo codes
- `src/components/FAQSection.tsx` — remains the single FAQ source of truth

