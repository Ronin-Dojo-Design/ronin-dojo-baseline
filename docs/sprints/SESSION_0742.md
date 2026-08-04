---
title: "SESSION 0742 — Automation epic B1: self-contained stub + facets + Gate-13c/hook extension"
slug: session-0742
type: session--open
status: staged
created: 2026-08-03
updated: 2026-08-03
last_agent: claude-fable-session-0741
sprint: S13
lane: repo
lane_seq:
recipe: seq-lane-build
autonomy: attended-only # D8 — never headless-ok by default; operator may flip at paste. (Facet previews the B1 convention this very lane builds — first exemplar, plan D4/D5.)
model: "Opus 5 (fast mode)" # D5 staging pin (PROMPT_TEMPLATE routing rec, docs/governance lane); operator override at paste wins.
vault_session:
goal_ids: [G-031, G-023]
tickets: []
next_session:
pairs_with:

  - docs/sprints/SESSION_0741.md
  - docs/sprints/plans/petey-plan-0741-next-session-automation.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0742 — Automation epic B1: self-contained stub + facets + Gate-13c/hook extension

**Date:** staged 2026-08-03 (SESSION_0741) · **Operator:** Brian + <agent>-session-0742

## Goal

Execute **slice B1** of the ratified automation plan
([petey-plan-0741](plans/petey-plan-0741-next-session-automation.md) §B1): flip the baton
convention to in-stub (D4), add the `autonomy:`/`model:` stub facets (D5/D8), extend Gate
13c (incl. the D10 headless fail mode), and extend the `bow-in-gates.sh` SessionStart
hydration. All decisions are pinned in the plan — grill nothing.

## Kickoff prompt (D4 — the baton lives HERE; this stub is self-contained)

```text
/bow-in — SESSION_0742 = Automation epic B1: self-contained stub + facets + Gate-13c/hook
extension (build lane). Act as PETEY orchestrator (Opus 5 fast mode — sub-work stays on this
model). Repo: black-belt-legacy (ONE repo, ADR 0059).

FS-0024 GUARD FIRST, before ANY mutating git: pwd + `git remote -v` must be the
black-belt-legacy canonical (/Users/brianscott/dev/black-belt-legacy, remote
Ronin-Dojo-Design/black-belt-legacy) — never the read-only dirstarter_template, never a
sibling brand repo. On mismatch STOP and paste pwd + git remote -v verbatim. ADOPT-STUB:
SESSION_0742 is pre-staged (status: staged) — adopt it (flip to in-progress, no cp, ADR
0049). Worktree-isolation law: canonical-claim.sh check decides; branch
session-0742-automation-phase0 is ALREADY reserved (adopt it, don't re-create).

RECIPE: seq-lane-build — the plan doc IS the spec:
docs/sprints/plans/petey-plan-0741-next-session-automation.md §B1 (+ §Pinned decisions
D4/D5/D8/D10, §Risks 3). Re-read the /rr report Phase-0 section for the hydration field
list: docs/architecture/research/research-review-next-session-automation.md.

WHY THIS SESSION: G-031∩G-023 automation epic, slice B1 (SESSION_0741 ratified all forks —
re-litigate NOTHING). Done = a staged stub validates through the extended Gate 13c, a
synthetic headless-ok stub with an unpinned fork marker FAILS it (D10), and a SessionStart
run shows the hydration block (stub path + Goal + First-task + recipe: + autonomy: + top-3
board picks via board-backlog --json).

BRANCH: session-0742-automation-phase0 (reserved) off current main (explicit
git pull --ff-only origin main first). Commit-only in-lane — YOU push foreground on the
operator's word. NEVER git add -A (FS-0035 — stage explicit paths only).

SCOPE = n/a — governance lane, exactly this file set:
docs/sprints/_template/SESSION_TEMPLATE.md · docs/sprints/_template/PROMPT_TEMPLATE.md ·
scripts/bow-out-gates.sh (Gate 13c block only) · .claude/hooks/bow-in-gates.sh ·
docs/rituals/closing.md (baton wording) · .claude/skills/bow-out/SKILL.md if it restates
the baton home (FS-0037 skill-body rule). Nothing else.

TIERED WORK:

- T1 DEEP — the six files above: full edit passes.
- FROZEN REVIEW-ONLY — shared ledgers, goals-ledger, opening.md (B4 owns its rework):
  findings route to the SESSION file Proposed-ledger-edits; zero edits.

HARD CONSTRAINTS: Gate 13c stays green for BOTH baton homes during this one transition
session, then tightens (plan §Risks 3) · hooks stay <30s timeout · detect-only philosophy
holds EXCEPT the D10 headless fail mode · no secrets/PII into git · tests never weakened.

INHERITED LAWS (do NOT re-open): plan D1–D10 · ADR 0049 (staged stubs) · ADR 0052 D7 (no
parallel baton doc) · single-state-file doctrine · main PR-only, server-enforced.

RUN ORDER (grade-drives-fix-drives-re-gate):
1. Template edits (SESSION_TEMPLATE facets + kickoff section; PROMPT_TEMPLATE fill-target
   flip) — grader: Giddy conformance read — done-means: templates carry autonomy:/model: +
   in-stub kickoff section; closing.md points at the stub.
2. Gate 13c extension + D10 fail mode — grader: Doug (run the gate runner) — done-means:
   13c PASS on this session's own stub; synthetic headless-ok+unpinned-fork stub FAILS.
3. bow-in-gates.sh hydration block — grader: Doug — done-means: manual bash run emits stub
   path/Goal/First-task/recipe:/autonomy:/top-3 board picks; degrades cleanly when no
   staged stub exists.
Final: Giddy /ggr — clear line 9.0+; composite recorded in the SESSION file.

BOW-OUT (closing.md, full close): findings routed with ids (§6.7) · re-run bun run
wiki:lint after close content · stage SESSION_0743 stub per the NEW in-stub convention ·
HOLD the one close push for Brian's explicit word — /bow-out is NOT push authorization.

STANDING RULES: you NEVER merge · never push to main from a worktree · SotD kernel + shared
ledgers frozen · Brian may be on mobile — SHORT, one line per step, forks one-word · on any
limit/config/sandbox error STOP and paste the EXACT error verbatim; if unknown, say "I
don't know."

FIRST LINE BACK: FS-0024 canonical status + "adopted stub 0742 on reserved branch" + the
one-line B1 file set.
```

<!-- Sections below filled by the executing session per SESSION_TEMPLATE / closing.md. -->
