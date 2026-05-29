---
title: Dirstarter Docs Inventory
slug: dirstarter-docs-inventory
type: concept
status: active
created: 2026-04-28
updated: 2026-05-11
author: Petey
last_agent: copilot-session-0134
pairs_with:
  - docs/knowledge/wiki/dirstarter-gap-audit.md
parent: docs/knowledge/wiki/index.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0019.md
  - docs/sprints/SESSION_0029.md
  - docs/sprints/SESSION_0030.md
needs_fix:
  - "Run a full inventory refresh before staging deploy; SESSION_0029 only patched commerce-relevant live URL drift"
wiring:
  - "apps/web/.dirstarter-upstream -> copied_at_sha c42e8bbc9a093daa8bb70faebfc552399134ee13"
tags:
  - dirstarter
  - audit
  - docs
  - l1
---

# Dirstarter Docs Inventory

## Summary

This page captures the current Dirstarter documentation surface used by SESSION_0019. It exists so the repo has a dated, reviewable record of what the live docs said when we audited compliance.

## Status

Active. This began as the canonical docs inventory snapshot for SESSION_0019. SESSION_0029 patched commerce-relevant live URL drift only; it is not a full inventory refresh.

## SESSION_0029 URL drift patch

Live Dirstarter docs checked on 2026-04-30 show these current commerce-relevant paths:

