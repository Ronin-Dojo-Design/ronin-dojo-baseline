---
title: "SESSION 0110 — Phase 3 Affiliate-Gear Extraction: Fully DB-Driven"
slug: session-0110
type: session
status: closed-full
created: 2026-05-09
updated: 2026-05-09
last_agent: copilot-session-0110
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0109.md
  - apps/web/lib/tuffbuffs/affiliate-gear.ts
  - apps/web/types/tuffbuffs-gear.ts
  - apps/web/server/web/affiliate-products/queries.ts
  - apps/web/app/(web)/gear/page.tsx
  - apps/web/prisma/seed-tuffbuffs-affiliate.ts
  - apps/web/prisma/seed-gear-recommendations.ts
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0110 — Phase 3 Affiliate-Gear Extraction: Fully DB-Driven

## Date

2026-05-09

## Operator

Brian Scott + Copilot acting as Petey (planner), Cody (builder), Doug (QA)

## Status

closed-full

## Goal

Phase 3 affiliate-gear extraction: audit remaining importers of `affiliate-gear.ts`, remove the hardcoded `tuffBuffsAffiliateGearProducts` array and `tuffBuffsAffiliateGearCollections` array, redirect seed scripts to self-contained data, remove backward-compat re-exports, and verify gear page remains fully DB-driven with zero regression.

## Graphify check

- Graph status: refreshed (`0f2ddc0` — 5306 nodes, 9279 edges, 407 communities)
- Query used: `affiliate-gear hardcoded products tuffBuffsAffiliateGearProducts imports gear page DB-driven removal`
- Files selected from graph: `affiliate-gear.ts`, `tuffbuffs-gear.ts`, `gear-utils.ts`, `queries.ts` (affiliate-products), `seed-tuffbuffs-affiliate.ts`, `seed-gear-recommendations.ts`, `gear/page.tsx`, `affiliate-gear-browser.tsx`, `affiliate-gear-card.tsx`, `affiliate-gear-grid.tsx`
- Verification note: Only 2 source files still import from `affiliate-gear.ts`: `seed-tuffbuffs-affiliate.ts` (imports `tuffBuffsAffiliateGearProducts`) and `seed-gear-recommendations.ts` (imports `tuffBuffsAffiliateGearCollections`). Gear page already uses DB queries. `formatGearPrice` already extracted to `gear-utils.ts` with backward-compat re-export.

## Petey Plan

### Goal

Fully decommission `affiliate-gear.ts` as a runtime dependency. Move seed data inline into seed scripts, delete the hardcoded arrays, remove backward-compat re-exports, verify zero importers remain.

### Tasks

#### TASK_01 — Audit importers of `affiliate-gear.ts`

- **Agent:** Cody
- **What:** Confirm the full importer list. Graphify shows exactly 2: `seed-tuffbuffs-affiliate.ts` and `seed-gear-recommendations.ts`. Verify no other source files import from this module (excluding `.next/` build artifacts).
- **Done means:** Documented importer list with zero surprises.

#### TASK_02 — Inline product data into `seed-tuffbuffs-affiliate.ts`

- **Agent:** Cody
- **What:** Copy the `tuffBuffsAffiliateGearProducts` array from `affiliate-gear.ts` into `seed-tuffbuffs-affiliate.ts` as a local `const`. Remove the import from `affiliate-gear.ts`. Ensure seed script still compiles and functions.
- **Done means:** `seed-tuffbuffs-affiliate.ts` no longer imports from `affiliate-gear.ts`. Types preserved.

#### TASK_03 — Inline collection data into `seed-gear-recommendations.ts`

- **Agent:** Cody
- **What:** Copy the `tuffBuffsAffiliateGearCollections` array from `affiliate-gear.ts` into `seed-gear-recommendations.ts` as a local `const`. Remove the import from `affiliate-gear.ts`.
- **Done means:** `seed-gear-recommendations.ts` no longer imports from `affiliate-gear.ts`.

