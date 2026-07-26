---
title: "SESSION 0378 — BBL /app migration wave 4"
slug: session-0378
type: session--implement
status: closed
created: 2026-06-13
updated: 2026-06-13
last_agent: codex-session-0378
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0377.md
  - docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0378 — BBL /app migration wave 4

## Date

2026-06-13

## Operator

Brian + codex-session-0378

## Goal

Migrate `/app` Wave 4 from the BBL migration map: `programs`, `courses`, `age-groups`,
`skill-levels`, and `schedule`. This session intentionally stops before Prisma edits, server
flattening, Phase 3 identity work, DNS/Vercel production-domain changes, and Stripe rehearsal changes.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0377.md`
- Carryover: SESSION_0377 migrated Wave 3 (`email`, `brand-settings`, `privacy`, `reports`) to the
  unified `/app` shell and queued Wave 4: the school-ops cluster (`programs`, `courses`,
  `age-groups`, `skill-levels`, `schedule`).
- User-required prior read: `docs/sprints/SESSION_0374.md` and
  `docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md` were read first for the wave
  recipe and autonomous boundary.

### Branch and worktree

- Branch: `auto/codex-session-0378`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `5effe60`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Unified `/app/*` dashboard, auth/permission shell, app redirects. |
| Extension or replacement | Extension: continues the upstream `/app` adoption already proven in Waves 1-3. |
| Why justified | Phase 3 and later school-ops/identity work need final `/app` routes so admin surfaces move once. |
| Risk if bypassed | School-ops admin surfaces would keep depending on legacy `/admin` wrappers and route strings. |

Live docs checked during planning: not applicable; local SoT set plus SESSION_0374/0377 and the migration map govern this mechanical wave.

### Graphify check

- Graph status: current; stats at bow-in: 11,865 nodes, 19,141 edges, 1,717 communities, 1,910 files tracked.
- Queries used:
  - `unified app migration programs courses age-groups skill-levels schedule admin app redirects sidebar requirePermission`
- Files selected from graph:
  - `apps/web/app/admin/{programs,courses,age-groups,skill-levels,schedule}/**`
  - `apps/web/server/admin/programs/**`
  - `apps/web/config/app-redirects.ts`, `apps/web/config/app-redirects.test.ts`
  - `apps/web/components/app/sidebar.tsx`, `apps/web/server/orpc/roles.ts`
- Verification note: Graphify selected the route clusters; exact files are opened directly before editing.

### Drift logged

- D-024 remains open: the repo is still behind the final unified `/app` dashboard state until all
  admin areas migrate and the legacy `/admin` shell is deleted. This wave reduces the drift.

## Petey plan

### Goal

Migrate Wave 4 (`programs`, `courses`, `age-groups`, `skill-levels`, `schedule`) to permission-gated `/app` routes with redirects, sidebar entries, route-string updates, and focused proof.

### Tasks

#### SESSION_0378_TASK_01 — Wave 4 route migration

- **Agent:** Cody
- **What:** Move the Wave 4 school-ops route folders from `/admin` to `/app` using the proven recipe.
- **Steps:** per area: `git mv`; scoped import rewrite inside moved dir only; add `layout.tsx` with `requirePermission(APP_AREA_PERMISSIONS.<area>)`; unwrap `withAdminPage`; verify permission key; add redirects/tests; repoint route strings and `revalidatePath` values to `/app`; add permission-gated sidebar entries.
- **Done means:** the five areas compile under `/app`, old `/admin` routes redirect, and no `server/admin/<area>` imports are rewritten.
- **Depends on:** nothing

#### SESSION_0378_TASK_02 — Verify, review, and full close

- **Agent:** Doug + Desi + Petey
- **What:** Run required gates, authenticated/curl proof as available, changed-line fallow, wiki sweep, Graphify update, FS-0024 guard, and commit.
- **Steps:** run `bun run wiki:lint`, `bun run typecheck`, `(cd apps/web && bun run lint:check && bun run format:check)`, focused redirect tests, fallow changed-line audit, curl/browser smoke as auth allows, then close the SESSION and commit.
- **Done means:** gates pass and one conventional commit exists on the current branch; no push/PR.
- **Depends on:** SESSION_0378_TASK_01

### Parallelism

No parallel route edits. The wave touches shared redirect, sidebar, and permission files, so Cody does the code change coherently inline.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0378_TASK_01 | Cody | Shared-file mechanical migration. |
| SESSION_0378_TASK_02 | Doug + Desi + Petey | Verification, UI consistency review, close ledger. |

### Open decisions

None. Wave 4 is explicitly inside the autonomous allowed scope.

### Risks

- Greedy route rewrites can corrupt `~/server/admin/<area>` import paths; rewrites stay scoped to moved route dirs and route strings.
- `programs` and `courses` share `server/admin/programs` imports; route moves must preserve those server paths.
- `schedule` may contain child routes/components; redirects must include child paths.
- Fallow may report inherited moved-code complexity because `git mv` makes legacy lines appear changed.

### Scope guard

- Do not edit `apps/web/prisma/**` or create migrations.
- Do not execute the `server/<entity>` flatten or move `server/web|server/admin` modules.
- Do not start Phase 3 identity re-root.
- Do not make DNS, Vercel production-domain, or Stripe rehearsal changes.
- Do not migrate Wave 5+ in this session.

### Dirstarter implementation template

- **Docs read first:** BBL SoT set, SESSION_0374, SESSION_0376, SESSION_0377, `APP_AND_SERVER_MIGRATION_MAP.md`.
- **Baseline pattern to extend:** `lib/auth-guard` `requirePermission`, `/app/<area>/layout.tsx`, `config/app-redirects.ts`, permission-gated app sidebar.
- **Custom delta:** Ronin admin areas move onto upstream-style `/app` shell while server modules remain in place.
- **No-bypass proof:** This executes SOT-ADR D5 and the proven SESSION_0374 per-area recipe.

## Cody pre-flight

### Pre-flight: Wave 4 /app migration

#### 1. Existing component scan

- Graphify query used: `unified app migration programs courses age-groups skill-levels schedule admin app redirects sidebar requirePermission`
- Found: Wave 4 legacy routes under `apps/web/app/admin/{programs,courses,age-groups,skill-levels,schedule}` using `withAdminPage`; target guard pattern in existing `/app` area layouts.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Consulted live alignment URLs: no; no new Dirstarter API surface is introduced.
- Closest L1 pattern: upstream unified `/app` permission-gated shell as already ported locally.
- Primitive API spot-check: no new primitives added; pages/components move unchanged.

#### 3. Composition decision

- Extending existing component: no component changes planned.
- Composing existing components: existing route components move unchanged.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: `docs/product/black-belt-legacy/SOT-ADR.md` D5/D10.
- Runbook consulted: Graphify runbook and `docs/knowledge/wiki/dirstarter-docs-inventory.md`.

#### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo` from `apps/web/`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: `http://bbl.local:3000`

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0002, FS-0004, FS-0005, FS-0024, plus SESSION_0374/0377 sed-scope traps.
- Mitigation acknowledged: use the documented dev-server command, write concrete full-close evidence, run the git guard before mutating git, and scope rewrites so server imports stay untouched.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0378_TASK_01 | landed | Migrated `programs`, `courses`, `age-groups`, `skill-levels`, and `schedule` from `/admin` to `/app` with permission layouts, scoped route-string rewrites, redirects/tests, sidebar entries, and `/app` revalidation paths. |
| SESSION_0378_TASK_02 | landed | Typecheck/lint/format/wiki/redirect/curl gates run; authenticated `bbl.local` render proof captured by curl; fallow inherited moved-code findings documented; Graphify refreshed; FS-0024 guard passed. |

## What landed

- **Wave 4 unified `/app` migration:** `programs`, `courses`, `age-groups`, `skill-levels`, and
  `schedule` moved from `apps/web/app/admin/<area>` to `apps/web/app/app/<area>` via `git mv`.
- Each area now has a `layout.tsx` that calls `requirePermission(APP_AREA_PERMISSIONS.<area>)`.
- Page exports were unwrapped from `withAdminPage` to plain `/app` `PageProps`.
- Route-local imports and route strings now point at `/app/<area>` while `~/server/admin/<area>`
  imports stay unchanged.
- `/admin/<area>` and child routes redirect to `/app/<area>` via `config/app-redirects.ts`, covered
  by `config/app-redirects.test.ts`.
- App sidebar gained permission-gated `Programs`, `Courses`, `Age Groups`, `Skill Levels`, and
  `Schedule` entries.
- Server actions for the Wave 4 areas now revalidate `/app/*` paths.
- `APP_AREA_PERMISSIONS.ageGroups` was registered; the other Wave 4 permission keys already existed.
- `APP_AND_SERVER_MIGRATION_MAP.md` marks Wave 4 landed and queues Wave 5 as human-gated for this
  autonomous batch.

## Decisions resolved

- Wave 4 is the only migration wave executed in this session. Prisma, server flattening, Phase 3
  identity work, DNS/Vercel production-domain changes, and Stripe rehearsal changes were not touched.
- `schedule` keeps links to `/admin/tools/<slug>` because `tools` is Wave 6 and was not migrated this
  session; those links will redirect only after the tools wave lands.
- Browser-context dev-login was not usable for `bbl.local` because the browser was redirected through
  `localhost` and lost the host-specific auth context. Authenticated curl with `Host: bbl.local` is
  the render proof for this close.
- A first concurrent curl pass logged a transient Prisma P2028 on `/app/programs` during dev compile;
  a later sequential `/app/programs` smoke returned 200 with a render marker.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/app/{programs,courses,age-groups,skill-levels,schedule}/**` | New `/app` homes moved from `/admin`; added per-area `layout.tsx`, unwrapped page exports, and repointed route-local links/imports. |
| `apps/web/app/admin/{programs,courses,age-groups,skill-levels,schedule}/**` | Removed by `git mv` into `/app`. |
| `apps/web/server/admin/{programs,courses,age-groups,skill-levels}/actions.ts` | Repointed revalidation paths from `/admin/*` to `/app/*`. |
| `apps/web/server/orpc/roles.ts` | Added `ageGroups: "age-groups.manage"` to `APP_AREA_PERMISSIONS`. |
| `apps/web/config/app-redirects.ts` | Added Wave 4 `/admin/*` -> `/app/*` redirects. |
| `apps/web/config/app-redirects.test.ts` | Added Wave 4 redirect expectations and resolver assertions. |
| `apps/web/components/app/sidebar.tsx` | Added permission-gated Wave 4 sidebar entries. |
| `docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md` | Marked Wave 4 landed and Wave 5 next. |
| `docs/knowledge/wiki/index.md`, `docs/knowledge/wiki/log.md` | Logged SESSION_0378 and added the missing SESSION_0377 index row. |
| `docs/sprints/SESSION_0378.md` | Session ledger and full close record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | ✅ 0 lint violations. |
| `bun run typecheck` | ✅ route typegen + `tsc` exit 0. |
| `(cd apps/web && bun run lint:check)` | ✅ exit 0; warnings are inherited/moved unused params and existing repo warnings. |
| `(cd apps/web && bun run format:check)` | ✅ all 1,321 matched files formatted after running `bun run format` once for `config/app-redirects.test.ts`. |
| `(cd apps/web && bun test config/app-redirects.test.ts)` | ✅ 6 pass, 39 assertions. |
| Residue checks | ✅ no `withAdminPage`, `/admin` PageProps, `~/server/app/*`, or moved-area `~/app/admin/*` residues in Wave 4 files. |
| `curl` redirect matrix on `Host: bbl.local` | ✅ `/admin/{programs,courses,age-groups,skill-levels,schedule}` and representative children return 308 to `/app/*`. |
| Dev-login authenticated `curl` on `Host: bbl.local` | ✅ `/app/{programs,courses,age-groups,skill-levels,schedule}` returned 200 with render markers; `/app/programs` re-smoked sequentially after transient compile-load noise. |
| Browser smoke | ⚠️ browser-context dev-login redirected through `localhost` and did not retain the `bbl.local` auth context; curl proof is the authenticated render evidence. |
| `git diff -U0 \| bunx fallow audit --changed-since HEAD --diff-stdin` | ⚠️ exit 1 inherited moved-code findings: large/duplicate admin forms/tables now appear changed by `git mv`, plus pre-existing dependency warnings (`tailwind-merge`, `@react-email/preview-server`). No actionable new code path found. |
| `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` | ✅ incremental rebuild completed; final report updated at `.graphify/graph_report.md` (86 nodes, 1,006 edges, 1,744 communities reported for the incremental scope). |

## Open decisions / blockers

- **Autonomous batch boundary reached:** Waves 2-4 are now landed. Wave 5 is outside this prompt's
  allowed autonomous scope and needs an explicit human gate before another automerge run proceeds.
- D-024 remains open until Wave 5/6 land, the review checkpoint completes, and the legacy `/admin`
  shell is deleted.

## Next session

### Goal

Human-gated decision: either authorize Wave 5 (`merch`, `categories`, `tags`, `pricing-plans`,
`subscription-tiers`, `subscriptions`, `billing`) or pause autonomous code edits and review the
completed Waves 2-4.

### First task

Do not let the autonomous wrapper continue into Wave 5 without explicit human approval. If approved,
start with the commerce/listings cluster from `APP_AND_SERVER_MIGRATION_MAP.md`; otherwise run the
Wave 2-4 review checkpoint and leave code untouched.

## Review log

### SESSION_0378_REVIEW_01 — Wave 4 /app migration

- **Reviewed tasks:** SESSION_0378_TASK_01, SESSION_0378_TASK_02
- **Dirstarter docs check:** cached docs sufficient; no new Dirstarter API surface introduced.
- **Verdict:** Clean mechanical continuation of the proven recipe. The known server-import rewrite
  trap was caught by residue checks and reversed before typecheck. `schedule` correctly keeps tools
  links unmigrated. Browser auth was not usable in this host/cookie setup, but authenticated curl
  proved all five `/app` renders.
- **Score:** 9.1/10
- **Follow-up:** Human gate before Wave 5; D-024 remains open.

## Hostile close review

- **Giddy:** Pass. Scope stayed inside Wave 4; no Prisma, server flatten, Phase 3 identity, DNS,
  Vercel production-domain, or Stripe changes occurred.
- **Doug:** Pass with caveat. Static gates and redirects are green; fallow is moved-code noise. The
  transient `/app/programs` Prisma P2028 was rechecked with a sequential 200 render.
- **Desi:** Pass. Sidebar additions follow the dense app shell pattern and reuse existing icons; no new
  UI primitives or layout concepts were introduced.

## ADR / ubiquitous-language check

- ADR update not required — this executes SOT-ADR D5.
- Ubiquitous language update not required — no new domain terms introduced.

## Reflections

- Avoid `path` as a shell loop variable in zsh; it mutates `PATH` and made `curl`/`rg` appear missing.
- The sed-scope trap is still real even when scoped to moved dirs: route strings and server import paths
  can share the `/admin/<area>` substring. The dedicated `~/server/app` residue check is mandatory.
- Browser proof needs host-aware auth setup; curl with `Host: bbl.local` is more reliable for this
  local multi-brand stack unless the browser can preserve the exact host context.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0378 created/closed; migration map stamped `last_agent: codex-session-0378`; wiki index/log updated. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` has SESSION_0377 + SESSION_0378 rows; `log.md` has SESSION_0378 entry. |
| Wiki lint | ✅ `bun run wiki:lint` passed. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Giddy/Doug/Desi review present. |
| Review & Recommend | Next session is human-gated because Wave 5 is outside this prompt's allowed autonomous scope. |
| Memory sweep | No ADR/glossary update needed; Wave 4 status recorded in `APP_AND_SERVER_MIGRATION_MAP.md`. |
| Next session unblock check | Blocked by human gate, intentionally; autonomous waves 2-4 are complete. |
| Git hygiene | ✅ FS-0024 guard passed (`pwd` = repo root, remote = `Ronin-Dojo-Design/ronin-dojo-baseline`, branch = `auto/codex-session-0378`); conventional commit follows. |
| Graphify update | ✅ `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` completed; `.graphify/graph_report.md` updated. |
