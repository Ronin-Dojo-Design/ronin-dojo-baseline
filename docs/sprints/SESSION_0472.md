---
title: "SESSION 0472 — BBL Lane: membership-tier access model (plan-first grill)"
slug: session-0472
type: session--plan
status: in-progress
created: 2026-06-29
updated: 2026-06-29
last_agent: claude-session-0471
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0471.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0472 — BBL Lane: membership-tier access model (plan-first grill)

> **PRE-STAGED at SESSION_0471 close** (operator-supplied lane). This session is **plan-first**: a Petey
> grill that ratifies the operator's 3-tier access model, reconciles it against what BBL already ships
> (especially the **live** Premium/Elite paid tiers), and locks scope **before** Cody writes any code.
> The matrix below is a **first-pass hypothesis** — every "ships/new" cell MUST be verified against the
> BBL SoT set + the live app during preflight (never assert present/missing from memory).

## Date

2026-06-29 (pre-staged; executes next session)

## Operator

Brian + claude-session-0472

## Goal

Ratify the BBL membership-tier access model (Public free / Standard $65 / Black Belt $45) and produce a
locked **tier → capability → reuse-vs-build matrix**: confirm pricing intent, reconcile the proposed tiers
with the LIVE Premium/Elite Stripe products (the real risk + migration lane), define the tier↔belt-rank
coupling rule, and size the one genuinely-new surface (the Instructor Hub, 7 tabs). No code until the grill
resolves the four open decisions.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0471.md` (Giddy git-hygiene + hostile-repo-review close).
- Carryover: SESSION_0471 staged this lane in its Next-session block. The repo-health/git-hygiene sprint
  (S48) is complete (lean-out exhausted). This opens the BBL product lane (S49).
- **BBL read-path (opening.md §0 — the ONLY first-read for BBL):** `BBL-SOT-Spec.md` → `SOT-ADR.md` →
  `PRD.md` → `STORIES.md` → `CUTOVER_CHECKLIST.md` → `GAP_MATRIX.md` (re-verify GAP_MATRIX vs the live app).

### Branch and worktree

- Branch: `main` (or a `session-0472-bbl-tiers` worktree if the build half is dispatched)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: TBD (verify clean at pickup)
- Current HEAD at bow-in: TBD

## Petey plan

### Goal

Ratify the tier model + lock the reuse-vs-build matrix via a grill on four open decisions; hand a scoped,
migration-aware slice to Cody only after the grill closes.

### The operator's proposed model (the input to ratify)

| Tier | Price | Gate | Surfaces |
| --- | --- | --- | --- |
| **Public** | free, no account | none | Home (lineage tree + Dirty Dozen + videos) · Directory (browse/search approved members by belt & academy) · Public Profile (verified profile + lineage + promotion history) · Academies (browse) · Seminars (browse + register) · Learn (free articles + public videos) |
| **Standard** | $65/yr | active paid (White/Blue/Purple/Brown) | all Public + Private Profile (edit info, upload photo, belt history + lineage tree) · profile edit (belt/rank change → admin re-approval) · certificate download · 20% in-network seminar discount · members-only Video Library (active-paid-gated) |
| **Black Belt** | $45/yr | active paid + awarded black belt | all Standard + **Instructor Hub (7 tabs):** My Academy dashboard · Lineage editor · Student tracker · Academy info management · Seminar creation/mgmt + Calendar · Technique library · Instructor Portal (email login → profile editor + view academy's students) |

### Tier → capability → reuse-vs-build matrix (FIRST-PASS — verify every row in preflight)

| Capability | Tier | Hypothesis | Likely reuse target / module |
| --- | --- | --- | --- |
| Home (lineage tree + Dirty Dozen + videos) | Public | ships | landing + lineage canvas (View A timeline / View B) + video embeds |
| Directory (search by belt & academy) | Public | ships | directory module + `ListingCard` + facet bar |
| Public Profile (verified profile + lineage + promo history) | Public | ships | `projectPublicPassport` DTO + lineage drawer (opens for everyone → claim CTA) |
| Academies (browse listings) | Public | ships | directory org/school listings (Affiliation-backed) |
| Seminars (browse + register) | Public | **verify** | seminars/events module — confirm public register flow exists |
| Learn (free articles + public videos) | Public | ships | blog/content + public video |
| Private Profile (edit, photo, belt history, lineage) | Standard | ships | profile editor + avatar upload + `RankAward` history |
| Belt/rank edit → admin re-approval | Standard | ships | profile/claim re-approval (`ProfileClaimRequest` / rank-change review) |
| Certificate download | Standard | **likely new** | cert generation — confirm none exists |
| 20% in-network seminar discount | Standard | **new** | seminar pricing + entitlement-gated discount |
| Members-only Video Library (active-paid gate) | Standard | ships (gate) | comp gate + video library + entitlement check |
| Instructor Hub — My Academy dashboard | Black Belt | **new shell** | dashboard composing existing academy/roster data |
| Instructor Hub — Lineage editor | Black Belt | ships | lineage canvas `editMode` (existing) |
| Instructor Hub — Student tracker | Black Belt | **maps to platform module** | CRM/leads module (the one Mammoth exercises — North Star: any feature on any project) |
| Instructor Hub — Academy info management | Black Belt | ships | org/school profile edit (Affiliation) |
| Instructor Hub — Seminar creation/mgmt + Calendar | Black Belt | **partial/new** | seminars module + a calendar surface (likely new) |
| Instructor Hub — Technique library | Black Belt | **WIP exists** | `codex/technique-graph-curriculum` branch (kept at 0471) + video — DON'T clean-room |
| Instructor Hub — Instructor Portal (email login + view students) | Black Belt | ships (auth) + new (student roster view) | Better Auth magic-link + academy student roster (via LineageTree/Affiliation, NOT Membership) |

### Tasks

#### SESSION_0472_TASK_01 — Petey: read the BBL SoT set, then grill the 4 open decisions

- **Agent:** Petey
- **What:** Resolve the four open decisions below; produce the locked tier→capability→reuse-vs-build matrix.
- **Steps:** read the SoT set (§0 read-path) → grill pricing intent (#1), the LIVE-tier reconciliation + migration (#2), the tier↔rank coupling (#3), reuse-first inventory (#4) → lock scope.
- **Done means:** 4 decisions resolved; matrix verified vs SoT + live app; build slice scoped + sequenced.
- **Depends on:** nothing.

#### SESSION_0472_TASK_02 — Petey/Giddy: Stripe-tier reconciliation + migration plan (the real risk)

- **Agent:** Petey + Giddy
- **What:** Determine whether Standard/Black Belt rename/restructure the LIVE Premium/Elite tiers or are net-new; if restructure, write the Stripe-product + webhook-metadata + existing-payer migration plan.
- **Done means:** a decision + (if needed) a migration plan rehearsable off-prod (Stripe test-mode), ADR if architectural.
- **Depends on:** TASK_01.

#### SESSION_0472_TASK_03 — Cody: scoped build slice (only after the grill closes)

- **Agent:** Cody (cody-preflight first)
- **What:** Build the highest-value, lowest-risk slice the grill locks — reuse-first; no new components without preflight justification.
- **Done means:** TBD by the grill — likely the access-gate/entitlement wiring, not the Instructor Hub (largest new surface, sequence later).
- **Depends on:** TASK_01, TASK_02.

### Open decisions the grill MUST resolve (before any code)

1. **Pricing inversion — Black Belt $45 < Standard $65.** Intentional (subsidize the supply side — the
   instructors/lineage-holders who populate the graph = the asset; optimizes the claim loop)? Or transposed?
2. **Reconcile with the LIVE paid tiers.** BBL runs **Premium/Elite paid LIVE** (`cs_live`, webhook keyed off
   `metadata.userId` — `[[bbl-paid-live-and-e2e-green]]`). Is Standard/Black Belt a **rename/restructure** of
   Premium/Elite or **net-new**? Restructure → existing payers + Stripe products + webhook metadata need a
   migration plan. **This is the real engineering risk — not the spec.**
3. **Tier ↔ belt-rank coupling.** Rank is awarded-truth from `RankAward` (`[[lineage-rank-display-awarded-truth]]`).
   Define the rule for a Standard member **promoted to black belt mid-membership** (auto tier move? price
   change? entitlement flip?). This edge fires constantly in a lineage product.
4. **Reuse vs build.** Most surfaces ship (directory, public profile, lineage, comp gate, video gating).
   The genuinely-new weight is the **Instructor Hub (7 tabs)** — and it maps to existing platform modules
   (student tracker = CRM/leads; lineage editor exists; technique library = the kept `codex` WIP branch).
   Inventory reuse-first (`cody-preflight`) before specing new components.

### Risks

- **Touching live money.** Any Premium/Elite restructure touches prod payments — rehearse off-prod (Stripe
  test-mode), never against `cs_live` unrehearsed.
- **Scope creep via the Instructor Hub.** 7 tabs is a multi-session build; do NOT try to land it in one.
- **Asserting capability present/missing from memory.** Verify every matrix row against the SoT set + live
  app + domain hubs; never assert a negative from an errored/empty search.

### Scope guard

- No code until the grill (TASK_01) closes the 4 open decisions.
- Don't clean-room the technique library — extend the kept `codex/technique-graph-curriculum` WIP.
- Don't scope academy students by `passport.user.memberships` — BBL members are placeholder Passports via
  LineageTree/Affiliation (`[[bbl-roster-via-lineage-tree]]`).

## Cody pre-flight

<!-- Run before TASK_03 only — after the grill locks scope. See docs/protocols/cody-preflight.md. -->

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0472_TASK_01 | pending | Petey: read SoT set + grill 4 open decisions; lock the matrix |
| SESSION_0472_TASK_02 | pending | Stripe-tier reconciliation + migration plan (real risk) |
| SESSION_0472_TASK_03 | pending | Cody: scoped build slice (post-grill) |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0472.md` | pre-staged (BBL tier-model plan + matrix) |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

- **BLOCKED ON GRILL** — the 4 open decisions (pricing, live-tier reconciliation, tier↔rank coupling,
  reuse-vs-build) must be resolved by the operator-facing Petey grill before any build. The first task IS
  the grill, so the session is self-unblocking (no external blocker).

## Next session

### Goal

TBD at bow-out (likely: build the locked slice, or the Instructor Hub sequencing).

### First task

TBD at bow-out.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence
