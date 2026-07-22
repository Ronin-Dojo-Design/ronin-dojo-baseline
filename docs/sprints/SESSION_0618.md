---
title: "SESSION 0618 — G-031 S2/S3: formalize /pp·/ppp + create /ggr"
slug: session-0618
type: session--implement
status: staged
created: 2026-07-22
updated: 2026-07-22
last_agent: claude-session-0617
sprint: S12
lane: repo
recipe: ""
goal_ids: ["G-031"]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0617.md
  - docs/architecture/decisions/0052-lean-single-lane-baton-session-model.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0618 — G-031 S2/S3: formalize /pp·/ppp + create /ggr

> **Pre-staged stub (ADR 0049), staged 2026-07-22 by SESSION_0617 bow-out.** Adopt at bow-in: flip
> `staged` → `in-progress`, run the FS-0035 canonical-occupancy check, then execute below.

## Operator

Brian + <agent>-session-0618

## Goal

Build the next two disjoint slices of **G-031** (lean session model, ratified in ADR 0052): **S2** formalize
`/pp`·`/ppp` and **S3** create `/ggr`. Both governance/docs — no deploy. Fan-out candidates.

## Next session

**First task:**
- **S2 — `/pp` · `/ppp`:** ONE `petey-plan` skill, two modes — `/pp` = Parse→Plan, `/ppp` = `/pp --prompt`
  (emit the paste-ready baton). Consolidate with `docs/protocols/petey-plan.md`; flip SSL-001/002 → done.
- **S3 — `/ggr`:** Giddy Gate Review skill — hostile/red-hat review + `code-quality-matrix` score, **≥9.0
  clears · 2 auto-retries · hard-caps always loop**, operator gate (accept / try-again / keep-improving);
  wraps `seq-review-wave` + `/code-quality` + `hostile-close-review`. Flip SSL-003 → done.

Inputs to read: [ADR 0052](../architecture/decisions/0052-lean-single-lane-baton-session-model.md) ·
[G-031](../knowledge/wiki/goals-ledger.md) · `petey-plan.md` · `code-quality-matrix.md` · the bow-in redesign artifact.

**Then:** S4 (facet migration `lane:`→`brand:` + `stage:`) and S5 (`opening.md` rework — HIGH, own Build+QAR).

## Task log

<!-- SESSION_0618_TASK_01 … filled at bow-in -->

## Status

Single source of truth is the frontmatter `status:` field.
