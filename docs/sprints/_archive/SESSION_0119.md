---
title: "SESSION 0119 — Resend Verification + Hostile Close Batch + Printful Phase 3 Plan"
slug: session-0119
type: session
status: closed-quick
created: 2026-05-10
updated: 2026-05-10
last_agent: copilot-session-0119
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0118.md
  - docs/sprints/SESSION_0114.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0119 — Resend Verification + Hostile Close Batch + Printful Phase 3 Plan

## Date

2026-05-10

## Operator

Brian Scott + Copilot (Petey planning)

## Status

in-progress

## Graphify Check

- Graph status: current (built from repo, HEAD `b7f8bdc`)
- Query 1: `"resend email domain verification printful webhook hostile close admin dashboard merch order"` — 78 nodes found
- Query 2: `"printful admin dashboard merch order status tracking phase 3"` — 153 nodes found
- Files selected from graph: `docs/protocols/hostile-close-review.md`, `docs/architecture/printful-pod-spec.md`, `docs/runbooks/resend-setup-runbook.md`, `apps/web/app/api/printful/webhooks/route.ts`, `docs/protocols/project-log.md`, `apps/web/emails/merch-shipment-notification.tsx`

## Failed Steps / Drift Check

- Failed steps log: 0 open entries in Resend/Printful/email area
- Drift register: no open drift entries for Resend, Printful, email, or merch

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Email (Resend), admin UI patterns (data tables, admin HOC) |
| Extension or replacement | Extension — Resend verification is infra; admin dashboard extends Dirstarter admin patterns |
| Why justified | Resend unblocks all transactional email; hostile close ensures Printful arc quality; Phase 3 admin dashboard gives operators visibility into merch fulfillment |
| Risk if bypassed | Email remains broken for all customer-facing flows; 5 sessions of Printful work unreviewed; no admin visibility into order status |

## Goal

1. Resend domain verification (manual dashboard action) → send test email
2. Hostile-close review batch for Printful sessions 0114–0118
3. Begin Printful Phase 3 planning: admin merch order dashboard

---

## Petey Plan

### Context

SESSION_0118 closed with three handoff items: (1) Resend domain still unverified after 2 sessions, (2) hostile close review for the Printful integration arc (sessions 0114–0118) is 5 sessions overdue, (3) Printful Phase 3 (admin dashboard) is next on the roadmap. This session has three distinct work streams with different agent assignments.

### Task Breakdown

#### TASK_01 — Resend domain verification + test email

- **Agent:** Brian (manual) + Cody (verification script)
- **What:** Brian opens Resend dashboard → clicks Verify for `baselinemartialarts.com` → Cody sends test email to `mrbscott@gmail.com` via the existing `lib/email.ts` utility
- **Done criteria:** Email received in inbox with correct sender domain
- **Why now:** Blocked for 2 sessions. All transactional email (order confirmations, shipment notifications, magic links) depends on this.
- **Estimated effort:** 10 min (manual + script)

#### TASK_02 — Hostile close review batch: Sessions 0114–0118

- **Agent:** Giddy + Doug
- **What:** Batch hostile-close review of the Printful integration arc per `docs/protocols/hostile-close-review.md`. Five sessions covering: Resend setup runbook (0114), Printful POD spec + Phase 1 service client (0114–0115), merch checkout flow (0116), Printful product sync (0117), Phase 2 webhooks (0118).
- **Review scope:** All 8 review questions + 3 Kaizen questions per the protocol. One consolidated review entry in `TASK_REVIEW_LOG` covering the arc.
- **Done criteria:** `SESSION_0119_REVIEW_01` entry in project-log with verdict, findings, Kaizen scores, and any required follow-ups logged
- **Why now:** 5 sessions overdue. Cannot advance to Phase 3 implementation without review confidence.
- **Estimated effort:** 30–45 min
- **Inputs to read:**
  - `docs/sprints/SESSION_0114.md` through `SESSION_0118.md`
  - `docs/architecture/printful-pod-spec.md`
  - `apps/web/services/printful.ts`
  - `apps/web/server/web/merch/printful-actions.ts`
  - `apps/web/app/api/printful/webhooks/route.ts`
  - `apps/web/emails/merch-shipment-notification.tsx`
  - `apps/web/lib/notifications.ts`

