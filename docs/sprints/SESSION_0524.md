---
title: "SESSION 0524 — WL-P2-46 WordPress belt backfill"
slug: session-0524
type: session--open
status: in-progress
created: 2026-07-10
updated: 2026-07-10
last_agent: codex-session-0524
sprint: S1
pairs_with:
  - docs/sprints/SESSION_0523.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0524 — WL-P2-46 WordPress belt backfill

## Date

2026-07-10

## Operator

Brian + codex-session-0524

## Goal

Backfill the canonical `rigan-machado-lineage` members who have no `RankAward` from the real belt data in the local
Black Belt Legacy WordPress `bbl_member` Pods records. The committed script must re-derive the live-prod target set,
match WordPress records by normalized name without silently guessing, create IMPORTED `RankAward` rows plus VERIFIED
`RankEntry` projections, dry-run by default, and require explicit operator authorization before any production write.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not
restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0523.md` (including `Next session` and `REVIEW_04`).
- Carryover: SESSION_0523 landed the WL-P2-46 member-facing read collapse and retained a beltless membership fallback
  after a live-prod probe found 33 verified canonical-tree members with no award. This session materializes those
  members' real WordPress belts so their trust resolves through `RankEntry`.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean; fast-forwarded from `9d343b9a` to `origin/main` `2bf6c06b`.
- Current HEAD at bow-in: `2bf6c06b`
- Concurrent-work note: while this data lane was running, the shared canonical checkout and `origin/main` advanced
  through SESSION_0525 to `eaf3bf60`. The new upstream work was preserved; its only Prisma-area change was a seed
  file, not the RankAward/RankEntry schema or compatibility contract.
- Environment: canonical checkout is bootstrapped (`apps/web/node_modules` present); no fresh-worktree setup needed.

### Dirstarter alignment

| Field                       | Answer                                                                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dirstarter baseline touched | Prisma/Postgres data access only; no schema or migration change.                                                                                     |
| Extension or replacement    | Extension: reuse the existing Prisma 7 `PrismaPg` standalone-script pattern and generated client.                                                    |
| Why justified               | This is a one-time, additive legacy-data materialization needed to make the shipped RankEntry trust read model reflect real WP history.              |
| Risk if bypassed            | A guessed name/rank or unguarded write could corrupt production rank truth; a missing backfill leaves WL-P2-46 dependent on the membership fallback. |

Live docs checked during planning: Dirstarter Prisma Setup (`https://dirstarter.com/docs/database/prisma`, 2026-07-10).

### Graphify check

- Graph status: current; stats at bow-in: 16,838 nodes, 32,562 edges, 2,282 communities, 2,576 files tracked.
- Query used: `WordPress belt backfill RankAward RankEntry rigan Machado lineage WL-P2-46` (`--budget 1500`).
- Files selected from graph: `apps/web/scripts/enrich-bbl-members-pods.ts`, `import-bbl-members-full.ts`,
  `reconcile-pods.mjs`, and the existing canonical-tree migration scripts.
- Verification note: exact files were opened after Graphify; the graph was navigation, not proof.

### Grill outcome

The operator supplied a locked execution contract, so no design fork remains: live prod determines the target roster;
the local WP site determines belts; imported history stays `RankAward.verificationStatus=IMPORTED`; RankEntry derives
`VERIFIED`; dry-run output is shown before a separately authorized `--apply`; the RankAward table-drop is out of scope.

## Petey plan

### Goal

Materialize every unambiguous WordPress belt for the live canonical-tree beltless cohort, with a reviewable and
idempotent production-data script and a post-apply cross-axis proof.

### Tasks

#### SESSION_0524_TASK_01 — Re-derive the live roster and reconcile WordPress belts

- **Agent:** Codex/Cody (read-only discovery)
- **What:** Query live prod for canonical-tree members with empty `passport.rankAwardsEarned`, inspect the local
  `bbl_member` Pods source, and match records by normalized name.
- **Steps:** run a no-app-module PrismaPg prod probe; inspect the WP REST/DB record shape; map WP rank labels to exact
  BJJ `Rank.shortName` rows; reject collisions, missing records, or ambiguous ranks rather than guessing.
