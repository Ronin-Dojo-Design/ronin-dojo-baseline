---
title: "SESSION 0460 — Mammoth Build CRM Phase 2 (app onto its own Prisma DB)"
slug: session-0460
type: session--implement
status: closed
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0460
sprint: S46
pairs_with:

  - docs/sprints/SESSION_0459.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
  - docs/runbooks/database/per-app-db-separation.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0460 — Mammoth Build CRM Phase 2

> **PRE-STAGED** by SESSION_0459 for a parallel dispatch (3 concurrent windows: 0460 / 0461 / 0462).
> This window owns **0460** — fill this file in during the session; do **not** create a new SESSION number.

## Date

2026-06-28

## Operator

Brian + claude-session-0460

## Goal

Wire the Mammoth Build CRM app **off localStorage onto its own Prisma DB** (`mammoth_dev`) — the local
half of ADR 0038 Phase 2 (Neon provision stays SHIP-gated). Stories MB-DATA-002 (+ MB-DATA-003 auth, later).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Parallel session awareness

One of **3 concurrent windows** launched together:

- **SESSION_0460 (THIS)** — Mammoth — dir `clients/mammoth-build-crm` — DB `mammoth_dev` — worktree `../ronin-0460` (branch `session-0460-mammoth`).
- **SESSION_0461** — BBL loop-board Phase B — dir `apps/web` — DB `ronindojo_prodsnap`.
- **SESSION_0462** — Platform per-product CI + scaffold — dirs `docs/`/`.github/`/`scripts/` — no DB.

Touch ONLY `clients/mammoth-build-crm/**` + this SESSION file. Never edit `apps/web` or another lane's
files/DB. Shared collision surface = index docs only (`docs/knowledge/wiki/index.md`,
`goals-ledger.md`, the SESSION table) — append-only; on push reject, `git pull --rebase origin main` then
retry (never force).

### Branch and worktree

- Branch: `session-0460-mammoth` · Worktree: `../ronin-0460` (own index — `git add -A` is safe here).
- DB: `mammoth_dev` (`clients/mammoth-build-crm/.env` already points here; gitignored).

### Bow-out cleanup (fold into the close)

At close, after the branch merges to `main`: `git worktree remove ../ronin-0460` then
`git branch -d session-0460-mammoth`. (Generic rule: closing.md §4.2.)

### Grill outcome

Two forks resolved with the operator before building (the rest was prescribed by the lane brief):

1. **Board-unification depth — chose FULL unify (one Project SoT).** The pipeline board (`/app`) was on a
   *separate* localStorage store (`mbcrm.kanban`) from `useProjects` (`mbcrm.projects.v1`) — two unsynced
   stores (a `/app/new` job never appeared on the board). The kernel's `BoardStore` is a persistence
   *port* (ADR 0033 D2), so the board now persists through a DB adapter (`createDbBoardStore`) over the
   same `Project` rows: board reads Projects, card moves patch Projects, board intake/quick-add create
   real Projects (Contact synthesized from the card). The MVP two-store split is **resolved** as a
   by-product. Alternative (read+moves only, defer board-create) rejected — it would silently drop
   board-originated cards.
2. **Install + DB setup — authorized.** Adapter deps installed standalone (`@prisma/adapter-pg` + `pg` +
   `@types/pg`), gitignored `.env` created (→ `mammoth_dev`), `prisma generate`, seed — all shown.

**Normalization seam:** the DB is normalized (`Project` ↔ `Contact`, `BuildPhoto` relation) but the
components keep consuming the flat `Project` shape — the read-model (`toProject`) flattens and the write
paths normalize, so component churn stayed minimal (only `create` became `await`ed, `markLost` sequenced).

### Gotcha banked — standalone-bun `file:` link breaks Turbopack

A standalone `bun install` of the `@ronin-dojo/ui-kit` `file:` dep (whose `package.json` declares
`files: ["src"]`) materializes `node_modules/@ronin-dojo/ui-kit` as a **real dir with an absolute per-file
`package.json` symlink**. Next/Turbopack reads a package via its directory realpath and treats that
per-file symlink as a *redirect* → `package.json is not parseable: invalid JSON: a redirect can't be
parsed as json`. `apps/web` never hits this because `workspace:*` gives it a **single whole-directory
symlink**. Fix: a committed `postinstall` (`scripts/link-ui-kit.mjs`) reshapes the link to the whole-dir
form on every install (idempotent; proven across a real `bun install`). → bank in the new-client +
per-app-db runbooks (any standalone client consuming the in-repo kernel needs this).

