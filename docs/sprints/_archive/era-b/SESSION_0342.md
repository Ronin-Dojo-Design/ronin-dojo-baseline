---
title: "SESSION 0342 - Test-suite stability gate (parallel concurrency bound)"
slug: session-0342
type: session--open
status: closed
created: 2026-06-04
updated: 2026-06-04
last_agent: claude-session-0342
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0341.md
  - docs/knowledge/wiki/test-fail-fix-ledger.md
  - docs/runbooks/sops/sop-test-writing.md
  - docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md
  - docs/knowledge/wiki/component-porting/specs/lineage-adaptive-connector-port-spec.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0342 - Test-suite stability gate (parallel concurrency bound)

## Date

2026-06-04

## Operator

Brian + claude-session-0342 (Petey orchestration -> Cody build -> Doug verify -> Petey close)

## Goal

Restore the repo-wide `bun run test` suite to a reliable green gate by fixing the two-headed root cause of
the SESSION_0341 21-fail + 1-error baseline (mock-leak under serial vs. DB connection contention under
unbounded `--parallel`), then record a lineage test-gap + method/best-practice advisory and reconcile
`sop-test-writing.md` with the finding. Slice 5 (PORTMAP-0006) and any Fallow tooling trial stay deferred.

## Status

Single source of truth is the frontmatter `status:` field — `closed`.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0341.md`.
- Carryover: SESSION_0341 landed PORTMAP-0005 (connector-free lineage carousel rails) and closed with the
  full `bun run test` baseline red: 309 pass / 21 fail / 1 error across 75 files. It created
  `test-fail-fix-ledger.md` (TFF-001..005) and flagged SESSION_0341_FINDING_01: the package test is not a
  trustworthy green gate. Recommended a Doug/Cody test-stability triage before the higher-risk Slice 5
  adaptive-connector spike.
- Date note: system clock for this session is 2026-06-04; frontmatter uses 2026-06-04.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0342.md`.
- Current HEAD at bow-in: `e5ffc1c`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Test tooling / package scripts only; none of the 10 L1 operational layers. |
| Extension or replacement | Extension: tune the existing Bun test runner invocation; no replacement of any Dirstarter capability. |
| Why justified | The current `--parallel` (8-worker default) over-subscribes one Postgres.app instance at 75-file scale. |
| Risk if bypassed | High: an untrustworthy package-test gate would let a Slice 5 connector regression hide behind noise. |

Live docs checked during planning: not applicable for storage/payments/media/content/monetization/blog/auth/
theming/Prisma/hosting. The fix is test-runner concurrency, not a product or schema change.

### Graphify check

- Graph status: current enough for navigation; stats at bow-in: 9215 nodes, 14013 edges, 1397 communities,
  1565 files tracked. Current HEAD: `e5ffc1c`.
- Queries used:
  - `test fixture setup teardown DB integration cleanup FK timeout prisma reset seed lineage billing stripe webhook dev-login course enrollment`
  - `grill-me protocol hostile questions mutual understanding Petey plan forks decisions`
  - `test inventory coverage map which tests exist unit integration e2e domain hub catalog`
- Files selected from graph:
  - `apps/web/prisma/seed-baseline-lineage.ts`, `apps/web/e2e/helpers/seed-lineage*.ts` (shared fixture
    helpers clustered near the failing files).
  - `docs/protocols/petey-plan.md`, `docs/agents/petey.md` (grill / plan protocol).
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof. The
  "test inventory" query returned no graph nodes, so the inventory was located by direct inspection at
  `docs/runbooks/sops/sop-test-writing.md` Section 12.

### Grill outcome

4 forks resolved before code (Petey grill, operator answers):

1. **Session scope:** triage + FIX the shared root cause this session (the gate for Slice 5). Not
   classify-only, not the easy-bugs-only subset, not an autonomous 3-session bundle.
2. **Fallow tooling:** defer to its own session. The scanner the operator wants is `fallow-rs/fallow`
   (Rust dead-code/duplication/complexity/SARIF tool), NOT `npx farrow` (that is the Farrow TypeScript web
   framework). This session only confirms identity + correct install method and writes a no-install note.
