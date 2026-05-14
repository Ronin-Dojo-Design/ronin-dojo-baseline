---
title: "SESSION 0161 — Production Deploy Verification + Optional Env Var Hygiene"
slug: session-0161
type: session--open
status: in-progress
created: 2026-05-13
updated: 2026-05-13
last_agent: claude-session-0161
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0160.md
  - docs/sprints/SESSION_0159.md
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/architecture/infrastructure/dns-verification-spec.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0161 — Production Deploy Verification + Optional Env Var Hygiene

## Date

2026-05-13

## Operator

Brian Scott + Claude (Cody)

## Goal

Land the `baselinemartialarts.com` production deploy end-to-end: peel remaining build-pipeline failure layers, verify Let's Encrypt cert issues, confirm `curl -I https://baselinemartialarts.com` returns HTTP 200 + `Server: Vercel`, add `www.baselinemartialarts.com` to the Vercel project Domains, and refresh stale `docs/architecture/infrastructure/dns-verification-spec.md` (per SESSION_0159_FINDING_01).

## Graphify Check

- Graph status: usable. Post-SESSION_0160 graphify stats: 5,786 nodes / 10,800 edges / 659 communities / 1,170 files tracked.
- No cross-domain discovery needed for TASK_01 — known file path (`apps/web/prisma.config.ts`).

## Petey Plan

### Tasks

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0161_TASK_01 | Path B fix for SHADOW_DATABASE_URL strict-validation failure: conditional-spread the `shadowDatabaseUrl` field in `apps/web/prisma.config.ts` so it's only set when `SHADOW_DATABASE_URL` env var exists. Unblocks Vercel postinstall after SESSION_0160's deploy attempt failed on this var. | in progress |
| SESSION_0161_TASK_02 | After TASK_01 push triggers redeploy, watch build log for next failure layer (likely env var validation in `next build` via `apps/web/env.ts` schema). Surface and resolve. | queued |
| SESSION_0161_TASK_03 | On successful deploy: `curl -sI https://baselinemartialarts.com` → expect HTTP 200 + valid TLS cert + `Server: Vercel`. Confirm Vercel issued Let's Encrypt cert. | queued |
| SESSION_0161_TASK_04 | Add `www.baselinemartialarts.com` to Vercel project Domains (redirect to apex). Carried over from SESSION_0160. | queued |
| SESSION_0161_TASK_05 | Refresh stale `docs/architecture/infrastructure/dns-verification-spec.md` content body to match current Resend dashboard pattern (per SESSION_0159_FINDING_01). | queued |

### Pre-flight context (from SESSION_0160 close)

- Branch: `main`, clean tree at `323646b`.
- Last build attempt (Vercel deploy `2TKXoUrVP`, commit `323646b`) failed at `27s` during `apps/web` postinstall with `PrismaConfigEnvError: Cannot resolve environment variable: SHADOW_DATABASE_URL`.
- Install pipeline now confirmed working: Part A (pnpm-lock.yaml committed `cd6c12c`) + Part B (vercel.json Corepack `881b664`) + DATABASE_URL env var (set in Vercel UI by Brian).
- 739 packages installed cleanly, native modules (`@prisma/engines`, `sharp`, `esbuild`, `@swc/core`, `@parcel/watcher`) all built. The failure is specifically Prisma 7+'s strict `env()` helper rejecting a missing optional var.

## Files Touched

_(filled at bow-out)_

## What Landed

_(filled at bow-out)_

## Open Decisions / Blockers

- Awaiting Vercel auto-deploy result after TASK_01 push.

## Next Session

_(filled at bow-out)_
