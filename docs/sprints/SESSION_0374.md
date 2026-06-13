---
title: "SESSION 0374 — Full unified /app migration (wave 1) + Phase 3 preflight map"
slug: session-0374
type: session--implement
status: closed
created: 2026-06-12
updated: 2026-06-13
last_agent: claude-session-0374
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0373.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0374 — Full unified /app migration (wave 1) + Phase 3 preflight map

## Date

2026-06-12

## Operator

Brian + claude-session-0374

## Goal

Advance BBL Phase 2 toward the documented "unified `/app/*`" end state by migrating the first
bounded wave of legacy `/admin/*` areas onto the `requirePermission` guard model, and lock the
ordered plan + maps that make the remaining waves (and the Phase 3 identity re-root and the
`server/<entity>` flatten) executable without re-discovery. No schema edits this session — the
Phase 3 user-carry preflight is produced as a map/doc deliverable, per the "before editing Prisma"
guardrail.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0373.md`
- Carryover: SESSION_0373 landed the Phase 2c redirect spine and migrated the old `(web)/dashboard`
  page routes into `/app` (root → `/app/profile`, events/techniques/lineage editor children under
  `/app`), but left ~27 `/admin` areas unmigrated and `server/<entity>` flattening untouched. It set
  D10 (DNS waits for local Phases 1–6) and queued a Phase 3 user-carry identity preflight.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `4fe55f1`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Unified `/app/*` dashboard + `lib/auth-guard` (`requireUser`/`requirePermission`), brand-aware routing, Prisma identity model (preflight only) |
| Extension or replacement | Extension: completes the upstream `/app` adoption (SOT-ADR D5) by porting the remaining Ronin admin areas onto the upstream permission-gated shell; the identity preflight extends D1 person-rooting. |
| Why justified | Spec Phase 3 "Depends on Phase 2 (final routes)"; finishing `/app` parity before the identity re-root means add-person/claim/profile surfaces move once, not twice. |
| Risk if bypassed | Designing the identity re-root against a route surface that is still half on `/admin` forces a second migration after user traffic exists. |

Live docs checked during planning: local SoT set governs; Next.js redirect semantics already captured in SESSION_0373.

### Graphify check

- Graph status: current; stats at bow-in: 11,760 nodes, 18,216 edges, 1,704 communities, 1,894 files tracked.
- Queries used:
  - `admin app route parity certificates posts media leads invites email brand-settings roles entitlements dashboard requirePermission guard unified app surface`
- Files selected from graph:
  - `apps/web/app/admin/<area>/page.tsx` + `_components/*` (per-area migration units)
  - `apps/web/lib/auth-guard.ts` (`requireUser`/`requirePermission`), `apps/web/app/app/users/layout.tsx` (target guard pattern)
  - `apps/web/config/app-redirects.ts`, `apps/web/proxy.ts` (redirect spine)
- Verification note: graph still carries deleted `(web)/dashboard/techniques|events` page nodes (stale) — disk is truth (15 component files, 0 pages). Refresh Graphify at close.

### Grill outcome

6 forks resolved (Petey grill, grill-me → grill-with-docs):

- **No schema edits this session.** Phase 3 user-carry preflight is a map/doc deliverable, honoring the "before editing Prisma" guardrail.
- **Server `server/<entity>` flatten = map-only.** 326 files / 593 importers is its own dedicated session; flattening identity server files before the Phase 3 re-root rewrites them is wasted motion.
- **Route scope = Option A: full unified `/app`, all admin areas, regardless of the D9 brand gate.** The brand gate stays a *public-route 404* concern only; it does not scope the admin migration. Multi-session — this session does audit + one wave + ordered plan.
- **Workflow = host-based, no scripts.** No `.devcontainer` exists; the app runs on host (Postgres.app + `*.local` hosts). A container's only value was isolating a risky script, and the route work runs none. Any future codemod is shown for approval before running.
- **First wave = `certificates` + `posts`/`content` + `media`** — operator-driven BBL-enabled surfaces, low coupling to the identity re-root, proves the auth-HOC→`requirePermission` guard swap.
- **Security IoC sweep run at operator request** (Hades/Shai-Hulud-family indicators): clean — no `*-setup.pth`, no `.bun_ran`, no `gh-token-monitor`/`pgsql-monitor`, no injected AI-config hooks (the 4 `~/.claude` hooks are the operator's own documented tooling), `copilot-instructions.md` git-clean, no `npmrc`/`pypirc` creds.

### Drift logged

- D-024 (fork behind unified dashboard) remains open until every admin area is on `/app` + old shells deleted (Phase 2c). This session reduces it; it does not close it.

## Petey plan

### Goal

Migrate the first wave of `/admin` areas to the unified `/app` permission-gated shell, and produce the
maps that make the remaining `/app` waves, the `server/<entity>` flatten, and the Phase 3 identity
re-root executable without re-discovery.

### Tasks

#### SESSION_0374_TASK_01 — Phase 2 completion audit

- **Agent:** Petey
- **What:** Inventory every unmigrated `/admin` area with its auth pattern + size, confirm the uniform migration unit.
- **Steps:** enumerate `/app` vs `/admin` areas; per area record file/page counts + legacy `auth-hoc` vs `requirePermission`; identify the target guard pattern (`app/app/users/layout.tsx`).
- **Done means:** 27-area audit table recorded; uniform per-area migration recipe written.
- **Depends on:** nothing

#### SESSION_0374_TASK_02 — First-wave `/app` migration (certificates, posts, content, media)

- **Agent:** Cody
- **What:** Port the first wave onto the `/app` permission-gated shell with redirects.
- **Steps:** per area — add `app/app/<area>/layout.tsx` calling `requirePermission(APP_AREA_PERMISSIONS.<area>)`; move page(s) + `_components`; register the permission; add `/admin/<area>` → `/app/<area>` redirect (`config/app-redirects.ts` + proxy); add sidebar entry; browser-verify on `bbl.local`.
- **Done means:** the wave's areas render under `/app`, permission-gated; `/admin/<area>` 308s to `/app/<area>`; nothing lost; browser-proof captured. Prove the pattern on `certificates` first, then batch the rest.
- **Depends on:** SESSION_0374_TASK_01

#### SESSION_0374_TASK_03 — Maps: Phase 3 user-carry preflight + flatten + remaining-wave order

- **Agent:** Doug (preflight, parallel) + Petey
- **What:** Produce the doc deliverables that make the deferred work executable.
- **Steps:** `PHASE3_USER_CARRY_PREFLIGHT.md` (per-`userId`-model carry/repoint/dual/decision-needed table + claim-flow impact); a `server/<entity>` flatten map (inventory + codemod recipe + ordering vs identity re-root); the ordered remaining-`/app`-wave plan in this session + BBL-SOT-Spec.
- **Done means:** preflight doc exists and is decision-dense; flatten + wave-order plan recorded; SoT docs updated where durable.
- **Depends on:** SESSION_0374_TASK_01 (preflight runs in parallel with TASK_02)

#### SESSION_0374_TASK_04 — Verify + full close

- **Agent:** Doug + Petey
- **What:** Gate the wave + bow out (full close per closing.md).
- **Steps:** typecheck/oxlint/oxfmt/tests/wiki-lint + fallow on changed files + browser proof; document new components; ADR/ubiquitous-language check; Graphify update; git hygiene; stage/commit/push to `main`.
- **Done means:** gates green (or deviations logged); full-close evidence table complete; pushed.
- **Depends on:** SESSION_0374_TASK_02, SESSION_0374_TASK_03

### Parallelism

TASK_03's Phase 3 preflight (docs only) runs in a background subagent (Doug) concurrently with TASK_02
(route code) — disjoint file sets. TASK_02's per-area migrations are NOT parallelized across subagents:
they share `config/app-redirects.ts`, `lib/auth-guard.ts`, `proxy.ts`, and the sidebar, so they run
coherently inline to avoid edit collisions.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0374_TASK_01 | Petey | Discovery; informs the wave + guard pattern. |
| SESSION_0374_TASK_02 | Cody | Shared-file route migration must be one coherent change. |
| SESSION_0374_TASK_03 | Doug (preflight) + Petey | Preflight is a disjoint doc → parallel subagent; maps are Petey synthesis. |
| SESSION_0374_TASK_04 | Doug + Petey | Independent verification + full-close framing. |

### Open decisions

- None blocking. First-wave pick is operator-endorsed; remaining-wave order is a TASK_03 deliverable, not a blocker.

### Risks

- Wave scope creep: 4 areas with browser proof each is the realistic ceiling after a long grill — hold the line, defer extras to the wave plan.
- Old `/admin/<area>` shells: migrate via move + redirect (matches SESSION_0373); full shell deletion stays a Phase 2c task to avoid losing an un-audited child route.
- `server/admin/<area>` query modules stay put this session (flatten is mapped, not executed) — `/app` pages import the existing server paths.

### Scope guard

- No `schema.prisma` edits; no migration; no reseed.
- No `server/<entity>` flatten execution (map only).
- No DNS/Vercel-prod/live-domain changes; no Stripe rehearsal redo.
- Do not parallelize route migrations across subagents (shared redirect/guard/sidebar files).
- Do not migrate beyond the agreed first wave; capture the rest in the ordered plan.

### Dirstarter implementation template

- **Docs read first:** BBL SoT set, SESSION_0373, opening ritual, brand-features config.
- **Baseline pattern to extend:** upstream `/app` permission-gated shell (`lib/auth-guard` `requirePermission`, `app/app/<entity>/layout.tsx`), the SESSION_0373 redirect spine (`config/app-redirects.ts` + `proxy.ts`).
- **Custom delta:** Ronin's admin areas (certificates/posts/content/media + the rest) ported onto the upstream guard model; brand-scoped behavior preserved.
- **No-bypass proof:** completing the already-ratified `/app` adoption (SOT-ADR D5), not inventing a second shell.

## Cody pre-flight

### Pre-flight: First-wave /app migration

#### 1. Existing component scan

- Graphify query used: `admin app route parity certificates posts media leads invites email brand-settings roles entitlements dashboard requirePermission guard unified app surface`
- Found: every unmigrated `/admin/<area>` uses the legacy `auth-hoc`/`requireAdmin` wrapper; migrated `/app` areas use `requirePermission(APP_AREA_PERMISSIONS.<area>)` in `app/app/<area>/layout.tsx`. Redirect spine already exists in `config/app-redirects.ts` + `proxy.ts`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: not re-read (route/auth pattern captured SESSION_0365/0373).
- Consulted live alignment URLs: no (Next redirect semantics captured SESSION_0373).
- Closest L1 pattern: upstream unified `/app` `requirePermission` guard + `next.config`/`proxy` redirect map.
- Primitive API spot-check: no new UI primitives; pages + `_components` move unchanged.

#### 3. Composition decision

- Extending existing component: none.
- Composing existing components: existing per-area tables/forms move as-is; new file is one `layout.tsx` guard per area.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: SOT-ADR D5 (unified `/app`), D9 (brand gate = public only), D10 (local-first).
- Runbook consulted: `docs/runbooks/domain-features/*` as areas surface.

#### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo` from `apps/web/`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: `http://bbl.local:3000` (and `baseline.local` for non-gated parity).

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0002 (dev server command), FS-0024 (git guard).
- Mitigation acknowledged: dev server via `npx next dev --turbo`; all mutating git from repo root; no scripts run without approval.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0374_TASK_01 | landed | 27-area audit: all unmigrated `/admin` areas use legacy `auth-hoc`; target = `requirePermission` `layout.tsx`. Uniform migration recipe confirmed. |
| SESSION_0374_TASK_02 | landed | Migrated certificates/posts/content/media to `/app` permission-gated shell; 308 redirects + guard 307 browser-proven; `revalidatePath` repointed; sidebar entries added. |
| SESSION_0374_TASK_03 | landed | `PHASE3_USER_CARRY_PREFLIGHT.md` (Doug, 40 models) + `APP_AND_SERVER_MIGRATION_MAP.md` (recipe + 23-area wave order + flatten codemod) written. SoT spec amended. |
| SESSION_0374_TASK_04 | landed | Gates green (typecheck/oxfmt/oxlint/redirect-test/wiki-lint/fallow-changed); Graphify updated; staged/committed/pushed. |

## What landed

- **Wave 1 of full unified `/app` (Option A):** `certificates`, `posts`, `content`, `media` migrated from the legacy `/admin` `withAdminPage` shell onto the `/app` permission-gated shell — each gets an `app/app/<area>/layout.tsx` calling `requirePermission(APP_AREA_PERMISSIONS.<area>)`, history-preserving `git mv` of page(s) + `_components`, unwrapped page exports (`PageProps<"/app/<area>">`), `/admin/<area>`→`/app/<area>` 308 redirects (+ test), sidebar nav entries, and `revalidatePath` repointed to `/app/*` so mutations invalidate the new routes.
- **`posts.manage`** added to `APP_AREA_PERMISSIONS` (the one missing key; `admin: ["*"]` covers it).
- **Phase 3 user-carry preflight map** (`PHASE3_USER_CARRY_PREFLIGHT.md`, Doug): 40 `userId`-bearing models classified — 1 root-nullable (`Passport`), 3 REPOINT (`DirectoryProfile`/`LineageNode`/`Affiliation`), 1 DUAL (`RankAward`), 34 CARRY, 1 DECISION-NEEDED (`FightRecord` → recommend CARRY). Claim-flow rewrite (`attachAccount`) + cuid2-window + uniqueness-constraint migration spelled out.
- **App + server migration map** (`APP_AND_SERVER_MIGRATION_MAP.md`): the uniform per-area recipe (with the sed-scope trap warning), the ordered remaining 23-area waves, and the deferred `server/<entity>` flatten codemod plan (326 files / 593 importers — own session, fused with the Phase 3 re-root).

## Decisions resolved

- No schema edits this session (Phase 3 preflight = doc deliverable); server `server/<entity>` flatten = **map-only** (own session); route scope = **full unified `/app` (Option A)**, brand gate is a public-route 404 concern only; **host-based, no-script** workflow (no `.devcontainer`; container's only value was isolating a script we don't run); first wave = certificates/posts/content/media.
- Old `/admin/<area>` shells **moved** (not redirect-in-place) for the migrated areas; the legacy `components/admin/{sidebar,command-palette}` keep `/admin/*` links (they redirect) and die with the shell in Phase 2c.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/app/{certificates,posts,content,media}/**` | New `/app` homes (moved from `/admin`): `layout.tsx` guard + unwrapped pages + `_components`. |
| `apps/web/app/admin/{certificates,posts,content,media}/**` | Removed (git mv → `/app`). |
| `apps/web/server/orpc/roles.ts` | Registered `posts: "posts.manage"` in `APP_AREA_PERMISSIONS`. |
| `apps/web/config/app-redirects.ts` | Added 4 areas to `MIGRATED_ADMIN_APP_ROUTES`. |
| `apps/web/config/app-redirects.test.ts` | Extended `toEqual` + resolve assertions; adjusted negatives. |
| `apps/web/components/app/sidebar.tsx` | Added Certificates/Posts/Content/Media nav entries + icons. |
| `apps/web/server/admin/{posts,content,certificates,media}/actions.ts` (+ issuance-actions) | `revalidatePath` `/admin/*` → `/app/*`. |
| `apps/web/{config/seo.ts,proxy.ts,app/(web)/dashboard/tabs.tsx}` | Opportunistic oxfmt of pre-existing format drift (to keep `format:check` green). |
| `docs/product/black-belt-legacy/PHASE3_USER_CARRY_PREFLIGHT.md` | New — Phase 3 user-carry preflight map. |
| `docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md` | New — `/app` wave order + server flatten codemod plan. |
| `docs/product/black-belt-legacy/BBL-SOT-Spec.md` | Phase 2 amended: Option A + wave 1 + map links. |
| `docs/knowledge/wiki/{index.md,log.md}` | SESSION_0374 entries. |
| `docs/sprints/SESSION_0374.md` | This session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (next typegen + `tsc --noEmit`) | ✅ exit 0 (route types generated; no type errors). Note: the dev server was contending with route typegen — killed it first (SESSION_0373 gotcha). |
| `bun test config/app-redirects.test.ts` | ✅ 6 pass, 22 assertions (now covers all 10 migrated areas). |
| `curl` redirect matrix on `Host: bbl.local` | ✅ `/admin/{certificates,posts,content,media}` + `.../new` → **308** → `/app/...`; `/app/{...}` unauth → **307** → `/auth/login` (guard fires). |
| `bun run format:check` (oxfmt) | ✅ clean (formatted 2 mine + 3 pre-existing drift). |
| `bun run lint:check` (oxlint) | ✅ exit 0 — warnings are pre-existing (admin form `children` params), none in new `/app` files. |
| `bun run wiki:lint` | ✅ 0 errors. |
| `git diff -U0 \| bunx fallow audit --changed-since HEAD --diff-stdin` | ✅ exit 0 (inherited complexity/dead-code/dup findings on the moved files excluded by the changed-since gate). |
| Authenticated `/app` render | ⚠️ not captured — `/api/auth/dev-login` returns 000 (stale `DEV_LOGIN_USER_ID`, SESSION_0326). Moved pages are byte-identical to the previously-working `/admin` versions minus the auth wrapper; typecheck confirms they compile. |
| `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` | ⏳ see Full close evidence. |

## Open decisions / blockers

- **`FightRecord` disposition** (preflight DECISION-NEEDED): Doug recommends CARRY now / first post-Phase-3 satellite-promotion candidate. Operator confirm before the Phase 3 schema wave.
- **Authenticated `/app` render unproven** this session (dev-login stale). Re-prove on the next session that has a working dev session, or fix `DEV_LOGIN_USER_ID`.
- Remaining 23 `/app` areas + the `server/<entity>` flatten + the Phase 3 identity re-root are mapped, not executed.

## Next session

### Goal

Migrate `/app` wave 2 (the claim/RBAC + funnel cluster: `roles`, `entitlements`, `invites`, `leads`) per `APP_AND_SERVER_MIGRATION_MAP.md`, with an authenticated `/app` render proof.

### First task

Fix or work around `DEV_LOGIN_USER_ID` to get a working admin dev session, then migrate `roles` to `/app` end-to-end (layout guard → move → redirect+test → sidebar → authenticated render proof) as the wave-2 pattern proof, before batching `entitlements`/`invites`/`leads`.

## Review log

### SESSION_0374_REVIEW_01 — Wave 1 /app migration + Phase 3 preflight

- **Reviewed tasks:** SESSION_0374_TASK_01..04
- **Dirstarter docs check:** not needed — continued the already-ratified `/app` adoption (SOT-ADR D5); no baseline-layer API changed.
- **Verdict:** Clean, well-scoped slice. Four areas migrated on the proven guard-swap pattern with redirect + revalidatePath correctness; the greedy-sed mistake was caught and reversed without residue, and the trap is now documented in the recipe. The honest gap is the unproven authenticated render (environmental dev-login staleness), mitigated by the byte-identical-move argument + clean typecheck.
- **Score:** 8.5/10
- **Follow-up:** authenticated render proof next session; confirm `FightRecord` disposition.

## Hostile close review

- **Giddy:** pass — real route parity moved, not faked; scope held to Option A wave 1 + maps, didn't sprawl into schema or flatten. Flag: don't let "23 areas mapped" read as "nearly done" — it's still multi-session.
- **Doug:** pass-with-caveat — typecheck/redirect/guard/lint/fallow all green and the curl matrix proves routing, but the authenticated DOM render was not captured (dev-login stale). Acceptable for a mechanical move; not a launch-readiness proof.
- **Desi:** pass — sidebar entries follow the existing permission-gated admin-item convention (icons + `APP_AREA_PERMISSIONS`); no new UI primitives, moved tables/forms unchanged.
- **Kaizen aggregate:** 8.5/10 — strong mechanical execution + self-caught error; one verification gap honestly logged.

## ADR / ubiquitous-language check

- ADR update **not required** — this executes SOT-ADR D5 (unified `/app`); the Option-A scope confirmation + wave order are recorded in the BBL-SOT-Spec amendment and `APP_AND_SERVER_MIGRATION_MAP.md`, not a new D-number.
- Ubiquitous language update **not required** — no new domain terms.

## Reflections

- **The greedy sed was the lesson.** `s|/admin/content|/app/content|g` silently corrupts `~/server/admin/content/...` import paths. Caught it in one grep, reversed `server/app/`→`server/admin/` (which only ever existed as damage), and documented the trap in the recipe so the next 23 areas don't repeat it. Scope every codemod to the moved dir + the route-string sites, never blanket.
- **Dev-server ↔ typecheck contention is real** (SESSION_0373 flagged it; I hit it). Running `next dev` while `next typegen` runs makes `tsc` look wedged. Kill the dev server before typecheck; restart it after for browser proof.
- **The brand gate ≠ the migration scope.** The early instinct to scope the migration by the D9 allowlist was wrong; the operator clarified Option A. The D9 gate only 404s public routes — admin areas all migrate regardless. Worth re-stating in the map so it isn't re-litigated.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | New docs carry full frontmatter (`last_agent: claude-session-0374` / `doug-session-0374`); SoT spec + wiki index/log stamped; code files have no frontmatter convention. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` row + `log.md` entry added; new docs `pairs_with` the SoT set. |
| Wiki lint | ✅ `bun run wiki:lint` — 0 errors. |
| Kaizen reflection | Reflections section present (3 items). |
| Hostile close review | `SESSION_0374_REVIEW_01` + Giddy/Doug/Desi section present. |
| Review & Recommend | Next session goal + first task written. |
| Memory sweep | No durable memory change; `DEV_LOGIN_USER_ID` staleness already in [turbopack-prisma-dev-server-broken]/0326 memory. |
| Next session unblock check | Wave 2 (roles/entitlements/invites/leads) unblocked via the map; dev-login fix flagged as first task. |
| Git hygiene | Branch `main`; remote `origin=ronin-dojo-baseline`; FS-0024 guard passed; single push at close — hash in `git log` (commit: "feat: migrate certificates/posts/content/media to unified /app + Phase 3 preflight map"). |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` — stats: 11,806 nodes / 18,602 edges / 1,741 communities / 1,900 files tracked. |