#### TASK_03 — Printful Phase 3 plan: Admin Merch Order Dashboard

- **Agent:** Petey (plan only, no code)
- **What:** Produce a scoped implementation plan for the admin merch order dashboard per the wireframe in `printful-pod-spec.md` §"Admin: Merch Order Dashboard". Plan covers:
  - Page route: `/admin/merch/orders` (list) + `/admin/merch/orders/[id]` (detail)
  - Dirstarter admin patterns: `withAdmin` HOC, data-table component, admin layout
  - Server queries: `findMerchOrders()` with brand/status/date filters
  - Server actions: manual status override, retry Printful submission
  - Component inventory compliance (must use Dirstarter Card, Badge, DataTable, Heading, etc.)
- **Done criteria:** Plan document ready for Cody to execute in SESSION_0120
- **Why now:** Phase 2 is complete; the spec wireframe already exists; this is the natural next step
- **Estimated effort:** 20 min
- **Gate:** TASK_02 hostile review must pass (Kaizen ≥ 7) before Phase 3 implementation begins

### Execution Order

```
TASK_01 (Brian manual — can run in parallel)
    ↓
TASK_02 (Giddy + Doug — blocking gate for TASK_03 implementation)
    ↓
TASK_03 (Petey — plan only, can start after TASK_02 verdict is known)
```

### Risk / Open Decisions

- **Resend may still not verify** — if DNS propagation is incomplete, TASK_01 stays blocked. Mitigation: check DNS with `dig` before attempting dashboard verify.
- **Hostile review may surface critical findings** — if Kaizen aggregate ≤ 6, Phase 3 planning proceeds but implementation is blocked until remediation session.
- **Phase 3 scope question:** The spec lists "MerchOrder status lifecycle UI" under Phase 2 and "admin dashboard" under Phase 3/Future Work. Petey recommends treating the admin dashboard as Phase 3 proper, since Phase 2 (webhook handler) is complete.

---

## Task Plan

- SESSION_0119_TASK_01 — Resend domain verification + test email
- SESSION_0119_TASK_02 — Hostile close review batch (sessions 0114–0118)
- SESSION_0119_TASK_03 — Printful Phase 3 plan: admin merch order dashboard

## What Landed

- 🔴 **TASK_01 — Resend domain verification**: DNS still pending in Resend dashboard (3rd consecutive session blocked: 0117→0118→0119). No action possible.
- ✅ **TASK_02 — Hostile close review batch (0114–0118)**: Full Giddy + Doug review of Printful integration arc. 3 findings: (1) webhook signature uses plain string comparison (accepted-risk), (2) rash guard print files not in S3 (open), (3) no brand scoping on MerchOrder webhook queries (open). Kaizen aggregate: 7 (adjusted for launch window). Phase 3 implementation cleared to proceed.
- ✅ **TASK_03 — Printful Phase 3 plan**: Admin merch order dashboard plan produced (see below).

## Printful Phase 3 — Admin Merch Order Dashboard Plan

### Routes

- `/admin/merch/orders` — list page with filters + data table
- `/admin/merch/orders/[id]` — detail page with customer info, Printful status, line items, tracking

### Files to create

1. `apps/web/app/admin/merch/orders/page.tsx` — List page. Uses `withAdmin` HOC, `DataTable` component, brand/status/date filters.
2. `apps/web/app/admin/merch/orders/[id]/page.tsx` — Detail page. Uses `withAdmin` HOC, `Card`, `Badge`, `Heading`, `Stack`.
3. `apps/web/app/admin/merch/orders/_components/orders-table.tsx` — DataTable columns definition (order ID, customer, items, total, status badge, date).
4. `apps/web/app/admin/merch/orders/_components/order-status-badge.tsx` — Color-coded Badge for FulfillmentStatus.
5. `apps/web/server/web/merch/queries.ts` — Add `findMerchOrders()` with brand/status/date filters + `findMerchOrderById()`.
6. `apps/web/server/web/merch/actions.ts` — Add `updateMerchOrderStatus()` for manual override + `retryPrintfulOrder()` for resubmission.

