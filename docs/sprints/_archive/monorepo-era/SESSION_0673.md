---
title: "SESSION 0673 — deck v2 — iPad fix + feature roster + cutover visual + family closing slide (stacks on #276) (auto lane, wave 11/12)"
slug: session-0673
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0673
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0673 — deck v2 — iPad fix + feature roster + cutover visual + family closing slide (stacks on #276) (auto lane, wave 11/12)

> Staged by the SESSION_0635 orchestrator (waves 11+12, operator-directed). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0673-mmb-deck-v2` (base: auto/session-0646-mmb-pitch-deck).

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

deck v2 — iPad fix + feature roster + cutover visual + family closing slide (stacks on #276).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0673_TASK_01 | done | Applied the SESSION_0669 iPad edge-swipe fix (inset `.edge-zone` 22px) + added two new always-visible 52px corner nav buttons (`#cornerPrev`/`#cornerNext`), keyboard nav untouched |
| SESSION_0673_TASK_02 | done | 3 feature-roster slides (built & shipping / automations in motion / the wow item) sourced from repo branches, honest Live/In review/Planned/Prototype tags |
| SESSION_0673_TASK_03 | done | Cutover-journey SVG slide (mammoth.build → mammothmb.com), 5 stages, zero-downtime bar visualization, sourced from `session-0633-brand-deploys`'s `CUTOVER_CHECKLIST.md` |
| SESSION_0673_TASK_04 | done | Final closing beat — 4-line emphasis replacing the old single-line close on the Next Steps slide |
| SESSION_0673_TASK_05 | done | DRAFT watermark bumped v0.1 → v0.2 (title + badge); slide count 14 → 18 |

## What landed

**Deck v0.2** — one file, all edits in place on `docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html`
(1113 lines, up from 727). Slide-by-slide:

1. **Slides 1–11 unchanged** (Title through Social + marketing — proof) — content untouched, only
   renumbered in HTML comments.
2. **iPad nav fix (applies to all slides).** Read the exact diagnosis from
   `origin/auto/session-0669-client-invoice-proto:docs/sprints/SESSION_0669.md` `## Findings`:
   iPadOS Safari's system edge-swipe back/forward gesture claims touches inside the `.edge-zone`
   prev/next strips because they sat flush at `left:0`/`right:0`. Applied the recorded minimal fix
   verbatim — `.edge-zone` width `64px → 56px`, `left:0/right:0 → left:22px/right:22px`. **Also**
   added two brand-new, always-visible, native `<button>` corner nav controls (`#cornerPrev` bottom-left,
   `#cornerNext` bottom-right, 52×52px, 26px inset from the bezel — clear of the same iPadOS gesture
   margin, never edge-pinned per the SESSION_0669 Task-A lesson) so prev/next no longer depends on an
   invisible hit zone at all. Keyboard nav (arrows/space/Home/End) untouched.
3. **Slides 12–14 (new) — feature roster.** Sourced only from the repo (`git show` on branches, no
   invention): `origin/session-0633-brand-deploys:docs/product/mammoth-build/GAP_MATRIX.md` for the
   CRM/CMS build status; `clients/mammoth-build-crm/prisma/schema.prisma` for the `Invoice`/`Quote`/
   `LineItem` model (client-billing automations); `origin/auto/session-0653-rr-mmb-social`'s research
   review for the social/SEO program; `e82bb804`/`docs/sprints/SESSION_0647.md` for the three.js
   configurator prototype.
   - Slide 12 "Built & shipping": Custom CRM (**Live** — `68f90459`/`dffb5dcc`/`13752fd3`/`7cb7a112`
     all merged to `main`) and Custom CMS & site (**In review** — landing port `2e04f7cd`, SEO
     foundation `2e3646ba`, OG images `1733787a`, all on open PRs, none merged to `main` yet).
   - Slide 13 "Automations in motion": a mini-flow (Inquiry capture **In review** → Follow-up
     sequences **Planned** → Review engine **Planned**) plus two cards — Client-billing automations
     (**Planned**; `Invoice`/`Quote`/`LineItem` schema exists with a `stripePaymentLink` field, no UI
     yet; QuickBooks explicitly flagged **Planned**, parallel lane `auto/session-0672-mmb-quickbooks-rr`
     researching) and Social + SEO automation program (**Planned**; wave-4 `/rr`, 6 open forks, nothing
     built).
   - Slide 14 "The wow item": the 3D building configurator, tagged **Prototype**, with an inline SVG
     line-art parametric building (dimension markers) + a decorative slider mockup echoing the real
     prototype's width/length/roof-pitch/eave-height/wall-color/orbit controls.
4. **Slide 15 (was 12) — Infographic.** Unchanged.
5. **Slide 16 (new) — Cutover journey.** Distilled from `session-0633-brand-deploys`'s
   `docs/product/mammoth-build/CUTOVER_CHECKLIST.md` (not on this branch's base — read via `git show`,
   never written). 5-stage inline SVG (Build → Review → DNS → Go-live → Aftercare) reusing the existing
   infographic's visual grammar (own `<marker id="arrow2">` to avoid an ID collision with slide 15's
   `#arrow`), plus a two-segment status bar showing `mammoth.build` live through DNS and
   `mammothmb.com` live from Go-live onward — the "zero-downtime, old site stays up until the switch"
   framing, plus the team-coverage line ("covered by the RDD team, end to end").
