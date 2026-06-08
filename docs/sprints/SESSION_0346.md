---
title: "SESSION 0346 — BBL gift/comp membership Phase 1: admin comp-grant + claim & invite tie-ins"
slug: session-0346
type: session--open
status: closed
created: 2026-06-04
updated: 2026-06-05
last_agent: codex-session-0346
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0345.md
  - docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md
  - docs/architecture/decisions/0012-tier-auto-grant.md
  - docs/architecture/decisions/0019-membership-lifecycle-ownership.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0346 — BBL gift/comp membership Phase 1: admin comp-grant + claim & invite tie-ins

## Date

2026-06-04

## Operator

Brian + claude-session-0346 / codex-session-0346 (Petey orchestration -> Cody build -> Doug verify -> Petey close)

## Goal

Build Phase 1 of the BBL gift/comp epic, integrated with the existing invite + claim/claimant work (operator
steer: integrate, do not greenfield): a platform-admin-gated, audited comp-grant primitive on the existing
entitlement spine that issues `UserEntitlement(sourceType=MANUAL_GRANT)`, wired into BOTH trusted triggers —
lineage claim approval and invite acceptance — server-derived (never client-supplied), with a multi-rank /
multi-student seed fixture proving it end-to-end. No schema migration (Invite.meta + AuditLog + enums already
exist); tier is expressed by entitlement keys (elite superset of premium).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0345.md`.
- Carryover: SESSION_0345 proved the real Stripe test-mode checkout/webhook -> entitlement lifecycle locally
  and fixed a launch-blocking returning-customer `customer_update` bug. It staged the gift/comp epic and left
  SESSION_0345_TASK_02 (multi-rank/multi-student seed harden) `pending`; that seed work is folded into this
  session's TASK_03 as the proving fixture. The `Next session` block names Phase 1 (comp-grant RBAC action) as
  the build target.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0346.md`.
