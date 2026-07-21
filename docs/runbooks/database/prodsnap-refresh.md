---
title: "Recipe — Refresh local prodsnap from Neon prod"
slug: prodsnap-refresh
type: runbook
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0597
pairs_with:
  - docs/runbooks/database/database.md
  - docs/runbooks/database/schema-migration.md
  - docs/runbooks/dev-environment/dev-environment.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Recipe — Refresh local `ronindojo_prodsnap` from Neon prod

A mini step-by-step (SSS) for the explicit backup/restore that realigns the local mirror with prod.
Proven at SESSION_0450 (`SESSION_0450_TASK_00`); recipe-carded SESSION_0597 per the operator's request.

## When to run (and when NOT)

Run when the local mirror has **drifted from prod** and you want realistic local data:

- After a prod deploy that changed data/schema and you want local == prod again.
- The mirror accumulated smoke residue (test rows, transient dev-login sessions) or a drift table.
- Before a prod-row audit / gate-review where accuracy matters (the SESSION_0450 trigger).

**Not required just because you applied a migration locally** — an additive migration applied to both
prodsnap and prod leaves them schema-in-sync; a refresh is hygiene, not correctness. It is an
**explicit, deliberate** operation — never a routine `migrate reset` / `db push` (those are banned on
prodsnap).

## Prerequisites

- Postgres.app running (PG18 client tools: `pg_dump` / `pg_restore` / `createdb` / `dropdb`).
- The Neon **direct** connection string in the gitignored `apps/web/.env.prod` (`DATABASE_URL=…`).
  It is deliberately in **no committed file** ([[env-prod-overlay-and-prodsnap]]). If absent, create it
  from `apps/web/.env.prod.example` — real secret in `.env.prod`, never in the `.example`.
- Local `.env` `DATABASE_URL`/`DIRECT_URL` point at `localhost/ronindojo_prodsnap` (the default).

## Steps

```bash
cd /Users/brianscott/dev/ronin-dojo-app/apps/web
PGBIN=/Applications/Postgres.app/Contents/Versions/latest/bin   # PG18 tools

# 1. Read the Neon direct URL from .env.prod into a shell var (NEVER hand-parse the secret into
#    psql/pg_dump flags — keep it as one conninfo string; this also keeps it out of your typed history).
NEON_URL=$(bun -e 'import "dotenv/config"; process.stdout.write(process.env.DATABASE_URL||"")' 2>/dev/null)
# sanity: confirm it is the Neon host, not localhost, without printing the secret
bun -e 'import "dotenv/config"; console.log("target host:", new URL(process.env.DATABASE_URL).host)'

# 2. INSURANCE BACKUP the current prodsnap first (roll back to this if the restore goes wrong).
"$PGBIN/pg_dump" --no-owner --no-acl -Fc ronindojo_prodsnap -f /tmp/prodsnap-backup-$(date +%s).dump

# 3. Dump PROD (custom format; --no-owner/--no-acl so a local restore doesn't fight Neon roles/grants).
"$PGBIN/pg_dump" --no-owner --no-acl -Fc "$NEON_URL" -f /tmp/prod.dump

# 4. Drop + recreate the LOCAL mirror by its LITERAL name (never substitute another DB here).
"$PGBIN/dropdb" --if-exists --force ronindojo_prodsnap
"$PGBIN/createdb" ronindojo_prodsnap

# 5. Restore prod into the fresh mirror.
"$PGBIN/pg_restore" --no-owner --no-acl -d ronindojo_prodsnap /tmp/prod.dump

# 6. Verify: schema is valid, no pending migrations, counts match prod.
bunx prisma validate
bunx prisma migrate status          # expect: all migrations applied, no drift
bun -e 'import{PrismaPg}from"@prisma/adapter-pg";import{PrismaClient}from"./.generated/prisma/client";
  const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
  console.log("users",await p.user.count(),"orgs",await p.organization.count(),"passports",await p.passport.count());'
```

## Done means

- `prisma migrate status` → all migrations applied, **no drift**.
- Row counts match prod (SESSION_0450 baseline was 6 users / 14 orgs / 91 passports — expect current
  prod numbers, which grow over time).
- Any prior smoke residue (test rows, transient dev-login `Session` rows) and drift tables (e.g. a stray
  `playing_with_neon`) are gone — they existed only in the old mirror.

## Gotchas

- **Never** run `migrate reset` / `db push` / `--accept-data-loss` against prodsnap or prod — this
  drop/recreate of the *local* mirror is the only sanctioned reset, and only by the literal name
  `ronindojo_prodsnap`.
- **Don't hand-parse the Neon secret into psql/pg_dump flags** — pass the whole conninfo URL via a shell
  var read from `.env.prod` ([[qlmanage-native-svg-rasterizer]] sibling gotcha; [[env-prod-overlay-and-prodsnap]]).
- **Don't pre-install `citext`** — Prisma owns it via `extensions = [citext]`; `--no-owner --no-acl`
  avoids the ownership/extension fights on restore.
- `bun --env-file=.env.prod` **replaces** env-loading (doesn't merge) — that's why step 1 uses
  `import "dotenv/config"` to read the var, and why prod scripts backfill required vars from `.env`.
- After a refresh, if you had a locally-staged (reviewed-but-unpushed) migration, re-apply it with
  `bun run db:migrate:deploy` (the refresh pulls prod, which may not yet have it).
