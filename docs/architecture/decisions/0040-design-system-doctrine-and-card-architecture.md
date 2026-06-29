---
title: "ADR 0040 — Design-system doctrine + card architecture (one surface, named cards)"
slug: adr-0040-design-system-doctrine-and-card-architecture
type: decision
status: accepted
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0467
deciders: Brian Scott
pairs_with:
  - docs/knowledge/wiki/design-system-doctrine.md
  - docs/learning/ddd/learning-records/0006-design-systems-and-ui-kits.md
  - docs/architecture/decisions/0028-shared-listing-card-and-taxonomy.md
  - docs/architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - architecture
  - design-system
  - component-library
  - card
  - tokens
  - ddd
---

# ADR 0040 — Design-system doctrine + card architecture (one surface, named cards)

## Status

**Accepted** — 2026-06-28 (SESSION_0467).

Supersedes the "one card" framing of **[ADR 0028](0028-shared-listing-card-and-taxonomy.md)** (ListingCard
remains the *catalog* card, but is no longer "the one card for every entity"), supersedes the m-card spec's
"`ListingCard` folds into `m-card(kind=generic)`" direction (PWCC-002), and sharpens
**[ADR 0033 D3](0033-component-library-shared-kernel-and-strategic-harness.md)** (the kernel card is the
*board* card, not "the one card"). Ratifies [`design-system-doctrine.md`](../../knowledge/wiki/design-system-doctrine.md)
as the canonical design-system law.

## Context

A card-consolidation lane (G-005) exposed that the repo had **three documents each claiming a different
"one card,"** written in the wrong order so none superseded the others:

| Doc | Claim | When |
| --- | --- | --- |
| ADR 0028 | `ListingCard` is the one card; every entity composes it | SESSION_0396 |
| m-card spec (PWCC-002) | `m-card` is the one card; "ListingCard folds into `kind=generic`" | SESSION_0428 (later) |
| ADR 0033 D3 | kernel `m-card` is the one card for `task\|deal\|record` | SESSION_0421 |

The code matched none of them cleanly: `ListingCard` served tools/schools/techniques; five other cards
(facet-result, course, post, merch, tournament) sat on the raw L1 `Card`; and there were **two** m-cards
with **different `kind` unions** (`roster|rank|task|loop|generic` app-side vs `task|deal|record` kernel-side).
The app m-card's `kind` union is itself the same mistake one altitude down: one component switching layout
*and* which DTO binds, across genuinely different information architectures (a person, a blog post, a kanban
task are not one card with skins).

Two further problems compounded the confusion:

1. **A confidently-wrong imported design system.** `docs/_imports/monorepo-design-system/` carried legacy
   monorepo tokens (BBL = `#8B0000` dark-red **+ gold `#FFD700`**, a `useDesignSystem()` hook) that
   **contradict current canon** (BBL = `#E52421` red, gold flagged as a corrected defect at `styles.css:210`).
   Every "what are our tokens" lookup could land on the wrong answer. **Deleted this session.**
2. **The good design-system docs were fragments**, never gathered into one ratified law:
   `design-system-grid-ratio-hierarchy.md`, `bbl-type-system.md`, `component-design-system.md`,
   `baseline-design-system.md` — each correct, none canonical, none connected to the card architecture.

The decision frame the operator set: *what would Apple / Facebook / Figma do?* They do not ship `Card(kind=…)`
god-components or maintain three "one card" docs. They ratify a **system** (tokens + a small set of
single-responsibility components), write it down as law, and conform components to it.

## Decision

**D1 — One canonical design-system doctrine.** [`design-system-doctrine.md`](../../knowledge/wiki/design-system-doctrine.md)
is the single source of truth for tokens, type/spacing/proportion scales, the card architecture, the kernel
boundary, and the per-brand tear sheets. The prior fragments become pointers into it.

**D2 — Tokens are the contract; the live app is truth.** Brands are **token swaps**, never component forks
(`--color-*` DB-injected via `BrandSettings`/`brand-theme.ts`; `--mk-*` in the kernel, re-mappable to the host's
`--color-*`). No brand identifier ever lives in a component. The current app (`styles.css`, `brand-theme.ts`,
`packages/ui-kit/tokens.css`) is canon; the deleted monorepo import was wrong and is not a source.

