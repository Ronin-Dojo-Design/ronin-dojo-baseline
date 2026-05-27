---
title: "SESSION 0268 — networkidle backlog cleanup first pass"
slug: session-0268
type: session--implement
status: closed
created: 2026-05-27
updated: 2026-05-27
last_agent: codex-session-0268
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0267.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0268 — networkidle backlog cleanup first pass

## Date

2026-05-27

## Operator

Brian + codex-session-0268 (Petey orchestrating; Cody implementation; Doug/Giddy review at close)

## Goal

Drain the `waitForLoadState("networkidle")` backlog in `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts` to zero, verify the spec under chromium and firefox, update the §14e backlog table, and assess whether the long Playwright CI workflow can be tightened without weakening the useful signal.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None. This session touches Ronin Playwright specs, the Ronin test-writing SOP, and session/wiki documentation. |
| Extension or replacement | Extension only. The work applies the existing Ronin §14 locator policy to current tests. |
| Why justified | SESSION_0267_FINDING_01 left the networkidle backlog open; `authenticated-lifecycle.spec.ts` is the largest lineage-cluster offender and causes local full-suite flakes. |
| Risk if bypassed | Local full-suite Playwright runs keep producing false negatives and cascading serial-suite skips, which weakens dev confidence even though CI runs single-worker. |

## Graphify check

- **Graph status:** available, 7,238 nodes / 11,872 edges / 1,086 communities at bow-in.
- **Queries used:** `graphify explain` for `sop-test-writing.md`, `authenticated-lifecycle.spec.ts`, `public-visibility.spec.ts`; targeted query `Playwright networkidle waitForLoadState section 14 backlog table timeout policy authenticated-lifecycle public-visibility`.
- **Files selected from graph:** `docs/runbooks/sop-test-writing.md`, `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts`, `apps/web/e2e/lineage/public-visibility.spec.ts`.
- **Verification note:** Exact files were opened directly after Graphify selection; Graphify was used for navigation, not proof.

## Petey plan

### Goal

Apply the §14 deterministic-locator pattern to the largest lineage networkidle offender, verify cross-browser stability, then close with an honest CI-duration recommendation.

### Tasks

#### SESSION_0268_TASK_01 — Drain `authenticated-lifecycle.spec.ts` networkidle calls

- **Agent:** Cody
- **What:** Replace every remaining `page.waitForLoadState("networkidle")` in `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts` with a stable visible heading or form-control assertion.
- **Steps:**
  1. Walk the spec top-to-bottom and map each wait to the page/modal it follows.
  2. Pick the first stable post-hydration heading or form-control for each page.
  3. Replace waits with `await expect(...).toBeVisible({ timeout: 30_000 })`; use existing `40_000` URL timeout only for redirect URL matching.
  4. Run the spec under chromium and firefox.
- **Done means:** The file has zero `networkidle` waits and passes under chromium + firefox.
- **Depends on:** nothing.

#### SESSION_0268_TASK_02 — Stretch lineage cleanup: `public-visibility.spec.ts`

- **Agent:** Cody
- **What:** If TASK_01 stays green, remove the 3 `networkidle` waits from `apps/web/e2e/lineage/public-visibility.spec.ts`.
- **Steps:**
  1. Replace listing/detail waits with first stable headings or search/listing controls.
  2. Re-run chromium + firefox for the spec.
  3. Update §14e backlog counts.
- **Done means:** `public-visibility.spec.ts` has zero `networkidle` waits and both browsers pass.
- **Depends on:** TASK_01.

#### SESSION_0268_TASK_03 — CI workflow duration review

- **Agent:** Giddy/Doug sidecar explorer
- **What:** Inspect the Playwright GitHub Actions workflow and recent run evidence to decide whether the >30m signal is necessary as-is or can be tightened.
- **Steps:**
  1. Inspect workflow file(s), Playwright config, and recent run metadata.
  2. Identify what drives runtime.
  3. Recommend low-risk changes or explain why the current shape should stay.
