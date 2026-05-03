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

2026-05-03

## Operator

Brian Scott + Copilot (Petey orchestrating, Cody implementing)

## Status

closed-full

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

| Task | Description | Status |
| --- | --- | --- |
| TASK_01 | Server layer: `server/admin/leads/{schema,queries,actions}.ts` — nuqs table params, paginated findLeads, findLeadById, upsertLead, deleteLeads, markLeadLost, markLeadNurture, createFollowUp, completeFollowUp | ✅ Done |
| TASK_02 | Admin lead list page + table: `app/admin/leads/page.tsx`, leads-table, leads-table-columns, lead-actions, leads-table-toolbar-actions, leads-delete-dialog | ✅ Done |
| TASK_03 | Admin lead create + edit forms: lead-form.tsx shared form (RHF + Zod), new/page.tsx, [id]/page.tsx | ✅ Done |
| TASK_04 | Lead detail: status transitions + follow-up panel: lead-status-actions.tsx (contextual lifecycle buttons), follow-up-panel.tsx (list + add + complete) | ✅ Done |
| TASK_05 | Public lead capture + get-started page: lead-capture-form.tsx embeddable component, /organizations/[slug]/get-started/page.tsx | ✅ Done |
| Typecheck | `tsc --noEmit` passes (only pre-existing categories error remains) | ✅ Done |

## Files touched

| Path | Note |
| --- | --- |
| `server/admin/leads/schema.ts` | nuqs leadsTableParamsSchema + leadsTableParamsCache + leadFormSchema + followUpFormSchema |
| `server/admin/leads/queries.ts` | findLeads (paginated), findLeadById (with follow-ups), findOrganizationList |
| `server/admin/leads/actions.ts` | upsertLead, deleteLeads, markLeadLost, markLeadNurture, createFollowUp, completeFollowUp |
| `app/admin/leads/page.tsx` | Admin lead list page (withAdminPage + DataTableSkeleton) |
| `app/admin/leads/_components/leads-table.tsx` | Client table with status/source filters, useDataTable |
| `app/admin/leads/_components/leads-table-columns.tsx` | getColumns() with status badges, DataTableLink |
| `app/admin/leads/_components/lead-actions.tsx` | Per-row dropdown: View, Nurture, Mark Lost, Delete |
| `app/admin/leads/_components/leads-table-toolbar-actions.tsx` | Bulk delete toolbar |
| `app/admin/leads/_components/leads-delete-dialog.tsx` | Delete confirmation dialog |
| `app/admin/leads/_components/lead-form.tsx` | Shared create/edit form (RHF + Zod) |
| `app/admin/leads/new/page.tsx` | Create lead page |
| `app/admin/leads/[id]/page.tsx` | Lead detail/edit page with status actions + follow-up panel |
| `app/admin/leads/[id]/_components/lead-status-actions.tsx` | Contextual status transition buttons |
| `app/admin/leads/[id]/_components/follow-up-panel.tsx` | Follow-up list + create + complete |
| `components/web/lead-capture-form.tsx` | Public embeddable lead capture form |
| `app/(web)/organizations/[slug]/get-started/page.tsx` | Public "Get Started" page |
| `docs/sprints/SESSION_0038.md` | This file — session tracking |

## Decisions resolved

- `convertLead` creates a User record if none exists for the email, or links to existing — confirmed by reading the full action. TASK_04 status bar wires directly to the existing web action.
- Follow-up CRUD written fresh as `createFollowUp` + `completeFollowUp` in admin actions. Creating a follow-up auto-transitions NEW → CONTACTED.
- Public lead capture: standalone page at `/organizations/[slug]/get-started` wrapping embeddable `LeadCaptureForm` component (both, as SESSION_0037 leaned toward).

## Open decisions / blockers

- **FINDING: Sidebar nav entry missing** — `/admin/leads` is not wired into `components/admin/sidebar.tsx`. Must add before this is usable.
- **FINDING: Public lead capture form requires auth** — `LeadCaptureForm` calls `createLead` from `server/web/lead/actions.ts` which uses `userActionClient`. Unauthenticated visitors get a 401. The plan said "unauthenticated, rate-limited" — this is a critical functional bug.
- **FINDING: No email templates for lead lifecycle** — Dirstarter has `emails/submission.tsx`, `submission-premium.tsx`, `submission-published.tsx`, `submission-scheduled.tsx` for tool lifecycle. We have zero email templates for leads. The `emails/` directory pattern was completely ignored.
- **FINDING: Brand scoping not enforced on admin queries** — `findLeads()` and `findLeadById()` do not filter by brand. Admin sees all brands' leads. Violates ADR 0004.
- **FINDING: No audit logging on admin actions** — `upsertLead`, `deleteLeads`, etc. don't call `writeSchoolOpsAudit`. Web-layer actions do. Admin mutations are unauditable.
- **FINDING: Status transitions use web actions, not admin actions** — `LeadStatusActions` imports `bookTrial`/`completeTrial`/`convertLead` from `server/web/lead/actions.ts` (userActionClient + canEditOrganization), not adminActionClient. Mitigated by org-level auth check but architecturally messy.
- Smoke test script (`scripts/smoke-lead-lifecycle.ts`) not written.
- Conversion dialog simplified to direct button (no user-search modal).
- No worktree used (plan specified `wt-school-ops`).

