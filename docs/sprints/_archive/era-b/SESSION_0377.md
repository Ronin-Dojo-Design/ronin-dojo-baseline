---
title: SESSION 0377 — BBL /app migration wave 3
slug: session-0377-bbl-app-wave-3
type: sprint
status: closed
created: 2026-06-13
updated: 2026-06-13
author: Brian + Codex
last_agent: codex-session-0377
---

# SESSION 0377 — BBL /app migration wave 3

## Goal

Migrate `/app` Wave 3 from `APP_AND_SERVER_MIGRATION_MAP.md`: `email`, `brand-settings`,
`privacy`, and `reports`, without Prisma, server flattening, Phase 3 identity, DNS, Vercel
production-domain, or Stripe changes.

## What landed

- Migrated `email`, `brand-settings`, `privacy/requests`, and `reports` from `apps/web/app/admin/*`
  into the unified `apps/web/app/app/*` shell.
- Added per-area `/app` layout guards with `requirePermission(APP_AREA_PERMISSIONS.<area>)`.
- Added `APP_AREA_PERMISSIONS.brandSettings`.
- Unwrapped moved page exports from `withAdminPage` to plain App Router page exports.
- Added Wave 3 `/admin/*` -> `/app/*` redirects and redirect regression coverage.
- Added app sidebar entries for Email, Brand Settings, Privacy, and Reports.
- Repointed Wave 3 route strings and `revalidatePath` values to `/app/*`.
- Kept `server/admin/<area>` modules in place; no server flattening was performed.

## Files touched

| Path | Change |
| --- | --- |
| `apps/web/app/app/email/*` | Moved email operations page/components from `/admin` to `/app`, added layout guard. |
| `apps/web/app/app/brand-settings/*` | Moved brand settings page/components from `/admin` to `/app`, added layout guard. |
| `apps/web/app/app/privacy/*` | Moved DSR requests workflow from `/admin/privacy/requests` to `/app/privacy/requests`, added privacy layout guard. |
| `apps/web/app/app/reports/*` | Moved reports page/components from `/admin` to `/app`, added layout guard. |
| `apps/web/config/app-redirects.ts` + `.test.ts` | Added Wave 3 redirects and regression assertions. |
| `apps/web/components/app/sidebar.tsx` | Added Wave 3 sidebar entries. |
| `apps/web/server/admin/brand-settings/actions.ts` | Repointed `revalidatePath` to `/app/brand-settings`. |
| `apps/web/server/admin/privacy/actions.ts` | Repointed DSR revalidation to `/app/privacy/requests`. |
| `apps/web/server/admin/reports/actions.ts` | Repointed report revalidation to `/app/reports`. |
| `apps/web/server/orpc/roles.ts` | Registered `brandSettings` app area permission. |
| `docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md` | Marked Wave 3 landed and Wave 4 next. |
| `docs/knowledge/wiki/index.md` + `log.md` | Logged the Wave 3 migration. |

## Verification

| Check | Result |
| --- | --- |
| `cd apps/web && bun test config/app-redirects.test.ts` | ✅ 6 pass, 32 assertions. |
| `bun run --filter @ronin-dojo/web typecheck` | ✅ route typegen + `tsc` exit 0. |
| `bun run --filter @ronin-dojo/web lint:check` | ✅ exit 0; warnings are inherited/moved unused params and existing repo warnings. |
| `bun run --filter @ronin-dojo/web format:check` | ✅ all 1,316 matched files formatted after formatter pass. |
| Residue check | ✅ no `withAdminPage`, `/admin` PageProps, `~/server/app/*`, or moved-area `~/app/admin/*` residues in Wave 3 files. |
| `curl` old admin routes on `bbl.local` dev server | ✅ `/admin/email`, `/admin/brand-settings`, `/admin/privacy`, `/admin/reports` return 308 to the new `/app` destinations. |
| Dev-login authenticated `curl` on `bbl.local` dev server | ✅ dev-login issued an admin session; `/app/email`, `/app/brand-settings`, `/app/privacy/requests`, and `/app/reports` returned 200 with `brand=BBL`. |
| `git diff -U0 \| bunx fallow audit --changed-since HEAD --diff-stdin` | ⚠️ exit 1 move noise: moved legacy email/privacy/report functions exceed size/complexity thresholds, report/table duplicates are inherited, and existing unused deps remain. No actionable new code path found. |

