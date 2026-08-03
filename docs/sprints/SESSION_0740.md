---
title: "SESSION 0740 — #380 PR1: RankAward-drop expand+backfill (attended execution lane)"
slug: session-0740
type: session--open
status: staged
created: 2026-08-03
updated: 2026-08-03
last_agent: claude-fable-session-0739
sprint: S13
lane: bbl
lane_seq:
recipe: seq-lane-build
vault_session:
goal_ids: [G-011]
tickets: ["380"]
next_session:
pairs_with:

  - docs/sprints/SESSION_0739.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0740 — #380 PR1: RankAward-drop expand+backfill (attended execution lane)

**Date:** TBD · **Operator:** Brian + <agent>-session-0740

## Goal

Execute STAGE 1 of the ratified #380 plan
([`380-rankaward-drop-plan.md`](../product/black-belt-legacy/380-rankaward-drop-plan.md) §4-PR1):
the additive expand + idempotent backfill migration — reversible, no destructive step, no writer
cutover. Done = PR1 merged, V1–V6 green against live prod, numbers recorded here.

## Status

Frontmatter `status:` is the single source of truth (`in-progress` → `closed`, SESSION_0342). Do not restate it here.

## Bow-in

<!-- ADR 0049 staged stub — the adopting session flips status to in-progress and fills from here.
The full kickoff prompt lives in SESSION_0739 ## Next session (PROMPT_TEMPLATE-filled). -->

- Previous session: `docs/sprints/SESSION_0739.md` — ratified the #380 plan + landed the no-sync
  writer sweep (PR #411); this session executes PR1.
- Branch/worktree: `session-0740-380-pr1-expand` @ canonical (guard first) · HEAD: TBD
- Parallel-lane assessment (opening.md 1d): TBD
- On-demand blocks pulled: TBD

## Petey plan

### Tasks

#### SESSION_0740_TASK_01 — prodsnap refresh + shadow-replay

- **Agent:** Petey + Doug · **Depends on:** PR #411 merged
- **What / steps:** refresh `ronindojo_prodsnap`; shadow-replay the hand-authored PR1 migration on
  the refreshed snapshot + `ronindojo_shadow`. Override BOTH `DATABASE_URL` and `DIRECT_URL` for
  any non-default target (SESSION_0739 near-miss).
- **Done means:** replay clean on both; row counts recorded.

#### SESSION_0740_TASK_02 — prod preflight P1/P3/P4/P5 (read-only)

- **Agent:** Petey (operator readout) · **Depends on:** TASK_01
- **What / steps:** `SELECT current_database()` first; run P1/P3/P4/P5 from plan §6 against live
  prod, read-only.
- **Done means:** numbers in this file; P4/P5 = 0 or operator-ratified.

#### SESSION_0740_TASK_03 — author + land PR1

- **Agent:** Cody (inline) → Giddy (SQL vs plan §4-PR1) → Doug (post-merge V1–V6) · **Depends on:** TASK_02
- **What / steps:** hand-author `expand_rank_entry_facts` (A1–A5, B0–B2) + schema.prisma additive
  block + PR1 JETTY annotations; inverse SQL in the PR body; gates; HOLD for the word; post-merge
  V1–V6 vs prod.
- **Done means:** PR1 merged on the operator's word; V1–V6 at expected values, recorded.

### Parallelism

Sequential single lane — a migration lane never fans out.

### Open decisions / risks

- P4 (`mediaUrls` populated rows) and P5 (GamificationEvent FK rows) non-zero → operator call.
- Prodsnap staleness caveat (plan §0) — all binding numbers come from live prod.

### Scope guard

PR1 ONLY: no writer/reader code changes (PR2), no destructive step (PR3), no fork re-opens.
Frozen: all app code; findings route to the plan's PR2/PR3 sections or ledger rows.

## Cody pre-flight

TBD at adoption (migration authoring = code; run cody-preflight §0 arch-gate against plan §4-PR1).

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0740_TASK_01 | pending | |
| SESSION_0740_TASK_02 | pending | |
| SESSION_0740_TASK_03 | pending | |

**Decisions resolved:**

## Verification

| Command / smoke | Result |
| --- | --- |
| | |

## Artifacts

| Artifact | Purpose | Status |
| --- | --- | --- |
| None. | | |

## Open decisions / blockers

None yet.

## Next session

- **Goal:**
- **First task:**
- **Kickoff prompt:**

## Close evidence

**/ggr composite:** · **Caps applied:**
**Systemic health:** CI = · findings routed · FS patterns:
**Reviewer verdicts:** Giddy · Doug · Desi
**Findings ≥ medium:**
**ADR / ubiquitous-language check:**

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | |
| Wiki lint | |
| Reflections routing receipt | |
| Code-quality gate (Class-A) | |
| Runtime verification (Doug) + artifact URL | |
| Deferral guard (§6.8) | |
| Memory sweep · next-session unblock | |
| Git hygiene · Graphify update | |

## Reflections

- 
