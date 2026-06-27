---
title: "Loop of Loops — Ledger-Driven Session Planning (research-review)"
slug: loop-of-loops-ledger-driven-sessions
type: protocol
status: active
created: 2026-06-26
updated: 2026-06-27
last_agent: claude-session-0453
pairs_with:
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/protocols/operator-playbook.md
  - docs/protocols/review-recommend.md
  - docs/protocols/petey-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - planning
  - ledgers
  - research-review
---

# Loop of Loops — Ledger-Driven Session Planning

> **Status: ACTIVE.** Authored SESSION_0451 from the operator's vision: *"our tasks for each session could be
> items from each ledger that make sense to bundle together in a session … get the ledger items as the 3–5
> tasks we roughly shoot for in a given SESSION."* **P1 + P2 landed SESSION_0453:** the bow-in ledger-scan
> step is wired into `opening.md` and the `scripts/ledger-backlog.ts` aggregator is live. P3 (DB-back the
> AdminKanban) remains the open build — see the merge strategy below.

## The vision (one sentence)

The **ledgers are the backlog**; each session pulls **3–5 coherent ledger items** as its tasks (bow-in), works
them, and **feeds resolutions + new findings back into the ledgers** (bow-out) — a self-feeding *loop of loops*
where the close of one session writes the open of the next.

## Current state (Graphify integration query, SESSION_0451)

A BFS from `closing.md` + the finding-router shows the **core governance web is already well-stitched**:

- `closing.md §6.7` (finding-router) ↔ the ledgers (`drift-register` D-NNN, `wiring-ledger` WL, `failed-steps-log`
  FS, `manual-boundary-registry`, `test-fail-fix-ledger`, `POST_LAUNCH_SOT` FI, `incidents`).
- `operator-playbook.md` already documents **"Which loop for which signal"** + **"Which ledger for which
  finding"** — the *outbound* routing (session → ledger) exists.
- `opening.md` / `closing.md` / `petey-plan.md` / `review-recommend.md` / `petey.md` are densely linked.

**The three gaps** (nodes NOT connected to that web):

1. **No inbound routing.** The finding-router sends findings *to* ledgers (outbound), but nothing pulls open
   ledger items *back into* a session plan (inbound). Bow-in reads only the prior SESSION's "Next session"
   block — the ledgers are a write-only backlog.
2. **The AdminKanban (`/app`… `task-board`) is detached.** It's a client-side board hydrated from
   `lib/task-board/seed.ts` (a deterministic **demo/test fixture** — "fixture ≡ what tests assert") and persisted
   in **browser localStorage**. It is the operator's *personal* board, not a projection of the ledgers, and it
   cannot be synced programmatically from a session (the real tasks live in the browser).
3. **The quality loops are unwired as gates.** `fallow-fix-loop` + the new `code-quality-matrix` are per-diff
   loops *within* a session, but neither is a named close-gate, so quality scoring is ad-hoc.

## The ledger backlog (inbound sources)

| Ledger | ID | Holds | Open-item signal |
| --- | --- | --- | --- |
| `failed-steps-log` | FS-NNNN | SOP/process misses + corrective actions | `Status: open`/`mitigated (… pending)` |
| `drift-register` | D-NNN | spec-vs-impl / two-SoT drift | `Status: open` |
| `wiring-ledger` | WL-P{0,1,2}-N | dead/incomplete wiring, storage gaps | unchecked rows |
| `POST_LAUNCH_SOT` | FI-NNN | feature backlog (P0/P1/P2) | `Status: triaged`/`in-progress` |
| `manual-boundary-registry` | row | "smoke pending" boundaries | un-verified rows |
| `test-fail-fix-ledger` | dated | flaky/broken tests | open rows |
| `incidents` | dated | unclean closes | unresolved |

## Proposed loop

### Bow-in (opening.md) — INBOUND: assemble the session from the backlog

Add a step after "read the latest SESSION file": **scan the open ledger items + the Next-session block, then
bundle 3–5 *coherent* items into the Petey plan.** Coherence heuristic (pick one axis so the session is one
reviewable lane, not a grab-bag):

