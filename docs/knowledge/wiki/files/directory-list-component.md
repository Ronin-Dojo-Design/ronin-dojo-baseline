---
title: "directory/directory-list.tsx"
slug: directory-list-component
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + Copilot
last_agent: copilot-session-0014
pairs_with:
  - knowledge/wiki/files/directory-query-component
  - knowledge/wiki/files/directory-listing-component
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0014
wiring:
  - "apps/web/components/common/card.tsx — Card/CardHeader/CardDescription"
  - "apps/web/components/common/badge.tsx — Badge"
  - "apps/web/components/common/heading.tsx — H4"
  - "apps/web/components/common/link.tsx — Link"
tags: [directory, component, card-grid, s4]
---

# directory/directory-list.tsx

**Path:** `apps/web/components/web/directory/directory-list.tsx`

Renders directory profiles as a card grid. Displays name, location, org badges (linked), rank badges, and email (per privacy flags). Shows empty state when no profiles match.
