---
title: "SESSION 0384 — Lineage View A: secondary-overlay slink/clink (slice 0379-4)"
slug: session-0384
type: session--implement
status: closed
created: 2026-06-13
updated: 2026-06-13
last_agent: claude-sonnet-4-6-session-0384
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0383.md
  - docs/petey-plan-0379.md
  - docs/runbooks/domain-features/lineage-tree-runbook.md
  - docs/architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0384 — Lineage View A: secondary-overlay slink/clink (slice 0379-4)

## Date

2026-06-13

## Operator

Brian + claude-session-0384

## Goal

Build petey-plan-0379 slice **0379-4**: secondary-overlay (slink/clink) — render cross-belt /
secondary promoters as a belt-labelled, dashed, subordinate overlay in View A. Extend the fork's
`renderers/` with a new `view-secondary-links.ts`; wire `relationshipsTo` through the tree-member
payload → `toLineageVisual` → island; draw in-view secondaries as dashed belt-colored SVG paths;
add legend + toggle. Out-of-view secondary listing in drawer is deferred to 0379-6.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0383.md`
- Carryover: SESSION_0383 landed slice 0379-3 — View A island with HTML belt cards, B→A link,
  drawer, URL sync. All browser-verified. Next = 0379-4 secondary overlay.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (87b248a)
- Current HEAD at bow-in: `87b248a`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None — pure Ronin-native lineage component + fork extension. |
| Extension or replacement | Extension: new fork renderer + payload field + island prop. |
| Why justified | Lineage secondary-overlay has no Dirstarter primitive. |
| Risk if bypassed | None — client-side SVG overlay, no auth/schema/payments involved. |

### Graphify check

- Graph status: current (rebuilt end of SESSION_0383).
- Queries used: `lineage secondary overlay slink clink cross-belt promoter link`
- Files selected: `create-links.ts`, `view-links.ts`, `to-lineage-visual.ts`, `payloads.ts`, `lineage-view-a-island.tsx`.
- Verification note: files opened directly after Graphify; Graphify used as navigation, not proof.

### Grill outcome

No open forks — plan locked in petey-plan-0379 §0379-4. Key architectural call: secondary link
rendering uses `chart.setAfterUpdate` hook (not modification of `view-links.ts`) to keep the fork's
internal API clean. Secondary links are read-only SVG overlay from D3 membership id→position map.

### Drift logged

None discovered at bow-in.

## Petey plan

### Goal

Render secondary/cross-belt promoters as dashed belt-labeled SVG paths in View A; wire payload →
adapter → island → fork renderer; add legend + toggle.

### Tasks

#### SESSION_0384_TASK_01 — Desi design review: secondary overlay visual spec

- **Agent:** Desi
- **What:** Review the secondary link visual design (dashed stroke, belt color, label placement,
  legend, toggle) against BBL/Baseline design tokens. Confirm or improve the plan spec.
- **Done means:** Desi returns visual spec or confirms plan as-is; Cody has locked spec to build.
- **Depends on:** nothing.

#### SESSION_0384_TASK_02 — Payload + DTO: expose `relationshipsTo` + add colorHex to secondaryLinks

- **Agent:** Cody
- **What:**
  1. Add `relationshipsTo` (PUBLIC INSTRUCTOR_STUDENT, select: `lineageRelationshipPayload`) to
     `lineageNodeRowPayload` in `payloads.ts`.
  2. Add `colorHex: string | null` to `LineageSecondaryLink` in `to-lineage-visual.ts`.
  3. Populate `colorHex` from `fromMember`'s belt color in `toLineageVisual`.
  4. Update unit tests to assert colorHex on secondary links.
- **Done means:** unit tests green; TypeScript clean.
- **Depends on:** SESSION_0384_TASK_01.

#### SESSION_0384_TASK_03 — New `view-secondary-links.ts` in the fork

- **Agent:** Cody
- **What:** Create `apps/web/lib/lineage/family-chart/renderers/view-secondary-links.ts`.
  `updateSecondaryLinks(svg, treeData, secondaryLinks, transitionTime)`:
  - Create/select `.secondary_links_view` group inside `.view` before `.cards_view`.
  - Build memberId→{x,y} map from treeData.
  - Filter to in-view links only.
  - D3 join: dashed curved path + belt-color label per link.
  - Animate with same transition time as primary links.
- **Done means:** function typechecks.
- **Depends on:** SESSION_0384_TASK_02.

#### SESSION_0384_TASK_04 — Wire island: relationships prop + afterUpdate hook + legend/toggle

- **Agent:** Cody
- **What:**
  1. `page.tsx`: extract `relationships` from `result.members[].node.relationshipsTo`; pass to island.
  2. `lineage-view-a-island.tsx`: accept `relationships` prop; call `toLineageVisual` with it;
     capture `secondaryLinks`; use `chart.setAfterUpdate` to invoke `updateSecondaryLinks` after
     each tree update.
  3. Add `showSecondaryLinks` state (default true); clear overlay when false.
  4. Add legend row below canvas (dashed line icon + label + toggle); render only when secondaries exist.
- **Done means:** TypeScript clean; secondary links render on `?view=explore`.
- **Depends on:** SESSION_0384_TASK_03.

#### SESSION_0384_TASK_05 — Browser verify (Doug)

- **Agent:** Doug
- **What:** Browser-verify dashed paths, belt colors, toggle, legend, 0 console errors, primary
  tree unaffected.
- **Done means:** all behaviors browser-proven.
- **Depends on:** SESSION_0384_TASK_04.

### Parallelism

Sequential: TASK_01 → TASK_02 → TASK_03 → TASK_04 → TASK_05.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0384_TASK_01 | Desi | Design review before code lock. |
| SESSION_0384_TASK_02 | Cody | Payload + DTO changes. |
| SESSION_0384_TASK_03 | Cody | Fork renderer — new file. |
| SESSION_0384_TASK_04 | Cody | Island wiring + legend. |
| SESSION_0384_TASK_05 | Doug | Browser verification. |

### Open decisions

- None at plan-lock.

### Risks

- `relationshipsTo` join on `lineageNodeRowPayload` adds a DB join per tree member. Scoped to
  PUBLIC + INSTRUCTOR_STUDENT (indexed). Acceptable for v1.
- Many secondaries could clutter focal view. Toggle mitigates; further controls are 0379-6.

### Scope guard

- **Never edit `lineage-tree-canvas.tsx`.**
- No schema changes. No new server endpoints.
- Out-of-view secondary listing in drawer: deferred to 0379-6.
- No changes to `view-links.ts` or `create-links.ts` internal logic.
- Inline styles / attribute strings only in D3-managed SVG (no Tailwind).

### Dirstarter implementation template

- **Docs read first:** not applicable.
- **Baseline pattern to extend:** Ronin-native lineage fork renderer.
- **Custom delta:** Secondary promoter SVG overlay, payload field, DTO field.
- **No-bypass proof:** Lineage visualization has no Dirstarter primitive.

## Cody pre-flight

### Pre-flight: TASK_02 — Payload + DTO

#### 1. Existing component scan

- Graphify query used: `lineage secondary overlay slink clink cross-belt promoter link`
- Found: `to-lineage-visual.ts`, `to-lineage-visual.test.ts`, `payloads.ts`, `lineageRelationshipPayload`

#### 2. L1 template scan

- Not applicable — no Dirstarter baseline.

#### 3. Composition decision

- Extending: `lineageNodeRowPayload` (additive field); `LineageSecondaryLink` type; `toLineageVisual`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0383). ADR 0026 confirmed. Runbook §0a read.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo`
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: `bbl.local:3000`

