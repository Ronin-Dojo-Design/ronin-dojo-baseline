---
title: "SESSION 0549 - Admin-route retirement cleanup"
slug: session-0549
type: session--implement
status: closed
created: 2026-07-16
updated: 2026-07-17
last_agent: codex-session-0549
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0547.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0549 - Admin-route retirement cleanup

## Date

2026-07-16

## Operator

Brian + codex-session-0549

## Goal

Retire the last app-code reliance on the legacy `/admin` route prefix: repoint admin navigation and
command-palette links to `/app`, verify redirects no longer shadow `/app` surfaces, delete or conform the
deprecated admin shell gate to `can()`, fix stale `revalidatePath("/admin...")` calls, and close RISK #3 with
evidence.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0547.md`
- Carryover: SESSION_0547 persisted the fan-out map and assigned Lane B to `ronin-0549`: WL-P2-40,
  WL-P3-34, FS-0026, and RISK #3 as one admin-route retirement cluster.

### Branch and worktree

- Branch: `session-0549-admin-retirement`
- Worktree: `/Users/brianscott/dev/ronin-0549`
- Status at bow-in: clean before bootstrap; bootstrap created temporary `.bun-cache/` and `docs/sprints/SESSION_0549.md`
- Current HEAD at bow-in: `ae79db18`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth, route structure |
| Extension or replacement | Extension: conform the migrated admin/dashboard surface to Dirstarter's unified `/app` workspace and `can()` permission seam. |
| Why justified | Dirstarter docs and the BBL SoT both make `/app` the canonical dashboard and keep `/admin` as legacy redirects only. |
| Risk if bypassed | Legacy `/admin` literals can make saves revert on navigation, hide new `/app` indexes behind redirects, or gate admin routes through a fifth authz style. |

Live docs checked during planning: Dirstarter Authentication and Project Structure docs on 2026-07-16.

### Graphify check

- Graph status: unavailable in fresh worktree; stats at bow-in: 0 nodes, 0 edges, 0 communities, 0 files tracked.
- Queries used:
  - `admin route retirement /admin /app admin sidebar command palette can capability revalidatePath`
- Files selected from graph:
  - None; Graphify returned `No nodes in graph`.
- Verification note: exact files and repo-wide residual checks will use direct source inspection and `rg`; Graphify is not used as negative evidence.

### Grill outcome

No open forks. The operator directive fixed the lane scope and the live-lane collision boundary:
admin-side route/config/palette cleanup only; avoid member-dashboard work and avoid technique surfaces except pure route-literal fixes.

## Petey plan

### Goal

Make `/app` the only app-code target for admin surfaces and prove no stale `/admin` app-code reliance remains.

### Tasks

#### SESSION_0549_TASK_01 - Repoint admin navigation and palette

- **Agent:** Cody
- **What:** Update `config/admin-sections.ts` and the command-palette route sources from `/admin` targets to `/app` equivalents.
- **Steps:** Inspect the canonical admin sections config, inspect command palette consumers, patch route literals, and run `rg '"/admin'`/`rg "'/admin"` residual checks.
- **Done means:** Every changed old route literal is listed in this session file and residual `/admin` app-code hits are either redirects, tests/docs, or intentionally legacy.
- **Depends on:** nothing

#### SESSION_0549_TASK_02 - Verify redirect shadowing and admin shell authz

- **Agent:** Cody
- **What:** Inspect `next.config.ts`/redirect helpers plus deprecated admin route shell consumers.
- **Steps:** Remove or correct old tab redirects that shadow repointed `/app` routes; grep the deprecated shell, delete it if unmounted or conform it to `can()` if still mounted.
- **Done means:** Shadowing verdict recorded; shell decision recorded as deleted or conformed with evidence.
- **Depends on:** SESSION_0549_TASK_01

#### SESSION_0549_TASK_03 - Fix stale cache invalidations and close RISK #3

- **Agent:** Cody
- **What:** Replace server-action `revalidatePath("/admin...")` calls with canonical `/app` paths and append risk-register evidence.
- **Steps:** Grep server actions for stale invalidations, patch paths with layout typing where required, update RISK #3 evidence, and run required gates.
- **Done means:** FS-0026 residual grep clean, RISK #3 marked resolved at merge-ready state, and gates recorded.
- **Depends on:** SESSION_0549_TASK_02

### Parallelism

Sequential. The sidebar, palette, redirects, shell, cache invalidation, and risk evidence all share the same route-contract surface.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0549_TASK_01 | Cody | Clear implementation work against known files. |
| SESSION_0549_TASK_02 | Cody | Requires source inspection and narrow code edits, not open design. |
| SESSION_0549_TASK_03 | Cody | Finishes code/doc evidence and verification in one lane. |

### Open decisions

None at plan-lock.

### Risks

- Graphify is empty in the worktree; negative proof must come from direct `rg`/source inspection.
- E2E scope may depend on the actual spec names present in `apps/web/e2e`.
- Live lanes 0545 and 0546 own member billing and technique graph surfaces; any collision will be skipped and reported rather than edited.

### Scope guard

- No member-dashboard changes.
- No technique-surface work except mechanical `/admin` route-literal fixes if grep finds one.
- No schema changes or migrations.
- No push, PR, merge, or deploy. Commit locally and hold at the push gate.
- `../ronin-dojo-monorepo` remains read-only.

### Dirstarter implementation template

- **Docs read first:** BBL SoT set, WORKFLOW 5.0, ADR 0045, LR 0007, LR 0015, Dirstarter Authentication docs checked 2026-07-16.
- **Baseline pattern to extend:** Unified `/app` dashboard plus `can()` permission model.
- **Custom delta:** Ronin keeps BBL resource grants layered onto `can()`; this lane only removes stale `/admin` route reliance.
- **No-bypass proof:** The deprecated shell will be deleted if unmounted, or conformed to the existing `can()` seam if still mounted.

## Cody pre-flight

### Pre-flight: Admin-route retirement

#### 1. Existing component scan

- Graphify query used: `admin route retirement /admin /app admin sidebar command palette can capability revalidatePath`
- Found: Graphify unavailable in worktree; exact known files from lane brief are `config/admin-sections.ts` and the admin command-palette component.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes
- Consulted live alignment URLs: yes, Dirstarter Authentication and Project Structure docs
- Closest L1 pattern: unified `/app` workspace with static `/admin/:path*` -> `/app/:path*` redirects and route/procedure auth through `can()`.
- Primitive API spot-check: not applicable; this lane is route/config/authz cleanup, not new UI composition.

#### 3. Composition decision

- Extending existing component: admin sidebar config and command palette.
- Composing existing components: not applicable.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes, `docs/sprints/SESSION_0547.md`
- ADR read: `docs/architecture/decisions/0045-admin-collection-one-surface-law.md`
- Runbook consulted: `docs/rituals/opening.md`; Graphify caveat from fresh-worktree bootstrap.

#### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo` from `apps/web/`
- Working directory: `/Users/brianscott/dev/ronin-0549/apps/web`
- Brand/host for testing: local app host, likely `http://localhost:3000`
- Bootstrap: canonical `apps/web/.env` copied, `bun install` completed with temp/cache env override, `bunx prisma generate --no-hints` passed.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0026 from the lane brief; FS-0008 generally for source spot-checks.
- Mitigation acknowledged: route/cache residuals will be proven by repo-wide `rg`, and source files will be inspected before patching.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0549_TASK_01 | done | Deleted the stale admin sidebar/command-palette stack and repointed live app/email route literals to canonical `/app` targets. |
| SESSION_0549_TASK_02 | done | Corrected legacy redirects and deleted the unmounted `/admin` shell; adjacent live API auth wrapper now uses `can()`. |
| SESSION_0549_TASK_03 | done | Re-swept stale `revalidatePath("/admin...")` residue and closed WL/FS/risk evidence. |

