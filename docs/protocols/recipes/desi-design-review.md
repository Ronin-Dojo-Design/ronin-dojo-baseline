---
title: "Recipe — Desi Design Review (cross-brand consistency + reuse pass)"
slug: recipe-desi-design-review
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0604
pairs_with:
  - docs/protocols/recipes/mobile-optimization-pass.md
  - docs/protocols/recipes/ui-ux-pass.md
  - docs/protocols/recipes/quality-suite.md
  - docs/knowledge/wiki/desi-design-ledger.md
  - docs/agents/desi.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - design
  - recipe
  - review
---

# Recipe — Desi Design Review

The **design sibling of [`quality-suite`](quality-suite.md)**: where quality-suite scores *code*,
this pass reviews *design consistency*. Desi-led, read-only, **behavior-preserving** (a behavior change
is an operator-ratified, logged exception). One of the three design passes; findings route to the
[Desi Design Ledger](../../knowledge/wiki/desi-design-ledger.md) (`DES-NNN`), never a SESSION-file rot list.

**Lens:** does this surface reuse the ONE foundation + a few single-purpose pieces (never a god-component /
`kind`-union), stay consistent across brand skins, and conform to the ratified card/listing contracts?

## Persona pack

- **Desi** — always (the reviewer). Reviews; does not fix. Surfaces `DES-NNN` recommendations.
- **Cody** — the batched-fix executor **after** the operator elects fixes (behavior-preserving only).
- **Giddy** — only if a finding is structural (a new god-component, a duplicated primitive that wants
  extraction to the kernel / `packages/ui-kit`).

## Load-set

1. The surface under review — a route's transitive component closure (per-page), OR a merged diff range
   (per-trunk), OR a named component family. Bound it FIRST; write the file/route list into the SESSION task.
2. The design law: [`design-system-doctrine.md`](../../knowledge/wiki/design-system-doctrine.md),
   the [Dirstarter L1 inventory](../../knowledge/wiki/dirstarter-component-inventory.md), the
   [custom-component-inventory](../../knowledge/wiki/custom-component-inventory.md), and the AdminCollection
   one-surface law (ADR 0045). Pull invariants; don't re-derive.
3. Open `DES-NNN` rows on this surface (don't re-file a known finding).

## Review checklist (the lens)

- **Reuse-first** — every card/list/button/select composes an L1 or named custom primitive; zero net-new
  near-dupes of an inventory component. Flag any hand-rolled twin of `Card`/`AdminCollection`/`ListingCard`/
  the ONE `ListingSaveButton`/the ONE uploader family.
- **Cross-brand parity** — the piece renders correctly under each brand skin; brand tint via tokens
  (`bg-primary`, `--sotd-accent`), never a hardcoded hue; semantic severity colors brand-invariant.
- **Card / listing contract** — cards obey the ONE L1 Card contract; listings obey the listing pattern
  (id/slug Select needs `items`; no proof data in dev DB).
- **Empty states + public-page hierarchy** — every list has an honest empty state; public pages lead with
  the funnel-first CTA (claim/join), not chrome.
- **Consistency** — spacing scale, heading sizes, badge vocabulary, icon set are the shared ones, not ad-hoc.

## Step sequence

0. **Bound the surface** (route closure / diff / component family). List it in the SESSION task.
1. **Dispatch Desi** read-only over the load-set + checklist. Output ONE prioritized finding list, each with
   surface (route/file:line) + severity + a concrete recommendation.
2. **File findings** as `DES-NNN` rows (mint via `ledger-id-next.ts --prefix=DES`). Structural items →
   also flag Giddy; cross-page consolidation → a ticket, not an inline edit.
3. **Elect fixes** (operator). Behavior-preserving recommendations → Cody batch; behavior-changing → a
   logged, ratified exception.
4. **Re-verify** any applied fix rendered correctly (headless browser screenshot / read_page), light/dark +
   mobile breakpoint if layout moved. Flip resolved `DES-NNN` rows.

## Minimum-output contract

1. Bounded surface list (routes/files reviewed).
2. `DES-NNN` rows filed (or "none — surface conforms"), each severity-ranked with a recommendation.
3. Fixes applied (behavior-preserving) vs ticketed (structural/behavior-changing), each routed.
4. Re-verify evidence for any applied fix (screenshot / read_page), incl. dark + mobile if layout moved.
5. **Verdict** GO / GO-WITH-NOTE → the push gate (always waits for the operator's word).

## Done-means

1. Every reviewed surface has a filed finding OR a "conforms" note.
2. Zero NEW near-dupes of L1 / inventory primitives introduced or left unticketed.
3. Applied fixes behavior-preserving + re-verified; `DES-NNN` rows flipped or left open with an owner.

## Cross-references

- [`mobile-optimization-pass.md`](mobile-optimization-pass.md) · [`ui-ux-pass.md`](ui-ux-pass.md) — the sibling design passes.
- [`quality-suite.md`](quality-suite.md) — the code-pass sibling this mirrors.
- [`recipes/review-wave.md`](review-wave.md) — dispatch Desi **in** the wave, not at close.
- [Desi Design Ledger](../../knowledge/wiki/desi-design-ledger.md) — where findings land.
- [Desi agent](../../agents/desi.md) · [`design-system-doctrine.md`](../../knowledge/wiki/design-system-doctrine.md).