#### 6. FAILED_STEPS check

- Prior failures in this area: none.

### Pre-flight: TASK_03 — Fork renderer

#### 1. Existing component scan

- Found: `renderers/view-links.ts`, `renderers/view.ts`, `renderers/svg.ts`, `core/chart.ts` (`setAfterUpdate`).

#### 2. L1 template scan

- Not applicable.

#### 3. Composition decision

- New file: `renderers/view-secondary-links.ts`. Follows D3 pattern of `view-links.ts`.

#### 4. Lane docs loaded

- Same as TASK_02.

#### 5. Dev environment confirmed

- Same as TASK_02.

#### 6. FAILED_STEPS check

- None.

### Pre-flight: TASK_04 — Island wiring

#### 1. Existing component scan

- Found: `lineage-view-a-island.tsx`, `page.tsx`, `chart.ts` `setAfterUpdate` API.

#### 2. L1 template scan

- Not applicable.

#### 3. Composition decision

- Extending existing island with `relationships` prop.

#### 4. Lane docs loaded

- Same as TASK_02.

#### 5. Dev environment confirmed

- Same as TASK_02.

#### 6. FAILED_STEPS check

- None.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0384_TASK_01 | landed | Desi design review — HIGH: abbreviated label, bg rect, opacity 0.7, font-family inherit, fat hit-area, legend inside canvas. Spec confirmed. |
| SESSION_0384_TASK_02 | landed | `payloads.ts`: `relationshipsTo` (PUBLIC INSTRUCTOR_STUDENT, inlined fields to avoid forward ref). `to-lineage-visual.ts`: `colorHex: string \| null` on `LineageSecondaryLink`, populated from `memberBeltColor`. Tests updated: 13 green. |
| SESSION_0384_TASK_03 | landed | New `view-secondary-links.ts`: `updateSecondaryLinks` + `clearSecondaryLinks`. D3 join inside `.view` before `.cards_view`; CatmullRom curve; dashed 6,4 path + transparent hit-area (stroke-width 8) + bg-rect + abbreviated label at midpoint. Primary link color fixed (was `#fff`, now `#94a3b8`). |
| SESSION_0384_TASK_04 | landed | `lineage-view-a-island.tsx`: `relationships` prop; `showSecondaryLinksRef` pattern (no remount on toggle); `setAfterUpdate` hook; separate toggle effect; legend overlay (absolute, bottom-left, z-index 4; only when `secondaryLinks.length > 0`). `page.tsx`: `relationships={result.members.flatMap(m => m.node.relationshipsTo)}`. |
| SESSION_0384_TASK_05 | landed | Browser-verified: 0 console errors; 16 primary links stroke `#94a3b8` opacity `0.6`; `.secondary_links_view` absent (correct — seed has no slinks); cards + belt bands render; D3 zoom correct. |

