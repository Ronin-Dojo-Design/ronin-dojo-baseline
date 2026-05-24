---
title: "SESSION 0076 — Admin UI for TournamentRole, StaffAssignment, WeighIn, RuleSet"
slug: session-0076
type: session
status: closed-quick
created: 2026-05-05
updated: 2026-05-05
last_agent: copilot-session-0076
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0075.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0076 — Admin UI for TournamentRole, StaffAssignment, WeighIn, RuleSet

### Date

2026-05-05

### Operator

Brian Scott + Copilot (Cody)

### Status

in-progress

### Goal

Execute SESSION_0076_PLAN — build admin UI pages for TournamentRole, RuleSet, Staff panel, WeighIn panel, and sidebar nav entry. All pages follow the gold-standard 6-file pattern from `admin/categories/`.

### Context read

- ✅ SESSION_0075 — closed-quick. All 4 tasks + bonus landed. Server CRUD complete. No blockers.
- ✅ SESSION_0076_PLAN — Petey plan ready. Covers 5 task groups with file lists.
- ✅ Branch: `main`, clean working tree.
- Inputs on demand: `SESSION_0076_PLAN.md`, `dirstarter-component-inventory.md`, existing `admin/categories/` gold-standard pattern.

### Task plan

- `SESSION_0076_TASK_01` — TournamentRole admin CRUD pages (list, new, [id], form, table, columns, actions, delete-dialog, toolbar-actions).
- `SESSION_0076_TASK_02` — RuleSet admin CRUD pages (same pattern).
- `SESSION_0076_TASK_03` — Staff Assignment panel (tab or sub-page on tournament detail).
- `SESSION_0076_TASK_04` — WeighIn Record panel (tab or sub-page on registration detail).
- `SESSION_0076_TASK_05` — Sidebar nav entry for Tournaments section.

## What landed

- ✅ **TASK_01 — TournamentRole admin CRUD pages.** 9 files: list page, new page, [id] edit page, form, actions dropdown, table, columns, toolbar-actions, delete-dialog. Gold-standard pattern from `admin/categories/`.
- ✅ **TASK_02 — RuleSet admin CRUD pages.** 9 files: same pattern. Includes scoring method tooltips, duration formatting, discipline select, isSystem guard.
- ✅ **TASK_03 — Staff Assignment panel.** 2 components (`staff-panel.tsx`, `staff-assignment-form.tsx`) embedded on tournament `[id]/page.tsx`. Dialog-based add form with user/role/division selects.
- ✅ **TASK_04 — WeighIn Record panel.** Standalone `weigh-in-panel.tsx` component. Record weight dialog, mark-official action, delete action. Ready to drop into future registration detail page.
- ✅ **TASK_05 — Sidebar nav + sub-nav.** `TrophyIcon` tournament entry in sidebar. `TournamentsSubNav` component with Tournaments/Roles/Rule Sets tabs, wired into all 3 list pages.
- ✅ **Server-side additions.** `tournamentRolesTableParamsSchema` + `ruleSetsTableParamsSchema` with caches. `findTournamentRolesPaginated` + `findRuleSetsPaginated` queries with search/sort/pagination.
- ✅ **Admin access fix.** Promoted `mrbscott@gmail.com` to admin role in dev DB.

## Files touched

