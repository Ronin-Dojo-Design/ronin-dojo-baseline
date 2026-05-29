---
title: "SESSION 0037 — Lead intake UI, trial conversion, CRM follow-up surfaces"
slug: session-0037
type: session
status: closed-unclean
created: 2026-05-03
updated: 2026-05-03
last_agent: copilot-session-0037
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0036.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0037 — Lead intake UI, trial conversion, CRM follow-up surfaces

## Date

2026-05-03

## Operator

Brian Scott + Copilot (Petey role — planning + orchestration)

## Status

closed-quick

## Goal

Build the admin-facing UI surfaces for the lead intake → trial → conversion → CRM follow-up lifecycle. Backend service layer (actions, queries, schemas, payloads, errors, tests) already exists from SESSION_0033. This session delivers the screens and wiring.

## Dirstarter alignment table

| Field | Answer |
|---|---|
| Dirstarter baseline touched | Auth (admin route guards), DB (Lead/LeadFollowUp reads), theming (brand-scoped admin pages) |
| Extension or replacement | Extension — adds admin pages using existing Dirstarter admin layout/data-table patterns |
| Why justified | Lead CRM is core to the Prospect → Member lifecycle (lifecycle #1); no launch without intake UI |
| Risk if bypassed | Backend exists with no admin surface — unusable by school staff, blocks trial conversion flow |

## Giddy + Cody Review-Recommend: Dirstarter Alignment Audit

### What just landed on main

```text
f774cb9 feat: entitlement-first commerce layer (SESSION_0036)
920948b docs(session-0035): entitlement-first commerce plan + WORKFLOW calendar update
27949c1 SESSION_0033: Enrollments, family groups, waivers, trial lifecycle (school-ops)
c2ec941 SESSION_0032: Attendance + check-in write surface (school-ops)
0f8505f chore(typecheck): land SESSION_0032 typecheck-debt cleanup
```

### Entitlement layer completeness audit

| Component | Status | Notes |
| --- | --- | --- |
| Schema: Entitlement, EntitlementGrant, UserEntitlement + enums | ✅ Migrated | 3 models, 2 enums, PricingPlan Stripe columns |
| `grant-entitlement.ts` | ✅ Done | Idempotent upsert by userId + entitlementId + sourceId |
| `revoke-entitlement.ts` | ✅ Done | Sets status → REVOKED |
| `check-entitlement.ts` | ✅ Done | Pure function, brand-scoped, respects endsAt |
| `expire-entitlements.ts` | ✅ Done | Cron-callable, ACTIVE → EXPIRED |
| `manage-entitlements.ts` | ✅ Done | Admin: createEntitlement, linkPlanToEntitlement, listEntitlements |
| Stripe webhook wiring | ✅ Done | checkout.session.completed → grant, subscription.deleted → revoke |
| Smoke test | ✅ Done | grant/check/revoke/expire — all pass |
| **Admin UI for entitlement management** | ❌ Missing | No pages to create/list/link entitlements from browser |
| **Entitlement-gated UI predicates** | ❌ Missing | No `useEntitlement(key)` hook or RSC helper for conditional rendering |
| **User-facing "my entitlements" view** | ❌ Missing | No dashboard surface showing what a member has access to |

**Verdict:** Backend is **functionally complete** for the commerce flow. What's missing is UI surfaces (admin management + member-facing). These are P2 relative to lead intake UI (the WORKFLOW 5.0 calendar target for SESSION_0037).

### Dirstarter pattern inventory — what we MUST clone, not invent

Dirstarter's admin CRUD pattern (the "Tools" entity is the canonical example):

| Layer | Dirstarter file | Pattern |
| --- | --- | --- |
| **Admin list page** | `app/admin/tools/page.tsx` | `withAdminPage` HOC → parse searchParams via `nuqs` cache → pass promise to client table component |
| **Table component** | `app/admin/tools/_components/tools-table.tsx` | Client component, `use()` to unwrap promise, `useDataTable` hook, `DataTable` + `DataTableHeader` + `DataTableToolbar` |
| **Table columns** | `app/admin/tools/_components/tools-table-columns.tsx` | `getColumns()` returns `ColumnDef<T>[]`, status badges via `Badge` variant map, `DataTableColumnHeader`, `DataTableLink` |
| **Actions dropdown** | `app/admin/tools/_components/tool-actions.tsx` | Per-row dropdown with edit/delete/publish actions |
| **Toolbar actions** | `app/admin/tools/_components/tools-table-toolbar-actions.tsx` | Bulk actions (delete selected) |
| **Delete dialog** | `app/admin/tools/_components/tools-delete-dialog.tsx` | Confirmation dialog for bulk/single delete |
| **Form (create + edit)** | `app/admin/tools/_components/tool-form.tsx` | Shared form for create/edit, React Hook Form + Zod, relation selectors |
| **Edit page** | `app/admin/tools/[slug]/page.tsx` | `withAdminPage` → `findBySlug` → same form with `tool` prop |
| **Server queries** | `server/admin/tools/queries.ts` | `findTools(search)` with pagination/filter/sort transaction, `findToolBySlug`, `findToolList` |
| **Server schema** | `server/admin/tools/schema.ts` | `nuqs` parser config + `createSearchParamsCache` + Zod form schema |
| **Server actions** | `server/admin/tools/actions.ts` | `adminActionClient.schema().action()` pattern |

**Key Dirstarter conventions to follow:**
1. `withAdminPage` HOC for auth gating (not custom middleware)
2. `nuqs` for URL-based table state (sort, page, perPage, filters)
3. `$transaction([findMany, count])` for paginated queries
4. `DataTable` component family from `components/data-table/`
5. `Wrapper` component for form page layout
6. Shared form component for both create and edit (detect via presence of entity prop)
7. Server code in `server/admin/<feature>/` with `actions.ts`, `queries.ts`, `schema.ts`

**Ronin extensions already following this pattern:** The `server/web/lead/` module already has `actions.ts`, `queries.ts`, `schemas.ts`, `payloads.ts`, `errors.ts` — this maps to Dirstarter's `server/admin/tools/` structure. But the **admin pages and components** don't exist yet.

**Routing decision:** Dirstarter uses `/admin/tools/` (flat). Our leads are org-scoped, so we need either:

- (A) `/admin/leads/` with org filter in the table (simpler, matches Dirstarter pattern)
- (B) `/admin/organizations/[orgId]/leads/` (nested, more RESTful but no Dirstarter precedent)

**Recommendation:** Option A — `/admin/leads/` with org filter column. Matches Dirstarter's flat admin routing. The existing `getLeadsForOrganization` query needs a `findLeads(search)` variant with pagination/org filter.

### Lead backend gap analysis

| Component | Exists? | Gap |
| --- | --- | --- |
| `createLead` action | ✅ | None |
| `bookTrial` action | ✅ | None |
| `completeTrial` action | ✅ | None |
| `convertLead` action | ✅ | None |
| `getLeadsForOrganization` query | ✅ | Needs paginated `findLeads(search)` variant for admin table |
| `createFollowUp` action | ❌ | Must write — no follow-up CRUD exists |
| `completeFollowUp` action | ❌ | Must write |
| `findLeadById` query | ❌ | Needed for detail page |
| Admin table search/sort/filter schema | ❌ | Needs `leadsTableParamsSchema` + cache (nuqs pattern) |
| Lead status update actions (markLost, markNurture) | ❌ | bookTrial/completeTrial/convertLead exist but no markLost/markNurture |

---

## Revised Petey Plan (Dirstarter-aligned)

### SESSION_0037_TASK_01 — Server layer: admin queries + schemas + missing actions

**Agent:** Cody  
**Worktree:** `wt-school-ops`  
**What:** Create `server/admin/leads/` module following Dirstarter's `server/admin/tools/` pattern:

1. `server/admin/leads/schema.ts` — `leadsTableParamsSchema` (nuqs parsers for name, status, source, org, sort, page, perPage, date range), `leadsTableParamsCache`, Zod `leadFormSchema` for admin create/edit.
2. `server/admin/leads/queries.ts` — `findLeads(search)` with pagination + filter + `$transaction`, `findLeadById(id)` with follow-ups included.
3. `server/admin/leads/actions.ts` — `markLeadLost`, `markLeadNurture`, `createFollowUp`, `completeFollowUp`, `deleteLead`. (Existing actions in `server/web/lead/actions.ts` stay — they serve the web layer; admin actions use `adminActionClient`.)

**Uses:** Dirstarter pattern from `server/admin/tools/{schema,queries,actions}.ts`.  
**Done:** All admin server functions compile, follow Dirstarter conventions.  
**Files:** `server/admin/leads/schema.ts`, `server/admin/leads/queries.ts`, `server/admin/leads/actions.ts`

### SESSION_0037_TASK_02 — Admin lead list page + table

**Agent:** Cody  
**Worktree:** `wt-school-ops`  
**What:** Clone the `app/admin/tools/` page structure for leads:

1. `app/admin/leads/page.tsx` — `withAdminPage`, parse searchParams, pass `findLeads` promise.
2. `app/admin/leads/_components/leads-table.tsx` — client component with `useDataTable`, status filter (LeadStatus badges), source filter, org column.
3. `app/admin/leads/_components/leads-table-columns.tsx` — `getColumns()` with name, email, phone, status badge, source, org, program, createdAt, actions.
4. `app/admin/leads/_components/lead-actions.tsx` — per-row dropdown: View, Book Trial, Mark Lost, Delete.
5. `app/admin/leads/_components/leads-table-toolbar-actions.tsx` — bulk delete.

**Uses:** `DataTable`, `DataTableHeader`, `DataTableToolbar`, `Badge`, `withAdminPage` — all from Dirstarter.  
**Done:** `/admin/leads` renders with filtering, sorting, pagination.  
**Files:** `app/admin/leads/page.tsx`, `app/admin/leads/_components/leads-table.tsx`, + 3 more component files.

### SESSION_0037_TASK_03 — Admin lead create + edit forms

**Agent:** Cody  
**Worktree:** `wt-school-ops`  
**What:** Clone the `app/admin/tools/new/` and `app/admin/tools/[slug]/` pattern:

1. `app/admin/leads/_components/lead-form.tsx` — shared form (React Hook Form + Zod), fields: firstName, lastName, email, phone, source dropdown, program selector (relation-selector pattern), notes. Calls `createLead` or update action.
2. `app/admin/leads/new/page.tsx` — `withAdminPage`, renders `LeadForm` for create.
3. `app/admin/leads/[id]/page.tsx` — `withAdminPage`, `findLeadById`, renders `LeadForm` for edit + status panel + follow-up timeline.

**Uses:** `Wrapper`, `RelationSelector` (for program/org pickers), `withAdminPage`.  
**Done:** Can create and edit leads from admin.  
**Files:** `app/admin/leads/_components/lead-form.tsx`, `app/admin/leads/new/page.tsx`, `app/admin/leads/[id]/page.tsx`

### SESSION_0037_TASK_04 — Lead detail: status transitions + follow-up panel

**Agent:** Cody  
**Worktree:** `wt-school-ops`  
**What:** On the `[id]/page.tsx` detail view, add:

1. Status action bar: contextual buttons based on current status (NEW→Book Trial, TRIAL_BOOKED→Complete Trial, TRIAL_COMPLETED→Convert, any→Mark Lost/Nurture). Uses existing `bookTrial`, `completeTrial`, `convertLead` + new `markLeadLost`, `markLeadNurture`.
2. Follow-up panel: list of follow-ups with channel/notes/scheduled/completed. "Add Follow-up" form (channel dropdown, notes, scheduledAt). "Mark Complete" button per follow-up.
3. Conversion dialog: when Convert is clicked, user search/select + program enrollment linkage.

**Uses:** Dirstarter `Dialog` components, action pattern.  
**Done:** Full lead lifecycle operable from admin detail page.  
**Files:** `app/admin/leads/[id]/_components/lead-status-actions.tsx`, `app/admin/leads/[id]/_components/follow-up-panel.tsx`, `app/admin/leads/[id]/_components/convert-dialog.tsx`

### SESSION_0037_TASK_05 — Public lead capture + smoke test

**Agent:** Cody + Doug (review)  
**Worktree:** `wt-school-ops`  
**What:**

1. Public "Get Started" form: `components/web/lead-capture-form.tsx` — embeddable on org pages. Unauthenticated, rate-limited. Calls existing `createLead` (already has rate limiting). Fields: firstName, lastName, email, phone. Source defaults to WEBSITE.
2. Page: `app/(web)/organizations/[slug]/get-started/page.tsx` — renders the form within the org layout.
3. Smoke test: `scripts/smoke-lead-lifecycle.ts` — programmatic: create lead → book trial → complete → convert → verify.

**Done:** End-to-end lifecycle works from public capture through admin conversion.  
**Files:** `components/web/lead-capture-form.tsx`, `app/(web)/organizations/[slug]/get-started/page.tsx`, `scripts/smoke-lead-lifecycle.ts`

---

### Execution strategy

- **TASK_01** first (server layer) — unlocks TASK_02–04.
- **TASK_02 + 03** sequential (table → forms).
- **TASK_04** sequential after 03 (status/follow-up depends on detail page).
- **TASK_05** last (public form + smoke test validates everything).
- All tasks in `wt-school-ops` worktree, single branch.

### If session compacts at planning

- **TASK_06:** Next session petey-plan (scope SESSION_0038: Tournament operations)
- **TASK_07:** Bow out (quick close if planning only; full close if any code landed)

## What landed

| Task | Description | Status |
| --- | --- | --- |
| TASK_01 | Dirstarter alignment audit: entitlement completeness, admin CRUD pattern inventory, lead backend gap analysis | ✅ Done |
| TASK_02 | Revised Petey plan: 5-task breakdown cloning Dirstarter tools pattern for leads | ✅ Done |
| TASK_03 | ADR 0012: admin CRUD flat routing decision | ✅ Done |
| TASK_04 | Pre-staged SESSION_0038 with full plan, alignment table, resolved decisions | ✅ Done |

## Files touched

| Path | Note |
| --- | --- |
| `docs/sprints/SESSION_0037.md` | This file — Petey plan + Dirstarter audit + close |
| `docs/architecture/decisions/0012-admin-crud-routing-pattern.md` | ADR: flat `/admin/<entity>/` with org filter |
| `docs/sprints/SESSION_0038.md` | Pre-staged next session with carried plan |
| `docs/protocols/project-log.md` | Task plan entries for SESSION_0037 + SESSION_0038 |

## Decisions resolved

- ADR 0012: flat `/admin/leads/` routing with org filter column (not nested)
- Follow-up CRUD confirmed missing — must be written in SESSION_0038 TASK_01
- Entitlement backend confirmed complete; UI is P2 relative to lead intake

## Open decisions / blockers

- ✅ RESOLVED: Follow-up CRUD **does not exist** — TASK_01 must write `createFollowUp` + `completeFollowUp` in `server/admin/leads/actions.ts`.
- ✅ RESOLVED: Admin routing → flat `/admin/leads/` with org filter column (matches Dirstarter pattern, not nested under orgs).
- OPEN: Public lead capture (TASK_05) — standalone page at `/organizations/[slug]/get-started` or embeddable component? Leaning toward both (page wraps the component).
- OPEN: Does `convertLead` already create a User record, or just link an existing userId? Need to read full action before TASK_04.

## Next session

**Goal:** Implement lead intake admin UI — 5 tasks from Dirstarter-aligned plan.  
**Inputs:** `docs/sprints/SESSION_0038.md` (pre-staged), `dirstarter_template/app/admin/tools/`, `dirstarter_template/server/admin/tools/`, `server/web/lead/actions.ts`, ADR 0012.  
**First task:** TASK_01 — create `server/admin/leads/{schema,queries,actions}.ts`.

## Bow-out line

> *Bowed out — SESSION_0037 closed-quick. Petey plan complete: Dirstarter audit, ADR 0012, 5-task breakdown, SESSION_0038 pre-staged. Next session goal: implement lead admin UI.*
