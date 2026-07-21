---
title: "Recipe — UI/UX Pass (hierarchy / friction / accessibility)"
slug: recipe-ui-ux-pass
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0604
pairs_with:
  - docs/protocols/recipes/desi-design-review.md
  - docs/protocols/recipes/mobile-optimization-pass.md
  - docs/knowledge/wiki/desi-design-ledger.md
  - docs/agents/desi.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - design
  - ux
  - a11y
  - recipe
  - review
---

# Recipe — UI/UX Pass

The **experience lens** of the design passes. Desi-led, read-only, behavior-preserving. Where
[`desi-design-review`](desi-design-review.md) checks *consistency* and
[`mobile-optimization-pass`](mobile-optimization-pass.md) checks *the small viewport*, this pass checks
whether a surface is **usable**: clear hierarchy, low friction, accessible. Findings route to the
[Desi Design Ledger](../../knowledge/wiki/desi-design-ledger.md) (`DES-NNN`, `Pass: ui-ux`).

**Lens:** can a first-time user tell what matters, do the primary task without friction, and use it with a
keyboard + screen reader?

## Persona pack

- **Desi** — always (reviewer). Reviews the flow end-to-end; does not fix.
- **Cody** — batched-fix executor after the operator elects fixes (behavior-preserving).
- **Doug** — if the flow is a conversion path (registration / checkout / claim) — verify the funnel still
  completes on a hermetic scratch DB after any fix.

## Load-set

1. The surface / flow (a route closure OR an end-to-end funnel: register · claim · checkout · onboarding).
   Bound it FIRST; write the entry→exit steps into the SESSION task.
2. Relevant funnel invariants (claim loop, join funnel comp-gate, magic-link callback rules) — pull from
   the domain hub, don't re-derive.
3. Open `DES-NNN` rows tagged `ui-ux` on this surface.

## Review checklist (the lens)

- **Hierarchy** — the primary action + attention items are above the fold; secondary metrics/chrome demoted;
  one clear visual priority per screen (not five competing CTAs).
- **Friction** — the primary task has the fewest steps; no dead-end without a next action; honest empty
  states carry a CTA (funnel-first); errors are recoverable + legible.
- **Accessibility** — keyboard-navigable (APG roving-tabindex where applicable), visible focus ring, labelled
  controls, `role`/`aria-label` on icon-only + custom widgets, color-contrast floor met, not color-only signals.
- **Copy** — labels + microcopy are clear + consistent; no lorem / placeholder shipped; CTA verbs match intent.
- **Motion** — purposeful, `useReducedMotion` fallback; nothing that blocks or disorients.

## Step sequence

0. **Bound the surface / flow.** List entry→exit in the SESSION task.
1. **Dispatch Desi** to walk the flow (headless drive for a funnel; read_page for a static surface) over the
   load-set + checklist. Output ONE prioritized finding list with severity + recommendation.
2. **File findings** as `DES-NNN` rows (`Pass: ui-ux`), mint via `ledger-id-next.ts --prefix=DES`.
3. **Elect fixes** (operator). Behavior-preserving → Cody batch; anything that changes the flow itself → a
   logged, ratified exception.
4. **Re-verify** — re-walk the flow; Doug on a conversion path (funnel completes on scratch DB); a11y spot-check
   (keyboard + focus). Flip resolved rows.

## Minimum-output contract

1. Bounded surface/flow (entry→exit) reviewed.
2. `DES-NNN` `ui-ux` rows filed (or "conforms"), severity-ranked with recommendations.
3. Fixes applied vs ticketed, routed.
4. Re-verify evidence: flow re-walk (+ funnel-completes on scratch DB for a conversion path) + a11y spot-check.
5. **Verdict** GO / GO-WITH-NOTE → the push gate (waits for the operator's word).

## Done-means

1. Every reviewed surface has one clear visual priority + an accessible primary path.
2. No dead-end / color-only-signal / unlabelled-control left unticketed.
3. Applied fixes behavior-preserving + re-verified; `DES-NNN` rows flipped or owned.

## Cross-references

- [`desi-design-review.md`](desi-design-review.md) · [`mobile-optimization-pass.md`](mobile-optimization-pass.md) — the sibling passes.
- [Desi Design Ledger](../../knowledge/wiki/desi-design-ledger.md) — where findings land.
- [`recipes/review-wave.md`](review-wave.md) — dispatch Desi in the wave, not at close.
