---
title: "SESSION 0595 — PLAN: vault consolidation + SOT-per-brand vaults as repos"
slug: session-0595
type: session--plan
status: staged
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
sprint: S12
lane: repo
recipe: epic-plan
goal_ids: [G-023]
tickets: []
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/architecture/decisions/0048-two-repo-vault-kit-and-client-ops-projections.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0595 — PLAN: vault consolidation

> **Pre-staged plan-me stub (ADR 0049), planned SESSION_0589.** Reservation branch
> `session-0595-vault-consolidation-plan`. A **`/pp` PLAN session** (no build) for PL-008 under
> G-023. Adopt: FS-0030, ff to main, flip status.

## Date

<fill at adopt>

## Operator

Brian + <agent>-session-0595

## Goal

`/pp` Petey plan → fan-out for the **vault consolidation** (PL-008): the vault merge/separate, where
**each brand's SOT Vault is its own repo** with its own **docs-navigator + graphify-output HTML**, and
**RDD_Master_Vault = this repo** (`ronin-dojo-baseline`).

**Inherited pinned inputs:**
- **ADR 0051** → the vault unit = **brand** (7 brands); brand-prefixed vault names ratified in
  principle (G-023 constellation; only MMB exists).
- **ADR 0048** → two-repo vault-kit + repo-is-SoT (agents in worktrees/cloud lack vault access).

**Open forks to grill (from PL-008 — NOT pre-resolved):**
- Repo-per-brand-vault topology vs sub-folders within one vault.
- How per-brand **docs-navigator** (`docs:nav`) + **graphify HTML** are generated + hosted per brand.
- Vault→repo **promotion mechanics** for the QuickCapture per-source inboxes (PL-002 vault side:
  reddit/youtube/gpt → RLL/YLL/GPTLL rows).
- The "**vault dashboard that looks/feels like the site**" surface — overlaps PL-007 (GLL cards) +
  PL-003/L4 (State-of-Dojo). Coordinate.
- FS-0033 rename hazards (obsidian.json registry + separate-git-dir pointer + iCloud mid-sync).

## First task

Adopt per ADR 0049; read PL-008 + ADR 0048 + the G-023 "Vault constellation" block + the
`obsidian-vault-constellation` memory before grilling. Confirm current vault registries (FS-0033)
before proposing any rename/move.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0595_TASK_01 | pending | Grill PL-008 forks → fan-out (topology · tooling · promotion · dashboard-mirror) |

## Next session

### Goal

### First task
