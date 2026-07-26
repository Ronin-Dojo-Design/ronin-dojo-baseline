---
title: "SESSION 0698 — WL-P2-23: wire the inert ancestry-timeline deep-links (claim-loop feeder)"
slug: session-0698
type: session
status: in-progress
created: 2026-07-24
updated: 2026-07-24
last_agent: cody-session-0698
sprint: S12
lane: build
brand: bbl
pairs_with:
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/sprints/SESSION_0493.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0698 — WL-P2-23 ancestry-timeline deep-links

> Overnight-orchestrator build lane. Wire the per-ancestor `slug` the ancestry payload has always
> shipped (`ancestry.ts`) but the timeline never consumed — Bob Bass, Rigan, the Gracies inert on
> the surface built to celebrate them. Ancestor discovery is a claim-loop feeder (BBL north star).

## Goal

Make each **non-owner** ancestor row in `LineageAncestryTimeline` a deep-link to that ancestor's
public profile, so a viewer can walk UP the lineage and land on a claimable profile.

## Verify-first (operator addendum, verify-first law)

Confirmed WL-P2-23 **still reproduces** in this worktree before wiring — not superseded by a
deep-link that could have landed since SESSION_0493:

- `git show HEAD:apps/web/components/web/lineage/lineage-ancestry-timeline.tsx | grep slug|Link|/directory/`
  → **NO match.** The committed timeline consumed `entry.nodeId`, `entry.narrative`,
  `entry.displayName` only — the payload's `entry.slug` (ancestry.ts:82) was dead. Bug is real.
- `apps/web/app/(web)/directory/[slug]/page.tsx` → **exists** (route-target live).
- `canOpenProfileDrawer` → **absent** from the directory / drawer paths. The drawer opens for
  EVERYONE (free viewer → claim CTA), matching the resolved lineage-drawer tier-gate. The
  funnel-first `/directory/[slug]` target is the correct claim-loop entry.

## What shipped

- `apps/web/components/web/lineage/lineage-ancestry-timeline.tsx` — `TimelineEntry` now computes
  `href = !isOwner && entry.slug ? `/directory/${entry.slug}` : null` and renders the avatar + name
  row inside a `Link` (`~/components/common/link`, hover-prefetch) when `href` is set, or the prior
  plain `<div className="flex items-center gap-4">` otherwise. The row content was extracted into a
  shared `row` fragment so the layout is byte-identical across both branches. Reduced-motion and the
  existing entrance-motion / avatar-ring / white-name styling are untouched; the name gets a
  `group-hover:underline` affordance that is inert off a `.group` link ancestor (non-link rows keep
  the operator's white name exactly). A11y: the link carries an `aria-label` and a
  `focus-visible` ring.
- `apps/web/components/web/lineage/lineage-ancestry-timeline.test.tsx` — new SSR render test
  (`renderToStaticMarkup`, the `lineage-node-card.policy` idiom): slugged non-owner → one
  `/directory/[slug]` anchor wrapping the name; slug-less placeholder → no link; owner → no
  self-link even with a slug.

## Route-target fork (ledger said "Petey call" — resolved here)

- **DECISION: link to `/directory/[slug]`** (funnel-first default). The drawer opens for everyone
  there → free-viewer → claim CTA, and the URL is shareable/SEO-able.
- **Alternative considered — in-place drawer open:** the timeline has NO cheap in-place
  drawer-open mechanism. The `/directory/[slug]` profile drawer is driven by the directory page's
  own route/state, not exposed to `LineageAncestryTimeline` (a leaf client component fed only
  `entries`). Wiring an in-place open would mean threading a drawer context/callback down into this
  leaf — more surface, no shareable URL. The link is simpler AND funnels better. Fork resolved:
  ship the link.

## Gates

- `bun run test components/web/lineage/lineage-ancestry-timeline.test.tsx server/web/lineage/ancestry.test.ts`
  → 19 pass / 0 fail (real exit 0).
- `bun run typecheck` → (see close evidence).
- `oxlint` (scoped to the two changed files) → 0 problems (real exit 0).

## Proposed ledger edits

> Append-only; the merge owner applies these to the canonical shared ledgers (this lane never
> writes shared ledgers directly).

### wiring-ledger.md — WL-P2-23 → RESOLVED

```
- WL-P2-23 — RESOLVED (SESSION_0698). Ancestry-timeline deep-links wired: non-owner ancestor rows
  with a `slug` now `Link` to `/directory/[slug]` (drawer-for-everyone → claim CTA; claim-loop
  feeder, BBL north star). Owner rows + slug-less placeholders stay non-link (no dead hrefs / no
  self-link). Route-target fork (was "Petey call") resolved funnel-first: `/directory/[slug]` over
  in-place drawer-open (the timeline leaf has no cheap drawer handle; the link is shareable).
  Files: lineage-ancestry-timeline.tsx (+ .test.tsx SSR render test). Verify-first confirmed the
  bug still reproduced at HEAD (payload `slug` was dead since SESSION_0493).
```

### Fork record (route-target)

```
FORK (WL-P2-23 route target): /directory/[slug]  vs  in-place drawer-open.
RESOLVED → /directory/[slug]. Rationale: drawer opens for everyone at that route (funnel-first,
resolved tier-gate); shareable/SEO URL; the timeline is a leaf client component with no in-place
drawer handle (in-place would require threading a drawer context into the leaf — more surface, no
URL). Alternative noted in the PR body per dispatch.
```

## Full close evidence

- Identity: worktree `/Users/brianscott/dev/ronin-0698`, branch
  `auto/session-0698-wl23-ancestry-deeplinks`. Canonical untouched.
- Owned-file discipline: only `lineage-ancestry-timeline.tsx`, its new `.test.tsx`, and this
  SESSION doc changed. No forbidden path touched (canvas / common / _kernel / state-panel / shared
  ledgers).
- Gates: tests 19/0 (rc 0), oxlint scoped clean (rc 0), typecheck (rc recorded at commit).
- EXIT CONTRACT: commit → push -u origin HEAD → `gh pr create --fill` → STOP.
