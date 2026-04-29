---
title: Prisma Workflow Runbook
slug: prisma-workflow
type: runbook
status: active
created: 2026-04-26
updated: 2026-04-26
last_agent: copilot-session-0005
use_count: 0backlinks:
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

### 2. Reset the dev database

```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/dropdb ronindojo_dev
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb ronindojo_dev
```

> **Why reset?** `prisma db push` can't always handle destructive changes (dropped columns, changed enums) on an existing DB. A clean slate is faster than debugging drift. The seed file restores all reference data.

### 3. Push schema to DB

```bash
cd apps/web
bunx prisma db push --accept-data-loss
```

This syncs the database to the schema without creating migration files. We use `db push` (not `migrate dev`) because `migrate dev` hangs on the shadow DB — see [Known issues](#known-issues).

### 4. Generate Prisma client

```bash
bunx prisma generate
```

This regenerates the TypeScript types in `.generated/prisma/`. Required after any schema change.

### 5. Run the seed

```bash
bun run prisma/seed.ts
```

Populates all system defaults: disciplines, rank systems, ranks, roles, tournament roles, gamification event types, subscription tiers, styles.

### 6. Verify

```bash
bunx tsc --noEmit 2>&1 | head -30
```

Check for new type errors. Pre-existing Dirstarter template errors (PageProps, content-collections) are expected and can be ignored.

## One-liner (copy-paste)

```bash
cd apps/web && \
/Applications/Postgres.app/Contents/Versions/latest/bin/dropdb ronindojo_dev && \
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb ronindojo_dev && \
bunx prisma db push --accept-data-loss && \
bunx prisma generate && \
bun run prisma/seed.ts
```

## When NOT to reset

- If you only added new optional fields or new models (no breaking changes), you can skip the dropdb/createdb and just run `prisma db push` + `prisma generate`.
- If you want to preserve existing test data, use `prisma db push` without `--accept-data-loss` and fix any errors manually.

## Known issues

- **`prisma migrate dev` hangs** — even with shadow DB configured and `CREATEDB` granted. Use `db push` for local dev. Migration history will be established on Neon for production. Tracked since SESSION_0004.
- **Postgres.app CLI not on PATH** — use full path `/Applications/Postgres.app/Contents/Versions/latest/bin/` or add to PATH per [Postgres.app docs](https://postgresapp.com/documentation/cli-tools.html).

## Related

- [Database runbook](database.md) — full environment setup, Neon production, Docker alternative
- [schema.prisma wiki page](../knowledge/wiki/files/schema-prisma.md)
- [seed.ts wiki page](../knowledge/wiki/files/seed-ts.md)

## Last verified

2026-04-26 — SESSION_0005 (Copilot)