## What landed

- Confirmed `apps/web/config/admin-sections.ts` is the single live admin navigation source: 7 groups, 36 items, all canonical `/app/*` links, gates unchanged.
- Deleted the retired `/admin` route tree and old admin shell stack:
  - `apps/web/app/admin/{layout,error,not-found}.tsx`
  - `apps/web/app/admin/task-board/page.tsx`
  - `apps/web/components/admin/{shell,sidebar,nav,command-palette}.tsx`
- Repointed live route literals:
  - `/admin/tools` -> `/app/tools`
  - `/admin/tools/${slug}` -> `/app/tools/${slug}`
  - `/admin/tools/${tool.slug}` -> `/app/tools/${tool.slug}`
  - `/admin/tools/${tool?.slug}` -> `/app/tools/${tool?.slug}`
  - `/admin/leads/${leadId}` -> `/app/leads/${leadId}`
  - `/admin/leads/example` -> `/app/leads/example`
  - `/admin/claims` -> `/app/claims`
  - `https://blackbeltlegacy.com/admin` -> `https://blackbeltlegacy.com/app`
  - search category/tag generated prefixes `/admin/...` -> `/app/...`
  - `pathname.startsWith("/admin")` -> `pathname.startsWith("/app")`
- Corrected legacy bookmark redirects:
  - `/admin/posts` -> `/app/blog`
  - `/admin/posts/:path*` -> `/app/blog/:path*`
  - `/admin/task-board` -> `/app/loop-board`
  - `/admin/techniques` -> `/app/techniques`
  - `/admin/techniques/:path*` -> `/app/techniques/:path*`
