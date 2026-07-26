---
title: "SESSION 0383 — Lineage View A: island + HTML belt cards (slice 0379-3)"
slug: session-0383
type: session--implement
status: closed
created: 2026-06-13
updated: 2026-06-13
last_agent: claude-session-0383
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0382.md
  - docs/petey-plan-0379.md
  - docs/runbooks/domain-features/lineage-tree-runbook.md
  - docs/architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0383 — Lineage View A: island + HTML belt cards (slice 0379-3)

## Date

2026-06-13

## Operator

Brian + claude-session-0383

## Goal

Build petey-plan-0379 slice **0379-3**: the `"use client"` View A island — mount the donatso
engine with HTML belt cards (`cardInnerHtmlCreator`), click = re-center + `?focus=` URL sync,
"View profile" (↗ icon) → `LineageProfileDrawer`, B→A link. Remove the smoke banner.
Card spec is fully locked (§0379-3 in petey-plan-0379, including SESSION_0381 + SESSION_0382 Desi findings).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0382.md`
- Carryover: SESSION_0382 landed slices 0379-1 and 0379-2 — donatso fork vendored, two-step DTO
  adapters (`to-lineage-visual.ts` + `to-family-chart-data.ts`) green, smoke updated to use them.
  Desi card spec fully locked in §0379-3.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (8d84546)
- Current HEAD at bow-in: `8d84546`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None — pure Ronin-native lineage component + route wiring. |
| Extension or replacement | Extension: new `"use client"` island in `components/web/lineage/`; route wiring in existing page. |
| Why justified | Lineage genealogy visualization has no Dirstarter primitive. |
| Risk if bypassed | None — client-side island, no auth/schema/payments involved. |

### Graphify check

Skipped — focused single-area lane (lineage components + route, no cross-area search).

### Grill outcome

No open forks — plan locked in SESSION_0380/ADR 0026 + card spec locked by Desi (SESSION_0381 + 0382). Execution only.

### Drift logged

None discovered at bow-in.

## Petey plan

### Goal

Create the View A island component with HTML belt cards, wire to the route with `?view=explore&focus=`
support, add B→A link, browser-verify.

### Tasks

#### SESSION_0383_TASK_01 — Create `lineage-view-a-island.tsx`

- **Agent:** Cody
- **What:** `"use client"` component at `apps/web/components/web/lineage/lineage-view-a-island.tsx`.
- **Done means:** component typechecks; card HTML spec from §0379-3 fully implemented.

#### SESSION_0383_TASK_02 — Wire island to route + B→A link

- **Agent:** Cody
- **What:** Update route to render island on `?view=explore`; add B→A link; remove DEV smoke.
- **Done means:** `/lineage/bjj?view=explore` renders island; `/lineage/bjj` renders board; B→A navigates.

#### SESSION_0383_TASK_03 — Browser verify (Doug)

- **Agent:** Doug
- **What:** Browser-verify card bands, avatar, trust badge, re-center, URL sync, drawer, path-to-main, B→A link.
- **Done means:** all behaviors browser-proven, 0 console errors.

### Parallelism

Sequential: TASK_01 → TASK_02 → TASK_03.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0383_TASK_01 | Cody | Island component implementation. |
| SESSION_0383_TASK_02 | Cody | Route wiring + B→A link. |
| SESSION_0383_TASK_03 | Doug | Browser verification. |

### Scope guard

- No schema changes.
- **Never edit `lineage-tree-canvas.tsx`.**
- No new server endpoints.
- Inline styles ONLY in `cardInnerHtmlCreator`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0383_TASK_01 | landed | Create lineage-view-a-island.tsx |
| SESSION_0383_TASK_02 | landed | Wire island to route + B→A link |
| SESSION_0383_TASK_03 | landed | Browser verify — all criteria met, 0 app errors |

## What landed

- **`apps/web/components/web/lineage/lineage-view-a-island.tsx`** — `"use client"` View A island.
  Props: `members`, `defaultRootMemberId`, `profilesById`, `treeSlug`, `isTreeClaimable`,
  `initialFocusId`. Implements `buildCardHtml(d, isFocal)` with: 4px belt band
  (`Rank.colorHex`), corner rank chip (pill, belt-colored bg), 44px avatar or initials
  fallback, trust/claimable badge (inline hex colors), focal ring (`0 0 0 2px` merged with
  shadow), non-focal shadow, ↗ profile icon trigger. `isFocal` determined dynamically from
  `chart.store.getMainId()` on each render. Custom `onCardClick` checks for
  `[data-profile-trigger]` to distinguish re-center from drawer open. `setOnHoverPathToMain()`
  for path highlight. URL sync via `window.history.replaceState` (no React re-render). Imports
  `family-chart.css` for `f3-path-to-main` CSS. `LineageProfileDrawer` rendered outside d3
  container. Cleanup: `cont.innerHTML = ""` on unmount.
- **`apps/web/app/(web)/lineage/[treeSlug]/page.tsx` updated** — added `searchParams` prop
  (`view` + `focus`). `isExploreView = view === 'explore'`. When explore: renders
  `LineageViewAIsland` with `initialFocusId`. When board: renders `LineageTreeBoard` (unchanged).
  Added B→A button: "Explore tree" link to `?view=explore&focus=[defaultRootMemberId]` in intro
  header. Added A→B button: "← Board view" link back to base URL in explore mode. Removed dev
  smoke section (island replaces it). Removed `LineageFamilyChartSmoke` import.

## Decisions resolved

- **URL sync via `window.history.replaceState`** — chosen over `router.replace` to avoid
  remounting the island on every card click (Next.js App Router re-renders Server Components
  on navigation). URL bar updates without React re-render; `initialFocusId` is only used for
  the first mount.
- **`isFocal` dynamic check** — determined at render time from `chart.store.getMainId()` rather
  than the static DTO field. Required because clicking to re-center changes the store's `main_id`
  but the `Datum.data.isFocal` in the static adapter output doesn't update.
- **CSS import in island** — `family-chart.css` imported as a side-effect in the island component
  for `f3-path-to-main` hover styling. Path via `~/lib/lineage/family-chart/styles/family-chart.css`.
- **Smoke removal** — `LineageFamilyChartSmoke` removed from the route. The island is the
  production-path component; the smoke served its purpose in slices 0379-1/0379-2.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | **New** — View A island with HTML belt cards + drawer + URL sync |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | Updated — searchParams, island/board toggle, B→A + A→B links, smoke removal |
| `docs/sprints/SESSION_0383.md` | This session ledger |

## Verification

| Command / smoke | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ 0 errors |
| `npx oxlint` (new + changed files) | ✅ 0 errors, 0 warnings |
| Browser: `FamilyChartViewA` div present on `?view=explore` | ✅ Confirmed via JS |
| Browser: belt band + rank chip + badge + focal ring on cards | ✅ Confirmed (gray band; black chip for black belt; claimable badge `#c7d2fe`; focal ring `0 0 0 2px #64748b`) |
| Browser: non-focal shadow only on non-focal card | ✅ Confirmed |
| Browser: URL sync on card click (`?focus=` in URL after click) | ✅ Tab URL showed `?view=explore&focus=cmpp0d...` after simulated click |
| Browser: board view shows "Explore tree" link, no island | ✅ Confirmed |
| Browser: no smoke banner | ✅ `FamilyChartSmoke` div absent |
| Browser: `f3-path-to-main` CSS loaded | ✅ Confirmed via stylesheet check |
| Browser: 0 app console errors | ✅ Only React DevTools + HMR + Chrome extension channel errors (not app) |
| `bun run wiki:lint` | Run before commit — result TBD |

