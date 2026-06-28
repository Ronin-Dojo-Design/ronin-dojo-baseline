---
title: ADR 0038 — Per-product database separation (BBL prod-repo deferred)
slug: adr-0038-per-product-database-separation
type: decision
status: accepted
created: 2026-06-27
updated: 2026-06-27
last_agent: claude-session-0458
pairs_with:
  - docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md
  - docs/architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md
  - docs/knowledge/wiki/ronin-project-context.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - architecture
  - repo-strategy
  - database
  - prisma
  - separation
  - bbl
---

# ADR 0038 — Per-product database separation (BBL prod-repo deferred)

## Status

**Accepted (direction)** — operator-recommended + grilled SESSION_0458 ("separate DBs and separate
brands are the way to go… we can stay monorepo, but we need true separation of projects and databases
now"). **Amends ADR 0034**, which established the monorepo + per-product *deploys* but left a single
shared database. The **migration is a phased, operator-gated lane** (see Implementation); this ADR
ratifies the *target*, not a big-bang cutover.

## Context

ADR 0034 settled "one monorepo platform + per-product Vercel deploys" and killed multi-*brand* in favor
of multi-*product*. It left one gap: **all products still share one Postgres.** Today `apps/web` (BBL)
rides a single shared Postgres (the `ronindojo_prodsnap` local mirrors prod); `clients/mammoth-build-crm`
is localStorage-only (no DB yet). That shared DB is the remaining coupling:

- A client product's migration can break BBL; the **blast radius is the whole platform.**
- Backups, scaling, and failure domains are entangled — you can't tune or restore one product without
  the others.
- A client product can't be **cleanly handed off** while its data lives inside the shared DB.
- BBL's **verified lineage graph is the moat/asset** (north star) — it deserves its own dedicated DB,
  its own backup/DR posture, and its own failure domain.

The operator also floated giving **BBL its own professional production repo** (dev/staging in the
monorepo). That is a separate question from the DB split and is treated below.

## Decision

- **D1 — One database per product.** Each product gets its own `DATABASE_URL` + its own `prisma/`
  schema + its own migrations + its own env. BBL (`apps/web`) gets a dedicated BBL DB; each client app
  (Mammoth, …) gets its own. No cross-product foreign keys.
- **D2 — Separate brands + per-product Vercel deploys** — already in place via per-product Vercel
  projects + `vercel.json` `ignoreCommand`; this completes the model (and justifies finishing the
  vestigial `getRequestBrand`/`Brand`-enum prune).
- **D3 — Stay monorepo.** Shared tooling, one CI, atomic cross-cutting changes, and — critically — the
  shared **`packages/ui-kit` kernel** (m-card, tokens, AdminKanban) stay in-repo. *Separation is about
  data, deploys, and brands — not components.*
- **D4 — BBL's own production repo is DEFERRED.** Dev-in-monorepo + prod-in-separate-repo forces a
  cross-repo promotion (subtree/submodule/publish) on every release — a sync tax + drift risk ADR 0034
  deliberately avoided. The wins we actually want (de-risked prod, clean failure domains) come from D1+D2,
  not a repo split. **Reserve a true repo split for an actual client handoff/sale (ADR 0033 D1) or a hard
  access-control need (outside collaborators).** Until a concrete trigger, BBL's "professional home" is
  its Vercel project + `blackbeltlegacy.com`, sourced from the monorepo.
- **D5 — Identity is per-product.** Each product owns its own auth/identity tables (Better Auth per app).
  No shared `User`/session table across products — a shared identity service is out of scope (and
  unnecessary for BBL standalone). Duplicated auth schema per app is correct, not duplication-to-fix.

## Consequences

**Positive:** independent migrations / backups / scaling / failure domains; a client product becomes
cleanly extractable on handoff; BBL's lineage DB gets its own posture; a bad client migration can no
longer take down BBL.

**Costs / follow-ups:**

- A **migration/cutover lane** is required to split the current shared Postgres into a BBL-owned DB
  (and to stand up each client's DB). Phased + gated (below).
- **No cross-product joins** — any data a product needs from another crosses an API/contract, not a FK.
- **The loop-board's Phase B (`KanbanCard`) waits for this** — its table must land on **BBL's own DB**,
  not the about-to-be-split shared one (avoids a throwaway migration). See
  [`loop-of-loops`](../../protocols/loop-of-loops-ledger-driven-sessions.md) P3.
- Local dev grows a DB per active app (per-app `DATABASE_URL`); `prodsnap` becomes BBL-DB-scoped.

## Implementation (phased, operator-gated)

1. **Ratify** this ADR with the operator (status → confirmed before any DB work).
2. **Provision** a dedicated BBL database (Neon project) + env wiring; keep the current shared DB as the
   BBL DB initially if cleanest (rename/rescope), so BBL doesn't move data — clients get *new* DBs.
3. **Scaffold** per-app `prisma/` + `DATABASE_URL` for the first client (Mammoth) on its own DB.
4. **Verify** isolated migrations (a client migration does not touch BBL) + prodsnap rescope.
5. Only then build **loop-board Phase B** on BBL's DB. Re-evaluate D4 (BBL repo) only on a concrete trigger.

## Alternatives considered

- **Keep one shared DB** — rejected: the coupling above is exactly what this ADR removes.
- **Schema-per-product in one DB** — rejected: still one failure domain / one backup / one migration
  surface; doesn't enable clean handoff.
- **BBL to its own prod repo now** — deferred (D4): cross-repo promotion tax without a concrete trigger.

## Dirstarter docs proof

This touches the Prisma/database baseline (per closing.md §6.6) — we **extend** Dirstarter's single-DB
Prisma setup to a per-app `DATABASE_URL`, we don't replace the Prisma pattern itself.

| Baseline layer | Dirstarter doc | How we extend |
| --- | --- | --- |
| Prisma / database | `https://dirstarter.com/docs` (Database / Prisma setup) | one `DATABASE_URL` + `prisma/` **per app** instead of one shared; same Prisma client/migration workflow per product |
| Deployment | `https://dirstarter.com/docs` (Deployment) | already per-product Vercel projects (ADR 0034); unchanged |

## Relationships

- **Amends** ADR 0034 (monorepo + per-product deploys — the missing DB-separation piece).
- **Consistent with** ADR 0033 D1 (the `ui-kit` kernel stays the shared layer; a true repo split is
  reserved for client handoff).
- **Advances** the open question in learning record `0001` (kernel in-repo vs published) — resolved as:
  in-repo shared now, published only on a product leaving the monorepo.
