---
title: "SESSION 0366 — BBL launch-readiness audit (evidence-backed gap map + next slice)"
slug: session-0366
type: session--open
status: closed
created: 2026-06-12
updated: 2026-06-12
last_agent: claude-session-0366
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0365.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0366 — BBL launch-readiness audit (evidence-backed gap map + next slice)

## Date

2026-06-12

## Operator

Brian + claude-session-0366

## Goal

Operator /goal kickoff: produce a verified, evidence-backed audit of every BBL launch flow
(auth onboarding, invite, claim, placeholder person, RBAC, public surfaces, Stripe/entitlements,
nav, shell drift) against the **live code**, then identify the smallest launch-blocking vertical
slice. Explicitly a wiring/completion pass, not greenfield. Kickoff definition of done = the gap
map + the named next slice (implementation is the next loop iteration).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0365.md` (Phase 2a closed — unified `/app` shell +
  lineage/users/claims areas, PR #63 squash `7ee27ce`).
- Carryover: queued next = Phase 2b (remaining admin areas in waves). The operator /goal supersedes
  for this session with an audit-first kickoff; 2b stays queued.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `36861d5`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None this session (read-only audit); flows audited span auth, payments, dashboard — all per captured `76c8e1e` + SoT set |
| Extension or replacement | Not applicable (no code written) |
| Why justified | Audit grounds the next slice in live code per the SoT rule (SoT set + live app win) |
| Risk if bypassed | Re-proposing already-built flows; the goal text itself carried SESSION_0360-era stale clues |

Live docs checked during planning: not re-fetched — upstream pin `76c8e1e` re-verified current at
SESSION_0365 (2026-06-12, same day).

### Graphify check

- Graph status: current; stats at bow-in: 10382 nodes, 16209 edges, 1502 communities, 1734 files tracked.
- Queries used:
  - `claim invite onboarding stripe entitlement navigation slide-in menu directory lineage drawer profile RBAC`
- Files selected from graph: lineage drawer/canvas components, `app/(web)` + `app/admin` + `app/app`
  route trees, claim/invite/entitlement server dirs — each then verified by direct `ls`/read.
- Verification note: Graphify used as navigation; every audit-table row verified by direct file
  inspection (route dirs, server actions, e2e specs, `lib/auth.ts` hook, webhook handler).

### Grill outcome

Doc/code drift called out per the kickoff's own rule (SoT set + live code win):

- Goal text says "the codebase does not appear to have fully landed /app shell or /api/rpc" —
  **stale** (SESSION_0360-era snapshot). Phase 1 (oRPC `/api/rpc`, `server/orpc/*`, D4 seam) and
  Phase 2a (unified `/app` + lineage/users/claims) are on `main` (`94e119d`, `7ee27ce`).
- Goal lists SESSION_0360 as latest — actual latest is SESSION_0365.
- Goal's launch objective (visitor → user via auth/claim/invite) is **already built end-to-end**
  on the current User-rooted model, with the claim e2e in CI (SOT-ADR D8; memory: don't
  re-propose proof-first). The remaining launch work is the substrate program (Phases 2b/2c, 3, 4
  reconcile, 5) + the D8 cutover-arm lane (slide-in navs, landing, L8 essentials, stripe@22).

### Drift logged

No new drift-register entry — the mismatches above are prompt-text staleness, not repo drift.
Open register items relevant to this lane: D-023 (identity fragmentation — Phase 3 is the fix).

## Petey plan

### Goal

Deliver the A–F audit (verified findings, launch blockers, minimal next slice, files, risks,
verification plan) and stage the ratified slice for the next loop iteration.

### Tasks

#### SESSION_0366_TASK_01 — Evidence-backed flow audit

- **Agent:** Petey (inline)
- **What:** Verify all 15 kickoff flows against live code (routes, server logic, UI, tests);
  produce the audit table + A–F deliverable in chat; record the condensed map here.
- **Done means:** every flow row backed by a direct file/spec citation, no guessed statuses.
- **Depends on:** nothing

#### SESSION_0366_TASK_02 — Slice pick + stage

- **Agent:** Petey (inline)
- **What:** Pick the smallest launch-blocking slice from the audit (recommendation: D8 cutover-arm
  slide-in nav lane — measured spec already exists in SESSION_0361 §Q4), name exact files, stage
  for implementation (this session if ratified, else next).
- **Done means:** slice named with files + verification plan; Next session block points at it.
- **Depends on:** TASK_01

#### SESSION_0366_TASK_03 — Nav slice build (right + left slide-ins)

- **Agent:** Cody (inline)
- **What:** Operator ratified ("nav slice then 2b, parallel where possible"). New `Sheet`
  side-panel primitive (`components/common/sheet.tsx`, Base UI Dialog, drawer.tsx idiom);
  right `NavSheet` (account + primary nav, guest/authed states); header hamburger at all
  widths replacing the full-screen overlay; left `DirectoryFilterSheet` hosting the existing
  `DirectoryFilters`; e2e smoke; en i18n keys.
- **Done means:** gates green; browser proof on bbl.local (guest + authed + left panel); PR + CI.
- **Depends on:** TASK_02

#### SESSION_0366_TASK_04 — Phase 2b wave 2 (parallel sub-agent)

- **Agent:** Cody (background sub-agent, isolated worktree)
- **What:** Wave-1 transform on tournaments + memberships + organizations
  (copy pages → strip HOC → area layout with `APP_AREA_PERMISSIONS` gate → anchored href
  sweep → sidebar nav entries per `can()`); e2e specs for moved areas; branch
  `session-0366-app-wave2` + PR. Disjoint file set from TASK_03 (app/app + components/app
  vs components/web).
- **Done means:** PR open, gates green in agent worktree, old `/admin` intact.
- **Depends on:** TASK_02 (ratification); runs parallel to TASK_03

### Parallelism

TASK_01 → TASK_02 sequential. TASK_03 (inline, `components/web` + `e2e/smoke`) and TASK_04
(sub-agent worktree, `app/app/*` + `components/app/nav.tsx`) ran concurrently — verified
disjoint file sets. Merge order: nav PR first, then 2b PR.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0366_TASK_01 | Petey | Audit/gap-map is planning work |
| SESSION_0366_TASK_02 | Petey | Slice selection is planning; Cody takes the build loop |

### Open decisions

- **Slice ratification:** program-queued next = Phase 2b (admin-area waves); audit recommends the
  D8 cutover-arm **slide-in nav lane** first (launch-gating, user-facing, spec'd, small). Both are
  launch-gating; order is the operator's call. Recommendation recorded in chat deliverable C.

### Risks

- Audit could go stale like GAP_MATRIX if not re-verified at each phase start — mitigated by citing
  files, not asserting statuses.

### Scope guard

- NO implementation until the slice is ratified (kickoff DoD = gap map + named slice).
- NO schema changes anywhere in this lane (Phase 3 owns schema).
- NO new generic listing abstraction; NO porting legacy backend code from the monorepo/BBLApp.
- Legacy repos consulted for UI behavior only (already captured in SESSION_0361 §Q4).

### Dirstarter implementation template

- **Docs read first:** SoT set (BBL-SOT-Spec, SOT-ADR D1–D8, SESSION_0365) 2026-06-12; upstream pin
  `76c8e1e` re-verified at SESSION_0365 same-day.
- **Baseline pattern to extend:** (for the staged nav slice) existing drawer/sheet primitives
  (`components/common/drawer.tsx`) + `components/web/header.tsx`.
- **Custom delta:** BBL slide-in L+R behavior per SESSION_0361 measured spec, brand-neutral build.
- **No-bypass proof:** audit-only session; nav slice rebuilds legacy UX on current primitives, not
  a parallel system.

## Cody pre-flight

Not applicable this session — no code written (audit/planning). The staged nav slice gets a full
pre-flight when its build session opens.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0366_TASK_01 | landed | 15-flow audit verified against live code; A–F deliverable in chat; condensed map in this file. |
| SESSION_0366_TASK_02 | landed | Operator ratified: nav slice first + 2b in parallel ("any parallel possibilities please do"). |
| SESSION_0366_TASK_03 | landed | Sheet primitive + NavSheet (right) + DirectoryFilterSheet (left) + header wiring + smoke e2e; browser-proven on bbl.local (guest + authed + left panel, Escape close); PR #64 all checks green (incl. Playwright ×3 + CodeRabbit) → squash-merged `0eb9b23`. |
| SESSION_0366_TASK_04 | landed | Worktree agent delivered PR #65 (36 files: 16 tournament/membership/org pages → `/app`, 3 gated area layouts, 16 _components href-swept per-line — zero sed, 0 modified import lines verified; sidebar entries `can()`-gated; no roles change needed — `tournaments.*` wildcard covers `.manage`). All checks green → squash-merged `742fe92`. |

## What landed

- **15-flow launch audit** (evidence-backed, A–F deliverable in chat): the visitor→user loop
  (auth/claim/invite) is built and CI-proven on the current model; remaining launch work =
  the D8 gating subset (2b/2c, Phase 3, Phase 4 reconcile, Phase 5 lanes, cutover-arm, stripe@22).
  Goal-text staleness called out (Phase 1 + 2a were already on `main`).
- **D8 cutover-arm nav lane CLOSED** — PR #64 → `0eb9b23`: new `Sheet` side-panel primitive;
  right `NavSheet` (guest + authed states, 280px); header hamburger at all widths (full-screen
  overlay deleted, desktop inline nav kept); left `DirectoryFilterSheet` (320px) hosting the
  existing filters; smoke e2e ×2; en i18n keys.
- **Phase 2b wave 2** — PR #65 → `742fe92` (parallel worktree agent): tournaments (12 pages incl.
  brackets/registrations/roles/rule-sets), memberships (2), organizations (2) under `/app` with
  `APP_AREA_PERMISSIONS` area-layout gates; 16 shared `_components` href-swept per-line (zero sed);
  sidebar entries `can()`-gated; old `/admin` intact until 2c.

## Decisions resolved

- **Operator ratified:** nav slice first, 2b in parallel ("any parallel possibilities please do").
- **Sheet ≠ Drawer extension:** the bottom-sheet drawer's swipe/centering semantics don't transfer;
  a sibling side-panel primitive (same Base UI Dialog idiom) is the clean seam.
- **Desktop inline nav retained** alongside the all-widths hamburger — removing it would have
  changed Baseline's header too (brand-neutral constraint); the slide-in is additive.
- **Guest auth buttons stacked full-width** (truncation at 280px caught in the browser walk).
- **Directory keeps one filter surface:** the inline filter bar moved INTO the left sheet
  (trigger + active-dot replaces it) — no duplicated filter UI.
- **No roles.ts change for tournaments:** `tournament_director`'s `tournaments.*` wildcard already
  matches `tournaments.manage` (documented `matchesPattern` behavior).
- **No e2e spec changes in wave 2:** all five admin specs navigate by direct `/admin/...` goto
  (alive until 2c) and never click a swept href — verified by reading each spec.

## Files touched

| File | Change |
| --- | --- |
| PR #64 (8 files, `0eb9b23`) | `components/common/sheet.tsx` (new), `components/web/nav/nav-sheet.tsx` (new), `components/web/directory/directory-filter-sheet.tsx` (new), `header.tsx`, `directory-listing.tsx`, `e2e/smoke.spec.ts`, `messages/en/{common,navigation}.json` |
| PR #65 (36 files, `742fe92`) | 16 pages + 3 layouts under `app/app/{tournaments,memberships,organizations}`, 16 `_components` href sweeps, `components/app/sidebar.tsx` |
| Close docs | `docs/sprints/SESSION_0366.md`, `docs/knowledge/wiki/index.md` (session row), `docs/knowledge/wiki/custom-component-inventory.md` (Sheet/NavSheet/DirectoryFilterSheet rows) |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | EXIT 0 (nav branch, agent worktree ×4, and merged `main`) |
| `bun run lint:check` / `format:check` | EXIT 0 / clean (both lanes) |
| `bun test server/orpc/` (agent worktree) | 36 pass / 0 fail |
| PR #64 CI | 9/9 green incl. Playwright ×3 (new slide-in smoke) + CodeRabbit |
| PR #65 CI | all green incl. Playwright ×3 (old `/admin` routes proven intact) |
| Browser proof bbl.local | right sheet guest + authed walks (screenshots delivered), left filter sheet on `/directory`, Escape close both |
| Anon smoke merged `main` | `/app/{tournaments,memberships,organizations,lineage}` → 307 `/auth/login` |
| PR #65 diff audit | 0 modified import lines; href sweeps only in link-position string literals |

## Open decisions / blockers

- **2b wave 3+**: remaining ~30 admin areas + 6 member `(web)/dashboard` pages (wave transform
  proven twice now); then **2c** (blanket 308, delete old shells, `server/<entity>` flatten).
- Cutover-arm remainder: landing/email-capture polish, L8 essentials (OG + sitemap), 301 map,
  prod render verify. DKIM done (`76f35f0`).
- Standing: Better-Auth plugins (local), Resend-test-bounce chip, stripe@22 rehearsal.
- Doug note: per-role gate behavior (tournament_director sees only tournaments + user items) not
  yet browser-proven with a real non-admin user — prove during a 2b wave or 2c.

## Next session

### Goal

Phase 2b wave 3: continue moving remaining admin areas + member dashboard pages under `/app`
with the proven wave transform (per-line href edits, no sed; area layout gates from
`APP_AREA_PERMISSIONS`), keeping old routes intact until 2c.

### First task

Pick the next wave (suggest: leads + invites + entitlements + memberships-adjacent billing areas,
or the member `(web)/dashboard` pages) and apply the transform; gates + anon smoke per wave;
browser-prove the tournament_director scoped sidebar if a test user can be seeded. Unblocked.

## Review log

### SESSION_0366_REVIEW_01 — Nav slice (PR #64)

- **Reviewed tasks:** TASK_03
- **Dirstarter docs check:** not applicable (no L1 area extended; Sheet mirrors the in-repo
  drawer idiom, Base UI Dialog per SESSION_0217 migration)
- **Verdict:** Primitive is line-faithful to the drawer idiom incl. reduced-motion; NavSheet
  matches the SESSION_0361 measured spec semantics (right = account + primary nav) while staying
  brand-neutral; one visual defect (button truncation) caught and fixed during the proof walk,
  which is exactly what the walk is for. First Filters click was eaten by a dev-server Fast
  Refresh rebuild — diagnosed via console log, not code churn.
- **Score:** 9/10
- **Follow-up:** authed left-rail desktop nav (legacy `DesktopNav` third pattern) deliberately
  deferred; revisit post-launch.

### SESSION_0366_REVIEW_02 — 2b wave 2 (PR #65, sub-agent)

- **Reviewed tasks:** TASK_04
- **Dirstarter docs check:** cached capture sufficient (upstream pin `76c8e1e` re-verified
  SESSION_0365, same day).
- **Verdict:** Agent followed the wave-1 recipe with four documented, correct deviations (wildcard
  grant already covers tournaments; e2e specs verified-not-assumed unaffected; sidebar.tsx is the
  real entry point; worktree env bootstrap). Diff audit confirms the 0365 sed-failure class is
  absent (0 modified import lines). Encoding the 0365 Reflections directly into the agent prompt
  paid off.
- **Score:** 9/10
- **Follow-up:** none beyond the staged waves.

## Hostile close review

- **Giddy:** pass — both PRs additive; old `/admin`/`/dashboard` untouched; gates added never
  loosened; no schema/payload changes; evidence chain complete (CI + walks + diff audit).
- **Doug:** pass — CI Playwright ×3 on both PRs; guest + authed browser walks; anon 307 smoke on
  merged main. Residual gap recorded in Open decisions (non-admin role walk).
- **Desi:** pass — right sheet matches measured spec intent; truncation defect fixed; left panel
  reuses existing filter components (no new filter semantics); brand-neutral copy via i18n keys.
- **Kaizen aggregate:** 9/10 — two launch-gating lanes closed in one session with clean parallel
  execution; deduction for the mid-walk Fast-Refresh false negative costing a retry loop.

## ADR / ubiquitous-language check

- ADR update not required — implements SOT-ADR D5 (2b wave) and D8 (nav lane) as specified; the
  `Sheet` primitive is a reversible component addition below the ADR bar (recorded in the
  component inventory). SOT-ADR D1–D8 confirmed current law; no contradictions found in live code.
- Ubiquitous language update not required.

## Reflections

- **Encode past Reflections into agent prompts.** The 0365 greedy-sed lesson was pasted verbatim
  into the wave-2 agent's instructions ("per-line edits, never sed, typecheck after each batch") —
  the agent shipped 16 swept files with zero modified import lines on the first try. A reflection
  that stays in a session doc helps the next reader; one that rides the task prompt helps the
  next *executor*.
- **Browser-proof clicks during dev-server compile windows produce false negatives.** The first
  Filters click "failed" because Fast Refresh remounted the tree mid-open. The console log
  (rebuild timestamps bracketing the click) diagnosed it without touching code. Settle compiles —
  or read the console — before concluding a component is broken.
- **The audit-first kickoff earned its cost.** Three of the goal text's "current-state clues" were
  already false (`/api/rpc`, `/app` shell, SESSION_0360-as-latest). Citing files instead of
  asserting statuses turned a potential rebuild-what-exists session into two merged launch lanes.
- **Parallel worktree agents work when file sets are verified disjoint first.** Nav
  (`components/web`) and wave 2 (`app/app` + `components/app`) merged back-to-back with zero
  conflicts; the pre-spawn disjointness check is what made "any parallel possibilities" safe.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Session doc frontmatter current (`status: closed`, `last_agent: claude-session-0366`). |
| Backlinks/index sweep | `wiki/index.md` SESSION_0366 row added at close. |
| Wiki lint | Result in close chat. |
| Kaizen reflection | 4 entries above. |
| Hostile close review | REVIEW_01 + REVIEW_02; Giddy/Doug/Desi pass, 9/10. |
| Review & Recommend | Next session = 2b wave 3, first task staged, unblocked. |
| Memory sweep | `bbl-sot-spec-program.md` progress updated (nav lane closed; 2b wave 2 done). |
| Next session unblock check | Unblocked (wave transform proven twice; no open decisions). |
| Git hygiene | PRs #64 `0eb9b23` + #65 `742fe92` squash-merged; close docs commit on main at bow-out. |
| Graphify update | Before close commit — stats in close chat. |
