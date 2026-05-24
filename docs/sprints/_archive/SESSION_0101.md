---
title: "SESSION 0101 - PWCC Commerce Port Map and Stripe Product Policy ADR"
slug: session-0101
type: session
status: closed-full
created: 2026-05-08
updated: 2026-05-08
last_agent: copilot-session-0101
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0100.md
  - docs/sprints/SESSION_0099.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/runbooks/adr-0014-stripe-product-policy-research.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0101 - PWCC Commerce Port Map and Stripe Product Policy ADR

## Date

2026-05-08

## Operator

Brian Scott + Copilot acting as Petey (orchestrator), handing off to Cody (builder), Desi (docs/design), Giddy (ops)

## Status

closed-full

## Goal

Execute SESSION_0100 TASK_02–TASK_04: produce the PWCC Commerce Port Map document, draft ADR 0014 (Stripe Product Policy), and close with full JETTY/wiki/project-log sweep.

## Why This Is Next

SESSION_0100 created the plan and research runbook. All inputs are gathered. This session is pure execution of the staged plan.

## Source Facts

- SESSION_0100 landed: Petey plan with 4 tasks, ADR research runbook, Graphify queries.
- Research runbook at `docs/runbooks/adr-0014-stripe-product-policy-research.md` catalogs all commerce files, ADRs, schema models, Dirstarter docs, and open questions.
- `apps/web/lib/tuffbuffs/affiliate-gear.ts` fully inventoried: 34 products, 3 categories (training/accessories/recovery), 5 program collections, all Amazon affiliate — zero Stripe.
- `docs/architecture/monetization-entitlements-spec.md` — entitlement schema exists (PricingPlan → EntitlementGrant → UserEntitlement). Sessions 0094–0098 proved Checkout, webhook, subscription, refund, and drift audit.
- `docs/architecture/dirstarter-commerce-alignment.md` — Dirstarter uses Free/Standard/Premium listing tiers with Stripe one-time and subscription products, webhook-driven tier changes.
- Dirstarter live docs checked 2026-05-08: `dirstarter.com/docs/integrations/payments` (Stripe setup, product config, webhook events) and `dirstarter.com/docs/monetization` (listing tiers, ads, affiliate).
- FS-0017 acknowledged: Pattern 2 close-ritual skipping — will execute full close with all steps.

### Graphify check

- Graph status: current (rebuilt at `d5d63ee`, SESSION_0100)
- Query: `"Stripe checkout webhook payment PricingPlan subscription entitlement commerce product"` — 25 nodes, all in monetization-entitlements-spec community 35.
- Files selected: monetization-entitlements-spec.md (full community), dirstarter-commerce-alignment.md, affiliate-gear.ts, ubiquitous-language.md tournament/membership shells.

## Dirstarter Alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Payments/Stripe, monetization |
| Extension or replacement | Extension — Dirstarter provides Free/Standard/Premium listing tiers with Stripe; Ronin adds multi-vertical commerce policies for martial arts domain |
| Why justified | Ronin's commerce needs (memberships, tournament fees, certificates, program enrollment) go beyond directory listing tiers |
| Risk if bypassed | Commerce features ship without clear product boundaries; Stripe products created ad-hoc without naming/metadata conventions; brand leakage in payments |

## Petey Plan

### Goal

Deliver two documents (PWCC port map + ADR 0014) and close with full ritual compliance.

### Tasks

#### TASK_01 — PWCC Commerce Port Map document

- **Agent:** Petey + Desi
- **What:** Create `docs/architecture/pwcc-commerce-port-map.md`
- **Done means:** Document exists with all commerce verticals classified.
- **Depends on:** nothing (inputs already gathered)

#### TASK_02 — ADR 0014 Stripe Product Policy

- **Agent:** Petey
- **What:** Create `docs/architecture/decisions/0014-stripe-product-policy.md`
- **Done means:** ADR exists as draft with decision, Dirstarter proof, consequences.
- **Depends on:** TASK_01

#### TASK_03 — Full close: wiki, project log, JETTY sweep, commit

- **Agent:** Giddy + Petey
- **What:** Update wiki index, project log, run wiki-lint, commit and push, write full close evidence.
- **Done means:** All closing.md steps completed, SESSION_0101 at closed-full.
- **Depends on:** TASK_01, TASK_02

### Agent Assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey + Desi | Domain analysis and document creation |
| TASK_02 | Petey | Architectural decision based on TASK_01 output |
| TASK_03 | Giddy + Petey | Ops hygiene and ritual compliance |

### Scope Guard

- Do not implement Stripe checkout or create Stripe products.
- Do not modify affiliate gear code.
- Do not start AWS staging proof.
- Planning/docs only session.

## What Landed

- **PWCC Commerce Port Map** (`docs/architecture/pwcc-commerce-port-map.md`) — 9 commerce verticals classified with port categories, Stripe product types, brand scope, entitlement keys, priority, and blockers.
- **ADR 0014 — Stripe Product Policy** (`docs/architecture/decisions/0014-stripe-product-policy.md`) — 8 policy decisions: platform-level Stripe account, product naming convention, metadata schema, 1:1 PricingPlan→Product mapping, entitlement grant flow, webhook routing, price structure rules, product creation script pattern.
- Wiki index updated with PWCC port map, ADR 0014, SESSION_0101.
- Project log updated with SESSION_0101 task plan and review entries.
- JETTY 3.0 sweep completed.

## Files Touched

