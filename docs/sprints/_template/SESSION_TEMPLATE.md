<!--
SESSION_TEMPLATE.md v2 (SESSION_0711) — the ~120-line core spine. Absorbs the still-true parts of
the retired chat-handoff.md (single-state-file doctrine, conventions below).

Use:

1. Bow-in: mint the number (`bun scripts/ledger-id-next.ts --prefix=SESSION`; adopt a `status: staged`
   stub instead of copying, per ADR 0049), else:
   cp docs/sprints/_template/SESSION_TEMPLATE.md docs/sprints/SESSION_NNNN.md
2. Replace every <placeholder>, delete every HTML comment, set `status: in-progress`.
3. Bottom sections (Delivered → Next session) are filled at bow-out by closing.md.

Conventions (from chat-handoff.md, retired):

- This file is THE state — one file per session, no parallel handoff/prompt files. The next bow-in
  reads: Goal (achieved?), Open decisions / blockers, Next session Goal + First task.
- NOT in this file: long narrative recaps (the diff is the recap), pasted code blobs, philosophy
  (operator memory), content copied from ADRs/plans (reference, don't copy).
- Numbering: 4-digit, monotonic, never reuse or recycle; gaps stay burned (ADR 0049).
- Previous session never closed → docs/runbooks/dev-environment/unclean-close-recovery.md.

On-demand blocks (pull in ONLY when triggered; reference by one line otherwise):

- Cody pre-flight artifact — required before any code (docs/protocols/cody-preflight.md, §0 arch-gate
  first). Paste the filled checklist as `## Pre-flight: <task>` when a task writes code.
- Dirstarter alignment table — required when the task touches an L1 area (storage, payments, media,
  content, monetization, blog, auth, theming, Prisma, hosting): baseline touched · extension-or-
  replacement · why justified · risk if bypassed · live docs checked.
- Graphify check / Grill outcome / Drift logged — add as `###` blocks under Bow-in only when they
  changed what you opened or decided.
-->
---
title: "SESSION NNNN — <one-line description>"
slug: session-NNNN
type: session--open # narrow at bow-out: session--plan | session--implement | session--review
status: in-progress
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
last_agent: <agent>-session-NNNN
sprint: <S#>
lane: repo # ADR 0049 lane facet: repo | rdd | mmb | bbl | bma | usa (usa = WEKAF-USA)
lane_seq: # optional per-lane ordinal (int); omit for lane: repo
recipe: # optional (G-023) — docs/protocols/recipes/<name>.md card this stub hydrates from
vault_session: # e.g. "MMB_SESSION_0006" when a vault twin exists
goal_ids: [] # goals-ledger IDs worked, e.g. [G-021]
tickets: [] # wayfinder issue numbers, e.g. ["233"]
next_session: # filled at bow-out with the pre-staged stub path (ADR 0049)
pairs_with:

  - docs/sprints/SESSION_<previous>.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION NNNN — <one-line description>

**Date:** <YYYY-MM-DD> · **Operator:** Brian + <agent>-session-NNNN

## Goal

<One paragraph. Should map to the previous session's "Next session: Goal" if there is one.>

## Status

Frontmatter `status:` is the single source of truth (`in-progress` → `closed`, SESSION_0342). Do not restate it here.

## Bow-in

- Previous session: `docs/sprints/SESSION_<previous>.md` — <one line: what shipped, how this continues it>
- Branch/worktree: `<branch>` @ `<path>` · status: <clean | carryover noted> · HEAD: `<short SHA>`
- Parallel-lane assessment (opening.md 1d): <ran — N disjoint candidates | none | n/a>
- On-demand blocks pulled: <none | Dirstarter table | Graphify check | Grill outcome | Drift logged — add as `###` blocks below when triggered>

## Petey plan

### Tasks

#### SESSION_NNNN_TASK_01 — <title>

- **Agent:** <Cody | Petey | Doug | Desi | Giddy | subagent type> · **Depends on:** <nothing | TASK_NN>
- **What / steps:** <one line + concrete steps>
- **Done means:** <artifact, file, or state change that proves it landed>

### Parallelism

<Concurrent vs sequential. Disjoint file sets → parallel; overlapping files → sequential or worktrees.>

### Open decisions / risks

<Anything needing user sign-off before execution; anything that could derail. "None." is valid.>

### Scope guard

<What NOT to do this session. Adjacent debt/ideas route to `Open decisions / blockers`, not inline.>

## Cody pre-flight

<Per code-writing task: run docs/protocols/cody-preflight.md (§0 arch-gate first) and paste the filled
checklist here as `### Pre-flight: <task>`. For docs/governance-only sessions: "n/a — no code written.">

## Delivered

<!-- Bow-out. ONE table = task status + what landed. Built-but-NOT-wired outcomes route to a
wiring-ledger WL row via closing.md §6.7, never a section here. -->

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_NNNN_TASK_01 | pending → landed \| blocked \| rejected | <concrete outcome; key files + one-line notes> |

**Decisions resolved:** <bullets or "None.">

## Verification

| Command / smoke | Result |
| --- | --- |
| `<command>` | <result> |

## Artifacts

<!-- Every Artifact PUBLISHED this session, with status: keep | discard | promote. "None." if none. -->

| Artifact | Purpose | Status |
| --- | --- | --- |
| [<title>](<url>) | <one-line> | keep / discard / promote |

## Open decisions / blockers

<Carried forward. "None." is valid. Note "BLOCKED ON USER" explicitly where true.>

## Next session

- **Goal:** <one sentence>
- **First task:** <first concrete step; cite inputs to read (3–5 paths max)>
- **Kickoff prompt:** fill `_template/PROMPT_TEMPLATE.md` and embed the paste-ready body below in a
  fenced block — this section IS the baton the operator pastes (SESSION_0734 convention)

## Close evidence

<!-- Bow-out. Merges the old Review log + Hostile close review + Full close evidence. -->

**/ggr composite:** <N.N/10> (≥9.0 clears, ADR 0052 D6) · **Caps applied:** <none | which>
**Systemic health:** CI = <green|red(url)> · findings routed <N/N (ids)> · FS patterns: <none|FS-NNNN>
**Reviewer verdicts:** Giddy <pass|fail — reason> · Doug <pass|fail — reason> · Desi <pass|fail — only when UI touched>
**Findings ≥ medium:** <none | per finding: severity · evidence `file:line` · impact · follow-up route (ledger id)>
**ADR / ubiquitous-language check:** <required + which | not required — which ADR confirmed valid>

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | <evidence> |
| Wiki lint | <command + counts; pre-existing vs introduced> |
| Reflections routing receipt | <N lessons → N routes (ids)> |
| Code-quality gate (Class-A) | <score /10 + caps, or "no Class-A custom code"> |
| Runtime verification (Doug) + artifact URL | <result + Artifact link, or "no runtime surface touched"> |
| Deferral guard (§6.8) | <clean | flags dismissed with reason> |
| Memory sweep · next-session unblock | <evidence> |
| Git hygiene · Graphify update | <branch/status/"single push — see git log" · node/edge counts> |

## Reflections

<!-- ≤5 bullets. Each MUST end with a route: `→ route: <ledger-id>` | `→ route: <file edited>` |
`→ route: no-action (<why>)`. An unrouted lesson is the evaporation failure §6.8 guards against. -->

- <lesson> → route: <ledger-id | file-edited | no-action (why)>
