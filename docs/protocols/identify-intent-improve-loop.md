---
title: "Identify-Intent-Improve Loop"
slug: identify-intent-improve-loop
type: protocol
status: active
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0423
pairs_with:
  - docs/protocols/pr-review-score-fix-loop.md
  - docs/protocols/three-pass-loop.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - review
  - intent
---

# Identify-Intent-Improve Loop

> Promoted from the legacy `RoninDashboard/protocols/IDENTIFY_INTENT_IMPROVE_LOOP.md`
> (SESSION_0423). Leaned for this repo: the monorepo's QF/WO/SPRINT lane refs,
> RoninDashboard paths, the `protocol-intent-improve-loop.mjs` Petey-baton runner,
> and the `WO_FLOW_LOOP.md` / `PERFECT_PROJECT_PLAN_LOOP.md` scan targets are
> dropped; the Julie/Damian personas map to this repo's roster (Petey / Cody).

A binary **"does it do everything it intends?"** audit plus a failure classification.
Run it *before* patching when an output and its stated intent might be mismatched — so
you fix the right thing rather than polishing code that solves the wrong problem. The
loop answers one question deterministically (`DOES_IT_DO_ALL_IT_INTENDS = yes|no`) and,
on `no`, files the failure into exactly one of three classes.

## When to invoke

- A change "looks done" but you're not sure it satisfies the *stated* intent.
- A reviewer (or the `/code-review` skill) returns function/form signal but you suspect
  an intent-vs-method mismatch.
- **`pr-review-score-fix-loop.md`'s Giddy gate lands on `INTEGRATE_INTENT_REQUIRED`** —
  that branch invokes *this* loop to re-derive intent with the operator before any
  merge. (See the cross-reference below.)

Skip it when intent is trivially obvious and the only open question is code quality —
that's the `/code-review` skill's job, not this audit's.

## Core contract

```text
IDENTIFY → INTENT_MATCH → IMPLEMENTATION_CHECK → BINARY_DECISION(yes|no)
  → IMPROVE_CLASSIFICATION → REVIEW/REPORT/RECOMMEND
```

Status vocabulary is strict (matches this repo's review docs):

- `PASS`
- `FAIL`
- `MANUAL STEP REQUIRED`

## The binary: `DOES_IT_DO_ALL_IT_INTENDS`

`yes` only when **all** are true; otherwise the binary is `no`:

1. **intent is explicit** — the goal is stated in one sentence (SESSION `Goal`, PR body,
   or operator), not inferred.
2. **loop/output contract is explicit** — the change declares what it produces and how.
3. **status vocabulary is explicit** — `PASS | FAIL | MANUAL STEP REQUIRED` is used.
4. **output contract exists** — the artifact's shape is defined and met.
5. **stop condition exists** — there's a clear "done" the change actually reaches.
6. **wiring is correct** — references/targets it depends on are connected, not dangling.
7. **referenced scripts pass syntax checks** — any cited script runs (or `node --check`
   passes); run a local `next build` for new server-action/route modules
   ([[next-build-catches-use-server]]).
8. **implementation alignment meets threshold** — the method genuinely satisfies the
   stated purpose, not a near-miss.

## Improve classification (on binary `no`)

Pick **exactly one** class. The class determines what Cody is asked to do next:

1. **`WORKS_NEEDS_IMPROVEMENT`** — directionally correct and it does the intended thing,
   but quality gates are incomplete (missing test/build proof, conventions, JETTY
   annotation). → Improve in place; the action stays.
2. **`RIGHT_ACTION_POORLY_CODED_OR_WIRED`** — the right intent, but missing wiring,
   missing targets, or a script syntax failure. → Fix the wiring/code; the action stays.
3. **`WRONG_ACTION_OR_NOT_BEST_PRACTICE`** — intent/implementation alignment is too low,
   or the action model doesn't satisfy the stated purpose. → **Re-derive intent with the
   operator before patching** — do not just refine the existing approach.

## Output contract

Per audited target, report:

1. binary decision (`yes | no`)
2. status (`PASS | FAIL | MANUAL STEP REQUIRED`)
3. failure classification (one of the three classes, or `none` on `yes`)
4. check matrix (the eight binary checks above)
5. blocker signatures (what failed, with evidence)
6. next 3 steps

## Stop condition

Stop only when the target returns binary `yes` **and** status `PASS`. A `no` always
exits to its classified next action (improve in place, fix wiring, or re-derive intent)
and re-enters the loop — it never silently passes.

## Cross-references

- [PR Review → Score → Fix Loop](pr-review-score-fix-loop.md) — its Giddy
  `INTEGRATE_INTENT_REQUIRED` decision invokes this loop to re-derive intent before
  merge; this loop's three classes mirror that gate's `KEEP_AS_IS_AND_IMPROVE` /
  intent-mismatch branches.
- [Three-Pass Loop](three-pass-loop.md) — the gate-mode escalation model (single /
  multi / all-hands) this audit slots into.
- [Cody](../agents/cody.md) — owns the fix once a class is assigned.
- [Petey](../agents/petey.md) — owns the re-derive-intent step on
  `WRONG_ACTION_OR_NOT_BEST_PRACTICE`.
