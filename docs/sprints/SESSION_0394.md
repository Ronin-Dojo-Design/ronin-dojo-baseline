---
title: "SESSION 0394 — Cinematic Lineage Explorer: brand-polish + selection-focus choreography"
slug: session-0394
type: session--open
status: closed
created: 2026-06-15
updated: 2026-06-15
last_agent: claude-session-0394
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0393.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/knowledge/wiki/concepts/motion-system.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0394 — Cinematic Lineage Explorer: brand-polish + selection-focus choreography

## Date

2026-06-15

## Operator

Brian + claude-session-0394 (Petey -> Desi -> Cody -> Doug -> Petey)

## Goal

Take the cinematic `LineageViewAIsland` explorer from "shipped but AI-sloppy" to high-end (Apple /
SuperSide bar) BBL-branded polish: apply Poppins italic 800 brand typography, remove all glassmorphism,
redesign belt badges to a belt-graphic swatch + shimmer (data-driven `Rank.colorHex`), fix the unreadable
/ busy rank badges and card rhythm, restyle the progeny/ancestry depth controls (keep function, kill
slop), and add selection-driven focus choreography (click a card -> focused scales forward, siblings
shrink/recede) using the existing `motion/react` idiom. Clear the deferred Desi LOW items and the two
SESSION_0392 code cleanups. Capture a landing-page motion direction doc (GSAP/Lenis/three.js) as the
teed-up next-session spike. Verify in-browser and land green on `main`.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0393.md`
- Carryover: SESSION_0393 shipped the cinematic Lineage View A explorer as the default public view and
  closed green (601 tests, CI/deploy green). It explicitly deferred a set of LOW-priority design polish
  items + minor mobile overlay crowding, and carried forward the two SESSION_0392 cleanups. This session
  takes the explorer from shipped to premium-polished and clears both carry-forwards.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating this session file
- Current HEAD at bow-in: `68fe0e8`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming/UI only — custom Ronin lineage explorer; no L1 capability replaced. |
| Extension or replacement | Extension: premium restyle + motion polish of an existing custom component (`LineageViewAIsland`); same data flow. |
| Why justified | Lineage is a Ronin-custom domain with no Dirstarter primitive; brand-polish + brand-typography is editorial chrome. |
| Risk if bypassed | None — no Dirstarter capability bypassed; data wiring unchanged. |

Live docs checked during planning: not applicable; custom lineage UI.

### Graphify check

- Graph status: current (refreshed end of SESSION_0393); stats at bow-in: 12896 nodes, 24494 edges, 1761 communities, 2073 files tracked.
- Queries used (navigation, not proof):
  - `belt badge swatch BeltSwatch belt color rank pill`
  - `ClaimantHasPassportError code claim error`
- Files selected from graph (then verified by direct read):
  - `apps/web/components/web/lineage/lineage-view-a-island.tsx` (829 lines — primary target)
  - `apps/web/components/web/lineage/belt-swatch.tsx` (reuse/extend for belt-graphic badge)
  - `apps/web/server/admin/lineage/claim-review-errors.ts` (`ClaimantHasPassportError.code` cleanup)
- Verification note: confirmed animation stack is `motion/react` (^12.40.0) + `@mantine/hooks` only —
  no GSAP/Lenis/three.js present. Glassmorphism = ~8 `backdrop-blur-xl` surfaces in the explorer.
  phase3b cleanup targets = `apps/web/scripts/phase3b-{drop-old-user-columns.sql,user-carry-data.ts}`
  (the applied migration `20260615120000_phase3b_*` is NOT a target — it stays).

### Grill outcome

Petey grilled the operator on four forks (animation tech, session scope, depth-control fate, belt-badge
visual) plus two follow-ups (landing-page lane, choreography mechanism). Resolved:

- **Animation tech (explorer):** `motion/react` only this session; no GSAP/Lenis/three.js on the canvas
  (the canvas pans/zooms — it does not scroll, so the "scroll cards" idiom does not map to it). The
  GSAP/Lenis/three.js appetite is real but belongs to the **landing page**, captured as a next-session spike.
- **Scope:** Foundation polish **+ attempt the selection-focus choreography** this session (operator
  accepts it may not fully land; honesty rule applies).
- **Choreography mechanism:** **selection-driven** (click a card -> focused scales up/forward, siblings
  shrink/recede via `motion/react`), NOT scroll-driven. No Lenis on the canvas.
- **Depth controls:** **restyle, keep function** (kill the slop + glass; preserve depth-limiting).
- **Belt badge:** belt-graphic swatch + shimmer microanimation; reuse/extend `BeltSwatch`; `Rank.colorHex`
  data-driven; no glass, no text pill.
- **Landing page:** capture a motion direction doc (GSAP/Lenis/3js fit, bundle/perf budget, reduced-motion
  plan) as the next-session spike — NOT built this session.

## Petey plan

### Goal

Premium-polish the cinematic Lineage explorer (Poppins brand type, de-glass, belt-graphic badges,
legibility, restyled depth controls, selection-focus choreography, Desi LOW items), clear the two 0392
cleanups, tee up the landing-page motion spike, and land green on `main`.

### Tasks

#### SESSION_0394_TASK_01 — Design diagnosis + punch-list (Desi)

- **Agent:** Desi
- **What:** Diagnose the explorer's card system against high-end practice (Apple / SuperSide) + BBL brand,
  and return a prioritized fix list for Cody (no production code).
- **Steps:**
  1. Diagnose card spacing / rhythm / flow + the "multiple unreadable badges" problem (rank badge
     legibility, overall busyness); recommend a hierarchy (what stays on the card, what moves to the
     focus panel / drawer).
  2. Specify the Poppins italic 800 application (which elements, sizes) consistent with the landing page;
     confirm the font is already loaded.
  3. Specify the belt-graphic swatch + shimmer direction (reuse/extend `BeltSwatch`), de-glass targets
     (all `backdrop-blur-xl` -> brand-solid legacy chrome), and the restyled depth-control shape.
  4. Specify the selection-focus choreography (focused scale/elevation, sibling recede/shrink) with a
     `useReducedMotion` fallback; flag any hardcoded color (belt = `Rank.colorHex`, brand = `--primary` token).
  5. Re-confirm the Desi LOW items (drop gold "Focused" label, auto-dismiss recenter hint, cap belt-glow
     blur on bright belts, mobile top-overlay crowding).
- **Done means:** prioritized punch-list (must/should/nice) returned; Cody has a clear spec.
- **Depends on:** nothing.

#### SESSION_0394_TASK_02 — Implement explorer polish + choreography (Cody)

- **Agent:** Cody
- **What:** Apply Desi's punch-list to `lineage-view-a-island.tsx` (+ `belt-swatch.tsx` if extended):
  Poppins type, remove all glassmorphism, belt-graphic swatch + shimmer, fix badge legibility / card
  rhythm, restyle depth controls (keep function), selection-driven focus choreography, all LOW items.
- **Steps:**
  1. Typography: apply Poppins italic 800 to explorer headings/key labels per Desi; reuse the landing-page font seam.
  2. De-glass: replace every `backdrop-blur-xl` frosted surface with brand-solid legacy chrome.
  3. Belt badge: belt-graphic swatch + shimmer (extend `BeltSwatch`); `Rank.colorHex` data-driven; no pill/glass.
  4. Card legibility: fix the unreadable rank badge + busyness per Desi's hierarchy.
  5. Depth controls: restyle (keep depth-limiting function); brand-consistent, no slop, no glass.
  6. Choreography: selection-driven focus motion (`motion/react`) — focused scales forward, siblings
     recede/shrink — with a `useReducedMotion` instant fallback.
  7. LOW items: drop gold "Focused" label (-> size + one accent), auto-dismiss recenter hint after first
     interaction, cap belt-glow blur on bright belts, fix mobile top-overlay crowding.
- **Done means:** typecheck / lint / format clean; explorer renders polished; no glassmorphism remains;
  belt-graphic badges + selection-focus motion work; reduced-motion respected.
- **Depends on:** SESSION_0394_TASK_01.

#### SESSION_0394_TASK_03 — Clear the two SESSION_0392 cleanups (Cody)

- **Agent:** Cody
- **What:** Remove the unused `ClaimantHasPassportError.code`; retire the superseded
  `scripts/phase3b-*` carry/drop scripts (NOT the applied migration).
- **Steps:**
  1. Remove `ClaimantHasPassportError.code` (`server/admin/lineage/claim-review-errors.ts`) if no
     remaining reader; follow the compiler.
  2. Delete `apps/web/scripts/phase3b-drop-old-user-columns.sql` + `apps/web/scripts/phase3b-user-carry-data.ts`
     (one-time, already-run). Leave `prisma/migrations/20260615120000_phase3b_*` untouched.
  3. Update any doc reference that points at the retired scripts.
- **Done means:** dead `.code` gone, scripts retired, typecheck/tests green, no dangling references.
- **Depends on:** nothing (file-disjoint from TASK_02).

#### SESSION_0394_TASK_04 — Landing-page motion direction doc (Desi + Petey)

- **Agent:** Desi (direction) + Petey (decision framing)
- **What:** Capture a next-session spike doc for the landing-page cinematic (GSAP / Lenis / three.js).
- **Steps:**
  1. Where GSAP / Lenis / three.js each fit on the landing page (scroll-driven cards a la CapCut /
     MasterCourse; smooth-scroll; lightweight high-impact 3D).
  2. Bundle / perf budget + the supply-chain note (3 net-new deps; operator is script-cautious).
  3. Reduced-motion + accessibility plan; brand fit (Poppins, no glass, no AI slop).
- **Done means:** a short direction doc exists under `docs/` teed up as SESSION_0395's first task.
- **Depends on:** nothing.

#### SESSION_0394_TASK_05 — Verify: gates + fallow + browser proof (Doug)

- **Agent:** Doug
- **What:** Prove the polished explorer renders + is interactive in Chrome, and all static/test gates pass.
- **Steps:**
  1. `npx fallow audit` on touched files; oxc lint; `bun run typecheck`, `lint:check`, `format:check`,
     `bun run test`, `wiki:lint`. Fix any blocker before e2e.
  2. Chrome-verify the explorer (default `?view=explore`): Poppins type renders, no glassmorphism,
     belt-graphic badges + shimmer, readable rank badges, restyled depth controls work, selection-focus
     choreography (click -> focused forward, siblings recede), drawer/claim CTA intact, mobile top not crowded,
     0 console errors. Confirm reduced-motion path.
- **Done means:** gates green (or blocker recorded with exact failing command); browser proof captured.
- **Depends on:** SESSION_0394_TASK_02, SESSION_0394_TASK_03.

#### SESSION_0394_TASK_06 — Close, Graphify, commit/push, CI/deploy (Petey)

- **Agent:** Petey
- **What:** Full bow-out; update Graphify before git hygiene; stage/commit/push to `main`; follow CI +
  Vercel deploy to green.
- **Steps:** Full closing.md (reflections, hostile close, evidence table, ADR check, memory sweep,
  document any new/changed component in the custom-component inventory); `GRAPHIFY_VIZ_NODE_LIMIT=10000
  graphify update .`; FS-0024 guard; commit (conventional) + push; monitor CI + deploy.
- **Done means:** SESSION_0394 closed-full, pushed, CI/deploy green.
- **Depends on:** SESSION_0394_TASK_05.

### Parallelism

TASK_03 (cleanups) and TASK_04 (landing doc) are file-disjoint from TASK_02 (explorer) and may run
concurrently. TASK_01 gates TASK_02. TASK_05/06 are sequential at the end.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0394_TASK_01 | Desi | Brand/UX diagnosis of the card system + typography spec. |
| SESSION_0394_TASK_02 | Cody | Explorer polish + choreography implementation. |
| SESSION_0394_TASK_03 | Cody | Dead-code + script retirement. |
| SESSION_0394_TASK_04 | Desi + Petey | Landing-page motion direction doc (next-session spike). |
| SESSION_0394_TASK_05 | Doug | Gates + Chrome browser proof. |
| SESSION_0394_TASK_06 | Petey | Close, graphify, git, CI/deploy. |

### Open decisions

- None. All four forks resolved in the grill (see Grill outcome).

### Risks

- **Choreography may not fully land** — selection-driven sibling recede/shrink must coexist with the
  vendored d3 `family-chart` engine that owns card layout. If the engine fights it, ship the rest and
  state the choreography status plainly (honesty rule); do not block the session on it.
- **Poppins italic 800** must reuse the landing-page font seam — if the weight/italic isn't loaded for
  this route, that's a real (small) font-loading task, not a className-only change.
- De-glass is broad (~8 surfaces) — risk of missing one; the browser proof is the checklist.

### Scope guard

- No new package this session (no GSAP/Lenis/three.js on the explorer — that's the landing-page spike).
- No schema change; no Balkan/family-chart engine swap; do not touch the applied phase3b migration.
- Do not build the landing-page animation — TASK_04 is a direction doc only.
- Belt color is always `Rank.colorHex`; brand glow is the `--primary` token — never hardcode.

### Dirstarter implementation template

- **Docs read first:** SESSION_0393 § Open decisions / Next session, lineage hub, motion-system concept.
- **Baseline pattern to extend:** existing custom `LineageViewAIsland` + vendored `family-chart` engine + `BeltSwatch`.
- **Custom delta:** brand-typography + de-glass + belt-graphic badges + selection-focus motion — same data flow.
- **No-bypass proof:** lineage is Ronin-custom; no Dirstarter primitive exists for it.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0394_TASK_01 | landed | Desi returned a ranked punch-list (HIGH: load Poppins on the route via shared `lib/fonts.ts` + apply to hero/focus/card; remove ALL `backdrop-blur` glass → solid legacy chrome; belt-graphic swatch + shimmer reusing `BeltSwatch`; de-clutter card to avatar→name→belt→school, trust badge off the card. MEDIUM: selection choreography, depth-control restyle, KISS backgrounds, confine gold. LOW: drop "Focused" label, auto-dismiss recenter hint, clamp belt-glow by luminance, fix mobile top crowding). |
| SESSION_0394_TASK_02 | landed | Rebuilt `lineage-view-a-island.tsx`: Poppins italic 800 on hero + card names + focus name (via shared `lib/fonts.ts`, applied on the route wrapper, inherited into d3 cards through `family-chart.css`'s `font-family: inherit`); removed ALL glassmorphism (0 `backdrop-blur` elements verified) → `SOLID_PANEL`/`SOLID_PILL` legacy chrome; belt-graphic swatch + `.belt-shimmer` sweep (new `BeltSwatch variant="bar"`, reduced-motion aware in CSS); de-cluttered cards (rank text + trust badge moved off the resting card; one quiet "Claimable" marker kept); selection-focus emphasis via `data-bbl-focal`/`data-bbl-recede` + CSS; restyled depth controls; clamped belt-glow by luminance; dropped the "Focused" label; recenter hint auto-dismisses after first interaction; moved depth controls to the mobile bottom row to clear the top-overlay crowding. |
| SESSION_0394_TASK_03 | landed | Removed the dead `ClaimantHasPassportError.code` field (only its own test read it) + the matching test assertion; retired the superseded `scripts/phase3b-{user-carry-data.ts,drop-old-user-columns.sql}` and the `phase3b:user-carry` package script; updated the preflight doc's "safe to retire" → "retired". The applied `20260615120000_phase3b_*` migration is untouched. |
| SESSION_0394_TASK_04 | landed | Wrote `docs/product/black-belt-legacy/LANDING_MOTION_SPIKE.md` — the next-session GSAP/Lenis/three.js landing direction (phased adoption, bundle/perf + supply-chain budget, mandatory reduced-motion, brand parity). Doc only, no build. |
| SESSION_0394_TASK_05 | landed | Gates green: typecheck 0, oxlint clean (touched files), format clean, **601 pass / 0 fail** (1852 assertions), wiki:lint 0 errors; fallow advisory-only (same coverage-weighted d3-effect findings + pre-existing repo unused-deps; 0% dead exports/files I introduced). Chrome browser proof (localhost / Baseline brand, `rigan-machado-bjj-lineage`): 18 belt-glow cards, Poppins italic names, red belt-graphic bars, 0 backdrop-blur, focal red-glow emphasis (focal+17 recede), click-to-recenter syncs URL + focus panel reads Passport (Carlos→Rorion) + recenter hint auto-dismisses, mobile top crowding resolved (depth controls → bottom row, no overlap), **0 console errors**. |
| SESSION_0394_TASK_06 | landed | Full close, Graphify refresh, single commit + push to `main`, CI/deploy follow-through. |

## What landed

- **Cinematic explorer brand polish** on `lineage-view-a-island.tsx`:
  - **Poppins italic 800 brand typography** on the hero ("Explore the living lineage."), the Current-focus
    name, and every d3 card name — loaded once via the shared `lib/fonts.ts` (`bblHeadingFont`/`bblBodyFont`,
    DRY; the BBL landing now imports the same instance), applied on the route wrapper, and inherited into the
    engine-owned cards through `family-chart.css`'s `font-family: inherit`.
  - **All glassmorphism removed** — ~8 `backdrop-blur-xl` frosted surfaces replaced with solid
    `SOLID_PANEL`/`SOLID_PILL` "legacy/authoritative" chrome (opaque near-black + hairline + inset highlight +
    real drop shadow). Browser-verified **0 backdrop-blur elements** remain.
  - **Belt-graphic swatch + shimmer** — new `BeltSwatch variant="bar"` (folded belt + knot, `Rank.colorHex`
    data-driven) with a `.belt-shimmer` specular sweep (reduced-motion aware in CSS); the same SVG markup is
    inlined into the d3 cards. The text rank-pill is gone from the resting card.
  - **De-cluttered cards** — hierarchy is avatar → name → belt → school; rank label + trust state moved to the
    focus panel / drawer; one quiet "Claimable" corner marker kept (it drives a real action).
  - **Selection-driven focus emphasis** — `data-bbl-focal`/`data-bbl-recede` + CSS (focal dominant, siblings
    recede `0.62` opacity / `scale .965`). Honest constraint: the engine recreates card HTML per update, so this
    is a robust static composition cue + transition, not a cross-selection tween (documented in-file).
  - **Restyled depth controls** (kept function, de-glassed), **belt-glow clamped by luminance** (bright belts
    no longer halo), **gold confined** to the secondary-link legend, **KISS backgrounds** (one glow + one
    vignette + one grid), **"Focused" label dropped**, **recenter hint auto-dismisses** after first interaction,
    and **mobile top-overlay crowding fixed** (depth controls move to the bottom row on mobile; legend hides).
- **Two SESSION_0392 cleanups cleared** — dead `ClaimantHasPassportError.code` removed (+ its test assertion);
  superseded `scripts/phase3b-{user-carry-data.ts,drop-old-user-columns.sql}` + the `phase3b:user-carry`
  package script retired (applied migration untouched); preflight doc marked retired.
- **Landing-page motion spike doc** (`LANDING_MOTION_SPIKE.md`) captured for a future lane.
- **Mid-session finding (D-DRIFT-0394-1): the explorer ignores cohort grouping.** On operator review of the
  browser proof, the flat single-row layout (all ~17 descendants on one line) was flagged: the family-chart
  engine has no cohort concept and `toFamilyChartData` drops `member.visualGroupId`, so the
  **promotion-date cohorts (`LineageVisualGroup`)** the board view already renders are absent in the explorer.
  Deferred to SESSION_0395 (see Next session) — the brand/card polish this session is independent of and
  survives whichever layout wins.

## Decisions resolved

- **Explorer animation = `motion/react` only this session** — GSAP/Lenis/three.js deferred to the
  landing-page spike (the canvas pans/zooms, so the scroll-card idiom doesn't map to it).
- **Focus choreography is selection-driven**, not scroll-driven.
- **Depth controls restyled, function kept** (not removed).
- **Belt badge = belt-graphic swatch + shimmer**, reusing/extending `BeltSwatch`.
- **Landing-page cinematic is a captured spike**, not built this session.
- **Cohort grouping by promotion-date `LineageVisualGroup`** is the next session's build (operator). **Engine
  decision resolved at close: B — retire the vendored family-chart engine for View A and build a custom
  cohort-timeline layout** (cinematic cards as real React, rebuilt focal-recenter). Operator collapsed the
  considered A/B fork to B (no prototype, to save time/tokens). Recorded as **`ADR 0027`** (supersedes
  `ADR 0026`); the shared DTO survives, only the engine changes.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | Cinematic brand polish: Poppins typography, all glass removed → solid chrome, belt-graphic card + focus belt, de-cluttered cards, selection-focus emphasis, restyled depth controls, glow clamp, "Focused" label dropped, recenter-hint auto-dismiss, mobile top-crowding fix. |
| `apps/web/components/common/belt-swatch.tsx` | Added `variant="bar"` belt-graphic + `shimmer` (backward-compatible default `dot`). |
| `apps/web/lib/lineage/family-chart/styles/family-chart.css` | Appended `.belt-shimmer` keyframes (reduced-motion aware) + `[data-bbl-focal]`/`[data-bbl-recede]` selection-emphasis CSS. |
| `apps/web/lib/fonts.ts` | Added shared `bblHeadingFont` (Poppins) + `bblBodyFont` (Inter) for BBL brand surfaces. |
| `apps/web/app/(web)/(home)/bbl/bbl-landing.tsx` | Use the shared `lib/fonts.ts` fonts (DRY; dropped the inline `Poppins()`/`Inter()` calls). |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | Wrap the explorer in the BBL font-variable seam so Poppins reaches the route + d3 cards. |
| `apps/web/server/identity/person-service.ts` | Removed the dead `ClaimantHasPassportError.code` field. |
| `apps/web/server/identity/person-service.test.ts` | Dropped the now-removed `.code` assertion. |
| `apps/web/package.json` | Removed the `phase3b:user-carry` script. |
| `apps/web/scripts/phase3b-user-carry-data.ts`, `phase3b-drop-old-user-columns.sql` | **Deleted** (superseded one-time carry/drop scripts). |
| `docs/product/black-belt-legacy/PHASE3_USER_CARRY_PREFLIGHT.md` | Marked the retired scripts "retired SESSION_0394"; bumped `updated`. |
| `docs/product/black-belt-legacy/LANDING_MOTION_SPIKE.md` | New — next-session GSAP/Lenis/three.js landing direction doc. |
| `docs/sprints/SESSION_0394.md` | Session record. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Documented the `BeltSwatch` bar variant + the polished explorer. |
| `docs/knowledge/wiki/index.md` | SESSION_0394 row. |
| `docs/knowledge/wiki/drift-register.md` | D-DRIFT-0394-1 (explorer ignores cohort grouping; decided B). |
| `docs/architecture/decisions/0027-lineage-view-a-custom-cohort-timeline.md` | New ADR — retire family-chart for View A → custom cohort-timeline (decision B). |
| `docs/architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md` | Marked superseded by ADR 0027. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | PASS (0 errors). |
| `bunx oxlint <touched files>` | PASS (clean). |
| `bun run format:check` | PASS. |
| `bun run test` | PASS: **601 pass / 0 fail**, 1852 assertions, 103 files. |
| `bun run wiki:lint` | PASS: 0 errors (1 frontmatter-date warning fixed during the run). |
| `npx fallow audit --changed-since HEAD --gate new-only --max-crap 30` | Advisory (not a CI gate): same coverage-weighted d3-effect findings as 0393 + pre-existing repo unused-deps; `dead exports/files 0.0%` introduced. |
| Browser proof (localhost / Baseline brand, `rigan-machado-bjj-lineage`, Chrome DevTools MCP) | PASS: 18 cards render; card names + hero + focus name in **Poppins italic** (verified `fontFamily`); **0 backdrop-blur** elements; 18 belt-graphic SVGs + 19 `.belt-shimmer`; focal red-glow emphasis (1 focal + 17 recede via data attrs); click-to-recenter syncs `?focus=` + focus panel reads Passport (Carlos → Rorion); recenter hint auto-dismisses (`hasInteracted`); mobile (≤640px) hero+focus collapse, depth controls move to bottom row, **top-overlay overlap resolved** (was `overlap:true`, now `false`); **0 console errors**. |

## Open decisions / blockers

- **D-DRIFT-0394-1 — explorer ignores cohort grouping (deferred to SESSION_0395).** The cinematic explorer
  lays out a flat single row because the family-chart engine has no cohort concept and `toFamilyChartData`
  drops `member.visualGroupId`. The promotion-date `LineageVisualGroup` cohorts the board renders are absent.
  Not a blocker for this session's brand/card polish (independent). Next session decides the layout (see below).
- **LOW-priority polish still open** (from 0393, partially cleared): focal-state cue reduction was done (label
  dropped); belt-glow blur clamp done; recenter-hint auto-dismiss done; mobile crowding done. Remaining:
  cap belt-glow blur further on the very brightest belts if it still reads hot at full zoom (visual judgement).
- **Unit tests still send live Resend emails** to `@test.local` (pre-existing; visible in the test run).

## Next session

### Goal

**Build the custom cohort-timeline layout for View A (decision B — `ADR 0027`).** The operator collapsed the
A/B fork to **B** at close: **retire the vendored family-chart engine for View A** and build a custom layout
that renders **promotion-date cohorts** (`LineageVisualGroup`) as a timeline of grouped bands, reusing this
session's cinematic cards as **real React** (not d3 HTML strings) with a rebuilt focal-recenter interaction.
No prototype — go straight to B.

### Inputs to read

`docs/runbooks/domain-features/lineage-hub.md`; the board's cohort layout
(`components/web/lineage/lineage-tree-board.tsx`) + `LineageVisualGroup` payload
(`server/web/lineage/payloads.ts:351`); `lib/lineage/to-family-chart-data.ts` + `to-lineage-visual.ts`
(where `visualGroupId` is dropped); the memory note `lineage-tree-pivot-donatso`; `drift-register` D-DRIFT-0394-1.

### First task

Confirm `LineageVisualGroup` cohorts are populated for `rigan-machado-bjj-lineage` in the local seed (if not,
seed them), then scaffold the custom cohort-timeline View A: a React component that reads the shared DTO +
`visualGroups`, groups each parent's children into promotion-date cohort bands (sorted by `sortOrder` /
`promotionDate`), and renders the SESSION_0394 cinematic cards as real React. Wire focal-recenter +
secondary-link overlay onto the new layout, keep the drawer/menu/claim contracts, then retire the family-chart
path for View A behind the cutover. Read `ADR 0027` first. (Landing-page motion spike + BBL D11 launch queue
remain parked lanes.)

## Review log

### SESSION_0394_REVIEW_01 — Cinematic explorer brand polish + cohort-grouping finding

- **Reviewed tasks:** SESSION_0394_TASK_01–06.
- **Dirstarter docs check:** not applicable — custom Ronin lineage UI; no L1 baseline capability touched.
- **Verdict:** A high-quality, browser-proven brand-polish session. Desi's punch-list was implemented in
  full (Poppins brand type now actually reaches the route + the d3 cards, all glassmorphism gone, belt-graphic
  swatch replacing the unreadable rank pill, decluttered cards, restyled depth controls, selection emphasis,
  and every deferred LOW item — including the mobile top-crowding the operator specifically flagged, fixed and
  re-verified `overlap:false`). The two 0392 cleanups landed cleanly. The choreography constraint (engine
  recreates cards → static cue not a tween) was stated honestly, not papered over. The session's real value-add
  beyond the punch-list: on browser review the operator caught that the explorer ignores promotion-date cohort
  grouping — logged as D-DRIFT-0394-1 and teed up as a properly-framed next session (prototype family-chart +
  cohort tier vs custom cohort-timeline layout). Polish is independent of that layout decision and ships green.
- **Score:** 8.5/10 — −1.5 because the headline UX (flat single-row layout) is a known gap that this session
  surfaced but did not fix (correctly deferred), and family-chart friction remains unresolved pending the prototype.
- **Follow-up:** SESSION_0395 cohort-grouping prototype + family-chart go/no-go.

## Hostile close review

- **Giddy:** Pass. No schema/migration/auth/payment touched — presentational restyle + a shared font module +
  a backward-compatible `BeltSwatch` variant + dead-code/script retirement. Brand-token/belt-from-data rules
  upheld (0 hardcoded brand red; belt = `Rank.colorHex`). The `phase3b` deletions are the superseded one-time
  scripts only; the applied migration is untouched. The dead `.code` removal is safe (only its own test read it).
- **Doug:** Pass with live proof. Gates green (typecheck 0, lint/format clean, 601/0 tests, wiki:lint 0) and
  the browser proof is real Chrome-DevTools evidence with measured assertions (Poppins `fontFamily`, 0
  `backdropFilter`, focal/recede counts, URL sync, mobile overlap before/after), not claims. 0 console errors.
- **Desi:** Pass. All HIGH + MEDIUM + LOW review items landed; the belt-graphic + de-glass + Poppins read as a
  clear step up from "AI slop." Honest residual: the brightest-belt glow could still be toned at full zoom.
- **Kaizen aggregate:** 8.5/10 — premium, repo-law-compliant, browser-proven brand polish; the layout/grouping
  gap is real but correctly scoped to the next session.

## ADR / ubiquitous-language check

- ADR update **required and made this session** — the operator decided at close to **retire the vendored
  family-chart engine for View A** in favour of a custom cohort-timeline layout (decision B). Recorded as
  **`ADR 0027`** (`docs/architecture/decisions/0027-lineage-view-a-custom-cohort-timeline.md`), which
  **supersedes `ADR 0026`** (family-chart LOCKED). The build is SESSION_0395; the decision is locked now.
  The presentational polish itself needed no ADR.
- Ubiquitous language update **not required** — no new domain terms (`bblHeadingFont`, `BeltSwatch` `bar`
  variant, `SOLID_PANEL` are impl names; `LineageVisualGroup`/cohort are existing terms).

## Reflections

- **The operator's eye caught the thing the gates can't.** Every static + browser gate was green and the brand
  polish was genuinely good — but a screenshot review surfaced the real UX problem (flat single-row layout vs
  promotion-date cohorts). Gates verify "is it correct/clean," not "is it the right shape." Worth surfacing
  visual proof to the operator *before* the close commit, not after — it changed the next session's whole lane.
- **family-chart keeps taxing every lineage session.** It's a genealogy engine on a promotion-lineage domain:
  no cohort concept, owns the card DOM as HTML strings (so cards can't be React and choreography can't tween),
  and has a recurring history of connector/zoom/dnd fights. The board view does cohorts fine without it. The
  friction is structural, not incidental — the next session should seriously weigh retiring it for View A.
- **"Adapt, don't blind-paste" generalizes to "verify the seam, not just the className."** Poppins looked like a
  one-line `font-family` change, but it was loaded only inside `bbl-landing.tsx`'s subtree — the explorer route
  had no access. The fix was a shared `lib/fonts.ts` + a route wrapper + relying on `family-chart.css`'s
  `font-family: inherit` to reach the engine cards. Confirming *where a token is actually in scope* beat assuming it.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0394 stamped `last_agent: claude-session-0394`; `PHASE3_USER_CARRY_PREFLIGHT.md` + `LANDING_MOTION_SPIKE.md` `updated: 2026-06-16`; no other doc frontmatter needed changes. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0394 row added; `custom-component-inventory.md` updated (BeltSwatch bar + explorer); `drift-register.md` D-DRIFT-0394-1 added; `LANDING_MOTION_SPIKE.md` pairs_with SESSION_0394 + motion-system. |
| Wiki lint | `bun run wiki:lint` PASS — 0 errors (1 date warning fixed during the run). |
| Kaizen reflection | Reflections section present (3 notes). |
| Hostile close review | SESSION_0394_REVIEW_01 + hostile close present; live browser proof captured. |
| Review & Recommend | Next session goal written (cohort-grouping prototype + family-chart go/no-go). |
| Memory sweep | Updated `lineage-tree-pivot-donatso` memory with the cinematic polish + the family-chart friction / cohort-grouping direction. |
| Next session unblock check | Unblocked — first task (confirm cohort seed data, build A/B prototype) is doable locally; no user input required to start. |
| Git hygiene | Branch `main`; FS-0024 guard run; single push — hash reported at bow-out / see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` run before the close commit: 12914 nodes, 24514 edges, 1752 communities, 2074 files tracked. |
