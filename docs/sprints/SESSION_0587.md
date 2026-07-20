---
title: "SESSION 0587 — Overnight fan-out orchestrator + AM coffee merge review (4 lanes)"
slug: session-0587
type: session--open
status: in-progress
created: 2026-07-19
updated: 2026-07-20
last_agent: claude-session-0587
sprint: S12
lane: repo
goal_ids: [G-021, G-022, G-023]
tickets: []
pairs_with:

  - docs/sprints/SESSION_0582.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0587 — Overnight fan-out orchestrator + AM coffee merge review

> **Pre-staged stub (ADR 0049; PM_Planning_Lane dogfood).** Created at SESSION_0582 bow-out.
> The next bow-in ADOPTS this file: flip `status: staged` → `in-progress`, fill Date/Operator,
> then execute the Orchestrator instructions below — no `cp`, no re-planning. Every operator
> fork is ALREADY PINNED (SESSION_0582 PM_Plan grill) — re-open nothing. Numbers 0583–0586 are
> claimed by reservation branches; this stub claims 0587.

## Date

2026-07-20

## Operator

Brian + claude-session-0587

> **Adopt-time notes:** (1) Timing correction — NOT run overnight; adopted the morning of
> 2026-07-20 with the operator awake. Lanes dispatched immediately; verdicts surfaced live as
> they land instead of banked for an AM readout. (2) Model note — lanes dispatch at Sonnet as
> pinned; the orchestrator session itself runs on Fable 5 (telemetry recorded at close reflects
> the split).

## Goal

Dispatch the four pre-planned overnight lanes (0583–0586) as parallel background Cody builds
(model: sonnet), babysit to completion (resume on session-limit crashes), then — on the FINAL
lane landing — run the autonomous AM pre-review sweep (merge → gates → ledger application →
hostile review) and HOLD at the push gate for the operator's coffee-time word.

## Orchestrator instructions (execute at adopt, in order)