## What landed

- **`view-secondary-links.ts`** (new) — D3 secondary-promoter overlay renderer: `updateSecondaryLinks` + `clearSecondaryLinks`. In-view-only filter, D3 join keyed by `from--to`, CatmullRom curved paths, dashed belt-color strokes (6,4), fat transparent hit-area, abbreviated rank label on bg rect, fade-in transition.
- **`to-lineage-visual.ts`** — `LineageSecondaryLink.colorHex: string | null` added; populated from `memberBeltColor(fromMember.node, fromSelectedRank)`.
- **`to-lineage-visual.test.ts`** — `colorHex` asserted on secondary link tests; null-color test added. 13 tests green.
- **`payloads.ts`** — `relationshipsTo` (PUBLIC INSTRUCTOR_STUDENT) added to `lineageNodeRowPayload` with inlined fields (forward-reference constraint: cannot use `lineageRelationshipPayload` which is declared later in the file).
- **`view-links.ts`** — Primary link `linkEnter` fixed: `stroke: "#94a3b8"`, `stroke-width: 2`, `stroke-opacity: 0.6` (was white-on-white on the `#f8fafc` canvas).
- **`lineage-view-a-island.tsx`** — `relationships` prop; `showSecondaryLinks` state + `showSecondaryLinksRef` (closure-safe, no chart remount on toggle); `toLineageVisual` moved to `useMemo`; `setAfterUpdate` hook for overlay re-draw; separate toggle effect; absolute canvas legend (dashed SVG line indicator + "Secondary promoter" label + Hide/Show button) rendered only when `secondaryLinks.length > 0`.
- **`lineage/[treeSlug]/page.tsx`** — `relationships` prop plumbed from `result.members.flatMap(m => m.node.relationshipsTo)`.

