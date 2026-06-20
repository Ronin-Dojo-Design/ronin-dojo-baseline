---
title: "Three-Pass Loop"
slug: three-pass-loop
type: protocol
status: active
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0423
pairs_with:
  - docs/protocols/pr-review-score-fix-loop.md
  - docs/protocols/hostile-close-review.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - review
  - quality-gate
---

# Three-Pass Loop

> Promoted from the legacy `RoninDashboard/protocols/THREE_PASS_LOOP.md` (SESSION_0423).
> Leaned for this repo: the monorepo's Petey-baton `.sh` pre-step, the
> `three-pass-loop.sh` automation helper, and the RoninDashboard usage-history ledger
> are dropped; the Julie/Damian personas map to this repo's roster (Petey / Cody);
> scores land in the SESSION file `## Review log`; and PASS is **≥9.5** to match
> [`merge-to-main`](merge-to-main.md) + [`hostile-close-review`](hostile-close-review.md)
> (the monorepo original used 9.6).

The reusable **score → fix → review** engine. This is the deterministic core that other
loops lean on: [`pr-review-score-fix-loop`](pr-review-score-fix-loop.md) and the
`kiss-dry-yagni-loop` (forthcoming) both build their lane-specific flows on top of this
contract. When a lane needs a graded, repeatable verdict instead of an ad-hoc skim, run
this loop.

```text
REVIEW SCORE → FIX → REVIEW SCORE → FIX → REVIEW SCORE → FIX
```

Reusable for task / plan / phase / sprint audits and protocol/governance audits alike.

## Status vocabulary

Strict — matches every review doc in this repo:

- `PASS`
- `FAIL`
- `MANUAL STEP REQUIRED`

## Gate modes (required)

Every loop declares one `gate_mode` before pass 1:

1. `single_persona` — one reviewer only (e.g. **Cody** or **Doug**).
2. `multi_persona` — two or more reviewers (e.g. **Cody + Doug**, **Giddy + Doug**).
3. `all_hands` — **Petey + Cody + Doug + Giddy** (add **Desi** when design/brand scope
   exists).

### Gate-mode selection rules

Use the smallest valid mode, then escalate if the threshold is not met.

1. `single_persona` when **all** are true:
   - isolated surface (`≤3` files),
   - low risk,
   - no cross-brand impact.
2. `multi_persona` when **any** are true:
   - cross-file or service-level change,
   - security/runtime risk present,
   - WO-scoped behavior-contract updates.
3. `all_hands` when **any** are true:
   - sprint-level or cross-brand change,
   - governance/protocol changes,
   - token/storage/ops risk,
   - two consecutive failed sessions on the same lane.

## Score normalization (10-point)

Each active reviewer assigns `0–10`. The gate score is their average:

```text
gate_score = average(active_reviewer_scores)
```

Bands:

- `≥9.5` → `PASS`
- `8.5–9.4` → `FAIL` (fix required)
- `<8.5` → `FAIL` (scope-tighten or escalation required)

## Pass contract (fixed to 3)

1. **Pass 1 (Baseline):** score current state, record findings, choose targeted fixes.
2. **Pass 2 (Correction):** apply highest-value fixes, rerun validation, re-score.
3. **Pass 3 (Hardening):** apply residual fixes, rerun validation, final score + closure
   decision.

After pass 3:

- If `≥9.5` → close `PASS`.
- If `<9.5` → do **not** close; escalate the lane (`QF → WO → Sprint`) or set
  `MANUAL STEP REQUIRED`.

## Escalation rules

1. `single_persona` fail after pass 2 → escalate to `multi_persona` for pass 3.
2. `multi_persona` fail after pass 3 → escalate next session to `all_hands`.
3. `all_hands` fail after pass 3 → open a governance WO and block promotion until
   resolved.

## Required output block

```markdown
- gate_mode:
- active_reviewers:
- pass_1_score:
- pass_1_findings:
- pass_1_fixes:
- pass_2_score:
- pass_2_findings:
- pass_2_fixes:
- pass_3_score:
- pass_3_findings:
- pass_3_fixes:
- final_status: PASS|FAIL|MANUAL STEP REQUIRED
- escalation_decision:
```

Record the pass scores in the SESSION file `## Review log` (the cross-session ledger was
retired — SESSION files are canonical).

## Cross-references

- [PR Review → Score → Fix Loop](pr-review-score-fix-loop.md) — the PR-lane flow built on
  this engine.
- `kiss-dry-yagni-loop` — the simplification-lane flow built on this engine (forthcoming).
- [Hostile Close Review](hostile-close-review.md) — the session-close scoring sibling
  (same `≥9.5` bar).
- [Petey](../agents/petey.md) · [Cody](../agents/cody.md) · [Doug](../agents/doug.md) ·
  [Giddy](../agents/giddy.md) · [Desi](../agents/desi.md)
