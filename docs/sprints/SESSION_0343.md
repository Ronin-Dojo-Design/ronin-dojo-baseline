---
title: "SESSION 0343 — BBL launch-readiness frame: cutover checklist + DNS closure + contained build wedge"
slug: session-0343
type: session--open
status: closed
created: 2026-06-04
updated: 2026-06-04
last_agent: codex-session-0343
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0342.md
  - docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md
  - docs/runbooks/deploy/bbl-production-runbook.md
  - docs/product/black-belt-legacy/GAP_MATRIX.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
  - docs/architecture/decisions/0015-domain-hosting-infrastructure.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0343 — BBL launch-readiness frame: cutover checklist + DNS closure + contained build wedge

## Date

2026-06-04

## Operator

Brian + claude-session-0343 -> codex-session-0343 continuation (Petey orchestration -> Cody build -> Desi UX sanity -> Doug verify -> Petey close)

## Goal

Open the BBL launch-readiness frame: stage a sequenced cutover checklist (closing the `blackbeltlegacy.com`
DNS source-of-truth blocker with confirmed evidence), rank the launch-critical e2e gaps against the
GAP_MATRIX partials, and land a contained build wedge — the #1 launch-critical e2e gap (registration smoke)
plus the lineage unit coverage that de-risks Slice 5 (`canvas-model` + extracted `connector-geometry`).
Confirm Slice 5 (PORTMAP-0006) sequences behind the top launch gates.

## Status

Single source of truth is the frontmatter `status:` field — `in-progress` at bow-in, `closed` at bow-out.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0342.md`.
- Carryover: SESSION_0342 pinned the unit test gate to `--parallel=1` (418 pass / 0 fail, deterministic),
  reconciled the SOP + ledger, and wrote a BBL-launch-framed advisory naming the 5 launch-critical e2e gaps
  + the `canvas-model`/connector unit gap, plus a Fallow (`fallow-rs/fallow`, not Farrow) no-install note.
  It corrected the stale May-18 launch doc with a BBL-first banner and wired the BBL doc cluster
  bidirectionally. The unit gate is green; the launch-critical e2e gaps remain unwritten.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0343.md`.
