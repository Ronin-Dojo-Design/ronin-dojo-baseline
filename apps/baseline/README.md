# Baseline

The lean **white-label martial-arts school template** in the Ronin Dojo monorepo — its
**own database** (ADR 0038), its **own Vercel deploy** (ADR 0034), over the **shared kernel**
(`@ronin-dojo/ui-kit`, ADR 0033). Serves `baselinemartialarts.com` off its own project,
detached from the BBL app (`apps/web`).

Baseline is the lean SaaS _school_ template — a marketing site + lead-capture funnel. It is
**not** BBL's lineage/claim engine: no lineage graph, no Passport, no claim system. Those are
BBL's moat and live only in `apps/web`. See
[ADR 0039](../../docs/architecture/decisions/0039-baseline-as-apps-baseline.md).

> Status: **scaffolded skeleton** (SESSION_0463). Runnable + typechecks. The DB provision +
> domain cutover are operator-gated (see the ADR's handoff section).

## Re-skin for a new school (the white-label contract)

A new school site is a **two-file token swap** — no component edits:

1. **`lib/brand.ts`** — content identity (school name, tagline, hero copy, contact, nav) +
   the color/font data mirror.
2. **`app/globals.css`** — the CSS-variable color + type tokens (the runtime source of truth).

Drop in a logo, change those two files, done. The shared kernel (m-card, AdminKanban) inherits
the brand automatically via the `--mk-*` bridge in `globals.css`.

## Run (root workspace member — shares the root bun.lock, like apps/web)

Baseline lives under `apps/*`, so it's a **root workspace member** (not a standalone-bun
app like `clients/*`). It consumes the kernel via `workspace:*` and installs from the repo
root — exactly like `apps/web`. No separate `bun.lock`, no `file:` link script.

```bash
# from the repo root:
bun install                       # installs every workspace incl. apps/baseline

cd apps/baseline
cp .env.example .env              # local DATABASE_URL → baseline_dev (Postgres.app)
createdb baseline_dev             # local DB (or: Postgres.app createdb)
bunx prisma migrate dev --name init   # apply the lean schema to baseline_dev
bun run db:seed                   # template SchoolSettings defaults (no real data)
npx next dev --turbo              # http://localhost:3000  (FS-0002)
bun run typecheck
```

## Anatomy

```text
apps/baseline/
  app/                 # runnable Next skeleton (token-driven landing page)
  lib/
    brand.ts           # THE brand-tokens kit — school identity + color/font data
    db.ts              # Prisma client singleton (driver-adapter, own DB)
  prisma/
    schema.prisma      # lean: Lead + SchoolSettings (NOT BBL's lineage schema)
    seed.ts            # template defaults only (no real data)
  prisma.config.ts     # Prisma 7: DATABASE_URL lives here, not in schema.prisma
  .env.example         # DATABASE_URL → baseline_dev
```

## Operator-gated handoffs (NOT done in this session)

- **Provision** `baseline_dev` locally + a Baseline Neon DB at deploy.
- **Vercel**: create the Baseline project rooted at `apps/baseline`; **detach
  `baselinemartialarts.com` from the BBL project and attach it here** — only after verifying
  `blackbeltlegacy.com` is attached to the BBL project first (so BBL never goes dark).
- **CI/deploy wiring** (`vercel.json` `ignoreCommand`, `apps/*` CI) is SESSION_0465's job.

See the [ADR](../../docs/architecture/decisions/0039-baseline-as-apps-baseline.md) and
[per-app-db-separation runbook](../../docs/runbooks/database/per-app-db-separation.md).
