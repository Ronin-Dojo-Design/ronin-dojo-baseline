---
title: "SESSION 0669 — wave-9 Desi-style fillable Client-Invoice HTML prototype + deck-nav bug diagnosis (auto lane, wave 9/10 — final pair)"
slug: session-0669
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0669
sprint: S12
lane: rdd
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0669 — wave-9 Desi-style fillable Client-Invoice HTML prototype + deck-nav bug diagnosis (auto lane, wave 9/10 — final pair)

> Staged by the SESSION_0635 orchestrator (waves 9+10 — operator-directed, morning-deadline work).
> Adopt at lane start: flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0669-client-invoice-proto`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

wave-9 Desi-style fillable Client-Invoice HTML prototype + deck-nav bug diagnosis.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0669_TASK_A | done | Fillable Client-Invoice HTML prototype (Desi pass) — `scripts/prototypes/client-invoice/invoice.html` + `README.md` |
| SESSION_0669_TASK_B | done | Pitch-deck nav-button bug diagnosed (read-only) — root cause + minimal fix diff recorded below, not applied (deck frozen in PR #276) |

## What landed

**Task A — Client-Invoice prototype.** One self-contained `invoice.html` (no build step, `file://`
friendly): brand-variant dropdown (Ronin Dojo Design / Ronin Building Design, swaps
wordmark/tagline/footer contact line), editable header (Client / Date / Invoice # / Period),
line-items table (Description / Session-Ref / Hours / Rate / Amount) with add-line and per-row
remove buttons and live auto-totals, a rate-presets row (Standard $200/hr · Friends & Family
$100/hr · Custom, applies to all rows at once), three notes slots (Features built / Concepts &
automations discussed / Ideas delivered), a "Copy summary" button (plain-text clipboard copy for
pasting into an email composer, with an `execCommand` fallback for restrictive `file://`
contexts), a dashed-border "Prototype · Desi pass" badge, and `@media print` rules that hide every
control and lay the invoice out as a clean one-page document. Typographic system pulled straight
from the Mammoth pitch-deck + kickoff-checklist family: `Bahnschrift` display font, `#ff6a1a`
primary orange, eyebrow/kicker label pattern — applied to a light "paper" document sheet (not the
deck's full-dark canvas), since this has to print clean to PDF. All interactive controls are
native `<button>`/`<select>`/`<input>`/`<textarea>` elements with click handlers only — no
edge-pinned or hover-only hit zones (the Task-B lesson, applied preemptively).

**Task B — deck nav-button bug, READ-ONLY diagnosis.** Extracted the frozen deck
(`origin/auto/session-0646-mmb-pitch-deck:docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html`)
to a scratch file and load-tested it headlessly (Chromium via Playwright, `file://`, no server).
Keyboard nav, mouse clicks on the footer nav buttons, mouse clicks on the invisible edge-zone
strips, and even Playwright's synthetic touchscreen taps **all worked correctly** — the deck's JS
itself is not broken (see Verification for the full matrix). The DOM/script-placement/z-index
checks the task flagged as suspects (script `defer`, `getElementById` under `file://`, stacking
order at the edge zones) all came back clean too. That leaves the one mechanism no
Chromium-based headless test can reproduce and that fits every clue in the operator's report
(iPad, "buttons... don't work", edge zones flagged as suspects): **iPadOS Safari's system
edge-swipe back/forward gesture recognizer competing for the same screen real estate as the
deck's `.edge-zone` prev/next hit-targets.** Full root-cause writeup + minimal fix diff below in
**## Findings**. Real WebKit/iPadOS Safari was not available in this environment to confirm
directly (no `webkit` build installed alongside the local Chromium — only `chromium-*` and
`firefox-*` are present in `~/Library/Caches/ms-playwright`) — flagged as a limitation, not
asserted as certain.

## Files touched

| File | Change |
| --- | --- |
| `scripts/prototypes/client-invoice/invoice.html` | NEW — self-contained fillable invoice prototype (839 lines) |
| `scripts/prototypes/client-invoice/README.md` | NEW — usage + design-continuity + known-limits notes |
| `docs/sprints/SESSION_0669.md` | this file — adopted, closed |

## Verification

All verification run headlessly via Playwright/Chromium (`node ...cjs`, requiring the canonical
repo's already-installed `playwright` package **read-only** — `require('/Users/brianscott/dev/ronin-dojo-app/node_modules/playwright')`,
no writes to canonical, no `npm install` inside the worktree). Scripts and screenshots live in the
session scratchpad, not committed.

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `node deck-diag.cjs` (Task B — frozen deck, `file://`, no server) | exit 0. Load errors: `[]`. Keyboard `ArrowRight`/prev/next: counter advanced/retreated correctly (`01/14`→`02/14`→…). Mouse click on `#nextBtn`/`#prevBtn`: correct. Mouse click on `#edgeLeft`/`#edgeRight`: correct. `elementFromPoint` at 8 edge-zone coordinates (both edges, 4 heights each): all resolved to the `BUTTON.edge-zone` element, never the underlying `.slide` — z-index stacking is correct, not the bug. Playwright `page.tap()` + raw `touchscreen.tap()` including 2px-from-edge coordinates: **all advanced the deck correctly** in Chromium. Computed styles (`position`/`z-index`/`pointer-events`) on `.slide`, `.edge-zone`, `.chrome-footer`, `#nextBtn`: all as authored, no accidental override. `document.readyState === 'complete'`, all 4 nav-button ids resolved — no `file://` + inline-script-placement bug. |
| `node invoice-verify.cjs` (Task A — self-verification) | exit 0. Load errors: `[]`. Seeded 2 rows @ $200/hr; typed 3h/1.5h → row amounts `$600.00`/`$300.00`, total `$900.00` (all live, `input`-event-driven). `+ Add line item` → row count 2→3; typed 2h@$100 → total `$1,100.00`. Clicked "Friends & Family — $100/hr" preset → **all 3 rows'** rate fields overwritten to `100`, total recomputed to `$650.00`. Removed row 3 via its `×` button → row count 3→2, total `$450.00`. Typed `175` into the custom-rate field + pressed **Enter** (keyboard-only path) → both remaining rows' rates updated to `175` — confirms native `<button>`/keydown activation, no fragile hit-zone. Switched brand `<select>` to `rbd` → wordmark updated to "Ronin Building Design" live. Clicked "Copy summary" → toast showed "Summary copied" (clipboard write succeeded headlessly). `@media print` emulation: `.toolbar` computed `display: none`; `#addRowBtn` reported `isVisible() === false` with `boundingBox() === null` (its own `display` stays the browser default `inline-block` since CSS `display` is per-element, not inherited — the ancestor `.no-print`/`.add-row-wrap` `display:none` is what actually removes it from layout, confirmed via `isVisible`/`boundingBox`, not the button's own computed style). Full-viewport screenshot + print-preview screenshot captured and visually reviewed — clean one-page layout, all controls/watermark hidden in print. |
| Visual review | `invoice-viewport-top.png` (screen, top-of-page, non-sticky-artifact view) and `invoice-print-preview.png` (print-emulated) both eyeballed — typographic voice matches the pitch-deck/checklist family (Bahnschrift headings, `#ff6a1a` accent, eyebrow labels). One cosmetic residual noted: the native `<input type="date">` picker-icon/chrome still renders in the Chromium print preview next to the Date field — left for the operator's AM tweak pass (see Residual). |

## Proposed ledger edits

- **deck-fix note for the AM sweep** (route via the finding router at bow-out — this is a `D`
  (drift-register) or `FS` (failed-steps-log) candidate depending on how the operator wants it
  filed, since the deck shipped without accounting for the iPad edge-swipe-gesture conflict):
  the pitch deck's `.edge-zone` prev/next hit-targets (`docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html`,
  currently on PR #276's branch) sit flush against the literal left/right screen edge (`left:0`/`right:0`,
  `width:64px`), which is exactly the region iPadOS Safari reserves for its system
  edge-swipe back/forward gesture. Apply the diff in **## Findings** (inset both zones ~20-22px off
  the true bezel) before or as part of the #276 merge — do not re-diagnose from scratch, the
  headless-Chromium verification matrix above already rules out a JS/z-index bug.

## Open decisions / blockers

None blocking. One open question for the operator: whether the deck-fix diff should land as a
follow-up commit on PR #276's branch directly, or as a separate PR after #276 merges — left to the
AM sweep per the lane boundary (this lane may not touch the deck file).

## Residual for AM merge

- **Operator eyeball + tweak round after coffee** (expected, per the lane brief) — this is a Desi
  first pass, not a final: line-item column widths, whether "Total due" should split into
  Subtotal + Total (kept single-line intentionally, no tax/discount modeled), copy tone, and the
  exact Standard/Friends & Family dollar amounts are all easy one-line edits in `invoice.html`'s
  `<style>`/rate-chip `data-rate` attributes.
- Cosmetic: the native date-input's calendar-icon chrome still shows up in print in Chromium;
  swap `#fDate` to a plain `type="text"` field (with the same today-seeded value) if a completely
  chrome-free print is wanted — left as-is since it's a one-line, low-risk change to make live
  during the eyeball pass rather than guess the operator's preference now.
- Deck fix (Task B) is diagnosed and diff-ready but **not applied** — lane boundary forbids
  touching the deck file; apply at the #276 merge per the ledger note above.

## Findings

### Deck nav-button bug — root cause

**What was reported:** "the buttons to click through the pitch deck DON'T work right now,"
operator drives it from an iPad.

**What was tested (headless Chromium, `file://`, no server — see Verification table for the
full matrix):** keyboard arrows, mouse clicks on both the footer nav buttons and the edge-zone
strips, `elementFromPoint` stacking checks at 8 edge coordinates, computed
`position`/`z-index`/`pointer-events` on every relevant element, `document.readyState` +
`getElementById` sanity under `file://`, and Playwright's synthetic touch taps (including taps
2px from the true viewport edge). **Every one of these passed.** The deck's JavaScript, its
`click`-listener wiring, its z-index stacking (`.edge-zone{z-index:40}` correctly paints above
`.slide`'s implicit stacking-context level 0, confirmed empirically via `elementFromPoint`, not
just reasoned about), and its script placement (inline, end-of-`<body>`, no `defer`, not
dependent on `file://`-specific behavior) are **not the bug**.