0. **Output mode: /caveman** (terse; technical substance intact). Session model: Sonnet 5
   (operator cost experiment — record this session's token telemetry in this file at close).
1. Flip frontmatter `status: staged → in-progress`; fill Date/Operator. Branch check:
   canonical checkout stays on `main`; the four lane branches already exist as reservations.
   **PRECONDITION (Giddy P1 — do not skip):** the SESSION_0582 sweep merges must be on
   origin/main before any lane dispatches — `git fetch origin && git merge-base
   --is-ancestor 8b53b962 origin/main || STOP` (escalation valve: the operator's push
   never landed; lanes would reset to a base missing S1 + the sweep). 0583's S1
   dependency and the AM merge-base both hang on this.
2. **Dispatch all four lanes in ONE parallel Agent-tool message** — `subagent_type: Cody`,
   `model: sonnet`, background. Each prompt = the lane block below, VERBATIM, prefixed with:
   *"You are Cody (Sonnet build agent) on an overnight lane dispatched by the SESSION_0587
   orchestrator with operator authorization (forks pre-pinned SESSION_0582 — re-open nothing).
   FIRST `Read /Users/brianscott/dev/ronin-dojo-app/.claude/skills/seq-lane-build/SKILL.md`
   and follow its invariant sequence + gotcha floor exactly; the specifics below override
   nothing in it."*
3. **Babysit:** on a lane's completion notification, note its report in the Task log. On a
   session-limit/API crash: when the limit resets, SendMessage-resume the SAME agent with:
   reassess disk state first (`git -C <worktree> status --short` + `log --oneline -3`), disk
   truth over memory, continue to completion.
4. **AM pre-review sweep (autonomous, fires the moment the FINAL lane lands — no waiting for
   the operator):**
   a. Merge into local `main`, `--no-ff`, in order **0584 → 0585 → 0586 → 0583**.
   b. Clean uncontended gates on merged main: `bun run test` · `bun run typecheck` ·
      `bun run lint:check` · `cd apps/web && bun run format:check` · `cd apps/web && npx next
      build`. (No lane should touch `schema.prisma`; if one did, STOP — valve below.)
   c. Apply every lane's "Proposed ledger edits" ONCE (single writer). Mint ids via
      `bun scripts/ledger-id-next.ts` for WL/FS prefixes; for the D prefix use
      drift-register max+1 (mint bug D-049 — verify no collision by grep first).
   d. Dispatch **Giddy** (subagent) for the hostile close review of the full merged diff
      (structure, canon conformance, ledger application, the D-023 pointer discipline on
      0584's docs). Record verdict in the Review log.
   e. Re-render the State-of-the-Dojo projection if 0585 landed its script (run it; publish
      via the Artifact tool to the EXISTING artifact URL if available in-session — else note).
   f. Write this file's Task log / What landed / Verification / evidence table. The
      operator's launchd/ntfy monitors pick up session state — no manual push notification.
5. **ESCALATION VALVE (Sonnet experiment boundary):** on ANY merge conflict, NO-GO or capped
   verdict, gate failure that isn't the documented shared-DB-contention class, schema change,
   or genuine ambiguity — STOP the sweep, keep all worktrees/branches intact, record exact
   state here, and write "RECOMMEND: rerun sweep under Opus 4.8/Fable" at the top of this
   file. Never force through.
6. **PUSH GATE: HELD — always.** Nothing pushes, merges to origin, or deploys until the
   operator's explicit morning word. Present: merged-diff summary, gate outputs, Giddy
   verdict, ledger delta, telemetry.

## Lane prompts (dispatch verbatim per instruction 2)

### LANE 0583 — `session-0583-technique-s2` · worktree `/Users/brianscott/dev/ronin-0583` · port 3583 · lane: bbl

```text
SESSION 0583 — G-022 Lane A slice S2 (design continuation; S1 merged on main). Read FIRST:
docs/epics/technique-graph-ga-fanout.md + goals-ledger G-022 Progress (SESSION_0582 sweep
entry) + docs/sprints/SESSION_0581.md (S1 evidence + the useReducedMotion-stale finding) +
docs/sprints/SESSION_0546.md (Desi spec) + wiring-ledger WL-P2-65/66.
SCOPE (exactly): C5 selected-neighborhood glow · D3 empty states INCLUDING AUD2-7 (curriculum
browser topic-filter grid: EmptyList + "Show all topics" reset — silent-empty is the defect) ·
B2 difficulty-term tooltips (graph-side) · WL-P2-65 export label clip (run the ledger's
disambiguation experiment FIRST, fix the winning variable, prove with REAL export bytes) ·
WL-P2-66 reduced-motion cascade fix in lib/utils.ts popoverAnimationClasses — fix ONCE, prove
computed animation-name: none on ≥2 consumer surfaces under emulated reduce; PREFER the CSS
motion-reduce idiom over motion/react useReducedMotion (S1 proved the hook returns stale
values under flipped reduce — SESSION_0581 finding); lib/utils.ts is a SHARED PRIMITIVE ⇒ run
the affected e2e per the standing gate (e2e DB is hermetic ronindojo_e2e — migrate + db:seed
in the worktree first; FS-0031).
OWNED: components/web/techniques/* · components/web/curriculum/* · lib/utils.ts ·
server/web/techniques/node-tooltip.ts + graph-query.ts (+tests) if B2 needs DTO fields —
NO-LEAK invariant is law (scalar-only select pinned by test; locked ⇒ no url/no media-id
poster; re-prove if graph-query/node-tooltip change).
NON-GOALS: S3/S4 · the beta flip · bbl-bjj-graph.json · prisma anything · server routers /
dashboard / technique-detail / progress files (Lane B's shipped surface) · curriculum
queries.ts keyPointsFromNotes parse contract (READ-only dependency) · new deps (NO Lenis).
CONFORMS — DO NOT TOUCH: F4 dual tints · D-5 roving tabindex · B1 tooltip no-media DTO · C2
layoutId pill · AUD-4 wheel gate · export snapshot/restore (rgb() literals in lockstep) ·
S1's shipped items (C4 easing, ZOOM_MIN bypass, pan-y touch, toolbar density).
RUNTIME PROOFS: dev server port 3583; computed-style probes for every motion/reduced-motion
claim; real export bytes for WL-P2-65; screenshots into docs/sprints/_assets/.
```

### LANE 0584 — `session-0584-workflow6` · worktree `/Users/brianscott/dev/ronin-0584` · docs+governance · lane: repo

```text
SESSION 0584 — G-023 governance build (operator-elected FULL scope incl. personas). Read
FIRST: goals-ledger G-023 (the ratified fork list IS the spec) + docs/sprints/SESSION_0574.md
(the extended grill) + SESSION_0582 §Bow-out sweep queue items 3/4/5/6/7 + drift D-049 +
docs/protocols/fan-out-session-recipe.md + agent-systems-map §1/§4.
BUILD: (1) WORKFLOW_6.0.md — thin ~150-line pointer-first spine; WORKFLOW_5.0 kept with a
supersede banner (its rituals read is DEAD canon). (2) SOT_Cookbook.md at docs/protocols/ —
1-screen router; agent-systems-map §1 router table MOVES here, map demotes to concept + gets
cross-ref; rename session-ops-cookbook.md → session-command-log.md (banner + link sweep).
(3) docs/protocols/recipes/: orchestrator · epic-plan · lane · review-wave · merge-wave
(merge-wave RETIRES giddy-merge-strategy.md via supersede banner, G0–G4 gates ABSORBED not
lost) · PM_Planning_Lane · AM_Coffee_Merge_Review (encode: completion-trigger not cron;
escalation valve; auto-session.sh + autonomous-sessions.md as the headless driver prior art;
fork-pinning as the autonomy gate; no-overnight-push law). Cards use the vault 90_Templates
generalized format (persona pack + load-set + overlays + minimum-output contract) and become
the SOURCE DOCS the seq-* skills point at (document the `recipe:` stub frontmatter key).
(4) Ritual edits (you OWN docs/rituals/ tonight): closing.md §6a — evidence-artifact policy
(required when Doug ran live UAT, on-request otherwise) + matching deterministic check in
scripts/bow-out-gates.sh (Runtime-verification cell ≠ "no runtime surface touched" ⇒
Evidence-artifact-URL row required); opening.md — new step 1d parallel-lane assessment (after
electing the lane, scan for disjoint-provable sibling lanes) + fix step 2's dead 5.0 mandate
to point at 6.0. (5) Persona consolidation: merge each docs/agents/*.md's unique content into
.claude/agents/*.md (LEAN — short identity section; agent-file body taxes every dispatch),
docs/agents/*.md → D-023 pointer stubs, repoint ritual/doc cross-refs, refresh .agents/
hardlinks (`ln -f`). (6) Per-agent "Allowed skills / never" section in each .claude/agents/
*.md sourced from agent-systems-map §4. (7) NEW .claude/skills/seq-research-recommend/
SKILL.md — thin pointer over docs/protocols/review-recommend.md + the graphify prior-art step
(+ .agents hardlink). (8) Fix D-049: scripts/ledger-id-next.ts D-prefix scan (register max
D-049 vs claimed D-516) + add a mint-vs-ledger-max self-check (warn on gap > 50). (9) One-line
audit: verify hostile-close findings hydrate ledgers via closing.md §6.7 across the last ~10
closes; note compliance gaps as proposed rows.
OWNED: docs/protocols/* (EXCEPTION: docs/protocols/state-of-project-projection.md belongs
to Lane 0585 — never touch it) · docs/rituals/* · docs/agents/* · .claude/agents/* ·
.claude/skills/seq-research-recommend/ · .agents mirrors · docs/knowledge/wiki/
agent-systems-map.md · scripts/bow-out-gates.sh · scripts/ledger-id-next.ts.
BACKLINK-SWEEP SCOPE (Giddy): rename/retire reference fixes may edit ONLY files inside
your owned set; every stale reference found OUTSIDE it gets listed in your Proposed
ledger edits for the AM sweep — never edited directly.
NON-GOALS: apps/web + clients anything · goals-ledger row REWRITES (additive proposals only)
· brand SOT README cards + --lane= ledger views (ledgered G-023 continuation — propose the
child, don't build) · the seq-lane-build/seq-review-wave skill bodies (light touch-ups OK if
a recipe card contradicts them — card wins, note it).
GATES: bun run wiki:lint (0 new errors) · every renamed/retired doc gets banner + backlink
sweep (grep old names repo-wide) · bow-out-gates.sh change proven by a dry run.
```

### LANE 0585 — `session-0585-sot-dashboard` · worktree `/Users/brianscott/dev/ronin-0585` · scripts-only · lane: rdd

```text
SESSION 0585 — State-of-the-Dojo projection, slice 1 (feed + render). Read FIRST:
docs/sprints/SESSION_0582.md (§PM_Plan + the mock v3 design decisions: brand tab = skin ×
lane filter; semantic tokens invariant; belt ladder = RDD house language, neutral labels
under MMB skin; "Needs you" block; sessions-are-cards; honest empties; provenance footer) +
scripts/ledger-backlog.ts + docs/knowledge/wiki/goals-ledger.md format + 3 recent
docs/sprints/SESSION_NNNN.md frontmatters.
BUILD: (1) additive sources in scripts/ledger-backlog.ts --json (KEEP the default text output
BYTE-STABLE — bow-in consumers depend on it; new data = new JSON fields only): sessions
(frontmatter scan of docs/sprints/SESSION_*.md → {number,title,status,lane} where staged=
planned, in-progress=in flight, closed=done) + goals detail (G-rows → {id,status,priority,
lane?,summary}). (2) NEW scripts/state-of-project.ts: consumes that JSON + gh (PR count) and
renders the full self-contained HTML dashboard to a path argument (default a gitignored
out/ path — NEVER commit renders): masthead "State of the Dojo" WITH a "name pending operator
ratification" provenance note (Brandon pass) · RDD/BBL/MMB tabs = skin × lane filter exactly
per the v3 mock (data-brand token blocks; BBL crimson hsl(1 79% 51%) with darkened crit;
MMB #ff6a1a with neutral state labels; semantic good/warn/crit NEVER re-skinned) · work
board (sessions as cards, mobile order in-flight-first) · goal belt-ladders · goal ladder
table · risk watch · needs-you (derive from: push-gate-held sessions + rows tagged operator-
pending) · render timestamp. Belt ladder: white=planned · blue=in flight · purple=review ·
black=done; white segments get a 1px edge (Desi). (3) Pure-fn unit tests for the parsers
(bun test, app-local pattern — put parse fns in a lib file the script imports). (4) NEW thin
docs/protocols/state-of-project-projection.md: sources, projection-only law (ledgers stay
SoT), the re-render ritual step (agent publishes via Artifact tool to the ONE stable URL —
publishing itself stays an agent action, scripts only render).
OWNED: scripts/ledger-backlog.ts (ADDITIVE) · NEW scripts/state-of-project.ts + its lib/tests
· NEW docs/protocols/state-of-project-projection.md.
NON-GOALS: rituals (0584 owns docs/rituals tonight) · apps/web (/app/state = slice 2,
ledgered) · artifact publishing automation · loop-board · any ledger edits.
GATES: bun run typecheck (root covers scripts? verify — else bun build/tsc the new files
directly and record) · new tests green · render proof: run the script on the real repo,
verify the HTML at 375px headless (own Playwright) — zero horizontal overflow, tabs filter.
```

### LANE 0586 — `session-0586-mmb-lead-source` · worktree `/Users/brianscott/dev/ronin-0586` · port 3586 · lane: mmb

```text
SESSION 0586 — G-021 loop 3, slice (b) ELECTED: Lead Source facet/filter on roster +
pipeline. Read FIRST: docs/sprints/SESSION_0577.md (tracer shape + UAT recipe) +
SESSION_0582.md (loop 2 + grill law) + clients/mammoth-build-crm/lib/lead-source.ts +
the sales-cockpit lead-roster + pipeline board components + goals-ledger G-021.
BUILD: Lead Source facet on (1) the Sales-cockpit Lead roster and (2) the pipeline board —
filter chips/select using the ONE normalizeLeadSource/leadSourceLabel vocabulary (never a
second source list); counts per source; filter state URL-or-local per the app's existing
idiom (match what the roster already does for other filters); empty state honest ("No
Referral leads"). Read-side only — NO schema change, NO write-path edits, NO attempt/outcome
surface edits (vocabulary still provisional).
OWNED: clients/mammoth-build-crm/* ONLY (roster + pipeline components, lib read helpers,
tests).
NON-GOALS: apps/web · ui-kit · schema/migrations · import/commit path (landed 0582 — do not
refactor it) · enrich-blanks · attempt-cadence.
GATES (client-local — root gates NEVER cover clients): cd clients/mammoth-build-crm && bun
run typecheck · bun run test (expect ≥30 baseline green + new) · bun run build · bunx oxlint
clients/mammoth-build-crm (only the pre-existing db.ts warning allowed) · NO oxfmt run
(client has no config — hand-match style; WL-P2-69).
LIVE UAT per the 0577/0582 recipe: scratch DB mammoth_0586_scratch (NEVER mammoth_dev; no
proof data in dev DB), db push + seed, dev server port 3586, fixture login, SYNTHETIC data
only (retention law: real lead bodies never in fixtures/repo), prove: facet counts match DB,
filter narrows roster AND board, clearing restores, teardown drops the scratch DB.
```

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0587_TASK_01 | done | Dispatch 4 lanes (one parallel message, sonnet, background) — dispatched 2026-07-20 AM after precondition + FS-0030 checks |
| SESSION_0587_TASK_02 | in-progress | Babysit + crash-resume lanes to completion |
| SESSION_0587_TASK_03 | pending | AM pre-review sweep (merge 0584→0585→0586→0583 · gates · ledger application · Giddy) |
| SESSION_0587_TASK_04 | pending | Evidence + telemetry (Sonnet cost experiment) + HOLD push gate for coffee word |
| SESSION_0587_TASK_05 | done | Operator mid-session directive: 0586 board-badge verdict = KEEP · NEW planning-ledger (PL-001) + G-024 feature/feedback-widget intake program + wiki index row (graphify-grounded: feedback-widget.tsx / reportFeedback / Report-type-Feedback / admin-feedback email) |

## Next session

### Goal

Two parallel sessions (operator-elected mid-0587, numbers claimed by reservation branches):

- **SESSION_0588** (`session-0588-quality-suite-review`) — code-quality suite review session.
  Recipe = `docs/protocols/page-code-review.md` (the packaged per-page suite: bounded file set →
  fallow baseline → scored review → /fallow-fix-loop → re-verify → delta proof), pending the
  operator's review/tweaks of that recipe (requested this session); merged-trunk variant
  (SESSION_0567 shape) available if the target is a trunk range instead of pages.
- **SESSION_0589** (`session-0589-feature-widget-plan`) — the PL-001 planning session: full
  `/pp` Petey plan → AM_Plan_Session → fan-out build (0587 pattern) for G-024
  feature/feedback-widget intake program.

### First task

Bow-in each lane per ADR 0049; 0588 waits on the operator's recipe tweaks; 0589 reads
planning-ledger PL-001 + goals-ledger G-024 + the 0584 PM_Planning_Lane recipe card (post-merge).