- Conformed the live `withAdminAuth` API wrapper from raw `role !== "admin"` to `can(session.user, APP_AREA_PERMISSIONS.content)`.
- Updated `docs/security/ronin-security-risk-register.md`, `docs/knowledge/wiki/wiring-ledger.md`, and `docs/protocols/failed-steps-log.md` so RISK #3, WL-P2-40, WL-P3-34, and FS-0026 carry SESSION_0549 evidence.

## Decisions resolved

- Shell decision: **deleted**, not conformed. Evidence: `find apps/web/app/admin -maxdepth 3 -type f` found only the redirect/deprecated admin route files; `rg "components/admin/shell|<Shell|CommandPalette" apps/web` showed the old shell/palette were mounted only by `app/admin/layout.tsx`.
- Redirect shadowing decision: no blanket `/admin/:path*` redirect was added. Only known legacy bookmarks with live `/app` parity remain in `config/app-redirects.ts`.
- Technique-surface collision boundary: did not edit `/app/techniques` UI or server code. The only technique-related change was pure legacy redirect coverage for `/admin/techniques`.

## Files touched

- `apps/web/config/app-redirects.ts` — corrected `/admin/posts` destination and added exact legacy coverage for task board and techniques.
- `apps/web/config/app-redirects.test.ts` — updated expected redirect table and resolver assertions.
- `apps/web/components/common/search.tsx` — switched admin shortcut/category/tag generated links to `/app`.
- `apps/web/app/app/schedule/calendar.tsx` — switched tool links to `/app/tools`.
- `apps/web/app/app/reports/_components/reports-table-columns.tsx` — switched report tool links to `/app/tools`.
- `apps/web/lib/notifications.ts` — switched admin lead notification URL to `/app/leads`.
- `apps/web/emails/admin-submission-premium.tsx` — switched premium review CTA to `/app/tools`.
- `apps/web/emails/bbl-claim-explainer.tsx` — switched canonical admin URL constant to `/app`.
- `apps/web/emails/admin-bbl-join-legacy.tsx` — switched preview lead URL to `/app/leads`.
- `apps/web/server/admin/email/lifecycle-catalog.tsx` — switched claim review CTA to `/app/claims`.
- `apps/web/server/admin/email/catalog.tsx` — switched preview lead URL to `/app/leads`.
- `apps/web/lib/auth-hoc.ts` — replaced raw admin role gate with `can(..., content.manage)`.
- Deleted `apps/web/app/admin/error.tsx`, `apps/web/app/admin/layout.tsx`, `apps/web/app/admin/not-found.tsx`, `apps/web/app/admin/task-board/page.tsx`.
- Deleted `apps/web/components/admin/shell.tsx`, `apps/web/components/admin/sidebar.tsx`, `apps/web/components/admin/nav.tsx`, `apps/web/components/admin/command-palette.tsx`.
- `docs/security/ronin-security-risk-register.md` — appended RISK #3 close evidence.
- `docs/knowledge/wiki/wiring-ledger.md` — marked WL-P2-40 and WL-P3-34 resolved.
- `docs/protocols/failed-steps-log.md` — closed FS-0026 admin-route residue for this lane.
- `docs/knowledge/wiki/index.md` — added SESSION_0547/0549 rows and stamped current agent.
- `docs/sprints/SESSION_0549.md` — session evidence and close record.

## Verification

| Gate | Result | Evidence |
| --- | --- | --- |
| Bootstrap `.env` copy | Pass | Copied canonical `apps/web/.env` into the worktree. |
| `bun install` | Pass | Completed with temp/cache env override after the default tempdir was denied. |
| `bunx prisma generate --no-hints` | Pass | Prisma Client generated successfully. |
| Redirect unit | Pass | `bun test config/app-redirects.test.ts` -> 6 pass, 0 fail, 44 expects. |
| `bun run typecheck` | Pass | Final rerun exited 0 after `next typegen && tsc --noEmit --pretty false`. |
| `bun run test` | Fail, unrelated shared-DB suites | 1453 pass / 20 fail / 2 errors. Failures were DB-heavy hook timeouts, FK cleanup errors, and a lineage write-conflict/deadlock class; no redirect/admin-shell assertion failed. |
| `bun run lint:check` | Pass with existing warnings | Exit 0; warnings include existing unused params and `no-unused-expressions` warnings. |
| `bun run format:check` | Pass | `apps/web` workspace command exited 0 after final cleanup: all matched files correct, 1961 files. Root package has no `format:check` script. |
| `npx next build` | Pass | Final `NEXT_TELEMETRY_DISABLED=1 npx --no-install next build` exited 0; route list contains `/app/*` admin routes and no `/admin` app routes. Existing warnings: `turbopack.root`, NFT trace from storage monitoring, pg deprecation during static generation. |
| Affected e2e | Fail, sandbox/browser launch | `PW_BASE_URL=http://localhost:3502 bun --env-file=.env.e2e scripts/run-e2e-local.ts e2e/mobile-shell.spec.ts e2e/admin/admin-collection-conformance.spec.ts --project=chromium` -> 14 failed. Output showed Chromium headless launch/`SIGTRAP` and `kill EPERM` failures under the sandbox before app assertions could run. |
| `rg 'revalidatePath(.*\\/admin' apps/web/server apps/web/app` | Pass | No matches. |
| Live `"/admin` and `'/admin` literals in app/components/server/lib/emails | Pass | No live string-literal route hits outside redirect config/tests; remaining backtick hits are comments/import paths. |
| Raw shell gate grep | Pass | Old shell gone; no `components/admin/shell` mount remains. Only unrelated seed/comment hits remain for `role !== "admin"`. |

