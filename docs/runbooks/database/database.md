---
title: Database Runbook
slug: database
type: runbook
status: active
created: 2026-04-25
updated: 2026-07-16
last_agent: codex-session-0542
use_count: 0
pairs_with:
  - docs/runbooks/dev-environment/mcp-usage-runbook.md
  - docs/runbooks/database/neon-advisory-lock-recovery.md
  - docs/runbooks/deploy/vercel-deploy.md
  - docs/runbooks/dev-environment/verification-and-testing.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/runbooks/dev-environment/mcp-usage-runbook.md
---

# Database — local dev (Postgres.app) + production (Neon)

## Database roles

| Role | Database | Purpose | Destructive policy |
| --- | --- | --- | --- |
| Local app + DB-backed Bun verification | `ronindojo_prodsnap` (Postgres.app) | Realistic, manually maintained prod mirror; may carry a reviewed staged migration before prod deploy | **Never reset/db-push.** Back up + inventory before migration work. |
| Local Playwright/browser fixture | `ronindojo_e2e` (Postgres.app) | Disposable migrate-from-zero fixture; optional explicit seed for a manual smoke | Recreate only by literal name + `bun run e2e:db:setup`. |
| Optional legacy scratch | `ronindojo_dev` (Postgres.app or Docker) | Named throwaway experiments that do not need realistic data | Destructive commands are allowed only after both URLs are explicitly pinned here. |
| Production | Neon `neondb` | Live BBL data | Never reset; Vercel prebuild applies committed migrations. |

## Local dev — Postgres.app

We initially scaffolded a `docker-compose.yml` for Docker Postgres, but Docker Desktop on this machine was an old broken install. We pivoted to Postgres.app (native macOS Postgres) — no daemon, no VM, just a menu-bar app. The `docker-compose.yml` and [`infra/postgres/init.sql`](../../../infra/postgres/init.sql) are kept in the repo for anyone with working Docker (or for a future move back).

### Setup (one-time)

1. Install Postgres.app: `brew install --cask postgres-app` (or download from postgresapp.com).
2. Launch Postgres.app from `/Applications`. It puts an elephant icon in the menu bar.
3. Click the elephant → **Initialize** to create a default cluster on port 5432.
4. Postgres.app runs as your macOS user (`brianscott`) with no password — that's normal for local dev.

### Create an optional scratch database

```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb ronindojo_dev
```

This does **not** change the standard app target. The canonical gitignored `.env` points at
`ronindojo_prodsnap`; the guarded E2E setup owns `ronindojo_e2e`.

**Don't** pre-install extensions. Prisma manages `citext` itself via the schema's `extensions = [citext]` declaration — pre-installing trips its drift detector and forces a reset. Add Postgres.app's bin to your PATH per the [Postgres.app docs](https://postgresapp.com/documentation/cli-tools.html) if you want plain `createdb`/`psql` everywhere.

### Connect from `apps/web`

