---
title: "SESSION 0430 — m-card (PWCC-002) smallest slice: kind=roster on /directory"
slug: session-0430
type: session--implement
status: in-progress
created: 2026-06-21
updated: 2026-06-21
last_agent: claude-session-0430
sprint: S-foundation
pairs_with:

  - docs/sprints/SESSION_0429.md
  - docs/knowledge/wiki/files/m-card-pattern.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0430 — m-card (PWCC-002) smallest slice: kind=roster on /directory

## Date

2026-06-21

## Operator

Brian + claude-session-0430

## Goal

Build the m-card (PWCC-002) smallest slice per `docs/knowledge/wiki/files/m-card-pattern.md`:
the one brand-/content-agnostic card on the Dirstarter `components/common/card.tsx` base with
`kind="roster"`, a `map-roster` mapper from the directory facet DTO, and a swap of the
`/directory` facet grid (`FacetResultCard` → `m-card`) behind a parity test. Rank/task/loop kinds
and the other surfaces are deferred to follow-up slices.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0429.md`
- Carryover: SESSION_0429 authored the m-card spec (PWCC-002) as part of the design-system /
  component-spec batch. This session is the first **build** lane against that spec (the cloud
  handoff prompt in the spec). The PR-Review-Loop next-session block in 0429 is superseded by the
  explicit build request.

### Branch and worktree

- Branch: `claude/charming-bell-wbs3fl`
- Status at bow-in: clean
- Current HEAD at bow-in: `a841aaa`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming (token-only skin), Components (`components/common/card.tsx` L1 base) |
| Extension or replacement | Extension: composes the L1 `Card` + `Grid` primitives into one content-agnostic `m-card`; no primitive rebuilt |
| Why justified | Collapses 3 bespoke roster cards into one token-skinned contract (spec PWCC-002) |
| Risk if bypassed | Per-surface card drift returns (the parity problem the spec exists to kill) |

Live docs checked during planning: Theming (token surface `app/styles.css`), Components.

## Petey plan

### Goal

Land m-card kind=roster + map-roster + the /directory swap behind a parity test; prove mapper
shape + no-leak (bun test) and author the Playwright visual proof.

### Tasks

#### SESSION_0430_TASK_01 — m-card contract + component

- **Agent:** Cody
- **What:** `lib/m-card/types.ts` (MCardKind/MCardData/MCardProps) + `components/web/m-card/m-card.tsx`
  on the Dirstarter `Card` base; kind switch with roster implemented.
- **Done means:** `<MCard kind="roster" />` renders eyebrow → title → accent/rank tint → meta → badges → actions.

#### SESSION_0430_TASK_02 — map-roster mapper

- **Agent:** Cody
- **What:** `lib/m-card/map-roster.ts` — pure map from the already-gated directory facet DTO
  (`DirectoryFacetResult`) to `MCardData["roster"]`.
- **Done means:** bun test proves output shape + no non-public field leak.

#### SESSION_0430_TASK_03 — /directory swap behind parity test

- **Agent:** Cody
- **What:** `directory-facet-results.tsx` renders `MCard` instead of `FacetResultCard`; Playwright
  proof (desktop + 390px, dark/light, belt tint, two-brand token swap).
- **Done means:** roster grid renders name/rank-tint/trust/claim/location/view/save at parity.

### Open decisions

- Roster mapper binds from `DirectoryFacetResult` (the real, already-projected/gated surface DTO the
  facet grid feeds the card) rather than the raw `projectDirectoryProfileListItem` shape named in the
  spec wiring — the directory surface's gate output **is** `DirectoryFacetResult`. Noted in the mapper.

### Scope guard

- No Prisma/migrations. No new endpoints/queries. No redaction in the card or mapper.
- Roster kind only this slice; rank/task/loop + /me + /[slug] sidebars + lineage-node-card wrap
  deferred. Old cards (bjj-passport, listing) NOT deprecated yet (follow-up slice).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0430_TASK_01 | in-progress | m-card contract + component |
| SESSION_0430_TASK_02 | in-progress | map-roster mapper + tests |
| SESSION_0430_TASK_03 | in-progress | /directory swap + Playwright proof |
