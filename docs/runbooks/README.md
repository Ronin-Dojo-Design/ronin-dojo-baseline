---
title: "Runbooks — Domain Hub"
slug: runbooks-hub
type: index
status: active
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0298
pairs_with:
  - docs/knowledge/wiki/index.md
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

- [sop-data-and-wiring-flows](sops/sop-data-and-wiring-flows.md) — end-to-end data flows & wiring.
- [sop-test-writing](sops/sop-test-writing.md) — test-writing standard operating procedure.
- [sop-e2e-user-lifecycle](sops/sop-e2e-user-lifecycle.md) — end-to-end user lifecycle.
- [sop-agent-workflows-and-rituals](sops/sop-agent-workflows-and-rituals.md) — agent workflows & session rituals.
- [sop-email-runbook](sops/sop-email-runbook.md) — email sending SOP.

## Porting

- [react-to-next-component-porting-runbook](porting/react-to-next-component-porting-runbook.md) — porting React components to Next.js.
