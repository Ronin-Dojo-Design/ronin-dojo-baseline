---
name: new-client-recipe
description: Stand up a new client product inside the monorepo with its own database. Use when the user says "/new-client-recipe", "new client", "onboard a client", "set up <name> as a new product/app", or wants to scaffold a new app under clients/* with a separate DB. Runs the repeatable new-client onboarding recipe (ADR 0034 + 0038).
---

Read and follow [`docs/runbooks/onboarding/new-client-runbook.md`](../../../docs/runbooks/onboarding/new-client-runbook.md).
That runbook is the **source of truth** — execute its steps as written. This skill is just the invokable
entrypoint (same relationship `/bow-in` has to `docs/rituals/opening.md`).

## What this does

Scaffolds a **new client product inside this monorepo with its own database** — the model from
[ADR 0034](../../../docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md)
(monorepo + per-product deploys) and
[ADR 0038](../../../docs/architecture/decisions/0038-per-product-database-separation.md) (one DB per
product). Reference implementation: **Mammoth Build CRM** (`clients/mammoth-build-crm/`).

## The shape (memorize, then follow the runbook for detail)

1. **Intake → brief** — capture requirements (`docs/business/leads/`); the schema is translated from it.
2. **Scaffold** `clients/<product>/` — run the mechanical scaffolder (**dry-run by default; show before
   applying** per `operator-script-caution`):
   `bun scripts/new-client-scaffold.ts <product>` (preview) → `--apply` (write) → `--apply --createdb`
   (also `createdb <product>_dev`). It copies the agnostic config + stamps the name; it stops at the
   gated steps below (no install, no schema, no deploy).
3. **Wire deps** — `@ronin-dojo/ui-kit` via `file:`, `@prisma/client` + `prisma`, `db:*` scripts.
4. **Standalone bun install** ⛔ — own `bun.lock`; root `bun.lock` must stay untouched.
5. **Own database** ⛔ — own `prisma/` + `prisma.config.ts` (Prisma 7: URL lives here, not the schema)
   + `DATABASE_URL` → a **new** `<product>_dev`; migrate; **prove isolation** (other product DBs
   byte-identical). See [per-app-db-separation](../../../docs/runbooks/database/per-app-db-separation.md).
6. **Brand token block** — the product is "just another token block" over the shared kernel.
7. **Deploy + Neon** ⛔ — own Vercel project + `ignoreCommand`; deferred to SHIP, operator-gated.
8. **Docs** — `docs/product/<product>/PRD.md` + `STORIES.md`.
9. **Governance** — goals-ledger lane, wiki index, runbooks hub.

## Hard rules (do not violate)

- **No cross-product foreign keys**; **no BBL models** in the client schema; **no shared prisma package**
  (each app owns its schema).
- **Share the kernel, not the data** — components from `packages/ui-kit`; everything else is the
  product's own.
- **`clients/*` is not a bun workspace member** — always `bun install` standalone in the app dir.

## Operator gates (⛔ above) — show, then run on the word

Authorize before: (1) dep install, (2) DB create/migrate (local — fine after showing), (3) deploy/Neon
(real cloud — always gated, deferred to SHIP), (4) push. Build + verify + show, then proceed on "go".

## Done means

Run the runbook's **Done means** checklist. The non-negotiable proof: standalone `bun.lock` (root
untouched) + an **empty isolation diff** on every other product DB.
