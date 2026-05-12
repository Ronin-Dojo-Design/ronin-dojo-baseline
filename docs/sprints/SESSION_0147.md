---
title: "SESSION 0147 — Invite Admin CRUD + Claim Flow"
slug: session-0147
type: session--implement
status: closed-full
created: 2026-05-12
updated: 2026-05-12
last_agent: copilot-session-0147
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0146.md
  - docs/runbooks/sop-data-and-wiring-flows.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0147 — Invite Admin CRUD + Claim Flow

## Date

2026-05-12

## Operator

Brian Scott + Copilot (Petey → Cody)

## Goal

Build Invite admin CRUD (create/list/delete) and the public invite claim flow (visit link → auth check → claim → membership created). This was the deferred scope from SESSION_0146.

## Status

closed-full

## Failed Steps / Drift Check

- Carried blockers from 0146:
  - 🔴 Resend domain DNS pending verification — 35th session carried
  - 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
  - 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)
  - 🟡 ClassAttendance model needed before punch card runtime tracking
  - 🟡 Membership transition audit trail needed before launch
  - 🟡 oRPC vs adminActionClient L1 divergence — add to drift register

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin CRUD pattern (L1), auth session check (L1) |
| Extension or replacement | Extension — Invite/InviteClaim is L2 (not in Dirstarter) |
| Why justified | Invite→Claim→Membership is core org onboarding; schema exists, no CRUD yet |
| Risk if bypassed | Organizations have no way to invite members; manual membership creation only |

## Graphify Check

- Graph status: current (≤1 commit behind HEAD — JETTY sweep only)
- Query 1: `"Invite InviteClaim membership admin CRUD actions"` → found admin CRUD pattern files (roles, leads, tags), ADR 0012
- Query 2: `"Invite InviteClaim schema prisma model"` → found schema.prisma, s2-schema-additions.md §7.2 Invitations
- Files selected from graph: `server/admin/roles/` (pattern reference), `prisma/schema.prisma` (Invite + InviteClaim models)

---

## Petey Plan

### Goal

Deliver admin Invite CRUD (list, create, revoke, delete) and public invite claim endpoint, following the L1 admin CRUD pattern from `server/admin/roles/`.

### Tasks

#### TASK_01 — Server layer: `server/admin/invites/` (schema + actions + queries)
- **Agent:** Cody
- **What:** Create `schema.ts` (Zod schema + table params), `actions.ts` (createInvite, revokeInvite, deleteInvites), `queries.ts` (findInvites with org/status filters, findInviteByCode)
- **Steps:**
  1. Create `server/admin/invites/schema.ts` — Zod schema for invite creation (organizationId, type, maxUses, expiresAt), table search params
  2. Create `server/admin/invites/actions.ts` — `createInvite`, `revokeInvite`, `deleteInvites` using `adminActionClient`
  3. Create `server/admin/invites/queries.ts` — `findInvites` (paginated, filterable by org/status/type), `findInviteById`, `findInviteByCode`
- **Done means:** All three files compile, follow roles pattern
- **Depends on:** nothing

#### TASK_02 — Admin pages: `app/admin/invites/`
- **Agent:** Cody
- **What:** List page with data table, create page with form, detail page with claims list
- **Steps:**
  1. Create `app/admin/invites/page.tsx` — list page with invites table
  2. Create `app/admin/invites/_components/invites-table.tsx` — data table
  3. Create `app/admin/invites/_components/invites-table-columns.tsx` — columns (code, org, type, status, uses, expires, actions)
  4. Create `app/admin/invites/_components/invite-form.tsx` — create/edit form
  5. Create `app/admin/invites/_components/invite-actions.tsx` — row actions (copy link, revoke, delete)
  6. Create `app/admin/invites/new/page.tsx` — new invite page
  7. Create `app/admin/invites/[id]/page.tsx` — detail page showing invite + claims list
- **Done means:** Admin can list, create, revoke, and delete invites. Claims visible on detail page.
- **Depends on:** TASK_01

#### TASK_03 — Public claim flow: `app/(web)/invite/[code]/page.tsx`
- **Agent:** Cody
- **What:** Public page that validates invite code, checks auth, creates InviteClaim + Membership
- **Steps:**
  1. Create `server/invites/queries.ts` — public `findValidInviteByCode` (checks expiry, maxUses, status)
  2. Create `server/invites/actions.ts` — `claimInvite` action (auth required, creates InviteClaim + Membership)
  3. Create `app/(web)/invite/[code]/page.tsx` — shows invite details, claim button, handles auth redirect
- **Done means:** Visiting `/invite/{code}` while authenticated claims the invite and creates a membership
- **Depends on:** TASK_01

#### TASK_04 — Admin nav link + type check
- **Agent:** Cody
- **What:** Add Invites to admin sidebar nav, run full type check
- **Steps:**
  1. Add invite link to admin navigation config
  2. Run `bun tsc --noEmit` — zero errors
- **Done means:** Zero TS errors, invite link visible in admin nav
- **Depends on:** TASK_02