3. **Test-gap analysis:** inline advisory only. Write the lineage gap + method-sufficiency + best-practice
   note into the ledger/SOP/session; build no new tests this session.
4. **Orchestration:** inline baton (Petey -> Cody -> Doug -> Petey). No subagents/worktrees; the fix touches
   shared test config + shared SOP docs, so parallel ownership would add reconciliation cost.

### Drift logged

- Drift register checked for DB/test-lane entries: the test instability is tracked in
  `test-fail-fix-ledger.md` (TFF-001..005), not the drift register. No new drift discovered at bow-in.
- Relevant failed-step mitigations checked: FS-0024 (cwd/git guard), FS-0025 (single-push close), and
  Pattern 2 (close-step skipping). No open test-lane FS entry.

## Petey plan

### Goal

Bound the Bun test-runner concurrency so the full suite is reliably green without re-introducing the
`mock.module()` cross-file leak, then reconcile the SOP and record the lineage test-gap + Fallow advisory.

### Tasks

#### SESSION_0342_TASK_01 - Root-cause and fix the test gate

- **Agent:** Cody (root-cause completed during bow-in).
- **What:** Confirm the two-headed root cause and bound `--parallel=N` to the green sweet spot.
- **Steps:**
  1. Reproduce a representative timeout (course-enrollment) and a representative FK/cleanup cluster
     (courses integration, stripe webhooks) isolated and under the full suite. (Done at bow-in.)
  2. Confirm serial (no `--parallel`) re-introduces the ~63 mock-leak failures documented in SOP Section 2.
  3. Tune `--parallel=N` (low N) until the full suite is green, balancing wall-clock.
  4. Update the `test` script in `apps/web/package.json` to the proven `--parallel=N` value.
- **Done means:** `bun run test` from `apps/web` is green (or any residual is explicitly classified), and the
  `test` script encodes the bounded worker count.
- **Depends on:** nothing.

#### SESSION_0342_TASK_02 - Verify, reconcile SOP, advisory, ledger

- **Agent:** Doug -> Petey.
- **What:** Prove green, reconcile `sop-test-writing.md`, resolve the ledger clusters, and write the inline
  advisory.
- **Steps:**
  1. Run `bun run lint`, `bun run typecheck`, and the bounded `bun run test` from `apps/web`.
  2. Update `sop-test-writing.md` Section 2 with the Kaizen finding: `--parallel` prevents mock-leak but its
     unbounded default over-subscribes one Postgres instance at 75-file scale; document the bounded
     `--parallel=N` resolution and the connection-contention failure mode.
  3. Resolve TFF-001..005 in `test-fail-fix-ledger.md` (link this session + the fix).
  4. Write the lineage test-gap + method-sufficiency + industry-standard advisory: the test inventory
     already lives in SOP Section 12; the gap is that lineage UI logic (`canvas-model.ts`, connector
     geometry, carousel composition) has only Playwright e2e proof and no unit coverage before the
     high-risk Slice 5 geometry spike. Note per-worker DB isolation as the scalable next step if wall-clock
     becomes a problem.
  5. Write the Fallow no-install note (identity + correct install method) for a future dedicated session.
- **Done means:** Suite green is proven, SOP Section 2 reconciled, ledger clusters resolved, advisory +
  Fallow note recorded.
- **Depends on:** SESSION_0342_TASK_01.

#### SESSION_0342_TASK_03 - Full close, graph update, commit, push

- **Agent:** Petey.
- **What:** Run the full closing ritual and land one close commit.
- **Steps:**
  1. Hostile close review, ADR / ubiquitous-language check, Reflections, evidence table, memory sweep.
  2. `bun run wiki:lint` clean.
  3. `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` before the commit; record stats.
  4. FS-0024 git guard, single conventional commit, push to `main`.
- **Done means:** Full close evidence complete, graph refreshed, one commit pushed to `main`.
- **Depends on:** SESSION_0342_TASK_02.

### Parallelism