| File | Note |
| --- | --- |
| `apps/web/server/admin/tournaments/schema.ts` | Added `tournamentRolesTableParamsSchema`, `ruleSetsTableParamsSchema` + caches + types |
| `apps/web/server/admin/tournaments/queries.ts` | Added `findTournamentRolesPaginated`, `findRuleSetsPaginated` |
| `apps/web/app/admin/tournaments/roles/page.tsx` | NEW — TournamentRole list page |
| `apps/web/app/admin/tournaments/roles/new/page.tsx` | NEW — Create role page |
| `apps/web/app/admin/tournaments/roles/[id]/page.tsx` | NEW — Edit role page |
| `apps/web/app/admin/tournaments/roles/_components/tournament-role-form.tsx` | NEW — Role form (useHookFormAction) |
| `apps/web/app/admin/tournaments/roles/_components/tournament-role-actions.tsx` | NEW — Row action dropdown |
| `apps/web/app/admin/tournaments/roles/_components/tournament-roles-table.tsx` | NEW — DataTable wrapper |
| `apps/web/app/admin/tournaments/roles/_components/tournament-roles-table-columns.tsx` | NEW — Column defs |
| `apps/web/app/admin/tournaments/roles/_components/tournament-roles-table-toolbar-actions.tsx` | NEW — Bulk delete toolbar |
| `apps/web/app/admin/tournaments/roles/_components/tournament-roles-delete-dialog.tsx` | NEW — DeleteDialog wrapper |
| `apps/web/app/admin/tournaments/rule-sets/page.tsx` | NEW — RuleSet list page |
| `apps/web/app/admin/tournaments/rule-sets/new/page.tsx` | NEW — Create rule set page |
| `apps/web/app/admin/tournaments/rule-sets/[id]/page.tsx` | NEW — Edit rule set page |
| `apps/web/app/admin/tournaments/rule-sets/_components/rule-set-form.tsx` | NEW — RuleSet form |
| `apps/web/app/admin/tournaments/rule-sets/_components/rule-set-actions.tsx` | NEW — Row action dropdown |
| `apps/web/app/admin/tournaments/rule-sets/_components/rule-sets-table.tsx` | NEW — DataTable wrapper |
| `apps/web/app/admin/tournaments/rule-sets/_components/rule-sets-table-columns.tsx` | NEW — Column defs |
| `apps/web/app/admin/tournaments/rule-sets/_components/rule-sets-table-toolbar-actions.tsx` | NEW — Bulk delete toolbar |
| `apps/web/app/admin/tournaments/rule-sets/_components/rule-sets-delete-dialog.tsx` | NEW — DeleteDialog wrapper |
| `apps/web/app/admin/tournaments/_components/tournaments-sub-nav.tsx` | NEW — Sub-nav tabs |
| `apps/web/app/admin/tournaments/_components/staff-panel.tsx` | NEW — Staff assignment card panel |
| `apps/web/app/admin/tournaments/_components/staff-assignment-form.tsx` | NEW — Staff add dialog form |
| `apps/web/app/admin/tournaments/_components/weigh-in-panel.tsx` | NEW — WeighIn record card panel |
| `apps/web/app/admin/tournaments/page.tsx` | Added TournamentsSubNav |
| `apps/web/app/admin/tournaments/[id]/page.tsx` | Added StaffPanel + data fetching |
| `apps/web/components/admin/sidebar.tsx` | Added Tournaments nav entry with TrophyIcon |
| `docs/sprints/SESSION_0076.md` | This file |

## Decisions resolved

- All tournament admin sub-routes live under `/admin/tournaments/roles/` and `/admin/tournaments/rule-sets/` (not top-level).
- Staff panel is embedded on tournament detail, not a standalone page.
- WeighIn panel is a standalone component awaiting registration detail page.
- Sub-nav uses `Button variant="ghost"` links with active-state highlighting.
- `CardContent` doesn't exist in L1 — used `<div className="p-4 pt-0">` instead.
- System roles/rule sets: delete button disabled with Tooltip explanation.

## Open decisions / blockers

- **Google OAuth not configured** — `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are empty. Need Google Cloud Console setup. Priority given frequent user logins.
- **Pre-existing i18n error** — `navigation.tools` missing from locale messages. Not from this session.
- **Pre-existing subscriptions table error** — `user.name` column doesn't exist. Not from this session.

## Next session

- **Goal**: Set up Google OAuth for local dev + production. Then begin S3 remaining work: registration detail page (to house WeighIn panel), bracket UI polish, or next program-plan deliverable.
- **Inputs to read**: `docs/architecture/program-plan.md` (S3 scope), `docs/protocols/WORKFLOW_5.0.md` (session calendar), Better-Auth Google provider docs.
- **First task**: Configure Google OAuth credentials and verify sign-in flow works end-to-end.
