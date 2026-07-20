<!--
SESSION_TEMPLATE.md — derived from SESSION_0227 at SESSION_0228 (project-log retirement).

How to use:
1. At bow-in, find the highest-numbered file in docs/sprints/ and increment.
2. Copy this file: cp docs/sprints/_template/SESSION_TEMPLATE.md docs/sprints/SESSION_NNNN.md
3. Replace every <placeholder> and delete every HTML comment block (including this one).
4. Set frontmatter `type` per the matrix in opening.md step 6 — default is `session--open`.
5. Leave bottom sections (`What landed` through `Full close evidence`) empty at bow-in;
   they get filled at bow-out by the closing ritual.

Sections you can DELETE if not applicable:

- `Cody pre-flight` — drop the per-task subsections that don't apply; abbreviate for pure docs/governance work.
- `Project-log waiver` — DELETE entirely. project-log is retired (SESSION_0228); SESSION files are canonical.
- Any `Pre-flight: <task>` subsection where the task is not a Cody coding task.
-->
---
title: "SESSION NNNN — <one-line description>"
slug: session-NNNN
type: session--open
status: in-progress
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
last_agent: <agent>-session-NNNN
sprint: <S#>
lane: repo # ADR 0049 lane facet: repo | rdd | mmb | bbl | bma | usa (usa = WEKAF-USA)
lane_seq: # optional per-lane ordinal (int) — renders as e.g. MMB_0006; omit for lane: repo
recipe: # optional (G-023) — name of the docs/protocols/recipes/<name>.md card this staged
        # stub hydrates from at adopt (e.g. "lane", "orchestrator"); omit for a plain session
vault_session: # e.g. "MMB_SESSION_0006" when a vault twin exists (twin carries repo_session:)
goal_ids: [] # goals-ledger IDs worked, e.g. [G-021, MMB-G-004]
tickets: [] # wayfinder issue numbers, e.g. ["233"]
next_session: # filled at bow-out with the pre-staged stub path (ADR 0049)
pairs_with:

  - docs/sprints/SESSION_<previous>.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION NNNN — <one-line description>

## Date

<YYYY-MM-DD>

## Operator

Brian + <agent>-session-NNNN

## Goal

