---
title: "SESSION 0100 - PWCC Commerce Port Map and Stripe Product Policy"
slug: session-0100
type: session
status: closed-quick
created: 2026-05-08
updated: 2026-05-08
last_agent: copilot-session-0100
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0099.md
  - docs/sprints/SESSION_0098.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0100 - PWCC Commerce Port Map and Stripe Product Policy

## Date

2026-05-08

## Operator

Brian Scott + Copilot acting as Giddy (staging/ops), Petey (planning)

## Status

closed-quick

## Goal

Produce a formal PWCC (Products, Wallets, Certificates, Commerce) port map that separates all commerce concerns from the TuffBuffs legacy into distinct, brand-aware Stripe product policies for the Ronin Dojo platform. Define which commerce features are affiliate display, which become Stripe products, and which require fulfillment, certificate, membership, or tournament fee flows.

## Why This Is Next

SESSION_0099 completed the S3 public media bridge. AWS staging proof is blocked on Brian's manual setup. SESSION_0098's "Next session" recommended this PWCC port map as the alternative track. The commerce layer is the next critical path to Baseline Martial Arts launch.

## Source Facts

- SESSION_0099 landed: public media URL resolver, admin storage monitor, AWS S3 operator runbook.
- SESSION_0098 recommended: formal PWCC/TuffBuffs commerce port map.
- Graphify graph updated at commit `d5d63ee` (SESSION_0099 commit).
- Graphify query `"PWCC commerce port map Stripe products affiliate gear certificate orders memberships tournament fees"` — identified affiliate-gear community (community 15), tournament shells (community 201), deployment/env (community 90).
- Key files from graph: `apps/web/lib/tuffbuffs/affiliate-gear.ts`, `apps/web/components/web/tuffbuffs/affiliate-gear-*.tsx`, `docs/architecture/ubiquitous-language.md` (Tournament shells), `docs/runbooks/deployment.md`.

### Graphify check

- Graph status: current (rebuilt at `d5d63ee`)
- Queries used:
  - `"PWCC commerce port map Stripe products affiliate gear certificate orders memberships tournament fees"` — 21 nodes
  - `"S3 staging proof AWS bucket storage deployment Vercel env configuration"` — 23 nodes
- Files selected from graph: affiliate-gear community, tournament shells in ubiquitous-language, deployment runbook
- Verification note: Graph confirms affiliate gear is isolated in community 15; tournament models are documented in ubiquitous-language but have no Stripe wiring yet.

## Dirstarter Alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Payments/Stripe, content/commerce |
| Extension or replacement | Extension — Dirstarter has Stripe integration scaffolding; Ronin adds brand-aware product policies |
| Why justified | Launch requires knowing which commerce flows exist, which are affiliate-only, and which need Stripe checkout |
| Risk if bypassed | Commerce features ship without clear product/fulfillment boundaries; Stripe misconfiguration; brand leakage in payments |

## Petey Plan

### Goal

Produce a PWCC port map document and define Stripe product policies for all commerce verticals (affiliate gear, certificates, memberships, tournament fees, branded merch).

### Tasks

#### TASK_01 — Bow-in, commit SESSION_0099, Graphify refresh, plan creation

- **Agent:** Giddy (ops) + Petey (plan)
- **What:** Stage and push SESSION_0099 work, refresh Graphify, query for commerce context, create SESSION_0100 with plan.
- **Done means:** SESSION_0099 committed and pushed, graph current, SESSION_0100 created with Petey plan.
- **Status:** ✅ landed

#### TASK_02 — PWCC Commerce Port Map document

- **Agent:** Petey + Desi
- **What:** Create `docs/architecture/pwcc-commerce-port-map.md` that inventories every commerce concern from TuffBuffs/legacy and classifies each as: affiliate display (no Stripe), Stripe one-time product, Stripe subscription, Stripe checkout with fulfillment, or future/deferred.
- **Steps:**
  1. Read `apps/web/lib/tuffbuffs/affiliate-gear.ts` — catalog all product types and price structures.
  2. Read `docs/architecture/ubiquitous-language.md` — tournament fee, registration, membership terminology.
  3. Read `docs/architecture/security-privacy-payments-monitoring-plan.md` — payment security posture.
  4. Read `docs/architecture/dirstarter-commerce-alignment.md` if it exists — Dirstarter's Stripe patterns.
  5. Produce the port map with columns: Commerce Vertical | Legacy Source | Port Category | Stripe Product Type | Brand Scope | Priority | Blocked By.
