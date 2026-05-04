---
title: "SESSION 0043 — Tournament Registration Checkout (Stripe)"
slug: session-0043
type: session
status: closed-quick
created: 2026-05-03
updated: 2026-05-03
last_agent: copilot-session-0043
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0042.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0043 — Tournament Registration Checkout (Stripe)

## Date

2026-05-03

## Operator

Brian Scott + Copilot (Petey → Cody)

## Status

in-progress

## Goal

Build Recipe 3 from LANE-S042: Tournament registration checkout — user selects division(s), pays via Stripe, webhook creates Registration + RegistrationEntry records. Capacity checks enforced.

## Plan (Petey)

| ID | Description | Agent | Depends on |
| --- | --- | --- | --- |
| SESSION_0043_TASK_01 | Create `server/web/tournaments/schema.ts` — Zod schema for registration input (divisionIds + tournamentId) | Cody | — |
| SESSION_0043_TASK_02 | Create `server/web/tournaments/register.ts` — server action: validate capacity, create Stripe checkout session | Cody | TASK_01 |
| SESSION_0043_TASK_03 | Extend `app/api/stripe/webhooks/route.ts` — add registration fulfillment on checkout.session.completed | Cody | TASK_02 |
| SESSION_0043_TASK_04 | Create `components/web/tournaments/register-button.tsx` — client component with division selection + checkout trigger | Cody | TASK_02 |
| SESSION_0043_TASK_05 | Type-check all new/modified files (`tsc --noEmit`) | Cody | TASK_01–04 |

### Acceptance criteria

- User can select division(s) and initiate Stripe checkout
- Capacity check: reject if division at capacity
- On `checkout.session.completed`: Registration (SUBMITTED, PAID) + RegistrationEntry per division created
- Unique constraint respected (one registration per user per tournament)
- All files pass type-check

## Context

- Lane manifest: `docs/sprints/lanes/LANE-S042-tournament-ops.md` Recipe 3
- Webhook pattern: `app/api/stripe/webhooks/route.ts`
- Post-payment pattern: `server/web/entitlement/grant-entitlement.ts`
- Schema: `Registration`, `RegistrationEntry`, `Division` models (Wave C)
- Division has `feeCents` + `capacity` fields; Registration has `totalFeeCents` + `paymentStatus`

## What landed

- **Registration checkout schema** — Zod input schema for division selection
- **Registration server action** — validates capacity, brand scoping, unique constraint; creates Stripe checkout session (or free registration for $0 divisions)
- **Webhook extension** — `checkout.session.completed` handler creates `Registration` (SUBMITTED/PAID) + `RegistrationEntry` per division; race-condition safe via upsert
- **Register button component** — client-side division selector with capacity display, total calculation, checkout redirect
- All new files pass `tsc --noEmit` (0 new errors; 2 pre-existing unrelated errors)

## Files touched

- `apps/web/server/web/tournaments/schema.ts` — New: Zod schema for registration checkout input
- `apps/web/server/web/tournaments/register.ts` — New: `createRegistrationCheckout` server action (capacity check, Stripe session, free path)
- `apps/web/app/api/stripe/webhooks/route.ts` — Modified: added `fulfillTournamentRegistration()` + tournament registration case in payment handler
- `apps/web/components/web/tournaments/register-button.tsx` — New: division selection + checkout trigger component

## Decisions resolved

- **Free registration path**: if all selected divisions have `feeCents = 0`, Registration is created directly without Stripe (no checkout redirect needed)
- **Registration status on payment**: `SUBMITTED` + `paymentStatus: PAID` (not `APPROVED` — approval is a separate admin step if needed)
- **Race condition guard**: webhook checks for existing Registration before creating; updates payment status if found
- **No registrationDeadline field**: Tournament schema doesn't have this field; removed from validation (could add via migration in future)

## Open decisions / blockers

- None blocking

## Next session

**Goal**: Wire RegisterButton into the public tournament detail page (`[slug]/page.tsx`), add registration success state, and add admin registration list view.

**Inputs to read**: `app/(web)/tournaments/[slug]/page.tsx`, `server/web/tournaments/payloads.ts`

**First task**: Import RegisterButton into tournament detail page, pass division data with entry counts for capacity display

## Task log

- SESSION_0043_TASK_01 — schema.ts ✅
- SESSION_0043_TASK_02 — register.ts ✅
- SESSION_0043_TASK_03 — webhook extension ✅
- SESSION_0043_TASK_04 — register-button.tsx ✅
- SESSION_0043_TASK_05 — tsc --noEmit ✅ (0 new errors)

## ADR / ubiquitous-language check

No new ADRs or domain terms needed. Registration/RegistrationEntry already defined in schema (Wave C).

## Status

closed-quick
