---
title: "SESSION 0294 — Org-scoped CSS injection + self-service theme (D10/D11)"
slug: session-0294
type: session--implement
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0294
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0293.md
  - docs/sprints/petey-plan-0294.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0294 — Org-scoped CSS injection + self-service theme (D10/D11)

## Date

2026-05-29

## Operator

Brian + copilot-session-0294 (Petey orchestrating, Cody executing, Doug verifying)

## Goal

Wire OrgSettings theme overrides into CSS injection for org-scoped pages.
Build org admin self-service theme page with owner/ORG_ADMIN auth gating
and a martial-arts-styled 403 page.

## Status

### Status: closed

## Bow-in

### Previous session

- SESSION_0293 (closed). D8 resolved — super-admin org theme CRUD.
  D10/D11 deferred to this session.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `app/(web)/organizations/[slug]/layout.tsx` (new), `server/web/organization/` (modified) |
| Extension or replacement | **Extension** — new layout for CSS injection, new self-service page |
| Why justified | OrgSettings theme fields exist (SESSION_0291/0293) but don't render on org pages. Org admins have no self-service path. |
| Risk if bypassed | Per-org theming is admin-only. Orgs can't manage their own brand. |

### Graphify check

- Graph status: current (updated end of SESSION_0293).

## Petey plan

See [`petey-plan-0294.md`](petey-plan-0294.md).

### Tasks

| ID | Status | Description | Agent |
| --- | --- | --- | --- |
| SESSION_0294_TASK_01 | done | Add orgSettings to org detail payload + org-scoped layout with CSS injection | Cody |
| SESSION_0294_TASK_02 | done | Org-owner/admin auth action + martial arts 403 page | Cody |
| SESSION_0294_TASK_03 | done | Self-service theme page | Cody |
| SESSION_0294_TASK_04 | done | Typecheck + biome verification | Doug |

## Task log

### SESSION_0294_TASK_01 — Org detail payload + layout CSS injection

Added `orgSettings` theme fields to `organizationDetailPayload` in `server/web/organization/payloads.ts`.
Created `app/(web)/organizations/[slug]/layout.tsx` — wraps children in `<div data-org={orgId}>`,
injects `<style>` block with `[data-org="X"]` selector for OrgSettings color overrides.
HSL-safe regex guard rejects non-numeric characters before CSS injection.

### SESSION_0294_TASK_02 — Auth action + 403 page

Created `server/web/organization/theme-actions.ts` — `updateOrgThemeSelfService` action using
`userActionClient` with inline auth check: org owner OR membership with `ORG_ADMIN` role code.
Created `components/web/organizations/org-access-denied.tsx` — martial-arts-styled 403 page
("You Can't Ninja Your Way In Here 🥷") with links back to dojo and org browser.

### SESSION_0294_TASK_03 — Self-service theme page

Created `/organizations/[slug]/settings/theme` page with `SelfServiceThemeForm`.
Server-side auth check renders `OrgAccessDenied` for unauthorized users.
Form mirrors admin `OrgThemeForm` layout: 4 color fields + 3 asset URL fields,
live color preview swatches, placeholder text indicating brand inheritance.

### SESSION_0294_TASK_04 — Verification

Typecheck clean (0 errors). Biome clean (formatting auto-fixed on 5 files).

## What landed

- `server/web/organization/payloads.ts` — orgSettings added to detail payload
- `app/(web)/organizations/[slug]/layout.tsx` — org-scoped CSS injection with HSL guard
- `server/web/organization/theme-actions.ts` — self-service theme action (owner + ORG_ADMIN)
- `components/web/organizations/org-access-denied.tsx` — martial-arts 403 page
- `app/(web)/organizations/[slug]/settings/theme/` — self-service theme page + form
- D10 resolved (org-scoped CSS injection)
- D11 resolved (org admin self-service theme)

## Files touched

- `apps/web/server/web/organization/payloads.ts` — modified (added orgSettings)
- `apps/web/app/(web)/organizations/[slug]/layout.tsx` — new
- `apps/web/server/web/organization/theme-actions.ts` — new
- `apps/web/components/web/organizations/org-access-denied.tsx` — new
- `apps/web/app/(web)/organizations/[slug]/settings/theme/page.tsx` — new
- `apps/web/app/(web)/organizations/[slug]/settings/theme/_components/self-service-theme-form.tsx` — new
- `docs/sprints/petey-plan-0294.md` — new
- `docs/sprints/SESSION_0294.md` — new

## Decisions resolved

- **D10**: Org-scoped CSS injection — `[slug]/layout.tsx` with `[data-org]` scoping, HSL-safe regex guard
- **D11**: Org admin self-service theme — owner + ORG_ADMIN role at `/organizations/[slug]/settings/theme`

## Open decisions / blockers

- **D7**: S3 bucket provisioning — deferred, needs AWS creds
- **D12**: Seed `ORG_ADMIN` system role — needed for non-owner org admin access (currently only owner works)

## Next session

- **Goal**: Seed ORG_ADMIN system role + add org settings link to org detail page for authorized users
- **Inputs to read**: SESSION_0294, Role seeding pattern, org detail page
- **First task**: Add ORG_ADMIN to seed script and verify role assignment flow
