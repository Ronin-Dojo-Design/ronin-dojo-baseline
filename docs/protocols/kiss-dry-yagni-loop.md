---
title: "KISS / DRY / YAGNI Loop"
slug: kiss-dry-yagni-loop
type: protocol
status: active
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0423
pairs_with:
  - docs/protocols/three-pass-loop.md
  - docs/protocols/cody-preflight.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - quality-gate
  - refactor
---

# KISS / DRY / YAGNI Loop

> Promoted from the legacy `RoninDashboard/protocols/KISS_DRY_YAGNI_LOOP.md`
> (SESSION_0423). Leaned for this repo: the Petey-baton `three-pass-loop.sh` prestep,
> RoninDashboard paths, and the QF / WO / SPRINT lane vocabulary are dropped; the
> monorepo personas are renamed to this repo's roster (Julie→Petey, Damian→Cody);
> and the PASS threshold is set to **≥9.5** to match this repo's gate bar
> (the monorepo used 9.6). The loop now rides on this repo's
> [`three-pass-loop.md`](three-pass-loop.md) engine and complements
> [`cody-preflight.md`](cody-preflight.md). Quantitative deltas are measured with
> the **`fallow`** tool and the **`/simplify`** skill (below), not just asserted.

A simplicity / reuse / necessity audit for a **task, plan, phase, protocol, or diff**.
It answers one question with a graded verdict: *is this the smallest correct change,
with no duplication and no speculative scope?* Use it when something feels overbuilt,
when a review note says "overlap / duplicate / scope drift / too complex," or as the
quality lens layered onto a three-pass review.

## When to invoke

- A plan or diff looks heavier than the acceptance criteria demand.
- A review note flags **"overlap," "duplicate," "scope drift,"** or **"too complex."**
- A new component/action/schema is proposed where reuse might exist — run this on the
  heels of [`cody-preflight.md`](cody-preflight.md)'s reuse scan, before building.
- A protocol/governance file is edited without a deterministic rubric update.

Skip it for a one-line docs fix or a typo — just run the close gates.

## How it relates to the other loops

- **[`three-pass-loop.md`](three-pass-loop.md)** is the *engine*: score → fix → review,
  smallest valid gate mode (`single_persona` / `multi_persona` / `all_hands`), escalate
  on miss. This loop is that engine pointed at KISS/DRY/YAGNI. Declare `gate_mode`
  before pass 1.
- **[`cody-preflight.md`](cody-preflight.md)** is the *upstream guard*: reuse existing
  components / L1 primitives before writing anything. This loop is the *downstream
  check* that the reuse actually happened (DRY) and that nothing speculative crept in
  (YAGNI).

## 10-point rubric

Score each dimension, sum to a 10-point total.

1. **KISS** (`0–3`) — clear flow, minimal complexity; the smallest design that works.
2. **DRY** (`0–3`) — no needless duplication; shared logic reused (the existing
   component / L1 primitive / helper), not re-implemented.
3. **YAGNI** (`0–3`) — no scope beyond the acceptance criteria; no speculative
   options, flags, or abstractions "for later."
4. **Evidence quality** (`0–1`) — every finding and fix maps to a concrete file,
   command, or measured delta (not an assertion).

### Bands

| Total | Verdict |
| --- | --- |
| **≥ 9.5** | `PASS` |
| **8.5 – 9.4** | `FAIL` — fix pass required, lane stays open |
| **< 8.5** | `FAIL` — scope reset / reduce required |

(The monorepo gated at ≥9.6; this repo uses **≥9.5** to match `merge-to-main` and
`pr-review-score-fix-loop.md`.)

## Three-pass execution

Run on the [`three-pass-loop.md`](three-pass-loop.md) score→fix→review structure:

1. **Pass 1 — baseline.** Score KISS/DRY/YAGNI + evidence as-is. Capture the *before*
   measurement (see Measuring deltas).
2. **Pass 2 — collapse.** Remove the top complexity and duplication debt — delete dead
   paths, fold duplicates into the shared seam, simplify control flow.
3. **Pass 3 — trim & finalize.** Remove residual non-essential scope (speculative
   options/flags/abstractions), re-score, and capture the *after* measurement.

If the score is still `< 9.5` after pass 3, the lane stays **open** and escalates per
[`three-pass-loop.md`](three-pass-loop.md) (bump the gate mode; on two consecutive
failed passes go `all_hands`).

## Measuring the deltas (don't just assert them)

KISS/DRY/YAGNI claims are cheap to assert and easy to fool yourself on. Back them with
this repo's tools, before and after:

- **`fallow health`** — CRAP / complexity score for the touched files (the **KISS**
  proxy). Capture before pass 1, diff after pass 3 to *prove* complexity dropped.
- **`fallow dupes`** — duplication report (the **DRY** proxy). A real DRY fix shows
  fewer dupes after.
- **`fallow audit`** — dead-code / unused-export sweep (the **YAGNI** proxy). Removed
  speculative scope shows up here.
- **`/simplify`** skill — reviews the changed code for reuse / simplification /
  efficiency cleanups and *applies* them; a good companion for pass 2/3 fixes. (For
  correctness bugs, use `/code-review` instead — `/simplify` is quality-only.)

`fallow` has no path filter — extract the JSON for the target files with a small
node script when you need a per-file before/after (see
[[fallow-baseline-before-implementation]]).

## Output contract

```markdown
- target_scope:
- gate_mode:            # single_persona | multi_persona | all_hands
- pass_1_kiss_dry_yagni:   # e.g. 2/3, 2/3, 2/2 + evidence note
- pass_1_score:
- pass_1_fixes:
- pass_2_kiss_dry_yagni:
- pass_2_score:
- pass_2_fixes:
- pass_3_kiss_dry_yagni:
- pass_3_score:
- pass_3_fixes:
- fallow_before / fallow_after:   # health/dupes/audit deltas
- final_status:        # PASS | FAIL | MANUAL STEP REQUIRED
- escalation_decision:
```

Record the pass scores and the `fallow` before/after deltas in the SESSION file
(SESSION docs are this repo's canonical ledger — there is no separate usage ledger).

## Quick trigger rules

1. Trigger immediately when a review note includes **"overlap," "duplicate,"
   "scope drift,"** or **"too complex."**
2. Trigger when a new component/action/schema is proposed and `cody-preflight`'s reuse
   scan found a candidate — confirm DRY before building.
3. Trigger when a protocol/governance file is edited without a deterministic rubric
   update.

## Cross-references

- [Three-Pass Loop](three-pass-loop.md) — the score→fix→review engine and gate modes.
- [Cody Pre-flight Protocol](cody-preflight.md) — reuse-first guard upstream of this check.
- [Cody](../agents/cody.md) — the role that runs this loop.
