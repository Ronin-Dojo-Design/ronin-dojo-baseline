---
title: "directory/queries.ts"
slug: directory-queries
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + Copilot
last_agent: copilot-session-0014
pairs_with:
  - knowledge/wiki/files/directory-schema
  - knowledge/wiki/files/directory-query-component
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0014
health: 7
wiring:
  - "apps/web/prisma/schema.prisma — DirectoryProfile, Membership, Rank, RankAward"
  - "apps/web/services/db.ts — Prisma client"
tags: [directory, queries, privacy, s4]
---

# directory/queries.ts

**Path:** `apps/web/server/web/directory/queries.ts`

Privacy-aware directory queries. `getDirectoryProfiles()` enforces visibility rules at query level (unauthenticated → PUBLIC only, authenticated → PUBLIC + MEMBERS_ONLY, HIDDEN → never). Per-field flags (showEmail, showOrgs, showRanks) applied in post-query mapping. `getDirectoryFilterOptions()` returns available orgs, disciplines, ranks for the filter UI.
