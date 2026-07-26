---
title: "SESSION 0420 — Promote agents + protocol loops from the legacy monorepo"
slug: session-0420
type: session--open
status: closed
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0420
sprint: S-foundation
pairs_with:
  - docs/sprints/SESSION_0419.md
  - docs/protocols/pr-review-score-fix-loop.md
  - docs/protocols/giddy-merge-strategy.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0420 — Promote agents + protocol loops from the legacy monorepo

## Date

2026-06-20

## Operator

Brian + claude-session-0420

## Goal

Foundation session (operator-directed, not the SESSION_0419 "next" lane): promote the
agent roster and selected protocol "loops" from the legacy monorepo
(`/Users/brianscott/dev/ronin-dojo-monorepo`) into this repo, leaned out and adapted to
trunk-based conventions. This session: confirm the agent roster, produce a ranked
candidate list of all monorepo loops worth promoting, and promote the **two named loops
only** (PR_REVIEW_SCORE_FIX_LOOP + GIDDY_MERGE_STRATEGY). Pause for operator sign-off
before any commit/push and before bulk-promoting beyond the two named loops.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0419.md`
- Carryover: SESSION_0419 fixed social-sign-in claim binding (ADR 0032) and flipped
  lifecycle emails live in prod. Its "next" lane was a lifecycle-email copy audit —
  **superseded** this session by the operator's explicit foundation directive.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `d73ce309`

### Graphify check

- Graph status: current; stats at bow-in: 13994 nodes, 26732 edges, 1898 communities,
  2311 files tracked (app repo). Monorepo surveyed read-only (no graphify mutation —
  operator guard: do not mutate the monorepo).
- Files selected: monorepo `RoninDashboard/protocols/` (48 files) + `RoninDashboard/agents/`.
- Verification note: monorepo files opened directly; graphify used for app-repo posture only.

## Petey plan

### Goal

Promote agents + two named protocol loops from the monorepo, leaned out; deliver a
ranked candidate list for the rest; report rename/prune context. Stop for sign-off.

### Tasks

#### SESSION_0420_TASK_01 — Agent roster audit

- **Agent:** Petey
- **What:** Confirm which agents this repo's rituals/loops/Petey-plans need vs. what exists.
- **Done means:** Report — all of Petey/Cody/Desi/Doug/Giddy already exist in `docs/agents/`;
  nothing missing; the monorepo's Julie/Damian/Brandon personas fold into this roster.

#### SESSION_0420_TASK_02 — Ranked loop candidate list

- **Agent:** Petey
- **What:** Survey all 48 monorepo `protocols/` files; rank promote-worthiness.
- **Done means:** Ranked list (name, what, why, lean-out effort, order) presented for
  operator approval. NOT bulk-promoted.

#### SESSION_0420_TASK_03 — Promote the two named loops

- **Agent:** Cody (under Petey)
- **What:** Adapt + place PR_REVIEW_SCORE_FIX_LOOP and GIDDY_MERGE_STRATEGY in `docs/protocols/`.
- **Done means:** `docs/protocols/pr-review-score-fix-loop.md` +
  `docs/protocols/giddy-merge-strategy.md` created, leaned to trunk-based conventions,
  cross-linked to existing protocols/agents.

#### SESSION_0420_TASK_04 — Rename/prune context report

- **Agent:** Petey
- **What:** Trace the ronin-dojo-app → black-belt-legacy rename/prune history from SESSION docs + SOT-ADR.
- **Done means:** Report on current state, decision lineage (D12 vs in-place prune), what's
  done, and what a full rename would touch. Report only — no rename executed.

### Open decisions

- Placement of promoted loops: `docs/protocols/` (existing kebab-case convention; no
  `docs/loops/` dir exists) — proceeding on the established convention.
- Whether to promote any candidate-list loops beyond the two named — **awaiting operator**.

### Risks

- None at plan-lock. Guard: no commit/push, no emails, no prod writes, do not flip
  `BBL_COUNTDOWN`; do not mutate the monorepo.

### Scope guard

- Do NOT bulk-promote the candidate list.
- Do NOT execute the repo rename/prune.
- Do NOT commit/push until operator signs off.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0420_TASK_01 | landed | Roster complete — all 5 agents exist; nothing promoted |
| SESSION_0420_TASK_02 | landed | Ranked candidate list produced (presented in chat) |
| SESSION_0420_TASK_03 | landed | Two loops promoted + adapted to `docs/protocols/` |
| SESSION_0420_TASK_04 | landed | Rename/prune context report produced (presented in chat) |

## What landed

- Two monorepo loops promoted to `docs/protocols/` (leaned + trunk-adapted),
  registered in the wiki index, committed + pushed to `main` (`70c820d6`, docs-only,
  no deploy): `pr-review-score-fix-loop.md`, `giddy-merge-strategy.md`.
- Agent-roster audit: complete already (Petey/Cody/Desi/Doug/Giddy); nothing promoted.
- Ranked candidate list of the remaining 46 monorepo protocols delivered; operator
  approved the next batch (THREE_PASS → KISS_DRY_YAGNI → QA_RUNTIME + IDENTIFY_INTENT
  → HOT_FIX).
- Rename/prune context report delivered (no action): in-place prune is the live
  direction over D12's separate fork.
- Program state saved to memory (`monorepo-loop-promotion-program`).

## Decisions resolved

- Promoted loops live in `docs/protocols/` (existing kebab convention; no `docs/loops/`).
- Integrate threshold for the PR loop = repo's `≥9.5` (matches `merge-to-main` /
  `hostile-close-review`), not the monorepo's `9.6`.
- `GIDDY_MERGE_STRATEGY` is not a literal file — synthesized from three legacy Giddy/merge
  protocols; those three are now considered absorbed (do not promote separately).
- Operator approved commit + push this session (overriding the per-action hold for this one).

## Open decisions / blockers

- None. Next batch is approved and recorded; archive/maintenance-process decisions
  raised at bow-out are staged for the operator (see chat), not blocking.

## Next session

### Goal

Promote the operator-approved next batch of loops (5), leaned out, into `docs/protocols/`.

### First task

Promote the operator-approved set (decided this session), in this order: Tier 1
**THREE_PASS_LOOP** then **KISS_DRY_YAGNI_LOOP** (the shared score/fix/review and
simplicity engine the two SESSION_0420 loops lean on); then Tier 2
**QA_RUNTIME_VERIFICATION** and **IDENTIFY_INTENT_IMPROVE_LOOP**; then
**HOT_FIX_PROTOCOL** (adapt brand build/deploy to Vercel and this repo's gates). Adapt
each to the roster (Petey/Cody/Doug/Giddy), strip QF/WO/SPRINT-lane and
RoninDashboard-path machinery, align score thresholds to this repo (≥9.5), cross-link,
and register in the wiki index.

## Review log

### SESSION_0420_REVIEW_01 — promoted-loops governance review

- **Reviewed tasks:** TASK_01–TASK_04.
- **Dirstarter docs check:** not applicable (governance/docs only — no L1 surface touched).
- **Verdict:** Both promoted loops are leaned (no monorepo lane/runner/telemetry leakage)
  and wired to real local targets (`/code-review`, `merge-to-main`, the roster, FS-0024).
  Cross-links resolve; index registered; wiki-lint clean. Candidate list is honest about
  what's redundant vs. portable. No code, no prod impact.
- **Score:** 9.6/10.
- **Follow-up:** when THREE_PASS lands next session, align its pass bar to `≥9.5` to
  avoid two different "pass" thresholds across the protocol set.

## Hostile close review

- **Giddy:** pass — trunk-adapted correctly; `final-clean-base`/epic-branch families
  dropped; commit was docs-only so no deploy; `.graphify` gitignored; one clean push.
- **Doug:** pass — `bun run wiki:lint` 0 errors; graphify refreshed; staged set matched
  the four deliverables exactly; no stray files.
- **Kaizen aggregate:** 9.6/10 — clean governance session; only nit was a markdown
  list-marker warning (line-initial `+`), caught and fixed before commit.

## ADR / ubiquitous-language check

- ADR update not required — promoting process protocols introduces no architectural
  decision or schema change. No new ubiquitous-language terms (loop/agent names are
  process vocabulary, not domain entities).

## Reflections

- **Promote what's missing, not what exists.** Half the value this session was *negative*
  work: confirming the agent roster was already complete and that `GIDDY_MERGE_STRATEGY`
  wasn't a real file, so I synthesized rather than copied. The lean-out is the point — a
  straight port would have dragged the QF/WO/SPRINT lane machinery in with it.
- **The repo had already grown past my mental model.** By bow-out, `reusable-prompts.md`,
  `doc-pruning-register.md`, FEATURES.md, and a DojoBots feature-request modal existed
  (sessions 0421/0422, which landed on `main` after my push). Lesson for the live phase:
  check current `main` + the ledger set before proposing "new" infrastructure.
- **22 in-progress SESSION files is the real drift**, not the count of active sessions.
  This session being one of them is exactly why a bow-out matters; closing it is the model.

## Full close evidence

| Step | Proof |
| --- | --- |
| Frontmatter sweep | `status: in-progress → closed`; `updated: 2026-06-20` |
| Backlinks/index sweep | both protocols added to `docs/knowledge/wiki/index.md` Protocols table |
| Wiki lint | `bun run wiki:lint` → 0 errors (14 pre-existing warnings in SESSION_VIDEO_R001.md, not mine) |
| Kaizen reflection | Reflections section above |
| Hostile close review | SESSION_0420_REVIEW_01 + Giddy/Doug passes above |
| Review & Recommend | Next session goal + first task written (approved batch) |
| Memory sweep | `monorepo-loop-promotion-program.md` written + MEMORY.md pointer |
| Git hygiene | `70c820d6` (loops + index) pushed; bow-out close commit follows |
| Graphify update | `graphify update .` → 61 nodes, 695 edges (incremental) |
