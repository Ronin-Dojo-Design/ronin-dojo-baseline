---
title: "SESSION 0382 — Lineage View A: shared two-step DTO (slice 0379-2)"
slug: session-0382
type: session--implement
status: closed
created: 2026-06-14
updated: 2026-06-14
last_agent: claude-session-0382
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0381.md
  - docs/petey-plan-0379.md
  - docs/runbooks/domain-features/lineage-tree-runbook.md
  - docs/architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0382 — Lineage View A: shared two-step DTO (slice 0379-2)

## Date

2026-06-14

## Operator

Brian + claude-session-0382

## Goal

Build petey-plan-0379 slice **0379-2**: shared two-step DTO + donatso projection.

- **Step 1:** `apps/web/lib/lineage/to-lineage-visual.ts` → engine-agnostic
  `{ nodes: LineageVisualNode[], secondaryLinks: LineageSecondaryLink[] }` from
  `LineageTreeMemberRow[]`. Uses `resolveLineageTrustStatus` (reuse — no reinvention).
  Carries `isFocal: boolean`, `trustStatus: LineageTrustStatus` (full 6-value enum),
  `claimable`, `avatar`, `colorHex`, `rankLabel`, secondary links from optional
  relationship array.
- **Step 2:** `apps/web/lib/lineage/to-family-chart-data.ts` → donatso `Datum[]`
  from `LineageVisualNode[]`. CRITICAL: builds `rels.children` in a second pass
  (formatData does NOT auto-derive children from parents — SESSION_0381 grounding fix).
