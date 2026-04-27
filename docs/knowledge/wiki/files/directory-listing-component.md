---
title: "directory/directory-listing.tsx"
slug: directory-listing-component
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + Copilot
last_agent: copilot-session-0014
pairs_with:
  - knowledge/wiki/files/directory-query-component
  - knowledge/wiki/files/directory-list-component
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0014
health: 7
wiring:
  - "apps/web/components/web/filters/filters.tsx — Filters"
  - "apps/web/components/web/filters/sort.tsx — Sort"
  - "apps/web/contexts/filter-context.tsx — FiltersProvider"
  - "apps/web/server/web/directory/schema.ts — directoryFilterParams"
tags: [directory, component, client-component, filters, s4]
---

# directory/directory-listing.tsx

**Path:** `apps/web/components/web/directory/directory-listing.tsx`

Client component wrapping FiltersProvider with directory filter schema. Follows L1 `tool-listing.tsx` pattern. Renders Filters search bar + Sort dropdown + children.
