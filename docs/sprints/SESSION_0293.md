---
title: "SESSION 0293 — Org-level theme admin UI (D8)"
slug: session-0293
type: session--implement
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0293
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0292.md
  - docs/sprints/petey-plan-0293.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0293 — Org-level theme admin UI (D8)

## Date

2026-05-29

## Operator

Brian + copilot-session-0293 (Petey orchestrating, Cody executing, Doug verifying)

## Goal

Build super-admin UI for per-org theme overrides: admin org list page at
`/admin/organizations` and org theme editor at `/admin/organizations/[id]/theme`.
Server queries + upsert action for OrgSettings theme fields.

## Status

### Status: closed

## Bow-in

### Previous session

- SESSION_0292 (closed). D9 resolved (DB asset URLs in generateMetadata).
  Playwright e2e for brand-settings passing. D8 deferred to this session.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `app/admin/organizations/` (new pages), `server/admin/org-settings/` (new) |
| Extension or replacement | **Extension** — new admin pages + server layer for OrgSettings theme CRUD |
| Why justified | Schema fields exist (SESSION_0291) but no admin UI to manage them. Blocks white-label per-org customization. |
| Risk if bypassed | 7 OrgSettings theme fields sit unused. No path to per-org branding without code deploys. |

### Graphify check

- Graph status: current (updated end of SESSION_0292).

## Petey plan

See [`petey-plan-0293.md`](petey-plan-0293.md).

### Tasks

| ID | Status | Description | Agent |
| --- | --- | --- | --- |
| SESSION_0293_TASK_01 | done | Server queries + upsert action for OrgSettings theme fields | Cody |
| SESSION_0293_TASK_02 | done | Admin org list + org theme page with form | Cody |
| SESSION_0293_TASK_03 | done | Verification — typecheck + biome | Doug |

## Task log

### SESSION_0293_TASK_01 — Server queries + upsert action

Created `server/admin/org-settings/queries.ts` (`findOrgSettings`, `findAllOrganizationsWithSettings`)
and `server/admin/org-settings/actions.ts` (`updateOrgTheme` — updates OrgSettings theme fields,
empty strings → null, revalidates org-specific paths).

### SESSION_0293_TASK_02 — Admin org list + org theme page

Created `/admin/organizations` page — lists all orgs with brand badge, "Themed" indicator,
and primary color swatch. Click navigates to `/admin/organizations/[id]/theme`.

Created `/admin/organizations/[id]/theme` page — `OrgThemeForm` with same field layout as
`BrandSettingsForm`: 4 color fields + 3 asset URL fields, live color preview swatches,
placeholder text indicating inheritance from brand level.

### SESSION_0293_TASK_03 — Verification

Typecheck clean (0 errors). Biome clean (import sort + formatting auto-fixed).

## What landed

- `server/admin/org-settings/` — queries + update action for OrgSettings theme fields
- `/admin/organizations` — org list page with theme status indicators
- `/admin/organizations/[id]/theme` — per-org theme editor form
- D8 resolved (super admin org theme UI)

## Files touched

- `apps/web/server/admin/org-settings/queries.ts` — new
- `apps/web/server/admin/org-settings/actions.ts` — new
- `apps/web/app/admin/organizations/page.tsx` — new
- `apps/web/app/admin/organizations/[id]/theme/page.tsx` — new
- `apps/web/app/admin/organizations/[id]/theme/_components/org-theme-form.tsx` — new
- `docs/sprints/petey-plan-0293.md` — new
- `docs/sprints/SESSION_0293.md` — new

## Decisions resolved

- **D8**: Org-level theme admin UI — super admin at `/admin/organizations/[id]/theme`.
  Org admin self-service deferred to SESSION 0294.

## Open decisions / blockers

- **D7**: S3 bucket provisioning — deferred, needs AWS creds
- **D10**: Org-scoped CSS injection on org pages (cascade: `styles.css → BrandSettings → OrgSettings`)
- **D11**: Org admin self-service theme page at `/organizations/[slug]/settings/theme`

## Next session

- **Goal**: Org-scoped CSS injection on org pages + org admin self-service theme page
- **Inputs to read**: `petey-plan-0293.md`, org detail page layout, brand-context resolution
- **First task**: Wire OrgSettings theme override into CSS injection for org-scoped pages

