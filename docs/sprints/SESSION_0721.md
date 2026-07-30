---
title: "SESSION 0721 — lineage-tier-policy DB integration test (SESSION_0720 pilot, Lane A)"
slug: session-0721
type: session--implement
status: closed
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0721
sprint: S13
lane: bbl
lane_seq:
recipe: "seq-lane-build"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0720.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0721 — lineage-tier-policy DB integration test (SESSION_0720 pilot, Lane A)

**Date:** 2026-07-30 · **Operator:** Brian + claude-session-0721

## Goal

Add ONE integration test driving the REAL Prisma query in
`server/web/entitlements/lineage-tier-policy.ts` — cover `getLineageListingRenderPolicyForUser`,
the batch `getLineageListingRenderPoliciesForUsers`, and the profile-detail variants, for a
free-tier (no active entitlement) session AND an entitled session. Additive/behavior-locking —
no runtime change. Dispatched by SESSION_0720 (overnight-orchestrator PILOT, Lane A).

## Status

Frontmatter `status:` is the single source of truth (SESSION_0342). Do not restate it here.

## Bow-in

- Dispatched by `docs/sprints/SESSION_0720.md` — Lane A of the 2-lane overnight-orchestrator
  pilot (`overnight-orchestrator-waves`). Pinned forks (a) push+PR authorized this session,
  (c) HOLD on any gate-fail/ambiguity, (d) completion bar = gates green + PR.
- Worktree: `/Users/brianscott/dev/bbl-0721` on branch `auto/session-0721-lineage-tier-itest`,
  cut from `origin/main`. FS-0024 guard run: `pwd` = worktree path, `git remote` =
  `Ronin-Dojo-Design/black-belt-legacy`. Environment pre-bootstrapped by the dispatching shell
  (deps installed, Prisma client generated, `.env` copied with `RESEND_*` stripped, local
  Postgres up against `ronindojo_prodsnap`).
- Owned-file contract (dispatch-pinned): WRITE ONLY
  `apps/web/server/web/entitlements/lineage-tier-policy.integration.test.ts` (new) + this SESSION
  file. Read-only refs: `apps/web/server/web/entitlements/lineage-tier-policy.ts` (subject) and
  `apps/web/server/web/entitlements/queries.integration.test.ts` (setup/teardown pattern mirrored).
- On-demand blocks pulled: none (single small test-only task, plan already fully specified by
  the dispatch prompt — no separate Petey plan needed).

## Cody pre-flight

n/a for L1/UI (no component/UI surface touched — test-only file). Read the subject
(`lineage-tier-policy.ts`), its pure-resolver dependency (`lib/entitlements/lineage-tier-
policy.ts`), the shared `activeEntitlementWhereForUsers` predicate (`active-entitlement.ts` +
its own `active-entitlement.test.ts`, which already pins expiry/revoke/wrong-brand/wrong-key at
the predicate level — not re-duplicated here), and the mirrored fixture pattern
(`queries.integration.test.ts`) before writing any test code. Read `docs/runbooks/sops/sop-test-
writing.md` §6 (query test pattern) per the FS-0027 pre-write hook.

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0721_TASK_01 | landed | New file `apps/web/server/web/entitlements/lineage-tier-policy.integration.test.ts` — 9 cases across 4 `describe` blocks: `getLineageListingRenderPolicyForUser` (null userId, omitted userId, free user, entitled user), `getLineageListingRenderPoliciesForUsers` (mixed batch, empty array), `getLineageProfileDetailRenderPolicyForUser` (free, entitled), `getLineageProfileDetailRenderPoliciesForUsers` (mixed batch). Pins current free-vs-paid behavior against the real `db.userEntitlement.findMany` query — no defect found (SESSION_0502-ratified `canRenderProfile: true` on free is intentional, confirmed against `lib/entitlements/lineage-tier-policy.ts` comments). |

**Decisions resolved:** None — single pre-specified task, no open decisions surfaced.

