---
title: "Runbooks — Domain Hub"
slug: runbooks-hub
type: index
status: active
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0303
pairs_with:
  - docs/knowledge/wiki/index.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Runbooks — Domain Hub

Operational runbooks, grouped by domain. Files live in `runbooks/<domain>/`. For a searchable
browser of all docs, run `bun run docs:nav` (see [Docs Navigator](dev-environment/docs-navigator.md)).

## Database

- [database](database/database.md) — database operations overview.
- [schema-migration](database/schema-migration.md) — Prisma migration cycle (create → apply → verify).
- [prisma-workflow](database/prisma-workflow.md) — day-to-day Prisma workflow.
- [neon-advisory-lock-recovery](database/neon-advisory-lock-recovery.md) — recovering from Neon advisory-lock contention.

## Deploy & Infra

- [deployment](deploy/deployment.md) — deployment overview.
- [vercel-deploy](deploy/vercel-deploy.md) — Vercel deploy steps.
- [vercel-domain-setup-runbook](deploy/vercel-domain-setup-runbook.md) — attaching domains on Vercel.
- [bbl-production-runbook](deploy/bbl-production-runbook.md) — Black Belt Legacy production operations.
- [white-label-site-runbook](deploy/white-label-site-runbook.md) — standing up a white-label brand site.

## Dev Environment

- [dev-environment](dev-environment/dev-environment.md) — local dev setup.
- [local-dev-auth-storage](dev-environment/local-dev-auth-storage.md) — local auth + S3/MinIO storage.
- [mcp-usage-runbook](dev-environment/mcp-usage-runbook.md) — using the available MCP servers.
- [graphify-repo-memory](dev-environment/graphify-repo-memory.md) — Graphify repo-graph discovery.
- [docs-navigator](dev-environment/docs-navigator.md) — searchable HTML docs browser.

## Integrations

- [stripe-setup-runbook](integrations/stripe-setup-runbook.md) — Stripe configuration.
- [resend-setup-runbook](integrations/resend-setup-runbook.md) — Resend transactional email.
- [printful-setup-runbook](integrations/printful-setup-runbook.md) — Printful print-on-demand.
- [aws-s3-operator-runbook](integrations/aws-s3-operator-runbook.md) — S3 / MinIO operator tasks.
- [product-catalog-seed](integrations/product-catalog-seed.md) — seeding the product catalog.
- [adr-0014-stripe-product-policy-research](integrations/adr-0014-stripe-product-policy-research.md) — ADR-0014 Stripe product-policy research.

## Domain Features

- [invites](domain-features/invites.md) — invite → claim → membership flow.
- [course-curriculum-runbook](domain-features/course-curriculum-runbook.md) — courses & curriculum.
- [baseline-listings-runbook](domain-features/baseline-listings-runbook.md) — Baseline directory listings.
- [lineage-listing-runbook](domain-features/lineage-listing-runbook.md) — lineage trees & listings.
- [nav-sidebar-menu-runbook](domain-features/nav-sidebar-menu-runbook.md) — navigation & sidebar menu.

## SOPs

- [sop-data-and-wiring-flows](sops/sop-data-and-wiring-flows.md) — end-to-end data flows & wiring. Includes security gates per flow.
- [sop-test-writing](sops/sop-test-writing.md) — test-writing standard operating procedure.
- [sop-e2e-user-lifecycle](sops/sop-e2e-user-lifecycle.md) — end-to-end user lifecycle. Includes security gates per stage.
- [sop-agent-workflows-and-rituals](sops/sop-agent-workflows-and-rituals.md) — agent workflows & session rituals.
- [sop-email-runbook](sops/sop-email-runbook.md) — email sending SOP.

## Security & Data Integrity

Cross-cutting security references — not a standalone runbook, because security gates live
inline in each flow/lifecycle SOP above. This section indexes them.

- **Architecture plan:** [security-privacy-payments-monitoring-plan.md](../architecture/security-privacy-payments-monitoring-plan.md) — data classification, hostile review findings, required gates.
- **Auth design:** [auth.md](../architecture/auth.md) — Better-Auth session model, admin lockdown, cross-brand isolation, roles.
- **Brand isolation:** ADRs [0004](../architecture/decisions/0004-multi-brand-as-column.md), [0006](../architecture/decisions/0006-multi-domain-hosting.md), [0008](../architecture/decisions/0008-brand-switcher.md) — `brand` column, host→brand middleware, per-brand themes.
- **Org-admin auth helper:** `apps/web/server/web/organization/org-admin-access.ts` — canonical `assertOrgAdminAccess` / `hasOrgAdminAccess` shared by all org-scoped actions.
- **Drift register:** [drift-register.md](../knowledge/wiki/drift-register.md) — tracks auth/data model divergences.

### Security hardening done (SESSION_0287–0300)

| Area | What was hardened | Session |
| --- | --- | --- |
| Media uploads | `uploadMedia`/`fetchMedia` gated by `canUploadMedia` via `mediaUploadActionClient`; no public write to S3 | 0288 |
| Media attachments | Admin-only `attachMedia`/`detachMedia`; safe-action test suite proves unauth/non-admin rejection | 0289 |
| Brand settings | `adminActionClient` gate — platform admin only | 0291 |
| Org theme (self-service) | `assertOrgAdminAccess` — owner OR ORG_ADMIN | 0294, 0295 |
| Org members | `assertOrgAdminAccess` + cross-org guard on every mutation; optimistic locking on status transitions | 0296, 0297 |
| Org invites | `assertOrgAdminAccess` + cross-org guard on revoke; brand sourced server-side from org row | 0298 |
| Org general info | `assertOrgAdminAccess` via `updateOrgGeneralInfo` | 0298 |
| Dashboard school-form | `assertOrgAdminAccess` replaces legacy OWNER role-assignment check (D-017) | 0300 |

## Design

- [baseline-design-system](design/baseline-design-system.md) — Baseline design-system hub: tokens, type/spacing scales, `[data-brand]` override model, v1 layering strategy. Pairs with ADR 0022.
- [ui-library-candidates](design/ui-library-candidates.md) — bklit / trophy.so integration evaluation (research note).
- [motion-system](design/motion-system.md) — martial-arts motion language: easing/duration tokens, `prefers-reduced-motion` discipline, per-surface animation catalog, staged epic. Pairs with the design hub + ADR 0022.

## Porting

- [react-to-next-component-porting-runbook](porting/react-to-next-component-porting-runbook.md) — porting React components to Next.js.
