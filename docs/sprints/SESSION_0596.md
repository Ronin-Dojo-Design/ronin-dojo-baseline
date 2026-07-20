---
title: "SESSION 0596 — DBS pipeline: Codex Daily Bug Scan → DBS ledger → State-of-Dojo component (fresh Codex session)"
slug: session-0596
type: session--implement
status: staged
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
sprint: S12
lane: repo
recipe: lane
goal_ids: [G-023]
tickets: []
pairs_with:
  - docs/knowledge/wiki/daily-bug-scan-ledger.md
  - docs/sprints/SESSION_0589.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0596 — DBS pipeline (fresh Codex session)

> **Pre-staged stub (ADR 0049), planned SESSION_0589.** Reservation branch
> `session-0596-dbs-pipeline`. **Run as a FRESH CODEX session** — the Codex Daily Bug Scan config is
> Codex-side and not editable from a Claude session (SESSION_0589 confirmed: no repo-side scan config,
> no crontab, only disk/docker launchd monitors). Codex authenticates from disk (`codex exec`) — see
> the `codex-handoff` memory / `docs/runbooks/.../autonomous-sessions.md`.

## Date

<fill at adopt>

## Operator

Brian + codex-session-0596

## Goal

Wire the **Codex Daily Bug Scan (DBS)** into the repo governance loop and the State-of-Dojo surface.

**Pipeline to build:**
1. **Locate + import this morning's scan output** (the ~2026-07-20 run) as `DBS-0NN` rows in
   [`daily-bug-scan-ledger.md`](../knowledge/wiki/daily-bug-scan-ledger.md) (seeded DBS-001,
   output-pending). If the scan opened branches/PRs, link them for review-merge (`/pr-fix-loop`).
2. **Define the scan→ledger write format** — the recurring Codex bug scan appends `DBS-0NN` rows
   (date · area/file · severity · finding · branch/PR ref) using the ledger's row law. The scan
   prompt/driver gets this append step.
3. **Schedule** — the recurring run (cron or a `com.ronin.*` launchd agent mirroring the existing
   disk/docker monitors; DBS session decides local-launchd vs Codex-Cloud-schedule).
4. **State-of-Dojo component hook** — after the scan writes DBS rows, the **DBS visual UI/UX
   component** (built in L4, `session-0593`) renders them: on the **local opening/closing artifact**
   AND on the **pushed `/app` admin dashboard landing (= the State of the Dojo page)**. This session
   defines the data contract the L4 component consumes; the component itself is L4's build.

**Depends on:** L2 (`session-0591`) wires the `DBS` code into ledger-backlog/deferral-guard/§6.7;
L4 (`session-0593`) builds the State-of-Dojo DBS component. This session is the **scan→ledger→data-
contract** middle.

**Non-goals:** building the L4 component UI (that's L4); the human capture ledgers (L2).

## First task

Adopt per ADR 0049; read the DBS ledger + the auto-session-codex drivers
(`scripts/auto-session-codex*.sh`) + the `codex-handoff` recipe. Locate this morning's scan output
first (operator points to it or search Codex Cloud / recent refs).

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0596_TASK_01 | pending | Locate + import ~2026-07-20 scan output → DBS rows (+ PR refs) |
| SESSION_0596_TASK_02 | pending | Define scan→DBS append format + schedule (cron/launchd) |
| SESSION_0596_TASK_03 | pending | Define the DBS data contract the L4 State-of-Dojo component consumes |

## Next session

### Goal

### First task
