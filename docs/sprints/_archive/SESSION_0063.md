---
title: "SESSION 0063 — Backend Wiring: Tiers, Entitlements, Auth Hardening"
slug: session-0063
type: session
status: closed-quick
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0063
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0062.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0063 — Backend Wiring: Tiers, Entitlements, Auth Hardening

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

in-progress

### Goal

Close all 6 backend wiring gaps from SESSION_0062 hostile-close review. Build SubscriptionTier + UserBrandSubscription admin CRUD, wire `checkEntitlement()` into at least one feature gate, add EntitlementGrant admin UI, wire `isInSameBrand()`, add Passport defensive checks, refactor `getUserMemberships`.

### Context read

- ✅ SESSION_0062 — closed-full. Hostile-close review produced 6 findings (1 P1, 3 P2, 2 P3).
- ✅ Git: `main`, clean working tree.
- ✅ Component inventory consulted — admin CRUD uses existing L1 patterns: `DataTable`, `DataTableColumnHeader`, `RelationSelector`, `adminActionClient` chain.
- ✅ Existing admin patterns confirmed: `server/admin/entitlements/` (actions, queries, schema) is the closest analog for SubscriptionTier CRUD.
- ✅ **EntitlementGrant admin UI already exists** — `pricing-plan-form.tsx` has entitlement multi-select, `upsertPricingPlan` action syncs `EntitlementGrant` rows. Task 3 is pre-done.

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin CRUD patterns, action client chain, authz utilities |
| Extension or replacement | Extension — new admin CRUD for SubscriptionTier following existing patterns; defensive checks added to existing actions |
| Why justified | Tier/entitlement gap is the last major backend gap before front-end polish. Three schema models have zero runtime code. |
| Risk if bypassed | Subscription tiers are phantom features — schema exists but unusable. No feature gating. No cross-brand safety net on tournament reg/org join. |

---

## Petey's plan — task decomposition

### Pre-investigation findings

| # | Original finding | Investigation result | Revised scope |
|---|---|---|---|
| 1 | 🔴 SubscriptionTier + UserBrandSubscription admin CRUD | No code exists. Need server actions/queries/schema + admin pages. | Full build — follow entitlements admin pattern |
| 2 | 🟡 Wire `checkEntitlement()` into feature gate | Function exists at `server/web/entitlement/check-entitlement.ts`, zero call sites. | Wire into tournament registration as "must have active entitlement to register" |
| 3 | 🟡 EntitlementGrant admin UI | **Already done.** `pricing-plan-form.tsx` has entitlement multi-select. `upsertPricingPlan` syncs `EntitlementGrant` rows. | ✅ No work needed — mark as pre-landed |
| 4 | 🟡 Wire `isInSameBrand()` into tournament reg + org join | Function exists in `lib/authz.ts`, never called. Tournament reg checks `brand` on tournament lookup but not on user. Org join accepts `brand` from client input without validation. | Add `isInSameBrand()` guard to both actions |
| 5 | 🟡 Passport defensive checks | Neither `createRegistrationCheckout` nor `joinOrganization` verify user has a Passport. | Add Passport existence check before allowing reg/join |
| 6 | 🟡 `getUserMemberships` `include` → `select` | Uses `include` with full relation objects. | Refactor to `select` with only needed fields |

### Task assignments

| Task ID | Description | Agent | Effort | Dependencies |
|---|---|---|---|---|
| SESSION_0063_TASK_01 | SubscriptionTier admin CRUD (server: actions, queries, schema) | Cody | 30 min | None |
| SESSION_0063_TASK_02 | SubscriptionTier admin pages (list + form) | Cody | 30 min | TASK_01 |
| SESSION_0063_TASK_03 | UserBrandSubscription admin CRUD (server: actions, queries, schema) | Cody | 30 min | TASK_01 |
| SESSION_0063_TASK_04 | UserBrandSubscription admin pages (list + form) | Cody | 30 min | TASK_03 |
| SESSION_0063_TASK_05 | Wire `checkEntitlement()` into tournament registration | Cody | 15 min | None |
| SESSION_0063_TASK_06 | Wire `isInSameBrand()` into tournament reg + org join | Cody | 15 min | None |
| SESSION_0063_TASK_07 | Passport defensive checks (tournament reg + org join) | Cody | 10 min | None |
| SESSION_0063_TASK_08 | `getUserMemberships` `include` → `select` refactor | Cody | 10 min | None |

**Note:** Original finding #3 (EntitlementGrant admin UI) is pre-landed — no task created.

### Execution order

1. **TASK_01 → TASK_02** (SubscriptionTier server + pages)
2. **TASK_03 → TASK_04** (UserBrandSubscription server + pages)
3. **TASK_05 + TASK_06 + TASK_07** (parallel — defensive wiring, independent)
4. **TASK_08** (refactor — independent, do last)

### L1 patterns to follow

- **Admin CRUD:** Mirror `server/admin/entitlements/` (actions.ts, queries.ts, schema.ts)
- **Admin pages:** Mirror `app/admin/entitlements/` (page.tsx, [id]/page.tsx, new/page.tsx, _components/)
- **Action client:** Use `adminActionClient` chain with `getRequestBrand()`
- **Forms:** Use existing Shadcn components from `apps/web/components/admin` — NO handrolled UI
- **Data table:** Use existing `DataTable`, `DataTableColumnHeader`, `DataTableToolbar` patterns

