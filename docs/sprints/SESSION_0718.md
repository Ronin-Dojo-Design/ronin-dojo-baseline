---
title: "SESSION 0718 — required-check gate + belt-journey enable + e2e paper-over/dead-code cleanup"
slug: session-0718
type: session--open
status: in-progress
created: 2026-07-29
updated: 2026-07-29
last_agent: claude-session-0718
sprint: S13
lane: bbl
recipe: "seq-lane-build"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0717.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0718 — required-check gate + belt-journey enable + e2e cleanup

> **Staged by SESSION_0717** (operator elected all three at bow-out). Adopt: flip `status:` → `in-progress`.
> Three disjoint lanes — assess for fan-out (`epic-plan`) vs sequential; lanes 1 and 3 both touch CI/e2e.

## Bow-in

- **Real state (git fetch + ff):** main synced (was behind 6); all SESSION_0717 down-sync PRs
  merged (#351–#355; #354/#355 merged `2026-07-29T11:50Z`). **No open PRs** — clean merge field.
- **Canonical:** free → claimed for 0718. **githooks doctor:** all checks passed (0 warnings) —
  push guards + `main-pr-only` ruleset live.
- **Prev session (0717) goal verdict:** **EXTENDED → YES** — down-sync landed, P0 claim-loop fix
  verified live on prod. Lanes 2 & 3 here are its by-design deferrals.
- **Live-lane coordination:** only `session-0641-*` (sole merge owner) + `session-0681-gold-standby`
  branches exist; no open PRs, no file overlap with the 3 lanes below. Not 0641's files; won't merge.
- **FS-0048 read-before-build sweep (Lane 1, first + highest-value):**
  - `ci.yml` + `playwright.yml` both `paths-ignore: docs/** **.md .claude/** .github/prompts/** scripts/**`
    → a docs-only PR skips **both** → a naive required check would deadlock docs PRs (confirms the
    passes-on-skip "CI gate" job must land *before* the ruleset flip).
  - Live ruleset `main-pr-only` (id `19644183`, active) = `pull_request` + `non_fast_forward` +
    `deletion` only — **zero required status checks** today. Flipping it = the one operator-gated step.
  - Lanes 2 & 3 sweeps deferred to their build (Passport model + belt-journey fixture for L2;
    orphan seed-fixtures + paper-over timeouts for L3).

## Goal

Close the three follow-ups the BBL down-sync (SESSION_0717) surfaced but deferred.

**Elected (operator, bow-in):** all 3 lanes, sequential L1→L2→L3. SotD snapshot: **no** — cite live
`/app/state` (zero-token default). Ruleset flip (Lane 1 step 2) held for explicit operator ok.

## Lanes

### Lane 1 — required-check gate (the release-readiness fix — highest value)

Playwright is **not** a required status check on `main` (ruleset `main-pr-only` = `pull_request` +
`non_fast_forward` + `deletion` only), so a PR can squash-merge **red or mid-CI** — the root reason the
claim-loop 500 shipped. Making checks required is **not** a one-line ruleset toggle: both `ci.yml` and
`playwright.yml` `paths-ignore` on docs-only PRs, so a naive required check **deadlocks** the many
docs/SESSION PRs (a required check that never runs blocks forever).

1. Add an **always-reports "CI gate" job** (runs on every PR, passes-on-skip) — this is the umbrella's
   `changes`-machinery (P2 item 1), which was correctly skipped in 0717 *until* a required check justifies it.
2. Then flip the ruleset to require the gate + `Typecheck (tsc)` + `Unit tests (bun test)` + `Oxc (lint + format)`
   + Playwright. Governance change — **hold for operator confirm** before mutating the ruleset (blast radius = all merges).
3. Verify a docs-only PR still merges (gate passes-on-skip) and a red-e2e PR is blocked.

### Lane 2 — belt-journey enable (blocked in 0717 by Passport schema drift)

`apps/web/e2e/helpers/seed-belt-journey-db.ts` passes `Passport.brand` + `Passport.directorySlug`, both
removed from BBL's `Passport` model post-fork (`directorySlug` → `DirectoryProfile` relation) → `Unknown
argument 'brand'`. The BJJ base-reference *data* is now seeded (SESSION_0717 item 2), so only the fixture
is broken. Reconcile the fixture to the drifted schema (drop `brand`; `directorySlug` → `DirectoryProfile.create`),
browser-smoke the spec's 4 UI assertions against current BBL UI, then remove the `describe.skip` at
`apps/web/e2e/belt-journey.spec.ts:35` so the core belt-lifecycle spec runs in CI.

### Lane 3 — e2e paper-over + dead-code cleanup (P1 now green unlocks it)

Per Doug's SESSION_0717 review:
- **Delete now (P1-independent):** orphan `seed-lineage-comp-fixture` + `-db` pair (~19KB, zero importers);
  fix `register.spec.ts` silent conditional-skip; decide the `editor-drag-reorder` fixmes (fix or unit-cover + delete).
- **Strip after N green prod-build runs** (prove-before-deleting): the 8 cold-compile paper-overs P1 supersedes —
  the TFF-008 warm pre-hit, 20s→40s redirect bump, `test.slow()`/oversized timeouts in
  `authenticated-lifecycle` / `users-account-actions` / `admin-collection-conformance` / `bracket` / `scoring` /
  `public-rank-redaction`. Re-measure `registration.spec.ts`'s 45s (partly cold-mutation, not pure JIT) before touching.

### SESSION_0718_TASK_02 — Lane 2 belt-journey (drift-fix done; CI-enable BLOCKED by smoke — stop + report)

**File:** `apps/web/e2e/helpers/seed-belt-journey-db.ts`. **Not committed** (held).

**Drift-fix (done + DB-verified):** dropped `brand: TEST_BRAND` + `directorySlug` from the fixture's
`passport.create` (both removed from BBL's `Passport` post-fork) and the now-dead `TEST_BRAND` const.
Both were write-only (never read by the spec, fixture output, or `/app/profile` belts read-path), so
dropped rather than relocated to `DirectoryProfile` — the belt spec needs no directory listing.
Verified: reconciled seed runs clean end-to-end (no `Unknown argument`; 0717 BJJ base-ref ranks
resolve; fixture created + cleaned up).

**Not a migration.** Schema already dropped the columns in a prior session; this is a fixture-code
reconcile, zero schema/DB change → "no data loss" is trivial. (Bow-in args said "migration" — the
stub itself says "only the fixture is broken.")

**Smoke — RESOLVED to 4/4 GREEN on a clean DB** (operator: CI-enable, smoke-green first). Ran
against a LOCAL PROD BUILD (`next build` + `next start` — CI-faithful; the Turbopack `dev:e2e`
`adapterFn is not a function` was a dev/crash artifact — the prod build compiled + served clean).

**Root cause = the operator's hunch: ADR 0058 RankEntry read-collapse.** `belt-tab-loader.ts:117`
reads `db.rankEntry.findMany` and joins each entry's `RankAward` (via the 1:1 `rankAwardId @unique`
anchor) for authority/fact-lock. The SESSION_0482 fixture predates the collapse and seeded RankAward
ONLY — so the Blue authority award rendered as an unowned ladder rung (no `AUTHORITY_*` → no
locked-hint). Three fixes landed the 4/4:
1. **Passport drift** — drop `brand`/`directorySlug`/dead `TEST_BRAND` (write-only, unread).
2. **RankEntry seed** — one VERIFIED `RankEntry` per graded award (White + Blue), so the loader reads
   them as OWNED cards with authority provenance. This is the ADR-0058 reconcile the fixture needed.
3. **Spec selector** — the empty-school fill affordance is a `role="combobox"` whose placeholder is
   its VALUE, not its accessible name (a name-based `getByRole` never matched). Retargeted by visible
   text (`getByRole("combobox").filter({ hasText })`).
Plus **retry-safe cleanup** — `afterAll` now deletes only the specific fixture (was a shared-prefix
sweep that race-deleted a retry's re-seeded passport → the `RankAward_passportId_fkey` flake).

Diagnostic dead-ends ruled out (all disproven, NOT the cause): the `adapterFn` dev error; a "duplicate
Purple card" that was purely stale-data from ~6 iterative runs (in isolation + on a fresh drop+rebuilt
DB the grid renders exactly 5 distinct cards). **Gates:** typecheck ✓ · oxlint ✓ (no new warnings) ·
format ✓ · e2e 4/4 ✓.

**Not committed / CI-enable pending decision.** Files: `e2e/helpers/seed-belt-journey-db.ts`,
`e2e/belt-journey.spec.ts`. The last step — set `RUN_BELT_E2E=1` in `playwright.yml` so it runs in CI
— touches the SAME workflow file Lane 1 (#357) restructured and is currently held; needs a
branching/ordering call (fixes must be on `main` before the spec is required). Push held.

## Also apply in a merge sweep (SESSION_0717 findings — shared ledgers were frozen)

- **Drift-register (D):** Passport dropped `brand`+`directorySlug`; stale `seed-belt-journey-db.ts`.
- **FS:** down-sync "reconcile-apply" scoping must verify the *fixture's* schema-validity, not just named getters.
- **FS-0046** stays open (not worked in 0717).

## Task log

### SESSION_0718_TASK_01 — Lane 1 required-check gate (built, locally verified, HOLD push + ruleset flip)

**Branch:** `session-0718-required-check-gate`. **Files:** `.github/workflows/ci.yml`,
`.github/workflows/playwright.yml`.

**What:** removed the workflow-level `paths-ignore` from both workflows and moved the docs/tooling
skip into a cheap always-run `changes` job (git-diff bash, fail-safe `run=true` on any ambiguity —
NOT dorny/paths-filter). Heavy jobs gate on `needs.changes.outputs.run`. Added two stable
always-report gate jobs — **`CI complete`** (needs oxc/typecheck/unit) and **`Playwright complete`**
(needs the test matrix) — each `if: always()`, red iff a real job `failure`, green on `skipped`
(docs-only) or `success`. These are the two contexts to require in the ruleset.

**Conformance:** matches the rdd-monorepo umbrella (upstream-of-record, SESSION_0716 A2) verbatim on
machinery + gate names. **Deliberate BBL divergences (ratified):** (1) ignore-set is BBL's own — the
ADR 0055 fork dropped the umbrella's `clients/**` + `apps/{baseline,rdd}` paths; (2) chromium
sharding NOT ported (Doug, SESSION_0717: BBL ~28min < 45min gate, no correctness gain).

**Considered + rejected:** clean-room `dorny/paths-filter@v3` (declarative, API-robust, no
full-history fetch) — lost on fail-safe (no explicit fail-toward-run), a new 3rd-party supply-chain
dep in a perms-hardened repo, and perpetual 5-repo sync divergence from upstream.

**Verified (local):** YAML valid (js-yaml) · job graph correct · 10/10 `changes`-detection cases
pass incl. mixed docs+code → run=true (never falsely skips) · gate logic fails-closed by inspection.
**Live proof pending push:** the PR (a `.github/workflows` change → run=true) runs the full gates, so
the two gate checks report green on a real code PR.

**Pushed + LIVE-VERIFIED (operator go):** PR [#357](https://github.com/Ronin-Dojo-Design/black-belt-legacy/pull/357)
— **all checks green**, incl. both new gates: `CI complete` pass · `Playwright complete` pass ·
Detect ✓ (both workflows) · Oxc/Typecheck/Unit ✓ · Playwright chromium 26m / firefox 9m / webkit 11m ✓.
The live fails-closed proof is complete: on a real code PR (workflow change → run=true → full gates ran)
both required gates registered + went green — no deadlock, machinery works end-to-end.

**Still HELD (operator-gated), in this order:**
1. **Merge #357** — I do not merge (SESSION_0641 = sole merge owner); held for operator/merge-owner.
2. **Ruleset flip** — require `CI complete` + `Playwright complete` on `main-pr-only` (#19644183).
   **Must sequence AFTER #357 merges**: for `pull_request`, GitHub runs the workflow from the PR
   branch, so any PR branched from pre-#357 main lacks the gate jobs → those required checks never
   report → deadlock. Flip only once the gate jobs are on `main`. Separate explicit ok.

## Next session

### Goal

### First task
