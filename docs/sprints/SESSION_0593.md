---
title: "SESSION 0593 — PLAN: State-of-Dojo /app admin landing + token-cost (L4)"
slug: session-0593
type: session--plan
status: in-progress
created: 2026-07-20
updated: 2026-07-21
last_agent: claude-session-0593
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

2026-07-21

## Operator

Brian + claude-session-0593

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
  - **⚠ CROSS-LANE BOUNDARY (SESSION_0599 / G-026 — ratified by operator):** the landing **SHELL** is
    owned by the admin-consolidation lane (**G-026**, the WRITE side), **not** this lane. **0593 delivers
    CONTENT; 0599 owns the SHELL** — no landing tug-of-war. 0593's deliverable here = each read surface as
    a **self-fetching async panel behind a FROZEN import-path contract** — proposed
    `components/app/state-of-dojo/{state,component-catalog,card-catalog,cookbook}-panel.tsx`,
    placement-agnostic (no outer margin/width), optional `{ compact? }`, owning its own Suspense + empty
    state. G-026's `DashboardLanding` shell **mounts** these (WS-3, serial-gated on this freeze). **Action
    needed: 0593 signs off / freezes the panel import-path + prop signature**, and lands
    placeholder-returning skeleton panels first so 0599 has something importable. PL-003 point 5 amended
    accordingly. (Ref: SESSION_0599 grill Fork 2/5; goals-ledger G-026.)
- Ritual wiring: new render (opening) / update (closing) steps + the reusable **`sotd` skill**.
  **Operator CONFIRMED the intent (SESSION_0588): bow-in renders what's *planned*, bow-out renders
  what *changed* — grill the HOW, not the WHETHER.** The publish channel now EXISTS — `/preview-artifacts`
  (landed 0589 wave) is exactly the "agent publishes via the Artifact tool" step the projection protocol
  prescribes; it was the only missing piece (the render script + protocol shipped 0585, never wired into
  `opening.md`/`closing.md`). The `sotd` skill is a **rung-3 abstraction** (SOT_Cookbook §"abstraction
  ladder") — author it AFTER the ritual step runs 2–3 times, not upfront.
- **GLL_Epic cards** (G-025 / PL-007): Kaizen + Giddy-Lessons render here as a **content type** —
  coordinate with the GLL plan (`session-0594`).
- **DBS component** (PL-009 / `session-0596`): the Daily Bug Scan findings render as a **visual UI/UX
  component** here — on the local opening/closing artifact AND the pushed `/app` admin landing.
  Consume the DBS data contract defined by `session-0596`.
- Token-cost (PL-006): telemetry schema (SESSION `telemetry:` frontmatter seed) · $/token cost model +
  owner · shared component vs two renders · dataviz treatment (`dataviz` skill, semantic-token palette).
- ~~D-051 parser fix~~ **RESOLVED SESSION_0588** — the projection parser already maps `closed-*` → `done`
  (`state-of-project-parse.ts:97` `/^closed/i`, tested + corpus-verified); drift-register D-051 closed. Drop from scope.

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
