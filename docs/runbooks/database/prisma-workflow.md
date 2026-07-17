---
title: Prisma Workflow Runbook
slug: prisma-workflow
type: runbook
status: active
created: 2026-04-26
updated: 2026-07-16
last_agent: codex-session-0542
use_count: 0
pairs_with:
  - docs/runbooks/database/database.md
  - docs/runbooks/database/schema-migration.md
  - docs/runbooks/dev-environment/verification-and-testing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Prisma workflow — target-safe decision guide

This page is intentionally a thin router. The executable schema workflow lives in
[Schema Migration Runbook](schema-migration.md); database roles and connection setup live in
[Database Runbook](database.md). Keeping raw reset/db-push recipes here created a second, stale source of
truth and contributed to FS-0032.

## When to use

Any time you modify `apps/web/prisma/schema.prisma` or invoke a Prisma command locally.

## First gate: effective target

`prisma.config.ts` prefers `DIRECT_URL`. First print the database names visible to the parent shell; they
must agree. Then, for the canonical local target, run the read-only status probe and require Prisma's own
datasource banner to name `ronindojo_prodsnap`:

```bash
cd apps/web
bun -e 'for (const k of ["DATABASE_URL","DIRECT_URL"]) { const v=process.env[k]; console.log(k, v ? new URL(v).pathname.slice(1) : "(unset)") }'
bunx prisma migrate status
```

The first line is **not** child-process proof. A raw `bun --env-file=.env.e2e x prisma …` hop has been
observed discarding an E2E overlay and reloading the default prodsnap `.env`, even when the E2E file set both
URLs correctly. Use `bun run e2e:db:setup` for E2E. For scratch work, put both URL assignments directly on
the same `env … bunx prisma …` child command and verify its datasource banner before trusting the result.

## Decision table

| Need | Correct path |
| --- | --- |
| Apply reviewed, checked-in migration locally | Back up + preflight `ronindojo_prodsnap`, then `bun run db:migrate:deploy`; run DB-backed Bun tests there. |
| Author a shipping migration | Follow `schema-migration.md`; use an explicitly pinned scratch authoring DB or hand-author data-sensitive SQL. |
| Prototype destructive schema ideas | Named disposable scratch DB with **both** URLs pinned; `db push` is allowed only there. |
| Rebuild Playwright fixture | Literal `dropdb ... ronindojo_e2e`, then guarded `bun run e2e:db:setup`. |
| Deploy production | Commit the migration file; Vercel prebuild runs `migrate deploy` against Neon. Manual apply is exceptional and operator-controlled. |

## Never on prodsnap

- `prisma migrate reset`
- `db push` / `--accept-data-loss`
- destructive seed experiments
- a raw Prisma command after checking only `DATABASE_URL`

For adversarial migration failure proof, restore/clone prodsnap into a separately named scratch DB and leave the
real mirror untouched until the migration is reviewed and the backup/preflight is complete.

## Known issues

- **Postgres.app CLI not on PATH** — use full path `/Applications/Postgres.app/Contents/Versions/latest/bin/` or add to PATH per [Postgres.app docs](https://postgresapp.com/documentation/cli-tools.html).
- **Shadow DB hang on `prisma migrate dev` (SESSION_0004)** — did not reproduce in SESSION_0152. This does
  not relax target isolation: run it only against an explicitly pinned scratch authoring DB.

## Related

- [Database runbook](database.md) — full environment setup, Neon production, Docker alternative
- [schema.prisma wiki page](../../knowledge/wiki/files/schema-prisma.md)
- [seed.ts wiki page](../../knowledge/wiki/files/seed-ts.md)

## Last verified

2026-07-16 — SESSION_0542 (Codex): removed duplicate destructive recipes and aligned all targets with the
prodsnap/E2E/scratch role split.
