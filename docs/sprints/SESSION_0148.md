---
title: "SESSION 0148 — Membership Admin List Page + Invite Email"
slug: session-0148
type: session--implement
status: closed-quick
created: 2026-05-12
updated: 2026-05-12
last_agent: copilot-session-0148
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0147.md
  - docs/sprints/SESSION_0145.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0148 — Membership Admin List Page + Invite Email

## Date

2026-05-12

## Operator

Brian Scott + Copilot (Petey → Cody)

## Goal

Build the Membership admin list page (data table with status/org/discipline filters, transition actions) and create an invite notification email template (Resend + React Email). This was the staged next-session scope from SESSION_0147.

## Status

in-progress

## Failed Steps / Drift Check

- Carried blockers from 0147:
  - 🔴 Resend domain DNS pending verification — 36th session carried (blocks live email send, not template creation)
  - 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
  - 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)
  - 🟡 ClassAttendance model needed before punch card runtime tracking
  - 🟡 Membership transition audit trail needed before launch
  - 🟡 oRPC vs adminActionClient L1 divergence — add to drift register

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin CRUD list page pattern (L1), React Email template pattern (L1) |
| Extension or replacement | Extension — Membership admin pages are L2 (not in Dirstarter); email template follows L1 pattern |
| Why justified | Memberships are core platform entity; admin needs to manage them. Invite email enables onboarding flow. |
| Risk if bypassed | Admin has no visibility into memberships; invites are silent (no notification) |

## Graphify Check

- Graph status: ≤1 commit behind HEAD (updated end of SESSION_0147)
- Query 1: `"Membership admin list page data table status filter organization discipline"` → found organizations-list-page.md, data-table-faceted-filter, admin table patterns (leads, tools, tags, courses)
- Query 2: `"Membership server admin memberships schema actions queries findMemberships"` → found `server/admin/memberships/schema.ts` (existing table params + transition schema), leads/tags patterns
- Query 3: `"Resend email template invite notification React Email"` → found `lib/email.ts`, `emails/components/wrapper.tsx`, `emails/components/button.tsx`, `email-delivery-spec.md`, existing templates
- Files selected from graph:
  - `server/admin/memberships/schema.ts` — needs `parseAsArrayOf` enum filters for status
  - `server/admin/memberships/queries.ts` — existing `findMemberships` (paginated, includes user/org/discipline/rank)
  - `server/admin/memberships/actions.ts` — existing `transitionMembershipStatus` + `deleteMemberships`
  - `app/admin/invites/` — freshest L1 admin CRUD page pattern (SESSION_0147)
  - `lib/email.ts` — `sendEmail` helper
  - `emails/magic-link.tsx` — React Email template pattern
  - `emails/components/wrapper.tsx` + `button.tsx` — shared email components

---

## Petey Plan

### Goal

Deliver Membership admin list page with faceted filters (status, org, discipline) and transition row actions, plus an invite notification email template. Server layer already exists — this is a UI + email-only session.

### Design Decisions (resolved up front)

1. **Schema enhancement needed**: `membershipsTableParamsSchema` currently has only `name` text filter. Must add `parseAsArrayOf` for `status` (MembershipStatus enum) to match invites pattern. Org and discipline can use `parseAsString` with ComboboxSelector since they're relation filters, not enum arrays.
2. **Transition actions in table**: Row actions should show valid transitions per the `VALID_TRANSITIONS` state machine from `schema.ts`. Terminal states (CANCELLED, EXPIRED) show no transition options.
3. **Email template**: Follows `magic-link.tsx` pattern — `EmailWrapper` + `EmailButton` with invite link. Blocked from live send by Resend DNS, but template can be built and previewed.

### Tasks

#### TASK_01 — Enhance membership schema with status filter params
- **Agent:** Cody
- **What:** Add `parseAsArrayOf(parseAsStringEnum<MembershipStatus>(...))` for status filter to `membershipsTableParamsSchema`. Update `findMemberships` query to handle status array filter.
- **Steps:**
  1. Update `server/admin/memberships/schema.ts` — add `status` filter param using `parseAsArrayOf`
  2. Update `server/admin/memberships/queries.ts` — add status array filter to `expressions`
