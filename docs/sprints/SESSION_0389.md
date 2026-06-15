---
title: "SESSION 0389 — Phase 2c waves 5+6: commerce + infra admin to /app migration (Codex)"
slug: session-0389
type: session--implement
status: closed
created: 2026-06-15
updated: 2026-06-15
last_agent: codex-autonomous
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0388.md
  - docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0389 — Phase 2c waves 5+6: commerce + infra admin to /app migration (Codex)

## Date

2026-06-15

## Operator

Brian (Codex autonomous run, applied locally + pushed as commit `2792a77`)

## Goal

Migrate the remaining Phase 2c Wave 5 commerce/listing admin areas and Wave 6 infra admin areas from
legacy `/admin/*` routes into the unified `/app/*` workspace, with permission layouts, redirects,
sidebar entries, and route-path fixes only. No schema changes. No deletion of legacy admin files.

## Status

Closed. Operator applied the Codex output locally and pushed to `main` as commit `2792a77`.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0388.md`
- Carryover: SESSION_0388 closed the DNS flip lane + D11 decision. Phase 2c waves 5+6 were queued
  as the final `/app` migration work before Phase 3.

### Branch and worktree

- Branch: `work` (Codex sandbox); applied to `main` by operator
- Commit on `main`: `2792a77`

## Tasks

### Wave 5 — commerce / listings

Areas migrated to `/app`:

- `billing` — subscription billing management
- `categories` — listing categories
- `tags` — listing tags
- `pricing-plans` — pricing plan management
- `subscription-tiers` — subscription tier management
- `subscriptions` — subscription management
- `merch` — merchandise management

### Wave 6 — infra

Areas migrated to `/app`:

- `tools` — admin tools
- `storage` — media storage management
- `repo-docs` — repository documentation admin

### Pattern applied (per `APP_AND_SERVER_MIGRATION_MAP.md`)

For each area:

1. `app/app/<area>/layout.tsx` — `requirePermission(APP_AREA_PERMISSIONS.<key>)` wrapper
2. Page routes rewritten to `/app/<area>/`
3. Redirect entries in `config/app-redirects.ts` (`/admin/<area>` → `/app/<area>`)
4. Redirect tests in `config/app-redirects.test.ts`
5. Sidebar entries in `components/app/sidebar.tsx`
6. `revalidatePath` calls in server actions repointed to new paths

## What landed

85 files changed. 10 admin areas now live under `/app` with permission layouts, redirects, sidebar
entries, and revalidation path fixes. Commit `2792a77` on `main`.

## Verification

| Command | Result |
| --- | --- |
| `bun run db:generate` | ✅ passed |
| `bun run typecheck` (after `next typegen`) | ✅ passed |
| `npx tsc --noEmit` | ✅ passed |
| `bun test config/app-redirects.test.ts` | ✅ passed |
| `oxlint` on migrated areas | ✅ passed (pre-existing warning-level findings only) |

## Scope guard

- No Prisma/schema changes.
- No `server/web/*` or `server/admin/*` directory renames.
- No changes to `components/admin/sidebar.tsx` or `components/admin/command-palette.tsx`.
- No deletion of remaining `app/admin/*` shell files.

## Next session

Phase 3 — Passport-first identity re-root. See `docs/sprints/SESSION_0388.md` § Next session for
full inputs and first-task spec.
