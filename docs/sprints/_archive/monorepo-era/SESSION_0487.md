---
title: "SESSION 0487 — Belt-verification Slice V1: PassportClaimType enum + PassportClaimRequest.type + migration"
slug: session-0487
type: session--implement
status: closed
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0487
sprint: S49
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/sprints/SESSION_0486.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0487 — Belt-verification Slice V1 (schema)

## Date

2026-07-01

## Operator

Brian + claude-session-0487

## Goal

Execute **Slice V1** of the Belt Verification Subsystem block in `docs/petey-plan-0477-belt-journey-crm-epic.md`
(designed + grill-ratified at SESSION_0486): add `enum PassportClaimType { IDENTITY, RANK_PROMOTION }` and a
`type PassportClaimType @default(IDENTITY)` column on `PassportClaimRequest`, plus a hand-authored **additive**
migration (new enum + non-null column with a default; existing rows backfill to `IDENTITY`). Schema-only slice —
no runtime code; the finalize branch (V3) and submit oRPC (V2) read `type` in later slices. Human-reviewed PR.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Parent: `docs/sprints/SESSION_0486.md` (belt-verification design + grill; B1 · A1 · C-implied · soft-gate).
- Binding spec: the "Belt Verification Subsystem — Block-A build spec" block of `petey-plan-0477` + ADR 0035
  Amendment 1 (DRAFT). Design is LOCKED — no fork re-opening.

### Branch and worktree

- Branch: `session-0487-belt-verify-build`
- Worktree: `/Users/brianscott/dev/ronin-0477` (bootstrapped this session: `bun install` + `.env` + prisma generate)
- Status at bow-in: clean (off `main` @ `ef62e53f`)
- Baseline: `prisma migrate status` → 62 migrations, DB up to date; `prisma validate` clean.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (schema + migration) |
| Extension or replacement | Extension — adds a discriminant column to an existing app model (`PassportClaimRequest`, ADR 0036); no Dirstarter capability replaced |
| Why justified | Belt-promotion claims reuse the unified claim queue; a `type` column is the minimal additive extension |
| Risk if bypassed | N/A — additive, non-breaking |

Live docs checked during planning: Prisma (migration flow via `[[prisma-prod-migration-flow]]` + schema-migration runbook).

## Cody pre-flight

### Pre-flight: Slice V1 schema

#### Schema checklist

- **Models changed:** 1 (`PassportClaimRequest` — add 1 column) + 1 new enum (`PassportClaimType`). < 3 models →
  no mandatory Petey gate (design already Petey-planned at SESSION_0486).
- **Additive + non-breaking:** new enum + a `NOT NULL DEFAULT 'IDENTITY'` column — existing rows get the default;
  no data migration; no drop/rename. Safe for the `prebuild → migrate deploy` auto-apply ([[prisma-prod-migration-flow]]).
- **Migration authored by hand** (house convention — descriptive header + SQL), applied locally via `migrate
  deploy` (never `migrate dev` — avoids any reset of the local `ronindojo_prodsnap`). File committed → prod applies on deploy.

#### Lane docs loaded

- Read: `petey-plan-0477` V1 spec, ADR 0035 Amendment 1, `schema-migration.md`, `[[prisma-prod-migration-flow]]`.
- Prior art mirrored: `apps/web/prisma/migrations/20260630000000_drop_lineage_tree_member_selected_rank/` (header+SQL style).

## Petey plan

### Goal

Land the `PassportClaimType` discriminant additively; prove it validates + applies.

### Tasks

#### SESSION_0487_TASK_01 — `PassportClaimType` enum + `PassportClaimRequest.type` + migration

- **Agent:** Cody (inline)
- **What:** add the enum + column to `schema.prisma`; hand-author `20260701000000_add_passport_claim_type/migration.sql`.
- **Done means:** `prisma validate` clean; `migrate deploy` applies it; `migrate status` in sync; client regenerates;
  `typecheck` + `lint:check` + `format:check` + `wiki:lint` green.
- **Depends on:** nothing.

### Scope guard

