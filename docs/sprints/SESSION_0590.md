---
title: "SESSION 0590 — L1: conform docs to ADR 0051 taxonomy (kernel→brand→app)"
slug: session-0590
type: session--implement
status: closed
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0590
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
| SESSION_0590_TASK_01 | done | Restated CLAUDE.md North Star + ronin-project-context (strategy block + 7-brand portfolio table) to ADR 0051 kernel→brand→app |
| SESSION_0590_TASK_02 | done | Supersede banners on ADR 0034 (platform→kernel, product→app) / 0038 (product→app) / 0040 (this = the kernel tier) |

## Bow-in

- **Branch base discrepancy (flagged to operator):** the dispatch said "ff 0590 to main," but ADR
  0051 + this stub are NOT on main — the 0589 planning work is committed on
  `session-0589-feature-widget-plan` (`fe124e6a`), unmerged/held. Fast-forwarded 0590 to the 0589
  tip instead (clean ff; `fe124e6a` is a descendant of main `e56a0701`) so the lane has the ADR it
  conforms to. FS-0030: 0596 highest, 0590 valid.

## What landed

- **ADR 0051 vocabulary cascaded through the 5 North Star docs — behavior-preserving prose only,
  no schema/code/`Brand`-enum rename.** kernel→brand→app spine; old "platform"=kernel, old
  "product"=app (deploy unit), "product" now=feature-area; white-label instance axis; 7-brand
  portfolio (RDD·BBL·Mammoth·Baseline·WEKAF·ACD·Tuff-Buffs-instance).
- CLAUDE.md North Star restated + white-label axis bullet added; ronin-project-context Brands table
  expanded 4→7 brands with the disambiguation note + strategy block conformed; ADR 0034/0038/0040
  carry supersede/name-fix banners (bodies preserved as historical record — banner-only per spec).
- **Disambiguation preserved:** portfolio "brand" (ADR 0051 top unit) vs the DEAD in-app 4-brand
  `Brand`-enum harness — called out in both CLAUDE.md and ronin-project-context so the two senses
  never collide.
- Goal **achieved** — docs-only conform lane; gates green.

## Files touched

- `CLAUDE.md` — North Star block → kernel/brand/app + white-label axis.
- `docs/knowledge/wiki/ronin-project-context.md` — 7-brand portfolio table + strategy block + disambiguation.
- `docs/architecture/decisions/0034-...md` — ADR 0051 vocabulary supersede banner.
- `docs/architecture/decisions/0038-...md` — "product"→"app" banner.
- `docs/architecture/decisions/0040-...md` — "the kernel tier" name-fix banner.
- `docs/sprints/SESSION_0590.md` — this record.

## Full close evidence

| Step | Proof |
| --- | --- |
| Frontmatter sweep | `updated`→2026-07-20 + `last_agent`→claude-session-0590 on ronin-project-context + ADR 0034/0038/0040. |
| Wiki lint | `bun run wiki:lint` → **0 errors** / 60 warnings (all pre-existing R8 in unrelated files; the one 0590 stub warning fixed). |
| docs:nav | `bun run docs:nav` regenerated `docs/index.html` (1031 docs) — gitignored, NOT committed. |
| Behavior-preserving | prose/vocabulary only; zero schema/code/`Brand`-enum edits; ADR bodies preserved (banner-only). |
| Git hygiene | branch `session-0590-taxonomy-conform` (based on 0589 tip fe124e6a); commit on branch; **push HELD** for operator word. Docs-only → free push (`ignoreCommand` skips prod) when authorized. |

## Next session

### Goal

### First task
