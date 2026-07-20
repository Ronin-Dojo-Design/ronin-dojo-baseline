---
title: "PR Review → Score → Fix Loop"
slug: pr-review-score-fix-loop
type: protocol
status: active
created: 2026-06-20
updated: 2026-07-20
last_agent: claude-session-0584
pairs_with:
  - docs/protocols/merge-to-main.md
  - docs/protocols/recipes/merge-wave.md
  - docs/protocols/hostile-close-review.md
  - docs/agents/giddy.md
  - docs/agents/doug.md
  - docs/agents/cody.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - review
  - pr
  - quality-gate
---

# PR Review → Score → Fix Loop

> Promoted from the legacy `RoninDashboard/protocols/PR_REVIEW_SCORE_FIX_LOOP.md`
> (SESSION_0420). Leaned out for this repo: the monorepo's Julie/Damian personas,
> deterministic-rank telemetry (`DR-LOOP-*`, `success_rate`), the
> `pr-review-score-fix-loop.mjs` runner, and `code_cleanliness_jetty_bamd` jargon
> are dropped or folded into this repo's roster (Petey / Cody / Doug / Giddy), the
> `/code-review` skill, and `merge-to-main.md`.

A deterministic loop for turning a **PR number or branch** into a graded
integrate-or-fix decision. Use it when a session branch (or a cloud/codex PR) needs
to land on `main` and you want one repeatable review→score→decide→fix cycle instead
of an ad-hoc skim.

## When to invoke

- A session branch or cloud PR is ready to merge to `main` and needs a gate.
- A codex/cloud-authored PR arrived and you must decide **fix-then-merge** vs
  **integrate as-is** vs **re-derive intent first**.
- A review came back "looks fine" and you want a scored, evidence-backed verdict
  before pulling the trigger (pairs with `merge-to-main.md`).

Skip it for a one-line docs fix on your own branch — just run the close gates.

## Core contract

```text
REVIEW → SCORE → GIDDY BINARY GATE → DECIDE(FIX | INTEGRATE) → RETRY (≤3 passes) → GATE
```

Status vocabulary is strict (matches this repo's review docs):

- `PASS`
- `FAIL`
- `MANUAL STEP REQUIRED`

## Inputs

- A PR number (`gh pr view <n>`) **or** a branch name.
- The originating intent — one sentence of what the change is *supposed* to do
  (from the SESSION file `Goal`, the PR body, or the operator).
- A validate command for the touched area (e.g. `bun run typecheck`,
  area tests, or a local `next build` for new server-action/route modules —
  see [[next-build-catches-use-server]]).

## Step 1 — Review

Run the diff review. Default tool is the repo's **`/code-review`** skill (correctness
bugs + reuse/simplification) at an effort matched to blast radius; escalate to
`/code-review ultra` for a large or cross-cutting branch. Assign reviewers by the
[three-pass gate mode](#gate-modes):

- **Cody** — correctness, security, architecture, does-it-build.
- **Giddy** — scope drift, structural fit, merge/branch shape ([[merge-wave]]).
- **Doug** — test/runtime evidence, lifecycle coverage, release-readiness.
- **Desi** — only when the diff touches UI/UX surfaces.

## Step 2 — Score (binary accelerator)

Three binary checks. The accelerator is `yes` only when **all three** are `yes`:

1. `right_code_for_intent` (`yes|no`) — does the change implement the stated intent?
2. `code_cleanliness` (`yes|no`) — matches repo conventions, reuses existing
   components/L1 primitives, JETTY annotation present where the
   [JETTY standard](jetty-annotation-standard.md) requires it.
3. `performs_intended_function` (`yes|no`) — proven by a run/test/build, not asserted.

Then assign a 0–10 score per active reviewer; the gate score is their average
(same scale as `hostile-close-review.md`).

## Step 3 — Giddy binary gate (required)

Immediately after scoring, Giddy picks exactly one decision before any fix launch:

1. **`KEEP_AS_IS_AND_IMPROVE`** — intent is aligned but a quality/function check is
   incomplete. → Improve in place, then re-run from Step 1.
2. **`INTEGRATE_PASS`** — binary accelerator is `yes` **and** gate score `≥ 9.5`.
   → Integrate precisely via [`merge-to-main.md`](merge-to-main.md) +
   [[merge-wave]] (commit/push only on explicit operator approval —
   [[explicit-push-authorization]]).
3. **`INTEGRATE_INTENT_REQUIRED`** — output has function/form signal but an
   intent-vs-method mismatch (or broader intent mismatch). → Re-derive the intent
   with the operator before patching; do **not** merge.

Gate status stays strict: `PASS` / `FAIL` / `MANUAL STEP REQUIRED`.

## Step 4 — Required top-3 improvements

Every loop run emits exactly three improvement tasks (feeds Cody):

1. **Output-type correction** — `doc_only` | `doc_and_code` | `code_only`.
2. **Intent-alignment correction.**
3. **Functional / correctness correction.**

## Step 5 — Petey triage (required)

Three questions before the loop closes (the monorepo's "Julie triage", folded into
Petey for this repo's roster):

1. Is this what was intended?
2. Is it in the right place (right files, right branch, right ADR)?
3. Is it improvable or incorrect?

## Gate modes

Borrowed from the three-pass model — use the smallest valid mode, escalate on miss:

- `single_persona` — isolated surface (≤3 files), low risk → one reviewer.
- `multi_persona` — cross-file/service change or runtime/security risk → Cody + Doug
  (+ Giddy for structural/merge risk).
- `all_hands` — governance/protocol change, schema/migration, or two consecutive
  failed passes on the same branch → Petey + Cody + Doug + Giddy (+ Desi if UI).

## Stop condition

Stop only when **all** are true:

1. gate score `≥ 9.5` (this repo's `merge-to-main` precondition),
2. binary accelerator is `yes`,
3. Giddy decision is `INTEGRATE_PASS`,
4. status is `PASS`.

Then hand to [`merge-to-main.md`](merge-to-main.md) for the rebase/PR/squash
mechanics. Record the pass scores in the SESSION file `## Review log` (the
cross-session ledger was retired at SESSION_0228 — SESSION files are canonical).

## Optional automation (not built here)

The monorepo shipped a `pr-review-score-fix-loop.mjs` runner with `--auto-create-issue`.
This repo runs the loop manually via `gh pr` + `/code-review`. If volume justifies it,
a `scripts/` runner is a candidate follow-up — until then the loop is operator-driven.

## Cross-references

- [Merge to Main](merge-to-main.md) — the mechanics this loop hands off to.
- [Recipe — Merge Wave](recipes/merge-wave.md) — commit/push gate ladder.
- [Hostile Close Review](hostile-close-review.md) — the session-close scoring sibling.
- [Giddy](../agents/giddy.md) · [Doug](../agents/doug.md) · [Cody](../agents/cody.md)
