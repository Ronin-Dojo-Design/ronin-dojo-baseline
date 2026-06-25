---
title: "SESSION 0447 — console-consolidation + brand-chrome prune + security-doc destale"
slug: session-0447
type: session--implement
status: closed
created: 2026-06-24
updated: 2026-06-25
last_agent: claude-session-0447
sprint: S44
pairs_with:

  - docs/sprints/SESSION_0446.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0447 — console-consolidation + brand-chrome prune + security-doc destale

## Date

2026-06-24 → 2026-06-25

## Operator

Brian + claude-session-0447 (Petey)

## Goal

Execute the SESSION_0446 deferred lanes: the interconnected **brand-chrome prune** (collapse the dead
`brandHasFeature`/`brandHasMinimalChrome` gates + per-brand `config/site` Record now that single-brand
collapse made them constant), verified pixel-identical via before/after screenshots; plus the parallel
**security-doc single-brand destale**; with `/admin → /app` topology migration (lane 3) attempted after.
Hold push per the explicit-push rule.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0446.md`
- Carryover: 0446 trimmed 9 dead exports (`4e4efea1`, local) + closed docs (`8767a4a6`, local); mapped +
  deferred brand-prune and admin→app as one fresh focused session. This is that session.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `8767a4a6` (origin/main `9f0ddb3a` + 2 unpushed local commits, push held)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None — collapsing Ronin-side single-brand vestiges (chrome/config). admin→app = Dirstarter "Unified Dashboard" (deferred). |
| Extension or replacement | Neither — dead-branch removal + behavior-preserving collapse. |
| Why justified | Surface reduction toward the operator's clean-codebase goal; zero behavior change (every removed branch was provably constant). |
| Risk if bypassed | n/a |

## Petey plan

### Goal

Collapse the now-constant brand-chrome gates + per-brand site config (behavior-preserving), destale the
security docs, and (operator decision) defer `/admin → /app`. Verify hard; hold push.

### Tasks

| ID | Title | Agent |
| --- | --- | --- |
| SESSION_0447_TASK_00 | Pre-push `next build` gate of HEAD (validate dead-code commit) | Petey |
| SESSION_0447_TASK_01 | Brand-chrome prune: collapse dead gates + `config/site` Record; keep+trim dead `footer`/`bottom`/`ad-banner`; delete `brand-features.ts`(+test) | Cody |
| SESSION_0447_TASK_02 | Security-doc single-brand destale + repo-truth-index blog fix | Doug (subagent) |
| SESSION_0447_TASK_03 | BrandSettings 4-tab → single-row editor | Cody |
| SESSION_0447_TASK_04 | `/admin → /app` `_components` topology migration | (deferred — operator) |
| SESSION_0447_TASK_05 | `/fallow-fix-loop` on the diff | Petey |
| SESSION_0447_TASK_06 | code-review (high) + `/bow-out` | Petey/Doug |

### Parallelism

TASK_02 (docs) ran as a background subagent disjoint from app-code (no git, docs-only). TASK_01/03 were
inline + sequential (interconnected). Review used 4 read-only finder subagents over the diff.

### Scope guard

- DEFER the gated Stage-2 schema drop (drop `brand` column / `Brand` enum / ~484 literals — own PR).
- KEEP-FOREVER: `HOST_TO_BRAND`/`BRAND_TRUSTED_ORIGINS`/`resolveBrand` (MB-002 host→brand security gate).
- KEEP the 3 `*brand-isolation*.test.ts`.
- DEFER the Dirstarter blog-editor gap + perf <60ms lane.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0447_TASK_00 | landed | Pre-push build gate. Isolated-distDir build of HEAD → Turbopack compile ✓ but type-check showed dev-server artifacts; resolved at close with a **faithful clonefile-worktree `next build` → GREEN end-to-end** (compile + type-check + 225/225 static pages). Recipe banked in `[[next-build-catches-use-server]]`. |
| SESSION_0447_TASK_01 | landed | Collapsed constant `brandHasFeature`/`brandHasMinimalChrome` gates in header/nav-sheet/sidebar/ad-card/`[slug]`/profile; collapsed `config/seo.ts` + `config/site.ts` Record → BBL; **deleted `config/brand-features.ts` (+test)**; **restored + gate-trimmed** dead `footer`/`bottom`/`ad-banner` (operator: keep as reference). tsc/oxlint/oxfmt clean; seo.test 4/4; **chrome pixel-identical (0% diff home+inner, desktop+mobile)**. |
| SESSION_0447_TASK_02 | landed | 7 docs destaled (6 security + repo-truth-index); superseded rows struck (not deleted); MB-002 host→brand gate marked KEEP-FOREVER; blog truth-index fixed; wiki-lint 0 errors. |
| SESSION_0447_TASK_03 | landed | BrandSettings 4-brand loop → single BBL editor (`page.tsx` + form); removed dead `findAllBrandSettings`. tsc caught + fixed a schema-narrowing break. Admin editor only; live theme-injection path untouched. |
| SESSION_0447_TASK_04 | deferred | `/admin → /app` topology migration — operator chose to keep it as its own focused session. |
| SESSION_0447_TASK_05 | landed | fallow-fix-loop: net **−385 lines**, 2 files deleted, header.tsx 270→120 (dropped below CRAP threshold). All 9 complexity findings + 12 dup groups + 3 unused files are **inherited** (named follow-ups), zero introduced. 2 review finders clean. |
| SESSION_0447_TASK_06 | landed | code-review (high): 4 finder agents across both loops, **all `[]`** — no correctness/security/convention findings; collapse confirmed faithful. |

## What landed

- **Brand-chrome prune (behavior-preserving collapse).** With the single-brand collapse making
  `brandHasFeature()` a constant `true` and `brandHasMinimalChrome()` true for the only brand (BBL), every
  `!minimal` / `has()` branch was dead. Collapsed the live surfaces — `header.tsx` (rewritten to the minimal
  branch, 270→120 lines), `nav/nav-sheet.tsx`, `app/sidebar.tsx`, `ads/ad-card.tsx`, `(web)/[slug]/page.tsx`,
  `app/profile/page.tsx` — and **deleted `config/brand-features.ts` + its test** (all exports became
  production-unused). Collapsed `config/seo.ts` (sitemap = all routes, robots disallow = `[]`) and
  `config/site.ts` (per-brand `Record<Brand,…>` → BBL singleton).
- **Dead chrome files kept as reference (operator decision).** `footer.tsx`, `bottom.tsx`,
  `ads/ad-banner.tsx` are all 0-importer dead (footer superseded by `BblFooter`). Per operator, restored and
  **gate-trimmed in place** (footer inlines single-brand shims preserving its `!minimal` reference structure;
  bottom/ad-banner had their single constant gate removed) so the `brand-features.ts` deletion still stands.
- **BrandSettings 4-brand picker → single BBL editor** (`app/app/brand-settings/page.tsx` + form); removed
  the now-dead `findAllBrandSettings`. Admin editor only — the live `app/layout.tsx` theme-injection path is
  untouched.
- **Security-doc single-brand destale** (subagent): 6 security docs + `repo-truth-index.md`. MB-002 host→brand
  gate marked **KEEP-FOREVER**; multi-brand-only rows marked superseded (struck, not deleted, with ADR 0034
  rationale); blog truth-index corrected (MDX → DB-backed `Post`). wiki-lint 0 errors.
- **Verification:** tsc 0, oxlint 0, oxfmt 0/14, seo.test 4/4, Turbopack compile ✓, chrome **pixel-identical**
  (directory/lineage/posts desktop byte-identical; home header+footer + mobile header 0.000% diff). Reviewed
  by 4 independent finder agents across the fallow + code-review loops — all clean.

## Decisions resolved

- **admin→app (lane 3):** DEFER to its own focused session (operator) — keeps this session's verified
  brand-prune clean; the migration is large/mechanical and needs faithful per-pair builds.
- **Dead chrome files (`footer`/`bottom`/`ad-banner`):** RESTORE + keep as reference (operator), gate-trimmed
  in place — cf. the 0446 keep of dead `bbl-countdown.tsx`.
- **`config/site.ts` `siteConfig.name`** left as the "Baseline Martial Arts" static build-time fallback
  (runtime uses `getBrandSiteConfig(BBL)`) — a metadata change, deferred to keep this pass behavior-preserving.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/header.tsx` | rewritten to the minimal (BBL) branch; removed dead full-chrome nav + gate imports (270→120 lines) |