---

## Giddy + Doug Hostile Close Review

### Dirstarter docs check

```
Dirstarter docs check: cached docs sufficient (local template at dirstarter_template/)
Sources: dirstarter_template/server/admin/tools/, dirstarter_template/app/admin/tools/,
         dirstarter_template/emails/, dirstarter_template/components/admin/sidebar.tsx
Verdict: partially aligned — server + table patterns cloned correctly; sidebar nav,
         email templates, and RelationSelector patterns were not ported
```

### Review answers

**1. Plan sanity:**
The plan was structurally sound — 5 tasks, clear Dirstarter template references, correct execution order. However, the plan **did not call out** sidebar nav wiring, email templates, or brand-scoping gaps. These are not edge cases — they're core to "can a user actually use this." The plan was a good skeleton that papered over the last-mile integration work.

**2. Dirstarter compliance:**
**Partially aligned.** The server layer (`schema.ts`, `queries.ts`, `actions.ts`) faithfully clones Dirstarter's `server/admin/tools/` pattern. The table/columns/actions/delete-dialog components properly clone the tools CRUD family. **Gaps:**

- Dirstarter's `tool-form.tsx` uses `RelationSelector` for categories/tags. Our `lead-form.tsx` uses plain `<select>` elements — functional but not pattern-identical.
- Dirstarter's `tool-actions.tsx` has a standalone delete button *outside* the dropdown (visible on detail page). Our `lead-actions.tsx` puts delete inside the dropdown only.
- **Sidebar nav was not wired.** Every admin entity in Dirstarter has a sidebar entry in `components/admin/sidebar.tsx`. We skipped this entirely.
- **No email templates.** Dirstarter sends emails on tool submission/publish/schedule via `emails/submission*.tsx`. Our lead lifecycle has no transactional emails at all. The `emails/` directory pattern was completely ignored.

**3. Security:**
- All admin CRUD actions use `adminActionClient` — role-gated. ✅
- **BUT:** `LeadStatusActions` calls `bookTrial`, `completeTrial`, `convertLead` from `server/web/lead/actions.ts` — these use `userActionClient`, not `adminActionClient`. They're auth-gated + `canEditOrganization` so this is mitigated but architecturally wrong for admin pages.
- **CRITICAL:** Public `LeadCaptureForm` calls `createLead` which requires `userActionClient` authentication. Unauthenticated visitors **cannot submit the form**. The "public" capture page is not actually public.

**4. Data integrity:**
- `createFollowUp` auto-transitions NEW → CONTACTED via `updateMany` (no optimistic lock). Acceptable at current scale.
- `upsertLead` creates leads without audit trail (unlike `createLead` in web actions which calls `writeSchoolOpsAudit`). Admin mutations are unauditable.
- Brand is derived from org on create, but admin update doesn't validate brand consistency — an admin could change `organizationId` to a different-brand org, creating cross-brand orphaned data.

**5. Lifecycle proof:**
The lead lifecycle (NEW → CONTACTED → TRIAL_BOOKED → TRIAL_COMPLETED → CONVERTED, with LOST/NURTURE branches) is wired in the status actions component. Follow-up panel enables CRM loop. However, no conversion dialog with user search was built (plan mentioned it).

**6. Verification honesty:**
TypeScript compiles clean (1 pre-existing error). **No runtime verification was done.** No browser smoke test. No `scripts/smoke-lead-lifecycle.ts`. "Done" means "compiles" — not "works."

**7. Workflow honesty:**
- No worktree used (plan specified `wt-school-ops`)
- No task IDs logged in a project-log or TASK_REVIEW_LOG
- No WORKFLOW 5.0 rubric was scored
- Session went straight to code without checking WORKFLOW 5.0 calendar

**8. Merge readiness:**
**Not ready to merge.** Missing sidebar nav entry, public form is auth-gated (broken), no audit logging on admin actions, no runtime verification, no brand scoping on admin queries.

### WORKFLOW 5.0 score caps applied

- Dirstarter compliance failure (sidebar, emails not ported): **caps at 8.9**
- Data integrity failure (no audit logging, no brand filter): **caps at 8.9**
- Missing credible verification (no runtime test): **caps at 9.4**
- Security (public form requires auth): **caps at 8.9**
- **Effective cap: 8.9**

---

## Kaizen reflection triage

### 1. Is this safe and secure? What tests would prove me right?

**Provably safe:** All admin CRUD actions use `adminActionClient` — role-gated. Delete operations are confirmation-dialog-guarded. Follow-up/status mutations are id-scoped.

**Documented but not behaviorally proven:**
- Brand scoping on admin queries — `findLeads()` returns all brands. Need a test: `findLeads()` called by admin of brand A should not return brand B leads (or explicitly document super-admin access).
- `upsertLead` org-brand consistency — no validation that org's brand matches lead's brand on update.