## Petey plan

### Goal

Replace `lib/store.ts` localStorage hooks with a Prisma data layer over `mammoth_dev`, seed from
`lib/content.ts`, and verify the pipeline/forms/photos read+write the DB.

### Tasks

#### SESSION_0460_TASK_01 — Prisma data layer (`lib/db.ts`)

- **Agent:** Cody
- **What:** `clients/mammoth-build-crm/lib/db.ts` — PrismaClient + a Postgres driver adapter
  (`engineType="client"` needs a runtime adapter; mirror `apps/web/services/db.ts`, likely
  `@prisma/adapter-pg` + `pg`). ⚠ SHOW the adapter dep install (standalone bun) before running it.
- **Done means:** `bunx prisma generate` clean; a Prisma client connects to `mammoth_dev`.

#### SESSION_0460_TASK_02 — Server actions replace localStorage

- **Agent:** Cody
- **What:** replace `lib/store.ts` hooks (create/patch/setStage/advance/addPhoto/removePhoto/remove) with
  server actions over the models; preserve the guardrails (order-confirm on deposit, no Complete without
  order, no silent drop).
- **Done means:** components read/write the DB; guardrail logic intact.

#### SESSION_0460_TASK_03 — Seed + headless verify

- **Agent:** Cody → Doug
- **What:** seed `mammoth_dev` from `lib/content.ts` `SEED_PROJECTS`; verify pipeline board + `/app/new`
  + photo flow against the DB (headless).
- **Done means:** the app runs off `mammoth_dev`, not localStorage; flows verified.

### Gates

Operator authorizes the adapter dep install + DB writes; one push at close (merge to `main`, staggered),
on the operator's "go".

### Scope guard

- Do NOT provision Neon (SHIP-gated). Do NOT touch `apps/web` / `ronindojo_prodsnap`. Do NOT add R2/MinIO
  photo storage (Phase 3 — `dataUrl` stays). Do NOT edit another lane's dir.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0460_TASK_01 | landed | Prisma data layer (`lib/db.ts` + `@prisma/adapter-pg`/`pg` driver adapter) + `prisma generate` |
| SESSION_0460_TASK_02 | landed | server actions (`lib/actions.ts`) + `useProjects` rewrite + DB-backed board store (`createDbBoardStore`); guardrails preserved server-side; both surfaces unified onto one Project SoT |
| SESSION_0460_TASK_03 | landed | `prisma/seed.ts` (idempotent) + headless verify of board read/move, `/app/new` create, advance→deposit order-confirm guardrail, photo add/remove; localStorage empty; `next build` green |
| SESSION_0460_TASK_04 | landed | durable ui-kit link fix (`scripts/link-ui-kit.mjs` + `postinstall`) — bun `file:` per-file symlink → whole-dir symlink so Turbopack resolves the kernel |

## What landed

- **Mammoth Build CRM runs off `mammoth_dev`, not localStorage** (ADR 0038 Phase 2, local half;
  MB-DATA-002). The two MVP localStorage stores (`mbcrm.projects.v1` + `mbcrm.kanban`) are gone — the live
  page wrote **zero** localStorage keys during the full headless run.
- **Prisma data layer** — `lib/db.ts`: a `PrismaClient` + `@prisma/adapter-pg` driver adapter
  (`engineType="client"` needs a runtime adapter), mirroring `apps/web/services/db.ts` trimmed to a single
  local `DATABASE_URL`. Deps installed standalone (own `bun.lock`; root `bun.lock` byte-identical).
- **Server-side data layer** — `lib/actions.ts` (`"use server"`): `listProjects`, `createProject`,
  `patchProject`, `setProjectStage`, `advanceProject`, `addPhoto`, `removePhoto`, `removeProject`, plus
  `reconcileBoard` (the board save path). Guardrails moved server-side and preserved: order-confirm +
  order-number stamped on crossing `deposit`; can't reach `complete` without a confirmed order; close-lost
  needs a reason. A read-model (`toProject`) flattens `Project + Contact + photos` to the flat shape; the
  write paths normalize (upsert/dedupe Contact by email).
