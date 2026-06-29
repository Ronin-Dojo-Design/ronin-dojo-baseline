---
name: worktree-setup
description: Bootstrap a fresh git worktree so gates and the dev server run — installs deps, copies the canonical .env, generates the Prisma client. Use when a worktree has no node_modules / .env / Prisma client, when tsc/oxlint/bun test/next dev fail on module resolution, or when the user says "/worktree-setup", "bootstrap this worktree", or "set up the worktree".
---

A fresh git worktree (a `../ronin-NNNN` created off `main`, not the canonical
`/Users/brianscott/dev/ronin-dojo-app`) is **not set up**: no `node_modules`, no `apps/web/.env`, no
generated Prisma client, and `graphify` reads 0 nodes. Run this **before any gate** (`tsc`, `oxlint`,
`bun test`, `next dev`) — otherwise they fail on module resolution and look like a broken repo.

Run `.claude/skills/worktree-setup/bootstrap.sh` from the worktree (or follow it manually). It:

1. **Ensures `apps/web/.env` exists FIRST** — copies the canonical
   `/Users/brianscott/dev/ronin-dojo-app/apps/web/.env` (or, if that's absent, exports a throwaway
   `DATABASE_URL` so `bun install`'s prisma `postinstall` doesn't abort the whole install). Env-first
   means the postinstall generates the client in one shot — the documented order installs first and
   hits the `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL` failure.
2. **`bun install`** from the worktree root (Bun workspace, one root `bun.lock`).
3. **`bunx prisma generate --no-hints`** if the client is still missing (covers the throwaway-env path).

Canonical reference (source of truth):
[`dev-environment.md` § Fresh worktree bootstrap](../../../docs/runbooks/dev-environment/dev-environment.md#fresh-worktree-bootstrap).

**Caveats worth knowing in a worktree:**

- The `graphify` graph lives in the canonical checkout — an empty `graphify stats`/`query` here means
  "graph not built in this worktree," **not** "no matches." Never assert a negative from it.
- The sandbox shell has no `curl` / `psql` / `tr` / `timeout` — use `bun` (built-in `fetch`) for HTTP
  smoke-checks and `bun -e` / scripts for DB pokes.
- Dev server: `cd apps/web && npx next dev --turbo` (FS-0002). The copied `.env` points at the local
  `ronindojo_prodsnap` DB (needs Postgres.app running).
