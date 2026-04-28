---
title: "SESSION 0019 — PETEY PLAN: Dirstarter docs audit + security risk inventory for auth-scoped caching"
slug: session-0019
type: session
status: planned
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0018
health: 5
sprint: S6-prep
pairs_with:
  - docs/sprints/SESSION_0018.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0019

**Date:** TBD (next session)
**Operator:** Brian + Agent (Claude/Copilot/ChatGPT)
**Goal:** Petey plan — exhaustive Dirstarter docs audit + security risk inventory. Validate or reject ADR 0010 with evidence. Dirstarter docs are source of truth (L1 gospel). No code until the security model is validated.
**Status:** planned
**Role:** Petey (planner)

---

## Bow-in context

- SESSION_0018 produced ADR 0010 (draft) — three-tier cache strategy. Brian flagged insufficient confidence. Dirstarter docs contain NO caching guide. We're building auth-scoped caching on top of a template that only does public data caching. This is novel territory and a data leakage risk.
- Brian is running a parallel ChatGPT deep-dive on ALL Dirstarter docs pages. Results will be input to this session.
- **Principle:** Dirstarter docs (https://dirstarter.com/docs) are L1 gospel truth. We do not deviate from documented patterns. Where Dirstarter is silent, we must proceed with extreme caution and explicit risk acknowledgment.

---

## PETEY PLAN — 5 Tasks

### TASK_01: Exhaustive Dirstarter docs page inventory

**Objective:** Read and catalog EVERY page in the Dirstarter docs. Produce a single-page reference listing every documented pattern, convention, and constraint.

**Pages to read (from sidebar navigation):**

| # | URL | Topic |
| --- | --- | --- |
| 1 | `/docs/introduction` | What is Dirstarter, tech stack, scope |
| 2 | `/docs/getting-started` | Setup, install, dev server |
| 3 | `/docs/environment-setup` | Env vars |
| 4 | `/docs/first-steps` | First data, demo |
| 5 | `/docs/codebase/structure` | File/folder organization |
| 6 | `/docs/codebase/ide` | VSCode/Cursor setup |
| 7 | `/docs/codebase/linting` | Biome/OXC formatting |
| 8 | `/docs/codebase/updates` | Upstream update process |
| 9 | `/docs/integrations` | Overview |
| 10 | `/docs/integrations/email` | Resend + React Email |
| 11 | `/docs/integrations/storage` | S3 |
| 12 | `/docs/integrations/payments` | Stripe |
| 13 | `/docs/integrations/media` | ScreenshotOne |
| 14 | `/docs/integrations/rate-limiting` | Upstash Redis |
| 15 | `/docs/integrations/analytics` | Plausible |
| 16 | `/docs/authentication` | BetterAuth, magic link, social, roles, route/action protection |
| 17 | `/docs/theming` | Tailwind v4, Radix, shadcn/ui, cva |
| 18 | `/docs/i18n` | next-intl |
| 19 | `/docs/database/prisma` | Prisma setup, schema, migrations, seed |
| 20 | `/docs/database/hosting` | Postgres hosting options |
| 21 | `/docs/deployment` | Vercel deploy |
| 22 | `/docs/cron-jobs` | Cron/scheduled tasks |
| Any others discovered in sidebar | — | — |

**Output:** `docs/knowledge/wiki/dirstarter-docs-inventory.md` — one section per page, listing key patterns and constraints.

**Done when:** Every page read, every pattern cataloged, no gaps.

---

### TASK_02: Dirstarter source audit — security-relevant patterns

**Objective:** Read every security-relevant file in local `dirstarter_template/` and catalog the patterns Dirstarter uses for auth, data access, and route protection. Focus on what Dirstarter does NOT do (gaps we're filling).

**Files to read:**

| File | Why |
| --- | --- |
| `proxy.ts` | Route protection middleware, host→brand mapping |
| `next.config.ts` | Feature flags, `cacheComponents`, experimental settings |
| `lib/auth.ts` | BetterAuth config, session, plugins |
| `lib/auth-hoc.ts` | `withAuth()` / `withAdminAuth()` HOCs |
| `lib/safe-actions.ts` | Action client chain, `revalidate` helper, `updateTag` |
| `services/db.ts` | Prisma client setup, any extensions |
| `server/web/tools/queries.ts` | Reference caching pattern (`"use cache"` + `cacheTag` + `cacheLife`) |
| `server/web/tools/payloads.ts` | Payload/select pattern |
| `server/web/*/queries.ts` | All other query files — do ANY take auth context? |
| `server/admin/*/queries.ts` | Admin queries — how are they protected? |
| `app/(web)/layout.tsx` | Does layout read session? |
| `app/admin/layout.tsx` | Admin layout auth check |

**Output:** `docs/knowledge/wiki/dirstarter-security-audit.md` — patterns observed, gaps identified, risks for Ronin's auth-scoped extension.

**Done when:** Every security-relevant file read, patterns documented, gaps explicitly listed.

---

### TASK_03: Data leakage risk inventory

**Objective:** Enumerate every vector where Ronin's auth-scoped data could leak to the wrong user. This is the critical deliverable — a risk register.

**Risk vectors to evaluate:**

1. **Cache key collision** — Can two different users get the same cache entry? Under what conditions?
2. **Stale auth state** — If a user's session expires or role changes, do cached entries reflect the old state? For how long?
3. **`React.cache` isolation** — `React.cache` is request-scoped, `"use cache"` is cross-request. What happens if we mix them incorrectly?
4. **Brand scoping** — Can a user on Brand A see data from Brand B through cache? (The `brand` param should be in cache key, but verify.)
5. **Visibility enum** — DirectoryProfile visibility (HIDDEN/MEMBERS_ONLY/PUBLIC). If a profile owner changes visibility from PUBLIC to HIDDEN, how long until the cache reflects this?
6. **Per-field privacy flags** — `showEmail`, `showPhone` etc. If these change, does the cache serve stale data with the old flag values?
7. **Membership-scoped data** — Future features (private orgs, instructor-only courses). If we add these, does T2 caching handle it or do we need T3?
8. **SSR vs client cache** — Next.js client-side router cache (`stale` time). Can a logged-out user see cached content from their logged-in session?
9. **Serverless cold start** — On Vercel serverless, in-memory cache doesn't persist across invocations. Does this help or hurt our security model?
10. **Preview deployments** — Vercel preview URLs share the same DB. Can preview deployment caches leak into production?

**Output:** `docs/architecture/cache-risk-register.md` — each risk with severity (critical/high/medium/low), likelihood, mitigation, and status.

**Done when:** All 10+ vectors evaluated with evidence-based assessment.

---

### TASK_04: Validate or reject ADR 0010

**Objective:** Using outputs from TASK_01–03, make a go/no-go decision on ADR 0010 (three-tier cache strategy).

**Decision criteria:**

- If ALL critical risks have mitigations AND Dirstarter patterns support the approach → **Accept ADR 0010** (possibly with amendments)
- If ANY critical risk has no mitigation → **Reject ADR 0010**, document why, propose alternative
- If Dirstarter docs explicitly contradict any assumption in ADR 0010 → **Reject and rewrite**

**Possible alternatives if rejected:**

- A. Skip `"use cache"` entirely for auth-scoped queries. Use `React.cache()` only (current state). Accept the performance cost.
- B. Use `"use cache"` ONLY for T1 (public) queries. T2/T3 stay as `React.cache()`.
- C. Use `"use cache"` for T2 but with a shorter `cacheLife` (e.g., `"seconds"`) to minimize stale data window.
- D. Defer all caching to post-MVP. Ship without `"use cache"` anywhere. Add it in S11/S12 with load testing.

**Output:** Updated `docs/architecture/decisions/0010-cache-strategy.md` — status changed to `accepted` or `rejected` with rationale.

**Done when:** Decision made, ADR updated, all task outputs cross-referenced.

---

### TASK_05: Merge ChatGPT deep-dive findings

**Objective:** Brian's parallel ChatGPT session is producing its own Dirstarter docs analysis. Merge those findings with TASK_01–04 outputs. Resolve any contradictions.

**Process:**

1. Brian pastes or commits ChatGPT output
2. Agent reads and cross-references against TASK_01 inventory and TASK_02 source audit
3. Flag any findings from ChatGPT that contradict local source code or our own analysis
4. Update wiki docs and risk register with merged findings
5. If ChatGPT found docs pages we missed, read them

**Output:** All wiki docs updated, contradictions resolved, SESSION_0019 closed with merged findings.

**Done when:** Single source of truth across both analysis streams.

---

## Execution log

*(planned — not yet started)*

---

## What landed

*(pending)*

## Files touched

*(pending)*

## Decisions resolved

*(pending)*

## Open decisions / blockers

*(carried from SESSION_0018)*

- D-005: Cache alignment — ADR 0010 draft, pending validation (TASK_04)
- D-006: `packages/api-client` still not installed
- D-008: Remote agents can't access local `dirstarter_template/`
- D-009: ADR 0010 auth-scoped caching assumptions untested

## Next session

*(pending — depends on TASK_04 outcome)*