<One paragraph: what this session accomplishes. Should map directly to the previous session's "Next session: Goal" if there is one.>

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_<previous>.md`
- Carryover: <one or two sentences on what shipped last and how this session continues from there>

### Branch and worktree

- Branch: `<branch name, usually main>`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: <clean | uncommitted changes from previous session>
- Current HEAD at bow-in: `<short SHA>`

### Dirstarter alignment

<!-- Required when the task touches any L1 area: storage, payments, media, content, monetization, blog, auth, theming, Prisma, hosting. Delete if not applicable. -->

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | <list relevant baselines | None> |
| Extension or replacement | Extension: <how it builds on Dirstarter> \| Replacement: <why a Dirstarter capability is being replaced> |
| Why justified | <one sentence> |
| Risk if bypassed | <one sentence> |

Live docs checked during planning: <Content, Blog, Media, Storage, Theming, Prisma, etc. | not applicable>.

### Graphify check

<!-- Skim docs/runbooks/graphify-repo-memory.md for search-heavy lanes. Skip this whole subsection for small single-file tasks. -->

- Graph status: <current | stale — needs rebuild>; stats at bow-in: <N nodes, N edges, N communities, N files tracked>.
- Queries used:
  - `<lane nouns and domain terms>`
- Files selected from graph:
  - `<apps/web/...>`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

<!-- Delete if no open forks to resolve. Record decisions made during Petey grill before execution starts. -->

<N forks resolved: bullet list of decision + rationale>

### Drift logged

<!-- Delete if no drift discovered. Record any divergences noticed during bow-in. -->

<Drift ID + one-line description, or delete this section>

## Petey plan

<!-- If the task is clear and small, Petey plan can be compact (single task block). For multi-task sessions, use the full template below. -->

### Goal

<One sentence: what this session accomplishes.>

### Tasks

#### SESSION_NNNN_TASK_01 — <title>

- **Agent:** Cody | Petey | Doug | Desi | Giddy | <subagent type>
- **What:** <one-line description>
- **Steps:** <numbered or bulleted list of concrete steps>
- **Done means:** <artifact, file, or state change that proves the task landed>
- **Depends on:** nothing | SESSION_NNNN_TASK_<NN>

#### SESSION_NNNN_TASK_02 — <title>

- **Agent:** ...
- **What:** ...
- **Steps:** ...
- **Done means:** ...
- **Depends on:** ...

### Parallelism

<Which tasks can run concurrently? Which must be sequential? Sub-agents on disjoint file sets → parallel on main. Overlapping code files → sequential, or git worktrees if justified.>

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_NNNN_TASK_01 | <agent> | <one-line rationale> |
| SESSION_NNNN_TASK_02 | <agent> | <one-line rationale> |

### Open decisions

<Bullet list of anything requiring user sign-off before execution. "None." is a valid answer.>

### Risks

<Anything that could block or derail. "None at plan-lock." is a valid answer.>

### Scope guard

<Bullets of what NOT to do this session. Adjacent tech debt or ideas go under `Open decisions / blockers`, not inline.>

### Dirstarter implementation template

- **Docs read first:** <URLs + date checked | not applicable>
- **Baseline pattern to extend:** <feature folder, Prisma/service shape, auth/action chain, integration helper, component primitive>
- **Custom delta:** <what Ronin adds on top of the purchased boilerplate>
- **No-bypass proof:** <why this is not replacing a Dirstarter capability without reason>

## Cody pre-flight

<!-- Required before any Cody task that writes code. See docs/protocols/cody-preflight.md. Repeat the subsection per pre-flighted task. Abbreviate for pure docs/governance work. -->

### Pre-flight: <task title>

#### 1. Existing component scan

- Graphify query used: `<query>`
- Found: <list of existing components/actions found>

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes | no
- Consulted live alignment URLs: yes | no
- Closest L1 pattern: <pattern>
- Primitive API spot-check: <one-line per primitive used>

#### 3. Composition decision

- Extending existing component: <component>
- Composing existing components: <Button, Stack, Card, etc.>

#### 4. Lane docs loaded

- Prior SESSION next session read: yes
- ADR read: `<ADR path | none>`
- Runbook consulted: `<runbook path | none>`

#### 5. Dev environment confirmed

- Dev server command: `<pnpm --filter @ronin-dojo/web dev | other>`
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: <local app host | other>

#### 6. FAILED_STEPS check

- Prior failures in this area: <FS-NNNN | none>
- Mitigation acknowledged: <one line>

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_NNNN_TASK_01 | pending | TBD |
| SESSION_NNNN_TASK_02 | pending | TBD |

<!-- At task close: pending → landed | blocked | rejected. -->
<!-- For detailed task logs, replace the table above with H3 entries: -->
<!-- ### SESSION_NNNN_TASK_01 — <title> -->
<!-- Prose description of what was done, decisions made, evidence. -->

## What landed

<!-- Filled at bow-out. Bullet list of concrete outcomes. -->

## Decisions resolved

<!-- Bullets of decisions locked during the session (Petey grill, mid-session pivots). -->

## Files touched

<!-- Filled at bow-out. Table of file + one-line change description. -->

| File | Change |
| --- | --- |
| `<path>` | <one-line change> |

## Verification

<!-- Filled at bow-out. Table of command/smoke check + result. -->

| Command / smoke | Result |
| --- | --- |
| `<command>` | <result> |

## Open decisions / blockers

<!-- Anything carried forward. "None." is valid. Adjacent tech debt that surfaced mid-task lands here. -->

## Next session

### Goal

<One sentence on what the next session should accomplish.>

### First task

<One paragraph on the first concrete step the next session should take.>

## Review log

<!-- Filled at bow-out. See docs/protocols/review-recommend.md + hostile-close-review.md. -->

### SESSION_NNNN_REVIEW_01 — <short title>

- **Reviewed tasks:** SESSION_NNNN_TASK_01, SESSION_NNNN_TASK_02
- **Dirstarter docs check:** live docs checked | cached docs sufficient | not applicable
- **Verdict:** <one blunt paragraph>
- **Score:** <N.N/10>
- **Follow-up:** <one line>

## Hostile close review

<!-- Required for non-trivial sessions. See docs/protocols/hostile-close-review.md. For typo-only sessions: `Hostile close review: not applicable — typo/doc copy only`. -->

- **Giddy:** <pass | fail with one-line reason>
- **Doug:** <pass | fail with one-line reason>
- **Desi:** <pass | fail with one-line reason — only when UI/UX touched>
- **Kaizen aggregate:** <N/10> — <one-line justification>

### Findings (severity ≥ medium)

<!-- Omit this subsection entirely if no findings ≥ medium. -->

#### SESSION_NNNN_FINDING_01 — <title>

- **Severity:** high | medium
- **Task:** SESSION_NNNN_TASK_<NN>
- **Evidence:** `<file:line | URL>`
- **Impact:** <what breaks or what risk remains>
- **Required follow-up:** <next action>
- **Status:** open | addressed | accepted-risk

## ADR / ubiquitous-language check

- ADR update <required | not required>. <If required: which ADR and why. If not: which ADR was confirmed valid.>
- Ubiquitous language update <required | not required>. <New domain terms introduced? If yes, link the wiki entry.>

## Reflections

<!-- Two to four short paragraphs. The Kaizen lens: what was surprising, what almost broke, what process change would have helped. -->

## Full close evidence

<!-- Filled at bow-out. Proves each closing.md step ran. -->

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | <evidence> |
| Backlinks/index sweep | <evidence> |
| Wiki lint | <result> |
| Kaizen reflection | <evidence> |
| Hostile close review | <SESSION_NNNN_REVIEW_NN reference> |
| Review & Recommend | <Next session goal written> |
| Memory sweep | <evidence> |
| Next session unblock check | <evidence> |
| Git hygiene | <commit hash> |
| Graphify update | <new stats> |
