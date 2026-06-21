---
title: "SESSION 0430 — m-card (PWCC-002) smallest slice: kind=roster on /directory"
slug: session-0430
type: session--implement
status: closed
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
| SESSION_0430_TASK_01 | landed | m-card contract + component (`lib/m-card/types.ts`, `components/web/m-card/m-card.tsx`) |
| SESSION_0430_TASK_02 | landed | map-roster mapper + bun tests (`lib/m-card/map-roster.ts`, 4 pass — shape + no-leak) |
| SESSION_0430_TASK_03 | landed | /directory people-facet swap + Playwright proof spec (`e2e/directory/m-card-roster.spec.ts`) |

## What landed

- **m-card roster slice (PWCC-002):** one content-/brand-agnostic card on the Dirstarter `Card`
  base; token-only theming (data-driven rank `colorHex` → `--color-primary` accent fallback,
  dark/light). `kind`→DTO contract as a discriminated union; roster fully bound, rank/task/loop
  share a minimal skeleton for follow-ups.
- **map-roster:** pure mapper from the gated `DirectoryFacetResult` → `MCardData["roster"]`; fixed
  public allowlist (no passthrough). Person gi-silhouette fallback surface-injected, not in the card.
- **/directory swap:** people facet renders `MCard(kind=roster)` in place of `FacetResultCard`;
  href + persisted Save passed as structural props/actions. `FacetResultCard` retained (still used
  by `school-card.tsx` + `listing-hero-avatar.tsx`) — no deprecation this slice.
- **PR #149** (draft) opened against `main`.

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test lib/m-card/` | 4 pass, 0 fail (shape + surface-injected fallback + no-rank fallback + no-leak allowlist) |
| `bunx oxlint` (new + changed files) | 0 errors |
| `bunx oxfmt --check` | clean (after fmt) |
| `bun run wiki:lint` | 0 errors, 14 warnings (pre-existing in `SESSION_VIDEO_R001.md`) |
| `tsc` / `next build` / Playwright | not run in-container (no `node_modules` in web session — same as SESSION_0429); types reviewed by hand; full gate runs on CI |

## Open decisions / blockers

- **Follow-up slices (separate PRs):** rank/task/loop kinds + mappers; `/me` + `/directory/[slug]`
  sidebars (BjjPassportCard → m-card); wrap `lineage-node-card`; deprecate `bjj-passport-card` +
  `listing-card` as re-exports for one release.
- PR #149 is draft — CI to confirm the full typecheck/Playwright gate green. Not blocked on user.