## Open decisions / blockers

- Nested `codex exec` autonomous runner could not start SESSION_0377 because the workspace reported
  out of credits; this session was completed manually on the runner-created branch.
- `privacy` intentionally routes to `/app/privacy/requests`; no standalone `/app/privacy` index was
  created because the legacy surface is the DSR request workflow.
- D-024 remains open until all admin areas migrate and the legacy `/admin` shell is deleted.

## Next session

### Goal

Migrate `/app` Wave 4 from `APP_AND_SERVER_MIGRATION_MAP.md`: `programs`, `courses`, `age-groups`,
`skill-levels`, and `schedule`.

### Inputs to read

- `docs/sprints/SESSION_0377.md`
- `docs/sprints/SESSION_0376.md`
- `docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md`
- `docs/product/black-belt-legacy/BBL-SOT-Spec.md`
- `docs/product/black-belt-legacy/SOT-ADR.md`

### First task

Start with `programs` and `courses` as the shared school-ops pattern: move the route folders,
preserve `server/admin/programs` imports, add app layout guards, unwrap `withAdminPage`, add redirects
and sidebar entries, repoint route strings/revalidation, then batch `age-groups`, `skill-levels`, and
`schedule`.

## Review log

### SESSION_0377_REVIEW_01 — Wave 3 /app migration

- **Reviewed tasks:** Wave 3 route moves, redirects/sidebar, revalidation repoints, and docs.
- **Verdict:** Mechanical continuation of the proven Wave 1/2 recipe. The one over-broad server import
  rewrite was caught by residue check and reversed before typecheck. No Prisma, server flattening, or
  identity work occurred.
- **Follow-up:** Wave 4; keep watching for inherited form warnings as moved admin forms enter `/app`.

## Hostile close review

- **Giddy:** Pass. Scope stayed inside Wave 3 despite the nested-runner credit failure.
- **Doug:** Pass with caveat. Static gates and redirect tests are green; browser render proof should be
  captured if the local dev server/auth setup is still available before merge.
- **Desi:** Pass. Sidebar entries reuse the dense app shell pattern; no new design primitives.

## ADR / ubiquitous-language check

- ADR update not required — this executes SOT-ADR D5.
- Ubiquitous language update not required — no new domain terms introduced.

## Reflections

- The Wave 2 sed-scope warning repeated in a new form: route string rewrites can accidentally hit
  `~/server/admin/*` imports. The useful guard is an explicit `~/server/app` residue check before
  typecheck.
- `privacy` needs special-case routing because the legacy admin tree only owns `privacy/requests`.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0377 created; migration map and wiki log stamped `2026-06-13`; `last_agent` set to `codex-session-0377` where touched. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` and `docs/knowledge/wiki/log.md` updated. |
| Wiki lint | ✅ `bun run wiki:lint` passed. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Giddy/Doug/Desi review present. |
| Review & Recommend | Next session goal + first task written for Wave 4. |
| Memory sweep | No ADR/glossary update needed; Wave 3 status recorded in `APP_AND_SERVER_MIGRATION_MAP.md`. |
| Next session unblock check | Wave 4 is inside the autonomous allowed scope; no blocker except nested Codex credit availability. |
| Git hygiene | ✅ FS-0024 guard passed on `auto/codex-session-0377`; conventional commit prepared. |
| Graphify update | ✅ `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`; final stats 11,865 nodes / 19,141 edges / 1,717 communities / 1,910 files tracked. |