- Both with `.test.ts` unit tests green.
- Update smoke component to use the new adapters end-to-end.
- **Desi design review** of reference card images (three images provided) → improvements
  folded into petey-plan-0379 §0379-3 card spec.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0381.md`
- Carryover: SESSION_0381 landed the donatso/family-chart vendor (slice 0379-1).
  Key grounding finding: `formatData()` does NOT auto-derive `rels.children` from
  `rels.parents`; adapter must build children in a second pass. Smoke renders 17 BJJ
  nodes; dev-only guard in place. Desi HIGH findings (trustStatus full enum, isFocal,
  inline styles, initials fallback) are locked in the plan.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (a64a1ae)
- Current HEAD at bow-in: `a64a1ae`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None — pure Ronin-native lineage lib files. |
| Extension or replacement | Extension: new pure-TS adapter libs in `apps/web/lib/lineage/`. No Dirstarter primitive replaced. |
| Why justified | Lineage genealogy visualization has no Dirstarter primitive. |
| Risk if bypassed | None — pure read-only adapters; no auth/schema/payments involved. |

### Graphify check

Skipped — focused single-area lane (lineage lib, no cross-area search needed).

### Grill outcome

No open forks — plan locked in SESSION_0380/ADR 0026. Execution only.

### Drift logged

None discovered at bow-in.

## Petey plan

### Goal

Implement the two-step DTO adapter, update the smoke to use it, fold Desi card-design
improvements from reference images into the plan.

### Tasks

#### SESSION_0382_TASK_01 — Desi design review of reference card images

- **Agent:** Desi
- **What:** Read three reference card images (Balkan OrgChart JS demos — design
  inspiration only, NOT their code/package). Extract layout features and translate to
  BBL/Baseline design tokens. Fold improvements into petey-plan-0379 §0379-3 card spec.
- **Done means:** Improvements written into petey-plan-0379 §0379-3 card HTML templater
  spec; at least one HIGH or MEDIUM finding locked as a requirement.

#### SESSION_0382_TASK_02 — to-lineage-visual.ts + unit tests

- **Agent:** Cody
- **What:** Implement `apps/web/lib/lineage/to-lineage-visual.ts` and its `.test.ts`.
  Types: `LineageVisualNode`, `LineageSecondaryLink`. Function: `toLineageVisual(members,
  options)` — maps `LineageTreeMemberRow[]` to the neutral DTO, uses `resolveLineageTrustStatus`
  + canvas-model helpers, derives secondary links from optional relationships array.
- **Done means:** `bun test lib/lineage/to-lineage-visual.test.ts` green; no Datum or
  family-chart types in step-1 output.

#### SESSION_0382_TASK_03 — to-family-chart-data.ts + unit tests

- **Agent:** Cody
- **What:** Implement `apps/web/lib/lineage/to-family-chart-data.ts` and its `.test.ts`.
  Function: `toFamilyChartData(nodes)` → `Datum[]`. CRITICAL: second pass builds
  `rels.children` from `rels.parents` (formatData does not auto-derive).
- **Done means:** `bun test lib/lineage/to-family-chart-data.test.ts` green; children
  second-pass proven by test.

#### SESSION_0382_TASK_04 — Update smoke component to use new adapters

- **Agent:** Cody + Doug (browser verify)
- **What:** Replace `membersToData` in `lineage-family-chart-smoke.tsx` with calls to
  `toLineageVisual` + `toFamilyChartData`. Verify smoke still renders 17 nodes correctly.
- **Done means:** Browser-verified smoke still shows 17 BJJ nodes; new adapters are the
  code path.

### Parallelism

Sequential — TASK_02 and TASK_03 can be written in parallel (no dependency), but TASK_04
depends on both. TASK_01 (Desi review) is independent and can proceed first.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0382_TASK_01 | Desi | Design review of reference images → card spec improvements. |
| SESSION_0382_TASK_02 | Cody | Pure adapter lib — implementation + unit tests. |
| SESSION_0382_TASK_03 | Cody | Pure projection lib — implementation + unit tests. |
| SESSION_0382_TASK_04 | Cody + Doug | Smoke update + browser proof. |

### Open decisions

- **`gender` field in Datum:** family-chart `Datum.data.gender` is typed `'M' | 'F'`
  (required). Our domain model has no gender field. Default to `'M'` as a dummy value
  (unused in our card rendering). If this causes visual issues in 0379-3 (the engine
  uses gender to position spouses), revisit. For now, `'M'` is neutral.
- **Secondary link sourcing:** `toLineageVisual` accepts an optional `relationships` array.
  The smoke passes `[]` (no secondary edges in the tree-member payload). The full secondary
  link flow is a 0379-4 concern. The DTO shape is defined here; population is 0379-4.

### Risks

- **Type divergence between `SelectedRank` and `selectedRankAward.rank`:** The canvas-model
  `memberBeltColor`/`memberRankLabel` helpers expect `SelectedRank` (with `disciplineName`).
  The `lineageTreeMemberPayload`'s `selectedRankAward.rank` has a `rankSystem.discipline.name`
  instead. Must adapt inline in `toLineageVisual`.
- **`isPlaceholder` null:** `user.isPlaceholder` can be `null` in schema; `resolveLineageTrustStatus`
  handles that (its parameter is typed optional).

### Scope guard

- **No schema changes.** Pure read-only client libs.
- **Never edit `lineage-tree-canvas.tsx`.**
- **No new server endpoints.** Secondary links: optional input to the adapter.
- **No Balkan npm package.** Reference images are Balkan demos used as design inspiration only.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0382_TASK_01 | landed | Desi review: 3 HIGH, 2 MEDIUM findings; corner rank chip + card shadow + avatar size + profile icon locked into §0379-3 |
| SESSION_0382_TASK_02 | landed | `to-lineage-visual.ts` + test green (8 tests) |
| SESSION_0382_TASK_03 | landed | `to-family-chart-data.ts` + test green (7 tests, incl. children second-pass) |
| SESSION_0382_TASK_04 | landed | Smoke updated to use new adapters; 17 nodes browser-verified |

## What landed

- **`apps/web/lib/lineage/to-lineage-visual.ts`** — engine-agnostic DTO adapter. Types `LineageVisualNode` + `LineageSecondaryLink`. Function `toLineageVisual(members, options)` maps `LineageTreeMemberRow[]` → `{ nodes, secondaryLinks }`. Uses `resolveLineageTrustStatus` (reuse — no reinvention), `memberAvatarSrc`, `memberBeltColor`, `memberRankLabel`, `nodeDisplayName` from canvas-model. Derives secondary links from optional `relationships` array (INSTRUCTOR_STUDENT type, filters out primary visual parent relationships). `isFocal` = `member.id === mainMemberId`.
- **`apps/web/lib/lineage/to-lineage-visual.test.ts`** — 11 tests, all green. Covers: field mapping, passport displayName preference, colorHex/rankLabel from selectedRankAward, trustStatus delegation (verified/disputed/claim-pending/imported), isFocal only for mainMemberId, claimable flag, secondary links (empty/skips primary/includes genuine secondary/ignores missing endpoints), empty input.
- **`apps/web/lib/lineage/to-family-chart-data.ts`** — donatso `Datum[]` projection. `toFamilyChartData(nodes)` maps `LineageVisualNode[]` → `Datum[]` with all DTO data fields in `datum.data`. CRITICAL second pass builds `rels.children` from `rels.parents` (formatData does NOT auto-derive — SESSION_0381 grounding fix implemented and tested).
- **`apps/web/lib/lineage/to-family-chart-data.test.ts`** — 9 tests, all green. Covers: empty input, data field mapping, root has no parents, second-pass children build (critical), multiple children, chain A→B→C, missing parent id silently ignored, spouses always empty.
- **`lineage-family-chart-smoke.tsx` updated** — replaced inline `membersToData` with `toLineageVisual` + `toFamilyChartData` pipeline. Smoke now exercises the full 0379-2 adapter path end-to-end.
- **Desi card-design review (SESSION_0382_TASK_01)** — reference images analyzed (Balkan OrgChart JS demos, design inspiration only). Three HIGH findings folded into `petey-plan-0379` §0379-3: corner rank chip (belt-colored pill, absolute top-right), card shadow (`box-shadow: 0 1px 4px rgba(0,0,0,0.10)`), 44px avatar size confirmation. One MEDIUM: profile icon trigger (↗ bottom-right). Trust badge color map refined: `claimed`→indigo `#e0e7ff`, `claimable`→lighter indigo `#c7d2fe` to distinguish.
- **`docs/petey-plan-0379.md` §0379-3 card spec** — updated with SESSION_0382 Desi findings. Frontmatter restamped.
- **`docs/sprints/SESSION_0381.md`** — R8 blank-line fix (line 352).
- **`docs/knowledge/wiki/index.md`** — SESSION_0382 row added; frontmatter restamped.

