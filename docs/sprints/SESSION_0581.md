---
title: "SESSION 0581 — G-022 Lane A slice S1: graph zoom/fit easing, viewport-aware ZOOM_MIN, cooperative touch, dead-token fix, PNG demotion"
slug: session-0581
type: session--implement
status: in-progress
created: 2026-07-19
updated: 2026-07-19
last_agent: claude-session-0581
sprint: S12
lane: bbl
lane_seq:
vault_session:
goal_ids: [G-022]
tickets: []
next_session:
pairs_with:

  - docs/sprints/SESSION_0578.md
  - docs/sprints/SESSION_0582.md
  - docs/sprints/SESSION_0569.md
  - docs/sprints/SESSION_0546.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0581 — G-022 Lane A slice S1: graph zoom/fit easing, viewport-aware ZOOM_MIN, cooperative touch, dead-token fix, PNG demotion

## Date

2026-07-19

## Operator

Brian + claude-session-0581 (dispatched by Petey/SESSION_0582)

## Goal

LANE A of the G-022 fan-out ("Technique graph out of beta"), **slice S1 only** (this lane is
multi-session; S2–S4 and the beta→GA flip are explicitly out of scope for this dispatch). Land: C4
zoom/fit easing (never during drag), WL-P2-67 viewport-aware `ZOOM_MIN` for `fitToView`, D-4
cooperative touch gestures (page scrolls over the canvas on single-finger touch; two-finger
gesture pans/zooms), AUD2-3 mobile toolbar density (bundled with the ZOOM_MIN fix as one
decision), AUD2-8 dead-token background fix (`hsl(var(--border))` → `var(--color-border)`), and
AUD2-9 PNG-export demotion to a secondary affordance.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0578.md` (G-022 fan-out plan + Desi AUD2 hallmark
  audit + the paste-ready Lane A prompt this session executes verbatim). Also read
  `docs/epics/technique-graph-ga-fanout.md` (lane definitions/owned-file sets/disjointness proof),
  `docs/sprints/SESSION_0546.md` (Desi Wave 1/2/3 spec + forks F1–F5), `docs/sprints/SESSION_0569.md`
  (Wave 2 first batch — landed B1/C2/AUD-1..4 + the three PRE-EXISTING P2s routed as
  WL-P2-65/66/67), and the goals-ledger G-022 row (read-only — not edited directly; this session's
  ledger edits are proposed only, per dispatch).
- Carryover: SESSION_0569 named exactly this slice ("C4 + WL-P2-67 + D-4" as one batch, AUD2-3
  bundled by SESSION_0578's audit) as its Next-session recommendation; SESSION_0578 formalized the
  three-lane fan-out and reserved this lane's slice plan (S1–S4) verbatim in its prompt.

### Branch and worktree

- Branch: `session-0581-technique-ga-design`
- Worktree: `/Users/brianscott/dev/ronin-0581` (fresh; bootstrapped `bun install` 756 packages +
  `prisma generate`; `.env` copied from canonical)
- Status at bow-in: clean; `git log --oneline main..session-0581-technique-ga-design` empty before
  reset (branch existed but carried no unique commits) — reset to `origin/main` per dispatch step 1.
- Current HEAD at bow-in: `9f3f4696` (= `origin/main`, "Merge branch 'session-0582-mmb-import'")

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content (techniques) — UI/interaction polish only, no schema/content model change |
| Extension or replacement | Extension: existing `technique-graph.tsx` L1-composed component (Card/Button/Stack/Dialog/Tooltip); no new primitives |
| Why justified | S1 is interaction-quality work on an already-shipped component; reuses `motion/react` `useReducedMotion` idiom already in the file |
| Risk if bypassed | None identified — no new component, no new dependency |

Live docs checked during planning: not applicable (no Dirstarter template docs touched this slice).

### Graphify check

- Graph status: worktree reads 0 nodes by design (fresh worktree, per SESSION_0578/0569 precedent)
  — not a negative signal. Discovery used the canonical checkout + direct file reads instead
  (single-file slice; graphify not needed for a one-file interaction change).
- Queries used: none (direct `grep`/`Read` on `technique-graph.tsx` sufficed for a single owned file).
- Files selected: `apps/web/components/web/techniques/technique-graph.tsx`,
  `apps/web/app/(web)/techniques/graph/page.tsx` (read for the background-token non-goal check —
  no change needed there), `apps/web/app/styles.css` (token definitions).
- Verification note: `--color-border` confirmed as the live token (`app/styles.css:17,178`); no
  bare `--border` variable is ever defined — grepped and confirmed before editing.

### Grill outcome

Not applicable — this is a pinned execution dispatch from SESSION_0578's paste-ready Lane A
prompt; no open forks in S1's scope. AUD2-6 (multi-art identity) is explicitly named as blocking
S4, not S1, and was not designed against.

### Drift logged

None discovered beyond the three pre-existing P2s this slice exists to fix (WL-P2-65/66/67 — only
WL-P2-67 is in S1 scope; WL-P2-65/66 stay routed to S2 per the lane's own slice plan).

## Petey plan

### Goal

Land S1 exactly as scoped in the dispatch: C4 + WL-P2-67 + D-4 + AUD2-3 + AUD2-8 + AUD2-9, all in
`technique-graph.tsx`, with runtime proof for each claim, then commit locally and hold at the push
gate.

### Tasks

#### SESSION_0581_TASK_01 — WL-P2-67 viewport-aware `fitToView` + AUD2-3 toolbar density

- **Agent:** Cody
- **What:** Give `fitToView` its own zoom floor (bypasses the interactive `ZOOM_MIN` clamp) so it
  can always frame every node at narrow viewports; hide toolbar button text labels below `sm` so
  the five-button row doesn't crowd mobile width (one bundled decision, not two).
- **Done means:** live 375×812 probe shows every node's bounding box inside the viewport after Fit.
- **Depends on:** nothing

#### SESSION_0581_TASK_02 — C4 zoom/fit easing

- **Agent:** Cody
- **What:** Eased CSS transition on the node-layer transform for button/keyboard/wheel-driven
  zoom/pan changes; disabled during any active drag or pinch; instant under reduced motion.
- **Done means:** computed `transitionDuration` is non-zero after a Fit click under normal motion,
  `0s`/`none` under emulated reduced motion, and never applied mid-drag.
- **Depends on:** nothing

#### SESSION_0581_TASK_03 — D-4 cooperative touch gestures

- **Agent:** Cody
- **What:** Single-finger touch is left untouched (no capture/preventDefault, `touch-pan-y`) so the
  page scrolls over the canvas; a two-finger touch gesture pans/zooms the graph. AUD-4 ctrl/⌘
  wheel gate untouched.
- **Done means:** `touch-action` computed style is `pan-y` (not `none`); two-pointer synthetic
  touch sequence changes zoom/pan, one-pointer sequence does not.
- **Depends on:** nothing

#### SESSION_0581_TASK_04 — AUD2-8 dead-token fix

- **Agent:** Cody
- **What:** Replace `hsl(var(--border))` (references an undefined `--border` variable) with
  `var(--color-border)` (the live token, already a full `hsl(...)` value) in the canvas background.
- **Done means:** live computed `background-image` is `none` before the fix and a real
  `radial-gradient(...)` after, on the same element.
- **Depends on:** nothing

#### SESSION_0581_TASK_05 — AUD2-9 PNG export demotion

- **Agent:** Cody
- **What:** Flip the PNG export button from `variant="primary"` to `variant="secondary"` — the
  smallest honest change; no new component, no SVG export feature added.
- **Done means:** diff shows the one-line variant flip; PNG button matches the other four
  secondary toolbar buttons.
- **Depends on:** nothing

### Parallelism

All five tasks land in one file (`technique-graph.tsx`) as one reviewable diff — sequential by
construction, not parallelized across sub-agents.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0581_TASK_01–05 | Cody | single-file interaction-quality build; no sub-agent fan-out needed |

### Open decisions

None — S1 scope is fully pinned by the SESSION_0578 dispatch; AUD2-6 (multi-art) is explicitly
out of scope for S1.

### Risks

Sibling lanes 0579/0580 are LIVE in their own worktrees — mitigated by touching only
`technique-graph.tsx` (a Lane-A-exclusive file per the disjointness proof) and never touching
`prisma/*`, `server/techniques/*`, or `dashboard/*`.

### Scope guard

No beta-flip, no layout JSON edit, no server/prisma/router touch, no new dependency (no Lenis), no
multi-art design work (AUD2-6 blocks S4 only).

### Dirstarter implementation template

- **Docs read first:** SESSION_0578, SESSION_0569, SESSION_0546, wiring-ledger WL-P2-67
- **Baseline pattern to extend:** the existing `technique-graph.tsx` pan/zoom/wheel/keyboard
  handlers and the `prefersReducedMotion` idiom already used for the filter-pill motion
- **Custom delta:** viewport-bypass fit floor, eased CSS transition, two-pointer pinch tracking
- **No-bypass proof:** no new L1 primitive, no new dependency; extends the same component in place

## Cody pre-flight

### Pre-flight: technique-graph.tsx interaction fixes

#### 1. Existing component scan

- Found: `components/common/button.tsx` (variant/size system already in use), no separate
  toolbar/export sub-components exist under `components/web/techniques/*` — everything lives in
  the single `technique-graph.tsx` file (confirmed via `ls`).

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: not applicable — no new UI
  component created; existing `Button`/`Stack`/`Card` reused as-is.
- Closest L1 pattern: the file's own established `hidden sm:inline` idiom used elsewhere in the
  repo (`lineage-view-a-island.tsx:368`, `profile-enhancement-wizard.tsx:221`) for responsive
  label-hiding — reused verbatim rather than inventing a new responsive pattern.

#### 3. Composition decision

- Extending existing component: `TechniqueGraph` in place; no new component file.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0569, SESSION_0578)
- ADR read: none required (no schema/architecture decision)
- Runbook consulted: `docs/protocols/fan-out-session-recipe.md` (lane-continuation shape)

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo -p 3581`
- Working directory: `/Users/brianscott/dev/ronin-0581`
- Brand/host for testing: local, `http://localhost:3581/techniques/graph`

#### 6. FAILED_STEPS check

- Prior failures in this area: none specific to this file beyond the routed WL-P2-65/66/67 P2s.
- Mitigation acknowledged: class presence ≠ behavior — every reduced-motion/touch-action claim
  below is backed by a live computed-style probe, not a source-code read.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0581_TASK_01 | landed | `fitToView` bypasses the interactive `ZOOM_MIN` floor (uses `FIT_ZOOM_FLOOR = 0.05` + `ZOOM_MAX` only); toolbar button labels wrapped in `hidden sm:inline`, `aria-label` added to Reset/Fit/PNG. |
| SESSION_0581_TASK_02 | landed | Node-layer `transform` gets a `260ms cubic-bezier(0.16,1,0.3,1)` transition via CSS classes (`transition-transform duration-[260ms] ease-[...] motion-reduce:transition-none`) gated inline by a new `isInteracting` state (mouse-drag + pinch). Reduced motion handled at the CSS level, NOT `useReducedMotion()` — the hook probed stale-false under a live emulated reduce (see Reflections). |
| SESSION_0581_TASK_03 | landed | Canvas `touch-none` → `touch-pan-y`; pointer handlers gated by `pointerType`; single-touch untouched, two-touch pinch computed via `distanceBetween`/`midpointBetween`; `onPointerCancel` added. `handleWheel` untouched (AUD-4 conforms). |
| SESSION_0581_TASK_04 | landed | `hsl(var(--border))` → `var(--color-border)` in the canvas background-image. |
| SESSION_0581_TASK_05 | landed | PNG button `variant="primary"` → `variant="secondary"`. |

## What landed

- **C4 zoom/fit easing:** the node layer's `transform` transitions over 260ms
  `cubic-bezier(0.16,1,0.3,1)` on every button/keyboard/wheel-driven zoom or pan change, via CSS
  utility classes; `motion-reduce:transition-none` gives the reduced fallback at the CSS level;
  an `isInteracting` state (true only during an active mouse-drag pan or two-finger pinch)
  applies inline `transition: none` so easing NEVER fights a live drag. Runtime-proven (below).
- **WL-P2-67:** `fitToView` bypasses the interactive `ZOOM_MIN = 0.35` clamp (near-zero
  `FIT_ZOOM_FLOOR` guards degenerate bounds only; `ZOOM_MAX` still applies). At 375×812 the fit
  zoom lands at 0.160 and all 61 nodes sit inside the canvas viewport (probe: 0 outside).
  Manual zoom (wheel/buttons/pinch) keeps the 0.35 legibility floor unchanged.
- **D-4 cooperative touch:** canvas `touch-none` → `touch-pan-y`; single-finger touches are left
  entirely to the browser (page scrolls over the canvas — probed: scrollY moves, graph transform
  unchanged); a second finger engages the two-finger gesture (pinch zoom via distance ratio +
  midpoint pan), with `onPointerCancel` cleanup. The AUD-4 ctrl/⌘ `handleWheel` gate is
  byte-identical.
- **AUD2-3:** the five toolbar button text labels (`Out/In/Reset/Fit/PNG`) hide below `sm`
  (`hidden sm:inline` — existing repo idiom); every button carries an `aria-label` so accessible
  names survive the visual hiding. One decision bundled with the ZOOM_MIN fix, per the audit row.
- **AUD2-8:** dead token fixed — `hsl(var(--border))` (an undefined `--border` variable; the live
  token `--color-border` is already a full `hsl(...)` value) → `var(--color-border)`. The dot-grid
  background now actually paints (live computed-style before/after proof below).
- **AUD2-9:** PNG export button demoted `variant="primary"` → `variant="secondary"` — the page no
  longer presents export as its primary action. No new components, no new export format.

## Decisions resolved

- WL-P2-67 fix shape: "let `fitToView` bypass the clamp, user-zoom keeps the floor" (the ledger
  row's second option) — chosen over a globally viewport-scaled `ZOOM_MIN` because it's the
  smaller, more honest change and preserves the existing 0.35 legibility floor for every
  manually-driven zoom path.
- AUD2-9: interpreted "SVG stays primary" as the live graph rendering (SVG edges + HTML nodes)
  remaining the page's primary surface — not a request to add an SVG *export* feature. No new
  export format added.
- C4 reduced-motion mechanism: CSS `motion-reduce:transition-none` over `useReducedMotion()` —
  the live probe showed motion/react's hook returning stale `false` while
  `matchMedia("(prefers-reduced-motion: reduce)").matches` was `true` in the same page (the hook
  captures a module singleton at hydration via `useState`, no re-subscribe). CSS media queries
  are immune to that class of bug and are the same idiom the node buttons already use
  (`motion-reduce:transition-none`).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/techniques/technique-graph.tsx` | C4 eased zoom/pan transition, WL-P2-67 viewport-aware `fitToView` floor, D-4 cooperative two-finger touch, AUD2-3 responsive toolbar labels, AUD2-8 dead-token fix, AUD2-9 PNG button demotion. |
| `docs/sprints/SESSION_0581.md` | This session record (new). |
| `docs/sprints/_assets/SESSION_0581-graph-desktop-1280.png` | Runtime-probe screenshot: desktop graph after the slice. |
| `docs/sprints/_assets/SESSION_0581-graph-mobile-375-fit.png` | Runtime-probe screenshot: 375×812 post-Fit, all nodes framed (WL-P2-67 evidence). |
| `docs/sprints/_assets/SESSION_0581-graph-mobile-375-postpinch.png` | Runtime-probe screenshot: 375×812 after the two-finger pinch-out (D-4 evidence). |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run --filter '@ronin-dojo/web' typecheck` | PASS — route types generated, tsc exit 0. |
| `bunx oxlint .` (apps/web) | PASS — 0 errors, 37 warnings (all pre-existing; none in `technique-graph.tsx`). |
| `bunx oxfmt --check .` (apps/web, 1971 files) | PASS — "All matched files use the correct format." |
| `bun run test server/web/techniques server/web/curriculum` (focused) | PASS — 81 pass / 0 fail, 173 assertions, 9 files. |
| `bun run test` (full suite, best quiet-window run) | 1501 pass / 5 fail / 2 errors — ALL 5 fails are ~5s DB hook timeouts in out-of-scope suites (lineage-comp-seed, lineage queries ×2, claim-queries, stripe webhooks). Fail sets varied 47→27→69→5 across four runs while sibling lanes 0579/0580 ran suites against the one shared local DB — environment contention, not regression (this diff touches ONE client component, zero server/DB code; SESSION_0546 precedent: cannot claim all-green locally, CI is the authoritative gate). Focused in-scope suites 81/81 green every run. |
| `npx next build` (apps/web) | PASS — exit 0, all routes generated. |
| Runtime probes (isolated Playwright chromium, dev server `:3581`) | ALL PASS — table below. |

### Runtime proof table (computed values, not class presence)

| Claim | Probe | Before | After |
| --- | --- | --- | --- |
| AUD2-8 gradient was dead | same live element, inline `hsl(var(--border))` idiom vs shipped class | computed `background-image: none` (probe also confirmed `--border` is undefined; `--color-border` = `#262626`) | `radial-gradient(circle, rgb(38, 38, 38) 1px, rgba(0, 0, 0, 0) 1px)` |
| WL-P2-67 mobile fit | 375×812, click "Fit to view", AABB vs canvas rect | ledger: fit needed ≈0.17 < clamp 0.35 ⇒ 5 nodes clipped | fitted zoom **0.160486**; **61/61 nodes inside** (0 outside) |
| C4 eased zoom (normal motion) | Node-side sampling loop after "Zoom in" click | — | 4 distinct scale samples `0.4413 → 0.5298 → 0.5611 → 0.5613` (real tween); computed `transition: transform… 0.26s cubic-bezier(0.16, 1, 0.3, 1)` |
| C4 reduced motion | emulated `reduce`; same sampling loop + computed style | `matchMedia` reduce = true | computed `transition-property: none`; every post-click sample already at final `0.5613` (single-step, no tween) |
| C4 never during drag | mousedown on canvas background + move, read mid-drag | — | drag engaged (transform changed) with computed `transition: none / 0s`; `0.26s` restored on release |
| D-4 casual scroll not hijacked | CDP single-finger vertical swipe over canvas | — | computed `touch-action: pan-y`; page `scrollY 0 → 471`; graph transform **unchanged** |
| D-4 two-finger pinch | CDP two-point pinch-out on canvas | zoom 0.160486 | zoom **0.545652**; instrumented pointer events show both pointers hitting the canvas (`self`), no cancel |
| AUD2-3 toolbar density | 375×812 computed display of label spans | labels visible (crowded row) | all five label spans `display: none`, `aria-label` names intact, no horizontal page overflow |
| AUD2-9 demotion | live button class probe | `variant="primary"` (`bg-foreground`) | primary classes absent, secondary (`border-border`) present |

Screenshots (committed): `docs/sprints/_assets/SESSION_0581-graph-desktop-1280.png`,
`SESSION_0581-graph-mobile-375-fit.png`, `SESSION_0581-graph-mobile-375-postpinch.png`.

### AUD2-8 `hsl(var(--` survivor sweep (report-only — other files, not S1-owned)

| File | Pattern | Status |
| --- | --- | --- |
| `components/web/uploader/belt-preview.tsx:26` | `boxShadow: "0 0 0 2px hsl(var(--border))"` | DEAD (named in the AUD2-8 audit row itself) — uploader family, NOT Lane A-owned → reported, untouched. |
| `components/web/lineage/lineage-tree-canvas/index.tsx:169` | `bg-[radial-gradient(…hsl(var(--muted))…)]` | Same dead pattern (`--muted` undefined; token is `--color-muted`) — lineage surface, NOT owned → reported, untouched. |
| `lib/data-table.ts:22,24` | `hsl(var(--border))` box shadows | Same dead pattern — `lib/data-table.ts` is not in the S1 owned set (only `lib/utils.ts` is) → reported, untouched. |

## Proposed ledger edits (NOT applied — shared ledgers untouched per dispatch; Giddy sweep applies)

1. **wiring-ledger WL-P2-67 → RESOLVED (SESSION_0581).** Fix = the ledger row's own second option:
   `fitToView` bypasses the clamp (interactive `ZOOM_MIN` 0.35 kept for user zoom). Evidence: live
   375×812 probe — fitted zoom 0.160486, 61/61 nodes inside the canvas viewport, screenshot
   `SESSION_0581-graph-mobile-375-fit.png`.
2. **G-022 Lane A children:** mark S1 items DONE — C4 zoom/fit easing · WL-P2-67 · D-4 cooperative
   touch · AUD2-3 · AUD2-8 (graph page; 3 report-only survivors listed above for routing) ·
   AUD2-9. S2 (C5 · D3 incl. AUD2-7 · B2 · WL-P2-65 · WL-P2-66), S3 (E1 · B3 · C3 · G2/AUD2-12),
   S4 (multi-art layout · WL-P3-53/54 · AUD2-4 + flip) remain OPEN as ledgered continuations.
3. **New candidate ledger row (mint via `ledger-id-next`):** dead-token pattern
   `hsl(var(--X))` where only `--color-X` exists — 3 surviving instances outside Lane A ownership
   (table above); pattern-level sweep candidate.
4. **New candidate finding (drift/wiki):** `motion/react` `useReducedMotion()` returns a stale
   value under a runtime-flipped/emulated `prefers-reduced-motion` (module-singleton `useState`
   capture, no re-subscribe) — probed live this session. Existing consumers (e.g. the graph
   filter-pill `duration: prefersReducedMotion ? 0 : 0.125`, conforms-listed C2) carry the same
   latent behavior; CSS `motion-reduce:` variants are the robust idiom. Candidate input to
   WL-P2-66 (S2's reduced-motion cascade fix in `lib/utils.ts`).

## Open decisions / blockers

- S2 (C5 glow, D3 empty states incl. curriculum browser, B2 tooltips, WL-P2-65/66) and S3/S4 are
  NOT this session's scope — continuation lives under G-022 per the lane's own slice plan.
- Full-suite `bun run test` cannot be called green locally while sibling lanes 0579/0580 run
  their suites against the one shared local DB (hook-timeout cascades; focused in-scope suites
  81/81 green). CI remains the authoritative suite gate.
- Push gate held per dispatch — commit locally only.

## Next session

### Goal

Lane A slice S2: C5 selected-neighborhood glow, D3 empty states (graph + curriculum browser),
B2 difficulty tooltips, WL-P2-65 export label clip, WL-P2-66 reduced-motion cascade fix in
`lib/utils.ts` (shared-primitive change — run affected e2e).

### First task

Rebase is not required yet (Lanes B/C haven't merged); read `docs/epics/technique-graph-ga-fanout.md`
§S2 scope + the WL-P2-65/66 ledger rows before starting.

## Review log

### SESSION_0581_REVIEW_01 — Cody self-review (S1 slice)

- **Reviewed tasks:** SESSION_0581_TASK_01–05
- **Dirstarter docs check:** not applicable (no new component; existing L1 composition unchanged)
- **Verdict:** slice matches the dispatch scope exactly; every behavioral claim carries a
  computed-value or sampled-value probe; conforms-list surfaces (AUD-4 wheel gate, export
  snapshot machinery, C2 pill, D-5 roving tabindex, B1 tooltip contract) byte-untouched — the
  diff never enters those functions. One honest gap: full-suite tests are environment-blocked
  (contended shared DB), focused suites green. Desi+Doug review this same commit in the merge
  sweep before S2 starts.
- **Score:** n/a (self-review; formal scores land in the merge-sweep wave)
- **Follow-up:** proposed ledger edits section for the Giddy sweep; 4 findings routed there.

## Hostile close review

Deferred to the merge-sweep wave (Desi + Doug on this slice commit), per the S1 dispatch.

## ADR / ubiquitous-language check

- ADR update not required: no architectural decision; interaction-polish only.
- Ubiquitous language update not required: no new domain terms.

## Reflections

- **"Class presence ≠ behavior" caught a real bug in my own first implementation.** The first C4
  cut used `useReducedMotion()` for the inline transition; the computed-style probe under an
  emulated reduce showed the eased transition still live while `matchMedia` said reduce was on —
  the hook's hydration-time singleton capture had gone stale. Without the mandated
  computed-value probe, a source-read review would have passed it. The fix (CSS
  `motion-reduce:transition-none`) is provably immune.
- **Turbopack's persistent cache silently dropped newly-added arbitrary Tailwind utilities**
  (`duration-[260ms]`, `ease-[cubic-bezier(...)]`) across a dev-server restart — the classes were
  in the served HTML but absent from the CSS bundle until `.next` was deleted. Worth remembering
  for any probe that asserts on a just-added arbitrary class.
- **CDP synthetic touch needs realistic inter-event spacing.** A pinch dispatched with
  back-to-back `touchMove`s raced React's pointer bookkeeping and flaked; ~30ms pauses (closer to
  real finger cadence) made it deterministic. The instrumented-pointer-event probe distinguishes
  "product bug" from "probe artifact".
- **Shared-local-DB test contention is the dominant noise source in a three-lane fan-out.** Three
  full-suite runs produced three different fail sets (47/27/69), all ~5s DB hook timeouts outside
  this lane's scope; the focused in-scope suites were 81/81 green every time. The fan-out recipe
  could pin "full suite = CI-authoritative; local = focused suites" for parallel-lane sessions.

## Full close evidence

Deferred to the merge-sweep bow-out (this dispatch ends at local commit; Desi+Doug review the
slice in the merge sweep, per the S1 dispatch).