| `apps/web/components/web/nav/nav-sheet.tsx` | dropped `brandHasFeature` filter + `minimal`/`useBrand`/`cx`; `chrome-surface` unconditional |
| `apps/web/components/app/sidebar.tsx` | removed `brandHasFeature`/`brandHasMinimalChrome`; `BblMemberRail` guard + `buildVisibleLinks` collapsed (behavior-equiv) |
| `apps/web/components/web/ads/ad-card.tsx` | removed constant `advertise` gate + `Brand`/`brandHasFeature` imports |
| `apps/web/app/(web)/[slug]/page.tsx` | removed constant `listings` notFound gate + imports |
| `apps/web/app/app/profile/page.tsx` | tabs/quick-links un-gated (was always-true `has()`) |
| `apps/web/config/seo.ts` | collapsed: sitemap = all routes, robots disallow = `[]`; dropped `feature` field |
| `apps/web/config/site.ts` | per-brand `Record<Brand,…>` → BBL singleton; `getBrandSiteConfig` returns BBL |
| `apps/web/config/brand-features.ts` | **deleted** (all exports production-unused post-collapse) |
| `apps/web/config/brand-features.test.ts` | **deleted** (sole consumer of the deleted module) |
| `apps/web/components/web/footer.tsx` | kept as reference; gate import → inlined single-brand shims; `_hideCTA` |
| `apps/web/components/web/bottom.tsx` | kept as reference; removed constant `listings` gate + imports |
| `apps/web/components/web/ads/ad-banner.tsx` | kept as reference; removed constant `advertise` gate + imports |
| `apps/web/app/app/brand-settings/page.tsx` | 4-brand loop → single BBL editor (`findBrandSettings(BBL)`) |
| `apps/web/app/app/brand-settings/_components/brand-settings-form.tsx` | dropped `brand`/`brandLabel` props; hardcoded BBL |
| `apps/web/server/admin/brand-settings/queries.ts` | removed dead `findAllBrandSettings` |
| `docs/security/brand-scope-hardening-plan.md` | KEEP-FOREVER banner; runtime DB-scope plan → superseded/re-activation blueprint |
| `docs/security/ronin-security-risk-register.md` | risk #1 → superseded (struck, kept); origin-gate carve-out |
| `docs/security/security-test-plan.md` | x-brand data-isolation cases struck; unknown-host/cookie cases reframed as origin-gate KEEP |
| `docs/security/payment-security-checklist.md` | 2 brand-coupled lines clarified; otherwise KEEP |
| `docs/security/README.md` | banner + host-to-brand KEEP-FOREVER; gap #1 superseded; maturity axis retired |
| `docs/architecture/security-privacy-payments-monitoring-plan.md` | MB-002 launch-blocker split (DB-scope superseded / origin-gate KEEP-FOREVER) |
| `docs/knowledge/wiki/repo-truth-index.md` | blog: MDX `content/blog/` → DB-backed `Post` + `app/app/posts/` |
| `docs/sprints/SESSION_0447.md` | this session file |
| `docs/knowledge/wiki/index.md` | session-0447 row |