- **By domain hub** — all lineage items, or all directory/org items (lets you reuse one mental model + one hub read).
- **By risk class** — all authz/public-surface (one PR, one security pass), or all docs-only (one free push).
- **By deploy unit** — all `apps/web` app-code (one CI matrix), or all governance/docs (no deploy).

Why **3–5**: it's one coherent lane, fits one close's review + one PR, and matches the cognitive budget before
the ~120K "dumb zone" (`[[fresh-chat-and-read-provided-sources]]`). Fewer = under-utilized session; more = the
close can't honestly verify them all.

### Bow-out (closing.md) — OUTBOUND: the symmetric cross-off sweep

The finding-router (§6.7) already *adds* findings. Add its mirror: a **ledger cross-off sweep** — for every
ledger item the session resolved, flip the row to ✅/done with the SESSION reference; for every new finding,
route it per §6.7. This makes the ledgers a true live backlog (open items shrink as sessions close them).
SESSION_0451 demonstrated it: FS-0026 added; orig-TASK_03 (security-docs) + the 0450 memory-dedup leftovers
crossed off; FI-001 left open (deferred).

### The AdminKanban — operator-facing projection (phased)

The board can't be auto-synced today (client-side localStorage demo fixture). Two honest options:

- **Keep manual** — it stays the operator's personal scratch board; the close *reminds* the operator to move
  cards. Zero engineering, but it drifts from the ledgers.
- **DB-back it as a ledger projection (recommended target)** — migrate the board to a `Task`/`BoardItem` model
  whose cards are *generated from* the open ledger items (FS/D/WL/FI). Then the board IS the backlog view, the
  bow-in pull reads it, and the bow-out sweep updates it — one source of truth, operator-visible. This is the
  real prize and the bigger build.

## Merge strategy (Giddy) — phased, non-disruptive

The working close ritual must not regress while we add the loop. Sequence by blast radius:

1. **P1 — docs-only, ship now (low risk).** Add the bow-in *ledger-scan + bundle* step to `opening.md` and the
   bow-out *cross-off sweep* step to `closing.md` (+ mirror in `.github/prompts/`). Wire `code-quality-matrix` /
   `fallow-fix-loop` as a named optional close-gate. No code, no deploy — a free docs push. **This session adds
   the closing.md hook + this doc; opening.md edit is the first P1 task next session.**
2. **P2 — a backlog aggregator script (small code).** `scripts/ledger-backlog.ts` greps all ledgers for open
   items and prints one ranked backlog (id, ledger, age, priority, domain). Bow-in reads it instead of hand-
   scanning 7 files. Read-only, no schema.
3. **P3 — DB-back the AdminKanban as a ledger projection (real build).** The `Task` model + a sync that
   materializes open ledger items as cards. Only after P1/P2 prove the loop's shape. Schema → PR route.

Giddy's risk note: **do P1 first and live with it for a few sessions** before P2/P3 — the bundling heuristic
("what's *coherent*") is a judgment call that wants real-session calibration before it's automated. Automating a
bad bundling rule is worse than hand-picking.

## Recommendation

**P1 + P2 landed** (SESSION_0451: this doc + the closing.md cross-off hook; SESSION_0453: the opening.md
ledger-scan step + `scripts/ledger-backlog.ts`). Treat the AdminKanban as **manual until P3**. Per Giddy's
risk note, run the P1/P2 loop for 2–3 sessions to calibrate the bundling heuristic before committing to P3's
schema (automating a bad bundling rule is worse than hand-picking).

## Cross-references

- [Opening ritual](../rituals/opening.md) · [Closing ritual](../rituals/closing.md) — the loop's two halves.
- [Operator Playbook](operator-playbook.md) — "Which loop for which signal" / "Which ledger for which finding".
- [Review & Recommend](review-recommend.md) · [Petey Plan](petey-plan.md) — the planning protocols this extends.
- Ledgers: [`failed-steps-log`](failed-steps-log.md) · [`drift-register`](../knowledge/wiki/drift-register.md) ·
  [`wiring-ledger`](../knowledge/wiki/wiring-ledger.md) · [`POST_LAUNCH_SOT`](../product/black-belt-legacy/POST_LAUNCH_SOT.md).