- **Done means:** `docs/architecture/pwcc-commerce-port-map.md` exists with all verticals classified.
- **Depends on:** TASK_01

#### TASK_03 — Stripe product policy ADR

- **Agent:** Petey
- **What:** Draft ADR for Stripe product creation policy: how products map to brands, naming conventions, price structure, metadata schema, webhook handling pattern.
- **Steps:**
  1. Read existing ADRs for pattern.
  2. Read Dirstarter Stripe integration docs.
  3. Draft ADR with decision, context, consequences.
- **Done means:** `docs/architecture/decisions/NNNN-stripe-product-policy.md` exists as draft.
- **Depends on:** TASK_02

#### TASK_04 — Update wiki index, project log, and close

- **Agent:** Giddy + Petey
- **What:** Update wiki index with new docs, add project-log entries, bow out.
- **Done means:** Wiki index updated, project log updated, SESSION_0100 closed.
- **Depends on:** TASK_02, TASK_03

### Parallelism

TASK_02 and TASK_03 are sequential (TASK_03 depends on TASK_02's classifications). TASK_04 is sequential after both.

### Agent Assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Giddy + Petey | Ops staging + planning — no code execution |
| TASK_02 | Petey + Desi | Research and document creation, needs legacy inventory analysis |
| TASK_03 | Petey | Architectural decision, needs TASK_02 output |
| TASK_04 | Giddy + Petey | Index/log hygiene and session close |

### Open Decisions

- Brian must confirm whether AWS staging proof or PWCC port map is the priority for SESSION_0100 execution.
- Stripe Connect vs platform-level products decision may surface during TASK_03.
- Certificate commerce (rank certificates, tournament awards) — physical fulfillment vs digital delivery TBD.

### Risks

- `docs/architecture/dirstarter-commerce-alignment.md` may not exist yet — if missing, read Dirstarter Stripe docs directly.
- Affiliate gear is currently display-only (Amazon links); converting any to Stripe checkout is a scope expansion.
- Tournament fee structure may need schema additions not yet in S1 models.

### Scope Guard

- Do not implement Stripe checkout or create Stripe products in this session.
- Do not modify affiliate gear code — this is a planning/documentation session.
- Do not start AWS staging proof — that's blocked on Brian's manual setup.
- If schema gaps surface, note them for a future session.

### Dirstarter Implementation Template

- **Docs read first:** Dirstarter Stripe/payments docs (to be checked at TASK_02 step 4)
- **Baseline pattern to extend:** Dirstarter Stripe integration scaffolding (checkout, webhooks, product sync)
- **Custom delta:** Brand-aware product policies, multi-vertical commerce classification, certificate/tournament fee flows
- **No-bypass proof:** Dirstarter provides Stripe primitives; Ronin adds the product policy layer on top

## What Landed

- SESSION_0099 committed and pushed (16 files, 1134 insertions).
- Graphify graph refreshed (5154 nodes, 9089 edges, 383 communities).
- SESSION_0100 created with Petey plan for PWCC Commerce Port Map.

## Files Touched

- `docs/sprints/SESSION_0100.md` — this session file.

## Decisions Resolved

- SESSION_0099 work committed to main — no secrets in commit.
- PWCC port map confirmed as SESSION_0100 goal (per SESSION_0098/0099 recommendations).

## Open Decisions / Blockers

- Brian: AWS staging proof still pending (SESSION_0099 blocker carried forward).
- Brian: Confirm PWCC port map as SESSION_0100 execution priority vs AWS staging.
- Stripe Connect vs platform-level product model — surfaces during TASK_03.

## Next Session

- **Goal:** Execute TASK_02–TASK_04 from this plan (PWCC port map, Stripe ADR, index updates). Or, if Brian completes AWS setup, pivot to staging storage proof.
- **Inputs to read:** `docs/sprints/SESSION_0100.md` (this file), `apps/web/lib/tuffbuffs/affiliate-gear.ts`, `docs/architecture/ubiquitous-language.md`, `docs/architecture/security-privacy-payments-monitoring-plan.md`, Dirstarter Stripe docs.
- **First task:** Read affiliate-gear.ts and classify every product/price type for the port map.
