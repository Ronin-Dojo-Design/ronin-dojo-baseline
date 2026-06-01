---
title: "Schema Migration Runbook"
slug: schema-migration
type: runbook
status: active
created: 2026-04-28
updated: 2026-06-01
last_agent: codex-session-0317
use_count: 1
pairs_with:
  - docs/runbooks/database.md
  - docs/runbooks/prisma-workflow.md
  - docs/architecture/s2-schema-additions.md
  - docs/architecture/PETEY_PLAN_S2_SCHEMA_PASS4.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0022.md
  - docs/sprints/SESSION_0023.md
---

# Schema Migration Runbook

## When to use

When adding new models, enums, fields, or relations to `apps/web/prisma/schema.prisma` as part of a planned migration wave (Wave A–D or future).

## Prerequisites

- [ ] Schema spec is signed off (s2-schema-additions.md checkboxes checked)
- [ ] Local Postgres running (Postgres.app, elephant in menu bar)
- [ ] `ronindojo_dev` database exists
- [ ] On correct git branch (`main` or feature branch per session plan)
- [ ] Working tree clean (`git status --short` empty)

## Steps

### 1. Pre-flight check

```bash
cd /Users/brianscott/dev/ronin-dojo-app/apps/web
# Verify DB is reachable
/Applications/Postgres.app/Contents/Versions/latest/bin/psql ronindojo_dev -c "SELECT 1;"
# Verify current schema state
bunx prisma validate
```

### 2. Edit schema.prisma

Add models/enums/fields per the wave spec. Work in dependency order:
1. Enums first (no dependencies)
2. Independent models (no FK to other new models)
3. Dependent models (FK to models added in step 2)
4. Relation-only additions to existing models (new FKs, new relation fields)
5. Index additions

**Rule:** One wave = one atomic commit. Don't mix waves.

## When to use `migrate dev` vs `db push` vs `migrate deploy`

Three Prisma commands, three jobs. Pick by what the change needs downstream.

- **`prisma migrate dev`** — creates a versioned migration file in `prisma/migrations/` and applies it to the local dev DB in one step. Use this whenever the change must ship to production: Neon prod is migrated via `prisma migrate deploy` during Vercel prebuild (`package.json` `prebuild: bun run db:migrate deploy`), and `deploy` only runs migration files that already exist in the repo. No migration file in the repo means nothing to deploy.
- **`prisma db push`** — pushes the current `schema.prisma` to the dev DB without creating a migration file. Use for rapid local iteration only — destructive wave rewrites, throwaway schema experiments, or large model bursts where you're going to `dropdb/createdb` and reseed anyway. Do **not** use `db push` for changes that need to ship.
- **`prisma migrate deploy`** — applies committed migration files against the target DB. This is what Vercel runs in `prebuild` against Neon prod. Never invoke it by hand in dev; it's the production half of the pair with `migrate dev`.

Per FS-0021 corrective action #2: SESSION_0152 confirmed `migrate dev` is the correct path when a migration file must ship; the shadow-DB hang from SESSION_0004 did not reproduce on the current Prisma version.

### 3. Apply schema changes

Two valid workflows — choose based on change type:

#### Option A: Reset + `db push` (wave migrations / destructive changes)

Best for large wave migrations with many new models, or changes that drop columns/enums.

```bash
# Reset dev database (clean slate — fastest path)
/Applications/Postgres.app/Contents/Versions/latest/bin/dropdb ronindojo_dev
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb ronindojo_dev

# Push schema
cd /Users/brianscott/dev/ronin-dojo-app/apps/web
bunx prisma db push --accept-data-loss

# Generate client
bunx prisma generate
```

#### Option B: `migrate dev` (additive changes needing migration files)

Best for adding columns/models to an existing schema where you want a versioned migration file. Production uses `prisma migrate deploy` (see `package.json` `prebuild`), so migration files are needed for production deploys.

```bash
cd /Users/brianscott/dev/ronin-dojo-app/apps/web
bunx prisma migrate dev --name <descriptive-name>
```

This creates a migration in `prisma/migrations/`, applies it, and regenerates the client in one step.

> **Note:** The shadow DB hang reported in SESSION_0004 does not reproduce with Prisma 7.x.

### 4. Verify

```bash
# Check all models exist
bunx prisma db pull --print | grep "^model " | wc -l

# Quick sanity — count should match expected total
# Wave A: ~60 models, Wave B: ~74, Wave C: ~86, Wave D: ~86 (field changes only)
```

### 5. Seed

```bash
cd /Users/brianscott/dev/ronin-dojo-app/apps/web
bunx prisma db seed
```

If seed fails: check which model is missing. Likely a relation target doesn't exist yet — fix dependency order.

### 6. Smoke test

```bash
# Start dev server
npx next dev --turbo

# Verify: no Prisma client errors in console
# Verify: /me page loads (Passport)
# Verify: /organizations page loads
# Verify: /directory page loads
```

If Turbopack regresses on a DB-backed route, rerun the smoke with the stable webpack fallback:

```bash
npx next dev --webpack
```

SESSION_0317 rechecked `/disciplines/bjj` under Turbopack and got `200 OK` with no Prisma/error
overlay. Treat webpack as the fallback, not the default, unless a specific smoke proves otherwise.

### 7. Commit

```bash
cd /Users/brianscott/dev/ronin-dojo-app
git add apps/web/prisma/schema.prisma apps/web/.generated/
git commit -m "schema: Wave X — <description>"
```

### 8. Post-migration

- [ ] Update SESSION file: `Files touched`, `What landed`
- [ ] Update `s2-schema-additions.md` sign-off checkboxes if applicable
- [ ] Run type checker: `cd apps/web && bunx tsc --noEmit` (catch any broken imports)

## Wave execution order

| Wave | Models | Dependencies |
| --- | --- | --- |
| A | Pass 1: Program → OrgSettings (~24 models, ~17 enums) | None — all FKs point to existing models |
| B | Pass 2+3: Invite, Event, Bracket, Match, Lead, RuleSet (~14 models, ~12 enums) | Some FK to Wave A models (e.g., Event → Program) |
| C | Pass 4: Media, Technique, Certificate, Favorite, StudentList (~12 models, ~9 enums) | Some FK to existing models + Wave A (Attendance, BeltTestRegistration) |
| D | All passes: field additions to existing models | Depends on all prior waves being in schema |

## Rollback

If a wave fails mid-push:

```bash
# Reset to clean state
/Applications/Postgres.app/Contents/Versions/latest/bin/dropdb ronindojo_dev
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb ronindojo_dev

# Revert schema changes
git checkout -- apps/web/prisma/schema.prisma

# Re-push the previous good state
cd apps/web && bunx prisma db push --accept-data-loss && bunx prisma generate && bunx prisma db seed
```

## Known issues

- `citext` extension: do NOT pre-install. Prisma manages it via schema `extensions = [citext]`.
- Large schema changes (50+ models) can take 10-15 seconds on `db push`. Normal.

## Production migration (Neon)

**NOT covered here.** Production uses `prisma migrate deploy` (not `db push`). See `deploy.md` runbook (to be created). Never run `--accept-data-loss` against production.