Inline/sequential. The fix touches one shared test script plus shared SOP/ledger docs; the proof depends on
the exact final concurrency value. Subagents or worktrees would add reconciliation cost with no independent
file ownership.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0342_TASK_01 | Cody | Bounded-concurrency fix to a single test script; root-cause already proven. |
| SESSION_0342_TASK_02 | Doug/Petey | Green proof + SOP reconciliation + ledger + advisory documentation. |
| SESSION_0342_TASK_03 | Petey | Full close, graph refresh, single commit/push. |

### Open decisions

- None for implementation. The `--parallel=N` value is an empirical tuning, not a design decision.

### Risks

- The bounded worker count trades wall-clock for reliability. If the green value is slow, the advisory should
  recommend per-worker DB isolation (separate database/schema per worker) as the scalable industry-standard
  path, tracked as a future session rather than expanded here.
- A residual real failure could hide behind the parallel noise. Mitigation: every representative file was
  proven green in isolation at bow-in (course-enrollment, drift-audit, lineage queries, dev-login, stripe
  webhooks, courses integration, node-profile-actions all pass alone), so the clusters are concurrency
  artifacts, not logic bugs.

### Scope guard

- No `LineageConnectorLayer` / Slice 5 / PORTMAP-0006 connector work.
- No new lineage unit/component tests authored this session (advisory only).
- No Fallow/Farrow install, `npx`, or new tooling dependency.
- No schema, server action, query, or product behavior change.
- No mass test rewrite; the fix is the runner concurrency, not the fixture pattern.

### Dirstarter implementation template

- **Docs read first:** `sop-test-writing.md`, `test-fail-fix-ledger.md`, SESSION_0341; no live Dirstarter
  operational layer applies (test tooling).
- **Baseline pattern to extend:** the existing Bun `bun test --parallel` runner and the SOP fixture strategy.
- **Custom delta:** bound the parallel worker count to the green sweet spot.
- **No-bypass proof:** the fix keeps the SOP-mandated process isolation (`--parallel` implies `--isolate`);
  it only caps how many isolated workers contend on the single Postgres.app instance.

## Cody pre-flight

### Pre-flight: Bounded parallel test runner

#### 1. Existing component scan

- Graphify query used: see bow-in. Failing files cluster on shared seed/fixture helpers; each file passes in
  its own process.
- Found: `apps/web/package.json` `test` script is `bun test --parallel --path-ignore-patterns='e2e/**'`;
  `apps/web/lib/test/safe-action-env.ts` installs the standard mock seams; `sop-test-writing.md` Section 2
  already mandates `--parallel` to avoid `mock.module()` cross-file leak.

#### 2. L1 template scan

- Consulted `dirstarter-component-inventory.md`: not applicable (no UI primitive touched).
- Bun flag spot-check from `bun test --help` (v1.3.13): `--parallel=<val>` runs N worker processes (default
  = CPU core count, 8 here) and implies `--isolate`; `--max-concurrency` caps in-file concurrent tests
  (default 20); `--isolate` alone does not prevent module-registry leak (SOP Section 2 history).

#### 3. Composition decision

