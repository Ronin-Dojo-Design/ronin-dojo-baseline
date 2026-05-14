---
title: Database Runbook
slug: database
type: runbook
status: active
created: 2026-04-25
updated: 2026-05-14
last_agent: codex-session-0166
use_count: 0
pairs_with:
  - docs/runbooks/mcp-usage-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/runbooks/mcp-usage-runbook.md
---

# Database — local dev (Postgres.app) + production (Neon)

## Two-environment plan

| | Dev | Production |
|---|---|---|
| Where | Postgres.app on your Mac | Neon (managed Postgres) |
| Postgres version | 16 | 16 (Neon default) |
| Connection string | `postgresql://brianscott@localhost:5432/ronindojo_dev` | `postgres://...neon.tech/...?sslmode=require` |
| Lives in | `/Applications/Postgres.app` | Neon dashboard |
| Reset frequency | as often as needed (`bun db:reset`) | never blindly — backups first |

## Local dev — Postgres.app

We initially scaffolded a `docker-compose.yml` for Docker Postgres, but Docker Desktop on this machine was an old broken install. We pivoted to Postgres.app (native macOS Postgres) — no daemon, no VM, just a menu-bar app. The `docker-compose.yml` and [`infra/postgres/init.sql`](../../infra/postgres/init.sql) are kept in the repo for anyone with working Docker (or for a future move back).

### Setup (one-time)

1. Install Postgres.app: `brew install --cask postgres-app` (or download from postgresapp.com).
2. Launch Postgres.app from `/Applications`. It puts an elephant icon in the menu bar.
3. Click the elephant → **Initialize** to create a default cluster on port 5432.
4. Postgres.app runs as your macOS user (`brianscott`) with no password — that's normal for local dev.

### Create the dev database

```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb ronindojo_dev
```

**Don't** pre-install extensions. Prisma manages `citext` itself via the schema's `extensions = [citext]` declaration — pre-installing trips its drift detector and forces a reset. Add Postgres.app's bin to your PATH per the [Postgres.app docs](https://postgresapp.com/documentation/cli-tools.html) if you want plain `createdb`/`psql` everywhere.

### Connect from `apps/web`

In `apps/web/.env` (you create this; it's gitignored — never commit it):

```env
DATABASE_URL="postgresql://brianscott@localhost:5432/ronindojo_dev"
```

Sanity check:

```bash
psql ronindojo_dev -c '\dx'
# Expect: citext and pg_trgm in the extension list.
```

### Start / stop

Postgres.app is just a Mac app — quit it from the menu bar to stop, launch it to start. By default it auto-starts on login (toggleable in Postgres.app preferences).

### Reset

```bash
dropdb ronindojo_dev && createdb ronindojo_dev
psql ronindojo_dev -c 'CREATE EXTENSION citext; CREATE EXTENSION pg_trgm;'
# Then re-run migrations
bun db:migrate dev
```

## Local dev — Docker (alternative path, not active)

If you ever fix Docker Desktop or move to a different machine with working Docker, the `docker-compose.yml` + `infra/postgres/init.sql` we scaffolded will work as-is:

```bash
cd /Users/brianscott/dev/ronin-dojo-app
docker compose up -d                                                    # Postgres on localhost:5432, db ronindojo_dev
docker compose down       # stop, keep data
docker compose down -v    # stop AND wipe data (destroys volume)
```

Connection string for the Docker path:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ronindojo_dev?schema=public"
```

(Note: different user (`postgres` vs `brianscott`) and password (`postgres` vs none) than the Postgres.app path. Switch the `DATABASE_URL` in your `.env` accordingly.)

## Production — Neon

### One-time setup

1. Sign up at [neon.tech](https://neon.tech) — free tier is enough for dev/staging and modest production.
2. Create project: `ronin-dojo` (or whatever you prefer). Region: pick close to Vercel's edge (us-east-1 if your users are mostly US).
3. Note the **connection string** — Neon shows two: one with pooling (`-pooler`) and one without. You want both:

   - **Pooled** (`...?sslmode=require&pgbouncer=true`) for runtime queries — set as `DATABASE_URL` on Vercel.
   - **Direct** (no `-pooler`) for migrations — set as `DIRECT_URL` on Vercel.
4. Enable extensions on Neon: in the SQL editor, run `CREATE EXTENSION IF NOT EXISTS citext;` and `CREATE EXTENSION IF NOT EXISTS pg_trgm;`.

### Update `prisma/schema.prisma` to support both URLs

Once Neon is provisioned, edit the datasource block:

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  extensions = [citext]
}
```

`DIRECT_URL` is only needed in production (for `prisma migrate deploy`). Locally, omit it.

### Vercel env vars

In Vercel project settings → Environment Variables:

- `DATABASE_URL` → Neon pooled connection string
- `DIRECT_URL` → Neon direct connection string
- All the other vars from `apps/web/.env.example` (Better-Auth, Stripe, Resend, S3, etc.)

## Migrations workflow

### First-time bootstrap (local)

```bash
cd apps/web
docker compose -f ../../docker-compose.yml up -d   # ensure DB is running
bun install                                         # install deps + runs `db:generate`
bun db:migrate dev --name init_ronin_dojo           # creates a new migration capturing the Ronin Dojo models
```

(Dirstarter ships with 12 prior migrations. They'll all apply first; the `init_ronin_dojo` migration adds the new tables on top.)

### Day-to-day

```bash
# After editing schema.prisma:
bun db:migrate dev --name <descriptive_name>   # creates + applies migration locally
bun db:generate                                 # regenerate Prisma Client (also runs as postinstall)
```

### Production deploy

`prisma migrate deploy` runs automatically in `prebuild` (see Dirstarter's `package.json`). Pushing to Vercel applies pending migrations against `DATABASE_URL`.

For destructive changes: review the generated SQL in `prisma/migrations/<name>/migration.sql` before merging the PR.

### Reset (local only — never prod)

```bash
bun db:reset                          # drops + recreates DB, reapplies all migrations
bun db:seed                           # if seed.ts is present
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
- **Docker dev** — no backups needed; treat the dev DB as disposable. If you have seed data you care about, it lives in `apps/web/prisma/seed.ts`.

## Troubleshooting

- **`relation "..." does not exist`** after a migration — run `bun db:generate` to regenerate the client.
- **Port 5432 already in use** — another Postgres is running. `lsof -i :5432`, kill it, or change the port mapping in `docker-compose.yml` to `5433:5432`.
- **`pgbouncer=true` errors on Neon migrations** — you used the pooled URL for migrations. Use `DIRECT_URL` instead.
- **`citext` not found** — extension wasn't created. Connect and run `CREATE EXTENSION IF NOT EXISTS citext;`.