### Parallelism

TASK_01 first (sequential). TASK_02 and TASK_03 can be parallelized after TASK_01 (disjoint file sets: admin vs public). TASK_04 last.

### Agent Assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Clear execution — follow roles pattern |
| TASK_02 | Cody | Clear execution — follow roles admin page pattern |
| TASK_03 | Cody | Clear execution — auth + claim logic |
| TASK_04 | Cody | Wiring + verification |

---

## Pre-flight: Backend — Invite Admin CRUD + Claim Flow

### 1. Auth predicates planned

- [x] Session auth required (admin actions via `adminActionClient`)
- [x] Org membership verified (N/A — admin-only CRUD; claim flow uses session user)
- [x] Brand column filtered (ADR 0004) — `brand` set from `ctx.brand` on create
- Authorization approach: Admin actions use `adminActionClient` chain. Public claim uses `authActionClient` (session required, not admin).

### 2. Existing action scan

- Searched `server/admin/` for: roles (pattern reference), memberships (claim creates one)
- Related existing actions: `server/admin/roles/actions.ts` (upsert/delete pattern), `server/admin/memberships/actions.ts` (membership creation)
- L1 pattern match: dirstarter `adminActionClient` chain

### 3. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md` — flow: §14 Invite → Claim → Membership activation
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md` — lifecycle stage: §8b Invite lifecycle

### 4. Schema spot-check (from schema.prisma directly)

- `InviteStatus` enum: `PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`
- `InviteType` enum: `ORGANIZATION`, `PROGRAM`, `TOURNAMENT`, `EVENT`
- `Invite` fields: `id`, `brand` (Brand), `type` (InviteType), `code` (String @unique @default(cuid())), `status` (InviteStatus @default(PENDING)), `maxUses` (Int?), `currentUses` (Int @default(0)), `expiresAt` (DateTime?), `meta` (Json?), `organizationId`, `createdById`, `claims` (InviteClaim[])
- `InviteClaim` fields: `id`, `claimedAt` (DateTime @default(now())), `inviteId`, `userId`, `@@unique([inviteId, userId])`
- `Membership` requires: `brand`, `userId`, `organizationId`, `disciplineId` (required!), `status` (@default PENDING)

### 5. Design decision: disciplineId on claim

Membership requires `disciplineId` but Invite has no discipline field. Resolution: invite `meta` JSON can optionally carry `disciplineId`. If not present, the claim page must show a discipline picker for the org's available disciplines. This is a TASK_03 UX concern, not a TASK_01 blocker.

### 6. FAILED_STEPS check

- Prior failures in this area: none
- Manual Boundary Registry entries: none

---

## Task Log

- SESSION_0147_TASK_01 — ✅ done. Created `server/admin/invites/` module: schema.ts (Zod + nuqs table params with `parseAsArrayOf` enum filters for status/type, org filter), actions.ts (createInvite, revokeInvite, deleteInvites via adminActionClient), queries.ts (findInvites paginated, findInviteById with claims, findInviteByCode with org disciplines).
- SESSION_0147_TASK_02 — ✅ done. Created admin pages: `app/admin/invites/page.tsx` (list with Suspense), `invites-table.tsx` (DataTableFacetedFilter for status + type), `invites-table-columns.tsx` (code, org, type, status badge, uses, expires, row actions with copy/revoke/delete), `invite-form.tsx` (ComboboxSelector for org, Select for type, maxUses, expiresAt), `new/page.tsx`, `[id]/page.tsx` (detail with claims list).
- SESSION_0147_TASK_03 — ✅ done. Created public claim flow: `server/invites/queries.ts` (findValidInviteByCode with expiry/maxUses/status validation), `server/invites/actions.ts` (claimInvite via userActionClient — transaction: validate invite → check duplicate claim → check existing membership → create InviteClaim → increment currentUses → create Membership with ACTIVE status), `app/(web)/invite/[code]/page.tsx` (auth gate → redirect to login with callbackUrl), `claim-form.tsx` (discipline picker via ComboboxSelector, claim button).
- SESSION_0147_TASK_04 — ✅ done. Added Invites link (MailIcon) to admin sidebar nav. Zero TS errors on `bunx tsc --noEmit`.
- SESSION_0147_TASK_05 — ✅ done. Expanded JETTY annotation standard from schema-only to all file types (TSDoc headers on new server modules, pages, components). Added annotations to all 6 new TS files.
- SESSION_0147_TASK_06 — ✅ done. Restored `database.md` and `prisma-workflow.md` from `_archive/` to `runbooks/`. Updated frontmatter.

## What Landed

- **Invite admin CRUD** — full server layer (schema + actions + queries) + admin pages (list with faceted filters, create form with ComboboxSelector org picker, detail page with claims list)
- **Public invite claim flow** — auth-gated claim page with discipline picker, transactional claim action (InviteClaim + Membership created atomically)
- **Admin sidebar** — Invites link added with MailIcon
- **JETTY annotation standard expanded** — now covers Prisma schema + TypeScript files + closing ritual integration
- **Archive restoration** — `database.md` and `prisma-workflow.md` restored to `docs/runbooks/`
- **Zero TS errors** across entire codebase

## Files Touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0147.md` | New — this session file |
| `apps/web/server/admin/invites/schema.ts` | New — Zod schema + nuqs table params |
| `apps/web/server/admin/invites/actions.ts` | New — createInvite, revokeInvite, deleteInvites |
| `apps/web/server/admin/invites/queries.ts` | New — findInvites, findInviteById, findInviteByCode |
| `apps/web/app/admin/invites/page.tsx` | New — list page |
| `apps/web/app/admin/invites/_components/invites-table.tsx` | New — data table with faceted filters |
| `apps/web/app/admin/invites/_components/invites-table-columns.tsx` | New — columns + row actions |
| `apps/web/app/admin/invites/_components/invite-form.tsx` | New — create form with ComboboxSelector |
| `apps/web/app/admin/invites/new/page.tsx` | New — new invite page |
| `apps/web/app/admin/invites/[id]/page.tsx` | New — detail page with claims |
| `apps/web/server/invites/queries.ts` | New — public findValidInviteByCode |
| `apps/web/server/invites/actions.ts` | New — public claimInvite action |
| `apps/web/app/(web)/invite/[code]/page.tsx` | New — public claim page |
| `apps/web/app/(web)/invite/[code]/claim-form.tsx` | New — claim form component |
| `apps/web/components/admin/sidebar.tsx` | Modified — added Invites nav link |
| `docs/protocols/jetty-annotation-standard.md` | Modified — expanded to cover all file types |
| `docs/runbooks/database.md` | Moved from `_archive/` — restored to active |
| `docs/runbooks/prisma-workflow.md` | Moved from `_archive/` — restored to active |