- `docs/sprints/SESSION_0101.md` — this session file (new).
- `docs/architecture/pwcc-commerce-port-map.md` — PWCC commerce port map (new).
- `docs/architecture/decisions/0014-stripe-product-policy.md` — Stripe product policy ADR (new).
- `docs/knowledge/wiki/index.md` — PWCC port map, ADR 0014, SESSION_0101 added; last_agent updated.
- `docs/protocols/project-log.md` — SESSION_0101 task plan and review entries.

## Task Log

- `SESSION_0101_TASK_01` — landed (PWCC Commerce Port Map).
- `SESSION_0101_TASK_02` — landed (ADR 0014 Stripe Product Policy).
- `SESSION_0101_TASK_03` — landed (full close: wiki, project log, JETTY sweep, commit).

## Review Log

- `SESSION_0101_REVIEW_01` recorded in Project Log.

## Hostile Close Review

- **Giddy:** No code changes — docs/planning session. Three new architecture documents created and cross-referenced. Wiki index and project log updated. FS-0017 pattern acknowledged; full close checklist followed step by step.
- **Doug:** PWCC port map covers all 9 identifiable commerce verticals with consistent classification. ADR 0014 makes 8 clear policy decisions grounded in Dirstarter baseline patterns and existing entitlement schema (proved in Sessions 0094–0098). Open questions are scoped and actionable. No scope creep.
- **Score:** 9.5/10. Cap: ADR 0014 is `proposed` status pending Brian's sign-off on open questions (Connect timing, tournament fee model, certificate pricing).

## ADR / Ubiquitous Language Check

- ADR 0014 created as `proposed`. References ADR 0011, PWCC port map, Dirstarter docs.
- No new domain terms introduced. Entitlement key convention (`{domain}:{scope}:{access-type}`) formalizes existing usage from monetization-entitlements-spec.md.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0101.md, pwcc-commerce-port-map.md, ADR 0014 all have complete JETTY 3.0 frontmatter with correct `pairs_with`, `backlinks`, `last_agent: copilot-session-0101`. Wiki/index.md `last_agent` bumped. |
| Backlinks/index sweep | Wiki index: PWCC port map added to Architecture section, ADR 0014 added to ADRs section, SESSION_0101 added to Sessions. PWCC port map `pairs_with` lists monetization spec, commerce alignment, ADR 0011, ADR 0014, security plan, programs spec, ubiquitous language, research runbook, stripe setup runbook. ADR 0014 `pairs_with` lists ADR 0011, PWCC port map, monetization spec, commerce alignment, security plan, stripe setup runbook, research runbook. All bidirectional. |
| Wiki lint | `bun run wiki:lint` — 0 errors, 3 pre-existing orphan warnings (topic-index.md, tournament-ops.md, dirstarter-uplift-backlog.md). No new warnings introduced. |
| Kaizen reflection | See Reflections section. |
| Hostile close review | SESSION_0101_REVIEW_01 recorded in project-log.md. |
| Review & Recommend | Next session goal written in Next Session section. |
| Memory sweep | No operator memory update needed — all context is in documents. |
| Next session unblock check | ADR 0014 sign-off is blocked on Brian. Stripe product creation script is unblocked once ADR is accepted. AWS staging proof remains blocked on Brian. |
| Git hygiene | Branch: main. Committed and pushed. No secrets. No uncommitted changes. |

## Reflections

- The PWCC port map was the missing connective tissue between the entitlement schema (proved in S94–98) and the actual Stripe product creation. Without it, each vertical would have been wired ad-hoc.
- ADR 0014's strongest contribution is the metadata schema — `brand` on every Stripe Product prevents the cross-brand leakage that the security plan identified as a critical bug class.
- The research runbook (SESSION_0100) was genuinely useful as a pre-flight for this session — it front-loaded the file inventory and open questions so execution was fast.
- FS-0017 pattern (close ritual skipping) is the most persistent failure mode in this repo. The evidence table is the strongest gate. Don't skip cells.

## Decisions Resolved

- 9 commerce verticals classified with port categories and priorities.
- Stripe product naming convention: `{BRAND_CODE}_{vertical}_{identifier}`.
- Entitlement key convention: `{domain}:{scope}:{access-type}`.
- Platform-level Stripe account (not Connect per org) for launch.
- Single webhook endpoint with brand metadata routing.
- USD-only for launch.
- Automatic entitlement revocation on full refund; partial refunds require manual review.

## Open Decisions / Blockers

- Brian: Sign off on ADR 0014 open questions (tournament fee model, certificate pricing, Connect timeline).
- Brian: Upgrade ADR 0014 from `proposed` to `accepted` after review.
- Brian: AWS staging proof still pending (SESSION_0099 blocker carried forward).
- `PricingPlan.stripePriceId` nullable constraint review — enforce non-null for active non-free plans?

## Next Session

- **Goal:** If Brian signs off ADR 0014: create `scripts/setup-ronin-stripe-products.ts` and wire first real Stripe products for Baseline membership/program enrollment. If not signed off: address ADR 0014 open questions, or pivot to AWS staging proof if Brian completed setup.
- **Inputs to read:** `docs/sprints/SESSION_0101.md`, `docs/architecture/pwcc-commerce-port-map.md`, `docs/architecture/decisions/0014-stripe-product-policy.md`, `apps/web/prisma/schema.prisma` (PricingPlan model), Dirstarter `scripts/setup-stripe-products.ts`.
- **First task:** Read ADR 0014 open questions, confirm Brian's decisions, then create the Stripe product setup script.
