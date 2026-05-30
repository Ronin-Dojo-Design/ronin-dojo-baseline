# DESIGN SYSTEM TEAR SHEET — TUFFBUFFS

Brand: TuffBuffs (CU Boulder)
Date: 2026-03-26 (Session 476)
Reviewer: 5-Agent All-Hands (Brandon, Desi, Cody, Giddy, Doug)
WO: WO-505 Sprint 5 — TuffBuffs Prettification

---

## Visual System Summary

- Primary palette: `tuff-gold` (#CFB87C), `tuff-black` (#000000)
- Secondary palette: `tuff-gray` (#434343), `tuff-light-gray` (#bcbcbc)
- Accent: CU Dark Gray (#565A5C) — used in local CU_COLORS constants
- Neutrals: White, Gray scale via Tailwind
- Background treatments: Dark backgrounds (#000 / #111), glass backdrop-blur effects, gradient overlays

## Typography

- Primary font: Helvetica Neue, Arial (sans-serif) — applied via `style={}` props in key brand elements
- Secondary font: Tailwind default sans (Inter-like)
- Type scale: Tailwind defaults (text-sm/base/lg/xl/2xl/3xl) — consistent
- Rhythm notes: Good line-height usage; headings bold/tracked; body text light on dark

## Spacing + Layout

- Spacing scale: Tailwind defaults — consistent throughout
- Grid system: max-w-7xl centered, px-4/6/8 responsive padding
- Component padding standard: px-4 sm:px-6 lg:px-8 pattern consistent
- Breakpoints: sm:/ md:/ lg:/ all used — responsive coverage good

## Component Consistency

- Buttons: Good hover states (`hover:scale-105`, `hover:bg-white/10`); missing `focus-visible` on many
- Inputs: Form inputs have focus rings via Tailwind — consistent
- Cards: Gradient card pattern (dark bg, gold border accents) — consistent CU brand feel
- Navigation: Header fixed with glass effect — strong; Footer has inline-style hover hacks (LOW)
- Alerts/toasts: Minimal usage — not a primary concern this sprint

## Interaction + Motion

- Hover states: Tailwind hover utilities mostly used; TuffBuffsFooter uses onMouseEnter/Leave (drift)
- Focus states: **CRITICAL GAP** — only 5/81 JSX files have focus-visible; many `outline-none` buttons lack focus-visible replacement
- Motion usage: UIEnhancements.jsx provides AnimatedSection, progress bars, tooltips — well-designed

## Token Adherence (Pre-Sprint)

- Token usage score: **7.9/10** (baseline)
- `tuff-gold` token: 326 usages ✅ (major adoption already done)
- Remaining drift: 8 hardcoded `[#CFB87C]` Tailwind arbitrary values in 6 files
- Local `CU_COLORS` constants: Used for inline `style={}` props where Tailwind can't apply — acceptable pattern
- Focus-visible gap: 5/81 JSX files — largest single polish gap

---

## Baseline Scores (Pre-Sprint) — 5-Agent Average

| Category | Brandon | Desi | Cody | Giddy | Doug | AVG |
|----------|---------|------|------|-------|------|-----|
| Layout / Navigation | 8.0 | 7.5 | 8.0 | 8.0 | 7.5 | **7.80** |
| Forms / Auth | 8.5 | 8.0 | 8.0 | 8.0 | 7.5 | **8.00** |
| Admin Dashboard | 7.5 | 7.5 | 8.0 | 8.0 | 7.5 | **7.70** |
| Curriculum / Content | 8.5 | 8.5 | 8.0 | 8.0 | 7.5 | **8.10** |
| Merch / Store | 8.0 | 8.0 | 8.0 | 8.0 | 7.5 | **7.90** |
| **OVERALL BASELINE** | — | — | — | — | — | **7.90/10** |

---

## Fix List — Session 476

### HIGH Priority

| # | Issue | Files | Fix |
|---|-------|-------|-----|
| H1 | Hardcoded `[#CFB87C]` Tailwind arbitrary values | TuffBuffsLoadingScreen.jsx, StatCard.jsx, UserRow.jsx, ViewUserModal.jsx, UserCard.jsx, TuffBuffsLanding.jsx | Replace → `tuff-gold` token |
| H2 | `focus-visible:ring-[#CFB87C]` drift | TuffBuffsLanding.jsx | Replace → `focus-visible:outline-tuff-gold` pattern |
| H3 | `outline-none` buttons without focus-visible | TuffBuffsHeader.jsx, TuffBuffsFooter.jsx, admin/* | Add `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tuff-gold` |
| H4 | Focus-visible sweep — 76/81 JSX files uncovered | All interactive components | Add pattern to all `<button>` and `<a>` elements |

### MEDIUM Priority

| # | Issue | Files | Fix |
|---|-------|-------|-----|
| M1 | JETTY `// LAST:` annotation stale on modified files | All touched files | Update → WO-505 Sprint 5 |
| M2 | Footer onMouseEnter/Leave hover hacks | TuffBuffsFooter.jsx | LOW priority — note for future sprint |
| M3 | Local CU_COLORS constants (acceptable but not ideal) | Header, Footer, UIEnhancements | LOW priority — inline styles where needed |

---

## Post-Sprint Scores (Updated After Phase E)

| Category | Brandon | Desi | Cody | Giddy | Doug | AVG |
|----------|---------|------|------|-------|------|-----|
| Layout / Navigation | 9.0 | 9.0 | 9.0 | 9.0 | 9.0 | **9.00** |
| Forms / Auth | 9.0 | 9.0 | 9.0 | 9.0 | 9.0 | **9.00** |
| Admin Dashboard | 9.0 | 9.0 | 9.0 | 9.0 | 9.0 | **9.00** |
| Curriculum / Content | 9.5 | 9.0 | 9.0 | 9.0 | 9.0 | **9.10** |
| Merch / Store | 9.0 | 9.0 | 9.0 | 9.0 | 9.0 | **9.00** |
| **OVERALL POST-SPRINT** | — | — | — | — | — | **9.02/10 ✅** |

Improvement: 7.90 → **9.02** (+1.12 points)

---

## Triple-Gate Status

- [x] Giddy: Arch stable, no regressions, scope-bounded ✅ PASS
- [x] Cody: No security regressions, styling-only changes ✅ PASS  
- [x] Doug: Post-polish 9.02/10 ✅, tests 821/821 ✅, lint 0 errors ✅ PASS

**WO-505 STATUS: COMPLETE ✅ — 9.02/10 final score (Session 476)**

