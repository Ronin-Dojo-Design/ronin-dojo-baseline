---
title: "Neon Credential Rotation Runbook"
slug: neon-credential-rotation
type: runbook
status: active
created: 2026-07-16
updated: 2026-07-16
last_agent: codex-session-0548
pairs_with:
  - docs/security/ronin-security-risk-register.md
  - docs/runbooks/database/database.md
  - docs/runbooks/database/prisma-workflow.md
  - docs/runbooks/deploy/vercel-deploy.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0548.md
tags:
  - database
  - neon
  - credentials
  - production
  - runbook
---

# Neon Credential Rotation Runbook

Operator-only procedure for rotating the exposed production Neon credential tracked as RISK #13.
Do not paste, print, commit, screenshot, or quote any credential value while following this runbook.

## Scope

Rotate the production Neon role password, then update every place that stores the production
connection strings:

- Neon dashboard role password
- Vercel Production environment variables
- local gitignored production overlay (`apps/web/.env.prod`)

This runbook does not rotate data, run migrations, or change schema.

## Safety Rules

- Do not put a full `postgres://...` URL on a shell command line.
- Do not run commands with `set -x`.
- Do not paste connection strings into chat, issue comments, PRs, session files, or screenshots.
- Do not rely on `vercel env pull` to recover secret values. Vercel Sensitive variables pull as empty
  strings; the dashboard/write path is the source for setting them, not reading them back.
- Keep the old credential available only until the new one is verified, then treat it as dead.

## 1. Prepare

1. Open the Neon dashboard for the production project.
2. Open the Vercel project settings for the production deployment.
3. Open the local checkout that owns the ignored production overlay:
   `/Users/brianscott/dev/ronin-dojo-app/apps/web/.env.prod`.
4. Confirm which app/database is production before editing anything.
5. Prepare both connection strings from the new Neon values:
   - `DATABASE_URL`: pooled runtime connection string when the app expects pooled Neon access.
   - `DIRECT_URL`: direct, non-pooler connection string for Prisma migrations and direct checks.

## 2. Rotate in Neon

1. In Neon, go to the production project.
2. Open **Roles**.
3. Reset the password for the production database role, or create a replacement role if the operator
   chooses a create-and-cutover rotation.
4. Copy the new connection details into a local password manager or secure scratch buffer only.
5. Do not test by pasting the URL into a command line.

## 3. Update Vercel

1. In Vercel, edit the Production environment variables for the app that serves production.
2. Update both `DATABASE_URL` and `DIRECT_URL`.
3. Mark both as Sensitive.
4. Save the variables in one editing session if possible. Multiple rapid env saves can trigger
   multiple redeploys; prefer one deliberate redeploy after both values are set.
5. Do not use `vercel env pull` as verification for the value. Sensitive vars may appear present by
   name but pull empty by value.

## 4. Update Local Overlay

1. Open `apps/web/.env.prod` in the canonical checkout.
2. Replace only the affected production DB variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
3. Keep the file gitignored.
4. Save without printing the values in terminal output.
5. If a temporary scratch file was used during the rotation, delete it after verification.

## 5. Verify Deployment

1. Trigger or wait for a production deployment after the Vercel env update.
2. Verify the deployment reaches a terminal success state.
3. Smoke a production route that requires a DB read but does not mutate data.
4. If the deploy fails with database connection errors, re-check that:
   - `DATABASE_URL` uses the expected runtime connection shape.
   - `DIRECT_URL` uses the direct Neon host, not the pooler host.
   - both variables were updated in the Production scope.

## 6. Verify Prisma Connectivity

Use environment variables or an env file, not a literal URL on the command line.

Recommended local shape:

```bash
cd /Users/brianscott/dev/ronin-dojo-app/apps/web
SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod prisma db execute --stdin
```

Then enter a harmless read-only query and close stdin:

```sql
select 1;
```

Alternative `psql` shape if available: export `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, and
`PGSSLMODE=require`, then run `psql` without embedding the password or full URL in the command.

## 7. Closeout

1. Confirm production deploy success.
2. Confirm local Prisma connectivity using the new credential.
3. Confirm the old password no longer works if Neon exposes that check safely.
4. Update RISK #13 only after the rotation and verification are complete.
5. Record evidence without secrets: timestamp, deployment id/status, and the fact that `select 1`
   succeeded.
