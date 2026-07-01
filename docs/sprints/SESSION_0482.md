---
title: "SESSION 0482 — Belt Journey Slice 5: mount the Belts tab + resolve the 3 seams + Playwright spec"
slug: session-0482
type: session--implement
status: closed
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0482
sprint: S49
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/sprints/SESSION_0481.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0482 — Belt Journey Slice 5: Belts tab + the 3 seams + proof

> **Autonomous epic, Slice 5 of [`petey-plan-0477`](../petey-plan-0477-belt-journey-crm-epic.md)** — driven by
> `claude-session-0482` (Petey→Cody); Codex paused on out-of-credits. Stacked on Slice 4 (`auto/session-0481`).
> Slices 1–4 = PRs #177/#178/#179/#180. **This completes the member Belt Journey feature** (backend + UI +
> integration); Slice 6 (BBL CRM board) remains.

## Goal

Mount the "Belts" tab on `/app/profile`, resolve the 3 seams Slice 4 delegated (milestone media upload,
media-URL join, country persistence), write the Playwright behavior spec, and prove zero regression to the
awarded-truth rank display.

## Status

Closed. Slice 5 complete + gates green (incl. `next build`); committed to `auto/session-0482` for PR (stacked
on `auto/session-0481`).

## What landed

- **Belts tab** on `app/app/profile/page.tsx` (via `DashboardTabs`). `DashboardBeltsTab` (server, session-guarded,
  empty-state) → `loadBeltTabData` runs **4 queries, no N+1** (passport; then parallel: BJJ ladder, member BJJ
  awards **with milestone media joined to `Media.url`/`type`**, join-wizard combobox options). Ceiling =
  `ceilingSortOrder` (BJJ, wraps `pickTopAwardInDiscipline`). View-models → client `BeltJourneyTab` → `BeltJourneyGrid`.
- **Seam 1 — milestone media upload:** new `rankMilestone` kind on `MediaAttachTarget` (+ schemas + resolver;
  ownership walks `RankMilestone → RankAward → Passport.userId`). `onUpload` calls `uploadWebMedia`; the
  idempotent `attachMilestoneMedia` confirms the purpose. **Milestone media is `isPublic: true`** (belt-journey
  photos show on the public passport — avatar-promotion precedent; flag if private is wanted).
- **Seam 2 — media-URL join:** resolved in the loader; orphan (SetNull) attachments dropped.
- **Seam 3 — country:** rides on the school entry (`school.country`, ISO-2) → freetext-school → `emitSchoolLead`
  sets the placeholder `Organization.country` **on create only** (never overwrites a matched/registered org).
  Did NOT bloat `updateRankAwardFact` with a top-level country field.
- **Playwright spec** `e2e/belt-journey.spec.ts` (+ fixtures) — enrich ≤ ceiling · locked above · verified
  read-only · no delete-top affordance. **`describe.skip` / operator-side smoke** (needs a dev server + writes a
  member fixture): run with `RUN_BELT_E2E=1 bunx playwright test e2e/belt-journey.spec.ts`. The delete-top
  invariant itself is proven server-side (`router.integration.test.ts` + `belt-gate.test.ts`) in the unit gate.

## Files touched

| File | Change |
| --- | --- |
| `app/app/profile/page.tsx` | Inserted the "Belts" tab |
| `app/(web)/dashboard/belts-tab.tsx` · `components/web/belt/belt-journey-tab.tsx` · `server/web/belt/belt-tab-loader.ts` | **NEW** — server tab + client bridge + one-pass loader |
| `server/web/media/{media-targets,media-schemas,media-authorization,actions}.ts` | Added the `rankMilestone` media target kind + resolver |
| `server/web/school-lead/emit-school-lead.ts` | Optional `country` arg → placeholder `Organization.country` |
| `server/belt/{schemas,router}.ts` | `school.country` on the fact input, threaded into `emitSchoolLead` |
| `components/web/belt/{belt-media-gallery,belt-edit-form,belt-journey-grid,index}.ts(x)` | `onUpload` gained `rankMilestoneId`; barrel exports `BeltJourneyTab` |
| `e2e/belt-journey.spec.ts` + `e2e/helpers/seed-belt-journey*.ts` | **NEW** — behavior spec + fixtures (operator-side smoke) |

## Verification

| Gate | Result |
| --- | --- |
| `tsc --noEmit` | ✅ 0 errors |
| `oxlint` / `oxfmt --check` (touched) | ✅ clean |
| `bun run test` (belt view-model · belt-gate · emit-school-lead · apply-media · canvas-model · belt router integration) | ✅ 72 pass / 0 fail |
| `bun run build` (app-code gate — incl. the client→server-action upload path) | ✅ PASS |
| Zero-regression (ADR 0035, `canvas-model.test.ts` 13/13) | ✅ PASS — self-report ≤ ceiling can never become the displayed top rank |

## Open decisions / blockers

- **Codex out of credits** (external). Resume the remaining slice: `AUTO_BASE_BRANCH=auto/session-0482 scripts/auto-session-codex.sh 1`.
- **Flags for review:** milestone media defaults `isPublic: true` (public passport) — confirm or make private;
  `onUpload` signature widened `(file, rankMilestoneId)`; belt-journey e2e runs only under `RUN_BELT_E2E=1`.
- **Adjacent debt (from Slice 3):** `setPassportRank` remains an ungated self-report seam — converge onto the
  gated belt oRPC in a follow-up.

## Next session

### Goal

**Slice 6** of `petey-plan-0477` — the **BBL Lead Pipeline board** (`apps/web/lib/leads-pipeline/*` + a
`/app/leads-pipeline` route mounting the `AdminKanban` kernel over BBL's `Lead`/`Organization` data, Mammoth
pattern), where the Slice-1 `SCHOOL_OUTREACH` leads become a workable outreach queue. Branch `auto/session-0483`
off this one. **Last autonomous slice** — after it, hand back (Slice 7 agent-automation is HELD).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0482_TASK_01 | ✅ done | Belts tab + one-pass loader + 3 seams (media target/URL-join/country) + Playwright spec + zero-regression proof |
