---
title: "organizations/[slug]/page.tsx"
slug: organization-detail-page
type: file
status: active
created: 2026-04-27
updated: 2026-06-26
author: Brian + Copilot
last_agent: claude-session-0449
pairs_with:
  - knowledge/wiki/files/org-admin-access
  - knowledge/wiki/files/organizations-list-page
  - knowledge/wiki/files/join-organization-button
  - knowledge/wiki/files/discipline-detail-page
  - knowledge/wiki/files/schools-detail-page
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0012
wiring:
  - "apps/web/server/web/organization/queries.ts — getOrganizationBySlug(_brand, slug) (brand-agnostic; resolves by slug alone)"
  - "apps/web/components/web/organizations/join-organization-button.tsx — JoinOrganizationButton"
  - "apps/web/proxy.ts — x-brand header"
tags: [organization, page, detail, s3, ui]
---

# organizations/[slug]/page.tsx

**Path:** `apps/web/app/(web)/organizations/[slug]/page.tsx`

Server component detail page. Shows org info (owner, address, website, disciplines), member list with status badges, and join buttons per discipline.

Resolves the org by `slug` alone — `getOrganizationBySlug(_brand, slug)` is brand-agnostic since SESSION_0448 (`findFirst({ where: { slug }, orderBy: { createdAt: "asc" } })`). The `_brand` arg is vestigial (ignored), pending the ADR-0034 brand-column prune; the `orderBy: { createdAt: asc }` tie-break covers the fact that `slug` is only `@@unique([brand, slug])`, not globally unique.

> **Note:** Non-BBL (e.g. `BASELINE_MARTIAL_ARTS`) orgs now resolve and render on this public page — previously they 404'd because the composite `brand_slug` lookup was the de-facto fence. There is no positive visibility gate; brand-scoping was the only thing keeping non-BBL orgs off the public route.
