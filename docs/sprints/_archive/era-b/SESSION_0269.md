---
title: "SESSION 0269 — §14e networkidle cleanup: lineage finish + CI matrix proof"
slug: session-0269
type: session--implement
status: closed
created: 2026-05-27
updated: 2026-05-27
last_agent: copilot-session-0269
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0268.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0269 — §14e networkidle cleanup: lineage finish + CI matrix proof

## Date

2026-05-27

## Operator

Brian + copilot-session-0269 (Petey orchestrating; Cody implementation)

## Goal

1. Record the SESSION_0268 follow-up matrix CI run results (all three browsers green, wall times).
2. Document branch protection deferral with a concrete revisit trigger.
3. Drain `editor-drag-reorder.spec.ts` (3 calls) and `public-rank-redaction.spec.ts` (2 calls) to zero — finishing the `e2e/lineage/` directory.
4. Stretch: drain `data-subject-request-triage.spec.ts` (5 calls) if Path A goes smooth.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None. Ronin Playwright specs, SOP docs, session/wiki docs only. |
| Extension or replacement | Extension only. Applies existing §14 deterministic-locator policy. |
| Why justified | SESSION_0268 left the lineage directory partially drained; finishing it closes the lineage cluster and reduces §14e backlog from ~27 to ~22 (Path A) or ~17 (Path A+B). |
| Risk if bypassed | Remaining networkidle calls in lineage specs cause local full-suite flakes and false negatives. |

## Graphify check

- **Graph status:** available, 7,250 nodes / 11,911 edges / 1,046 communities at bow-in.
- **Queries used:** `graphify query` for networkidle/§14e/editor-drag-reorder/public-rank-redaction/data-subject-request-triage. Graphify returned code-layer nodes; test files were opened by known path.
- **Files selected:** `apps/web/e2e/lineage/editor-drag-reorder.spec.ts`, `apps/web/e2e/lineage/public-rank-redaction.spec.ts`, `apps/web/e2e/admin/data-subject-request-triage.spec.ts`, `docs/runbooks/sop-test-writing.md`, `.github/workflows/playwright.yml`.

## Petey plan

### Goal

Record CI matrix proof, close the lineage networkidle cluster, optionally start admin cluster.

### Tasks

#### SESSION_0269_TASK_01 — Record CI matrix results + branch protection decision

- **Agent:** Cody
- **What:** Document the follow-up matrix CI run results in SESSION_0269. Record wall times, status context names, and the branch protection deferral decision with revisit trigger.
- **Done means:** SESSION file has CI evidence table and branch protection decision documented.
- **Depends on:** nothing (already gathered from `gh` CLI at bow-in).

#### SESSION_0269_TASK_02 — Drain `editor-drag-reorder.spec.ts` (3 calls)

- **Agent:** Cody
- **What:** Replace 3 `networkidle` waits with deterministic locators.
  - `openEditMode()` helper: remove the networkidle wait; the function already checks heading visibility on the next line — just increase timeout.
  - Two post-`reload()` calls in the test body: replace with heading visibility assertion (tree name h1).
- **Steps:**
  1. In `openEditMode()`, remove `await page.waitForLoadState("networkidle")` — the `expect(heading).toBeVisible({ timeout: 20_000 })` on the next line IS the deterministic anchor.
  2. After both `page.reload()` calls, replace `await page.waitForLoadState("networkidle")` with `await expect(page.getByRole("heading", { name: treeName })).toBeVisible({ timeout: 30_000 })` (need to pass `treeName` or use `fixture.treeName`).
  3. Run chromium + firefox.
- **Done means:** Zero `networkidle` in the file, chromium + firefox pass.
- **Depends on:** TASK_01 (documentation only, no code dependency — can start immediately).

#### SESSION_0269_TASK_03 — Drain `public-rank-redaction.spec.ts` (2 calls)

- **Agent:** Cody
- **What:** Replace 2 `networkidle` waits with deterministic locators.
  - Both are after `page.goto("/lineage/${fixture.treeSlug}")` — replace with `await expect(page.getByRole("heading", { name: fixture.treeName })).toBeVisible({ timeout: 30_000 })`.
  - The redaction test already has this assertion right after the networkidle wait, so just remove the networkidle line.
  - The positive control test needs the heading assertion added.
- **Done means:** Zero `networkidle` in the file, chromium + firefox pass.
- **Depends on:** TASK_02.

#### SESSION_0269_TASK_04 — Stretch: Drain `data-subject-request-triage.spec.ts` (5 calls)

- **Agent:** Cody
- **What:** Replace 5 `networkidle` waits with deterministic locators.
  - Non-admin 404 test: wait for login redirect or 404 content instead.
  - Admin DSR list: wait for submitter email text visibility.
  - Detail view: wait for PENDING badge visibility.
  - Post-transition reloads: wait for status badge visibility (IN_PROGRESS, FULFILLED).
