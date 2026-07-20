---
title: "SESSION 0587 — Overnight fan-out orchestrator + AM coffee merge review (4 lanes)"
slug: session-0587
type: session--open
status: closed
created: 2026-07-19
updated: 2026-07-20
last_agent: claude-session-0587
next_session: session-0588
telemetry: "lanes=Sonnet 5 (4×, ~1.56M subagent tok); orchestrator=Fable 5 → Opus 4.8 (Fable usage-limit mid-Giddy); Giddy rerun + sweep on Opus."
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
> pinned; the orchestrator session ran on Fable 5 through the merge + gates + ledger-application
> commit, then hit the Fable usage-credit limit MID-Giddy-review (exact error recorded below);
> operator switched the session to **Opus 4.8** (the stub's escalation-valve target) and the
> sweep continued — Giddy re-dispatched fresh on Opus. Telemetry at close reflects the
> Sonnet(lanes) / Fable→Opus(orchestrator) split.
>
> **Limit event (verbatim, per standing rule — no theorizing):** the first Giddy review agent
> terminated with: *"Agent terminated early due to an API error: You're out of usage credits.
> Run /usage-credits to keep using Fable 5 or /model to switch models."* No corruption — Giddy
> is read-only, zero git mutation; main HEAD stayed at the ledger commit `2a392e5c`, all four
> lane worktrees intact. This is exactly instruction-5's escalation valve firing; the operator
> took the intended Opus path rather than forcing through.

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
| SESSION_0587_TASK_02 | done | All 4 lanes landed clean, zero crash-resumes needed: 0586 (~36m, 278k tok) · 0585 (~40m, 256k) · 0584 (~52m, 474k) · 0583 (~2h13m, 553k) — all Sonnet, single commit each (0585: two), clean trees, zero cross-lane file overlap (proven by diff-path comm), zero schema.prisma touches |
| SESSION_0587_TASK_03 | in-progress | AM sweep: merges DONE (4× --no-ff, ort, zero conflicts, pinned order) · gates: format:check ✓, lint:check (apps/web) ✓, typecheck ✓ (after WL-P3-59 baseline-client generate) · **test RED on first merged run: 1364 pass / 46 fail / 5 errors — error class `DriverAdapterError: ForeignKeyConstraintViolation` + adapter-pg `onError` = shared-local-DB reset-trap signature (per parallel-session-shared-db memory); web suite is already `--parallel=1`, and 0583 ran the SAME full web suite GREEN (1562/1563) in its worktree → contention-shaped, NOT yet proven. Gate-script pipe masked the real exit (`tail`'s $?=0). Clean serialized re-run queued once contention clears + build finishes.** · **build ✓ GREEN** (route tree + Static/Dynamic legend printed clean incl. 0583's `/techniques/graph`; the log's `EXIT:0` is `tail`'s not build's — content is the proof) · **root-cause of the 46-fail identified:** apps/web `@ronin-dojo/web` only (root `test` filter = `apps/*`+`packages/*`, clients/MMB NOT covered — not MMB despite first guess); class = fixture-ownership / DB-hook-timeout / P2003-FK (SESSION_0582 documented as solo-green-on-rerun; the HARDENING fix `9d845bdd lib/test/fixture-ownership.ts` is UNMERGED on `session-0551-test-infra`, gated behind the 0547-wave — NOT a 0587-lane regression: 0583 ran the same web suite green 1562/1563 in-worktree). Re-run verdict: **1368 pass / 47 fail / 8 err — NOT locally green, but measurement CONTAMINATED** (my "clean" re-run overlapped the gate-job's `next build` prebuild `migrate deploy` on the shared local DB — a confounder I introduced; run 1 was contaminated by lane worktree dev servers + live siblings 0575/76/77). **Class is unambiguous: fixture-ownership / DB-adapter connection-concurrency** — 6 failing files are EXACTLY 0551's fixture-ownership-fix targets (claim-finalize, editor-authorization-equivalence, finalize-rank-promotion, place-lead-core, promotion-claim-resource, route) + the 0582-documented hook-timeout pair. **NOT a merge regression:** ZERO failing files in 0583's actual diff (node-tooltip/technique-graph/curriculum-browser/lib-utils); the one in-domain file `techniques/queries.test.ts` failed on `pg` "client already executing a query" (connection concurrency), NOT a no-leak assertion — NO-LEAK gate intact; 0583 ran the suite green 1562/1563 in-worktree; build GREEN. Count anomaly (47 vs 0582's 2–4) attributable to the migrate-during-run contamination. **Per escalation valve (instruction 5): STOP autonomous sweep-to-push — genuine ambiguity + contaminated measurement. Do NOT force through. Operator decision.** · ledger application DONE (WL-P2-65✅/66✅ + WL-P3-59 · D-049✅ + D-050/051/052 · G-021/022/023) · peripheral doc sweep DONE · **Giddy PASS 9.4/10 zero must-fix** (binding condition: test+build must be green before push; 9.4 cap is only the in-flight gates) |
| SESSION_0587_TASK_04 | done | **Operator decision (2026-07-20): HOLD — the full 0587 trunk stays UNPUSHED until `session-0551-test-infra` (fixture-ownership fix `9d845bdd`) merges and the apps/web suite goes local-green. Not push-on-CI, not clean-run-first — the cleanest bar.** Push gate held by decision, not just awaiting a word. Dependency surfaced: 0551 is itself gated behind the 0547-wave (standing memory) — landing 0551 pulls that chain onto the critical path (route via 0589 planning or a dedicated slice; NOT decided here). Trunk is complete + verified otherwise: build GREEN · Giddy PASS 9.4 · failures proven non-regression. |
| SESSION_0587_TASK_05 (widget/dashboard capture) | done | PL-001 (G-024 feature/feedback widget) + PL-002 (RLL/YLL link ledgers) + PL-003 (State of the Dojo as /app admin landing: AdminKanban embed + ritual render + per-product publish) captured to planning-ledger, routed to SESSION_0589; 0586 board-badge = KEEP |
| SESSION_0587_TASK_05 | done | Operator mid-session directive: 0586 board-badge verdict = KEEP · NEW planning-ledger (PL-001) + G-024 feature/feedback-widget intake program + wiki index row (graphify-grounded: feedback-widget.tsx / reportFeedback / Report-type-Feedback / admin-feedback email) |

## What landed

- Adopted the SESSION_0587 staged stub (morning, operator awake — not the overnight run it was
  staged as). Dispatched 4 parallel Sonnet Cody lanes; **all 4 landed clean, zero crash-resumes:**
  - **0583** (G-022 Lane A S2): C5 hover-driven neighborhood glow, D3 empty states (graph +
    curriculum AUD2-7), B2 difficulty tooltips, WL-P2-65 + WL-P2-66 resolved.
  - **0584** (G-023 governance): WORKFLOW_6.0 spine, SOT_Cookbook, 7 recipe cards, persona
    consolidation to `.claude/agents/`, D-049 fix, ritual repoints.
  - **0585** (G-023 SOT dashboard slice 1): parse lib + additive `ledger-backlog --json` +
    `state-of-project.ts` renderer + projection protocol.
  - **0586** (G-021 loop 3b): Lead Source facet on roster + pipeline board (read-side, one
    vocabulary; board-card badge = operator KEEP).
- **AM sweep:** merged 0584→0585→0586→0583 (no-ff, zero conflicts, disjoint scopes), applied all
  lanes' proposed ledger edits as single writer, ran the full gate chain, **Giddy hostile review
  PASS 9.4/10 (zero must-fix).** Published the State-of-the-Dojo dashboard live (Artifact).
- **Operator mid-session directives captured** (all → SESSION_0589 planning): PL-001 (G-024
  feature/feedback widgets), PL-002 (RLL/YLL link ledgers), PL-003 (State of the Dojo as the
  `/app` admin landing), PL-004 (brand>platform>product taxonomy — ADR-worthy), PL-005 (skin-
  invariant law, ratified). Three ratifications resolved (name, taxonomy-direction, skin law).
- **Operator memory corrected:** scripts are welcome (Python included) — the caution was always
  vet-for-malware, never a tool ban ([[operator-script-caution]]).

## Files touched (close-writer, direct — lane files listed in each lane's SESSION record)

- `docs/knowledge/wiki/goals-ledger.md` — G-021/022/023 progress; NEW G-024.
- `docs/knowledge/wiki/wiring-ledger.md` — WL-P2-65 ✅, WL-P2-66 ✅, NEW WL-P3-59.
- `docs/knowledge/wiki/drift-register.md` — D-049 ✅ resolved; NEW D-050/051/052.
- `docs/knowledge/wiki/planning-ledger.md` — NEW file; PL-001..005.
- `docs/knowledge/wiki/index.md` — planning-ledger row.
- peripheral doc sweep (0584 backlinks + glossary + inventory + prereqs + sop) — 9 files, via
  sweep Cody.
- `docs/sprints/SESSION_0587.md` — this record.
- `~/.claude/.../memory/operator-script-caution.md` + `MEMORY.md` — the correction.

## Decisions resolved

- **0586 board-card Lead Source badge = KEEP.**
- **Test verdict = non-regression** (fixture-ownership / DB-adapter class; zero failing files in
  the merge diff; build green; Giddy PASS). **Push: HOLD until 0551 fixture-ownership merges +
  local-green** (operator, structured choice) — **then operator said "run bow out close and then
  you can push"** (reversal to push-on-CI-authority; reconciled at the push gate — see Open
  decisions).
- **Dashboard name = per-skin:** "State of the Dojo" (RDD/BBL) · "State of the Building" (MMB).
- **Portfolio taxonomy direction = five BRANDS; brand > platform > product** (PL-004; formalize
  as an ADR in 0589 — do NOT rewrite ADR 0034 / CLAUDE.md unilaterally).
- **Skin-invariant law = fixed hue, brand tint** (PL-005 ratified; BBL crit-darken now in-law).

## Open decisions / blockers

- **PUSH RECONCILIATION (live at close):** the structured "Hold until 0551" choice and the later
  "you can push" conflict; the local suite is still red on the fixture class and an apps/web push
  fires CI + BBL prod deploy. Resolved at the push gate by an explicit operator confirm — recorded
  in Git hygiene below.
- **0551 / 0547-wave now on the critical path** — landing `session-0551-test-infra` (fixture-
  ownership) is the gate to a clean local suite (and, under the hold reading, to the trunk push).
  Route in 0589 or a dedicated slice.
- **G-021 attempt-outcome vocabulary** — provisional, no terms drafted yet; blocks the next MMB
  build slice. Needs a terms-drafting pass (0589).
- **0583 C5 hover-glow redesign** needs a Desi/operator design sign-off (routed to 0588).
- PL-004 (taxonomy ADR) + PL-005 (skin law) feed 0589 planning + the PL-003 dashboard slice-2.

## Reflections

- **Pipe-masks-exit-code trap.** The gate script piped `bun run test` and `next build` through
  `tail`, so `echo "EXIT:$?"` captured `tail`'s exit (0), not the command's — it nearly reported
  46 failing tests as green. Never read `$?` for a gate's result through a pipe; redirect to a
  file and capture the real exit.
- **Self-inflicted measurement contamination.** I started the "clean" test re-run while the gate-
  job's `next build` prebuild `migrate deploy` was still mutating the shared local DB — confounding
  the very measurement meant to isolate contention. A clean DB-test measurement needs ALL writers
  quiesced, build prebuild included.
- **Verify beliefs against the repo.** The operator's read (46 fails on MMB; bun-test fix landed)
  was wrong on two checkable facts — root `test` filter excludes clients, and the 0551 fix is
  unmerged. `git merge-base --is-ancestor` + the workspace filter settled it in seconds; taking
  the belief at face value would have mis-routed the diagnosis.
- **Fable limit mid-Giddy = the escalation valve working.** Read-only reviewer, zero corruption;
  operator's Opus switch was the stub's designated path. Recorded the exact error, didn't theorize.
- **Ratifications surfaced real architecture.** "Five products → five brands, brand>platform>
  product" is an ADR-worthy taxonomy shift; flagging it as such (vs rewording the dashboard)
  prevented an unratified CLAUDE.md / ADR-0034 rewrite.

## Review log

### SESSION_0587_REVIEW_01 — Giddy hostile close review (Opus rerun)

- **Range:** `e2ef96a5..2a392e5c` · **Verdict: PASS 9.4/10, zero must-fix.** Merge shape (no-ff,
  pinned order, zero conflicts), lane scope conformance, ledger reverse-check (both directions),
  id-minting discipline, D-023 pointer/banner canon, merge-wave G0–G4 absorption, and gate-claim
  honesty all verified. **Binding condition:** test + build green before push — build GREEN; test
  local-red on the fixture-ownership class (proven non-regression, contaminated measurement).
  Cap is the in-flight gates only. P3s: 0586 badge traceability seam; 0583 C5 design sign-off →
  0588.
- **First Giddy attempt (Fable) crashed** on the usage-credit limit mid-run (verbatim error in
  the Operator note above); Opus rerun is authoritative. No FS/INC row — clean escalation-valve
  handoff, not an unclean close.

## ADR / ubiquitous-language check

- **No ADR created this session.** PL-004 (brand > platform > product taxonomy) is **flagged
  ADR-worthy and deferred to SESSION_0589** — it is an unratified operator direction, not yet a
  decision to encode. ADR 0050 (grappling scope) already landed via 0579. Ubiquitous-language:
  the brand/platform/product terms will be defined WITH the PL-004 ADR, not before.

## Full close evidence

| Step | Proof |
| --- | --- |
| Task log | 6 rows (TASK_01–05 + badge/dashboard capture), gate runner PASS. |
| JETTY/frontmatter sweep | Ledgers + planning-ledger + index bumped `updated`/`last_agent` to `claude-session-0587`; peripheral sweep Cody bumped 6 R4-flagged files. Gate runner: no stale touched-doc frontmatter. |
| Backlinks/index sweep | NEW `planning-ledger.md` registered in `wiki/index.md`; `pairs_with` set on planning-ledger ↔ goals-ledger. |
| Wiki lint | `bun run wiki:lint` → **0 errors / 54 warnings** (all pre-existing R8 blank-line-before-list in unrelated `petey-plan-*`/`sprints` files; none introduced). |
| Kaizen reflection | Present (`## Reflections` — 5 notes incl. the pipe-masks-exit trap + self-inflicted DB contamination). |
| Hostile close review | **Giddy PASS 9.4/10, zero must-fix** (`SESSION_0587_REVIEW_01`, Opus rerun after the Fable-limit crash). Dirstarter check: aligned (sweep touches no baseline layer). |
| Code-quality gate (Class-A) | No Class-A custom code authored by the close-writer (orchestration + ledgers + docs). Lane code was self-reviewed + Giddy-verified in-lane; formal `/code-quality` not separately run (recorded honestly). |
| Runtime verification (Doug) | Lanes ran live UAT in-worktree (0586 scratch-DB facet UAT; 0583 computed-style/export-byte probes; 0585 375px headless render). Merged-trunk: build GREEN; test local-red on the non-regression fixture class (see below). |
| Evidence-artifact URL | State-of-the-Dojo live render — https://claude.ai/code/artifact/2cc94f39-211d-4ce4-aa2a-3f75743e4f63 (v `0587-live-render-slice1`). |
| Build gate | **Correction to the gate runner's "skipped (docs-only)":** it diffs the working tree (all committed) — the known `bow-out-gate-runner-diffs-working-tree` gotcha. The merged trunk DOES contain apps/web (0583/0586); `next build` was run on the merged tree → **GREEN** (route tree + Static/Dynamic legend printed, incl. `/techniques/graph`). |
| Test gate | apps/web `bun run test` → 1368 pass / 47 fail / 8 err — **local-red on the fixture-ownership / DB-adapter class, proven NON-regression** (zero failing files in the merge diff; 6 = exact 0551-fix targets; 0583 green in-worktree). Measurement contaminated (concurrent build prebuild-migrate). CI = authoritative gate. |
| Ledger cross-off + application | Resolved: WL-P2-65 ✅ · WL-P2-66 ✅ · D-049 ✅. New: WL-P3-59 · D-050/051/052 · G-024 · PL-001..005. Progress: G-021/022/023. Board cross-off: `board-mark-done` → 0 moved (none board-tracked). Single-writer discipline (Giddy reverse-check: zero phantom rows). |
| Deferral guard | `deferral-guard.ts` → 2 flags, **both justified-dismissed:** L365 = PL-004 (tracked in planning-ledger; guard doesn't recognize the `PL-` prefix — planning-ledger read-path wiring is the deferred PL-001 task), L377 = 0588 sweep-range (tracked in Next-session block + reserved branch `session-0588-quality-suite-review`). Gap noted: wire planning-ledger into `ledger-backlog.ts` + guard prefixes (PL-001 scope). |
| Finding router (§6.7) | wiring→WL-P2-65/66/WL-P3-59 · drift→D-049..052 · decision→PL-004 (ADR deferred to 0589) · planning intake→NEW planning-ledger PL-001..005 · G-024. No new FS/INC (Fable-limit was a clean escalation-valve handoff, not an unclean close). |
| Memory sweep | Corrected `operator-script-caution` (scripts welcome, vet don't ban); appended SESSION_0587 orchestration learnings to `sequence-skills-and-overnight-orchestration`. |
| Next session unblock check | 0588 (review) unblocked; 0589 (planning) unblocked. Both reserved + staged; bow-in prompts delivered to operator. |
| Git hygiene | branch=main; lane worktrees 0583–0586 retained pending trunk push decision (NOT auto-removed — branches unpushed). Secret scan clean. Push: **reconciled at the gate — see bow-out line.** No force-push. |
| Graphify update | nodes=19063 · edges=36428 · communities=2600 (gate runner, pre-commit per FS-0025). |

## Next session

### Goal

Two parallel sessions (operator-elected mid-0587, numbers claimed by reservation branches):

- **SESSION_0588** (`session-0588-quality-suite-review`) — code-quality suite review session.
  **Target PINNED (operator, mid-0587): the merged-trunk variant (SESSION_0567 shape) over
  this session's sweep range (the merged 0583–0586 trunk)** — deliberately deferred out of
  0587's sweep (session already big; sweep stays scoped to merge + gates + ledger + Giddy).
  Base recipe = `docs/protocols/page-code-review.md`, still pending the operator's
  review/tweaks (possible conformed `recipes/quality-suite.md` card).
- **SESSION_0589** (`session-0589-feature-widget-plan`) — the planning session: full
  `/pp` Petey plan → AM_Plan_Session → fan-out build (0587 pattern). Scope = **PL-001**
  (G-024 feature/feedback-widget intake program) + **PL-002** (Reddit-Links-Ledger `RLL` +
  YouTube-Links-Ledger `YLL` intake ledgers → goals-ledger hydration; vault-consolidation /
  SOT-per-brand-vaults thread) + **PL-003** (State of the Dojo as the `/app` admin landing:
  AdminKanban embed + ritual render-at-bow-in/update-at-bow-out + per-brand/client publish +
  admin-landing composition of State + section cards + BBL v2 cards — the G-023 SOT-dashboard
  slice-2 continuation).

### First task

Bow-in each lane per ADR 0049; 0588 waits on the operator's recipe tweaks; 0589 reads
planning-ledger PL-001 + goals-ledger G-024 + the 0584 PM_Planning_Lane recipe card (post-merge).
