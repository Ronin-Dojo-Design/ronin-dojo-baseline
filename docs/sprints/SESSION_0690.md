---
title: "SESSION 0690 — RDD founder-LinkedIn content calendar (ready-to-run 4 weeks)"
slug: session-0690
type: session
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0690
sprint: S12
lane: docs
brand: rdd
recipe: "Docs_Lane"
posture: drafts-only
pairs_with:
  - docs/product/rdd/founder-linkedin-calendar.md
  - docs/architecture/research/rdd-founder-linkedin-content-calendar-draft.md
  - docs/architecture/research/research-review-rdd-social-automation.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0690 — RDD founder-LinkedIn content calendar

> Overnight-orchestrator lane. **DOCS-ONLY, drafts posture (Iggy).** Turn the #283/#280 founder-
> LinkedIn content-calendar draft into a ready-to-run 4-week (28-day) calendar for the RDD founder.
> **Drafts only — the AI never posts or schedules; the operator does.** No code, no shared-ledger edits.

## Goal

Make [`rdd-founder-linkedin-content-calendar-draft.md`](../architecture/research/rdd-founder-linkedin-content-calendar-draft.md)
*runnable*: a 28-day calendar with day/date-slots, content pillars, hooks, full draft posts, CTAs, and
asset-needed, plus a cadence recommendation and an operator "how to approve + schedule" checklist. Run
on the #280 recommended defaults (LinkedIn · founder profile · 3×/week · AI-drafts + human-approves ·
nothing auto-publishes); do **not** re-decide any open fork (F1–F6 stay open).

## What landed

- **New:** `docs/product/rdd/founder-linkedin-calendar.md` — the ready-to-run calendar:
  - **28-day at-a-glance grid** — Day 1 = operator-chosen Monday; posting days Tue/Wed/Thu; off-days
    marked "engage only"; columns for day/slot/date/pillar/post/hook/asset.
  - **12 full draft posts** carried from the #283/#280 draft (3/week × 4 weeks), each with day-slot,
    pillar tag, hook, full body, CTA, and asset-needed. P6 keeps the `[operator to fill]` founder-spine
    note; P9 keeps the RBD thesis-only framing (no niche-variant visual).
  - **Cadence recommendation** — 3×/week founder LinkedIn, mid-week mid-morning, consistency > volume,
    optional 1×/week page mirror, loop-the-spine after week 4.
  - **Five content pillars** table ([NOTE]/[POV]/[CRAFT]/[PROCESS]/[CASE]).
  - **Asset shot-list** — batch-produce the 8 real visuals; 3 posts are text-only.
  - **Operator approve + schedule checklist** — weekly ~10-min approval pass, the 5-box pre-publish
    hard-rule checklist, manual scheduling steps, hard-stop on auto-publish.
  - **Fork-dependent notes** — what changes under each of F1–F6 without deciding any of them.
- **New (this file):** `docs/sprints/SESSION_0690.md`.
- **No new content claims** — every post is the #283/#280 draft's, under the same brand-brief hard
  rules (no numbers/metrics/counts; BBL the only named proof; no invented founder specifics). This lane
  added scheduling, the grid, cadence, shot-list, and the operator checklist.

## Proposed ledger edits

*(Lane is forbidden from touching shared ledgers in-worktree — routing these to the merge owner /
operator as proposals only.)*

- **Backlog / content-ops note (no ledger owned by this lane):** the calendar is drafted but **cannot
  start** until the operator (a) ratifies forks **F1** (platform priority) and **F4** (AI-assist
  level) — both still `pending operator sign-off` in `research-review-rdd-social-automation.md`; and
  (b) anchors **Day 1 to a real Monday** so the `Date` column can be filled. Suggest a KanbanCard /
  ledger-backlog entry: "RDD founder LinkedIn calendar ready — awaiting operator F1/F4 sign-off + start-date
  anchor; then run the weekly approval pass."
- **Cross-doc consistency (informational):** this calendar and the #283/#280 draft both assume the
  #280 recommended defaults. When F1/F4 are ratified, the draft's fork-appendix and this calendar's
  "Fork-dependent notes" should be reconciled to the chosen options (one edit, at ratification time —
  not now).
- **No FS / WL / drift findings** surfaced this lane.

## Verification

- **Docs-only, no code gate.** No source/schema/test/lint gates apply (no code, no `apps/**`, no
  `packages/**`, no `clients/**` touched). No bootstrap needed.
- **Owned-paths check:** only `docs/product/rdd/founder-linkedin-calendar.md` and
  `docs/sprints/SESSION_0690.md` written. No shared ledger, no other lane's files, no code touched.
- **Hard-rules self-check:** no numbers/metrics/counts introduced; BBL is the only named client/proof;
  no invented founder years/rank/roles/outcomes (P6 left `[operator to fill]`); no auto-post/schedule
  action taken or implied — drafts only, operator schedules.
- **Identity:** worktree `/Users/brianscott/dev/ronin-0690`, branch
  `auto/session-0690-rdd-linkedin-calendar`; canonical untouched (read-only reference).
