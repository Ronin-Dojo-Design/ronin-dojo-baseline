---
title: "SESSION 0548 — Board and ledger hygiene sweep"
slug: session-0548
type: session--open
status: closed
created: 2026-07-16
updated: 2026-07-16
last_agent: codex-session-0548
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0547.md
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/knowledge/wiki/goals-ledger.md
  - docs/knowledge/wiki/manual-boundary-registry.md
  - docs/product/black-belt-legacy/POST_LAUNCH_SOT.md
  - docs/runbooks/database/neon-credential-rotation.md
  - docs/security/ronin-security-risk-register.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0548 — Board and ledger hygiene sweep

## Date

2026-07-16

## Operator

Brian + codex-session-0548

## Goal

Lane A from SESSION_0547: reconcile stale ledger and board projection rows without app-code changes,
write the RISK #13 Neon credential-rotation runbook, and leave local DB card flips as an explicit
merge-time action for the canonical checkout.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0547.md`
- Carryover: SESSION_0547 persisted the fan-out plan and assigned Lane A to board/ledger hygiene,
  MB reclassification, G-007 narrowing, and the RISK #13 rotation runbook.

### Branch and worktree

- Branch: `session-0548-board-hygiene`
- Worktree: `/Users/brianscott/dev/ronin-0548`
- Status at bow-in: clean
- Current HEAD at bow-in: `ae79db18`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None |
| Extension or replacement | Not applicable — docs/ledger hygiene only |
| Why justified | The lane changes backlog projection text and runbook documentation, not a Dirstarter runtime capability |
| Risk if bypassed | Low; no app, schema, auth, storage, or hosting code changes are in scope |

Live docs checked during planning: not applicable.

### Graphify check

- Graph status: empty in this fresh worktree; stats at bow-in: 0 nodes, 0 edges, 0 communities, 0 files tracked.
- Queries used: none — empty worktree graph is non-proof per opening.md.
- Files selected from graph: none.
- Verification note: exact files opened directly; Graphify was not used as proof.

### Grill outcome

- Operator pre-resolved scope: docs-only lane; no app code, no DB access, no `bun install`, no push.
- Parser strategy: make smallest source-row edits that the existing aggregator recognizes; do not rebuild the parser.
- DB card flips: defer to merge-time from canonical checkout because this sandbox has no reachable local DB.

## Petey plan

### Goal

Close only verified stale backlog rows, keep ambiguous residue open, reclassify manual boundaries away
from agent backlog, and document the operator-only Neon rotation flow.

### Tasks

#### SESSION_0548_TASK_01 — Verify and reconcile ledger rows

- **Agent:** Cody inline
- **What:** Check WL, FI, GL, and MB source rows against cited session/code evidence and update only
  parser-facing statuses that are proven stale.
- **Done means:** Ledger rows parse closed/operator-manual where appropriate, ambiguous rows keep a
  one-line open residue.
- **Depends on:** nothing

#### SESSION_0548_TASK_02 — Write RISK #13 runbook

- **Agent:** Cody inline
- **What:** Create `docs/runbooks/database/neon-credential-rotation.md` with operator steps and
  sensitive-variable gotchas, without touching credentials or production.
- **Done means:** Runbook exists with dashboard, Vercel, local overlay, deploy, and Prisma-connectivity
  verification steps.
- **Depends on:** nothing

#### SESSION_0548_TASK_03 — Bow-out evidence and held commit

- **Agent:** Cody inline
- **What:** Fill this session file, record merge-time `markCardDone` sourceRefs, verify parser output,
  commit locally, and hold at the push gate.
- **Done means:** Conventional local commit exists; no push/PR/deploy attempted.
- **Depends on:** SESSION_0548_TASK_01, SESSION_0548_TASK_02

### Parallelism

Single inline docs lane. Tasks touch overlapping governance docs and should stay sequential for audit clarity.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0548_TASK_01 | Cody inline | Small source edits across known ledger files |
| SESSION_0548_TASK_02 | Cody inline | Single runbook creation |
| SESSION_0548_TASK_03 | Cody inline | Session close and local git hygiene |

### Open decisions

None at plan-lock.

### Risks

- Stale rows may contain over-broad resolved claims; each ID must be verified before crossing off.
- Board card flips cannot run from this sandbox; they must stay merge-time only.

### Scope guard

- No app code, migrations, schema changes, prod access, DB access, deploy, PR, or push.
- Do not touch `/Users/brianscott/dev/ronin-dojo-app` or `../ronin-dojo-monorepo`.
- FI-001 remains parked; no Truelson send work.

## Cody pre-flight

Docs/governance-only lane. No runtime component, schema, DB, or app-code pre-flight required.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0548_TASK_01 | landed | Verified and reconciled WL/FI/GL/MB rows against cited session/code evidence |
| SESSION_0548_TASK_02 | landed | Added the RISK #13 Neon credential-rotation runbook and linked it from runbook/risk indexes |
| SESSION_0548_TASK_03 | landed | Filled close evidence, verified parser output, committed locally, held at push gate |

## Merge-time steps

Run from the canonical checkout with its local DB available, after merging this docs lane. Use the
headless board-mark-done path for each resolved sourceRef:

| SourceRef | Why |
| --- | --- |
| `WL:WL-P2-46` | Duplicate source row collapsed; resolved read-collapse row should no longer project |
| `WL:WL-P2-54` | Aggregate AdminCollection row resolved after verified children |
| `WL:WL-P2-55` | Verified closed if status helper shipped |
| `WL:WL-P2-56` | Verified closed if sort DRY shipped |
| `WL:WL-P2-57` | Verified closed if techniques Draft soft badge shipped |
| `WL:WL-P2-59` | Verified closed if `selectColumn<TData>()` shipped |
| `WL:WL-P2-60` | Verified closed if kebabs moved to `RowActionsMenu` |
| `WL:WL-P2-62` | Verified closed if `/app/users` authz parity e2e shipped |
| `FI:FI-005` | POST_LAUNCH_SOT status parsed closed |
| `FI:FI-006` | POST_LAUNCH_SOT status parsed closed |
| `GL:G-004` | Goals ledger row already done and should be marked done on the board |
| `GL:G-007` | Goals ledger row verified fully shipped this session and should be marked done on the board |

## What landed

- WL source reconciliation:
  - Flipped closed: `WL-P2-46`, `WL-P2-54`, `WL-P2-55`, `WL-P2-56`, `WL-P2-57`, aggregate `WL-P2-54..57`,
    `WL-P2-59`, `WL-P2-60`, `WL-P2-62`.
  - Kept open: `WL-P2-48` (admin raw-node-state labeling after WL-P2-46) and `WL-P2-61`
    (select-column behavior changes: shift-select and account/admin disabled gates).
- FI source reconciliation:
  - `FI-005` normalized to the same plain `resolved (...)` status style as other closed FI rows.
  - `FI-006` already parsed closed; left its history intact.
- GL source reconciliation:
  - `G-004` already parsed done; kept as a merge-time board flip.
  - `G-007` verified fully shipped and marked done: live PR source, bow-in routing, and worktree
    fan-out are all present.
- MB reclassification:
  - `MB-001`, `MB-002`, `MB-003`, `MB-006`, `MB-007`, `MB-008`, `MB-009`, `MB-010`, `MB-012`,
    `MB-013`, and `MB-014` now read `operator-manual — open`, so they remain visible in the
    manual-boundary registry but no longer project as agent-dispatch backlog.
- RISK #13:
  - Added `docs/runbooks/database/neon-credential-rotation.md` and linked it from the runbooks hub,
    database runbook, wiki index, and security risk register.

## Decisions resolved

- Existing parser vocabulary was enough; no aggregator rebuild needed.
- G-007 has no remaining unshipped residue after checking `.claude/skills/pr-fix-loop/SKILL.md`.
- MB rows are not done; they are operator-manual. They should not get `markCardDone` flips unless the
  merge operator chooses a separate board treatment for operator-only cards.
- RISK #13 remains open because no credential rotation was performed.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0548.md` | Session record, merge-time card flip list, close evidence |
| `docs/knowledge/wiki/wiring-ledger.md` | Closed verified stale WL rows; kept WL-P2-48/WL-P2-61 residue explicit |
| `docs/knowledge/wiki/goals-ledger.md` | Marked G-007 done with evidence for all three shipped halves |
| `docs/knowledge/wiki/manual-boundary-registry.md` | Reclassified MB-001..014 open rows as operator-manual |
| `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` | Normalized FI-005 resolved status style |
| `docs/runbooks/database/neon-credential-rotation.md` | New operator-only Neon credential rotation runbook |
| `docs/runbooks/README.md` | Linked the new database runbook |
| `docs/runbooks/database/database.md` | Cross-linked the new credential rotation runbook |
| `docs/security/ronin-security-risk-register.md` | Linked RISK #13 to the rotation runbook without closing the risk |
| `docs/knowledge/wiki/index.md` | Added the new runbook to the Runbooks index |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` | 0 nodes / 0 edges / 0 communities / 0 files tracked — expected empty fresh-worktree graph; not used as proof |
| `bun scripts/ledger-backlog.ts --ledger=WL --no-pr \| rg "WL-P2-(46\|54\|55\|56\|57\|59\|60\|62)\|WL-P2-61\|WL-P2-48"` | Only `WL-P2-48` and `WL-P2-61` still project from the checked set |
| `bun scripts/ledger-backlog.ts --ledger=GL --no-pr \| rg "G-00[4\|7]" \|\| true` | No `G-004` or `G-007` projection |
| `bun scripts/ledger-backlog.ts --ledger=MB --no-pr \| rg "MB-0(0[1-9]\|1[0-4])" \|\| true` | No `MB-001..014` projection |
| `bun scripts/ledger-backlog.ts --ledger=FI --no-pr \| rg "FI-00[5-6]" \|\| true` | No `FI-005` or `FI-006` projection |
| `bun scripts/ledger-backlog.ts --no-pr --top=120` | 79 open items; `MB 0`; target stale rows absent |
| `wiki-lint` | Deferred to merge from canonical checkout per lane brief |
| DB `markCardDone` flips | Deferred to merge from canonical checkout; exact sourceRef list is in `## Merge-time steps` |
| Graphify refresh | Skipped per lane brief; graph lives in canonical checkout |

