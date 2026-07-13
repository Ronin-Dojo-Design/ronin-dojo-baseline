---
title: "SESSION 0534 — FS-0031 seed-shape hardening + AdminCollection ecosystem drain"
slug: session-0534
type: session--open
status: in-progress
created: 2026-07-13
updated: 2026-07-13
last_agent: claude-session-0534
sprint: S53
pairs_with:

  - docs/sprints/SESSION_0533.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0534 — FS-0031 seed-shape hardening + AdminCollection ecosystem drain

## Date

2026-07-13

## Operator

Brian + claude-session-0534

## Goal

Two coherent lanes, sequenced. **(LANE 1) FS-0031 hardening (HIGH — this bug class reddened `main` 3× across
0532/0533):** align `apps/web/scripts/setup-e2e-db.ts` to CI's MINIMAL data shape (CI's e2e DB has ZERO
posts/orgs — migrate + tournament fixture only) so "green locally" == "green in CI" by default; fix the
dev-server `NODE_OPTIONS` recipe in `closing.md §4c` (the `bun --env-file … next dev` form poisons Turbopack's
PostCSS worker → `loadEnvFile` launcher); stabilize the two chronically-flaky chromium specs. **(LANE 2)
AdminCollection ecosystem drain:** migrate the remaining bespoke row-action/select surfaces left inline in
0533 where behavior-safe (AC-ECOSYSTEM-1), and extract the `person-actions`↔`user-actions` menu-item dupe
(AC-ECOSYSTEM-2, gated on WL-P2-35). Behavior-preserving; proven by fallow deltas DOWN + affected e2e green.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0533.md` (FS-0031 e2e-infra fix + AdminCollection ecosystem
  sweep; closed + pushed to `origin/main` @ `00405359`).
- Carryover: 0533 landed the FS-0031 infra (dedicated `ronindojo_e2e` DB, local-run launcher, run-evidence
  guard) and the WL-P2-54..60 sweep — but its own close push reddened `main` TWICE because the local
  `ronindojo_e2e` seed is RICHER than CI (4 posts) so a data-dependent assertion passed locally but failed on
  CI's empty DB. 0533 also spawned AC-ECOSYSTEM-1/2 (deviations left inline) and two FS-0031 recipe follow-ons.

### Branch and worktree

- Branch: `session-0534-ac-drain`
- Worktree: `/Users/brianscott/dev/ronin-0534` (off `origin/main` @ `00405359`)
- Status at bow-in: clean (fresh worktree; bootstrapped via `/worktree-setup` — copied `.env` + `bun install`
  + `prisma generate` to `.generated/prisma`)
- Current HEAD at bow-in: `00405359`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content/Blog admin (AdminCollection consumers) — code-quality conform only |
| Extension or replacement | Extension: migrates remaining bespoke surfaces onto the already-ratified ADR-0045 AdminCollection primitives (`RowActionsMenu`/`RowDeleteButton`/`selectColumn`) |
| Why justified | Drains the deviations 0533 left inline; no new capability, no god-component |
| Risk if bypassed | Two admin-list contracts (shared kit vs bespoke) — the drift AdminCollection law exists to kill |

Live docs checked during planning: not applicable (conform to existing ratified primitives; no L1 doc delta).

### Grill outcome

Petey grill — forks resolved at bow-in (see `## Petey plan → Open decisions`):

