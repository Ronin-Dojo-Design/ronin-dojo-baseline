---
title: "SESSION 0092 — E2E Seed Data Helper & Auth Cookie Signing Fix"
slug: session-0092
type: session
status: closed-full
created: 2026-05-06
updated: 2026-05-06
last_agent: copilot-session-0092
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0089.md
  - docs/sprints/SESSION_0090.md
  - docs/sprints/SESSION_0091.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0092 — E2E Seed Data Helper & Auth Cookie Signing Fix

### Date

2026-05-06

### Operator

Brian Scott + Copilot acting as Cody (execution) + Doug (verification)

### Status

closed-full

### Goal

Create a tournament seed fixture for E2E tests, eliminating all test skips and getting the full 12-test suite green.

### Context read

- ✅ `docs/sprints/SESSION_0091.md` — 9 pass, 3 skip, 0 fail; skips due to missing seed data
- ✅ `apps/web/e2e/helpers/auth.ts` — auth helper needed cookie signing fix
- ✅ Better-Auth source (`better-call` crypto module) — HMAC-SHA-256 signed cookie format

---

## What landed

- ✅ **TASK_01: Seed tournament fixture** — Created `e2e/helpers/seed-tournament.ts` that seeds a complete tournament fixture: Organization → Discipline → TournamentRole → Tournament (PUBLISHED, BASELINE_MARTIAL_ARTS) → TournamentDiscipline → Division (free, SINGLE_ELIM) → 4 users with passports + registrations + entries → Bracket with 3 matches (semi-finals + final) with MatchCompetitors.
- ✅ **TASK_02: Global setup/teardown** — Created `e2e/global-setup.ts` (seeds fixture, writes `.fixture.json`) and `e2e/global-teardown.ts` (cleans up all seeded data). Wired into `playwright.config.ts`.
- ✅ **TASK_03: Fixture reader** — Created `e2e/helpers/fixture.ts` that reads `.fixture.json` for use by individual tests.
- ✅ **TASK_04: Better-Auth cookie signing fix** — Root cause of all admin E2E failures: Better-Auth uses HMAC-SHA-256 signed cookies (`value.base64signature`, URL-encoded). Auth helper was setting raw UUID tokens → signature verification always failed → `getServerSession()` returned null → auth HOC called `notFound()`. Implemented `signCookieValue()` matching better-call's crypto module.
- ✅ **TASK_05: Email collision fix** — `Date.now()` + counter caused duplicate emails in parallel tests. Fixed by using `crypto.randomUUID().slice(0,12)`.
- ✅ **TASK_06: Strict mode fixes** — `getByText(/edit/i)` and `getByText(/winner/i)` matched multiple elements. Fixed with `.first()`.
- ✅ **TASK_07: Test updates** — Updated bracket, scoring, and results specs to use fixture IDs for direct navigation instead of discovering via list pages.
- ✅ **12/12 tests passing in 46.1s** — zero skips, zero failures.

## Files touched

| File | Note |
| --- | --- |
| `apps/web/e2e/helpers/seed-tournament.ts` | New — complete tournament fixture seeder |
| `apps/web/e2e/helpers/fixture.ts` | New — reads `.fixture.json` |
| `apps/web/e2e/global-setup.ts` | New — seeds fixture before all tests |
| `apps/web/e2e/global-teardown.ts` | New — cleans up fixture after all tests |
| `apps/web/e2e/helpers/auth.ts` | HMAC-SHA-256 cookie signing, `crypto.randomUUID()` for unique emails |
| `apps/web/e2e/admin/bracket.spec.ts` | Uses fixture IDs, `.first()` strict mode fix |
| `apps/web/e2e/admin/scoring.spec.ts` | Uses fixture IDs, `.first()` strict mode fix |
| `apps/web/e2e/tournaments/results.spec.ts` | Uses fixture for direct slug navigation |
| `apps/web/playwright.config.ts` | Wired `globalSetup` / `globalTeardown` |
| `docs/sprints/SESSION_0092.md` | This file |

## Decisions resolved