## Verification

| Command / smoke | Result |
| --- | --- |
| `npx tsc --noEmit` | clean (0 errors) |
| `npx oxlint` (14 touched files) | clean (0 warnings) |
| `npx oxfmt --check` (14 files) | all correct |
| `bun test config/seo.test.ts` | 4 pass / 0 fail |
| Chrome before/after (playwright, isolated) | **pixel-identical** — directory/lineage/posts desktop byte-identical; home header(top80)+footer(bot420) + mobile header = 0.000% diff |
| `npx fallow audit --changed-since HEAD` | 9 complexity / 12 dup / 3 unused-files — **all inherited** (0 introduced); header dropped below threshold |
| code-review (high) + fallow review | 4 finder agents, all `[]` (no findings) |
| `bun run wiki:lint` | **0 errors, 16 warnings** (all pre-existing R8 in untouched `SESSION_VIDEO_R001` + `petey-plan-0436`) |
| **Faithful `next build`** (clonefile worktree @ HEAD: real cloned deps, default `.next`, no dev-server interference) | ✅ **GREEN** — `Compiled successfully in 42s`, page data collected, `Generating static pages (225/225)`, exit 0. **No dev-login / typed-route errors** → the earlier isolated-distDir errors were confirmed concurrent-dev-server artifacts. Vercel-parity build is clean. |