- Current HEAD at bow-in: `6207bde`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git` (FS-0024 pwd +
  remote guard run before this file was written).

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth (Better Auth) is *exercised* by the new registration e2e; hosting/payments are *referenced* by the cutover checklist. No L1 capability is changed. |
| Extension or replacement | Extension: the registration e2e tests the existing Better Auth sign-up flow (no auth code change); the cutover checklist documents the existing Vercel multi-brand + Stripe-webhook entitlement path; lineage geometry extraction is a pure refactor of in-repo code. |
| Why justified | A safe BBL cutover needs proof that the member front door (registration) works end-to-end on the same deployment Baseline already runs; the unit wedge de-risks the Slice 5 geometry spike. |
| Risk if bypassed | High: an unproven registration flow is the single highest-impact launch gap (every journey depends on it); shipping the Slice 5 rAF geometry with only flaky e2e proof risks a silent connector regression. |

Live docs checked during planning: not applicable for a schema/product *change* — auth and payments are
exercised/referenced, not modified. Dirstarter Better Auth + Stripe alignment was already confirmed in the
SESSION_0146 wiring SOP and ADR 0012 (tier auto-grant); re-confirm at Cody pre-flight for the e2e task.

### Graphify check

- Graph status: current (refreshed end of SESSION_0342). Stats at bow-in: **9221 nodes, 14043 edges, 1399
  communities, 1565 files tracked**. Current HEAD: `6207bde`.
- Queries used:
  - `BBL launch production runbook DNS cutover GAP_MATRIX e2e registration Stripe checkout entitlement claim role access`
  - `registration signup auth flow stripe checkout session program enrollment membership tier entitlement lifecycle e2e helper dev-login`
  - `multi-brand brand resolution middleware host domain vercel deployment data-brand BBL baseline brand config theme tokens`
- Files / nodes selected from graph:
  - ADR 0004 (multi-brand `brandId` column), ADR 0006 (one Vercel deployment, all brands), ADR 0012 (tier
    entitlement auto-grant via Stripe webhook), ADR 0015 (Bluehost DNS registrar) — the cutover + proxy
    architecture.
  - `docs/runbooks/sops/sop-data-and-wiring-flows.md` §2 host/brand resolution, §3 auth+brand context, §13
    Stripe checkout flow — the wiring the e2e must exercise.
- Direct inspection after Graphify: `apps/web/e2e/` (no `e2e/auth/` dir — gap #1 confirmed missing),
  `apps/web/lib/lineage/canvas-model.ts` (5 pure fns, no test file), `components/web/lineage/lineage-tree-canvas.tsx`
  (connector geometry embedded), `apps/web/playwright.config.ts` present.
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### DNS recon (resolves the runbook "BLOCKING" item)

Read-only `dig`/`whois` run at bow-in to inform the cutover checklist:

| Domain | NS | Apex A | www | Registrar | Read |
| --- | --- | --- | --- | --- | --- |
| `blackbeltlegacy.com` | `ns1/ns2.bluehost.com` | `151.101.66.159` (Fastly = Flywheel CDN front) | self/apex | Bluehost Inc. | DNS authority = **Bluehost**; current WP origin on **Flywheel** behind Fastly. |
| `baselinemartialarts.com` | `ns1/ns2.bluehost.com` | `216.198.79.1` (Vercel) | `cname.vercel-dns.com` (Vercel) | Network Solutions (NS delegated to Bluehost) | Already fully cut over to Vercel — the literal DNS template BBL will copy. |

Operator confirmation: "Bluehost owns the domain and it is also on the getflywheel." This matches the recon:
Bluehost is registrar + DNS host (per ADR 0015), Flywheel hosts the WordPress origin. The runbook's
"`blackbeltlegacy.com` DNS source of truth is unconfirmed" blocker is therefore **resolved** —
NS = `bluehost.com` is the runbook's "proceed per vercel-domain-setup-runbook" branch. Cutover = repoint
apex A (Fastly/Flywheel -> Vercel) + `www` CNAME (-> `cname.vercel-dns.com`) **at Bluehost**, not a zone
migration. Rollback = revert apex A to `151.101.66.159`.

### Grill outcome

4 forks resolved before code (Petey grill, operator answers):

1. **Session shape:** Plan + contained build wedge. Stage the cutover checklist AND land real progress
   (DNS closure + registration e2e gap #1 + lineage unit coverage). Not pure planning, not an autonomous run.
2. **Baseline money-path proxy:** **Live + works in prod.** A real checkout -> webhook -> entitlement cycle
   has run on the live `baselinemartialarts.com` deployment. Because BBL and Baseline share one Vercel
   deployment + one brand-scoped DB + the same Stripe/Resend infra (ADR 0004/0006/0012), a journey proven on
   Baseline is proven on the exact code+infra BBL will use. So the Stripe-checkout e2e gap (#2) can be proven
   against Baseline staging-prod, not only locally.
3. **Slice 5 ordering:** Sequenced **behind** the top launch gates (lineage viewer already works —
   BBL-LINEAGE-001/002 done — so the adaptive-connector spike is polish, not a launch gate). But extract
   `connector-geometry.ts` + unit-test it **now** (cheap de-risk per the SESSION_0342 advisory).
4. **Orchestration:** Inline baton (Petey -> Cody -> Desi -> Doug -> Petey). No subagents/worktrees this
   session — the build wedge is small and the tasks share the SESSION ledger + the BBL doc cluster.

### Drift logged

- **Graphify stale node labels (not a file drift):** the BBL/runbook query returns nodes for
  `docs/runbooks/bbl-production-runbook.md`, `.../white-label-site-runbook.md`,
  `.../vercel-domain-setup-runbook.md` at the *root* `runbooks/` path, but those files exist **only** under
  `docs/runbooks/deploy/`. Confirmed by `ls`. This is stale graph labels from a prior move, not duplicate
  files — a `graphify update .` at close will refresh them. No action beyond the close-time graph refresh.

## Petey plan

### Goal

Stage the sequenced BBL cutover checklist (DNS blocker closed with evidence; e2e gaps ranked against
GAP_MATRIX partials; Slice 5 sequenced behind the gates) and land a contained build wedge: registration e2e
smoke (gap #1) + lineage unit coverage (`canvas-model` + extracted `connector-geometry`).

### Tasks

#### SESSION_0343_TASK_01 — BBL cutover checklist + DNS closure + e2e ranking + Slice 5 ordering

- **Agent:** Petey
- **What:** The named planning deliverable — a single sequenced launch-readiness checklist spanning the
  three readiness layers (deploy/DNS, features, tests), with the DNS blocker resolved and the e2e gaps ranked
  against the GAP_MATRIX partials.
- **Steps:**
  1. Create `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md` — the cross-layer launch sequencer (joins
     the BBL doc cluster via `pairs_with`/backlinks: launch doc, runbook, GAP_MATRIX).
  2. Record the resolved DNS source-of-truth (Bluehost authority; Flywheel WP origin; repoint-not-migrate;
     rollback value `151.101.66.159`) and update the runbook's "⚠️ OPEN — resolve before any DNS change"
     section to "RESOLVED — Bluehost confirmed (SESSION_0343)".
  3. Rank the 5 launch-critical e2e gaps against the GAP_MATRIX partials + the (now-closed) DNS blocker, and
     state explicitly that the Baseline staging-prod surface proxies registration + the money path (operator
     confirmed live) while Resend per-domain DKIM, the 301 redirect map, and content migration stay
     BBL-only.
  4. Record the Slice 5 ordering decision (behind launch gates; geometry extraction now).
- **Done means:** `CUTOVER_CHECKLIST.md` exists, wired into the BBL cluster; the runbook DNS blocker section
  is marked resolved; the checklist ranks the e2e gaps and names the Baseline proxy coverage boundary.
- **Depends on:** nothing.

#### SESSION_0343_TASK_02 — Lineage unit coverage wedge (de-risk Slice 5)

- **Agent:** Cody -> Doug
- **What:** Add the missing pure-logic unit coverage the SESSION_0342 advisory named, before the (later)
  Slice 5 geometry spike.
- **Steps:**
  1. Write `apps/web/lib/lineage/canvas-model.test.ts` covering the 5 exported pure fns (`nodeDisplayName`,
     `sortMembers`, `buildChildGroups`, `buildDescendantCounts`, `memberInitials`).
  2. Extract the pure connector geometry from `components/web/lineage/lineage-tree-canvas.tsx` into
     `apps/web/lib/lineage/connector-geometry.ts` (mirroring `tree-layout.ts`) — `connectorGrowDelay` +
     the selected-path trace math — keeping the component behavior identical (import the extracted fns).
  3. Write `apps/web/lib/lineage/connector-geometry.test.ts` for the extracted math.
  4. Run the unit gate (`bun run test`, `--parallel=1`) — must stay green; typecheck + lint clean.
- **Done means:** Two new test files exist and pass; `connector-geometry.ts` extracted with the component
  importing it; full unit suite still deterministic-green; typecheck + lint clean.
- **Depends on:** nothing (independent of TASK_01; runs after it in the inline baton).

#### SESSION_0343_TASK_03 — Registration e2e smoke (launch-critical gap #1) + Baseline proxy procedure

- **Agent:** Cody -> Desi -> Doug
- **What:** The #1 launch-critical e2e gap — prove the member front door (registration/sign-up) end-to-end,
  and document how to re-run the same journey against the Baseline staging-prod surface.
- **Steps:**
  1. Add `apps/web/e2e/auth/registration.spec.ts` exercising the Better Auth sign-up flow against the local
     dev server (follow the existing `e2e/` harness patterns: `global-setup`, helpers, brand/host).
  2. Use the existing dev-login/seed helpers where they apply; keep the spec self-cleaning (no shared-state
     pollution — heed the SESSION_0342 shared-`brand` `StripeCustomer` note).
  3. Document the Baseline staging-prod proxy procedure in `CUTOVER_CHECKLIST.md`: how to run the
     registration (and the operator-confirmed live checkout) journey against `baselinemartialarts.com`, and
     the cleanup expectation for proxy-test accounts in the shared prod DB.
  4. Run the spec; capture pass evidence. Desi sanity-checks the journey copy/empty-states; Doug verifies.
- **Done means:** `e2e/auth/registration.spec.ts` exists and passes locally; the Baseline proxy procedure is
  documented; Desi/Doug sign off.
- **Depends on:** SESSION_0343_TASK_01 (the checklist doc it writes into).

#### SESSION_0343_TASK_04 — Full close: Fallow grill, ADR check, graph update, commit + push

- **Agent:** Petey
- **What:** Run the full closing ritual including optional deep items, with a first-time Fallow grill.
- **Steps:**
  1. Hostile close review (Giddy/Doug/Desi), Reflections, evidence table, memory sweep, document any new
     components in `custom-component-inventory.md`.
  2. **Fallow grill (operator-requested, first introduction):** grill 1–2 rounds on whether to run a
     read-only `npx fallow` summary pass at this bow-out (no dep add, no commit impact) vs. keep it deferred
     to its own session per the SESSION_0342 note.
  3. ADR check: decide whether the resolved DNS source-of-truth merits an ADR 0015 note/update.
  4. `bun run wiki:lint` clean; `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` (refreshes the stale node
     labels noted in Drift); record stats.
  5. FS-0024 git guard; single conventional commit; push to `main` (one push at close, FS-0025).
- **Done means:** Full close evidence complete, Fallow decision recorded, graph refreshed, one commit pushed.
- **Depends on:** SESSION_0343_TASK_01..03.

### Parallelism

Inline / sequential (operator chose the inline baton). TASK_02 and TASK_03 touch disjoint files
(`lib/lineage/*` vs `e2e/auth/*`) and *could* parallelize, but the wedge is small and both write evidence
into the shared SESSION ledger + checklist, so subagents/worktrees would add reconciliation cost with no
real wall-clock win. Order: TASK_01 -> TASK_02 -> TASK_03 -> TASK_04.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0343_TASK_01 | Petey | Planning/sequencing deliverable; no production code. |
| SESSION_0343_TASK_02 | Cody -> Doug | Pure/near-pure lineage unit work + a contained refactor; Doug verifies green. |
| SESSION_0343_TASK_03 | Cody -> Desi -> Doug | New e2e spec on the auth surface; Desi journey sanity, Doug verify. |
| SESSION_0343_TASK_04 | Petey | Full close, Fallow grill, ADR check, graph refresh, single commit/push. |

### Open decisions

- **Fallow trial at bow-out:** deferred to the TASK_04 close grill (operator asked to grill it there, first
  introduction). Not pre-locked.
- **ADR for resolved DNS:** decided at close (likely a one-line ADR 0015 confirmation note, not a new ADR).

### Risks

- **Wall-clock / scope:** four tasks in an inline session is the upper bound. **Cut-line if time runs short:**
  drop the `connector-geometry.ts` *extraction* (TASK_02 steps 2–3) to next session — it is the least
  time-critical item because Slice 5 is sequenced *after* the launch gates. Keep `canvas-model.test.ts`
  (TASK_02 step 1), the checklist (TASK_01), and the registration e2e (TASK_03), which are on the launch
  critical path.
- **e2e flakiness:** new Playwright specs can be brittle; the spec must be self-cleaning to avoid the
  shared-state contention class that bit SESSION_0341/0342. Keep it isolated; do not re-introduce
  cross-file/state leakage.
- **Refactor regression:** extracting connector geometry must keep `lineage-tree-canvas.tsx` behavior
  identical — the only proof today is e2e, so verify the tree still renders + root-path highlight still works
  (Playwright lineage spec) after extraction.

### Scope guard

- No Slice 5 / PORTMAP-0006 `LineageConnectorLayer` adaptive-connector build (only the geometry extraction +
  unit test that *precedes* it).
- No e2e gaps #2–#5 built this session (Stripe checkout, member tier/entitlement, authenticated claim,
  role-scoped access) — they are ranked in the checklist, not implemented.
- No actual DNS change, domain attach, or Vercel/Resend mutation — the checklist documents the sequence; the
  cutover itself is a separate gated action.
- No schema, server action, or product behavior change. The registration e2e tests existing auth; the
  geometry extraction is behavior-preserving.
- No Fallow/Farrow dependency add or `npx` install — only a possible read-only summary run, decided at close.

### Dirstarter implementation template

- **Docs read first:** ADR 0004/0006/0012/0015 + `sop-data-and-wiring-flows.md` §2/§3/§13 (cached, sufficient
  — these are in-repo wiring docs, not the live Dirstarter pages, since nothing is being added to an L1
  layer). Re-confirm Better Auth alignment at the TASK_03 pre-flight if the e2e touches sign-up internals.
- **Baseline pattern to extend:** the existing `apps/web/e2e/` Playwright harness (global-setup/teardown +
  helpers + brand/host) and the `lib/lineage/*.test.ts` pure-logic test pattern (`tree-layout.ts`).
- **Custom delta:** a registration e2e spec where none exists; extracted `connector-geometry.ts` mirroring
  `tree-layout.ts`; the cross-layer `CUTOVER_CHECKLIST.md`.
- **No-bypass proof:** nothing replaces a Dirstarter capability — Better Auth and Stripe stay as-is and are
  exercised/referenced; the new artifacts are tests + docs + a behavior-preserving refactor.

## Cody pre-flight

### Pre-flight: Lineage unit wedge (TASK_02)

#### 1. Existing component scan

- Graphify query used: see bow-in (lineage + e2e queries).
- Found: `lib/lineage/canvas-model.ts` exports 5 pure fns + 3 types, **no test file**; sibling pure modules
  (`tree-layout.ts`, `flatten-lineage.ts`, `rank-progression.ts`, `search.ts`) all have tests. Connector
  geometry (`connectorGrowDelay`, selected-path trace) is embedded + unexported in
  `components/web/lineage/lineage-tree-canvas.tsx`.

#### 2. L1 template scan

- Consulted `dirstarter-component-inventory.md`: not applicable (no UI primitive added; pure-logic tests +
  a lib refactor).
- Closest in-repo pattern: `lib/lineage/tree-layout.ts` + `tree-layout.test.ts` (pure module + colocated
  test).

#### 3. Composition decision

- New file `canvas-model.test.ts` (test only). New file `connector-geometry.ts` (extracted pure math) +
  `connector-geometry.test.ts`; `lineage-tree-canvas.tsx` imports the extracted fns (no behavior change).

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0342` advisory).
- ADR read: none required (pure logic). Runbook consulted: `sop-test-writing.md` §2 (`--parallel=1` gate),
  §12 (test inventory).

#### 5. Dev environment confirmed

- Test command: `bun run test` (`--parallel=1`) from `apps/web`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app/apps/web`.

#### 6. FAILED_STEPS check

- Prior failures in this area: none for pure-logic tests. FS-0024 (cwd guard) + FS-0025 (single push) apply
  at close.

### Pre-flight: Registration e2e (TASK_03)

#### 1. Existing component scan

- Found: `apps/web/e2e/` has `admin/`, `lineage/`, `privacy/`, `tournaments/`, `smoke.spec.ts`,
  `global-setup.ts`, `global-teardown.ts`, `helpers/` — but **no `e2e/auth/`** (gap #1 confirmed). Dev-login
  + seed helpers exist (used by SESSION_0326/0342 proofs).

#### 2. L1 template scan

- Consulted `dirstarter-docs-inventory.md` (auth alignment): Better Auth is the L1 owner; the e2e *tests* it,
  does not modify it. Re-confirm the sign-up route/action shape before writing the spec.

#### 3. Composition decision

- New file `e2e/auth/registration.spec.ts` following the existing harness; reuse helpers; self-cleaning.

#### 4. Lane docs loaded

- SOP read: `sop-data-and-wiring-flows.md` §3 (auth + brand context). `playwright.config.ts` reviewed.

#### 5. Dev environment confirmed

- Dev server: `cd apps/web && npx next dev --turbo` (FS-0002). Playwright via the existing config.
- Brand/host for testing: local app host; Baseline staging-prod (`baselinemartialarts.com`) for the
  documented prod-side proxy run.

#### 6. FAILED_STEPS check

- FS-0002 (dev server command), FS-0024 (cwd guard), FS-0025 (single push). Avoid the SESSION_0341/0342
  shared-state e2e contention — keep the spec isolated + self-cleaning.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0343_TASK_01 | completed | BBL cutover checklist staged; DNS source-of-truth blocker reconciled as Bluehost DNS authority + Flywheel/Fastly WP origin; e2e gaps ranked; Slice 5 sequenced behind launch gates. |
| SESSION_0343_TASK_02 | completed | Lineage unit wedge landed: `canvas-model.test.ts`, extracted `connector-geometry.ts`, connector timing/path tests, and lineage e2e render proof. |
| SESSION_0343_TASK_03 | completed | Registration e2e smoke landed for the magic-link member front door; auth submit + identity-shell creation fixed; Baseline proxy procedure documented. |
| SESSION_0343_TASK_04 | completed | Full close executed: docs reconciled, ADR check completed, wiki-lint run, Graphify refreshed, single commit/push staged. |

## What landed

- `CUTOVER_CHECKLIST.md` now sequences BBL deploy/DNS, GAP_MATRIX partials, launch-critical e2e gaps, and
  the Slice 5 ordering decision.
- Registration e2e gap #1 is covered by `e2e/auth/registration.spec.ts`, using the live Better Auth
  magic-link token path and asserting Better Auth session + Passport + DirectoryProfile shell creation.
- Fixed two registration bugs the e2e exposed: the auth form button is explicitly `type="submit"`, and the
  magic-link auth hook now creates identity shells from `context.newSession.user`.
- Extracted lineage connector timing/path math into `lib/lineage/connector-geometry.ts` with focused unit
  tests, and added `canvas-model` tests for the previously uncovered pure helpers.
- Tightened the public rank-redaction e2e fixture by separating visible and hidden control rank systems so
  public belt-ladder serialization cannot leak hidden-control labels as fixture noise.
- Reconciled BBL DNS docs: launch banner, runbook, and ADR 0015 now agree that Bluehost is DNS authority,
  Flywheel is the current WP origin behind Fastly, and no nameserver migration is needed.

## Decisions resolved

- Slice 5 / PORTMAP-0006 stays behind the highest launch gates. The cheap unit wedge landed now; the
  adaptive connector spike remains a later contained spike.
- Baseline remains the staging-prod proxy for shared-code behavior (`baselinemartialarts.com`): registration,
  checkout/entitlement, and RBAC can be proven there; BBL-only items are Resend DKIM, redirect map, and WP
  content migration.
- No Fallow run this session. Operator clarified no Fallow conversation was needed; keep Fallow as a
  future optional cleanliness session, with no dependency added here.
- ADR 0015 did not need a new ADR, but it did need a clarification note: BBL already delegates to Bluehost
  nameservers; Flywheel is the origin behind Fastly until DNS records are repointed to Vercel.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/auth/login-form.tsx` | Explicit submit button type for the magic-link form. |
| `apps/web/lib/auth.ts` | Added idempotent identity-shell creation from Better Auth magic-link sessions. |
| `apps/web/e2e/auth/registration.spec.ts` | New launch-critical registration e2e smoke. |
| `apps/web/e2e/helpers/auth-db.ts` | Added magic-link token read, registered-user readback, and email-based cleanup commands. |
| `apps/web/e2e/helpers/auth.ts` | Added Playwright-facing helpers for registration token/readback/cleanup. |
| `apps/web/lib/lineage/canvas-model.test.ts` | New unit coverage for lineage canvas pure helpers. |
| `apps/web/lib/lineage/connector-geometry.ts` | Extracted selected-path trace and connector timing/edge math. |
| `apps/web/lib/lineage/connector-geometry.test.ts` | New unit coverage for extracted connector geometry. |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Imports extracted connector geometry; visual behavior preserved. |
| `apps/web/e2e/helpers/seed-lineage-rank-redaction-db.ts` | Fixture now uses separate visible/hidden rank systems to avoid false leak assertions. |
| `apps/web/e2e/helpers/seed-lineage-rank-redaction.ts` | Fixture type carries all rank-system IDs for cleanup. |
| `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md` | New BBL cutover sequencer + Baseline proxy procedure. |
| `docs/runbooks/deploy/bbl-production-runbook.md` | DNS blocker marked resolved and linked to the checklist. |
| `docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md` | BBL-first banner reconciled with DNS closure and registration e2e status. |
| `docs/product/black-belt-legacy/GAP_MATRIX.md` | Reciprocal checklist link added. |
| `docs/architecture/decisions/0015-domain-hosting-infrastructure.md` | BBL Bluehost/Flywheel clarification added. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Lineage inventory updated for extracted connector geometry. |
| `docs/knowledge/wiki/test-fail-fix-ledger.md` | Backlink to the cutover checklist added. |
| `docs/knowledge/wiki/index.md` | Product/session index updated for SESSION_0343 and the checklist. |
| `docs/sprints/SESSION_0343.md` | Session close ledger completed. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun test lib/lineage/canvas-model.test.ts lib/lineage/connector-geometry.test.ts` | 11 pass / 0 fail. |
| `cd apps/web && bun run lint` | Passed; Biome reported no fixes needed on rerun. |
| `cd apps/web && bun run test` | 429 pass / 0 fail, 1250 assertions across 77 files. |
| `cd apps/web && bun run typecheck` | Passed. |
| `cd apps/web && bunx playwright test e2e/auth/registration.spec.ts --project=chromium` | 1 passed. |
| `cd apps/web && bunx playwright test e2e/lineage/public-visibility.spec.ts --project=chromium` | 3 passed. |
| `cd apps/web && bunx playwright test e2e/lineage/public-rank-redaction.spec.ts --project=chromium` | 2 passed. |
| `bun run wiki:lint` | Passed: 596 markdown files scanned, no lint violations. |

## Open decisions / blockers

- No actual DNS, Vercel domain attach, Resend, or production data mutation happened. BBL cutover remains a
  separately gated production action.
- Launch-critical e2e gaps #2–#5 remain: Stripe checkout, entitlement lifecycle, authenticated claim, and
  role-scoped editor access.
- BBL-only launch items remain outside the Baseline proxy: WP content inventory/migration, 301 redirect map,
  and `blackbeltlegacy.com` Resend DKIM.
- Non-blocking residual observation: the auth page emitted a recurring hydration warning tied to Google
  image class output during Playwright runs; it did not block the registration proof and was not introduced
  by the auth fix.

## Next session

### Goal

Build the next highest BBL launch gate: Stripe checkout success/cancel plus member tier/entitlement
lifecycle e2e proof, using Baseline as the staging-prod proxy and the local/test-mode harness first.

### Inputs to read

- `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md`
- `docs/runbooks/deploy/bbl-production-runbook.md`
- `docs/product/black-belt-legacy/GAP_MATRIX.md`
- `docs/architecture/decisions/0012-admin-crud-routing-pattern.md` and the Stripe webhook/checkout tests
- `apps/web/e2e/auth/registration.spec.ts` and `apps/web/e2e/helpers/auth.ts`

### First task

Graphify query the Stripe checkout/entitlement flow, inspect the existing checkout action + webhook tests,
then Petey-plan a local e2e that proves checkout success/cancel and the resulting entitlement shell without
polluting shared prod state.

## Review log

### SESSION_0343_REVIEW_01 — BBL launch gate #1 + lineage unit wedge

- **Reviewed tasks:** SESSION_0343_TASK_01, SESSION_0343_TASK_02, SESSION_0343_TASK_03, SESSION_0343_TASK_04
- **Dirstarter docs check:** Not required for a new L1 capability. Better Auth/Stripe/Vercel remained the
  baseline owners; this session exercised/fixed local integration behavior and updated launch docs without
  changing the upstream capability model.
- **Verdict:** Strong. The checklist resolves the DNS source-of-truth blocker into an actionable Bluehost
  record-change path; registration is now a real e2e gate instead of an advisory; and the lineage unit wedge
  reduces Slice 5 risk without moving Slice 5 ahead of launch gates. The e2e found and fixed an actual
  magic-link registration shell bug, then the full unit/type/lint/e2e gates stayed green.
- **Score:** 9.5/10
- **Follow-up:** Build e2e gaps #2/#3 together if possible: checkout success/cancel plus webhook-driven
  entitlement lifecycle.

## Hostile close review

**Giddy:** The session avoided the tempting Slice 5 spike and did the launch-critical thing first. The only
scope expansion was justified because the registration e2e exposed real product breakage.

**Doug:** Verification is materially better than the plan required: focused lineage tests, full unit suite,
typecheck, lint, auth e2e, and two lineage Playwright proofs. The rank-redaction fixture repair is correct
because it removes a test-data false positive rather than weakening the assertion.

**Desi:** Registration journey copy and landing state were sanity-checked through the existing `/auth/login`
and `/me` surfaces. No new UI chrome was added.

**Findings (severity ≥ medium):** None introduced. Remaining launch gaps are explicitly carried forward in
the checklist and next-session plan.

## ADR / ubiquitous-language check

- ADR update: `docs/architecture/decisions/0015-domain-hosting-infrastructure.md` was amended with the
  SESSION_0343 BBL clarification (Bluehost NS already in place; Flywheel is the WP origin behind Fastly).
- No new ADR needed: the architecture decision did not change; the confirmed DNS source-of-truth resolves an
  operational blocker.
- No ubiquitous-language update needed. Existing terms still apply: Passport, DirectoryProfile, Membership,
  and RegistrationEntry. Registration e2e proved Passport + DirectoryProfile shell creation.

## Reflections

- The registration e2e was worth building before the Stripe e2e: it caught a silent submit problem and a
  missing identity-shell path that unit tests had not covered.
- Better Auth magic-link verification writes the user/session through `context.newSession`, not the same
  body shape as callback paths. Future auth hooks should prefer explicit provider-specific assertions over
  assuming one hook payload shape.
- The rank-redaction fixture failure was a useful reminder that privacy e2e specs must isolate test data so
  the assertion checks product behavior, not shared fixture vocabulary.
- Graphify-first discovery is effective for choosing the next files, but exact-path doc reconciliation still
  needs direct inspection at close to catch stale frontmatter links.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION, cutover checklist, runbook, launch banner, GAP_MATRIX, ADR 0015, component inventory, test ledger, and wiki index stamped `updated: 2026-06-04` / `last_agent: codex-session-0343`; code files have no frontmatter. |
| Backlinks/index sweep | Checklist wired into launch/runbook/GAP_MATRIX/test-ledger/ADR cluster; wiki index gained Product Docs + SESSION_0343 rows. |
| Wiki lint | `bun run wiki:lint` passed: 596 markdown files scanned, no lint violations. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0343_REVIEW_01` + Giddy/Doug/Desi review present. |
| Review & Recommend | Next session goal, inputs, and first task written. |
| Memory sweep | No operator memory update needed; durable facts captured in ADR 0015, runbook, checklist, and this SESSION. |
| Next session unblock check | Unblocked; no user input required before local Stripe/entitlement e2e planning. |
| Git hygiene | `main`, one conventional commit planned; hash reported at bow-out — see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` passed; final stats: 9232 nodes, 14050 edges, 1395 communities, 1570 files tracked. |
