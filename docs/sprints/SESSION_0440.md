---
title: "SESSION 0440 — Full A: pending- + claimed-aware claim-path UI gating (shared resolver)"
slug: session-0440
type: session--open
status: in-progress
created: 2026-06-23
updated: 2026-06-23
last_agent: claude-session-0440
sprint: S44
pairs_with:

  - docs/sprints/SESSION_0439.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0440 — Full A: pending- + claimed-aware claim-path UI gating (shared resolver)

## Date

2026-06-23

## Operator

Brian + claude-session-0440 (Petey)

## Goal

Build **Full A**: a single shared `resolveViewerClaimState` resolver in the passport/claim server
layer, consumed by BOTH the lineage-drawer loader and the directory loader, rendering a 5-state CTA
machine (`UNCLAIMED | PENDING_MINE | CLAIMED_MINE | CLAIMED_OTHER`) on both surfaces. Fixes the ghost
"Claim" button on already-claimed lineage nodes. Green `main` first (oxfmt + claim e2e to the unified
`PassportClaimRequest` shape). Then HOLD — Brian Truelson's real claim invite is gated until Full A is
deployed + verified.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0439.md`
- Carryover: 0439 pushed P5 + the directory-profile Save fix to prod, ran the real prod backfill
  (Tony Hua's APPROVED claim migrated to `PassportClaimRequest`, idempotent), proved Brian's claim
  click chain on prod, and grilled Full A to mutual understanding. This session executes that grilled
  plan and greens `main` (left RED by 0439: oxfmt + the claim e2e shape).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `74743b56`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth (claim identity surfaces) — read-only state derivation, no auth-flow change |
| Extension or replacement | Extension: adds a viewer-aware read model on top of the existing claim server layer; no new schema |
| Why justified | The 3 claim doors already converge on `PassportClaimRequest`; only the UI lacked awareness |
| Risk if bypassed | Ghost "Claim" button on claimed nodes errors on click; duplicate-claim friction for pending claimants |

Live docs checked during planning: not applicable (on-the-wire-only; no Prisma/schema change).

### Graphify check

- Skipped — files pre-resolved in the 0439 grill; no repo-wide search needed. Verified each path by
  direct source inspection (see Petey plan).

### Grill outcome

- Scope was grilled to mutual understanding in SESSION_0439. Carried forward verbatim as the Petey
  plan below. One open recommendation surfaced this session: the **C follow-up** (instant self-claims
  for the non-email doors) — recommend DEFER (see Open decisions).

### Drift logged

- D-029 (candidate): the lineage drawer-profile payload (`lineageNodeProfilePayload.claimRequests`)
  still selects the LEGACY `LineageClaimRequest[]` node relation, which is no longer written
  post-P5 — effectively dead select. Not gating any UI. Note for the Step-4 legacy drop.

## Petey plan

### Goal

Single shared claim-state resolver + 5-state CTA gating on both claim surfaces, green `main`, HELD on
Brian's send until deployed + verified.

### Tasks

| ID | Title | Owner | Done means |
| --- | --- | --- | --- |
| SESSION_0440_TASK_01 | Green `main`: oxfmt + claim e2e shape | Cody | oxfmt clean repo-wide; e2e helper reads `PassportClaimRequest`; auth-lifecycle assertions pass |
| SESSION_0440_TASK_02 | `resolveViewerClaimState` + batch sibling, unit-tested | Cody | Pure resolver returns the 4-state enum for all paths; unit tests cover all 5 rows; batch variant shares the core |
| SESSION_0440_TASK_03 | Thread state + render 5-state machine on lineage drawer | Cody | Drawer consumes `viewerClaimState`; ghost-claim bug fixed; logged-out → funnel |
| SESSION_0440_TASK_04 | Thread state + render 5-state machine on directory profile | Cody | Directory teaser/hero consume state; pending-aware + "yours" CTA |
| SESSION_0440_TASK_05 | One gating e2e: claimed-state hides drawer CTA | Doug | e2e asserts no Claim CTA on a claimed node |
| SESSION_0440_TASK_06 | Verify (typecheck/oxlint/oxfmt/unit/e2e) + fallow delta | Doug | All gates green; CRAP not worse on touched files |
| SESSION_0440_TASK_07 | HOLD → on operator go: Brian `--send`, then `--grant` | Petey | Deferred; gated on Full A deployed + verified |

### Parallelism

Mostly sequential (shared resolver underpins both surfaces). TASK_03 and TASK_04 are disjoint once
TASK_02 lands and could parallelize, but they are small — done inline.

### Agent assignments

Petey (orchestrate) → Cody (TASK_01–04 build) → Doug (TASK_05–06 verify). Inline; no sub-agents.

### Open decisions

- **C follow-up (operator-flagged):** should the lineage-drawer + directory doors grant INSTANT
  self-claims (like the emailed magic link) instead of admin-review PENDING?
  **Recommendation: DEFER / NO for Full A.** The email path is instant because possession of the
  invited email is identity proof (the email→node binding). Paths 2 & 3 carry NO proof — a stranger
  could seize any unclaimed founder identity. Keep them admin-review PENDING. A future instant path
  should be gated on a real proof (verified-email match to a recorded node/passport email), not on
  "the claimant asserts it's them." Moot for Brian (binding = instant).
- **CLAIMED_MINE manage destination:** link to `/app/profile` (canonical edit-my-profile route).

### Risks

- Complexity creep on `DrawerBody` / `DirectoryProfile` (both CRAP=72, high at baseline) — mitigate by
  keeping the resolver pure + rendering via a tiny presentational helper, not inline conditionals.
- Per-tree N-passport resolution — use a single batched query (well-indexed `[passportId, status]` +
  `[claimantUserId, status]`), not N calls.

### Scope guard

In: the resolver, the two loaders threading it, the two surfaces' CTA rendering, unit + e2e tests, and
greening `main`. Out: the Step-4 legacy `LineageClaimRequest` drop, the C instant-self-claim build,
prod creds rotation, and Brian's actual send (HELD).

## Task log

| ID | Status | Notes |
| --- | --- | --- |
| SESSION_0440_TASK_01 | in-progress | oxfmt applied to 2 files locally (lineage-avatar-action.tsx, bbl-truelson-holding-note.tsx); e2e helper repoint pending |
| SESSION_0440_TASK_02 | todo | |
| SESSION_0440_TASK_03 | todo | |
| SESSION_0440_TASK_04 | todo | |
| SESSION_0440_TASK_05 | todo | |
| SESSION_0440_TASK_06 | todo | |
| SESSION_0440_TASK_07 | todo (HELD) | gated on operator go after deploy + verify |

## What landed

Full A built + locally verified (HELD at push/deploy per operator's explicit-push rule):

- New shared resolver `server/web/claims/resolve-viewer-claim-state.ts` — pure
  `deriveClaimViewerState` (the 5-row machine) + `resolveViewerClaimStates` (batch, 2 indexed
  queries) + `resolveViewerClaimState` (single wrapper). Both claim surfaces consume it.
- Lineage drawer: CTA extracted to a `ClaimCta` helper driven by the state machine; ghost
  Claim button on claimed nodes fixed (threaded via page loader → island/board → drawer; the
  card-menu Claim item is gated too). Fallback off `profile.passport.user` kills the ghost
  button even for un-threaded callers (editor/galaxy).
- Directory profile: teaser is pending-aware (PENDING_MINE → "Claim pending review"); HeroActions
  shows "This profile is yours →" (→ /app/profile) for CLAIMED_MINE.
- Green main: oxfmt fixed (2 files); e2e helper repointed to `PassportClaimRequest` + a new
  gating assertion (claimed node hides the Claim CTA).

## Decisions resolved

- C follow-up (instant self-claims for the non-email doors): **DEFER** — no identity proof on
  doors 2 & 3, so instant would let a stranger seize an unclaimed identity. Keep admin-review.
- CLAIMED_MINE manage link → `/app/profile`.

## Files touched

| File | Change |
| --- | --- |
| `server/web/claims/resolve-viewer-claim-state.ts` | NEW — shared resolver (pure + batch + single) |
| `server/web/claims/resolve-viewer-claim-state.test.ts` | NEW — 13 tests (8 pure machine + 5 integration) |
| `app/(web)/lineage/[treeSlug]/page.tsx` | batch-resolve claim state per visible node; thread to island + board |
| `components/web/lineage/lineage-view-a-island.tsx` | `claimStateByNodeId` prop → drawer; gate card-menu Claim item |
| `components/web/lineage/lineage-tree-board.tsx` | `claimStateByNodeId` prop → drawer |
| `components/web/lineage/lineage-profile-drawer/index.tsx` | `ClaimCta` helper + `effectiveClaimState` fallback; `viewerClaimState` prop |
| `components/web/lineage/lineage-profile-drawer/drawer-types.ts` | `viewerClaimState?` on props |
| `components/web/lineage/lineage-profile-drawer/drawer-header.tsx` | suppress the "Claimable" header badge on a claimed node (browser-review finding; D-029 root cause) |
| `app/(web)/directory/[slug]/_components/directory-profile/directory-profile-data.ts` | resolve viewer claim state in loader |
| `app/(web)/directory/[slug]/_components/directory-profile/index.tsx` | thread state to teaser + HeroActions |
| `app/(web)/directory/[slug]/_components/directory-profile/hero-actions.tsx` | CLAIMED_MINE "This profile is yours" CTA |
| `components/web/claims/profile-claim-teaser.tsx` | pending-aware (PENDING_MINE) |
| `e2e/helpers/seed-lineage-lifecycle-db.ts` | read/clean `PassportClaimRequest` (was `lineageClaimRequest`) |
| `e2e/lineage/authenticated-lifecycle.spec.ts` | +gating assertion (claimed node hides Claim CTA) |
| `app/admin/lineage/_components/lineage-avatar-action.tsx`, `emails/bbl-truelson-holding-note.tsx` | oxfmt (green main) |
| `docs/sprints/SESSION_0440.md` | this session file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | green |
| `oxfmt --check .` (repo-wide CI gate) | clean (greens the RED main) |
| `oxlint server components app` | no errors (pre-existing warnings only; none in touched files) |
| `bun test server/web/claims/resolve-viewer-claim-state.test.ts` | 13 pass / 0 fail |
| `bun test server/web/claims/` | 23 pass / 0 fail |
| `playwright authenticated-lifecycle.spec.ts --project=chromium` | 5 pass (3.6m) — greens RED e2e + proves claimed-state gating |
| fallow health | 62.4 C → 62.4 C (unchanged); DrawerBody improved, DirectoryProfile flat |
| Full `bun test` | NOT run (fires real Resend emails — known landmine; ran touched-area suites only) |

## Open decisions / blockers

- Brian's real `--send` + `--grant` HELD until Full A deployed + verified (hard gate).
- C follow-up recommendation pending operator decision (recommend DEFER).

## Next session

### Goal

<!-- filled at bow-out -->

### First task

<!-- filled at bow-out -->

## Review log

<!-- filled at bow-out -->

## ADR / ubiquitous-language check

- ADR 0036 (unified Passport-keyed claim) is the governing decision; this session adds a read model
  consistent with it. No new ADR expected unless the C follow-up is approved.

## Reflections

<!-- filled at bow-out -->

## Full close evidence

<!-- filled at bow-out -->
