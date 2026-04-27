---
title: "directory/directory-query.tsx"
slug: directory-query-component
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + Copilot
last_agent: copilot-session-0014
pairs_with:
  - knowledge/wiki/files/directory-queries
  - knowledge/wiki/files/directory-schema
  - knowledge/wiki/files/directory-listing-component
  - knowledge/wiki/files/directory-list-component
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0014
health: 7
wiring:
  - "apps/web/server/web/directory/queries.ts — getDirectoryProfiles()"
  - "apps/web/server/web/directory/schema.ts — directoryFilterParamsCache"
  - "apps/web/components/web/directory/directory-listing.tsx — DirectoryListing"
  - "apps/web/components/web/directory/directory-list.tsx — DirectoryList"
tags: [directory, component, server-component, s4]
---

# directory/directory-query.tsx

**Path:** `apps/web/components/web/directory/directory-query.tsx`

Server component following L1 `tool-query.tsx` pattern. Parses search params via nuqs cache, runs privacy-aware query, renders DirectoryListing + DirectoryList.
