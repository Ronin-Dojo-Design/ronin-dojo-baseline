---
title: "SESSION 0712 — Phase C: trim-to-brand fan-out (five-repo era)"
slug: session-0712
type: session--staged
status: staged
created: 2026-07-26
updated: 2026-07-26
last_agent: claude-session-0711
sprint: S13
lane: repo
recipe: "epic-plan"
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0711.md
  - docs/sprints/plans/petey-plan-0711-brand-repo-separation.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0712 — Phase C: trim-to-brand fan-out

> **Staged by SESSION_0711** (the fork session — Phases A+B complete, five repos live at
> `ecefd008`). Adopt: flip `status:` → `in-progress`. Sprint S13 = the post-cleanup era marker
> (N1 call: monotonic numbers, era via `sprint:`).

## Goal

Execute **Phase C** of `docs/sprints/plans/petey-plan-0711-brand-repo-separation.md` (operator
go given at 0711 for the phase sequence; per-phase checkpoint still applies): per brand repo
(BBL · Baseline-Martial-Arts · Mammoth-Metal-Buildings · USA-Stickfighting — RDD-Monorepo
untouched): C1 delete other brands' apps/clients (ordinary commits) · C2 brand-doc trim ·
C3 CI matrix prune · C4 ~150-line CLAUDE.md router · C5 fresh SESSION era
(spine → `_archive/<era>/`, restart 0001) · C6 per-repo `docs/adr/` subset. Plus: per-repo
`settings.json` (bow-in-gates hook registration is gitignored — copy at bootstrap) and extend
the `main-pr-only` server ruleset to all four siblings. Then Phase D validation
(install/typecheck/build/preview/smoke per repo).

**Law reminder (ADR 0059):** session = one repo — Phase C lanes run as separate sessions or
sequential lanes in each repo's own checkout, NOT worktrees of one repo.

## First task

Open the fork plan Phase C section; start with **Black-Belt-Legacy** (this checkout — trim
baseline/rdd apps + mammoth client out of it). Riders: WL-P3-69 (a) ui-kit oxfmt pin+normalize
(ratified 0711 decision #9, fell through the wave) + (c) upstream repro · FS-0042 doc sweep
(`bunx fallow` in executed docs) · Desktop vault copy deletion (pending operator word) ·
PL-030 explorer epic queued behind the fork work.

## Next session

### Goal

### First task
