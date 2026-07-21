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

## Petey plan — the fan-out (grill complete, all forks resolved SESSION_0593)

State-of-Dojo is **not one page — it is a projection framework**: read a docs/ledger source →
render browsable cards with ONE vocabulary (planned/in-flight/done ladder · brand tabs · active/beta
badges). State, Component-Catalog, Card-Catalog, and the Cookbook surface are all instances of it.

### Resolved decision ledger (operator-ratified, do NOT re-open)

| # | Fork | Resolved |
| --- | --- | --- |
| 1 | Publish + scope | Both, **shared core**. Umbrella-7-brands = **Artifact now**; **BBL `/app/state`** = first in-app brand surface; in-app umbrella **deferred behind the RDD deploy** (SESSION_0598). |
| 2 | Composition | **Discipline, not** the literal AdminCollection frame (ADR 0045 D4 — a dashboard is not a list). The landing is a composition hosting conformed pieces. |
| 3 | Ritual | **On-demand** render step in opening/closing; **defer** the `sotd` skill (rung-3 — author after it runs 2–3×). |
| 4 | Token-cost | Its **own build lane (WS-D)** under G-023 (may graduate to its own G-row). |
| 5 | Framework | **ONE** projection framework + a thin **source-adapter per catalog** ("a parser + a registration"). |
| 6 | Admin consolidation | **Spun out → SESSION_0599 / G-026** (owns the WRITE side + landing shell). |
| 7 | Cards | A **facet** of the Component-Catalog (one source, a Cards tab) — ADR 0040 (cards are components). |
| 8 | Catalog source | Project the **PWCC spec files** (`docs/knowledge/wiki/files/*.md` frontmatter: `status`/`lifecycle`/`wiring`) + a thin `brands:` field; `bugs` via DBS cross-ref. NOT the 450 KB prose inventory. |
| 9 | Annotation locus | `/files` specs as the structured SoT; evolve to in-code hybrid only if drift bites. |
| 10 | Lifecycle recipes | Thin **modular family (WS-E)** + existing recipes **point** at it (never copy). |
| 11 | Fan-out shape | **Framework-first**, thin per-catalog children. |
| — | Doctrine pinned | Token-cheapest recipe structure = **thin pointer-cards + lazy per-phase load + invariants written once**. PL-006's tracker measures it. |

### The FROZEN cross-lane contract (WS-3 gate — ratified with SESSION_0599 / G-026)

- **Panel import-path (ratified `components/app/state-of-dojo/*`)** — conforms to 0599's already-committed
  WS-3 path (Giddy merge-strategy: cheaper than rewriting committed ledger rows; better name — a cohesive
  feature namespace). The rejected alternative `components/admin/projection/*` is DEAD.
- **Panels:** `components/app/state-of-dojo/{state,component-catalog,card-catalog,cookbook}-panel.tsx` —
  each a **self-fetching async panel**, placement-agnostic (no outer margin/width), optional `{ compact? }`,
  owning its own Suspense + empty state. Shared framework kernel lives at `state-of-dojo/_kernel/*`.
- **Ownership invariant:** SESSION_0599 owns `app/app/page.tsx` + the `DashboardLanding` shell; **0593
  mounts by import ONLY and never writes `page.tsx`.** 0593 lands **placeholder-returning skeleton panels
  first** so 0599 has something importable (unblocks WS-3).
- **Section/card contract for siblings:** GLL cards (SESSION_0594 / G-025) + the DBS component
  (SESSION_0596) render into the State surface as content-types via this same panel/section contract;
  DBS bug data feeds WS-B's `bugs` field.

### Work-streams (build lanes — dispatch AFTER the plan sessions land)

