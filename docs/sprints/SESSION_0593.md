---
title: "SESSION 0593 — PLAN: State-of-Dojo /app admin landing + token-cost (L4)"
slug: session-0593
type: session--plan
status: staged
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
sprint: S12
lane: repo
recipe: epic-plan
goal_ids: [G-023]
tickets: []
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/sprints/SESSION_0589.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0593 — PLAN: State-of-Dojo admin landing (L4)

> **Pre-staged plan-me stub (ADR 0049), planned SESSION_0589.** Reservation branch
> `session-0593-sotd-admin-landing-plan`. This is a **`/pp` PLAN session** (no build) — L4 was too
> large to pin at 0589. Adopt: FS-0030, ff to main, flip status.

## Date

<fill at adopt>

## Operator

Brian + <agent>-session-0593

## Goal

`/pp` Petey plan → executable fan-out for the **State-of-Dojo `/app` admin landing** (PL-003) +
**Token-Cost-Tracker** (PL-006), the G-023 SOT-dashboard slice-2. Grill the open forks; do not
pre-resolve.

**Inherited pinned inputs (already ratified — do NOT re-grill):**
- **ADR 0051 taxonomy** → dashboard unit = **brand tabs** under the RDD umbrella (7 brands).
- **PL-005 skin law** = fixed-hue-brand-tint (semantic tokens hue-anchored + brand-tinted, contrast
  floor). The current mock's "semantic tokens NEVER re-skinned" comment is WRONG — fix at build.
- **Masthead name = per-skin:** "State of the Dojo" (dojo skins RDD/BBL); **"State of the Building"**
  (MMB/Mammoth). Drop the "(name pending)" provenance note; use the per-skin title map.

**Open forks to grill (from planning-ledger PL-003 + PL-006):**
- Publish mechanism: ritual renders an Artifact vs writes the in-app `/app/state` data source vs both.
- Per-product fan-out: one render → N product admin surfaces without cross-product data leak (separate
  DB + deploy per app, ADR 0038/0051).
- Two data sources on one surface: live-DB `AdminKanban` (`KanbanCard`) + the docs/frontmatter
  State-of-Dojo projection.
- Admin-landing composition must conform to the **AdminCollection one-surface law** (State + section
  cards + BBL v2 cards as ONE surface, not a god-page).
- Ritual wiring: new render (opening) / update (closing) steps + the reusable **`sotd` skill**.
- **GLL_Epic cards** (G-025 / PL-007): Kaizen + Giddy-Lessons render here as a **content type** —
  coordinate with the GLL plan (`session-0594`).
- **DBS component** (PL-009 / `session-0596`): the Daily Bug Scan findings render as a **visual UI/UX
  component** here — on the local opening/closing artifact AND the pushed `/app` admin landing.
  Consume the DBS data contract defined by `session-0596`.
- Token-cost (PL-006): telemetry schema (SESSION `telemetry:` frontmatter seed) · $/token cost model +
  owner · shared component vs two renders · dataviz treatment (`dataviz` skill, semantic-token palette).
- D-051 parser fix: map legacy `closed-*` statuses → `done` in the state projection parser.

## First task

Adopt per ADR 0049; read PL-003 + PL-005 + PL-006 (planning-ledger), the 0585 slice-1 artifacts
(`state-of-project.ts`, `state-of-project-projection.md`, `state-of-project-parse.ts`), and the
AdminCollection law before grilling.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0593_TASK_01 | pending | Grill PL-003 forks → fan-out (publish · per-product · two-source · composition · ritual/skill) |
| SESSION_0593_TASK_02 | pending | Grill PL-006 token-cost forks → slice or own goal |

## Next session

### Goal

### First task
