---
title: "SESSION 0149 — Membership Detail Page + Role Assignment Management"
slug: session-0149
type: session--implement
status: closed-quick
created: 2026-05-12
updated: 2026-05-12
last_agent: copilot-session-0149
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0148.md
  - docs/sprints/SESSION_0147.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0149 — Membership Detail Page + Role Assignment Management

## Date

2026-05-12

## Operator

Brian Scott + Copilot (Petey → Cody)

## Goal

Build the Membership admin detail page (view/edit single membership, status transition actions, role assignment management). This was the staged next-session scope from SESSION_0148.

## Status

in-progress

## Failed Steps / Drift Check

- Carried blockers from 0148:
  - 🔴 Resend domain DNS pending verification — 37th session carried (blocks live email send)
  - 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
  - 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)
  - 🟡 ClassAttendance model needed before punch card runtime tracking
  - 🟡 Membership transition audit trail needed before launch
  - 🟡 oRPC vs adminActionClient L1 divergence — add to drift register

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin detail page pattern (L1 — leads `[id]/page.tsx` with status actions + form) |
| Extension or replacement | Extension — Membership detail + role assignment are L2 (not in Dirstarter) |
| Why justified | Admin needs to view/edit individual memberships, transition status, and manage role assignments |
| Risk if bypassed | Admin can only see list view — no way to manage roles or view full membership details |

## Graphify Check

- Graph status: ≤1 commit behind HEAD (updated end of SESSION_0148)
- Query 1: `"membership detail page view edit role assignment management admin"` → found leads detail page (`app/admin/leads/[id]/`), roles admin (`app/admin/roles/`), memberships server layer, auth HOC, shared components
- Query 2: `"findMembershipById membership detail admin edit form"` → found `server/admin/memberships/queries.ts` (existing `findMembershipById`), `server/admin/memberships/actions.ts` (transition + delete), memberships table components
- Files selected from graph:
  - `app/admin/leads/[id]/page.tsx` — L1 detail page pattern (Wrapper + status actions + form + panels)
  - `app/admin/leads/[id]/_components/lead-status-actions.tsx` — L1 status action buttons pattern (useAction + toast + router.refresh)
  - `app/admin/invites/[id]/page.tsx` — simpler read-only detail page
  - `server/admin/memberships/queries.ts` — `findMembershipById` (includes user, org, discipline, roleAssignments.role, rank)
  - `server/admin/memberships/actions.ts` — `transitionMembershipStatus`, `deleteMemberships`
  - `server/admin/memberships/schema.ts` — `VALID_TRANSITIONS` state machine
  - `server/admin/roles/queries.ts` — `findRoleList` (id, name, code)
  - `server/admin/roles/actions.ts` — pattern for role CRUD via `adminActionClient`

---

## Petey Plan

### Goal

Deliver Membership admin detail page with: (1) read-only membership info display, (2) status transition action buttons following the VALID_TRANSITIONS state machine, (3) role assignment management (add/remove roles from the membership). Server layer for membership queries/transitions already exists — need new actions for role assignment only.

### Design Decisions (resolved up front)

1. **Detail page pattern**: Follow leads `[id]/page.tsx` — `withAdminPage` → fetch membership + role list → `Wrapper` with status actions panel + info display + role management panel.
2. **Status transitions**: Reuse `transitionMembershipStatus` action. UI shows valid transition buttons per `VALID_TRANSITIONS` (same state machine from list page row actions, but as full buttons like `lead-status-actions.tsx`).
3. **Role assignment**: New server actions needed — `assignRoleToMembership` and `removeRoleFromMembership`. These create/delete `MembershipRoleAssignment` records. UI shows current roles with remove buttons + a role selector to add new roles.
4. **No edit form for core fields** this session: Membership's core fields (org, discipline, rank, status) are managed via transitions and admin workflows, not free-form edit. Detail page is primarily read + actions. Edit form deferred to a future session if needed.

### Tasks

