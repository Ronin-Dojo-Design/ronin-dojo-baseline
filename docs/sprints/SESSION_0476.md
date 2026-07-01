---
title: "SESSION 0476 — Close the loops: push-triggers for the roster, the router, and the Kanban backlog"
slug: session-0476
type: session--implement
status: in-progress
created: 2026-06-30
updated: 2026-06-30
last_agent: claude-session-0474
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0475.md
  - docs/learning/ddd/learning-records/0007-the-discoverability-heuristic-and-built-not-pointed.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0476 — Close the loops: push-triggers for the roster, the router, and the Kanban backlog

> **PRE-STAGED at SESSION_0474's tail** from a 4-agent Petey audit of "are we set up to avoid rediscovery /
> is the agent + doc + Kanban infrastructure actually wired for bow-in, or is it doc-fluff nothing finds
> unless the operator points at it?" **Tier 1 fixes already landed this session** (learning-records + ADRs
> into the bow-in read-path; default Graphify query; LR index; ADR-table backfill). This session executes
> **Tier 2 + Tier 3** — the deeper wiring. Operator ratified the Kanban decision: **the board becomes the
> driver** (no open fork). Self-contained; the audit verdict + file targets are embedded below.

## Date

2026-06-30 (pre-staged; executes next)

## Operator

Brian + claude-session-0476

## Goal

Convert the repo's best **pull-artifacts into push-triggers** so a fresh agent — and the roster — get used
without the operator being the trigger. Root cause the audit found: only three things are mechanically
forced into a fresh session (`CLAUDE.md`, `MEMORY.md`, `ledger-backlog.ts`); everything else waits to be
pulled. Three lanes: **(1)** make the sub-agent roster real + auto-dispatched; **(2)** make the Kanban DB
board the live driver of session work (ratified); **(3)** promote the task→workflow router + allowed-vs-never
table to a named bow-in read so classify→dispatch is the default path.

## Status

Single source of truth is the frontmatter `status:` field.

## The audit verdict this session acts on (embedded — read once)

**Push vs pull.** Auto-pushed today (works): `CLAUDE.md`, `MEMORY.md`, and `scripts/ledger-backlog.ts`
(bow-in step 1b — the file-ledger backlog + open PRs, a genuine closed loop). Everything else is pull.

| Seam | State | This session |
| --- | --- | --- |
| CLAUDE.md + MEMORY.md + file-ledger backlog | ✅ wired (push) | leave |
| Learning records + recent ADRs in bow-in | ✅ **fixed Tier 1 (0474 tail)** | done |
| Default Graphify query | ✅ **fixed Tier 1** | done |
| **Sub-agent roster (Cody/Doug/Petey/Giddy)** | ❌ not wired — 4 of 5 aren't real agentTypes; zero `subagent_type:` dispatch anywhere; "default to Petey orchestration" is an aspiration | **TASK_01 + TASK_02** |
| **DB Kanban board (`/app/loop-board`)** | ❌ orphaned — insert-only, write-only; nothing reads `KanbanCard`; operator's drag-to-prioritize changes nothing | **TASK_03 (ratified: make it the driver)** |
| task→workflow router + allowed-vs-never table | ⚠️ pointer-only (buried in opening.md §4) | **TASK_04** |

## Bow-in

### Previous session

- Read `docs/sprints/SESSION_0475.md` (the lineage rank-display refinement — parallel lane) and this file's
  embedded verdict. The four audit outputs are summarized above; the fix targets are in each task below.
- **Read FIRST:** [LR 0007](../learning/ddd/learning-records/0007-the-discoverability-heuristic-and-built-not-pointed.md)
  ("built" isn't "pointed" — this session's whole thesis) and the [[readpath-push-vs-pull-audit]] memory.

### Branch and worktree

- Branch: `main` (or a `session-0476-close-loops` worktree). TASK_03 touches `apps/web` app code → the push
  fires CI + BBL prod deploy; run `cd apps/web && bun run build` + full `bun run test` before proposing it.
