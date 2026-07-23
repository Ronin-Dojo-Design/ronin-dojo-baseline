---
name: ppp
description: /pp + Prompt — run the Petey plan, THEN emit the paste-ready baton (the handoff prompt a fresh session/agent/Cody adopts to execute the lane without re-deriving the plan). Use when the operator says "/ppp", "plan and prompt", "plan + baton", "stage the next session", or wants a plan they can hand straight to a builder. For plan-only, use /pp.
---

# ppp — /pp + emit the baton

`/ppp` = **`/pp` then emit the baton** (ADR 0052 D1/D7). It produces the same plan as
[`/pp`](../pp/SKILL.md), then serializes the elected lane into the **paste-ready handoff prompt** — the
baton a fresh context (a dispatched Cody, the next session, another agent/runtime) adopts to execute the
lane without re-deriving the plan.

## Steps

1. **Run `/pp` in full** — parse the inputs, grill the open forks, emit the plan block, run the
   parallel-lane assessment. See [`../pp/SKILL.md`](../pp/SKILL.md); don't restate it.
2. **Serialize the baton.** The baton is the [ADR 0049](../../../docs/architecture/decisions/0049-session-numbering-lane-facet-and-ref-claim-mint.md)
   staged-stub / `Next session` block — **no parallel handoff doc** (ADR 0052 D7 rejects a `BATON.md` to
   avoid the two-doc drift the monorepo hit). It carries the lane's typed output: the goal, the owned file
   scope, the pinned grill outcomes (decisions that must not be re-litigated), `done means`, and the exact
   next command. For a Build lane the baton is the paste-ready Cody dispatch prompt; for bow-out staging it
   is the `status: staged` stub for the next SESSION file.
3. **Emit it in a copy-paste block** so the operator can hand it straight to the executor, and (at bow-out)
   write it into the staged stub / `Next session` section of the SESSION file.

## Baton shape

```text
Lane:  <brand> × <stage>            Goal: <one sentence, what this lane accomplishes>
Owned files: <explicit paths>       Depends on: <nothing | prior lane's output>
Pinned decisions: <grill outcomes that are settled — do NOT re-open>
Do:  <the exact skill/command to run — e.g. dispatch cody via /seq-lane-build>
Done means: <artifact / state change>          Then: verify with /ggr → hold at push gate
```

## What this is NOT

- Not a second doc — the staged stub **is** the baton (no `BATON.md` / `CHAT_HANDOFF.md` staleness, ADR 0052 D7).
- Not a dispatch by itself — it emits the prompt; a human or the orchestrator runs it. It still holds at the
  push gate ([explicit-push-authorization]).
