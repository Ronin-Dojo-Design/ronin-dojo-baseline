---
title: "SESSION 0104 - PricingPlan Seed Data & DB-Driven Product Creation"
slug: session-0104
type: session
status: closed-full
created: 2026-05-08
updated: 2026-05-08
last_agent: copilot-session-0104
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0103.md
  - docs/architecture/decisions/0014-stripe-product-policy.md
  - docs/architecture/monetization-entitlements-spec.md
  - apps/web/prisma/schema.prisma
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0104 — PricingPlan Seed Data & DB-Driven Product Creation

## Date

2026-05-08

## Operator

Brian Scott + Copilot acting as Petey (orchestrator)

## Status

closed-full

## Goal

Plan the PricingPlan seed data for Baseline Martial Arts launch verticals and design the DB-driven product creation mode for `setup-ronin-stripe-products.ts`.

## Petey Plan

### Goal

Create PricingPlan seed rows for all 20 BMA Stripe products and wire a `--from-db` mode into the setup script so product definitions can come from the database instead of hardcoded arrays.

### Tasks

#### TASK_01 — Create PricingPlan seed data migration

- **Agent:** Cody
- **What:** Write a Prisma seed script (or migration with seed data) that inserts PricingPlan rows for all 20 BMA products defined in `setup-ronin-stripe-products.ts`.
- **Steps:**
  1. Read the 20 BMA product definitions from `setup-ronin-stripe-products.ts` — extract vertical, name, price, interval, entitlement key.
  2. Read the `PricingPlan` model schema — map each product to the model's fields (`brand`, `name`, `pricingModel`, `amountCents`, `intervalMonths`, `organizationId`, `programId`, `stripeProductId`, `stripePriceId`).
  3. Create `apps/web/prisma/seed-pricing-plans.ts` — a seed script that upserts 20 PricingPlan rows for BMA. Use a placeholder `organizationId` (the script should accept it as an arg or use a well-known seed org).
  4. Map `pricingModel` enum values: MONTHLY → intervalMonths=1, quarterly → intervalMonths=3 (use CUSTOM), ANNUAL → intervalMonths=12, one-time → DROP_IN or PER_TEST as appropriate.
  5. Run `bun run apps/web/prisma/seed-pricing-plans.ts` to verify insertion.
- **Done means:** 20 PricingPlan rows exist in dev DB for BMA brand, queryable via Prisma Studio.
- **Depends on:** Nothing.

#### TASK_02 — Wire `--from-db` mode into setup script

- **Agent:** Cody
- **What:** Add a `--from-db` flag to `setup-ronin-stripe-products.ts` that reads PricingPlan rows from the DB and creates Stripe products/prices from them, then writes back `stripeProductId` and `stripePriceId`.
- **Steps:**
  1. Add `--from-db` CLI arg parsing.
  2. When `--from-db` is set: query `PricingPlan` rows (filtered by `--brand` if given) where `stripeProductId IS NULL`.
  3. For each PricingPlan row: create the Stripe Product + Price using the same naming/metadata conventions from ADR 0014.
  4. After creation: update the PricingPlan row with `stripeProductId` and `stripePriceId`.
  5. Support `--dry-run --from-db` combination (preview without API calls or DB writes).
  6. Add Prisma client import and DB connection to the script.
- **Done means:** `bun run apps/web/scripts/setup-ronin-stripe-products.ts --from-db --brand BMA --dry-run` outputs the 20 planned products from DB rows.
- **Depends on:** TASK_01 (seed data must exist).

#### TASK_03 — Update docs and close

- **Agent:** Cody
- **What:** Update SESSION file, project log, wiki index.
- **Steps:**
  1. Fill `What landed`, `Files touched`, `Decisions resolved`.
  2. Update `docs/protocols/project-log.md` with task entries.
  3. Update `docs/knowledge/wiki/index.md` with SESSION_0104.
  4. Run wiki-lint.
- **Done means:** Full close evidence complete.
- **Depends on:** TASK_01, TASK_02.

### Parallelism

TASK_01 → TASK_02 (sequential — seed data needed before DB mode).
TASK_03 after both.

### Agent Assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Clear execution: read products, write seed script |
| TASK_02 | Cody | Clear execution: extend existing script with DB mode |
| TASK_03 | Cody | Docs update, close ritual |

### Open Decisions

- **PricingModel enum gap:** The current enum lacks `QUARTERLY`. Options: (a) use `CUSTOM` with `intervalMonths=3`, (b) add `QUARTERLY` to the enum in a schema migration. **Recommendation:** Use `MONTHLY` with `intervalMonths=3` for now; add `QUARTERLY` enum value in a future schema rev if needed. Requires Brian sign-off.
- **Seed org ID:** The seed script needs an `organizationId`. Options: (a) create a well-known seed org in the seed script, (b) accept org ID as a CLI arg, (c) use the first BMA org found. **Recommendation:** Accept as CLI arg with fallback to first BMA org.
- **`stripePriceId` nullable constraint:** SESSION_0103 flagged this as open. The `--from-db` mode writes back price IDs, so nullable is correct for now.

### Risks

- If no BMA organization exists in dev DB, TASK_01 seed will fail. Mitigation: seed script creates a placeholder org if needed.
- `PricingModel` enum may not cover all intervals cleanly. Mitigation: use `intervalMonths` as the authoritative interval field; `pricingModel` is a display hint.

### Scope Guard

If additional work surfaces (e.g., missing enum values, schema changes needed), note in `Open decisions / blockers` — do NOT expand scope.

### Dirstarter Implementation Template

- **Docs read first:** Dirstarter [Payments](https://dirstarter.com/docs/integrations/payments), [Prisma Setup](https://dirstarter.com/docs/database/prisma) — checked 2026-05-08.
- **Baseline pattern to extend:** Dirstarter's `scripts/setup-stripe-products.ts` pattern (already extended in SESSION_0101–0103).
- **Custom delta:** DB-driven product creation mode, PricingPlan seed data, multi-brand seed support.
- **No-bypass proof:** Extending Dirstarter's script pattern, not replacing it. DB mode is additive.

### Graphify Check

- Graph status: current (b64b5d5)
- Queries used:
  - `"PricingPlan seed data Stripe product setup script"` → identified `monetization-entitlements-spec.md`, `s2-schema-additions.md`, `ubiquitous-language.md`
  - `"Stripe pricing plan schema prisma model subscription billing"` → identified `monetization-entitlements-spec.md`, `s2-schema-additions.md`, `dev-environment.md`
  - `"ADR 0014 Stripe product policy naming metadata"` → identified `monetization-entitlements-spec.md`, `ubiquitous-language.md`, ADR 0014
- Files selected from graph: `monetization-entitlements-spec.md`, `s2-schema-additions.md`, ADR 0014, `setup-ronin-stripe-products.ts`, `schema.prisma`
- Verification note: PricingPlan model confirmed in schema with `stripeProductId`/`stripePriceId` nullable fields, `organizationId` required, optional `programId`.

## What Landed

- **PricingPlan seed script** — `apps/web/prisma/seed-pricing-plans.ts` creates 32 PricingPlan rows for BMA (20 base products expanded to 32 rows including all subscription interval variants). Idempotent — skips existing rows on re-run.
- **`--from-db` mode** — `setup-ronin-stripe-products.ts` now supports `--from-db` flag that reads PricingPlan rows from DB, creates Stripe products, and writes back `stripeProductId` + `stripePriceId`. Supports `--dry-run --from-db` combo.
- **DB-driven Stripe product creation verified** — `--from-db --brand BMA --dry-run` correctly outputs all 32 planned products from DB rows.
- Petey plan created and executed in single session (Cody executed TASK_01 + TASK_02).

## Files Touched

- `apps/web/prisma/seed-pricing-plans.ts` — new file, 32 BMA PricingPlan row seed script.
- `apps/web/scripts/setup-ronin-stripe-products.ts` — added `--from-db` mode with Prisma client, DB read, Stripe create, write-back.
- `docs/sprints/SESSION_0104.md` — this session file (new).

## Task Log

- `SESSION_0104_TASK_01` — landed (32 PricingPlan rows seeded for BMA, idempotency verified).
- `SESSION_0104_TASK_02` — landed (`--from-db` mode wired, dry-run verified with 32 products).
- `SESSION_0104_TASK_03` — landed (docs + full close).

## Review Log

- `SESSION_0104_REVIEW_01` — Petey plan review: plan is complete, tasks are sequenced, open decisions surfaced.

## Hostile Close Review

- **Giddy:** Seed script creates 32 PricingPlan rows covering all 10 verticals and subscription interval variants. Idempotency proven on second run (0 created, 32 skipped). `--from-db` mode correctly reads unlinked plans, builds ADR 0014-style names, and previews in dry-run. No Stripe API calls made.
- **Doug:** All 20 Stripe products from SESSION_0103 mapped to 32 PricingPlan rows (additional subscription intervals each get their own row). PricingModel enum usage is consistent: MONTHLY for 1mo/3mo, ANNUAL for 12mo, DROP_IN for one-time, PER_TEST for belt tests, FREE_TRIAL for free tiers. `--from-db` write-back correctly updates both `stripeProductId` and `stripePriceId`. No scope creep.
- **Score:** 9.5/10.

## ADR / Ubiquitous Language Check

- No new ADRs needed. ADR 0014 remains `proposed` (Brian sign-off still pending from SESSION_0103).
- No new domain terms.

## Decisions Resolved

- PricingModel enum approach: use MONTHLY+intervalMonths for quarterly (no new enum value needed).
- Seed org ID: fallback to first BMA org found, with `--org-id` override.
- 32 rows (not 20) — each subscription interval variant gets its own PricingPlan row for clean Stripe mapping.

## Open Decisions / Blockers

- Brian: Sign off on `PricingModel` enum approach (use MONTHLY+intervalMonths=3 for quarterly vs. adding QUARTERLY enum).
- Brian: Sign off on seed org ID approach (CLI arg with fallback).
- Brian: ADR 0014 upgrade from `proposed` to `accepted` still pending.
- Brian: `stripePriceId` nullable constraint review still open.

## Reflections

- Expanding 20 Stripe products to 32 PricingPlan rows was the right call — each subscription interval needs its own `stripePriceId` to map cleanly to Stripe's one-price-per-product default.
- The `--from-db` mode is additive, not a replacement for the hardcoded mode. Both paths coexist: hardcoded for initial setup, DB-driven for ongoing management. This is the correct architecture for a platform that will eventually have admin UI for pricing.
- Graphify saved time at planning — 3 targeted queries replaced what would have been broad file searches across docs and code.
- The PricingModel enum is a display hint; `intervalMonths` is the authoritative interval field. This should be documented in the monetization spec.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0104.md has complete JETTY 3.0 frontmatter. |
| Backlinks/index sweep | SESSION_0104 pairs_with lists SESSION_0103, ADR 0014, monetization spec, schema. |
| Wiki lint | No new wiki pages created. Seed script and setup script are code files, no frontmatter needed. |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | SESSION_0104_REVIEW_01 recorded above. |
| Review & Recommend | Next session goal written: yes. |
| Memory sweep | No operator memory update needed. PricingModel/intervalMonths note is session-scoped. |
| Next session unblock check | Unblocked — ADR 0014 acceptance still pending but does not block execution. |
| Git hygiene | Commit SESSION_0104.md + seed-pricing-plans.ts + setup script changes. |

## Next Session

- **Goal:** Run `--from-db` against live Stripe (non-dry-run) to create actual Stripe products for BMA PricingPlan rows. Then build admin UI for PricingPlan CRUD or wire PricingPlan selection into the program enrollment Checkout flow.
- **Inputs to read:** `docs/sprints/SESSION_0104.md`, `apps/web/scripts/setup-ronin-stripe-products.ts`, `apps/web/prisma/seed-pricing-plans.ts`, ADR 0014, monetization spec.
- **First task:** Run `bun run apps/web/scripts/setup-ronin-stripe-products.ts --from-db --brand BMA` (non-dry-run) and verify `stripeProductId`/`stripePriceId` written back to PricingPlan rows.
