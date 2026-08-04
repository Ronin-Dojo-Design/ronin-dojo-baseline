---
title: "SESSION 0749 — L5 lane: TFF-006 billing flake — 3-run bounded repro attempt (not reproduced)"
slug: session-0749
type: session--review
status: closed
created: 2026-08-04
updated: 2026-08-04
last_agent: claude-cody-session-0749
sprint: S13
lane: repo
lane_seq:
recipe: lane
autonomy: unattended # overnight commit-only lane under SESSION_0744 fanout; Codex down, Claude Cody salvage (operator-authorized)
model: "Fable 5"
vault_session:
goal_ids: []
tickets: []
next_session:
pairs_with:

  - docs/sprints/SESSION_0744.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0749 — L5 lane: TFF-006 billing flake — 3-run bounded repro attempt (not reproduced)

**Date:** 2026-08-04 · **Operator:** Brian (unattended lane) + claude-cody-session-0749

## Goal

BOUNDED repro-or-report for TFF-006 (billing portal/checkout cluster flake in the full suite under
`--parallel=1`): up to 3 full-suite runs; reproduce → test-side isolation fix + green ×3; not
reproduced → this forensics report, SESSION file committed alone (path B). **Outcome: NOT
REPRODUCED — path B.**

## Status

Frontmatter `status:` is the single source of truth. Lane close; AM-owner review pending per the
SESSION_0744 fanout contract.

## Bow-in

- Previous session: `docs/sprints/SESSION_0744.md` — overnight fanout orchestrator; this is lane L5
  (Claude Cody salvage, commit-only, bounded exit contract in `lane-prompt.md`).
- Branch/worktree: `auto/session-0749-tff006-billing-flake` @ `/Users/brianscott/dev/ronin-0749` ·
  status: clean (only untracked `lane-prompt.md`) · worktree cut from `origin/main`.
- Parallel-lane assessment: n/a — dispatched lane.
- On-demand blocks pulled: none (test-forensics only; no code written).

## Forensics report — TFF-006 repro attempt

### Run table (all runs: `cd apps/web && bun run test` = `bun test --parallel=1 --path-ignore-patterns='e2e/**'`, local Postgres `ronindojo_prodsnap` via worktree `.env`)

| Run | Command | REAL_EXIT | Duration | Result | Billing-cluster fails | Lineage fails (L3 noise watch) |
| --- | --- | --- | --- | --- | --- | --- |
| 0 (baseline) | `bun test server/web/billing/actions.safe-action.test.ts` | 0 | 2.13s | 4 pass / 0 fail | none | n/a |
| 1 | `bun run test` | 0 | 293s | 1972 pass / 0 fail / 247 files | none | none |
| 2 | `bun run test` | 0 | 301s | 1972 pass / 0 fail / 247 files | none | none |
| 3 | `bun run test` | 0 | 302s | 1972 pass / 0 fail / 247 files | none | none |

No failure lines of any kind in any run (`grep -E "\(fail\)"` over full logs: zero matches). No
environment noise to record — zero lineage-file failures (L3's territory stayed quiet).

### Current-state corrections to the TFF-006 row (row dated 2026-06-17 — several facts now stale)

- **Suite scale:** row says 105 files / ~621 tests; suite is now **247 files / 1972 tests** (~2.4×
  growth since last observation). "1 fail / 620 pass" framing no longer describes this suite.
- **Brand:** row says all billing tests use `brand = "BASELINE_MARTIAL_ARTS"`; they now use
  `Brand.BBL` (single-brand collapse, ADR 0034). `checkout-actions.test.ts` uses
  `RONIN_DOJO_DESIGN` as its cross-brand negative fixture.
- **Stripe seam:** `createBillingPortalSession` now routes through `getStripeClient(Brand.BBL)`
  (`services/stripe.ts` — BBL split Stripe account) instead of the bare `stripe` export. The test
  files still mock `~/services/stripe` with only a `stripe` key and the wrapper still intercepts
  (baseline run 0 green, `portalSessionCreateMock` called) — with `STRIPE_SECRET_KEY_BBL` unset
  locally, `stripeBBL` is null and the BBL path falls back to the (mocked) platform client.

### Suspect shared-state analysis (from reading all 7 owned files + schema + adjacent tests)

1. **`StripeCustomer.stripeCustomerId` is globally `@unique`** (`prisma/schema.prisma:1961`), and
   two owned files still use **fixed literal** customer IDs: `actions.test.ts`
   (`cus_test_portal_0096`) and `checkout-actions.test.ts` (`cus_test_checkout_0097_existing`,
   `cus_test_checkout_0097_lineage_existing`). This is the only remaining cross-run/cross-file
   coupling surface on billing tables: a run killed mid-file on the persistent prodsnap DB strands
   a row whose ID the next run re-creates → P2002 at `create` (the TFF-005 stranded-row family).
   Per-file `{userId, brand, accountScope}` collisions are impossible (per-run unique users).
2. **`app/api/stripe/webhooks/route.test.ts`** (outside the billing 7) sweeps
   `stripeCustomer.deleteMany({ stripeCustomerId: { startsWith: "cus_test_" } })` in both
   beforeEach and afterAll — that pattern **matches the fixed IDs in point 1**. Harmless under
   strictly sequential `--parallel=1` file execution, but it is exactly the kind of broad sweep
   that turns dangerous if any unawaited async work straddles a file boundary (the TFF-007
   fire-and-forget `after()` pattern; the harness `after()` is still auto-run by default, flushable
   since the TFF-007 fix).
3. `actions.safe-action.test.ts` (the CI-failing file) uses per-run IDs (`cus_session_0191_${TS}`)
   and a per-run user — no fixed-ID exposure; its failure mode in June therefore needed a
   within-run interaction, which the current suite did not exhibit in 3 sequential runs.

### Hypothesis ranking

1. **H1 (most likely): the triggering condition was retired by suite evolution** between
   2026-06-17 and now — brand collapse to BBL, the TFF-007 flushable-`after()` harness fix
   (removed a class of deferred-write races), Stripe-client split, and 105→247-file reordering all
   landed in the window. Consistent with 3/3 green here; not attributable to a single change
   without bisecting old CI runs.
2. **H2: still latent at sub-per-run probability.** Even in June it showed on 2 of ~3 CI runs of
   the same suite and never locally; 3 local runs may simply be under the detection threshold.
3. **H3: CI-environment-specific timing** (GitHub runner + fresh seeded DB vs local Postgres.app +
   prodsnap). Both historical reds were CI; local may be the wrong environment to exhibit it.

### What a future repro needs

- **More trials:** N≥10 loop (the row's own recipe was 5 iterations), overnight, full logs kept —
  the CI summary never printed the failing assertion; local full output does.
- **CI-side attempt:** rerun-until-fail of the `CI complete` suite on a scratch PR branch, since
  both observations were CI. That is where H3 gets decided.
- **On fire, pinpoint the assertion first:** `serverError === "No billing customer found for this
  brand."` ⇒ DB-state leak (row deleted/missing at action time); empty `redirectState.url` with
  the mock called ⇒ mock/timing seam. The fix direction differs; do not guess.
- **Cheap prophylactic candidate for that future PR (deliberately NOT applied here):** suffix
  `${TS}` onto the three fixed literal customer IDs (point 1 above). Removes the only cross-file
  coupling without weakening any assertion. Not applied because path B commits the SESSION file
  only, and an unreproduced fix is exactly the #91 trap the ledger warns against.

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0749_TASK_01 (TFF-006 bounded repro) | landed (path B — not reproduced) | 3× full-suite runs all green (1972 pass / 0 fail / 247 files, REAL_EXIT=0 each); forensics report above; zero test/source files modified |

**Decisions resolved:** None — TFF-006 row disposition is proposed below for the AM owner, not applied.

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test server/web/billing/actions.safe-action.test.ts` | 4 pass / 0 fail, REAL_EXIT=0 (2.13s) |
| `bun run test` ×3 (runs 1–3) | 1972 pass / 0 fail / 247 files each; REAL_EXIT=0; 293s / 301s / 302s |
| `git status --porcelain` pre-work | only untracked `lane-prompt.md` (disk truth clean) |

## Artifacts

None.

## Open decisions / blockers

- **PROPOSED TFF-006 ledger edit (for the AM owner — NOT applied, shared ledgers are outside lane
  write scope):** change `- **Status:** open (needs local repro — see below).` to:
  `- **Status:** open — not reproduced at 247-file scale (SESSION_0749: 3× consecutive full-suite
  green, 1972 pass / 0 fail each, local prodsnap). Row facts stale: brand is now BBL, suite is 247
  files, portal action routes via getStripeClient(Brand.BBL). Next escalation: N≥10 local loop or
  CI rerun-until-fail; prophylactic candidate = de-literalize the 3 fixed cus_test_* IDs
  (SESSION_0749 forensics).`
- AM owner decides: keep `open` as monitor vs downgrade; whether to schedule the N≥10/CI loop.

## Next session

- **Goal:** n/a — dispatched lane; disposition belongs to the SESSION_0744 AM triage.
- **First task (if TFF-006 is picked up):** read this forensics report + the TFF-006 row, then run
  the N≥10 loop or CI rerun-until-fail before touching any test file.

## Close evidence

**/ggr composite:** n/a — commit-only lane; bounded exit contract per `lane-prompt.md` (SESSION_0744
fanout). **Caps applied:** none
**Systemic health:** CI = n/a (no push per contract) · findings routed 1/1 (TFF-006 proposal above)
· FS patterns: none
**Reviewer verdicts:** n/a — lane; AM-owner review is the contract's review step
**Findings ≥ medium:** none (no failures observed; staleness findings routed to the TFF-006 proposal)
**ADR / ubiquitous-language check:** not required — no code, no law touched

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | frontmatter complete; pairs_with SESSION_0744 |
| Wiki lint | n/a — lane scope (sprints file only); no wiki files touched |
| Reflections routing receipt | 3 lessons → 3 routes (below) |
| Code-quality gate (Class-A) | no Class-A custom code — zero non-docs files modified |
| Runtime verification (Doug) | no runtime surface touched; suite runs are the verification (table above) |
| Deferral guard (§6.8) | clean — the one deliberate deferral (prophylactic ID fix) is routed to the TFF-006 proposal with its why |
| Memory sweep · next-session unblock | n/a lane · AM triage unblocked by Open decisions above |
| Git hygiene · Graphify update | single path-B commit, SESSION file only; Graphify n/a (worktree graphs read 0 by design) |

## Reflections

- The TFF-006 row aged badly in 6 weeks (brand rename, Stripe-client split, 2.4× suite growth) —
  flake rows should pin suite-scale + seam facts as of-date so future repro lanes re-verify first
  → route: TFF-006 proposal (Open decisions above)
- Globally-unique `stripeCustomerId` + fixed literal test IDs is a stranded-row landmine on
  prodsnap even while the suite is green → route: TFF-006 proposal (prophylactic candidate,
  deliberately deferred)
- 3 local runs ≈ 15 min wall-clock at 247 files; a meaningful flake hunt at sub-1% rates needs the
  N≥10 overnight loop or CI-side reruns budgeted up front → route: no-action (bound was the
  contract; escalation path recorded in the report)