- **Done means:** Zero `networkidle` in the file, chromium + firefox pass. If this doesn't go smooth, push to next session.
- **Depends on:** TASK_03.

#### SESSION_0269_TASK_05 — Update §14e backlog + docs

- **Agent:** Cody
- **What:** Update `sop-test-writing.md §14e` backlog table, `wiki/index.md`, session file.
- **Done means:** Backlog counts reflect drained files.
- **Depends on:** TASK_02 + TASK_03 (+ TASK_04 if completed).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0269_TASK_01 | Cody | Documentation task, no code. |
| SESSION_0269_TASK_02 | Cody | §14 pattern application. |
| SESSION_0269_TASK_03 | Cody | Same pattern, separate file. |
| SESSION_0269_TASK_04 | Cody | Stretch, same pattern, admin domain. |
| SESSION_0269_TASK_05 | Cody | Docs update. |

### Scope guard

Path A: `editor-drag-reorder.spec.ts` + `public-rank-redaction.spec.ts`. Path B stretch: `data-subject-request-triage.spec.ts`. No other files. No branch protection changes.

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0269_TASK_01 | Cody (copilot) | done | Documented CI matrix evidence (run `26529173478` all green) and branch protection deferral with revisit trigger. |
| SESSION_0269_TASK_02 | Cody (copilot) | done | Drained `editor-drag-reorder.spec.ts` from 3 `networkidle` calls to zero. Removed networkidle from `openEditMode()` helper (heading check was already next line), replaced two post-reload waits with heading visibility. Verified chromium 1/1, firefox 1/1. |
| SESSION_0269_TASK_03 | Cody (copilot) | done | Drained `public-rank-redaction.spec.ts` from 2 `networkidle` calls to zero. Both were pre-heading-check; removed networkidle and bumped timeout to 30s. Verified chromium 2/2, firefox 2/2. |
| SESSION_0269_TASK_04 | Cody (copilot) | done | Stretch completed. Drained `data-subject-request-triage.spec.ts` from 5 `networkidle` calls to zero. Non-admin test relies on existing table count assertion; admin flow uses existing status badge visibility assertions with 10s timeout. Verified chromium 2/2. Firefox not applicable (admin specs are chromium-only per SESSION_0266 config). |
| SESSION_0269_TASK_05 | Cody (copilot) | done | Updated `sop-test-writing.md §14e` backlog table (removed 3 files, updated totals to ~17 calls across 8 files), `wiki/index.md` SESSION_0269 row, both `last_agent` bumped. |

## What landed