- Change one line: the `test` script's `--parallel` -> `--parallel=N`. No new files unless a residual
  failure needs a targeted fix.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0341`).
- SOP read: `sop-test-writing.md` (Section 2 runner, Section 4 fixtures, Section 12 inventory).
- Ledger read: `test-fail-fix-ledger.md` (TFF-001..005).

#### 5. Dev environment confirmed

- Test command: `bun run test` from `apps/web` (real Postgres.app `ronindojo_dev`).
- Working directory for app commands: `/Users/brianscott/dev/ronin-dojo-app/apps/web`.

#### 6. FAILED_STEPS check

- Prior failures in this area: none test-specific. FS-0024 (cwd guard) + FS-0025 (single push) apply at
  close.
- Mitigation acknowledged: keep mutating git in `/Users/brianscott/dev/ronin-dojo-app` with the cwd/remote
  guard; one push at close.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0342_TASK_01 | completed | Two-headed root cause proven; `test` script pinned to `--parallel=1`; 4× consecutive green (418 pass / 0 fail / ~67s). |
| SESSION_0342_TASK_02 | completed | Verified green + typecheck + lint; reconciled SOP Section 2 + dev-env runbook; resolved TFF-001..005; wrote BBL-launch-framed advisory + Fallow note; corrected the stale launch doc. |
| SESSION_0342_TASK_03 | completed | Full close, graph update, single commit, push. |

## What landed

- **Test gate fixed and proven.** `apps/web/package.json` `test` script pinned to `--parallel=1`. The full
  suite is now a deterministic green gate: **418 pass / 0 fail across 75 files in ~67s**, reproduced green
  4× consecutively (vs. the SESSION_0341 baseline of 309 pass / 21 fail / 1 error in 110s).
- **Two-headed root cause documented** (not test logic): bare `bun test` leaks `mock.module()` across files
  (~63 false fails); unbounded `--parallel` (default 8 workers) over-subscribes one Postgres.app instance at
  75-file scale (the 21 timeouts/FK-races); `--parallel=2` is fast but flakes ~1/3 on a shared-`brand`
  `StripeCustomer` lookup. `--parallel=1` avoids both.
- **SOP reconciled.** `sop-test-writing.md` Section 2 rewritten from "`--parallel` is mandatory" to the
  full two-headed model + the `--parallel=1` resolution + a per-worker-DB-isolation scaling note. The
  dev-environment runbook test rows updated to match.
- **Ledger resolved.** TFF-001..005 moved to Resolved with the single-root-cause verdict; the ledger now
  points to SOP Section 2 first and is designated the canonical close-router destination for test findings.
- **Discoverability fix (the deeper lesson).** SESSION_0341 re-derived runner behavior that SOP Section 2
  already documented because nothing linked them. Wired bidirectional `pairs_with`/backlinks: ledger ↔ SOP,
  and the BBL-launch cluster (launch doc ↔ `bbl-production-runbook` ↔ `GAP_MATRIX` ↔ ledger).
- **Inline advisory (no tests built):** BBL-launch-framed test-gap analysis + Fallow no-install note — see
  the Advisory section below.
- **Stale launch doc corrected.** `2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md` got a BBL-first current-status
  banner (the May-18 all-brands plan was 17 days stale and misleading). Focused truth-correction, not a
  replan.
- **SESSION status DRY fixed (operator-flagged).** The SESSION template recorded status twice (frontmatter
  `status:` + body `### Status:`) — the root of the recurring status-atomicity slip. Consolidated to a
  single source (frontmatter only; body is a pointer) in `SESSION_TEMPLATE.md` + `closing.md`; this session
  uses the correct `closed` value (not the legacy `closed-full`).
- **Graphify viz pipeline fixed.** Node limit bumped 6000 → 10000 (graph is 9221 nodes) in CLAUDE.md,
  closing.md, and the runbook. Discovered the admin dashboard's `/graphify.html` was a month stale because
  `graphify update` (data) ≠ `graphify export` (the HTML viz) — added a `graphify:viz` script, regenerated
  the viz, documented the distinction, and gated the dashboard link to dev-only (the 5MB codebase map is
  gitignored and must stay off the public web).

## Decisions resolved

- **`--parallel=1` is the gate, determinism over speed.** ~67s for a trustworthy green gate beats ~30s that
  flakes 1/3. Higher worker counts return only with per-worker DB isolation (future session).
- **The 21 failures were concurrency artifacts, not bugs.** Every representative file passes in isolation;
  no lineage/billing/course logic is broken. Slice 5 is unblocked from a test-baseline standpoint.
- **Fallow ≠ Farrow, and Fallow ships npm/MCP.** The scanner is `fallow-rs/fallow` (Rust-native, TS/JS
  analysis). `npx fallow` is valid (so is `npm i -D fallow`, which adds a CLI + LSP + **MCP server** +
  Agent Skill, or `cargo install fallow-cli`). `npx farrow` is the unrelated Farrow web framework. Trial
  stays deferred to its own session.
