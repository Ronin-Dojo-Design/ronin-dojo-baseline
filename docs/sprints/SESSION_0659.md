---
title: "SESSION 0659 — auto-claude MMB pitch-deck outline (render-deck format) + meeting-prep brief (overnight auto lane, wave 5/6)"
slug: session-0659
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0659
sprint: S12
lane: mmb
goal_ids: ["G-019"]
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
  - docs/sprints/SESSION_0646.md
  - docs/sprints/SESSION_0645.md
  - docs/sprints/SESSION_0653.md
  - docs/sprints/SESSION_0650.md
  - docs/product/mammoth-build/PRD.md
  - docs/product/mammoth-build/BRAND_HEART_BEAT.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0659 — auto-claude MMB pitch-deck outline (render-deck format) + meeting-prep brief (overnight auto lane, wave 5/6)

> Staged by the SESSION_0635 orchestrator (waves 5+6 — operator-directed continuations of waves 3+4).
> Adopt at lane start: flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0659-mmb-meeting-pack`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude MMB pitch-deck outline (render-deck format) + meeting-prep brief.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0659_TASK_01 | done | Distilled the #276 pitch deck into a render-deck-format outline, enriched with the GBP gap (from #653's research) and the engagement-options slide pointing at #645's pricing one-pager by name. Validated parse-compatibility against the render-deck outline contract. |
| SESSION_0659_TASK_02 | done | Wrote the internal (Brian-only) meeting-prep brief: story arc, cost-per-customer value framing (citing the ~$2.50/lead baseline), the four engagement options by name, decision asks, objection prep, follow-up checklist. |

## What landed

**`docs/product/mammoth-build/pitch-deck-outline.md`** (new) — the #276 pitch deck
(`docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html`, on `origin/auto/session-0646-mmb-pitch-deck`)
re-authored as a render-deck outline source, per the format contract in
`origin/auto/session-0650-render-deck:scripts/render-deck/README.md` +
`fixtures/sample-outline.md`. Frontmatter: `brand: mmb`, title "Ronin Building Design × Mammoth
Build", DRAFT watermark in the subtitle. 13 `## ` slides + the implicit frontmatter title slide =
**14 slides total**. All 14 original sections are represented (starting point, opportunity,
site-refresh why/list, automation flow/why, SEO foundation/content, social pipeline/proof, the
process-flow statement slide, engagement options, next steps — the original's pure-SVG
infographic slide is collapsed to a one-line `>` big-statement slide since the outline format has
no SVG block type). **One new slide added**, not in the original deck: "Your customers can't find
you where 90% of them look" — the Google Business Profile gap, sourced from
`origin/auto/session-0653-rr-mmb-social:docs/architecture/research/research-review-mmb-social-automation.md`
(no GBP link on the live site; the ~90%-of-homeowners-use-Google and 93%-Local-Pack-trigger stats
are both direct citations from that review, nothing invented beyond them). The "Working together"
engagement-options slide now names the pricing one-pager by filename
(`docs/product/mammoth-build/engagement/pricing-options-onepager.md`, on
`origin/auto/session-0645-rr-mmb-pricing`) and lists its four option names in the meeting-prep
brief only — no dollar figure appears on any slide of the deck outline itself. Every slide carries
a `Notes:` speaker-prompt line.