**Root cause (best-supported hypothesis, not confirmed against real WebKit — see limitation
below):** the deck's `.edge-zone` prev/next hit-targets are deliberately full-height, 64px-wide,
**flush against the literal screen edge**:

```css
.edge-zone{position:fixed;top:0;bottom:60px;width:64px; ... }
.edge-zone.left{left:0;}
.edge-zone.right{right:0;}
```

iPadOS Safari reserves roughly the outermost ~20pt of the screen on both the left and right edges
for its own system gesture — an edge-originating pan that drives browser back/forward navigation
(the same gesture family as `UIScreenEdgePanGestureRecognizer`-driven interactions elsewhere in
iOS/iPadOS: Apple's own HIG explicitly warns against placing custom edge-swipe-triggered
interactions there for this reason). Because `left:0`/`right:0` puts the *entire* system gesture
margin inside the deck's own tap target, a real finger touching or swiping near the bezel on an
iPad can have that touch claimed by Safari's OS-level gesture recognizer before (or instead of)
it ever reaching the web content's `click` handler — intermittently or entirely defeating the
prev/next buttons specifically in the region most likely to be tapped, while the small 34px
circular nav buttons in the footer (not edge-adjacent) are comparatively more reliable. This
matches every clue in the report: it's iPad-specific (Chromium has no such gesture, which is
exactly why headless testing came back clean), it's about "buttons" broadly (the edge zones ARE
real `<button>` elements, just visually invisible, so a user describing them as "buttons that
don't work" is accurate), and the task brief itself flagged "edge-click zones" as a prime
suspect before this diagnosis started.

