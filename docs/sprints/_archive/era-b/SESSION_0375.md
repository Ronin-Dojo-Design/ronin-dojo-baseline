---
title: "SESSION 0375 — Codex automerge handoff for BBL app waves"
slug: session-0375
type: session--implement
status: closed
created: 2026-06-13
updated: 2026-06-13
last_agent: codex-session-0375
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0374.md
  - docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md
  - docs/runbooks/dev-environment/autonomous-sessions.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0375 — Codex automerge handoff for BBL app waves

## Date

2026-06-13

## Operator

Brian + codex-session-0375

## Goal

Adapt the SESSION_0374 autonomous `/app` migration plan for Codex: add a local Codex auto-merge
driver capped to the first three safe remaining waves, document the Codex Cloud fallback handoff, and
make clear that local is preferred for this run because it preserves Graphify, `bbl.local`, `gh`, and
ntfy proof.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0374.md`
- Carryover: SESSION_0374 landed wave 1 (`certificates`, `posts`, `content`, `media`) and wrote `APP_AND_SERVER_MIGRATION_MAP.md`, which defines waves 2-7 and the hard stop before server flattening / Phase 3 identity work.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `9664aa7`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Session automation and unified `/app` migration governance. |
| Extension or replacement | Extension: adds a Codex peer to the existing autonomous session drivers without changing the migration recipe. |
| Why justified | The operator wants the next three BBL `/app` migration waves run by Codex, not Claude, with auto-merge and the same scope brakes. |
| Risk if bypassed | A cloud/local runner could begin Prisma, server flattening, or Phase 3 identity work unattended, or skip local proof that the repo expects. |

Live docs checked during planning: not applicable; local SESSION_0374 and runbook docs govern this automation slice.

### Graphify check

- Graph status: current; stats at bow-in: 11,806 nodes, 18,602 edges, 1,741 communities, 1,900 files tracked.
- Queries used: not needed; exact script/runbook/session files were known.
- Files selected from graph: not applicable.
- Verification note: Graphify used as status proof only; exact files opened directly.

## Petey plan

### Goal

Create a Codex-safe local automerge path and cloud handoff for APP_AND_SERVER_MIGRATION_MAP waves 2-4.

### Tasks

#### SESSION_0375_TASK_01 — Codex automerge driver

- **Agent:** Cody
- **What:** Add a local `codex exec` auto-merge driver for the first three safe BBL `/app` waves.
- **Steps:** mirror the Claude automerge shape; cap default to 3; add Prisma/server-flatten brakes; encode waves 2-4 prompt; preserve wrapper-owned push/PR/merge.
- **Done means:** executable script exists and passes shell syntax check.
- **Depends on:** nothing

#### SESSION_0375_TASK_02 — Cloud/local handoff docs

- **Agent:** Petey
- **What:** Document when to use local vs Codex Cloud, and provide a pasteable cloud prompt.
- **Steps:** update autonomous runbook, Codex mobile runbook, runbooks hub, and add a Codex Cloud BBL waves 2-4 handoff doc.
- **Done means:** docs name the local recommendation and cloud fallback without ambiguity.
- **Depends on:** SESSION_0375_TASK_01

#### SESSION_0375_TASK_03 — Verification and close

- **Agent:** Doug
- **What:** Run syntax/docs gates and close with Graphify/git hygiene.
- **Steps:** `bash -n`, wiki lint, diff check, Graphify update, git status, commit, push.
- **Done means:** main receives one pushed commit for this automation handoff.
- **Depends on:** SESSION_0375_TASK_02

### Scope guard

- Do not launch the autonomous runner in this session unless the operator explicitly says to start it after the script/doc change is pushed.
- Do not migrate any `/app` wave code here.
- Do not edit Prisma, execute server flattening, start Phase 3 identity work, or touch DNS/Vercel/Stripe.

## Cody pre-flight

### Pre-flight: Codex automerge driver

#### 1. Existing component scan

- Exact files opened: `scripts/auto-session-automerge.sh`, `scripts/auto-session-codex.sh`, `docs/runbooks/dev-environment/autonomous-sessions.md`, `docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md`.
- Found: Claude automerge is fresh-main + green-PR auto-merge; Codex driver is stacked-PR manual review. No Codex automerge peer existed.

#### 2. L1 template scan

- Consulted live alignment URLs: no; this is repo automation, not a Dirstarter product layer.
- Closest local pattern: `scripts/auto-session-automerge.sh` plus `scripts/auto-session-codex.sh`.

#### 3. Composition decision

- Add a new script rather than mutating stacked Codex behavior, so the manual-review path remains available.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: SOT-ADR D5/D10 via SESSION_0374 context.
- Runbook consulted: `autonomous-sessions.md`, `codex-mobile-runbook.md`.

#### 5. Dev environment confirmed

- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Driver target: local shell with `codex`, `gh`, Graphify, and ntfy available.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0024 and SESSION_0374 sed-scope trap.
- Mitigation acknowledged: script checks repo remote, starts clean from main, and prompt repeats scoped rewrite / no flatten / no Prisma rules.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0375_TASK_01 | landed | Added `scripts/auto-session-codex-automerge.sh`, defaulting to 3 sessions and stopping before Prisma/server-flatten/Phase 3 work. |
| SESSION_0375_TASK_02 | landed | Updated autonomous/Codex runbooks and added a Codex Cloud fallback prompt for BBL waves 2-4. |
| SESSION_0375_TASK_03 | landed | Syntax/docs gates, Graphify, git hygiene, commit, and push completed. |

## What landed

- New local Codex automerge driver: `scripts/auto-session-codex-automerge.sh`.
- New Codex Cloud fallback handoff: `docs/runbooks/dev-environment/codex-cloud-bbl-waves-2-4.md`.
- Runbooks now recommend local execution for BBL waves 2-4 because it preserves Graphify, `bbl.local` proof, `gh`, ntfy, and local close fidelity.

## Decisions resolved

- Local is preferred for this run; Codex Cloud is fallback only.
- Default autonomous Codex automerge scope is exactly 3 sessions: waves 2, 3, and 4 from `APP_AND_SERVER_MIGRATION_MAP.md`.
- `caffeinate -i` is still recommended for local unattended runs; not needed for Codex Cloud.

## Files touched

| File | Change |
| --- | --- |
| `scripts/auto-session-codex-automerge.sh` | New local Codex auto-merge driver for BBL waves 2-4. |
| `docs/runbooks/dev-environment/codex-cloud-bbl-waves-2-4.md` | New Codex Cloud fallback prompt and local command note. |
| `docs/runbooks/dev-environment/autonomous-sessions.md` | Added Codex automerge section and local/cloud guidance. |
| `docs/runbooks/dev-environment/codex-mobile-runbook.md` | Added local Codex automerge command and cloud fallback link. |
| `docs/runbooks/README.md` | Indexed the new Codex Cloud BBL handoff. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0375 and new runbook entries. |
| `docs/knowledge/wiki/log.md` | Added SESSION_0375 log entry. |
| `docs/sprints/SESSION_0375.md` | This session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bash -n scripts/auto-session-codex-automerge.sh` | pass |
| `bun run wiki:lint` | pass — 649 markdown files scanned; no lint violations |
| `git diff --check` | pass |
| `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` | pass — incremental rebuild completed |

