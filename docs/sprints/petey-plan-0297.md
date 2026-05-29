---
title: "Petey Plan 0297 — Org-scoped role assignment + reject-semantics fix (F-0296-1)"
slug: petey-plan-0297
type: plan
status: in-progress
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0297
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0297.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0297

## Goal

Member-management lane **slice 2 (tight)**: org-scoped role assignment on the 0296 roster
(assign/remove any system role for owner + ORG_ADMIN) **and** resolve F-0296-1 by changing
Reject to hard-delete the PENDING join request (clean re-request). Invite subsystem and
general-info editing are explicitly deferred.

## Grill outcome (3 forks resolved)

1. **Scope** = roles + F-0296-1. Invite-link (full `Invite` model subsystem) and general-info
   (already exists in `dashboard/school-form.tsx` → `updateOrganization`) deferred.
2. **Reject semantics** = hard-delete the PENDING membership row (write `REQUEST_REJECTED`
   audit first). Self-contained in the members area; does not touch the join flow.
3. **Role-grant policy** = any owner/ORG_ADMIN can assign/remove any system role (incl.
   ORG_ADMIN), mirroring the platform pattern. Owner always retains access via `ownerId`.

## Context (bow-in findings)

- Platform reuse refs: `assignRoleToMembership`/`removeRoleFromMembership`
  (`server/admin/memberships/actions.ts`, upsert/delete on `MembershipRoleAssignment`) and
  the `RoleAssignmentPanel` client (`admin/memberships/[id]/_components/`).
- `getSystemRoles()` (`server/web/organization/queries.ts`) returns the assignable role list.
- `MembershipRoleAssignment` is a simple join table with `@@unique([membershipId, roleId])`.
- 0296 shipped `transitionOrgMembershipStatus` + the members page (roster + approval queue).
  Approval actions currently transition Reject → CANCELLED (the F-0296-1 bug source).

## Tasks

### TASK_01 — Org-scoped role assign/remove actions

- **Agent:** Cody
- **What:** Add `assignOrgRole` + `removeOrgRole` to
  `server/web/organization/membership-actions.ts`.
- **Steps:**
  1. `userActionClient` + `assertOrgAdminAccess(user.id, organizationId)`.
  2. Load membership; **cross-org guard** (`membership.organizationId === organizationId`).
  3. Validate `roleId` is a system role (guard against arbitrary role IDs).
  4. assign = `membershipRoleAssignment.upsert`; remove = `delete` by compound unique.
  5. Fire-and-forget audit (`ROLE_ASSIGNED` / `ROLE_REMOVED`, org brand) + revalidate
     `/organizations/[slug]/settings/members`.
- **Done means:** Owner/ORG_ADMIN can add/remove a role on a member of their org; cross-org
  and non-system-role attempts rejected.
- **Depends on:** nothing.

### TASK_02 — Reject = hard-delete (F-0296-1)

- **Agent:** Cody
- **What:** Add `rejectOrgJoinRequest` action; rewire the approval UI to it.
- **Steps:**
  1. `userActionClient` + `assertOrgAdminAccess` + cross-org guard.
  2. Guard status === PENDING (only pending requests are rejectable this way).
  3. Write `REQUEST_REJECTED` audit (entityId = membershipId; AuditLog entityId is a free
     string, survives the delete), then `db.membership.delete`.
  4. Revalidate members path.
  5. Update `MemberApprovalActions` Reject button to call `rejectOrgJoinRequest` instead of
     `transitionOrgMembershipStatus({ toStatus: "CANCELLED" })`.
- **Done means:** Rejecting a PENDING request removes the row; the user can re-request the
  same discipline (no `@@unique` collision). F-0296-1 closed.
- **Depends on:** TASK_01 (same file — sequential edit).

### TASK_03 — Roster role UI

- **Agent:** Cody
- **What:** Org-scoped role controls on each roster row.
- **Steps:**
  1. New client component (mirror `RoleAssignmentPanel`) wired to `assignOrgRole`/
     `removeOrgRole`, taking `organizationId`, `membershipId`, `roleAssignments`, `roleList`.
  2. Members page fetches `getSystemRoles()` and renders the control per roster member
     (replacing the read-only role badges from 0296).
- **Done means:** Roster rows show assigned roles with remove (×) + an add-role dropdown;
  changes persist with toast + refresh.
- **Depends on:** TASK_01.

### TASK_04 — Verification

- **Agent:** Doug
- **What:** `npm run typecheck` + `biome check` on touched files.
- **Done means:** 0 type errors, biome clean.
- **Depends on:** TASK_01–03.

## Parallelism

TASK_01 and TASK_02 both edit `membership-actions.ts` → sequential. TASK_03 depends on
TASK_01. Build as one coherent Cody pass (01 → 02 → 03), not split sub-agents.

## Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Mirrors established action pattern |
| TASK_02 | Cody | Localized behavior change + rewire |
| TASK_03 | Cody | UI mirror of RoleAssignmentPanel |
| TASK_04 | Doug | Verification gate |

## Open decisions

None — three forks resolved at bow-in.

## Risks

- **Cross-org / role-validity guards** are load-bearing: an org admin must not assign roles
  to another org's member, nor assign a non-system or made-up role ID.
- **Self-lockout:** a non-owner ORG_ADMIN could remove their own ORG_ADMIN role. Acceptable
  (owner retains access; low stakes) — note, don't over-engineer a guard this session.
- **Reject delete vs audit ordering:** write the audit row BEFORE delete so the rejection is
  recorded even though the membership row disappears.

## Scope guard

Invite-link subsystem (`Invite`/`InviteClaim`), general-info editing surface, bulk role ops,
suspend/reactivate from roster → future sessions. Note surfacing work in SESSION
`Open decisions / blockers`, don't build inline.

## Dirstarter implementation template

- **Docs read first:** not applicable — extends the existing custom org-settings surface;
  Better Auth session + Prisma patterns already aligned.
- **Baseline pattern to extend:** `transitionOrgMembershipStatus` (auth + cross-org guard),
  platform `assignRoleToMembership`/`RoleAssignmentPanel`, `getSystemRoles`.
- **Custom delta:** org-scoped (not platform-admin) role assignment + reject-as-delete.
- **No-bypass proof:** Dirstarter has no org-scoped membership role management; Ronin domain
  logic on Membership/MembershipRoleAssignment/Role.