In `apps/web/.env` (you create this; it's gitignored — never commit it):

```env
DATABASE_URL="postgresql://brianscott@localhost:5432/ronindojo_prodsnap"
DIRECT_URL="postgresql://brianscott@localhost:5432/ronindojo_prodsnap"
```

Sanity check:

```bash
psql ronindojo_prodsnap -c '\dx'
# Expect: citext in the extension list. Current schema declares only `extensions = [citext]`.
```

### Start / stop

Postgres.app is just a Mac app — quit it from the menu bar to stop, launch it to start. By default it auto-starts on login (toggleable in Postgres.app preferences).

### Reset policy

```bash
# Disposable Playwright DB only:
/Applications/Postgres.app/Contents/Versions/latest/bin/dropdb --if-exists --force ronindojo_e2e
cd apps/web && bun run e2e:db:setup
```

Never substitute `ronindojo_prodsnap` in that recipe. For an adversarial migration proof, use a separately
named scratch restore/clone and set **both** URLs explicitly. Do not manually add undeclared extensions;
Prisma's checked-in migration history owns the database extension contract.

## Local dev — Docker (alternative path, not active)

If you ever fix Docker Desktop or move to a different machine with working Docker, the `docker-compose.yml` + `infra/postgres/init.sql` we scaffolded will work as-is:

```bash
cd /Users/brianscott/dev/ronin-dojo-app
docker compose up -d                                                    # Postgres on localhost:5432, db ronindojo_dev
docker compose down       # stop, keep data
docker compose down -v    # stop AND wipe data (destroys volume)
```

Connection strings for the Docker path:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ronindojo_dev?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/ronindojo_dev?schema=public"
```

(Note: different user (`postgres` vs `brianscott`) and password (`postgres` vs none) than the Postgres.app
path. Switch **both** URLs together; never leave `DIRECT_URL` pointing at prodsnap while runtime uses the
Docker scratch database.)

## Production — Neon

### One-time setup

1. Sign up at [neon.tech](https://neon.tech) — free tier is enough for dev/staging and modest production.
2. Create project: `ronin-dojo` (or whatever you prefer). Region: pick close to Vercel's edge (us-east-1 if your users are mostly US).
3. Note the **connection string** — Neon shows two: one with pooling (`-pooler`) and one without. You want both:

   - **Pooled** (`...?sslmode=require&pgbouncer=true`) for runtime queries — set as `DATABASE_URL` on Vercel.
   - **Direct** (no `-pooler`) for migrations — set as `DIRECT_URL` on Vercel.
4. Let the checked-in Prisma migrations create every declared extension. Do not pre-install extensions in
   the Neon SQL editor: the current schema/migration history declares `citext` only, and an extra extension
   creates drift.

### Prisma 7 URL routing

This repo uses Prisma 7 config routing instead of a `directUrl` field in `schema.prisma`.

- Runtime app code uses pooled `DATABASE_URL` through `apps/web/services/db.ts`.
- Prisma CLI migration commands use `apps/web/prisma.config.ts`.
- On Vercel Preview/Production, `prisma.config.ts` selects a direct Neon URL for `prisma migrate deploy`.
- If a pooler URL is accidentally supplied as `DIRECT_URL`, the Prisma CLI config defensively strips Neon's `-pooler` host suffix. Treat that as a deploy-safety guard, not as permission to leave the Vercel dashboard value wrong.
- Locally, Prisma CLI falls back to `DATABASE_URL` when `DIRECT_URL` is absent, but relying on that is an
  operational footgun. Keep both URLs pointed at the same intended local DB. Printing their parent-process
  database names is only the first check: for a raw command against the canonical `.env`, require Prisma's
  datasource banner to name `ronindojo_prodsnap` too. A Bun `x`/`bunx` child can discard a named
  `--env-file` overlay, so E2E work must use the guarded launcher and scratch commands must pin both URLs on
  the actual child command.

Do not add `directUrl` to `schema.prisma` for this repo. See [Neon Prisma Advisory-Lock Recovery](neon-advisory-lock-recovery.md) for the production incident history and Prisma 7 reasoning.

### Vercel env vars

In Vercel project settings → Environment Variables:

- `DATABASE_URL` → Neon pooled connection string
- `DIRECT_URL` → Neon direct connection string
- All the other vars from `apps/web/.env.example` (Better-Auth, Stripe, Resend, S3, etc.)

Run the env-scope guard before deploy closeout:

```bash
bun scripts/check-vercel-env-parity.ts
```

## Migrations workflow

### Local migration workflow

The executable source of truth is [Schema Migration Runbook](schema-migration.md). In brief:

1. Print/verify the parent `DATABASE_URL` and `DIRECT_URL` database names, then confirm the Prisma child
   datasource banner or use a guarded/inline-pinned launcher; the parent values alone are not effective-target
   proof across a Bun child boundary.
2. Author and adversarially prove the migration on a named scratch DB when needed.
3. Back up prodsnap and inventory migration-specific preconditions.
4. Apply the reviewed file with `bun run db:migrate:deploy` to prodsnap.
5. Run DB-backed Bun tests on prodsnap, then typecheck/build.

Never use raw `db push --accept-data-loss` or `prisma migrate reset` as a shortcut on the canonical `.env`.

### Production deploy

`prisma migrate deploy` runs automatically in `prebuild` (see Dirstarter's `package.json`). On Vercel it uses `DIRECT_URL` through `apps/web/prisma.config.ts`, while runtime app traffic keeps using pooled `DATABASE_URL`.

For destructive changes: review the generated SQL in `prisma/migrations/<name>/migration.sql` before merging the PR.

### Disposable E2E rebuild

```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/dropdb --if-exists --force ronindojo_e2e
cd apps/web && bun run e2e:db:setup   # guarded create + migrate; intentionally no seed
```

## Connecting to Neon from your laptop (when needed)

For ad-hoc inspection of prod data:

```bash
psql "$NEON_CONNECTION_STRING"
# or use Neon's web SQL editor for one-offs
```

Don't run migrations against prod manually — that's what the Vercel deploy does. Manual migrate-deploy can drift the schema from the migration history.

## Backups

- **Neon** — automatic point-in-time recovery on paid tiers. Free tier has manual export only. **Schedule a manual export weekly** from the Neon dashboard until paid plan kicks in.
- **`ronindojo_prodsnap`** — back up before schema/data mutation. It is locally recoverable, not disposable.
- **`ronindojo_e2e` / named scratch DBs** — disposable; durable fixtures belong in code.

## Troubleshooting

- **`relation "..." does not exist`** after a migration — run `bun db:generate` to regenerate the client.
- **Port 5432 already in use** — another Postgres is running. `lsof -i :5432`, kill it, or change the port mapping in `docker-compose.yml` to `5433:5432`.
- **`pgbouncer=true` errors on Neon migrations** — you used the pooled URL for migrations. Use `DIRECT_URL` instead.
- **`citext` not found** — stop and verify both effective target names plus migration status. Apply reviewed
  migrations through the target-safe schema-migration runbook. Never db-push or manually add the extension on
  prodsnap; use a separately named, fully pinned scratch database for experiments.
