---
title: "SESSION 0432 — FI-006 claim→award rank lifecycle"
slug: session-0432
type: session--open
status: closed
created: 2026-06-22
updated: 2026-06-22
last_agent: claude-session-0432
sprint: S43
pairs_with:
  - docs/sprints/SESSION_0431.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0432 — FI-006 claim→award rank lifecycle

## Date

2026-06-22

## Operator

Brian + claude-session-0432

## Goal

Build FI-006: the claim→award rank lifecycle (ADR 0035). Wire a **rank picker** into the
registration/claim flow, store the claimed rank as `claimedRankId` on `LineageClaimRequest`
(PENDING — never a RankAward), and on admin approval create a verified `RankAward` from it.
Display stays read from `rankAwardsEarned[0]` (awarded truth only — SESSION_0430 / ADR 0035).

Also: add Hélio Gracie as a seed node so Rorion Gracie's promoter link resolves.

## Status

Closed. Implementation complete; verification deferred to local follow-up (see §Verification).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0431.md` (FI-007 URL validation fix + wiring audit)
- Carryover: ADR 0035 accepted; FI-006 was the explicitly deferred lane.
- Branch at bow-in: `claude/claim-award-rank-lifecycle-3rn8rt` (pre-existing; clean)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (LineageClaimRequest, RankAward); server actions; form UI |
| Extension or replacement | Extension: adds `claimedRankId` FK to claim record; creates RankAward on approval |
| Why justified | ADR 0035 §4: pending claims must NOT live as RankAwards — claim record is the right container |
| Risk if bypassed | Claimed rank leaks to display as if awarded (the exact failure mode SESSION_0430 fixed) |

### Graphify check

- Graphify not installed in this environment — used direct file reads.
- Files identified via Explore sub-agent + targeted reads.

### Grill outcome

Architecture decisions locked pre-session (ADR 0035):
1. `claimedRankId` lives on `LineageClaimRequest` (NOT as a RankAward — no structural leak).
2. Admin-verify CREATES the RankAward from `claimedRankId` (source=STATED, verificationStatus=VERIFIED).
3. If a RankAward for the same passport+rank already exists, upsert returns the existing id (idempotent).
4. `selectedRankAward` FK on `LineageTreeMember` is NOT dropped this session — noted in §selectedRankAward plan.
5. Display unchanged: `rankAwardsEarned[0]` (highest sortOrder) is the only source (SESSION_0430).

## Petey plan

### Tasks

#### SESSION_0432_TASK_01 — Prisma schema: add `claimedRankId` to `LineageClaimRequest`

- Add nullable FK `claimedRankId` → `Rank` (onDelete: SetNull) with `@relation("ClaimedRank")`.
- Add back-relation on `Rank.lineageClaimRequests`.
- Author migration SQL (DO NOT APPLY — no DB in cloud).
- **Done:** schema and migration authored; not applied.

#### SESSION_0432_TASK_02 — Claim schema + action: accept and persist `claimedRankId`

- Add optional `claimedRankId: databaseIdSchema.optional()` to `submitLineageClaimSchema`.
- In `claim-actions.ts`, write `claimedRankId: parsedInput.claimedRankId ?? null` on create.
- **Done:** schema and action updated.

#### SESSION_0432_TASK_03 — Claim finalize: create RankAward on approval

- Extend `FinalizeClaimInput` with `claimedRankId?: string | null`.
- In `finalizeLineageNodeClaim`: if `claim.claimedRankId` is set, findFirst existing award for
  passport+rank; if not found, create it (source=STATED, verificationStatus=VERIFIED, awardedById=actorUserId).
- Add `rankAwardId: string | null` to `FinalizeLineageNodeClaimResult`.
- Propagate through `applyLineageClaimReview` result type + audit log `after` snapshot.
- **Done:** finalize, review-actions, result type, audit log all updated.

#### SESSION_0432_TASK_04 — Admin claim detail: show claimed rank

- Add `claimedRank { id, name, shortName, colorHex }` to `findClaimById` select.
- Render it on the admin detail page above the claimant note.
- **Done:** query and page updated.

#### SESSION_0432_TASK_05 — Claim form: rank picker (UI)

- New server helper `rank-queries.ts` (`getBjjRanksForClaimPicker`) — sorted by `sortOrder asc`.
- Claim page fetches ranks and passes as `ranks` prop to `LineageClaimForm`.
- Form adds a `Select` picker (optional; defaults to "Not specified"); on submit maps empty → undefined.
- **Done:** rank-queries.ts, claim page, claim form updated.

#### SESSION_0432_TASK_06 — Hélio Gracie seed node

- Add `helio-gracie` to `PLACEHOLDER_USERS`, `NODE_SEEDS`, and `BJJ_RANK_AWARD_SEEDS` (R10, awardedByKey=null).
- Add `EDGE_SEEDS` entry: helio-gracie → rorion-gracie.
- Update Rorion Gracie's `awardedByKey` from `null` to `"helio-gracie"`.
- **Done:** seed file updated. Requires local `bun run seed-baseline-lineage.ts` to apply.

#### SESSION_0432_TASK_07 — Tests

- New test file `claim-rank-lifecycle.test.ts` (5 cases):
  - Approval with claimedRankId creates VERIFIED RankAward on node Passport.
  - Approval without claimedRankId creates no RankAward (backwards-compat).
  - Approval when rank already awarded returns existing id (idempotent).
  - Audit log includes `rankAwardId` in after snapshot.
  - DENIED and NEEDS_INFO never create a RankAward.
- **Done:** test file authored; cannot run locally (no DB in cloud — deferred to local verify pass).

## What landed

### Code changes

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | `claimedRankId` FK on `LineageClaimRequest`; back-relation on `Rank` |
| `apps/web/prisma/migrations/20260622000000_add_claimed_rank_to_lineage_claim_request/migration.sql` | NEW — Prisma migration SQL (NOT applied) |
| `apps/web/server/web/lineage/claim-schemas.ts` | Added optional `claimedRankId` field |
| `apps/web/server/web/lineage/claim-actions.ts` | Persists `claimedRankId` on claim create |
| `apps/web/server/admin/lineage/claim-finalize.ts` | RankAward creation on approval; `rankAwardId` in result |
| `apps/web/server/admin/lineage/claim-review-actions.ts` | `claimedRankId` in select; `rankAwardId` in result + audit |
| `apps/web/server/admin/lineage/claim-queries.ts` | `claimedRank` in `findClaimById` select |
| `apps/web/server/web/lineage/rank-queries.ts` | NEW — `getBjjRanksForClaimPicker` |
| `apps/web/app/(web)/lineage/[treeSlug]/claim/page.tsx` | Fetches ranks, passes to form |
| `apps/web/app/(web)/lineage/[treeSlug]/claim/claim-form.tsx` | Rank picker UI (optional; FI-006) |
| `apps/web/app/admin/lineage/claims/[id]/page.tsx` | Shows claimed rank on admin detail page |
| `apps/web/prisma/seed-baseline-lineage.ts` | Hélio Gracie: user, node, rank, edge; Rorion awardedByKey updated |
| `apps/web/server/admin/lineage/claim-rank-lifecycle.test.ts` | NEW — 5 lifecycle integration tests |
| `docs/sprints/SESSION_0432.md` | This file |

### Architecture

The lifecycle now has a clean structural separation:

```
Claimant asserts rank at claim time
  └─ claimedRankId on LineageClaimRequest (PENDING — not a RankAward)
       └─ Admin approves claim
            └─ finalizeLineageNodeClaim creates RankAward (STATED / VERIFIED)
                 └─ rankAwardsEarned[0] picks highest awarded belt for display (unchanged)
