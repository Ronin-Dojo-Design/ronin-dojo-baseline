---
title: "directory/schema.ts"
slug: directory-schema
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + Copilot
last_agent: copilot-session-0014
pairs_with:
  - knowledge/wiki/files/directory-queries
  - knowledge/wiki/files/directory-query-component
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0014
wiring:
  - "nuqs/server — createSearchParamsCache, parseAsString, parseAsInteger"
tags: [directory, schema, nuqs, filters, s4]
---

# directory/schema.ts

**Path:** `apps/web/server/web/directory/schema.ts`

Nuqs filter params schema for the directory page. Follows L1 pattern from `server/web/tools/schema.ts`. Defines `directoryFilterParams` (q, sort, page, perPage, org, discipline, rank, city, region) and `directoryFilterParamsCache` for server-side parsing.
