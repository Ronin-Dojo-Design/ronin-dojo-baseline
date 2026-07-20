---
title: "Dev Environment Runbook"
slug: dev-environment
type: runbook
status: active
created: 2026-04-27
updated: 2026-07-20
last_agent: claude-session-0587
use_count: 0
pairs_with:
  - docs/runbooks/dev-environment/mcp-usage-runbook.md
  - docs/runbooks/deploy/vercel-deploy.md
  - docs/runbooks/database/neon-advisory-lock-recovery.md
  - docs/runbooks/dev-environment/session-command-log.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/cody-preflight.md
  - docs/protocols/failed-steps-log.md
  - docs/runbooks/dev-environment/mcp-usage-runbook.md
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
("Dev environment confirmed") and surfaced at bow-in by
[`opening.md` → "Before Step 0 — Fresh-worktree bootstrap"](../../rituals/opening.md).

> **Shortcut:** run the **`/worktree-setup`** skill, which executes this sequence —
> but **env-first** (it copies the canonical `.env` *before* `bun install`), so the prisma
> `postinstall` succeeds in one shot instead of failing on `DATABASE_URL` (step 2 below) and
> being patched at steps 4–5.

```bash
# 1. Create the worktree off main
git worktree add ../<worktree-name> -b <branch> main

# 2. Install deps from the worktree ROOT (Bun workspace — one root bun.lock)
cd ../<worktree-name>
bun install

# 3. Enter the app dir for env + Prisma
cd apps/web

# 4. Copy env vars from the canonical main worktree
cp /Users/brianscott/dev/ronin-dojo-app/apps/web/.env .env

# 5. Generate the Prisma client
bunx prisma generate --schema prisma/schema.prisma --no-hints

# 6. Verify
bun test ./server/web/schedule/
```

### Step 4 detail — env vars

If the canonical `.env` is unavailable, the worktree needs at minimum:

- `DATABASE_URL` — Postgres connection string (the canonical local `.env` points at
  `ronindojo_prodsnap`; see "Database" below).
- `DIRECT_URL` — Prisma CLI target. Locally it must name the same intended database as
  `DATABASE_URL`; Prisma config prefers it when both exist. It is also required in Vercel Preview and
  Production so migrations use Neon's direct endpoint.
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — Better Auth keys.
- `REDIS_REST_URL`, `REDIS_REST_TOKEN` — optional Upstash REST rate-limit backend.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — only if Stripe surfaces are exercised; otherwise stub values are acceptable in dev.
- `CRON_SECRET` — required by any scheduled-cron route handler.
- `DATABASE_PUBLIC_URL` — optional build-time DB URL override; leave blank unless a deploy-specific build-read endpoint is intentionally configured.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — optional analytics domain override; leave blank to derive from `NEXT_PUBLIC_SITE_URL`.
- `AI_GATEWAY_API_KEY`, `AI_CHAT_MODEL`, `AI_COMPLETION_MODEL` — optional content automation through Vercel AI Gateway.

### Step 6 detail — pending Prisma migrations (dev only)

If `bun test ./server/web/...` fails with table-missing errors, first print the parent-shell URL names,
then inspect Prisma's own datasource banner without exposing credentials:

```bash
bun -e 'for (const k of ["DATABASE_URL","DIRECT_URL"]) { const v=process.env[k]; console.log(k, v ? new URL(v).pathname.slice(1) : "(unset)") }'
bunx prisma migrate status
```

For checked-in versioned migrations, use `bun run db:migrate:deploy` only after the prodsnap
backup/preflight in the schema-migration runbook. Never use `db push --accept-data-loss` or
`prisma migrate reset` on `ronindojo_prodsnap`. For Playwright, provision the disposable DB through
`bun run e2e:db:setup`; do not repoint a raw Prisma reset by hand.

The status probe above is intentionally the canonical `.env`/prodsnap check: require Prisma's own datasource
line to name `ronindojo_prodsnap` too. Do not adapt it to E2E with `--env-file=.env.e2e`; a raw `bunx` hop can
discard that overlay. The guarded E2E setup owns the separate target.

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

