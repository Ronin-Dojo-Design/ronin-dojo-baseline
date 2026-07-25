---
title: "SESSION 0668 — wave-9 BBL reference invoice from README hours (updated estimate) (auto lane, wave 9/10 — final pair)"
slug: session-0668
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0668
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0668 — wave-9 BBL reference invoice from README hours (updated estimate) (auto lane, wave 9/10 — final pair)

> Staged by the SESSION_0635 orchestrator (waves 9+10 — operator-directed, morning-deadline work).
> Adopt at lane start: flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0668-bbl-invoice-ref`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

wave-9 BBL reference invoice from README hours (updated estimate).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0668_TASK_01 | done | Dated + quoted the README hours baseline, updated it with a transparent session-count method, wrote `billing-reference-draft.md` |

## What landed

An INTERNAL-REFERENCE-only BBL hours/valuation draft (never to be sent to Bob Bass — operator's
own reference), built entirely from committed repo evidence:

- **README baseline dated.** `README.md`'s "~1,400 hours" / "2,432+ commits" table (lines 33–39)
  was last set by commit `6de6d20e2` (2026-06-20, "docs: reposition README to Black Belt Legacy
  (BBLApp v4.4) + add public FEATURES.md"); the hours phrase itself first appeared in `0797d79f`
  (2026-06-19, launch-day banner). `git blame` confirms no later commit touched those lines.
  Baseline commit count for "this app" at that commit: 841 (`git rev-list 6de6d20e2 --count`,
  consistent with the README's own "822+" floor). Baseline session count: 422 numbered
  `SESSION_NNNN.md` files (`git ls-tree -r 6de6d20e2 -- docs/sprints`).
- **Method.** README's own blended rate = 1,400 hrs ÷ 2,432 commits ≈ 0.5757 hrs/commit. Split
  across the two build eras (monorepo 1,610 commits ≈ 915.8 hrs, frozen; this-app 841 commits ≈
  484.2 hrs) to derive an hours/session rate for "this app": 484.2 ÷ 422 sessions ≈ 1.147
  hrs/session. Applied to sessions since baseline: 198 net-new merged (`docs/sprints/` numbered
  files, 620 now vs. 422 at baseline) + 39 unmerged `auto/session-*` branches (marked "in review")
  = 237 incremental sessions × 1.147 ≈ 271.8 hrs. Cross-checked against raw commit growth on
  `origin/main` since baseline (672 commits × the same rate ≈ 387 hrs, directionally higher as
  expected — recent "wave" sessions bundle more commits/session than the historical average — so
  the session-based figure is treated as the conservative floor, matching the README's own "and
  that's a floor" posture).
- **Updated total:** ≈1,672 hours (1,400 baseline + 271.8 since baseline) → **$334,400 @ $200/hr
  standard** / **$167,200 @ $100/hr F&F**. Itemized by era (monorepo foundation / BBL bootstrap →
  launch / post-launch hardening-merged / tonight's wave-in-review) in the draft, each with its own
  commit/session/hour/dollar breakdown.
- **Honesty note included:** flags that Era 1 (monorepo) and Era 3 (post-launch) both carry
  material non-BBL kernel/multi-brand work (Mammoth CRM, RDD marketing) — a rough title-tag scan of
  the 221 sessions numbered since baseline shows ~82% mention BBL, ~28% Mammoth, ~17% RDD
  (overlapping) — so the operator should apply judgment on any BBL-only haircut. This is a
  valuation reference, not a billed-hours audit, and Bob Bass is named only as the nominal
  recipient of the hypothetical build.

## Files touched

| File | Change |
| --- | --- |
| `docs/product/black-belt-legacy/billing-reference-draft.md` | New — internal-only BBL hours/valuation reference draft |
| `docs/sprints/SESSION_0668.md` | This close |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `git blame -L 33,45 -- README.md` | exit 0 — confirms `6de6d20e2` (2026-06-20) is the last commit to touch the hours table, no later edits |
| `git rev-list 6de6d20e2 --count` | exit 0 — 841 (baseline this-app commit count) |
| `git ls-tree -r 6de6d20e2 -- docs/sprints \| grep -oE 'SESSION_[0-9]{4}\.md' \| sort -u \| wc -l` | exit 0 — 422 (baseline session count) |
| `find docs/sprints -name 'SESSION_[0-9][0-9][0-9][0-9].md' \| grep -oE 'SESSION_[0-9]{4}' \| sort -u \| wc -l` | exit 0 — 620 (current session count) |
| `git branch -r \| grep -c auto/session` | exit 0 — 39 (unmerged sessions in review) |
| `git rev-list 6de6d20e2..origin/main --count` | exit 0 — 672 (commit cross-check) |
| Docs-only change — no build/typecheck/test gates apply | n/a |

## Proposed ledger edits

None needed beyond a pointer: this draft is a one-off internal reference, not a repo-wide
wiring/drift/SOP finding — no ledger entry warranted. If the operator later wants a real BBL-only
(non-kernel) hours split, that would be a follow-up session reading the 237 incremental session
files individually rather than title-tag sampling.

## Open decisions / blockers

None — draft is complete and self-contained.

## Residual for AM merge

Operator should sanity-check the core assumption: reusing the README's blended
1,400-hrs/2,432-commits rate (≈0.576 hrs/commit → ≈1.147 hrs/session) to extrapolate forward.
If the operator has a different gut-check rate (sessions varied a lot in size across 422→659), the
itemization table in `billing-reference-draft.md` §4 makes it easy to re-run with a different
hrs/session constant.

