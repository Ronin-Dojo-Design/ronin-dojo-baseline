---
title: "SESSION 0459 — Per-product DB separation (ADR 0038) Phase 1: Mammoth DB + isolation proof"
slug: session-0459
type: session--implement
status: closed
created: 2026-06-27
updated: 2026-06-28
last_agent: claude-session-0459
sprint: S46
pairs_with:

  - docs/sprints/SESSION_0458.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0459 — Per-product DB separation (ADR 0038) Phase 1

## Date

2026-06-27

## Operator

Brian + claude-session-0459

## Goal

Execute **Phase 1** of the per-product DB-separation lane ratified in ADR 0038 (goals-ledger G-002):
establish + **prove** the per-product database pattern with **zero BBL risk**, local-first. Scaffold
Mammoth's own DB + a small client Prisma schema (translated from its localStorage model), prove an
isolated migration (a Mammoth migration creates tables only in `mammoth_dev`, leaving BBL's
`ronindojo_prodsnap` untouched), and document the per-app-DB convention + guardrail. No Neon, no prod,
no BBL data touched.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0458.md`
- Carryover: 0458 ratified **ADR 0038** (separate DB per product, BBL-own-repo deferred) + added the
  goals-ledger (GL). This session executes the ADR's **Implementation step 3–4** (scaffold the first
  client DB + prove isolated migrations). loop-board Phase B (G-003) is blocked on BBL's own DB and is
  out of scope here.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `3b2d3dc2`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma / database (per ADR 0038 "Dirstarter docs proof") |
| Extension or replacement | Extension: one `DATABASE_URL` + `prisma/` **per app** instead of one shared; same Prisma client/migration workflow per product |
| Why justified | ADR 0038 D1 — per-product DB removes the shared-DB blast radius; a client migration can no longer break BBL |
| Risk if bypassed | a client product's migration runs against the shared BBL DB → blast radius = whole platform |

Live docs checked during planning: Prisma (Dirstarter Database setup — extend, not replace, per ADR 0038).

### Graphify check

- Graph status: current; query run before code.
- Queries used:
  - `mammoth prisma datasource per-app database separation client schema`
- Files selected from graph:
  - `docs/runbooks/database/schema-migration.md`, `docs/runbooks/database/prisma-workflow.md`
- Verification note: opened the migration runbook + read Mammoth's `lib/{types,store,stages,content}.ts`
  and `apps/web/prisma.config.ts` directly; Graphify used as navigation, not proof.

### Grill outcome

Big decisions were resolved at 0458 (ADR 0038) and carried, not re-litigated. Petey resolved the
Phase-1 micro-forks:

1. **Columns vs JSON / table:** all `Project` scalars → columns; `photos` → a `BuildPhoto` relation
   table (1-to-many), **not** a JSON blob; `stage` → a `StageId` **enum + scalar field** (stages are
   config in `lib/stages.ts`, never a table). No JSON columns.
2. **`BuildPhoto.dataUrl`:** keep as `String @db.Text` (the MVP downscaled data-URL) — it is part of the
   translated model. Real object storage (R2/MinIO) is a Phase-2 concern (when Mammoth comes off
   localStorage), not Phase 1.
3. **`width`/`length`/`eaveHeight`:** `Int?` — every seed value is whole feet; nullable mirrors
   `number | null` in `types.ts`.
4. **Local DB name:** `mammoth_dev` (Postgres.app, `postgresql://brianscott@localhost:5432/mammoth_dev`).
5. **TASK_02 = run, not just generate:** `prisma migrate dev` **creates AND applies** the first
   migration to `mammoth_dev` — the applied tables are the isolation proof.
