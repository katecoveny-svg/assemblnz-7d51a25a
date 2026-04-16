

## Brand Sweep — Light Liquid Glass Across All Dashboards

### The problem
50 files still use dark navy glass surfaces (`rgba(15,15,26,0.7)`) — predominantly in deep-dive dashboards: `auaha/ImageStudio`, all `hanga/*` (Waihanga) pages, all `care/*` pages, all `toroa/modules/*`, several admin dashboards, and Toroa landing. Text on these cards sits as light-on-dark, breaking the site-wide "white glass + charcoal text" standard.

### Solution — three-layer fix

**1. Upgrade the shared `LiquidGlassCard`** to add real liquid-motion realism (the existing one is good but flat-ish):
- Add an animated shimmer band that drifts diagonally (`@keyframes liquidShimmer`)
- Add a second blurred specular blob that follows the cursor with spring lag (gives the gloss/wet feel)
- Stronger 3D dual shadow + inset rim, ochre-by-default glow

**2. Replace local dark `GlassCard` definitions** with the shared `LiquidGlassCard`:
- `src/pages/auaha/ImageStudio.tsx` — delete local `GlassCard`, import shared
- `src/components/hanga/HangaLayout.tsx` + 11 hanga sub-pages
- `src/components/care/*` (5 files)
- `src/components/toroa/modules/*` (8 files)
- `src/components/haven/HavenDashboard.tsx`, `hauora/OdysseyTravelPlanner.tsx`
- Admin: `AdminFlintDashboard`, `AdminPackAnalytics`, `AdminPacksPage`
- `OnboardingPage`, `ToroaLandingPage`, `DataSovereigntyPage`

**3. Inline-style sweep** — for files where the dark `rgba` is a one-off `style={{ background: ... }}` block (chat panels, modals, FAQ, workflow cards, landing strips):
- `rgba(15,15,26,0.7)` → `rgba(255,255,255,0.65)`
- `borderColor: rgba(255,255,255,0.1)` → `rgba(255,255,255,0.6)` with `1px solid`
- Text classes `text-white/X` or `#F5F0E8X` → `#1A1D29` (charcoal) for headings, `#6B7280` for body
- Add `backdropFilter: blur(22px) saturate(160%)`, dual neumorphic shadow

### Visual upgrade detail (LiquidGlassCard)
```
boxShadow:
  10px 10px 28px rgba(166,166,180,0.32),     ← soft drop
  -8px -8px 24px rgba(255,255,255,0.95),     ← top-left highlight
  inset 0 2px 0 rgba(255,255,255,0.95),      ← glass rim
  inset 0 -1px 0 rgba(0,0,0,0.04),           ← bottom shade
  0 0 40px rgba(<accent>,0.15)               ← ambient glow
```
Plus animated shimmer (8s loop) + cursor-following accent blob = liquid feel.

### Out of scope (intentionally)
- Page backgrounds already `#FAFBFC` site-wide — no change
- The handful of demo pages already on `LiquidGlassCard` — leave alone
- Dark navy chart tooltips inside Recharts — separate task if needed

### Layout / data flow
No layout, routing, or data changes. Pure visual swap. All edits are colour/shadow/component-import.

### Files touched (summary)
- 1 component upgrade: `LiquidGlassCard.tsx`
- ~30 files: replace local `GlassCard` → import shared, swap dark inline styles for light
- Estimated: ~50 files, all surface-level edits

