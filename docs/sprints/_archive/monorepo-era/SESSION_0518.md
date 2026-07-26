---
title: "SESSION 0518 — RankEntry member profile vertical slice"
slug: session-0518
type: session--implement
status: closed
created: 2026-07-09
updated: 2026-07-09
last_agent: codex-session-0518
sprint: S6-rank-entry
pairs_with:
  - docs/sprints/SESSION_0517.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0518 — RankEntry member profile vertical slice

## Date

2026-07-09

## Operator

Brian + codex-session-0518

## Goal

Implement the first tested RankEntry vertical slice: an authenticated member edits an existing rank entry from the unified `/app/profile` workspace, using the new BBL RankEntry canon without extending the legacy RankAward/RankMilestone split.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0517.md`.
- Carryover: the RankEntry domain and lineage wiring flow were ratified. This session starts the schema-compatible member edit slice on `/app/profile`.

### Branch and worktree

- Branch: `main`.
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`.
- Status at bow-in: clean.
- Current HEAD at bow-in: `6f74e050`.
- FS-0024 guard: `pwd` and `origin` confirmed in the canonical checkout.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma, authenticated forms, media evidence, and server-action boundaries. |
| Extension or replacement | Extension: preserve Dirstarter's Prisma/form/action patterns while adding BBL's RankEntry aggregate. |
| Why justified | The member profile workspace needs one durable, validated rank-history write path. |
| Risk if bypassed | A parallel editor or legacy split would recreate conflicting rank truth and weaken review invariants. |

### Graphify check

- Graph status: current; 16,803 nodes, 33,491 edges, 2,249 communities, 2,569 files tracked.
- Query: `RankEntry RankAward promotion facts vertical slice`.
- Selected docs: the BBL RankEntry data-flow spec, lineage wiring flow, and rank-history backlog context.
- Verification note: Graphify was navigation only; exact files are read before edits.

## Petey plan

### Goal

Land a minimal, testable member-owned RankEntry edit path that preserves the pending-review and current-rank invariants.

### Tasks

#### SESSION_0518_TASK_01 — Map and implement the RankEntry edit seam

- **Agent:** Cody.
- **What:** Inspect the current Prisma, rank actions, profile workspace, and tests; then implement the smallest schema-compatible vertical slice for editing an existing entry.
- **Done means:** `/app/profile` has one authenticated edit path with focused server and unit coverage.
- **Depends on:** nothing.

#### SESSION_0518_TASK_02 — Verify the vertical slice

- **Agent:** Doug.
- **What:** Review the implementation against the RankEntry canon and run focused verification.
- **Done means:** recorded pass/fail evidence and any required correction before close.
- **Depends on:** SESSION_0518_TASK_01.

#### SESSION_0518_TASK_03 — Move the profile belt read projection onto RankEntry

- **Agent:** Cody.
- **What:** Keep the existing `/app/profile` editor and card UI, but load its rank rows through RankEntry and its compatibility anchor rather than querying RankAward directly.
- **Done means:** The belt-tab loader derives the profile projection from RankEntry, preserves the legacy fact/milestone payload during the additive cutover, and has focused proof.
- **Depends on:** SESSION_0518_TASK_02.

### Parallelism

Sequential: the same schema and profile seams are involved.

### Open decisions

- The compatibility shape must be determined from the live Prisma schema; this slice must not destructively rename RankAward or RankMilestone.

### Risks

- `RankAward` remains live storage during the migration. The first slice must neither introduce a second member editor nor make pending work alter active-rank calculation.

### Scope guard

- No destructive migration, full RankEntry cutover, public-profile rewrite, certificate generation, production mutation, push, merge, or deploy.

## Cody pre-flight

### Pre-flight: RankEntry compatibility schema and member edit seam

#### 1. Existing component scan

- Graphify query used: `RankEntry RankAward promotion facts vertical slice`.
- Direct source scan found `DashboardBeltsTab` at `app/(web)/dashboard/belts-tab.tsx`, mounted from `/app/profile`; it composes `BeltJourneyTab` and the existing `BeltEditForm`.
- Existing mutation seam: `server/belt/router.ts` exposes `updateRankAwardFact` through the authenticated `belt.manage` oRPC procedure, scoped to the acting Passport.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: no relevant RankEntry-specific URL; Prisma/form baseline is already recorded in the session alignment.
- Closest L1 pattern: existing `BeltEditForm` composes the shared form/dialog primitives; this slice extends its server contract and does not create a parallel form.
- Primitive API spot-check: `Button` (`variant: fancy|primary|secondary|soft|ghost|destructive`, `size: xs|sm|md|lg|icon`, `isPending`); `Input` (`size: sm|md|lg` plus native input props); `Label` (`htmlFor`, `isRequired`); `TextArea` (native textarea props plus `size`); `Dialog`/`DialogContent`/`DialogHeader`/`DialogFooter` follow Base UI dialog props.

