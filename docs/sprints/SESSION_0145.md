---
title: "SESSION 0145 — PricingPlan Form UI + Membership Lifecycle Transitions"
slug: session-0145
type: session--implement
status: closed-quick
created: 2026-05-12
updated: 2026-05-12
last_agent: copilot-session-0145
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0144.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0145 — PricingPlan Form UI + Membership Lifecycle Transitions

## Date

2026-05-12

## Operator

Brian Scott + Copilot (Petey → Cody)

## Goal

Add punchCardSize/bonusSessions/isPrivateLesson fields to the PricingPlan admin form UI, then begin membership status transition server actions and invite flow (deferred scope from SESSION_0144).

## Status

closed-quick

## Failed Steps / Drift Check

- Carried blockers:
  - 🔴 Resend domain DNS pending verification — 33rd session carried
  - 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
  - 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Yes — admin form patterns (L1), Prisma schema actions (L1) |
| Extension or replacement | Extension — new form fields for existing PricingPlan CRUD; new membership transition actions |
| Why justified | Punch card/private lesson pricing fields exist in schema but have no form UI; membership lifecycle transitions needed before invite flow |
| Risk if bypassed | Admins can't configure punch card or private lesson pricing; no membership state machine |

---

## Petey Plan

### Graphify check

- Graph status: current (≤1 commit behind, updated end of SESSION_0144 — skip update)
- Queries used:
  - `graphify query "PricingPlan form pricing-plan-form punch card private lesson bonus sessions" --budget 2000`
  - `graphify query "Entitlement Role SubscriptionTier membership transition invite claim lifecycle" --budget 2000`
  - `graphify explain "Membership"`
- Files selected from graph: `pricing-plan-form.tsx`, `pricing-plans/schema.ts`, `pricing-plans/actions.ts`, `schema.prisma` (Membership, Invite, InviteClaim, Entitlement, Role, SubscriptionTier)

### What exists today (schema audit)

| Area | Current state | Gap |
| --- | --- | --- |
| **PricingPlan form** | Schema + Zod have `punchCardSize`, `bonusSessions`, `isPrivateLesson` — form UI has **no fields** | 3 missing form fields + conditional visibility |
| **PricingModel options** | Form's `pricingModelOptions` array missing `PUNCH_CARD` + `PRIVATE_LESSON` | 2 missing options |
| **PricingPlan action** | `upsertPricingPlan` does NOT persist punch card/private lesson fields | 3 fields not in create/update data |
| **PricingPlan defaultValues** | Missing `punchCardSize`, `bonusSessions`, `isPrivateLesson` | Won't hydrate on edit |
| **Entitlements CRUD** | ✅ Full admin CRUD exists | — |
| **Roles CRUD** | ❌ No admin server module or pages | Need full CRUD |
| **SubscriptionTiers CRUD** | ✅ Full admin CRUD exists | — |
| **Memberships CRUD** | ❌ No admin server module or pages | Need status transition actions |
| **Invites CRUD** | ❌ No admin server module or pages | Deferred to SESSION_0146 |

### Dirstarter implementation template

- **Docs read first:** Component inventory (`dirstarter-component-inventory.md`) — confirmed all form fields use L1 components (Input, Select, Switch, FormField, Stack, H3)
- **Baseline pattern to extend:** Existing admin CRUD pattern (age-groups, skill-levels, entitlements) — actions.ts + queries.ts + schema.ts + page.tsx + form + table + columns
- **Custom delta:** Punch card/private lesson conditional form fields; membership state machine transitions; Role CRUD
- **No-bypass proof:** Using existing L1 form/table/layout components throughout. No raw HTML.

### Tasks

#### SESSION_0145_TASK_01 — PricingPlan form: punch card + private lesson fields

- **Agent:** Cody
- **What:** Add PUNCH_CARD/PRIVATE_LESSON to `pricingModelOptions`, add `punchCardSize`/`bonusSessions`/`isPrivateLesson` form fields with conditional visibility, update `defaultValues`, update `upsertPricingPlan` action to persist the 3 new fields
- **Steps:**
  1. Add PUNCH_CARD + PRIVATE_LESSON to `pricingModelOptions` array
  2. Add `punchCardSize`, `bonusSessions`, `isPrivateLesson` to form `defaultValues`
  3. Add conditional form fields: show punch card fields when model is PUNCH_CARD, show isPrivateLesson toggle when PRIVATE_LESSON
  4. Update `upsertPricingPlan` action to include the 3 fields in create/update data
  5. Type-check
- **Done means:** Form renders new fields conditionally, action persists them, zero TS errors
- **Depends on:** nothing

#### SESSION_0145_TASK_02 — Admin CRUD for Roles (list + create/edit)

- **Agent:** Cody
- **What:** Create server module (actions.ts, queries.ts, schema.ts) + admin pages (list, new, edit) + form + table for Role model. Follow AgeGroup/SkillLevel pattern exactly.
- **Steps:**
  1. Create `server/admin/roles/schema.ts` — Zod schema + table params
  2. Create `server/admin/roles/queries.ts` — find, findList, findById
  3. Create `server/admin/roles/actions.ts` — upsert + delete
  4. Create `app/admin/roles/page.tsx` — list page
  5. Create `app/admin/roles/new/page.tsx` — create page
  6. Create `app/admin/roles/[id]/page.tsx` — edit page
  7. Create `app/admin/roles/_components/role-form.tsx`
  8. Create `app/admin/roles/_components/roles-table.tsx` + columns
  9. Type-check
- **Done means:** Admin can list/create/edit/delete Roles, zero TS errors
- **Depends on:** nothing

#### SESSION_0145_TASK_03 — Membership status transition server actions

