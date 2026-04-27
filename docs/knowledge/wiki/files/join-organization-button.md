---
title: "join-organization-button.tsx"
slug: join-organization-button
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + Copilot
last_agent: copilot-session-0012
pairs_with:
  - knowledge/wiki/files/organization-detail-page
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0012
health: 7
wiring:
  - "apps/web/server/web/organization/actions.ts — joinOrganization server action"
  - "apps/web/components/common/button.tsx — Button with isPending"
tags: [organization, join, button, s3, ui]
---

# join-organization-button.tsx

**Path:** `apps/web/components/web/organizations/join-organization-button.tsx`

Client component button. Calls `joinOrganization` server action via `useAction`. Creates a PENDING membership. On success: toast + router.refresh().

Instant PENDING (no confirmation modal) — decided SESSION_0012, iterate later.