- **Done means:** SESSION file records a concrete recommendation and any follow-up is staged.
- **Depends on:** nothing; can run in parallel.

### Parallelism

TASK_03 is delegated to a read-only sidecar explorer while Cody performs TASK_01 locally. TASK_02 waits for TASK_01 verification because it is stretch work and touches a separate spec file.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0268_TASK_01 | Cody | Straight implementation of an existing SOP pattern. |
| SESSION_0268_TASK_02 | Cody | Same pattern, separate file, safe as stretch after primary proof. |
| SESSION_0268_TASK_03 | Giddy/Doug sidecar | CI economics + merge-signal question is independent from spec edits. |

### Open decisions

- Whether to change the CI workflow this session depends on the sidecar evidence. Low-risk YAML edits are in scope; branch protection changes are optional and only if the current repo settings make them obvious and safe.

### Risks

- Some pages may render duplicate headings; use `level` or a nearby role fallback where needed.
- The serial auth-lifecycle spec is stateful. Preserve existing cookie-reset boundaries and avoid changing test ordering.
- CI duration may be mostly browser install/cache and unavoidable for three-browser proof; do not weaken the useful cross-browser signal just to reduce wall time.

### Scope guard

Do not expand beyond `authenticated-lifecycle.spec.ts`, optional `public-visibility.spec.ts`, §14e docs/session updates, and a bounded CI-duration recommendation. Other backlog files stay queued.

### Dirstarter implementation template

- **Docs read first:** Not applicable; no Dirstarter-owned baseline layer touched.
- **Baseline pattern to extend:** `docs/runbooks/sop-test-writing.md §14` deterministic post-hydration locator policy.
- **Custom delta:** Ronin lineage E2E cleanup and CI signal review.
- **No-bypass proof:** This does not replace a Dirstarter capability; it tightens repo-local Playwright reliability.

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0268_TASK_01 | Cody (codex) | done | Drained `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts` from 9 `networkidle` calls to zero. Added route-specific anchors: login redirect helper, lineage editor h1, claim-form combobox, 404 h1, admin claims h1, dashboard h1, edit-profile form values, public tree h1, and role-based drawer open retry. Verified chromium 4/4 and firefox 4/4. |
| SESSION_0268_TASK_02 | Cody (codex) | done | Stretch completed. Drained `apps/web/e2e/lineage/public-visibility.spec.ts` from 3 `networkidle` calls to zero. Added listing heading/result anchors and the same role-based drawer open retry. Verified chromium 3/3 and firefox 3/3. |
| SESSION_0268_TASK_03 | Giddy/Doug sidecar + Cody | done | CI review found latest serial workflow run took 29m59s and main has no branch protection/rulesets. Patched `.github/workflows/playwright.yml` into a three-browser matrix (`chromium`, `firefox`, `webkit`) with single-worker Playwright preserved per job, per-browser browser-cache keys, 45m timeout, and per-browser artifacts. |

## What landed

- `authenticated-lifecycle.spec.ts` has zero `waitForLoadState("networkidle")` calls. The cleanup exposed two places where a visible heading was not deep enough: the claim form needs the combobox as the readiness anchor, and the edit page needs form-value readiness plus DB-state polling after save. Drawer opens now use a bounded role-based retry so firefox/chromium do not click before the client island is interactive.
- `public-visibility.spec.ts` has zero `networkidle` calls. Listing routes anchor on the `Lineage Trees` h1 plus result count, and detail routes anchor on the tree h1 plus the drawer dialog.
- `docs/runbooks/sop-test-writing.md §14e` now records both drained lineage files and corrects the remaining backlog audit to ~27 calls across 11 files. The audit also surfaced two admin files that were missing from the SESSION_0267 table (`bracket.spec.ts`, `scoring.spec.ts`).
- `.github/workflows/playwright.yml` now runs the same useful Playwright signal as parallel browser jobs instead of one serial 30-minute job. The CI still uses `workers: 1`; only job-level browser parallelism changed.
- `docs/knowledge/wiki/index.md` has the SESSION_0268 row.

## Files touched