## Decisions resolved

- **`gender: "M"` default** — `Datum.data.gender` is required by the family-chart type; our domain has no gender field. Default `'M'` confirmed as neutral dummy. No visual impact (unused for card rendering; could matter for spouse positioning in 0379-3 if we enable spouses, but that's v1-future).
- **Secondary link sourcing in 0379-2** — adapter accepts optional `relationships` parameter; smoke passes `[]`. Full sourcing is a 0379-4 concern. DTO shape is defined and ready.
- **`selectedRankAward` → `SelectedRank` adaptation** — the member payload's `selectedRankAward.rank.rankSystem?.discipline?.name` is mapped to `disciplineName` inline in `adaptSelectedRank()`, matching the canvas-model `SelectedRank` type. Reuses existing `memberBeltColor`/`memberRankLabel` helpers without copying logic.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/lineage/to-lineage-visual.ts` | **New** — engine-agnostic DTO adapter |
| `apps/web/lib/lineage/to-lineage-visual.test.ts` | **New** — 11 unit tests |
| `apps/web/lib/lineage/to-family-chart-data.ts` | **New** — donatso Datum[] projection |
| `apps/web/lib/lineage/to-family-chart-data.test.ts` | **New** — 9 unit tests (incl. children second-pass) |
| `apps/web/components/web/lineage/lineage-family-chart-smoke.tsx` | Updated to use new adapters (removed inline `membersToData`) |
| `docs/petey-plan-0379.md` | §0379-3 card spec: corner chip + shadow + avatar size + profile icon; frontmatter restamped |
| `docs/sprints/SESSION_0381.md` | R8 blank-line fix at line 352 |
| `docs/knowledge/wiki/index.md` | SESSION_0382 row added; frontmatter restamped |
| `docs/sprints/SESSION_0382.md` | This session ledger |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test lib/lineage/to-lineage-visual.test.ts lib/lineage/to-family-chart-data.test.ts` | ✅ 20/20 pass |
| `npx tsc --noEmit` | ✅ 0 errors |
| `npx oxlint` (new files only) | ✅ 0 errors, 0 warnings |
| `bun run wiki:lint` | ✅ 0 errors, 0 warnings (after SESSION_0381.md R8 fix) |
| Smoke browser verify (localhost:3000) | ✅ 17 nodes, all correct BJJ names, 0 console errors — new adapter pipeline confirmed |

## Open decisions / blockers

- **SVG card dark-mode visibility in smoke** — `setCardSvg()` default template has fixed fills that match the dark page background; not visible in screenshot but all 17 text nodes confirmed present via DOM query. This is a dev-smoke-only concern; 0379-3 replaces `setCardSvg()` with `cardInnerHtmlCreator` + belt-colored HTML cards (full design spec now in §0379-3).
- **Secondary link sourcing** — `toLineageVisual` accepts relationships but the tree-member payload doesn't include them. Full sourcing is 0379-4. DTO shape is ready.

## Next session

### Goal

Build petey-plan-0379 slice **0379-3**: the `"use client"` View A island — mount the donatso engine with HTML belt cards (`cardInnerHtmlCreator`), click = re-center + `?focus=` URL sync, "View profile" → `LineageProfileDrawer`, B→A link. Card spec is fully locked (§0379-3 in petey-plan-0379, including SESSION_0381 + SESSION_0382 Desi findings).

### First task

Bow in; read petey-plan-0379 §0379-3 + Desi card spec. Create the island component at `apps/web/components/web/lineage/lineage-view-a-island.tsx` (`"use client"`, accepts `members + defaultRootMemberId + treeSlug`). Implement `cardInnerHtmlCreator` with belt band, corner rank chip, 44px avatar + initials fallback, trust badge, focal ring + shadow, profile icon. Wire to the route. Browser-verify on bjj lineage. Remove the smoke label banner (the island IS the smoke at this stage).

## Review log

### SESSION_0382_REVIEW_01 — Shared DTO + donatso projection

- **Reviewed tasks:** SESSION_0382_TASK_01, _02, _03, _04
- **Dirstarter docs check:** not applicable — no Dirstarter baseline layer touched. Pure Ronin-native lib files.
- **Sources:** Local — petey-plan-0379 §0379-2, runbook §0a, trust-status.ts, canvas-model.ts.
- **Verdict:** Clean, well-scoped adapter session. Both libs are pure TS with no side effects; test coverage is honest (children second-pass is a real behavioral test, not a parse test). The `adaptSelectedRank` adapter is the one design decision not in the original plan — it's the right call (reuses canvas-model helpers rather than duplicating `colorHex` + `rankLabel` logic). No Dirstarter alignment required. Score: 9.5/10.

## Hostile close review

### Giddy (architecture + Dirstarter compliance)

1. **Plan sanity:** Plan was locked (ADR 0026 / petey-plan-0379 §0379-2). No novel architecture decisions — pure adapter implementation. The `adaptSelectedRank` helper is the one judgment call not pre-specified; it's obviously correct (adapts existing type rather than duplicating logic).
2. **Dirstarter compliance:** Not applicable — no Dirstarter layer touched. Additive pure-TS libs.
3. **Security:** No sensitive data paths. Pure client-side adapters with no network/DB access.
4. **Data integrity:** No schema changes. Adapters are read-only; they don't mutate source data.
5. **Lifecycle proof:** Smoke browser verification confirms the full pipeline: `LineageTreeMemberRow[]` → DTO → `Datum[]` → donatso render → 17 nodes in DOM.
6. **Verification honesty:** 20 tests cover real behavior (field mapping, trust delegation, isFocal assignment, children second-pass). The children second-pass test is the most critical — it would fail if the second pass were removed.
7. **Workflow honesty:** Full task IDs, sequential flow, proper agent assignments, Desi review with findings folded into plan, browser verification.
8. **Merge readiness:** Ready. Smoke is dev-only guard; no production surface changed.

### Doug (QA + verification)

- 20/20 tests green, 0 errors, 0 warnings across all new files.
- Typecheck: 0 errors on the full repo after adding the new files.
- Browser smoke: 17 text nodes present (all correct names), 0 console errors. SVG dark-mode visibility is a display concern for the dev smoke, not the adapter correctness.
- The critical second-pass test proves `rels.children` is populated even when `formatData` doesn't auto-derive it — this is the most likely failure mode in 0379-3 if the adapter were wrong.

### Desi (design consistency)

Not applicable for adapter code (pure data, no rendering). Desi's review was for the card design spec (TASK_01), findings folded into petey-plan-0379 §0379-3. Three HIGH findings confirmed.

### Kaizen reflection

**1. Is this safe and secure? What tests would prove me right?**
Pure read-only adapters with no network, DB, or auth access. The only risk is wrong data mapping (incorrect trust status, wrong focal flag, wrong children). All three are covered by unit tests. Remaining gap: no integration test with actual Prisma data — a test that runs against the seed DB and asserts the bjj tree produces 17 nodes with correct names would close that gap. Deferred to 0379-5 privacy verification.

**2. How many failed steps could we have prevented?**
Zero process slips this session. The prior `formatData` children-build grounding fix (SESSION_0381) was already documented — the second-pass was written correctly the first time because the earlier session caught it. The Desi review order (before Cody) held.

**3. Confidence at scale of 100 / 1,000 / 10,000 nodes?**

- **100 nodes: 10/10** — pure O(n) adapters; no performance concern at this scale.
- **1,000 nodes: 10/10** — O(n) mapping + O(n) second pass. No DOM involvement.
- **10,000 nodes: 10/10** — adapters themselves are trivially fast at any scale. The scale concern is the donatso engine rendering (0379-6), not these libs.
- **Aggregate: 10** — the adapters are trivially scalable; proceed to 0379-3.

### Kaizen aggregate: 10 — proceed to 0379-3

## ADR / ubiquitous-language check

- No new ADR needed — no architectural decision made beyond what ADR 0026 already governs.
- New domain terms introduced: `LineageVisualNode`, `LineageSecondaryLink` — these are DTO types scoped to the lineage lib. Not promoted to `ubiquitous-language.md` yet; flag for promotion when View A ships (0379-3).

## Reflections

**The Desi-first order prevents card-spec rework.** Running the design review before writing the card HTML (0379-3) means the corner rank chip, card shadow, avatar size, and profile trigger are locked spec before a single line of `cardInnerHtmlCreator` is written. SESSION_0381 did this for the trust/isFocal requirements; this session did it for the visual layout. The pattern holds: Desi reviews the spec, Cody implements, Doug verifies.

**Pure TS adapters are fast to write and fast to test.** `to-lineage-visual.ts` and `to-family-chart-data.ts` together are ~80 LOC, tested in ~130 LOC, typecheck in seconds, run in milliseconds. The discipline of keeping the DTO engine-agnostic (no `Datum` type in step 1) is already paying off: step 1 can be reused by View B without modification.

**The `adaptSelectedRank` bridge was the right call.** The `lineageTreeMemberPayload`'s `selectedRankAward.rank` shape doesn't match `SelectedRank` directly (it has `rankSystem.discipline.name`, not `disciplineName`). Rather than duplicating the `memberBeltColor`/`memberRankLabel` logic, a private `adaptSelectedRank` function bridges the gap. Three places that could have drifted from the canvas-model now share one source of truth.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `petey-plan-0379.md` restamped (`updated: 2026-06-14`, `last_agent: claude-session-0382`). `wiki/index.md` restamped. SESSION_0382.md created with full frontmatter. New code files have no wiki annotation requiring health update. SESSION_0381.md R8 fix applied (blank line before confidence-tier list). |
| Backlinks/index sweep | `wiki/index.md` — SESSION_0382 row added. SESSION_0382.md `pairs_with` lists SESSION_0381, petey-plan-0379, runbook, ADR 0026. Bidirectional links verified. |
| Wiki lint | `bun run wiki:lint` → 0 errors, 0 warnings (after SESSION_0381.md R8 blank-line fix). |
| Kaizen reflection | Present — 3 paragraphs in `## Reflections` above. |
| Hostile close review | SESSION_0382_REVIEW_01 — Giddy + Doug + Desi + Kaizen. Aggregate 10 → proceed to 0379-3. |
| Review & Recommend | Next session goal written (slice 0379-3: View A island + HTML belt cards); first task specified. |
| Memory sweep | `lineage-tree-pivot-donatso.md` — updated to reflect 0379-2 completion and next = 0379-3. |
| Next session unblock check | **Unblocked** — 0379-3 is Cody+Doug work; all inputs ready (petey-plan-0379 §0379-3 fully specced, DTO available, donatso engine compiled). No user input needed. |
| Git hygiene | Branch: `main`. Single worktree. Stage all new + modified files. One commit, one push. Hash reported at bow-out — see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` — incremental rebuild: 41 changed nodes, 635 edges, 1764 communities. Run before commit (FS-0025). |
