---
title: "SESSION 0658 — auto-claude RDD founder-LinkedIn 4-week content calendar (continues #280) (overnight auto lane, wave 5/6)"
slug: session-0658
type: session--implement
status: in-progress
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0658
sprint: S12
lane: rdd
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0658 — auto-claude RDD founder-LinkedIn 4-week content calendar (continues #280) (overnight auto lane, wave 5/6)

> Staged by the SESSION_0635 orchestrator (waves 5+6 — operator-directed continuations of waves 3+4).
> Adopt at lane start: flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0658-rdd-content-calendar`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude RDD founder-LinkedIn 4-week content calendar (continues #280).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0658_TASK_01 | done | Read wave-4 `#280` (`research-review-rdd-social-automation.md`, via `git show origin/auto/session-0652-rr-rdd-social`) + `docs/product/rdd/brand-brief.md` (read-only) + the `d330a724` RDD launch commit (read-only, for accurate launch-post facts). Drafted `rdd-founder-linkedin-content-calendar-draft.md`: 12 fully-drafted LinkedIn founder posts across 4 weeks (3/week), covering all five requested pillars (building-in-open, BBL proof, niche-variant thesis, craft/process, launch), each with hook + 150–250-word body + CTA + `[VISUAL]` note, a posting-workflow section matching #280 F4's draft→approve→schedule default, and a fork-dependent appendix mapping F1/F2/F3/F4/F5/F6 to which entries change. |

## What landed

- New file: `docs/architecture/research/rdd-founder-linkedin-content-calendar-draft.md` — the 4-week
  founder-LinkedIn content calendar draft (DRAFT watermark, frontmatter `status: draft`).
- This file: session record adopted (`status: staged → in-progress`), task log + close-out filled in.

## Files touched

| File | Change |
| --- | --- |
| `docs/architecture/research/rdd-founder-linkedin-content-calendar-draft.md` | New — 12-post 4-week LinkedIn founder content calendar draft |
| `docs/sprints/SESSION_0658.md` | Adopted (status/last_agent) + closed out |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` | `/Users/brianscott/dev/ronin-0658` — confirmed before every write |
| `git branch --show-current` | `auto/session-0658-rdd-content-calendar` — confirmed before every write |
| `grep -n '[0-9]' rdd-founder-linkedin-content-calendar-draft.md` | exit 0; manually reviewed every hit — all are frontmatter/dates/session-IDs/fork-IDs/post-numbers/week-counts/meta-cadence ("2–3 posts/week"), **zero digits inside any of the 12 post bodies** |
| Self-review: zero invented facts | Pass — every claim traces to `[CONFIRMED live]` brand-brief facts (BBL paid tiers live, kernel→brand→app model, design-system doctrine tokens/card-law, "what would Apple do" mantra) or the just-shipped RDD launch commit (`d330a724`, read via `git show`, not written to); Post 6 explicitly declines to invent founder-spine specifics (years/rank) still marked `[operator to fill]` in brand-brief §4 |
| Self-review: zero numbers/metrics/client counts | Pass — see grep above; no dollar figures, percentages, headcounts, or brand/client counts in any post body |
| Self-review: no client names beyond BBL | Pass — grepped manually; only "BBL" / "Black Belt Legacy" named; "Ronin Building Design" appears only as a future thesis name (Post 9), never as a live client/account, per F5(a) |
| Self-review: voice check | Pass — first-person founder register throughout, no agency-slop ("synergy", "leverage", "game-changer"), spare declarative sentences, matches brand-brief §4 founder-tag register |

## Proposed ledger edits

- **Pointer proposal only — not applied this lane** (forbidden to touch ledgers directly per this
  lane's write-scope). Propose a row on the future RDD-social goals/tracking surface (wherever the
  operator lands one — `docs/knowledge/wiki/index.md` backlinks or a goals ledger) pointing at:
  `docs/architecture/research/rdd-founder-linkedin-content-calendar-draft.md` — "4-week founder-
  LinkedIn content calendar draft, executes #280's recommended default, 12 posts fully drafted,
  pending Brian's voice pass + F1–F6 ratification." Also propose linking it from
  `research-review-rdd-social-automation.md`'s `pairs_with` once that doc is out of its open PR and
  editable again (currently frozen — this lane could not touch it).

## Open decisions / blockers

- **#280's own forks (F1–F6) remain open** — this calendar assumes the recommended defaults
  (F1(a) LinkedIn-founder-first, F4(a) AI-drafts+human-approves) and documents what changes under
  each alternative in the deliverable's fork-dependent appendix. No fork was decided by this lane.
- `docs/product/rdd/**` is frozen by an open PR — this draft necessarily lives in
  `docs/architecture/research/` instead of a more natural `docs/product/rdd/` home; flagged in the
  PR body for relocation once that freeze lifts.
- Deliverable depends on nothing merge-blocking; it's a standalone read for the operator.

## Residual for AM merge

- **Operator voice pass is required before anything posts** — every one of the 12 drafts is a
  starting point for Brian's edit pass (per the workflow note's ~10-minute weekly review), not
  copy-paste-ready. Post 6 in particular needs brand-brief §4 founder specifics filled in (or an
  explicit decision to post it as-is, which the draft itself allows).
- Once `docs/product/rdd/**` unfreezes, consider relocating this file there and updating the
  `pairs_with` links both directions (this doc ↔ `research-review-rdd-social-automation.md` ↔
  `brand-brief.md`).

