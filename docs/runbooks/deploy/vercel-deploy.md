---
title: "Vercel Deploy Runbook"
slug: vercel-deploy
type: runbook
status: active
created: 2026-05-20
updated: 2026-06-27
last_agent: claude-session-0454
pairs_with:
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/runbooks/neon-advisory-lock-recovery.md
  - docs/runbooks/dev-environment.md
  - docs/architecture/uplift/L1-env-deploy-diff-report.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0205.md
tags:
  - vercel
  - deploy
  - env
  - neon
---

# Vercel Deploy Runbook

Operational source for Ronin's active Vercel app deployment. This runbook is narrower than the domain setup guide: it covers project build settings, env scope parity, and deployment-readiness proof.

## Active Vercel Truth

The active project builds from `apps/web`, not from the repository root.

Local development and production use different command surfaces. Local app work starts in
`apps/web` with `bun run dev` (see the [dev-environment runbook](../dev-environment/dev-environment.md)).
Vercel production builds with the monorepo `bun run --filter @ronin-dojo/web build` command below,
because that is the project setting and lockfile contract (`bun.lock`).

| Setting | Current value |
| --- | --- |
| Root Directory | `apps/web` |
| Framework Preset | `Next.js` |
| Active config | `apps/web/vercel.json` |
| Install command | `cd ../.. && bun install --frozen-lockfile` |
| Build command | `cd ../.. && bun run --filter @ronin-dojo/web db:generate && bun run --filter @ronin-dojo/web build` |
| Cron path | `/api/cron/publish-tools` |

The repo-root `vercel.json` is a historical/root fallback. Do not use it unless the project root setting changes.

## Required Deploy Env Names

These names must exist in both **Production** and **Preview** scopes. Check names and scopes only; never print values.

```bash
bun scripts/check-vercel-env-parity.ts
```

The guard currently includes required T3 Env names plus `DIRECT_URL`, which is required by `apps/web/prisma.config.ts` for Vercel Prisma migration commands.

| Variable | Scope | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Production + Preview | Runtime pooled Neon URL. |
| `DIRECT_URL` | Production + Preview | Direct Neon URL for Prisma CLI migrations; keeps `prisma migrate deploy` off the pooler. |
| `BETTER_AUTH_SECRET` | Production + Preview | Better Auth secret. |
| `BETTER_AUTH_URL` | Production + Preview | Auth callback base URL. |
| `NEXT_PUBLIC_SITE_URL` | Production + Preview | Canonical public app URL. |
| `NEXT_PUBLIC_SITE_EMAIL` | Production + Preview | Public contact email. |

## Optional L2 Env Names

SESSION_0205 added optional upstream-aligned names without making them required:

| Variable | Behavior |
| --- | --- |
| `DATABASE_PUBLIC_URL` | Used by runtime DB construction only during `PHASE_PRODUCTION_BUILD` when set; otherwise falls back to `DATABASE_URL`. Does not affect Prisma CLI migrations. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional analytics domain override; blank/absent preserves Ronin's `NEXT_PUBLIC_SITE_URL`-derived domain behavior. |
| `AI_GATEWAY_API_KEY` | Optional; content automation returns a disabled response when absent. |
| `AI_CHAT_MODEL`, `AI_COMPLETION_MODEL` | Default to the current AI Gateway model IDs when absent. |

Do not add placeholder secret values to Vercel. If an optional variable is intentionally configured, add it to both Production and Preview in one dashboard edit to avoid a deploy storm.

## Migration Routing

`DATABASE_URL` remains the runtime app connection. `apps/web/prisma.config.ts` selects a direct Neon URL only for Prisma CLI commands when `VERCEL_ENV` is `preview` or `production`.

Defensive guard: if `DIRECT_URL` or fallback `DATABASE_URL` accidentally contains Neon's `-pooler` hostname suffix, the Prisma CLI config strips that suffix and removes `pgbouncer=true` before running migrations. The Vercel env value should still be corrected to the real direct URL; the code guard exists to keep deploys from failing while that dashboard value is audited.

Do not add Prisma `directUrl` to `schema.prisma` for this repo's Prisma 7 setup. The current config surface uses `datasource.url`, and the Neon advisory-lock recovery runbook documents the reason.

## Readiness Checks

Before an env/deploy lane closes:

```bash
bun run --filter @ronin-dojo/web typecheck
cd apps/web && bun run lint:check && bun run format:check
cd apps/web && bun test --isolate --path-ignore-patterns='e2e/**'
bun scripts/check-vercel-env-parity.ts
vercel ls
```

Playwright specs live under `apps/web/e2e/` and should run with `bunx playwright test`, not raw `bun test`.

`vercel ls` must show the relevant Preview and Production deployments as `Ready`. If the latest Preview deployment is `Error`, inspect it before changing runtime env/deploy behavior:

```bash
vercel inspect <deployment-url> --logs
```

Build logs may include connection hostnames from tools. Do not copy secret values into docs, comments, or chat.
