---
title: "SESSION 0501 — ADR 0002 native-API reconciliation grill + queued chips (vercel ignoreCommand, FI-021, PWA)"
slug: session-0501
type: session--open
status: closed
created: 2026-07-05
updated: 2026-07-05
last_agent: claude-session-0501
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0500.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0501 — ADR 0002 native-API reconciliation grill + queued chips

## Date

2026-07-05

## Operator

Brian + claude-session-0501

## Goal

Resolve the native-API contract fork surfaced by SESSION_0500's `native-api-contract-research-review.md`:
grill Option C (hybrid: oRPC internal + generated `/api/v1` OpenAPI facade) vs Options A/B against ADR 0002
+ ADR 0009 with the operator, then produce a drafted ADR 0002 reconciliation/amendment for ratification.
**No native-API code until ratified.** On operator go, then sequence the cheap independent chips
(vercel.json `ignoreCommand` fix first, then FI-021 mobile-admin entry, then PWA layer).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0500.md`
- Carryover: 0500 shipped G-004 N1+N2, WL-P2-22 (LineageTreeBoard CRAP −80%), and Epic B mobile shell
  (bottom nav + admin MAB), and produced the `native-api-contract-research-review.md` that this session
  reconciles. FI-001 (Truelson real send) gate is cleared — only the operator's "send Brian" remains.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app` (own `session-0501-native-api` worktree to be created
  only if/when a code chip is greenlit)
- Status at bow-in: clean except two untracked prod screenshots (`prod-live-dirty-dozen.jpeg`,
  `tony-hua-lineage-timeline-prod.jpeg`) — pre-existing, not mine; leave/ignore.
- Current HEAD at bow-in: `37063be0`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None (docs/decision reconciliation; chips are net-new chrome + CI config) |
| Extension or replacement | Extension — reconciles a stale ADR to match the ratified oRPC direction (ADR 0024/SOT-ADR D3) |
| Why justified | ADR 0002's `api/v1` premise is dead (never built); the decision record must not lie to future sessions |
| Risk if bypassed | Next native lane re-derives the whole fork or builds a duplicate REST surface (YAGNI trap) |

Live docs checked during planning: not applicable (decision reconciliation, not an L1 build).

### Grill outcome

<!-- Filled once the operator ratifies the native-API fork. -->

Pending operator ratification — see `## Petey plan → Open decisions`.

## Petey plan

### Goal

Reconcile ADR 0002 to the ratified oRPC reality and queue the cheap chips in risk-ascending order.

### Tasks

#### SESSION_0501_TASK_01 — Grill the native-API fork + draft the ADR 0002 amendment

- **Agent:** Petey (grill) → docs amendment inline
- **What:** Present Option C hybrid vs A/B; resolve the §8 forks (timing / 3rd-party ambition / coverage);
  draft an ADR 0002 amendment recording that `api/v1` was never built and the native contract is the
  hybrid seam already modeled in `context.ts`, with ADR 0009 (Better-Auth SDK) confirmed still standing.
- **Steps:** (1) lay out the fork + tradeoffs; (2) get operator ratification on the 3 forks; (3) draft the
  amendment block appended to ADR 0002 (+ fix stale pointers in `packages/api-client/README.md` and ADR 0009
  sketch to "planned, see this review"); (4) operator ratifies before any file write lands.
- **Done means:** ADR 0002 carries a ratified reconciliation amendment; stale pointers corrected.
- **Depends on:** operator ratification.

#### SESSION_0501_TASK_02 — vercel.json `ignoreCommand` verification + fix

- **Agent:** Cody (build) → Doug (verify)
- **What:** Verify the `ignoreCommand` in BOTH directions (docs-only push → no deploy; app-code push → deploy)
  and fix if it mis-fires. Known suspect: the `packages` path filter is directory-level, so a docs-only edit
  to `packages/*/README.md` wrongly triggers a BBL rebuild.
- **Done means:** documented proof of both directions; ignoreCommand corrected if it over/under-triggers.
- **Depends on:** operator go (cheap, low-risk — recommended first).