- Current HEAD at bow-in: (fill at pickup — 0474-tail Tier-1 commit).

## Petey plan

### Goal

Make orchestration and the backlog **self-triggering**: the roster dispatches from the plan, the board drives
the session, and the router is a named read — all provable (a real `Agent` dispatch fires; a reordered card
changes session order; bow-out shrinks the board).

### Tasks

#### SESSION_0476_TASK_01 — Make Cody / Doug / Petey real agentTypes

- **What:** Only `Desi` is a real `.claude/agents/*.md` agentType today; Petey/Cody/Doug/Giddy are prose
  personas in `docs/agents/*.md` — so "hand off to Cody" can only mean the lead swaps hats. Give the four a
  real agent config so they're dispatchable.
- **Steps:** for each of Petey/Cody/Doug (and Giddy if useful), add `.claude/agents/<name>.md` with
  `name`/`description`/`tools` frontmatter (model `desi.md` — the `docs/agents/<name>.md` prose is ~90% the
  body already; reuse it). Scope tools per role (Cody = full build tools; Doug = read/test/verify; Petey =
  read/plan, no writes). Fix the stale `docs/agents/README.md:49` claim that "Petey and Cody have dedicated
  role files" (true only once this task lands).
- **Done means:** `ls .claude/agents/` shows petey/cody/doug/desi(/giddy); each is invokable via the Agent
  tool `subagent_type`.
- **Depends on:** nothing.

#### SESSION_0476_TASK_02 — Make the planning flow END by dispatching (not describing)

- **What:** `docs/protocols/petey-plan.md` stops at a plan block with an "Agent assignments" table (`:78-84`)
  and the rule "Petey does not execute" (`:108`) — nothing consumes the table. Turn the assignment table into
  an actual dispatch.
