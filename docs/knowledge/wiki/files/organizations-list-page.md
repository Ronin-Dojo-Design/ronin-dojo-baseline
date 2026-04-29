---
title: "organizations/page.tsx"
slug: organizations-list-page
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + Copilot
last_agent: copilot-session-0012
pairs_with:
  - knowledge/wiki/files/organization-detail-page
  - knowledge/wiki/files/organization-new-page
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0012
wiring:
  - "apps/web/server/web/organization/queries.ts — getOrganizationsByBrand()"
  - "apps/web/proxy.ts — x-brand header"
  - "apps/web/components/common/card.tsx — Card/CardHeader/CardDescription"
  - "apps/web/components/common/badge.tsx — Badge"
  - "apps/web/components/web/ui/grid.tsx — Grid"
tags: [organization, page, list, s3, ui]
---

# organizations/page.tsx

**Path:** `apps/web/app/(web)/organizations/page.tsx`

Server component list page. Shows all organizations for the current brand in a card grid. Each card links to the detail page and shows type badge, member count, and discipline badges.

Includes "Create Organization" button linking to `/organizations/new`.
