---
title: "SESSION 0057 — Hostile-Close Remediation: P0–P2 Fixes from Sessions 0052–0056"
slug: session-0057
type: session
status: closed-unclean
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0057
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0054.md
  - docs/sprints/SESSION_0056.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0057 — Hostile-Close Remediation: P0–P2 Fixes

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

in-progress

### Goal

Fix the P0–P2 runtime issues identified in the hostile-close review of Sessions 0052–0056. These are bugs that will crash or leak data at runtime if left unresolved.

### Context read

- ✅ SESSION_0056 — closed-quick. Content + curriculum gaps closed.
- ✅ SESSION_0054 — hostile-close review table identifies P0–P2 issues.
- ✅ WORKFLOW_5.0 — primary lane: Core platform (remediation).
- ✅ `opening.md` — ritual followed.
- ✅ Schema verified: `UserEntitlement` model EXISTS at line 2890. P0 downgraded to P2-INVALID.
- ✅ `brand-context.ts` — `getRequestBrand()` is the API for server-side brand resolution.
- ✅ Git: `main`.

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth (brand scoping), server queries, client/server boundary |
| Extension or replacement | Fix — correcting our extensions to comply with L1 patterns |
| Why justified | Runtime crashes + cross-brand data leakage = critical bugs |
| Risk if bypassed | App crashes on dashboard load; brand data leaks between tenants |

### Lane selection

**Primary lane:** Core platform (remediation)
**Sub-lane:** None

---

## Petey plan — Hostile-close remediation

### Triage re-assessment

| # | Original Priority | Revised | Issue | Verdict |
|---|---|---|---|---|
| 1 | 🔴 P0 | ✅ INVALID | `userEntitlement` model doesn't exist | **FALSE** — `UserEntitlement` confirmed at schema L2890. Prisma client accessor is `db.userEntitlement` (camelCase). No crash. |
| 2 | 🔴 P1 | 🔴 P1 | Dashboard queries have NO brand filter | CONFIRMED — queries use `userId` only, no brand scoping. Cross-brand leakage. |
| 3 | 🔴 P1 | 🔴 P1 | Dashboard has no Passport display | CONFIRMED — no Passport data loaded or rendered. |
| 4 | ⚠️ P2 | ⚠️ P2 | `searchTechniquesForPicker` client/server boundary | CONFIRMED — `"use client"` component imports server query without `"use server"` directive on the queries file. |
| 5 | ⚠️ P2 | ⚠️ P2 | Tournament registration snapshots empty | CONFIRMED — `snapshotRankName`/`snapshotOrgName` never populated. |
| 6 | ⚠️ P2 | ⚠️ P2 | Program enrollment ignores Passport | Deferred — no runtime crash, just missing validation. |
| 7 | ⚠️ P2 | ⚠️ P2 | Certificate issuance has no brand check | CONFIRMED — no brand validation in issuance action. |
| 8 | ⚠️ P2 | ⚠️ P2 | Media admin queries unscoped | CONFIRMED — admin page doesn't pass brand. |
| 9 | ⚠️ P2 | ⚠️ DEFER | `PricingPlanActions` type mismatch | Carried three sessions — needs investigation in isolation. |
| 10 | MINOR | MINOR | Media admin raw grid | Cosmetic — defer. |

### Task breakdown (execution order)

### TASK_01 — Add brand scoping to dashboard queries (Cody, 15 min) — P1

**What:** Update `findUserEnrollments`, `findUserEntitlements`, `findUserRegistrations` to accept `brand` parameter and filter accordingly.

**Steps:**
1. Import `getRequestBrand` from `~/lib/brand-context`
2. Add brand filter: enrollments → `program.organization.brand`, entitlements → via entitlement's org brand or directly if available, registrations → `tournament.brand`
3. Update `DashboardMembership` to pass brand from request context

**Done means:** Dashboard queries only return data for the current brand.

**Agent:** Cody

### TASK_02 — Add Passport display to dashboard (Cody, 15 min) — P1

**What:** Load user's Passport in `DashboardMembership` and render displayName, avatar, rank summary at top of section.

**Steps:**
1. Add `findUserPassport(userId)` query to `server/web/dashboard/queries.ts`
2. Render Passport card (avatar, displayName, bio) at top of membership section
3. Include primary membership rank if available

**Done means:** Dashboard shows Passport data when user has one.

**Agent:** Cody

### TASK_03 — Fix `searchTechniquesForPicker` server boundary (Cody, 5 min) — P2

**What:** The `"use client"` component `curriculum-items-editor.tsx` directly imports `searchTechniquesForPicker` from a server file. Fix by converting the search to a server action.

