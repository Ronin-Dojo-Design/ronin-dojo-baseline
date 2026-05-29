---
title: "SESSION 0296 — Org-scoped member management (roster + approval queue)"
slug: session-0296
type: session--implement
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0296
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0295.md
  - docs/sprints/petey-plan-0296.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0296 — Org-scoped member management (roster + approval queue)

## Date

2026-05-29

## Operator

Brian + claude-session-0296 (Petey orchestrating, Cody executing, Doug verifying)

## Goal

Add an org-scoped member-management section under org settings: roster of the org's
members + an approval queue for PENDING join requests (approve → ACTIVE, reject →
CANCELLED), gated by `hasOrgAdminAccess`. Slice 1 of a 2-session lane.

## Status

### Status: closed

## Bow-in

### Previous session

- SESSION_0295 (closed). ORG_ADMIN seed verified (D12 resolved); org settings index page
  shipped with Theme section + `hasOrgAdminAccess` helper. Next-session block named
  member management as the next org-settings section.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `app/(web)/organizations/[slug]/settings/` (new members page + index card), `server/web/organization/` (new queries + actions) |
| Extension or replacement | **Extension** — new org-scoped membership surface |
| Why justified | Org admins cannot manage their org's members; only platform admins can (`/admin/memberships`). No org-scoped path exists. |
| Risk if bypassed | Org owners depend on platform admins to approve every join request. |

### Graphify check

- Graph status: current (7441 nodes / 11931 edges, updated end of SESSION_0295).
- Query: `"organization membership management admin dashboard members roles invite"` →
  surfaced platform `/admin/memberships` table/columns/actions as the reuse reference.

### Grill outcome (3 forks resolved)

1. **First slice** = approval queue + roster (smallest proven high-value slice).
2. **Reuse** = new org-scoped actions (`userActionClient` + `assertOrgAdminAccess`),
   platform-admin path untouched (zero regression).
3. **Lane** = 2 sessions; role UI / invites / general-info editing → next session.

## Petey plan

See [`petey-plan-0296.md`](petey-plan-0296.md).

### Tasks

| ID | Status | Description | Agent |
| --- | --- | --- | --- |
| SESSION_0296_TASK_01 | done | Org-scoped `getOrganizationMembers` query | Cody |
| SESSION_0296_TASK_02 | done | Org-scoped `transitionOrgMembershipStatus` action | Cody |
| SESSION_0296_TASK_03 | done | Members settings page + approval-queue UI + index card | Cody |
| SESSION_0296_TASK_04 | done | Typecheck + biome | Doug |

## Task log

### SESSION_0296_TASK_01 — Org-scoped roster query

Added `getOrganizationMembers(organizationId)` to `server/web/organization/queries.ts`.
Uncached (approvals must reflect immediately), selects user/discipline/rank/status/
roleAssignments, ordered newest-first. Page partitions PENDING into the approval queue.

### SESSION_0296_TASK_02 — Org-scoped status transition action

New `server/web/organization/membership-actions.ts` →
`transitionOrgMembershipStatus`. Mirrors the platform-admin transition contract
(`server/admin/memberships/actions.ts`): same `VALID_TRANSITIONS` guard, optimistic-lock
update (version increment, P2025 conflict handling), fire-and-forget audit log +
`notifyMemberOfMembershipStatusChange`. Auth via `userActionClient` +
`assertOrgAdminAccess` (matching `theme-actions.ts`). **Cross-org guard:** verifies
`membership.organizationId === organizationId` so an org admin can't transition another
org's member by ID. Brand sourced from the membership row (userActionClient ctx has no brand).

### SESSION_0296_TASK_03 — Members page + UI + index card

- `app/(web)/organizations/[slug]/settings/members/page.tsx` — `hasOrgAdminAccess` gate
  (mirrors settings index/theme), breadcrumbs, Intro. Partitions members into a **Pending
  requests** approval queue (cards with Approve/Reject) and a read-only **Roster** (status +
  role badges). Empty states via `Note`.
