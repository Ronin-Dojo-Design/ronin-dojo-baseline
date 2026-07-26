---
title: "SESSION 0270 — §14e networkidle cleanup: admin cluster finish"
slug: session-0270
type: session--implement
status: closed
created: 2026-05-27
updated: 2026-05-27
last_agent: copilot-session-0270
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0269.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0270 — §14e networkidle cleanup: admin cluster finish

## Date

2026-05-27

## Operator

Brian + copilot-session-0270 (Petey orchestrating; Cody implementation)

## Goal

1. Drain `membership-detail.spec.ts` (4 calls), `membership-list.spec.ts` (2 calls), `tournament-list.spec.ts` (2 calls) to zero `networkidle`.
2. Correct stale §14e backlog table — remove `bracket.spec.ts` and `scoring.spec.ts` (already cleaned in SESSION_0266/0267 but never removed from table).
3. Stretch: start tournament cluster if admin cluster goes smooth.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None. Ronin Playwright specs, SOP docs, session/wiki docs only. |
| Extension or replacement | Extension only. Applies existing §14 deterministic-locator policy. |
| Why justified | Admin cluster has 8 networkidle calls across 3 files causing flakes under full-suite load. |
| Risk if bypassed | Remaining networkidle calls cause local full-suite flakes and false negatives. |

## Graphify check

- **Graph status:** available (updated end of SESSION_0269).
- **Files selected:** `apps/web/e2e/admin/membership-detail.spec.ts`, `apps/web/e2e/admin/membership-list.spec.ts`, `apps/web/e2e/admin/tournament-list.spec.ts`, `docs/runbooks/sop-test-writing.md`.

## Petey plan

### Goal

Drain remaining admin cluster (3 files, 8 calls) to zero. Correct stale backlog table.

### Tasks

#### SESSION_0270_TASK_01 — Drain `membership-detail.spec.ts` (4 calls)

- **Agent:** Cody
- **What:** Replace 4 `networkidle` waits. Page heading is `Membership — {Name}` (h1). Anchor all 4 on `page.getByRole("heading", { name: /Membership\s—/i, level: 1 })` with 30s timeout.
- **Done means:** Zero `networkidle` in file, chromium passes.

#### SESSION_0270_TASK_02 — Drain `membership-list.spec.ts` (2 calls)

- **Agent:** Cody
- **What:** Admin test: anchor on `page.locator("table").first()` visibility (already asserted next line). Non-admin test: replace with `domcontentloaded` (deterministic, fires on HTML parse).
- **Done means:** Zero `networkidle` in file, chromium passes.

#### SESSION_0270_TASK_03 — Drain `tournament-list.spec.ts` (2 calls)

- **Agent:** Cody
- **What:** Admin test: anchor on body content visibility. Non-admin test: replace with `domcontentloaded`.
- **Done means:** Zero `networkidle` in file, chromium passes.

#### SESSION_0270_TASK_04 — Correct §14e backlog table + update totals

- **Agent:** Cody
- **What:** Remove `bracket.spec.ts` (0 calls, cleaned SESSION_0266/0267) and `scoring.spec.ts` (0 calls, cleaned SESSION_0267) from backlog table. Update totals. After admin drain: 3 files / 6 calls remain (tournament cluster).
- **Done means:** Backlog table matches reality.

#### SESSION_0270_TASK_05 — Create SESSION_0270.md, update wiki/index

- **Agent:** Cody
- **What:** Session documentation.
- **Done means:** SESSION file complete, wiki index has SESSION_0270 row.

### Scope guard

Path A: 3 admin files (8 calls). No tournament cluster, no branch protection changes.

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0270_TASK_01 | Cody (copilot) | done | Drained `membership-detail.spec.ts` from 4 `networkidle` calls to zero. Anchored on `h3` heading matching `/Membership\s—/i` with 30s timeout. Chromium 4/4. |
| SESSION_0270_TASK_02 | Cody (copilot) | done | Drained `membership-list.spec.ts` from 2 calls to zero. Admin test: table anchor. Non-admin test: `domcontentloaded`. Chromium 2/2. |
| SESSION_0270_TASK_03 | Cody (copilot) | done | Drained `tournament-list.spec.ts` from 2 calls to zero. Admin test: body anchor. Non-admin test: `domcontentloaded`. Chromium 2/2. |
| SESSION_0270_TASK_04 | Cody (copilot) | done | Corrected §14e backlog table: removed stale bracket (0) + scoring (0) entries. Updated totals to 6 calls / 3 files (tournament cluster only). |
| SESSION_0270_TASK_05 | Cody (copilot) | done | SESSION_0270.md created, wiki/index.md updated with row + `last_agent`. |

## What landed

