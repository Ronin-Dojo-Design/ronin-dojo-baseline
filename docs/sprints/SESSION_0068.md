---
title: "SESSION 0068 — Cody: Dashboard Tabs (Profile, School, Techniques)"
slug: session-0068
type: session
status: in-progress
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0068
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0067.md
  - docs/sprints/SESSION_0066.md
  - docs/knowledge/wiki/concepts/listing-pattern-repurposing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0068 — Cody: Dashboard Tabs (Profile, School, Techniques)

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Cody, orchestrated by Petey)

### Status

closed-quick

### Goal

Implement dashboard tab UI: Profile editing (Passport + DirectoryProfile including slug), School management, and Technique CRUD with DataTable.

### Context read

- ✅ SESSION_0067 — closed-quick. Schema ready (DirectoryProfile.slug exists).
- ✅ Listing-pattern-repurposing.md §6 — route structure confirmed.
- ✅ Component inventory — pre-flighted.
- ✅ Existing actions: `updatePassport`, `updateDirectoryProfile` in `server/web/passport/actions.ts`.
- ✅ Existing schemas: `updatePassportSchema`, `updateDirectoryProfileSchema` in `server/web/passport/schemas.ts`.

### Task log

- `SESSION_0068_TASK_01` — Dashboard Profile tab (Passport + DirectoryProfile form) — ✅ done
- `SESSION_0068_TASK_02` — Dashboard School tab (Organization edit form) — ✅ done
- `SESSION_0068_TASK_03` — Dashboard Techniques tab (table view) — ✅ done

## What landed

- ✅ **Dashboard Tabs UI** — Client-side tab component (`tabs.tsx`) with Profile, School, Techniques, and Listings tabs.
- ✅ **Profile Tab** — Full form with Passport fields (displayName, bio, phone, avatar) + DirectoryProfile fields (slug, visibility, location, privacy toggles). Uses existing `updatePassport` + `updateDirectoryProfile` actions.
- ✅ **Schema update** — `slug` field added to `updateDirectoryProfileSchema` with regex validation.
- ✅ **School Tab** — Organization edit form with name, slug, description, website, contact, address fields. New `updateOrganization` action with ownership verification.
- ✅ **Techniques Tab** — Table view showing user's techniques with name, discipline badge, published status, difficulty. Link to create new.
- ✅ **Dashboard queries** — Added `findUserDirectoryProfile`, `findUserOrganization`, `findUserTechniques` to `server/web/dashboard/queries.ts`.
- ✅ **Type check** — `tsc --noEmit` passes clean.

## Files touched

| File | Note |
|------|------|
| `apps/web/app/(web)/dashboard/page.tsx` | Refactored to use tab UI |
| `apps/web/app/(web)/dashboard/tabs.tsx` | New — client-side tab switcher component |
| `apps/web/app/(web)/dashboard/profile-tab.tsx` | New — server wrapper for profile form |
| `apps/web/app/(web)/dashboard/profile-form.tsx` | New — Passport + DirectoryProfile edit form |
| `apps/web/app/(web)/dashboard/school-tab.tsx` | New — server wrapper for school form |
| `apps/web/app/(web)/dashboard/school-form.tsx` | New — Organization edit form |
| `apps/web/app/(web)/dashboard/techniques-tab.tsx` | New — server wrapper for techniques table |
| `apps/web/app/(web)/dashboard/techniques-table.tsx` | New — technique listing table |
| `apps/web/server/web/passport/schemas.ts` | Added `slug` field to `updateDirectoryProfileSchema` |
| `apps/web/server/web/dashboard/queries.ts` | Added `findUserDirectoryProfile`, `findUserOrganization`, `findUserTechniques` |
| `apps/web/server/web/school/actions.ts` | New — `updateOrganization` action with ownership guard |
| `docs/sprints/SESSION_0068.md` | This file |

## Decisions resolved

- **Dashboard tab nav** — implemented as client-side tabs (per listing-pattern-repurposing.md decision #3). No URL-based routing for tabs.
- **Slug editing** — users can set their own slug via the Profile tab. Regex-validated `[a-z0-9-]+`.

## Open decisions / blockers

- **Technique CRUD forms** — The Techniques tab shows a read-only table for now. Full create/edit forms (with DataTable bulk actions) deferred to SESSION_0069.
- **School content management** — ContentAtom CRUD scoped to org not yet built. Deferred.

## Review log

- `SESSION_0068_REVIEW_01` — All 3 tasks executed. Type check passes. L1 components used (Form, Input, TextArea, Select, Switch, Badge, Button, Stack, H4, Table, Link, Note, Hint). No raw HTML.

## ADR / ubiquitous-language check

- No new ADR needed.
- No new domain terms.

## Next session

### SESSION_0069 — Cody: Technique CRUD + Card Components + Filters

- **Goal:** Build technique create/edit forms in dashboard, card components for public listings, and filter components.
- **Agent:** Cody
- **Inputs:** SESSION_0068, listing-pattern-repurposing.md §5 component mapping.
- **First task:** SESSION_0069_TASK_01 — Technique create/edit form + server actions.
- **Prerequisite:** Unblocked.
