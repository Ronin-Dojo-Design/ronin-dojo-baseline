---
title: "SESSION 0328 — Autonomous lineage run preflight"
slug: session-0328
type: session--plan
status: closed
created: 2026-06-02
updated: 2026-06-02
last_agent: codex-session-0328
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0327.md
  - docs/petey-plan-0305.md
  - docs/runbooks/dev-environment/autonomous-sessions.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0328 — Autonomous lineage run preflight

## Date

2026-06-02

## Operator

Brian + codex-session-0328

## Goal

Set up the next 3-session autonomous Claude/Codex continuation of `docs/petey-plan-0305.md` from the
already-landed Phase 2 motion work into Phase 3 lineage utility slices, with explicit runner
constraints for Graphify-first discovery, task IDs before UI edits, and Run 3 schema pre-flight for
the Trophy.so rank-progression proof.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0327.md`
- Carryover: SESSION_0327 closed the promotion-events `next/cache` Bun test shim and staged the next
  work as a `docs/petey-plan-0305.md` autonomous continuation. The open handoff was to preflight
  `scripts/auto-session-codex.sh 3` before launching UI work; the operator later asked to make the same
  handoff ready for Claude.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `8f33d86`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Automation docs/script only in this session; next autonomous Run 3 will touch Prisma/database, and Runs 1-2 will compose existing UI primitives. |
| Extension or replacement | Extension: preserve Dirstarter modular structure and Prisma migration workflow while staging Ronin lineage-specific UI/schema slices. |
| Why justified | The runners must make cold sessions obey repo governance before they edit lineage UI or schema. |
| Risk if bypassed | A headless Claude/Codex session could skip Graphify/task IDs, treat Trophy.so as UI-only, or create duplicate gamification schema instead of using existing `GamificationEvent`/`RankAward` facts. |

Live docs checked during planning: Dirstarter Project Structure and Prisma Setup on 2026-06-02. The
Prisma page still identifies `prisma/schema.prisma`, `prisma/seed.ts`, migration files, `db:push`,
`db:generate`, and Prisma Client usage as the baseline database path.

### Graphify check

- Graph status: current enough for bow-in; stats at bow-in: 8976 nodes, 13812 edges, 1409 communities, 1542 files tracked.
- Queries used:
  - `lineage canvas drawer action menu panel LineageMemberActionsMenu persistent profile drawer belt rail`
  - `petey plan 0305 lineage phase 3 actions menu persistent profile panel trophy achievements points RankAward`
  - `autonomous codex auto-session-codex stacked PR sessions bow in task IDs graphify`
  - `trophy achievements points gamification RankAward schema migration prisma workflow lineage profile panel`
  - `schema migration runbook prisma workflow migrate dev db push schema.prisma`
- Files selected from graph:
  - `docs/petey-plan-0305.md`
  - `docs/runbooks/design/motion-system.md`
  - `docs/runbooks/dev-environment/autonomous-sessions.md`
  - `scripts/auto-session-codex.sh`
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx`
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx`
  - `apps/web/components/web/lineage/lineage-member-actions-menu.tsx`
  - `apps/web/components/web/lineage/lineage-node-card.tsx`
  - `apps/web/components/web/lineage/lineage-compact-child-list.tsx`
  - `apps/web/components/web/lineage/lineage-rank-history-tab.tsx`
  - `apps/web/e2e/lineage/public-visibility.spec.ts`
  - `docs/runbooks/database/schema-migration.md`
  - `docs/runbooks/database/prisma-workflow.md`
  - `docs/runbooks/domain-features/lineage-hub.md`
  - `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`
  - `apps/web/prisma/schema.prisma`
  - `docs/knowledge/wiki/custom-component-inventory.md`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

- **Run decision:** do not launch `scripts/auto-session-codex.sh 3` from this dirty planning session. Stage
  the constraints, commit/push to `main`, then the clean next command can launch the stacked-PR loop.
- **Run 1 shape:** Phase 3c is narrower than "add the menu from scratch." `LineageNodeCard` and
  `LineageCompactChildList` already render `LineageMemberActionsMenu`; the gap is verifying public
  read-only behavior and wiring `Change promoter...` to a real capability-gated action where it still
  falls back to View Profile.
- **Run 2 shape:** Phase 3d is a hardening/completion slice. `LineageProfileDrawer` already has a
  desktop persistent-panel direction, a rank-history tab, and a belt-color progress bar; the run should
  finish the mobile bottom-sheet vs. desktop fixed-panel contract and browser-prove it.
- **Run 3 shape:** Trophy.so is allowed, but the rank-progression proof is schema/backend-aware. Existing
  `GamificationEventType`/`GamificationEvent` and `RankAward.gamificationEvents` must be evaluated before
  creating any new achievement/points tables.
- **Tools:** Playwright is useful for Runs 1-2 browser proof. GitHub CLI is already used by the runner for
  stacked PR creation. Vercel CLI and Docker are not needed for this preflight; Docker reinstall is not
  recommended for this lane unless a later local DB/S3 smoke needs MinIO.

## Petey plan

### Goal

Create a reviewable preflight and runner handoff for a 3-session autonomous Claude/Codex continuation of
`docs/petey-plan-0305.md`.

### Tasks

#### SESSION_0328_TASK_01 — Bow-in and Graphify preflight

- **Agent:** Petey
- **What:** Run the opening ritual, read the handoff inputs, and use Graphify to select the exact lineage,
  runner, and schema files for the autonomous run.
- **Steps:**
  1. Read SESSION_0327, WORKFLOW 5.0, program plan, failed-steps log, drift register, and Graphify runbook.
  2. Run Graphify stats and targeted lineage/action/panel/schema/runner queries before UI file inspection.
  3. Open the exact files Graphify selected and record the current state.
- **Done means:** Bow-in and Graphify notes are present in SESSION_0328 with selected files and current
  preflight findings.
- **Depends on:** nothing.

#### SESSION_0328_TASK_02 — Stage autonomous runner constraints

- **Agent:** Petey + Cody
- **What:** Update the autonomous runner prompts/runbook and SESSION handoff so each cold run obeys the
  Phase 3c/3d/Run 3 constraints.
- **Steps:**
  1. Tighten `scripts/auto-session.sh` and `scripts/auto-session-codex.sh` so cold sessions create task
     IDs and Graphify/Cody pre-flight before UI/schema edits.
  2. Document the SESSION_0328 preflight in `docs/runbooks/dev-environment/autonomous-sessions.md`.
  3. Record the exact 3-run order and guardrails in SESSION_0328's next-session block.
- **Done means:** A clean `main` commit can hand the next operator safe `scripts/auto-session.sh 3` or
  `scripts/auto-session-codex.sh 3` launch commands, and both cold-agent prompts contain the governance
  gates.
- **Depends on:** SESSION_0328_TASK_01.

#### SESSION_0328_TASK_03 — Full close and push

- **Agent:** Petey + Doug
- **What:** Close the planning session with wiki/index evidence, Graphify refresh, one commit, and push to
  `main`.
- **Steps:**
  1. Run focused doc/script gates and `bun run wiki:lint`.
  2. Complete the full closing ritual, including hostile close review, evidence table, ADR/component
     inventory check, and memory sweep.
  3. Run `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` before the final commit.
  4. Stage, commit with a conventional message, and push to `origin/main`.
- **Done means:** SESSION_0328 is closed, Graphify is refreshed, and the preflight commit is pushed to
  `main`.
- **Depends on:** SESSION_0328_TASK_02.

### Parallelism

Petey kept the blocking bow-in, SESSION ledger, and runner edits local. Two read-only explorer subagents ran
in parallel as sidecar audits: one for `auto-session-codex.sh` behavior, one for Run 3 schema prerequisites.
No subagent received write ownership because the only edits are shared governance files.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0328_TASK_01 | Petey | Multi-part planning, Graphify-first navigation, and task scoping. |
| SESSION_0328_TASK_02 | Petey + Cody | Cody handles the focused script/runbook edit after Petey locks constraints. |
| SESSION_0328_TASK_03 | Petey + Doug | Full close, review, evidence, and git hygiene. |

### Open decisions

- Whether to launch `scripts/auto-session.sh 3` or `scripts/auto-session-codex.sh 3` immediately after this
  main commit is an operator command decision. The runner will open stacked PRs and should be started from a
  clean `main`.

### Risks

- The runner scripts use `find`/`sed` internally to compute the next SESSION number; this is runner
  implementation detail, not agent discovery. Both cold-agent prompts still require Graphify-first planning
  before edits.
- The runner uses `--dangerously-bypass-approvals-and-sandbox` for unattended Codex; the PR gate and FS-0024
  cwd guard are the safety model.
- Run 3 may be tempted to create a broad gamification engine. Existing `GamificationEventType` and
  `GamificationEvent` must be reused or explicitly ruled insufficient during schema pre-flight.

### Scope guard

- Do not edit lineage UI in SESSION_0328.
- Do not install trophy.so or shadcn components in SESSION_0328.
- Do not run the 3-session autonomous loop while this preflight session has uncommitted edits.
- Do not reinstall Docker for this lane.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Project Structure and Prisma Setup live docs checked 2026-06-02; local
  runbooks `docs/runbooks/database/schema-migration.md` and `docs/runbooks/database/prisma-workflow.md`.
- **Baseline pattern to extend:** Dirstarter modular `components/`, `server/`, `prisma/`, and `services/db.ts`
  structure; Prisma migration files for production-bound schema changes.
- **Custom delta:** Ronin lineage Phase 3 utility UI and a minimal rank-progression gamification proof backed
  by existing `RankAward`/lineage facts.
- **No-bypass proof:** This session only stages automation. The future schema slice must create a Cody schema
  pre-flight and use the existing Prisma migration runbook before editing `schema.prisma`.

## Cody pre-flight

### Pre-flight: Autonomous runner constraints

#### 1. Existing component/action scan

- Graphify queries used: `autonomous codex auto-session-codex stacked PR sessions bow in task IDs graphify`,
  `lineage canvas drawer action menu panel LineageMemberActionsMenu persistent profile drawer belt rail`.
- Found: `scripts/auto-session.sh`, `scripts/auto-session-codex.sh`,
  `docs/runbooks/dev-environment/autonomous-sessions.md`, `LineageMemberActionsMenu`, `LineageNodeCard`,
  `LineageCompactChildList`, `LineageProfileDrawer`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Consulted live alignment URLs: yes, Dirstarter Project Structure and Prisma Setup.
- Closest L1 pattern: Dirstarter modular app structure and Prisma migration/client workflow.
- Primitive API spot-check: not applicable for SESSION_0328 because no UI component is edited.

#### 3. Composition decision

- Extending existing runner/runbook: `scripts/auto-session.sh`, `scripts/auto-session-codex.sh`, and
  `docs/runbooks/dev-environment/autonomous-sessions.md`.
- Composing existing components in future runs only: `DropdownMenu`, `Button`, `Drawer`, `Tabs`, `Card`,
  `Badge`, `Avatar`, `Stack`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes, SESSION_0327.
- ADR read: `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`.
- Runbooks consulted: Graphify repo memory, autonomous sessions, motion system, lineage hub,
  database schema migration, database Prisma workflow.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` if browser proof is needed later.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: future lineage browser proof should use `http://bbl.local:3000/disciplines/bjj`
  and dashboard/editor routes from the SESSION handoff.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0006, FS-0007, FS-0020, FS-0021, FS-0024, FS-0025.
