---
title: "Operator playbook — running the multi-agent workflow"
slug: operator-playbook
type: protocol
status: active
created: 2026-06-22
updated: 2026-06-22
author: Giddy / SESSION_0429
pairs_with:
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/protocols/next-session-loading-order.md
  - docs/protocols/petey-plan.md
  - docs/protocols/pr-review-score-fix-loop.md
  - docs/protocols/giddy-merge-strategy.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Operator playbook — running the multi-agent workflow

One page. How to drive a session smoothly now that work fans out across cloud + local agents.
The loops/ledgers below already exist; this is the **when-to-reach-for-what** map, not new process.

## The spine (don't skip)

1. **`/bow-in`** — reads the highest `docs/sprints/SESSION_NNNN.md` "## Next session" block as the
   default task. **Keeping that block current is the single highest-leverage habit** — it's what
   makes a fresh window self-loading. (Load order: `next-session-loading-order.md`.)
2. **Do the work** — inline for one coherent change; fan out only when work is genuinely disjoint
   (see decision rule below).
3. **`/bow-out`** — full close: hostile review, evidence table, route findings to ledgers, ADR
   check, memory sweep, Graphify refresh. **Write the next "## Next session" block before closing.**

## Decision rule: inline vs cloud fan-out

| Situation | Do this |
| --- | --- |
| One coherent change (a feature, a bug, a refactor in one area) | **Inline.** Single agent, single PR. |
| Work splits cleanly by **directory** (no shared files) | **Cloud fan-out** — one agent per disjoint dir, `isolation: worktree`, one PR per slice. (e.g. brand-prune waves: server/web · server/admin · app+lib+components.) |
| Stages depend on each other / shared files | **Sequence**, don't parallelize — collisions cost more than the wall-clock saved. |
| Unsure / multi-part / fuzzy scope | **Petey plan first** (`petey-plan.md`) — grill the open decisions, then Cody builds, Doug verifies. |

**Hard-won rules:** worktree-isolate any agent that mutates files (a dirty-tree subagent `git stash`
can clobber edits); if a wave adds a dep, the lockfile **must** be committed (CI runs
`--frozen-lockfile`); run a local `next build` on changed `"use server"`/route/client-chrome
modules (tsc/tests miss the use-server + Prisma-in-browser traps).

## Pause-on-merge (your lever)

Agents **build + drive-to-green**; **you pull the merge trigger.** This held cleanly across 9 PRs
this program. Merging app-code → prod deploy (per `vercel.json` `ignoreCommand`); docs/governance/CI
pushes don't deploy. Sequence dependent PRs (e.g. cleanup behind its feature); independent PRs merge
in any order. See `giddy-merge-strategy.md` + `merge-to-main.md`.

## Which loop for which signal

| Signal / goal | Reach for |
| --- | --- |
| Open PRs to babysit to merge-ready | `pr-review-score-fix-loop` (the `/pr-fix-loop` skill) — pause-on-merge |
| Fuzzy/multi-part scope to plan | `petey-plan.md` (grill first) |
| "Is this the simplest version?" | `kiss-dry-yagni-loop.md` |
| "Does it actually run?" before shipping | `qa-runtime-verification.md` + the `/verify` skill (drive the real app) |
| "What's the intent — am I solving the right thing?" | `identify-intent-improve-loop.md` |
| Urgent prod fix | `hot-fix-protocol.md` |
| Deep correctness/quality sweep | `three-pass-loop.md`; cloud multi-agent = `/code-review ultra` |
| Pre-merge ordering / what-next | `review-recommend.md` (→ `docs/reviews/`) |

## Which ledger for which finding (finding-router, closing.md §6.7)

| Finding | Ledger |
| --- | --- |
| Two-sources-of-truth / data-flow seam | `wiring-ledger` (WL) |
| Behavior drift / config gap | `drift-register` (D) |
| SOP / process miss | `failed-steps-log` (FS) |
| Unclean close / prod incident | `incidents` |
| A test that broke + how fixed | `test-fail-fix-ledger` |
| Smoke-only / manual-verify boundary | `manual-boundary-registry` |
| A decision worth keeping | an ADR (`docs/architecture/decisions/`) |
| Feature status / running list | **`POST_LAUNCH_SOT`** (supersedes `feature-intake-ledger` — treat the latter as legacy) |

## Cadence rules of thumb

- **One push per session at close** — don't push mid-session (CI debt + collisions). Exception:
  docs-tier artifacts the next window needs (e.g. the Next-session block).
- **Operator drives; nothing is canonical by default** — surface state, recommend, wait for the
  word at each merge/close/deploy. Don't run the doc/ADR autopilot.
- **Verify before declaring done** — drive the real app for prod-facing changes (today's lineage
  views were curl + live-browser confirmed before shipping the sweep).
- **Big decisions → fresh window** past the ~120K "dumb zone"; commit candidates first.

## Health snapshot (SESSION_0429)

- Loop-promotion program **complete** (THREE_PASS/KISS_DRY_YAGNI/QA_RUNTIME/IDENTIFY_INTENT/HOT_FIX
  all landed).
- Brand-harness prune **Stage 1 complete + shipped**; **Stage 2 (schema drop) pending** — gated,
  own session, 4 Phase-0 decisions first (`petey-plan-brand-harness-prune.md`).
- Open cleanups: retire `feature-intake-ledger` (→ POST_LAUNCH_SOT); the lineage rank/identity
  wiring drift (SESSION_0430 Track A).