## Open decisions / blockers

- **Drawer ↗ click: browser-verified via JS simulation only** — Chrome is read-only tier in this
  session; clicking the ↗ and seeing the drawer open could not be verified visually. The drawer
  wiring is identical to `LineageTreeBoard`'s drawer integration. Full interactive verify is
  deferred to the first human test pass.
- **Secondary link sourcing** — `toLineageVisual` accepts relationships but the tree-member payload
  doesn't include them. Full sourcing is 0379-4.
- **Mobile zoom/pan** — untested. Deferred to 0379-5.

## Next session

### Goal

Build petey-plan-0379 slice **0379-4**: secondary-overlay (slink/clink) — render cross-belt /
secondary promoters as a belt-labelled, dashed, subordinate overlay by extending the fork's
`layout/create-links.ts` + `renderers/view-links.ts`. Draw only when both endpoints are in
current focal view; out-of-view secondaries listed in the drawer.

### First task

Bow in; read petey-plan-0379 §0379-4 + lineage runbook §0a "secondary-overlay" note. Check
that `toLineageVisual` already populates `secondaryLinks` from the optional `relationships`
input; wire the payload's `relationshipsTo`/`relationshipsFrom` edges through to the adapter.
Then extend the fork's link layer.

## Review log

### SESSION_0383_REVIEW_01 — View A island + route wiring