- Mitigation acknowledged: Petey plan and task IDs exist before edits; Graphify queries ran before
  repo-wide discovery; Run 3 schema work must read schema runbooks and inspect `schema.prisma`; FS-0024 guard
  verified cwd/remote; Graphify refresh will run before the final close commit.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0328_TASK_01 | landed | Bow-in, Graphify queries, exact-file reads, and sidecar preflight audits completed. |
| SESSION_0328_TASK_02 | landed | Claude and Codex runner prompts now require task IDs, Graphify-first lineage discovery, Cody pre-flight, and schema/backend treatment for Trophy.so/RankAward persistence; runbook and handoff staged both launch commands. |
| SESSION_0328_TASK_03 | landed | Close content, focused gates, wiki index update, and git hygiene completed. |

## What landed

- Created SESSION_0328 as the Petey-led preflight ledger for the next autonomous lineage run.
- Hardened both autonomous drivers:
  - reject `N=0`;
  - stop unless each cold session creates exactly one new commit;
  - require SESSION task IDs, Graphify-first lineage discovery, and Cody pre-flight before UI/schema/backend edits;
  - require schema/backend pre-flight for Trophy.so, achievements, points, gamification, and `RankAward`
    persistence work.
- Updated the autonomous sessions runbook so the next operator can use either `scripts/auto-session.sh 3`
  (Claude) or `scripts/auto-session-codex.sh 3` (Codex).
