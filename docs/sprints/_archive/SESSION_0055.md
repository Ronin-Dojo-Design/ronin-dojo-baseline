---
title: "SESSION 0055 — Lead Intake, Trial Conversion & CRM Follow-Up"
slug: session-0055
type: session
status: closed-quick
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0055
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0054.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0055 — Lead Intake, Trial Conversion & CRM Follow-Up

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

in-progress

### Goal

Build the admin Lead CRM surface (list + detail + follow-ups), public lead capture form, trial booking flow, and conversion-to-member lifecycle. This closes the Prospect → Member top-of-funnel gap identified in WORKFLOW_5.0 lifecycle #1.

### Context read

- ✅ SESSION_0054 — closed-quick. All tasks complete (enrollment checkout, webhook fulfillment, user dashboard).
- ✅ WORKFLOW_5.0 — SESSION_0037 target: "Lead intake, trial conversion, CRM follow-up states." Schema models `Lead`/`LeadFollowUp` landed in Wave B (SESSION_0026).
- ✅ `opening.md` — ritual followed.
- ✅ `dirstarter-component-inventory.md` — MANDATORY PRE-FLIGHT confirmed. L1 admin DataTable, HOC chains, Form primitives available.
- ✅ Git: `main`, clean working tree.

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin CRUD (DataTable + HOC), Forms, server actions, public pages |
| Extension or replacement | Extension — using L1 admin DataTable/HOC patterns + Form primitives for Lead domain |
| Why justified | Lead intake is the top-of-funnel for Prospect→Member lifecycle. Can't launch Baseline without prospect capture. |
| Risk if bypassed | Hand-rolling admin CRUD diverges from L1 patterns, creating maintenance debt and missing auth/brand scoping |

### Lane selection

**Primary lane:** School operations
**Sub-lane:** None

### Worktree plan

| Field | Value |
| --- | --- |
| Worktree | `wt-school-ops` (or `main` if worktrees not active) |
| Branch intent | Lead intake + trial conversion CRM |
| PR target | `main` |
| Merge dependency | None — SESSION_0054 code already on `main` |

---

## Petey plan

### Goal

Build admin Lead management CRUD, public lead capture form, trial booking state machine, and conversion-to-member action. Full Prospect→Member top-of-funnel.

### Tasks

#### TASK_01 — Admin Lead list page with DataTable (Cody, 30 min)

- **Agent:** Cody
- **What:** Create admin Lead list at `app/admin/leads/` using L1 DataTable pattern with columns: name, email, phone, status, source, org, program, created date. Filters by status + source. Brand-scoped queries.
- **Steps:**
  1. Create `server/admin/leads/queries.ts` — `findLeads()` with brand filter, pagination, status/source filters
  2. Create `server/admin/leads/actions.ts` — `updateLeadStatus()`, `deleteLead()` server actions
  3. Create `app/admin/leads/page.tsx` — DataTable page following L1 admin pattern (HOC chain)
  4. Create `app/admin/leads/leads-table.tsx` — DataTable columns + row actions
  5. Wire into admin nav
- **Done means:** Admin can view, filter, and manage leads in a DataTable
- **Depends on:** Nothing

#### TASK_02 — Admin Lead detail + follow-up management (Cody, 25 min)

- **Agent:** Cody
- **What:** Create lead detail page at `app/admin/leads/[id]/page.tsx` showing full lead info + follow-up timeline. Add/edit follow-ups inline.
- **Steps:**
  1. Create `server/admin/leads/queries.ts` — `findLeadById()` with follow-ups included
  2. Create `app/admin/leads/[id]/page.tsx` — detail view with Card layout
  3. Create `app/admin/leads/[id]/follow-ups.tsx` — follow-up timeline + add form (Dialog)
  4. Add `createFollowUp()`, `completeFollowUp()` server actions
- **Done means:** Admin can view lead details, add follow-ups, mark them complete
- **Depends on:** TASK_01 (shared queries/actions file)

#### TASK_03 — Public lead capture form (Cody, 20 min)

- **Agent:** Cody
- **What:** Create public-facing lead capture form at `app/(web)/programs/[id]/inquire/page.tsx` (or similar). Uses L1 Form primitives. Creates a `Lead` record with status `NEW`. No auth required.
- **Steps:**
  1. Create `server/web/leads/actions.ts` — `submitLeadInquiry()` public action (no auth, rate-limited)
  2. Create `app/(web)/programs/[id]/inquire/page.tsx` — form with firstName, lastName, email, phone, notes
  3. Create success confirmation page
  4. Add "Inquire" / "Free Trial" button to program detail page
- **Done means:** Unauthenticated visitor can submit interest in a program → Lead record created
- **Depends on:** Nothing (parallel with TASK_01)

#### TASK_04 — Trial booking + conversion lifecycle (Cody, 25 min)

- **Agent:** Cody
- **What:** Admin actions to move a Lead through the funnel: NEW → CONTACTED → TRIAL_BOOKED (sets `trialBookedAt`) → TRIAL_COMPLETED → CONVERTED (creates User + Membership, sets `convertedAt` + `convertedToUserId`) or LOST/NURTURE.
- **Steps:**
  1. Add `bookTrial()` action — sets status TRIAL_BOOKED + `trialBookedAt`
  2. Add `completeTrial()` action — sets status TRIAL_COMPLETED
  3. Add `convertLead()` action — creates User (via Better-Auth if email exists) + Membership (ACTIVE) + sets CONVERTED + `convertedAt`/`convertedToUserId`
  4. Add `markLost()` / `markNurture()` actions
  5. Wire status transition buttons into lead detail page (TASK_02)
- **Done means:** Admin can move leads through the full funnel; conversion creates a real member
- **Depends on:** TASK_02

### Parallelism

- TASK_01 and TASK_03 can run **in parallel** (disjoint file sets: admin vs public)
- TASK_02 depends on TASK_01 (shared server files)
- TASK_04 depends on TASK_02 (buttons wired into detail page)

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Clear L1 DataTable pattern, no decisions |
| TASK_02 | Cody | Follows TASK_01 pattern, Card + Dialog |
| TASK_03 | Cody | Simple public form, no auth |
| TASK_04 | Cody | Lifecycle state machine, straightforward actions |

### Open decisions

- **Lead-to-User conversion:** Should `convertLead()` create a Better-Auth user account (triggering magic link invite), or just create a `User` row? **Recommendation:** Create User row + send magic link invite email so the converted member can log in. Needs user sign-off.
- **Rate limiting on public form:** L1 has rate limiting built in? If not, add basic IP-based throttle. Needs check.

### Risks

- `PricingPlanActions` type mismatch (carried from SESSION_0053) — shouldn't block this session but note if it surfaces.
- Stripe keys still not configured — doesn't affect Lead CRUD but blocks end-to-end enrollment testing.

### Scope guard

If additional work surfaces during execution (e.g., email notifications on lead capture, automated follow-up scheduling), note in SESSION file under `Open decisions / blockers` — do NOT expand scope mid-task.

### Dirstarter implementation template

- **Docs read first:** `dirstarter-component-inventory.md` (2026-05-04), L1 admin patterns inventory
- **Baseline pattern to extend:** Admin DataTable + HOC chain, Form primitives, server action pattern
- **Custom delta:** Lead/LeadFollowUp domain models, trial conversion lifecycle, public capture form
- **No-bypass proof:** Using L1 DataTable, Form, Dialog, Card, Badge, Button components. No hand-rolled HTML.

---

## Execution order

1. TASK_01: Admin Lead list (DataTable) — **Cody**
2. TASK_03: Public lead capture form — **Cody** (can start parallel with TASK_01)
3. TASK_02: Admin Lead detail + follow-ups — **Cody** (after TASK_01)
4. TASK_04: Trial booking + conversion lifecycle — **Cody** (after TASK_02)

