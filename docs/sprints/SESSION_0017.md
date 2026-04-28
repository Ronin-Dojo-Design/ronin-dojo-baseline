---
title: "SESSION 0017 — Browser-verify S4 directory (close S4), S2–S4 pattern remediation"
slug: session-0017
type: session
status: closed-full
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0017
health: 5
sprint: S4/S6-prep
pairs_with:
  - docs/sprints/SESSION_0016.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0017

**Date:** 2026-04-27
**Operator:** Brian + Copilot
**Goal:** Browser-verify S4 directory (close S4), then execute S2–S4 pattern remediation (payloads + caching + select refactor) as S6 pre-work.
**Status:** closed-full

---

## Bow-in context

- SESSION_0016 closed-full. TASK_05 (ADR 0009) + TASK_06 (`packages/api-client/`) landed. Dirstarter architecture map + S2–S4 pattern audit created.
- **S4 browser verification still pending** — needs dev server + Brian's manual test of `/directory`.
- Open items from S16: wiki/index.md not updated with new docs, `packages/api-client` not installed.
- Current sprint: S4 close-out + S6 pre-work (pattern remediation).
- Git: `main`.

---

## Plan

### Phase 1: S4 Browser Verification (Brian-driven)
1. Start dev server → Brian navigates `baseline.local:3000/directory`
2. Verify: auth vs unauth views, visibility filtering, filters work
3. If pass → S4 formally closed ✅