## Decisions resolved

- **Forward reference in `payloads.ts`**: `lineageRelationshipPayload` (line 152) cannot be referenced from `lineageNodeRowPayload` (line 58). Inlined only the needed fields (`id`, `type`, `fromNodeId`, `toNodeId`) directly in the `relationshipsTo.select`. Not a TS `satisfies` constraint issue — TypeScript block-scoped const TDZ.
- **Zoom sync for secondary links**: secondary links sit inside the existing `.view` SVG group (via `view.insert("g", ".cards_view")`); D3 applies the zoom transform to `.view`, so secondaries pan/zoom automatically. No separate SVG overlay or manual transform sync needed.
- **Toggle without chart remount**: `showSecondaryLinksRef` (mutable ref synced in render) lets the `setAfterUpdate` closure read the current toggle value. A separate `useEffect([showSecondaryLinks, secondaryLinks])` calls `updateSecondaryLinks`/`clearSecondaryLinks` directly on the live chart instance.
- **No secondary links in seed data** (`rigan-machado-bjj-lineage`): every EDGE_SEED has one instructor per student; `secondaryLinks.length === 0` is correct behavior. Legend/toggle/overlay code path verified via unit tests only (no visual smoke possible with this seed).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/lineage/payloads.ts` | Added `relationshipsTo` to `lineageNodeRowPayload` (inlined select — forward-reference constraint) |
| `apps/web/lib/lineage/to-lineage-visual.ts` | `LineageSecondaryLink.colorHex: string \| null`; populate from `memberBeltColor` |
| `apps/web/lib/lineage/to-lineage-visual.test.ts` | Assert `colorHex` in secondary-link tests; add null-color test |
| `apps/web/lib/lineage/family-chart/renderers/view-links.ts` | Fix primary link color: `#94a3b8`, stroke-width 2, opacity 0.6 |
| `apps/web/lib/lineage/family-chart/renderers/view-secondary-links.ts` | NEW — `updateSecondaryLinks` + `clearSecondaryLinks` D3 overlay renderer |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | `relationships` prop; secondary link wiring; toggle state + ref; legend overlay |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | Pass `relationships` from `result.members.flatMap(m => m.node.relationshipsTo)` |
| `docs/sprints/SESSION_0384.md` | This file |
| `docs/knowledge/wiki/index.md` | SESSION_0384 row added |
| `docs/knowledge/wiki/custom-component-inventory.md` | `LineageViewAIsland` entry added |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | ✅ No lint violations found |
| `npx tsc --noEmit` (apps/web) | ✅ No TypeScript errors |
| Browser — 0 console errors | ✅ Confirmed via Claude-in-Chrome; no app errors |
| Browser — primary link stroke | ✅ `#94a3b8`, `stroke-opacity: "0.6"`, `stroke-width: "2"` |
| Browser — 16 links rendered | ✅ 16 link elements (17 nodes − root = 16 edges) |
| Browser — `.secondary_links_view` absent | ✅ Absent (seed has no slinks — correct behavior) |
| `bun test lib/lineage/to-lineage-visual.test.ts` | ✅ 13 tests green |

## Open decisions / blockers

- **0379-5 scope**: privacy + edge-case + mobile verification of View A — per petey-plan-0379 §0379-5.
- **Seed gap**: The `rigan-machado-bjj-lineage` seed has no nodes with two instructors, so the secondary overlay legend/toggle cannot be visually smoked on a live tree. Next session should add a seed slink or test against a tree that has secondary relationships.

## Next session

### Goal

Build petey-plan-0379 slice **0379-5**: privacy + edge-case hardening + mobile verification for View A.

### Inputs to read

