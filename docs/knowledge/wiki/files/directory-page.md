---
title: "directory/page.tsx"
slug: directory-page
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + Copilot
last_agent: copilot-session-0014
pairs_with:
  - knowledge/wiki/files/directory-query-component
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0014
health: 7
wiring:
  - "apps/web/components/web/directory/directory-query.tsx — DirectoryQuery"
  - "apps/web/lib/auth.ts — getServerSession()"
  - "apps/web/proxy.ts — x-brand header"
tags: [directory, page, s4]
---

# directory/page.tsx

**Path:** `apps/web/app/(web)/directory/page.tsx`

Thin server component page for `/directory`. Reads brand from proxy header, auth session for viewer context, delegates to DirectoryQuery component.