## Decisions Resolved

- ComboboxSelector used for org picker in invite form (not RelationSelector — no AI suggestions needed)
- DataTableFacetedFilter used for status/type table toolbar filters (L1 leads pattern, `parseAsArrayOf`)
- Invite claim creates Membership with ACTIVE status (not PENDING) — invited members are pre-approved
- Discipline required at claim time (not stored on Invite) — claim page shows org's discipline picker
- JETTY annotation standard expanded to TypeScript files — `@added`, `@why`, `@wired` JSDoc headers
- `database.md` and `prisma-workflow.md` are active runbooks, not archive material

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 35th session carried
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
- 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)
- 🟡 ClassAttendance model needed before punch card runtime tracking
- 🟡 Membership transition audit trail needed before launch
- 🟡 oRPC vs adminActionClient L1 divergence — add to drift register

## Reflections

- The `parseAsArrayOf(parseAsStringEnum<EnumType>(...))` pattern from the leads module is the correct L1 pattern for enum table filters. Using plain `parseAsString` was wrong — graphify + cross-referencing the SOP caught it.
- Graphify is significantly better than grep for navigating admin CRUD patterns. The query `"Invite InviteClaim schema prisma model"` immediately surfaced the s2-schema-additions doc and schema.prisma as start nodes.
- The invite claim flow revealed a design tension: Invite doesn't carry `disciplineId`, but Membership requires it. Solved by showing a discipline picker at claim time. This is the right UX — the invited person chooses their discipline, not the admin.
- JETTY annotation standard expansion was overdue. Code files have been getting `@added` annotations ad hoc; formalizing it into the protocol and closing ritual makes it systematic.

## ADR / Ubiquitous Language Check

- No new ADR needed — Invite/InviteClaim models already exist in schema per s2-schema-additions.md §7.2.
- No new domain terms — "Invite", "InviteClaim", "claim flow" are already in the ubiquitous language.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `jetty-annotation-standard.md` updated (2026-05-12), `database.md` updated (2026-05-12), `prisma-workflow.md` updated (2026-05-12). All 6 new TS files have JETTY `@added/@why/@wired` headers. |
| Backlinks/index sweep | SESSION_0147 added to wiki index. `database.md` and `prisma-workflow.md` links fixed (archive→runbooks). SESSION_0146 status updated to closed-full. |
| Wiki lint | `bun run wiki:lint` — ✅ 0 errors, 0 warnings (298 files scanned) |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | Not applicable — implementation session, no schema changes. Previous hostile review (SESSION_0146) covers 0140–0145. |
| Review & Recommend | Next session goal written: yes — SESSION_0148 Membership admin list page UI |
| Memory sweep | JETTY annotation standard expanded to code files — protocol update is the memory artifact |
| Next session unblock check | Unblocked — no user input required for membership admin list page |
| Git hygiene | Pending — commit after evidence artifact |
| Graphify update | Pending — run after git commit |

## Next Session

- **Goal:** SESSION_0148 — Membership admin list page UI + invite email notification (Resend template)
- **Inputs to read:** SESSION_0147 (this session), SESSION_0145 (membership transitions)
- **First task:** Create `app/admin/memberships/page.tsx` with data table (status filter, org filter, discipline filter)

