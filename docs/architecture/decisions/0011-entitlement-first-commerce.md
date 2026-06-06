---
title: "ADR 0011 — Entitlement-First Commerce"
slug: adr-0011-entitlement-first-commerce
type: decision
status: accepted
created: 2026-04-30
updated: 2026-05-03
last_agent: codex-session-0351
pairs_with:
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/architecture/ubiquitous-language.md
backlinks:
  - docs/sprints/SESSION_0029.md
  - docs/sprints/SESSION_0030.md
  - docs/knowledge/wiki/index.md
---

# ADR 0011 — Entitlement-First Commerce

**Status:** Accepted
**Date:** 2026-04-30
**Deciders:** Brian + Codex acting as Petey
**Related:** SESSION_0029, `D-014`, `docs/architecture/monetization-entitlements-spec.md`

## Context

Ronin now has schema pieces for Programs, Courses, certificate products, PricingPlans, invoices, payments, subscriptions, and Stripe integration. Without a single access contract, paid logic would spread across UI pages, server actions, Stripe metadata, enrollment rows, certificate rows, and plan IDs.

The SESSION_0029 raw source recommended entitlements as the bridge between payment and access. The repo review confirmed no `Entitlement`, `EntitlementGrant`, or `UserEntitlement` model exists yet.

## Decision

Build the entitlement layer before adding more paid UI or checkout-dependent curriculum/certification flows.

Payments, subscriptions, manual grants, memberships, and promos grant or revoke `UserEntitlement` records. Program, Course, Certification, and certificate-order access checks read entitlement state instead of checking product IDs, Stripe IDs, or random paid booleans.

`Product` remains a domain concept for now. Add an internal Prisma `Product` table only after implementation proves a unified catalog is required. Extend current `PricingPlan` first.

## Dirstarter Docs Proof

| Baseline area | Proof |
| --- | --- |
| Project structure | Dirstarter organizes server-side code by feature folders: <https://dirstarter.com/docs/codebase/structure> |
| Prisma/database | Dirstarter uses Prisma schema, seed, and generated client as data backbone: <https://dirstarter.com/docs/database/prisma> |
| Auth | Dirstarter uses Better Auth with session and role-based access control: <https://dirstarter.com/docs/authentication> |
| Payments/Stripe | Dirstarter uses Stripe for payments and subscriptions: <https://dirstarter.com/docs/integrations/payments> |
| Monetization | Dirstarter monetization is plan/product driven: <https://dirstarter.com/docs/monetization> |

## Consequences

### Positive

- Paid access becomes a reusable service instead of scattered conditionals.
- Refunds, cancellations, revokes, and expirations have one ledger.
- Program/Course/Certification UI can stay simple: check auth, brand, role, enrollment, and entitlement.
- Dirstarter Stripe checkout/webhook machinery can be extended rather than replaced.

### Negative

- Entitlement schema and services become a prerequisite for paid curriculum/certification flows.
- Some existing access state remains duplicated conceptually until implementation reconciles `UserBrandSubscription`, `ProgramEnrollment`, and future `UserEntitlement`.

## Implementation Notes

- Add `Entitlement`, `EntitlementGrant`, and `UserEntitlement` in a future schema session.
- Add Stripe IDs to `PricingPlan` before adding an internal `Product` table.
- Keep certificate order/payment history immutable; revoke access by entitlement or certificate status, not deletion.
- Do not use the Dirstarter `Tool` monetization residue as production access logic without resolving `D-014`. **D-014 resolved SESSION_0039**: Tool repurposed as Directory Listing (Option B). Monetization tiers (Free/Standard/Premium) map to directory listing tiers, not entitlement access.