- Current HEAD at bow-in: `a2f03f5`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git` (FS-0024 pwd +
  remote guard run before this file was written).

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Monetization/entitlements, auth/RBAC (safe-action clients), Prisma (data only — no migration), invites. |
| Extension or replacement | Extension: reuse `grantEntitlement` spine, `adminActionClient` RBAC, the `applyLineageClaimReview` audited transaction, `claimInvite`, the `AuditLog` model, and the lineage seed helpers. No new aggregate, no new payment path. |
| Why justified | The epic's Phase 1 rides the existing entitlement spine; the operator steer requires integrating with the already-built invite + claim flows rather than a standalone primitive. |
| Risk if bypassed | High: a parallel comp path that bypasses RBAC/audit, or duplicates Membership semantics (violating ADR 0019), would fork the access model. |

Live docs checked during planning: GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC, ADR 0012 (tier auto-grant), ADR 0019
(membership/access boundary). No new Dirstarter API surface introduced.

### Graphify check

- Graph status: current (refreshed end of SESSION_0345); stats at bow-in: 9281 nodes, 14207 edges,
  1395 communities, 1577 files tracked.
- Queries used:
  - `comp gift complimentary grant RBAC admin role permission UserEntitlement MANUAL_GRANT entitlement audit server action`
  - `invite claim claimant lineage placeholder user accept approve invite-code entitlement comp grant materialize Better Auth`
  - `autonomous session codex auto session setup orchestration runbook`
- Files/surfaces selected from graph + direct read:
  - `apps/web/server/web/entitlement/grant-entitlement.ts` (idempotent grant spine to mirror)
  - `apps/web/server/admin/lineage/claim-review-actions.ts` (`applyLineageClaimReview` — claim approval trigger, already audited + serializable)
  - `apps/web/server/invites/actions.ts` (`claimInvite` — invite acceptance trigger; creates Membership in a tx)
  - `apps/web/lib/safe-actions.ts` (`adminActionClient` = role `admin`; `userActionClient`)
  - `apps/web/server/admin/entitlements/{actions,queries}.ts` (Entitlement catalog CRUD)
  - `apps/web/prisma/schema.prisma` — `Invite.meta Json?`, `AuditLog`, `UserEntitlement`, `LineageClaimRequest`
  - `apps/web/prisma/seed-baseline-platform.ts` (entitlement-key seed; only `S3_UPLOAD` exists today)
  - `apps/web/e2e/helpers/seed-tournament.ts` (multi-actor seed pattern to lift)
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

One round of Petey grill (4 forks) + two operator steers resolved before code:

1. **Operator steer — integrate, not greenfield.** Gift membership must tie into the existing invite +
   claim/claimant work, not a standalone primitive. Decision: build the comp primitive AND wire it into both
   trusted triggers this session.
2. **Scope = primitive + BOTH triggers** (claim approval + invite acceptance), with the multi-rank seed
   fixture as proof. (Operator chose over "claim only" / "primitive only".)
3. **RBAC = platform-admin only this session** for the standalone manual comp (`adminActionClient`); the
   claim/invite triggers grant within their existing admin/owner gates. The school-owner/instructor delegated
   matrix + term caps are deferred to a later phase.
4. **Tier = entitlement keys** (one read signal for paid + comped); no `tier` field. Elite is a superset of
   premium keys.
5. **Run-shape = inline Petey -> Cody -> Doug** (no autonomous bundle, no subagents): the file sets
   (entitlement action, claim-review hook, invite hook, seed, tests) are coupled and the path is
   security-sensitive (RBAC + entitlements) — wants a human in the loop.
6. **No migration confirmed.** `Invite.meta Json?`, `AuditLog`, `UserEntitlement`, and the
   `MANUAL_GRANT`/`PROMO` enums all already exist; comp intent rides `invite.meta.comp` (server-derived) and
   admin-supplied claim-approval input. Entitlement *catalog keys* for premium/elite are seed data (not a
   migration) and must be defined — only `S3_UPLOAD` exists today.
7. **fallow (fallow-rs/fallow), not farrow** — evaluate at bow-out as a code-quality tool (operator request);
   grill that decision at close (first introduction). No autonomous-session bundling this session.

### Drift logged

- None new at bow-in. Two latent items surfaced for the plan's Risks (not yet drift): `grantEntitlement` runs
  on `userActionClient` (no admin gate, no audit) — verify call sites; and the premium/elite tier entitlement
  keys do not yet exist in the catalog (only `S3_UPLOAD`).

## Petey plan

### Goal

Ship an admin-gated, audited comp-grant on the existing entitlement spine, wired into lineage-claim approval
and invite acceptance as server-derived triggers, proven by a multi-rank/multi-student seed fixture — with no
schema migration.

### Tasks

#### SESSION_0346_TASK_01 — Comp-grant primitive (admin RBAC + audit) + tier keys

- **Agent:** Cody -> Doug
- **What:** A shared internal `grantComp` helper + a platform-admin server action that issues
  `UserEntitlement(MANUAL_GRANT)` idempotently with an `AuditLog` written before mutation; plus a `revokeComp`
  companion; plus seeding the canonical `LINEAGE_PREMIUM`/`LINEAGE_ELITE` entitlement catalog keys.
- **Steps:**
  1. Confirm `grantEntitlement` call sites; the new comp action is `adminActionClient`-gated (role `admin`).
     If `grantEntitlement` (userActionClient) is client-exposed, log a finding and tighten/internalize it.
  2. Define `LINEAGE_PREMIUM` + `LINEAGE_ELITE` Entitlement rows (brand-scoped) in the platform seed,
     mirroring the `S3_UPLOAD` pattern. Elite grants the premium key set + elite extras (superset).
  3. Factor a brand-scoped internal `grantComp({ db, grantorUserId, granteeUserId, entitlementKeys, term,
     reason })` that, in one transaction: writes `AuditLog` (`entitlement.comp.granted`, before/after) then
     idempotently upserts `UserEntitlement` (mirror grant-entitlement upsert), `sourceType=MANUAL_GRANT`,
     `sourceId=grant:<grantorUserId>:<reason-slug>`, `endsAt` null (lifetime) or now+term. Add `revokeComp`
     (status REVOKED + audit). Honor ADR 0019: UserEntitlement only, never `Membership.status`.
  4. Expose the admin action (`adminActionClient`) calling `grantComp`; reject non-admin.
  5. Unit + integration tests: admin-gate rejection, idempotency (no double grant), lifetime vs term, audit
     row written before mutation, revoke flips status, no Membership mutation.
- **Done means:** `grantComp`/`revokeComp` + admin action exist, premium/elite keys seeded, tests green.
- **Depends on:** nothing.

#### SESSION_0346_TASK_02 — Trusted-trigger tie-ins: claim approval + invite acceptance

- **Agent:** Cody -> Doug
- **What:** Wire `grantComp` into the two existing trusted triggers, server-derived (never client-supplied).
- **Steps:**
  1. **Claim -> comp:** extend `applyLineageClaimReview` so an admin approving a claim may attach a comp
     (optional `comp: { tier, termDays }` on the review input); materialize it via `grantComp` inside the
     existing serializable transaction; the existing claim `AuditLog` plus the comp audit both record it.
  2. **Invite -> comp:** extend `claimInvite` so when `invite.meta.comp = { tier, termDays }` is present, the
     `UserEntitlement` is materialized via `grantComp` in the same transaction as the membership create —
     derived from the invite record, never from client input. Admin invite issuance writes `meta.comp`.
  3. Tests: claim-approve-with-comp grants + audits; invite-with-comp materializes on accept; absent comp =>
     no grant; client cannot inject/elevate tier; ADR 0019 boundary holds (no Membership.status change from
     the comp).
- **Done means:** both triggers grant comps server-derived, audited, idempotent; tests green.
- **Depends on:** SESSION_0346_TASK_01 (`grantComp` helper).

#### SESSION_0346_TASK_03 — Multi-rank/multi-student seed fixture + end-to-end coverage

- **Agent:** Cody -> Doug
- **What:** The deterministic, self-cleaning multi-rank/multi-student seed (folds SESSION_0345_TASK_02), used
  to prove TASK_01 + TASK_02 end-to-end including mixed-tier and race/edge cases.
- **Steps:**
  1. Lift the multi-actor pattern from `e2e/helpers/seed-tournament.ts`; extend the lineage seed helpers.
  2. Seed N students across the rank spectrum under each existing instructor (RankAwards +
     LineageTreeMembers), deterministic ids, brand-scoped, self-cleaning; mark a subset comped premium/elite.
  3. e2e/integration proving comp grant + claim->comp + invite->comp with mixed-tier actors; race/edge:
     concurrent claim of the same node, idempotent comp re-grant, cancel/absent-comp.
  4. Gates: focused unit + e2e, then `bun run typecheck` / `bun run lint` / broad unit (`--parallel=1`, FS-0342).
- **Done means:** seed helper exists; e2e/unit exercise multi-rank/multi-student + named edge cases; all green,
  deterministic under `--parallel=1`.
- **Depends on:** SESSION_0346_TASK_01, SESSION_0346_TASK_02.

### Parallelism

Inline baton, sequential (Petey -> Cody -> Doug). TASK_01 produces the shared `grantComp` helper that TASK_02
and TASK_03 both consume; TASK_03 proves the prior two. The file sets overlap (shared helper + shared test
fixtures) and the path is security-sensitive, so no subagents/worktrees — parallelism would add merge overhead
and review risk for no speedup (operator chose inline run-shape).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0346_TASK_01 | Cody -> Doug | Deterministic spine/RBAC/audit code; Doug verifies idempotency + audit-before-mutation + admin gate. |
| SESSION_0346_TASK_02 | Cody -> Doug | Integration into existing transactions; Doug verifies server-derived (no client trust) + ADR 0019 boundary. |
| SESSION_0346_TASK_03 | Cody -> Doug | Deterministic seed/e2e; Doug verifies determinism under `--parallel=1`. |

### Open decisions

- **Entitlement-key naming.** Default to repo convention `UPPER_SNAKE` (`LINEAGE_PREMIUM`, `LINEAGE_ELITE`,
  matching `S3_UPLOAD`) over the epic's dotted `lineage.premium`. Decided: UPPER_SNAKE for catalog consistency.
- Delegated (school-owner/instructor) comp authority + term caps: deferred (not this session).

### Risks

- **`grantEntitlement` privilege smell.** It is a `userActionClient` action (any authenticated user, arbitrary
  `userId`/`entitlementKey`, no audit). If client-exposed this is privilege escalation — verify call sites in
  TASK_01; the comp action must be admin-gated and must not replicate that exposure. Candidate finding.
- **ADR 0019 boundary.** Comp affects `UserEntitlement` (access) only — the invite path also creates a
  `Membership`; the comp must be a *separate* entitlement write, never a `Membership.status` mutation.
- **Determinism under `--parallel`** (FS-0342): brand-scoped, self-cleaning seed; no shared-row reuse.
- **`Invite.meta` contract.** `meta` is a shared JSON column; namespace comp under `meta.comp` to avoid
  colliding with existing invite metadata.

### Scope guard

- No tier-gating read model / card render this session (epic Phase 2) — only the grant + triggers + fixture.
- No delegated RBAC matrix, no BBL.com import cohort, no schema migration.
- No autonomous-session bundling; fallow is evaluated read-only at bow-out, not adopted into gates here.
- Adjacent tech debt (e.g. tightening `grantEntitlement`) goes under `Open decisions / blockers` unless it is
  the named finding fix.

### Dirstarter implementation template

- **Docs read first:** GIFT epic spec, ADR 0012, ADR 0019. No live Dirstarter URL re-fetch — the work rides
  already-aligned entitlement/auth primitives (SESSION_0344/0345 verified the entitlement spine live).
- **Baseline pattern to extend:** `grantEntitlement` upsert spine; `adminActionClient`; `applyLineageClaimReview`
  audited transaction; `claimInvite` transaction; `AuditLog`; lineage + tournament seed helpers.
- **Custom delta:** a `grantComp`/`revokeComp` audited helper, an admin comp action, two server-derived trigger
  hooks, premium/elite catalog keys, and a multi-rank seed fixture.
- **No-bypass proof:** reuses the existing entitlement spine + RBAC clients + audit model; it does not fork the
  access model or duplicate Membership semantics (ADR 0019).

## Cody pre-flight

### Pre-flight: Comp-grant primitive + trigger tie-ins (TASK_01–03)

#### 1. Existing component scan

- Graphify queries used: the three logged above.
- Found: `grantEntitlement`/`revokeEntitlement`/`check-entitlement`/`manage-entitlements`,
  `applyLineageClaimReview`, `claimInvite`, `adminActionClient`, admin entitlement CRUD, `AuditLog`,
  `seed-tournament.ts` + lineage seed helpers. Extend these — do not invent a new grant path.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0345`).