**`docs/product/mammoth-build/meeting-prep-brief-draft.md`** (new) — internal, Brian-only, DRAFT
watermark. One-page agenda following the deck's story arc (site → automation → GBP/reviews →
social → options); value framing built on Michael's own ~$1,500-for-~600-leads (~$2.50/lead)
figure from `assets/Michaels_Notes_Meeting.md`, cross-cited against the same figure in the
SESSION_0653 research review, with an explicit caveat that it's a cost-per-lead number on a
low-intent purchased list, not a cost-per-customer ROI claim; the four engagement options named
(Fixed-Scope Build / Build + Growth Retainer / Time & Materials / Performance Hybrid) with a
pointer to the one-pager and zero restated ranges; four decision asks (option/lane, GBP access,
photo-pipeline buy-in, who posts — the last pulled straight from the research review's open fork
#2); four objection-prep entries built on scope-definition, change-control, and a "what's your
guy worth" framing for the DIY/cheap-freelancer pushback; a six-item post-meeting follow-up
checklist.

## Files touched

| File | Change |
| --- | --- |
| `docs/product/mammoth-build/pitch-deck-outline.md` | New — 14-slide render-deck outline distilled from the #276 deck + the GBP-gap finding. |
| `docs/product/mammoth-build/meeting-prep-brief-draft.md` | New — internal one-page meeting-prep brief for Brian. |
| `docs/sprints/SESSION_0659.md` | Adopted (staged → closed) and filled in with the full session record. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd && git branch --show-current` at session start | `/Users/brianscott/dev/ronin-0659`, `auto/session-0659-mmb-meeting-pack` — confirmed before any writes. |
| `git branch -r \| grep -E "0650-render-deck\|0646-mmb-pitch-deck\|0645-rr-mmb-pricing\|0653-rr-mmb-social"` | All four reference branches present on `origin` after `git fetch origin`. Exit `0`. |
| Standalone re-implementation of `render-deck`'s `core/parse.ts` (frontmatter + slide-splitter regex logic), run via plain `node` against `pitch-deck-outline.md` from a scratchpad script — no repo code executed, read-only validation | Frontmatter parsed cleanly (`title`, `brand: mmb`, `subtitle`, `author`, `date` all present, `brand` passes the `rdd\|bbl\|mmb` check); **14 total slides** (13 `## ` headings + implicit title); "The shape of it" correctly resolves to `layout: "statement"` (lone blockquote, nothing else in `blocks`); every slide has a parsed `Notes:` block. Exit `0`. |
| `grep -n '\$'` over both new files | Only two hits: the deck outline's inherited generic "$40 checkout" rhetorical example (unchanged from the source #276 deck, not an MMB engagement figure) and the brief's cited `~$1,500`/`~$2.50/lead` (explicitly sourced, per HARD RULES, to Michael's own notes + the SESSION_0653 research review). No pricing-one-pager range ($8k–10k, $500–2,500/mo, $100–200/hr) appears anywhere in either file. |
| `grep -nE` phone/email pattern over both new files | Zero matches — no phone numbers or email addresses introduced in either new file. |
| `git status --porcelain` before staging | Confirmed only the three intended paths were touched; nothing under the forbidden paths (existing `docs/product/mammoth-build/**` files, `engagement/**`, `assets/**`, `templates/`, ledgers, `apps/**`, `clients/**`, `scripts/**`) was modified. |

## Self-review

- **No restated prices:** verified by grep (above) — the deck outline carries zero MMB-engagement
  dollar figures; the brief cites only the ~$2.50/lead figure the task explicitly authorized,
  sourced and caveated, never presented as a quote.
- **No invented facts:** every claim in the GBP slide and the value-framing section traces to a
  specific source doc (the SESSION_0653 research review or Michael's own meeting notes); the
  deck's inherited content is a faithful distillation of the #276 HTML deck's slide text, not a
  rewrite of its substance.
- **PII check:** Michael Flores's name and Mammoth Metal Buildings are pre-existing canon (merged
  `PRD.md` / `Michaels_Notes_Meeting.md`); no phone number, email address, or other contact detail
  was introduced in either new file (grep-verified above).

## Proposed ledger edits

`docs/knowledge/wiki/goals-ledger.md` — **G-019 (Mammoth landing resurrection + flesh-out)**
Pointer line should gain a reference to the meeting pack as the client-meeting-ready follow-on to
the SESSION_0646 deck:

> Add to G-019's Pointer: `docs/product/mammoth-build/pitch-deck-outline.md` (render-deck-format
> source for the SESSION_0646 deck, SESSION_0659) + `docs/product/mammoth-build/meeting-prep-brief-draft.md`
> (internal Michael-meeting prep, SESSION_0659) — the meeting-ready pack assembled from the
> SESSION_0646/0645/0653 overnight wave outputs.

(Left as a proposal only — this session's WRITE ONLY scope excludes `docs/knowledge/wiki/**`.)

## Open decisions / blockers

- None blocking. Both deliverables are drafts by design (DRAFT watermark in both files) and carry
  no commitments — the brief is explicit that it prepares the meeting, it doesn't promise anything.
- This lane did not merge or depend on merging any of the wave-2/3/4 branches — all source reads
  were reference-only via `git show origin/<branch>:<path>`, per the PR-body note below.

## Residual for AM merge

- The outline in `pitch-deck-outline.md` cannot actually **render** to HTML/PDF until
  `scripts/render-deck` (PR #278, `auto/session-0650-render-deck`) merges — this session validated
  format-compatibility with a standalone re-implementation of the parser logic, not a live run of
  the real script.
- Operator dry-run still needed on the meeting-prep brief before the actual Michael meeting —
  particularly the value-framing caveat (cost-per-lead vs. cost-per-customer) and the objection-prep
  wording, which are drafted, not rehearsed.
- Once #278 merges: run `bun scripts/render-deck/index.ts docs/product/mammoth-build/pitch-deck-outline.md`
  to produce the actual shareable deck, then have the operator do a visual pass before it goes to
  Michael.