**D3 — One `Card` surface + named, single-responsibility cards.** The Dirstarter L1 `Card`
(`components/common/card.tsx`) is the ONE foundation. On it sit a *small* set of semantic cards, each with a
**tight prop type** — not a discriminated god-union:

| Semantic card | Job | Lives |
| --- | --- | --- |
| `ListingCard` | catalog / listing (media-hero + title + tagline + categories + View/Save) | app |
| record/person card (today's `m-card`) | identity cluster (glyph/avatar + title + meta + one focal value + badges) | app + kernel |
| `BoardCard` (today's kernel `m-card` task/deal/record) | kanban/board cell | kernel |

**No `kind` union that spans catalog *and* person *and* board.** A board feed is uniform because *the board
card* is uniform — not because blog posts and people are forced through one switch.

**D4 — The kernel boundary: tokens travel, Tailwind does not.** The kernel (`packages/ui-kit`) stays
framework-agnostic (it is consumed by a standalone-bun client). The L1 `Card` *surface contract* (anatomy +
visual contract: padding/radius/border/bg/hover/shadow + slots) is **ported** into the kernel's plain-CSS/token
idiom (Option B), tokens bridged to ONE SoT, guarded by an anti-drift parity test. This is the G-005 heal —
scheduled for the follow-up *code* session; this session ratifies the law it executes against.

**D5 — `m-card` is demoted from "the one card" to "the record/person card."** The `generic` kind is **not**
built; catalog content (course/post/merch/tournament/facet-result) consolidates onto **`ListingCard`** (ADR 0028's
real job), not onto a third generic shape.

## Consequences

- The three "one card" claims stop contradicting: one **surface**, three named **shapes**, each
  single-purpose. Re-litigating "which card?" every few sessions ends.
- "Brand-agnostic" is verifiable: a brand is a token block, full stop.
- The kernel stays consumable by the standalone-bun client (Option B), and the G-005 fork heal has a ratified
  target instead of an ambiguous directive.
- Cost: the m-card spec (PWCC-002) is partially walked back (no `generic`, demoted from "the one card") — a
  deliberate trade to kill the god-union before it grew a sixth `kind`.
- The code does not change this session; a follow-up conforms components to this law (the Apple sequence:
  ratify, then conform).

## Alternatives considered

- **(A) Tailwind-couple the kernel** — move the L1 `Card` + cva/Tailwind into `packages/ui-kit` verbatim.
  One literal component, but the kernel stops being framework-agnostic and the standalone-bun client breaks.
  Rejected (D4).
- **(C) Flip the dependency** — app cards rebase onto the kernel card. One literal component, but reverses
  ADR 0028 across every directory listing and loses Tailwind ergonomics app-side. Rejected (D3).
- **Keep three "one card" docs and "just improve m-card"** — treats the symptom; the contradiction and the
  god-union remain. Rejected.

## References

- [`design-system-doctrine.md`](../../knowledge/wiki/design-system-doctrine.md) — the ratified law.
- [Learning record 0006](../../learning/ddd/learning-records/0006-design-systems-and-ui-kits.md) — the teachable lesson.
- [Learning record 0005](../../learning/ddd/learning-records/0005-extract-the-l1-down-dont-cleanroom-it.md) — extract the L1 down, don't clean-room (the G-005 origin).
- ADR 0028 (shared listing card) · ADR 0033 (shared kernel) · ADR 0022 (brand chrome / token freeze).
- **Gold standards** (researched; doctrine §9–§11): **Dirstarter** (the primitive gold standard — [/docs/theming](https://dirstarter.com/docs/theming)), **shadcn/ui** (the copy-in + `bg`/`fg`-pair model our L1 inherits), **Material Design 3** (3-tier tokens + dynamic color), **Apple HIG** (principles > specs), **Figma** (tokens→primitives→components), and the **12-design-systems** study ([Figma resource library](https://www.figma.com/resource-library/design-system-examples/) — its four-part definition UI-kits/tokens/patterns/docs, plus IBM Carbon, Atlassian's layered tokens, Uber Base's multi-product scaling, and MD3's dynamic color all validate this ADR's token-as-contract + brand-as-token-swap stance). Ousterhout (deep modules — the card surface).