## Open decisions / blockers

- Local DB card flips are blocked in this sandbox by design; merge session must run the `## Merge-time steps`.
- `wiki-lint` must run at merge from the canonical checkout.
- RISK #13 credential rotation is still operator action; this session wrote the runbook only.

## Next session

### Goal

Merge this docs-only hygiene lane, run the local DB board-card flips from the canonical checkout, then
continue with the next non-stale board item.

### First task

From the canonical checkout, run the merge-time `markCardDone` sourceRef list above after applying this
branch, then run `wiki-lint` from the canonical environment.

## Review log

### SESSION_0548_REVIEW_01 — Docs hygiene self-review

- **Reviewed tasks:** SESSION_0548_TASK_01, SESSION_0548_TASK_02, SESSION_0548_TASK_03
- **Dirstarter docs check:** not applicable
- **Verdict:** PASS. The source-row parser proof matches the lane intent, no app/runtime surface changed,
  and ambiguous residue stayed open instead of being crossed off.
- **Score:** 9.4/10
- **Follow-up:** Canonical merge must run wiki-lint and the DB card flips.

## Hostile close review

N/A — docs-only lane; no app code, schema, DB, deploy, or runtime behavior changed.

## ADR / ubiquitous-language check

- ADR update not required. Existing ADR 0041 remains the board/ledger loop authority.
- Ubiquitous language update not required. No new product/domain terms introduced.