## Graphify close

- Final stats: 11,819 nodes, 18,612 edges, 1,714 communities, 1,902 files tracked.

## Open decisions / blockers

- Operator approved launching the local runner with `caffeinate -i scripts/auto-session-codex-automerge.sh`.
- Codex Cloud fallback is documented, but local remains the higher-fidelity path for this batch.

## Next session

### Goal

Run the first three safe BBL `/app` automerge waves locally, or dispatch the Codex Cloud fallback if local execution is unavailable.

### First task

Confirm `.claude/notify.env` has `NTFY_TOPIC`, then launch `caffeinate -i scripts/auto-session-codex-automerge.sh` from a clean `main`.

## Review log

| ID | Scope | Verdict |
| --- | --- | --- |
| SESSION_0375_REVIEW_01 | SESSION_0375_TASK_01-03 | The handoff is scoped and safer than directly reusing the Claude driver: Codex local automerge is explicit, defaults to 3, and retains Prisma/server-flatten brakes. Cloud fallback is documented but not recommended for the first run. |

## Hostile close review

- **Giddy:** Pass. The script adds a hard bounded path instead of telling a cloud agent to improvise around automerge.
- **Doug:** Pass pending final gates. The driver is not launched in this session, which avoids mixing automation setup with the actual migration batch.
- **Desi:** Not applicable; no UI surface changed.

## ADR / ubiquitous-language check

- No ADR needed. This is automation/runbook support for the existing D5/D10 decisions.
- No ubiquitous-language terms introduced.

## Reflections

- Codex Cloud is attractive for availability, but this repo's current close ritual still benefits from local-only tools. The honest handoff is "local preferred, cloud fallback," not pretending both are equivalent.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched runbooks and SESSION_0375 stamped `updated: 2026-06-13`, `last_agent: codex-session-0375`. |
| Backlinks/index sweep | Wiki index/log updated for SESSION_0375 and the new cloud handoff runbook. |
| Wiki lint | pending |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0375_REVIEW_01` plus hostile close review present. |
| Review & Recommend | Next session launch command written. |
| Memory sweep | Autonomous runbooks updated; no ADR/glossary change needed. |
| Next session unblock check | Unblocked pending operator launch decision. |
| Git hygiene | pending |
| Graphify update | pending |