- **`e2e/lineage/` directory is fully networkidle-free.** `editor-drag-reorder.spec.ts` (3→0) and `public-rank-redaction.spec.ts` (2→0) join the previously cleaned `authenticated-lifecycle.spec.ts` and `public-visibility.spec.ts`. All four lineage spec files now use deterministic post-hydration locators exclusively.
- **`e2e/admin/data-subject-request-triage.spec.ts` drained (5→0).** First admin file cleaned in the §14e campaign.
- **CI matrix proof recorded.** SESSION_0268 follow-up run `26529173478` confirmed all three browsers pass. Wall time ~17m28s (42% improvement over serial).
- **Branch protection deferred** with documented trigger: §14e backlog ≤5 calls AND ≥5 consecutive green matrix runs.
- **§14e backlog reduced** from ~27 calls / 11 files to ~17 calls / 8 files.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/e2e/lineage/editor-drag-reorder.spec.ts` | Removed 3 `networkidle` waits; deterministic heading locators. |
| `apps/web/e2e/lineage/public-rank-redaction.spec.ts` | Removed 2 `networkidle` waits; deterministic heading locators. |
| `apps/web/e2e/admin/data-subject-request-triage.spec.ts` | Removed 5 `networkidle` waits; existing assertions sufficient. |
| `docs/runbooks/sop-test-writing.md` | Updated §14e backlog table, `last_agent`. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0269 row, bumped `last_agent`. |
| `docs/sprints/SESSION_0269.md` | Current session ledger. |

## Decisions resolved

- **SESSION_0268_FINDING_01 resolved.** WebKit controlled-input fix proven in CI run `26529173478` — all three browsers pass.
- **Branch protection:** Deferred. Revisit trigger: §14e backlog ≤5 calls remaining AND ≥5 consecutive green matrix runs. Context names: `Playwright (chromium)`, `Playwright (firefox)`, `Playwright (webkit)`.
- **Lineage cluster complete.** All `e2e/lineage/` specs are networkidle-free. Future §14e work targets admin and tournament clusters.

## Open decisions / blockers

- **§14e backlog remains open:** ~17 calls across 8 files. Remaining clusters: admin (bracket 2, membership-detail 4, membership-list 2, scoring 1, tournament-list 2) and tournaments (list 1, register 2, results 3).
- No blockers for next session.

## Verification

| Check | Result |
| --- | --- |
| Exact zero-call audit: editor-drag-reorder | Pass — 0 `networkidle` lines. |
| Exact zero-call audit: public-rank-redaction | Pass — 0 `networkidle` lines. |
| Exact zero-call audit: data-subject-request-triage | Pass — 0 `networkidle` lines. |
| Biome: lineage files | Pass — checked 2 files, fixed 2. |
| Biome: admin file | Pass — checked 1 file, no fixes needed. |
| chromium editor-drag-reorder | Pass — 1/1. |
| firefox editor-drag-reorder | Pass — 1/1. |
| chromium public-rank-redaction | Pass — 2/2. |
| firefox public-rank-redaction | Pass — 2/2. |
| chromium data-subject-request-triage | Pass — 2/2. |
| firefox data-subject-request-triage | N/A — admin specs are chromium-only per SESSION_0266 Playwright config. |
| `bun run typecheck` in `apps/web` | Pass — `next typegen` + `tsc --noEmit`. |
| Wiki lint | Pre-existing: 232 error(s), 596 warning(s). No SESSION_0269-specific breakage. |

## Review log

### SESSION_0269 — §14e lineage finish + admin stretch

#### Review

**SESSION_0269_REVIEW_01 — §14e lineage cluster completion and admin DSR cleanup**

- **Reviewed tasks:** SESSION_0269_TASK_01 through TASK_05.
- **Dirstarter docs check:** Not applicable. No Dirstarter-owned baseline layer touched.
- **Verdict:** PASS. All three target files drained to zero. The `e2e/lineage/` directory is fully clean. CI matrix evidence recorded. Branch protection decision documented with concrete revisit trigger.

#### Findings

- No findings. All tasks completed cleanly, all tests pass.

## Hostile close review

### SESSION_0269

1. **Plan sanity:** Good. Petey plan had 5 tasks with clear Path A / Path B stretch structure. Path A completed smoothly so Path B executed. Scope guard held.
2. **Dirstarter compliance:** Aligned. No baseline layer touched.
3. **Security/data integrity:** No production data path changed. Tests use stronger deterministic assertions.
4. **Verification honesty:** All three files audited at zero. Chromium + firefox for lineage files, chromium-only for admin (correct per Playwright config). Typecheck, Biome, wiki-lint all ran with results recorded.
5. **Workflow honesty:** Graphify used at bow-in for navigation. Files opened directly by known path. No grep-for-planning violations.
6. **Score:** 9.5/10. Clean execution, both paths completed, no findings.

## ADR / ubiquitous-language check

No ADR required. Session applies existing SOP §14 pattern to additional spec files.

No ubiquitous-language update required.

## Next session

- **Goal:** SESSION_0270 — continue §14e networkidle cleanup: admin cluster.
- **Inputs to read:** `docs/sprints/SESSION_0269.md`, `docs/runbooks/sop-test-writing.md §14e`.
- **First task:** Drain `e2e/admin/membership-detail.spec.ts` (4 calls) — largest remaining admin file.
- **Stretch targets:** `e2e/admin/bracket.spec.ts` (2), `e2e/admin/membership-list.spec.ts` (2), `e2e/admin/scoring.spec.ts` (1), `e2e/admin/tournament-list.spec.ts` (2). If admin cluster goes smooth, start tournament cluster.
- **Branch protection check:** If this brings backlog ≤5 and we have ≥5 consecutive green matrix runs, configure required status checks.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0269.md` frontmatter set to `session--implement`, `status: closed`, `last_agent: copilot-session-0269`; `sop-test-writing.md` and `wiki/index.md` `last_agent` bumped. |
| Backlinks/index sweep | `wiki/index.md` SESSION table includes SESSION_0269; `SESSION_0269.md` backlinks to wiki index and pairs with SESSION_0268. |
| Wiki lint | `bun run wiki:lint` ran; 232 error(s), 596 warning(s) — pre-existing debt, no SESSION_0269-specific breakage. |
| Kaizen reflection | Implementation-only session; no separate reflections needed. |
| Hostile close review | Present in `## Hostile close review`. |
| Review & Recommend | Present in `## Next session`. |
| Memory sweep | No operator memory update needed; backlog changes are in `sop-test-writing.md §14e`. |
| Next session unblock check | Unblocked; next task is admin cluster cleanup. |
| Git hygiene | Pending — commit/push follows this ledger close. |
| Graphify update | Scheduled after commit/push. |

## Status

closed