**Not safe:**
- Public lead capture form requires authentication via `userActionClient`. An unauthenticated visitor hitting `/organizations/[slug]/get-started` will get an auth error. **Test:** curl the form submission endpoint without session cookie → expect lead created (currently: expect 401).
- Status transitions via web actions are gated by `userActionClient` + `canEditOrganization`, not `adminActionClient`. **Test:** verify admin user passes `canEditOrganization` check.

**Tests that would close gaps:**
1. Integration test: unauthenticated POST to `createLead` → should succeed (needs public action client)
2. Integration test: `findLeads()` brand isolation
3. Integration test: `upsertLead` update with cross-brand org → should reject
4. E2E smoke: create lead → book trial → complete → convert → verify user + membership created

### 2. How many failed steps could we have prevented? What would I do better next time?

**Concrete process slips: 5**

1. **Didn't wire sidebar nav** — should have been in the plan as a checklist item. Fix: add "wire nav entry" as mandatory in any admin CRUD task template.
2. **Didn't check if public form needs unauthenticated access** — plan said "unauthenticated, rate-limited" but Cody didn't verify the action client. Fix: before building a "public" page, verify the action client supports the access level.
3. **Skipped the smoke test** — TASK_05 listed it, wasn't delivered. Fix: don't mark a task done if a deliverable is missing.
4. **No worktree used** — plan specified `wt-school-ops`. Fix: enforce at bow-in.
5. **No email templates** — Dirstarter has emails for every submission lifecycle. Fix: when cloning a Dirstarter admin CRUD, explicitly audit the `emails/` directory for related templates.

**Planning simplification:** Add a "Dirstarter surface audit" checklist to every admin CRUD plan: sidebar entry ✓, email templates ✓, relation selectors ✓, breadcrumbs ✓. Would have caught 3 of 5 slips with zero extra time.

### 3. Confidence 1–10 at scale of 100, 1,000, and 10,000?

| Scale | Score | Rationale |
| --- | --- | --- |
| 100 leads | **6** | Public form broken (auth-gated). Sidebar nav missing. Admin CRUD compiles but unverified at runtime. Basic user journey (prospect submits → admin manages) doesn't work end-to-end. |
| 1,000 leads | **5** | Same breakages. No brand scoping on admin queries means multi-brand deployments leak data. No audit trail on admin mutations. Pagination query is correct but brand filter gap is real. |
| 10,000 leads | **5** | Index coverage is good (`@@index([brand, organizationId, status])`). But `name` filter does `contains` with `mode: insensitive` — full scan on Postgres without trigram index. Offset-based pagination is O(n) at high page numbers. |

**Kaizen aggregate: 5**

### Score gate verdict

| Aggregate confidence | Required action |
| --- | --- |
| **≤ 6** | **Do not advance. Open hostile follow-up SESSION immediately.** |

---

## Required follow-up: SESSION_0038.5

**Goal:** Remediate SESSION_0038 hostile findings before advancing.

**Tasks:**
1. Fix public lead capture — create public/unauthenticated action client for `createLead` (or a separate `createPublicLead` action)
2. Add "Leads" entry to `components/admin/sidebar.tsx`
3. Add brand scoping to `findLeads()` and `findLeadById()`
4. Add `writeSchoolOpsAudit` calls to admin lead actions
5. Write `scripts/smoke-lead-lifecycle.ts`
6. Assess email template need (lead capture confirmation, follow-up scheduled)
7. Validate org-brand consistency on `upsertLead` update path

## Next session

**Goal:** Remediate SESSION_0038 hostile findings (SESSION_0038.5)
**Inputs:** This file's hostile review, `components/admin/sidebar.tsx`, `server/web/lead/actions.ts` (audit pattern), `lib/safe-actions.ts` (public action client), `emails/` directory
**First task:** Fix public lead capture auth gating

## Reflections

This session demonstrated a common failure mode: **structural fidelity without functional completeness.** The code mirrors Dirstarter's admin CRUD pattern accurately in file organization, component structure, and server conventions. But it shipped without the last-mile wiring that makes a feature *usable* — the sidebar entry, the email templates, the public access model, and runtime verification.

The root cause is speed over verification. All 16 files were created in a single pass with no browser test, no smoke script, and no checklist for "did I actually port everything Dirstarter does for an admin entity." The Petey plan was good structurally but missed integration surfaces (sidebar, emails). Cody executed faithfully against the plan but didn't question whether the plan was complete.

The Dirstarter `emails/` directory was a total blind spot — the plan never mentioned transactional emails despite Dirstarter having 5 email templates for its tool lifecycle. For leads, at minimum we need: (a) a capture confirmation email to the prospect, (b) an admin notification when a new lead arrives. These use the existing `EmailWrapper` + React Email infrastructure in `emails/components/`.

The Kaizen aggregate of 5 is honest. The scaffolding is correct and won't need to be rewritten — remediation is incremental fixes, not a redo. But calling this "done" would be false confidence that compounds into launch debt.

> *Bowed out — SESSION_0038 closed-full. Kaizen aggregate 5 — hostile follow-up SESSION_0038.5 required before advancing. Next session goal: remediate public auth, sidebar nav, brand scoping, audit logging, smoke test, email templates.*