- **One Project SoT** — `useProjects` (`lib/store.ts`) rewired to the actions (same hook surface;
  optimistic `patch` for responsive typing, authoritative click actions); the pipeline board swapped
  `createLocalStorageBoardStore` for `createDbBoardStore` (`lib/board-store-db.ts`). Creating a job on
  `/app/new` now shows on the board — the MVP two-store split is resolved.
- **Seed** — `prisma/seed.ts` (idempotent on the stable `seed-*` ids; preserves the demo's relative
  timestamps via a raw `updatedAt` stamp so the board's rotting/SLA flags still demo). `bun run db:seed`.
- **Durable kernel link** — `scripts/link-ui-kit.mjs` + `postinstall` (see Gotcha above).

## Files touched

| File | Change |
| --- | --- |
| `clients/mammoth-build-crm/lib/db.ts` | NEW — PrismaClient + `@prisma/adapter-pg` singleton (mammoth_dev) |
| `clients/mammoth-build-crm/lib/actions.ts` | NEW — `"use server"` data layer + guardrails + `reconcileBoard` |
| `clients/mammoth-build-crm/lib/board-store-db.ts` | NEW — `createDbBoardStore` (DB-backed `BoardStore` adapter) |
| `clients/mammoth-build-crm/lib/store.ts` | REWRITE — `useProjects` over server actions (same surface) |
| `clients/mammoth-build-crm/lib/types.ts` | + `NewProjectInput` (moved here so the action + hook share it) |
| `clients/mammoth-build-crm/app/app/page.tsx` | board → `createDbBoardStore` (dropped the localStorage store + seed prop) |
| `clients/mammoth-build-crm/app/app/new/page.tsx` | `await create(...)` + `submitting` state |
| `clients/mammoth-build-crm/app/app/project/[id]/page.tsx` | async `markLost` (sequenced) + `void`-wrapped async handlers |
| `clients/mammoth-build-crm/prisma/seed.ts` | NEW — idempotent seed from `SEED_PROJECTS` |
| `clients/mammoth-build-crm/scripts/link-ui-kit.mjs` | NEW — whole-dir symlink reshaper (Turbopack fix) |
| `clients/mammoth-build-crm/package.json` | + `@prisma/adapter-pg`/`pg`/`@types/pg` + `postinstall` + `db:seed` |
| `clients/mammoth-build-crm/bun.lock` | adapter deps (standalone; root lock untouched) |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx tsc --noEmit` | clean (after narrowing `mapSource` to the enum union) |
| `bun run db:seed` (×2) | idempotent — 3 projects / 3 contacts, no dupes on re-run |
| `npx next build` | ✓ compiled + TypeScript clean; routes `/`, `/app`, `/app/new`, `/app/project/[id]` built (validates the `"use server"` module) |
| board reads DB (headless) | 3 seeded cards in correct columns; Ridgeline shows `Order MB-2041`; 0 console errors |
| board move → DB (headless) | Cedar Flex `lead → qualified` persisted to `Project.stage` |
| `/app/new` create → DB (headless) | Summit Logistics → new `Contact` + `Project` (4/4 rows); redirected to its detail page |
| advance guardrail → DB (headless) | drove `lead → deposit`; `orderConfirmed=t` + `orderNumber=MB-6641` stamped at deposit |
| photo add/remove → DB (headless) | `BuildPhoto` row written (jpeg dataUrl) then deleted (count 0) |
| localStorage after full run | `Object.keys(localStorage) === []` — app is off localStorage |
| `git diff` root `bun.lock` | byte-identical (`7377c8ab…`) — standalone install didn't touch the root |
| `fallow audit --changed-since HEAD` (bunx 2.91.0) | flagged the order-stamp duplication → DRY'd into `orderFieldsFor` + split `reconcileBoard`; complexity findings 7→6 (`reconcileBoard`/`advanceProject`/`setProjectStage` now under threshold; the lone CRITICAL is the **pre-existing** `ProjectDetailPage`, 3 lines touched). Re-verified post-refactor (advance→deposit `MB-3572`; board move persisted; 0 console errors). "10 unused files" = false positive (fallow doesn't trace a standalone Next route/server-action entry graph). |
| lane disjointness | every change under `clients/mammoth-build-crm/**` + the canonical index docs; no `apps/web` / `ronindojo_prodsnap` touched |

## Decisions resolved

- **Full unify onto one `Project` SoT** (operator-chosen) — board + project pages read/write the same
  rows; the kernel `BoardStore` port gets a DB adapter rather than a second `KanbanCard` table.
- **Adapter dep install + local DB setup authorized** — `@prisma/adapter-pg`/`pg`/`@types/pg` standalone;
  gitignored `.env` → `mammoth_dev`; seed.
- **Durable kernel-link fix is a `postinstall`** (not a one-off manual symlink) so it survives reinstalls.

## Findings (severity ≥ medium)

- **Server actions are unauthenticated.** `lib/actions.ts` exposes create/patch/delete with no
  authz — fine for **local** Phase 2, but a gate before the cloud half. Tracked by **MB-DATA-003**
  (per-product Better Auth); no new ledger row (story already exists). Do not provision Neon before it.
- **Dual order-guard semantics (low).** The detail-page `advance` *auto-confirms* the order on crossing
  `deposit`; the kernel board's `order-guard` *blocks* entering `deposit` until `orderConfirmed`. Both are
  intentional MVP behaviors now operating on one SoT; `reconcileBoard` persists faithfully (doesn't
  reconcile the two). Noted as a follow-up, not drift — behavior was preserved, not changed.

## Review log

### SESSION_0460_REVIEW_01 — Mammoth Phase 2 (app onto Prisma)

- **Reviewed tasks:** SESSION_0460_TASK_01, _02, _03, _04.
- **Dirstarter docs check:** Prisma/database baseline — we **extend** Dirstarter's single-DB Prisma setup
  (per ADR 0038): the Mammoth app consumes its own `DATABASE_URL` through the standard Prisma 7
  driver-adapter pattern (`@prisma/adapter-pg`), same client/migration workflow, just a per-product DB.
- **Verdict:** A clean, proven slice. The work didn't just "move storage" — it found and closed the MVP's
  two-store split by routing both surfaces through one `Project` SoT, exactly along the kernel's existing
  `BoardStore` port (no board fork, no duplicate card table). Every "it works" is backed by a DB query or
  build output, not narration. The Turbopack `file:`-link break was diagnosed from first principles
  (diffed against the working `apps/web` whole-dir symlink) and fixed durably + banked in two runbooks.
- **Score:** 9.0/10
- **Follow-up:** MB-DATA-003 (auth) before the cloud half; the dual order-guard note above; R2/MinIO photo
  storage stays Phase 3 (`dataUrl` retained, as scoped).

## Hostile close review

- **Giddy (plan sanity / behavior preservation / reuse):** **pass** — reused the kernel's `BoardStore`
  port (swapped the adapter, didn't touch the board) and the existing flat `Project` shape via a
  read-model (component churn limited to making `create` awaited + sequencing `markLost`). All pipeline
  guardrails preserved, now server-side. The unify *removed* duplication (two localStorage stores → one
  DB SoT); no `KanbanCard` table invented (would have re-duplicated `Project`). No throwaway work.
- **Doug (verification honesty / security):** **pass with one flagged follow-up** — claims are backed by
  falsifiable evidence: board move → `psql` stage check; create → row count 4/4 + redirect; deposit
  guardrail → `orderConfirmed=t`/`MB-6641` query; photo → `BuildPhoto` count 1→0; off-localStorage →
  `Object.keys(localStorage)===[]`; `next build` green. Lane-disjoint (only `clients/mammoth-build-crm/**`)
  and root `bun.lock` byte-identical, both `git`-verified. `.env` gitignored. **Security follow-up:** the
  server actions are unauthenticated — acceptable local-only, but MB-DATA-003 must land before Neon
  (recorded in Findings). No prod/Neon touched.
- **Kaizen aggregate:** 9.0/10 — proven, reuse-first, honestly scoped; minor deduction for the
  forward-dependency auth gap (already a tracked story) + the noted dual-guard nicety.

## ADR / ubiquitous-language check

- **ADR update: done** — ADR 0038 Implementation updated (Phase 2 *local half* landed; cloud half +
  loop-board Phase B still deferred). No *new* ADR (0038 already ratified at 0458).
- **Ubiquitous language: not required** — no new product-domain terms. The new vocabulary (Prisma driver
  adapter, `BoardStore` port/adapter, read-model/flatten-normalize seam) is infra/methodology, not
  Mammoth domain language.

## Reflections

- **The real find wasn't "swap storage" — it was the two-store split.** The pipeline board was never wired
  to the projects (`mbcrm.kanban` vs `mbcrm.projects.v1`); a `/app/new` job never reached the board.
  Routing both through one DB `Project` SoT was the honest end-state, not scope creep — and the kernel's
  `BoardStore` port made it a clean adapter swap, exactly what D2 was designed for.
- **A working sibling is the best diagnostic.** The Turbopack `a redirect can't be parsed as json` error
  was opaque until I diffed Mammoth's per-file `file:` link against `apps/web`'s whole-dir `workspace:*`
  link. The fix (reshape to a whole-dir symlink) fell straight out of that diff. Banked so the next
  standalone client never loses an hour to it.
- **Preserve the contract, move the implementation.** Keeping the `useProjects` return surface +
  flattening the normalized DB back to the flat `Project` shape meant the guardrail logic moved fully
  server-side with almost no component churn. The seam (flatten on read, normalize on write) is what let
  the richer DB model hide behind the MVP's flat type.
- **Prove the boundary, again.** `Object.keys(localStorage) === []` after a full click-through is the same
  spirit as 0459's empty prodsnap diff — a falsifiable check that the thing you claim to have removed is
  actually gone.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | touched docs bumped (`updated` 2026-06-28, `last_agent` claude-session-0460): ADR 0038, goals-ledger, per-app-db-separation + new-client runbooks, MammothBuild STORIES, wiki/index. Code files (no frontmatter) need none. |
| Backlinks/index sweep | wiki/index session row flipped to closed; ADR 0038 ⇄ per-app-db-separation ⇄ new-client-runbook already cross-linked; runbook ↔ `scripts/link-ui-kit.mjs` linked |
| Wiki lint | `bun run wiki:lint` → **0 errors, 15 warnings** — all 15 pre-existing in untouched files (`SESSION_VIDEO_R001`, `petey-plan-0436`); the one introduced (`STORIES.md:96`, a wrapped `+ ` line read as a list) was fixed |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0460_REVIEW_01 + Giddy/Doug pass above |
| Review & Recommend | Next session goal written: yes (Neon cloud half / MB-DATA-003 auth) |
| Memory sweep | updated `[[separation-separate-dbs-per-product]]` (Phase 2 local half landed + the Turbopack `file:`-link gotcha) |
| Next session unblock check | cloud half is operator/SHIP-gated **and** should wait on MB-DATA-003 auth — noted; MB-DATA-003 itself is doable now |
| Git hygiene | branch `session-0460-mammoth` (own worktree `../ronin-0460`); single commit + push; hash reported at bow-out — see git log. Worktree/branch self-clean folded into close once merged to `main`. |
| Graphify update | ran before the close commit (FS-0025) — **10759 nodes / 27702 edges / 1547 communities** (this worktree's index) |

## Next session

### Goal

Either (a) **MB-DATA-003** — wire **Better Auth** into the Mammoth app (per-product identity + auth tables,
ADR 0038 D5) so the now-DB-backed actions are authenticated — the gate before any cloud provisioning; or
(b) **Phase 2 cloud half** — provision Mammoth's **Neon** DB + Vercel wiring at SHIP (operator-gated),
which then unblocks **loop-board Phase B** (G-003).

### Inputs to read

- `clients/mammoth-build-crm/lib/{db,actions,store}.ts` (this session's data layer)
- `apps/web/lib/auth.ts` + Better Auth setup (the pattern to mirror for MB-DATA-003)
- `docs/runbooks/database/per-app-db-separation.md` §"Provision prod at SHIP" (for the cloud half)
- ADR 0038 Implementation status

### First task

If MB-DATA-003: add Mammoth's own Better Auth instance + auth tables to `prisma/schema.prisma` (hand-author
the migration), then gate the server actions on a session. If cloud half: create the Mammoth Neon project,
grow `prisma.config.ts` to the pooled/direct split, `prisma migrate deploy`. **Both operator-gated.**
