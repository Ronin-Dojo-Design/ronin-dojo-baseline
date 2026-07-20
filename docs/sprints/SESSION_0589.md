---
title: "SESSION 0589 — planning session: widgets + link-ledgers + State-of-Dojo admin landing + taxonomy ADR"
slug: session-0589
type: session--plan
status: staged
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0587
sprint: S12
lane: repo
recipe: epic-plan
goal_ids: [G-023, G-024]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0587.md
  - docs/knowledge/wiki/planning-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0589 — planning session (PL-001..005 → executable fan-out)

> **Pre-staged stub (ADR 0049).** Created at SESSION_0587 bow-out. Reservation branch
> `session-0589-feature-widget-plan`. Operator holds the finalized bow-in prompt (0587 chat).
> Adopt, verify via FS-0030, run a full `/pp` Petey plan → AM_Plan_Session (no product code).

## Date

<fill at adopt>

## Operator

Brian + <agent>-session-0589

## Goal

Full `/pp` Petey plan session over the planning-ledger intake, producing ONE executable fan-out
plan (lanes + owned files + pinned forks + reservation branches + staged stubs) — **no product
code beyond ledger/stub scaffolding.** Grill the open forks in each PL row; do not pre-resolve.

Scope (read `docs/knowledge/wiki/planning-ledger.md` first):

- **PL-001 / G-024** — feature+feedback widgets for all sites (admins-only feature-widget on MMB +
  BBL admin surfaces → planning-ledger intake; phase 2 = changelog page for logged-in users). ONE
  platform module. Also wire the planning-ledger into `ledger-backlog.ts` + closing.md §6.7 router
  + `deferral-guard` prefixes (the deferred wiring).
- **PL-002** — link-intake ledgers: Reddit (`RLL`) + YouTube (`YLL`) + **ChatGPT (`GPTLL`)** →
  goals-ledger hydration; repo-side vs vault-side decision + the vault-consolidation / SOT-per-
  brand thread. **Concrete first input: review + queue the ChatGPT brainstorming work from the
  night of ~2026-07-19** (the first GPTLL intake).
- **PL-003** — State of the Dojo as the `/app` admin landing (AdminKanban embed + ritual render at
  bow-in / update at bow-out + per-brand/client publish + admin-landing composition). G-023
  SOT-dashboard slice-2 continuation. Consumes PL-005 (skin law) + the per-skin masthead name.
- **PL-004** — portfolio taxonomy **brand > platform > product** (five brands): grill to a
  ratified **ADR** (reconcile with ADR 0034 / 0040), then cascade the wording as conform work.
  **This is the load-bearing one** — dashboard tabs, vault names, and North Star language all
  depend on it.

## First task

Bow-in per ADR 0049; read planning-ledger PL-001..005 + goals-ledger G-023/G-024 + the 0584 recipe
cards (`PM_Planning_Lane.md` · `orchestrator.md` · `epic-plan.md`). Start the grill on PL-004
(taxonomy) since the others depend on the brand/platform/product definition.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0589_TASK_01 | pending | Grill PL-004 taxonomy → ratified ADR (brand>platform>product) |
| SESSION_0589_TASK_02 | pending | Plan PL-001/002/003 into an executable fan-out (lanes + stubs) |

## Next session

### Goal

### First task
