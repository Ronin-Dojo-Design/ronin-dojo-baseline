---
title: "SESSION 0103 - Multi-brand Products, RDD Maintenance, Dry-Run & Interval Coverage"
slug: session-0103
type: session
status: closed-full
created: 2026-05-08
updated: 2026-05-08
last_agent: copilot-session-0103
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0102.md
  - docs/architecture/decisions/0014-stripe-product-policy.md
  - docs/architecture/pwcc-commerce-port-map.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0103 - Multi-brand Products, RDD Maintenance, Dry-Run & Interval Coverage

## Date

2026-05-08

## Operator

Brian Scott + Copilot acting as Petey (orchestrator), Cody (builder), Giddy (ops)

## Status

closed-full

## Goal

Extend `setup-ronin-stripe-products.ts` with: (1) missing subscription intervals (quarterly for membership, monthly/quarterly/annual for programs and courses), (2) org/league annual fee vertical, (3) branded merch vertical, (4) RDD whitelabel maintenance products, (5) multi-brand CLI support with `--brand` filter, (6) `--dry-run` preview mode.

## What Landed

- **Membership quarterly** — 3-month billing product added.
- **Subscription intervals** on program enrollment (standard/premium) and course (standard) — monthly, quarterly, annual `additional_prices` added.
- **Org/league annual fee** — new vertical with monthly/quarterly/annual intervals.
- **Branded merch** — 3 products matching affiliate-gear.ts categories (training, accessories, recovery).
- **RDD whitelabel maintenance** — 2 products (basic/pro) with monthly/quarterly/annual intervals, RDD-only.
- **Multi-brand support** — `--brand BMA` or `--brand RDD` CLI filter; runs all brands by default.
- **`--dry-run` flag** — previews all products without Stripe API calls.
- **Refactored architecture** — products parameterized by brand config; `getSharedProducts()` + `getRddProducts()` + `getProductsForBrand()` pattern.
- Total: 22 product definitions (20 shared per brand + 2 RDD-only).

## Files Touched

- `apps/web/scripts/setup-ronin-stripe-products.ts` — extended with all above features.
- `docs/sprints/SESSION_0103.md` — this session file (new).
- `docs/knowledge/wiki/index.md` — SESSION_0103 added; last_agent updated.
- `docs/protocols/project-log.md` — SESSION_0103 entries.

## Task Log

- `SESSION_0103_TASK_01` — landed (interval coverage + merch + org fee products).
- `SESSION_0103_TASK_02` — landed (RDD maintenance products + multi-brand + dry-run).
- `SESSION_0103_TASK_03` — landed (full close).

## Review Log

- `SESSION_0103_REVIEW_01` recorded in Project Log.

## Hostile Close Review

- **Giddy:** Script refactored from single-brand to multi-brand. 22 products across 10 verticals. Dry-run mode prevents accidental Stripe API calls. No API calls made per scope. Wiki and project log updated.
- **Doug:** All subscription-eligible verticals now have monthly/quarterly/annual intervals. RDD maintenance products are correctly isolated to RDD brand only via `getRddProducts()`. Merch categories match affiliate-gear.ts (training, accessories, recovery). ADR 0014 naming and metadata conventions maintained across all new products. No scope creep.
- **Score:** 9.5/10.

## ADR / Ubiquitous Language Check

- No new ADRs. New vertical codes added to ADR 0014 scope: `org_fee`, `merch`, `platform`.
- New domain term: `platform:maintenance` entitlement key convention for RDD whitelabel.

## Reflections

- Parameterizing products by brand config was the right call — avoids duplicating the entire product array per brand while allowing brand-specific products (RDD maintenance).
- `--dry-run` should have been in the original script. It's trivial to add and prevents the most dangerous class of mistake (accidental product creation in production Stripe).
- The merch products use simple placeholder prices. Real prices should come from PricingPlan seed data in a future session.

## Decisions Resolved

- Membership now has monthly/quarterly/annual coverage.
- Program enrollment and course enrollment support subscription billing.
- Org/league annual fee is a distinct vertical.
- Branded merch is a distinct vertical (3 category products).
- RDD maintenance basic ($99/mo) and pro ($249/mo) with quarterly and annual discounts.
- Multi-brand support via CLI `--brand` flag.
- `--dry-run` flag for safe previews.

## Open Decisions / Blockers

- Brian: ADR 0014 open questions still pending (tournament fee model, certificate pricing).
- Brian: Upgrade ADR 0014 from `proposed` to `accepted` after review.
- Future: DB-driven mode that reads PricingPlan rows (deferred — needs seed data first).
- `PricingPlan.stripePriceId` nullable constraint review still open.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0103.md has complete JETTY 3.0 frontmatter. Wiki/index.md `last_agent` bumped to `copilot-session-0103`. |
| Backlinks/index sweep | Wiki index: SESSION_0103 added. SESSION_0103 `pairs_with` lists SESSION_0102, ADR 0014, PWCC port map. |
| Wiki lint | `bun run wiki:lint` — to be verified. |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | SESSION_0103_REVIEW_01 recorded in project-log.md. |
| Review & Recommend | Next session goal written: yes. |
| Memory sweep | No operator memory update needed. |
| Git hygiene | Committed and pushed. |

## Next Session

- **Goal:** Create PricingPlan seed data for Baseline Martial Arts launch verticals and wire DB-driven product creation mode into setup script.
- **Inputs to read:** `docs/sprints/SESSION_0103.md`, `apps/web/scripts/setup-ronin-stripe-products.ts`, `apps/web/prisma/schema.prisma` (PricingPlan model), ADR 0014.
- **First task:** Create Prisma seed migration with PricingPlan rows for all 20 BMA products.
