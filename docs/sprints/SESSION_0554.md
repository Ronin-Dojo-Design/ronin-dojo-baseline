---
title: "SESSION 0554 — FI-003 claim-funnel plan"
slug: session-0554
type: session--plan
status: closed
created: 2026-07-17
updated: 2026-07-17
last_agent: codex-session-0554
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0547.md
  - docs/petey-plan-0554-claim-funnel.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0554 — FI-003 claim-funnel plan

## Date

2026-07-17

## Operator

Brian + codex-session-0554

## Goal

Plan-first Lane F from SESSION_0547: produce `docs/petey-plan-0554-claim-funnel.md` for the
FI-003 student signup + claim-approval domain slice, bundling FI-017, WL-P2-13, and WL-P2-39, with
a sharp operator grill. No production code, schema, migrations, pushes, PRs, or monorepo writes.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0547.md`.
- Carryover: SESSION_0547 persisted the fan-out map. Lane F is a plan-first claim-domain lane:
  FI-003 plus FI-017, WL-P2-13, and WL-P2-39. It must sequence after SESSION_0541 because of shared
  trust-model files.

### Branch and worktree

- Branch: `session-0554-claim-funnel-plan`
- Worktree: `/Users/brianscott/dev/ronin-0554`
- Status at bow-in: clean
- Current HEAD at bow-in: `ae79db18`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth, Prisma, email, permissions, public directory UI; docs-only plan this session |
| Extension or replacement | Extension: future build must extend Better Auth, Prisma identity models, existing claim review, existing `can()`/resource authz, and existing email notification seams |
| Why justified | BBL's claim loop is the product moat; this plan stages the next reviewable claim-domain slices without writing code before operator decisions |
| Risk if bypassed | A fifth authz system, Membership-as-school drift, tokenized email CTAs, or bundled claim-core changes could corrupt identity trust |

Live docs checked during planning: not applicable for docs-only plan; future app-code slices should check Dirstarter auth/Prisma/email docs where touched.

### Graphify check

- Graph status: unavailable in fresh worktree; stats at bow-in: 0 nodes, 0 edges, 0 communities, 0 files tracked.
- Queries used:
  - `FI-003 student sign-up claim approval Passport Affiliation directory organization school claimable BBL node`
- Files selected from graph:
  - none; Graphify returned `No nodes in graph`.
- Verification note: treated empty Graphify as "graph not built here," not as negative evidence. Opened canonical docs and exact files from domain hubs directly.

### Grill outcome

No operator decisions resolved this session. The deliverable intentionally preserves the unresolved forks as a one-page grill in `docs/petey-plan-0554-claim-funnel.md`.

## Petey plan

### Goal

Produce a docs-only Petey plan and operator grill for the FI-003 claim-funnel build lane.

### Tasks

#### SESSION_0554_TASK_01 — Read claim canon and current implementation

- **Agent:** Petey (inline)
- **What:** Read the required SoT set, ADR 0036/0025, domain hubs, petey-plan-0419, SESSION_0547 Lane F, and exact implementation files relevant to signup, claim submit, review, finalize, org CTAs, and durable claim email links.
- **Steps:**
  1. Follow opening ritual SoT order.
  2. Confirm branch/worktree and Graphify availability.
  3. Spot-check code paths enough to avoid planning against stale docs.
- **Done means:** current-state map captured in the plan.
- **Depends on:** nothing

#### SESSION_0554_TASK_02 — Write Petey plan + operator grill

- **Agent:** Petey (inline)
- **What:** Create `docs/petey-plan-0554-claim-funnel.md` following the Petey plan protocol.
- **Steps:**
  1. Encode hard constraints.
  2. Produce the required grill forks.
  3. Stage reviewable future build slices, tests, sequencing, and open forks.
- **Done means:** plan doc exists and is internally consistent with the SoT and current implementation.
- **Depends on:** SESSION_0554_TASK_01

#### SESSION_0554_TASK_03 — Bow out docs-only and hold at push gate

- **Agent:** Petey (inline)
- **What:** Fill this SESSION file, run docs-appropriate gates, commit locally, and do not push.
- **Steps:**
  1. Run close gates that are appropriate for a docs-only plan lane.
  2. Record skipped app/runtime gates.
  3. Commit locally after FS-0024 guard.
  4. Hold at the explicit push gate.
- **Done means:** local commit exists; final response reports SHA and blockers.
- **Depends on:** SESSION_0554_TASK_02

### Parallelism

None. Single docs-only planning lane.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0554_TASK_01 | Petey | Planning requires SoT and implementation context before writing |
| SESSION_0554_TASK_02 | Petey | Deliverable is a Petey plan + grill |
| SESSION_0554_TASK_03 | Petey | Docs-only close and local commit |

### Open decisions

The operator grill in the plan records the unresolved forks:

- registration vs claim semantics for student signup,
- approval authority,
- approval write set,
- reject/duplicate behavior,
- minors/guardianship,
- tier/comp,
- notification set.

### Risks

- WL-P2-13 is partially stale: `OrgClaimCta` is already mounted on org and school detail pages.
- FI-003 is partially shipped: SESSION_0508 already auto-places signups under instructors as unverified, not-claimable members.
- FI-017 touches the claim core and must remain its own reviewed future slice.
- SESSION_0541 belt lane may alter shared trust-model files before this lane builds.

### Scope guard

- Docs only.
- No `apps/web` production code.
- No schema or migrations.
- No tests added.
- No push, PR, merge, deploy.
- No `../ronin-dojo-monorepo` writes.
- FI-001 Truelson send remains parked.

### Dirstarter implementation template

- **Docs read first:** local SoT and ADRs; live Dirstarter docs not applicable until code build.
- **Baseline pattern to extend:** Better Auth sign-in hooks, Prisma Passport/DirectoryProfile/Affiliation, existing `PassportClaimRequest`, existing `can()`/`canForResource`, existing email notification seams.
- **Custom delta:** BBL Passport-keyed claim loop, resource-scoped lineage trust, durable email-bound claim reconciliation.
- **No-bypass proof:** The plan explicitly rejects new authz systems, Membership-as-school, and one-shot claim links.

## Cody pre-flight

Not applicable. No Cody build task and no production code edits.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0554_TASK_01 | landed | Claim canon and current implementation read; Graphify empty noted |
| SESSION_0554_TASK_02 | landed | `docs/petey-plan-0554-claim-funnel.md` drafted |
| SESSION_0554_TASK_03 | landed | Docs-only close gates run; local commit made at close; push held |

## What landed

- `docs/petey-plan-0554-claim-funnel.md` created as a plan-first deliverable.
- The plan captures current implementation reality: registration placement already exists; identity claims are ADR-0036 Passport-keyed; approval already writes Affiliation/rank/tree selections; FI-017 remains a separate claim-core slice.
- Operator grill produced with the seven requested fork areas.

## Decisions resolved

- No product decisions resolved. This was a planning lane and the operator grill remains open.

## Files touched

| File | Change |
| --- | --- |
| `docs/petey-plan-0554-claim-funnel.md` | New Petey plan for FI-003 + FI-017 + WL-P2-13 + WL-P2-39 |
| `docs/sprints/SESSION_0554.md` | Session audit record and docs-only close evidence |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` | 0 nodes / 0 edges / 0 communities / 0 files tracked; treated as unavailable in fresh worktree |
| `graphify query "FI-003 student sign-up claim approval Passport Affiliation directory organization school claimable BBL node" --budget 1500` | `No nodes in graph` |
| Exact-file reads | SoT set, ADR 0036/0025, domain hubs, petey-plan-0419, SESSION_0547, relevant app files |
| `bun run wiki:lint` | 0 errors, 54 warnings; warnings are pre-existing R8 markdown spacing issues in older docs |
| `git diff --check` | clean |
| App build/tests | Skipped — docs-only plan lane; no app code changed |