#### TASK_04 — Strip `affiliate-gear.ts` down to empty or delete

- **Agent:** Cody
- **What:** With zero importers remaining, either delete `affiliate-gear.ts` entirely or reduce it to a tombstone comment pointing to DB queries and seed scripts. Remove the backward-compat `formatGearPrice` re-export (direct importers already use `gear-utils.ts`). Remove `getTuffBuffsAffiliateGearByIds`.
- **Done means:** No exports remain in `affiliate-gear.ts` (or file deleted). Zero import references across codebase.

#### TASK_05 — Type-check + verification

- **Agent:** Doug (QA)
- **What:** Run `bunx tsc --noEmit`. Verify gear page still renders from DB data. Confirm no broken imports.
- **Done means:** Clean type-check (pre-existing errors only). Zero new errors. Zero references to deleted exports.

### Parallelism

TASK_01 first (audit). Then TASK_02 + TASK_03 can be parallel (disjoint files). TASK_04 after both. TASK_05 last.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Mechanical audit, clear output |
| TASK_02 | Cody | Data copy + import removal |
| TASK_03 | Cody | Data copy + import removal |
| TASK_04 | Cody | File cleanup/deletion |
| TASK_05 | Doug | QA verification |

### Open decisions

- **Delete vs tombstone:** Should `affiliate-gear.ts` be fully deleted or kept as a tombstone? Petey recommends **delete** — seed scripts will have their own inline data, gear-utils.ts has `formatGearPrice`, types are in `tuffbuffs-gear.ts`. No reason to keep the file.

### Risks

- Seed scripts become larger with inline data (~400 lines of product definitions + ~170 lines of collections). Acceptable — seed data is reference data, not runtime code.
- Pre-existing Prisma stack depth errors will appear in type-check but are unrelated.

### Scope guard

If additional work surfaces during execution, note it in SESSION file under `Open decisions / blockers` — do NOT expand scope mid-task.

### Dirstarter implementation template

- **Docs read first:** Not applicable — no Dirstarter feature touched. Custom L2 domain.
- **Baseline pattern to extend:** None — this is cleanup/removal of hardcoded data.
- **Custom delta:** Seed data inlining + file deletion.
- **No-bypass proof:** No Dirstarter capability replaced.

## What Landed

1. **TASK_01** — Importer audit confirmed exactly 2 source files importing from `affiliate-gear.ts`: `seed-tuffbuffs-affiliate.ts` and `seed-gear-recommendations.ts`. Zero runtime code depends on the hardcoded arrays.
2. **TASK_02** — Inlined `tuffBuffsAffiliateGearProducts` (36 products) into `seed-tuffbuffs-affiliate.ts` as a local `const`. Removed import from `affiliate-gear.ts`.
3. **TASK_03** — Inlined `tuffBuffsAffiliateGearCollections` (5 collections) into `seed-gear-recommendations.ts` as a local `const`. Removed import from `affiliate-gear.ts`.
4. **TASK_04** — Deleted `affiliate-gear.ts` entirely. Zero remaining importers. Backward-compat re-exports (`formatGearPrice`, type re-exports) no longer needed — direct importers already use `gear-utils.ts` and `tuffbuffs-gear.ts`.
5. **TASK_05** — Type-check passed. 3 pre-existing errors only (Prisma stack depth, bun:test). Zero new errors.

## Files Touched

- `apps/web/prisma/seed-tuffbuffs-affiliate.ts` — inlined product data array, removed `affiliate-gear.ts` import
- `apps/web/prisma/seed-gear-recommendations.ts` — inlined collection data array, removed `affiliate-gear.ts` import
- `apps/web/lib/tuffbuffs/affiliate-gear.ts` — **DELETED**
- `docs/sprints/SESSION_0110.md` — this file

## Task Log