6. **Datasource shape:** ~~inline `url = env("DATABASE_URL")`~~ → **CORRECTED mid-session**: Prisma 7
   removed inline `url` from `schema.prisma` (validator P1012). The URL lives in a `prisma.config.ts`
   (`datasource: { url: env("DATABASE_URL") }` + `import "dotenv/config"`) — exactly why `apps/web` has
   one. Mammoth got its own minimal config (no Neon pooler logic; that's Phase 2). My earlier "inline is
   more standard" was outdated for Prisma 7.
7. **Auth/identity tables (ADR 0038 D5):** out of scope — Mammoth has no auth yet. `TeamMember` (CRM
   owner / sales rep) is modeled as a CRM concept, NOT auth; Better Auth identity is Phase 2.
8. **Generated client:** gitignore `clients/mammoth-build-crm/.generated/` (build artifact; not deploying
   Mammoth this session).
9. **Schema scope EXPANDED mid-session (operator-directed).** The carried "SMALL 2-model schema" was
   superseded by the operator's directive to research mammothbuild.com + HubSpot-replacement needs and
   build the real schema. Result: the HubSpot-replacement CRM core (10 models + 9 enums), every element
   traceable to the [Flores intake brief](../business/leads/mammoth-build-michael-flores.md) §3a/§4/§5/§6
   + the [HubSpot-replacement epic](../epics/mammoth-rebuild-crm-001.md) + the MVP forms. Still
   Mammoth-owned, local-only, zero BBL risk — and a stronger isolation proof. (`mammothbuild.com` is a
   parked domain → `atom.com`; the real client site is `mammoth.build`, which 403s automated fetches as
   the brief predicted — so the in-repo brief + MVP forms are the authoritative source.)
10. **Package manager: standalone bun (operator-chosen).** Mammoth was scaffolded with npm at
    SESSION_0425 (own `package-lock.json`, outside the bun workspace) and I followed it at the install
    gate without flagging — corrected on the operator's question. Converted to **standalone bun** (own
    `clients/mammoth-build-crm/bun.lock`, root `bun.lock` untouched): isolated dependency failure-domain
    + clean handoff extraction (consistent with ADR 0038/0033), ui-kit still shared via the `file:` link.

### Drift logged

None.

## Petey plan

### Goal

Scaffold Mammoth's own Prisma DB + schema, prove an isolated migration leaves BBL's DB untouched, and
document the per-app-DB convention/guardrail — all local, all gated.

### Tasks

#### SESSION_0459_TASK_01 — Mammoth's own DB + prisma (greenfield)

- **Agent:** Cody
- **What:** NEW `clients/mammoth-build-crm/prisma/schema.prisma` (own datasource + `env("DATABASE_URL")`;
  small client schema: `Project` + `BuildPhoto` + `StageId`/`PhotoPhase` enums, translated from
  `lib/types.ts`). Add `prisma` + `@prisma/client` + `db:*` scripts to `package.json`; NEW
  `clients/mammoth-build-crm/.env.example` (own `DATABASE_URL` → `mammoth_dev`); gitignore `.generated/`.
- **Steps:** translate the localStorage model → schema; mirror BBL's generator/datasource *shape* (not
  its 125 models, not its config-file URL); **show the dep install before running it** (operator gate).
- **Done means:** schema validates; package.json + .env.example + .gitignore in place; no BBL models, no
  shared prisma package, no cross-product FK.
- **Depends on:** nothing.

#### SESSION_0459_TASK_02 — Prove isolated migration (LOCAL only)

