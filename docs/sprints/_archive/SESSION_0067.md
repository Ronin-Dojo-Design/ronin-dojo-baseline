---
title: "SESSION 0067 — Cody: DirectoryProfile Slug + Member Detail Page"
slug: session-0067
type: session
status: closed-unclean
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0067
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0066.md
  - docs/architecture/decisions/0013-tool-listing-repurposing.md
  - docs/knowledge/wiki/concepts/listing-pattern-repurposing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0067 — Cody: DirectoryProfile Slug + Member Detail Page

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Cody, orchestrated by Petey)

### Status

closed-unclean

**Reason for unclean close:** Body Status said `closed-quick` and full handoff content was written, but frontmatter status field was never updated to match. Recovered SESSION_0073.

### Goal

Execute SESSION_0066 TASK plan — schema migration (add slug to DirectoryProfile), server query (findProfileBySlug), and member detail route (/directory/[slug]).

### Context read

- ✅ SESSION_0066 — closed-full. Petey plan complete.
- ✅ Git: `main`, clean working tree.
- ✅ Schema reviewed: Organization @@unique already exists, ContentAtom.organizationId already exists.
- ✅ Existing routes reviewed: /techniques, /techniques/[slug], /directory, /organizations, /organizations/[slug] — all built.
- ✅ Missing: DirectoryProfile.slug, /directory/[slug] detail page, findProfileBySlug query.

### Petey's pre-flight assessment

SESSION_0066 planned 4 tasks for 0067. Three are already done:

- SESSION_0067_TASK_01 (schema migrations): Only DirectoryProfile.slug remains.
- SESSION_0067_TASK_02 (technique routes): Already built.
- SESSION_0067_TASK_03 (member detail page): Needs /directory/[slug] + findProfileBySlug.
- SESSION_0067_TASK_04 (school routes): Already built.

Reduced scope: 3 deliverables.

### Task log

- `SESSION_0067_TASK_01` — Add `slug` field to DirectoryProfile + migration — ✅ done
- `SESSION_0067_TASK_02` — Add `findProfileBySlug` server query — ✅ done
- `SESSION_0067_TASK_03` — Create `/directory/[slug]/page.tsx` member detail page — ✅ done

## What landed

- ✅ **Schema migration** — `slug` (optional, unique) added to `DirectoryProfile`. Migration `20260505023445_add_directory_profile_slug` applied.
- ✅ **Detail payload** — `directoryProfileDetailPayload` added to `server/web/directory/payloads.ts` with passport bio, memberships (joinedAt), rank awards, technique progress.
- ✅ **Server query** — `findProfileBySlug()` in `server/web/directory/queries.ts`. Privacy-aware: respects visibility enum + per-field `show*` flags. Data stripping at server layer.
- ✅ **Member detail page** — `app/(web)/directory/[slug]/page.tsx` with metadata generation, bio, ranks, schools, technique progress, contact. Uses L1 components (Intro, Section, Badge, Stack, H4, Link).

## Files touched

| File | Note |
|------|------|
| `apps/web/prisma/schema.prisma` | Added `slug String? @unique` to DirectoryProfile |
| `apps/web/prisma/migrations/20260505023445_add_directory_profile_slug/migration.sql` | Migration |
| `apps/web/server/web/directory/payloads.ts` | Added `directoryProfileDetailPayload` |
| `apps/web/server/web/directory/queries.ts` | Added `findProfileBySlug()` |
| `apps/web/app/(web)/directory/[slug]/page.tsx` | New — member detail page |
| `docs/sprints/SESSION_0067.md` | This file |

## Decisions resolved

- **DirectoryProfile.slug** — implemented as optional unique field. Existing profiles will have null slug until populated (dashboard edit flow in SESSION_0068).

## Open decisions / blockers

- **Slug population strategy:** When user edits profile in dashboard, auto-generate slug from display name (slugify). Existing null slugs mean those profiles aren't accessible via `/directory/[slug]` until populated. No blocker for SESSION_0068.

## Review log

- `SESSION_0067_REVIEW_01` — All 3 tasks executed. Schema migration applied. No type errors. L1 components used throughout. Privacy filtering at server layer confirmed.

## ADR / ubiquitous-language check

- No new ADR needed. Work implements ADR 0013 plan.
- No new domain terms.

## Next session

### SESSION_0068 — Cody: Dashboard Tabs (Profile, School, Techniques)

- **Goal:** Implement dashboard tab UI for Profile editing (Passport + DirectoryProfile), School management, and Technique CRUD with DataTable.
- **Agent:** Cody (execute from Petey plan in SESSION_0066)
- **Inputs:** SESSION_0066, SESSION_0067, `listing-pattern-repurposing.md` wireframes §6d.
- **First task:** SESSION_0068_TASK_01 — Dashboard Profile tab (edit Passport + DirectoryProfile including new slug field).
- **Prerequisite:** Unblocked. Schema ready.
