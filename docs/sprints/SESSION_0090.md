---
title: "SESSION 0090 — Admin Bracket + Scoring E2E (Playwright)"
slug: session-0090
type: session
status: closed-quick
created: 2026-05-06
updated: 2026-05-06
last_agent: copilot-session-0090
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0088.md
  - docs/sprints/SESSION_0089.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0090 — Admin Bracket + Scoring E2E (Playwright)

### Date

2026-05-06

### Operator

Brian Scott + Copilot acting as Petey (orchestrator) → Cody + Doug (execution)

### Status

closed-quick

### Goal

Stand up admin-side Playwright E2E tests covering: admin tournament list access control, tournament detail navigation, bracket viewer, and match scoring dialog. Completes the admin E2E layer deferred from SESSION_0088.

### Context read

- ✅ `docs/sprints/SESSION_0089.md` — previous session, Playwright infra + auth helper in place
- ✅ `apps/web/e2e/helpers/auth.ts` — DB session injection helper (extended this session)
- ✅ `apps/web/components/admin/auth-hoc.tsx` — admin requires `role: "admin"` or `"tournament_director"`
- ✅ `apps/web/app/admin/tournaments/[id]/page.tsx` — admin detail page structure
- ✅ `apps/web/app/admin/tournaments/[id]/brackets/[bracketId]/page.tsx` — bracket viewer page
- ✅ `apps/web/app/admin/tournaments/_components/bracket-viewer.tsx` — scoring dialog component

---

## What landed

- ✅ **TASK_01: Extended auth helper** — Added `role` option to `createAuthenticatedUser()` so E2E tests can create admin-level sessions (`role: "admin"` or `"tournament_director"`)
- ✅ **TASK_02: Admin tournament list E2E** — 2 tests: admin can access list page + non-admin gets 404 (auth HOC access control proof)
- ✅ **TASK_03: Admin bracket viewer E2E** — 2 tests: admin navigates to tournament detail + bracket viewer page, verifies "Bracket:" heading renders
- ✅ **TASK_04: Scoring dialog E2E** — 1 test: admin navigates to bracket, opens scoring dialog, verifies dialog renders with winner/result form elements
- **Total: 5 new admin E2E tests, all files clean (no type errors)**

## Files touched

| File | Note |
| --- | --- |
| `apps/web/e2e/helpers/auth.ts` | Added `role` parameter to `createAuthenticatedUser()` |
| `apps/web/e2e/admin/tournament-list.spec.ts` | New — 2 admin list access control tests |
| `apps/web/e2e/admin/bracket.spec.ts` | New — 2 bracket navigation tests |
| `apps/web/e2e/admin/scoring.spec.ts` | New — 1 scoring dialog test |
| `docs/sprints/SESSION_0090.md` | This file |

## Decisions resolved

- Admin E2E uses same auth helper with `role` param — no separate admin auth helper needed
- Tests gracefully skip when seed data is missing (consistent with SESSION_0088 pattern)
- Scoring E2E tests dialog opening only — full score submission deferred (requires seeded bracket with pending matches)

## Open decisions / blockers

- Full score submission E2E requires seeded tournament with generated brackets + pending matches — depends on seed data quality
- `tournament_director` role E2E not yet tested separately (admin role covers it via HOC)
- Registration E2E (free-path) from SESSION_0089 still needs a run against the fixed `schema.ts`

## Next session

- **Goal:** Run full E2E suite against dev server, fix any seed data gaps, prove all 12 tests pass end-to-end
- **Inputs:** SESSION_0088–0090 E2E tests; dev DB seed state
- **First task:** `bunx playwright test` full run + triage any failures