- **Agent:** Cody → Doug (verify)
- **What:** `createdb mammoth_dev` → `prisma migrate dev` (Mammoth's first migration) → confirm BBL's
  `ronindojo_prodsnap` is UNTOUCHED.
- **Steps:** snapshot prodsnap public-table count BEFORE (= 140); create + migrate `mammoth_dev`; list
  `mammoth_dev` tables (expect Project, BuildPhoto, _prisma_migrations); re-count prodsnap AFTER (must
  still be 140, byte-identical table set).
- **Done means:** `mammoth_dev` has the Mammoth tables; prodsnap diff is **empty**. This isolation proof
  IS the Phase-1 deliverable.
- **Depends on:** SESSION_0459_TASK_01.

#### SESSION_0459_TASK_03 — Convention + guardrail + BBL-DB formalization (docs)

- **Agent:** Cody
- **What:** NEW `docs/runbooks/database/per-app-db-separation.md` (each app owns prisma + DATABASE_URL +
  migrations; no cross-product FKs; how to add the next product DB; the guardrail rule). Doc-note that
  the current Postgres IS BBL's dedicated DB (no env-breaking rename). Update ADR 0038 Implementation →
  Phase 1 landed; goals-ledger G-002 → in-progress. Add the runbook to wiki/index + runbooks hub.
- **Done means:** runbook exists + linked; ADR 0038 + G-002 reflect Phase-1 status.
- **Depends on:** SESSION_0459_TASK_02 (so the doc reports a proven result).

### Parallelism

Sequential: TASK_01 → TASK_02 → TASK_03 (single coherent slice; no sub-agents, per the lane brief).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0459_TASK_01 | Cody | greenfield schema + package scaffold |
| SESSION_0459_TASK_02 | Cody → Doug | run + verify the isolation proof |
| SESSION_0459_TASK_03 | Cody | convention/guardrail docs + ledger updates |

### Open decisions

- **Operator gates (interactive):** (1) authorize the Mammoth dep install (`prisma` +
  `@prisma/client`); (2) `createdb mammoth_dev` + `migrate dev` are fine to run after showing; (3) one
  push at close. **No Neon / no prod this session.**

### Risks

- A stray `migrate dev` pointed at the wrong `DATABASE_URL` could hit a BBL DB — mitigated: Mammoth's
  `.env`/`.env.example` point only at `mammoth_dev`, and the proof explicitly diffs prodsnap before/after.

### Scope guard

- Do NOT wire Mammoth's app off localStorage onto Prisma (Phase 2).
- Do NOT provision a real Neon DB (Phase 2, operator-gated).
- Do NOT touch BBL's data or the ~130 brand refs / `getRequestBrand` prune (deferred sub-lane).
- Do NOT start the Baseline data split (deferred sub-lane).
- Do NOT build loop-board Phase B (G-003 — rides on BBL's own DB, later).

### Dirstarter implementation template

- **Docs read first:** Dirstarter Database / Prisma setup (per ADR 0038 proof table); checked 2026-06-27.
- **Baseline pattern to extend:** Dirstarter's single-DB Prisma setup (`apps/web` generator/datasource +
  `db:*` scripts).
- **Custom delta:** one `DATABASE_URL` + `prisma/` + migrations **per product** instead of one shared DB.
- **No-bypass proof:** we keep the Prisma client/migration workflow unchanged — only the DB boundary
  moves from shared to per-product (ADR 0038 D1).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0459_TASK_01 | landed | Mammoth prisma schema (HubSpot-replacement CRM core) + prisma.config.ts + standalone-bun deps + .env.example |
| SESSION_0459_TASK_02 | landed | createdb mammoth_dev + migrate `init` + prodsnap isolation proof (byte-identical) |
| SESSION_0459_TASK_03 | landed | per-app-db-separation runbook + ADR 0038 status + G-002 in-progress + wiki/hub links |
| SESSION_0459_TASK_04 | landed | repeatable new-client process (operator-directed): research-review + new-client-runbook + `/new-client-recipe` skill + Giddy learning record 0003 + MammothBuild PRD/STORIES updates |

## What landed

- **Mammoth Build CRM has its own database.** New `clients/mammoth-build-crm/prisma/schema.prisma` — a
  HubSpot-replacement CRM core (10 models: Contact, Company, Project [the PEMB Deal], Activity, Quote,
  LineItem, Product, Invoice, BuildPhoto, TeamMember; 9 enums) translated from the localStorage MVP and
  grounded in the in-repo Flores intake brief + HubSpot-replacement epic + the live MVP forms.
- **Isolated migration proven (the ADR 0038 Phase-1 deliverable).** `createdb mammoth_dev` → first
  migration `20260628042708_init` created + applied → BBL's `ronindojo_prodsnap` byte-identical
  (140 tables, same sorted-table digest `f30f31f0…`), `ronindojo_dev` unchanged, no leftover shadow DB.
- **Standalone bun per client product.** Converted Mammoth npm → standalone bun; own
  `clients/mammoth-build-crm/bun.lock`; **root `bun.lock` untouched** (dependency-layer isolation proof).
- **Convention + guardrail documented.** New `per-app-db-separation` runbook (the rule, the per-app
  anatomy, two Prisma-7 gotchas, add-a-DB steps, the isolation-proof recipe); BBL's current Postgres
  formally declared its dedicated DB (no move/rename); ADR 0038 → Phase 1 landed; G-002 → in-progress.
- **Repeatable new-client process (operator-directed, TASK_04).** Designed as Petey + Giddy +
  research-review: a **Skill + Runbook pair** (the bow-in/bow-out shape) is the chosen form. Shipped:
  the [research-review](../architecture/research-review-new-client-onboarding.md) (skill vs app vs
  protocol vs loop vs script — recommends skill+runbook, app/loop rejected), the
  [new-client-runbook](../runbooks/onboarding/new-client-runbook.md) (the canonical 9-step procedure with
  operator gates + done-means), the [`/new-client-recipe`](../../.claude/skills/new-client-recipe/SKILL.md)
  skill, **Giddy learning record 0003** (context mapping / database-per-bounded-context), and updates to
  the **MammothBuild PRD + STORIES** (data-architecture section + Epic 7 data-layer stories). Mammoth is
  the dogfood/reference implementation of the recipe.

## Decisions resolved

- Schema scope expanded from the carried 2-model translation to the full HubSpot-replacement CRM core
  (operator-directed research). See Grill #9.
- Package manager = **standalone bun** per client product (operator-chosen). See Grill #10.
- Prisma 7 datasource URL lives in `prisma.config.ts`, not the schema. See Grill #6.

## Files touched

| File | Change |
| --- | --- |
| `clients/mammoth-build-crm/prisma/schema.prisma` | NEW — HubSpot-replacement CRM core (10 models, 9 enums) |
| `clients/mammoth-build-crm/prisma.config.ts` | NEW — Prisma 7 config (own DATABASE_URL) |
| `clients/mammoth-build-crm/prisma/migrations/20260628042708_init/` | NEW — first migration |
| `clients/mammoth-build-crm/package.json` | + `@prisma/client` + `prisma` + `db:*` scripts; desc updated |
| `clients/mammoth-build-crm/bun.lock` | NEW — standalone bun lockfile (replaces `package-lock.json`) |
| `clients/mammoth-build-crm/package-lock.json` | DELETED — npm → bun |
| `clients/mammoth-build-crm/.env.example` | NEW — own DATABASE_URL template (gitignored `.env` created locally) |
| `clients/mammoth-build-crm/.gitignore` | + `.env` (was leaking) + `/.generated` |
| `docs/runbooks/database/per-app-db-separation.md` | NEW — the convention + guardrail + isolation-proof recipe |
| `docs/architecture/decisions/0038-per-product-database-separation.md` | + Implementation status (Phase 1 landed) |
| `docs/knowledge/wiki/goals-ledger.md` | G-002 → in-progress + progress note |
| `docs/runbooks/onboarding/new-client-runbook.md` | NEW (TASK_04) — the repeatable new-client procedure |
| `docs/architecture/research-review-new-client-onboarding.md` | NEW (TASK_04) — best-form analysis (skill+runbook chosen) |
| `.claude/skills/new-client-recipe/SKILL.md` | NEW (TASK_04) — `/new-client-recipe` invokable entrypoint |
| `docs/learning/ddd/learning-records/0003-context-mapping-and-database-per-context.md` | NEW (TASK_04) — Giddy learning record 0003 |
| `docs/product/mammoth-build/PRD.md`, `STORIES.md` | + data-architecture section + Epic 7 data-layer stories |
| `docs/runbooks/README.md`, `docs/knowledge/wiki/index.md` | + runbook/onboarding/learning links |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx prisma validate` | schema valid 🚀 |
| `bunx prisma migrate dev --name init` | migration created + applied to `mammoth_dev` |
| `diff prodsnap_before prodsnap_after` | **empty** — BBL DB byte-identical (140 tables, digest `f30f31f0…`) |
| `mammoth_dev` table list | 10 CRM tables + `_prisma_migrations` |
| `git diff --quiet bun.lock` (root) | clean — root lockfile untouched by standalone install |
| `bunx prisma migrate status` | "Database schema is up to date!" after bun reinstall |
| `/fallow-fix-loop` on the diff (`fallow audit --changed-since HEAD~1 --gate new-only`) | **complexity 0 · duplication 0 · 0 new dead-code** — "✓ No issues in 21 changed files." 2 inherited apps/web dep findings (`react-email` unused, `react-dom` test-only) reported, not adopted. No app logic in the diff → nothing to fix |

## Next session — parallel lanes (DB separation now enables this)

With each product on its own DB + dir, **multiple sessions can run in parallel windows** without
colliding. The lanes below are **file- and DB-disjoint** — run one per window. Pick distinct SESSION
numbers up front (0460 / 0461 / 0462) to avoid the SESSION-collision trap (see
`[[pr-loop-first-dogfood-session-collision]]`).

**Parallel-session hygiene (read before opening windows):**

- **Disjoint by construction:** Lane M = `clients/mammoth-build-crm/` + `mammoth_dev`; Lane B =
  `apps/web/` + `ronindojo_prodsnap`; Lane P = `docs/` + `.github/` + `scripts/` (no DB). No two lanes
  touch the same code dir or DB.
- **Only shared collision surface = a few index docs** (`docs/knowledge/wiki/index.md`,
  `goals-ledger.md`, the SESSION table). Stagger the bow-out pushes, or rebase the second push — these are
  trivial merges, not logic conflicts.
- **Two BBL lanes at once?** Only with `git worktree` (separate working copies) — don't run two windows
  editing `apps/web` in the same checkout. Lane M + Lane B + Lane P in one checkout is fine (disjoint dirs).
- Each window runs its own `/bow-in`; default DB per lane (Mammoth: set `DATABASE_URL=…mammoth_dev`).

### Lane M — Mammoth Phase 2 (brand: Mammoth · `clients/mammoth-build-crm` · `mammoth_dev`)

- **Goal:** wire the Mammoth app **off localStorage onto its own Prisma DB** (ADR 0038 Phase 2, local
  half; Neon provision stays SHIP-gated). Stories MB-DATA-002 (+ MB-DATA-003 auth later).
- **First task:** add a `lib/db.ts` (Prisma client w/ a Postgres driver adapter — `engineType="client"`
  needs an adapter at runtime), replace `lib/store.ts`'s `useLocalStorage` hooks with server actions over
  the new models (Project/BuildPhoto/Contact/Activity…), seed `mammoth_dev` from `lib/content.ts`
  (`SEED_PROJECTS`), and verify the pipeline board + new-job-order form + photo flow against the DB
  (headless). Gate: `bunx prisma generate` + a real adapter dep install (show first).
- **Inputs:** `clients/mammoth-build-crm/lib/{store,content,types,stages}.ts`, the new `prisma/schema.prisma`,
  `per-app-db-separation` runbook.

### Lane B — BBL loop-board Phase B (brand: BBL · `apps/web` · `ronindojo_prodsnap`)

- **Goal:** make the loop-board **editable + DB-backed** (G-003) on **BBL's own DB** (now formalized by
  ADR 0038 Phase 1 — no longer blocked on a throwaway table). A generic `prismaBoardStore` + `KanbanCard`
  model so the board reads/writes the DB, and the Todoist `AdminTaskBoard` collapses into the same board.
- **First task:** add a `KanbanCard` model to `apps/web/prisma/schema.prisma` (hand-author the migration
  per `schema-migration` runbook), implement the `BoardStore` port against Prisma (the existing kernel
  already has the slot — Phase A built the read projection), keep the live-ledger projection as the seed
  source. Gate: schema migration on `ronindojo_prodsnap` (show first). **App-code lane → run `next build`
  before push (fires CI + deploy).**
- **Inputs:** `packages/ui-kit/src/kanban/*`, `lib/loop-board/*`, the loop-board file spec, learning 0004
  (projections → stored table).

### Lane P — Platform: per-product CI + scaffold script (brand-neutral · `docs/` + `.github/` + `scripts/`)

- **Goal:** close the two follow-ups this session surfaced: (1) **per-product CI** so a `clients/*` change
  stops firing BBL's apps/web Playwright ×3 matrix (today `clients/**` isn't path-ignored → wasteful), and
  (2) a thin **`scripts/new-client-scaffold.ts`** for the mechanical half of `/new-client-recipe` (copy
  template, stamp names, `createdb`) — show before running per `operator-script-caution`.
- **First task:** add a `clients-ci.yml` (or scope `ci.yml`/`playwright.yml` paths) so client apps get
  their own typecheck/lint without running BBL's e2e; document it in the new-client runbook. Docs/CI-only
  → **free push** (no deploy). Safe to run alongside Lane M + Lane B.
- **Inputs:** `.github/workflows/{ci,playwright}.yml`, `vercel.json` `ignoreCommand`, the new-client runbook.

### Still held (not parallel lanes — operator-gated)

- **FI-001 / N1 / N2** — Brian Truelson real send stays GATED on operator "send Brian now" + N1/N2 landing
  (launch lane). N1 (verified combobox → onboarding wizard) is a BBL-window candidate but **collides with
  Lane B** in `apps/web` — run it instead of Lane B, or in a separate worktree.
- **Baseline data split + ~130 `getRequestBrand`/`Brand` vestige prune** — deferred sub-lane.
- **Mammoth Neon provision** — Phase 2 cloud half, SHIP-gated.

## Review log

### SESSION_0459_REVIEW_01 — ADR 0038 Phase 1 + repeatable new-client recipe

- **Reviewed tasks:** SESSION_0459_TASK_01, _02, _03, _04.
- **Dirstarter docs check:** Prisma/database baseline — we **extend** Dirstarter's single-DB Prisma
  setup to one `DATABASE_URL`/`prisma/` per app (ADR 0038 proof table), not replace it. Same Prisma
  client/migration workflow per product.
- **Verdict:** Tight and dogfooded. The DB-separation Phase 1 was *proven*, not asserted — the empty
  prodsnap diff (+ the untouched root `bun.lock`) is real falsifiable evidence the boundary holds. The
  mid-session scope expansion (operator-directed research → the full HubSpot-replacement CRM core) was
  grounded entirely in the in-repo intake brief + HubSpot's standard object model, so every table traces
  to a documented need rather than speculation. The repeatable recipe was designed *with* the repo's
  grain (skill→runbook, exactly bow-in/bow-out) and validated by being run against the first real client
  in the same session. Two honest corrections improved the work: the Prisma-7 inline-`url` removal
  (caught by the validator) and the npm→bun switch (caught by the operator).
- **Score:** 9.1/10
- **Follow-up:** Phase 2 (wire Mammoth app onto Prisma + Neon at SHIP) unblocks loop-board Phase B
  (G-003); a thin `scripts/new-client-scaffold.ts` when manual scaffolding becomes the bottleneck.

## Hostile close review

- **Giddy (plan sanity / behavior preservation / reuse):** **pass** — schema reuses the existing MVP
  model + the documented brief (no invention); the recipe reuses the bow-in/bow-out skill→doc pattern
  (no new mechanism); the runbook references `per-app-db-separation` for the DB half instead of
  duplicating it. Kernel stays shared; only data/deps/deploys separate. No throwaway work.
- **Doug (verification honesty / security):** **pass** — isolation claims are backed by before/after
  table-list diffs with digests, not narration; root `bun.lock` untouched is `git diff --quiet`-verified;
  no prod/Neon touched; `.env` correctly gitignored (was leaking before this session). Process note: the
  npm-vs-bun inconsistency was followed at the install gate without flagging — caught by the operator,
  corrected to standalone bun, and **structurally prevented from recurring** by baking the rule into the
  new-client runbook + learning record 0003 (so no separate FS row filed).
- **Kaizen aggregate:** 9.1/10 — proven boundary, grounded schema, recipe dogfooded; minor deduction for
  the unflagged inherited-PM choice.

## ADR / ubiquitous-language check

- ADR update: **done** — ADR 0038 Implementation section updated (Phase 1 landed). No *new* ADR (0038
  was already ratified at 0458; this session executed it).
- Ubiquitous language: **not required** — the new vocabulary (bounded context, context mapping,
  anti-corruption layer, database-per-context) is DDD *methodology*, homed in the learning records
  (0001–0003), not product domain language.

## Reflections

- **Prove the boundary, don't trust it.** The single most valuable artifact this session is the empty
  `diff` between BBL's table list before and after Mammoth's migration. A separation you can't diff is a
  separation you're only hoping for. Making the proof part of the recipe's done-means is the durable win.
- **A tool-version fact can invert your instinct.** Prisma 7 removed inline `datasource.url`; my carried
  "inline is more standard" was wrong, and the validator said so in one run. Cheap lesson, banked in the
  runbook's "two Prisma-7 gotchas."
- **An inherited choice is still a choice.** I followed Mammoth's npm setup at the install gate without
  flagging that the platform is bun. The operator caught it. The fix wasn't just "switch to bun" — it was
  writing "standalone bun per client product" into the runbook so the next client never re-litigates it.
- **Almost over-built, then grounded it.** The scope jumped from a 2-model proof to a 10-model CRM core.
  What kept it honest was refusing to invent: every model maps to the in-repo brief or HubSpot's object
  model, and the deferred set (automation, tickets, full auth) is documented, not silently dropped.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | new docs carry full frontmatter (`updated` 2026-06-27, `last_agent` claude-session-0459); PRD/STORIES frontmatter bumped + `pairs_with` extended to ADR 0038 + schema + runbook |
| Backlinks/index sweep | runbooks hub + `wiki/index.md` updated for per-app-db-separation + new-client-runbook + learning 0003; ADR 0038 ⇄ runbook ⇄ research-review ⇄ skill cross-linked both ways |
| Wiki lint | `bun run wiki:lint` → **0 errors, 15 warnings** — all 15 pre-existing R8 in untouched files (`SESSION_VIDEO_R001`, `petey-plan-0436`); 7 introduced R4 (UTC date-boundary) fixed by bumping `updated`→2026-06-28 |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0459_REVIEW_01 + Giddy/Doug pass above |
| Review & Recommend | Next session goal written: yes (Phase 2 / ledger P1) |
| Memory sweep | updated `[[separation-separate-dbs-per-product]]` (Phase 1 landed + standalone-bun + the `/new-client-recipe`) |
| Next session unblock check | Phase 2 doable, operator-gated on Neon at SHIP; no hard blocker |
| Git hygiene | branch `main`; close commit **`38ef00c1`** (`3b2d3dc2..38ef00c1`); standalone `bun.lock` added, `package-lock.json` removed; `.env`/`.generated`/`node_modules` ignored. NOTE: first commit went out with `status: in-progress` (flip to `closed` + this hash is a one-line follow-up docs push, operator-gated) |
| Graphify update | ran before the close commit — **15429 nodes / 30302 edges / 2086 communities** (was 15334 / 30222 / 2060 at 0458) |