- `_components/member-approval-actions.tsx` — client component; `useAction` →
  `transitionOrgMembershipStatus` (Approve → ACTIVE, Reject → CANCELLED), sonner toasts,
  `router.refresh()`. Mirrors `membership-status-actions.tsx` conventions.
- `settings/page.tsx` — added **Members** section card (links to `settings/members`).
- Layout note: used plain `flex flex-col` for vertical lists because `Stack` defaults to
  `direction="row"` and `column` mode applies `items-start` (would shrink-wrap full-width
  Cards). `Stack` reserved for row groupings (badge clusters), as designed.

### SESSION_0296_TASK_04 — Verification

- `npm run typecheck` → 0 errors (next typegen + tsc --noEmit clean).
- `biome check` on all 5 touched files → no fixes applied (already conformant).
- Static + pattern parity verified. **Not run this session:** live browser smoke (needs dev
  server + seeded PENDING memberships) and an org-scoped action auth test — see Open decisions.

## What landed

- `server/web/organization/queries.ts` — `getOrganizationMembers` org roster query (new export)
- `server/web/organization/membership-actions.ts` — **new** org-scoped status transition action
- `app/(web)/organizations/[slug]/settings/members/page.tsx` — **new** members page (roster + approval queue)
- `app/(web)/organizations/[slug]/settings/members/_components/member-approval-actions.tsx` — **new** client approve/reject controls
- `app/(web)/organizations/[slug]/settings/page.tsx` — added Members section card

## Decisions resolved

- **Slice 1 of member-management lane** — org admins (owner + ORG_ADMIN) can now approve/reject
  PENDING join requests for their org and view the roster, without platform-admin involvement.
- **Reuse strategy** — new org-scoped action wrapping proven transition logic; platform-admin
  path (`/admin/memberships`) untouched (zero regression).

## Files touched

- `apps/web/server/web/organization/queries.ts` — modified (new `getOrganizationMembers` export)
- `apps/web/server/web/organization/membership-actions.ts` — new (org-scoped `transitionOrgMembershipStatus`)
- `apps/web/app/(web)/organizations/[slug]/settings/members/page.tsx` — new (roster + approval queue)
- `apps/web/app/(web)/organizations/[slug]/settings/members/_components/member-approval-actions.tsx` — new (client approve/reject)
- `apps/web/app/(web)/organizations/[slug]/settings/page.tsx` — modified (Members section card)
- `docs/sprints/SESSION_0296.md` — new
- `docs/sprints/petey-plan-0296.md` — new
- `docs/knowledge/wiki/index.md` — modified (backfilled 0292–0295 + added 0296; FS-0019 gap fix)
- `docs/knowledge/wiki/custom-component-inventory.md` — modified (new §7 Org self-service settings)

## Review log

### TASK_REVIEW_LOG — SESSION_0296 (Giddy + Doug)

- **Scope reviewed:** TASK_01–04 (org roster query, org-scoped transition action, members page + client actions + index card, verification).
- **Doug (verification):** PASS. `npm run typecheck` 0 errors; `biome check` on all 5 touched files — no fixes. Action mirrors the proven platform-admin transition (optimistic lock + P2025 conflict + audit + notify), so concurrency/audit behavior carries over.
- **Giddy (hostile):** PASS with one logged follow-up. Cross-org guard present (`membership.organizationId === organizationId`); auth re-asserted in the action independent of the page gate (defense in depth); transitions gated by `VALID_TRANSITIONS`. No Dirstarter baseline layer touched (custom Membership/Organization domain logic on already-aligned Better Auth + Prisma), so no live Dirstarter docs cite required.
- **Open follow-up (F-0296-1):** Reject → CANCELLED is terminal; combined with the `@@unique([userId, organizationId, disciplineId])` constraint, a rejected applicant cannot re-request the same discipline while the CANCELLED row exists. Pre-existing behavior (platform-admin path shares it), not introduced here. Decide next session whether reject should hard-delete the row or whether re-join should reactivate a CANCELLED membership.