- **Better-Auth cookie format:** `value.base64signature` URL-encoded, signed with HMAC-SHA-256 using `BETTER_AUTH_SECRET`. This is the definitive format for any future auth helpers.
- **Fixture approach:** Global setup/teardown with JSON file on disk (not in-memory) — works because Playwright runs setup in a separate worker.
- **`bunx --bun` required:** Playwright must run under Bun runtime (not Node.js) because `@prisma/adapter-pg` has `bun:` protocol transitive dependencies.
- **Dev server must be pre-started:** `reuseExistingServer: true` in non-CI mode; `webServer.command` doesn't reliably start via `bun run dev`.

## Open decisions / blockers

- `webServer.command` in `playwright.config.ts` needs adjustment for CI (currently `bun run dev` which uses pnpm filter from root)
- Pre-existing i18n warning: `navigation.tools` missing from locale `en` — not introduced, not blocking
- Leftover e2e test data in dev DB may accumulate if teardown doesn't run (interrupted runs) — consider a cleanup script

## Task log

- SESSION_0092_TASK_01 through SESSION_0092_TASK_07 (see "What landed" above)

## Review log

- SESSION_0092_REVIEW_01 (see "Full close evidence" below)

## Hostile close review

- **Giddy verdict:** No Dirstarter docs affected. E2E infra is project-local, no L1 layer replaced.
- **Doug verdict:** Auth cookie signing matches Better-Auth source. No secrets exposed (dev-only BETTER_AUTH_SECRET used, already in `.env`). No cross-brand data leakage risk — seed data is brand-scoped to BASELINE_MARTIAL_ARTS.
- **Score cap:** None.

## ADR / ubiquitous-language check

- No new ADR needed. Cookie signing is an implementation detail of the E2E test helper, not an architectural decision.
- No new domain terms introduced.

## Next session

- **Goal:** Git commit + push sessions 0089–0092 work; then assess next priority from program plan
- **Inputs:** This session's results; `docs/architecture/program-plan.md`
- **First task:** `git add -A && git commit` the E2E infrastructure + session files

---

## Reflections

### Key discovery: Better-Auth signed cookies

This was the most significant debugging win of the E2E sprint. The symptom was subtle: admin pages rendered the not-found layout (which looks like the homepage) instead of showing "404" text. The auth HOC silently failed because `getServerSession()` returned null — and it returned null because cookie signature verification failed. The cookie format is `value.base64signature` (URL-encoded), signed with HMAC-SHA-256 using `BETTER_AUTH_SECRET`. Our auth helper was setting raw UUID tokens without signatures.

**Lesson:** When working with Better-Auth, always sign cookies. The `better-call` package's `getSignedCookie`/`setSignedCookie` functions are the reference implementation. Any test helper that injects sessions must replicate this signing.

### Playwright + Bun runtime

Playwright runs under Node.js by default. The Prisma adapter imports trigger `bun:` protocol errors under Node.js. The fix is `bunx --bun` which forces Bun's runtime. This is a gotcha that will bite anyone who runs `npx playwright test` or `bunx playwright test` (without `--bun`).

### Seed fixture pattern

The global setup/teardown + `.fixture.json` on disk pattern works well. It's simple, debuggable (you can inspect the JSON file), and avoids cross-worker communication issues. The cleanup is deterministic — delete in reverse dependency order. Worth reusing for future E2E test categories.

### Four sessions, one arc

Sessions 0089–0092 formed a tight arc: fix the schema bug → write admin tests → run full suite and fix failures → seed data + cookie signing fix → all green. The incremental approach worked well — each session had a clear, achievable goal and left clean handoff notes.

---

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | No wiki pages or architecture docs touched. E2E files are code, not docs. SESSION files have correct frontmatter. |
| Backlinks/index sweep | No new wiki pages created. No new cross-references needed. |
| Wiki lint | Not run — no wiki pages touched this session. E2E test files only. |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | Giddy: no L1 layer touched. Doug: auth signing matches source, no secrets exposed. |
| Review & Recommend | Next session goal written: yes — git commit/push + assess next priority |
| Memory sweep | Better-Auth cookie signing format (`value.base64sig`, HMAC-SHA-256) is a project-scoped fact worth remembering for any future auth test helpers. `bunx --bun` required for Playwright runs. |
| Next session unblock check | Unblocked — all work is local, no user decisions needed |
| Git hygiene | Branch: `main`. Worktrees: 2 stale codex worktrees + 3 locked claude worktrees (pre-existing). Changes: 5 modified + 6 new files + 4 session docs. Not committed — user to authorize. |