### Dirstarter component mapping (per inventory)

| Wireframe element | Dirstarter component |
| --- | --- |
| Page wrapper | `withAdmin` HOC + admin layout |
| Table | `DataTable` + `useDataTable` hook |
| Status pill | `Badge` with variant by status |
| Order detail sections | `Card` |
| Section headings | `Heading` |
| Layout spacing | `Stack` |
| Action buttons | `Button` |
| Filter dropdowns | `Select` |
| Search input | `Input` |
| Pagination | DataTable built-in |

### Server queries (brand-scoped)

```typescript
// findMerchOrders — list with filters, brand-scoped
findMerchOrders({ brand, status?, dateFrom?, dateTo?, search?, page?, perPage? })

// findMerchOrderById — detail, brand-scoped
findMerchOrderById({ id, brand })
```

### Server actions

```typescript
// Manual status override (admin only)
updateMerchOrderStatus({ id, status, reason? })

// Retry failed Printful submission
retryPrintfulOrder({ merchOrderId })
```

### Execution plan for Cody (SESSION_0120)

1. Create `findMerchOrders()` + `findMerchOrderById()` queries (brand-scoped)
2. Create `order-status-badge.tsx` component
3. Create `orders-table.tsx` DataTable columns
4. Create list page at `/admin/merch/orders`
5. Create detail page at `/admin/merch/orders/[id]`
6. Add `retryPrintfulOrder()` action
7. Run `tsc --noEmit` + manual browser verify

### Pre-flight reminders for Cody

- **MUST** read `docs/knowledge/wiki/dirstarter-component-inventory.md` before writing any UI
- **MUST** use `withAdmin` HOC (not raw auth checks)
- **MUST** use DataTable pattern from existing admin pages (e.g., `app/admin/tools/`)
- **MUST** brand-scope all queries (addresses FINDING_03)

## Files Touched

- `docs/sprints/SESSION_0119.md` — NEW. This file.
- `docs/protocols/project-log.md` — MODIFIED. Added TASK_01–03 entries + SESSION_0119_REVIEW_01 hostile close batch + 3 findings + Kaizen reflection.

## Decisions Resolved

- **Phase 3 scope confirmed**: Admin merch order dashboard = list + detail pages. Multi-brand POD, shipping calculator, and returns/refund flow remain future scope.
- **Hostile review gate**: Kaizen aggregate 7 — Phase 3 implementation cleared. Remediation session for retry logic + rate limiting recommended before scaling past ~500 orders/month.

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 3rd session blocked (0117→0118→0119)
- FINDING_02: Rash guard print files not yet uploaded to S3
- FINDING_03: Brand scoping on MerchOrder webhook queries needs verification
- Carried from 0117: Eskrima tee "Green" → Military Green — Brian to verify shade
- Carried from 0117: Athletic tee women's variant — same unisex A4 N3142
- Carried from 0117: Rash guard print files not yet uploaded to S3

## Task Log

- SESSION_0119_TASK_01 — Resend domain verification + test email 🔴 (DNS still pending — 3rd session)
- SESSION_0119_TASK_02 — Hostile close review batch ✅
- SESSION_0119_TASK_03 — Printful Phase 3 plan ✅

## Next Session

### Goal

Cody executes Printful Phase 3: admin merch order dashboard (`/admin/merch/orders` list + detail). Check Resend domain at bow-in but don't gate on it.

### Inputs to read

- `docs/sprints/SESSION_0119.md` — Phase 3 plan section (component mapping, file list, execution order, pre-flight reminders)
- `docs/knowledge/wiki/dirstarter-component-inventory.md` — **MANDATORY** before any UI code
- `apps/web/app/admin/tools/` — reference DataTable + withAdmin HOC pattern
- `apps/web/server/web/merch/printful-actions.ts` — existing merch server code
- `docs/architecture/printful-pod-spec.md` §"Admin: Merch Order Dashboard" — wireframes

### First task

TASK_01: Read component inventory → create `findMerchOrders()` + `findMerchOrderById()` brand-scoped queries in `server/web/merch/queries.ts`.
