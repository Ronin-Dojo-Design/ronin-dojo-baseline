<!--
PROMPT_TEMPLATE.md v1 (SESSION_0734) — the paste-ready session-kickoff prompt, generalized from the
SESSION_0731 all-hands-polish stub (/pp-generated at the 0730 close; format operator-validated across
0731/0732). This is the KICKOFF twin of SESSION_TEMPLATE.md: that file is the session RECORD the agent
maintains; this file is the PROMPT the operator pastes (Dispatch / new chat) to start the session.

Use:

1. At bow-out (or any staging moment), copy the body below the ──8<── line and replace every
   {PLACEHOLDER}. Delete any section marked (omit if n/a) that doesn't apply — an empty heading is
   worse than no heading.
2. Placeholders are {CURLY_CAPS}. Multi-line placeholders say so. Nothing outside braces should need
   editing — if it does, the template drifted: fix it HERE, not in the filled copy.
3. The filled copy is never a standalone file (single-state-file doctrine): it IS the closing
   SESSION record's `## Next session` section — Goal + First task lines, then the filled prompt in
   a fenced block (SESSION_0734 convention, operator-directed).

House-style anchors (extend, never fork): petey-plan.md (tasks carry done-means), review-wave.md
(per-lens graders; reviewers verify, builders fix), quality-suite.md (diff-bounded scope; behavior-
preserving default), closing.md (bow-out contract), ADR 0049 (staged stubs), FS-0024/0035 (guards).
-->
---
title: "PROMPT_TEMPLATE — paste-ready session kickoff prompt"
slug: prompt-template
type: protocol
status: active
created: 2026-08-01
updated: 2026-08-01
last_agent: claude-session-0734
pairs_with:

  - docs/sprints/_template/SESSION_TEMPLATE.md
  - docs/protocols/petey-plan.md
  - docs/protocols/recipes/review-wave.md
  - docs/protocols/recipes/quality-suite.md
  - docs/rituals/closing.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# PROMPT_TEMPLATE — session kickoff prompt

Everything below the scissors line is the template. Placeholder legend:

| Placeholder | Fill with |
| --- | --- |
| `{SESSION_N}` / `{SESSION_N+1}` | 4-digit session number (verify with `bun scripts/ledger-id-next.ts --prefix=SESSION`) |
| `{LANE_TITLE}` | one-line lane name, e.g. `#377 CI rank-read guard (build lane)` |
| `{MODEL}` | orchestrator model, e.g. `Fable 5` |
| `{RECIPE}` | the named protocol card/skill this session hydrates from (`seq-lane-build`, `seq-review-wave`, `quality-suite`, `pp`, …) |
| `{WHY_THIS_SESSION}` | 2–4 lines: map node (`#NNN`), what the last session left, what this one must prove, "done" in one sentence |
| `{BRANCH_NAME}` | `session-{SESSION_N}-<lane-slug>` |
| `{COMMIT_SET}` | the exact commits/range bounding the scope (or `n/a — <scope statement>` for ops/proof lanes) |
| `{TIER_1_FILES}` … `{FROZEN_FILES}` | explicit file/dir lists per tier; `{FROZEN_ROUTE}` = where frozen-tier findings route |
| `{DOMAIN_LAWS}` | the ratified invariants this lane must not regress (cite ADR/ledger ids) |
| `{INHERITED_LAWS}` | operator-ratified decisions from prior closes that reviewers must NOT re-open |
| `{LENS_GRADER_n}` / `{DONE_MEANS_n}` | per-step reviewing lens (roster agent or skill) + the measurable artifact/state that proves the step |
| `{GGR_TARGET}` | the /ggr clear line for this session, e.g. `9.8+` |
| `{FIRST_LINE}` | what the agent's first line back must confirm |

──────────────────────────────8<──────────────────────────────

/bow-in — SESSION_{SESSION_N} = {LANE_TITLE}. Act as PETEY orchestrator ({MODEL} — sub-work stays
on {MODEL} unless a handoff to Codex says otherwise). Repo: black-belt-legacy (ONE repo, ADR 0059).

