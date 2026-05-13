---
title: Prisma Workflow Runbook
slug: prisma-workflow
type: runbook
status: active
created: 2026-04-26
updated: 2026-05-12
last_agent: copilot-session-0152
use_count: 0
backlinks:
  - docs/knowledge/wiki/index.md
---

# Prisma Schema Workflow — local dev

The recurring pattern for schema changes during local development.

## When to use

Any time you modify `apps/web/prisma/schema.prisma` — adding models, changing fields, updating enums, adding relations.

## Steps

### 1. Edit the schema

```bash
# File: apps/web/prisma/schema.prisma
# Make your changes, then save.
```

### 2. Choose your workflow

Two valid approaches — pick based on the change type:

#### Option A: `db push` (rapid prototyping / destructive changes)

Best for: large schema rewrites, wave migrations, dropping columns/tables, or when you don't need migration files.

```bash
# Reset dev database (clean slate)
/Applications/Postgres.app/Contents/Versions/latest/bin/dropdb ronindojo_dev
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb ronindojo_dev

# Push schema
cd apps/web
bunx prisma db push --accept-data-loss

# Generate client
bunx prisma generate

# Run seed
bun run prisma/seed.ts
```

##### One-liner (copy-paste)

```bash
cd apps/web && \
/Applications/Postgres.app/Contents/Versions/latest/bin/dropdb ronindojo_dev && \
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb ronindojo_dev && \
bunx prisma db push --accept-data-loss && \
bunx prisma generate && \
bun run prisma/seed.ts
```

#### Option B: `migrate dev` (additive changes that need migration files)

Best for: adding columns, adding models, or any change where you want a versioned migration file committed to `prisma/migrations/`. This is the correct workflow when production uses `prisma migrate deploy` (which it does — see `package.json` `prebuild` script).

```bash
cd apps/web
bunx prisma migrate dev --name <descriptive-name>
```

This creates a migration file in `prisma/migrations/`, applies it, and regenerates the client. No need to run `prisma generate` separately.

> **Note:** The shadow DB hang reported in SESSION_0004 does not reproduce with Prisma 7.x. `migrate dev` works correctly with Postgres.app.

#### When to use which

| Scenario | Use |
| --- | --- |
| New model wave (many models at once) | `db push` + reset |
| Adding a column to an existing model | `migrate dev` |
| Changing an enum (add/remove values) | `db push` + reset |
| Adding an optional field | Either works |
| Need migration file for production deploy | `migrate dev` |

### 3. Verify

```bash
bunx tsc --noEmit 2>&1 | head -30
```

Check for new type errors. Pre-existing Dirstarter template errors (PageProps, content-collections) are expected and can be ignored.

## When NOT to reset

- If you only added new optional fields or new models (no breaking changes), you can skip the dropdb/createdb and just run `prisma db push` + `prisma generate`.
- If you want to preserve existing test data, use `prisma db push` without `--accept-data-loss` and fix any errors manually.
- If you used `migrate dev`, no reset is needed — the migration is applied incrementally.

## Known issues

- **Postgres.app CLI not on PATH** — use full path `/Applications/Postgres.app/Contents/Versions/latest/bin/` or add to PATH per [Postgres.app docs](https://postgresapp.com/documentation/cli-tools.html).

## Related

- [Database runbook](database.md) — full environment setup, Neon production, Docker alternative
- [schema.prisma wiki page](../knowledge/wiki/files/schema-prisma.md)
- [seed.ts wiki page](../knowledge/wiki/files/seed-ts.md)

## Last verified

2026-04-26 — SESSION_0005 (Copilot)