The canonical `apps/web/.env` currently points at **`ronindojo_prodsnap`**: a realistic,
manually-maintained production mirror used for local app work and DB-backed Bun tests. It is
non-disposable. `ronindojo_e2e` is the separate disposable Playwright DB; see
[Verification & Testing](verification-and-testing.md#the-e2e-db-is-a-hermetic-fixture-not-a-prodsnap-mirror).
`ronindojo_dev` is a legacy/optional scratch database, not the active app target.

**Provider:** Postgres.app on macOS

**psql path:** `/Applications/Postgres.app/Contents/Versions/latest/bin/psql`

**Quick connect:**

```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/psql ronindojo_prodsnap
```

### Never reset prodsnap

Do not run `dropdb`, `prisma migrate reset`, `db push --accept-data-loss`, or destructive seed
experiments against `ronindojo_prodsnap`. Use `ronindojo_e2e` for browser fixtures and a named
throwaway clone/scratch restore for adversarial migration tests. Refreshing prodsnap from live Neon is
an explicit backup/restore operation, not a routine reset.

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

# Apply reviewed, checked-in migrations to the local prodsnap after backup/preflight
bun run db:migrate:deploy

# Author a new migration
# Follow docs/runbooks/database/schema-migration.md; do not improvise with reset/db push.

# Open Prisma Studio
bun db:studio
```

## Verification commands

All commands run from `apps/web/` unless noted otherwise.

| Task | Command | Notes |
| --- | --- | --- |
| **Typecheck** | `bun run typecheck` | Runs `next typegen` then `tsc --noEmit`. Can take 2–4 min on full project. |
| **Lint** | `bun run lint` (write) / `bun run lint:check` (CI) | **oxlint** (Dirstarter-aligned), **scoped to `apps/web`** — this is the gate. `lint` = `oxlint --fix .`, `lint:check` = `oxlint .` (read-only, used by CI). Warnings are advisory (exit 0); errors fail. |
| **Format** | `bun run format` (write) / `bun run format:check` (CI) | **oxfmt** — `oxfmt .` / `oxfmt --check .`. Config `.oxfmtrc.json` (migrated from the old `biome.json`, same style). |
| **Test (all)** | `bun run test` | = `bun test --parallel=1 --path-ignore-patterns='e2e/**'`. **Deterministic gate** (~67s). Do NOT drop `--parallel` (mock-leak ~63 fails) or raise the worker count (Postgres over-subscription → flake). See `sop-test-writing.md` §2 + `test-fail-fix-ledger.md`. |
| **Test (file)** | `bun test ./path/to/file` | Single file or directory (isolation not needed). |
| **Test (e2e)** | `bun run dev:e2e`, then `bun run test:e2e:local -- <spec> --project=chromium` | Uses disposable `ronindojo_e2e`; provision with `bun run e2e:db:setup`. |
| **DB generate** | `bun run db:generate` | Regenerate Prisma client after schema changes. |
| **DB migrate** | `bun run db:migrate:deploy` | Apply reviewed migration files to prodsnap after backup/preflight. |
| **DB push/reset** | Do not use on prodsnap | Use a named throwaway DB and follow the schema-migration runbook. |
| **DB seed** | Not routine on prodsnap | Seed only an explicitly named disposable E2E/scratch DB; e.g. `bun --env-file=.env.e2e prisma/seed.ts`. |
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
bun run test           # 3. unit tests (deterministic --parallel=1 gate)
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
4. Reinstall from repo root (Bun workspace — one root `bun.lock`): `bun install`

## Last verified

SESSION_0542 — 2026-07-16: reconciled the active local roles (`ronindojo_prodsnap` for app +
DB-backed Bun verification; `ronindojo_e2e` for Playwright), removed reset/db-push guidance for the
non-disposable prodsnap, and recorded the effective `DIRECT_URL` target guard. The Postgres.app access-gate
diagnosis and Turbopack guidance above remain current.