- **Done means:** a deterministic per-member reconciliation report partitions every target into exact match or
  explicit skip/review, with prod and WP identifiers shown but no secrets.
- **Depends on:** nothing.

#### SESSION_0524_TASK_02 — Commit the guarded backfill script and prove its dry-run

- **Agent:** Codex/Cody
- **What:** Add `apps/web/scripts/session-0524-wp-belt-backfill.ts`, modeled on the SESSION_0522/0523 scripts.
- **Steps:** derive targets at runtime; fetch/read the WordPress belt source; enforce remote-prod host and exact tree;
  create IMPORTED award + VERIFIED entry atomically; make reruns no-op; print exact before/after plan; run focused
  gates and the live-prod dry-run.
- **Done means:** the script is checked in, defaults to no writes, aborts on ambiguity/invariant failure, and the
  operator has the exact per-member proposed change list.
- **Depends on:** SESSION_0524_TASK_01.

#### SESSION_0524_TASK_03 — Operator-gated production apply and cross-axis verification

- **Agent:** operator authorization → Codex apply → Doug verification
- **What:** Apply only the reviewed plan after an explicit per-action authorization, then re-run the live divergence
  probe.
- **Steps:** confirm the dry-run fingerprint/target count immediately before apply; obtain explicit authorization;
  run `--apply`; re-query awards/entries and the old-vs-new trust axes; verify rerun dry-run is empty.
- **Done means:** each applied member has an IMPORTED award plus VERIFIED RankEntry, no unexpected row changed, the
  targeted beltless fallback cohort is zero (or only explicitly reviewed skips remain), and the cross-axis probe has
  zero regressions.
- **Depends on:** SESSION_0524_TASK_02 and explicit operator authorization.

### Parallelism

The live-prod roster probe and local-WP source inspection are disjoint read-only operations and may run concurrently.
Script construction waits for both. Dry-run, authorization, apply, and verification are strictly sequential.

### Agent assignments

| Task                 | Agent                   | Rationale                                                                         |
| -------------------- | ----------------------- | --------------------------------------------------------------------------------- |
| SESSION_0524_TASK_01 | Codex/Cody              | Clear read-only reconciliation task with local-machine access.                    |
| SESSION_0524_TASK_02 | Codex/Cody              | Single coherent standalone data-script implementation.                            |
| SESSION_0524_TASK_03 | operator + Codex + Doug | Production mutation requires operator authority and independent post-write proof. |

### Open decisions

- Any ambiguous or missing WordPress name/rank match will be surfaced and skipped; resolving it requires operator
  input rather than a fuzzy guess.
- Production `--apply` remains blocked until the operator explicitly authorizes the exact dry-run plan.

### Risks

- Duplicate/variant WordPress names can mis-associate rank history unless normalized matching remains one-to-one.
- WP `current_rank_in_bjj` may be empty or less precise than the per-belt ladder/taxonomy; rank selection must use an
  explicit precedence and exact Prisma rank identity.
- Prod may change between dry-run and apply; the script needs a plan fingerprint/invariant re-check to fail closed.

### Scope guard

- No `prisma migrate dev`, `db push`, reset, schema edit, or shared-local-DB mutation.
- No RankAward table-drop or post-send epic work.
- No production write before the shown dry-run and explicit per-action operator authorization.
- No push, merge, or deploy before the separate explicit push authorization.
- No automatic expansion into edge-axis badges, owner-arm deletion, or stale-comment cleanup until the backfill is
  complete and verified.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Prisma Setup (live 2026-07-10), database runbook, lineage hub, ADR 0016, RankEntry
  unified flow, SESSION_0523, rankentry-unification epic, WL-P2-46.
- **Baseline pattern to extend:** standalone PrismaPg scripts using `../.generated/prisma/client`, dry-run default,
  transaction-scoped RankAward + RankEntry compatibility writes.
