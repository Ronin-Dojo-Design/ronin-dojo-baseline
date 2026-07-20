---
title: "Recipe — PM Planning Lane (evening staging for an unattended overnight fan-out)"
slug: recipe-pm-planning-lane
type: protocol
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0584
pairs_with:
  - docs/protocols/recipes/orchestrator.md
  - docs/protocols/recipes/AM_Coffee_Merge_Review.md
  - docs/runbooks/dev-environment/autonomous-sessions.md
  - docs/architecture/decisions/0049-session-numbering-lane-facet-and-ref-claim-mint.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - orchestration
  - recipe
  - overnight
---

# Recipe — PM Planning Lane

The evening Petey session that turns a day's open backlog into an unattended overnight fan-out.
Proven at SESSION_0582 (four lanes + one orchestrator stub staged in one evening close).

## Persona pack

- **Petey** — grills every open operator fork to a ratified answer; nothing overnight runs on an
  unresolved decision.
- **Operator** — pins every fork before the session closes. This is the autonomy gate: fork-pinning
  is what makes unattended dispatch *safe* rather than reckless — every judgment call is made
  **before** launch, so nothing overnight depends on a model's discretion.

## Load-set

1. Open backlog — `bun scripts/ledger-backlog.ts` + `( cd apps/web && bun scripts/board-backlog.ts )`.
2. [`fan-out-session-recipe.md`](../fan-out-session-recipe.md) + [epic-plan](epic-plan.md) — to
   shape each candidate lane and prove disjointness.
3. [`.claude/skills/seq-lane-build/SKILL.md`](../../../.claude/skills/seq-lane-build/SKILL.md) — what
   a dispatch prompt needs to be self-contained.
4. **Prior art — consume, don't reinvent.** [`autonomous-sessions.md`](../../runbooks/dev-environment/autonomous-sessions.md)
   + `scripts/auto-session.sh` is the existing **headless driver**: a cold `claude -p` process per
   session, file-based state-machine handoff (the SESSION files + git ARE the handoff — no shared
   chat context), commit-only close (never pushes), safety brakes on a dirty tree or a no-op
   session. The Codex variant (`scripts/auto-session-codex.sh`) mirrors it. Use this driver, or the
   in-chat background-lane variant below — don't build a third mechanism.

## Overlays — pick the launch mechanism

| Mechanism | When | Notes |
| --- | --- | --- |
| **In-chat background lanes** | the operator's session stays open overnight | `Agent(subagent_type: "cody", …)` dispatches per lane, all in one turn; the orchestrator session itself wakes on each lane's completion notification (proven SESSION_0582/0587). |
| **Cold headless driver** | the operator's session will close | `scripts/auto-session.sh N` (or the Codex variant) — one fresh process per session, reads the latest staged stub, closes, hands off via git. |
| **ONE staged stub, zero pasting** (operator-ratified default) | either mechanism | Pre-stage a single orchestrator `SESSION_NNNN` stub (`status: staged`, `recipe: orchestrator`) carrying every lane's dispatch prompt verbatim + the dispatch instruction. The next fresh session's `/bow-in` finds it, adopts it, and dispatches — no re-planning, no pasting. |

## No-overnight-push law

Every staged lane commits **locally only**. The push gate stays shut through the entire overnight
run and through the morning sweep — see [AM_Coffee_Merge_Review](AM_Coffee_Merge_Review.md). This
is unconditional: no lane, however green, pushes without the operator's explicit word.

## Minimum-output contract

1. **N reservation branches** — one per lane (`session-NNNN-<slug>`), minted via
   `bun scripts/ledger-id-next.ts --prefix=SESSION` (ADR 0049).
2. **N staged lane stubs** — `status: staged`, `recipe: lane`, dispatch prompt filled in per
   [`fan-out-session-recipe.md`](../fan-out-session-recipe.md) §2, every fork pinned.
3. **ONE orchestrator staged stub** — `recipe: orchestrator`, carrying all N prompts verbatim +
   the dispatch instruction (which `Agent` calls, which model, any output-mode experiment).
4. **A model/experiment note** — if running lanes on a non-default model, record it as an
   *experiment* in the stub, never as a silently-adopted default (agent-systems-map §5b: `model:`
   overrides are experiments, the roster stays model-unpinned).

## Cross-references

- [Recipe — Epic Plan](epic-plan.md) — shapes the lanes this card stages.
- [Recipe — Orchestrator](orchestrator.md) — what the staged stub executes at adoption.
- [Recipe — AM Coffee Merge Review](AM_Coffee_Merge_Review.md) — the morning half.
- [Autonomous Sessions Runbook](../../runbooks/dev-environment/autonomous-sessions.md) — the headless driver prior art.
- [ADR 0049](../../architecture/decisions/0049-session-numbering-lane-facet-and-ref-claim-mint.md) — staged stubs + number minting.