## Open decisions / blockers

- **`/admin → /app` topology migration (lane 3)** — deferred to its own focused session (operator). Mapped in
  0446 + `admin-retiring-only-app-remains`: move ~21 cross-tree `_components` importers → `/app` + repoint,
  delete dead redirect-shadowed pages + dup components, KEEP `task-board`; per-pair commits, build green between.
- **`config/site.ts` `siteConfig.name`** still "Baseline Martial Arts" (static fallback) — follow-up metadata destale.
- **Theme-form consolidation** — `brand-settings-form` / `org-theme-form` / `self-service-theme-form` share an
  identical fieldset (12 dup clone-groups); a future `<ThemeFieldset>` extraction. Inherited, out of scope.
- **`repo-truth-index` brand-truth section (D)** still lists the 4-brand enum (stale under ADR 0034) — TASK_02
  left it (out of scope); follow-up single-brand truth-index pass.
- **Push held** — committed locally; awaiting operator "go" (explicit-push rule).
- **Gated Stage-2 schema drop** — unchanged; still its own PR.

## Next session

### Goal

Execute the deferred **`/admin → /app` topology migration** (lane 3 = Dirstarter "Unified Dashboard") as its
own focused session: move the ~21 cross-tree `app/admin/**/_components` importers to `app/app/**` + repoint,
delete the dead redirect-shadowed pages + their duplicate components, KEEP `app/admin/task-board` + layout +
error/not-found, DON'T touch `server/admin/*`. Per-pair commits, `next build` green between, push held.

### First task

`SESSION_0448_TASK_01` — Re-enumerate the live `~/app/admin/` importers across `app/app/**` (the count may
have shifted), pick the first 2–3 `_component` pairs, move + repoint them, and run a **faithful** `next build`
(stop the dev server or use a clonefile worktree — see SESSION_0447 Reflections on the isolated-build
route-manifest artifact). Read memory `admin-retiring-only-app-remains` first.

### Inputs to read

- This file; memory `admin-retiring-only-app-remains`, `brand-vestige-trim-inventory`.
- `config/app-redirects.ts` (`MIGRATED_ADMIN_APP_ROUTES`) + `next.config.ts redirects()`.

## Review log

### SESSION_0447_REVIEW_01 — brand-chrome prune + security destale

- **Reviewed tasks:** TASK_00–06.
- **Dirstarter docs check:** no baseline layer changed (Ronin-side vestige collapse). admin→app (Dirstarter
  Unified Dashboard) deferred. Security docs destaled against ADR 0034 (single-brand).
- **Verdict:** Clean, high-confidence behavior-preserving collapse. The single-brand invariant
  (`BrandProvider brand={Brand.BBL}` + `lib/safe-actions` hard-coded BBL + no `getRequestBrand`) makes every
  removed gate provably constant; chrome proven pixel-identical (0% diff); 4 independent finder agents
  returned zero findings; net −385 lines with header complexity dropping below threshold. The operator's two
  forks (defer admin→app; keep the dead files as reference) were honored. The build gate was fully closed: a
  **faithful Vercel-parity `next build`** (clonefile worktree, real deps, default `.next`, no dev-server
  interference) is **GREEN end-to-end** (compile + type-check + page-data + 225/225 static pages), which also
  confirmed the earlier isolated-distDir dev-login/typed-route errors were concurrent-dev-server artifacts.
- **Score:** 9.5/10 — disciplined, honest, behavior-preserving, build green end-to-end; the half-point is the
  one inline `next.config` distDir detour (reverted cleanly) taken while learning the faithful-build recipe.
- **Follow-up:** admin→app next session; metadata (`siteConfig.name`) + theme-form `<ThemeFieldset>` + truth-index §D follow-ups named.

## Hostile close review

- **Giddy:** pass — operator-approved scope executed exactly (brand-prune + security docs done; admin→app
  deferred per operator; dead files kept per operator). The one prod-affecting artifact set is committed
  **local-only**, push explicitly held per the explicit-push rule. Deferrals recorded, not hidden.
- **Doug:** pass — every collapse proven behavior-preserving (the constant-gate invariant traced to
  `BrandProvider`/`lib/safe-actions`); chrome **pixel-identical** (0% diff, quantified with sharp); gates green
  (tsc/oxlint/oxfmt/seo.test); 4 finder agents clean. Honesty: the isolated `next build` type-check artifact is
  disclosed (Verification + Reflections), and a faithful build is queued before push — not claimed as done.