- ADR read: `0012-tier-auto-grant.md`, `0019-membership-lifecycle-ownership.md`.
- Runbooks consulted: GIFT epic spec; SESSION_0345 no-trust-client checkout posture.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (FS-0002).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app/apps/web`.
- Brand/host for testing: local Playwright `localhost:3000` / bun unit + integration tests.
- Verification commands: `bun test <files>`, `E2E_STRIPE_MOCK=1 bunx playwright test ...`,
  `bun run typecheck`, `bun run lint`, `bun test --parallel=1 --path-ignore-patterns='e2e/**'`.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (component scan skip), FS-0002 (dev server), FS-0018 (Stripe expand —
  N/A here), FS-0024/0025 (git guard + single-push close), FS-0342 (deterministic `--parallel=1`).
- Mitigation acknowledged: plan + task ids exist before code; reuse-scan done; audit-before-mutation;
  determinism under `--parallel=1`; one push at close.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0346_TASK_01 | completed | Added audited `grantComp` / `revokeComp`, admin-gated comp actions, premium/elite catalog seed data, and removed unused unsafe user-scoped grant/revoke web actions. |
| SESSION_0346_TASK_02 | completed | Wired claim approval and invite acceptance to materialize server-derived comp grants inside their existing trusted transactions. |
| SESSION_0346_TASK_03 | completed | Added a deterministic multi-rank/multi-student lineage comp fixture and focused coverage for mixed tiers, idempotency, concurrent claim edge cases, and absent/client-injected comp cases. |

## What landed

- `LINEAGE_PREMIUM` and `LINEAGE_ELITE` are now canonical entitlement keys, seeded brand-scoped alongside
  `S3_UPLOAD`. Elite grants both keys, preserving the premium subset signal.
- `grantComp` and `revokeComp` write `AuditLog` rows before mutating `UserEntitlement`, use
  `sourceType=MANUAL_GRANT`, and keep grants idempotent by `userId + entitlementId + sourceType + sourceId`.
- Standalone manual comp grant/revoke is now exposed only through `adminActionClient`; the old
  `userActionClient` arbitrary entitlement grant/revoke web actions were removed after exact reference checks.
- `applyLineageClaimReview` accepts optional admin-supplied comp intent for approvals and grants it inside the
  existing serializable claim-review transaction.
- `claimInvite` reads comp intent only from `invite.meta.comp`, writes invite metadata from the admin invite
  issuance path, and ignores any client-supplied comp data on acceptance.
- The lineage comp seed fixture creates two instructor branches, five ranks, two students per rank per
  instructor, `RankAward` / `LineageTreeMember` records, promoted-by relationships, and mixed premium/elite
  comp grants with deterministic cleanup.
- ADR 0019 was honored: comp work touches `UserEntitlement` only and does not mutate `Membership.status`.

## Decisions resolved

- Kept entitlement keys in repo convention `UPPER_SNAKE`: `LINEAGE_PREMIUM` and `LINEAGE_ELITE`.
- Reused `UserEntitlement(MANUAL_GRANT)` and `AuditLog`; no migration, no separate comp-membership table, and
  no `Membership.status` semantics.
- Treated the old web `grantEntitlement` / `revokeEntitlement` files as a real privilege smell and removed the
  unused client-exposable actions instead of leaving a documented hazard.
- Deferred delegated owner/instructor comp authority, term caps, BBL.com import cohorts, and tier-gated read
  model/card rendering to later epic phases.
- Deferred `fallow-rs/fallow` adoption. Recommendation: evaluate it read-only in a separate quality-tools
  session before adding it to close gates; this session already touched auth/entitlement paths and used the
  established typecheck/lint/unit gates.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/entitlements/lineage-comp.ts` | Added lineage comp entitlement keys, tier schema, entitlement-key expansion, and invite-meta parser. |