### Phase 2: S2–S4 Pattern Remediation (Cody)
From `docs/architecture/s2-s4-pattern-audit.md`:
1. Create `server/web/organization/payloads.ts` (reference: Dirstarter's `server/web/tools/payloads.ts`)
2. Add `"use cache"` + cacheTag on queries
3. Refactor `include` → `select` in Org queries
4. `/me` page — add `<Intro>` pattern

---

## Execution log

### Phase 1 — S4 Browser Verification ✅

- **Bug found:** `localhost` wasn't in `HOST_TO_BRAND` map → defaulted to `RONIN_DOJO_DESIGN` which has zero directory profiles. All seed data is `BASELINE_MARTIAL_ARTS`.
- **Fix:** Added `"localhost": Brand.BASELINE_MARTIAL_ARTS` to `proxy.ts` HOST_TO_BRAND map for MVP dev convenience.
- **Result:** Brian confirmed directory profiles render at `localhost:3000/directory`. **S4 formally closed.** ✅

### Phase 2 — Payload files ✅

Created Dirstarter L1 payload files:
- `server/web/passport/payloads.ts` — `passportOnePayload`, `directoryProfileOnePayload` with `satisfies Prisma.*Select` + exported types
- `server/web/organization/payloads.ts` — `organizationManyPayload`, `organizationOnePayload`, `organizationDetailPayload` with discipline/owner/membership sub-payloads
- `server/web/directory/payloads.ts` — `directoryProfileListPayload` with user/membership/rankAward sub-payloads + filter option payloads

### Phase 3 — Query refactor (include → select via payloads) ✅

- Organization queries: all 4 functions (`getById`, `getBySlug`, `getByInviteCode`, `getByBrand`) refactored from `include` to `select` using payloads
- Passport queries: both functions now use `select` with payloads
- Directory queries: `getDirectoryProfiles` refactored from `include` to `select` using payloads; `getDirectoryFilterOptions` uses filter payloads

### Phase 4 — Cache alignment ⏭️ DEFERRED

Dirstarter uses `"use cache"` + `cacheTag` + `cacheLife` on read queries. However, Ronin's directory/org queries are auth-scoped (visibility depends on viewer). Global caching risks data leakage — a critical bug class per our architecture rules. **Deferred until we have a clear scoped-caching strategy.** Noted for S6.

### Phase 5 — `/me` page shell alignment ✅

- Replaced raw `<div>/<h1>/<p>` with Dirstarter's `<Intro>/<IntroTitle>/<IntroDescription>` + `<Section>/<Section.Content>` pattern

### Phase 6 — Open Brain wiki update ✅

- Wiki log backfilled from SESSION_0007 through SESSION_0017 (was stale — D-001 resolved)
- Wiki index updated: SESSION_0016/0017, Dirstarter architecture map, S2–S4 audit, ADR 0009, Open Brain concept, Drift Register
- Created `docs/knowledge/wiki/concepts/open-brain-repo-memory.md` — doctrine for compounding repo memory
- Created `docs/knowledge/wiki/drift-register.md` — 8 drift items tracked, 4 resolved this session

---

## What landed

- **S4 formally closed.** Plan Milestone 1 (S1–S4) complete ✅
- **Brand mapping fix:** `localhost` → `BASELINE_MARTIAL_ARTS` in `proxy.ts`
- **Payload layer:** 3 new files (`passport/payloads.ts`, `organization/payloads.ts`, `directory/payloads.ts`) following Dirstarter L1 `satisfies Prisma.*Select` pattern
- **Query refactor:** All org/passport/directory queries migrated from `include` to payload-based `select`
- **Page shell:** `/me/page.tsx` now uses `<Intro>/<Section>` pattern
- **Wiki current:** log backfilled, index updated, Open Brain doctrine + drift register created
- **Dirstarter cache research:** confirmed Dirstarter has zero docs on auth-scoped caching — all their data is public. Our problem is novel.

## Files touched

| Path | Note |
| --- | --- |
| `apps/web/proxy.ts` | Added `localhost` → `BASELINE_MARTIAL_ARTS` brand mapping |
| `apps/web/server/web/passport/payloads.ts` | New — Passport + DirectoryProfile payloads |
| `apps/web/server/web/organization/payloads.ts` | New — Organization many/one/detail payloads |
| `apps/web/server/web/directory/payloads.ts` | New — Directory listing + filter option payloads |
| `apps/web/server/web/organization/queries.ts` | Refactored include → select via payloads |
| `apps/web/server/web/passport/queries.ts` | Added select with payloads |
| `apps/web/server/web/directory/queries.ts` | Refactored include → select via payloads |
| `apps/web/app/(web)/me/page.tsx` | Intro/Section pattern applied |
| `docs/architecture/program-plan.md` | S4 marked ✅ |
| `docs/knowledge/wiki/index.md` | Updated with SESSION_0016/0017, new docs |
| `docs/knowledge/wiki/log.md` | Backfilled SESSION_0008–0017 |
| `docs/knowledge/wiki/concepts/open-brain-repo-memory.md` | New — repo memory doctrine |
| `docs/knowledge/wiki/drift-register.md` | New — contradiction tracking |
| `docs/sprints/SESSION_0017.md` | This session |

## Decisions resolved

- **S4 closed** — browser-verified, Plan Milestone 1 complete
- **Payload pattern adopted** — all entities now use Dirstarter's `satisfies Prisma.*Select` + exported types
- **Query pattern standardized** — `select` via payloads, not inline `include`
- **Open Brain doctrine written** — three-brain model, six rules, provenance tracking

## Open decisions / blockers

- **D-005: Cache alignment** — Dirstarter's `"use cache"` + `cacheTag` pattern doesn't address auth-scoped data. Needs deep research before applying to Ronin's privacy-filtered queries.
- **D-006:** `packages/api-client` still not installed (`pnpm install` not run)
- **D-008:** Remote agents (Claude/Codex) can't access local `dirstarter_template/` — key patterns should be committed as wiki file pages

## Next session

- **Goal:** Deep research on Next.js `"use cache"` with auth-scoped data. Produce ADR 0010 (cache strategy) that decides how to safely cache privacy-filtered queries without data leakage. Then begin S6 Courses if cache strategy is resolved.
- **Inputs to read:**
  - `docs/knowledge/wiki/drift-register.md` (D-005 is the primary target)
  - `docs/architecture/dirstarter-architecture-map.md` (cache section)
  - `dirstarter_template/server/web/tools/queries.ts` (reference caching pattern)
  - Next.js docs on `"use cache"` directive, `cacheTag`, `cacheLife` — specifically how they interact with auth/session data
  - Vercel blog posts on per-user caching / `cacheTag` scoping
  - Industry patterns for caching auth-filtered Prisma queries in Next.js App Router
- **First task:** Petey role — research and draft ADR 0010 (cache strategy for auth-scoped queries). Consider: per-user cache keys, cache-then-filter, public-only caching, or skip caching for auth queries entirely.
- **Agent note:** This session is best run in **Claude or Codex CLI** with web access to fetch Next.js/Vercel docs on `"use cache"` scoping. The local `dirstarter_template/` has no docs on this — all Dirstarter queries are public data with no auth filtering.