- **Done means:** Schema compiles, query supports status array filtering
- **Depends on:** nothing

#### TASK_02 — Membership admin list page + data table
- **Agent:** Cody
- **What:** Create `app/admin/memberships/page.tsx`, `memberships-table.tsx`, `memberships-table-columns.tsx` following invites pattern
- **Steps:**
  1. Create `app/admin/memberships/page.tsx` — list page with Suspense, parse search params, fetch memberships + org options
  2. Create `app/admin/memberships/_components/memberships-table.tsx` — data table with status faceted filter, org/discipline text filters, DateRangePicker
  3. Create `app/admin/memberships/_components/memberships-table-columns.tsx` — columns: user name, org, discipline, status badge, rank, role assignments, joined date, row actions (transition, delete)
  4. Create `app/admin/memberships/_components/membership-actions.tsx` — row actions: transition status (dropdown showing valid transitions from state machine), delete
- **Done means:** Admin can list memberships with filters, transition status, delete
- **Depends on:** TASK_01

#### TASK_03 — Admin nav link for Memberships
- **Agent:** Cody
- **What:** Add Memberships to admin sidebar nav (if not already present)
- **Steps:**
  1. Check `components/admin/sidebar.tsx` for existing Memberships link
  2. Add if missing (UsersIcon or similar)
- **Done means:** Memberships link visible in admin nav
- **Depends on:** TASK_02

#### TASK_04 — Invite notification email template
- **Agent:** Cody
- **What:** Create `emails/invite-notification.tsx` React Email template. Wire into `createInvite` action (send on invite creation).
- **Steps:**
  1. Create `emails/invite-notification.tsx` — template with org name, invite link, expiry info
  2. Wire into `server/admin/invites/actions.ts` `createInvite` — call `sendEmail` after invite creation (guarded by `meta.email` if present)
- **Done means:** Template renders in React Email preview. Action sends email when invite has a target email in meta.
- **Depends on:** nothing (parallel with TASK_01/02)

#### TASK_05 — Type check + verification
- **Agent:** Cody
- **What:** Run `bunx tsc --noEmit`, verify zero errors
- **Done means:** Zero TS errors
- **Depends on:** TASK_01, TASK_02, TASK_03, TASK_04

### Parallelism

TASK_01 first (TASK_02 depends on it). TASK_04 is independent — can run in parallel with TASK_01. TASK_02 after TASK_01. TASK_03 after TASK_02. TASK_05 last.

### Agent Assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Small schema + query enhancement — clear execution |
| TASK_02 | Cody | Follow invites admin page pattern — clear execution |
| TASK_03 | Cody | Wiring — trivial |
| TASK_04 | Cody | Follow magic-link email pattern — clear execution |
| TASK_05 | Cody | Verification |

---

## Pre-flight: Membership Admin List Page + Invite Email

### 1. Auth predicates planned

- [x] Session auth required (admin pages via `withAdminPage` HOC)
- [x] Brand column filtered (ADR 0004) — queries use `ctx.brand`
- Authorization approach: `withAdminPage` HOC for page auth, `adminActionClient` for actions (already wired in SESSION_0145)

### 2. Existing action scan

- `server/admin/memberships/actions.ts` — `transitionMembershipStatus`, `deleteMemberships` (already exist)
- `server/admin/memberships/queries.ts` — `findMemberships`, `findMembershipById` (already exist)
- `server/admin/memberships/schema.ts` — table params + transition schema (already exists, needs status filter)
- No new actions needed — only schema enhancement + UI

### 3. Data flow reference

- Membership state machine: INVITED → PENDING → ACTIVE → SUSPENDED → CANCELLED/EXPIRED
- `VALID_TRANSITIONS` in `schema.ts` governs what the UI shows

### 4. Schema spot-check

