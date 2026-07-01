---
title: "ADR 0041 — Agent roster as a dispatch layer + the Kanban board as the session driver"
slug: adr-0041-agent-roster-dispatch-and-kanban-as-session-driver
type: decision
status: accepted
created: 2026-06-30
updated: 2026-06-30
last_agent: claude-session-0476
deciders: Brian Scott
pairs_with:
  - docs/protocols/loop-of-loops-ledger-driven-sessions.md
  - docs/knowledge/wiki/agent-systems-map.md
  - docs/protocols/petey-plan.md
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/learning/ddd/learning-records/0007-the-discoverability-heuristic-and-built-not-pointed.md
  - docs/architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - architecture
  - orchestration
  - agent-systems
  - discoverability
  - loop-of-loops
---

# ADR 0041 — Agent roster as a dispatch layer + the Kanban board as the session driver

## Status

**Accepted** — 2026-06-30 (SESSION_0476).

Ratifies the Tier-2/Tier-3 fixes from the SESSION_0474 read-path push-vs-pull audit. Completes the open build
that [`loop-of-loops-ledger-driven-sessions.md`](../../protocols/loop-of-loops-ledger-driven-sessions.md) left
as "P3 — DB-back the AdminKanban" and sharpens [ADR 0033](0033-component-library-shared-kernel-and-strategic-harness.md)'s
loop-board/G-003 entry from *"a projection surface exists"* to *"the projection is a two-way session driver."*
Instance of the anti-pattern named in
[LR 0007](../../learning/ddd/learning-records/0007-the-discoverability-heuristic-and-built-not-pointed.md)
("built, not pointed").

## Context

The 0474 audit asked: is the agent + doc + Kanban infrastructure actually wired into `/bow-in`, or is it
doc-fluff nothing finds unless the operator points at it? Root cause: **push vs pull.** Only three artifacts
are mechanically forced into a fresh session (`CLAUDE.md`, `MEMORY.md`, `scripts/ledger-backlog.ts`); everything
else waits to be *pulled* — so it enters context only if the operator triggers it. Two capabilities were built
but never wired:

1. **The roster was a persona cast, not a dispatch layer.** Only `desi.md` was a real `.claude/agents/*`
   agentType; Petey/Cody/Doug/Giddy were prose personas in `docs/agents/*.md`. Repo-wide `subagent_type:` for
   the roster = zero hits. "Default to Petey orchestration" was an aspiration the lead role-played by hat-swap.
2. **The DB Kanban board was write-only.** `KanbanCard` / `/app/loop-board` was fed by an insert-only importer
   (`sync.ts`); nothing read it back, so the operator's drag-to-prioritize changed zero session work.

## Decision

**D1 — The roster is a real dispatch layer, and dispatch is the default execution path.**

- Petey, Cody, Doug, Giddy join Desi as real `.claude/agents/*.md` agentTypes, dispatchable via the `Agent`
  tool's `subagent_type`. Tools are scoped by role: **Cody** = full build (Read/Edit/Write/Bash/Glob/Grep);
  **Petey/Doug/Giddy** = read-only (no Edit/Write). The trust boundary is **"only Cody mutates the tree"** —
  test/plan/doc authoring by a read-only agent routes back through a Cody dispatch (one writer, one gate).
- Bow-in **classifies** the task against the `agent-systems-map.md §1` task→workflow router, then **dispatches
  the matched flow as real sub-agents** (unclear/multi-part → Petey → Cody → Doug; clear build → Cody → Doug) —
  not a hat-swap. `petey-plan.md` ends with a `## Dispatch` section that turns its Agent-assignments table into
  actual `Agent()` spawns. The lead may still act inline for a single coherent change; fan-out is reserved for
  genuinely-disjoint work (a one-file change is one inline Cody, not a fleet).

**D2 — The DB Kanban board is the session driver (bidirectional).**

- **Inbound:** `apps/web/scripts/board-backlog.ts` reads open `KanbanCard`s in the operator's board order,
  wired into `opening.md §1b`. When the board and the raw ledger scan disagree, **the board wins** (it encodes
  the operator's explicit prioritization); fall back to the ledger rank when the board is empty/unreachable.
- **Task selection:** `review-recommend.md §4` + `closing.md §6.5` seed the `Next session → Goal + First task`
  from the top-ranked open backlog item (board first, ledger fallback) — unless the operator pinned a `/goal`.
- **Outbound:** a session marks resolved cards `done` at bow-out. Two entry points by context (not duplicated
  authority): `markCardDone` — a `"use server"` action that re-asserts `loop-board.manage`, for the
  authenticated in-app path; and `apps/web/scripts/board-mark-done.ts` — its **headless twin** that hits `db`
  directly for the bow-out CLI (which has no request session). Both write the identical terminal state keyed on
  the `@@unique([configId, source, sourceRef])`, so they are idempotent and convergent — the same
  route-layer-gate / trusted-local-script split already used by the `sync.ts` importer.

**D3 — The router + allowed-vs-never table are a named bow-in read**, consumed by D1's classify→dispatch step
(not a buried pointer).

**Preserved invariant:** dispatch builds and verifies — it **never** pushes/merges/deploys. Every push/merge/
deploy still waits for the operator's explicit word (explicit-push-authorization). Auto-dispatch does not
weaken the push gate.

## Consequences

- A fresh agent (and the roster) get *used* without the operator being the trigger: the read-path now
  **consumes** these artifacts instead of merely mentioning them. Fix pattern for the whole class = convert
  pull→push (make the read-path consume the artifact) — a wiring problem, not a write-more-docs problem.
- The board and the ledger converge into one live backlog: bow-in pulls the ranked open items, bow-out shrinks
  both (ledger rows flip to done *and* board cards move to the `done` stage).
- Cost guard: auto-dispatch can burn tokens; the "reserve fan-out for disjoint work" rule and the operator's
  "single coherent changes inline" preference bound it.
- Deploy shape: the board scripts + `markCardDone` live under `apps/web` (they fire the prod build via
  `vercel.json`'s `ignoreCommand`); the roster configs + governance docs are paths-ignored. Land them as
  **separate commits** so governance changes don't ride a prod deploy.

## Alternatives considered

- **Keep the roster as prose + keep role-playing (status quo).** Rejected: it is precisely the "built, not
  pointed" failure (LR 0007) — the felt "agents aren't called unless I call them."
- **Board-backlog as a `--source=board` flag on `ledger-backlog.ts`.** Rejected: the root ledger CLI is
  deliberately DB-free/alias-free (imports the pure parser, runs under bun without the Next tsconfig); a flag
  would drag the whole Prisma graph into it. A sibling `apps/web/scripts/board-backlog.ts` is the smaller diff.
- **One mark-done path (server action only).** Rejected: it throws headless (no request session), so the
  bow-out loop couldn't close. The headless twin is a context-split, not a second source of truth.
- **Grant Doug/Petey scoped Write.** Deferred (YAGNI): "only Cody writes" is the cleaner boundary; revisit only
  if a read-only agent needing a docs-scoped append becomes a measured recurring cost.