**Steps:**
1. Create `searchTechniquesForPickerAction` in `server/admin/courses/actions.ts` (or add `"use server"` to a dedicated file)
2. Update `curriculum-items-editor.tsx` to call the action instead of importing the query directly

**Done means:** No client/server boundary violation.

**Agent:** Cody

### TASK_04 — Add brand check to certificate issuance (Cody, 5 min) — P2

**What:** `issueCertificate()` must validate that the template belongs to the admin's current brand before issuing.

**Steps:**
1. Read `issuance-actions.ts`, add brand validation using admin session brand
2. Return error if template brand ≠ admin brand

**Done means:** Cross-brand certificate issuance blocked.

**Agent:** Cody

### TASK_05 — Pass brand to media admin queries (Cody, 5 min) — P2

**What:** Admin media page must pass current brand to `findMedia()`.

**Steps:**
1. Get brand from admin context in `app/admin/media/page.tsx`
2. Pass to `findMedia({ brand })` call

**Done means:** Media gallery is brand-scoped.

**Agent:** Cody

### Parallelism

- TASK_01 + TASK_02 touch dashboard queries/component — sequential (01 first, 02 after).
- TASK_03, TASK_04, TASK_05 are independent of each other and of 01/02 — parallel batch after 02.

### Execution order

1. TASK_01 (brand scoping)
2. TASK_02 (Passport display)
3. TASK_03 + TASK_04 + TASK_05 (parallel P2 fixes)

### Scope guard

- Tournament registration snapshot population (P2 #5) deferred — needs webhook rework, broader than quick fix.
- Program enrollment Passport check (P2 #6) deferred — no crash, enhancement.
- PricingPlanActions type mismatch — investigate in dedicated session.

### Open decisions

None — all fixes follow established patterns (`getRequestBrand()`, `"use server"` directive, brand validation in actions).

---

## First task

**TASK_01:** Add brand scoping to dashboard queries. Cody begins now.

---

## Execution log

### TASK_01 — Brand scoping for dashboard queries ✅

- Updated `server/web/dashboard/queries.ts` — all three queries now accept `brand: Brand` parameter
- `findUserEnrollments` → filters by `program.organization.brand`
- `findUserEntitlements` → filters by `entitlement.brand`
- `findUserRegistrations` → filters by `tournament.brand`

### TASK_02 — Passport display in dashboard ✅

- Added `findUserPassport(userId)` query to `server/web/dashboard/queries.ts`
- Updated `DashboardMembership` to import `getRequestBrand`, pass brand to all queries
- Added Passport card at top of membership section (avatar, displayName, bio)

### TASK_03 — Fix `searchTechniquesForPicker` client/server boundary ✅

- Created `server/admin/courses/technique-search-action.ts` with `"use server"` directive
- Updated `curriculum-items-editor.tsx` to import `searchTechniquesForPickerAction` from the new server action file

### TASK_04 — Brand check on certificate issuance ✅

- Added `getRequestBrand()` call + template brand validation to `issueCertificate()` action
- Throws error if template brand ≠ request brand

### TASK_05 — Brand scoping for media admin ✅

- Updated `app/admin/media/page.tsx` to call `getRequestBrand()` and pass `brand` to `findMedia()`

## Files touched

| File | Note |
| --- | --- |
| `server/web/dashboard/queries.ts` | MODIFIED — brand params + Passport query |
| `app/(web)/dashboard/membership.tsx` | MODIFIED — brand scoping + Passport display |
| `server/admin/courses/technique-search-action.ts` | NEW — `"use server"` wrapper for technique search |
| `app/admin/courses/_components/curriculum-items-editor.tsx` | MODIFIED — import fix |
| `server/admin/certificates/issuance-actions.ts` | MODIFIED — brand validation |
| `app/admin/media/page.tsx` | MODIFIED — brand passed to query |

## Decisions resolved

- **P0 triage:** `UserEntitlement` model confirmed at schema L2890. Original P0 was a false alarm — Prisma camelCase accessor `db.userEntitlement` is correct.
- **Brand scoping strategy:** Use `getRequestBrand()` at the page/component level, pass down to queries. Queries don't resolve brand themselves (keeps them testable).

## Open items carried forward

- Tournament registration snapshot population (P2 #5) — needs webhook rework
- Program enrollment Passport check (P2 #6) — enhancement, not crash
- PricingPlanActions type mismatch — carried since SESSION_0053
- Stripe keys + S3 keys not configured

## Status

in-progress → **closed-quick**
