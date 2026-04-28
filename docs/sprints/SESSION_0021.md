---
session: "0021"
date: 2026-04-29
operator: Brian Scott
status: planned
goal: "Land Schema Wave A migration — school ops models + Dirstarter compliance refresh"
lane: Core platform
worktree: wt-core-platform
health: 5
last_agent: null
pairs_with:
  - docs/protocols/WORKFLOW_5.0.md
  - docs/architecture/s2-schema-additions.md
  - apps/web/prisma/schema.prisma
backlinks:
  - docs/sprints/SESSION_0020.md
  - docs/knowledge/wiki/index.md
---

## Goal

Land Schema Wave A — the ~20 school-operations models from s2-schema-additions.md Pass 1 — into the Prisma schema as a clean migration. Validate Dirstarter alignment for all touched layers.

## Inputs to read

1. `docs/protocols/WORKFLOW_5.0.md` — governing protocol (new)
2. `docs/architecture/s2-schema-additions.md` — full model specs (passes 1–3)
3. `apps/web/prisma/schema.prisma` — current schema baseline
4. `docs/sprints/SESSION_0020.md` → `Next session` section
5. `docs/architecture/source/Ronin-Dojo-Launch-Deep-Research-Brief.md` § migration waves

## Deliverables (max 3)

1. **Wave A models added to schema.prisma** — Program through OrgSettings (Pass 1 core set)
2. **Migration runs cleanly** — `bun db:migrate dev` succeeds, seed data loads
3. **Dirstarter alignment table filled** — justify any extension/replacement of baseline layers

## First task

Freeze model names for Wave A. Cross-check s2-schema-additions.md Pass 1 model list against the existing schema — confirm no naming collisions, no missing relations, no orphaned enums. Then begin adding models to `schema.prisma` in dependency order.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | DB (Prisma schema extension) |
| Extension or replacement | Extension — adding domain models alongside existing Dirstarter models |
| Why justified | Core member lifecycle cannot function without scheduling, attendance, billing models |
| Risk if bypassed | No operational backend for Baseline launch; all UI is dead endpoints |

## Status

`planned` — will activate on bow-in.

## What landed

_Session not yet started._

## Files touched

_Session not yet started._

## Decisions resolved

_Session not yet started._

## Open decisions / blockers

- s2-schema-additions.md sign-off checkboxes still unchecked — need formal sign-off before migration
- Launch strategy (Option A-plus) not formally locked — confirm at session open

## Next session

_Determined at close._
