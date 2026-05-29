---
title: "ADR 0017 - Enable pnpm pre/post lifecycle scripts so Vercel runs prisma migrate deploy"
slug: adr-0017
type: adr
status: accepted
created: 2026-05-17
updated: 2026-05-17
last_agent: claude-session-0188
pairs_with:
  - docs/protocols/failed-steps-log.md
  - docs/sprints/SESSION_0188.md
  - docs/runbooks/schema-migration.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0017 - Enable pnpm pre/post lifecycle scripts so Vercel runs prisma migrate deploy

**Status:** Accepted
**Date:** 2026-05-17

## Context

`apps/web/package.json` declared `"prebuild": "bun run db:migrate deploy"` from the original Dirstarter scaffold. The intent: every Vercel build runs `prisma migrate deploy` to apply any pending migrations to the production database before `next build` is invoked, so the Prisma client and DB schema stay in sync deploy-to-deploy.

In SESSION_0188 we discovered that pnpm 9 — the package manager Vercel uses to install our monorepo via `pnpm --filter dirstarter build` — disables npm-style `prebuild` / `postbuild` lifecycle hooks by default. The repo had no `.npmrc` setting `enable-pre-post-scripts=true`, so the `prebuild` hook had been silently skipped on every Vercel build for an unknown number of months.

This was harmless until SESSION_0186 added two `User` table migrations (`add_user_placeholder_archival`, `backfill_placeholder_users`) and the Prisma client started selecting `User.isPlaceholder` via better-auth's user-fallback-join. The migrations sat queued; the prod DB never received them; the moment Vercel finally deployed the new Prisma client, `/api/auth/get-session` 500'd with `P2022: ColumnNotFound` and broke production login.

We considered three alternatives, then chose the smallest change.

## Decision

**Add `.npmrc` at the repo root containing `enable-pre-post-scripts=true`. Keep the `prebuild` script in `apps/web/package.json` as the authoritative spot for "what runs before `next build`."**

## Alternatives considered

### Option A — Add `.npmrc` with `enable-pre-post-scripts=true` (chosen)

- **Pros:** Smallest delta (one line). Preserves the existing `prebuild` convention. Future pre/post hooks anywhere in the workspace also start working. Pnpm warns when this is missing in `dlx`/`exec` contexts but not on `--filter ... build`, so explicit opt-in is the only fix.
- **Cons:** Implicit — a reader of `apps/web/package.json` who doesn't know about pnpm 9 might still expect `prebuild` to run without checking `.npmrc`. Mitigation: this ADR + FS-0022 record the gotcha.

### Option B — Inline the migration into `build`

```jsonc
{
  "scripts": {
    "build": "bun run db:migrate deploy && next build"
  }
}
```

- **Pros:** No `.npmrc` dependency. Self-documenting at the call site.
- **Cons:** Loses the `pre*`/`post*` convention that other scripts in this repo also use. Any future `prebuild` consumer (e.g. type generation, codegen, asset compilation) would also need to chain into `build` manually. Doesn't fix the broader workspace-wide issue.

### Option C — Vercel `buildCommand` override

Override `vercel.json` `buildCommand` to explicitly run `cd ../.. && pnpm --filter dirstarter db:migrate deploy && pnpm --filter dirstarter build`.

- **Pros:** Explicit at the deploy boundary.
- **Cons:** Vercel-specific. Local `pnpm build` (e.g. for self-hosting tests) still wouldn't migrate. Couples deploy step to platform.

Option A is the smallest blast radius and the most pnpm-conventional, so it wins.

## Dirstarter docs proof

This pattern aligns with the Dirstarter project structure runbook's deploy story (Vercel + Prisma + `prebuild` chain). No live Dirstarter URL needed for this ADR; the pattern is a pnpm/npm contract, not a Dirstarter-owned primitive.

| Layer | URL | Date checked |
| --- | --- | --- |
| Project structure | https://dirstarter.com/docs/project-structure | 2026-05-17 |

## Consequences

- **Future migrations auto-deploy.** Every Vercel build runs `prisma migrate deploy` before `next build`. Pending migrations in `prisma/migrations/` will apply on the next preview or production deploy without manual intervention.
- **`prebuild` is now load-bearing.** If a future agent adds something destructive to `prebuild`, it will run on every deploy. The script must stay idempotent and safe (Prisma's `migrate deploy` is idempotent by design).
- **Bow-out should verify `prebuild` ran.** When a session adds new migrations, the bow-out evidence should include a Vercel build-log excerpt showing the `> prebuild` step executed and the migration applied. Captured in FS-0022 as the future-detection rule.
- **Workspace-wide pre/post hooks now work.** If we later add `predev`, `pretest`, etc. in any workspace `package.json`, they'll fire. Worth knowing — no current ones exist, but it changes the default behavior.

## Cross-references

- [FS-0022 — pnpm 9 pre/post lifecycle hooks silently disabled on Vercel](../../protocols/failed-steps-log.md#fs-0022--pnpm-9-prepost-lifecycle-hooks-silently-disabled-on-vercel)
- [SESSION_0188 — Enrollment Safe-Action Wrapper (session continuation)](../../sprints/_archive/SESSION_0188.md#session-continuation--unplanned-post-close-work)
- [Schema migration runbook](../../runbooks/schema-migration.md)