- Recorded that Run 1 should finish/prove the existing per-card/row actions menu rather than creating a new
  menu, Run 2 should harden existing persistent-panel/rank-history/belt-bar work, and Run 3 should evaluate
  existing `GamificationEventType`/`GamificationEvent` before adding any schema.

## Decisions resolved

- The 3-session autonomous run was not launched from the dirty preflight session; it is staged for a clean
  `main` command after this commit.
- Claude is now a first-class runner option for this handoff, not just Codex.
- No Docker reinstall is recommended for this lane. Playwright is useful for Run 1/2 browser proof; GitHub
  CLI is already part of the stacked-PR flow; Vercel CLI is not needed for preflight.
- Run 3 is a human-review PR before merge if it touches `apps/web/prisma/`, migrations, or the
  rank/gamification persistence contract.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0328.md` | Created the autonomous lineage run preflight ledger. |
| `scripts/auto-session.sh` | Added Claude-runner prompt gates for task IDs, Graphify-first lineage discovery, Cody pre-flight, and Trophy/schema work; tightened `N` and exact-one-commit brakes. |
| `scripts/auto-session-codex.sh` | Added Codex-runner prompt gates for task IDs, Graphify-first lineage discovery, Cody pre-flight, and Trophy/schema work; tightened `N` and exact-one-commit brakes. |
| `docs/runbooks/dev-environment/autonomous-sessions.md` | Added SESSION_0328 Claude/Codex preflight constraints and path-drift notes for database runbooks. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0328 to the session index and stamped `last_agent`. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` | Pass: 8976 nodes, 13812 edges, 1409 communities, 1542 files tracked. |
| `bash -n scripts/auto-session.sh scripts/auto-session-codex.sh` | Pass. |
| `git diff --check` | Pass. |
| `bun run wiki:lint` | Pass: 0 errors, 3 pre-existing stale-frontmatter warnings (`architecture/data-model.md`, `knowledge/wiki/aliases-and-canonical-ids.md`, `knowledge/wiki/repo-truth-index.md`). |
| `cd apps/web && bun run typecheck` | Pass: `next typegen` and `tsc --noEmit --pretty false` exited 0. |