| File | Change |
| --- | --- |
| `.github/workflows/playwright.yml` | Split the Playwright job into a `project: [chromium, firefox, webkit]` matrix; per-browser install/cache/artifacts; timeout 60m -> 45m. |
| `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts` | Replaced all 9 remaining `networkidle` waits with deterministic locators/state checks; added anonymous redirect isolation helper and drawer-open helper. |
| `apps/web/e2e/lineage/public-visibility.spec.ts` | Replaced all 3 `networkidle` waits with deterministic locators; added drawer-open helper. |
| `docs/runbooks/sop-test-writing.md` | Updated §14e backlog table and `last_agent`. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0268 row and bumped `last_agent`. |
| `docs/sprints/SESSION_0268.md` | Current session ledger and close record. |

## Decisions resolved

- **CI workflow:** The >30m runtime is not necessary as one serial job. Keeping chromium full-suite + firefox/webkit lineage coverage is necessary; running those projects as parallel single-worker jobs is the lower-risk optimization. We did not increase Playwright workers because the networkidle backlog remains a local parallelism pain point.
- **Branch protection:** Not configured this session. `main` is currently unprotected (`gh api .../branches/main/protection` returns 404) and repository rulesets are empty. With `paths-ignore` on the workflow and new matrix job names, required checks should be added only after the first matrix run proves the exact status contexts and a docs-only required-check strategy is chosen.
- **Backlog accounting:** The §14e table should reflect actual remaining offenders, not only the SESSION_0267 snapshot. The table now removes drained lineage files and adds missing bracket/scoring residuals found by exact-file audit.

## Open decisions / blockers

- **First matrix CI run pending after push.** Expected improvement is wall time, not total compute time: each browser job still provisions dependencies, database, dev server, and browser cache independently. If the first run is green, consider branch protection requiring the three `Playwright (chromium)`, `Playwright (firefox)`, and `Playwright (webkit)` checks or a separate always-present aggregate check.
- **§14e backlog remains open:** ~27 `networkidle` calls across 11 files. Next cleanup should pick the remaining lineage file (`editor-drag-reorder.spec.ts`) plus one admin cluster, or go straight to DSR triage as the largest remaining single file.

## Verification

| Check | Result |
| --- | --- |
| Exact target-file networkidle audit | Pass — zero `networkidle` lines in `authenticated-lifecycle.spec.ts` and `public-visibility.spec.ts`. |
| Exact backlog count audit | Remaining offenders: ~27 calls across 11 files. |
| `bunx playwright test --project=chromium --workers=1 e2e/lineage/authenticated-lifecycle.spec.ts` | Pass — 4/4. |
| `bunx playwright test --project=firefox --workers=1 e2e/lineage/authenticated-lifecycle.spec.ts` | Pass — 4/4. |
| `bunx playwright test --project=chromium --workers=1 e2e/lineage/public-visibility.spec.ts` | Pass — 3/3. |
| `bunx playwright test --project=firefox --workers=1 e2e/lineage/public-visibility.spec.ts` | Pass — 3/3. |
| `bunx @biomejs/biome check --write e2e/lineage/authenticated-lifecycle.spec.ts e2e/lineage/public-visibility.spec.ts` | Pass — checked 2 files; formatted 1 file. |
| `bun run typecheck` in `apps/web` | Pass — `next typegen` + `tsc --noEmit`. |
| Workflow YAML parse | Pass — Ruby YAML parser loaded `.github/workflows/playwright.yml`. |

## Review log

### SESSION_0268 — Networkidle cleanup + CI duration tightening

#### Review

**SESSION_0268_REVIEW_01 — §14e lineage drain and Playwright CI matrix split**

- **Reviewed tasks:** SESSION_0268_TASK_01, TASK_02, TASK_03.
- **Dirstarter docs check:** not applicable. No Dirstarter-owned auth/Prisma/payments/storage/content/theming/deployment primitive was changed. The touched surfaces are Ronin E2E tests, Ronin SOP docs, GitHub Actions, and session/wiki docs.
- **Verdict:** PASS. Primary goal met and stretch completed. Both target lineage files are drained to zero and verified in chromium + firefox. CI signal was tightened by parallelizing browser projects while keeping single-worker isolation, which preserves the reliability constraint identified in SESSION_0267.

