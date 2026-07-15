---
title: "SESSION 0540 — belt-lane cleanup + design pass, then FI-006 claim→award rank lifecycle (plan-first)"
slug: session-0540
type: session--open
status: in-progress
created: 2026-07-15
updated: 2026-07-15
last_agent: claude-session-0540
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0539.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0540 — belt-lane cleanup + design pass, then FI-006 claim→award rank lifecycle (plan-first)

## Date

2026-07-15

## Operator

Brian + claude-session-0540

## Goal

Tidy + harden the belt lane (the SESSION_0539 belt-rendering redesign that landed as PR #208): run the
review loops (`/fallow-fix-loop` + `/code-quality` on `belt-swatch.tsx`), apply the deferred hostile-close
follow-ups (WL-P3-41/42/43 · D-044 · F04 dead-branch · FI-006 board badge), then a design pass (spacing,
rhythm, type sizing, layout & flow) across the belt-bearing surfaces with before/after `/preview-artifacts`
proof — and finally begin **FI-006** (the claim→award rank lifecycle) on the structured rank data 0539
shipped, plan-first with an operator grill on the open forks.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0539.md` (belt-rendering redesign + `Rank` belt-family/degree
  data foundation; landed as PR #208).
- Carryover: 0539 shipped the operator-locked `BeltSwatch` `belt` variant + additive `beltFamily`/`degree`
  data + ~14-surface consolidation, and **deferred** its review loops, hostile-close fixes, design pass, and
  the FI-006 lifecycle to this session (its `Next session` block = this session's task list).

### PR #208 state (Task 1 correction)

- **PR #208 (`session-0539-fi006-belts`) is ALREADY MERGED** — merged 2026-07-15T16:22:24Z; it is the HEAD
  of `origin/main` (`819a7fed`). **Zero open PRs** in the repo. 0539 pushed it merge-HELD; it was merged
  before this session opened. Task 1 (`/pr-review-fix` + hold-merge) is therefore moot — the belt code is
  reviewed instead by Tasks 2/4/5 (the fallow loop + code-quality + design pass exercise the same diff).

### Branch and worktree

- Branch: `session-0540-belt-fi006`
- Worktree: `/Users/brianscott/dev/ronin-0540` (fresh, off `origin/main`; bootstrapped via `/worktree-setup`)
- Status at bow-in: clean (SESSION_0540.md is the only new file)
- Current HEAD at bow-in: `819a7fed` (the #208 belt merge)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming/UI (`BeltSwatch` — ADR 0026 data-driven belt colors); Prisma (`Rank`/`RankEntry` — FI-006 rank lifecycle). |
| Extension or replacement | Extension: cleanup + design refinement of the existing app-custom `BeltSwatch`; FI-006 extends the existing claim (ADR 0036) + rank (RankEntry) models. |
| Why justified | Behavior-preserving tidy of a landed lane + a claim→award flow on already-shipped rank data — no new capability, no replacement. |
| Risk if bypassed | Logged tidy debt (WL/D rows) rots; FI-006 lifecycle re-derived from scratch instead of the 0539 rank foundation. |

Live docs checked during planning: Theming (ADR 0026 + design-system doctrine), Prisma (RankEntry migration state).

### Grill outcome

**FI-006 was a PHANTOM LANE — the claim→award lifecycle is already shipped + SOT-resolved** (the
SESSION_0500 phantom-lane trap; 0539 propagated a stale "FI-006 next" framing without re-verifying
`main`). Proof: `PassportClaimRequest.claimedRankId` (schema:3039 "@added SESSION_0432 FI-006") +
`claim-finalize.ts:221` `mintAssertedRankAward` (VERIFIED RankAward + `syncRankEntryFromAward`) +
`POST_LAUNCH_SOT.md:75` "resolved (SESSION_0500 — verified already-done)… No work needed." The board's
`in-progress` badge is stale (0500 called `markCardDone`; it didn't stick).

**Operator repoint (grill answer):** FI-006 slot → **make the member-facing claim/registration rank
picker render the rich 0539 `BeltSwatch variant="belt"` (bars/degrees) instead of the plain color dot.**
Scope confirmed = the claim funnel picker, NOT the admin editor. This is a small, contained RENDER SWAP:
the query already carries the belt-render fields (`getBjjRanksForClaimPicker` selects
`beltFamily`/`degree`/`secondaryColorHex`, 0539); only `claim-form.tsx:209-214` (the `h-3 w-3` color
chip) needs to become `<BeltSwatch variant="belt" {...belt} size="sm" />`. Touches the moat's claim
loop → before/after `/preview-artifacts` + Desi + operator sign-off before ship. **Merges with the
design pass (TASK_04) into one design-driven lane.**

Second decision: the operator-locked belt geometry is **back in play** for the design pass (the cleanup
TASK_02/03 stays behavior-preserving; only the design pass may propose geometry changes, via artifact).

## Petey plan

### Goal

Behavior-preserving belt-lane cleanup + a proven design pass, then a plan-first start on FI-006.

### Tasks

#### SESSION_0540_TASK_01 — PR #208 verdict (moot — already merged)

- **Agent:** Petey
- **What:** Confirm #208 merged; fold its review into Tasks 02/04/05 rather than a formal `/pr-review-fix`.
- **Done means:** Verdict recorded (this file, "PR #208 state") + operator informed.
- **Depends on:** nothing

#### SESSION_0540_TASK_02 — `/fallow-fix-loop` + `/code-quality` on `belt-swatch.tsx`

- **Agent:** Cody (build) → Doug (re-verify behavior + fallow delta)
- **What:** Run the fallow loop on the belt diff (CRAP/dupes/dead-code/complexity), then `/code-quality` on
  the Class-A `belt-swatch.tsx`; apply behavior-preserving fixes; prove fallow deltas DOWN.
- **Done means:** fallow before/after deltas recorded; `/code-quality` /10 + fixes; 0 behavior change (unit + live).
- **Depends on:** nothing

#### SESSION_0540_TASK_03 — Deferred hostile-close follow-ups (WL-P3-41/42/43 · D-044 · F04 · FI-006 badge)

- **Agent:** Cody
- **What:** WL-P3-41 (beltless fallback → explicit neutral fill, `belt-swatch.tsx:160`); WL-P3-42 (grouped
  `belt: BeltRenderData` idiom on ~8 enumerating projections); WL-P3-43 (`organizations-section.tsx:21`
  duplicate-`key`); D-044 (repo-wide ADR 0022→0026 belt-color citation fix); F04 (`BAR_NEUTRAL` dead branch);
  FI-006 board-badge correction (FINDING_02).
- **Done means:** each ledger row flipped to resolved w/ commit evidence; live re-verify unchanged.
- **Depends on:** TASK_02 (same file — sequence to avoid churn)

#### SESSION_0540_TASK_04 — Design pass across belt surfaces (spacing/rhythm/type/layout/flow)

- **Agent:** Desi (review) → Cody (apply) → Desi re-verify
- **What:** Design pass on the belt-bearing surfaces; before/after via `/preview-artifacts` (published HTML
  artifact — the proven operator-review channel, per the 0539 reflection). Prove the visual improvement.
- **Done means:** published before/after artifact link; operator sign-off on the visual delta.
- **Depends on:** TASK_02/03 (clean base)

#### SESSION_0540_TASK_05 — FI-006 rich claim-picker belt render (REPOINTED — lifecycle already shipped)

- **Agent:** Desi (mock review) → Cody (wire) → Doug verify
- **What:** the claim→award lifecycle is DONE (grill outcome above). Repointed slot = swap the claim/
  registration rank picker's plain color chip (`claim-form.tsx:209-214`) for `<BeltSwatch variant="belt"
  {...belt} size="sm" />`. Query already carries the belt-render fields (0539). Merges with TASK_04 as one
  design-driven lane, reviewed via before/after `/preview-artifacts` + operator sign-off before wire.
- **Done means:** before/after artifact signed off; picker renders rich belts; claim flow behavior unchanged
  (still writes `claimedRankId`); Doug-verified live.
- **Depends on:** TASK_02/03 (WL-P3-42 grouped `BeltRenderData`) + operator artifact sign-off

### Parallelism

Tasks 02→03 sequential (same file). 04 after 03 (clean base). 05 gated on the operator grill. FI-006 touches
rank/claim/award surfaces adjacent to live siblings (G-002 shared-DB, belt-verify history) — coordinate/flag
before touching a file a live lane owns; belt-swatch + belt surfaces are this session's.

### Open decisions

- Task 1 moot (#208 merged) — fold review into 02/04/05? (Petey recommendation: yes.)
- FI-006 open forks (grill) — claim model, rank-entity choice mid-migration, picker home. To operator before build.

### Scope guard

- No FI-006 build before the grill sign-off. No push before the operator's explicit "go" (build → verify →
  show → HOLD). `../ronin-dojo-monorepo` READ-ONLY. FI-001 / Brian Truelson email STAYS PARKED. Preserve
  no-leak invariants on any touched claim/profile surface.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0540_TASK_01 | landed | PR #208 verdict: already merged; review folded into 02/04/05 |
| SESSION_0540_TASK_02 | pending | fallow-fix-loop + code-quality on belt-swatch.tsx |
| SESSION_0540_TASK_03 | pending | deferred hostile-close follow-ups (WL/D + F04 + badge) |
| SESSION_0540_TASK_04 | pending | design pass across belt surfaces (before/after artifact) — geometry in play |
| SESSION_0540_TASK_05 | pending | FI-006 REPOINTED: rich claim-picker belt render (lifecycle already shipped) — merges w/ TASK_04 |

## Next session

### Goal

<Filled at bow-out.>

### First task

<Filled at bow-out.>