## Open decisions / blockers

- Operator can launch either runner from clean `main`: `scripts/auto-session.sh 3` for Claude or
  `scripts/auto-session-codex.sh 3` for Codex.
- If Run 3 touches Prisma/migrations, merge should stop for human schema review.

## Next session

### Goal

Launch or run `scripts/auto-session.sh 3` (Claude) or `scripts/auto-session-codex.sh 3` (Codex) from
clean `main` for the three staged `docs/petey-plan-0305.md` autonomous sessions: Phase 3c action-menu
proof, Phase 3d persistent profile panel, and Trophy.so rank-progression schema/UI proof.

### Inputs to read

- `docs/sprints/SESSION_0328.md`
- `docs/petey-plan-0305.md`
- `docs/runbooks/design/motion-system.md`
- `docs/runbooks/dev-environment/autonomous-sessions.md`
- `scripts/auto-session.sh`
- `scripts/auto-session-codex.sh`
- `apps/web/components/web/lineage/lineage-tree-canvas.tsx`
- `apps/web/components/web/lineage/lineage-profile-drawer.tsx`
- `apps/web/components/web/lineage/lineage-member-actions-menu.tsx`
- `apps/web/components/web/lineage/lineage-node-card.tsx`
- `apps/web/components/web/lineage/lineage-compact-child-list.tsx`
- `apps/web/components/web/lineage/lineage-rank-history-tab.tsx`
- `docs/runbooks/domain-features/lineage-hub.md`
- `docs/runbooks/database/schema-migration.md`
- `docs/runbooks/database/prisma-workflow.md`
- `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`
- `apps/web/prisma/schema.prisma`
- `docs/knowledge/wiki/custom-component-inventory.md`

