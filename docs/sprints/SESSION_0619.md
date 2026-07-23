---
title: "SESSION 0619 — G-031 S4: facet migration (lane:→brand: + add stage:)"
slug: session-0619
type: session--implement
status: staged
created: 2026-07-22
updated: 2026-07-22
last_agent: claude-session-0618
sprint: S12
lane: repo
recipe: ""
goal_ids: ["G-031"]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0618.md
  - docs/architecture/decisions/0052-lean-single-lane-baton-session-model.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0619 — G-031 S4: facet migration (lane:→brand: + add stage:)

> **Pre-staged stub (ADR 0049), staged 2026-07-22 by SESSION_0618 bow-out.** Adopt at bow-in: flip
> `staged` → `in-progress`, run the FS-0035 canonical-occupancy check, ask the step-6b bow-in questions,
> then execute below.

## Operator

Brian + <agent>-session-0619

## Goal

G-031 **S4 — facet migration**: rename the brand axis `lane:` → `brand:` and add a new `stage:` facet
(`plan | build | qar`) per [ADR 0052](../architecture/decisions/0052-lean-single-lane-baton-session-model.md)
Decision 2. Mechanical mass-rename — governance/docs, no deploy.

## Next session

**First task:** the one-sweep migration (existing SESSION files + tooling break until frontmatter and parser
agree — ADR 0052 §Consequences):

1. **SESSION frontmatter:** `lane:` → `brand:` across `docs/sprints/SESSION_*.md`; add `stage:` where known.
2. **View filters:** the `--lane=` flags/readers → `--brand=` (+ a `--stage=` view).
3. **Parsers:** `scripts/ledger-backlog.ts` + `apps/web/scripts/board-backlog.ts` read the renamed facet.
4. **Prove:** both backlog scripts still run; a `--brand=`/`--stage=` filter returns the right set; wiki-lint clean.

Inputs: [ADR 0052](../architecture/decisions/0052-lean-single-lane-baton-session-model.md) §Decision-2 +
§Consequences · [G-031](../knowledge/wiki/goals-ledger.md) · `scripts/ledger-backlog.ts` ·
`apps/web/scripts/board-backlog.ts`.

**Then:** S5 (`opening.md`/`closing.md` full discover-then-load rework — HIGH, own Build+QAR) → S6 (settle ADR 0052).

## Task log

<!-- SESSION_0619_TASK_01 … filled at bow-in -->

## Status

Single source of truth is the frontmatter `status:` field.
