---
title: "SESSION 0038 — Lead intake admin UI implementation (Dirstarter-aligned)"
slug: session-0038
type: session
status: pending
created: 2026-05-03
updated: 2026-05-03
last_agent: copilot-session-0037
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0037.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0038 — Lead intake admin UI implementation (Dirstarter-aligned)

## Date

*(set at bow-in)*

## Operator

*(set at bow-in)*

## Status

pending

## Goal

Implement the lead intake admin UI from the SESSION_0037 Petey plan. Five tasks, all cloning Dirstarter's `app/admin/tools/` + `server/admin/tools/` pattern for leads.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth (withAdminPage HOC), DB (Lead/LeadFollowUp), admin data-table components |
| Extension or replacement | Extension — new admin feature pages using existing Dirstarter admin patterns |
| Why justified | Lead CRM is core to Prospect → Member lifecycle; backend exists since SESSION_0033, needs UI |
| Risk if bypassed | Backend with no admin surface — school staff can't manage leads, blocks trial conversion |

## Petey plan (carried from SESSION_0037)

### TASK_01 — Server layer: admin queries + schemas + missing actions

Create `server/admin/leads/` module:

1. `schema.ts` — nuqs `leadsTableParamsSchema` + `leadsTableParamsCache` + Zod `leadFormSchema`
2. `queries.ts` — `findLeads(search)` paginated + `findLeadById(id)` with follow-ups
3. `actions.ts` — `markLeadLost`, `markLeadNurture`, `createFollowUp`, `completeFollowUp`, `deleteLead` (all `adminActionClient`)

**Reference:** `dirstarter_template/server/admin/tools/{schema,queries,actions}.ts`

### TASK_02 — Admin lead list page + table

Clone `app/admin/tools/` structure:

1. `app/admin/leads/page.tsx` — `withAdminPage`, searchParams, `findLeads` promise
2. `_components/leads-table.tsx` — `useDataTable`, status + source filters
3. `_components/leads-table-columns.tsx` — `getColumns()` with status badges
4. `_components/lead-actions.tsx` — per-row dropdown
5. `_components/leads-table-toolbar-actions.tsx` — bulk delete

**Reference:** `dirstarter_template/app/admin/tools/_components/tools-table*.tsx`

### TASK_03 — Admin lead create + edit forms

1. `_components/lead-form.tsx` — shared form (RHF + Zod), org + program relation selectors
2. `app/admin/leads/new/page.tsx` — create
3. `app/admin/leads/[id]/page.tsx` — edit + detail

**Reference:** `dirstarter_template/app/admin/tools/_components/tool-form.tsx`, `app/admin/tools/[slug]/page.tsx`

### TASK_04 — Lead detail: status transitions + follow-up panel

1. Status action bar (contextual per current status)
2. Follow-up panel (list + add + complete)
3. Conversion dialog (user search + enrollment linkage)

### TASK_05 — Public lead capture + smoke test

1. `components/web/lead-capture-form.tsx` — embeddable, rate-limited
2. `app/(web)/organizations/[slug]/get-started/page.tsx`
3. `scripts/smoke-lead-lifecycle.ts`

## Key decisions (pre-resolved)

- **ADR 0012:** Flat `/admin/leads/` routing with org filter column (not nested under orgs)
- Follow-up CRUD must be written fresh (`createFollowUp`, `completeFollowUp`) in `server/admin/leads/actions.ts`
- `markLeadLost` and `markLeadNurture` actions must be written (only `bookTrial`/`completeTrial`/`convertLead` exist)
- Public lead capture: page at `/organizations/[slug]/get-started` wrapping embeddable `lead-capture-form.tsx` component

## Open decisions

- Does `convertLead` create a User record or just link an existing userId? Read full action before TASK_04.

## What landed

*(to be filled during/at close)*

## Files touched

*(to be filled during/at close)*

## Decisions resolved

*(to be filled during/at close)*

## Next session

**Goal:** *(set at close)*
**Inputs:** *(set at close)*
**First task:** *(set at close)*
