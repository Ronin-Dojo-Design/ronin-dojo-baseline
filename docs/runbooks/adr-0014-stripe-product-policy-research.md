---
title: "ADR Research Runbook — Stripe Product Policy (ADR 0014)"
slug: adr-0014-stripe-product-policy-research
type: runbook
status: active
created: 2026-05-08
updated: 2026-05-08
author: Brian + Copilot
last_agent: copilot-session-0100
pairs_with:
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/sprints/SESSION_0100.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# ADR Research Runbook — Stripe Product Policy (ADR 0014)

## Purpose

Pre-research for drafting ADR 0014 (Stripe Product Policy). This runbook catalogs every commerce-relevant file, document, and decision in the repo, their relationships, and what each contributes to the Stripe product policy decision.

## Prior Art — Existing ADRs and Architecture Docs

| Document | Relevance | Key Takeaway |
| --- | --- | --- |
| [ADR 0011 — Entitlement-First Commerce](../architecture/decisions/0011-entitlement-first-commerce.md) | **Direct predecessor.** Established that payments grant entitlements, not direct access. | ADR 0014 must define how Stripe Products map to EntitlementGrants. Products → EntitlementGrant → UserEntitlement → access check. |
| [Dirstarter Commerce Alignment](../architecture/dirstarter-commerce-alignment.md) | **Baseline patterns.** Maps Dirstarter's Stripe/payments/monetization docs to Ronin's needs. | Reuse Dirstarter Stripe client/service and checkout pattern. Do not introduce a second payment path. |
| [Monetization & Entitlements Spec](../architecture/monetization-entitlements-spec.md) | **Domain model.** Defines PricingPlan, subscription, invoice, entitlement concepts. | ADR 0014 must reconcile Stripe Products with PricingPlan and future Product table. |
| [Security, Privacy, Payments & Monitoring Plan](../architecture/security-privacy-payments-monitoring-plan.md) | **Security posture.** Payment security, PCI scope, webhook verification. | ADR 0014 must not expand PCI scope. Stripe Checkout handles card data. |
| [Programs, Curriculum & Certification Spec](../architecture/programs-curriculum-certification-spec.md) | **Commerce verticals.** Programs, courses, certifications as paid content. | These are the things being sold — ADR 0014 defines how they become Stripe products. |
| [ADR 0013 — Tool Listing Repurposing](../architecture/decisions/0013-tool-listing-repurposing.md) | **D-014 resolution.** Tool → Directory Listing with Free/Standard/Premium tiers. | Directory listing tiers are a monetization vertical that needs Stripe product mapping. |

## Commerce Source Files

| File | What It Contains | Commerce Relevance |
| --- | --- | --- |
| `apps/web/lib/tuffbuffs/affiliate-gear.ts` | Product catalog, pricing, categories, Amazon affiliate links | **Affiliate display only** — no Stripe. Defines product shape that may inform future Stripe products if direct sales are added. |
| `apps/web/components/web/tuffbuffs/affiliate-gear-card.tsx` | Gear card UI with price display and affiliate link | Display component — no payment integration. |
| `apps/web/components/web/tuffbuffs/affiliate-gear-browser.tsx` | Filterable gear list with category/program filters | Display component — no payment integration. |
| `apps/web/components/web/tuffbuffs/affiliate-gear-grid.tsx` | Grid layout for gear cards | Display component — no payment integration. |
| `apps/web/app/(web)/gear/page.tsx` | Gear page route | Display route — no payment integration. |
| `apps/web/lib/public-media-url.ts` | Public media URL resolver (SESSION_0099) | Supports product image delivery for staging/prod. |
| `apps/web/server/admin/storage/monitoring/queries.ts` | S3 cost projection (SESSION_0099) | Informs storage cost side of commerce infrastructure. |

## Schema Models (from ubiquitous-language.md and schema.prisma)

| Model | Commerce Role |
| --- | --- |
| `Tournament` | Event container — tournament fees attach here |
| `TournamentDiscipline` | Discipline scoping within tournament |
| `Division` | Competition bracket — registration fees may vary by division |
| `Registration` | Participant registration — payment/fee association point |
| `RegistrationEntry` | Per-division entry — granular fee unit |
| `TournamentRole` | Staff/judge roles — possible compensation tracking |
| `TournamentStaffAssignment` | Staff assignments — no direct commerce |
| `PricingPlan` | Subscription/membership pricing (existing) |
| `Organization` | Org that offers memberships/programs |
| `Membership` | Org membership — potential subscription product |
| `Program` | Training program — potential course product |
| `Certification` | Credential — certificate product |