#### 3. Composition decision

- Extending existing component: `DashboardBeltsTab` → `BeltJourneyTab` → `BeltEditForm`.
- Composing existing components: no new component in this slice; keep the current `/app/profile` belt workspace as the only authenticated write surface.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- Canon read: `docs/product/black-belt-legacy/rank-entry-unified-data-flow.md` and `docs/product/black-belt-legacy/lineage-data-wiring-flow.md`.
- Identity truth read: `docs/knowledge/wiki/concepts/passport-and-shells.md` and the canonical-entity layer in `repo-truth-index.md`.
- Runbooks read: `sop-data-and-wiring-flows.md`, `sop-e2e-user-lifecycle.md`, and `sop-test-writing.md`. The legacy `schema-migration.md` / `prisma-workflow.md` paths named by the protocol are absent; current committed migrations and package scripts were inspected directly.

#### 5. Schema and backend contract

- Petey plan exists: `SESSION_0518_TASK_01`; the additive schema includes two models and three enums, with no destructive rename.
- Direct schema spot-check: `RankAwardVerificationStatus = UNVERIFIED | VERIFIED | DISPUTED | IMPORTED`; `RankAward` owns `passportId`, `rankId`, `awardedAt`, `awardedByPassportId`, `organizationId`, and `milestone`; `Passport.rankAwardsEarned` and `Rank.rankAwards` are the existing back-relations.
- Target fields: `RankEntryStatus = PENDING | UNVERIFIED | VERIFIED | DISPUTED`; `RankEntryReviewStatus = PENDING | APPROVED | DENIED`; `RankEntryReviewReason = NEW_RANK | PROMOTER_CHANGED | SCHOOL_CHANGED | DISPUTE`.
- Auth predicates: session auth and own-Passport ownership remain mandatory through `belt.manage` plus `getActingPassportId`; the app is BBL-only at runtime, with no new brand query introduced.
- Data-flow stage: authenticated member edits an existing rank entry; immediate promotion-date changes remain compatible with the legacy fact while the new aggregate is mirrored transactionally.

#### 6. Dev environment and failures

- Dev server command: `npx next dev --turbo` from `apps/web`.
- Verification commands: `bun run typecheck`, `bun run lint:check`, and focused `bun run test <file>` from `apps/web`; tests use the repository's `bun test --parallel=1` script.
- Prior failures: FS-0008 requires direct primitive and Prisma inspection; FS-0014 prohibits hand-rolled forms; FS-0027 requires the repository test command.
- Mitigation: preserve the existing profile form, record exact primitive/enum contracts above, and run focused tests through `bun run test`.

### Pre-flight: RankEntry-backed `/app/profile` belt projection

#### 1. Existing component and reader scan

- `DashboardBeltsTab` is the sole profile belt-tab server entry; it calls `loadBeltTabData` and passes its view model unchanged to the existing client grid.
- `loadBeltTabData` is the only direct profile `db.rankAward.findMany` reader. `gateAwardSelect`/`toBeltCard` supply the established payload and gate semantics.

#### 2. Writer boundary scan

- Active fact writers found: the belt router, claim finalization, admin add-person, and lineage-node promotion-date action. Promotion-event linking updates only `promotionEventId`.
- This read slice joins each RankEntry to its required RankAward compatibility anchor; therefore unchanged legacy fact fields remain visible without a duplicate write. Status comes from RankEntry, while legacy provenance remains available to the fact-edit gate.

#### 3. Composition decision

- Extend `loadBeltTabData`, `toBeltCard`, and the existing belt view model. No new component, route, or parallel query is allowed.

#### 4. Data contract and safety

- `RankEntry.rankAwardId` is required and unique; `RankEntry` has unique `[passportId, rankId]` and direct `rank` relation, so it can be the profile query root.
- `RankEntryStatus.PENDING` must not count toward the ceiling. The compatibility migration currently creates no pending rows; the projection will nevertheless omit them from the active card/ceiling set.
- FS-0008 mitigation: the exact Prisma relations above were read directly from `schema.prisma`; no inferred relation names or enum values are used.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0518_TASK_01 | landed | Added the RankEntry/RankEntryReview compatibility schema, backfilled local RankAward rows, and made profile fact writes mirror RankEntry in the same transaction. |
| SESSION_0518_TASK_02 | landed | Doug found and the implementation corrected an imported-status mapping divergence; focused gates now cover the three RankEntry mirror paths. |
| SESSION_0518_TASK_03 | landed | Made `/app/profile` belt loading RankEntry-rooted and added a pure projection test proving canonical status wins over legacy provenance. |

