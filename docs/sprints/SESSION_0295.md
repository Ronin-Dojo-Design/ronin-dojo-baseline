---
title: "SESSION 0295 — ORG_ADMIN seed verification + org settings index"
slug: session-0295
type: session--implement
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0295
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0294.md
  - docs/sprints/petey-plan-0295.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0295 — ORG_ADMIN seed verification + org settings index

## Date

2026-05-29

## Operator

Brian + copilot-session-0295 (Petey orchestrating, Cody executing, Doug verifying)

## Goal

Verify ORG_ADMIN system role is seeded. Create org settings index page at
`/organizations/[slug]/settings/` with owner+ORG_ADMIN auth gate. Add settings
link to org detail page sidebar for authorized users. DRY the auth check into
a shared helper.

## Status

### Status: closed

## Bow-in

### Previous session

- SESSION_0294 (closed). D10/D11 resolved — org-scoped CSS injection + self-service theme.
  D12 (seed ORG_ADMIN) deferred to this session.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `app/(web)/organizations/[slug]/page.tsx` (modified), `server/web/organization/` (modified) |
| Extension or replacement | **Extension** — new settings index page, shared auth helper |
| Why justified | Settings page built in 0294 has no discovery path. Auth check duplicated. |
| Risk if bypassed | Org admins can't find settings. Auth logic drifts between files. |

### Graphify check

- Graph status: current (updated end of SESSION_0294).

## Petey plan

See [`petey-plan-0295.md`](petey-plan-0295.md).

### Tasks

| ID | Status | Description | Agent |
| --- | --- | --- | --- |
| SESSION_0295_TASK_01 | done | Verify ORG_ADMIN role in DB | Cody |
| SESSION_0295_TASK_02 | done | Extract `hasOrgAdminAccess` shared helper | Cody |
| SESSION_0295_TASK_03 | done | Settings index page with auth gate | Cody |
| SESSION_0295_TASK_04 | done | Settings link on org detail sidebar | Cody |
| SESSION_0295_TASK_05 | done | Typecheck + biome | Doug |

## Task log

### SESSION_0295_TASK_01 — Verify ORG_ADMIN role in DB

Confirmed `ORG_ADMIN` role exists in local DB (id `cmpdpnu00008bwjdsh9vbcm5o`).
Already seeded by `seed-baseline-platform.ts`. D12 resolved.

### SESSION_0295_TASK_02 — Extract `hasOrgAdminAccess` shared helper

Created `server/web/organization/org-admin-access.ts` with `hasOrgAdminAccess` (returns boolean)
and `assertOrgAdminAccess` (throws on unauthorized). Refactored `theme-actions.ts` and
`settings/theme/page.tsx` to use shared helper, removing duplicated auth logic.

### SESSION_0295_TASK_03 — Settings index page

Created `/organizations/[slug]/settings/page.tsx` — settings index with auth gate (owner + ORG_ADMIN).
Shows settings sections as clickable cards. Currently one section: Theme & Branding.
Uses `OrgAccessDenied` 403 for unauthorized users.

### SESSION_0295_TASK_04 — Settings link on org detail sidebar

Added "Organization Settings" card to org detail sidebar, visible only to users with
`hasOrgAdminAccess`. Links to `/organizations/[slug]/settings`. Replaces `isOwner`-only gating
with broader owner+ORG_ADMIN check via `canManage`.

### SESSION_0295_TASK_05 — Verification

Typecheck clean (0 errors). Biome clean (3 files auto-formatted).

## What landed

- `server/web/organization/org-admin-access.ts` — shared auth helper (hasOrgAdminAccess + assertOrgAdminAccess)
- `app/(web)/organizations/[slug]/settings/page.tsx` — settings index page with auth gate
- `app/(web)/organizations/[slug]/page.tsx` — settings card in sidebar for authorized users
- `server/web/organization/theme-actions.ts` — refactored to use shared helper
- `app/(web)/organizations/[slug]/settings/theme/page.tsx` — refactored to use shared helper
- D12 resolved (ORG_ADMIN already seeded, verified in DB)

## Files touched

- `apps/web/server/web/organization/org-admin-access.ts` — new
- `apps/web/app/(web)/organizations/[slug]/settings/page.tsx` — new
- `apps/web/app/(web)/organizations/[slug]/page.tsx` — modified (canManage + settings card)
- `apps/web/server/web/organization/theme-actions.ts` — modified (use shared helper)
- `apps/web/app/(web)/organizations/[slug]/settings/theme/page.tsx` — modified (use shared helper)
- `docs/sprints/SESSION_0295.md` — new
- `docs/sprints/petey-plan-0295.md` — new

## Decisions resolved

- **D12**: ORG_ADMIN system role — already seeded in `seed-baseline-platform.ts`, confirmed in DB. Auth gating DRYed into shared `org-admin-access.ts`.

## Open decisions / blockers

- **D7**: S3 bucket provisioning — deferred, needs AWS creds

## Next session

- **Goal**: Add more org settings sections (membership management, general info editing) or proceed to next sprint deliverable
- **Inputs to read**: SESSION_0295, org settings index, program-plan.md
- **First task**: Evaluate next highest-priority gap from plan-vs-current.md
