---
title: "SESSION 0089 — Fix register.ts 'use server' export bug"
slug: session-0089
type: session
status: closed-quick
created: 2026-05-06
updated: 2026-05-06
last_agent: copilot-session-0089
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0088.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0089 — Fix register.ts "use server" export bug

### Date

2026-05-06

### Operator

Brian Scott + Copilot acting as Petey (orchestrator) → Cody (execution)

### Status

closed-quick

### Goal

Fix the `register.ts` "use server" export bug (P1 from SESSION_0088) and update the registration E2E test to expect success instead of catching the error.

### Context read

- ✅ `docs/sprints/SESSION_0088.md` — P1 blocker: `schema.ts` has `"use server"` directive but exports non-async Zod schemas
- ✅ `apps/web/server/web/tournaments/register.ts` — imports schemas from `schema.ts`
- ✅ `apps/web/server/web/tournaments/schema.ts` — the offending file
- ✅ `apps/web/e2e/tournaments/register.spec.ts` — E2E test with try/catch workaround

---

## What landed

- ✅ **TASK_01: Remove `"use server"` from `schema.ts`** — The file exports Zod schemas and TypeScript types (non-async, non-action exports). The `"use server"` directive was incorrect — it caused Next.js 16 strict mode to reject the module at runtime. Removed the directive; `schema.ts` is now a plain shared module imported by the actual server action file `register.ts`.
- ✅ **TASK_02: Update registration E2E test** — Removed the try/catch workaround in `register.spec.ts` that was compensating for the bug. Test now expects the happy path: redirect to `?registered=true` and confirmation text visible.
- ✅ **TASK_03: Audit for similar patterns** — Searched all `server/**/schema*.ts` files for `"use server"`. No other files affected.

## Files touched

| File | Note |
| --- | --- |
| `apps/web/server/web/tournaments/schema.ts` | Removed `"use server"` directive — not a server action file |
| `apps/web/e2e/tournaments/register.spec.ts` | Removed try/catch workaround, test now expects success path |
| `docs/sprints/SESSION_0089.md` | This file |

## Decisions resolved

- **Root cause confirmed:** `schema.ts` had `"use server"` but only exports Zod schemas + types (non-async). Next.js 16 strict mode rejects non-async exports from server action files. Fix: remove the directive from the schema file; it belongs only on files that export async server actions.
- **No other schema files affected** — grep confirmed zero other `schema*.ts` files with `"use server"`.

## Open decisions / blockers

- Registration E2E test depends on seed data — if dev DB lacks tournaments, test skips gracefully
- Full admin E2E (bracket generation + scoring) → future session
- Better-Auth Playwright session helper works but is tightly coupled to DB schema — may need update if auth schema changes

## Next session

- **Goal:** Full lifecycle QA sweep — admin bracket generation + scoring E2E (SESSION_0090)
- **Inputs:** SESSION_0088 Playwright infra + auth helper; SESSION_0089 fixed registration flow
- **First task:** Create `e2e/admin/bracket.spec.ts` covering bracket generation from admin UI