## Reflections

The useful constraint was the parser itself: most stale rows were not semantically open, they just had the
resolved token in the wrong table cell for `ledger-parse.ts`. Keeping the fix at the row text avoided turning
a hygiene lane into parser work.

The WL-P2-46 and WL-P2-54..57 contradictions were worth re-checking by full ID. WL-P2-46 was closed only for
the member-facing read-collapse; the admin raw-state and RankAward table-drop residues remain in their own
rows/docs. WL-P2-61 likewise stays open because converging those selects is a behavior change, not cleanup.

Manual-boundary registry rows were the other trap: they are real work, but not agent-dispatchable backlog.
`operator-manual — open` preserves visibility while removing them from the agent queue with no parser change.

## Full close evidence

| Step | Proof |
| --- | --- |
| Session file | Created from template and filled for SESSION_0548 |
| Ledger routing | Closed only verified WL/FI/GL rows; MB rows reclassified operator-manual; RISK #13 linked to runbook but left open |
| Wiki lint | Deferred to merge from canonical checkout per lane brief |
| Hostile close review | N/A — docs-only |
| Memory sweep | No durable Codex memory change needed; session facts live here and in canonical ledgers |
| Next session unblock check | Merge-time card flips listed above; wiki-lint at merge from canonical |
| Git hygiene | Local commit on `session-0548-board-hygiene`; no push/PR/deploy |
| Graphify update | Skipped — graph lives in canonical checkout |
