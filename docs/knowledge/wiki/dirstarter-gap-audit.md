---
title: Dirstarter Gap Audit
slug: dirstarter-gap-audit
type: concept
status: deprecated
created: 2026-04-28
updated: 2026-04-28
author: Petey
last_agent: session-0019-petey
pairs_with:
  - docs/knowledge/wiki/dirstarter-docs-inventory.md
parent: docs/knowledge/wiki/index.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0019.md
  - docs/architecture/decisions/0010-cache-strategy.md
needs_fix:
  - "Add file-level backlinks once the auth/env/cache pages are updated"
  - "Re-run this audit after ADR 0010 rewrite"
tags:
  - dirstarter
  - drift
  - audit
  - compliance
---

# Dirstarter Gap Audit

## Summary

This page records where the live Dirstarter docs and the Ronin baseline repo currently align, diverge, or directly conflict. It is the canonical gap register for SESSION_0019.

## Status

Active. Findings are evidence-backed but not all follow-up edits are complete.

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

| Area | Live Dirstarter docs | Repo reality | Classification |
| --- | --- | --- | --- |
| Action protection | `oRPC` middleware | `next-safe-action` | Needs ADR — intentional or interim? |
| Redis config | `REDIS_URL` | `REDIS_REST_URL` + `REDIS_REST_TOKEN` (Upstash REST) | Document as intentional divergence |
| Analytics env | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Not in env schema (but `withPlausibleProxy()` is in next.config) | Add env var or document omission |
| Cache config | `cacheComponents: true` | `experimental.useCache: true` | Update to current Next.js API |
| Auth plugin | `nextCookies()` in Better Auth config | Not present | Verify if needed for current Better Auth version |
| Admin non-admin behavior | Not specified | HOC redirects to `/`; auth doc says 404 | Internal conflict — resolve |

## Internal repo conflicts

| Conflict | Sources | Resolution needed |
| --- | --- | --- |
| ADR 0010 status | SESSION_0018 says draft; SESSION_0019 says validate; ADR file says `accepted` | Revert to `proposed` — done in this session |
| Admin auth behavior | `auth-hoc.tsx` redirects to `/`; `auth.md` says 404 | Pick one and update both |
| Drift register D-005 | Cache alignment marked open; ADR 0010 marked accepted | Cannot both be true |

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

The following Dirstarter models and routes are still present and should be classified:

- **Prisma models:** `Tool`, `Category`, `Tag`, `Report`, `Ad`
- **Admin routes:** `/admin/tools`, `/admin/categories`, `/admin/tags`
- **Server code:** `server/admin/tools/queries`, `server/web/tools/queries`
- **Schema note:** Schema itself says "remove before production"

Classification options: reference-only (keep but flag), scheduled removal, or active use.

## Relationships

- Pairs with: [Dirstarter Docs Inventory](dirstarter-docs-inventory.md)
- Backlinks: [wiki index](index.md), [SESSION_0019](../../sprints/SESSION_0019.md)

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

## Open Questions

- Do we want "strict live-doc compliance," or "version-pinned compliance" against commit `c42e8bb`?
- Is `next-safe-action` a deliberate long-term divergence, or an interim carry-over?
- Should admin authorization return a 404 or redirect for non-admins?
