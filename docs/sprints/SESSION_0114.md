---
title: "SESSION 0114 — Printful POD Planning + Resend Email Setup"
slug: session-0114
type: session
status: closed-full
created: 2026-05-09
updated: 2026-05-09
last_agent: copilot-session-0114
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0113.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0114 — Printful POD Planning + Resend Email Setup

## Date

2026-05-09

## Operator

Brian Scott + Copilot

## Status

closed-full

## Goal

Printful POD integration planning + Resend email setup. Two parallel tracks from SESSION_0113's pre-staged plan: (1) configure Resend account/domain so merch order confirmation emails deliver, and (2) research Printful API and write the integration spec doc.

## Task Plan

- SESSION_0114_TASK_00 — Infrastructure documentation: domain registry, DNS spec, email spec, hosting data flows, ADR 0015 (Petey)
- SESSION_0114_TASK_01 — Resend account + domain verification setup (Cody)
- SESSION_0114_TASK_02 — Printful POD integration research + spec (Petey)
- SESSION_0114_TASK_03 — Printful API client scaffold, if runway permits (Cody, depends on TASK_02)

## What Landed

- ✅ **TASK_00 — Infrastructure documentation folder** (`docs/architecture/infrastructure/`): README index, domain-hosting-registry, dns-verification-spec, email-delivery-spec, hosting-data-flow (ASCII diagrams + Mermaid topology)
- ✅ **ADR 0015 — Domain Hosting Infrastructure**: SSH deploy scripts dead, Bluehost as DNS registrar only, Flywheel decommissioned after BBL migration, domain migration follows brand build order
- ✅ **TASK_01 spec — Resend Setup Runbook** (`docs/runbooks/resend-setup-runbook.md`): step-by-step operator guide with ASCII diagrams for account creation, DNS records in Bluehost cPanel, domain verification, env vars, test flow, troubleshooting, Vercel production config
- ✅ **TASK_02 spec — Printful POD Integration Spec** (`docs/architecture/printful-pod-spec.md`): current vs target state ASCII flows, API overview, product mapping strategy, order creation flow, fulfillment webhook flow, file structure, env vars, 7 open decisions with leanings, Mermaid sequence diagram, implementation priority phases
- ✅ **Wiki index updated**: added all new architecture specs, ADR 0015, infrastructure folder entries, Resend runbook, deployment runbook
- ✅ **Graphify query**: confirmed key integration points (notifications.ts community 135, webhook route community 14, stripe services community 9)

## Files Touched

- `docs/architecture/infrastructure/README.md` — NEW. Index for infrastructure documentation folder
- `docs/architecture/infrastructure/domain-hosting-registry.md` — NEW. Master registry of all 6 domains + hosting providers + migration checklist
- `docs/architecture/infrastructure/dns-verification-spec.md` — NEW. Per-domain DNS record matrix for Vercel + Resend
- `docs/architecture/infrastructure/email-delivery-spec.md` — NEW. Resend architecture, brand sender map, multi-domain strategy
- `docs/architecture/infrastructure/hosting-data-flow.md` — NEW. Current/target state ASCII diagrams, request flow, Mermaid topology
- `docs/architecture/decisions/0015-domain-hosting-infrastructure.md` — NEW. ADR: no SSH scripts, Bluehost DNS only, domain migration order
- `docs/runbooks/resend-setup-runbook.md` — NEW. Operator runbook for Resend account + domain verification + testing
- `docs/architecture/printful-pod-spec.md` — NEW. Full integration spec with ASCII flows, Mermaid sequence diagram, open decisions
- `docs/knowledge/wiki/index.md` — MODIFIED. Added all new entries to Architecture, ADRs, and Runbooks sections
- `docs/sprints/SESSION_0114.md` — This file

## Decisions Resolved

- SSH deploy scripts are dead scope — legacy WordPress rsync, not needed for Vercel stack
- Bluehost stays as DNS registrar for all domains (except BBL which uses Flywheel until migration)
- Infrastructure docs live in `docs/architecture/infrastructure/` (not a separate top-level folder)
- Printful product mapping uses `metadata.printfulVariantId` on existing PricingPlan (no schema change)

## Open Decisions / Blockers