- `MembershipStatus` enum: `INVITED`, `PENDING`, `ACTIVE`, `SUSPENDED`, `CANCELLED`, `EXPIRED`
- `findMemberships` already includes: user (name, email), organization (name), discipline (name), roleAssignments (role name/code), rank (name)
- Missing from current schema params: status array filter

### 5. FAILED_STEPS check

- Prior failures in this area: none
- Manual Boundary Registry entries: none

---

## Task Log

- SESSION_0148_TASK_01 — ✅ done. Enhanced `membershipsTableParamsSchema` with `parseAsArrayOf(parseAsStringEnum<MembershipStatus>)` status filter. Updated `findMemberships` query to handle status array in expressions.
- SESSION_0148_TASK_02 — ✅ done. Created `app/admin/memberships/page.tsx` (list with Suspense, org + discipline options), `memberships-table.tsx` (status faceted filter with 6 status icons, DateRangePicker), `memberships-table-columns.tsx` (9 columns: member name+email, org, discipline, status badge, rank, roles, joined date, row actions with state machine transitions + delete).
- SESSION_0148_TASK_03 — ✅ done. Added Memberships link (IdCardIcon) to admin sidebar nav.
- SESSION_0148_TASK_04 — ✅ done. Created `emails/invite-notification.tsx` (org name, invite link, expiry). Wired into `createInvite` action — sends email via Resend when `meta.email` present. Invite query now includes org name for email subject.
- SESSION_0148_TASK_05 — ✅ done. Zero TS errors on `bunx tsc --noEmit`.

## What Landed

- **Membership admin list page** — full data table with status faceted filter (6 statuses with icons), date range picker, columns for member/org/discipline/status/rank/roles/joined, row actions with VALID_TRANSITIONS state machine dropdown + delete
- **Membership schema enhanced** — `parseAsArrayOf` status filter added to table params, query updated to filter by status array
- **Admin sidebar** — Memberships link added with IdCardIcon
- **Invite notification email** — React Email template (`emails/invite-notification.tsx`) with org name, invite link, expiry info. Wired into `createInvite` action (sends when `meta.email` present)
- **SOP updated** — §14 Invite flow updated with email notification step, discipline picker, ACTIVE status on claim
- **Zero TS errors** across entire codebase

## Files Touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0148.md` | New — this session file |
| `apps/web/server/admin/memberships/schema.ts` | Modified — added `parseAsArrayOf` status filter |
| `apps/web/server/admin/memberships/queries.ts` | Modified — added status array to expressions |
| `apps/web/app/admin/memberships/page.tsx` | New — list page with Suspense |
| `apps/web/app/admin/memberships/_components/memberships-table.tsx` | New — data table with faceted filters |
| `apps/web/app/admin/memberships/_components/memberships-table-columns.tsx` | New — columns + row actions |
| `apps/web/emails/invite-notification.tsx` | New — invite email template |
| `apps/web/server/admin/invites/actions.ts` | Modified — wired email send into createInvite |
| `apps/web/components/admin/sidebar.tsx` | Modified — added Memberships nav link |
| `docs/runbooks/sop-data-and-wiring-flows.md` | Modified — updated §14 with email + discipline picker + ACTIVE status |

## Decisions Resolved

- MembershipStatus filter uses `parseAsArrayOf` pattern (consistent with invites)
- Row actions show valid transitions from VALID_TRANSITIONS state machine — terminal states have no transition options
- Invite email sent via `after()` callback, guarded by `meta.email` presence
- IdCardIcon for Memberships admin nav link

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 36th session carried (blocks live email send)
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
- 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)
- 🟡 ClassAttendance model needed before punch card runtime tracking
- 🟡 Membership transition audit trail needed before launch
- 🟡 oRPC vs adminActionClient L1 divergence — add to drift register

## Next Session

- **Goal:** SESSION_0149 — Membership detail page (view/edit) + role assignment management
- **Inputs to read:** SESSION_0148 (this session), SESSION_0147 (invite CRUD)
- **First task:** Create `app/admin/memberships/[id]/page.tsx` with membership detail view, role assignment management, transition history


