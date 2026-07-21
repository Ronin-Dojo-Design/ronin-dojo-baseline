---
title: "Recipe — Mobile Optimization Pass (responsive / touch / mobile-first)"
slug: recipe-mobile-optimization-pass
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0604
pairs_with:
  - docs/protocols/recipes/desi-design-review.md
  - docs/protocols/recipes/ui-ux-pass.md
  - docs/knowledge/wiki/desi-design-ledger.md
  - docs/agents/desi.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - design
  - mobile
  - recipe
  - review
---

# Recipe — Mobile Optimization Pass

The **mobile lens** of the design passes. Desi-led, read-only, behavior-preserving. Reviews a surface
on a **real mobile viewport** (375×812) — the member experience is mobile-first (`BottomNav` chrome,
thumb reach). Findings route to the [Desi Design Ledger](../../knowledge/wiki/desi-design-ledger.md)
(`DES-NNN`, `Pass: mobile`).

**Lens:** does this work at 375px — no horizontal scroll, tap-not-hover, thumb-reachable actions, content
before chrome — not just a shrunk desktop layout?

## Persona pack

- **Desi** — always (reviewer, on the mobile viewport). Reviews; does not fix.
- **Cody** — batched-fix executor after the operator elects fixes (behavior-preserving).
- **Doug** — only if a fix touches a runtime data path (re-verify on the hermetic scratch DB).

## Load-set

1. The surface (route closure / diff / component family). Bound it FIRST; write it into the SESSION task.
2. The motion + haptics constraints ([`motion-system-and-haptics-constraints`](../../knowledge/wiki/index.md)):
   `useReducedMotion` fallback always; iOS Safari has no haptics.
3. Open `DES-NNN` rows tagged `mobile` on this surface.

## Review checklist (the lens)

- **No horizontal scroll** — body never scrolls sideways; wide content (tables, diagrams, code) scrolls
  inside its OWN `overflow-x:auto` container; `max-width:100%` on media.
- **Touch targets ≥ 44px** — buttons/links/controls are thumb-sized; no hover-only affordances (tooltips,
  hover menus) gating a mobile action; two-stage tap where a hover was the desktop reveal.
- **Mobile-first order** — the most important content/action is first in the source / via CSS `order`
  (e.g. the SotD work board is in-flight-first ≤480px); chrome + metrics demoted below the fold.
- **Breakpoints** — layout reflows at `sm`/`md` (grid → stack), not a fixed desktop width; test 375 / 768.
- **Safe-area + viewport** — respects notch/home-indicator insets; no content under `BottomNav`; `100dvh`
  not `100vh` where it matters.
- **Reduced motion** — every animation has a `useReducedMotion` fallback.

## Step sequence

0. **Bound the surface.** List it in the SESSION task.
1. **Dispatch Desi** on a 375×812 viewport (`resize_window` / headless mobile) over the load-set + checklist.
   Capture screenshots at 375 (+ 768 if it reflows). Output ONE prioritized finding list.
2. **File findings** as `DES-NNN` rows (`Pass: mobile`), mint via `ledger-id-next.ts --prefix=DES`.
3. **Elect fixes** (operator). Behavior-preserving → Cody batch.
4. **Re-verify** on the mobile viewport — screenshot proof no-horizontal-scroll + tap targets; Doug if a
   data path moved. Flip resolved rows.

## Minimum-output contract

1. Bounded surface list + the viewport(s) tested.
2. `DES-NNN` `mobile` rows filed (or "conforms"), severity-ranked with recommendations.
3. Fixes applied vs ticketed, routed.
4. **Screenshot evidence** at 375px (before/after for any applied fix) — the proof-of-fix is visual.
5. **Verdict** GO / GO-WITH-NOTE → the push gate (waits for the operator's word).

## Done-means

1. No horizontal scroll on any reviewed surface at 375px.
2. Every interactive control thumb-sized + no hover-only mobile action.
3. Applied fixes re-verified with a mobile screenshot; `DES-NNN` rows flipped or owned.

## Cross-references

- [`desi-design-review.md`](desi-design-review.md) · [`ui-ux-pass.md`](ui-ux-pass.md) — the sibling passes.
- [Desi Design Ledger](../../knowledge/wiki/desi-design-ledger.md) — where findings land.
- [`recipes/review-wave.md`](review-wave.md) — dispatch Desi in the wave.