### Autonomous run plan

1. **Run 1 — Phase 3c actions menu + browser proof.** Bow in against `docs/petey-plan-0305.md`.
   Run Graphify queries over `lineage canvas drawer action menu panel LineageMemberActionsMenu`.
   Create SESSION task IDs and Cody UI pre-flight before edits. Verify public read-only behavior and
   dashboard/editor behavior separately. Current preflight says the menu already exists on full cards
   and compact rows; the likely gap is `Change promoter...` falling back to View Profile instead of a
   distinct capability-gated action.
2. **Run 2 — Phase 3d persistent profile panel.** Continue from Run 1's PR branch. Re-read
   `LineageProfileDrawer`, `LineageRankHistoryTab`, and the motion-system reduced-motion rules.
   Finish/polish the mobile bottom-sheet plus desktop persistent side-panel contract, promotion-history
   visibility, and belt-rail Mode B. Current preflight says these surfaces are partially present, so do
   not duplicate them.
3. **Run 3 — Trophy.so rank-progression proof.** Treat this as schema/backend work plus UI, not just
   vendor UI. Before any schema edit, read `docs/runbooks/database/schema-migration.md`,
   `docs/runbooks/database/prisma-workflow.md`, `docs/protocols/cody-preflight.md`, lineage hub, ADR 0016,
   and `apps/web/prisma/schema.prisma`. Existing `GamificationEventType`, `GamificationEvent`, and
   `RankAward.gamificationEvents` are already present; reuse them or explicitly justify why they are
   insufficient. Install isolated trophy.so/shadcn vendor components per Phase 4 only after vetting imports
   against Base UI/Dirstarter primitives. Keep the proof minimal and backed by existing `RankAward`/lineage
   facts; do not invent a broad gamification engine.

### First task

From clean `main`, run one of:

```bash
# Claude driver
scripts/auto-session.sh 3

# Codex driver
scripts/auto-session-codex.sh 3
```

Review and merge the resulting stacked PRs bottom-up. Stop before merging Run 3 if it touches
`apps/web/prisma/` until the migration/schema evidence is reviewed.

## Review log

### SESSION_0328_REVIEW_01 — Autonomous runner preflight

- **Reviewed tasks:** SESSION_0328_TASK_01, SESSION_0328_TASK_02, SESSION_0328_TASK_03
- **Dirstarter docs check:** live Project Structure and Prisma Setup checked 2026-06-02.
- **Verdict:** Pass. The session stayed in planning/runner-hardening scope, preserved Graphify-first
  discovery, made the handoff usable from either Claude or Codex, and corrected the runner brake mismatch
  where the runbook promised exactly one commit but the scripts only checked for any new commit.
- **Score:** 9.7/10

## Hostile close review

### SESSION_0328 — Autonomous lineage run preflight

#### Review