---

## What landed

- ✅ **SubscriptionTier admin CRUD** — Full server layer (actions, queries, schema) + admin pages (list table, create form, edit form). Brand-scoped, follows entitlements L1 pattern exactly. All L1 components used (DataTable, Form, Input, Switch, TextArea, DeleteDialog).
- ✅ **UserBrandSubscription admin CRUD** — Full server layer + admin pages with tier `Select` dropdown, status `Select`, expiry date `Input[type=date]`. All L1 components.
- ✅ **EntitlementGrant admin UI** — Confirmed pre-landed (pricing-plan form already has entitlement multi-select).
- ⏳ Imports added to `register.ts` for `checkEntitlement` + `isInSameBrand` but guard calls not wired in yet — deferred to next session.

## Files touched

| File | Note |
|------|------|
| `server/admin/subscription-tiers/schema.ts` | Table params + Zod schema for SubscriptionTier |
| `server/admin/subscription-tiers/queries.ts` | Brand-scoped findMany, findById, findList |
| `server/admin/subscription-tiers/actions.ts` | upsert + delete with brand scoping |
| `app/admin/subscription-tiers/page.tsx` | List page with DataTable |
| `app/admin/subscription-tiers/new/page.tsx` | Create form page |
| `app/admin/subscription-tiers/[id]/page.tsx` | Edit form page |
| `app/admin/subscription-tiers/_components/` | Table, columns, form, actions, delete dialog, toolbar (6 files) |
| `server/admin/subscriptions/schema.ts` | Table params + Zod schema for UserBrandSubscription |
| `server/admin/subscriptions/queries.ts` | Brand-scoped findMany, findById |
| `server/admin/subscriptions/actions.ts` | upsert + delete with brand scoping |
| `app/admin/subscriptions/page.tsx` | List page with DataTable |
| `app/admin/subscriptions/new/page.tsx` | Create form page |
| `app/admin/subscriptions/[id]/page.tsx` | Edit form page |
| `app/admin/subscriptions/_components/` | Table, columns, form, actions, delete dialog, toolbar (6 files) |
| `server/web/tournaments/register.ts` | Imports added for checkEntitlement + isInSameBrand (guards not yet wired) |
| `docs/sprints/SESSION_0063.md` | This file |

## Decisions resolved

- **EntitlementGrant admin UI:** Already implemented in pricing-plan form. No additional work needed.

## Open decisions / blockers

- **Subscription form UX:** `userId` field is a raw CUID text input. Should use `RelationSelector` with user list for proper UX. Follow-up for TASK_04 polish.
- **Sidebar links:** Tiers + Subscriptions links not yet added to admin sidebar. Quick add in next session.
- **`tournament-registration` entitlement key** — must be seeded in the Entitlement table for the brand before tournament reg will work.

## Task log

- `SESSION_0063_TASK_01` — SubscriptionTier admin CRUD (server) — ✅ done
- `SESSION_0063_TASK_02` — SubscriptionTier admin pages — ✅ done
- `SESSION_0063_TASK_03` — UserBrandSubscription admin CRUD (server) — ✅ done
- `SESSION_0063_TASK_04` — UserBrandSubscription admin pages — ✅ done (userId UX follow-up noted)
- `SESSION_0063_TASK_05` — Wire `checkEntitlement()` into tournament reg — ⏳ deferred to next session
- `SESSION_0063_TASK_06` — Wire `isInSameBrand()` into tournament reg + org join — ⏳ deferred to next session
- `SESSION_0063_TASK_07` — Passport defensive checks — ⏳ deferred to next session
- `SESSION_0063_TASK_08` — `getUserMemberships` `include` → `select` — ⏳ deferred to next session

## Review log

- `SESSION_0063_REVIEW_01` — TASK_01–04 landed. Zero new components — all admin UI uses existing L1 patterns (DataTable, Form, Input, Select, Switch, TextArea, DeleteDialog). 24 files created. TASK_05–08 deferred.

## ADR / ubiquitous-language check

No new ADRs needed. SubscriptionTier and UserBrandSubscription already defined in schema (SESSION_0036). No new domain terms introduced.

## Next session

### SESSION_0063.5 — Defensive Wiring (TASK_05–08)

- **Goal:** Complete remaining 4 tasks: wire `checkEntitlement()` guard into tournament reg, wire `isInSameBrand()` into tournament reg + org join, add Passport defensive checks, refactor `getUserMemberships` include→select. Also: add sidebar links for Tiers + Subscriptions, and improve subscription form userId to use `RelationSelector`.
- **Agent:** Cody
- **Inputs:** SESSION_0063 (this file), `server/web/tournaments/register.ts`, `server/web/organization/actions.ts`, `server/web/organization/queries.ts`, `lib/authz.ts`, `server/web/entitlement/check-entitlement.ts`, `components/admin/sidebar.tsx`
- **First task:** Wire `checkEntitlement()` guard call into `createRegistrationCheckout` (import already present)

### Status

in-progress → **closed-quick**