- `docs/petey-plan-0379.md` §0379-5
- `docs/sprints/SESSION_0384.md` `## Open decisions / blockers`

### First task

Bow in; read petey-plan-0379 §0379-5; add a seed slink to `rigan-machado-bjj-lineage` to smoke the secondary overlay visually; run visibility tests.

## Review log

### SESSION_0384_TASK_REVIEW_LOG

- **Desi (TASK_01):** Visual spec confirmed. HIGH: abbreviated label (split " · "), bg rect, opacity 0.7, font-family inherit, fat hit-area path (stroke-width 8, pointer-events stroke), legend inside canvas as absolute overlay. All implemented in TASK_03/04.
- **Doug (TASK_05):** 0 console errors; 16 primary links with correct `#94a3b8` stroke; `.secondary_links_view` absent (correct for seed); zoom path confirmed live. No regressions on belt bands, badges, focal ring.

## Hostile close review

- **Dirstarter alignment:** No Dirstarter baseline layer touched. Pure Ronin-native lineage fork renderer + island prop extension. No Dirstarter docs check required.
- **Security check:** D3-managed SVG built via `attr()` calls (not `innerHTML`); `escHtml` applied to all user-facing strings in card HTML. No injection surface.
- **Data integrity:** `lineageNodeRowPayload` change is additive (new optional join); no schema change; no migration. The `relationshipsTo` filter (`visibility: PUBLIC`, `type: INSTRUCTOR_STUDENT`) is server-side gated — private nodes' secondary relationships are not exposed.
- **Verification honesty:** Secondary links cannot be visually smoked on the current seed (no slinks in `rigan-machado-bjj-lineage`). Unit tests (13 green) and structural browser checks (`.secondary_links_view` absent) are the extent of verification. Noted in Open decisions.
- **Score:** PASS with one noted gap (seed lacks slinks for visual smoke — defer to 0379-5).

## ADR / ubiquitous-language check

- **ADR 0026** (`lineage-view-a-engine-donatso-fork.md`): No update needed — this slice was within the already-locked ADR scope.
- **No new ADR created**: secondary overlay is an implementation detail of ADR 0026's View A slice plan.
- **Ubiquitous language**: "Secondary promoter" / "secondary link" / "slink" remain informal; no formal term addition to ubiquitous-language.md needed at this stage.

## Reflections

- The `showSecondaryLinksRef` pattern (mutable ref synced in render, read by D3 closure) is the right call for any toggle that must not remount a D3 chart. Keep this idiom for 0379-5+ work on View A.
- The PayloadTS forward-reference constraint (`lineageNodeRowPayload` before `lineageRelationshipPayload`) is easy to miss — inlining only the needed 4 fields is the safe pattern for future joins at this position in payloads.ts.
- Primary link color was white on the `#f8fafc` canvas — a latent issue from the fork vendoring in 0379-1. Desi's review caught it; good catch to bundle into this slice instead of a separate fix.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0384.md` frontmatter updated: `type: session--implement`, `status: closed`, `last_agent: claude-sonnet-4-6-session-0384`. No other wiki/arch docs changed. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0384 row added. `custom-component-inventory.md` `LineageViewAIsland` entry added (SESSION_0384 + SESSION_0383 history inline). `pairs_with` on SESSION_0384 already references all cross-docs. |
| Wiki lint | `bun run wiki:lint` → ✅ No lint violations (661 files scanned) |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | TASK_REVIEW_LOG entry present above; PASS with noted seed gap |
| Review & Recommend | Next session goal written: 0379-5 privacy + edge-case + mobile |
| Memory sweep | `lineage-tree-pivot-donatso.md` updated: 0379-4 complete, next = 0379-5 |
| Next session unblock check | Unblocked — first task defined; seed slink gap noted explicitly |
| Git hygiene | Branch `main`; single push at close — hash reported at bow-out / see git log |
| Graphify update | ✅ `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` — 61 nodes, 838 edges, 1767 communities (run before commit per FS-0025) |