**Limitation:** this environment has Playwright/Chromium and Firefox builds only
(`~/Library/Caches/ms-playwright` — no `webkit-*` folder), so the actual WebKit edge-swipe
gesture-vs-touch-event interaction could not be reproduced and confirmed directly. This is
presented as the best-supported explanation given (a) everything code-level tests as correct,
(b) the mechanism is real, documented Apple/Safari behavior, and (c) it uniquely explains an
iPad-only, edge-zone-specific failure that no code change since the deck was authored would
otherwise account for — not as an empirically-reproduced certainty.

### Minimal fix (for the AM sweep to apply to PR #276's branch — NOT applied here, deck is frozen)

```diff
--- a/docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html
+++ b/docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html
@@
   .edge-zone{
-    position:fixed;top:0;bottom:60px;width:64px;
+    position:fixed;top:0;bottom:60px;width:56px;
     z-index:40;cursor:pointer;
     background:transparent;
     border:none;
     padding:0;
   }
-  .edge-zone.left{left:0;}
-  .edge-zone.right{right:0;}
+  .edge-zone.left{left:22px;}   /* clear of iPadOS Safari's ~20pt edge-swipe-back gesture margin */
+  .edge-zone.right{right:22px;} /* clear of iPadOS Safari's ~20pt edge-swipe-forward gesture margin */
```

Rationale: shifting the tap target ~22px in from the true bezel moves ordinary taps outside the
region iPadOS Safari treats as "edge" for its own gesture recognizer, while the target stays
plenty large (56px wide, near-full height) and the footer nav buttons + keyboard nav remain
unaffected. This is a CSS-only change — no JS restructuring needed, since the JS itself was
proven correct above. (Applying the same lesson pre-emptively is why Task A's prototype uses only
non-edge-pinned, standard-sized native controls — see What landed.)