## Hostile close review

- **Verdict:** PASS (no score cap). Static gates green, pattern parity with the proven platform-admin action, cross-org isolation verified.
- **Not run this session:** live browser smoke (needs dev server + seeded PENDING memberships) and an org-scoped action auth unit test — both carried to next session as recommended, not blocking. Stated honestly rather than claimed.

## ADR / ubiquitous-language check

- **ADR:** None needed. This extends established patterns (org-scoped self-service action = `userActionClient` + `assertOrgAdminAccess`, per `theme-actions.ts`; transition logic per `admin/memberships/actions.ts`). No new architectural decision.
- **Ubiquitous language:** No new domain terms. Membership, Organization, MembershipStatus, ORG_ADMIN already in the glossary.

## Reflections

- **`Stack` is row-by-default.** `components/common/stack.tsx` defaults `direction="row"` and `column` mode adds `items-start`, which shrink-wraps full-width Cards. The shipped `self-service-theme-form` only *looks* vertical because full-width children force flex-wrap. Don't reuse that as a vertical-layout idiom — use plain `flex flex-col` for vertical lists, reserve `Stack` for row groupings. Documented in the component inventory so the next agent doesn't relearn it.
- **Reuse paid off.** The platform-admin transition action was a clean template; the org-scoped version is the same contract + two guards (org access assert, cross-org ID check). No new concurrency/audit surface to reason about.
- **Found and fixed an FS-0019 gap:** wiki index was missing 0292–0295. Backfilled during this close.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Code files (no frontmatter). Docs: SESSION_0296 + petey-plan-0296 created with JETTY 3.0 frontmatter; wiki index + custom-component-inventory `last_agent`→claude-session-0296, `updated` 2026-05-29 (already current). |
| Backlinks/index sweep | SESSION_0296 `pairs_with` SESSION_0295 + petey-plan-0296. Component inventory §7 added with cross-refs to org-admin-access / membership-actions / queries. No reciprocal backlink edits required on code files. |
| Wiki lint | `bun run wiki:lint` → 232 errors / 689 warnings (exit 1). **All 232 errors pre-existing** — broken links to archived sessions (0001–0220) + petey-plan-0083; my new index rows (0292–0296) resolve and are absent from the error list. Introduced only a few low-priority "text-followed-by-list" warnings consistent with existing SESSION/plan doc style. No errors introduced. |
| Kaizen reflection | Yes — Reflections section present. |
| Hostile close review | PASS; TASK_REVIEW_LOG above; one logged follow-up F-0296-1 (CANCELLED re-join). |
| Review & Recommend | Yes — Next session goal written below. |
| Memory sweep | Saved one project memory: the `@@unique` + CANCELLED re-join constraint gotcha (future sessions will hit it). Stack row-default captured in component inventory, not memory. |
| Next session unblock check | Unblocked — next first task (role-assignment UI) is doable with no user input. |
| Git hygiene | Branch `main`; staged/committed/pushed per standing authorization — proof in bow-out response. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` after git hygiene — counts in bow-out response. |

## Open decisions / blockers

- **D7**: S3 bucket provisioning — deferred, needs AWS creds (carried from 0295)
- **F-0296-1**: Reject→CANCELLED + `@@unique([userId, organizationId, disciplineId])` blocks re-request of the same discipline. Decide reject semantics next session (hard-delete vs. reactivation path).

## Next session

- **Goal**: Member-management lane slice 2 — role-assignment UI (assign/remove ORG_ADMIN + other roles from the roster) and/or invite-link flow, plus general-info editing section under org settings.
- **Inputs to read**: SESSION_0296, `membership-actions.ts`, platform `admin/memberships/[id]/_components/role-assignment-panel.tsx` (reuse reference), `getSystemRoles` query.
- **First task**: Add an org-scoped `assignOrgRole` / `removeOrgRole` action (mirror `transitionOrgMembershipStatus` auth + cross-org guard) and surface role controls on the roster. Resolve F-0296-1 (reject semantics) while in the membership area.