- **In:** the enum + the column + the migration. **Out:** V2–V6 (submit oRPC, finalize branch, CRUD rework, queue
  UI, proof) — one slice per session. No runtime code reads `type` yet.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0487_TASK_01 | landed | `PassportClaimType` enum + `PassportClaimRequest.type` column + additive migration `20260701010000_add_passport_claim_type`; validated + shadow-replay verified; client regenerated. |

## What landed

- **Slice V1 (schema) complete.** `enum PassportClaimType { IDENTITY, RANK_PROMOTION }` + a
  `type PassportClaimType @default(IDENTITY)` column on `PassportClaimRequest`, plus the hand-authored additive
  migration `20260701010000_add_passport_claim_type/migration.sql` (new enum + `NOT NULL DEFAULT 'IDENTITY'`
  column — every existing row backfills to `IDENTITY`, no data migration). No runtime code reads `type` yet
  (that's Slices V2/V3). The Prisma client regenerated with the new type.

## Decisions resolved

- **No `migrate dev` / no reset.** `migrate dev --create-only` reported the shared local `ronindojo_prodsnap`
  DB is drifted (a concurrent session applied `20260701000000_add_rank_milestone` — the held belt-journey
  Slice 2, not on `main`) and wanted to **reset**. Refused (no-reset rule + shared snapshot). Hand-authored the
  migration instead and verified via **shadow-DB replay** (`migrate diff --from-migrations → --to-schema` =
  "No difference detected"), which proves both correctness and fresh-DB applicability without touching prodsnap.
- **Migration timestamp `20260701010000`** (not `...000000`) — distinct from and sorting after the concurrent
  same-date `add_rank_milestone`, so the two parallel 2026-07-01 migrations never collide when the belt PRs
  rebase onto `main`. They target independent tables (order-independent).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | **+enum `PassportClaimType`**; `+type` column on `PassportClaimRequest` |
| `apps/web/prisma/migrations/20260701010000_add_passport_claim_type/migration.sql` | **NEW** — additive migration |
| `docs/sprints/SESSION_0487.md` | **NEW** — this session |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx prisma format` + `prisma validate` | ✅ formatted; schema valid |
| `bun run db:generate` | ✅ client regenerated with `PassportClaimType` + `type` |
| `prisma migrate diff --from-migrations → --to-schema --exit-code` | ✅ **No difference detected** (fresh shadow-DB replay realizes the schema — correctness + fresh-DB apply proof) |
| `bun run typecheck` | ✅ 0 errors (`type` has a default → no existing create-call breaks) |
| `bun run lint:check` (oxlint) | ✅ 0 errors (pre-existing warnings only, in untouched files) |
| `bun run format:check` (oxfmt) | ✅ clean (1714 files) |
| `bun run wiki:lint` | ✅ 0 errors (16 pre-existing warnings in untouched docs) |
| `next build` / tests | N/A — schema-only slice, no runtime code (per plan) |
| Applied to shared local prodsnap | ❌ deliberately NOT — DB drifted by concurrent `add_rank_milestone`; prod auto-applies on deploy; fresh-DB apply proven via shadow replay |

## Open decisions / blockers

- **Env finding (non-blocking): the local `ronindojo_prodsnap` DB is shared across all worktrees** (`localhost:5432`),
  so a concurrent session's migration (`add_rank_milestone`, held Slice 2) shows as drift in this one and makes
  `migrate dev` want to reset. Not a code defect — a parallel-session env gotcha. Mitigation used: hand-author +
  shadow-replay verify, never `migrate dev`, never apply to the shared DB from a parallel session. Worth a memory
  note for future parallel-migration sessions.
- **Migration not applied to any live DB this session** (by design). It applies on the next prod deploy (additive,
  safe) and can be applied to a clean local DB by a non-parallel session; the shadow replay already proved it applies.

## Next session

### Goal

Execute **Slice V2** of `petey-plan-0477` — `submitRankPromotionClaim` oRPC (member, own-Passport `authedProcedure`):
create a `PassportClaimRequest { type: RANK_PROMOTION, claimedRankId, evidence }`, guarded (own passport ·
`claimedRank.sortOrder > verified ceiling` · one open promotion per passport · photo soft-gate). Then Slice V3
branches `finalizePassportClaim` on `type`.

### First task

Read the Slice V2 spec + `server/orpc/procedure.ts` (`authedProcedure`) + `submitPassportClaim` core +
`pickTopAwardInDiscipline` (the ceiling), then implement `submitRankPromotionClaim` with Zod in/out + invariant
unit tests (own-only · above-ceiling-only · one-open · submit-without-photo allowed). Rebase onto `main` first
(this V1 migration should be merged before V2 builds on it).

## Review log

### SESSION_0487_REVIEW_01 — self-review

- **Reviewed:** SESSION_0487_TASK_01.
- **Verdict:** Clean additive schema slice, correctly scoped (V1 only, no runtime code). Handled the shared-DB
  drift trap correctly (refused the reset; shadow-replay verified). Migration is house-style + committed →
  prod-safe. Score deferred: no Class-A runtime code shipped.
- **Follow-up:** V2 must rebase onto `main` after this migration merges.

## Hostile close review

Schema-only slice. Self-assessed:

- **Giddy (architecture):** pass — additive discriminant on an existing model (ADR 0036), design pre-ratified
  (SESSION_0486); no god-table, no data migration, `@default` keeps existing writers compiling.
- **Doug (verification honesty):** pass — did NOT claim a live-DB apply; proved correctness + fresh-DB
  applicability via shadow replay; recorded the deliberate no-apply + the drift finding honestly.
- **Desi:** N/A (no UI).
- **Kaizen aggregate:** 8.5/10 — clean, honest, correctly refused the reset trap; −1.5 because a fully clean
  environment would have let a real `migrate deploy` prove the apply end-to-end (shadow replay is a strong proxy).

## ADR / ubiquitous-language check

- **ADR update: not required this slice.** The decision is already ratified in ADR 0035 Amendment 1 (DRAFT) +
  ADR 0036; V1 implements the `type` discriminant that Amendment 1 §"decision 1" specifies. Amendment 1 finalizes
  to `accepted` at Slice V6, not here.
- **Ubiquitous language:** the terms (Rank promotion, Backfill award) live in ADR 0035 Amendment 1; mirror into
  `ubiquitous-language.md` when the amendment finalizes (tracked in the plan), not this slice.

## Reflections

- **The parallel-session shared-DB trap is real and sharp.** `migrate status` said "up to date" at bow-in, then
  minutes later `migrate dev` wanted to reset — because a *different* worktree advanced the shared `localhost:5432`
  prodsnap between the two checks. In a parallel-dispatch world, `migrate dev` is dangerous; hand-author +
  `migrate diff` shadow-replay is the safe pattern. Worth wiring into the schema-migration runbook.
- **`migrate diff --from-migrations → --to-schema` is the unsung hero** — it verifies a migration is complete and
  fresh-DB-applicable using an ephemeral shadow DB, immune to prodsnap drift. Better than `migrate deploy` against
  a shared, concurrently-mutated dev DB.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0487 frontmatter current (`last_agent: claude-session-0487`); schema/migration are code (no JETTY). |
| Backlinks/index sweep | wiki index row added for SESSION_0487 (below). |
| Wiki lint | `bun run wiki:lint` → **0 errors**, 16 pre-existing warnings (untouched files). |
| Kaizen reflection | yes — `## Reflections` present. |
| Hostile close review | self-assessed (schema-only); Giddy/Doug pass, Desi N/A. |
| Code-quality gate (Class-A) | no Class-A runtime code this slice (schema + migration only). |
| Runtime verification (Doug) | no runtime surface touched (no oRPC/UI yet — V2+). |
| Review & Recommend | yes — Next session = Slice V2. |
| Memory sweep | to add: parallel-session shared-DB drift gotcha (schema-migration). |
| Next session unblock check | unblocked — V2 is cold-ready from the plan (rebase onto main after this migration merges). |
| Git hygiene | branch `session-0487-belt-verify-build` (worktree `../ronin-0477`); single commit staged; **push held for explicit operator "go"**. |
| Graphify update | skipped — Graphify indexes the canonical checkout (0 nodes here); schema node change picked up on next canonical `graphify update`. |
