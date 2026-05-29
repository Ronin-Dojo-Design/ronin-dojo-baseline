---
title: "organizations/[slug]/page.tsx"
slug: organization-detail-page
type: file
status: active
created: 2026-04-27
updated: 2026-05-29
author: Brian + Copilot
last_agent: claude-session-0298
pairs_with:
  - knowledge/wiki/files/organizations-list-page
  - knowledge/wiki/files/join-organization-button
  - knowledge/wiki/files/discipline-detail-page
  - knowledge/wiki/files/schools-detail-page
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0012
wiring:
  - "apps/web/server/web/organization/queries.ts — getOrganizationBySlug(brand, slug)"
  - "apps/web/components/web/organizations/join-organization-button.tsx — JoinOrganizationButton"
  - "apps/web/proxy.ts — x-brand header"
tags: [organization, page, detail, s3, ui]
---

# organizations/[slug]/page.tsx

**Path:** `apps/web/app/(web)/organizations/[slug]/page.tsx`

Server component detail page. Shows org info (owner, address, website, disciplines), member list with status badges, and join buttons per discipline.

Uses composite `brand_slug` unique key for lookup (not slug alone).
