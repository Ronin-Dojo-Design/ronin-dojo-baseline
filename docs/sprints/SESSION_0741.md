---
title: "SESSION 0741 — next-session automation /ppp + wayfinder (plan lane)"
slug: session-0741
type: session--open # narrow at bow-out: likely session--plan
status: in-progress
created: 2026-08-03
updated: 2026-08-03
last_agent: claude-fable-session-0741
sprint: S13
lane: repo
lane_seq:
recipe: pp
vault_session:
goal_ids: [G-031, G-023]
tickets: ["413", "414", "415", "416"]
next_session:
pairs_with:

  - docs/sprints/SESSION_0739.md
  - docs/sprints/plans/petey-plan-0741-next-session-automation.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0741 — next-session automation /ppp + wayfinder (plan lane)

**Date:** 2026-08-03 · **Operator:** Brian + claude-fable-session-0741

## Goal

Run the `/ppp` + wayfinder planning lane on the next-session-automation question (intake =
the SESSION_0739 `/rr` report): grill the three collision tickets + remaining open
questions to operator picks, ratify the automation plan, stage the first build stub, and
chart the epic's wayfinder map. Docs only; one PR; push HELD.

## Status

Frontmatter `status:` is the single source of truth (`in-progress` → `closed`, SESSION_0342). Do not restate it here.

## Bow-in