**First-attempt correction (not a defect in the subject under test):** the initial draft tagged
the `Entitlement.key` with the per-run `TEST_PREFIX` (mirroring `active-entitlement.test.ts`,
which can do this because `hasAnyActiveEntitlement` takes caller-supplied keys). But
`lineage-tier-policy.ts` checks the *literal* `LINEAGE_PREMIUM_ENTITLEMENT_KEY` constant
(`LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS` is hardcoded, not parameterized) — a tagged key never
matches, so the entitled-user cases resolved FREE instead of PREMIUM on the first run. Fixed to
find-or-create the real `(BBL, LINEAGE_PREMIUM)` Entitlement row (confirmed already present in
`ronindojo_prodsnap`, `id: qx8m8l0jhj6c70vhlk2cc514`), only tracking it for cleanup if the test
run created it. Re-ran green after the fix.

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun run test server/web/entitlements/lineage-tier-policy.integration.test.ts` | `9 pass / 0 fail / 11 expect() calls` · REAL_EXIT=0 |
| `cd apps/web && bun run typecheck` | `tsc --noEmit` clean · REAL_EXIT=0 |
| `cd apps/web && bun run test` (full suite, `--parallel=1`) | `1934 pass / 0 fail / 5326 expect() calls` across 241 files, 208.12s · REAL_EXIT=0 |
| `cd apps/web && bun run lint` | `oxlint --fix .` — only pre-existing warnings in unrelated files (no errors); `git status --porcelain` in the worktree shows only the new test file untracked, no `--fix` mutation of tracked files · REAL_EXIT=0 |

No runtime surface changed — test-only, additive.

## Artifacts

None.

## Open decisions / blockers

None. Not BLOCKED — task complete, PR opened per the dispatch's fork-a exit contract.

## Next session

- **Goal:** Owned by the SESSION_0720 morning-surface step (both lanes' completion triggers the
  am-coffee-merge-review — recon, verify both PRs' gates + required CI/Playwright checks, apply
  both lanes' Proposed ledger edits in one canonical commit, hold for operator merge word).
- **First task:** N/A from this lane — see `docs/sprints/SESSION_0720.md` "Morning surface".

## Proposed ledger edits (apply next canonical close — shared ledgers frozen this session)

- **No defect found in `lineage-tier-policy.ts`.** Current free-vs-paid behavior verified
  correct against `lib/entitlements/lineage-tier-policy.ts`'s documented SESSION_0502 intent
  (free tier renders full BASIC profile incl. bio/rank history/organizations; only RICH MEDIA —
  cover/video/social/location/email/analytics — gates to premium+). Nothing to flag as drift or
  a bug; this session pins current behavior, does not change it.
- **Coverage note (no ledger row needed, FYI for the merge sweep):** the new integration test
  deliberately does NOT re-test entitlement expiry/revocation/wrong-brand/wrong-key boundary
  cases — those are already pinned at the shared `activeEntitlementWhereForUsers` predicate
  level by `server/web/entitlements/active-entitlement.test.ts` (6 cases). Re-testing them here
  would duplicate coverage of the same shared predicate rather than exercise anything new in
  `lineage-tier-policy.ts`'s own wiring.

## Close evidence

**/ggr composite:** n/a — single-lane dispatched build, no standalone Doug/Giddy grill run this
session (morning-surface review at SESSION_0720 covers both lanes). **Caps applied:** none.
**Systemic health:** CI = pending (PR just opened, required checks running) · findings routed
0/0 (none surfaced) · FS patterns: none.
**Reviewer verdicts:** Giddy n/a (not invoked — small pre-specified single-file task) · Doug n/a
(deferred to SESSION_0720 morning surface) · Desi n/a (no UI touched).
**Findings ≥ medium:** none.
**ADR / ubiquitous-language check:** not required — no ADR-adjacent decision made; pure test
addition against existing, already-ratified (SESSION_0502) policy.

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | This file's frontmatter follows SESSION_TEMPLATE.md v2 shape (title/slug/type/status/lane/recipe/pairs_with/backlinks filled); `pairs_with` → SESSION_0720, `backlinks` → wiki index. |
| Wiki lint | Not run — no `docs/knowledge/wiki/**` files touched this session (forbidden by owned-file contract). |
| Reflections routing receipt | 1 lesson → routed below (Reflections section). |
| Code-quality gate (Class-A) | No Class-A custom application code — test-only file (query/integration test class per `sop-test-writing.md` §6/§11). |
| Runtime verification (Doug) + artifact URL | No runtime surface touched — test-only, additive. No Artifact published. |
| Deferral guard (§6.8) | Clean — no flags dismissed. |
| Memory sweep · next-session unblock | Next-session ownership is explicitly SESSION_0720's morning-surface step (both lanes), not this lane — recorded above. |
| Git hygiene · Graphify update | Single push this session — see PR/commit below. Graphify not refreshed (test-only addition, no structural code change; canonical graph refresh is a canonical-checkout concern, out of scope for a worktree lane per worktree-isolation law). |

## Reflections

- Never assume a "unique per test run" tag is safe on a value another module checks by literal
  string equality — `active-entitlement.test.ts`'s `hasAnyActiveEntitlement` takes caller-
  supplied keys (tagging is safe there) but `lineage-tier-policy.ts`'s
  `LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS` is a hardcoded constant list, so the fixture's
  `Entitlement.key` must be the literal `LINEAGE_PREMIUM_ENTITLEMENT_KEY`, not a tagged
  variant — mirroring a sibling test's fixture shape isn't safe without first checking whether
  the function under test treats that field as caller-parameterized or hardcoded. → route:
  no-action (caught and self-corrected within this session via the single-file gate re-run
  before it ever reached the full suite or a PR; not a systemic pattern warranting a new FS row
  — the fix path (find-or-create the real entitlement row, mirroring `queries.integration.test.ts`'s
  `S3_UPLOAD` pattern) is already the documented convention in this file's own precedent).