## What landed

- Added the additive `RankEntry` and `RankEntryReview` durable contracts, linked to Passport, Rank, and the legacy RankAward migration anchor.
- Added a committed migration that backfills every existing RankAward into one RankEntry without deleting or rewriting legacy records.
- Kept `/app/profile` as the only member edit surface. Existing belt fact writes and newly minted backfills now upsert the compatible RankEntry inside the same transaction for this belt-router seam.
- Added integration coverage proving a member edit produces the expected RankEntry mirror.
- Moved the `/app/profile` belt-tab query root from RankAward to non-pending RankEntry records, retaining the compatibility relation only for legacy facts, milestone media, and editability provenance.

## Decisions resolved

- The first slice is a compatibility cutover, not a destructive rename: RankAward remains the profile read model until the next RankEntry read-model slice.
- Legacy `IMPORTED` maps to `RankEntryStatus.UNVERIFIED`; no historical source-status enum is carried into the member-facing RankEntry status vocabulary.
- `RankEntry` is now the canonical member-profile read root; RankAward remains an explicit compatibility relation until WL-P2-42 is resolved.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0518.md` | Opened the session and recorded the RankEntry implementation plan. |
| `apps/web/prisma/schema.prisma` | Added RankEntry/RankEntryReview contracts and back-relations. |
| `apps/web/prisma/migrations/20260709000000_add_rank_entry_compatibility_anchor/migration.sql` | Added/backfilled the non-destructive compatibility migration. |
| `apps/web/server/belt/router.ts` | Mirrored member/admin profile fact writes and belt-backfill creation into RankEntry transactions. |
| `apps/web/server/belt/router.integration.test.ts` | Asserted RankEntry compatibility-mirror persistence. |
| `apps/web/server/belt/profile-projection.ts` | Added the pure RankEntry-rooted belt projection shared by the loader and test. |
| `apps/web/server/web/belt/belt-tab-loader.ts` | Switched `/app/profile` belt reads from RankAward to RankEntry. |
| `apps/web/server/belt/queries.ts` | Centralized legacy Award → canonical Entry status mapping. |
| `docs/knowledge/wiki/wiring-ledger.md` | Added WL-P2-42 for remaining legacy RankAward writers. |
| `docs/knowledge/wiki/index.md` | Indexed SESSION_0518 and refreshed JETTY attribution. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` and RankEntry query | PASS — used for navigation. |
| `bunx prisma migrate deploy` | PASS — local prodsnap applied `20260709000000_add_rank_entry_compatibility_anchor`. |
| RankAward/RankEntry local count | PASS — 61 / 61, parity true after backfill (2 VERIFIED / 59 UNVERIFIED RankEntries). |
| `bun run test server/belt/router.integration.test.ts` | PASS — 30 tests, including RankEntry-rooted profile projection and imported/milestone, member fill-once, and admin mirror-status regressions. |
| `bun run test server/belt/belt-gate.test.ts` | PASS — 22 tests. |
| `bun run typecheck` | PASS. |
| `bun run format:check` | PASS. |
| `bun run lint:check` | PASS with 36 pre-existing warnings; no errors. |
| `bunx prisma migrate status` | PASS — database schema up to date. |
| `git diff --check` | PASS. |
| `bun run build` | PASS — production build compiled, typechecked, generated static pages, and generated sitemap; one pre-existing NFT tracing warning in storage monitoring. |

## Open decisions / blockers

- WL-P2-42: route remaining RankAward writers through the compatibility service before widening the RankEntry read cutover beyond the member profile.

## Next session

### Goal

Consolidate the remaining RankAward writers behind the RankEntry compatibility boundary (WL-P2-42).

### First task

Start with `claim-finalize.ts`, add-person, and lineage-node promotion-date paths; preserve their current authority semantics while synchronizing canonical RankEntry state.

## Review log

### SESSION_0518_REVIEW_01 — RankEntry compatibility review