1. **Sequencing** — LANE 1 (FS-0031) FIRST (independent, HIGH, de-risks LANE 2's verification gate), then
   AC-ECOSYSTEM-1, then AC-ECOSYSTEM-2. Rationale: the `setup-e2e-db.ts` seed-shape change directly affects
   how LANE 2's conformance e2e must be verified — resolve the gate before leaning on it.
2. **FS-0031 seed-strip consequence** — aligning `setup-e2e-db.ts` DOWN to CI-empty means any conformance
   assertion that NEEDS posts/orgs (Posts Drafts-default facet, Org sort) must either self-seed in-test (the
   A1 pattern) or tolerate empty. This is a build-time discovery for Cody + a hard verify gate for Doug: the
   affected spec must pass against the newly-empty local DB. Operator directive (bow-in args) chose the
   align-down direction explicitly.
3. **AC-ECOSYSTEM-2 gate (WL-P2-35)** — RESOLVED at bow-in: BOTH `user-actions.tsx` and `person-actions.tsx`
   still exist on `origin/main` (#200 re-keyed only the `[id]` DETAIL editor; the users-LIST kebab survived).
   The dupe is live. Residual sub-gate for Cody: confirm the users LIST route is not itself slated to retire
   before extracting `AccountActionItems`; if it is, AC-ECOSYSTEM-2 is deferred, not built.

## Petey plan

### Goal

Sequence: FS-0031 seed-shape + recipe hardening + flaky-spec stabilization (LANE 1) → AdminCollection
ecosystem drain of the inline deviations (LANE 2), behavior-preserving, proven by fallow deltas DOWN + a
CI-matching e2e verify.

### Tasks

#### SESSION_0534_TASK_01 — FS-0031 seed-shape hardening + recipe fix + flaky-spec stabilization

- **Agent:** Cody (build + self-verify) → Doug (independent verify against a CI-matching empty DB)
- **What:** make "green locally" == "green in CI" by default, and stop two recurring flakes.
- **Steps:**
  1. Align `apps/web/scripts/setup-e2e-db.ts` to CI's minimal shape (migrate deploy + tournament fixture
     ONLY — zero posts, zero orgs). Audit every `admin-collection-conformance.spec.ts` assertion that
     depended on the richer seed (Posts Drafts-default, clear-to-All, Org sort) and convert each to
     self-seed in-test (the A1 `createTestPost`/`deleteTestPost` bridge pattern) or tolerate empty.
  2. Fix `docs/rituals/closing.md §4c` dev-server recipe: replace the `bun --env-file … next dev` form
     (poisons Turbopack's PostCSS-worker `NODE_OPTIONS`) with a `loadEnvFile` launcher.
  3. Stabilize the two chronically-flaky chromium specs (`e2e/auth/registration.spec.ts`,
     `e2e/disciplines/ranks-m-card.spec.ts`) — diagnose the flake, add a deterministic wait/guard.
- **Done means:** the affected conformance spec runs GREEN locally against a reproduced CI-empty DB state
  (delete rows to mirror CI) AND the seeded state; the two flaky specs pass 10/10 isolated; recipe fixed;
  no change to CI/prod behavior.
- **Depends on:** worktree bootstrap (done).

#### SESSION_0534_TASK_02 — AC-ECOSYSTEM-1: migrate remaining bespoke row-action/select surfaces

- **Agent:** Cody (build + self-verify) → Doug/Desi (behavior + UX verify)
- **What:** drain the 4 kebab + select deviations 0533 left inline, ONLY where behavior-safe.
- **Steps:** migrate onto `RowActionsMenu`/`RowDeleteButton`: content-atom ghost kebab
  (`content/_components/content-atom-actions.tsx`), memberships + invites `MoreHorizontalIcon` triggers
  (`memberships-table-columns.tsx`, `invites-table-columns.tsx`), org invite-row-actions. The
  `Checkbox`/shift-select select surfaces (`components/admin/row-checkbox.tsx`, `components/common/checkbox.tsx`
  consumers) are a REAL behavior change (shift-select reconciliation) → their own isolated verify, NOT folded
  into the mechanical kebab migration.
- **Done means:** deviations on the shared primitives where behavior-safe; fallow dup/dead-code DOWN; affected
  e2e green; shift-select behavior verified unchanged (or the change explicitly ratified).
- **Depends on:** TASK_01 (the e2e gate must be CI-matching to honestly verify this).

#### SESSION_0534_TASK_03 — AC-ECOSYSTEM-2: extract AccountActionItems fragment (gated)

- **Agent:** Cody (build) → Doug (verify authz non-regression)
- **What:** extract the ~75-line Role-submenu/ban/revoke menu-item body duplicated between
  `person-actions.tsx` and `user-actions.tsx` into one `AccountActionItems` fragment.
- **Steps:** confirm the residual WL-P2-35 sub-gate (users LIST not slated to retire); extract the shared
  menu-ITEM body (NOT another kebab shell — that's WL-P2-54's `RowActionsMenu` already); keep authz in the
  server actions; Doug proves role/ban/revoke behavior + authz identical on both surfaces.
- **Done means:** one `AccountActionItems`, both consumers thinned, authz non-bypassable + behavior identical.
- **Depends on:** TASK_02 (and the residual gate). Deferred (not rejected) if the users LIST is retiring.

### Parallelism

Sequential: TASK_01 → TASK_02 → TASK_03. TASK_01's seed-shape change gates how TASK_02/03's e2e is verified;
TASK_02 and TASK_03 both touch the users/admin row-action surface area. Single coherent Cody per task (not a
fan-out) — the review wave (Doug + Desi on UI) runs after each build. Fan-out reserved only if TASK_02's
surfaces prove genuinely disjoint at pre-flight.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0534_TASK_01 | Cody → Doug | e2e-infra + recipe; verify demands a CI-matching empty-DB reproduction |
| SESSION_0534_TASK_02 | Cody → Doug + Desi | behavior-preserving migrations onto ratified primitives; UX parity |
| SESSION_0534_TASK_03 | Cody → Doug | authz-sensitive dedup; gated on a residual retire question |

### Open decisions

- **[RESOLVED at grill]** Sequencing = LANE 1 first. Seed-strip direction = align DOWN to CI-empty (operator
  directive). AC-ECOSYSTEM-2 gate = dupe is live (both files exist); residual sub-gate handed to Cody.
- **[carries into build]** The shift-select `Checkbox` reconciliation is a real behavior change — needs its own
  verify and, if it changes UX, operator ratification before landing.

### Risks

- **Seed-strip blast radius:** stripping `setup-e2e-db.ts` may break local runs of OTHER e2e specs that
  silently relied on the richer seed — TASK_01 must audit the whole `e2e/` suite locally, not just the
  conformance spec.
- **Shared-kit blast radius:** AC-ECOSYSTEM row-action migrations touch admin collections consumed broadly;
  mitigated by the CI-matching e2e gate (TASK_01 makes it real) + fallow delta + Doug live smoke.

### Scope guard

- Behavior-preserving only (LANE 2 is a quality drain; the ONE exception — shift-select — is called out and
  gets its own verify). No new admin surfaces. No god-component (`RowActionsMenu` must never grow `items`/`kind`).
- FI-001 / Brian Truelson email STAYS PARKED (no send, no grant). `../ronin-dojo-monorepo` READ-ONLY.
  Hand-authored migrations only. No push/deploy without explicit operator "go" (build → verify → show → HOLD).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0534_TASK_01 | landed | FS-0031 seed-shape hardening + recipe fix + flaky-spec stabilization (Cody `f101ac30`+`ceca34ca`+`f7ebdd66`; Doug GO 8.0 + 2 P2s; Cody batch-fix `66fa0763` → org-sort 5/5 isolation + 10/10 hermetic). Deferred: 10 leftover e2e-users + 9 pre-existing full-suite cold flakes → ledger |
| SESSION_0534_TASK_02 | in-progress | AC-ECOSYSTEM-1 bespoke row-action/select migration |
| SESSION_0534_TASK_03 | pending | AC-ECOSYSTEM-2 AccountActionItems extraction (gated) |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

None at bow-in.

## Next session

### Goal

TBD at bow-out.

### First task

TBD at bow-out.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence
