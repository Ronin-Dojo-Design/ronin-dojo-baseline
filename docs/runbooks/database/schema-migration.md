---
title: "Schema Migration Runbook"
slug: schema-migration
type: runbook
status: active
created: 2026-04-28
updated: 2026-07-26
last_agent: claude-session-0712
use_count: 3
pairs_with:
  - docs/runbooks/database/database.md
  - docs/runbooks/database/prisma-workflow.md
  - docs/runbooks/dev-environment/verification-and-testing.md
  - docs/architecture/s2-schema-additions.md
  - docs/architecture/PETEY_PLAN_S2_SCHEMA_PASS4.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/_archive/SESSION_0022.md
  - docs/sprints/_archive/SESSION_0023.md
---

# Schema Migration Runbook

## When to use

When adding new models, enums, fields, or relations to `apps/web/prisma/schema.prisma` as part of a planned migration wave (Wave A–D or future).

## Prerequisites

- [ ] Schema spec is signed off (s2-schema-additions.md checkboxes checked)
- [ ] Local Postgres running (Postgres.app, elephant in menu bar)
- [ ] Parent `DATABASE_URL` **and** `DIRECT_URL` names are printed and agree; the Prisma child datasource
      banner (or guarded/inline-pinned child launcher) confirms the same target
- [ ] `ronindojo_prodsnap` is reachable and backed up before any mutation
- [ ] A named disposable scratch DB is available for destructive/adversarial proof
- [ ] On correct git branch (`main` or feature branch per session plan)
- [ ] Working tree clean (`git status --short` empty)

## Steps

### 1. Pre-flight check

```bash
cd /Users/brianscott/dev/black-belt-legacy/apps/web
# Verify parent-shell targets without printing credentials
bun -e 'for (const k of ["DATABASE_URL","DIRECT_URL"]) { const v=process.env[k]; console.log(k, v ? new URL(v).pathname.slice(1) : "(unset)") }'

# Read-only child-process proof: require Prisma's datasource line to say ronindojo_prodsnap.
# Never adapt this raw bunx probe with --env-file=.env.e2e; use the guarded E2E helper instead.
bunx prisma migrate status

# Verify the non-disposable local mirror is reachable
/Applications/Postgres.app/Contents/Versions/latest/bin/psql ronindojo_prodsnap -c "SELECT 1;"
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

- **`prisma migrate dev`** — authors a versioned migration and applies it. Use only with both URLs pinned
  to an explicit scratch authoring DB; never let it infer the canonical prodsnap target. For data-sensitive
  SQL (type changes, preflights, partial indexes), hand-author/review the migration instead.
- **`prisma db push`** — throwaway prototyping only, with both URLs explicitly naming a disposable scratch
  DB. It is forbidden on prodsnap and never substitutes for a migration file.
- **`prisma migrate deploy`** — applies reviewed migration files. Vercel uses it for Neon prod, and local
  schema lanes use it deliberately on backed-up prodsnap after preflight. It is not a reset command.

Per FS-0021 corrective action #2: SESSION_0152 confirmed `migrate dev` is the correct path when a migration file must ship; the shadow-DB hang from SESSION_0004 did not reproduce on the current Prisma version.

### 3. Apply schema changes

Two valid workflows — choose based on change type:

#### Option A: Disposable scratch + `db push` (non-shipping prototype only)

Best for large wave migrations with many new models, or changes that drop columns/enums.

```bash
# Name the scratch target literally; never substitute prodsnap.
/Applications/Postgres.app/Contents/Versions/latest/bin/dropdb --if-exists --force ronindojo_schema_scratch
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb ronindojo_schema_scratch

# Pin BOTH Prisma URLs for the command.
cd /Users/brianscott/dev/black-belt-legacy/apps/web
env DATABASE_URL=postgresql://brianscott@localhost:5432/ronindojo_schema_scratch \
  DIRECT_URL=postgresql://brianscott@localhost:5432/ronindojo_schema_scratch \
  bunx prisma db push --accept-data-loss

# Generate client
bunx prisma generate
```

#### Option B: versioned migration (shipping change)

Best for adding columns/models to an existing schema where you want a versioned migration file. Production uses `prisma migrate deploy` (see `package.json` `prebuild` → `scripts/prebuild-migrate.ts`), so migration files are needed for production deploys.

#### When migrations ACTUALLY apply (read this before pushing a migration in a PR)

`prebuild` fires on **every** `bun run build` — locally AND on every Vercel build. Until
SESSION_0730 it ran `migrate deploy` unconditionally, so **a migration file in any pushed
branch reached the DB named by that environment's `DATABASE_URL` at FIRST PREVIEW BUILD —
hours before merge or review**. With preview env sharing the prod Neon URL, that meant
PR migrations hit PROD at PR-open (discovered when #397's migration `finished_at` predated
its merge by ~2h; survivable only because the migration was additive — the same path would
have executed a table-drop). The gate now (`scripts/prebuild-migrate.ts`):

| Build | `migrate deploy`? |
| --- | --- |
| Local `bun run build` (no `VERCEL` env) | ✅ applies to the local `.env` DB (unchanged) |
| Vercel **production** (`VERCEL_ENV=production`) | ✅ the ONE sanctioned prod-apply path |
| Vercel **preview / development** | ⛔ SKIP, loudly |

**Completing the fix (operator, Vercel dashboard):** scope the prod `DATABASE_URL` /
`DIRECT_URL` values to the Production environment ONLY and point the Preview environment at
a **Neon branch** DB. Until that lands, a preview whose code depends on a new column 500s at
runtime — that is the intended safe failure, never a silent prod write. Never "fix" a
broken preview by widening the gate or copying prod creds into preview scope.

##### ✅ LANDED (SESSION_0738 — #398 / D-058): preview isolation is live

Prod `DATABASE_URL` / `DIRECT_URL` are now scoped **Production-only**; the **Preview** environment
points at a dedicated **Neon `preview` branch** (child of `production`); Preview deployments sit
behind Vercel **Standard Deployment Protection**; and the **`production` Neon branch is protected**
(no accidental delete/reset). Proof: a throwaway additive-migration PR's Preview build logged
`[prebuild-migrate] SKIP: VERCEL_ENV=preview`, went READY against the branch, and prod
`_prisma_migrations` gained **0** rows.

**Preview-branch migration mechanism (ratified SESSION_0738 — manual model):**

- **One persistent `preview` branch** — NOT per-PR, and **no branch expiration / auto-delete**
  (every Preview deploy depends on it, so it must persist). Keep it fresh by **resetting it from
  `production`** (Neon → branch → *Reset from parent*) **after a migration merges to main** — never
  by deleting it. Reset ≠ delete.
- The `prebuild-migrate.ts` guard keeps **skipping** Preview. When a PR's Preview genuinely needs
  its *unmerged* migration exercised, apply that ONE migration explicitly to the branch — **anti
  prod-misfire rail: use a dedicated `PREVIEW_DIRECT_URL` (the `preview` branch's unpooled URL,
  NEVER prod), confirm the target DB identity FIRST, and never run `migrate dev` here:**
  ```bash
  # 1. Confirm identity (Neon SQL editor on the `preview` branch, or):
  #    bunx prisma db execute --url "$PREVIEW_DIRECT_URL" --stdin <<< 'select current_database();'
  # 2. Apply the reviewed migration to the branch ONLY:
  DATABASE_URL="$PREVIEW_DIRECT_URL" DIRECT_URL="$PREVIEW_DIRECT_URL" bunx prisma migrate deploy
  ```
  After merge, the reset-from-`production` step restores parity (drops the hand-applied copy).
- **Revisit** CI-automation + per-PR **ephemeral** Neon branches (those *would* carry a short
  expiration TTL) only if migration-bearing previews become frequent or concurrent.

```bash
cd /Users/brianscott/dev/black-belt-legacy/apps/web
# Either author against an explicitly pinned scratch DB, or create/hand-author the migration directory.
env DATABASE_URL=postgresql://brianscott@localhost:5432/ronindojo_schema_scratch \
  DIRECT_URL=postgresql://brianscott@localhost:5432/ronindojo_schema_scratch \
  bunx prisma migrate dev --name <descriptive-name>