- **Giddy:** Pass. The preflight did not launch a branch stack from a dirty worktree, fixed the shared
  autonomous-runner safety brake, and left the next command explicit for both Claude and Codex.
- **Doug:** Pass. Focused gates passed (`bash -n`, `git diff --check`, `wiki:lint`, app typecheck), and the
  next Run 3 schema risk is called out as a human-review PR gate.
- **Desi:** Pass for planning. The next UI sessions are constrained to prove public read-only and
  dashboard/editor behavior separately, with Playwright as the browser proof path.

#### Findings

No findings severity >= medium.

#### Kaizen questions

- **Safe and secure?** Yes for this slice. No product data, auth paths, schema, or UI behavior changed; the
  main safety effect is stronger unattended-run brakes and pre-edit prompts.
- **Failed steps prevented?** FS-0020 is addressed by hard-prompting Graphify-first discovery; FS-0021 is
  addressed by routing Trophy/RankAward persistence through schema pre-flight; FS-0024/FS-0025 are preserved
  by cwd guard evidence and exact-one-commit runner brakes.
- **Scale confidence:** 100: 10/10, 1,000: 9.8/10, 10,000: 9.5/10. Remaining risk is prompt compliance in a
  headless agent; the stacked PR and one-commit brakes are the control points.

## Reflections

- The useful sidecar finding was the exact-one-commit mismatch: the runbook promised it, but both scripts only
  checked that `HEAD` differed from the base branch.
- The Phase 3c/3d work is more mature than the raw handoff wording implied. The next agents should finish and
  prove existing action-menu/panel surfaces rather than duplicate them.
- Run 3 should begin by deciding whether the existing `GamificationEvent` model is already enough. If yes, the
  "schema work" may be a no-new-schema decision plus backend/query wiring; that still needs to be recorded.

## ADR / ubiquitous-language check

- ADR: no new ADR needed for SESSION_0328 because no architecture decision or schema changed. Run 3 may need an
  ADR note only if it adds new achievement/point-balance source-of-truth tables.
- Ubiquitous language: no new domain terms added. The handoff intentionally uses existing `RankAward`,
  `LineageRelationship`, `LineageTreeMember`, and `GamificationEvent` names.
- Custom component inventory: checked. No update needed because no UI component contract changed this session;
  the runbook/SESSION handoff calls out likely future inventory updates for Run 1/Run 2.

## Full close evidence

| Step | Proof |
| --- | --- |
| SESSION-file gate | Task log contains SESSION_0328_TASK_01 through SESSION_0328_TASK_03. |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0328.md` created with current frontmatter; `docs/runbooks/dev-environment/autonomous-sessions.md` and `docs/knowledge/wiki/index.md` stamped `last_agent: codex-session-0328`. Shell scripts have no frontmatter. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` includes SESSION_0328; `docs/runbooks/dev-environment/autonomous-sessions.md` pairs with SESSION_0328. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 3 pre-existing stale-frontmatter warnings. |
| Kaizen reflection | Present in `## Reflections`. |
| Hostile close review | `SESSION_0328_REVIEW_01` present; no findings severity >= medium. |
| Review & Recommend | Next session goal, inputs, autonomous run plan, and first task written for both Claude and Codex runners. |
| ADR / ubiquitous-language check | No ADR/glossary update needed this session; Run 3 ADR threshold recorded above. |
| Memory sweep | No operator memory update needed; durable changes are in the runner prompts, runbook, and SESSION handoff. |
| Next session unblock check | Unblocked after this commit: launch `scripts/auto-session.sh 3` or `scripts/auto-session-codex.sh 3` from clean `main`; merge stacked PRs bottom-up. |
| Git hygiene | FS-0024 guard passed: cwd `/Users/brianscott/dev/ronin-dojo-app`, remote `Ronin-Dojo-Design/ronin-dojo-baseline`, branch `main`; single push pending, hash reported at bow-out — see `git log`. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before commit; `graphify stats` after refresh: 8980 nodes, 13816 edges, 1392 communities, 1542 files tracked. |