## Open decisions / blockers

- Operator must answer the grill before implementation starts.
- Build sequence must re-check whether SESSION_0541 and other live lanes have merged.
- `WL-P2-13` needs verification against current UI before any build because source ledger text is stale.
- `FI-017` must be kept as its own reviewed future slice.

## Next session

### Goal

Run the operator grill for `docs/petey-plan-0554-claim-funnel.md`, lock the chosen forks, then dispatch build slices only after SESSION_0541 is merged or rebased over.

### First task

Read `docs/petey-plan-0554-claim-funnel.md` starting at `## Operator Grill`; record operator choices in the next SESSION file, then choose whether to start with low-risk Slice 1/2 or FI-017 Slice 5.

## Review log

### SESSION_0554_REVIEW_01 — Plan-only self-review

- **Reviewed tasks:** SESSION_0554_TASK_01, SESSION_0554_TASK_02
- **Dirstarter docs check:** not applicable for docs-only plan; future code slices must check the exact Dirstarter layer touched
- **Verdict:** The plan respects the claim canon and does not prescribe production changes before operator decisions. Main residual risk is that implementation details may change when SESSION_0541 merges.
- **Score:** 9.4/10
- **Follow-up:** Grill operator before any code.

## Hostile close review

N/A — plan-only. No production code, schema, migrations, runtime routes, or tests changed.

## ADR / ubiquitous-language check

No ADR or glossary update required. The plan uses existing canonical terms: Passport, Affiliation,
PassportClaimRequest, Register, Claim, LineageTreeAccess, `claim.review`.

## Reflections

The important correction was that FI-003 is not blank-slate anymore. SESSION_0508 already shipped
student auto-placement under instructors, with a strong "signup is not claim" boundary. The remaining
work is mostly decision geometry: when to route a student into a placeholder claim, who can approve it,
and how to keep finalize normalization isolated from adjacent funnel improvements.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | New plan and SESSION file include frontmatter with `last_agent: codex-session-0554`; no wiki/architecture page frontmatter changed |
| Backlinks/index sweep | No wiki index update required for docs-only plan file in this session; backlinks point to existing index only |
| Wiki lint | `bun run wiki:lint` -> 0 errors, 54 warnings; warnings are pre-existing R8 markdown spacing issues in older docs |
| Kaizen reflection | Reflections section present |
| Hostile close review | N/A — plan-only, no production code |
| Code-quality gate (Class-A) | No Class-A custom code this session |
| Runtime verification (Doug) | No runtime surface touched |
| Review & Recommend | Next session goal written |
| Memory sweep | None needed; durable facts live in this plan and SESSION file |
| Next session unblock check | Blocked on operator grill answers before build |
| Git hygiene | Branch `session-0554-claim-funnel-plan`; single local docs commit at close; SHA in final response / `git log`; push explicitly held |
| Graphify update | Skipped by operator directive for docs-only plan lane; Graphify also empty in fresh worktree |
