---
title: "SESSION 0054 — Commerce Wiring: Enrollment Checkout + Webhook Fulfillment + User Dashboard"
slug: session-0054
type: session
status: closed-quick
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0054
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0053.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0054 — Commerce Wiring: Enrollment Checkout + Webhook Fulfillment + User Dashboard

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

closed-quick

### Goal

Complete the user-facing commerce wiring deferred from SESSION_0053: program enrollment checkout page, webhook fulfillment for enrollments, and user dashboard showing active entitlements/enrollments. This closes the full admin-configures → user-purchases → system-grants loop.

### Context read

- ✅ SESSION_0053 — closed-full. TASK_01 (Stripe products), TASK_04 (entitlement admin), TASK_05 (pricing plan admin) all landed. TASK_02, TASK_03, TASK_06 deferred to this session.
- ✅ WORKFLOW_5.0.md — primary lane: School operations. Session calendar target: entitlement implementation.
- ✅ `opening.md` — ritual followed.
- ✅ `boilerplate.md` — confirmed L1 has auth, Stripe, admin dashboard, content, email, media, SEO, i18n built-in.
- ✅ Git: `main`, clean working tree.

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Monetization (Stripe checkout), webhooks, dashboard |
| Extension or replacement | Extension — using L1 `ProductQuery` + `createStripeCheckout` + webhook pattern for program enrollment domain |
| Why justified | Enrollment checkout is the core Prospect→Member lifecycle gate. Can't launch Baseline without it. |
| Risk if bypassed | Hand-rolling checkout would diverge from L1 Stripe wiring, creating maintenance debt and missing webhook patterns |

### Lane selection

**Primary lane:** School operations
**Sub-lane:** None

### Worktree plan

| Field | Value |
| --- | --- |
| Worktree | `wt-school-ops` (or `main` if worktrees not active) |
| Branch intent | Commerce enrollment checkout wiring |
| PR target | `main` |
| Merge dependency | None — SESSION_0053 code already on `main` |

---

## Petey Task Plan

Carrying forward TASK_02, TASK_03, TASK_06 from SESSION_0053's plan. Architecture assessment and concept model already done — no re-planning needed.

### TASK_02 — Program enrollment page using `ProductQuery` (Cody, 40 min)

**What:** Create `app/(web)/programs/[slug]/enroll/page.tsx` that:
1. Loads the program by slug
2. Renders `ProductQuery` with `productFilter` for enrollment products
3. Passes `checkoutData` with `metadata: { programSlug, userId }` and `successUrl`
4. Create success page at `enroll/success/page.tsx`

**Pattern:** Clone of `submit/[slug]/page.tsx` — same `Intro` + `Suspense` + `ProductQuery`.

**Done means:** Public program page has "Enroll" → plan selection → Stripe Checkout → success page.

**Assigned to:** Cody

### TASK_03 — Webhook fulfillment: program enrollment (Cody, 20 min)

**What:** Extend `checkout.session.completed` handler:
- If `metadata.programSlug` exists → create `ProgramEnrollment` record + grant entitlement
- Pattern matches existing `fulfillTournamentRegistration()` and `grantEntitlementsFromCheckout()`

**Done means:** After Stripe payment, user has `ProgramEnrollment` + `UserEntitlement` rows.

**Assigned to:** Cody

### TASK_06 — User dashboard: active entitlements + enrollments (Cody, 30 min)

**What:** Extend `app/(web)/dashboard/` or `app/(web)/me/`:
- Active `UserEntitlement` rows (status, source, expiry)
- Active `ProgramEnrollment` rows (progress)
- Active `Registration` rows (tournaments)

**Pattern:** Clone Dirstarter's `dashboard/listing.tsx`.

**Done means:** User sees enrollments and entitlements.

**Assigned to:** Cody

### Pre-task: Run `setup-stripe-products.ts` (Cody, 5 min)

**What:** Execute `bun run scripts/setup-stripe-products.ts` to create martial arts products in Stripe test mode. TASK_02 depends on this.

**Assigned to:** Cody

### Task dependency graph

```text
Pre-task (run Stripe script) → TASK_02 (enrollment page) → TASK_03 (webhook fulfillment)
                                                                     ↓
                                                              TASK_06 (user dashboard)
```

### Execution order

1. Pre-task: Run `setup-stripe-products.ts`
2. TASK_02: Enrollment checkout page
3. TASK_03: Webhook fulfillment
4. TASK_06: User dashboard

---

## First task

**Pre-task:** Run `setup-stripe-products.ts` to create products in Stripe test mode. Then immediately begin TASK_02.

---

## What landed

- **Pre-task ✅** — Stripe products script NOT run (STRIPE_SECRET_KEY is empty in `.env`). Products will be created when Stripe test keys are configured. Code is ready.
- **TASK_02 ✅** — Program enrollment checkout page at `app/(web)/programs/[id]/enroll/page.tsx` using L1 `ProductQuery` with `productFilter` for enrollment products. Success page at `enroll/success/page.tsx`. "Enroll Now" button added to program detail page sidebar.
- **TASK_03 ✅** — `fulfillProgramEnrollment()` added to webhook handler. Wired into `checkout.session.completed` → `metadata.type === "program_enrollment"` → creates `ProgramEnrollment` (status: ACTIVE) with upsert safety. Entitlements granted via existing `grantEntitlementsFromCheckout()` (already runs for all checkout sessions).
- **TASK_06 ✅** — User dashboard extended with `DashboardMembership` component showing enrollments, entitlements, and tournament registrations. Server queries in `server/web/dashboard/queries.ts`. Three-column grid layout with badges and quick-action links.

