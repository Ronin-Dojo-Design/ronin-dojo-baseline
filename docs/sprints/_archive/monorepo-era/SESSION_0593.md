---
title: "SESSION 0593 — PLAN: State-of-Dojo /app admin landing + token-cost (L4)"
slug: session-0593
type: session--plan
status: closed
created: 2026-07-20
updated: 2026-07-21
last_agent: claude-session-0593
next_session: session-0603
sprint: S12
lane: repo
recipe: epic-plan
goal_ids: [G-023]
tickets: []
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/sprints/SESSION_0589.md
  - docs/learning/ddd/learning-records/0018-parallel-lanes-and-the-canonical-checkout-squat.md
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

## What landed

- **Full `/pp` grill → executable fan-out (11 forks resolved).** State-of-Dojo re-framed as a
  **projection framework** (one source → cards; State/Component/Card/Cookbook are instances). Decision
  ledger + WS-A…E in `## Petey plan`.
- **Froze the WS-3 cross-lane contract** — panels at `components/app/state-of-dojo/*` (reconciled the
  path clash with SESSION_0599's committed path; `components/admin/projection/*` killed). 0599 owns
  `app/app/page.tsx`; 0593 mounts by import only.
- **Staged WS-A build stub** (SESSION_0603, branch claimed) — kernel + State + placeholder panels +
  on-demand ritual step; lands first.
- **Spun out two parallel plan lanes** — SESSION_0598 (RDD deploy + new-brand recipe family) +
  SESSION_0599 / G-026 (admin-surface consolidation). Paste-ready prompts delivered; both ran + committed.
- **De-collided a live 3-session shared-checkout collision** (Giddy merge-strategy ×2) — 0599 had squatted
  the canonical checkout, stranding 0593's file. Recovered clean (`dc7ecc01`), set up per-lane worktrees,
  produced the land order + shared-ledger discipline + prevention rule → **LR 0018 + FS-0034**.
- **Published the plan Artifact** (🥋 lane map · decision ledger · merge order). PL-003 + PL-006 → planned.

**Goal achieved:** yes — one executable fan-out + staged child stub + no product code. Push held.

## Files touched

| Path | Note |
| --- | --- |
| `docs/sprints/SESSION_0593.md` | the fanout plan + this close (recovery `dc7ecc01`, fanout `25dec3dc`) |
| `docs/sprints/SESSION_0603.md` (new) | WS-A build stub (staged) |
| `docs/knowledge/wiki/planning-ledger.md` | PL-003 + PL-006 → planned (in-place, single-owner) |
| `docs/learning/ddd/learning-records/0018-…md` (new) | Giddy LR — the canonical-checkout squat |
| `docs/protocols/failed-steps-log.md` | FS-0034 — the SOP miss (parallel lane in canonical) |
| `docs/knowledge/wiki/index.md` | SESSION_0593 session row |

## Decisions resolved

- The **11-fork decision ledger** (`## Petey plan`) — all operator-ratified.
- **Panel path = `components/app/state-of-dojo/*`** (ratified; reconciled with 0599's committed contract).
- **Admin consolidation** spun out → SESSION_0599 / G-026 (owns the WRITE side + landing shell).
- **RDD deploy** spun out → SESSION_0598.
- **Merge ownership:** the lead (canonical checkout) drives ONE serialized merge-wave; sessions self-close + hold.

## Open decisions / blockers

- **Merge-wave pending (deferred → this session's Next block + the land order in `## Petey plan`).**
  Operator closes 0598/0599 (holding at push gates); the lead then drives one serialized merge-wave
  (delete `session-0590` → 0599 → 0593 → 0598), holding each push for the operator's word. Nothing pushed.
- **0598's ledger rows are proposed-not-committed** (G-027/G-028/PL-011) — apply during its rebase after
  0599 lands (Giddy flagged).
- **0598 workspace label** — its commit says `apps/rdd`; an earlier brief said `clients/*`. Reconcile at
  0598 build (disjoint either way).

**Deferral-guard dismissals (§6.8):** 2 flags, both justified-dismissed — neither is un-ledgered rotting
work. (1) "in-app umbrella deferred behind the RDD deploy" = a **scope note** inside PL-003 (now `planned`),
gated on the staged SESSION_0598 lane — tracked by PL-003 + the 0598 stub. (2) "merge-wave pending" = an
**operational next-step**, captured in this session's `Next session` block + the `## Petey plan` land order +
the staged 0598/0599 lanes the next bow-in reads — not ledger-trackable future work.

## Reflections

- **The collision was self-inflicted and preventable.** A parallel PLAN session (0599) ran in the
  *canonical* checkout instead of a worktree, switched HEAD out from under this live session, and stranded
  uncommitted work on the wrong branch. 0598 did it right (own worktree). The fix is a **hard rule, not
  vigilance:** every parallel lane — plan OR build — gets its own worktree; the canonical checkout never
  leaves its home lane's branch. → LR 0018 + FS-0034.
- **What saved it:** backing up the dirty file to scratchpad + a `.patch` **before** dispatching any Bash
  subagent (the workflow-over-dirty-tree clobber hazard), and forbidding git mutations in the Giddy
  dispatch. Read-only merge analysis is safe; a review flow that `git stash`es is not.
- **Grilling against the committed docs paid off repeatedly** — "AdminTODOist" was RETIRED into the
  loop-board; the three catalogs are projections of docs that already exist; the panel path clashed with
  0599's committed contract. Each would've been a rebuild-or-collision if not caught by reading state first.
- **Cross-lane contract-by-direct-edit is fragile.** 0599 wrote its boundary note into 0593's SESSION file
  and left it uncommitted "for the owner" — well-intentioned, but that's exactly what stranded. In isolated
  worktrees the note can't strand.

## Full close evidence

| Gate | Result |
| --- | --- |
| Task log | PASS (4 rows, SESSION_0593_TASK_01…04) |
| Format-fix (code) | 0 code files (docs-only) |
| wiki:lint | 0 err / 61 warn (all pre-existing; none in touched files) |
| Build | skipped (docs-only — no `apps/web/**`) |
| Graphify | nodes=19219 · edges=36659 · communities=2606 |
| Git state | branch=session-0593-sotd-admin-landing-plan · clean · **held at G3 (no push)** |
| Secret scan | PASS (clean) |
| Kaizen reflection | yes — `## Reflections` + LR 0018 |
| Hostile close review | Giddy merge-strategy ×2 (the git/merge risk); no code review (docs-only) |
| Code-quality (Class-A) | n/a — no custom code this session |
| Runtime verification (Doug) | n/a — no runtime surface touched |
| Evidence-artifact URL | plan Artifact (on-request): https://claude.ai/code/artifact/d3d722c2-fe7e-469d-9d6c-908e940b6e76 |
| Review & Recommend | yes — Next session = WS-A (SESSION_0603) staged |
| Memory sweep | `parallel-lane-worktree-isolation` memory added/updated |
| Finding-router | FS-0034 (SOP miss) + LR 0018 (Giddy lesson); PL-003/006 cross-off → planned |
| Next session unblock | WS-A blocked on the merge-wave landing 0599→0593 first (noted) |
| Git hygiene | one close commit; hash reported at bow-out; push held for merge-wave |

## Review log

- **TASK_REVIEW (Giddy, merge-strategy ×2, read-only):** on the 3-session shared-checkout collision.
  Produced the recovery runbook (R0–R4), the land order (0590 delete → 0599 → 0593 → 0598), the
  shared-ledger de-collision rule, the build-lane disjointness proof (empty under 2 invariants), and the
  worktree-isolation prevention rule. References SESSION_0593_TASK_03. No open findings.

## Hostile close review

- **Docs-only plan session — no app diff, no runtime surface**, so the code hostile-review is n/a. The
  session's real risk was the **git/merge shape**, and Giddy ran the adversarial pass there (×2, read-only).
  Verdict: recovery clean, fanout disjoint under the two frozen invariants (panel path frozen to one
  0593-owned dir; 0599 sole writer of `page.tsx`), land order safe at G3, no secrets. **PASS.**

## ADR / ubiquitous-language check

- **No new ADR.** Session inherited ADR 0051 (taxonomy) · ADR 0045 (AdminCollection) · ADR 0040 (cards).
  The panel-path freeze + projection-framework framing are session-scoped plan decisions (reversible),
  captured in `## Petey plan` + LR 0018 — not ADR-worthy alone. Candidate terms ("projection framework",
  "panel contract", "catalog surface") noted; promote to ubiquitous-language only if they recur.

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