- **Agent:** Cody
- **What:** Create `server/admin/memberships/actions.ts` with transition actions: activate, suspend, cancel, expire. Enforce valid state machine transitions. Create queries.ts + schema.ts for future admin list page.
- **Steps:**
  1. Create `server/admin/memberships/schema.ts` — Zod schemas for transitions + table params
  2. Create `server/admin/memberships/queries.ts` — findList, findById with includes (user, org, discipline, roleAssignments)
  3. Create `server/admin/memberships/actions.ts` — `transitionMembershipStatus` action with valid state machine:
     - INVITED → PENDING, CANCELLED
     - PENDING → ACTIVE, CANCELLED
     - ACTIVE → SUSPENDED, CANCELLED, EXPIRED
     - SUSPENDED → ACTIVE, CANCELLED
     - CANCELLED → (terminal)
     - EXPIRED → (terminal)
  4. Type-check
- **Done means:** Transition actions enforce valid state machine, queries return membership with relations, zero TS errors
- **Depends on:** nothing

### Parallelism

TASK_01 is independent (PricingPlan files). TASK_02 is independent (new Role files). TASK_03 is independent (new Membership files). All three can run sequentially on main — no file overlap.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Clear execution — edit existing files, no decisions |
| TASK_02 | Cody | Pattern replication from AgeGroup/SkillLevel |
| TASK_03 | Cody | New module, state machine design resolved in plan |

### Open decisions

- None — all three tasks are fully specified.

### Risks

- Membership admin list page deferred (actions + queries only this session)
- Invite CRUD deferred to SESSION_0146

### Scope guard

If additional work surfaces (e.g., membership list page UI, invite flow), note in SESSION file — do NOT expand scope.

## Task Log

- SESSION_0145_TASK_01 — ✅ done. PricingPlan form: added PUNCH_CARD + PRIVATE_LESSON to pricingModelOptions, added punchCardSize/bonusSessions/isPrivateLesson defaultValues, added conditional form fields (punch card fields visible when PUNCH_CARD, isPrivateLesson toggle when PRIVATE_LESSON), updated upsertPricingPlan action to persist all 3 fields. Zero TS errors.
- SESSION_0145_TASK_02 — ✅ done. Admin CRUD for Roles: server module (schema.ts, queries.ts, actions.ts) + admin pages (list, new, edit) + form + DataTable with columns (name, code, display title, assignments count, system badge). Follows AgeGroup/SkillLevel pattern exactly. Zero TS errors.
- SESSION_0145_TASK_03 — ✅ done. Membership status transition server actions: schema with VALID_TRANSITIONS state machine, queries with full relation includes (user, org, discipline, roleAssignments, rank), transitionMembershipStatus action enforcing valid transitions with auto-timestamping (joinedAt on ACTIVE, leftAt on CANCELLED/EXPIRED). Zero TS errors.

## What Landed

- **PricingPlan form upgrade** — PUNCH_CARD + PRIVATE_LESSON pricing model options, conditional punchCardSize/bonusSessions fields, isPrivateLesson toggle, action persists all 3 new fields
- **Admin CRUD: Roles** — list page with DataTable, new/edit forms, server actions + queries + schema (code, name, displayTitle, description, system badge, assignments count)
- **Membership status transition actions** — `transitionMembershipStatus` with enforced state machine (INVITED→PENDING→ACTIVE→SUSPENDED→CANCELLED/EXPIRED), `findMemberships` + `findMembershipById` with full relation includes
- **Zero TS errors** across entire codebase

## Files Touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0145.md` | New — this session file |
| `apps/web/app/admin/pricing-plans/_components/pricing-plan-form.tsx` | Modified — added PUNCH_CARD/PRIVATE_LESSON options, conditional fields, defaultValues |
| `apps/web/server/admin/pricing-plans/actions.ts` | Modified — persists punchCardSize, bonusSessions, isPrivateLesson |
| `apps/web/server/admin/roles/schema.ts` | New — Zod schema + table params |
| `apps/web/server/admin/roles/queries.ts` | New — find, findList, findById |
| `apps/web/server/admin/roles/actions.ts` | New — upsert + delete actions |
| `apps/web/app/admin/roles/page.tsx` | New — list page |
| `apps/web/app/admin/roles/new/page.tsx` | New — create page |
| `apps/web/app/admin/roles/[id]/page.tsx` | New — edit page |
| `apps/web/app/admin/roles/_components/role-form.tsx` | New — form component |
| `apps/web/app/admin/roles/_components/roles-table.tsx` | New — DataTable component |
| `apps/web/app/admin/roles/_components/roles-table-columns.tsx` | New — column definitions |
| `apps/web/server/admin/memberships/schema.ts` | New — Zod schemas + VALID_TRANSITIONS state machine |
| `apps/web/server/admin/memberships/queries.ts` | New — findMemberships, findMembershipById with relation includes |
| `apps/web/server/admin/memberships/actions.ts` | New — transitionMembershipStatus + deleteMemberships |

## Decisions Resolved

- Membership state machine transitions defined and enforced (INVITED→PENDING/CANCELLED, PENDING→ACTIVE/CANCELLED, ACTIVE→SUSPENDED/CANCELLED/EXPIRED, SUSPENDED→ACTIVE/CANCELLED, CANCELLED/EXPIRED terminal)
- Role prop naming: used `roleData` to avoid HTML `role` attribute conflict in form component
- Invite CRUD deferred to SESSION_0146 (scope guard)

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 33rd session carried
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
- 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)

## Next Session

- **Goal:** SESSION_0146 — Invite CRUD (create/list/claim flow) + Membership admin list page UI
- **Inputs to read:** SESSION_0145
- **First task:** Create `server/admin/invites/` module (schema, queries, actions) for Invite + InviteClaim management, then build admin list + create pages