| `apps/web/server/entitlements/comp-grants.ts` | Added internal audited transactional `grantComp` / `revokeComp` helpers. |
| `apps/web/server/entitlements/comp-grants.test.ts` | Added admin-gate/idempotency/lifetime-term/audit-before-mutation/revoke/no-membership-mutation coverage. |
| `apps/web/server/entitlements/lineage-comp-seed.test.ts` | Added deterministic fixture coverage for rank spread, mixed tiers, and idempotent re-grant. |
| `apps/web/server/admin/entitlements/actions.ts` | Added `grantUserComp` / `revokeUserComp` admin actions while preserving existing admin S3 entitlement actions. |
| `apps/web/prisma/seed-baseline-platform.ts` | Seeded `LINEAGE_PREMIUM` and `LINEAGE_ELITE` for every brand. |
| `apps/web/server/admin/lineage/claim-review-schemas.ts` | Added optional approval comp input schema. |
| `apps/web/server/admin/lineage/claim-review-actions.ts` | Materializes claim-approval comps inside the existing serializable review transaction. |
| `apps/web/server/admin/lineage/claim-review-actions.test.ts` | Added claim approval with comp audit, no-membership-mutation, and concurrent claim edge coverage. |
| `apps/web/app/admin/lineage/claims/[id]/_components/claim-status-actions.tsx` | Added admin approval controls for optional comp tier and term days. |
| `apps/web/server/admin/invites/schema.ts` | Added admin invite comp tier / term-day schema fields. |
| `apps/web/server/admin/invites/actions.ts` | Writes validated `meta.comp` from admin invite issuance. |
| `apps/web/app/admin/invites/_components/invite-form.tsx` | Added admin invite comp tier and term-day controls. |
| `apps/web/app/admin/invites/_components/invites-table.tsx` | Tightened table typing after invite schema widened. |
| `apps/web/server/invites/actions.ts` | Materializes invite-derived comps during invite acceptance and scopes membership creation to `invite.brand`. |
| `apps/web/server/invites/actions.test.ts` | Added invite comp issuance/acceptance/absent-comp/client-injection coverage. |
| `apps/web/e2e/helpers/seed-lineage-comp-fixture.ts` | Added Playwright-facing wrapper for the deterministic comp fixture. |
| `apps/web/e2e/helpers/seed-lineage-comp-fixture-db.ts` | Added DB worker for multi-rank/multi-student lineage comp seed and cleanup. |
| `apps/web/server/web/entitlement/grant-entitlement.ts` | Removed unused user-scoped arbitrary entitlement grant action. |
| `apps/web/server/web/entitlement/revoke-entitlement.ts` | Removed unused user-scoped arbitrary entitlement revoke action. |
| `docs/sprints/SESSION_0346.md` | Recorded bow-in continuation, implementation, verification, and close evidence. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0346 discoverability row and bumped index metadata. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test server/entitlements/comp-grants.test.ts server/admin/lineage/claim-review-actions.test.ts server/admin/lineage/claim-review-actions.safe-action.test.ts server/invites/actions.test.ts server/entitlements/lineage-comp-seed.test.ts` | Pass: 22 tests / 139 expects. |
| `bun run typecheck` | Pass after implementation and again after lint formatting. |
| `bun run lint` | Pass; Biome fixed formatting in seven files. |
| `bun test --parallel=1 --path-ignore-patterns='e2e/**'` | First run hit an isolated Stripe webhook hook timeout after 434 pass / 1 fail; isolated Stripe file immediately passed; second broad run passed 444 tests / 1363 expects across 80 files. |
| `npx next dev --turbo` + Playwright e2e smoke | Dev server booted on port 3000 and was stopped cleanly. Browser MCP was locked by an existing browser instance and `agent-browser` CLI was unavailable, so Playwright CLI was used. Existing `e2e/lineage/authenticated-lifecycle.spec.ts` still has residual route/timing issues: anonymous edit route expected login redirect but got 404; filtered run then had admin claim-detail navigation reach HTTP 200 at the 20s timeout. Not attributed to the comp-grant change. |
| `bun run wiki:lint` | Pass: 600 markdown files scanned, no lint violations. |
| `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` then `graphify stats .` | Pass: graph refreshed; stats now 9318 nodes, 14463 edges, 1397 communities, 1582 files tracked. |

## Open decisions / blockers

- No schema blocker and no ADR blocker.
- Browser e2e residual is documented for a later lineage-authenticated-lifecycle hardening pass: anonymous edit
  route currently returns 404 instead of the spec's expected login redirect, and the admin claim-detail route can
  hit the 20s Playwright timeout during dev-server JIT even though the route eventually returns 200.
- Delegated comp authority, term caps, BBL.com import cohorts, and tier-gated public/card read surfaces remain
  explicit future-scope items.
- `fallow-rs/fallow` is not adopted into the gate yet; run a read-only trial before making it part of bow-out.

## Next session

### Goal

Harden the remaining BBL launch membership surface: add the read-model tier gates for premium/elite lineage-card
visibility and decide the delegated comp authority matrix without changing the completed audited grant spine.

### First task

Read `docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md`,
`docs/runbooks/domain-features/lineage-listing-runbook.md`, ADR 0011, ADR 0019, and this session. Then map the
premium/elite read checks onto the lineage tree card/query surfaces before adding UI.

## Review log

- `TASK_REVIEW_LOG SESSION_0346`: Doug reviewed SESSION_0346_TASK_01..03 against the stated security boundary.
  Verdict: pass with documented browser-e2e residuals. The key security finding from bow-in was resolved by
  removing the unused arbitrary user-scoped grant/revoke actions and routing manual comp through
  `adminActionClient`. Trusted triggers remain server-derived: claim comp comes from admin review input, invite
  comp comes from stored `invite.meta.comp`, and acceptance clients cannot inject or elevate tier.

## Hostile close review

- **Giddy verdict:** Implementation stayed on the existing entitlement spine and did not fork paid-vs-comp
  access semantics. No schema migration was introduced. The new fixture is deterministic and self-cleaning.
- **Doug verdict:** RBAC/audit boundary passes: standalone comp is admin-gated, comp audits are written before
  entitlement mutation, grants are idempotent, revoke flips entitlement status, and Membership lifecycle remains
  outside the comp path.
- **Risk cap:** score capped by browser-e2e residuals outside the new comp path; unit/integration and broad Bun
  gates are green.
- **Dirstarter/baseline alignment:** Reused existing safe-action clients, Prisma models, transaction patterns,
  seed conventions, and UI primitives. No new Dirstarter baseline layer or ADR-worthy divergence.

## ADR / ubiquitous-language check

- No new ADR required. The work implements ADR 0011's entitlement-first access model and explicitly upholds ADR
  0019 by avoiding `Membership.status` as an access/tier signal.
- No ubiquitous-language update required. The implementation uses existing terms: `UserEntitlement`,
  `Entitlement`, `Membership`, `Invite`, `LineageClaimRequest`, `RankAward`, and `LineageTreeMember`. The new
  labels `LINEAGE_PREMIUM` and `LINEAGE_ELITE` are catalog keys, not new domain entities.
- No new custom component inventory entry required; UI changes compose existing form/select/input/button/table
  primitives.

## Reflections

- The biggest saved failure was treating the old `userActionClient` entitlement actions as code, not just a
  note. Removing unused arbitrary grant/revoke actions closed the privilege-smell before adding the new admin
  path.
- Passing `now` into `grantComp` made audit-before-mutation and term-date assertions deterministic.
- The fixture needed unique promotion dates per visual group and unambiguous rank labels; those were fixed
  before broad gates, preserving deterministic `--parallel=1` behavior.
- The existing Playwright lineage lifecycle spec is useful but currently mixes auth-route expectations and
  dev-server timing. It should be hardened separately so future sessions can rely on it as a clean browser gate.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0346.md` and `wiki/index.md` updated with current `updated` date and `last_agent: codex-session-0346`; no architecture/wiki concept pages created. |
| Backlinks/index sweep | `wiki/index.md` now includes SESSION_0346; no new bidirectional doc relationships beyond the session's existing `backlinks` to the index. |
| Wiki lint | `bun run wiki:lint` passed: 600 markdown files scanned, no lint violations. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Review log and hostile close review present for SESSION_0346_TASK_01..03. |
| Review & Recommend | Next session goal and first task written. |
| Memory sweep | No cross-session memory update needed beyond SESSION_0346 and wiki index; decisions are local to existing ADR 0011/0019 semantics. |
| Next session unblock check | Unblocked: next session can start from the gift/comp epic, lineage listing runbook, ADR 0011/0019, and SESSION_0346. |
| Git hygiene | FS-0024 guard passed: pwd `/Users/brianscott/dev/ronin-dojo-app`, branch `main`, remote `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`, single worktree. Stage/commit/push next; commit hash will be reported at bow-out / see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` ran before the close commit; `graphify stats .` reports 9318 nodes, 14463 edges, 1397 communities, 1582 files tracked. |
