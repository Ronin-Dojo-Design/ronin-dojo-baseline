---
title: "ADR 0052 — Lean single-lane, baton-handoff session model (Plan · Build · QAR)"
slug: 0052-lean-single-lane-baton-session-model
type: adr
status: accepted
created: 2026-07-22
updated: 2026-07-22
last_agent: claude-session-0617
pairs_with:
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/protocols/petey-plan.md
  - docs/protocols/code-quality-matrix.md
  - docs/knowledge/wiki/goals-ledger.md
backlinks:
  - docs/sprints/SESSION_0617.md
  - docs/knowledge/wiki/index.md
---

# ADR 0052 — Lean single-lane, baton-handoff session model

**Status:** accepted (SESSION_0617 operator grill via `/grill-with-docs`, 9 decisions locked). Reshapes
how a session is scoped and opened; **ratification artifact only** — the conform-cascade (reworking
`opening.md`, migrating the `lane:` facet, building the skills) is the G-031 build lanes (S1–S6), not
done here.

## Context

Today's bow-in ([`opening.md`](../../rituals/opening.md)) front-loads WORKFLOW_6.0 + SOT_Cookbook + four
ledgers + the task→workflow router + all five agent definitions **before a single line is scoped**. That
"all-hands, load-everything" shape is right for a mixed session but wasteful when the session is really
*one* build slice or *one* QA pass — the exact token cost the operator wants to cut. The old
`ronin-dojo-monorepo` `WORKFLOW_4.0` / `BATON.md` pattern (separate **planning window** and **execution
window**, fresh context each, a baton handoff between) worked well and is the model to generalize.

A second, compounding problem surfaced while scoping this: **skills get discussed but never built.** An
audit this session found `/car` referenced in **11** past session transcripts and never created (also
`/cac`, `/cas`, `/ppp`, `/ggr`) — with no durable record of the gap, they get re-litigated every session.

## Decision

Adopt a **lean single-lane, vertical-slice, baton-handoff** session model. Nine decisions (SESSION_0617):

1. **Planning skill.** ONE `petey-plan` skill, two modes — `/pp` = Parse→Plan, `/ppp` = `/pp --prompt`
   (also emits the paste-ready handoff prompt = the baton). The plan-only path (`/pp`) is preserved for
   bow-out staging / review-before-build. (Neither `/pp` nor `/ppp` existed as a file before — they were
   verbal conventions over [`petey-plan.md`](../../protocols/petey-plan.md).)
2. **Axis naming.** `lane:` now means **pipeline stage**; the brand axis (`repo | rdd | mmb | bbl | bma |
   usa`, formerly `lane:` per ADR 0049) is renamed **`brand:`**; a new **`stage:`** may be introduced.
   A session is one `brand:` × one `lane:`(stage). Honors the operator's own usage ("intake lane", "QAR lane").
3. **Lane set = 3: Plan · Build · QAR.** Intake folds into the Plan session; "Fix" is a QAR→Build
   back-edge, not its own lane. A lane earns a slot only if it is a distinct agent + distinct context +
   a real operator checkpoint.
4. **Lane → agent.** Plan → **Petey**; Build → **Cody**; QAR → **Giddy** (`/ggr`).
5. **`/ggr` = universal closing gate**, folded into bow-out; the **rubric flexes by lane** (Build →
   [code-quality-matrix](../../protocols/code-quality-matrix.md) `/10`; Plan → plan-quality; Intake →
   framing). This is how "QAR every session" coexists with a pure planning lane that has no code to score.
6. **Gate policy.** **≥9.0 clears** (the matrix's own ship line); 7.0–8.9 auto-loops up to **2** Giddy
   passes then hits the operator gate; **hard caps always loop** (behavior regression · Class-A bypass ·
   undocumented new pattern). Operator gate = accept / try-again / keep-improving.
7. **Baton = the staged-stub + Next-session block** (ADR 0049), formalized to carry the lane's typed
   output (intake card → `/ppp` prompt → diff ref → verdict). **No parallel handoff doc** (avoids the
   `BATON.md` + `CHAT_HANDOFF.md` drift the monorepo hit). The `/app/loop-board` KanbanCard is the *visual*.
8. **Skills tracker (SSL) = lean.** ONE `skills-index.md`: a **generated** built-half (script reads every
   `.claude/skills/*/SKILL.md` frontmatter — never drifts) + a tiny **hand-maintained** "proposed /
   discussed-not-built" backlog in the format `ledger-backlog.ts` already parses (so it surfaces at bow-in).
   **Not** a full `SSL-00*.md` ledger family — never hand-track what a skill already declares.
9. **Bow-in shape.** ONE **discover-then-load** `/bow-in` (guards · canonical claim · pull the queue ·
   Petey's 3 questions — *what are we doing? / what's queued? / are we pivoting?* · classify the lane ·
   load only that lane's context pack) **+** `/intake · /build · /qar` as **anytime fast-path entries**.
   Default one lane per session; **Plan+Build may fuse** when the slice is tiny.

**Also:** published Artifacts are logged in a `## Artifacts` SESSION section with a `keep / discard /
promote` status (added to the SESSION template + closing ritual this session).

## Consequences

- **Cheaper sessions.** Only a lane's pack loads, not the whole OS + five agents. The token win is the point.
- **The `lane:` facet migrates** (`lane:`→`brand:`, add `stage:`) across SESSION frontmatter + `--lane=`
  filters + the ledger/board parser — a mechanical governance change (G-031 S4). Existing SESSION files
  and tooling break until migrated; do it as one sweep.
- **Every session ends at Giddy's gate** with an operator accept/loop decision — more gating, but the
  ≥9.0-clears + 2-retry policy bounds it, and the operator can always accept.
- **The build is staged, not done here** (G-031 S1–S6): S1 SSL *(this session)*; S2 `/pp`·`/ppp`; S3
  `/ggr`; S4 facet migration; S5 `opening.md` rework (HIGH — own Build+QAR); S6 this ADR.

## Alternatives considered

- **4-lane taxonomy (Intake · Plan · Build · QAR).** Rejected in favour of 3 — the operator's model folds
  Intake into the Plan session; Intake shares Petey + context with Plan.
- **`/wayfinder` epic map** for the whole redesign. Rejected — wayfinder's own rule is "don't chart until
  there's fog too big for one session"; this converged in one grill, so a research-review-style capture +
  this ADR is right-sized.
- **Full `SSL-00*.md` ledger family** like the other ledgers. Rejected — it would duplicate by hand what
  SKILL.md frontmatter already declares, and drift. Generated-index + a tiny proposed backlog is DRY.
- **Dedicated `BATON.md` per slice** (the literal old-monorepo artifact). Rejected — reintroduces the
  two-doc staleness the monorepo notes flagged; the staged stub already is the baton.

## Dirstarter docs proof

Not applicable — this ADR touches session-orchestration governance, not a Dirstarter baseline layer
(no project-structure / Prisma / auth / payments / storage / deploy / content / theming change).
