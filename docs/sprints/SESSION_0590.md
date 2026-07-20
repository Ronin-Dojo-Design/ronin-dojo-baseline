---
title: "SESSION 0590 — L1: conform docs to ADR 0051 taxonomy (kernel→brand→app)"
slug: session-0590
type: session--implement
status: staged
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
sprint: S12
lane: repo
recipe: lane
goal_ids: [G-023]
tickets: []
pairs_with:
  - docs/architecture/decisions/0051-brand-platform-product-portfolio-taxonomy.md
  - docs/sprints/SESSION_0589.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0590 — L1 taxonomy conform-cascade

> **Pre-staged stub (ADR 0049), planned SESSION_0589.** Reservation branch
> `session-0590-taxonomy-conform`. Adopt: verify number (FS-0030), ff branch to main, flip
> `staged`→`in-progress`. **Docs-only — free push (no `apps/web` change → `ignoreCommand` skips
> prod).**

## Date

<fill at adopt>

## Operator

Brian + <agent>-session-0590

## Goal

Cascade the **ratified [ADR 0051](../architecture/decisions/0051-brand-platform-product-portfolio-taxonomy.md)**
vocabulary through the North Star docs (the conform work PL-004 deferred). Behavior-preserving prose
edits — no schema, no code.

**Pinned decisions (from ADR 0051 — do NOT re-open):** kernel→brand→app spine (app=deploy unit);
optional suite→product→feature nesting; old "platform"=kernel, old "product"=app, "product" now=a
feature-area; white-label instance axis (Baseline→White Labeled Dojo, RDD resells, Tuff Buffs=pilot
instance); 7 brands (RDD·BBL·Mammoth·Baseline·WEKAF·ACD·Tuff-Buffs-instance).

**Owned files (disjoint set):**
- `CLAUDE.md` — the "Repo & product strategy (ADR 0034)" North Star block → restate to kernel/brand/app.
- `docs/knowledge/wiki/ronin-project-context.md` — "Repo & product strategy" table + Brands table.
- `docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md` — add ADR 0051 supersede banner (vocabulary).
- `docs/architecture/decisions/0038-per-product-database-separation.md` — banner: "product"→"app".
- `docs/architecture/decisions/0040-design-system-doctrine-and-card-architecture.md` — banner: this is "the kernel" tier (name fixed, model intact).

**Non-goals:** no rename of the `Brand` enum / code; no dashboard build (that's L4); no vault work (PL-008).

## First task

Adopt per ADR 0049; read ADR 0051 in full; grep `platform`/`product` in the owned files and restate
per the word-fix table. Run wiki-lint + `docs:nav` regen at close.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0590_TASK_01 | pending | Restate CLAUDE.md + ronin-project-context North Star to ADR 0051 |
| SESSION_0590_TASK_02 | pending | Supersede banners on ADR 0034 / 0038 / 0040 |

## Next session

### Goal

### First task