FS-0024 GUARD FIRST, before ANY mutating git: pwd + `git remote -v` must be the black-belt-legacy
canonical (`/Users/brianscott/dev/black-belt-legacy`, remote `Ronin-Dojo-Design/black-belt-legacy`)
— never the read-only dirstarter_template, never a sibling brand repo. On mismatch STOP and paste
`pwd` + `git remote -v` verbatim — do NOT mutate the wrong tree. ADOPT-STUB: SESSION_{SESSION_N} is
pre-staged (`status: staged`) — adopt it (flip to `in-progress`, no `cp`, ADR 0049). Worktree-isolation
law: don't edit in canonical if a co-session is live (`canonical-claim.sh check` decides).

RECIPE: {RECIPE} — the named protocol this session hydrates from; its card/skill is the spec,
this prompt only pins the lane specifics.

WHY THIS SESSION: {WHY_THIS_SESSION}

BRANCH: `{BRANCH_NAME}` off current `main` (explicit `git pull --ff-only origin main` first).
Commit-only in-lane — Codex/sub-agents commit, YOU push foreground on the operator's word. NEVER
`git add -A` (FS-0035 — stage explicit paths only).

CODEX ENV (Claudex — omit if n/a): from the worktree, codex commit-only —
`codex exec --cd <worktree> -s workspace-write --add-dir <canonical>/.git --ignore-user-config -c 'model_reasoning_effort="high"' - < <prompt-file>`.
In-sandbox gates that must stay green: `bunx tsc --noEmit` · `bun run test` (--parallel=1) ·
`bun run lint` (writes files → stage explicitly). The full `next build` + every push run FOREGROUND
on the operator side (Keychain build wall; in-sandbox `next build` SIGSEGVs on prisma generate =
ENVIRONMENTAL, never report as a code failure). Codex commits only; YOU push + run the build gate
in a normal shell.

SCOPE = {COMMIT_SET} — pull the exact file list via `git show --stat {COMMIT_SET}`. The diff bounds
the work; out-of-scope findings route to ledgers (closing.md §6.7), never inline fixes.

TIERED WORK:

- T1 DEEP — {TIER_1_FILES}: full improvement passes.
- T2 SHARED-DEDUP — {TIER_2_FILES}: consolidate duplication/clone families only; no redesign.
- T3 VERIFY-NOT-REWRITE — {TIER_3_FILES}: prove behavior, touch only what verification demands.
- FROZEN REVIEW-ONLY — {FROZEN_FILES}: findings route to {FROZEN_ROUTE}; zero edits.

HARD CONSTRAINTS: behavior parity — polish/refactor never changes user-visible behavior and every
refactor is re-verified · {DOMAIN_LAWS} · tests never weakened (no deleted/softened assertions to
go green) · no secrets/PII into git.

INHERITED LAWS (do NOT re-open or regress): {INHERITED_LAWS}

RUN ORDER (grade-drives-fix-drives-re-gate — a failed grade loops the fix, then re-gates; nothing
closes on an ungraded fix):
1. {STEP_1} — grader: {LENS_GRADER_1} — done-means: {DONE_MEANS_1}
2. {STEP_2} — grader: {LENS_GRADER_2} — done-means: {DONE_MEANS_2}
3. {STEP_N…}
Final: Giddy `/ggr` — clear line {GGR_TARGET}; composite + caps recorded in the SESSION file;
anything unreached routes to a ledger row, never silently dropped.

BOW-OUT (closing.md, full close): findings routed N/N with ids (§6.7 router) · Graphify refresh
POST-MERGE ONLY · re-run `bun run wiki:lint` after writing close content · stage
SESSION_{SESSION_N+1} stub + fill this template for it — the filled prompt IS the closing record's
`## Next session` section · HOLD the one close push for Brian's explicit word — /bow-out is NOT
push authorization.

STANDING RULES: you NEVER merge (no active merge owner, 0641 closed) · `main` is PR-only,
server-enforced — never push to main from a worktree · hand-authored migrations only · SotD kernel +
shared ledgers frozen · Brian may be on mobile — SHORT readouts, one line per step, forks framed for
a one-word pick · on any limit/config/sandbox error STOP and paste the EXACT error text verbatim; if
unknown, say "I don't know."

FIRST LINE BACK: {FIRST_LINE}
