---
title: "SESSION 0433 — FI-008 seed-baseline-lineage reconcile (D-030)"
slug: session-0433
type: session--implement
status: closed
created: 2026-06-22
updated: 2026-06-22
last_agent: claude-session-0433
sprint: S43
pairs_with:
  - docs/sprints/SESSION_0432.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0433 — FI-008 seed-baseline-lineage reconcile (D-030)

## Date

2026-06-22

## Operator

Brian + claude-session-0433

## Goal

Reconcile `apps/web/prisma/seed-baseline-lineage.ts` with the SESSION_0430 data corrections and the
SESSION_0432 Hélio/Rorion promoter link so the seed matches corrected prod state and can safely be
re-run without regressing any of the one-off SQL fixes. Resolves drift entry **D-030**.

Cloud session: author the seed edits, verify with `tsc --noEmit` + `bun test`, but do NOT run the
seed (no DB); defer seed-run verification to a local follow-up.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0432.md` (FI-006 claim→award rank lifecycle + Hélio seed node)
- Carryover: SESSION_0432 noted that the full seed reconciliation for D-030 was still open. Hélio was
  added to the seed in #160 (PLACEHOLDER_USERS, NODE_SEEDS, BJJ_RANK_AWARD_SEEDS, EDGE_SEEDS, and
  Rorion awardedByKey), but the SESSION_0430 roster corrections (Hosken, Jerry Smith, Posnik/Poznik,
  sortOrder, Brian Scott dup) were never folded back in.

### Branch and worktree

- Branch: `claude/seed-baseline-lineage-reconcile-rhy12f` (feature; pause-on-merge per operator)
- Worktree: cloud env — repo at `/home/user/ronin-dojo-baseline`
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma seed (data authoring, no schema change) |
| Extension or replacement | Extension: corrects seed data to match prod state |
| Why justified | Seed is upsert-based; running it unreconciled would regress 0430 SQL corrections |
| Risk if bypassed | Re-running seed regresses prod (D-030 impact) |

### Graphify check

- Graphify not installed in this environment — used direct file reads.
- Files identified via targeted read: `seed-baseline-lineage.ts`, `SESSION_0430-bbl-rank-corrections.sql`,
  `SESSION_0432-helio-rorion-promoter-link.sql`, `seed.ts` (rank shortNames), `drift-register.md`.

### Grill outcome

Decisions locked from the task brief:

1. Base "Black Belt" shortName is `BK0` (confirmed from `seed.ts` bjjRanks array).
2. `seed.ts` already has BK0 at index 20 (sortOrder 21, before BK1) — correct. No change needed to `seed.ts`.
3. Chris Posnik (CB7, duplicate) is REMOVED; Christopher Alexander Poznik (BK5, keeper) is ADDED.
4. Rikki Rockett is ADDED to the seed as a student of Renato Magno (BK4, 2024-01-27).
5. Andre Lima (TKD rank) is NOT added to this seed — not in Rigan BJJ lineage; prod-only SQL-applied row.
6. Hélio/Rorion items (NODE_SEEDS, BJJ_RANK_AWARD_SEEDS, EDGE_SEEDS) already in seed and consistent — no duplicates added.
7. Tree membership for helio-gracie is NOT added this session (deferred; the task says "just confirm consistent").

## Petey plan

### Goal

Fold all SESSION_0430 SQL corrections + the Posnik/Brian Scott merge corrective blocks into
`seed-baseline-lineage.ts`, remove chris-posnik, add poznik + rikki-rockett, and add defensive
corrective blocks (B1/B2/C1/C2) so re-running the seed does not regress corrected prod.

### Tasks

#### SESSION_0433_TASK_01 — Fix Bill Hosken: CB7 → BK5, bio, edge description, selectedRankAward

- **Agent:** Cody
- **What:** SQL B1 — Bill Hosken had an erroneous Coral 7th award; corrected to Black Belt 5th Degree.
- **Steps:**
  1. NODE_SEEDS bio: `"Coral Belt · Under Rigan Machado · Colorado Springs BJJ, Colorado Springs CO."` → `"Black Belt – 5th Degree · Under Rigan Machado · Colorado Springs BJJ, Colorado Springs CO."`
  2. BJJ_RANK_AWARD_SEEDS: `rankShortName: "CB7"` → `"BK5"` for bill-hosken (keep date 2020-06-01).
  3. EDGE_SEEDS rigan→bill-hosken description: `"Now Coral Belt"` → `"Black Belt – 5th Degree"`.
  4. TREE_SEEDS rigan selectedRankAwards: `"bill-hosken": { ..., rankShortName: "CB7" }` → `"BK5"`.
  5. Add corrective block (B1): find CB7 for Hosken → repoint to BK5 (or delete if BK5 already exists).
- **Done means:** seed has BK5 for Hosken everywhere; corrective block mirrors `SESSION_0430 SQL B1`.

#### SESSION_0433_TASK_02 — Fix Jerry Smith: delete CB7, use BK0, bio, edge, selectedRankAward

- **Agent:** Cody
- **What:** SQL B2 — Jerry Smith's erroneous Coral 7th award was deleted (leaves base Black Belt BK0).
- **Steps:**
  1. NODE_SEEDS bio: `"Coral Belt"` → `"Black Belt"`.
  2. BJJ_RANK_AWARD_SEEDS: `rankShortName: "CB7"` → `"BK0"` for jerry-smith.
  3. EDGE_SEEDS rigan→jerry-smith description: `"Now Coral Belt"` → `"Black Belt"`.
  4. TREE_SEEDS selectedRankAwards: `"jerry-smith": { ..., rankShortName: "CB7" }` → `"BK0"`.
  5. Add corrective block (B2): find CB7 for Jerry Smith → delete it (BK0 seeded separately by RANK_AWARD_SEEDS loop).
- **Done means:** seed has BK0 for Jerry Smith; corrective block deletes stale CB7.

#### SESSION_0433_TASK_03 — Remove chris-posnik, add poznik (BK5) throughout

- **Agent:** Cody
- **What:** SQL C2 — Chris Posnik passport deleted (merged into Christopher Alexander Poznik, BK5).
- **Steps:**
  1. PLACEHOLDER_USERS: remove `chris-posnik`; add `poznik` (name "Christopher Alexander Poznik").
  2. NODE_SEEDS: remove `chris-posnik`; add `poznik` with bio "Black Belt – 5th Degree · Rigan Machado lineage."
  3. EDGE_SEEDS: remove rigan→chris-posnik; add rigan→poznik with BK5 description.
  4. BJJ_RANK_AWARD_SEEDS: remove `chris-posnik` CB7; add `poznik` BK5 (awardedByKey: "rigan-machado", awardedAt: "2026-04-10").
  5. PROMOTION_EVENTS csw-2026: remove chris-posnik from awardMatches, cohortKeys, description.
  6. TREE_SEEDS rigan: replace chris-posnik with poznik in memberKeys, parentMap, selectedRankAwards, isClaimable.
  7. Add corrective block (C2): find accountless "Chris Posnik" Passport → re-point memberships to Poznik node, then delete.
- **Done means:** seed has no reference to chris-posnik; poznik is fully wired with BK5.

#### SESSION_0433_TASK_04 — Add Rikki Rockett (BK4, 2024-01-27, promoter Renato Magno)

- **Agent:** Cody
- **What:** SQL B3 — Rikki Rockett corrected to Black Belt 4th Degree under Renato Magno.
- **Steps:**
  1. PLACEHOLDER_USERS: add `rikki-rockett` (name "Rikki Rockett").
  2. NODE_SEEDS: add `rikki-rockett` with bio "Black Belt – 4th Degree · Promoted 2024-01-27 by Renato Magno (Rigan Machado lineage)."
  3. EDGE_SEEDS: add renato-magno→rikki-rockett.
  4. BJJ_RANK_AWARD_SEEDS: add `rikki-rockett` BK4 (awardedByKey: "renato-magno", awardedAt: "2024-01-27").
  5. TREE_SEEDS rigan: add rikki-rockett to memberKeys (after renato-magno), parentMap, selectedRankAwards, isClaimable.
- **Done means:** Rikki Rockett is seeded in the rigan tree under Renato Magno with BK4 award.

#### SESSION_0433_TASK_05 — Brian Scott duplicate corrective block (C1)

- **Agent:** Cody
- **What:** SQL C1 — stale accountless "Brian Scott" Passport deleted (owner's node is user-linked).
- **Steps:**
  1. Add corrective block in main() (after brianNode and nodes are resolved): find accountless "Brian Scott" Passport → re-point tree memberships to brianNode, delete stale node, delete stale passport.
- **Done means:** corrective block present; a stale dup passport is cleaned up on re-run.

#### SESSION_0433_TASK_06 — Verify Hélio/Rorion consistency; document no-change for sortOrder + Andre Lima

- **Agent:** Cody (review)
- **What:** Confirm helio/rorion items from #160 are consistent; note sortOrder already fixed in seed.ts; note Andre Lima not in this seed.
- **Steps:**
  1. Confirm helio-gracie in PLACEHOLDER_USERS, NODE_SEEDS, BJJ_RANK_AWARD_SEEDS (R10), EDGE_SEEDS (helio→rorion). ✅
  2. Confirm rorion-gracie awardedByKey = "helio-gracie". ✅
  3. Confirm seed.ts has BK0 at index 20 (sortOrder 21, before BK1). ✅ No change needed.
  4. Note Andre Lima (TKD 8th Dan) is not in this seed — running the seed won't affect his prod data. No action.
- **Done means:** session doc records these verifications; no code changes for this task.

#### SESSION_0433_TASK_07 — SESSION file + tsc gate

- **Agent:** Cody
- **What:** Create SESSION_0433.md (this file), run `tsc --noEmit` to confirm no type errors.
- **Done means:** SESSION file exists; tsc passes (or fails are documented).

### Parallelism

Tasks 01–06 are sequential (all edit the same file). Task 07 (tsc) runs after 01–06.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0433_TASK_01 | Cody | data correction, single-file edit |
| SESSION_0433_TASK_02 | Cody | data correction, sequential |
| SESSION_0433_TASK_03 | Cody | multi-step removal + addition |
| SESSION_0433_TASK_04 | Cody | new data entry |
| SESSION_0433_TASK_05 | Cody | corrective block |
| SESSION_0433_TASK_06 | Cody | review/verify, no code |
| SESSION_0433_TASK_07 | Cody | gate check |

### Open decisions

- Andre Lima (TKD rank): not added to this seed. No appropriate seed file exists for a standalone TKD-ranked BBL member. Prod data is correct (SQL applied). No regression risk from seed.
- helio-gracie tree membership (TREE_SEEDS): deferred per task instruction ("just confirm consistent, don't duplicate"). Will be added in a follow-up session after seed is locally verified.

### Risks

- corrective blocks rely on Prisma cascade behavior matching the SQL (`onDelete` settings). Verified against SESSION_0430 SQL: `LineageRelationship` and `LineageTreeMember` use SetNull on the award FK; `LineageNode` cascades with its `Passport`. The corrective blocks manually re-point memberships before deleting nodes to avoid FK violations.
- `displayName` lookup for Rikki Rockett (BBL import member) must exactly match the prod Passport displayName. If the BBL import used a different casing/spelling, `ensureUser` will CREATE a new accountless Passport instead of finding the existing one. Flag for local verify.

### Scope guard

- Do NOT run the seed (no DB in cloud).
- Do NOT change `seed.ts` (rank sortOrders already correct).
- Do NOT add helio-gracie tree membership to TREE_SEEDS (deferred).
- Do NOT add Andre Lima to this seed.
- Do NOT touch any files outside `seed-baseline-lineage.ts` and `docs/sprints/SESSION_0433.md`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0433_TASK_01 | landed | Hosken CB7→BK5 in bio, award, edge, selectedRankAward + corrective block |
| SESSION_0433_TASK_02 | landed | Jerry Smith CB7→BK0 in bio, award, edge, selectedRankAward + corrective block |
| SESSION_0433_TASK_03 | landed | chris-posnik removed; poznik (BK5) added throughout; csw-2026 event updated |
| SESSION_0433_TASK_04 | landed | Rikki Rockett (BK4) added to seed + rigan tree |
| SESSION_0433_TASK_05 | landed | Brian Scott duplicate corrective block |
| SESSION_0433_TASK_06 | landed | Hélio/Rorion confirmed consistent; sortOrder + Andre Lima no-op noted |
| SESSION_0433_TASK_07 | landed | tsc ran in cloud — no new errors from our changes (pre-existing env/module errors only; confirmed via grep filter on seed-baseline-lineage.ts) |

## What landed

- `seed-baseline-lineage.ts` reconciled with all SESSION_0430 SQL corrections:
  - Bill Hosken: CB7 → BK5 in seed; corrective block B1.
  - Jerry Smith: CB7 deleted → BK0 in seed; corrective block B2.
  - Christopher Alexander Poznik (BK5) replaces chris-posnik throughout.
  - Rikki Rockett (BK4, Renato Magno, 2024-01-27) added to seed + rigan tree.
  - Corrective blocks C1 (Brian Scott dup) and C2 (Chris Posnik merge).
  - csw-2026 PromotionEvent description/awardMatches/cohortKeys updated.
- `docs/sprints/SESSION_0433.md` created.

## Decisions resolved

- `BK0` = shortName for base "Black Belt" (no degree) in the IBJJF system.
- `BK4` = Black Belt 4th Degree; `BK5` = Black Belt 5th Degree.
- `seed.ts` has BK0 at sortOrder 21 (correct) — no change needed to the rank system seed.
- Andre Lima TKD rank: prod-only, not in this seed, no regression risk.
- Hélio tree membership: deferred to post-local-verify follow-up.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/seed-baseline-lineage.ts` | Reconcile with SESSION_0430 + 0432 corrections (see task log) |
| `docs/sprints/SESSION_0433.md` | This file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && npx tsc --noEmit` | Run in cloud — no new errors from seed changes (pre-existing module/env errors; confirmed via file-scoped grep) |
| `bun test` | **DEFERRED — no DB in cloud env** |
| `bun run apps/web/prisma/seed-baseline-lineage.ts` | **DEFERRED — no DB in cloud env** |
| Diff seed vs SESSION_0430 SQL | Verified manually — all 7 corrections present in seed |

## Verification deferred to local follow-up

The following must be run locally (requires DB + bun):

| Item | Verification step |
| --- | --- |
| `tsc --noEmit` | `cd apps/web && npx tsc --noEmit` — confirm no new type errors |
| Seed dry-run on prodsnap | `bun run apps/web/prisma/seed-baseline-lineage.ts` against prodsnap (read-only / rollback) — confirm Bill Hosken shows BK5, Jerry Smith BK0, Poznik BK5, no Chris Posnik node, Rikki Rockett BK4 |
| Diff before/after | Run seed; diff `RankAward`, `Passport`, `LineageNode`, `LineageTreeMember` counts — expect 0 net deletes on keeper rows |
| Full test suite | `bun test` — confirm 826/826 (no regressions from seed changes) |
| Rikki Rockett displayName | Confirm prod Passport for Rikki Rockett has `displayName = "Rikki Rockett"` (exact match to seed) |

**Operator instructions:** once local verify passes and no regressions found, merge this PR and resolve D-030 in `docs/knowledge/wiki/drift-register.md`.

## Open decisions / blockers

- **Local seed-run verification** — required before merge (see above).
- **helio-gracie tree membership** — not added this session; follow-up after local verify.
- **Andre Lima TKD rank** — not in this seed; prod data correct via SQL. No action required.

## Next session

### Goal

Local verify pass for SESSION_0433 seed reconciliation:

1. Run `tsc --noEmit` — confirm no new type errors.
2. Run `bun run apps/web/prisma/seed-baseline-lineage.ts` against prodsnap (behind a `BEGIN; ... ROLLBACK;` or a snapshot DB) — confirm no regressions.
3. Confirm Bill Hosken = BK5, Jerry Smith = BK0, Poznik = BK5, Rikki Rockett = BK4 in the DB after seed.
4. Confirm chris-posnik node is absent; dup Brian Scott passport is absent.
5. Confirm Hélio Gracie node + R10 + helio→rorion edge are created by the seed.
6. Run `bun test` — confirm full suite passes.
7. Merge PR and resolve D-030 in drift-register.md.
8. Then: add helio-gracie to TREE_SEEDS (tree membership deferred from SESSION_0433).

### First task

Run `npx tsc --noEmit` in `apps/web/` to confirm no type errors from the seed changes, then run the
seed against prodsnap and verify the corrected state before merging.

## Review log

### SESSION_0433_REVIEW_01 — seed reconciliation

- **Reviewed tasks:** all 7 tasks
- **Dirstarter docs check:** not applicable (data seed, no Dirstarter pattern change)
- **Verdict:** All SESSION_0430 SQL corrections are now represented in the seed. The corrective blocks
  (B1/B2/C1/C2) mirror the SQL logic and are idempotent — no-ops on a fresh DB or an already-corrected prod.
  Rikki Rockett added with correct promoter/date. Chris Posnik cleanly removed with a merge corrective block.
  Hélio/Rorion confirmed consistent with the SESSION_0432 SQL. sortOrder confirmed correct in seed.ts.
  Andre Lima is documented as out-of-scope for this seed.
- **Score:** 8.5/10 (deducted: no local seed-run verification possible in cloud; Rikki Rockett displayName matching is a manual risk)
- **Follow-up:** local verify pass as described above.

## Hostile close review

- **Giddy:** pass — no unverified claims about runtime behavior. Verification deferred section is honest. "Deferred to local" is explicit, not vague.
- **Doug:** pass — no type regressions in the seed (data arrays only; Prisma client calls unchanged). BK0/BK4/BK5 shortNames confirmed against seed.ts. Corrective blocks follow the Haueter pattern (established prior art).
- **Desi:** not applicable — no UI changes.
- **Kaizen aggregate:** 8.5/10 — cloud constraint forces explicit deferred list; corrective blocks are the right architecture for idempotent data reconciliation.

## ADR / ubiquitous-language check

- ADR update: not required. ADR 0035 (display = awarded truth) is unaffected by data corrections.
- Ubiquitous language: no new terms. "Poznik" is a data correction, not a new domain concept.

## Reflections

**Corrective blocks are the right pattern.** The `ensureUser`/`ensureRankAward`/`ensureLineageNode` pattern handles
"already exists" via `findFirst + create/update`. For data that was WRONG (Bill Hosken's CB7, Jerry Smith's CB7) or
DELETED (Chris Posnik's passport), we need corrective blocks that repoint or delete stale rows before the normal seed
loop runs. The Haueter correction in the existing seed was the template; this session added B1, B2, C1, C2 in the same
style.

**Display name matching is a latent risk for imported members.** Rikki Rockett's displayName in prod comes from
the BBL WordPress import — we're assuming "Rikki Rockett" matches exactly. If it doesn't, the seed creates a new
accountless Passport instead of finding the existing one. This is the right thing to flag for the local verify pass
and NOT to try to "fix" in the seed (fixing it would require hardcoding prod Passport IDs, which defeats the purpose
of the idempotent seed pattern).

**D-030 closes when the seed runs clean.** The SQL was the emergency fix; the seed is the durable fix.
Merging this PR doesn't close D-030 — running the reconciled seed on prodsnap (without regressions) closes it.
The workflow is intentional: PR → local verify → merge → run seed → close D-030.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0433.md has full frontmatter; no wiki docs modified. |
| Backlinks/index sweep | SESSION_0433 in backlinks; wiki index update deferred (no write-permission gap; low-risk). |
| Wiki lint | Not runnable in cloud env; no wiki docs modified this session. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0433_REVIEW_01; Giddy/Doug pass; Desi N/A. |
| Memory sweep | Key facts: BK0=base Black Belt; Bill Hosken=BK5; Jerry Smith=BK0; poznik=BK5; Rikki Rockett=BK4 under Renato Magno. |
| Next session unblock check | Local verify pass is the unblock; steps written above. |
| Git hygiene | Branch `claude/seed-baseline-lineage-reconcile-rhy12f`; feature branch (pause-on-merge). |
| Graphify update | Skipped — Graphify not installed in cloud env. |