## Open decisions / blockers

- Push/PR/merge/deploy are intentionally held for explicit per-push authorization.
- Full `bun run test` is not green in this worktree because unrelated DB-heavy suites timed out or hit shared-DB cleanup/deadlock failures.
- Affected Playwright e2e did not reach useful app assertions because Chromium launch failed in the sandbox (`SIGTRAP`/`kill EPERM`).
- A `next start -p 3502` PID (`68170`) remained on port 3502 after e2e; stdin was closed and sandbox process controls denied `kill`, `ps`, and `pkill` cleanup.

## Next session

- Goal: merge SESSION_0549 after operator review and rerun affected e2e in an environment where Chromium can launch.
- Inputs to read: this SESSION_0549 file, RISK #3 row in `docs/security/ronin-security-risk-register.md`, and `apps/web/config/app-redirects.ts`.
- First task: authorize push/PR when ready, or run the affected Playwright specs outside the sandbox and update evidence if they pass.

## Review log

| ID | Reviewer | Verdict | Notes |
| --- | --- | --- |
| SESSION_0549_REVIEW_01 | Cody self-review | Pass with gate caveats | Source greps clean, build/typecheck/lint pass, redirect unit green. Full unit/e2e gates blocked by unrelated DB/browser environment failures recorded above. |

## Hostile close review

- Giddy verdict: no new architecture decision needed; this is route-contract retirement against existing ADR 0045 `/app` surface law.
- Doug runtime verdict: build proves the `/admin` route tree is not present in the compiled app route list; browser e2e attempted but blocked by sandbox Chromium launch failures.
- Dirstarter docs check: Dirstarter Authentication and Project Structure docs were checked during bow-in; this lane extends the canonical `/app` dashboard and existing `can()` authorization seam.

## ADR / ubiquitous-language check

No ADR or ubiquitous-language update needed. The session enforces existing terms: `/app` is the canonical workspace; `/admin` is legacy redirect/bookmark compatibility only.

## Reflections

- Deleting a dead route shell can still remove useful redirect behavior; replacing `app/admin/task-board/page.tsx` with explicit config redirect coverage avoided a silent `/admin/task-board` 404.
- The redirect resolver is the right place to preserve legacy bookmark intent. Blanket redirects are tempting, but they can recreate the SESSION_0530 shadowing class.
- Graphify being empty in a fresh worktree is not useful negative evidence; direct `rg` and source ownership checks carried the proof.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated frontmatter on touched docs: SESSION_0549, risk register, wiring ledger, failed-steps log, wiki index. Code files have no wiki annotation updates needed. |
| Backlinks/index sweep | Added SESSION_0547 and SESSION_0549 rows to `docs/knowledge/wiki/index.md`; no new wiki pages created. |
| Wiki lint | `bun run wiki:lint` exited 0: 0 errors, 54 warnings. Warnings are pre-existing markdown spacing issues outside touched SESSION_0549 files. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0549_REVIEW_01 recorded above. |
| Code-quality gate (Class-A) | Not applicable; this is route/config/auth cleanup, not new Class-A custom code. |
| Runtime verification (Doug) | `next build` passed and route list contains no `/admin` app routes; e2e attempted but browser launch failed under sandbox. |
| Review & Recommend | Next session goal written. |
| Memory sweep | No operator memory update needed; WL/FS/risk docs updated in repo. |
| Next session unblock check | Blocked only on operator push authorization and an environment capable of Playwright browser launch. |
| Git hygiene | FS-0024 guard passed from `/Users/brianscott/dev/ronin-0549` with remote `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; branch `session-0549-admin-retirement`. Local commit pending; push explicitly not authorized. |
| Graphify update | Skipped for worktree lane per operator instruction; bow-in Graphify stats were 0/0 and not used as negative evidence. |
