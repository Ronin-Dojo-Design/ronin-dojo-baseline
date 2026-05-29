---
title: "SESSION 0297 — Org-scoped role assignment + reject-semantics fix (F-0296-1)"
slug: session-0297
type: session--implement
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0297
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0296.md
  - docs/sprints/petey-plan-0297.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0297 — Org-scoped role assignment + reject-semantics fix (F-0296-1)

## Date

2026-05-29

## Operator

Brian + claude-session-0297 (Petey orchestrating, Cody executing, Doug verifying)

## Goal

Member-management lane slice 2 (tight): org-scoped role assignment on the 0296 roster
(assign/remove any system role for owner + ORG_ADMIN) + resolve F-0296-1 by changing Reject
to hard-delete the PENDING join request. Defer invite subsystem + general-info editing.

## Status

### Status: closed

## Bow-in

### Previous session

- SESSION_0296 (closed). Shipped org-scoped member roster + approval queue
  (`transitionOrgMembershipStatus`). Left F-0296-1 open (reject→CANCELLED blocks re-request).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (HEAD `893f245`)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `server/web/organization/membership-actions.ts` (extend), members page + components (modify) |
| Extension or replacement | **Extension** — org-scoped role management + reject-as-delete |
| Why justified | 0296 roster shows roles read-only; org admins can't manage them. Reject path has a re-request bug (F-0296-1). |
| Risk if bypassed | Org admins depend on platform staff for role changes; rejected applicants can't re-apply. |

### Graphify check

- Graph current (7452 nodes / 11966 edges, updated end of SESSION_0296). Reference paths
  already known from 0296 — opened directly per opening-ritual step 3c.

### Grill outcome (3 forks resolved)

1. **Scope** = roles + F-0296-1; invite subsystem + general-info deferred.
2. **Reject** = hard-delete the PENDING row (REQUEST_REJECTED audit first).
3. **Role-grant** = any owner/ORG_ADMIN grants any system role.

## Petey plan

See [`petey-plan-0297.md`](petey-plan-0297.md).

### Tasks

| ID | Status | Description | Agent |
| --- | --- | --- | --- |
| SESSION_0297_TASK_01 | done | `assignOrgRole` / `removeOrgRole` org-scoped actions | Cody |
| SESSION_0297_TASK_02 | done | `rejectOrgJoinRequest` (hard-delete) + rewire approval UI (F-0296-1) | Cody |
| SESSION_0297_TASK_03 | done | Roster role-assignment UI | Cody |
| SESSION_0297_TASK_04 | done | Typecheck + biome | Doug |

## Task log

### SESSION_0297_TASK_01 — Org-scoped role assign/remove

Added `assignOrgRole` and `removeOrgRole` to `membership-actions.ts`. Both use
`userActionClient` with `assertOrgAdminAccess`, plus a shared `loadOrgMembership` helper
enforcing the **cross-org guard** (`membership.organizationId === organizationId`).
`assignOrgRole` validates the role is a
system role (`role.isSystem`) before `upsert`; `removeOrgRole` uses `deleteMany` (idempotent,
no P2025 on double-click). Fire-and-forget `ROLE_ASSIGNED` / `ROLE_REMOVED` audit + members
path revalidate. Extracted `loadOrgMembership` to DRY the load+guard across all four actions.

### SESSION_0297_TASK_02 — Reject = hard-delete (F-0296-1)

Added `rejectOrgJoinRequest`: asserts access + cross-org guard, requires status PENDING,
writes a `REQUEST_REJECTED` audit entry (inline, before delete — AuditLog.entityId is a free
string so it survives), then `db.membership.delete`. Rewired `MemberApprovalActions` Reject
button from `transitionOrgMembershipStatus({ toStatus: "CANCELLED" })` to `rejectOrgJoinRequest`
(separate `useAction` hooks for approve/reject). **F-0296-1 closed** — a rejected applicant can
re-request the same discipline (no `@@unique([userId, organizationId, disciplineId])` collision).

### SESSION_0297_TASK_03 — Roster role UI

New `OrgRoleAssignment` client component (mirrors platform `RoleAssignmentPanel`): role badges
with a remove (×) button + an "Add role…" dropdown of unassigned system roles, wired to
`assignOrgRole`/`removeOrgRole` with toasts + `router.refresh()`. Members page now fetches
`getSystemRoles()` alongside the roster (`Promise.all`) and renders the control per roster row,
replacing the 0296 read-only role badges. Status badge retained.

### SESSION_0297_TASK_04 — Verification

`npm run typecheck` → 0 errors. `biome check` → clean (applied the optional-chain narrowing
`!role?.isSystem`; confirmed `role.code` still narrows after the guard). Not run: live browser
smoke + unit tests (carried).

## What landed

- `server/web/organization/membership-actions.ts` — +`assignOrgRole`, +`removeOrgRole`, +`rejectOrgJoinRequest`, +`loadOrgMembership` helper
- `settings/members/_components/org-role-assignment.tsx` — **new** client role-assignment control
- `settings/members/_components/member-approval-actions.tsx` — Reject rewired to `rejectOrgJoinRequest`
- `settings/members/page.tsx` — fetch `getSystemRoles`, render `OrgRoleAssignment` per roster row
- **F-0296-1 resolved** — reject now hard-deletes the request