---

## Pre-flight discovery

**All four planned tasks already exist in the codebase.** Cody pre-flight found:

- ✅ TASK_01 — `app/admin/leads/page.tsx` + DataTable with status/source filters, bulk delete, column visibility
- ✅ TASK_02 — `app/admin/leads/[id]/page.tsx` + `LeadStatusActions` + `FollowUpPanel` components
- ✅ TASK_03 — `app/(web)/organizations/[slug]/get-started/page.tsx` + `LeadCaptureForm` + `createPublicLead` (rate-limited, unauthenticated)
- ✅ TASK_04 — `server/web/lead/actions.ts`: `bookTrial`, `completeTrial`, `convertLead` (full transaction: User + Passport + DirectoryProfile + Membership + ProgramEnrollment + WaiverSignatures + audit trail)

**Option A confirmed built:** `convertLead` already creates User + Passport + DirectoryProfile in a transaction. Magic link invite email is the one gap — User row is created but no auth invitation is sent.

### Revised goal

Since Lead CRM is complete, pivot to the next WORKFLOW calendar target. Checking the calendar:

- Lead intake ✅ (already done)  
- Next target: **Tournament operations** (SESSION_0038–0039) — event discovery, registration checkout, brackets

### Decision: Session pivot needed

This session should either:
1. Add the magic link invite to `convertLead` (small gap closure, ~15 min)
2. Pivot to the next unbuilt WORKFLOW target

**Pivoting to gap closure + next lane.**

---

## Revised Petey plan

### TASK_01 — Send magic link invite on lead conversion (Cody, 15 min)

- **Agent:** Cody
- **What:** After `convertLead` creates a new User, send a Better-Auth magic link invitation email so the member can set up their account.
- **Done means:** New users created via lead conversion receive an email to access their account.
- **Depends on:** Nothing

### TASK_02 — Audit: verify admin nav includes Leads link (Cody, 5 min)

- **Agent:** Cody
- **What:** Confirm Leads appears in the admin sidebar navigation. If missing, add it.
- **Done means:** Admin can navigate to `/admin/leads` from the sidebar.
- **Depends on:** Nothing

## First task

**TASK_01:** Wire magic link invite into `convertLead` action for newly created users.

---

## What landed

- **TASK_01 ✅** — Already existed: Admin Lead DataTable at `app/admin/leads/page.tsx` with status/source filters, bulk delete, column visibility. Leads in admin sidebar nav confirmed.
- **TASK_02 ✅** — Already existed: Lead detail page at `app/admin/leads/[id]/page.tsx` with `LeadStatusActions` (Book Trial, Complete Trial, Convert to Member, Nurture, Mark Lost) and `FollowUpPanel` (timeline + add form).
- **TASK_03 ✅** — Already existed: Public lead capture form at `app/(web)/organizations/[slug]/get-started/page.tsx` using `LeadCaptureForm` + `createPublicLead` (IP rate-limited, unauthenticated).
- **TASK_04 ✅** — Already existed: Full lifecycle in `server/web/lead/actions.ts`: `bookTrial`, `completeTrial`, `convertLead` (transaction: User + Passport + DirectoryProfile + Membership + ProgramEnrollment + WaiverSignatures + audit trail).
- **Gap closure ✅** — Added welcome email on lead conversion. When `convertLead` creates a new user, `after()` sends an email via `EmailMagicLink` directing them to the login page.

## Files touched

| File | Note |
| --- | --- |
| `server/web/lead/actions.ts` | MODIFIED — added `isNewUser` to conversion result, wired welcome email via `sendEmail` + `EmailMagicLink` in `after()` callback |

## Decisions resolved

- **Lead-to-User conversion email:** Option A — send welcome email with login URL on conversion. Uses L1 `EmailMagicLink` template + `sendEmail` helper. Non-blocking via `after()`.

