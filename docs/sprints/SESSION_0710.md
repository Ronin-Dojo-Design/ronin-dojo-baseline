---
title: "SESSION 0710 — Parallel lane: BBL email DRY_RUN system + Taskforge vault checklists"
slug: session-0710
type: session--staged
status: staged
created: 2026-07-25
updated: 2026-07-25
last_agent: claude-session-0692
sprint: S12
lane: repo
recipe: "PM_Planning_Lane"
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0692.md
  - docs/sprints/SESSION_0709.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0710 — Parallel lane: BBL email DRY_RUN + Taskforge vault checklists

> **Staged by SESSION_0692 post-close (operator-directed), as a PARALLEL lane to SESSION_0709**
> (the 0703–0708 six-pack fan-out). Disjoint by design: 0709 owns the staged WL lanes; this lane
> owns the email dry-run posture + vault tooling. Run in its own worktree
> (`session-0710-<slug>` branch); parallel-lane worktree-isolation rules apply.

## Goal

Plan, then implement, two related slices:

### (a) BBL email DRY_RUN system

Build out the full dry-run posture on top of `EMAIL_DEV_DRYRUN` (landed SESSION_0692 —
`apps/web/lib/email.ts` non-prod gate, default ON; test-env exempt; `=0` opts into live sends):

- **Audit every send site** and its interplay with the existing `EMAIL_LIFECYCLE_DRYRUN` gate
  (FI-002 lifecycle-copy audit ties in here — lifecycle currently DRYRUN=0 in prod).
- **Decide the preview-env posture:** Vercel previews build with `NODE_ENV=production`, so the
  new gate does NOT cover them — decide whether previews should dry-run (likely yes; needs a
  `VERCEL_ENV`-aware isProd or a separate check) and implement the decision.
- **Ergonomics:** one documented flag story (dev · test · preview · prod), a wiki page, and the
  dev-login flow's send-suppression noted in the dev-environment runbook.

### (b) Taskforge — checklist projections for the Obsidian vaults

Tasks, goals, and ledgers as CHECKLIST items in the vaults (operator ask, SESSION_0692):

- **Sources:** `ledger-backlog.ts` (FS/D/WL/FI/GL/PL…), `board-backlog.ts` (KanbanCard order),
  SESSION task logs. **Targets:** MMB vault first (Michael-visible ops), then brand vaults.
- **Pattern:** reuse the proven Bases note-per-row projection (MMB LLL system) — projection-only,
  ledgers stay the source of truth; checkboxes render state (`- [ ]` / `- [x]`).
- **Forks to grill BEFORE building:** one-way projection vs checkbox write-back (does ticking a
  box in Obsidian flip the ledger row? recommend: v1 one-way, write-back as explicit v2);
  per-vault scoping (which ledgers belong in which brand vault); refresh trigger (bow-out gate
  runner step vs standalone `taskforge sync` script); collision with the existing Bases views.

## First task

Grill the Taskforge forks + the preview-env dry-run decision (operator sign-off on both), then
implement (a) and (b) v1 — one worktree, one PR, /ggr gate at close.

## Next session

### Goal

### First task
