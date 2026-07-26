---
title: "SESSION 0446 — codebase quality loop: dead-code trim + admin→app/brand/Dirstarter audit"
slug: session-0446
type: session--open
status: closed
created: 2026-06-24
updated: 2026-06-24
last_agent: claude-session-0446
sprint: S44
pairs_with:

  - docs/sprints/SESSION_0445.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0446 — codebase quality loop: dead-code trim + admin→app/brand/Dirstarter audit

## Date

2026-06-24

## Operator

Brian + claude-session-0446 (Petey)

## Goal

Bow-in opened on Truelson care (blocked on a BBL Resend key). The operator **pivoted** the session to a
codebase-quality loop with three goal-parts: (1) clean, maintainable codebase, (2) no feature regressions,
(3) every page < 60ms — run `/fallow-fix-loop` toward that, ordered lanes 2 (safe cleanup) → 3 (admin→app
dup) → 1 (perf), "with subagents". Truelson shelved (no outward sends this session).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0445.md`
- Carryover: 0445 shipped funnel polish + comp gate + global modal (committed `83599dfb`, pushed; HEAD
  `9f0ddb3a`). Truelson care left blocked on the BBL Resend key.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `9f0ddb3a` (== origin/main — 0445 fully pushed)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None (dead-code removal in app modules; no baseline layer changed). Research touched Dirstarter changelog alignment (read-only). |
| Extension or replacement | Neither — pure removal + a dependency declaration (`@orpc/shared`). |
| Why justified | Surface reduction toward the operator's clean-codebase goal; zero behavior change. |
| Risk if bypassed | n/a |

## Petey plan

### Goal

Iterate fallow-fix-loop-style toward clean/maintainable/no-regressions/<60ms, lanes 2→3→1, with subagents.

### Tasks

| ID | Title |
| --- | --- |
| SESSION_0446_TASK_01 | Lane 2a — verified dead-code sweep (subagent fan-out) + correctness fixes |
| SESSION_0446_TASK_02 | Lane 2b — duplication assessment (which dupes are real/safe) |
| SESSION_0446_TASK_03 | Lane 3 — admin→app topology migration (map + scope) |
| SESSION_0446_TASK_04 | Brand-vestige trim audit + Dirstarter changelog gap analysis (subagents) |
| SESSION_0446_TASK_FINAL | Truelson care (shelved — operator pivot) |

### Scope guard

Quality/cleanup + research only. Explicit-push rule: build + verify + show, hold push for "go".

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0446_TASK_01 | landed | 6 read-only subagents verified the 218 "unused exports" → small genuinely-dead set. Removed 9 dead functions (+cascade tails) + declared `@orpc/shared`. Committed `4e4efea1`. |
| SESSION_0446_TASK_02 | assessed | Dupes are mostly NOT clean wins: blog↔posts = false dup (Post vs ContentPost); several pairs are one-live/one-vestigial; the big real dup (forms) is lane 3. `bbl-countdown.tsx` is a clean delete candidate but operator chose to KEEP it (deliberate holding-page scaffolding). |
| SESSION_0446_TASK_03 | mapped (execution deferred) | Premise CONFIRMED: `/admin/*` IS redirect-shadowed via `config/app-redirects.ts` → `next.config.ts redirects()` (every section except `task-board`). 21 cross-tree `_components` importers + ~39 duplicated component basenames. Operator chose "full topology migration" → deferred to a fresh focused session (high blast radius). |
| SESSION_0446_TASK_04 | landed | Brand-trim inventory + Dirstarter gap analysis (2 subagents). Findings banked to memory. Brand trims = one interconnected refactor (deferred); Dirstarter gap = blog editor. |
| SESSION_0446_TASK_FINAL | shelved | Truelson care not pursued (operator pivot). Script + `--to`/`--free-signup` overrides already exist; still gated on a `blackbeltlegacy.com` Resend key. |

## What landed

- **Lane-2 dead-code sweep (committed `4e4efea1`, local — push held):** 6 read-only Explore subagents
  verified the 218 fallow "unused exports" against real references, separating genuine dead code from
  framework false-positives (the agents confirmed: all 28 `emails/*` are react-email false-positives; the
  `app/api/og/route.tsx` `contentType`/`size`/`alt` are Next OG-route convention exports; `components/*`
  "dead" are mostly shadcn primitive re-exports). Removed **9 genuinely-dead functions** (each grep-confirmed
  zero-ref) + their orphaned tails: `getPageAnalytics`, `findGearRecommendations`, `findBookmark`,
  `getOrganizationById`, `getUserMemberships`, `findPost`, `findPostSlugs`, `notifyFounderOfClaimExplainer`,
  `findBblBjjRankByShortName`.
- **Correctness:** declared `@orpc/shared` (imported by `app/api/rpc` but missing from `package.json` —
  resolved the fallow "unlisted dependency"); `bun.lock` updated +1 line.
- **fallow dead-code exports 194 → 185;** unlisted-dependency resolved; diff introduces no new fallow findings.
- **Lane-3 mapped + premise corrected:** confirmed `/admin/*` routes are redirect-shadowed (the
  `admin-retiring-only-app-remains` memory was RIGHT — my mid-analysis "it's live" alarm was wrong; I had
  read the page bodies before `next.config.ts redirects()`). Execution deferred (operator: full migration,
  fresh session).
- **Research banked to memory:** `brand-vestige-trim-inventory` (the remaining single-brand vestiges are one
  interconnected chrome+SEO+config refactor, not quick trims; KEEP-FOREVER host gate; gated Stage-2 schema
  drop) and `dirstarter-changelog-gaps` (aligned/ahead on 4 of 5; real gap = blog Tiptap editor + in-post
  media + duplication; public API deferred; `repo-truth-index.md` stale on blog).

## Decisions resolved

- **Session pivot:** Truelson → codebase-quality loop (clean/no-regressions/<60ms), lanes 2→3→1, with subagents.
- **`bbl-countdown.tsx`:** KEEP (operator) — deliberate holding-page scaffolding; refresh stale sibling comments later.
- **Lane 3 scope:** full admin→app topology migration (operator) — but deferred to a fresh focused session.
- **Brand trims:** deferred — they're one interconnected high-blast-radius refactor, not safe quick trims (operator: wrap + defer).
- **Kept on purpose this session:** the 3 `*brand-isolation*.test.ts` (guard the live `brand` filters until the gated Stage-2 schema drop).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/analytics.ts` | remove dead `getPageAnalytics` + `AnalyticsPageResponse` type |
| `apps/web/lib/notifications.ts` | remove dead `notifyFounderOfClaimExplainer` + `EmailBblClaimExplainer` import |
| `apps/web/package.json` | declare `@orpc/shared` (was unlisted) |
| `apps/web/server/web/affiliate-products/queries.ts` | remove dead `findGearRecommendations` |
| `apps/web/server/web/bookmarks/queries.ts` | remove dead `findBookmark` (legacy `userId_toolId` shape) |
| `apps/web/server/web/lineage/bbl-bjj-rank-map.ts` | remove dead `findBblBjjRankByShortName` + `BJJ_RANK_BY_SHORT_NAME` |
| `apps/web/server/web/organization/queries.ts` | remove dead `getOrganizationById`, `getUserMemberships` (+ import) |
| `apps/web/server/web/posts/queries.ts` | remove dead `findPost`, `findPostSlugs` (+ type) |
| `bun.lock` | `@orpc/shared` importer entry (+1 line) |
| `docs/sprints/SESSION_0446.md` | this session file |
| `docs/knowledge/wiki/index.md` | session-0446 row |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | clean (0 errors) |
| `bun run lint:check` | no new warnings in touched files (all warnings pre-existing elsewhere) |
| `bun run format:check` | all correct (1766 files) |
| Route smoke (node fetch) — `/`, `/directory/profiles`, `/posts`, `/lineage` | all 200 |
| `npx fallow dead-code` | exports 194 → 185; unlisted-dep resolved |
| `npx fallow audit --changed-since HEAD --gate new-only` | ✓ no issues in 9 changed files (3 complexity findings are inherited in bbl-bjj-rank-map, excluded) |
| `next build` (local prod gate) | NOT run (dev server live on :3000; deferred — would use worktree isolation) |

## Open decisions / blockers

- **Lane 3 (admin→app full topology migration)** — mapped + ready; deferred to a fresh focused session
  (move 21 cross-tree `_components`→`/app` + repoint; delete dead redirect-shadowed pages + their orphaned
  dup `_components`; KEEP `task-board`/layout; tsc covers import breakage). It IS Dirstarter's "Unified Dashboard."
- **Brand-vestige prune** — one interconnected refactor (chrome + `config/seo` sitemap/robots + `config/site`
  per-brand Record + BrandSettings UI); plus a gated Stage-2 schema drop. See `brand-vestige-trim-inventory`.
- **Blog editor gap** (Dirstarter) — Tiptap rich editor + in-post media upload + post duplication (DB/status/
  bulk already done). A feature session.
- **Stale doc** — `docs/knowledge/wiki/repo-truth-index.md` says blog is MDX (`content/blog/`); it's DB-backed.
- **`next build` local gate** — still deferred (carried from 0445); run before the next app-code push.
- **Push held** — `4e4efea1` (app-code → will deploy on push) committed locally; awaiting operator "go".
- **Truelson care** — still gated on a `blackbeltlegacy.com` Resend key.

## Next session

### Goal

A fresh, focused **console-consolidation + brand-prune** session: execute lane-3 (admin→app, = Dirstarter
Unified Dashboard) together with the overlapping brand-features/minimal-chrome trim, with full multi-page
visual QA. (Perf <60ms — lane 1 — after, once the prod build is the measurement baseline.)

Bundled research lane (operator, SESSION_0446): **audit the security docs for single-brand staleness.** The
`docs/security/` set — especially `brand-scope-hardening-plan.md` (the **MB-002 brand-scope hardening plan**,
written for the OLD multi-brand model) — predates the single-brand collapse and is likely partly stale. Read
it against current code, separate what's still load-bearing (the host→brand security gate survives — see
`brand-vestige-trim-inventory`) from what was multi-brand-only, and **trim/refactor/update** those docs as
part of the brand-prune (don't silently delete a still-valid risk-register row; update its rationale).

### First task

`SESSION_0447_TASK_01` — Map the `(web)` + `/app` layout/chrome topology (which pages render `header.tsx`/
`footer.tsx`/`nav-sheet` vs the BBL-landing's own chrome), capture before screenshots on home + an inner
page, then collapse `brandHasFeature`/`brandHasMinimalChrome` (remove dead `!minimal` chrome) and begin the
admin→app `_components` move (21 cross-tree importers). Read memory `brand-vestige-trim-inventory` +
`admin-retiring-only-app-remains` + `dirstarter-changelog-gaps` first. Hold push for operator "go".

`SESSION_0447_TASK_02` (research, can run in parallel via a subagent) — audit `docs/security/*` +
`docs/architecture/security-privacy-payments-monitoring-plan.md` for single-brand staleness; produce a
trim/keep/update list (esp. `brand-scope-hardening-plan.md` / MB-002), then apply the doc updates.

### Inputs to read

- This file; memory `brand-vestige-trim-inventory`, `admin-retiring-only-app-remains`, `dirstarter-changelog-gaps`.
- Security docs to review/update: `docs/security/brand-scope-hardening-plan.md` (MB-002),
  `docs/security/ronin-security-risk-register.md`, `docs/security/security-test-plan.md`,
  `docs/security/payment-security-checklist.md`, `docs/security/README.md`,
  `docs/architecture/security-privacy-payments-monitoring-plan.md`.

## Review log

### SESSION_0446_REVIEW_01 — dead-code trim + audit

- **Reviewed tasks:** TASK_01–04.
- **Dirstarter docs check:** changelog fetched live (5 entries Feb–Jun 2026); gap analysis in
  `dirstarter-changelog-gaps`. No baseline layer changed by the code work.
- **Verdict:** Clean, conservative win. The subagent fan-out correctly deflated a scary-looking "194 unused
  exports / 17% duplication" headline into a small genuinely-safe set, avoiding the false-positive minefield
  (`fallow fix` would have deleted Next OG-route exports). The 9 removals are each grep-verified zero-ref;
  gates green; diff introduces no findings. The two deferrals (lane-3, brand-prune) are correctly scoped as
  high-blast-radius fresh-session work rather than forced at the bottom of a long context.
- **Score:** 8/10 (−1 `next build` gate not run; −1 the headline session goals (lanes 3 + 1) are deferred,
  not delivered — though deferral was the right call).
- **Follow-up:** lane-3 + brand-prune (fresh session); `next build`; push held.

## ADR / ubiquitous-language check

- ADR update **not required** — no architectural decision made/changed/rejected this session. Lane-3 and the
  brand-prune are deferred (when executed they may warrant ADR notes, but nothing was decided beyond scoping).
- Ubiquitous-language update **not required** — no new domain terms (reused: brand, lineage, admin/app, claim).

## Hostile close review

- **Giddy:** pass — operator-approved scope executed; the one prod-affecting artifact (`4e4efea1`, app-code)
  is committed **local-only**, push explicitly held per the explicit-push rule. Deferrals are recorded, not hidden.
- **Doug:** pass — every removal grep-verified zero-ref before deletion; gates green (typecheck/lint/format);
  behavior proven unchanged (4 routes 200 + diff introduces no fallow findings). Honesty: `next build` was
  **not** run (disclosed); the mid-analysis `/admin`-is-live error was caught and corrected before being
  asserted as final (see Reflections), not papered over.
- **Desi:** n/a — no UI changed this session (the chrome trim was deferred precisely to avoid unverified
  global-chrome edits).
- **Kaizen aggregate:** 8/10 — disciplined, honest, conservative; lost points for deferring the headline lanes
  (correctly) and the unrun build gate.

## Reflections

- **Read framework config before asserting route reachability.** I read `app/admin/*/page.tsx` bodies, saw no
  `redirect()`, and briefly concluded "/admin is live" — contradicting the memory. The truth was in
  `config/app-redirects.ts` → `next.config.ts redirects()` (a Next-level 308 that fires before the page). I
  caught it before reporting it as fact, but the lesson: for "is this route reachable?", `next.config redirects()`
  + middleware are the FIRST things to read, not the page body. The memory was right; I was incomplete.
- **A subagent fan-out's highest value was deflation, not discovery.** The scary headline (194 unused exports,
  17% dup, 613 files) collapsed under verification: react-email false-positives, Next convention exports,
  shadcn primitive re-exports, and one-live/one-vestigial "dupes". `fallow fix --dry-run` proposed deleting
  the OG-route `contentType`/`size`/`alt` — proof that blind auto-fix would have caused the exact regressions
  the operator forbade. The win was the verified *small* kill-list, not the big number.
- **"Safe trim" is a property of the dependency graph, not the line count.** The brand vestiges looked like 5
  quick deletes but every one routed back through `config/brand-features` into global chrome + SEO + config —
  one interconnected refactor. Reading the actual consumers (not trusting the audit's "top 5") is what surfaced
  that, and why deferring to a fresh session was the honest call over forcing it deep in context.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | code files carry inline SESSION_0446 rationale in commit `4e4efea1`; SESSION doc frontmatter complete (`last_agent: claude-session-0446`, `status: closed`); no wiki *page* content changed (research → memory, not wiki) |
| Backlinks/index sweep | wiki `index.md` session-0446 row added; `pairs_with` → SESSION_0445 |
| Wiki lint | `bun run wiki:lint` → 0 errors, 15 warnings (all pre-existing in SESSION_VIDEO_R001 + petey-plan-0436; this session's files add none) |
| Kaizen reflection | yes (Reflections above) |
| Hostile close review | SESSION_0446_REVIEW_01 + Giddy/Doug/Desi above |
| Review & Recommend | yes — Next session = console-consolidation + brand-prune (fresh) |
| Memory sweep | added `brand-vestige-trim-inventory` + `dirstarter-changelog-gaps` (+ index lines); existing brand/admin/explicit-push memories still valid |
| Next session unblock check | unblocked (mapping + memory in place); push held on operator "go" |
| Git hygiene | branch `main`; `4e4efea1` (app code, local) + one close commit (docs); push HELD per explicit-push rule — hash reported at bow-out / see git log |
| Graphify update | Nodes 99 · Edges 859 · Communities 2078 (run before close commit) |
| Pre-push cost gate | `next build` NOT run (dev server live; deferred to next app-code push) |