- **`e2e/admin/` directory is fully networkidle-free.** `membership-detail.spec.ts` (4→0), `membership-list.spec.ts` (2→0), `tournament-list.spec.ts` (2→0) join previously cleaned `bracket.spec.ts`, `scoring.spec.ts`, and `data-subject-request-triage.spec.ts`.
- **§14e backlog corrected.** Stale entries for `bracket.spec.ts` (2 listed, actually 0) and `scoring.spec.ts` (1 listed, actually 0) removed. True backlog: 6 calls / 3 files (tournament cluster only).
- **§14e campaign progress:** Started at ~27 calls / 11 files (SESSION_0268). Now at 6 calls / 3 files. Admin and lineage clusters fully clean.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/e2e/admin/membership-detail.spec.ts` | Removed 4 `networkidle` waits; deterministic H3 heading anchor. |
| `apps/web/e2e/admin/membership-list.spec.ts` | Removed 2 `networkidle` waits; table anchor + domcontentloaded. |
| `apps/web/e2e/admin/tournament-list.spec.ts` | Removed 2 `networkidle` waits; body anchor + domcontentloaded. |
| `docs/runbooks/sop-test-writing.md` | Corrected §14e backlog table, removed stale entries, updated totals. `last_agent` bumped. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0270 row, `last_agent` bumped. |
| `docs/sprints/SESSION_0270.md` | Current session ledger. |

## Decisions resolved

- **§14e backlog was overcounted.** `bracket.spec.ts` and `scoring.spec.ts` were cleaned in SESSION_0266/0267 but never removed from the backlog table. Corrected: true remaining is 6 calls / 3 files, not 17/8.
- **Admin cluster complete.** All `e2e/admin/` specs are networkidle-free.
- **Branch protection deferred** to end of S15 BBL path per operator decision.

## Open decisions / blockers

- **§14e backlog remains open:** 6 calls across 3 files. Tournament cluster: `list.spec.ts` (1), `register.spec.ts` (2), `results.spec.ts` (3).
- No blockers.

## Verification

| Check | Result |
| --- | --- |
| Zero-call audit: membership-detail | Pass — 0 `networkidle` calls. |
| Zero-call audit: membership-list | Pass — 0 `networkidle` calls. |
| Zero-call audit: tournament-list | Pass — 0 `networkidle` calls. |
| Biome: 3 admin files | Pass — checked 3, fixed 1. |
| chromium membership-detail | Pass — 4/4. |
| chromium membership-list | Pass — 2/2. |
| chromium tournament-list | Pass — 2/2. |
| `bun run typecheck` | Pass — `next typegen` + `tsc --noEmit`. |
| Wiki lint | Pre-existing: 232 error(s), 596 warning(s). No SESSION_0270-specific breakage. |

## Review log

### SESSION_0270 — §14e admin cluster finish

#### Review

**SESSION_0270_REVIEW_01 — admin cluster networkidle drain + backlog correction**

- **Reviewed tasks:** SESSION_0270_TASK_01 through TASK_05.
- **Dirstarter docs check:** Not applicable. No Dirstarter-owned baseline layer touched.
- **Verdict:** PASS. All three target files drained to zero. Backlog table corrected. Admin directory fully clean.

#### Findings

- **SESSION_0270_FINDING_01 — Membership detail heading is H3, not H1.** The Dirstarter `H3` component renders `<h3>`. Initial anchor used `level: 1` and failed; corrected to `level: 3`. Documented for future reference: admin detail pages use `H3` for the page title heading.

## Hostile close review

### SESSION_0270

1. **Plan sanity:** Good. Petey plan had 5 tasks. All completed. Scope guard held — no tournament cluster work.
2. **Dirstarter compliance:** Aligned. No baseline layer touched.
3. **Security/data integrity:** No production data path changed. Tests use stronger deterministic assertions.
4. **Verification honesty:** All three files audited at zero. Chromium tests pass for all. Typecheck, Biome, wiki-lint all ran with results recorded.
5. **Workflow honesty:** Files opened by known path. Graphify used at bow-in context.
6. **Score:** 9/10. Clean execution, backlog correction was a good catch. H3 vs H1 mistake cost one retry cycle.

## ADR / ubiquitous-language check

No ADR required. Session applies existing SOP §14 pattern.

No ubiquitous-language update required.

## Next session

- **Goal:** SESSION_0271 — §14e networkidle cleanup: tournament cluster (final).
- **Inputs to read:** `docs/sprints/SESSION_0270.md`, `docs/runbooks/sop-test-writing.md §14e`.
- **First task:** Drain `e2e/tournaments/results.spec.ts` (3 calls) — largest remaining file.
- **Stretch targets:** `e2e/tournaments/register.spec.ts` (2), `e2e/tournaments/list.spec.ts` (1). If all 3 drain cleanly, §14e campaign is complete (0 calls / 0 files).

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0270.md` frontmatter set to `session--implement`, `status: closed`, `last_agent: copilot-session-0270`; `sop-test-writing.md` and `wiki/index.md` `last_agent` bumped. |
| Backlinks/index sweep | `wiki/index.md` SESSION table includes SESSION_0270; `SESSION_0270.md` backlinks to wiki index and pairs with SESSION_0269. |
| Wiki lint | `bun run wiki:lint` ran; 232 error(s), 596 warning(s) — pre-existing debt, no SESSION_0270-specific breakage. |
| Hostile close review | Present in `## Hostile close review`. |
| Review & Recommend | Present in `## Next session`. |
| Git hygiene | Pending — commit/push follows this ledger close. |
| Graphify update | Scheduled after commit/push. |

## Status

closed
