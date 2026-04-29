---
title: "organizations/new/page.tsx"
slug: organization-new-page
type: file
status: active
created: 2026-04-27
updated: 2026-04-29
author: Brian + Copilot
last_agent: codex-session-0025
pairs_with:
  - knowledge/wiki/files/create-organization-form
  - knowledge/wiki/files/discipline-queries
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0012
  - docs/knowledge/wiki/files/organizations-list-page.md
wiring:
  - "apps/web/components/web/organizations/create-organization-form.tsx — form component"
  - "apps/web/server/web/organization/discipline-queries.ts — getDisciplinesByBrand()"
  - "apps/web/proxy.ts — x-brand header injection"
  - "apps/web/components/web/ui/intro.tsx — Intro/IntroTitle/IntroDescription"
  - "apps/web/components/web/ui/section.tsx — Section/Section.Content"
tags: [organization, page, s3, ui]
---

# organizations/new/page.tsx

**Path:** `apps/web/app/(web)/organizations/new/page.tsx`

Server component page for creating a new Organization. Reads brand from the `x-brand` header (set by `proxy.ts`), fetches disciplines by brand, and renders the `CreateOrganizationForm` client component.

## Brand resolution

Brand flows: `proxy.ts` → `x-brand` header → `headers().get("x-brand")` → passed as prop to form.

No middleware — consolidated into `proxy.ts` per SESSION_0008.
