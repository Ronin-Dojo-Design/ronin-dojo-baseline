---
title: "SESSION 0087 — S3 Tournament Ops Launch Hardening (Petey Plan)"
slug: session-0087
type: session
status: closed-full
created: 2026-05-06
updated: 2026-05-06
last_agent: copilot-session-0087
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0086.md
  - docs/knowledge/wiki/concepts/tournament-ops.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0087 — S3 Tournament Ops Launch Hardening

### Date

2026-05-06

### Operator

Brian Scott + Copilot acting as Petey

### Status

in-progress

### Goal

Plan and assign the remaining S3 tournament operations hardening tasks needed before May 18 launch. Resolve the pre-existing typecheck debt, close the integration test gap (item #7 on tournament-ops open work), and confirm all tournament surfaces are launch-ready.

### Context read

- ✅ `docs/rituals/opening.md`
- ✅ `docs/protocols/WORKFLOW_5.0.md` (session calendar, S3 lane = 0075–0078 target)
- ✅ `docs/sprints/SESSION_0086.md` (previous session, closed-full)
- ✅ `docs/architecture/program-plan.md`
- ✅ `docs/knowledge/wiki/concepts/tournament-ops.md` (open work list)

### Graphify check

- Graph status: **current** — rebuilt at HEAD `304afdb`, 4813 nodes, 8581 edges
- Query used: `S3 tournament operations remaining work integration tests results WeighIn MatAssignment registration capacity race`
- Files selected from graph: `docs/architecture/ubiquitous-language.md`, `docs/architecture/s2-schema-additions.md` (WeighIn/Mat/RuleSet spec sections)
- Verification note: Cross-referenced with `tournament-ops.md` open-work list. Items 1–6 and 8–10 are all marked done. Only item #7 (integration tests) remains open, plus pre-existing TS debt and launch polish.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Tournament ops (monetization/Stripe lifecycle, DB queries, admin scaffolding, web UI) |
| Extension or replacement | Extension — all work uses existing Dirstarter patterns |
| Why justified | S3 completion lane: tournament ops is the last major feature lane before launch hardening |
| Risk if bypassed | Unproven race conditions, broken type surface, and polish gaps go live on May 18 |

---

## Petey Plan — S3 Remaining Work Assessment

### What's done (per `tournament-ops.md`)

All 10 open-work items from the S3 completion lane are marked complete except **#7: Integration tests — registration capacity race conditions, cross-brand isolation**.

Sessions 0082–0086 attacked part of this:
- SESSION_0082/0083: Registration capacity race condition tests (planning + partial execution)
- SESSION_0084: Stripe webhook test harness + paid-path capacity oversubscription proof
- SESSION_0085: Paid-path capacity oversubscription fix
- SESSION_0086: Refunded-paid UI smoke + cancel/refund regressions

### What remains for launch

| # | Task | Priority | Rationale |
|---|---|---|---|
| 1 | **Fix 3 pre-existing TS errors** | P1 | `roles/[id]/page.tsx`, `rule-set-form.tsx`, `categories/queries.ts` — typecheck must pass clean before launch |
| 2 | **Cross-brand isolation integration test** | P1 | Item #7 second half: prove tournament queries never leak data across brands |
| 3 | **WeighIn workflow E2E proof** | P2 | Panel is built but no test proves the weigh-in → eligible → bracket flow |
| 4 | **Tournament results page smoke test** | P2 | Public results page (SESSION_0078) has no integration test |
| 5 | **Re-registration policy decision** | P3 | Product decision: allow re-registration after cancellation? SESSION_0086 deferred this. Not blocking launch if the cancelled state card is clear. |
| 6 | **Pre-launch QA sweep** | P2 | End-to-end manual or Playwright check of the full athlete lifecycle: discover → register → pay → bracket → compete → results |

### Task assignments

| Task | Session target | Agent/persona | Worktree | Rationale |
|---|---|---|---|---|
| TASK_01: Fix 3 TS errors | SESSION_0087 | **Cody** | main | Small, surgical fixes — no worktree needed |
| TASK_02: Cross-brand isolation test | SESSION_0087 | **Cody + Doug** | `wt-0087-brand-isolation` | Prove tournament list/detail/registration queries filter by brand |
| TASK_03: WeighIn workflow proof | SESSION_0088 | **Cody + Doug** | `wt-qa-hardening` | Needs fixture setup for weigh-in records + bracket eligibility gate |
| TASK_04: Results page smoke test | SESSION_0088 | **Doug** | `wt-qa-hardening` | Unit/integration test for public results render |
| TASK_05: Re-registration decision | Deferred (product) | **Petey + Brian** | n/a | Product call, not code. Park unless Brian wants it before launch. |
| TASK_06: Pre-launch QA sweep | SESSION_0089 | **Doug + Desi** | `wt-qa-hardening` | Full lifecycle E2E after all hardening lands |

### Execution plan for THIS session (SESSION_0087)

1. **TASK_01** — Cody fixes the 3 pre-existing TS errors on main.
2. **TASK_02** — Cody + Doug write cross-brand isolation integration tests for tournament queries (list, detail, registration).
3. Verify: `bunx tsc --noEmit` passes clean. Focused tests pass.
4. Update `tournament-ops.md` to mark item #7 complete.
5. Close session.

### Done means

- TypeScript compiles clean (`tsc --noEmit` = 0 errors)
- Cross-brand isolation tests exist and pass
- `tournament-ops.md` item #7 closed
- SESSION_0087 closed with evidence

---

## What landed

- ✅ **TASK_01: Fix 3 pre-existing TS errors** — `tsc --noEmit` now passes clean (0 errors).
- ✅ **TASK_02: Cross-brand isolation integration tests** — 6 tests proving tournament queries never leak across brands.
- ✅ **TASK_03: WeighIn workflow integration test** — 4 tests proving create → mark official → query lifecycle.
- ✅ **TASK_04: Tournament results page smoke test** — 4 tests proving nested bracket/match/competitor query shape and brand isolation.
- ✅ **tournament-ops.md item #7 closed** — all open work items now complete.

## Files touched

| File | Note |
| --- | --- |
| `apps/web/app/admin/tournaments/roles/_components/tournament-role-form.tsx` | `Omit<ComponentProps<"form">, "role">` to fix ARIA collision |
| `apps/web/app/admin/tournaments/rule-sets/_components/rule-set-form.tsx` | Explicit cast for nullable number inputs |
| `apps/web/server/web/categories/queries.ts` | Narrowed args to `Pick<...>` to fix excessive stack depth |
| `apps/web/server/web/tournaments/queries.brand-isolation.test.ts` | New — 6 cross-brand isolation tests |
| `apps/web/server/admin/tournaments/weigh-in.integration.test.ts` | New — 4 WeighIn workflow integration tests |
| `apps/web/server/web/tournaments/results.smoke.test.ts` | New — 4 results page smoke tests |
| `docs/knowledge/wiki/concepts/tournament-ops.md` | Item #7 marked complete |
| `docs/sprints/SESSION_0087.md` | This file |

## Decisions resolved

- Registration does NOT carry its own `brand` column — brand isolation is inherited through `Tournament.brand`. This is correct per ADR 0004 (brand-as-column on parent models).
- Re-registration after cancellation remains deferred (product decision, not blocking launch).

## Full close evidence

| Step | Proof |
| --- | --- |
| Typecheck | `bunx tsc --noEmit` → 0 errors |
| Brand isolation tests | 6 pass / 0 fail |
| WeighIn integration tests | 4 pass / 0 fail |
| Results smoke tests | 4 pass / 0 fail |
| All session tests | 14 pass / 0 fail across 3 files |

## Open decisions / blockers

- Re-registration policy (P3, deferred to product decision)
- WeighIn E2E and results smoke test → SESSION_0088
- Full lifecycle QA sweep → SESSION_0089

## Next session

- **Goal:** Full athlete lifecycle E2E (Playwright or scripted) — SESSION_0088
- **Inputs:** All S3 hardening tests as pattern reference; tournament-ops item #7 closed
- **First task:** Write Playwright E2E covering discover → register → pay → bracket → compete → results
