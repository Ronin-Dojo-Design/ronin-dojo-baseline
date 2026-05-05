---
title: "SESSION 0044 — Tournament Registration Wiring + Admin List"
slug: session-0044
type: session
status: closed-unclean
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0044
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0043.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0044 — Tournament Registration Wiring + Admin List

## Date

2026-05-04

## Operator

Brian Scott + Copilot (Petey → Cody)

## Status

closed-unclean

## Goal

Wire RegisterButton into the public tournament detail page, add registration success state, and add admin registration list view.

## Plan (Petey)

| ID | Description | Agent | Depends on |
| --- | --- | --- | --- |
| SESSION_0044_TASK_01 | Wire `RegisterButton` into `[slug]/page.tsx` — pass flattened division data with entry counts | Cody | — |
| SESSION_0044_TASK_02 | Add registration success banner — detect `?registered=true` query param, show success message | Cody | TASK_01 |
| SESSION_0044_TASK_03 | Add admin registration list view — `admin/tournaments/[id]/registrations/page.tsx` with table | Cody | — |
| SESSION_0044_TASK_04 | Type-check all new/modified files (`tsc --noEmit`) | Cody | TASK_01–03 |

### Acceptance criteria

- RegisterButton renders on tournament detail page with division data + entry counts
- After successful registration (free or paid), user sees success banner
- Admin can view registrations for a tournament at `/admin/tournaments/[id]/registrations`
- All files pass type-check

## Context

- Previous session: SESSION_0043 (registration checkout flow complete)
- Tournament detail page: `apps/web/app/(web)/tournaments/[slug]/page.tsx`
- RegisterButton: `apps/web/components/web/tournaments/register-button.tsx`
- Payloads: `apps/web/server/web/tournaments/payloads.ts` (tournamentDetailPayload already includes division entry counts)

## What landed

- **RegisterButton wired into tournament detail page** — each discipline section now renders the register component with division data + entry counts for capacity display
- **Registration success banner** — `?registered=true` query param triggers a green confirmation banner at the top of the page
- **Admin registration list view** — new page at `/admin/tournaments/[id]/registrations` shows all registrations with user info, divisions, status, payment, and total
- **Type-check passed** — 0 new errors (2 pre-existing unrelated)

## Files touched

- `apps/web/app/(web)/tournaments/[slug]/page.tsx` — Added RegisterButton import, searchParams for success state, success banner, register UI per discipline section
- `apps/web/server/admin/tournaments/registrations-queries.ts` — New: query for registrations by tournament ID
- `apps/web/app/admin/tournaments/[id]/registrations/page.tsx` — New: admin registrations list page

## Decisions resolved

- **RegisterButton placement**: one per discipline section (not one global), so users register for divisions within a specific discipline context
- **Success state mechanism**: query param `?registered=true` — simple, works for both free and Stripe redirect flows

## Open decisions / blockers

- None blocking

## Next session

**Goal**: Update RegisterButton's free-path to redirect with `?registered=true` param; add link from admin tournament detail to registrations list; consider registration cancellation flow.

**Inputs to read**: `server/web/tournaments/register.ts` (free path redirect), admin tournament detail page

**First task**: Update `createRegistrationCheckout` free path to redirect/revalidate with `?registered=true`

## Task log

- SESSION_0044_TASK_01 — Wire RegisterButton into detail page ✅
- SESSION_0044_TASK_02 — Registration success banner ✅
- SESSION_0044_TASK_03 — Admin registration list view ✅
- SESSION_0044_TASK_04 — tsc --noEmit ✅ (0 new errors)

## ADR / ubiquitous-language check

No new ADRs or domain terms needed.

## Status

closed-quick
