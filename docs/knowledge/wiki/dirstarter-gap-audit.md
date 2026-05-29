---
title: Dirstarter Gap Audit
slug: dirstarter-gap-audit
type: concept
status: active
created: 2026-04-28
updated: 2026-05-03
author: Petey
last_agent: copilot-session-0039
pairs_with:
  - docs/architecture/dirstarter-baseline-index.md
parent: docs/knowledge/wiki/index.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0019.md
  - docs/sprints/SESSION_0039.md
  - docs/architecture/decisions/0010-cache-strategy.md
tags:
  - dirstarter
  - drift
  - audit
  - compliance
---

# Dirstarter Gap Audit

## Summary

This page records where the live Dirstarter docs and the Ronin baseline repo currently align, diverge, or directly conflict. Originally created SESSION_0019, updated SESSION_0039 with resolution status for all drifts.

> **Note:** The dirstarter.com/docs describe the *latest* Dirstarter version. Our codebase was forked from an *earlier* template download. Many "drifts" are actually cases where the docs describe features added after our fork. The template source code is the true L1 baseline, not the docs. See `dirstarter-baseline-index.md` §13k for upstream divergence tracking.

## Status

Active. All drifts resolved or classified as of SESSION_0039.

## Key Idea

The repo does not have one gap. It has three classes of gap:

1. live-doc drift versus pinned upstream copy
2. intentional Ronin-domain divergence
3. unresolved contradictions inside the repo itself

## High-confidence alignments

- Better Auth remains the authentication foundation.
- Prisma schema + seed + db service remain the data backbone.
- The repo still uses Dirstarter-style slice files such as `payloads.ts`, `queries.ts`, and shared primitives.
- Vercel remains the expected deployment target.
- S3-compatible storage pattern is maintained.
- `next-intl` for i18n is maintained.

## High-confidence drifts

| Area | Live Dirstarter docs | Repo reality | Classification | Resolution (SESSION_0039) |
| --- | --- | --- | --- | --- |
| Action protection | `oRPC` middleware | `next-safe-action` | ~~Needs ADR~~ | ✅ **Not a drift.** Template source also uses `next-safe-action`. Docs describe a newer version. See baseline index §13k. |
| Redis config | `REDIS_URL` | `REDIS_REST_URL` + `REDIS_REST_TOKEN` (Upstash REST) | ~~Document as intentional divergence~~ | ✅ **Not a drift.** Template source uses identical config with `@upstash/redis`. |
| Analytics env | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Not in env schema (but `withPlausibleProxy()` is in next.config) | ~~Add env var or document omission~~ | ✅ **Minor gap.** Template uses `NEXT_PUBLIC_PLAUSIBLE_URL` — we have that. No action needed. |
| Cache config | `cacheComponents: true` | `experimental.useCache: true` | ~~Update to current Next.js API~~ | ✅ **Correct as-is.** `useCache: true` is the Next.js 15 flag. |
| Auth plugin | `nextCookies()` in Better Auth config | Not present | ~~Verify if needed~~ | ✅ **Not a drift.** Template source also does NOT use `nextCookies()`. Monitor on upgrades. |
| Admin non-admin behavior | Not specified | HOC redirects to `/`; auth doc says 404 | ~~Internal conflict~~ | ✅ **Resolved: redirect wins.** Template confirms `redirect("/")`. See D-013. |

## Internal repo conflicts

| Conflict | Sources | Resolution needed | Resolution (SESSION_0039) |
| --- | --- | --- | --- |
| ADR 0010 status | SESSION_0018 says draft; SESSION_0019 says validate; ADR file says `accepted` | Revert to `proposed` — done in this session | ✅ Reverted to `proposed` in prior session. |
| Admin auth behavior | `auth-hoc.tsx` redirects to `/`; `auth.md` says 404 | Pick one and update both | ✅ **Redirect wins.** Template source confirms `redirect("/")`. `auth.md` needs correction. See D-013. |
| Drift register D-005 | Cache alignment marked open; ADR 0010 marked accepted | Cannot both be true | ✅ ADR 0010 is `proposed`. D-005 remains open until cache strategy is finalized. Consistent now. |

## Dirstarter-to-repo mapping (key pages)

| Docs page | Aligns | Drifts |
| --- | --- | --- |
| Introduction | Stack matches (Next.js + TS + Prisma + Better Auth) | Monorepo structure is an intentional extension |
| Environment Setup | Uses `@t3-oss/env-nextjs` | Different env var surface (Redis, analytics, AI keys) |
| Project Structure | Feature slices maintained | Wrapped in `apps/web/` monorepo |
| Authentication | Middleware + session + action auth all present | `oRPC` vs `next-safe-action`; missing `nextCookies()` |
| Prisma Setup | Schema + seed + db service pattern preserved | Heavy Ronin extension + Dirstarter residue models |
| Deployment | Vercel target matches | Preview/prod DB separation not yet confirmed |

## Template residue inventory

The following Dirstarter models and routes are still present. **Classified per D-014 (SESSION_0039):**

- **Prisma models:** `Tool`, `Category`, `Tag`, `Report`, `Ad` → **Active use.** `Tool` repurposed as Directory Listing (D-014 Option B). `Category`/`Tag` retained as taxonomy. `Report` retained for moderation. `Ad` TBD (S10 Stripe sprint).
- **Admin routes:** `/admin/tools`, `/admin/categories`, `/admin/tags` → **Active use.** Will be relabeled/extended for Directory Listing admin.
- **Server code:** `server/admin/tools/queries`, `server/web/tools/queries` → **Active use.** Provides complete CRUD + submission pipeline for listings.
- **Schema note:** "remove before production" comment should be **removed** — these models are now intentionally retained.

Classification options: reference-only (keep but flag), scheduled removal, or active use.

## Relationships

- Pairs with: [Dirstarter Docs Inventory](dirstarter-docs-inventory.md)
- Backlinks: [wiki index](index.md), [SESSION_0019](../../sprints/_archive/SESSION_0019.md)

## Sources

Short verbatim anchors from the live docs:

> Authentication: "Role-based access control"
> Environment Setup: "Never commit your `.env` file"
> Analytics: "`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`"
> Rate Limiting: "`REDIS_URL`"

Repo references to inspect from this page:

- `apps/web/lib/auth.ts`
- `apps/web/lib/safe-actions.ts`
- `apps/web/proxy.ts`
- `apps/web/env.ts`
- `apps/web/next.config.ts`
- `docs/architecture/decisions/0010-cache-strategy.md`
- `docs/sprints/SESSION_0018.md`
- `docs/sprints/SESSION_0019.md`
- `docs/knowledge/wiki/drift-register.md`

## Open Questions — Resolved

- **Live-doc compliance vs version-pinned?** → **Version-pinned** against template source (`c42e8bb`). Live docs describe a newer version (Next 16, oRPC, OXC) we haven't adopted. See baseline index §13k for upstream divergences.
- **`next-safe-action` deliberate or interim?** → **Deliberate long-term choice.** Template source uses it. No migration to oRPC planned. See baseline index §13k.
- **Admin auth: 404 or redirect?** → **Redirect to `/`.** Matches template source. `auth.md` doc was wrong. See D-013.