- **Steps:** add a final petey-plan step: after the plan is approved, issue one `Agent(subagent_type:"Cody",…)`
  per build task (parallel when the plan's Parallelism section says disjoint), then `Agent(subagent_type:"Doug",…)`
  on the resulting diff. Wire the same into `.claude/skills/bow-in/SKILL.md` step 4 / `opening.md §4`: after
  classifying the task against the router, **auto-invoke the matched flow** (unclear/multi-part → Petey; clear
  build → Cody→Doug) instead of "act as" them. Keep the operator-gate (explicit push authorization) intact —
  dispatch builds/verifies, it does not push.
- **Done means:** running the planning flow on a real task spawns real Cody/Doug sub-agents; "default to Petey
  orchestration" is now a mechanism, not an aspiration. Prove it on one small task.
- **Depends on:** TASK_01 (the agents must exist to be dispatched).

#### SESSION_0476_TASK_03 — Make the Kanban DB board the DRIVER (operator-ratified)

- **What:** `KanbanCard` / `/app/loop-board` is a write-only, insert-only projection nothing reads back — the
  operator's drag-to-prioritize has zero effect on session work. Close both directions so the board drives.
- **Steps (app code — build gate applies):**
  1. **Inbound (board → bow-in):** add `scripts/board-backlog.ts` (or `ledger-backlog.ts --source=board`) that
     queries `db.kanbanCard.findMany({ where:{ stage:{ not:'done' } }, orderBy:[{stage},{order}] })` and prints
     the top-N open cards. Wire `opening.md` step 1b to run it so the operator's board ordering sets session
     candidate order. (Reuse the shared parser in `apps/web/lib/loop-board/ledger-parse.ts`.)
  2. **Task selection (backlog → next-block):** amend `docs/protocols/review-recommend.md` step 4 + `closing.md`
     §6.5 so the bow-out `Next session → First task` is seeded from the top-ranked open card/backlog item
     (unless the operator pinned a `/goal`). Today the next-block is authored from program-plan + boundary-registry
     only — structurally disconnected from the backlog.
  3. **Outbound (bow-out → board):** the insert-only importer never marks done. Add a bow-out step (extend the
     `closing.md` ledger cross-off sweep) that upserts each resolved card to `stage:'done'` by its stable
     `sourceRef` (e.g. `GL:G-003`, `WL-P2-19`) via `server/loop-board/board-store.ts`. May need a small
     `board-store` upsert-to-done helper; confirm no schema change (KanbanCard already has `stage`).
- **Done means:** reordering a card on `/app/loop-board` changes what bow-in surfaces first; a closed session
  visibly shrinks the board (cards flip to done); one live SoT instead of a growing board + a shrinking ledger.
- **Depends on:** nothing (disjoint from the roster lane — parallelizable). **Heaviest task; touches app code.**

#### SESSION_0476_TASK_04 — Promote the router + allowed-vs-never table to a named bow-in read

- **What:** The task→workflow router (`agent-systems-map.md §1`) + allowed-vs-never table are pointer-only
  (buried in `opening.md §4`; the allowed-vs-never table isn't even named in opening.md).
- **Steps:** in `opening.md` (step 2 or a one-liner in step 4) make an imperative named skim of
  `agent-systems-map.md §1` (router) + the allowed-vs-never table *before* planning — these are session-wide
  routing/boundary rules, not just skill-selection. Fold into TASK_02's classify→dispatch so the router is
  actually consumed, not just read.
- **Done means:** bow-in names + reads the router/table; classification drives dispatch.
- **Depends on:** overlaps TASK_02 (do together).

### Parallelism

- **TASK_01 → TASK_02 → TASK_04 are one sequential lane** (roster must exist → dispatch → router-wiring; all
  touch the planning/bow-in path).
- **TASK_03 (Kanban) is disjoint** → parallel. It's the only app-code task (build + full-test gate + deploy).

### Open decisions

- **None.** Kanban = **driver** (operator-ratified this session). Roster-real + dispatch + router-named are all
  ratified by the audit's accepted fixes. One impl detail (not a fork): whether board-backlog is a new script or
  a `--source` flag on `ledger-backlog.ts` — pick the smaller diff.

### Risks

- **Don't let auto-dispatch bypass the explicit-push rule.** Dispatch spawns build/verify sub-agents; the
  operator still authorizes every push/merge/deploy. Keep the gate.
- **TASK_03 reads the DB at bow-in** — the board-backlog script needs a reachable DB (local `ronindojo_prodsnap`
  or read-from-`main` like `sync.ts` does). Decide which; a fresh worktree may have no DB (bootstrap first).
- **Auto-dispatch can burn tokens** — cap fan-out to the plan's disjoint tasks; don't spawn a fleet for a
  one-file change (the existing "single coherent changes inline" rule in CLAUDE.md still holds).

### Scope guard

- Don't rewrite the ledger loop that already works (file-ledger backlog → bow-in → cross-off). Only add the
  board layer on top.
- Don't delete the persona prose in `docs/agents/*.md` — TASK_01 adds `.claude/agents/*` configs that reuse it.

## Cody pre-flight

<!-- cody-preflight.md before code. TASK_03 prior art: server/loop-board/{sync,board-store}.ts,
lib/loop-board/ledger-parse.ts, scripts/ledger-backlog.ts. Roster template: .claude/agents/desi.md. -->

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0476_TASK_01 | pending | Make Cody/Doug/Petey real `.claude/agents/*.md` agentTypes (+ fix README claim) |
| SESSION_0476_TASK_02 | pending | Planning flow ends by dispatching real Cody→Doug agents (bow-in classify→dispatch) |
| SESSION_0476_TASK_03 | pending | Kanban as DRIVER: board→bow-in read + next-block seeded from backlog + bow-out marks cards done |
| SESSION_0476_TASK_04 | pending | Router + allowed-vs-never table = named bow-in read, consumed by dispatch |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

- None at plan-lock.

## Next session

### Goal

TBD at bow-out.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence
