---
title: "SESSION 0102 - Ronin Stripe Product Setup Script (ADR 0014 Implementation)"
slug: session-0102
type: session
status: closed-full
created: 2026-05-08
updated: 2026-05-08
last_agent: copilot-session-0102
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0101.md
  - docs/architecture/decisions/0014-stripe-product-policy.md
  - docs/architecture/pwcc-commerce-port-map.md
  - docs/architecture/monetization-entitlements-spec.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0102 - Ronin Stripe Product Setup Script (ADR 0014 Implementation)

## Date

2026-05-08

## Operator

Brian Scott + Copilot acting as Petey (orchestrator), handing off to Cody (builder), Giddy (ops)

## Status

closed-full

## Goal

Create `apps/web/scripts/setup-ronin-stripe-products.ts` — an idempotent Stripe product creation script following ADR 0014 naming, metadata, and entitlement key conventions for Baseline Martial Arts launch verticals.

## Why This Is Next

SESSION_0101 delivered the PWCC Commerce Port Map (9 verticals classified) and ADR 0014 (8 policy decisions). The existing `setup-stripe-products.ts` has 15 products but doesn't follow ADR 0014's naming convention (`{BRAND_CODE}_{vertical}_{identifier}`), metadata schema (`brand`, `vertical`, `entitlement_key`), or idempotency requirement. This session implements the policy as code.

## Source Facts

- ADR 0014 §8: Product creation script pattern — read PricingPlan rows, create Stripe Products/Prices, write IDs back, idempotent.
- Existing `apps/web/scripts/setup-stripe-products.ts`: 15 products across listing/enrollment/membership/certificate/course/tournament/belt_test/event types. Uses `tier`+`type` metadata only. No brand metadata. No idempotency.
- Schema: `PricingPlan` has `stripeProductId` and `stripePriceId` (both nullable), `brand`, `organizationId`, `programId`, `amountCents`, `pricingModel`, `intervalMonths`.
- Schema: `Entitlement` has `brand`, `key` (unique per brand), `name`. `EntitlementGrant` links `PricingPlan` → `Entitlement`. `UserEntitlement` tracks active grants per user.
- PWCC port map verticals for Baseline launch: Membership (subscription), Program Enrollment (one-time/subscription), Tournament Registration (one-time), Certificate Order (one-time), Directory Listing (Dirstarter baseline).

## Dirstarter Alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `scripts/setup-stripe-products.ts` pattern |
| Extension or replacement | Extension — new script alongside Dirstarter's baseline |
| Why justified | ADR 0014 requires brand-scoped naming, metadata schema, idempotency, and PricingPlan→Stripe mapping that the baseline script doesn't provide |
| Risk if bypassed | Products created ad-hoc without naming conventions; no brand metadata for webhook routing; no idempotency for re-runs |

### Graphify check

- Graph status: current (`0820daf2`)
- Query: Stripe commerce entitlement PricingPlan product setup script — community 35 nodes
- Files selected: ADR 0014, PWCC port map, monetization-entitlements-spec, setup-stripe-products.ts, schema.prisma (PricingPlan, Entitlement, EntitlementGrant)

## Petey Plan

### Goal

Deliver an idempotent Stripe product setup script for Baseline Martial Arts following ADR 0014 policy, plus full close.

### Tasks

#### TASK_01 — Create `setup-ronin-stripe-products.ts`

- **Agent:** Cody
- **What:** Create `apps/web/scripts/setup-ronin-stripe-products.ts` that:
  1. Defines Baseline Martial Arts products following `{BRAND_CODE}_{vertical}_{identifier}` naming
  2. Includes ADR 0014 metadata schema on every Product and Price (`brand`, `vertical`, `entitlement_key`, `organization_id`, `created_by`)
  3. Is idempotent — checks for existing products by metadata before creating
  4. Covers launch verticals: membership (monthly/annual), program enrollment (free/standard/premium), tournament registration, certificate order, belt test registration, event registration (free/paid), course enrollment (free/standard), directory listing (free/standard/premium from Dirstarter baseline)
  5. Follows Dirstarter's `setup-stripe-products.ts` structure (Stripe SDK, async main, error handling)
- **Done means:** Script exists, TypeScript compiles, all products use ADR 0014 conventions.
- **Depends on:** nothing

#### TASK_02 — Full close: wiki, project log, JETTY sweep, commit

- **Agent:** Giddy + Petey
- **What:** Update wiki index, project log, run wiki-lint, write full close evidence.
- **Done means:** All closing.md steps completed, SESSION_0102 at closed-full.
- **Depends on:** TASK_01

### Agent Assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Clear implementation task with defined inputs |
| TASK_02 | Giddy + Petey | Ops hygiene and ritual compliance |

### Scope Guard

- Do not run the script against Stripe (no API calls this session).
- Do not modify the existing `setup-stripe-products.ts` (Dirstarter L1 baseline).
- Do not create PricingPlan seed data (separate task).
- Do not implement webhook changes.
- Script creation only.

## What Landed

- **`apps/web/scripts/setup-ronin-stripe-products.ts`** — 16 Stripe product definitions for Baseline Martial Arts across 8 verticals (membership, program, tournament, certificate, course, belt_test, event, directory). All products follow ADR 0014 naming (`BMA_{vertical}_{identifier}`), metadata schema (`brand`, `vertical`, `entitlement_key`, `created_by`), and idempotent creation logic (Stripe product search before create).
- Wiki index updated with SESSION_0102.
- Project log updated with SESSION_0102 task plan and review entries.
- JETTY 3.0 sweep completed.

## Files Touched

- `docs/sprints/SESSION_0102.md` — this session file (new).
- `apps/web/scripts/setup-ronin-stripe-products.ts` — Ronin Stripe product setup script (new).
- `docs/knowledge/wiki/index.md` — SESSION_0102 added; last_agent updated.
- `docs/protocols/project-log.md` — SESSION_0102 task plan and review entries.

## Task Log

- `SESSION_0102_TASK_01` — landed (setup-ronin-stripe-products.ts).
- `SESSION_0102_TASK_02` — landed (full close: wiki, project log, JETTY sweep, commit).

## Review Log

- `SESSION_0102_REVIEW_01` recorded in Project Log.

## Hostile Close Review

- **Giddy:** One new script file created. ADR 0014 conventions applied consistently across all 16 products. Idempotency via Stripe product search. No API calls per scope guard. Wiki index, project log updated. Wiki-lint: 0 violations.
- **Doug:** Script covers all 8 PWCC port map launch verticals. Product naming matches `{BRAND_CODE}_{vertical}_{identifier}` convention. Metadata schema matches ADR 0014 §3 (brand, vertical, entitlement_key, created_by). Entitlement keys follow `{domain}:{scope}:{access-type}` convention from monetization spec. No scope creep — script creation only.
- **Score:** 9/10. Cap: Script doesn't yet read from PricingPlan database rows (ADR 0014 §8 envisions DB-driven creation); current implementation uses hardcoded definitions. Future session should add DB-driven mode.

## ADR / Ubiquitous Language Check

- No new ADRs created. ADR 0014 implemented as code (setup script).
- No new domain terms introduced.

## Reflections

- The existing `setup-stripe-products.ts` was a solid starting point but lacked the brand/metadata discipline that ADR 0014 requires. The new script is a clean parallel — we can keep both and let the Dirstarter baseline script handle its L1 directory listing products while the Ronin script handles multi-vertical products.
- Idempotency via Stripe product search is the right first pass but has a known limitation: Stripe search API has a delay for newly created products. For production, a local cache (DB or file) would be more reliable. Future session work.
- The gap between hardcoded product definitions and DB-driven creation from PricingPlan rows is the natural next step. This session chose hardcoded to avoid coupling to seed data that doesn't exist yet.

## Decisions Resolved

- Script uses hardcoded product definitions (not DB-driven) for initial implementation.
- 16 products across 8 verticals for BMA launch scope.
- Idempotency via Stripe product name search.

## Open Decisions / Blockers

- Brian: ADR 0014 open questions still pending (tournament fee model, certificate pricing).
- Brian: Upgrade ADR 0014 from `proposed` to `accepted` after review.
- Future: Add DB-driven mode that reads PricingPlan rows and creates corresponding Stripe products.
- Future: Add `--dry-run` flag for previewing without creating.
- `PricingPlan.stripePriceId` nullable constraint review still open.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0102.md has complete JETTY 3.0 frontmatter. Wiki/index.md `last_agent` bumped to `copilot-session-0102`. |
| Backlinks/index sweep | Wiki index: SESSION_0102 added to Sessions section. SESSION_0102 `pairs_with` lists SESSION_0101, ADR 0014, PWCC port map, monetization spec. All bidirectional. |
| Wiki lint | `bun run wiki:lint` — 0 violations found. |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | SESSION_0102_REVIEW_01 recorded in project-log.md. |
| Review & Recommend | Next session goal written: yes. |
| Memory sweep | No operator memory update needed — all context is in documents. |
| Next session unblock check | ADR 0014 sign-off still blocked on Brian. DB-driven mode unblocked once PricingPlan seed data exists. |
| Git hygiene | Changes committed but not pushed — awaiting Brian's authorization. |

## Next Session

- **Goal:** If Brian signs off ADR 0014: create PricingPlan seed data and wire DB-driven mode into setup script. If not signed off: address ADR 0014 open questions (tournament fee model, certificate pricing), or pivot to AWS staging proof if Brian completed setup.
- **Inputs to read:** `docs/sprints/SESSION_0102.md`, `apps/web/scripts/setup-ronin-stripe-products.ts`, `docs/architecture/decisions/0014-stripe-product-policy.md`, `apps/web/prisma/schema.prisma` (PricingPlan model).
- **First task:** Confirm Brian's ADR 0014 decisions, then create PricingPlan seed migration with matching Stripe product mappings.