## Dirstarter Docs to Check (live)

| URL | What to Verify |
| --- | --- |
| https://dirstarter.com/docs/integrations/payments | Stripe client, checkout flow, webhook handling, product/price creation |
| https://dirstarter.com/docs/monetization | Monetization tiers, plan-based access, product catalog patterns |
| https://dirstarter.com/docs/database/prisma | Schema patterns for payment-related models |
| https://dirstarter.com/docs/authentication | Auth predicates for payment-gated content |
| https://dirstarter.com/docs/codebase/structure | Where payment/checkout code lives in the feature folder structure |

## Commerce Verticals to Classify (for PWCC Port Map)

| Vertical | Legacy Source | Questions for ADR 0014 |
| --- | --- | --- |
| **Affiliate gear** | `lib/tuffbuffs/affiliate-gear.ts` | Stay affiliate-only? Or add direct Stripe checkout for some products? |
| **Branded merch** | TuffBuffs legacy store | Separate from affiliate gear? Stripe product with fulfillment? |
| **Membership dues** | Org membership model | Stripe subscription? One-time? Per-org or platform-level? |
| **Tournament fees** | Registration/Division models | Stripe one-time checkout per registration? Per entry? Refund policy? |
| **Certificate orders** | Certification model | Physical (fulfillment) vs digital (instant)? Stripe one-time? |
| **Program enrollment** | Program/Course models | Free tier + paid tier via entitlement? Stripe subscription? |
| **Directory listing** | D-014 / ADR 0013 | Free/Standard/Premium tiers via Stripe subscription? |
| **Private lessons** | Future | Stripe one-time or package pricing? |

## Graphify Graph Context

- **Community 15** (affiliate-gear): Isolated display-only cluster. No Stripe edges.
- **Community 201** (tournament shells): Schema models documented but no payment wiring.
- **Community 90** (deployment): Env vars and deployment config including S3/Stripe keys.
- **Community 131** (ubiquitous language): Domain term definitions for all commerce models.

## Open Questions for ADR 0014

1. **Stripe Connect vs Platform:** Does each Organization get a Stripe Connect account, or does the platform collect all payments?
2. **Product naming convention:** `{brand}_{vertical}_{tier}` or Stripe metadata-driven?
3. **Price structure:** Per-brand pricing allowed, or platform-standard prices with brand metadata?
4. **Webhook routing:** Single webhook endpoint with brand routing, or per-brand webhook URLs?
5. **Entitlement mapping:** One Stripe Product = one Entitlement type, or many-to-many?
6. **Refund policy:** Entitlement revocation on refund — automatic or manual review?
7. **Tax handling:** Stripe Tax, or manual tax configuration per region?
8. **Currency:** USD-only for launch, or multi-currency from day one?

## Recommended ADR Structure

```markdown
# ADR 0014 — Stripe Product Policy

## Status: proposed
## Context: (from this runbook's analysis)
## Decision:
  - Product creation rules
  - Brand-to-product mapping
  - Naming and metadata conventions
  - Webhook handling pattern
  - Entitlement grant flow
## Dirstarter Docs Proof: (table with URLs)
## Consequences:
  - Positive
  - Negative
## Implementation Notes:
  - Schema additions needed
  - Migration from PricingPlan to Product (if decided)
  - Stripe Dashboard setup checklist
```

## Cross-References

- [SESSION_0100](../sprints/_archive/SESSION_0100.md) — planning session that created this runbook
- [SESSION_0099](../sprints/_archive/SESSION_0099.md) — S3 media bridge (storage side of commerce infra)
- [SESSION_0098](../sprints/_archive/SESSION_0098.md) — gear page (recommended PWCC port map)
- [ADR 0011](../architecture/decisions/0011-entitlement-first-commerce.md) — entitlement-first commerce
- [Dirstarter Commerce Alignment](../architecture/dirstarter-commerce-alignment.md) — baseline Stripe patterns
- [Stripe Setup Runbook](../runbooks/stripe-setup-runbook.md) — operational Stripe setup
- [AWS S3 Operator Runbook](../runbooks/aws-s3-operator-runbook.md) — media delivery for product images