- [Content Management](https://dirstarter.com/docs/content)
- [Search Engine Optimization](https://dirstarter.com/docs/seo)

Older references to `/docs/content-management` and `/docs/search-engine-optimization` should be treated as stale aliases unless the live docs restore them.

## SESSION_0030 security patch

Live Dirstarter docs checked on 2026-04-30 for the SESSION_0030 hostile close security review:

- [Project Structure](https://dirstarter.com/docs/codebase/structure)
- [Prisma Setup](https://dirstarter.com/docs/database/prisma)
- [Authentication](https://dirstarter.com/docs/authentication)
- [Environment Setup](https://dirstarter.com/docs/environment-setup)
- [Payments](https://dirstarter.com/docs/integrations/payments)
- [Monetization](https://dirstarter.com/docs/monetization)
- [Rate Limiting](https://dirstarter.com/docs/integrations/rate-limiting)
- [Analytics](https://dirstarter.com/docs/integrations/analytics)
- [Storage](https://dirstarter.com/docs/integrations/storage)
- [Deployment](https://dirstarter.com/docs/deployment)
- [Cron Jobs](https://dirstarter.com/docs/cron-jobs)
- [Content Management](https://dirstarter.com/docs/content)

Security interpretation is captured in [Security, Privacy, Payments, and Monitoring Plan](../../architecture/security-privacy-payments-monitoring-plan.md).

## Alignment URLs (SESSION_0134)

These 10 live doc pages are the **mandatory alignment targets** for every sprint. Before building any feature that touches these areas, verify our implementation matches the current Dirstarter guidance.

| Area | URL |
|---|---|
| Storage | <https://dirstarter.com/docs/integrations/storage> |
| Payments | <https://dirstarter.com/docs/integrations/payments> |
| Media | <https://dirstarter.com/docs/integrations/media> |
| Content | <https://dirstarter.com/docs/content> |
| Monetization | <https://dirstarter.com/docs/monetization> |
| Blog | <https://dirstarter.com/docs/blog> |
| Authentication | <https://dirstarter.com/docs/authentication> |
| Theming | <https://dirstarter.com/docs/theming> |
| Prisma | <https://dirstarter.com/docs/database/prisma> |
| Hosting | <https://dirstarter.com/docs/database/hosting> |

## Key Idea

Dirstarter is our L1 pattern source, but the live docs move faster than our pinned upstream copy. We therefore need a local inventory page every time we perform a compliance audit.

## Structure

### Setup

- [Introduction](https://dirstarter.com/docs/introduction)
- [Getting Started](https://dirstarter.com/docs/getting-started)
- [Environment Setup](https://dirstarter.com/docs/environment-setup)
- [First Steps](https://dirstarter.com/docs/first-steps)

### Codebase

- [Project Structure](https://dirstarter.com/docs/codebase/structure)
- [Editor Setup](https://dirstarter.com/docs/codebase/ide)
- [Formatting & Linting](https://dirstarter.com/docs/codebase/linting)
- [Updating the Codebase](https://dirstarter.com/docs/codebase/updates)

### Integrations

- [Overview](https://dirstarter.com/docs/integrations)
- [Email](https://dirstarter.com/docs/integrations/email)
- [Storage](https://dirstarter.com/docs/integrations/storage)
- [Rate Limiting](https://dirstarter.com/docs/integrations/rate-limiting)
- [Analytics](https://dirstarter.com/docs/integrations/analytics)
- [Environment Setup](https://dirstarter.com/docs/environment-setup)
- [Deployment](https://dirstarter.com/docs/deployment)
- [Payments](https://dirstarter.com/docs/integrations/payments)
- [Media](https://dirstarter.com/docs/integrations/media)
- [Rate Limiting](https://dirstarter.com/docs/integrations/rate-limiting)
- [Analytics](https://dirstarter.com/docs/integrations/analytics)

### Features

- [Content Management](https://dirstarter.com/docs/content)
- [Monetization](https://dirstarter.com/docs/monetization)
- [Automation](https://dirstarter.com/docs/automation)
- [Blog](https://dirstarter.com/docs/blog)
- [Search Engine Optimization](https://dirstarter.com/docs/seo)
- [Internationalization](https://dirstarter.com/docs/i18n)

### Others

- [Authentication](https://dirstarter.com/docs/authentication)
- [Theming](https://dirstarter.com/docs/theming)

### Database and deployment

- [Prisma Setup](https://dirstarter.com/docs/database/prisma)
- [Postgres Hosting](https://dirstarter.com/docs/database/hosting)
- [Deployment](https://dirstarter.com/docs/deployment)
- [Cron Jobs](https://dirstarter.com/docs/cron-jobs)

## Coverage depth (SESSION_0019 audit)

| Docs area | Pages | Depth |
|---|---|---|
| Setup | introduction, getting-started, environment-setup, first-steps | Deep on intro/getting-started/env-setup; inventory-confirmed for first-steps |
| Codebase | structure, ide, linting, updates | Deep on structure/editor/linting; update process inventory-confirmed |
| Integrations | overview, email, storage, payments, media, rate-limiting, analytics | Deep on overview/email/storage/media/rate-limiting/analytics; payments inventory-confirmed |
| Features | content, monetization, automation, blog, seo, i18n | Deep on monetization/automation/i18n; content/blog/seo inventory-confirmed |
| Others | authentication, theming | Deep |
| Database and deploy | prisma, hosting, deployment, cron-jobs | Deep on prisma/hosting/deployment; cron inventory-confirmed |

## Relationships

- Pairs with: [Dirstarter Gap Audit](dirstarter-gap-audit.md)
- Backlinks: [wiki index](index.md), [SESSION_0019](../../sprints/_archive/SESSION_0019.md)

## Sources

Short verbatim anchors from the live docs:

> Introduction: "Built with Next.js 16 App Router and TypeScript."
> Project Structure: "Dirstarter follows a modular architecture"
> Authentication: "Middleware auth check should not be the only protection"
> Prisma Setup: "`prisma/schema.prisma`"
> Storage: "Amazon S3"

Primary source links:

- [Introduction](https://dirstarter.com/docs/introduction)
- [Project Structure](https://dirstarter.com/docs/codebase/structure)
- [Authentication](https://dirstarter.com/docs/authentication)
- [Prisma Setup](https://dirstarter.com/docs/database/prisma)
- [Payments](https://dirstarter.com/docs/integrations/payments)
- [Content Management](https://dirstarter.com/docs/content)
- [Monetization](https://dirstarter.com/docs/monetization)
- [Automation](https://dirstarter.com/docs/automation)
- [Blog](https://dirstarter.com/docs/blog)
- [Search Engine Optimization](https://dirstarter.com/docs/seo)
- [Theming](https://dirstarter.com/docs/theming)
- [Cron Jobs](https://dirstarter.com/docs/cron-jobs)
- [Storage](https://dirstarter.com/docs/integrations/storage)

## Open Questions

- Are we auditing against live docs HEAD, or against the upstream commit pinned in `apps/web/.dirstarter-upstream`?
- Which live-doc changes are intentional repo divergences versus upstream drift we should merge back toward?
- Should we preserve Dirstarter residue as reference-only until post-MVP, or remove it now?