#### SESSION_0501_TASK_03 — Admin nav redesign (FI-021 + "sidebar is a hot mess") — flatten + beta deck

- **Agent:** Cody (dispatched sub-agent)
- **What:** Operator reshaped FI-021 mid-session: the flat 36-item admin sidebar is unreadable (icon
  duplication IdCard ×6 / Layers ×4 / ClipboardList ×4 / ShieldCheck ×3, no grouping). ONE shared
  `admin-sections` config (7 groups, distinct icon per item) drives (a) new `/app/sections` grouped
  index (the FI-021 mobile entry), (b) a regrouped desktop sidebar, (c) NavSheet admin "Sections"
  link, (d) WL-P3-29 dead `BblMemberRail isMobile` prune, and (e) the expressive **Command Deck**
  variant at `/app/beta/command-deck` (operator: "show me your flatten then show me the opposite in
  the beta" — swipeable group pills + tinted bento tiles + live counts).
- **Done means:** both variants live off one config; gates green; mobile admins can reach every section.
- **Depends on:** ratified (operator GO given).

#### SESSION_0501_TASK_04 — PWA layer (installable / minimal offline)

- **Agent:** Cody (dispatched sub-agent, parallel — disjoint files)
- **What:** Hand-rolled installable PWA, no new deps: `app/manifest.ts`, versioned `public/sw.js`
  (network-first HTML + offline fallback, static-asset SWR, `/api` + `/app` excluded), static
  `offline.html`, prod-only SW registration in root layout, Apple web-app metadata.
- **Done means:** build emits manifest route; installable shell; deploy-safe caching.
- **Depends on:** ratified (operator GO given).

#### SESSION_0501_TASK_05 — De-stale SOPs (operator ask)

- **Agent:** Cody (dispatched sub-agent) — **landed** (`31fece56`)
- **What:** Verified every claim in `sop-data-and-wiring-flows.md` + `sop-e2e-user-lifecycle.md`
  against live source; fixed single-brand collapse, `/admin`→`/app` route moves, MDX→DB blog flow,
  invite redirect `/organizations/{slug}/welcome`→`/me`, broken `pairs_with` paths.
  `lineage-data-wiring-flow.md` verified current — untouched.
- **Done means:** done — evidence tables in agent report; memory drift flagged
  (`reconcilePendingLineageClaims` is the live reconciler, memory says `claimNodeForUser`).

### Parallelism

TASK_01 is plan-first and blocks nothing else. The three chips are independent; sequence by ascending
risk/effort (02 → 03 → 04), each in its own `session-0501-*` worktree if greenlit. Do not fan out until
the operator picks which chips run this session.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0501_TASK_01 | Petey | open decision — grill + draft amendment, no build |
| SESSION_0501_TASK_02 | Cody→Doug | small CI-config change needing both-directions verification |
| SESSION_0501_TASK_03 | Cody | scoped mobile chrome build |
| SESSION_0501_TASK_04 | Cody | net-new PWA layer |

### Open decisions

- **Native-API contract (blocking TASK_01):** ratify Option C hybrid (recommended) vs A (scoped bridge)
  vs B (dedicated REST). Resolve via the 3 §8 forks: native timing, 3rd-party ambition, coverage breadth.
- **Chip selection:** which of TASK_02/03/04 run this session, and in what order (recommend 02 first).
- **FI-001 (out of scope unless operator says go):** Truelson real send — surface only.

### Risks

- Ratifying C without the `packages/shared` extraction prereq leaves schemas trapped in `apps/web` — note
  it as the "do regardless" first slice, don't big-bang.
- Concurrency: Epic A (0496/0497), Epic C (0494), feed (0493), fix+QA (0492) may be live in their worktrees —
  do NOT touch them; shared index docs are append-only, rebase-on-reject.

### Scope guard

- No Expo scaffolding, no `apps/mobile/`, no `api/v1` surface built this session (YAGNI — keep the seam).
- No FI-001 real send without explicit operator "send Brian now."
- `../ronin-dojo-monorepo` is READ-ONLY.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0501_TASK_01 | landed | ADR 0002 reconciled to Option C hybrid (deferred), operator-ratified — `dc468df0` |
| SESSION_0501_TASK_02 | landed | ignoreCommand md/mdx exclude; both directions verified on real commits — `da5e6878` |
| SESSION_0501_TASK_03 | landed | Admin nav: ONE config → regrouped sidebar + `/app/sections` + beta Command Deck — `579253b8` |
| SESSION_0501_TASK_04 | landed | PWA installable shell (manifest + deploy-safe SW + offline) — `4d68d648` |
| SESSION_0501_TASK_05 | landed | SOPs de-staled against live source — `31fece56` |
| SESSION_0501_TASK_06 | landed | Profile polish per Desi P0/P1 (passport re-home, MAB clamp, scene pin) — `fa9a3aa3` |
| SESSION_0501_TASK_07 | landed | Belt-facts hybrid CRUD (member fill-blanks + audited admin path, GAINER-tests-first) — `b110cefc` + polish `b5e52ea8` |
| SESSION_0501_TASK_08 | in-progress | Doug full-bundle verification (8 commits) — dispatched |

### Additional grill outcomes (operator, mid-session)

- **Belt-facts policy (B1 amendment):** hybrid — admin CRUD on any award + member fill-EMPTY-blanks on
  own awards (never overwrite authority values); DISPUTED stays locked for members. Admin UI mount
  deliberately deferred (fork open: `/app/users/[id]` belts tab vs directory admin affordance).
- **Passport-card DRY fork (Desi):** keep the full credential card; re-home as a labeled "Share your
  passport" Section — do NOT collapse into the timeline row.
- **Nesting principle (operator):** routes/pages for depth; sheets/drawers only for shallow single-level
  actions — flatten shipped as default, the "opposite" (nested/expressive Command Deck) lives in beta.

### Follow-ups queued (chips)

- BBL PWA icons 192/512 + maskable (manifest points at placeholder assets) — chip `task_8f36f0c6`.
- `/me` passport re-home (same slam-in pattern as directory, fix mirrored) — chip `task_5e5d3946`.
- Admin belt-edit UI mount (oRPC path live + tested; surface fork awaits operator).
- In-app belt correction-request flow (mailto affordance shipped as v1).
- Memory drift: live auth reconciler is `reconcilePendingLineageClaims`, memory says `claimNodeForUser` — fix at memory sweep.
- Mammoth `vercel.json` uses whole-repo `ignoreCommand` (`git diff --quiet HEAD^ HEAD -- .`) — separate product lane, review there.

### Grill outcomes (operator-ratified this session)

- **Native-API contract:** Option C hybrid, deferred (recorded in ADR 0002 amendment).
- **Chips:** all three greenlit; vercel fix first (landed), then admin-nav + PWA in parallel.
- **FI-021 shape:** dedicated `/app/sections` grouped index; **both** surfaces (mobile index + desktop
  sidebar regroup) off one config; **Command Deck** (nested/expressive) as the beta counterpart.

## What landed (pushed `37063be0..80803228`, one deploy)

- **ADR 0002 reconciliation (`dc468df0`)** — native-API contract ratified as Option C hybrid (oRPC internal
  + generated `/api/v1` OpenAPI facade WHEN native ships; seam kept, surface deferred). ADR 0009 confirmed;
  stale pointers fixed (api-client README, research review → ratified).
- **vercel `ignoreCommand` md-exclude (`da5e6878`)** — docs edits under `packages/`/`apps/web` no longer
  trigger prod deploys; verified both directions on real commits (4/4 matrix, reproduced by Doug).
- **SOPs de-staled (`31fece56`)** — `sop-data-and-wiring-flows` + `sop-e2e-user-lifecycle` corrected against
  live source (single-brand collapse, `/admin`→`/app`, MDX→DB blog, invite redirect); lineage SOP verified current.
- **PWA shell (`4d68d648`)** — manifest + deploy-safe SW (HTML never cached; `/api`+`/app` bypassed;
  prod-only registration) + zero-JS offline page. Icons = placeholders (chip `task_8f36f0c6`).
- **Admin nav (`579253b8`)** — FI-021 resolved: ONE `config/admin-sections.ts` (7×36, gates verbatim,
  icon-uniqueness test) → server-filtered `/app/sections` + regrouped sidebar + admin NavSheet link + beta
  **Command Deck** (the ratified "opposite"); `BblMemberRail` `isMobile` prune (erratum: commit msg says
  WL-P3-29 — wrong ID; that row is the unrelated double-fetch item, still open).
- **Profile polish (`fa9a3aa3`)** — Desi P0/P1: passport re-homed as "Share your passport" Section (ONE
  render per viewport, lineageChain finally wired), in-card rank dupe deleted, MAB fan 204°→90° inward
  clamp + EyeOff demoted to drawer, owner scene pinned black (parity accident killed), mobile scene rings,
  stale `/admin/*` dashboard links repointed.
- **Belt-facts hybrid CRUD (`b110cefc` + `b5e52ea8` + `80803228`)** — ADR 0035 Amendment 2: member
  fill-blanks (never overwrite authority facts) + `updateRankAwardFactAsAdmin` (`belt.admin` key, tx audit).
  GAINER adversarial tests FIRST (20/9 baseline → 29/0). Single Save (fixes the white-belt save gap),
  correction mailto, dialog swatch, plain locked values. Post-Doug hardening: fill-once = conditional
  atomic write (fails closed); admin before-image tx-scoped.

## Decisions resolved

Native-API Option-C-deferred · all 3 chips greenlit (vercel→FI-021→PWA) · `/app/sections` dedicated index ·
both surfaces off one config · Command Deck in beta ("flatten + the opposite") · belt-facts hybrid + inline
mount · admin belt-edit mount = **`/app/users/[id]` belts tab (next lane)** · routes-over-nested-overlays
principle for anything deep.

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` · oxlint · oxfmt (39 changed files) | 0 errors across all |
| `bun run test` (full, serialized) | **1153 pass / 0 fail** (166 files) |
| `npx next build` | 202 pages; `/app/sections`, `/app/beta/command-deck`, `/manifest.webmanifest` emitted |
| `e2e/mobile-shell.spec.ts` (live, chromium) | **3/3** incl. new drawer-toggle MAB flow |
| ignoreCommand matrix (4 real commits) | 4/4 correct (docs skip · code deploy · pkg-README skip · code+md deploy) |
| wiki-lint | 0 errors / 37 warnings (all pre-existing) |
| Belt suites (single-file, FS-0027) | 29/0 integration · 22/0 gate · 15/0 view-model |
| Fallow delta | 0 introduced findings |

## Open decisions / blockers

- FI-001 Truelson real send — **still operator-gated**, untouched (runner's cross-off candidate was a false positive).
- Command Deck: promote or delete after the operator plays with it (time-boxed duplication rule).
- Chips pending: PWA icons (`task_8f36f0c6`) · `/me` passport re-home (`task_5e5d3946`).
- Doug P3s: locked-date localization · SW `VERSION`-bump note in deploy runbook.

## Next session

### Goal

Build the admin belt-edit mount: `/app/users/[id]` user-detail page with a belts tab mounting
`BeltEditForm` in admin mode (operator-ratified this session; the audited oRPC path is live + tested).

### First task

Scope the `/app/users/[id]` page shape (Petey grill if the detail page grows beyond belts — it's a
platform surface many admin needs will want), then Cody: parameterize `loadBeltTabData` by passportId,
mount the form with the admin gate, wire `updateRankAwardFactAsAdmin` as the save path, adversarial
authz e2e. Also surface FI-001 for the operator's word.

## Review log

### SESSION_0501_REVIEW_01 — Doug full-bundle verification

- **Reviewed tasks:** TASK_01–TASK_07 (all 8 pre-hardening commits)
- **Dirstarter docs check:** not applicable (no L1 replacement; nav extends the Nav primitive minimally)
- **Verdict:** All six gates green with runtime proof; belt authz holds under adversarial trace (one bounded
  MED TOCTOU — fixed post-verdict in `80803228`); nav gates verbatim ×36; PWA deploy-safe; deploy matrix 4/4.
- **Score:** 9.6/10 — SHIP
- **Follow-up:** P3s logged above; TOCTOU + tx before-image landed post-verdict.

## Hostile close review

- **Giddy:** pass — ADR 0002/0035 amendments conform decisions to reality (ratify-then-conform); ONE-config
  nav model + ONE persistence seam (belt) follow the one-source doctrine; no new authz system (key on `can()`).
- **Doug:** pass — 9.6 SHIP with runtime proof (see Review log); post-verdict hardening verified by 29/0 re-run.
- **Desi:** pass — her own P0/P1 fix list executed and committed (`fa9a3aa3`, `b5e52ea8`); P2 remainder logged.
- **Kaizen aggregate:** 9.5/10 — nine lanes shipped verified with zero gate failures; deductions for the
  WL-P3-29 commit-message mislabel (caught at close, ledger kept clean) and the missed 0500 index row (backfilled).

## ADR / ubiquitous-language check

- **ADR 0002 amended** (Option C hybrid, deferred — operator-ratified, this session's headline decision).
- **ADR 0035 Amendment 2 added** (belt-fact editing: member fill-blanks + audited admin CRUD).
- Ubiquitous language: **fill-once / fill-blanks** (per-fact empty-only member edit on authority awards),
  **Command Deck** (beta expressive admin index), **admin-sections config** (the ONE nav model) — recorded
  in the component inventory + ADR 0035 Amendment 2.

## Reflections

- **The operator's screenshots outperformed the backlog.** Two phone photos reshaped the session more
  productively than the queued chip list: "you can't edit belts" turned out to be a deliberate-but-wrong
  gate (the UI existed, the policy excluded the operator's own award class), and "out of nowhere the
  passport card" was three stacked design accidents (parity palette, md-only ring, unframed sidebar
  flatten). Discovery-before-build (Explore + Desi in parallel, read-only) meant the fork presented to the
  operator was "which policy," not "what's broken."
- **GAINER-tests-first proved its worth twice.** Writing the adversarial suite before widening the belt gate
  made the 9 expected failures the spec; then Doug's TOCTOU find was fixable in 10 lines because the
  policy was already encoded in tests — the conditional write just made an existing invariant atomic.
- **Fan-out with file-ownership contracts held under 3 concurrent writers.** Nav, belt, and polish Codys
  shared one worktree with explicit do-not-touch lists; the one collision risk (Desi's belt-form items)
  was sequenced behind the belt lane by design. The build-race (polish's build hit belt mid-write) resolved
  by the instructed retry — the contract worked.
- **Close-time ledger verification caught two label errors** (runner's FI-001 false positive; my own
  WL-P3-29 mislabel baked into a pushed commit message). Lesson: cross-off candidates are *candidates* —
  verify the row text, not the ID.

## Full close evidence

| Step | Proof |
| --- | --- |
| Close gate runner | `bow-out-gates.sh`: task log PASS (12 rows) · wiki-lint 0 err/37 warn · Graphify nodes=12601 edges=27466 communities=1396 · fallow delta 0 |
| JETTY/frontmatter sweep | ADR 0002/0035/0009, research review, 2 SOPs, inventory, index — all `updated: 2026-07-05` + `last_agent: claude-session-0501` |
| Backlinks/index sweep | SESSION_0501 + backfilled SESSION_0500 rows added to wiki index (FS-0019 gap filled) |
| Wiki lint | 0 errors (37 pre-existing warnings) |
| Hostile close review | SESSION_0501_REVIEW_01 (Doug 9.6) + Giddy/Desi passes above |
| Review & Recommend | Next session = `/app/users/[id]` belts tab (ratified) |
| Memory sweep | belt fill-once policy + session learnings saved; `claimNodeForUser` drift fixed (see memory files) |
| Ledger routing | FI-021 → resolved (POST_LAUNCH_SOT) · WL-P3-29/30/31 verified STILL OPEN · FI-001 false-positive rejected · Doug P3s logged here |
| Git hygiene | 9 commits pushed `80803228` (operator GO); close docs commit follows (operator word pending) |
| Graphify update | 12601 nodes / 27466 edges / 1396 communities (runner) |