#### Findings

- **SESSION_0268_FINDING_01 — First matrix Playwright run needs post-push review.** Severity: low. The YAML parses locally, but GitHub Actions matrix behavior and exact status contexts can only be proven after push. Required follow-up: inspect the triggered run and document wall time/check names before adding branch protection.

## Hostile close review

### SESSION_0268

1. **Plan sanity:** Good. Petey plan had three tasks, one sidecar, and a clear scope guard. Stretch work stayed within the pre-authorized lineage file.
2. **Dirstarter compliance:** Aligned. No baseline layer touched.
3. **Security/data integrity:** No production data path changed. Tests gained stronger auth-context isolation and state-based assertions.
4. **Verification honesty:** Strong for local test scope: exact zero-call audit, chromium/firefox runs for both changed specs, typecheck, Biome, YAML parse. CI matrix remains pending until push and is explicitly logged as a follow-up.
5. **Workflow honesty:** Graphify-first discovery was used for file/doc selection. A sidecar reviewed CI duration independently. Branch protection was not changed because current repo settings are unprotected and required-check naming should wait for the matrix run.
6. **Score:** 9.6/10. Cap avoided; no Dirstarter/data integrity failure. Residual risk is only post-push CI matrix validation.

## ADR / ubiquitous-language check

No ADR required. The session applies an existing SOP rule and adjusts CI job topology without changing product architecture.

No ubiquitous-language update required. Terms used are Playwright/GitHub Actions implementation terms, not domain language.

## Next session

- **Goal:** SESSION_0269 — continue §14e networkidle cleanup and review the first matrix Playwright CI run from SESSION_0268.
- **Inputs to read:** `docs/sprints/SESSION_0268.md`, `docs/runbooks/sop-test-writing.md §14e`, `.github/workflows/playwright.yml`, GitHub Actions run triggered by the SESSION_0268 push.
- **First task:** Check the SESSION_0268 push run: confirm `Playwright (chromium)`, `Playwright (firefox)`, and `Playwright (webkit)` pass, record wall time and status context names, then decide whether branch protection should require those contexts or wait for an aggregate check.
- **Cleanup task:** Drain the next §14e offender. Recommended target: `apps/web/e2e/lineage/editor-drag-reorder.spec.ts` (3 calls) plus `apps/web/e2e/lineage/public-rank-redaction.spec.ts` (2 calls), or `apps/web/e2e/admin/data-subject-request-triage.spec.ts` (5 calls) if prioritizing largest remaining single file.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0268.md` frontmatter set to `session--implement`, `status: closed`, `last_agent: codex-session-0268`; `sop-test-writing.md` and `wiki/index.md` `last_agent` bumped. |
| Backlinks/index sweep | `wiki/index.md` SESSION table includes SESSION_0268; `SESSION_0268.md` backlinks to wiki index and pairs with SESSION_0267. No new wiki page/ADR created. |
| Wiki lint | `bun run wiki:lint` ran; failed on existing archive/wiki index debt (`232 error(s), 563 warning(s)`). No SESSION_0268-specific breakage was introduced in the visible lint output. |
| Kaizen reflection | Captured in review and next-session notes; no separate reflections section needed for this implementation-only session. |
| Hostile close review | Present in `## Hostile close review`. |
| Review & Recommend | Present in `## Next session`. |
| Memory sweep | No operator memory update needed; durable rule/backlog changes are in `sop-test-writing.md §14e`. |
| Next session unblock check | Unblocked; first task is the post-push matrix CI run review. |
| Git hygiene | Final intended changes reviewed with `git status --short`, `git diff --stat`, and `git diff --check`; commit/push follows this ledger close. |
| Graphify update | Scheduled after commit/push per operator request so Graphify indexes latest git work. |

## Status

closed