- `SESSION_0110_TASK_01` — ✅ complete
- `SESSION_0110_TASK_02` — ✅ complete
- `SESSION_0110_TASK_03` — ✅ complete
- `SESSION_0110_TASK_04` — ✅ complete
- `SESSION_0110_TASK_05` — ✅ complete

## Decisions Resolved

- ✅ Delete vs tombstone: `affiliate-gear.ts` fully deleted (no tombstone needed).
- ✅ Phase 3 extraction complete: gear page is fully DB-driven, seed scripts are self-contained.

## Open Decisions / Blockers

- Pre-existing type errors (Prisma stack depth in `tags/queries.ts`, `bun:test` module resolution in test files) — not related to this session.
- Phase 3 complete. Future work: admin UI for managing gear products/recommendations in DB (no hardcoded data remains).

## Reflections

- Three-phase extraction plan from SESSION_0107 is now fully complete. Hardcoded data → DB seeded → hardcoded file removed.
- The graphify query was precise — BFS identified exactly the right file cluster without needing broad grep.
- Inlining seed data makes seed scripts self-contained and independently runnable. The tradeoff (larger files) is acceptable for reference data that changes rarely.
- Clean deletion with zero broken imports confirms the Phase 2 backward-compat re-exports worked exactly as intended — they bridged the transition period and were removed cleanly.

## Next Session

### Goal

Post-extraction cleanup or next feature lane. Consider: admin UI for gear product management, discipline-specific product curation for the 7 remaining disciplines (judo, wrestling, etc.), or pivot to the next program plan priority.

### Inputs to read

- `docs/architecture/program-plan.md` — next sprint priority
- `apps/web/prisma/seed-gear-recommendations-remaining.ts` — the 7 disciplines with universal defaults

### First task

Review program plan for next priority. The affiliate-gear extraction epic is complete.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0110.md: status→closed-full, updated→2026-05-09. Deleted `affiliate-gear.ts` has no frontmatter. Seed scripts are code files (no frontmatter needed). |
| Backlinks/index sweep | No new wiki pages created. SESSION_0110 pairs_with updated. |
| Wiki lint | No wiki pages modified — lint not needed. |
| Kaizen reflection | Reflections section present: yes. Four observations. |
| Hostile close review | SESSION_0110_REVIEW_01 below. |
| Review & Recommend | Next session goal written: yes. |
| Memory sweep | No new protocols or architectural decisions. Phase 3 extraction epic complete — no memory update needed. |
| Next session unblock check | Unblocked — no user decisions needed. |
| Git hygiene | Pending — commit after full close steps. |

## Review Log

### SESSION_0110_REVIEW_01 — Hostile Close Review

**Reviewed tasks:** SESSION_0110_TASK_01 through TASK_05

**Dirstarter docs check:** Not applicable — no Dirstarter feature touched. Custom L2 domain cleanup.
**Verdict:** aligned

#### Review questions

1. **Plan sanity:** 5 tasks. Audit → inline product data → inline collection data → delete file → type-check. Clean sequential dependency.
2. **Dirstarter compliance:** No UI components written or modified. Seed scripts follow existing pattern.
3. **Security:** No new attack surfaces. Seed data is identical to what was hardcoded.
4. **Data integrity:** Seed scripts remain idempotent. Product/collection data is byte-identical to the deleted source.
5. **Lifecycle proof:** Type-check passed. Gear page untouched (already DB-driven from SESSION_0109).
6. **Verification honesty:** `bunx tsc --noEmit` ran. Pre-existing errors documented. Zero new errors.
7. **Workflow honesty:** TASK IDs logged. SESSION file complete.
8. **Merge readiness:** Ready to commit.

#### Kaizen reflection triage

1. **Is this safe and secure?** Yes. Data unchanged, only location moved.
2. **How many failed steps could we have prevented?** Zero — clean execution.
3. **Confidence 1–10:** 9/9/9

**Kaizen aggregate: 9**

## ADR / ubiquitous-language check

No new ADRs created. No new domain terminology introduced. Not needed.
