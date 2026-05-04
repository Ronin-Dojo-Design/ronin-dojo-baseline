---
title: "SESSION 0059 — D-005 Cache Pattern, D-011 Schema Manifest, Enrollment Passport Check"
slug: session-0059
type: session
status: closed-quick
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0059
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0058.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0059 — D-005 Cache, D-011 Schema, Enrollment Passport

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

closed-quick

### Goal

Close three long-deferred items: D-005 (cache pattern for read queries), D-011 (schema needs manifest reconciliation), and program enrollment Passport check.

### Context read

- ✅ SESSION_0058 — closed-quick. Snapshots, PricingPlan INVALID, D-013 resolved.
- ✅ WORKFLOW_5.0 — primary lane: Core platform.
- ✅ `opening.md` — ritual followed.
- ✅ Git: `main`, clean working tree.

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Caching (`"use cache"` + `cacheTag` + `cacheLife`), schema, server actions |
| Extension or replacement | Extension — applying existing L1 cache pattern to Ronin queries; closing schema gap doc |
| Why justified | D-005 open since SESSION_0017; D-011 open since SESSION_0020; enrollment Passport check is missing validation |
| Risk if bypassed | Queries re-execute on every request (perf); stale manifest confuses future planning; enrollment allows users without Passport |

### Lane selection

**Primary lane:** Core platform
**Sub-lane:** None

---

## Petey plan — SESSION_0059

### TASK_01 — Apply `"use cache"` pattern to public read queries (Cody, 20 min) — D-005

**What:** Ronin's public read queries (tournaments, courses, directory, organizations) use React `cache()` only. Dirstarter L1 pattern uses `"use cache"` + `cacheTag` + `cacheLife` for public data. Apply the L1 pattern to public-facing, non-auth-scoped queries.

**Key distinction:** Auth-scoped queries (dashboard, enrollment, attendance) must NOT be cached with `"use cache"` — they return per-user data. Only public/anonymous queries get the treatment.

**Queries to update:**
- `server/web/tournaments/queries.ts` — `searchTournaments`, `findTournamentBySlug` (public listing)
- `server/web/courses/queries.ts` — `searchCourses`, `findCourseBySlug` (public listing)
- `server/web/organization/queries.ts` — `getOrganizationsByBrand`, `getOrganizationBySlug`, `getSystemRoles` (public/shared)
- `server/web/directory/queries.ts` — already uses `cache()`, upgrade to `"use cache"`

**Queries to SKIP (auth-scoped):**
- `dashboard/queries.ts` — per-user
- `enrollment/queries.ts` — per-user
- `attendance/queries.ts` — per-session
- `passport/queries.ts` — per-user
- `schedule/queries.ts` — already uses `cache()`; auth-dependent queries stay as-is
- `lead/queries.ts`, `family/queries.ts`, `waiver/queries.ts` — org-scoped, auth-gated

**Done means:** Public queries use `"use cache"` + `cacheTag` + `cacheLife`. Auth-scoped queries unchanged.

**Agent:** Cody

### TASK_02 — Close D-011 schema manifest (Cody, 5 min) — D-011

**What:** The manifest is already marked `status: deprecated` and says all gaps are resolved in `s2-schema-additions.md`. Update drift register to reflect this.

**Done means:** D-011 closed in drift register.

**Agent:** Cody

### TASK_03 — Add Passport existence check to enrollment (Cody, 10 min) — P2

**What:** `enrollInProgram` action should verify the user has a Passport before enrolling. Programs are tied to a user's martial arts identity; enrolling without a Passport means no rank/discipline context.

**Steps:**
1. In `enrollInProgram`, after `assertTargetIsActiveMember`, check that the user has a Passport
2. If no Passport, throw `ENROLLMENT_ERROR.NO_PASSPORT` (add to error constants)
3. Same check in `joinProgramWaitlist`

**Done means:** Users without a Passport cannot enroll in programs.

**Agent:** Cody

### Execution order

1. TASK_01 (cache pattern — largest)
2. TASK_02 (schema manifest — quick)
3. TASK_03 (enrollment Passport — quick)

---

## First task

**TASK_01:** Apply cache pattern to public read queries. Cody begins now.

---

## Execution log

### TASK_01 — Apply `"use cache"` pattern to public read queries ✅

**Findings:** Tournaments, courses, techniques, and tags already had `"use cache"` + `cacheTag` + `cacheLife` applied (prior sessions). The remaining gaps were:

- `server/web/organization/queries.ts` — upgraded `getOrganizationBySlug`, `getOrganizationsByBrand`, `getSystemRoles` from React `cache()` to `"use cache"` + `cacheTag` + `cacheLife`
  - `getSystemRoles` gets `cacheLife("infinite")` (static seed data)
  - Org queries get `cacheLife("minutes")`
  - `getUserMemberships`, `getOrganizationById`, `getOrganizationByInviteCode` left with React `cache()` (auth-scoped / internal)
- `server/web/directory/queries.ts` — upgraded `getDirectoryFilterOptions` to `"use cache"` + `cacheTag("directory-filters")` + `cacheLife("minutes")`
  - `getDirectoryProfiles` left with React `cache()` (takes `viewerUserId`, auth-aware)

**Decision:** Auth-scoped queries intentionally stay with React `cache()`. The `"use cache"` directive caches across requests globally — fine for public data, dangerous for per-user data.

### TASK_02 — Close D-011 schema manifest ✅

- `SCHEMA_NEEDS_MANIFEST.md` already marked `status: deprecated` with full traceability table
- All 13+ gaps resolved in `s2-schema-additions.md` (38 new models, 29 new enums across 3 passes)
- Updated drift register: D-011 → ✅ resolved
- Updated drift register: D-005 → ✅ resolved

### TASK_03 — Enrollment Passport check ✅

- Added `NO_PASSPORT` error to `server/web/enrollment/errors.ts`
- Added `assertUserHasPassport` helper to `server/web/enrollment/actions.ts`
- Applied check in both `enrollInProgram` and `joinProgramWaitlist` (after `assertTargetIsActiveMember`)
- Users without a Passport now get a clear error before enrollment

## Files touched

| File | Note |
| --- | --- |
| `server/web/organization/queries.ts` | MODIFIED — `"use cache"` for public org queries |
| `server/web/directory/queries.ts` | MODIFIED — `"use cache"` for filter options |
| `server/web/enrollment/errors.ts` | MODIFIED — added `NO_PASSPORT` error |
| `server/web/enrollment/actions.ts` | MODIFIED — Passport check in enroll + waitlist |
| `docs/knowledge/wiki/drift-register.md` | MODIFIED — D-005 + D-011 resolved |

## Decisions resolved

- **D-005 cache strategy:** Public queries get `"use cache"` + `cacheTag` + `cacheLife`. Auth-scoped queries stay with React `cache()`. This is the correct split — `"use cache"` is request-level caching that would leak user data if applied to auth-scoped queries.
- **D-011 schema manifest:** Already deprecated and fully traced. Drift entry was stale.
- **Enrollment Passport:** Required before enroll/waitlist. Clear error message.

## Open items carried forward

- D-006 (api-client install) — low priority, no runtime impact
- Tournament registration snapshot backfill for existing data

## Status

in-progress → **closed-quick**