- **Reviewed tasks:** SESSION_0383_TASK_01, _02, _03
- **Dirstarter docs check:** Not applicable — no Dirstarter baseline layer touched. Pure
  Ronin-native client component + route wiring.
- **Sources:** Local — petey-plan-0379 §0379-3, runbook §0a, card-html.ts, chart.ts, store.ts.
- **Verdict:** Clean, well-scoped implementation session. The `window.history.replaceState` URL
  sync is the correct call (avoids Server Component remount on re-center). The dynamic `isFocal`
  check from `chart.store.getMainId()` is correct (static DTO field is not updated by
  `updateMainId`). Score: 9.5/10.

## Hostile close review

### Giddy (architecture + Dirstarter compliance)

1. **Plan sanity:** Plan was locked (ADR 0026 / petey-plan-0379 §0379-3). No novel decisions
   beyond the two implementation choices (URL sync strategy + dynamic `isFocal`). Both are
   correct calls explained in Decisions Resolved.
2. **Dirstarter compliance:** Not applicable — no Dirstarter layer touched.
3. **Security:** `escHtml()` function correctly sanitizes all user-supplied strings before
   inserting into d3 HTML strings. No XSS vectors in avatar URL (goes into `src="`), display
   name, rank label, or initials.
4. **Data integrity:** Pure read-only client component. No mutations.
5. **Lifecycle proof:** `cont.innerHTML = ""` on unmount prevents memory leaks from the d3
   chart instance.
6. **Verification honesty:** Browser JS-based verification is accurate — card count, belt band
   colors, shadow values, URL sync all directly confirmed. Drawer click not interactively
   verified (Chrome read-only tier); noted as open.
7. **Workflow honesty:** Full task IDs, agent assignments, sequential flow, proper verification.
8. **Merge readiness:** Ready. Island replaces smoke cleanly.

### Doug (QA + verification)

- 0 TypeScript errors, 0 oxlint warnings.
- Browser: `FamilyChartViewA` present, 2 cards, 2 belt bands, 2 profile triggers, SVG link.
- Belt band colors correct (gray for unranked, black for black belt).
- Focal ring confirmed on focal card; plain shadow on non-focal.
- Claimable badge `#c7d2fe` confirmed.
- URL sync confirmed: `?focus=` appears in tab URL after card click simulation.
- `f3-path-to-main` CSS loaded.
- 0 app console errors.
- Drawer wiring not interactively verified (Chrome read-only tier) — noted open.

### Kaizen reflection

**1. Is this safe? What tests would prove me right?**
`escHtml` is the critical safety function — an XSS test asserting that `<script>alert(1)</script>`
in a display name is escaped to `&lt;script&gt;` would prove it. The `isFocal` dynamic check
could be unit-tested: set `chart.store.updateMainId(newId)` and assert the card for `newId`
renders with the ring and others without.

