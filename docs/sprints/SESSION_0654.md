---
title: "SESSION 0654 — Fable /rr — BBL social-media automation setup (lineage/technique content flywheel) (overnight auto lane, wave 4 — final)"
slug: session-0654
type: session--plan
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0654
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0654 — Fable /rr — BBL social-media automation setup (lineage/technique content flywheel) (overnight auto lane, wave 4 — final)

> Staged by the SESSION_0635 overnight orchestrator (wave 4 — the operator-pinned FINAL wave: 3×
> Fable /rr, social-media automation, structurewebworks-style service framing). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0654-rr-bbl-social`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

Fable /rr — BBL social-media automation setup (lineage/technique content flywheel) — research-recommend ONLY; operator forks presented OPEN.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0654_TASK_01 | done | /rr research-review + flywheel draft — BBL social-media automation (event→content flywheel), all operator forks left OPEN |

## What landed

- **`docs/architecture/research/research-review-bbl-social-automation.md`** (new) — evidence base
  (cadence norms ≥2 sources per fact; signup drivers; 4 comparables: Strava, Spotify Wrapped,
  chess.com, BJJ Fanatics; graphics-tooling cost compare Bannerbear $49 / Placid $19 / Canva
  Enterprise-gated / in-house `@vercel/og`; scheduling compare Buffer / Ayrshare / direct Meta
  Graph API; consent/publicity evidence) + argued recommendation + **6 OPEN forks** (F1 platform
  priority, F2 consent/publicity gating model, F3 auto-post vs approval-queue, F4 graphics
  tooling build-vs-buy, F5 technique-clip rights, F6 account ownership/ops).
- **`docs/product/black-belt-legacy/social-content-flywheel-draft.md`** (new, DRAFT watermark) —
  proposed event→content map (E1 claim verified · E2 RankEntry promotion · E3 technique preview ·
  E4 graph milestone · E5 blog post · E6/E7 member-triggered share cards), approval-queue-first
  pipeline seams (detect → gate → render → queue → ship → measure, conceptual only), 4-week
  starter cadence grid with placeholder slots, success measures keyed to the claim loop.
- Recommended default (operator may override): **approval-queue-first, IG-led, aggregate-stats +
  member-self-share content classes first, in-house OG-style renderer biased over vendor graphics,
  Buffer-class scheduling; nothing auto-posts at v1; Reddit/X human-only.**
- No existing BBL product doc touched; no code; no wiki/ledger writes (proposals below).

## Sources

Full cited list in the research-review's Sources section: cadence (Buffer, Hootsuite,
Socialinsider, Teleprompter, Meteorra, Gymdesk, Zen Planner), Reddit norms (Redship, Conbersa),
comparables (Contrary/NoGood on Strava, NoGood/Statista/ADMA on Wrapped, chess.com case studies,
DS Weekly on BJJ Fanatics), tooling (Bannerbear/Placid/Canva/Buffer/Ayrshare pricing pages, Meta
developer docs, Later), consent (GDPRWise, GymMaster, Gym Lawyers, ASAE), live
blackbeltlegacy.com fetch (2026-07-24).

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `git status --short` (only the 3 owned files) | 0 |
| Docs-only lane — no build/test gates applicable | n/a |

## Files touched

| File | Change |
| --- | --- |
| docs/architecture/research/research-review-bbl-social-automation.md | new — /rr evidence + recommendation + open forks |
| docs/product/black-belt-legacy/social-content-flywheel-draft.md | new — DRAFT event→content map + approval-queue rollout + 4-week cadence |
| docs/sprints/SESSION_0654.md | adopt + close |

## Proposed ledger edits

> Proposals only — this lane owns no ledger files. AM merge owner applies or discards.

- **goals-ledger**: add row **"BBL social flywheel program"** — stand up the approval-queue
  social pipeline from `social-content-flywheel-draft.md` once forks F1–F6 are decided; source =
  SESSION_0654 research-review. Cross-pointers: **G-022** (technique-graph GA — E3 technique
  previews are its distribution surface; graph is PUBLIC which feeds E4 milestone cards) and
  **G-024** (adjacent growth/content goal — the flywheel is the social distribution arm of the
  same claim-loop funnel).
- **wiki index / planning**: after operator sign-off, link the research-review from the BBL hub
  the same way the sibling `/rr` reviews are linked.

## Open decisions / blockers

- Forks F1–F6 (see research-review §5) — **F2 (consent/publicity gating model) blocks all
  person-centric automation** and likely wants a small product change (Passport publicity toggle).
- F5 (technique-clip rights) blocks recutting the free preview reels for TikTok/Shorts.

## Residual for AM merge

- Review + merge this PR (docs-only; no deploy impact — `ignoreCommand` skips prod build).
- Decide/schedule the fork-resolution grill (a /pp lane over F1–F6) before any build lane.
- If goals-row accepted, mint the goal id and back-link it into both new docs' frontmatter.