#### TASK_01 — Role assignment server actions
- **Agent:** Cody
- **What:** Add `assignRoleToMembership` and `removeRoleFromMembership` actions to `server/admin/memberships/actions.ts`. Add Zod schemas for both.
- **Steps:**
  1. Add `assignRoleSchema` (membershipId + roleId) and `removeRoleSchema` (membershipId + roleId) to `server/admin/memberships/schema.ts`
  2. Add `assignRoleToMembership` action — creates `MembershipRoleAssignment`, revalidates
  3. Add `removeRoleFromMembership` action — deletes `MembershipRoleAssignment`, revalidates
- **Done means:** Actions compile, handle duplicate assignment gracefully (unique constraint)
- **Depends on:** nothing

#### TASK_02 — Membership detail page
- **Agent:** Cody
- **What:** Create `app/admin/memberships/[id]/page.tsx` with membership info display
- **Steps:**
  1. Create `app/admin/memberships/[id]/page.tsx` — `withAdminPage`, fetch `findMembershipById` + `findRoleList`, render `Wrapper` with status actions + info grid + role panel
  2. Info grid: member name/email, organization, discipline, status badge, rank, member number, joined/left dates
- **Done means:** Detail page renders with full membership info
- **Depends on:** nothing (can parallel with TASK_01 — page shell doesn't need role actions yet)

#### TASK_03 — Membership status actions component
- **Agent:** Cody
- **What:** Create `app/admin/memberships/[id]/_components/membership-status-actions.tsx` following `lead-status-actions.tsx` pattern
- **Steps:**
  1. Client component with `useAction` hooks for `transitionMembershipStatus`
  2. Show valid transition buttons from `VALID_TRANSITIONS[membership.status]`
  3. Toast on success/error, `router.refresh()`
  4. Show current status prominently
- **Done means:** Admin can transition membership status from detail page
- **Depends on:** TASK_02

#### TASK_04 — Role assignment management component
- **Agent:** Cody
- **What:** Create `app/admin/memberships/[id]/_components/role-assignment-panel.tsx`
- **Steps:**
  1. Client component showing current role assignments as badges/chips with remove button
  2. Role selector (dropdown/select from `roleList` prop, filtering out already-assigned roles)
  3. `useAction` for `assignRoleToMembership` and `removeRoleFromMembership`
  4. Toast on success/error, `router.refresh()`
- **Done means:** Admin can view, add, and remove roles from a membership
- **Depends on:** TASK_01, TASK_02

#### TASK_05 — Wire list page row link to detail
- **Agent:** Cody
- **What:** Update `memberships-table-columns.tsx` — make member name column link to `/admin/memberships/[id]`
- **Steps:**
  1. Wrap member name cell in `<Link href={/admin/memberships/${row.original.id}}>` 
- **Done means:** Clicking a membership in the list navigates to detail page
- **Depends on:** TASK_02

#### TASK_06 — Type check + verification
- **Agent:** Cody
- **What:** Run `bunx tsc --noEmit`, verify zero errors
- **Done means:** Zero TS errors
- **Depends on:** TASK_01–05

### Parallelism

TASK_01 and TASK_02 can run in parallel (no dependency). TASK_03 after TASK_02. TASK_04 after TASK_01 + TASK_02. TASK_05 after TASK_02. TASK_06 last.

### Agent Assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Small action + schema addition — clear execution |
| TASK_02 | Cody | Follow leads detail page pattern — clear execution |
| TASK_03 | Cody | Follow lead-status-actions pattern — clear execution |
| TASK_04 | Cody | New component but pattern is clear (badges + select + actions) |
| TASK_05 | Cody | One-line wiring change |
| TASK_06 | Cody | Verification |

---

## Pre-flight: Membership Detail Page + Role Assignment

### 1. Auth predicates planned

- [x] Session auth required (admin pages via `withAdminPage` HOC)
- [x] Brand column filtered (ADR 0004) — `adminActionClient` provides `ctx.brand`
- Authorization approach: `withAdminPage` HOC for page, `adminActionClient` for actions

### 2. Existing action scan

- `server/admin/memberships/actions.ts` — `transitionMembershipStatus`, `deleteMemberships` ✅ exist
- `server/admin/memberships/queries.ts` — `findMembershipById` ✅ exists (includes user, org, discipline, roleAssignments.role, rank)
- `server/admin/roles/queries.ts` — `findRoleList` ✅ exists (id, name, code)
- **Missing:** role assignment/removal actions → TASK_01

### 3. Data flow reference

- `MembershipRoleAssignment` — join table: membershipId + roleId, unique constraint on pair
- `VALID_TRANSITIONS` state machine governs status transition UI

### 4. Schema spot-check

- `findMembershipById` returns: user (id, name, email), organization (id, name), discipline (id, name), roleAssignments[].role (id, name, code), rank (id, name)
- `MembershipRoleAssignment`: id, assignedAt, membershipId, roleId — `@@unique([membershipId, roleId])`

### 5. FAILED_STEPS check

- Prior failures in this area: none
- Manual Boundary Registry entries: none

---

## Task Log

- SESSION_0149_TASK_01 — ✅ done. Added `roleAssignmentSchema` to schema.ts. Added `assignRoleToMembership` (upsert) and `removeRoleFromMembership` (delete) actions.
- SESSION_0149_TASK_02 — ✅ done. Created `app/admin/memberships/[id]/page.tsx` with info grid (member, org, discipline, status, rank, member number, dates), status actions, role panel.
- SESSION_0149_TASK_03 — ✅ done. Created `membership-status-actions.tsx` — shows valid transition buttons per VALID_TRANSITIONS state machine.
- SESSION_0149_TASK_04 — ✅ done. Created `role-assignment-panel.tsx` — displays current roles as badges with remove, role selector to add, uses assign/remove actions.
- SESSION_0149_TASK_05 — ✅ done. Wired member name column in list table to link to `/admin/memberships/[id]`.
- SESSION_0149_TASK_06 — ✅ done. Zero TS errors on `bunx tsc --noEmit`.

## What Landed

- **Membership detail page** — `app/admin/memberships/[id]/page.tsx` with full info grid, status transitions, role management
- **Status transition actions** — client component with valid transition buttons per state machine, toast feedback
- **Role assignment panel** — view/add/remove roles from a membership with badges + selector
- **Role assignment server actions** — `assignRoleToMembership` (upsert), `removeRoleFromMembership` (delete) in actions.ts
- **List → detail link** — member name column in list table now links to detail page
- **Zero TS errors** across entire codebase

## Files Touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0149.md` | New — this session file |
| `apps/web/server/admin/memberships/schema.ts` | Modified — added `roleAssignmentSchema` |
| `apps/web/server/admin/memberships/actions.ts` | Modified — added `assignRoleToMembership`, `removeRoleFromMembership` |
| `apps/web/app/admin/memberships/[id]/page.tsx` | New — detail page |
| `apps/web/app/admin/memberships/[id]/_components/membership-status-actions.tsx` | New — status transition buttons |
| `apps/web/app/admin/memberships/[id]/_components/role-assignment-panel.tsx` | New — role assignment panel |
| `apps/web/app/admin/memberships/_components/memberships-table-columns.tsx` | Modified — member name links to detail |

## Decisions Resolved

- Detail page is read-only info grid + actions (no free-form edit form this session)
- Role assignment uses upsert to handle duplicate gracefully
- Button variants: primary for ACTIVE transition, destructive for SUSPENDED/CANCELLED, ghost for EXPIRED, secondary for PENDING

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 37th session carried (blocks live email send)
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
- 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)
- 🟡 ClassAttendance model needed before punch card runtime tracking
- 🟡 Membership transition audit trail needed before launch
- 🟡 oRPC vs adminActionClient L1 divergence — add to drift register

## Next Session

- **Goal:** SESSION_0150 — Membership edit form (rank/discipline changes) + transition audit trail
- **Inputs to read:** SESSION_0149 (this session), SESSION_0148 (list page)
- **First task:** Add `updateMembership` action for rank/discipline edits, create edit form component on detail page

