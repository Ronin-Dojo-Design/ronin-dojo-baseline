---
title: "SESSION 0460 — Mammoth Build CRM Phase 2 (app onto its own Prisma DB)"
slug: session-0460
type: session--open
status: in-progress
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0459
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
| SESSION_0460_TASK_01 | pending | Prisma data layer (lib/db.ts + driver adapter) |
| SESSION_0460_TASK_02 | pending | server actions replace localStorage hooks |
| SESSION_0460_TASK_03 | pending | seed mammoth_dev + headless verify |

## Next session

### Goal

TBD at bow-out (likely Mammoth Neon provision at SHIP, or MB-DATA-003 auth).

### First task

TBD at bow-out.
