---
title: "SESSION 0242 — Listing page public parity uplift (programs, organizations, gear, merch)"
slug: session-0242
type: session--implement
status: closed
created: 2026-05-24
updated: 2026-05-24
last_agent: copilot-session-0242
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0241.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0242 — Listing page public parity uplift

## Date

2026-05-24

## Operator

Brian + copilot-session-0242 (Petey orchestrating, Cody executing)

## Goal

Uplift the 4 remaining listing pages (`/programs`, `/organizations`, `/gear`, `/merch`) to full public parity chrome — matching the pattern established in `/lineage`, `/courses`, `/disciplines`, `/schools`.

## Bow-in

### Previous session

- SESSION_0241 (`closed`) — repo cleanup, lineage public parity, close status consolidation.
- SESSION_0240 (`closed`) — lineage BBL foundation plan, executed in 0241.

### Branch and worktree

- Branch: `main`
- Status: clean
- HEAD: `3dd61a4`

### Parity audit

| Page | getPageMetadata | Breadcrumbs | StructuredData | getRequestBrand |
|---|---|---|---|---|
| `/programs` | ❌ | ❌ | ❌ | ❌ (raw headers) |
| `/organizations` | ❌ | ❌ | ❌ | ❌ (raw headers) |
| `/gear` | ❌ | ❌ | ❌ | N/A |
| `/merch` | ❌ | ❌ | ❌ | N/A |

### Reference pattern

`/lineage/page.tsx` — canonical listing page with getPageMetadata, Breadcrumbs, StructuredData (CollectionPage with items), getRequestBrand, cross-links.

## Petey plan

| ID | Task | Done criteria | Assignee |
|---|---|---|---|
| SESSION_0242_TASK_01 | Uplift `/programs` listing | getPageMetadata, Breadcrumbs, StructuredData, getRequestBrand, cross-links | Cody |
| SESSION_0242_TASK_02 | Uplift `/organizations` listing | Same pattern | Cody |
| SESSION_0242_TASK_03 | Uplift `/gear` listing | getPageMetadata, Breadcrumbs, StructuredData | Cody |
| SESSION_0242_TASK_04 | Uplift `/merch` listing | Same pattern | Cody |
| SESSION_0242_TASK_05 | TypeScript typecheck + commit | Zero errors, conventional commit | Cody |

## Task log

| ID | Status | Summary |
|---|---|---|
| SESSION_0242_TASK_01 | done | Uplift `/programs` — getPageMetadata, Breadcrumbs, StructuredData (CollectionPage w/ items), getRequestBrand, cross-links, Note empty state |
| SESSION_0242_TASK_02 | done | Uplift `/organizations` — same pattern |
| SESSION_0242_TASK_03 | done | Uplift `/gear` — getPageMetadata, Breadcrumbs, StructuredData, Section wrapper replacing Wrapper |
| SESSION_0242_TASK_04 | done | Uplift `/merch` — same pattern |
| SESSION_0242_TASK_05 | done | TypeScript typecheck zero errors |
| SESSION_0242_TASK_06 | done | Nav/footer/mobile wiring — added schools, organizations, lineage, merch to header Browse dropdown, mobile nav, footer; added i18n keys |
| SESSION_0242_TASK_07 | done | Created `docs/runbooks/nav-sidebar-menu-runbook.md` with architecture, data wiring, route matrix, Mermaid charts |

## What landed

1. **4 listing pages uplifted to public parity chrome:** `/programs`, `/organizations`, `/gear`, `/merch` — all now have `getPageMetadata`, `Breadcrumbs`, `StructuredData` (CollectionPage JSON-LD), `getRequestBrand` (programs/orgs), cross-links (programs/orgs), `Note` empty states.
2. **Header nav wired:** Browse dropdown now includes Schools, Organizations, Lineage, Merch (was missing). Mobile nav updated to match.
3. **Footer nav wired:** Browse column now includes Schools, Organizations, Lineage, Merch.
4. **i18n keys added:** `schools`, `organizations`, `lineage`, `members`, `merch` in `navigation.json`.
5. **Nav runbook created:** `docs/runbooks/nav-sidebar-menu-runbook.md` — full architecture docs with Mermaid charts, route matrix, wiring checklist.

## Files touched

- `apps/web/app/(web)/programs/page.tsx` — public parity uplift
- `apps/web/app/(web)/organizations/page.tsx` — public parity uplift
- `apps/web/app/(web)/gear/page.tsx` — public parity uplift
- `apps/web/app/(web)/merch/page.tsx` — public parity uplift
- `apps/web/components/web/header.tsx` — added missing nav links + icons
- `apps/web/components/web/footer.tsx` — added missing nav links
- `apps/web/messages/en/navigation.json` — added i18n keys
- `docs/runbooks/nav-sidebar-menu-runbook.md` — created
- `docs/sprints/SESSION_0242.md` — created

## Decisions resolved

- All listing pages now follow the `/lineage` canonical pattern (getPageMetadata + Breadcrumbs + StructuredData + cross-links).
- Browse dropdown is the home for secondary routes; top-level stays Programs + Tournaments + About.

## Open decisions / blockers

- `/directory` and `/members` not yet wired into nav — need public parity chrome first.
- Browse dropdown has 9 items — next UX pass should consider grouping.
- Vercel deploys may be failing — check at start of next session.
- Revised launch date still TBD.

## Next session

### Goal
Desi UX pass on site chrome + verify Vercel deploy health + wire remaining routes (`/directory`, `/members`).

### Inputs to read
- Vercel deployment logs
- `docs/runbooks/nav-sidebar-menu-runbook.md` UX review notes
- `docs/architecture/velobase-harness-patterns.md`

### First task
Check Vercel deploy status and fix any build errors, then begin UX pass on nav grouping and remaining route wiring.
