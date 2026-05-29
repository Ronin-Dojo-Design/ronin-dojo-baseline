---
title: "Dev Environment Runbook"
slug: dev-environment
type: runbook
status: active
created: 2026-04-27
updated: 2026-05-28
last_agent: claude-session-0286
use_count: 0
pairs_with:
  - docs/runbooks/mcp-usage-runbook.md
  - docs/runbooks/vercel-deploy.md
  - docs/runbooks/neon-advisory-lock-recovery.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/cody-preflight.md
  - docs/protocols/failed-steps-log.md
  - docs/runbooks/mcp-usage-runbook.md
tags:
  - dev
  - environment
  - ops
---

# Dev Environment Runbook

## See also

- **[Local Dev Auth + Storage Runbook](./local-dev-auth-storage.md)** — MinIO setup, dev-login bypass, Better-Auth session debugging, troubleshooting guide with decision trees and flow diagrams. Created SESSION_0131.

## When to use

At the start of every session. Cody pre-flight field 5 ("Dev environment confirmed") references this file.

## Fresh worktree bootstrap

Use this sequence when you spin up a brand-new git worktree off `main` (e.g.,
to ship a feature slice in parallel with main). Each step has produced
real-world friction in the past — copy-paste rather than improvise. This
section is cross-linked from
[`docs/protocols/cody-preflight.md`](../../protocols/cody-preflight.md) step 5
("Dev environment confirmed").

```bash
# 1. Create the worktree off main
git worktree add ../<worktree-name> -b <branch> main

# 2. Enter the app dir
cd ../<worktree-name>/apps/web

# 3. Install deps

bun install

# 4. Copy env vars from the canonical main worktree
cp /Users/brianscott/dev/ronin-dojo-app/apps/web/.env .env

# 5. Generate the Prisma client
bunx prisma generate --schema prisma/schema.prisma --no-hints

# 6. Verify
bun test ./server/web/schedule/
```

### Step 4 detail — env vars

If the canonical `.env` is unavailable, the worktree needs at minimum:

- `DATABASE_URL` — Postgres connection string (see "Database" below).
- `DIRECT_URL` — optional locally, but required in Vercel Preview and Production so Prisma CLI migration commands use Neon's direct endpoint.
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — Better Auth keys.
- `REDIS_REST_URL`, `REDIS_REST_TOKEN` — optional Upstash REST rate-limit backend.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — only if Stripe surfaces are exercised; otherwise stub values are acceptable in dev.
- `CRON_SECRET` — required by any scheduled-cron route handler.
- `DATABASE_PUBLIC_URL` — optional build-time DB URL override; leave blank unless a deploy-specific build-read endpoint is intentionally configured.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — optional analytics domain override; leave blank to derive from `NEXT_PUBLIC_SITE_URL`.
- `AI_GATEWAY_API_KEY`, `AI_CHAT_MODEL`, `AI_COMPLETION_MODEL` — optional content automation through Vercel AI Gateway.

### Step 6 detail — pending Prisma migrations (dev only)

If `bun test ./server/web/...` fails with table-missing errors (e.g.,
`relation "ClassSchedule" does not exist`), the dev DB is behind the schema.
Run:

```bash
bunx prisma db push --accept-data-loss
```

This applies the current `schema.prisma` to the **dev** database directly,
without writing a migration. **Dev only** — production uses
`bunx prisma migrate deploy` against versioned migration files. Never run
`db push --accept-data-loss` against a production or shared staging DB.

This step was the actual friction hit during SESSION_0031.5 TASK_02 — fresh
worktrees inherit the schema but not the applied migrations, so `bun test`
will fail until the dev DB is brought current.

## Dev server

```bash
cd apps/web
npx next dev --turbo
```

**Port:** `3000` (default)

**Why `npx`?** `pnpm` is not reliably on PATH inside VS Code integrated terminal on macOS. `npx` resolves from `node_modules/.bin` without PATH issues. `bun dev` and `bun run dev` also fail in this context.

**Do not try:** `bun dev`, `bun run dev`, `bunx next dev`, `pnpm dev`. These have all failed in VS Code terminal.

## Database

```
postgresql://brianscott@localhost:5432/ronindojo_dev
```

**Provider:** Postgres.app on macOS

**psql path:** `/Applications/Postgres.app/Contents/Versions/latest/bin/psql`

**Quick connect:**

```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/psql ronindojo_dev
```

### Reset database

```bash
dropdb ronindojo_dev && createdb ronindojo_dev
cd apps/web && bun db:migrate dev
```

## Brand → Host mapping

| Brand | Local host | Notes |
| --- | --- | --- |
| `RONIN_DOJO_DESIGN` | `ronindojo.local:3000` | Add to `/etc/hosts`; also the `DEFAULT_BRAND` fallback for any *unrecognized* host |
| `BASELINE_MARTIAL_ARTS` | `baseline.local:3000` **or** `localhost:3000` | Add `127.0.0.1 baseline.local`; `localhost` is explicitly mapped to Baseline during MVP build — see `lib/brand-context.ts` |
| `BBL` | `bbl.local:3000` | Add to `/etc/hosts` when needed |
| `WEKAF` | `wekaf.local:3000` | Add to `/etc/hosts` when needed |

**Resolution:** `proxy.ts` maps `request.host` → `Brand` enum. See `apps/web/proxy.ts`.

### Testing with curl

```bash
# Test as Baseline brand
curl -s http://localhost:3000/directory -H "Host: baseline.local" | head -100
```

## Prisma

```bash
cd apps/web

# Generate client after schema changes
bun db:generate

# Create and apply migration
bun db:migrate dev

# Open Prisma Studio
bun db:studio
```

## Import paths

- Prisma client types: `~/.generated/prisma/client` (NOT `@prisma/client`)
- DB instance: `~/services/db`
- Auth: `~/lib/auth`
- Server session: `getServerSession()` from `~/lib/auth`

## Rollback

If the dev server won't start:

1. Check for port conflicts: `lsof -i :3000`
2. Kill stale processes: `kill -9 <PID>`
3. Clear Next.js cache: `rm -rf apps/web/.next`
4. Reinstall: `cd apps/web && bun install`

## Last verified

SESSION_0014 — 2026-04-27
