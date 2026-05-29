---
title: "Petey Plan 0296 — Org-scoped member management (roster + approval queue)"
slug: petey-plan-0296
type: plan
status: in-progress
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0296
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0296.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0296

## Goal

Add an **org-scoped member management** section under org settings: a roster of the
organization's members plus an **approval queue** for PENDING join requests
(approve → ACTIVE, reject → CANCELLED). Gated by `hasOrgAdminAccess` (owner + ORG_ADMIN).
This is slice 1 of a 2-session lane; role-assignment UI, invites, and general-info editing
are deferred to the next session.

## Context (bow-in findings)

- Platform admin `/admin/memberships` already has the proven transition logic
  (optimistic lock + audit + email notify) and role assign/remove — but it's gated by
  `adminActionClient` (platform admin) and spans all orgs. Not reusable as-is for org admins.
- The self-service org-scoped action pattern is established in `theme-actions.ts`:
  `userActionClient` + `assertOrgAdminAccess(user.id, organizationId)`. We mirror it.
- `VALID_TRANSITIONS`: PENDING → [ACTIVE, CANCELLED]. Approve = ACTIVE, Reject = CANCELLED.
- BBL `ApprovalQueue.jsx` / `MemberManagement.jsx` inform UX shape (pending cards w/
  approve/reject, roster list) — adapted onto our L1 primitives, not code-lifted.

## Tasks

### TASK_01 — Org-scoped membership queries

- **Agent:** Cody
- **What:** Add `getOrganizationMembers(organizationId)` (full roster) returning user,
  discipline, status, rank, roleAssignments, ordered by status then createdAt.

- **Steps:**
  1. Add query to `server/web/organization/queries.ts` (or a new `membership-queries.ts`
     if `queries.ts` gets crowded — Cody's call, match file conventions).
  2. Select only fields the UI needs (mirror `getUserMemberships` payload shape).
- **Done means:** Query compiles, returns members for an org; callable from the page.
- **Depends on:** nothing.

### TASK_02 — Org-scoped membership status action

- **Agent:** Cody
- **What:** New `server/web/organization/membership-actions.ts` with
  `transitionOrgMembershipStatus` mirroring `theme-actions.ts` auth pattern.
- **Steps:**
  1. `userActionClient` + `assertOrgAdminAccess(user.id, organizationId)`.
  2. Verify the membership belongs to `organizationId` (no cross-org transitions).
  3. Reuse `VALID_TRANSITIONS` guard, optimistic-lock update (version increment),
     audit log (`STATUS_TRANSITION`, org brand), and `notifyMemberOfMembershipStatusChange`
     fire-and-forget — same contract as the platform-admin action.
  4. Revalidate `/organizations/[slug]/settings/members`.
- **Done means:** Approve/reject a PENDING membership scoped to the org; unauthorized
  users throw ACCESS_DENIED; invalid transitions rejected.

- **Depends on:** nothing (parallel with TASK_01).

### TASK_03 — Members settings page + UI

- **Agent:** Cody
- **What:** `/organizations/[slug]/settings/members/page.tsx` — auth gate + roster +
  approval queue. Client component for the approve/reject actions.

- **Steps:**
  1. Server page: `hasOrgAdminAccess` gate (mirror settings index + theme page),
     breadcrumbs, Intro, fetch roster via TASK_01.
  2. **Pending section:** cards listing PENDING members with Approve / Reject buttons
     (adapt BBL `ApprovalQueue` shape onto `Card`/`Stack`/`Badge` L1 primitives).
  3. **Roster section:** list/table of all members with status + role badges.
  4. Client action component wires `transitionOrgMembershipStatus` with `sonner` toast,
     matching existing self-service-theme-form conventions.
  5. Add a **Members** section card to the settings index (`settings/page.tsx`).
- **Done means:** Org admin sees roster, can approve/reject pending members with optimistic
  UI + toast; non-admins get `OrgAccessDenied`. Settings index links to it.

- **Depends on:** TASK_01, TASK_02.

### TASK_04 — Verification

- **Agent:** Doug
- **What:** Typecheck + biome; smoke the auth gate + a transition path.
- **Done means:** `npx tsc` 0 errors, biome clean. Optional: org-scoped action auth test.
- **Depends on:** TASK_01–03.

## Parallelism

TASK_01 and TASK_02 touch disjoint files → could parallelize, but both are small and
TASK_03 depends on both. Build as one coherent Cody pass (01 → 02 → 03), not split
sub-agents — coordination cost exceeds benefit for ~3 small files.

## Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Clear query, no decisions |
| TASK_02 | Cody | Mirrors established pattern |
| TASK_03 | Cody | UI build on existing primitives |
| TASK_04 | Doug | Verification gate |

## Open decisions

None — three forks resolved at bow-in (first slice = approval queue + roster; reuse =
new org-scoped actions; lane = 2 sessions).

## Risks

- **Primitive reuse:** must build on `components/common/` (Card/Badge/Stack/Table) — do
  NOT introduce new primitives (repeat-prone FS pattern). Read existing components first.

- **Cross-org safety:** the org-scoped action MUST verify membership.organizationId matches
  the asserted org, or an org admin could transition another org's member by ID.

- **Brand on audit/notify:** use the org's brand context, mirroring theme-actions revalidate.

## Scope guard

Role-assignment UI, invite-link flow, general-info editing, suspend/reactivate from roster,
bulk actions, search/filter/pagination → next session. Note any surfacing work in SESSION
`Open decisions / blockers`, do not build inline.

## Dirstarter implementation template

- **Docs read first:** not applicable — extends existing custom org-settings surface;
  reuses Better Auth session + Prisma patterns already aligned in prior sessions.

- **Baseline pattern to extend:** `theme-actions.ts` (userActionClient + assertOrgAdminAccess),
  `admin/memberships/actions.ts` (transition logic), `settings/page.tsx` (section cards).
- **Custom delta:** org-scoped (not platform-admin) membership roster + approval queue.
- **No-bypass proof:** not replacing a Dirstarter capability — Dirstarter has no
  org-scoped membership management; this is Ronin domain logic (Membership/Organization).
