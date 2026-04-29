---
title: "SESSION 0018 — ADR 0010 cache strategy for auth-scoped queries, S6 prep"
slug: session-0018
type: session
status: in-progress
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0018
sprint: S6-prep
pairs_with:
  - docs/sprints/SESSION_0017.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0018

**Date:** 2026-04-27
**Operator:** Brian + Copilot
**Goal:** Deep research on Next.js `"use cache"` with auth-scoped data. Produce ADR 0010 (cache strategy) that decides how to safely cache privacy-filtered queries without data leakage. Then begin S6 Courses if cache strategy is resolved.
**Status:** closed-quick

---

## Bow-in context

- SESSION_0017 closed-full. S4 browser-verified and formally closed — **Plan Milestone 1 complete** (S1–S4). Payload layer + query refactor (include → select) landed across all entities. Open Brain doctrine + drift register created. Wiki backfilled.
- **Primary open item: D-005 (cache alignment)** — Dirstarter uses `"use cache"` + `cacheTag` + `cacheLife` on all read queries, but all Dirstarter data is public. Ronin has auth-scoped, privacy-filtered queries. Applying the same pattern risks data leakage.
- D-006: `packages/api-client` still not installed.
- D-008: Remote agents can't access local `dirstarter_template/`.
- Current sprint target: S6 — Course + CurriculumItem CRUD.
- Git: `main`.

---

## Inputs

- `docs/knowledge/wiki/drift-register.md` (D-005)
- `docs/architecture/dirstarter-architecture-map.md` (cache section)
- `dirstarter_template/server/web/tools/queries.ts` (reference caching pattern)
- Next.js docs on `"use cache"`, `cacheTag`, `cacheLife` + auth interaction
- Vercel blog posts on per-user caching / `cacheTag` scoping

---

## Plan

### Phase 1: Cache research (Petey — planner)
1. Read Dirstarter's caching pattern in `server/web/tools/queries.ts`
2. Research Next.js `"use cache"` behavior with auth/session data
3. Identify options: per-user cache keys, cache-then-filter, public-only caching, skip caching for auth queries
4. Draft ADR 0010 with recommendation

### Phase 2: S6 Course schema review (if Phase 1 resolves)
1. Review `program-plan.md` S6 deliverable
2. Check existing schema for Course/CurriculumItem models
3. Plan CRUD actions + pages

---

## Execution log

### Phase 1 — Cache research (Petey) ✅

**Research completed:**
1. Read Dirstarter's `server/web/tools/queries.ts` — uses `"use cache"` + `cacheTag("tools")` + `cacheLife("infinite")` on all read queries. All data is public, no auth filtering.
2. Inspected `.next/dev/types/cache-life.d.ts` — confirmed Next.js 16 cache profiles: `default`, `seconds`, `minutes`, `hours`, `days`, `weeks`, `max`, `infinite`, plus custom objects.
3. Fetched Next.js `"use cache"` docs — key finding: cache keys include **all serialized arguments**. Passing `viewerUserId` as a parameter naturally creates per-user cache entries. Cannot call `cookies()`/`headers()` inside `"use cache"`.
4. Reviewed Ronin queries — `getDirectoryProfiles` already accepts `viewerUserId` parameter; `getOrganizationsByBrand` is brand-scoped public data.
5. **Deep-read Dirstarter docs** (https://dirstarter.com/docs) — confirmed no caching guide exists. Caching is undocumented convention. Docs cover: auth (BetterAuth + magic link + social), theming (Tailwind v4 + Radix + shadcn/ui + cva variants), Prisma setup, deployment (Vercel), integrations (Stripe, S3, Resend, Plausible, Upstash Redis for rate limiting). No mention of `"use cache"` anywhere in docs.
6. **Read Dirstarter action client chain** (`lib/safe-actions.ts`): `actionClient` → `userActionClient` → `adminActionClient`. Base client injects `db` + `revalidate` helper that calls `updateTag(tag)` (Next.js 16 API, not `revalidateTag`). This is the mutation-side invalidation pattern we should use.
7. **Read Dirstarter auth** (`lib/auth.ts`): `getServerSession()` wrapped in `React.cache()` for per-request dedup. `lib/auth-hoc.ts` provides `withAuth()`/`withAdminAuth()` for API routes. Session uses `cookieCache: { enabled: true }`.

**ADR 0010 drafted** — three-tier caching strategy:
- **T1 (public):** `"use cache"` + `cacheLife("hours")` — orgs, roles, disciplines
- **T2 (auth-variant):** `"use cache"` + `cacheLife("minutes")` with `viewerUserId` in cache key — directory profiles
- **T3 (per-user private):** `React.cache()` only — passport, memberships

D-005 (cache alignment) resolved.

---

## What landed

- **ADR 0010 drafted** — three-tier cache strategy (T1 public / T2 auth-variant / T3 per-user private)
- **Deep research** of `.next/dev/` build artifacts, Next.js 16 `"use cache"` docs, Dirstarter docs (all pages), Dirstarter source (`lib/safe-actions.ts`, `lib/auth.ts`, `lib/auth-hoc.ts`, `server/web/tools/queries.ts`)
- **D-005 status: DRAFT** — ADR 0010 exists but NOT accepted. Brian flagged insufficient confidence — Dirstarter docs have no caching guide, we're on unsure ground for auth-scoped caching. Need deeper security audit before accepting.

## Files touched

| Path | Note |
| --- | --- |
| `docs/architecture/decisions/0010-cache-strategy.md` | New — DRAFT, not accepted pending deeper review |
| `docs/sprints/SESSION_0018.md` | This session |

## Decisions resolved

- None fully resolved. ADR 0010 is draft status pending deeper Dirstarter docs audit + security review.

## Open decisions / blockers

- **D-005: Cache alignment** — ADR 0010 drafted but NOT accepted. Brian wants exhaustive Dirstarter docs audit + security risk inventory before committing to a caching strategy. Dirstarter docs are gospel — we don't deviate.
- **D-006:** `packages/api-client` still not installed
- **D-008:** Remote agents can't access local `dirstarter_template/`
- **D-009 (NEW):** ADR 0010 assumes `"use cache"` argument-based keying is safe for auth-scoped data. This assumption is untested. Need to verify against all Dirstarter patterns + Next.js security guidance.

## Next session

- **Goal:** Petey plan — exhaustive Dirstarter docs + security audit. Produce a complete risk inventory for auth-scoped caching and data leakage vectors. Validate or reject ADR 0010 with evidence. Dirstarter docs are source of truth (L1).
- **Inputs to read:**
  - ALL Dirstarter docs pages (see TASK list in SESSION_0019)
  - `dirstarter_template/` source: every file in `server/`, `lib/`, `proxy.ts`, `next.config.ts`
  - ChatGPT deep-dive output (Brian will provide from parallel session)
  - Next.js 16 security/data-security guide
  - ADR 0010 (draft)
- **First task:** TASK_01 — Exhaustive Dirstarter docs page inventory (every URL, every pattern documented)
- **Agent note:** Brian is running a parallel ChatGPT session to do its own exhaustive Dirstarter docs deep-dive. Results will be input to SESSION_0019. This is a Petey (planner) session — no code until the security model is validated.
