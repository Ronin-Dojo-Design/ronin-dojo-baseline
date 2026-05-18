---
title: Neon Prisma Advisory-Lock Recovery
slug: neon-advisory-lock-recovery
type: runbook
status: active
created: 2026-05-17
updated: 2026-05-17
last_agent: claude-session-0189
use_count: 1
pairs_with:
  - docs/protocols/failed-steps-log.md
  - docs/runbooks/prisma-workflow.md
  - docs/architecture/decisions/0017-pnpm-pre-post-scripts.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0189.md
tags:
  - prisma
  - neon
  - vercel
  - deploy
  - incident-recovery
---

# Neon Prisma Advisory-Lock Recovery

Recovery procedure for a stuck `pg_advisory_lock(72707369)` on the production Neon Postgres that blocks every Vercel deploy at the `prisma migrate deploy` prebuild step.

## Agent-agnostic

This runbook is the source of truth for any agent that encounters a `P1002` deploy failure with advisory-lock context: Claude, Copilot, Codex, or otherwise. The diagnostic and fix steps below do not depend on a specific LLM, IDE, or CLI.

## When to use

The Vercel build log (Production or Preview) shows:

```text
$ prisma migrate deploy
Error: P1002
The database server was reached but timed out.
Context: Timed out trying to acquire a postgres advisory lock
(SELECT pg_advisory_lock(72707369)). Timeout: 10000ms.
```

This looks like a database outage but usually isn't — it's a leaked session-level advisory lock from a prior Vercel build that was killed mid-migration.

## Why this happens

`prisma migrate deploy` acquires a session-level advisory lock (`SELECT pg_advisory_lock(72707369)`) before reading the migration table. The lock prevents two concurrent migrations from corrupting `_prisma_migrations`. The lock is released when the session ends.

If the Vercel build container is killed mid-migration — most common trigger: a deploy storm where Vercel SIGKILLs the in-flight build to replace it with a newer one, but OOM or network blip can do it too — the Postgres session holding the lock does not get to close gracefully. Postgres still considers the lock held until the original session ends. On Neon's pooler, idle connections close after roughly 5 minutes, so the lock self-clears if you wait. Until then, every subsequent `prisma migrate deploy` hits the 10-second acquisition timeout and the build fails.

Known triggers in this repo:

- Adding multiple Vercel env vars back-to-back (see `docs/protocols/failed-steps-log.md` FS-0023). Each env-var change fires a redeploy; if N changes go in within seconds, Vercel kills the in-flight builds in favor of the newest one.
- Manually cancelling a Vercel deploy that has already started `prebuild`.

## Diagnostic procedure

Run this against the affected Neon database. The Neon web console SQL editor works fine — no need to pull env vars locally:

```sql
SELECT
  l.pid,
  l.granted,
  a.state,
  a.query_start,
  now() - a.query_start AS held_for,
  a.application_name,
  a.client_addr
FROM pg_locks l
LEFT JOIN pg_stat_activity a ON a.pid = l.pid
WHERE l.locktype = 'advisory'
  AND l.objid = 72707369;
```

Note: `72707369` is Prisma's internal lock ID for `_prisma_migrations`. It is stable across migrations and Prisma versions, so this query is reusable indefinitely.

### Interpreting the result

| Result | Meaning | Next action |
| --- | --- | --- |
| Zero rows | Lock already cleared (Neon's idle-connection timeout closed the dead session). | Retrigger the deploy: push an empty commit, or hit Vercel's "Redeploy" with build cache disabled. |
| One row, `state = 'idle'` | Lock is leaked — session is alive but doing nothing. | Run the surgical fix below. |
| One row, `state` is NULL | Lock is leaked — backend gone but lock metadata still associated. | Run the surgical fix below. |
| One row, `state = 'active'` with a recent `query_start` | A migration is actually running right now. | Wait. Do not kill it. Re-run the query in 1–2 minutes; if it is still active and not progressing, escalate. |

## Surgical fix

If a leaked lock is confirmed, release it by terminating the holding session. You cannot use `pg_advisory_unlock(72707369)` from a fresh session — only the original lock-holder can unlock its own advisory locks, and that session is gone or unresponsive.

```sql
SELECT pg_terminate_backend(<pid from the diagnostic query>);
```

Then retrigger the Vercel deploy. The next `prisma migrate deploy` will acquire the lock cleanly and the build will succeed.

## What not to do

- **Do not** set `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1` as a permanent fix. The lock exists to prevent concurrent migrations from corrupting `_prisma_migrations`. Vercel mostly serialises deploys but does not absolutely guarantee it, so disabling the lock turns a rare race condition into a possible one. Acceptable only as a one-off escape hatch if you cannot get SQL access during an incident.
- **Do not** run `prisma migrate resolve` to "fix" this. The migration state is not corrupted; only the lock is leaked.
- **Do not** assume the Neon database is down. P1002 with advisory-lock context means the database is reachable — the timeout is on the lock acquisition itself.

## Prevention

- Batch Vercel env-var changes. Add all of them in one editing session, save, then trigger a single redeploy. Do not save each variable individually — every save fires a rebuild.
- Avoid cancelling an in-flight Vercel build that has already started `prebuild`. Let it finish or fail naturally.
- Watch SESSION_0189's bow-out evidence — that session is the first recorded occurrence of this pattern and includes the recovery proof.

## Cross-references

- [Failed Steps Log](../protocols/failed-steps-log.md) — FS-0022 (pnpm pre/post enablement) is the precondition that made `prisma migrate deploy` run on Vercel at all; FS-0023 (env var scope) is the trigger pattern that surfaced this lock leak.
- [Prisma Workflow](prisma-workflow.md) — local Prisma schema workflow, including `migrate dev` (which uses the same advisory lock locally but in a single-user environment where the lock never leaks).
- [ADR 0017 — pnpm pre/post scripts](../architecture/decisions/0017-pnpm-pre-post-scripts.md) — why `prebuild` runs `prisma migrate deploy` in the first place.
- [Closing Ritual](../rituals/closing.md) — full-close step 4 requires verifying Vercel deploy state, which is the bow-out gate that catches recurrences of this pattern.
- [SESSION_0189](../sprints/SESSION_0189.md) — first recorded incident and recovery proof.
