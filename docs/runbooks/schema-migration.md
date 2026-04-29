---
title: "Schema Migration Runbook"
slug: schema-migration
type: runbook
status: active
created: 2026-04-28
updated: 2026-04-28
last_agent: copilot-session-0022
health: 8
use_count: 0
pairs_with:
  - docs/runbooks/database.md
  - docs/runbooks/prisma-workflow.md
  - docs/architecture/s2-schema-additions.md
  - docs/architecture/PETEY_PLAN_S2_SCHEMA_PASS4.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0022.md
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
bunx prisma db push --dry-run 2>&1 | head -20
```

### 2. Edit schema.prisma

Add models/enums/fields per the wave spec. Work in dependency order:
1. Enums first (no dependencies)
2. Independent models (no FK to other new models)
3. Dependent models (FK to models added in step 2)
4. Relation-only additions to existing models (new FKs, new relation fields)
5. Index additions

**Rule:** One wave = one atomic commit. Don't mix waves.

### 3. Reset and push

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

- `prisma migrate dev` hangs on shadow DB creation with Postgres.app. Use `prisma db push` for local dev.
- `citext` extension: do NOT pre-install. Prisma manages it via schema `extensions = [citext]`.
- Large schema changes (50+ models) can take 10-15 seconds on `db push`. Normal.

## Production migration (Neon)

**NOT covered here.** Production uses `prisma migrate deploy` (not `db push`). See `deploy.md` runbook (to be created). Never run `--accept-data-loss` against production.
