---
title: "SESSION 0497 — lineage/profile surface visibility + belt-save P2003 fix"
slug: session-0497
type: session--implement
status: in-progress
created: 2026-07-04
updated: 2026-07-04
last_agent: claude-session-0497
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0496.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0497 — lineage/profile surface visibility + belt-save P2003 fix

## Date

2026-07-04

## Operator

Brian + claude-session-0497

## Goal

Operator-directed lane (repointed off the "Epic A A0 story model" Next block, which is claimed by
0496-on-Opus). Three coherent items on the lineage/profile surface: (1) fix the live "Could not save
your belt details" bug; (2) resolve operator confusion about the "vertical timeline" — prove it's
already shipped + visible on the directory profile page (no data/code gap); (3) add a "View full
profile" link inside `LineageProfileDrawer` (the discoverability gap that made the timeline feel
missing). Scrollytelling (A0/A2) explicitly deferred to 0496 to avoid collision.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0496.md`
- Carryover: 0496 shipped Epic A opener (StudentsCarousel V2) + BrandSettings prod fix. Its Next block
  (Epic A A0 `LineageStoryScene`) is live on Opus — NOT re-picked. Operator repointed this session to
  the belt bug + lineage/profile surface visibility.

### Branch and worktree

- Branch: `session-0497-lineage-surfaces`
- Worktree: `/Users/brianscott/dev/ronin-0497` (fresh, bootstrapped via `/worktree-setup`)
- Status at bow-in: clean (canonical `main` had only untracked `prod-live-dirty-dozen.jpeg`)
- Current HEAD at bow-in: `789a8664`

### Graphify check

- Graph status: current; stats 16224 nodes / 31939 edges / 2195 communities / 2452 files (canonical).
- Discovery via 2 read-only roster agents (Giddy = lineage/Epic-A wiring audit; Doug = belt-save
  diagnosis) + a read-only prod/prodsnap ancestry-visibility diagnostic.

### Grill outcome

- The "vertical timeline" the operator couldn't find = `LineageAncestryTimeline`, already shipped
  (0493) + mounted on `/directory/[slug]`, PUBLIC, **data-gated** (needs a PUBLIC lineage node + a
  PUBLIC `INSTRUCTOR_STUDENT` up-edge, chain ≥ 2). Verified LIVE on prod for `tony-hua` + `brian-scott`
  (chain length 5) — NOT a data gap. Root of "can't see it" = discoverability (no drawer→profile link).
- "Continue Epic A vertical timeline" ≠ build `LineageStoryScene` (that's 0496). This session = make the
  EXISTING timeline reachable + fix the belt bug.

## Petey plan

### Goal

Fix the belt-save P2003, prove + wire the already-shipped ancestry timeline, add the drawer profile link.

### Tasks

#### SESSION_0497_TASK_01 — Fix "Could not save your belt details" (P2003)

- **Agent:** Cody (inline)
- **What:** The promoter picker fed **LineageNode ids** into the **Passport**-keyed `awardedByPassportId`
  FK → P2003 → swallowed by a bare `catch {}`. Registered-instructor branch had zero coverage.
- **Steps:** key the belt promoter picker by Passport id (`getBeltPromoterOptions`, belt-tab-loader);
  handler verifies promoter Passport + school Org exist → `BAD_REQUEST` not P2003; `toBeltCard` resolves
  a registered promoter's name; surface the real oRPC error in the client catch; +2 integration tests.
- **Done means:** registered-instructor save persists + shows the name; invalid id → BAD_REQUEST; gates green.
- **Depends on:** nothing

#### SESSION_0497_TASK_02 — Prove the vertical timeline is live (visibility, no writes)

- **Agent:** Petey/Doug (read-only)
- **What:** Diagnose why the operator can't see the ancestry timeline. Confirmed it renders LIVE on prod
  for tony-hua + brian-scott — a discoverability gap, not data/code. No prod writes.
- **Done means:** screenshot + prod SSR confirmation delivered to operator; risky data-publish avoided.
- **Depends on:** nothing

#### SESSION_0497_TASK_03 — LineageProfileDrawer "View full profile" link

- **Agent:** Cody (inline)
- **What:** Add a guarded "View full profile →" link to `/directory/[slug]` in the drawer footer
  (gated PUBLIC-visibility + slug present; zero payload change — slug already on the drawer payload).
- **Done means:** link renders for public profiles, suppressed for MEMBERS_ONLY/HIDDEN; gates green.
- **Depends on:** nothing

### Parallelism

Tasks 1 + 3 are disjoint file sets but built inline sequentially (one worktree, no sub-agent tree
conflict). Task 2 is read-only, done first (de-risked Task 2's prod-data work to zero).

### Scope guard

- NO scrollytelling `LineageStoryScene` / A0 / A2 (0496 lane).
- NO prod lineage-data writes (timeline is already live).
- Registered-promoter card display was pre-existing-broken; fixed as part of Task 1, but no broader
  belt read-model refactor.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0497_TASK_01 | landed | Belt-save P2003 fixed (passport-keyed picker + handler guards + name resolution + catch); 19/19 belt integ tests green |
| SESSION_0497_TASK_02 | landed | Timeline proven LIVE on prod (tony-hua + brian-scott, chain 5) — discoverability gap, no writes |
| SESSION_0497_TASK_03 | landed | Drawer "View full profile" link (PUBLIC-gated); typecheck/lint/fmt green |

## Next session

### Goal

TBD at bow-out.

### First task

TBD at bow-out.
