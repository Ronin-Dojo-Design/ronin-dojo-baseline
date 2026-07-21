---
title: "Recipe — Live Fanout Sweep (one attended session: dispatch → review → merge N disjoint lanes)"
slug: recipe-live-fanout-sweep
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0609
pairs_with:
  - docs/protocols/recipes/orchestrator.md
  - docs/protocols/recipes/lane.md
  - docs/protocols/recipes/review-wave.md
  - docs/protocols/recipes/merge-wave.md
  - docs/knowledge/wiki/agent-systems-map.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - orchestration
  - recipe
  - fanout
---

# Recipe — Live Fanout Sweep

The **attended, single-session** version of the fanout: one **Petey (Opus) orchestrator** dispatches N
genuinely-disjoint lanes as **persona subagents** (via the `Agent` tool), each in its own worktree, then
**sweeps them up at the close** — review wave + merge wave — all inside ONE session's context. Token-efficient
vs N separate sessions; proven at SESSION_0582 (3 lanes, one crash-resume) and SESSION_0597 (7-lane reconcile
→ build → merge). This card is the **thin chain** over the existing pieces — it invents nothing, it sequences
them for the live case.

Where [`orchestrator.md`](orchestrator.md) is the dispatch half and [`AM_Coffee_Merge_Review.md`](AM_Coffee_Merge_Review.md)
is the **AFK/overnight** sweep, this card is the **operator-present, same-session** sweep.

## When (vs the alternatives)

| Situation | Use |
| --- | --- |
| 2+ lanes, genuinely disjoint file sets, operator present, want ONE session | **this card** |
| Same, but launched to run overnight / unattended | [`orchestrator.md`](orchestrator.md) → [`AM_Coffee_Merge_Review.md`](AM_Coffee_Merge_Review.md) |
| One lane only | [`lane.md`](lane.md) / [`seq-lane-build`](../../../.claude/skills/seq-lane-build/SKILL.md) inline |
| Lanes are NOT disjoint (shared files) | do NOT fan out — serialize as one lane |

**Disjointness gate (hard):** run the [`epic-plan`](epic-plan.md) §1 pairwise-empty test FIRST. If any two lanes
share a writable file, they are not fanout-safe — the frozen-contract pattern (WS-A) is how you MAKE them
disjoint (each owns its own file; shared surfaces are frozen/read-only).

## Persona pack (the roster)

- **Petey (Opus)** — the orchestrator. Owns the dispatch record, the sweep, the escalation valve, and the
  single push gate. Does NOT build. Stays Opus for the contract-shaped judgment (which lane failed, is a
  finding real, is the merge safe).
- **Cody ×N** — one per BUILD lane, each `Agent(subagent_type: "cody", …)` in its OWN worktree, each a full
  [`lane.md`](lane.md) citizen (worktree-isolate → preflight → build → gates → self-review). Model per lane
  by difficulty (Sonnet for mechanical, Opus for Class-A/contract-shaping).
- **Petey (sub)** — for a PLAN lane in the trio (e.g. an `epic-plan` stub): dispatch a `petey` subagent to
  produce the plan draft; the operator grills it later (a plan can't be fully auto-resolved).
- **Doug + Desi + Giddy** — the review wave ([`review-wave.md`](review-wave.md)), dispatched **on each landed
  lane's commit** (Doug always; Desi on member-facing/shared-primitive UI; Giddy when structure moved). They
  verify; they do not fix — findings resume to the original Cody.
- **Merge owner** — Petey (or operator) runs [`merge-wave.md`](merge-wave.md): serialized rebase → ff-only,
  gate ladder G0→G4, one push at close on the operator's word.

## Load-set

1. The N lane **stubs** (`recipe: lane` SESSION files) — goal + owned files + the frozen contract each conforms to.
2. The disjointness proof (owned-file sets are pairwise-empty; shared surfaces frozen).
3. The per-lane gotcha floor (domain invariants) — pulled from each stub, not re-derived.

## Step sequence

0. **Prove disjointness** (epic-plan §1). Write the dispatch record: lane → branch/worktree → prompt → persona/model.
1. **Dispatch** all N in one turn (parallel `Agent` calls) — Cody per build lane, Petey per plan lane. Each
   runs its own worktree lane to a **held commit** (never pushes).
2. **Watch + resume** — a lane that crashes (session-limit) resumes via `SendMessage` with disk-truth-first
   instructions (re-read the worktree's real state first). A lane that hits real ambiguity → **escalate to the
   operator**, never force through.
3. **Review wave** — as each lane lands its commit, dispatch [`review-wave.md`](review-wave.md) on it (Doug +
   conditional Desi/Giddy). Batched-fix resume to the original Cody on P1/P2; re-verify the fix.
4. **Merge sweep** — once all lanes are GO/GO-WITH-NOTE, run [`merge-wave.md`](merge-wave.md): serialized
   rebase in land order → ff-only to main; resolve the shared-ledger appends (`index.md`, `goals-ledger`,
   etc. — EOF-append, keep all rows). Gate on merged main before any push.
5. **One push, on the word** — HOLD at the push gate; the operator says go; push once. App-code lanes deploy.

## Minimum-output contract

1. **Dispatch record** (lane · branch/worktree · persona/model · prompt).
2. **Per-lane held commit** + a self-review line.
3. **Review-wave verdict** per lane (GO / GO-WITH-NOTE / NO-GO → loop), findings routed (fix or ledger row).
4. **Merge record** — land order, shared-ledger reconciliation, gate result on merged main.
5. **One push gate** — always waits for the operator's explicit word; app-code lanes note the deploy.

## Done-means

1. Every lane landed to main behind a GO verdict, gates green on merged main.
2. Disjointness held (no cross-lane clobber); shared ledgers reconciled (all rows kept).
3. One push, one deploy (if app-code), one close — N lanes, one session.

## Cross-references

- [`orchestrator.md`](orchestrator.md) — the dispatch half (this composes it for the live case).
- [`lane.md`](lane.md) / [`seq-lane-build`](../../../.claude/skills/seq-lane-build/SKILL.md) — what each Cody runs.
- [`review-wave.md`](review-wave.md) — the Doug/Desi/Giddy sweep on each landed commit.
- [`merge-wave.md`](merge-wave.md) — the serialized land + gate ladder.
- [`epic-plan.md`](epic-plan.md) — the disjointness proof + paste-ready prompts.
- [Agent Systems Map §5b](../../knowledge/wiki/agent-systems-map.md) — the proven epic-lane build/verify chain.