- **Resend not yet configured**: Runbook is written but Brian needs to execute steps 1–6 (account creation, DNS records, API key). Cody can wire env vars once Brian has the key.
- **Printful open decisions**: 7 decisions documented in spec (auth model, product sync direction, fulfillment webhook, multi-brand, confirm mode, print file hosting, shipping cost) — need Brian sign-off before implementation
- **Graphify stale**: Graph at `df5d3ad3`, HEAD at `ad5c384` — should refresh before next code-heavy session

## Next Session

### Goal

Execute Resend setup (Brian does account + DNS, Cody wires env vars + tests) and get Brian's sign-off on Printful spec open decisions. If runway: scaffold `services/printful.ts` client.

### Inputs to read

- This SESSION file (all specs landed, open decisions listed)
- `docs/runbooks/resend-setup-runbook.md` — operator steps for Brian
- `docs/architecture/printful-pod-spec.md` — 7 open decisions needing sign-off
- `apps/web/app/api/stripe/webhooks/route.ts` — merch handler to extend
- `apps/web/lib/notifications.ts` — notification pattern for Printful wiring
- `apps/web/env.ts` — where PRINTFUL_API_KEY will be declared

### First task

TASK_01 (Resend env wiring) if Brian has done DNS verification, otherwise TASK_02 (Printful open decisions review) while DNS propagates.

## Task Log

- SESSION_0114_TASK_00 — Infrastructure documentation folder ✅
- SESSION_0114_TASK_01 — Resend setup runbook (spec only) ✅
- SESSION_0114_TASK_02 — Printful POD integration spec (spec only) ✅

## Graphify Check

- Graph status: slightly stale (`df5d3ad3` vs `ad5c384`) — acceptable for doc planning
- Query: `"Resend email notification Printful merch webhook Stripe domain DNS infrastructure deployment"`
- Files selected: `notifications.ts` (c135), `route.ts` webhook (c14), `stripe.ts` (c9), `stripe-setup-runbook.md` (c25), `env.ts` (c81)
- Verification: confirmed no pre-existing Printful/Resend nodes — all new docs are net-new scope

## ADR / Ubiquitous Language Check

- ADR 0015 created: Domain Hosting Infrastructure (SSH dead, Bluehost DNS, Flywheel decommission plan)
- No new domain terms introduced — "Printful", "POD", "Resend" are industry terms, not project-specific ubiquitous language

## Reflections

### What went well

- Graphify query was genuinely useful — confirmed the exact integration points (communities 9, 14, 135) and verified no pre-existing Printful/Resend nodes, saving time on scope scoping.
- Legacy deploy script (`deploy-tuffbuffs-prod.sh`) had excellent terminal UX patterns (colors, retry logic, SSH connection pooling, verification steps). Worth referencing if we ever build operator scripts for the new stack.
- Infrastructure docs folder creates a clean separation between "how the app works" (architecture) and "where it runs" (infrastructure). Good organizational precedent.
- Printful spec's 7 open decisions with "leaning" column gives Brian a quick sign-off path rather than open-ended questions.

### What could improve

- Session was doc-heavy with no execution. The Resend runbook is ready but can't be tested until Brian does the account/DNS steps. Consider pairing sessions where Brian does operator tasks while Copilot does code tasks in parallel.
- ASCII diagram fenced code blocks don't have language tags — markdown linter flags them. Should establish a convention (use `text` as the language tag for ASCII art).
- Infrastructure folder was created inside `architecture/` — could argue it belongs in `runbooks/` or as a top-level `docs/infrastructure/`. Current placement is fine but worth noting if the folder grows.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | All 8 new files verified: `updated: 2026-05-09`, `last_agent: copilot-session-0114`, correct `status` per file type |
| Backlinks/index sweep | Wiki index updated with 8 new entries (6 architecture, 1 ADR, 1 runbook). `pairs_with` set on all new docs. Infrastructure README cross-links ADR 0006, 0015, deployment runbook, Resend runbook, Printful spec, Stripe runbook |
| Wiki lint | Not run (no `bun run wiki:lint` script confirmed available) — manual sweep completed |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0114_REVIEW_01 in project-log. Doc-only session — no Dirstarter baseline layers touched, no security/payments code changes. Score: 8 |
| Review & Recommend | Next session goal written: yes — Resend execution + Printful decisions |
| Memory sweep | None needed — infrastructure docs are the persistent artifact; no new operator preferences or constraints discovered |
| Next session unblock check | Partially blocked on user: Brian must create Resend account + add DNS records before email testing can proceed. Printful spec review is unblocked. |
| Git hygiene | Changes uncommitted — user to review and commit at their discretion |