- **BBL launch is the governing frame.** Future sessions (including Slice 5) are framed toward a safe
  blackbeltlegacy.com cutover; baselinemartialarts.com is the live staging-prod surface.
- **Graphify dashboard viz stays dev-only/local (operator decision).** Not committed (5MB generated codebase
  map — security + bloat); the dashboard link is gated to dev. Build-time generation for a prod viz is
  deferred until after the BBL launch crunch.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/package.json` | `test` script `--parallel` → `--parallel=1` (deterministic green gate). |
| `docs/runbooks/sops/sop-test-writing.md` | Section 2 rewritten to the two-headed concurrency model + `--parallel=1` resolution + per-worker-DB-isolation scaling note; paired to the ledger; frontmatter bumped. |
| `docs/runbooks/dev-environment/dev-environment.md` | Test-all row + verification sequence updated to `bun run test` / `--parallel=1` with the rationale and SOP/ledger pointers. |
| `docs/knowledge/wiki/test-fail-fix-ledger.md` | TFF-001..005 resolved; "read SOP §2 first" pointer; close-router decision; SESSION_0342 sources; SOP/SESSION cross-refs. |
| `docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md` | BBL-first current-status banner (three readiness layers + launch-critical e2e gaps); frontmatter cross-links to runbook + GAP_MATRIX. |
| `docs/product/black-belt-legacy/GAP_MATRIX.md` | Frontmatter cross-links to launch doc + BBL runbook (cluster discoverability). |
| `docs/runbooks/deploy/bbl-production-runbook.md` | Frontmatter cross-links to launch doc + GAP_MATRIX (cluster discoverability). |
| `docs/architecture/ubiquitous-language.md` | Added test-stability terms (bounded parallelism, mock-module leakage, Test Fail Fix Ledger, Fallow vs Farrow). |
| `docs/knowledge/wiki/index.md` | Session row + ledger/SOP status refresh. |
| `docs/sprints/_template/SESSION_TEMPLATE.md` | Status DRY fix: removed the duplicated body `### Status:` line; frontmatter `status:` is now the single source. |
| `docs/rituals/closing.md` | Replaced the FS-0015 status-atomicity rule with a single-source-of-truth note; updated the unclean-recovery status step; graphify node limit 6000 → 10000. |
| `CLAUDE.md` | Graphify refresh command node limit 6000 → 10000. |
| `docs/runbooks/dev-environment/graphify-repo-memory.md` | Node limit 6000 → 10000; documented that `update` ≠ `export` (the dashboard `/graphify.html` viz is a separate artifact refreshed via `bun run graphify:viz`). |
| `package.json` (root) | Added `graphify:viz` script (one-command HTML viz regen at the 10000 limit). |
| `apps/web/app/admin/page.tsx` | Gated the Repo Graph (`/graphify.html`) dashboard link to dev-only — keeps the 5MB codebase map off the public web and avoids a prod 404. |
| `apps/web/public/graphify.html` | Regenerated viz at the 10000 node limit (gitignored, local-only — not committed). |
| `docs/sprints/SESSION_0342.md` | This session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test --parallel=1 --path-ignore-patterns='e2e/**'` (×4) | Green every run: 418 pass / 0 fail / 75 files / ~67–73s. Deterministic. |
| `bun test --parallel=2 …` (×3, diagnostic) | 417–418 pass, flaked 1/3 on `checkout-actions::createProgramEnrollmentCheckout`. Rejected as the gate. |
| `bun test --parallel` (default 8 workers, baseline) | 309 pass / 21 fail / 1 error in 110s (SESSION_0341 baseline reproduced). |
| `bun test` (no `--parallel`, diagnostic) | 206 pass / 64 fail — `mock.module()` leak (`db.user.create is not a function`). Confirms the parallel/isolate path is required. |
| Representative files isolated | All green alone: course-enrollment 10/0, drift-audit 3/0, lineage queries 33/0, dev-login 3/0, stripe webhooks 10/0, courses-integration 11/0, node-profile-actions 5/0. |
| `bun run typecheck` from `apps/web` | Passed: route types generated, `tsc --noEmit` clean. |
| `bun run lint` from `apps/web` | Passed: Biome checked 1170 files, no fixes applied. |
| `bun run wiki:lint` from repo root | (recorded in Full close evidence). |

## Open decisions / blockers

- No implementation blocker. The test gate is green and deterministic.
- **Carried to the BBL-launch frame (not this session):** the launch-critical e2e gaps (registration,
  Stripe checkout, member tier/entitlement lifecycle, authenticated claim, role-scoped editor enforcement)
  and the `canvas-model.ts` / connector-geometry unit gap. See Advisory.
- **BBL deploy blocker (pre-existing):** `bbl-production-runbook.md` still has the unresolved DNS
  source-of-truth confirmation before any DNS change.

## Advisory — test gaps + Fallow (inline, no build this session)

### Where we already have coverage

Lineage *pure logic* is well unit-tested (`lib/lineage/tree-layout.test.ts`, `flatten-lineage.test.ts`,
`rank-progression(.privacy).test.ts`, `search.privacy.test.ts`) plus 13 server-side lineage tests. The test
catalog lives in `sop-test-writing.md` Section 12. The method used recent sessions (isolated repro → focused
command → ledger pointer → Playwright proof) is sound; today's gap was discoverability, not method.

### Unit gaps (fast, in-process — de-risk Slice 5)

- **`apps/web/lib/lineage/canvas-model.ts`** — 5 pure functions (`buildChildGroups`,
  `buildDescendantCounts`, `sortMembers`, `nodeDisplayName`, `memberInitials`), **no test file**, despite
  sibling pure modules being tested. Add `canvas-model.test.ts`.
- **Connector geometry** (`connectorGrowDelay`, `buildSelectedPathTrace`) is pure math embedded in
  `lineage-tree-canvas.tsx`, unexported, only exercised via e2e. **Before Slice 5**, extract the adaptive
  bus/stub geometry into a pure `lib/lineage/connector-geometry.ts` (mirroring `tree-layout.ts`) so the rAF
  re-measure math is unit-testable deterministically rather than only via flaky Playwright.

### Launch-critical e2e gaps (gate a safe BBL cutover — none exist yet)

Priority order for the BBL-launch frame:

1. **Registration / sign-up** — member front door; no `e2e/auth/*`. Highest: every journey depends on it.
2. **Stripe checkout / purchase (test mode)** — program-enrollment + membership checkout → success/cancel.
   Money path. Only a mocked unit test exists today.
3. **Member join → tier → entitlement lifecycle** — user-facing; admin membership e2e exists, user side
   does not; entitlement/tier gating unproven.
4. **Authenticated claim flow** — GAP_MATRIX recommendation #1; BBL-PROFILE-002 lacks authenticated e2e.
5. **Role-scoped editor access enforcement** — BRANCH_EDITOR / NODE_EDITOR (BBL-EDITOR-003/004 flag the UI
   enforcement as missing); security-adjacent.

### Fallow no-install note (for a dedicated session)

- Tool: **`fallow-rs/fallow`** — Rust-native codebase intelligence for TS/JS (free static layer: unused
  code, duplication, circular deps, complexity hotspots, architecture boundaries; optional paid runtime
  layer). Ships an **MCP server + Claude Agent Skill** — a strong fit for this setup.
- Correct invocation: **`npx fallow`** (one-off, no dependency add), `npm i -D fallow`, or
  `cargo install fallow-cli`. **Not** `npx farrow` (that is the unrelated Farrow web framework — corrects
  SESSION_0341's imprecise "Rust tool, npx is wrong" note).
- Recommendation: a dedicated session runs `npx fallow` in summary/no-fix mode first (no dep add), reviews
  dead-code/duplication/circular-deps/complexity output, then decides whether the dev-dep + MCP + CI/SARIF
  wiring earns its keep. Free static layer is enough for the first audit.

## Next session

### Goal

Open the BBL launch-readiness frame: stage a cutover checklist that sequences the GAP_MATRIX partials, the
launch-critical e2e gaps (this session's advisory), and the DNS source-of-truth blocker — and decide whether
lineage Slice 5 (PORTMAP-0006) runs first as a contained spike or after the highest launch gates.

### First task

Bow in, read the launch doc's new BBL-first banner + `bbl-production-runbook.md` + `GAP_MATRIX.md`
"highest-value next tasks", then Petey-plan a BBL cutover checklist: rank the launch-critical e2e gaps
(registration, Stripe checkout, member tier/entitlement, authenticated claim, role-scoped access) against
the GAP_MATRIX partials and the DNS blocker. Use `baselinemartialarts.com` as the staging-prod target for
any live behavior proof. Confirm whether Slice 5 is the immediate next build or is sequenced behind the top
launch gate.

## Review log

### SESSION_0342_REVIEW_01 — Test gate fix + doc reconciliation

- **Reviewed tasks:** SESSION_0342_TASK_01, SESSION_0342_TASK_02, SESSION_0342_TASK_03
- **Dirstarter docs check:** not applicable — test-runner config + docs, no L1 operational layer touched.
- **Verdict:** Strong. The fix is empirically proven (4× deterministic green) and minimal (one script value),
  the root cause is documented where the next agent will actually find it (SOP Section 2 + ledger pointer),
  and the change carries no product/schema risk. The advisory and launch-doc correction expand value without
  expanding build scope, honoring the inline-advisory grill decision.
- **Score:** 9.0/10
- **Follow-up:** Build the launch-critical e2e gaps + `canvas-model`/connector unit tests in the BBL-launch
  frame; run the deferred Fallow audit; consider the staged wiki-consolidation pass.

## Hostile close review

- **Giddy:** pass — Petey grill resolved 4 forks before code; SESSION file carries the plan, pre-flight,
  task IDs, and evidence; single-push close order (FS-0025) and cwd guard (FS-0024) honored.
- **Doug:** pass — gate proven green 4× (`--parallel=1`, 418/0/~67s); typecheck + lint clean; every
  representative file proven green in isolation; failure modes for the rejected configs explicitly recorded.
- **Desi:** not applicable — no UI/UX surface touched this session.
- **Kaizen aggregate:** 9/10 — a small, well-proven, well-documented fix that also closed a discoverability
  gap; capped below 10 only because the launch-critical e2e gaps it surfaced remain unwritten (by design).

## ADR / ubiquitous-language check

- ADR update **not required**. `--parallel=1` is a test-runner configuration decision, not an architectural
  one; its durable record is `sop-test-writing.md` Section 2 (rewritten) + this SESSION + the resolved
  ledger. If per-worker DB isolation is later adopted, that *would* merit an ADR.
- Ubiquitous-language update **required and done**: added *bounded parallelism*, *mock-module leakage*,
  *Test Fail Fix Ledger*, and the *Fallow vs Farrow* distinction to `ubiquitous-language.md` so the
  Fallow/Farrow conflation cannot recur.

## Reflections

The headline fix was one character (`--parallel` → `--parallel=1`), but the real lesson is the one the
operator named: **the docs got lost in the sauce.** `sop-test-writing.md` Section 2 already documented the
mock-leak that mandates the parallel/isolate path, and Section 12 already held the test inventory — yet
SESSION_0341 clustered 21 failures and re-derived the runner behavior from scratch because nothing linked
the ledger to the SOP. The highest-leverage output here is not the script change; it is the bidirectional
`pairs_with`/backlink wiring (ledger ↔ SOP, and the BBL-launch cluster) plus the "read SOP §2 first" pointer
in the ledger. Discoverability beat cleverness.

On *method sufficiency* (operator's question): the recent method — isolated repro → smallest focused command
→ ledger pointer → measured proof — was exactly right and is what let this resolve in one session. The
industry-standard bar we were missing is not in how we test but in **how parallel DB tests scale**:
per-worker database isolation is the standard answer once a single shared Postgres can't absorb the
concurrency. That is now recorded in SOP Section 2 as the next step, not adopted speculatively (YAGNI).

On *lightweight discoverability* (operator's question): frontmatter `pairs_with` + symmetric `backlinks` +
shared tags is the cheapest durable pointer we have — no new hub doc needed; the corrected launch doc *is*
the BBL hub now. We wired the BBL cluster this way this session.

On *consolidation / DRY-YAGNI-KISS* (operator's question): I did not run a full wiki audit (out of scope,
and a speculative sweep would be the opposite of KISS). Candidates I *did* encounter, staged for a dedicated
lightweight pass: `SCHEMA_NEEDS_MANIFEST.md` is already deprecated (and was dropped from the launch doc's
`pairs_with` this session); the launch doc itself is trending historical and could eventually be archived
once the BBL frame earns its own home; and plan/sequencing content is spread across the launch doc,
`program-plan.md`, and the WORKFLOW 5.0 calendar — a consolidation candidate, but each currently has a
distinct role, so it needs care, not a rushed merge. Recommend a single bounded "wiki consolidation +
orphan/duplicate lint" session rather than inline edits. **One DRY fix done this session** (operator-flagged):
the SESSION template recorded status twice — frontmatter `status:` *and* body `### Status:` — which was the
root of the recurring status-atomicity slip and had also drifted to a stale `closed-full` value (closing.md
§310 says `closed`). Consolidated to a single source (frontmatter only; body `## Status` is now a pointer),
updating `SESSION_TEMPLATE.md` + `closing.md` together.

On *BBL launch framing* (operator's directive): from here, sessions are framed toward a safe
blackbeltlegacy.com cutover, with `baselinemartialarts.com` as the live staging-prod surface. The launch
readiness splits cleanly into three layers — deploy (runbook, 1 blocking DNS item), features (GAP_MATRIX),
and tests (this session's e2e gap list) — and Slice 5 belongs *inside* that frame, not beside it.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | All touched docs bumped to `updated: 2026-06-04` + `last_agent: claude-session-0342`: sop-test-writing, dev-environment, test-fail-fix-ledger, launch doc, GAP_MATRIX, bbl-production-runbook, ubiquitous-language, SESSION_0342. First wiki:lint caught dev-environment stale at 2026-06-01; fixed. |
| Backlinks/index sweep | BBL cluster wired bidirectionally via `pairs_with` (launch doc ↔ bbl-production-runbook ↔ GAP_MATRIX); ledger ↔ SOP paired; `wiki/index.md` has the SESSION_0342 row + refreshed ledger status. wiki:lint reports no missing-backlink/orphan violations. |
| Wiki lint | `bun run wiki:lint` from repo root: 594 files, **0 errors, 0 warnings** (after the dev-environment date fix). |
| Kaizen reflection | Present in `## Reflections` — discoverability lesson, method-sufficiency, lightweight cross-link approach, DRY/YAGNI/KISS consolidation candidates, BBL-launch framing. |
| Hostile close review | `## Hostile close review` — Giddy/Doug pass, Desi N/A; Kaizen aggregate 9/10. `SESSION_0342_REVIEW_01` 9.0/10. |
| Review & Recommend | `## Next session` written: open the BBL launch-readiness frame; stage a cutover checklist sequencing GAP_MATRIX partials + launch-critical e2e gaps + the DNS blocker; decide Slice 5 ordering. |
| Memory sweep | No operator-memory update needed — the durable facts (`--parallel=1` gate, two-headed root cause, Fallow≠Farrow) are recorded in `sop-test-writing.md` §2, the ledger, and `ubiquitous-language.md`; the repo records it, so no duplicate memory. |
| Next session unblock check | Unblocked: green deterministic gate; next session's inputs (launch banner, runbook, GAP_MATRIX, advisory) all exist and are cross-linked. |
| Git hygiene | FS-0024 guard: cwd `/Users/brianscott/dev/ronin-dojo-app`, branch `main`, remote `ronin-dojo-baseline`. Single push at close; commit hash reported at bow-out — see `git log`. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` ran before commit; final stats: 9221 nodes, 14043 edges, 1399 communities, 1565 files tracked. Dashboard viz regenerated via `graphify export --format html` (local-only). |
