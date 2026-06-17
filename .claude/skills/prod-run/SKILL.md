---
name: prod-run
description: Safely run a one-off script (seed / import / backfill) against the production Neon database. Use whenever a task needs to mutate prod data via a script — handles dry-run, target verification, sensitive-env handling, and cleanup.
---

Production is **one Neon project, brand-scoped** (ADR 0004). The deploy runs `prisma migrate deploy` only — it
does **NOT** seed; import/seed scripts are **manual**. Never run `db push` / `migrate dev` / `reset` /
`--accept-data-loss` against prod (`docs/runbooks/database/database.md`,
`docs/runbooks/database/neon-advisory-lock-recovery.md`).

## Steps

1. **Get the prod `DATABASE_URL` from the operator.** It's a Vercel **Sensitive** var, so `vercel env pull`
   returns it **empty** — the operator pastes it. Put it (+ any other run-only creds) in a `chmod 600` temp
   file under `/tmp`, **not** in `apps/web/.env` (that would point your dev server and other scripts at prod).
   `set -a; . /tmp/run.env; set +a` for the run; **delete the temp file after**.

2. **Confirm the target host before any real run.** Many scripts default `DATABASE_URL` to the **local dev DB**
   when unset (e.g. `process.env.DATABASE_URL ?? "postgresql://…localhost…/ronindojo_dev"`) — so without the
   override they silently hit localhost, not prod. Echo the host:
   `echo "$DATABASE_URL" | sed -E 's#.*@([^/:]+).*#\1#'` — it must be the Neon `*-pooler.*.neon.tech` host.

3. **Dry-run first.** Most scripts have `--dry-run`. Verify the dry-run path **returns before any write** —
   grep the script for `isDryRun` gating the `.create` / `.update` / `.upsert` / `.delete` calls. A good
   dry-run prints the preview and `return`s without opening a write.

4. **Prefer idempotent + non-destructive scripts** (upsert / dedupe / enrich-empty-only) so a re-run is safe.
   Read the script header for its dedupe key before trusting "it won't duplicate."

5. **Neon advisory-lock P1002** only bites `migrate deploy` (not plain scripts). If a deploy hangs on it,
   recover per `neon-advisory-lock-recovery.md` (terminate the leaked backend in Neon's SQL editor, or wait ~5min).

6. **Cleanup:** delete the temp creds file; if the operator pasted the prod DB password into chat, remind them
   to rotate it in Neon. See [[bbl-cutover]] and the operator's script-caution preference.