6. **Slide 17 (was 13) — Working together.** Unchanged.
7. **Slide 18 (was 14) — Next steps + close, upgraded.** Kept the 3 next-step items; replaced the old
   single-line close ("Built all the way through — for the business, not just the build.") with the
   operator-dictated 4-line closing beat, large type, escalating to an accent-colored final line:
   "Built by Ronin Building Design." / "Built for Mammoth." / "Built for family." / "**Built for
   success.**" Contact fine-print kept below it.

## Files touched

| File | Change |
| --- | --- |
| `docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html` | edited in place — v0.1 → v0.2: iPad nav fix + corner buttons, 4 new slides (14 → 18 total), closing beat upgrade, DRAFT watermark bump |
| `docs/sprints/SESSION_0673.md` | this file — adopted, closed |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` before every write | `/Users/brianscott/dev/ronin-0673` · `auto/session-0673-mmb-deck-v2` — exit 0 |
| Playwright/Chromium (`node deck-verify.cjs`, `file://`, requiring canonical's `node_modules/playwright` **read-only**, no writes/installs to canonical) | exit 0. `total slides: 18`. Corner-button click nav ×13 → counter `14/18`. Keyboard `ArrowRight` ×2 → `16/18`. Edge-zone click → `17/18`. `End` key → `18/18`, `cornerNext.disabled === true`. `Home` key → `01/18`, `cornerPrev.disabled === true`. `edgeLeft`/`edgeRight` geometry: `{left:22, width:56}` / `{right:22, width:56}` — matches the recorded fix exactly. `cornerPrev`/`cornerNext` geometry: `{left:26, width:52, height:52}` / `{right:26, width:52, height:52}` — ≥44px target, 26px clear of the bezel. `page errors: []` (no JS errors, no console errors). |
| `node deck-verify-mobile.cjs` (390×844 viewport) | exit 0. `scrollWidth === clientWidth` (390/390) on slides 1, 14, and 16 — no horizontal overflow introduced by the new slides. |
| Screenshots (first / feature-roster ×2 / 3D wow / cutover / last) | 6 PNGs captured to `/tmp/deck-slide-*.png` + 2 to `/tmp/deck-mobile-slide-*.png`, eyeballed — all render cleanly, status pills legible, SVGs correctly proportioned, corner buttons visible and not overlapping the footer brand/nav text at either viewport. Not committed (scratch verification artifacts only). |
| Structural checks (`grep`) | 18 `data-title` slides, no duplicate `id=` attributes, no duplicate SVG `<marker id>` (own `#arrow2` for the cutover slide vs. the infographic's `#arrow`/`#arrowMuted`). |

## Proposed ledger edits

> Proposed only — this lane's write boundary is the deck file + this session file; AM merge owner applies.

- **Deck v0.2 pointer**: `docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html` is now v0.2,
  18 slides, iPad-safe nav (corner buttons + inset edge zones). Supersedes the standalone iPad-fix
  diff recorded in SESSION_0669 (`## Proposed ledger edits`) — that diff is now **applied**, not just
  diagnosed; SESSION_0669's residual note "apply at the #276 merge" is satisfied by this stacked PR.
- **#284 outline now lags the deck**: whatever outline/agenda doc `#284` produced against the v0.1
  (14-slide) deck no longer matches slide numbering or content (4 new slides inserted mid-deck, one
  slide's close rewritten). AM should regenerate the outline from v0.2 or annotate the drift — not
  re-derived here (out of this lane's write boundary).

## Open decisions / blockers

- **Operator wording confirm** — the 4-line closing beat ("Built by Ronin Building Design." / "Built
  for Mammoth." / "Built for family." / "Built for success.") was rendered exactly as dictated in the
  lane prompt. Flagging per the lane's own instruction: **the operator should confirm this exact
  wording at review** before the deck goes in front of Michael — it's a strong, personal statement and
  worth a deliberate yes, not an assumed one.
- **Desi pass** — this is still a Fable-built deck; a design-eye pass (spacing, icon polish on the new
  SVGs, whether the corner nav buttons read as "on-brand enough") is expected before the client
  meeting, same as v0.1.
- Real WebKit/iPadOS Safari was still not available in this environment (Chromium + Firefox only, no
  `webkit-*` in `~/Library/Caches/ms-playwright`) — the fix is applied exactly as SESSION_0669
  diagnosed and recorded (a documented, real Safari/iPadOS behavior), and geometry now empirically
  clears the ~20pt gesture margin by 22–26px, but the very last mile (an actual iPad in hand) is still
  unconfirmed.

## Residual for AM merge

- **MERGE-AFTER #276.** This branch stacks on `auto/session-0646-mmb-pitch-deck` — its diff will
  contain #276's commit until #276 merges. Do not merge this PR first.
- Route the operator-wording-confirm + Desi-pass items above through the normal AM review, not this
  lane (write boundary: deck file + this session file only).
- Regenerate or annotate the `#284` deck outline against v0.2's new slide order/count (see Proposed
  ledger edits).

