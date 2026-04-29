---
title: "Dev Environment Runbook"
slug: dev-environment
type: runbook
status: active
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0014
health: 8
use_count: 0backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/cody-preflight.md
  - docs/protocols/failed-steps-log.md
tags:
  - dev
  - environment
  - ops
---

# Dev Environment Runbook

## When to use

At the start of every session. Cody pre-flight field 5 ("Dev environment confirmed") references this file.

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
|---|---|---|
| `RONIN_DOJO_DESIGN` | `localhost:3000` | Default when no host match |
| `BASELINE_MARTIAL_ARTS` | `baseline.local:3000` | Add `127.0.0.1 baseline.local` to `/etc/hosts` |
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