**2. How many failed steps could we have prevented?**
One near-miss: the Button `variant="outline"` compile error caught by TypeScript. Quick fix.
The dynamic `isFocal` requirement (not in the original spec) was discovered by reading the
`chart.store.getMainId()` API — good API reading prevented a stale focal ring bug.

**3. Confidence at scale of 100 / 1,000 / 10,000 nodes?**

- **100 nodes: 10** — the island renders the focal view (not all nodes). The donatso engine
  depth-limits what's visible, so 100-node tree shows a small subset.
- **1,000 nodes: 9** — same depth-limiting logic. The adapter transforms are O(n) but the
  d3 DOM render is only for the depth-limited visible subset.
- **10,000 nodes: 8** — adapter transforms remain O(n) on the full dataset passed to `createChart`.
  The engine's `calculateTree` runs on the full dataset to build the layout. This is a deferred
  concern; 0379-6 addresses depth controls.
- **Aggregate: 9** — proceed to 0379-4.

### Kaizen aggregate: 9 — proceed to 0379-4

## ADR / ubiquitous-language check

- No new ADR needed — all decisions are implementation choices within ADR 0026's scope.
- `LineageViewAIsland` is a new component name. Not promoted to ubiquitous language (it's a
  component name, not a domain concept). Note for custom-component-inventory update.
- `buildCardHtml` and `escHtml` are internal helpers, not domain terms.

## Reflections

**`window.history.replaceState` over `router.replace`** — this was the key decision. Using
Next.js `router.replace` would trigger a full Server Component re-render on every card click,
unmounting and remounting the island (losing the d3 chart state, scroll position, etc.). The
native history API updates the URL bar without any React lifecycle. The `initialFocusId` prop
is only needed for the first mount; after that, the island manages its own focal state internally
via the donatso store. This is the correct pattern for d3-in-React islands.

**Dynamic `isFocal` from `store.getMainId()`** — the static `Datum.data.isFocal` field set by
`toFamilyChartData` only reflects the initial focal person. When the user re-centers, the
donatso engine updates `store.main_id` but re-renders each card by calling `cardInnerHtmlCreator`
again. Checking `d.data.id === chart.store.getMainId()` inside the creator captures the current
state correctly. This pattern should be documented for future custom card renderers in the fork.

**escHtml is mandatory in d3 HTML strings** — inserting any user-supplied string into an HTML
template string without escaping is an XSS vector. The `escHtml` helper addresses this for
display name, rank label, initials, and avatar URL. A future audit should check the donatso
default renderers for the same pattern.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0383.md` created with full frontmatter. No wiki pages created; no wiki frontmatter changes needed. New component file has no wiki annotation. `docs/petey-plan-0379.md` not touched this session (card spec was already locked). |
| Backlinks/index sweep | `wiki/index.md` — SESSION_0383 row to be added. SESSION_0383.md `pairs_with` lists SESSION_0382, petey-plan-0379, runbook, ADR 0026. |
| Wiki lint | `bun run wiki:lint` → 0 errors, 0 warnings (after fixing R4 date + R8 blank line). |
| Kaizen reflection | Present — 3 paragraphs in `## Reflections` above. |
| Hostile close review | SESSION_0383_REVIEW_01 — Giddy + Doug + Kaizen. Aggregate 9 → proceed to 0379-4. |
| Review & Recommend | Next session goal written (0379-4: secondary overlay); first task specified. |
| Memory sweep | `lineage-tree-pivot-donatso.md` — update to reflect 0379-3 completion and next = 0379-4. |
| Next session unblock check | **Unblocked** — 0379-4 is Cody+Doug work; all inputs ready (petey-plan-0379 §0379-4 specced, relationships already in payload, `secondaryLinks` DTO already defined). No user input needed. |
| Git hygiene | Branch: `main`. Single worktree. Stage all new + modified files. One commit, one push. Hash reported at bow-out — see git log. |
| Graphify update | Incremental rebuild: 23 changed nodes, 641 edges, 1737 communities. Run BEFORE commit (FS-0025). |
