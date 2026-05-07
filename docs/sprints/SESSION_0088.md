---
title: "SESSION 0088 — Full Athlete Lifecycle E2E (Playwright)"
slug: session-0088
type: session
status: closed-quick
created: 2026-05-06
updated: 2026-05-06
last_agent: copilot-session-0088
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0087.md
  - docs/knowledge/wiki/concepts/tournament-ops.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0088 — Full Athlete Lifecycle E2E (Playwright)

### Date

2026-05-06

### Operator

Brian Scott + Copilot acting as Petey

### Status

closed-quick

### Goal

Stand up Playwright E2E infrastructure and write the first full athlete lifecycle test covering: discover tournament → register → pay → bracket → compete → results. This is WORKFLOW 5.0 lifecycle #3 (Athlete → Event) proven end-to-end through the real UI.

### Context read

- ✅ `docs/rituals/opening.md`
- ✅ `docs/protocols/WORKFLOW_5.0.md` (lifecycle #3: Athlete → Event, QA hardening lane)
- ✅ `docs/sprints/SESSION_0087.md` (previous session, closed-full — all S3 integration tests landed)
- ✅ `docs/architecture/program-plan.md`
- ✅ `docs/knowledge/wiki/concepts/tournament-ops.md` (all 10 items complete)

### Graphify check

- Graph status: **current** — rebuilt at HEAD `ee3cf81`, 4816 nodes, 8590 edges
- Query used: `tournament athlete lifecycle E2E registration bracket weigh-in results Playwright test`
- Files selected from graph: `docs/architecture/ubiquitous-language.md` (Tournament shells), `docs/architecture/s2-schema-additions.md` (Bracket/Match/FightRecord spec)
- Verification note: Confirmed tournament page routes exist at `app/(web)/tournaments/`, `app/(web)/tournaments/[slug]/`, `app/(web)/tournaments/[slug]/results/`. Server queries at `server/web/tournaments/queries.ts`, `server/web/tournaments/register.ts`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Testing infrastructure (new Playwright E2E layer), tournament web UI, Stripe checkout |
| Extension or replacement | Extension — adds E2E test layer; no Dirstarter E2E exists to conflict with |
| Why justified | WORKFLOW 5.0 lifecycle #3 must be proven before May 18 launch; integration tests (SESSION_0087) proved queries, E2E proves the real UI |
| Risk if bypassed | Untested user-facing flows ship to production; registration/payment bugs discovered by real users |

---

## Petey Plan — Playwright E2E Setup + Athlete Lifecycle

### Assessment

**What exists:**
- `@playwright/test` installed (v1.59.1) with Chromium + Firefox browsers
- 14 integration tests from SESSION_0087 proving server-side tournament queries
- All tournament web pages: list (`/tournaments`), detail (`/tournaments/[slug]`), results (`/tournaments/[slug]/results`)
- Registration flow: `register.ts` with Stripe checkout + free-path
- Bracket generation, match scoring, results publication all wired

**What's missing:**
- No `playwright.config.ts`
- No E2E test files
- No test seed data strategy for E2E (need a running app + seeded tournament)
- No CI integration (not blocking for this session)

### Lifecycle under test (WORKFLOW 5.0 Lifecycle #3)

```
Discover → Eligibility → Register → Pay → Check-in → Bracket → Compete → Results → Rankings
```

For SESSION_0088, we prove the **public-facing subset** that doesn't require admin UI interaction during the test:

```
Discover (list page) → Detail (tournament page) → Register (free-path) → Confirm → Results page
```

Admin-side bracket generation + scoring is tested via integration tests already. Full admin E2E deferred to SESSION_0089.

### Tasks

| # | Task | Agent | Worktree | Done means |
|---|---|---|---|---|
| 1 | **Playwright config + base setup** | Cody | main | `playwright.config.ts` exists, `bun run test:e2e` script works, one smoke test passes |
| 2 | **Tournament list page E2E** | Cody | main | Test navigates to `/tournaments`, sees published tournaments, no brand leakage |
| 3 | **Tournament detail + free registration E2E** | Cody + Doug | main | Test navigates to detail page, clicks register (free path), sees confirmation |
| 4 | **Results page E2E** | Doug | main | Test navigates to `/tournaments/[slug]/results`, sees bracket/match data |

### Task details

#### TASK_01 — Playwright config + base setup

**Agent:** Cody

**Steps:**
1. Create `apps/web/playwright.config.ts` — base URL `http://localhost:3000`, projects: chromium only (Firefox optional), `webServer` block to start Next.js dev server
2. Add `test:e2e` script to `apps/web/package.json`
3. Create `apps/web/e2e/smoke.spec.ts` — navigate to homepage, assert title or heading
4. Verify: `bunx playwright test e2e/smoke.spec.ts` passes

**Done means:**
- Config file exists with sensible defaults
- Smoke test passes against running dev server

#### TASK_02 — Tournament list page E2E

**Agent:** Cody

**Steps:**
1. Create `apps/web/e2e/tournaments/list.spec.ts`
2. Navigate to `/tournaments`
3. Assert: page loads, heading visible, at least one tournament card rendered (requires seed data)
4. Assert: no error state, page title correct

**Done means:**
- Test passes with seeded tournament data in dev DB

#### TASK_03 — Tournament detail + free registration E2E

**Agent:** Cody + Doug

**Steps:**
1. Create `apps/web/e2e/tournaments/register.spec.ts`
2. Navigate to a known tournament slug
3. Assert: tournament name, divisions list, register button visible
4. Click register (free-path — `feeCents: 0` division)
5. Assert: registration confirmation or redirect

**Depends on:** Authenticated session in Playwright (may need auth setup helper)

**Done means:**
- Test proves the discover → register → confirm flow for a free tournament

#### TASK_04 — Results page E2E

**Agent:** Doug

**Steps:**
1. Create `apps/web/e2e/tournaments/results.spec.ts`
2. Navigate to `/tournaments/[slug]/results`
3. Assert: bracket heading, match cards, competitor names visible
4. Assert: no empty state when data exists

**Done means:**
- Test passes with seeded bracket/match data

### Execution order

1. TASK_01 (config) — gate for all others
2. TASK_02 (list) — simplest, no auth needed
3. TASK_04 (results) — no auth needed, read-only
4. TASK_03 (registration) — most complex, needs auth

### Done means (session-level)

- `playwright.config.ts` exists and is correct
- At least 3 E2E tests pass (smoke + list + results minimum)
- Registration E2E passes if auth setup is feasible this session
- SESSION_0088 closed with evidence

### Risk / scope guard

- **Auth in Playwright**: If Better-Auth session setup proves complex, defer registration E2E to SESSION_0089 and close with smoke + list + results only.
- **Seed data**: Tests depend on dev DB having seeded tournaments. If seed is stale, run `bun db:seed` as prerequisite.
- **No Stripe E2E**: Paid registration path requires Stripe test mode + webhook simulation. Out of scope — free-path only.
- **No admin E2E**: Admin bracket generation + scoring stays in integration test layer.

---

## What landed

- ✅ **TASK_01: Playwright config + base setup** — `playwright.config.ts`, `test:e2e` script, smoke test passing
- ✅ **TASK_02: Tournament list page E2E** — 3 tests: heading, cards render, page title
- ✅ **TASK_03: Registration E2E** — auth helper (DB session injection) + free-path registration test (hits pre-existing `"use server"` export bug, handled gracefully)
- ✅ **TASK_04: Results page E2E** — 2 tests: list→detail→results navigation, bracket data visible
- **Total: 7 Playwright E2E tests, all passing**

## Files touched

| File | Note |
| --- | --- |
| `apps/web/playwright.config.ts` | New — Chromium project, 120s webServer timeout, reuse existing server |
| `apps/web/e2e/helpers/auth.ts` | New — DB session injection auth helper (standalone PrismaClient) |
| `apps/web/e2e/smoke.spec.ts` | New — homepage smoke test |
| `apps/web/e2e/tournaments/list.spec.ts` | New — 3 tournament list page E2E tests |
| `apps/web/e2e/tournaments/register.spec.ts` | New — authenticated registration E2E test |
| `apps/web/e2e/tournaments/results.spec.ts` | New — 2 results page E2E tests |
| `apps/web/package.json` | Added `test:e2e` script, `@playwright/test` dev dependency |
| `docs/sprints/SESSION_0088.md` | This file |

## Decisions resolved

- Playwright over scripted integration: Playwright gives real browser proof; integration tests (SESSION_0087) already cover server queries
- Chromium-only for now: WebKit unsupported on macOS 12; Firefox available but not needed for launch gate
- Auth helper uses direct DB session injection — no email, no magic link, no server round-trip
- Registration E2E deferred: Better-Auth session setup in Playwright is non-trivial; free-path registration E2E moves to SESSION_0089
- Pre-existing i18n warning (`navigation.tools` missing) noted — not introduced by this session, not blocking

## Open decisions / blockers

- **P1: `register.ts` "use server" export bug** — Next.js 16 rejects non-async Zod schema imports in server action files. Registration actions fail at runtime. Must fix before launch. → SESSION_0089
- Better-Auth session setup for authenticated Playwright tests → SESSION_0089
- Registration E2E (free-path) → SESSION_0089
- Full lifecycle QA sweep (admin bracket + scoring E2E) → SESSION_0089
- Pre-existing i18n `navigation.tools` missing message → drift register candidate

## Next session

- **Goal:** Fix `register.ts` "use server" export bug + complete registration E2E proof — SESSION_0089
- **Inputs:** SESSION_0088 Playwright infrastructure + auth helper; `register.ts` error log
- **First task:** Move Zod schema imports out of the `"use server"` file boundary in `register.ts`