```

Review the resulting SQL. Prove success on a fresh disposable DB and failure/rollback on an adversarial
scratch fixture when the migration has a preflight. Then back up + inventory prodsnap and apply the reviewed
file there with `bun run db:migrate:deploy`.

> **Note:** The shadow DB hang reported in SESSION_0004 does not reproduce with Prisma 7.x.

> **⚠ Not for column TYPE changes.** A bare `migrate dev` on a `String`→`enum` (or any type)
> change emits DROP+ADD COLUMN — see the next subsection.

#### Type-changing a column (String→enum) — hand-author the migration

Prisma's auto-diff cannot do an in-place column TYPE change. For e.g. `String`→`enum` (or any
type swap) it emits a **DROP COLUMN + ADD COLUMN** pair — which **resets every existing row to the
column default, silently wiping data** (e.g. every platform admin's `role` resets to `user`). **Do
NOT accept the SQL `migrate dev` generates for a type change.** Hand-author an in-place cast instead.

**The fix:**

1. **Scaffold without applying.** Run `migrate dev --create-only` with both URLs pinned to the named
   scratch authoring DB (as in Option B) to write the migration dir + a generated `migration.sql`
   WITHOUT touching prodsnap. *(`--create-only` is blocked non-interactively when a
   data-loss warning fires — so you may need to create the migration directory and write
   `migration.sql` fully by hand.)*
2. **Replace the generated DROP/ADD with an in-place cast.** Drop and re-set the column default
   around the cast — a column default blocks the type change:

   ```sql
   CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'tournament_director');

   ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
   ALTER TABLE "user" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::"UserRole");
   ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';
   ```

3. **Confirm every existing value is a valid enum label first** — the `USING (...::"UserRole")` cast
   errors at deploy if any row holds a string that isn't an enum member.
4. **Apply with `prisma migrate deploy`, NOT `migrate dev`.** A second `migrate dev` would re-diff
   the schema against the DB and try to "fix" your hand-edit, re-introducing the DROP/ADD.

**Reference impl:** `apps/web/prisma/migrations/20260626000000_user_role_enum/migration.sql`
(SESSION_0449 — `User.role` String→`UserRole` enum). The **inverse** (dropping a column / enum) hits
the same hand-author requirement and will recur for the gated Stage-2 brand-column prune.

### 4. Verify

```bash
# Check all models exist
bunx prisma db pull --print | grep "^model " | wc -l

# Quick sanity — count should match expected total
# Wave A: ~60 models, Wave B: ~74, Wave C: ~86, Wave D: ~86 (field changes only)
```

### 5. Seed (disposable DB only)

```bash
cd /Users/brianscott/dev/black-belt-legacy/apps/web
env DATABASE_URL=postgresql://brianscott@localhost:5432/ronindojo_schema_scratch \
  DIRECT_URL=postgresql://brianscott@localhost:5432/ronindojo_schema_scratch \
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
cd /Users/brianscott/dev/black-belt-legacy
git add apps/web/prisma/schema.prisma apps/web/prisma/migrations/<migration-directory>/
git diff --cached -- apps/web/prisma/schema.prisma apps/web/prisma/migrations/
git commit -m "schema: Wave X — <description>"
```

Generated Prisma clients are gitignored build artifacts; do not stage `.generated/`. The exact migration
directory is required because production `migrate deploy` can apply only migration files present in the
operator-authorized push.

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

- If scratch proof fails, drop only the literally named scratch DB, fix the SQL, and rerun from zero.
- If prodsnap deploy fails, stop. Preserve the backup and inspect `_prisma_migrations`; do not reset/db-push
  the mirror. Transaction-wrapped SQL should leave DDL/data unchanged, but prove that before recovery.
- Restore prodsnap from the verified dump only when the operator chooses recovery; never improvise a schema
  rewrite as rollback.

## Known issues

- `citext` extension: do NOT pre-install. Prisma manages it via schema `extensions = [citext]`.
- Large schema changes (50+ models) can take 10-15 seconds on `db push`. Normal.

## Production migration (Neon)

**Prod migrations auto-apply on deploy — you do NOT run them by hand.** The `apps/web`
`package.json` `prebuild` hook (`bun run db:migrate:deploy` → `prisma migrate deploy`) runs against
Neon prod during the Vercel build, applying every committed migration file that hasn't run yet
(see §"When to use `migrate dev` vs …" above, and [`deployment.md`](../deploy/deployment.md) §"prebuild").

Consequences:

- **The migration file must be committed and included in an operator-authorized push** or prod applies
  nothing — `migrate deploy` only runs files already in `prisma/migrations/`. Author or hand-write it
  locally, then complete the repository's explicit push gate.
- **If the migration errors, the Vercel BUILD fails** (and the deploy is skipped) — so a bad migration
  can't silently corrupt prod, but it will block the deploy. Verify it applies on `ronindojo_prodsnap`
  before requesting push authorization.
- The code is forward-safe if a *drop-column* migration hasn't run yet: Prisma only reads/writes the
  columns in the schema, so an extra prod column is ignored until `migrate deploy` removes it.
- **Never** run `prisma migrate reset`, `db push`, or `--accept-data-loss` against production. For an
  out-of-band manual apply (rare), set both `DATABASE_URL="<neon-direct>"` and
  `DIRECT_URL="<neon-direct>"` for `bunx prisma migrate deploy`
  (see [`deployment.md`](../deploy/deployment.md) §"Production database operations").
