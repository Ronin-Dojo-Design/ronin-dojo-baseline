---
title: "SESSION 0737 — D-062 burndown: belt/lineage polish (dup memberTopRank, drawer test/dead-export, :117 cast + enum-mirror)"
slug: session-0737
type: session--open
status: staged
created: 2026-08-02
updated: 2026-08-02
last_agent: claude-session-0736
sprint: S13
lane: bbl
recipe: "fallow-fix-loop"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0736.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0737 — D-062 burndown: belt/lineage polish

**Date:** <YYYY-MM-DD> · **Operator:** Brian + <agent>-session-0737

## Goal

Burn down the remaining (behavior-preserving) D-062 findings now that the billing-fragile item is
fixed (SESSION_0736 / PR #405): the two-export `memberTopRank` name collision, the `use-drawer-profile`
metric-artifact (colocated test + drop redundant `?.` on the non-null `passport` + un-export the dead
`rankProgressPercent`), the stale `drawer-types.ts:9-10` nullability comment, and the `:117`
`WidenedSystemRank` hand-rolled cast + its **F2 money-stakes enum-mirror** (derive the widened type
from the payload + add a compile-time `Equals<local, Prisma.BeltFamily>` assertion). WL-P2-83 (prod
`beltFamily` coverage proof) stays a separate pre-FI-001-send launch gate, NOT this lane.

## Status

Frontmatter `status:` is the single source of truth (staged → in-progress at bow-in).

## Bow-in

- Previous session: `docs/sprints/SESSION_0736.md` — fixed the D-062 billing-regex; this lane clears the rest.
- Read first: `docs/knowledge/wiki/drift-register.md` §D-062 (the open items list) + the frozen-seam note.

## Petey plan

### Tasks

#### SESSION_0737_TASK_01 — D-062 remaining behavior-preserving cleanups

- **Agent:** Cody · **Depends on:** nothing (all behavior-preserving; verify against the frozen seam)
- **What / steps:** rename one `memberTopRank` (→ `memberTopRankView` per D-062); add the
  `use-drawer-profile` colocated test + drop the redundant `?.` on the required `passport` + un-export
  `rankProgressPercent`; fix the `drawer-types.ts` stale comment; derive `WidenedSystemRank` from the
  payload and add the `BeltFamily` mirror-drift assertion (F2).
- **Done means:** each D-062 open item flipped to ✅ in the drift register; gates green; no rank-read/
  display or frozen RankAward/#380 write-seam change.

### Scope guard

Behavior-preserving only. NO frozen RankAward/#380 write-seam change; WL-P2-83 (prod data coverage) is
a separate launch gate, not this lane.

## Next session

- **Goal:** TBD at bow-out.
- **First task:** TBD.
- **Kickoff prompt:** n/a — staged stub; hydrate at bow-in.
