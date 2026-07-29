---
title: "SESSION 0718 — required-check gate + belt-journey enable + e2e paper-over/dead-code cleanup"
slug: session-0718
type: session--staged
status: staged
created: 2026-07-29
updated: 2026-07-29
last_agent: claude-session-0717
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

## Goal

Close the three follow-ups the BBL down-sync (SESSION_0717) surfaced but deferred.

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

## Also apply in a merge sweep (SESSION_0717 findings — shared ledgers were frozen)

- **Drift-register (D):** Passport dropped `brand`+`directorySlug`; stale `seed-belt-journey-db.ts`.
- **FS:** down-sync "reconcile-apply" scoping must verify the *fixture's* schema-validity, not just named getters.
- **FS-0046** stays open (not worked in 0717).

## Next session

### Goal

### First task
