---
title: "ADR 0028 — Shared Listing card + additive cross-entity taxonomy (Tool→Listing parity)"
slug: adr-0028-shared-listing-card-and-taxonomy
type: decision
status: accepted
created: 2026-06-16
updated: 2026-06-16
last_agent: claude-session-0396
deciders: Brian Scott
pairs_with:
  - docs/architecture/decisions/0013-tool-listing-repurposing.md
  - docs/sprints/SESSION_0396.md
  - docs/runbooks/domain-features/baseline-listings-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0028 — Shared Listing card + additive cross-entity taxonomy (Tool→Listing parity)

## Status

**Accepted** — 2026-06-16. **Supersedes [ADR 0013](0013-tool-listing-repurposing.md) §"No shared generic
abstraction"** (the rest of ADR 0013 — repurpose the structural Tool listing *pattern*, keep L1 Tool — still holds).

## Context

ADR 0013 chose to map each domain listing (Technique, Profile, School) onto the Dirstarter Tool listing
**pattern** with **no shared abstraction** — each entity a concrete clone. In practice, per-entity copy-paste
**drifted**: Techniques and Schools cloned the Tool card faithfully, but the directory's person/org cards
(`FacetResultCard`) diverged into a bespoke, lower-caliber card with no `View`/`Save` footer, and the
`tool-filters` category/tag taxonomy never propagated. The operator's intent all along was **pixel- and
behavior-parity with the professionally-built Tool card** — copy-paste was the mechanism that produced the
divergence it was meant to prevent.

A second false belief surfaced and was corrected: ADR 0013 calls the `Tool`/`Category`/`Tag` models "dead code
until pre-prod cleanup." They are **not** slated for deletion — they are the **retained reference engine and the
shared taxonomy** the domain listings reuse (recorded as D-DRIFT-0396-1; the schema carries no deletion marker).

## Decision

1. **One canonical card.** Lift the L1 `ToolCard` markup into a single shared **`ListingCard`**
   (`components/web/listing/listing-card.tsx`) with the tool-only values turned into props/slots: `media`
   (favicon/avatar), `href`, `headerBadges`, `categories`, `statusBadges`, `description`, `save`, `viewLabel`.
2. **`ToolCard` becomes a thin adapter** that wires `ToolMany` into `ListingCard` — the live Tool directory
   renders through the exact same component (byte-identical) and inherits the shared fixes (long-name truncation
   via `text-nowrap`; conditional hover-fade for description-less cards). **L1 Tool is not lost** — it is the
   adapter, and `ListingCard` *is* the canonical L1 card.
3. **Every directory entity composes `ListingCard`** — Technique, person, school, lineage (via `FacetResultCard`).
4. **Additive shared taxonomy.** Extend the shared `Category`/`Tag` relations to `Organization`, `Passport`,
   `Technique`, `Post` (migration `20260616163546_add_listing_taxonomy` — 8 implicit m2m join tables, zero column
   drops) so each entity gets Tool-grade category/tag browse pages driven by the existing `/admin/{categories,tags}` UI.

## Consequences

### Positive

- Parity is **structural** — drift is impossible because there is one card, not N clones.
- The professionally-built Tool card's UX (card grid, filters, View/Save, badges) propagates to every entity.
- Additive schema only; the Baseline tool directory is untouched and tools keep their exact look + "View Listing" label.

### Negative / deferred

- Detail-page parity (the `/nodejs` tool-detail template for person/school detail pages) is **not** done — deferred.
- **Save-persistence for non-tool entities** is deferred: `Bookmark` is tool-only (`Bookmark.toolId` required, and the
  saved-items page depends on it). Non-tool cards render a sign-in-gated `ListingSaveButton` until the Bookmark model
  is generalized.
- `SchoolCard` (the standalone `/schools` kit, which currently redirects into `/directory`) is not yet folded into
  `ListingCard`.

### Neutral

- `Tool`/`Category`/`Tag` are explicitly **retained** (ADR 0013's "dead code" framing is corrected here).

## Dirstarter docs proof

| Topic | URL |
| --- | --- |
| Project Structure | <https://dirstarter.com/docs/codebase/structure> |
| Content Management | <https://dirstarter.com/docs/content> |
| Theming | <https://dirstarter.com/docs/theming> |

## Related decisions

- [ADR 0013 — Tool→Listing Pattern Repurposing](0013-tool-listing-repurposing.md) — superseded in part (the
  no-shared-abstraction stance only).
- [ADR 0025 — Passport identity source of truth](0025-passport-identity-source-of-truth.md) — person listings route through Passport/DirectoryProfile.
- [ADR 0023 — Generic profile claim](0023-generic-profile-claim.md) — the `Claim` affordance on a listing detail page.