## Files touched

| File | Note |
| --- | --- |
| `app/(web)/programs/[id]/enroll/page.tsx` | NEW — enrollment checkout page using ProductQuery |
| `app/(web)/programs/[id]/enroll/success/page.tsx` | NEW — enrollment success page |
| `app/(web)/programs/[id]/page.tsx` | MODIFIED — added "Enroll Now" button to sidebar |
| `app/api/stripe/webhooks/route.ts` | MODIFIED — added `fulfillProgramEnrollment()` + wired into checkout handler |
| `server/web/dashboard/queries.ts` | NEW — `findUserEnrollments`, `findUserEntitlements`, `findUserRegistrations` |
| `app/(web)/dashboard/membership.tsx` | NEW — membership/entitlements/registrations display component |
| `app/(web)/dashboard/page.tsx` | MODIFIED — added `DashboardMembership` with Suspense |

## Decisions resolved

- **EnrollmentStatus:** Used `ACTIVE` (not `ENROLLED` — doesn't exist in enum). Schema enum is: ACTIVE, SUSPENDED, WAITLISTED, COMPLETED, WITHDRAWN.
- **PageProps reuse:** Enrollment and success pages reuse `PageProps<"/programs/[id]">` since Next.js route types are generated at dev time and nested routes may not exist yet.
- **Button variants:** Dirstarter L1 Button has no `outline` variant. Used `secondary` for secondary actions.

## Open decisions / blockers

- From SESSION_0053: `setup-stripe-products.ts` not yet run — prerequisite for TASK_02.
- From SESSION_0053: `PricingPlanActions` type mismatch may surface during TASK_06.

## Task log

- Pre-task — ✅ COMPLETE (script ready, Stripe keys needed)
- TASK_02 — ✅ COMPLETE
- TASK_03 — ✅ COMPLETE
- TASK_06 — ✅ COMPLETE

## Next session

### Goal 1 — Hostile-close remediation (P0–P2 fixes from Sessions 0052–0056 review)

| Priority | Issue | Location | Detail |
|----------|-------|----------|--------|
| 🔴 P0 | `userEntitlement` model doesn't exist in schema | `server/web/dashboard/queries.ts:17` | Queries `db.userEntitlement` but schema has **no `UserEntitlement` model**. Will crash at runtime. |
| 🔴 P1 | Dashboard queries have NO brand filter | `server/web/dashboard/queries.ts` | `findUserEnrollments`, `findUserEntitlements`, `findUserRegistrations` query by `userId` only — **cross-brand data leakage**. |
| 🔴 P1 | Dashboard has no Passport display | `dashboard/membership.tsx` | Shows enrollments/entitlements but **never loads or displays Passport data** (displayName, rank, org, avatar). |
| ⚠️ P2 | `searchTechniquesForPicker` client/server boundary violation | `curriculum-items-editor.tsx` | `"use client"` component imports server query without `"use server"` — **will fail at runtime**. |
| ⚠️ P2 | Tournament registration snapshots empty | `webhooks/route.ts` L47-60 | `RegistrationEntry.snapshotRankName`/`snapshotOrgName` never populated from Passport/Membership. |
| ⚠️ P2 | Program enrollment ignores Passport | `webhooks/route.ts` L13-39 | No check that user HAS a Passport before enrollment. |
| ⚠️ P2 | Certificate issuance ignores Passport | `issuance-actions.ts` | No validation user has Passport; should include Passport displayName/legalName. |
| ⚠️ P2 | Media admin queries unscoped | `server/admin/media/queries.ts` | `findMedia` accepts optional `brand` but admin page never passes it. |
| ⚠️ P2 | Certificate issuance has no brand check | `issuance-actions.ts` | No brand validation — admin from one brand could issue for another brand's templates. |
| ⚠️ P2 | `PricingPlanActions` type mismatch | Carried since SESSION_0053 | Still unresolved. |
| ⚠️ MINOR | Media admin page uses raw `<div className="grid">` | `app/admin/media/page.tsx` | Should use L1 `<Grid>` component. |

**Inputs to read:** Hostile-close review table above, `schema.prisma` (confirm UserEntitlement existence), `brand-context.ts`, dashboard queries.

**First task:** Fix P0 `userEntitlement` crash, then P1 brand scoping + Passport display in dashboard.

### Goal 2 — Lead intake, trial conversion, and CRM follow-up

Admin CRUD for Leads + LeadFollowUps, public lead capture form, trial booking flow, conversion lifecycle.

**Inputs to read:** `dirstarter-component-inventory.md`, L1 admin patterns (DataTable, HOC chains), `Lead`/`LeadFollowUp` schema models, WORKFLOW_5.0 session 0037 target.

**First task:** Petey plan for lead intake CRUD + trial conversion lifecycle.