- **Custom delta:** local WordPress Pods read + one-to-one name/rank reconciliation and a fail-closed plan fingerprint.
- **No-bypass proof:** no app service or schema capability is replaced; this reuses the generated Prisma client and
  existing compatibility invariant without importing app modules under `.env.prod`.

## Cody pre-flight

### Pre-flight: WordPress belt backfill

#### 1. Existing implementation scan

- Graphify query used: `WordPress belt backfill RankAward RankEntry rigan Machado lineage WL-P2-46`.
- Found: `session-0522-belt-backfill.ts` (canonical-tree dry-run/apply + compatibility upsert),
  `session-0523-rorion-rankentry-verify.ts` (remote-prod host refusal), `reconcile-pods.mjs` (Pods current-rank and
  belt-ladder parsing), `enrich-bbl-members-pods.ts`, and `import-bbl-members-full.ts` (BJJ rank catalog/matching).

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Consulted live alignment URL: yes, Dirstarter Prisma Setup on 2026-07-10.
- Closest L1 pattern: PrismaPg + generated PrismaClient, specialized as a standalone operator script.
- Primitive API spot-check: not applicable; no UI primitive is used.

#### 3. Composition decision

- Extend the SESSION_0522 standalone-script and transaction/upsert pattern.
- Reuse the existing Pods belt-key→BJJ short-name vocabulary; do not invent a second rank taxonomy.
- Add one new committed session script because the operator requires a reproducible one-time prod-data artifact.

#### 4. Lane docs loaded

- Prior SESSION next-session and REVIEW_04 read: yes.
- ADRs/specs read: ADR 0016, ADR 0035, ADR 0043 history, RankEntry unified flow, rankentry-unification epic.
- Runbooks consulted: database runbook, lineage hub/SOP, repo truth index, failed-steps log, drift register D-023/D-028/D-033.

#### 5. Schema and environment spot-check

- Exact enums: `RankAwardSource={STATED,EARNED}`;
  `RankAwardVerificationStatus={UNVERIFIED,VERIFIED,DISPUTED,IMPORTED}`;
  `RankEntryStatus={PENDING,UNVERIFIED,VERIFIED,DISPUTED}`.
- Exact relations/constraints: `RankAward @@unique([passportId,rankId])`; `RankEntry.rankAwardId @unique`;
  `RankEntry @@unique([passportId,rankId])`; `Passport.rankAwardsEarned` and `Passport.rankEntries` are the back-relations;
  `LineageTreeMember @@unique([treeId,nodeId])` and owns no rank pointer.
- Prod command shape: from `apps/web`, `bun --env-file=/Users/brianscott/dev/ronin-0522/apps/web/.env.prod
scripts/session-0524-wp-belt-backfill.ts`; `--apply` is forbidden until separately authorized.
- Dev server: not needed for the data script; if later required, `npx next dev --turbo` from `apps/web`.
- Verification commands: focused script checks plus `bun run typecheck`, `bun run lint:check`,
  `bun run format:check`; multi-file tests use `--parallel=1`.

#### 6. Authorization and FAILED_STEPS check

- Authorization: standalone operator script; no runtime user session. Safety comes from exact tree/target predicates,
  remote-prod host guard, dry-run default, atomic writes, plan fingerprint, and explicit operator action.
- Prior failures: FS-0008 (infer-from-prose schema/API), FS-0024 (wrong-repo git mutation), plus D-033's prod/prodsnap
  lesson (audit the full prod table, not only script self-report).
- Mitigation: exact schema/scripts read from source; every command uses the canonical workdir; live prod is the target
  source; post-apply verification independently re-queries the full canonical tree.
- Manual Boundary Registry: no specific DB-write boundary row; the operator's explicit prod-write gate governs.

## Task log

| ID                   | Status                   | Summary                                                                                                                    |
| -------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| SESSION_0524_TASK_01 | landed                   | Live prod re-derived 33/33 targets; local WP SQL reconciled all 33 by exact normalized name with structured rank evidence. |
| SESSION_0524_TASK_02 | landed                   | Guarded script built, reviewed, gated, committed; exact 33-action dry-run fingerprint `07e66320…0974c` shown.              |
| SESSION_0524_TASK_03 | blocked on required gate | Await explicit operator authorization of the fingerprinted 33-action production apply; no write attempted.                 |

