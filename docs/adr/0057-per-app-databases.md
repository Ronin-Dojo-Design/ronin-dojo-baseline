---
title: "ADR 0057 — One database per app"
slug: adr-0057-per-app-databases
type: decision
status: accepted
created: 2026-07-26
updated: 2026-07-26
last_agent: claude-session-0711
---

# 0057 — One database per app

## Status

Accepted — re-states [legacy ADR 0038](../architecture/decisions/0038-per-product-database-separation.md)
(as vocabulary-corrected by ADR 0051: "product" → **app**, the deploy unit = one Vercel project +
one DB). Phases 1–2 (local) are landed; cloud cutover remains operator-gated.

## Context

ADR 0034 settled monorepo + per-app deploys but left one shared Postgres — one blast radius, one
backup/failure domain, no clean client handoff, and BBL's lineage graph (the moat) entangled with
client experiments.

## Decision

- **One DB per app**: own `DATABASE_URL`, own `prisma/` schema + migrations, own env. No
  cross-app foreign keys — data crosses apps via an API/contract or not at all.
- **Stay monorepo** — separation is about data, deploys, and brands, not components; the
  `packages/ui-kit` kernel stays shared in-repo.
- **Identity is per-app** (own Better Auth tables per app). Duplicated auth schema is correct,
  not duplication-to-fix.
- **A separate prod repo stays deferred** — reserved for a contractual client handoff (legacy
  ADR 0033 D1), not de-risking.

## Consequences

- Independent migrations/backups/scaling; a bad client migration cannot take down BBL; a client
  app is cleanly extractable at handoff.
- Local dev runs a DB per active app (`ronindojo` = BBL, `mammoth_dev`, `baseline_dev`);
  `prodsnap` is BBL-scoped. `clients/*` gates run standalone (root CI never covers them —
  `clients-ci.yml` discover→matrix).
- `migrate dev` stays banned on shared local DBs; prod migrations auto-apply via
  `prebuild → migrate deploy`.