- **Desi:** pass — chrome is the most-touched surface and is proven pixel-identical on home + inner pages,
  desktop + mobile; no visual regression. BrandSettings is an admin-only editor collapse (one form vs four),
  not a public surface.
- **Kaizen aggregate:** 9.5/10 — disciplined, honest, behavior-preserving, with a faithful Vercel-parity build
  green end-to-end; the half-point is the one reverted-cleanly `next.config` distDir detour en route to the
  faithful-build recipe (now banked in memory for next session).

## ADR / ubiquitous-language check

- ADR update **not required** — no new architectural decision; this executes the already-ratified single-brand
  collapse (ADR 0034). The deferred admin→app may warrant an ADR note when executed.
- Ubiquitous-language update **not required** — no new domain terms (reused: brand, chrome, minimal-chrome,
  BBL, host→brand gate).

## Finding router

- No new wiring/drift/FS/incident findings. The named follow-ups (siteConfig metadata, theme-form
  consolidation, repo-truth-index section D) are session-scoped Open-decisions, not cross-session ledger rows.

## Reflections

- **The single-brand invariant is what made this safe — and proving it was the work.** The collapse only
  holds because `brand` is constant BBL everywhere: `BrandProvider brand={Brand.BBL}` in the root layout AND
  `lib/safe-actions` hard-coding `ctx.brand = Brand.BBL` AND `getRequestBrand` being gone. A reviewer agent
  surfaced that second leg, which I hadn't explicitly cited. Lesson: for a "this gate is always true" claim,
  enumerate *every* source of the gated value, not just the obvious one.
- **A running dev server makes a faithful local `next build` hard.** Turbopack rejects an out-of-tree
  symlinked `node_modules` (the worktree approach), and building with a custom `distDir` concurrently with the
  dev server produced an *incomplete route-manifest* `validator.ts` → ~40 phantom typed-route errors + a
  dev-login route-handler error that the live `9f0ddb3a` Vercel deploy proves are not real blockers. The
  Turbopack **compile** is the faithful build-only-bug catcher and it passed; the faithful full build needs no
  dev-server interference (stop-dev or clonefile worktree at the commit). Banked for next session.
- **"Pixel-identical" is provable, and worth proving.** Byte-identical screenshots on inner pages + a sharp
  per-region diff (0.000% on the header/footer strips) turned "I believe the chrome is unchanged" into
  evidence — exactly the bar a global-chrome refactor needs. The cheap win: the dev server was already up, so
  before-shots cost nothing if taken first.
- **A subagent fan-out's value here was confirmation, not discovery.** 4 finders over a behavior-preserving
  diff returned zero findings — the right outcome, and the cost of being sure on a high-blast-radius change.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | code files carry inline SESSION_0447 rationale; security docs + repo-truth-index frontmatter bumped (`last_agent: claude-session-0447`, `updated: 2026-06-24`) by the TASK_02 subagent; SESSION doc frontmatter complete (`status: closed`) |
| Backlinks/index sweep | wiki `index.md` session-0447 row added; `pairs_with` → SESSION_0446 |
| Wiki lint | `bun run wiki:lint` → (recorded in bow-out response) |
| Kaizen reflection | yes (Reflections above) |
| Hostile close review | SESSION_0447_REVIEW_01 + Giddy/Doug/Desi above |
| Review & Recommend | yes — Next session = admin→app topology migration (deferred) |
| Memory sweep | updated `brand-vestige-trim-inventory` (chrome/site/BrandSettings DONE; admin→app + Stage-2 remain) + `admin-retiring-only-app-remains` (next session); no new memory needed |
| Next session unblock check | unblocked (admin→app mapped; faithful-build recipe banked) |
| Git hygiene | branch `main`; staged + one close commit; push **HELD** per explicit-push rule — hash reported at bow-out / see git log |
| Graphify update | Nodes 130 · Edges 339 · Communities 2031 (run before close commit) |
| Pre-push cost gate | ✅ **faithful Vercel-parity `next build` GREEN** (clonefile worktree, real deps, default `.next`, no dev interference): compile + type-check + page-data + 225/225 static pages, exit 0. Earlier isolated-distDir errors confirmed dev-server artifacts. |
