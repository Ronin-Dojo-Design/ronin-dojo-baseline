---
title: "SESSION 0448 — /admin → /app topology migration (Dirstarter Unified Dashboard)"
slug: session-0448
type: session--implement
status: closed
created: 2026-06-25
updated: 2026-06-25
last_agent: claude-session-0448
sprint: S44
pairs_with:

  - docs/sprints/SESSION_0447.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0448 — /admin → /app topology migration (Dirstarter Unified Dashboard)

> **PRE-STAGED at SESSION_0447 close (2026-06-25).** Bow-in: confirm git state below, re-enumerate the
> importers (TASK_01) — the count may have shifted — then execute. Update `created`/`last_agent` if the
> session actually runs on a later day or a different agent.

## Date

2026-06-25 (pre-staged)

## Operator

Brian + claude-session-0448 (Petey)

## Goal

Execute the deferred **`/admin → /app` topology migration** (= Dirstarter "Unified Dashboard"; deferred from
0442/0446/0447). It is a component-**topology** migration, NOT a delete: every `app/admin/*` route is
redirect-shadowed (`config/app-redirects.ts` `MIGRATED_ADMIN_APP_ROUTES` → `next.config.ts redirects()`), so
the `page.tsx` files are dead/unreachable, BUT the `app/admin/**/_components/*` are LIVE (~20 `app/app/*`
pages import them via `~/app/admin/...`). Move the shared `_components` to `/app` + repoint, delete the dead
redirect-shadowed pages + their duplicate components, KEEP `task-board` + layout + error/not-found. Per-pair
commits, faithful `next build` green between. Push held.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0447.md`
- Carryover: 0447 landed the brand-chrome prune + security-doc destale (docs pushed: `origin/main`
  `768d464e`); 2 app-code commits HELD locally (see git state). This session executes the lane 0447 deferred.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (confirm)
- **Git state (confirm before assuming clean base):** `origin/main` = `768d464e` (0447 docs pushed — free).
  local `main` has **TWO unpushed app-code commits HELD on purpose**: `6a64a2ed` (0446 dead-code trim) +
  `5f5bdc41` (0447 brand-prune). Both deploy on push (app-code → CI matrix + Baseline prod deploy). They push
  at the END of this session bundled with the admin→app work, on operator "go". Push held per explicit-push rule.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Independently converged on Dirstarter's "Unified Dashboard" (`/admin`,`/dashboard`→`/app`). |
| Extension or replacement | Consolidation — collapse the dual `/admin` + `/app` trees into one (`/app`). |
| Why justified | The `/admin` routes are already redirect-shadowed; this removes the dead tree + relocates the still-live shared components. |
| Risk if bypassed | Drifted dual trees; dangling `~/app/admin/` imports if pages are deleted before components move. |

## Petey plan

### Goal

Collapse the `/admin` route tree into `/app` (move live `_components` + repoint, delete dead pages + dup
components), behavior-preserving, with a faithful build green between pairs. Hold push.

### Tasks

#### SESSION_0448_TASK_01 — Re-enumerate the live cross-tree importers (build the move-list)

- **Agent:** Petey/Explore
- **What:** the ~21 count from 0442 may have shifted. Build the actual move-list.
- **Steps:** `grep -rl "~/app/admin/" apps/web/app/app` → which `/app` pages import which `app/admin/**/_components`;
  cross-check `config/app-redirects.ts` `MIGRATED_ADMIN_APP_ROUTES` for which `/admin` sections are shadowed;
  classify each `app/admin/*` dir as (a) shared `_component` to MOVE, (b) dead page + dup component to DELETE
  (where `/app` already has the canonical copy), or (c) KEEP (`task-board`, layout, error, not-found).
- **Done means:** a written move/delete/keep table in this file before any edit.

##### TASK_01 result — move/delete/keep table (enumerated 2026-06-25)

**Blast radius is fully contained:** `~/app/admin/` is referenced ONLY from `app/admin/**` and `app/app/**`
(no tests / e2e / lib / server). 21 `app/app/**` files import shared `_components` from 7 admin sections.
No Category-A `/app` twin has its own `_components` dir → whole-dir moves, zero merge conflicts.

**MOVE** (Category A — move `_components` → mirrored `/app` path, repoint `~/app/admin/<s>/` → `~/app/app/<s>/`,
then delete the now-dead `page.tsx`/route files of the section):

| Admin section | `_components` to move | /app importers to repoint |
| --- | --- | --- |
| `_components` (dashboard metrics) | `revenue/subscriber/user/visitor-metric.tsx` → `app/app/_components/` | `app/app/page.tsx` |
| `tournaments` | `_components/` (15) + `roles/_components/` (6) + `rule-sets/_components/` (6) | ~13 `app/app/tournaments/**` pages |
| `lineage` | `_components/` (avatar-action, claimability-toggle, selected-rank-select) | `app/app/lineage/{page,[treeId]/page}.tsx` |
| `claims` | `[id]/_components/profile-claim-review-actions.tsx` | `app/app/claims/[id]/page.tsx` |
| `memberships` | `_components/` (2) + `[id]/_components/` (2) | `app/app/memberships/{page,[id]/page}.tsx` |
| `organizations` | `[id]/theme/_components/org-theme-form.tsx` | `app/app/organizations/[id]/theme/page.tsx` |
| `users` | `_components/` (8) | `app/app/users/{page,new,[id]}/page.tsx` |

**DELETE wholesale** (Category B — fully-dead redirect-shadowed sections; `/app` twin self-contained, zero
cross-tree importers): `billing`, `categories`, `merch`, `pricing-plans`, `repo-docs`, `storage`,
`subscription-tiers`, `subscriptions`, `tags`, `tools` + `app/admin/page.tsx` (dead dashboard root, after metrics move).

**KEEP:** `app/admin/task-board/` (LIVE, no redirect, no `/app` twin) + `app/admin/{layout,error,not-found}.tsx`
(the task-board shell — no admin-tree imports). `server/admin/*` untouched (server logic, not routes).

**Drift caveat (out of scope):** some dead admin pages drifted ahead of their `/app` twin (e.g.
`/admin/lineage/claims/[id]` once had a Claimed-Rank card the `/app` twin lacked — `[[admin-retiring-only-app-remains]]`).
Those admin pages are redirect-shadowed (unreachable), so deleting them is safe; feature-parity is a separate
audit. Any drift noticed mid-move gets flagged, not silently dropped.

#### SESSION_0448_TASK_02 — Move + repoint shared `_components`

- **Agent:** Cody
- **What:** relocate each shared `app/admin/**/_components/*` → `app/app/**` and repoint its ~20 importers.
- **Steps:** per-pair: move file → update all `~/app/admin/...` imports → faithful `next build` green → commit.
- **Done means:** zero `~/app/admin/` imports remain in `app/app/**` (except `task-board`); build green.

#### SESSION_0448_TASK_03 — Delete dead redirect-shadowed pages + duplicate components

- **Agent:** Cody
- **What:** delete `app/admin/*/page.tsx` (dead) + the ~39 duplicate component basenames where `/app` has the canonical copy.
- **Steps:** confirm each is redirect-shadowed (`curl /admin/<x>` → 308 → `/app/<x>`) + zero importers before delete; KEEP `task-board` + layout + error/not-found; DON'T touch `server/admin/*`.
- **Done means:** `/admin` tree reduced to `task-board` + shared shell; tsc + faithful build green.

#### SESSION_0448_TASK_04 — /fallow-fix-loop + code-review

- **Agent:** Petey/Doug
- **Done means:** diff clean (no introduced findings); review clean.

#### SESSION_0448_TASK_05 — Faithful build + bow-out (push held + this work on "go")

- **Agent:** Petey
- **Done means:** faithful clonefile-worktree `next build` GREEN; SESSION closed; on operator "go" push the 2 held app commits + this session's admin→app commits together (one app-code push → CI + deploy).

### Parallelism

Per-pair sequential (each repoint needs a build between). Verification fan-out (read-only) can parallelize.

### Risks

- Deleting an `/admin` page before its `_component` moved → dangling `~/app/admin/` import → build break. Move
  components FIRST (TASK_02), delete pages AFTER (TASK_03).
- `server/admin/*` is server-side logic, NOT routes — DON'T touch under a "/admin removal" framing (confirm with operator).
- `task-board` is LIVE (no redirect, no `/app` twin) — KEEP it.

### Scope guard

- DON'T touch `server/admin/*`. KEEP `app/admin/task-board` + layout + error/not-found.
- DEFER (their own sessions/PRs): gated Stage-2 brand schema drop; `config/site` `siteConfig.name` metadata
  destale; theme-form `<ThemeFieldset>` consolidation; `repo-truth-index` brand-truth §D (4-brand enum);
  Dirstarter blog-editor gap; perf <60ms.

### Faithful build recipe (banked — the dev server confounds builds)

See `[[next-build-catches-use-server]]`. DON'T build in-place with a custom distDir while `next dev --turbo`
runs on :3000 (incomplete route-manifest → phantom typedRoutes + dev-login errors); DON'T use a worktree with
SYMLINKED node_modules (Turbopack rejects out-of-tree symlinks). DO: `git worktree add --detach /tmp/wt <SHA>`
→ `cp -Rc node_modules` (root + apps/web) + `cp -Rc apps/web/.generated` + `cp apps/web/.env*` →
`cd /tmp/wt/apps/web && npx next build` (default `.next`, real deps, no dev interference). Use `npx next build`
NOT `bun run build` (prebuild runs `db:migrate deploy` against prodsnap).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0448_TASK_01 | landed | Enumerated: 21 `app/app/**` importers from 7 admin sections; blast radius contained to `app/admin`+`app/app`; move/delete/keep table above. 6 MOVE sections + dashboard metrics; 10 DELETE-wholesale; KEEP task-board+shell. |
| SESSION_0448_TASK_02 | landed | Moved 6 sections' `_components` + dashboard metrics → `/app` (whole-dir, behavior-preserving); repointed all 21 importers `~/app/admin/<s>`→`~/app/app/<s>`. 7 per-section commits (`be4b8d72`,`96d26ff5`,`b327ebe3`,`fca78002`,`d6359a1b`,`0c52d0f4`,`9faa7d2e`). `app/app` has 0 `~/app/admin/` refs. |
| SESSION_0448_TASK_03 | landed | Deleted 10 dead redirect-shadowed Category-B sections + dead admin pages (`82224ef0`). `app/admin/` now = `task-board` + `{layout,error,not-found}.tsx`. Verify: tsc 0, oxlint 0 err (4 inherited warns), **faithful build GREEN 194/194 pages exit 0**; live `/app`,`/app/users`,`/app/lineage`,`/app/tournaments`→200; `/admin/tools`+`/admin/tournaments`→308→`/app`. |
| SESSION_0448_TASK_04 | landed | fallow-fix-loop: 1 introduced finding (orphaned `lineage-avatar-action` → deleted `1b6666b8`); dead-code 5→4 (introduced 0, rest inherited/FP); dup net-decreased (10 admin copies deleted); complexity all inherited. 2 fallow finders + 2 code-review finders = **4 independent reviewers, all clean**. Drift: 13/14 page-pairs at parity; 1 gap surfaced (lineage avatar-uploader — see Open decisions). |
| SESSION_0448_TASK_05 | landed | Faithful build GREEN (194/194); bow-out + full close done; push held for operator "go". |
| SESSION_0448_TASK_06 | landed | **Operator chose restore+wire** the avatar-uploader parity gap. Restored `lineage-avatar-action.tsx` (verbatim from `5f5bdc41` — no repoint) into `app/app/lineage/_components/` + wired into `/app/lineage/[treeId]/page.tsx` per member with a `passport.id` (`7a794178`). Verify: tsc 0, oxlint 0, **faithful build GREEN 194/194**, **browser-verified** (7 avatar controls render for placeholder passports; cropper modal mounts on file-select — screenshot confirmed; stopped before "Apply" to avoid a real-R2 write — the action path is unchanged/proven 0437). Page gated by `requireLineageManagementAccess`; action admin-gated → no new auth surface. |
| SESSION_0448_TASK_09 | landed | **Org-settings access fix** (operator-flagged: "I manage ALL the orgs ... there was no crash before this session"). Investigated hard — **no crash** from the ThemeFieldset refactor (form renders on every reachable route incl. self-service when access-granted; 0 console/500 errors; git blame shows the gate is from May + the `Brand.BBL` hardcode from `e2cdeb9c` 2026-06-21, neither this session). But the platform admin WAS wrongly blocked from self-service org settings by two pre-existing issues → operator directed both fixed (`258debba`): (1) `hasOrgAdminAccess` now grants `role==="admin"` (WP-imported orgs have `ownerId=null` → platform staff got OrgAccessDenied); (2) `getOrganizationBySlug` resolves by slug alone (brand-agnostic; 0 dup slugs verified) so legacy non-BBL orgs stop 404ing. Verified: both a null-owner BBL org + the owned BASELINE org now render the theme form for the operator. tsc 0, oxlint 0. |
| SESSION_0448_TASK_08 | landed | **`<ThemeFieldset>` extraction** (operator: execute now). Lifted the identical 7-field color/asset fieldset out of `brand-settings-form` + `org-theme-form` + `self-service-theme-form` → `components/web/forms/theme-fieldset.tsx` (reads `control` via `useFormContext` to dodge RHF's invariant `Control` typing across 3 differently-typed schemas); every per-form diff is a prop (placeholders, accentColor description, `imageGridCols` as static class literals). `94aa4787`. Verify: tsc 0, oxlint 0, **faithful build GREEN 194/194**, brand-settings + org-theme **browser-verified** (correct per-form placeholders/descriptions/grid; screenshot = identical layout), self-service same component + verified props (page org-ownership-gated for dev user). fallow: the 3-way clone family **collapsed** (~225 dup lines removed; brand-settings out of the family). |
| SESSION_0448_TASK_07 | landed | **Repo-wide quality sweep** (operator: fallow health+audit + fix-loop). Health = **89.8 (good)**, dup 11.6% (normal); dead-code headline (235 exports/80 types) confirmed **inflated** (Zod-schema/DTO/convention/test-only FPs — SESSION_0446 lesson). 3 parallel verifier agents. **Applied 4 verified behavior-preserving wins** (`b0d0f816`): React `cache()` on `findBrandSettings` (root layout read it 2×/request); deleted dead `components/common/field.tsx` + `server/web/entitlement/manage-entitlements.ts`; dropped dead `findMediaById`/`findMediaAttachments`. Verify: tsc 0, oxlint 0, **faithful build GREEN 194/194**, home 200 + brand CSS injects, fallow 0-introduced. **Skipped** `lib/i18n.ts` `locales` (load-bearing for the `Locale` type — agent missed it; verified). Bigger refactors → proposals (below). |

## What landed

- **`/admin → /app` topology migration complete (= Dirstarter "Unified Dashboard").** The `app/admin/`
  route tree is reduced from ~21 sections to its live core: `task-board` + `{layout,error,not-found}.tsx`.
  Net diff **+57 / −7,509 lines across 160 files** — pure topology, behavior-preserving.
- **6 sections + dashboard metrics consolidated into `/app`** (whole-dir `_components` moves, all 21 live
  importers repointed `~/app/admin/<s>` → `~/app/app/<s>`): dashboard metrics, `claims`, `organizations`,
  `lineage`, `memberships`, `users`, `tournaments`. No `/app` twin had its own `_components` → zero merge
  conflicts; moved files are R100 byte-identical except the repointed import line.
- **10 fully-dead redirect-shadowed sections deleted wholesale** (`/app` twin self-contained, zero
  cross-tree importers): `billing`, `categories`, `merch`, `pricing-plans`, `repo-docs`, `storage`,
  `subscription-tiers`, `subscriptions`, `tags`, `tools` + the dead `app/admin/page.tsx` dashboard.
- **1 orphan removed** (`lineage-avatar-action.tsx`): the whole-dir move carried it into `/app`; its only
  base importer was the deleted dead `/admin/lineage/[treeId]` page → fallow flagged it unused → deleted.
- **`app/app` now has ZERO `~/app/admin/` references**; the only repo-wide `~/app/admin/` ref is
  `task-board`'s own self-import (kept-live, no redirect, no `/app` twin). `server/admin/*` untouched.
- **Verified end-to-end:** tsc 0 · oxlint 0 errors · **faithful clonefile `next build` GREEN (194/194
  static pages, exit 0)** · live authed smoke of `/app`, `/app/users`, `/app/lineage`, `/app/tournaments`
  → 200 with real content · redirects intact (`/admin/tools`→308→`/app/tools`,
  `/admin/tournaments`→308→`/app/tournaments`) · **4 independent review finders (2 fallow + 2 code-review)
  all clean** · code-review `[]`.
- **Avatar-uploader parity gap RESOLVED (TASK_06, operator: restore+wire).** Restored
  `lineage-avatar-action.tsx` (verbatim, no repoint — imports `~/components` + the surviving
  `~/server/admin/passport-avatar` action) into `app/app/lineage/_components/` and wired it into
  `/app/lineage/[treeId]/page.tsx` per member with a `passport.id`, mirroring the old admin layout.
  Browser-verified live (7 controls render, cropper modal mounts on file-select — screenshot confirmed);
  faithful build GREEN 194/194. So `/app` now has the admin avatar-uploader the redirect-shadowing hid.

## Decisions resolved

- **Commit cadence (operator):** per-section commits + ONE final faithful build (not per-pair with a build
  between each — the pre-staged literal plan). These are pure file moves; tsc resolves alias breaks
  instantly and the `next-build` "use server" risk only applies to *new* exports → 9 commits, tsc+oxlint
  green between each, one faithful build + browser smoke at the end. ~30 clonefile builds avoided.
- **Whole-dir `_components` moves (Cody):** move the entire `_components` dir per section (not just the
  /app-imported subset) — correct for transitive sibling deps (e.g. `tournament-form`→`divisions-editor`);
  any genuinely-orphaned component is caught by the fallow-fix-loop (it caught exactly 1).
- **Orphaned `lineage-avatar-action` (Doug/fallow):** initially DELETED in the migration (unreachable in
  prod; behavior-preserving) — then the drift finder surfaced it as a real admin capability the `/app` twin
  lacked.
- **Avatar-uploader parity gap (operator, at bow-out):** **RESTORE + WIRE now** (not defer). Re-exposed the
  uploader on `/app/lineage/[treeId]` (TASK_06) — the operator wants the admin lineage-member avatar control
  on the live `/app` surface (member photos matter for BBL). Behavior is now a *superset* of pre-migration
  prod (prod never exposed it; `/app` now does, gated).

## Files touched

Grouped (160 files; full list in the diff `git diff 5f5bdc41..HEAD`):

| Group | Change |
| --- | --- |
| `app/app/_components/{revenue,subscriber,user,visitor}-metric.tsx` | moved from `app/admin/_components/`; `app/app/page.tsx` repointed |
| `app/app/claims/[id]/_components/`, `app/app/organizations/[id]/theme/_components/` | moved from admin; importers repointed |
| `app/app/lineage/_components/` (claimability-toggle, selected-rank-select) | moved from admin; importers repointed; orphan `lineage-avatar-action` deleted |
| `app/app/memberships/_components/` + `[id]/_components/` | moved from admin; importers repointed |
| `app/app/users/_components/` (8 files) | moved from admin; importers repointed |
| `app/app/tournaments/_components/` + `roles/_components/` + `rule-sets/_components/` (27 files) | moved from admin; ~13 importers repointed |
| `app/admin/{billing,categories,merch,pricing-plans,repo-docs,storage,subscription-tiers,subscriptions,tags,tools}/**` | **deleted** (dead, redirect-shadowed, /app twin self-contained) |
| `app/admin/**/page.tsx` (49 dead pages) + `app/admin/page.tsx` | **deleted** (all redirect-shadowed → `/app`) |
| `app/admin/{layout,error,not-found}.tsx` + `task-board/**` | **untouched** (kept-live shell) |
| `apps/web/server/admin/*`, `config/app-redirects.ts`, `next.config.ts` | **untouched** (confirmed by empty diff-stat) |
| `app/app/lineage/_components/lineage-avatar-action.tsx` | **TASK_06** restored (verbatim from `5f5bdc41`, no repoint) — admin avatar-uploader |
| `app/app/lineage/[treeId]/page.tsx` | **TASK_06** wired `LineageAvatarAction` per member with a `passport.id` |
| `server/admin/brand-settings/queries.ts` | **TASK_07** `findBrandSettings` wrapped in React `cache()` (root layout read it 2×/request) |
| `components/common/field.tsx`, `server/web/entitlement/manage-entitlements.ts` | **TASK_07** deleted (verified-dead) |
| `server/admin/media/queries.ts` | **TASK_07** dropped dead `findMediaById` + `findMediaAttachments` |
| `components/web/forms/theme-fieldset.tsx` | **TASK_08** new — shared `<ThemeFieldset>` (the SESSION_0447-named extraction) |
| `app/app/brand-settings/_components/brand-settings-form.tsx`, `app/app/organizations/[id]/theme/_components/org-theme-form.tsx`, `app/(web)/organizations/[slug]/settings/theme/_components/self-service-theme-form.tsx` | **TASK_08** repointed to `<ThemeFieldset>` (−~225 dup lines) |
| `docs/sprints/SESSION_0448.md`, `docs/knowledge/wiki/index.md` | this session file + index row |

## Verification

| Command / smoke | Result |
| --- | --- |
| `npx tsc --noEmit` (HEAD `1b6666b8`) | clean (0 errors) |
| `npx oxlint app/app app/admin` | 0 errors; 4 warnings — all **inherited** (`children` unused-param in post/user/tool-form, no-unused-expr in tool-publish-actions; pre-existing in moved/twin files) |
| **Faithful `next build`** (clonefile worktree @ `82224ef0`: real cloned deps, default `.next`, no dev-server interference) | ✅ **GREEN** — Compiled in 5.4min, TypeScript ✓, page data ✓, **Generating static pages (194/194)** in 25.4s, exit 0. (194 vs 0447's 225 = the ~31 deleted dead admin pages.) |
| Live authed smoke (dev-login + curl) | `/app` 200 (moved metrics render), `/app/users` 200, `/app/lineage` 200, `/app/tournaments` 200 — all real content, 0 hard-error markers |
| Redirect integrity | `/admin/tools`→308→`/app/tools`; `/admin/tournaments`→308→`/app/tournaments` (resolver executed by code-review finder across 49 routes — all land on live twins) |
| `npx fallow audit --changed-since 5f5bdc41 --gate new-only` | dead-code 5→**4** after orphan delete (**introduced: 0**; remaining = 2 inherited unused exports + react-email/react-dom FP); dup net-decreased (10 admin copies deleted); complexity all inherited |
| Review (4 finders: 2 fallow-loop + 2 code-review) | **all clean** — repoint/deletion-safety CLEAN, drift 13/14 pairs at parity, code-review `[]`, conventions `[]` |
| **TASK_06** faithful `next build` (clonefile @ `7a794178`) | ✅ GREEN — compiled 2.4min, TypeScript ✓, **194/194 static pages**, exit 0 |
| **TASK_06** browser-verify (isolated playwright, dev-login) | PASS — `/app/lineage/[treeId]` renders **7 avatar controls** for placeholder passports; file-select **mounts the cropper modal** ("Crop avatar for John Lewis", Apply present) — screenshot confirmed; stopped before Apply (no real-R2 write; action unchanged/proven 0437) |

## Open decisions / blockers

- **✅ Parity gap RESOLVED (operator: restore+wire — TASK_06).** The lineage member avatar-uploader the
  deleted dead `/admin/lineage/[treeId]` had is now restored + wired into the live `/app/lineage/[treeId]`
  (`7a794178`), browser-verified. No longer an open item.
- **Push HELD** — **13 app-code commits** ready (2 inherited from 0446/0447 + 11 this session incl. the
  avatar restore), awaiting operator "go" (explicit-push rule). One app-code push → CI matrix + Baseline
  prod deploy.
- **Inherited follow-ups (named, not this session's job):** score-forms 2 unused exports (`TKO_THRESHOLD`,
  `ESKRIMA_DEFAULT_ROUNDS` — dead at base); 87 cross-section table/form dup clone-groups (the
  `<ThemeFieldset>`/table-columns consolidation flagged 0447); `config/site` `siteConfig.name` metadata
  destale; `repo-truth-index` brand-truth §D (4-brand enum); gated Stage-2 brand schema drop.

### Quality-sweep refactor proposals (TASK_07 — verified-feasible, await operator greenlight)

These are behavior-preserving but bigger/regression-trap-prone, so they were NOT auto-applied — each needs
its own focused pass + verification:

- **✅ `<ThemeFieldset>` extraction — DONE (TASK_08, `94aa4787`).** Executed per operator. The regression
  trap (per-form placeholders + accentColor description) was handled by making every difference a prop;
  `control` reads from `useFormContext` (RHF `Control` is invariant — couldn't widen across the 3 schemas).
  Browser-verified behavior-identical. ~225 dup lines removed.
- **School/org-general schema dedup (LOW value, LOW risk).** `school-form` ↔ `org-general-info-form` share
  an identical 10-field zod schema + defaultValues (~30 lines) but the rendered JSX is intentionally
  DIVERGENT (school has a ProfileHero preview, different labels/layout, omits FormMessage on 4 fields). Only
  extract the **schema + type + defaultValues** to a shared module; do NOT touch the JSX.
- **`editor-queries.ts:261-273` Promise.all (MARGINAL perf).** Fold `tree` + the 2 access queries into one
  `Promise.all` (verified independent). Editor path (low frequency); adds 2 queries on the rare not-found
  path → net win only because not-found is rare. Low priority.
- **NOT actioned (verified KEEP):** `getRequestOrigin` "duplicate" (intentional layering — `request-url`
  wraps `brand-context` with a non-null SEO fallback; different contracts); haptics named exports (used
  internally via the `haptics` object); the ~235 fallow "unused exports" (Zod-schema/DTO/convention FPs).

## Next session

### Goal

Operator's call — the deferred single-brand vestige follow-ups: **(a)** `<ThemeFieldset>` extraction
(collapses 12+ theme-form dup clone-groups: `brand-settings-form` / `org-theme-form` /
`self-service-theme-form`); **(b)** `config/site` `siteConfig.name` metadata destale +
`repo-truth-index` §D 4-brand-enum destale; **(c)** the gated Stage-2 brand schema drop (its own PR, prod
migration — decision gates first: BASELINE comp-fixture, no non-BBL prod rows). Optional cleanup: trim the
2 inherited dead exports in `app/app/tournaments/_components/score-forms.tsx`.

### First task

Pick (a)/(b)/(c) per operator. If (a): grep the 3 theme-form files, extract the shared fieldset into a
`<ThemeFieldset>` (Dirstarter L1 primitive pattern), repoint the 3 consumers, browser-verify each renders.

### Inputs to read

- This file; memory `brand-vestige-trim-inventory`, `admin-retiring-only-app-remains` (admin→app DONE).

## Review log

### SESSION_0448_REVIEW_01 — /admin → /app topology migration

- **Reviewed tasks:** TASK_01–05.
- **Dirstarter docs check:** independently converged on Dirstarter's "Unified Dashboard" (single `/app`
  surface); no baseline *layer* touched (project-structure consolidation of an already-redirect-shadowed
  tree). No live Dirstarter doc fetch required (no Prisma/auth/payments/storage/theming change).
- **Verdict:** Clean, high-confidence behavior-preserving topology migration. Every move is a byte-identical
  rename + a one-line repoint; every deletion is a redirect-shadowed dead page with a verified live `/app`
  twin (resolver executed across all 49 deleted routes). The single risk vector — a missed repoint or a
  live deletion — is closed by tsc (0), the faithful build (194/194), and 4 independent finders (all clean).
  The one orphan the whole-dir move surfaced was caught by fallow and removed; the one parity gap it exposed
  (avatar-uploader) is surfaced with the backend action intact, not silently dropped.
- **Score:** 9.5/10 — disciplined, honestly verified, faithful build green; half-point for the
  imprecise first orphan-check (checked `lineage/page.tsx`, not `[treeId]/page.tsx`) — corrected by the
  drift finder, deletion rationale held.
- **Follow-up:** the named inherited follow-ups above (`<ThemeFieldset>`, `siteConfig.name`, truth-index §D,
  score-forms dead exports).

### SESSION_0448_REVIEW_02 — avatar-uploader restore (TASK_06)

- **Reviewed task:** TASK_06 (operator-chosen restore+wire after bow-out).
- **Verdict:** Clean, low-risk feature restore. The component is verbatim from `5f5bdc41` (no edits, no
  repoint — it only ever imported `~/components` + the surviving `~/server/admin/passport-avatar` action),
  wired into the live twin exactly as the old admin page did (per member with a `passport.id`). The page is
  already behind `requireLineageManagementAccess` and the action is admin-gated → **no new auth surface**.
  Browser-verified: 7 controls render for placeholder passports + the cropper modal mounts on file-select
  (screenshot); faithful build GREEN 194/194. The R2-write/Apply step was deliberately not exercised (would
  pollute the real bucket; the path is unchanged + proven SESSION_0437) — disclosed, not skipped silently.
- **Score:** 9.5/10.

## Hostile close review

- **Giddy:** **pass** — operator-approved scope executed exactly (the cadence fork was surfaced + chosen via
  AskUserQuestion before any mutation). 11 app-code commits are **local-only**; push **explicitly held** per
  the explicit-push rule. The parity gap is recorded as an open decision, not hidden. No `server/admin/*`
  edits (the stated constraint), confirmed by empty diff-stat.
- **Doug:** **pass** — behavior-preserving proven on three legs: (1) renames are R100 byte-identical except
  the repoint line; (2) deletions are redirect-shadowed (resolver executed across 49 routes → all land on
  live twins); (3) the faithful Vercel-parity `next build` is GREEN end-to-end (194/194 pages). tsc 0,
  oxlint 0 errors, fallow introduced-0. Honesty: the 194-vs-225 page drop is explained (deleted dead pages),
  the orphan-check imprecision is disclosed in the review log, the avatar gap is surfaced not buried.
- **Desi:** **pass** — no visual regression: the migrated surfaces render the *same* components (moved
  byte-identical), live smoke confirms `/app` + 3 surfaces render 200 with real content. The one UX delta is
  a deliberate **addition** (TASK_06): the admin lineage-member avatar-uploader is now restored on
  `/app/lineage/[treeId]` (browser-verified — 7 controls render, cropper mounts), making `/app` a UX superset
  of pre-migration prod.
- **Kaizen aggregate:** 9.5/10.

## ADR / ubiquitous-language check

- **ADR note recommended (not blocking):** the `/admin → /app` consolidation completes the
  "`/admin` route tree retiring → only `/app`" direction ([[admin-retiring-only-app-remains]]). It executes
  an already-decided direction (no *new* architectural decision), so a full ADR is optional; the SESSION
  record + memory update suffice. If the operator wants it formalized, a short ADR "single dashboard surface
  (`/app`); `/admin` reduced to `task-board` + shell; `server/admin/*` retained" would capture it.
- **Ubiquitous-language:** no new domain terms (reused: admin/app route tree, redirect-shadowed, `_components`,
  topology migration, Unified Dashboard).

## Reflections

- **Enumerate before you move — the move-list is the whole game.** TASK_01 (grep the 21 importers, classify
  every admin section MOVE/DELETE/KEEP, confirm no `/app` twin already owns the `_components`, prove the
  blast radius is contained to `app/admin`+`app/app`) made the execution mechanical and safe. The single
  decision that fell out — "no /app twin has its own `_components`" — is what turned this from a risky
  per-component merge into clean whole-dir `git mv`s with zero conflicts.
- **Whole-dir moves trade one orphan for transitive-dep safety — and fallow collects the tax.** Moving the
  entire `_components` dir (not just the /app-imported subset) guarantees sibling imports survive
  (`tournament-form`→`divisions-editor`), at the cost of possibly relocating a component only the deleted
  dead page used. That's the right trade: fallow's reachability analysis caught exactly the 1 orphan, and
  the drift finder turned it into a *useful* finding (a real admin capability with a surviving backend
  action) instead of silent dead code. The loop did its job.
- **A redirect-shadowed page is dead in prod but can still hide a real capability.** My first orphan-check
  looked at `lineage/page.tsx` and concluded "dead at base"; the drift finder found it was actually rendered
  by `lineage/[treeId]/page.tsx`. Both conclusions point to "delete it" (unreachable + twin never had it),
  but the *reason* matters: the honest framing is "behavior-preserving deletion that exposes a parity gap,"
  not "removing always-dead code." Lesson: check **every** route under a section, not the index page.
- **The faithful clonefile build recipe (banked 0447) paid off immediately.** One ~6-min build at the end
  (real deps, default `.next`, no dev-server interference) gave Vercel-parity proof — 194/194 pages — while
  the live `:3000` dev server kept serving the smoke. No phantom typed-route errors this time because the
  build ran in `/tmp`, fully isolated. The per-section tsc gate (cheap) + one faithful build (authoritative)
  is the right cadence for a pure-move migration.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | code = pure topology moves (inline commit rationale per section); SESSION doc frontmatter complete (`status: closed`, `last_agent: claude-session-0448`); no wiki/arch doc content changed beyond the index row |
| Backlinks/index sweep | wiki `index.md` session-0448 row added; `pairs_with` → SESSION_0447 |
| Wiki lint | `bun run wiki:lint` → **0 errors, 15 warnings** (all pre-existing R8 in untouched `SESSION_VIDEO_R001` + `petey-plan-0436`; 0 in touched docs) |
| Kaizen reflection | yes (Reflections above) |
| Hostile close review | SESSION_0448_REVIEW_01 + Giddy/Doug/Desi above (9.5/10) |
| Review & Recommend | yes — Next session = avatar-uploader parity decision OR deferred brand-vestige follow-ups |
| Memory sweep | updated `admin-retiring-only-app-remains` (migration DONE; avatar-uploader parity gap noted) + `brand-vestige-trim-inventory` (admin→app done); no new memory file needed |
| Next session unblock check | unblocked (both candidate lanes are doable; avatar lane has the surviving action + twin path named) |
| Git hygiene | branch `main`; **13 unpushed commits** (11 session `be4b8d72..7a794178` incl. docs close `e4fbeef9` + avatar restore `7a794178`; + 2 inherited 0446/0447); push **HELD** per explicit-push rule — hashes in git log |
| Graphify update | refreshed twice (incremental): post-migration Nodes 41 · Edges 1462 · Communities 2033; post-avatar-restore Nodes 16 · Edges 663 · Communities 2054 — both before their close commit |
| Pre-push cost gate | ✅ **faithful Vercel-parity `next build` GREEN ×2** — migration @ `82224ef0` (194/194, exit 0) AND avatar-restore @ `7a794178` (194/194, exit 0); both clonefile worktrees, real deps, default `.next`, no dev interference |