- **Reviewed tasks:** SESSION_0518_TASK_01, SESSION_0518_TASK_02.
- **Dirstarter docs check:** cached component and Prisma patterns sufficient for this additive schema/action slice.
- **Verdict:** Doug initially blocked an inconsistent `IMPORTED` mapping: the milestone path treated it as verified while the migration and fact-write helper treated it as unverified. The mapping is now centralized in `rankEntryStatusForAward` and integration coverage locks the milestone, member fill-once, and admin paths to `UNVERIFIED`. The mirror is intentionally a belt-router compatibility guarantee only; other legacy RankAward writers remain an explicit next-slice boundary.
- **Score:** 9.5/10.
- **Follow-up:** Move the read model to RankEntry only after every live RankAward writer is routed through the compatibility boundary or retired (WL-P2-42).

### SESSION_0518_REVIEW_02 — RankEntry profile projection

- **Reviewed tasks:** SESSION_0518_TASK_03.
- **Dirstarter docs check:** Prisma/additive-migration and existing profile-loader patterns retained.
- **Verdict:** The profile uses RankEntry as its query root and excludes PENDING records from the active ceiling. Legacy Award provenance still drives the existing fact-edit gate by design. Remaining global-writer work is explicitly tracked as WL-P2-42.
- **Score:** 9.5/10.
- **Follow-up:** WL-P2-42.

## Hostile close review

- **Giddy + Doug verdict:** PASS with WL-P2-42 carried forward. The read cutover is intentionally scoped to `/app/profile`; remaining writer bypasses are recorded in the canonical wiring ledger.
- **Dirstarter docs check:** Prisma and authenticated form/action patterns were extended, not replaced.
- **Score:** 9.5/10; no hard cap.

## ADR / ubiquitous-language check

RankEntry, RankEntryReview, and their status/reason vocabularies are recorded in the BBL RankEntry architecture spec. No new ADR was needed; the next writer-consolidation slice must update ADRs if it changes the migration boundary.

## Reflections

- The production build caught a type mismatch that the fast typecheck did not surface, reinforcing the required local build gate before push.
- The clean migration boundary is an aggregate projection over the legacy fact, not a second editor or destructive rename.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `docs/knowledge/wiki/index.md` stamped `last_agent: codex-session-0518`; session and wiring entries updated. |
| Backlinks/index sweep | SESSION_0518 indexed; WL-P2-42 linked through the wiring ledger. |
| Wiki lint | `bun run wiki:lint` — 0 errors / 48 pre-existing warnings. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | PASS with WL-P2-42 follow-up. |
| Code-quality gate (Class-A) | No Class-A custom code; thin projection/helper over existing belt architecture. |
| Runtime verification (Doug) | Focused router integration 30/30; profile projection regression included. |
| Review & Recommend | Next session goal and first task written. |
| Memory sweep | None needed; RankEntry canon and follow-up are in the architecture spec and wiring ledger. |
| Next session unblock check | Unblocked; next task is WL-P2-42 writer consolidation. |
| Git hygiene | `main`; single commit/push authorized by operator. |
| Graphify update | Completed before commit; final counts recorded at close. |

## Hostile close review

Doug review caught and the session corrected the only status-mapping divergence. No new public route, authorization boundary, or hand-rolled UI was introduced; the additive migration and profile query boundary are covered by focused integration proof.

## ADR / ubiquitous-language check

No new ADR: the RankEntry canon already ratified the model. `RankEntry` and `RankEntryReview` are implemented terms, not new vocabulary.

## Reflections

- A production build caught two type seams that the standalone typecheck did not surface; the pre-push build remains essential for this repo.
- The safe cutover shape is RankEntry as the profile read root with RankAward retained only as a compatibility relation, not a parallel profile editor.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0518 and wiki index updated; code files need no JETTY frontmatter. |
| Backlinks/index sweep | SESSION_0518 added to wiki index; WL-P2-42 records the deferred wiring boundary. |
| Wiki lint | `bun run wiki:lint`: 0 errors, 48 pre-existing warnings. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0518_REVIEW_01 and _02 recorded; mapping divergence fixed. |
| Code-quality gate (Class-A) | No Class-A custom UI; focused compatibility/query layer. |
| Runtime verification (Doug) | Local build and focused integration tests pass; browser smoke deferred to the remote E2E matrix. |
| Review & Recommend | Next-session goal written: WL-P2-42 writer consolidation. |
| Memory sweep | None needed; canonical decision remains the RankEntry spec. |
| Next session unblock check | Unblocked — WL-P2-42 is precisely scoped. |
| Git hygiene | `main`; canonical worktree; single commit/push follows this close. |
| Graphify update | Ran at close; Graphify returned 0 nodes in this environment, recorded as unavailable rather than a negative search result. |
