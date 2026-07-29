---
title: "SESSION 0717 — BBL side of the RDD→BBL down-sync (claim-loop P0 + prod-build e2e + P2 CI manifest)"
slug: session-0717
type: session--implement
status: closed
created: 2026-07-28
updated: 2026-07-29
last_agent: claude-session-0717
sprint: S13
lane: bbl
recipe: "seq-lane-build"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0716.md
  - docs/sprints/SESSION_0718.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0717 — BBL down-sync (claim-loop P0 · prod-build e2e P1 · CI manifest P2)

> **Scope note.** Staged as an FS-0046 (`scripts/` typecheck gate) stub, but the operator
> redirected at bow-in to the **BBL side of the RDD→BBL down-sync**, authored on rdd-monorepo
> SESSION_0718 as `docs/sprints/plans/petey-plan-0718-bbl-downsync.md`. FS-0046 was **not**
> worked this session (its `scripts/` gate is subsumed by the P2 CI manifest thread and stays open).

## Goal

Execute the BBL side of the down-sync per the umbrella baton (`petey-plan-0718-bbl-downsync.md`),
reconcile-apply (never clobber bbl-only commits), gate green, PR-only main, hold every push:
**P0** live-prod claim-loop fix · **P1** prod-build e2e flake fix · **P2** the 0717 CI/governance manifest.

## Goal verdict

**EXTENDED → YES.** The core down-sync landed and P0 is **verified live on prod**. Scope grew well
beyond the baton: a full Doug review of the e2e/CI harness (items 1–4), two prod-only bugs the new
harness caught + fixed, and the discovery that Playwright isn't a required check on `main` (the
systemic hole behind "nothing flagged it sooner"). Two items deferred by design (belt-journey enable,
required-check fix) — staged as SESSION_0718.

## What landed

| Pri | Lane | PR | State |
| --- | --- | --- | --- |
| **P0** | claim-loop `force-dynamic` (org/school `[slug]`) | [#351](https://github.com/Ronin-Dojo-Design/black-belt-legacy/pull/351) | ✅ merged `ae6798c7` · deployed · **verified live** (real org/school pages 200 + claim teaser, no 500) |
| **P1** | prod-build e2e + `EMAIL_E2E_TRANSPORT=noop` | [#352](https://github.com/Ronin-Dojo-Design/black-belt-legacy/pull/352) | ✅ merged — CI caught 2 prod-only bugs, fixed (`5a5f0f20`), green |
| **P2·6** | `vercel.json` `diff-tree` fail-toward-build | [#353](https://github.com/Ronin-Dojo-Design/black-belt-legacy/pull/353) | ✅ merged |
| **P2·5+7** | admin e2e → `/app` retarget + domain-dir redistribution | [#354](https://github.com/Ronin-Dojo-Design/black-belt-legacy/pull/354) | 🔄 merge-on-green (prod-build revalidation) |
| **P2·2+3+4** | e2e-DB determinism (drop+rebuild · BJJ base-ref seed · reference contract) | [#355](https://github.com/Ronin-Dojo-Design/black-belt-legacy/pull/355) | 🔄 merge-on-green (prod-build revalidation) |
| **P2·1** | chromium 4-shard + `changes` gate | — | ⛔ **SKIPPED** (Doug: no correctness gain; BBL ~28min vs 45 gate; `changes` gate solves a required-check deadlock BBL doesn't have yet) |

Reconcile discipline held: RDD reached only via the published/gh path or SHA-fetch (ADR 0059 — never
the sibling working tree); every item verified against BBL's actual state (P0 hand-applied to matching
files; P1 ported into BBL's single-job `playwright.yml`; item 6 kept BBL's fork-aware comment; items
5/7 corrected after the operator flagged BBL had *already* done admin→app first).

## Review log

- **Doug** — read-only review of the e2e/CI harness through items 1–4: **item 1 SKIP** (evidence-cited),
  **items 2/3/4 ADOPT** (real determinism/coverage gaps), plus a dead-code list + the required-check finding.
- **Cody** — built items 2/3/4; gates green (typecheck 0 · oxlint 0 · oxfmt clean · unit 1923 pass);
  **correctly escalated** the belt-journey enable (blocked by Passport schema drift) rather than ship red.
- **P1 CI as adversary** — the prod-build harness caught 2 prod-only issues the dev server hid
  (orphan ranks-m-card render; org-claim responsive-dup selector); both fixed, re-green.
- **Composite: ~9.2 / 10.** Correctness high (P0 live-verified; every diff gated; no broken work shipped —
  Cody escalated, P1 caught + fixed before merge). Cap-clean. Deductions: one reconcile miss (ranks-m-card
  left active, caught by CI not by me) and belt-journey deferred rather than delivered.

## Findings (finding router — recorded here; shared ledgers frozen this session, apply in a merge sweep)

- **Drift-register (D):** BBL `Passport` model dropped `brand` **and** `directorySlug` post-fork
  (`directorySlug` → `DirectoryProfile` relation), but `apps/web/e2e/helpers/seed-belt-journey-db.ts`
  still passes both → `Unknown argument 'brand'`. Dormant behind `describe.skip`; blocks the belt-journey enable.
- **FS (SOP miss):** "reconcile-apply" down-sync scoping must verify the *fixture's own schema-validity*,
  not just the named getters — item-2 scope assumed the seed getter was the only blocker; the fixture
  writer was separately drift-broken.
- **WL / FS (release-readiness hole):** Playwright is **not** a required status check on `main`
  (ruleset `main-pr-only` = `pull_request`+`non_fast_forward`+`deletion` only). A PR can squash-merge red
  or mid-CI — the root reason the claim-loop 500 could ship. → SESSION_0718 lane 1.
- **Self (reconcile miss):** P1 first left `ranks-m-card` active on the "already-ƒ-dynamic" argument; it
  fails under prod build for a *different* reason (orphan m-card doesn't render). Quarantined. Verify-before-asserting.
- **Dead code (Doug, deferred):** 8 cold-compile paper-overs (P1 makes obsolete — strip after N green runs)
  + orphan `seed-lineage-comp-fixture` pair (~19KB, zero importers, delete now). → SESSION_0718 lane 3.

## Artifacts

State-of-Dojo: live + zero-token at **`/app/state`** (`StatePanel` self-fetches `main`). No frozen snapshot published (operator: no).

## Next session

See `docs/sprints/SESSION_0718.md` (staged) — three coherent follow-ups the operator elected:
required-check fix (lane 1) · belt-journey enable (lane 2) · paper-over + dead-code cleanup (lane 3).
