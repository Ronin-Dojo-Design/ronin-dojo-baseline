---
title: "SESSION 0486 — Belt-verification subsystem: PLAN-FIRST design + grill (extend the claim-approval queue)"
slug: session-0486
type: session--plan
status: closed
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0486
sprint: S49
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/sprints/SESSION_0484.md
  - docs/sprints/SESSION_0477.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
  - docs/learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0486 — Belt-verification subsystem: PLAN-FIRST design + grill

## Date

2026-07-01

## Operator

Brian + claude-session-0486

## Goal

Run a **Petey plan-first design pass + grill** (design ONLY, no build) on the **belt-verification subsystem**
that makes the held belt-journey PRs (#178–#181) launch-safe. Deliverables: (a) updated **belt-VERIFICATION
slices** appended to `docs/petey-plan-0477-belt-journey-crm-epic.md`, staged for the Block-A build; (b) a drafted
**ADR 0035 amendment** that justifies reintroducing a per-belt UNVERIFIED display axis and decouples the node
trust badge from a self-declared belt. Anchored to SESSION_0484's hold decision (parent); executed in an isolated
worktree so as not to collide with SESSION_0476/0485. Same lane as Block A — runs FIRST; Block A builds it.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Parent (deciding) session: `docs/sprints/SESSION_0484.md` — shipped the BBL Lead Pipeline board standalone and
  **held belt PRs #178–#181** pending a proper verification model; its `Next session` block IS this session's spec.
- Also read: `docs/sprints/SESSION_0477.md` (Block-A build spec — `RankMilestone` + belt cards) and
  `docs/petey-plan-0477-belt-journey-crm-epic.md` (the epic plan this session extends).
- Numbering: operator ratified "0484 not 0477" → this design pass logs as a **new SESSION_0486, parent = 0484**;
  the epic plan filename stays `petey-plan-0477-belt-journey-crm-epic.md` (nothing renamed).

### Branch and worktree

- Branch: `session-0477-belt-verify`
- Worktree: `/Users/brianscott/dev/ronin-0477` (isolated worktree off `origin/main`; SESSION_0476 runs the main checkout)
- Status at bow-in: clean
- Current HEAD at bow-in: `da491514`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None (design/docs only — no L1 area touched this session) |
| Extension or replacement | N/A — planning only |
| Why justified | Design + grill produce a plan + ADR draft; no code, no baseline touched |
| Risk if bypassed | N/A |

Live docs checked during planning: not applicable (design pass).

### Grill outcome

Four forks resolved with the operator (AskUserQuestion):

- **Fork (b) — belt model: B1 (claim-record).** A pending self-declared belt = a `RANK_PROMOTION`
  `PassportClaimRequest` (`claimedRankId` + evidence), **never** an `UNVERIFIED RankAward`. Approve → existing
  `mintAssertedRankAward` → `VERIFIED` award → then enrich. Chosen over B2 (per-belt display axis) because B2
  re-opens the SESSION_0474/[[learning-record-0008]]/ADR-0035-§5 decision (the founder double-badge bug). **B1
  reaffirms §5, no display axis, no ADR reversal.**
- **Fork (a) — request shape: A1 (extend `PassportClaimRequest`).** Add `type {IDENTITY, RANK_PROMOTION}`; reuse
  `claimedRankId`/evidence/`/app/claims`/`LineageClaimStatus`; branch `finalizePassportClaim` (promotion skips
  account-attach, runs only the rank-mint branch). Chosen over A2 (sibling model) — reuses the machinery verbatim.
- **Fork (c) — `setPassportRank`: C-implied mint.** Backfill ≤ verified ceiling self-service-mints a
  `VERIFIED`-by-implication award (gated); above-ceiling routes to a promotion claim; ungated create path removed.
- **Fork (d) — photo evidence: soft-gate → milestone.** Certificate/instructor photo encouraged not required; on
  approve, `PassportClaimEvidence` materializes as `RankMilestone` media.
- **Approver:** the existing resource-scoped `claim.review` grant (RBAC-instructor, node/tree-scoped) + global
  `claims.manage` — no new permission.

### Drift logged

- LR 0008 flagged the central tension: a prior session (0474) already tried a per-award `verificationStatus`
  display axis and re-created the drift ADR 0035 §5 marked vestigial (verified founders showed Verified **and**
  Unverified chips at once). This session's ADR amendment must carry the burden of reversing that — the grill's
  first fork.

## Petey plan

### Goal

Design + ratify the belt-verification subsystem (four forks) and produce the plan + ADR amendment. No build.

### Tasks

<!-- Refined after grill; verification slices append to petey-plan-0477. -->

#### SESSION_0486_TASK_01 — Map the belt-verification code surface

- **Agent:** Explore
- **What:** Locate + excerpt exact shapes of `PassportClaimRequest` / claim-finalize / `/app/claims` RBAC gate /
  `LineageNode.isVerified` badge read sites / `setPassportRank` / `RankAward.verificationStatus` enum / `RankMilestone`.
- **Done means:** a structured code-surface report grounding the design in real file:line + signatures.
- **Depends on:** nothing.

#### SESSION_0486_TASK_02 — Grill the four design forks to shared understanding

- **Agent:** Petey (lead, inline) + operator
- **What:** Resolve (a) belt-promotion approval type extending `PassportClaimRequest`/claim-finalize; (b) per-belt
  UNVERIFIED display axis + the ADR 0035 amendment (decouple node badge from a self-declared belt); (c)
  `setPassportRank` gate/mark; (d) `RankMilestone` photo → review evidence.
- **Done means:** each fork resolved with the operator; recorded in `Grill outcome`.
- **Depends on:** TASK_01.

#### SESSION_0486_TASK_03 — Produce plan + ADR 0035 amendment draft

- **Agent:** Petey (inline)
- **What:** Append belt-VERIFICATION slices to `docs/petey-plan-0477-belt-journey-crm-epic.md`; draft the ADR
  0035 amendment (as an amendment section or a new ADR that amends 0035, per grill).
- **Done means:** the epic plan carries the verification slices; the ADR amendment is drafted + staged for Block A.
- **Depends on:** TASK_02.

### Parallelism

- TASK_01 runs first (code map). TASK_02 (grill) needs it. TASK_03 (write) after the grill. No fan-out — this is
  a single coherent design lane; do it inline. This session does NOT build; Block A (a later session) builds it.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0486_TASK_01 | Explore | Read-only code-surface mapping across many files |
| SESSION_0486_TASK_02 | Petey + operator | Open design forks need a grill, not a build |
| SESSION_0486_TASK_03 | Petey (inline) | Coherent single-author plan + ADR draft |

### Open decisions

- The four forks (a–d) + the ADR-0035-amendment tension (LR 0008) — resolved during the grill (TASK_02).

### Risks

- **Re-opening a closed decision (LR 0008):** reintroducing a per-award display axis is precisely what caused the
  double-badge bug. The amendment must make the double-badge structurally impossible (one resolver; vestigial-data
  backfill) or it re-incurs the lesson.
- **Scope creep into build:** this session is design + grill ONLY. No code, no migration, no PR.

### Scope guard

- **Out:** any code, schema, migration, component, or PR; running the held belt PRs; touching prod.
- **In:** the plan slices + the ADR amendment draft, staged for Block A to build.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0486_TASK_01 | landed | Mapped the belt-verification code surface (Explore) — exact shapes for `PassportClaimRequest`, `finalizePassportClaim`, `setPassportRank`, `RankAward`/enum, `claim.review` RBAC |
| SESSION_0486_TASK_02 | landed | Grilled the four forks to shared understanding (B1 · A1 · C-implied · soft-gate) |
| SESSION_0486_TASK_03 | landed | Appended the V1–V6 verification block to petey-plan-0477 + drafted the ADR 0035 Amendment 1 |

## What landed

- **Design + grill only — no build, no schema, no PR** (as scoped). Two artifacts produced, staged for Block A:
  1. **petey-plan-0477** — a new **Belt Verification Subsystem** block (grill-ratified locked decisions +
     Slices **V1–V6** + the reworks to held Slices 2–5 of #178–#181).
  2. **ADR 0035 — Amendment 1 (DRAFT)** — extends §4 (`RANK_PROMOTION` claim type) + reaffirms §5 (no display
     axis; records why B2 was rejected, citing LR 0008). Finalizes to `accepted` when Slice V6 is green.
- **Key reframe the grill produced:** the dispatch asked for a per-belt UNVERIFIED display axis + a 0035
  reversal; the grill established that the canon-aligned B1 model achieves "self-declare → unverified → approve"
  with **no** new display axis and **no** reversal — a stronger amendment that closes the recurring LR-0008 hole.

## Decisions resolved

- B1 (claim-record) over B2 (display axis); A1 (extend `PassportClaimRequest`) over A2 (sibling model);
  C-implied backfill mint; soft-gate photo evidence → milestone; approver = existing `claim.review` grant.
- ADR 0035 §5 **reaffirmed** (not reversed); §4 **extended** to cover existing-member promotions.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0486.md` | **NEW** — this session (design + grill) |
| `docs/petey-plan-0477-belt-journey-crm-epic.md` | Appended the Belt Verification Subsystem block (V1–V6 + reworks) |
| `docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md` | Appended Amendment 1 (DRAFT) + frontmatter refs |

## Verification

| Command / smoke | Result |
| --- | --- |
| Design pass — no code | N/A (no build; gates run by Block A per slice) |
| `wiki:lint` (docs consistency) | run at bow-out |

## Open decisions / blockers

- **None blocking Block A.** Two build-time details flagged inside Slice V4 for Cody to pick the cleanest option
  (they don't change the design): (1) the exact marker distinguishing a member-editable self-added backfill award
  from a read-only imported/approved award (`source`/`awardedByPassportId`/claim-provenance); (2) whether to
  backfill existing imported founder awards to `IMPORTED` explicitly (not required under B1 since display doesn't
  read the status, but tidy).

## Next session

### Goal

**Block A — build the belt-verification subsystem (petey-plan-0477 Slices V1–V6), then rebase + unhold
#178–#181 through the Slice V4 reworks.** Land the `RANK_PROMOTION` claim type + finalize branch + gated
backfill + the `/app/claims` promotion queue; Slice V6 proof gate is the bar that unholds the belt PRs.

### First task

Read `docs/petey-plan-0477-belt-journey-crm-epic.md` (the new Belt Verification Subsystem block) + ADR 0035
Amendment 1 (DRAFT) + this SESSION file's grill outcome, then execute **Slice V1** (schema: `PassportClaimType`
enum + `PassportClaimRequest.type` + hand-authored additive migration). Do **not** run Block A concurrently with
any remaining design work on this lane.

## Review log

### SESSION_0486_REVIEW_01 — design coherence + canon-alignment self-review

- **Reviewed tasks:** SESSION_0486_TASK_01, _02, _03.
- **Verdict:** The design is canon-aligned and reuses existing machinery (claimedRank → mintAssertedRankAward,
  the /app/claims queue, the `claim.review` grant) rather than adding surface. The one real risk the dispatch
  carried — reintroducing the LR-0008 display axis — is *avoided*, not merely guarded: B1 makes the double-badge
  bug structurally impossible. The plan flags the two build-time sub-choices (editable-award marker; imported
  backfill) as Cody's call without blocking. No code was written (scope honored).
- **Score:** design-only; deferred to Block A's Slice V6 proof gate for the real launch-safety score.
- **Follow-up:** Block A must prove all five Slice-V6 checks green before unholding #178–#181.

## Hostile close review

Design/plan session, 0 code — the full Giddy/Doug/Desi hostile pass is Block A's job (Slice V6). Self-assessed:

- **Giddy (architecture):** pass — extends `PassportClaimRequest` (ADR 0036) instead of a greenfield model;
  reaffirms ADR 0035 §5 rather than reversing it; no god-table/kind-union added (a single `type` discriminant
  with a branched finalize is the ADR-0036 pattern already in use).
- **Doug (verification honesty):** pass — no verification claimed; gates explicitly deferred to Block A per slice;
  worktree-bootstrap + wiki:lint limitations recorded honestly in the evidence table.
- **Desi:** not applicable — no UI/UX built (the belt-card CTA change is specced, not implemented).
- **Kaizen aggregate:** 8/10 — a clean plan-first close; −2 because wiki:lint could not run in the un-bootstrapped
  worktree (link-integrity checked manually instead).

## ADR / ubiquitous-language check

- **ADR update required — done (DRAFT).** `docs/architecture/decisions/0035-...md` gains **Amendment 1 (DRAFT)**:
  extends §4 (the `RANK_PROMOTION` claim type) + reaffirms §5 (no display axis; B2 rejected, citing LR 0008).
  Marked *proposed (draft)*; finalizes to `accepted` when petey-plan-0477 Slice V6 lands green. The accepted
  core (§§1–6) is unchanged.
- **Ubiquitous language update required — captured in the amendment.** New terms: **Rank promotion
  (belt-promotion claim)** and **Backfill (implied) award** are defined in ADR 0035 Amendment 1 §"Ubiquitous
  language (amendment)". Block A should mirror them into `docs/architecture/ubiquitous-language.md` when the
  amendment finalizes (noted in the plan).

## Reflections

- **The dispatch asked for the wrong fix, precisely.** It specified a per-belt UNVERIFIED display axis + an ADR
  0035 reversal — but that is the exact axis the SESSION_0474 grill + LR 0008 killed (the founder double-badge).
  The highest-value thing this session did was *not build what was asked* and instead surface that B1 (claim-record)
  achieves the same product goal with less surface and no reversal. Grill-first earned its keep here: a headless
  build would have re-incurred LR 0008.
- **Almost re-incurred it myself.** My first instinct while reading the dispatch was to design the display axis
  as requested. Reading LR 0008 *before* touching the ADR (bow-in step 3b) is what caught it — the anti-rediscovery
  layer working as intended.
- **The machinery already existed.** `finalizePassportClaim` already mints VERIFIED awards from `claimedRankId`;
  the `claim.review` resource grant already gives instructors scoped approval. The "belt-verify approval path" the
  hold note said "does not exist" was ~90% present — it just needed a `type` discriminant + a finalize branch.
- **Would-tell-myself:** when a dispatch's requested mechanism conflicts with a recent ADR/LR on the same axis,
  lead the grill with that conflict — it's usually the real decision.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | ADR 0035 frontmatter `updated`→2026-07-01, `last_agent`→claude-session-0486, pairs_with +5 refs; SESSION_0486 + petey-plan-0477 frontmatter current. |
| Backlinks/index sweep | wiki index.md — SESSION_0486 row added at head of recent block; ADR 0035 ↔ SESSION_0486/petey-plan-0477/LR-0008/ADR-0036 cross-refs added. |
| Wiki lint | **Deferred — un-bootstrapped worktree (no node_modules); `bun run wiki:lint` cannot run here.** Substitute: all 6 new cross-referenced paths verified to exist on disk; relative link `../../learning/...` from `decisions/` confirmed correct. Block A (bootstrapped) runs wiki:lint. |
| Kaizen reflection | yes — `## Reflections` present. |
| Hostile close review | self-assessed (design-only; full pass = Block A Slice V6). Giddy/Doug pass; Desi N/A. |
| Code-quality gate (Class-A) | no Class-A custom code this session (docs/plan/ADR only). |
| Runtime verification (Doug) | no runtime surface touched (0 code). |
| Review & Recommend | yes — `Next session → Goal + First task` = Block A builds Slices V1–V6. |
| Memory sweep | added `belt-verification-subsystem-b1-model` memory (project-scoped ratified design) + MEMORY.md pointer. |
| Next session unblock check | unblocked — Slice V1 (schema) is cold-ready from the plan; no user input required. |
| Git hygiene | branch `session-0477-belt-verify` (isolated worktree `../ronin-0477`); single commit staged; **push held for explicit operator "go"** (explicit-push-authorization). Hash reported in bow-out response. |
| Graphify update | skipped — Graphify indexes the canonical checkout, not this worktree (0 nodes here); no code nodes changed (docs-only). |