## Open decisions / blockers

- From SESSION_0053: `setup-stripe-products.ts` not yet run — Stripe test keys needed.
- From SESSION_0053: `PricingPlanActions` type mismatch — not triggered this session.

## Task log

- TASK_01 — ✅ PRE-EXISTING
- TASK_02 — ✅ PRE-EXISTING
- TASK_03 — ✅ PRE-EXISTING
- TASK_04 — ✅ PRE-EXISTING
- Gap closure (welcome email) — ✅ COMPLETE

## Next session

**Goal:** Address the real gaps identified by calendar audit. See audit table below.

**First task:** Petey plan for the highest-priority gap.

---

## Calendar Audit — What Exists vs What's Missing

Audited each WORKFLOW 5.0 calendar target against the live codebase on 2026-05-04.

| Calendar target | Lane | Expected deliverable | Status | Gaps |
| --- | --- | --- | --- | --- |
| 0036 | School ops | Entitlement schema + service + Stripe webhook | ✅ BUILT | `checkEntitlement`, `grantEntitlement`, `revokeEntitlement`, `expireEntitlements`, admin CRUD, webhook wiring all present |
| 0037 | School ops | Lead intake, trial conversion, CRM follow-up | ✅ BUILT | Full lifecycle: DataTable, detail+follow-ups, public capture, `bookTrial`→`completeTrial`→`convertLead` (User+Passport+Membership+Enrollment+Waivers). Welcome email added this session. |
| 0038 | Tournament ops | Event discovery, registration checkout, rosters, check-in | ✅ BUILT | `searchTournaments`, `findTournamentBySlug`, `createRegistrationCheckout`, `cancelRegistration`. Admin: CRUD, disciplines, divisions, registration status management. Public: list + detail + `[slug]` page. |
| 0039 | Tournament ops | Brackets, match ops, mat assignment, scoring, live results | ✅ BUILT | `generateBracket` (single/double elim + round robin), `scoreMatch`, admin bracket detail page. **Gap: no public live results page. No mat assignment UI (schema exists but no admin surface).** |
| 0040 | Content + curriculum | Curriculum, techniques, media, certificates, publishing | ⚠️ PARTIAL | Techniques: full CRUD + public pages + tests. Certificates: admin CRUD for templates. **Gaps: no CurriculumItem/Course publishing surface, no technique-to-curriculum linking UI, no certificate issuance flow (template exists but no issue/order/download), no media gallery management.** |
| 0041 | Brand launch | Baseline/BBL/WEKAF/RDD public surfaces, sample orgs, seed content | ❌ NOT STARTED | No brand-specific landing pages, no sample org seed script, no branded content. Brand middleware + theming infra exists but no per-brand public surfaces. |
| 0042 | QA hardening | E2E lifecycle tests, fixtures, staging deploy, rollback | ❌ NOT STARTED | No E2E test suite, no staging deploy pipeline, no rollback drill artifacts. Unit tests exist for techniques only. |
| 0043 | Launch day | Release execution, monitoring, support | ❌ NOT STARTED | No release runbook, no monitoring/alerting, no support playbooks. |

### Summary of real gaps (priority order)

1. **Content + curriculum (0040)** — Course/CurriculumItem publishing, technique→curriculum linking, certificate issuance flow, media gallery. Partial work exists.
2. **Tournament polish (0039)** — Public live results page, mat assignment admin UI.
3. **Brand launch surfaces (0041)** — Per-brand landing pages, sample orgs, seed content, branded themes.
4. **QA hardening (0042)** — E2E test suite, staging deploy, fixtures, rollback.
5. **Launch ops (0043)** — Monitoring, runbooks, support playbooks.

### Recommendation

Next session should target **Content + curriculum (0040 gaps)** since it has partial work and is prerequisite for brand launch content. Tournament polish and brand surfaces can follow.