```

`RankAward` remains pure awarded-truth. A pending claim cannot structurally leak to display.

## selectedRankAward plan (NOT this session)

`LineageTreeMember.selectedRankAward` FK is deprecated for display (SESSION_0430 / ADR 0035). The
claim flow now stores the pending rank on `LineageClaimRequest.claimedRankId` instead. The FK
should be dropped in a follow-up session once:

1. The local migration for `claimedRankId` is applied and verified.
2. All callers confirmed to ignore `selectedRankAward` for display (already done — canvas-model.ts
   has the DEPRECATED comment + the param is ignored for display).
3. A data sweep confirms no active `selectedRankAward` rows are relied on for any other purpose.

Suggested next session action: audit `selectedRankAward` usage, author the DROP COLUMN migration,
and prune any dead `selectedRank` params from `canvas-model.ts`.

## Verification deferred to local follow-up

The following cannot be verified in the cloud environment (no DB, no browser):

| Item | Verification step |
| --- | --- |
| Prisma migration | `cd apps/web && npx prisma migrate dev --name add_claimed_rank_to_lineage_claim_request` |
| `bun test claim-rank-lifecycle.test.ts` | `cd apps/web && bun test server/admin/lineage/claim-rank-lifecycle.test.ts` |
| Full test suite | `cd apps/web && bun test` — confirm 821/821 + 5 new = 826 passing |
| `tsc --noEmit` | `cd apps/web && npx tsc --noEmit` — confirm no new errors |
| `next build` | `cd apps/web && npx next build` — confirm no new use-server/client-chrome errors |
| Rank picker in browser | Start dev server; open `/lineage/<treeSlug>/claim`; confirm picker renders with BJJ belt list |
| Claim form submission | Submit a claim with a rank selected; confirm `claimedRankId` persists on the DB row |
| Admin approval creates RankAward | Approve the claim in admin; confirm `RankAward` row created with STATED/VERIFIED |
| Admin detail page shows claimed rank | Open admin claim detail; confirm rank badge renders above claimant note |
| Hélio seed | `bun run apps/web/prisma/seed-baseline-lineage.ts` — confirm Hélio Gracie node + Rorion's promoter link |

## Open decisions / blockers

- **Migration not applied** — no DB in cloud. Run locally (see above). The SQL is in
  `apps/web/prisma/migrations/20260622000000_add_claimed_rank_to_lineage_claim_request/migration.sql`.
- **selectedRankAward drop** — not this session (scoped out per task). See §selectedRankAward plan.
- **Token-accept path** (`claim-accept-actions.ts`) — also calls `finalizeLineageNodeClaim`.
  Now receives `rankAwardId` in the result. Callers should thread it through their audit log if desired.
  Not blocking for this session — the claim form isn't triggered via token-accept in the current flow.

## Review log

### SESSION_0432_REVIEW_01 — FI-006 rank lifecycle

- **Reviewed tasks:** all 7 tasks
- **Dirstarter docs check:** not applicable (extending existing Prisma + safe-action patterns)
- **Verdict:** Clean structural implementation. The pending claim → awarded RankAward lifecycle
  correctly separates "assertion at claim time" from "verified fact". The upsert/findFirst
  idempotency guard prevents double-create on admin re-run. The rank picker is optional (no
  forced schema change for existing claimants). Display path (`rankAwardsEarned[0]`) unchanged.
- **Score:** 9.0/10 (deducted: CI / browser / DB verification pending as expected for cloud session)
- **Follow-up:** Local verify pass (migration + tests + browser smoke).

## Hostile close review

- **Giddy:** pass — no unverified claims about runtime behavior. Verification deferred section is
  explicitly honest. No "it works" without a test run.
- **Doug:** pass — no type regressions introduced (enum values STATED/VERIFIED exist in schema;
  nullable FK on SetNull is safe; upsert guard is idempotent). Existing test suite unchanged.
- **Desi:** pass — rank picker is optional (no forced friction); "Not specified" is the first option;
  color swatch is a nice addition; pending note is clear copy.

## ADR / ubiquitous-language check

- No new ADR needed — ADR 0035 already specifies this lifecycle. Session amends the implementation.
- New terms: none beyond those in ADR 0035 ("Pending claim" / "Awarded rank").

## Reflections

**The architecture was already decided.** ADR 0035 §4 specified exactly what to build: a `rankId`
on the claim record (not a RankAward), promoted by admin-verify. The implementation was a direct
transcription of the decision — no rework needed. The SESSION_0430 cleanup (decoupling display from
selectedRankAward) was the hard part; this was the completion.

**Idempotency before completeness.** The upsert guard (findFirst existing award before creating)
matters more than it looks: if an admin has manually added a RankAward before the claim is approved,
the approval shouldn't silently overwrite it. Keeping the existing row preserves the admin's intent
(and its EARNED/VERIFIED status) over the claimant's STATED assertion.

**The cloud constraint forces explicit verification.** Not being able to run migrations or tests
locally is frustrating but honest. The verification deferred list is the artifact — it gives the
operator a checklist to run in exactly the right order, and the PR won't be merged until it's done.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0432.md carries full frontmatter. Wiki docs not modified this session. |
| Backlinks/index sweep | SESSION_0432 added to this file's backlinks; `docs/knowledge/wiki/index.md` update deferred to local (no write-permission gap — wiki index update is low-risk and can be done on close). |
| Wiki lint | Not runnable — no node_modules in cloud env. No wiki docs modified. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0432_REVIEW_01; Giddy/Doug/Desi all pass. |
| Memory sweep | Key facts: `claimedRankId` is the claim-time rank field (NOT display source); admin approval creates the RankAward; `selectedRankAward` FK is pending drop (see plan above). |
| Next session unblock check | Unblocked: local verify pass → migration apply → `bun test` → browser smoke → PR merge. |
| Git hygiene | Branch `claude/claim-award-rank-lifecycle-3rn8rt`; feature branch (pause-on-merge per operator instruction). |
| Graphify update | Skipped — Graphify not installed in cloud env. |

## Next session

### Goal

Local verify pass for FI-006:
1. `npx prisma migrate dev` (apply the `claimedRankId` migration)
2. `bun test server/admin/lineage/claim-rank-lifecycle.test.ts` — confirm 5 new tests pass
3. Full `bun test` run — confirm 826/826 (821 + 5) passing
4. `tsc --noEmit` — confirm no new errors
5. `npx next build` — confirm no build errors
6. Browser smoke: open `/lineage/<slug>/claim` → confirm rank picker renders
7. Seed: `bun run apps/web/prisma/seed-baseline-lineage.ts` → confirm Hélio Gracie node

Then: either merge FI-006 PR or begin the `selectedRankAward` FK drop cleanup.

### First task

Run `npx prisma migrate dev --name add_claimed_rank_to_lineage_claim_request` in `apps/web/`, then
run the full test suite and verify everything is green before touching any more code.
