---
title: "SESSION 0646 — auto-claude Ronin Building Design pitch deck for mammoth.build (overnight auto lane, wave 2)"
slug: session-0646
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0646
sprint: S12
lane: mmb
goal_ids: ["G-019"]
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
  - docs/product/mammoth-build/PRD.md
  - docs/product/mammoth-build/BRAND_HEART_BEAT.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0646 — auto-claude Ronin Building Design pitch deck for mammoth.build (overnight auto lane, wave 2)

> Staged by the SESSION_0635 overnight orchestrator (wave 2, operator-directed). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Dispatch payload = the lane prompt; its HARD
> RULES are binding. Branch: `auto/session-0646-mmb-pitch-deck`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude Ronin Building Design pitch deck for mammoth.build — one tightly-scoped item, zero open forks (all pinned in the lane prompt).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0646_TASK_01 | done | Built the Ronin Building Design × Mammoth Build starter pitch deck (14 slides, one self-contained HTML file), studied live mammoth.build + structurewebworks.com/contractors + the pinned YouTube short, committed, pushed, opened the PR. |

## What landed

One self-contained HTML pitch deck at
`docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html` — 14 slides, slide-per-viewport,
arrow-key + click (edge-zone + button) navigation, slide counter + progress bar, marked **DRAFT v0.1**
on the title slide. Zero external requests at view time: inline CSS, inline JS, system-font stack only
(no webfont downloads, no CDN, no analytics). Branded **Ronin Building Design** (footer: "Ronin
Building Design — a Ronin Dojo Design company" on every slide), framed on the title slide as the first
industry-niche variant of Ronin Dojo Design, with the family concept (Ronin Plumbing Design, Ronin
Landscape Design, …) named in a small caption.

**Palette/voice sourcing:** dark bg (`#0d0e10`)/surface(`#16181b`)/orange accent (`#ff6a1a` /
`#ff8338` hover / `#c24e12` deep) pulled directly from Mammoth's own
`docs/product/mammoth-build/files/mockup.html` CSS variables (their real hero mock, not invented) —
this *is* mammoth.build's own token set. Compositional voice (uppercase-tracking eyebrow labels,
display-font numbered step cards, bordered no-fill card grid, restrained single-accent CTA) borrowed
from `apps/rdd/app/page.tsx` + `globals.css` (read-only, RDD's own public marketing page). Display
font is `Bahnschrift, Arial Narrow, system-ui` — matches both RDD's token and Mammoth's own mockup, so
no font files needed to keep the file zero-request.

**Slide map (14):** 1 Title (DRAFT v0.1) · 2 Where mammoth.build stands today (observed-only,
two-column working/gaps) · 3 The opportunity (cost-per-lead economics framing, pinned) · 4–5 Site
refresh (positioning, then the concrete list) · 6–7 Automation (flow diagram, then why-it-matters,
referencing the CRM PRD without new promises) · 8–9 SEO (technical foundation, then content plan,
"results vary" framing) · 10–11 Social + marketing (photo pipeline, review engine — both framed as
options) · 12 the one infographic slide (pure inline SVG — numbered pill badges, hand-drawn line icons,
arrow connectors, a dashed "no response → re-owned automatically" loop-back, styled in the spirit of
the reference thumbnail) · 13 Engagement options (3 lanes, no prices, names "the Pricing options
one-pager") · 14 Next steps.

**Hard content rules honored:** no invented facts about Mammoth beyond `docs/product/mammoth-build/**`
+ the live fetch; no prices or dates anywhere; two explicit `.placeholder` chips mark where a real
average-project-value number belongs (slides 3 and 7) instead of inventing one; SEO/social slides carry
explicit "results vary, no guarantees" language.

## Reference-study observations (recorded per HARD RULES — observed-only, not invented)

**① Live mammoth.build** (fetched via headless browser, desktop + mobile 375×812 viewports):
- Title: "Mammoth Metal Buildings | Sales, Project Management, Installs"; meta description, OG tags,
  and viewport tag all present and reasonable.
- Astro-built (`_astro/*` chunks), WebP hero images, Cloudflare CDN + RUM beacon, Partytown for
  third-party script offloading — a genuinely lean technical foundation, not a bloated template.
- Real `tel:8888507564` and `mailto:contact@mammothmb.com` links wired in (both public on their own
  site already).
- One `<h1>`, schema.org JSON-LD present, mobile layout reflows cleanly.
- **Gaps observed:** 6 of 18 homepage `<img>` elements have no `alt` attribute (checked via
  `document.images`); title tag has no city/state (local-SEO relevance under-signaled given the
  project list is Colorado/Wyoming-heavy); no testimonials/reviews anywhere in the page text; on the
  375px mobile viewport the live-chat bubble visually overlaps the "See Recent Builds" secondary CTA
  button (screenshot-confirmed); the contact form reads as one-way, no visible sign of a tracked lead
  record after submit.
- Blog + "Planning Guides" pillar-guide content already shipping (read-time labels, tagged by topic) —
  called out as a positive and as the base to build on for slide 9.

**② structurewebworks.com + /industries/contractors** (operator-pointed comp, fetched via WebFetch):
- Homepage arc: Header → Hero → Services → Why Us → Social Proof → Industries → Process →
  Case Studies → CTA → Footer. No pricing displayed; "Start a project" / "Book a call" CTAs
  throughout instead. Heavy social proof (testimonials, live-metric dashboard mockups).
- Contractors page: names margin-erosion pain points (disputed final invoices, un-tracked "while
  you're here" extras, late-billed milestones), a "28 connected modules" framing, mobile-first crew
  tools, a stated 6-week implementation timeline, FAQ section. Borrowed the *structural* idea (problem
  → trade-specific modules → process timeline → FAQ → CTA) for how slides 4–11 are sequenced; did not
  copy any of their specific copy or numbers.

**③ YouTube short (youtube.com/shorts/3CLV51dpZKA) + thumbnail:**
- Page metadata: title "I Built Claude AI Agents to Run My Ads Autonomously #shorts #claude
  #automatedsystem #aiagent"; channel `@Structurewebworks` — same operator-pointed comp agency, so the
  short is their own content-marketing reel, not a third party. Could not watch the video itself
  (short-form video isn't fetchable); worked from page metadata + the maxres thumbnail only, per the
  HARD RULES instruction.
- Thumbnail style (`img.youtube.com/vi/3CLV51dpZKA/maxresdefault.jpg`): numbered pill-shaped stage
  badges ("3 · Creative", "6 · Campaign Launch", …), an orange 8-point sunburst icon as a recurring
  connector/processing node, pastel-blocked background zones per stage group, icon-over-caption node
  pairs, thin gray connector arrows. This is the direct style reference for slide 12 — reimplemented
  as an original 5-stage diagram (Lead → Site → CRM → Follow-up → Signed Build) in the deck's own
  dark+orange palette rather than copied.

## Files touched

| File | Change |
| --- | --- |
| `docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html` | New — the 14-slide self-contained pitch deck (created). |
| `docs/sprints/SESSION_0646.md` | Adopted (staged → closed) and filled in with the full session record. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd && git branch --show-current` at session start | `/Users/brianscott/dev/ronin-0646`, `auto/session-0646-mmb-pitch-deck` — confirmed before any writes. |
| Live headless-browser smoke (Claude_Browser MCP working in this environment; served the built file over `python3 -m http.server` on localhost — the deck itself remains a zero-request `file://` page, the local server was test-harness only, not a change to the artifact) | Slide 1 (title) and slide 14 (last) screenshot-verified — layout, footer, and counter render correctly. Slide 2 (two-column critique), slide 3 (economics + placeholder chip), slide 12 (SVG infographic), and slide 13 (3-card engagement grid) also screenshot-verified for layout integrity. |
| Keyboard nav | `Home`, `End`, `ArrowRight` ×10, `ArrowLeft` all confirmed — counter and progress bar update correctly (`01/14` → `14/14` → `13/14` → `12/14`), `prev`/`next` buttons correctly disable at the first/last slide. **Pass.** |
| Click nav | Right edge-zone click confirmed advancing the slide (`13/14` → `14/14` via `#edgeRight`). **Pass.** |
| Console errors | One console entry on load: `favicon.ico` 404 from the local test HTTP server (Python's `http.server` has no favicon; harmless, not a network dependency of the deck itself, and browsers don't request `favicon.ico` at all under `file://`). No other console errors. |
| Local test server + Playwright browser | Both torn down after the smoke test (`pkill -f "http.server 8931/8932"`, `browser_close`) — nothing left running. |
| Structural fix mid-session | First draft was written headless (no `<!DOCTYPE html>`/`<html>`/`<head>`/`<body>`) — an artifact-tool habit that doesn't apply here since this file is a plain repo asset opened directly via `file://`, not routed through the Artifact tool's auto-wrapper. Re-wrapped with a proper doctype/html/head/body and re-ran the full smoke test (title slide + last slide + counts of `<html>`/`</html>`) — renders byte-identical to the pre-fix screenshots. |
| Mobile viewport (390×844) | Slide-per-viewport degrades acceptably on a phone-sized window — single-column stacking kicks in via the `900px` breakpoint, content stays reachable via scroll (`overflow-y:auto` on `.slide`). Known minor gap: on very long slides (e.g. slide 2's two-column critique) the fixed bottom footer bar can overlap the last line or two of scrolled content on a short mobile viewport. Not fixed — this deck's primary target is a normal laptop/desktop presentation window, and the gap is cosmetic only (footer text stays legible via its gradient backing, nav buttons stay clickable). |

## Proposed ledger edits

`docs/knowledge/wiki/goals-ledger.md` — **G-019 (Mammoth landing resurrection + flesh-out)** Pointer
line should gain a reference to the new deck as a client-facing follow-up artifact:

> Add to G-019's Pointer: `docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html` — the Ronin
> Building Design starter pitch deck (DRAFT v0.1, SESSION_0646) proposing site-refresh, automation/CRM,
> and SEO/social improvements to the live mammoth.build presence. Not itself the landing flesh-out
> G-019 tracks, but the sibling client-facing artifact that motivates it.

(Left as a proposal only — this session did not touch `docs/knowledge/wiki/**` per its WRITE ONLY scope.)

## Open decisions / blockers

- None blocking. Two intentional `.placeholder` chips in the deck (slides 3 and 7) mark where a real
  average-project-value number belongs once the operator/Michael supplies one — by design, not an
  oversight.
- The "Pricing options one-pager" referenced on slide 13 is a parallel lane's deliverable; this session
  did not read or create it, per HARD RULES.

## Residual for AM merge

- Nothing code-side pending. Operator should open the deck (`open
  docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html` or via the PR's file view) for a
  visual pass before treating DRAFT v0.1 as final, and fill the two `.placeholder` chips once a real
  average-project-value figure is available.
- Ledger edit above is proposed only — needs a wiki-lint-aware session to land it in
  `goals-ledger.md` G-019.