- Previous session: `docs/sprints/SESSION_0739.md` — **EXTENDED** (plan-only goal landed +
  overshoot: PR #411 merged, /rr report delivered). This session consumes that report.
- Parallel session: `SESSION_0740` (#380 PR1 expand+backfill) live, `in-progress` — file
  sets disjoint; number 0741 minted with 0740 claimed, 0742 reserved via branch (ADR 0049).
- Branch/worktree: `session-0741-next-session-automation` @ `../ronin-0741` · clean · off
  `main` ec2eb62e. FS-0024 guard PASS (canonical pwd + `Ronin-Dojo-Design/black-belt-legacy`);
  FS-0035 respected (worktree taken; canonical untouched); githooks doctor PASS (bow-in hook).
- Parallel-lane assessment (opening.md 1d): n/a — operator-pinned single plan lane.
- FS-0048 read-before-build sweep: `research-review-next-session-automation.md` (full) ·
  `opening.md` (full) · goals-ledger G-031 row · `.claude/skills/wayfinder|pp|ppp/SKILL.md` ·
  `scripts/auto-session.sh` (stale guard `:39-42` + dead prompt `:54-89` verified firsthand) ·
  `_template/PROMPT_TEMPLATE.md` + `SESSION_TEMPLATE.md` · `scripts/bow-out-gates.sh` Gate
  13c (`:410-428`, detect-only confirmed) · `.claude/settings.json` hooks →
  `.claude/hooks/bow-in-gates.sh` · `recipes/lane.md` min-output contract (`:54-63`).
- On-demand blocks pulled: Grill outcome (below).

### Grill outcome (operator picks, mobile one-word round — 2026-08-03)

7 forks + 3 unvetoed defaults, recorded as **D1–D10** in
[petey-plan-0741](plans/petey-plan-0741-next-session-automation.md) §Pinned decisions —
the plan doc is the single home; headline: S5 **Inside** · auto-session **Refit** · card
schema **NOW** (operator override of the /rr defer rec) · baton **In-stub** · model **pin
at close** · Phase-3 scheduler **sibling, deferred** · headless cost **docs-only + cap 1**.

## Petey plan

Plan block ratified into [petey-plan-0741-next-session-automation.md](plans/petey-plan-0741-next-session-automation.md)
(slices B1–B5 + Phase 2/3; parallelism; risks; scope guard). Session-local tasks:

### Tasks

#### SESSION_0741_TASK_01 — Grill the forks (3 crux + 4 open Qs + 3 defaults)

- **Agent:** Petey (inline) · **Depends on:** nothing
- **What / steps:** AskUserQuestion rounds off the /rr report's §Open questions + 3 tickets.
- **Done means:** every fork pinned (D1–D10). ✅

#### SESSION_0741_TASK_02 — Ratified plan doc

- **Agent:** Petey (inline) · **Depends on:** TASK_01
- **Done means:** `docs/sprints/plans/petey-plan-0741-next-session-automation.md` exists,
  status: ratified, slices carry done-means. ✅

#### SESSION_0741_TASK_03 — Staged build stub (B1)

- **Agent:** Petey (inline) · **Depends on:** TASK_02
- **Done means:** `docs/sprints/SESSION_0742.md` `status: staged`, self-contained kickoff
  (first D4 exemplar), `autonomy:`/`model:` facets, number reserved via branch. ✅

#### SESSION_0741_TASK_04 — Wayfinder map + crux tickets

- **Agent:** Petey (inline, gh) · **Depends on:** TASK_01
- **What / steps:** chart `wayfinder:map` issue (Destination/Notes/Decisions/fog/out-of-scope);
  create the 3 crux `wayfinder:grilling` tickets, resolve + close with today's picks.
- **Done means:** map issue live; 3 tickets closed with resolution comments; numbers in
  `## Artifacts` + frontmatter `tickets:`.

#### SESSION_0741_TASK_05 — Close: wiki:lint + one docs PR, push HELD

- **Agent:** Petey (inline) · **Depends on:** TASK_02–04
- **Done means:** `bun run wiki:lint` 0 errors; one commit on the session branch (explicit
  paths); push + PR awaiting Brian's word.

### Parallelism

Sequential — one plan lane, one writer.

### Open decisions / risks

None blocking — all forks pinned (D1–D10). Risk register lives in the plan doc §Risks.

### Scope guard

NO product code, no gate/hook/template edits (that's B1/SESSION_0742), no ledger writes
(proposals below), no opening.md edits (B4 owns), no push/merge without the word.

## Cody pre-flight

n/a — no code written (plan/docs lane).

## Proposed ledger edits (single-writer discipline — for the bow-out router)

- **goals-ledger:** new G-023-child row — "Next-session automation epic (bow-in as
  dispatch)" — status in-progress, plan = petey-plan-0741, slices B1–B5; cross-ref G-031
  (per D1, S5-remainder + S4 absorbed into this epic's B3/B4; G-031 row gains a pointer
  note, its S4/S5 not re-scoped elsewhere).
- **drift-register (candidate):** `ronin-project-context.md:72-77` still monorepo-era
  (contradicts ADR 0055/0059) — conform flag inherited from the /rr report, unrouted there.

## Delivered

<!-- Bow-out fills. -->

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0741_TASK_01 | landed | D1–D10 pinned (plan doc §Pinned decisions) |
| SESSION_0741_TASK_02 | landed | petey-plan-0741-next-session-automation.md (ratified) |
| SESSION_0741_TASK_03 | landed | SESSION_0742.md staged stub (first in-stub baton exemplar) |
| SESSION_0741_TASK_04 | landed | wayfinder map [#413](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/413) + crux tickets #414/#415/#416 closed with resolutions |
| SESSION_0741_TASK_05 | pending | wiki:lint + commit; push HELD |

**Decisions resolved:** D1–D10 (see plan doc).

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | <pending> |

## Artifacts

| Artifact | Purpose | Status |
| --- | --- | --- |
| [Wayfinder — Next-session automation (#413)](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/413) | epic decision index (tickets #414–#416 resolved) | keep |

## Open decisions / blockers

None. Push/PR BLOCKED ON USER word (by design).

## Next session

- **Goal:** Execute automation-epic slice B1 (SESSION_0742 — already staged, self-contained).
- **First task:** paste the kickoff embedded in `docs/sprints/SESSION_0742.md` (D4 — the
  stub IS the baton).
- **Kickoff prompt:** n/a here — lives in the staged stub per D4 (Gate 13c pointer:
  `docs/sprints/SESSION_0742.md` carries the filled PROMPT_TEMPLATE fenced block).

## Close evidence