| WS | Owns (new files) | Depends on | Notes |
| --- | --- | --- | --- |
| **WS-A — Kernel + State surface + freeze** | `components/app/state-of-dojo/_kernel/*` · `state-panel.tsx` · **placeholder** `{component-catalog,card-catalog,cookbook}-panel.tsx` · `app/app/state/*` · on-demand ritual step in `opening.md`/`closing.md` | 0585 parse core | **LANDS FIRST** — freezes the contract, unblocks 0599 WS-3 + all sibling WS |
| **WS-B — Component/Card-Catalog** | `component-catalog-panel.tsx` (real) · `app/app/components/*` · `lib/state-of-dojo/component-catalog-parse.ts` · `brands:` in SPEC_TEMPLATE | WS-A + DBS contract (0596) | Cards = a facet/tab, not a 2nd source |
| **WS-C — Cookbook surface** | `cookbook-panel.tsx` (real) · `app/app/cookbook/*` · parser for `SOT_Cookbook.md` + `recipes/*` | WS-A | |
| **WS-D — Token-cost tracker** | `components/app/state-of-dojo/token-cost/*` · `telemetry:` frontmatter schema · $/token cost table + owner · dataviz (`dataviz` skill) | WS-A + `telemetry:` seed | own lane under G-023 |
| **WS-E — Lifecycle recipe family** (docs) | `docs/protocols/recipes/component-lifecycle/{plan,design,build,review,wire}` + pointer lines in `epic-plan.md`/`lane.md`/`cody-preflight.md` + SOT_Cookbook register | none | independent; docs-only |

**Disjointness (pairwise-empty, per Giddy):** each WS owns its own `*-panel.tsx`; `_kernel/*` is WS-A's
(others import, never edit). WS-B/C/D *replace* a WS-A placeholder → they **rebase on WS-A** (serial), not
a parallel-file conflict. `app/app/page.tsx` is 0599's, never touched here. Holds iff WS-A lands first.

### Merge / land order + shared-ledger discipline (Giddy merge-strategy, G0–G4)

- **Plan sessions to main:** delete `session-0590` (redundant twin) → **0599 → 0593 → 0598** → 0594/5/6
  (rebase+last). Serialized `rebase` + `git merge --ff-only`, all **local at G3**; committed trees are
  disjoint so rebases are conflict-free. **Hold at G3 — one push at close on the operator's word → G4.**
- **Shared ledgers** (`goals-ledger` · `planning-ledger` · `SOT_Cookbook`) = the fan-out's serialization
  point: **EOF-append new rows · single-owner in-place status edits OK · serialize the ledger-touching
  lands · drop per-lane `last_agent` bumps** (land owner stamps once). This session touches only PL-003
  status + PL-006 status (in-place, single-owner, disjoint from 0599's PL-003 p5 amend).
- **Prevention:** every parallel lane gets its OWN worktree; the canonical checkout never switches off its
  lane branch (the 0599 squat root-caused this session's collision — see recovery commit `dc7ecc01`).

### Parallel sibling lanes (staged this session — prompts delivered to operator)

- **SESSION_0598** (RDD deploy plan — `apps/rdd` + separate DB/deploy/email + the new-brand/new-client
  intake·onboarding·interview recipe-card family). Worktree-isolated at `../ronin-dojo-app-0598`, committed.
- **SESSION_0599 / G-026** (admin-surface consolidation — the landing shell + carousel + nav + 44-route
  consolidation). Committed; owns the WRITE side + `DashboardLanding` that mounts this lane's panels.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0593_TASK_01 | done | Grill PL-003 forks → framework fan-out (publish · per-product · two-source · composition · ritual/skill). All 11 forks resolved (see decision ledger). |
| SESSION_0593_TASK_02 | done | Grill PL-006 token-cost → own build lane (WS-D) under G-023. |
| SESSION_0593_TASK_03 | done | De-collide the 3-session shared-checkout collision (Giddy merge-strategy ×2); recover 0593 lane (commit `dc7ecc01`); freeze the WS-3 panel-path contract. |
| SESSION_0593_TASK_04 | done | Stage parallel plan lanes: SESSION_0598 (RDD deploy) + SESSION_0599 (admin consolidation) — prompts delivered, branches claimed. |

## Next session

### Goal

**WS-A — projection kernel + State surface + freeze the panel contract** (SESSION_0603, staged stub,
branch `session-0603-sotd-kernel-state`). Build the `state-of-dojo/_kernel/*` projection framework, the
real `state-panel.tsx` + `/app/state` route, and **placeholder-returning** `{component-catalog,card-catalog,
cookbook}-panel.tsx` at the frozen path so SESSION_0599 WS-3 can import/mount. Wire the on-demand render
step into `opening.md`/`closing.md`. **Lands first** — unblocks 0599 WS-3 + WS-B/C/D.

### First task

Adopt SESSION_0603 (ADR 0049, worktree-isolated — do NOT squat canonical). Read this fanout's frozen
contract + decision ledger, the 0585 slice-1 artifacts, and SESSION_0599's WS-3 gate. Extract the 0585
parse core to a shared lib both the render script and the app consume. Cody-preflight before any component.