## Decisions resolved

- **Reject semantics (F-0296-1):** hard-delete the PENDING row (with `REQUEST_REJECTED` audit) — declined request ≠ membership; enables clean re-request.
- **Role-grant policy:** any owner/ORG_ADMIN may assign/remove any system role (incl. ORG_ADMIN); owner retains access via `ownerId` regardless of roles.
- **Slice-2 scope:** roles + F-0296-1 only; invite subsystem + general-info editing deferred.

## Review log

### TASK_REVIEW_LOG — SESSION_0297 (Giddy + Doug)

- **Scope reviewed:** TASK_01–04.
- **Doug (verification):** PASS. Typecheck 0 errors; biome clean. Role actions reuse the proven upsert/deleteMany shapes; reject is a guarded delete.
- **Giddy (hostile):** PASS. Cross-org guard centralized in `loadOrgMembership` and applied to all three new actions; role-validity guard (`isSystem`) blocks arbitrary/foreign role IDs; reject requires PENDING (can't delete active members via this path); audit written before delete. No Dirstarter baseline layer touched → no live-docs cite required.
- **Open follow-ups:** none new. Self-lockout (a non-owner ORG_ADMIN removing their own ORG_ADMIN role) is accepted as low-stakes (owner retains access) — not guarded by design.

## Hostile close review

- **Verdict:** PASS (no score cap). Guards centralized and consistent; F-0296-1 closed with audit trail preserved.
- **Not run this session:** live browser smoke (needs dev server + seeded data) and org-scoped action unit tests — carried, non-blocking. Stated honestly.

## ADR / ubiquitous-language check

- **ADR:** None needed. Extends established patterns (`transitionOrgMembershipStatus` auth/guard; platform role assign/remove). Reject-as-delete is a localized behavior choice, not an architectural decision.
- **Ubiquitous language:** No new terms. MembershipRoleAssignment, Role, ORG_ADMIN already in glossary.

## Reflections

- **One helper paid off twice.** Extracting `loadOrgMembership` (load + cross-org guard) made all three new actions uniform and shrank the hostile-review surface to one guard to verify. Worth doing the moment a second action needed the same load+guard.
- **AuditLog.entityId being a free string (not an FK) is what makes reject-as-delete safe** — the `REQUEST_REJECTED` row outlives the membership it references. Captured in the memory update so future delete-style actions keep their audit trail.
- **Biome's "unsafe" optional-chain fix was actually safe here** — TS still narrows `role` to non-null after `if (!role?.isSystem) throw`, so `role.code` downstream typechecks. Verified rather than assumed.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Code files (no frontmatter). Docs: SESSION_0297 + petey-plan-0297 created with JETTY 3.0 frontmatter; wiki index + component inventory `last_agent`→claude-session-0297. |
| Backlinks/index sweep | SESSION_0297 `pairs_with` SESSION_0296 + petey-plan-0297; index row added; component inventory §7 updated (OrgRoleAssignment row + reject-as-delete note). |
| Wiki lint | `bun run wiki:lint` → 232 errors / 696 warnings (exit 1). Errors unchanged from SESSION_0296 — all pre-existing archived-session links; my 0297 index row resolves and is absent from the error list. Warnings +7 (text-followed-by-list heuristic, repo-standard SESSION/plan style). **No errors introduced.** |
| Kaizen reflection | Yes — Reflections present. |
| Hostile close review | PASS; TASK_REVIEW_LOG above; no new follow-ups. |
| Review & Recommend | Yes — Next session goal below. |
| Memory sweep | Updated `membership-unique-constraint-reject-rejoin` memory: F-0296-1 resolved (reject now hard-deletes); retained the AuditLog-entityId-is-free-string insight. |
| Next session unblock check | Unblocked — invite-link lane is self-contained; no user input required to start. |
| Git hygiene | Branch `main`; staged/committed/pushed per standing authorization — proof in bow-out response. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` after git hygiene — counts in bow-out response. |

## Open decisions / blockers

- **D7**: S3 bucket provisioning — deferred, needs AWS creds (carried)
- ~~F-0296-1~~ — **resolved this session** (reject = hard-delete).

## Next session

- **Goal**: Member-management lane slice 3 — org-scoped **invite-link flow** (generate/revoke invite links on the `Invite` model: type/maxUses/expiry, surfaced under org settings), and/or surface the existing `updateOrganization` general-info form as a settings section.
- **Inputs to read**: SESSION_0297, `Invite`/`InviteClaim` models, existing join-by-invite path (`getOrganizationByInviteCode`), `dashboard/school-form.tsx` + `updateOrganization` (general-info reuse).
- **First task**: Add an org-scoped `createOrgInvite` / `revokeOrgInvite` action pair (mirror the `loadOrgMembership` auth+guard pattern) + an Invites settings page listing active invites with copy-link + revoke.
