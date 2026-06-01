---
title: "Dev Environment Runbook"
slug: dev-environment
type: runbook
status: active
created: 2026-04-27
updated: 2026-06-01
last_agent: claude-session-0319
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
bun run dev
```

**Port:** `3000` (default)

**What this runs:** `apps/web/package.json` defines `"dev": "next dev --turbo"`.
SESSION_0314 verified `PORT=3001 bun run dev` reaches Next dev; the only failure in that
probe was the expected `.next/dev/lock` because another Next dev server was already running.

**DB-backed pages returning 500 locally? Check the Postgres.app access gate FIRST.**
The most common cause (root-caused 2026-06-01, SESSION_0319 follow-up) is **Postgres.app 18's per-app
database-access gate** — *not* Turbopack. It surfaces as
`⨯ Error [DriverAdapterError]: Postgres.app failed to verify "trust" authentication` on every DB route
(`/disciplines`, `/lineage/*`, `/events/*`), under **both** `--turbo` and `--webpack`. Postgres.app 18
launches the server with `-c shared_preload_libraries=auth_permission_dialog` and keeps a
`ClientApplicationPermissions` allow-list (`defaults read com.postgresapp.Postgres2`); the connecting
binary must be on it. `psql`, standalone `bun`/`node`, and `Codex.app` are usually already approved (so
they connect fine) — but the Next dev server's `node` binary (`/usr/local/bin/node`) often is not, so only
the dev server 500s. Proof it's not app code: raw `pg` and the exact `services/db.ts` setup connect fine
standalone.

**Fix (one-time):** run `bun dev` in a real terminal and click **Allow** on the `PostgresPermissionDialog`
prompt for `node`, **or** toggle the access-permission gate off in Postgres.app Settings. Once approved/off,
**Turbopack renders DB pages fine — no `--webpack` needed.**

**Separate/historical externalization error:** SESSION_0316 saw a genuine
`Failed to load external module @prisma/client-<hash>/runtime/client` 500 under Turbopack; SESSION_0317 got
`200 OK` and it has not recurred. Only if *that specific* error returns is the webpack fallback relevant
(and `serverExternalPackages` tuning in `next.config.ts` is the candidate real fix):

```bash
cd apps/web
npx next dev --webpack    # ONLY for the @prisma/client externalization error — does NOT fix the access gate
```

**Fallback:** if the Bun script is unavailable in a specific shell, use the direct equivalent:

```bash
npx next dev --turbo
```

**Do not run two dev servers from the same `apps/web/.next/dev` directory.** If you see:

```text
Unable to acquire lock at apps/web/.next/dev/lock
```

terminate the existing `next dev` process first. Use a different worktree for parallel dev
servers.

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

## Verification commands

All commands run from `apps/web/` unless noted otherwise.

| Task | Command | Notes |
| --- | --- | --- |
| **Typecheck** | `bun run typecheck` | Runs `next typegen` then `tsc --noEmit`. Can take 2–4 min on full project. |
| **Lint** | `bun run lint` | Biome check + auto-fix (`biome check --write .`), **scoped to `apps/web`** — this is the gate. ⚠️ Do NOT use the *repo-root* `bun run lint` (`pnpm -r lint`): it fails on `packages/api-client` (`sh: biome: command not found` PATH gap, accepted-risk) and is **not** a gate. Use changed-file Biome + typecheck. |
| **Format** | `bun run format` | Biome format + auto-fix. |
| **Test (all)** | `bun test` | Parallel, excludes e2e. |
| **Test (file)** | `bun test ./path/to/file` | Single file or directory. |
| **Test (e2e)** | `bun run test:e2e` | Playwright — requires dev server running. |
| **DB generate** | `bun run db:generate` | Regenerate Prisma client after schema changes. |
| **DB migrate** | `bun run db:migrate dev` | Create + apply migration (dev only). |
| **DB push** | `bun run db:push` | Apply schema to dev DB without migration file. Dev only. |
| **DB seed** | `bun run db:seed` | Run seed script. |
| **DB studio** | `bun run db:studio` | Open Prisma Studio GUI. |
| **Wiki lint** | `bun run wiki:lint` | From **repo root**. Checks docs links, frontmatter, structure. |
| **Docs navigator** | `bun run docs:nav` | From **repo root**. Regenerates `docs/index.html`. |
| **Dev server** | `bun run dev` | Port 3000 from `apps/web`; script runs `next dev --turbo`. |

### Verification sequence for code changes

Run in this order after any code change before declaring done:

```bash
cd apps/web
bun run typecheck      # 1. types
bun run lint           # 2. lint
bun test               # 3. unit tests
```

If the task touched docs:

```bash
cd /Users/brianscott/dev/ronin-dojo-app   # repo root
bun run wiki:lint
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

SESSION_0319 — 2026-06-01: local DB-page 500s root-caused to the **Postgres.app 18 access gate** (see Dev server section) and resolved by approving the `node` client / toggling the gate off; Turbopack now renders DB-backed pages, so the `next dev --webpack` workaround is **no longer required**. All scripts, paths, the `psql Versions/latest → 18.3` symlink, and the `/events/[slug]` route reference in this runbook were re-verified against the repo this session.
