---
title: "SESSION 0588 — merged-trunk code-quality suite over the 0583–0586 sweep range"
slug: session-0588
type: session--review
status: staged
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0587
sprint: S12
lane: repo
recipe: review
goal_ids: [G-022, G-023]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0587.md
  - docs/protocols/page-code-review.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0588 — merged-trunk code-quality suite

> **Pre-staged stub (ADR 0049).** Created at SESSION_0587 bow-out. Reservation branch
> `session-0588-quality-suite-review`. The operator holds the finalized bow-in prompt (delivered
> in the 0587 chat); adopt this stub, verify the number via FS-0030, and run.

## Date

<fill at adopt>

## Operator

Brian + <agent>-session-0588

## Goal

Run the **merged-trunk variant** of the code-quality suite (`docs/protocols/page-code-review.md`,
SESSION_0567 shape) over the SESSION_0587 merged trunk (0583–0586 on local `main`): fallow
baseline → scored review (`/code-quality` + Desi UX lens) → `/fallow-fix-loop` for Class-A /
hard-cap fixes (behavior-preserving) → re-verify → prove the fallow delta. **First:** review/tweak
the page-code-review recipe with the operator — possibly conform it into a
`docs/protocols/recipes/quality-suite.md` card (0584 recipe-card format).

## First task

Bow-in per ADR 0049; grill the operator on the recipe before running. Carry in: **0583's C5
selected→hover neighborhood-glow redesign needs a Desi/operator design sign-off** (0587 Giddy P3);
and the **apps/web fixture-ownership test class** (0587: 47 fail, proven non-regression; the fix is
unmerged `session-0551-test-infra` `9d845bdd`; if 0587's trunk is still held on that, note it).
Read `docs/sprints/SESSION_0587.md` (§Full close evidence + Open decisions) first.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0588_TASK_01 | pending | Review/tweak page-code-review recipe (± conform to a recipe card) |
| SESSION_0588_TASK_02 | pending | Run merged-trunk quality suite over 0583–0586 (baseline → review → fix → delta) |

## Next session

### Goal

### First task