## What landed

- Added `apps/web/scripts/session-0524-wp-belt-backfill.ts`, a standalone PrismaPg operator script that:
  re-derives the live target cohort; reads the stopped Local WP site's persisted SQL dump; exact-matches names;
  resolves heterogeneous Pods rank fields, promotion ladders, taxonomy/categories, and linked Gravity Forms rank
  fields; maps to the exact IBJJF Rank row; and defaults to dry-run.
- Production apply is fail-closed: non-local prod host + exact BBL tree/rank-system guards, no unresolved target,
  stable-source check, a SHA-256 review fingerprint, `--apply --expect-plan=<sha256>`, a serializable all-or-nothing
  transaction, per-member live precondition rechecks, and post-write award/entry plus cross-axis proofs.
- Rank materialization follows the unified flow: `RankAward(source=STATED,
verificationStatus=IMPORTED)` preserves legacy provenance/read-only belt-gate semantics; the inlined canonical
  `rankEntryStatusForAward(IMPORTED)` mapping creates `RankEntry(status=VERIFIED)`.

## Decisions resolved

- The public `/wp-json/bbl/v1/members` collection is not a complete source for this lane: it covers only
  `bbl_member`/`bbl_member_profile`, while canonical targets also live in historical `member`, Bob Bass, and Andre
  Lima CPTs. The Local site was stopped, so the persisted current-prefix SQL dump is the reproducible source.
- Duplicate WP rows are not silently collapsed. Every exact-name row and every rank-tagged source value is shown;
  only structured monotonic belt evidence is combined, and the highest evidenced BJJ progression is selected. No
  missing rank defaults to White. The legacy `member` CPT is a general Rigan-student container, not a black-belt
  assertion, so its post type alone carries no rank authority.
- All 33 targets resolved without fuzzy matching after removing that unsafe CPT inference: BK0 ×15, BK1 ×1,
  BK2 ×3, BK4 ×1, BR0 ×4, P0 ×8, BL0 ×1.

## Files touched

- `apps/web/scripts/session-0524-wp-belt-backfill.ts`
- `docs/sprints/SESSION_0524.md`

## Verification

- Live read-only prod BEFORE probe: 84 members; OLD membership-verified 80; RankEntry VERIFIED 51; resolved VERIFIED
  84; intended RankEntry-only fixes 4; OLD→RankEntry regressions 33; membership fallback 33; no RankAward 33.
- Final dry-run: exact matches/ranks for 33/33; no write attempted; plan SHA-256
  `07e663209aa7046e6f5a830f00feaa9a5e94e5e8d8122a960ab6d7591450974c`.
- `bunx oxlint scripts/session-0524-wp-belt-backfill.ts` — pass.
- `bun run typecheck` — pass (`next typegen` + `tsc --noEmit`).
- `bun run lint:check` — pass with the repo's pre-existing warnings; no warning in the new script.
- `bun run format:check` — pass across 1,883 files.
- Independent hostile review found that the initial display hid lower-rank evidence from duplicate/history rows;
  fixed by printing per-record rank histories plus every rank-tagged source. Follow-up verdict: FIXED / PASS.

## Open decisions / blockers

- Mandatory production-data gate: the operator must explicitly authorize the exact 33 actions and fingerprint before
  Codex may run `--apply`. This is an expected gate, not a technical failure.
- Mandatory git push gate remains closed; no push will occur without a separate explicit operator “go.”

## Next session

## Review log

- **WP source inspection:** SQL dump preferred over incomplete/stopped REST surface; heterogeneous numeric/text Pods
  ranks, taxonomy, categories, and linked Gravity Forms were all handled without a White default.
- **Doug hostile review:** initial HIGH on hidden lower/duplicate evidence fixed; follow-up PASS. A second source audit
  then proved `member` is a general Rigan-student container, so its unsafe black-belt-floor inference was removed.
  Final targeted review: PASS, no blocker/high; safe to hold at the explicit apply gate.

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence
