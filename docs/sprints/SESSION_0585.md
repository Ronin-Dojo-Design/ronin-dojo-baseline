---
title: "SESSION 0585 — SOT dashboard slice 1: State-of-the-Dojo feed + render"
slug: session-0585
type: session--open
status: in-progress
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0585
sprint: S12
lane: rdd
lane_seq:
vault_session:
goal_ids: [G-023]
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0582.md
  - docs/sprints/SESSION_0587.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0585 — SOT dashboard slice 1: State-of-the-Dojo feed + render

## Date

2026-07-20

## Operator

Brian + claude-session-0585

## Goal

Ship SOT dashboard slice 1 (feed + render): additive `sessions`/`goals` JSON sources on
`scripts/ledger-backlog.ts` (default text output byte-stable), a new `scripts/state-of-project.ts`
that renders a self-contained "State of the Dojo" HTML dashboard from that feed (RDD/BBL/MMB
brand tabs = skin × lane filter, work board, goal belt-ladders + table, risk watch, needs-you),
pure-fn unit tests for the parsers, and a thin `docs/protocols/state-of-project-projection.md`.
The G-023 overnight fan-out lane (SESSION_0582 PM_Plan) dispatched by the SESSION_0587
orchestrator.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0582.md` — §PM_Plan grill outcome (the four-lane
  overnight fan-out + this lane's dispatch prompt) and the "State of the Dojo" v3 mock design
  decisions (brand tab = skin × lane filter; semantic tokens invariant; belt ladder = RDD house
  language, neutral labels under MMB skin; "Needs you" block; sessions-are-cards; honest empties;
  provenance footer) — the v3 mock artifact itself (`claude.ai/code/artifact/2cc94f39…`) is not
  fetchable from this environment (no web-fetch tool, and it's a claude.ai session artifact, not
  a repo file); this lane worked from the dispatch prompt's fully-spelled-out design bullets,
  which restate the mock's ratified decisions in enough detail to build against.
- Carryover: SESSION_0582 pre-staged the SESSION_0587 orchestrator stub + four lane branches;
  0587 dispatched this lane per its verbatim prompt with all operator forks already pinned — no
  re-grill needed at bow-in.

### Branch and worktree

- Branch: `session-0585-sot-dashboard`
- Worktree: `/Users/brianscott/dev/ronin-0585`
- Status at bow-in: `git log --oneline main..session-0585-sot-dashboard` was EMPTY (branch
  existed, no commits); reset hard to `origin/main` after worktree add.
- Current HEAD at bow-in: `e2ef96a5` (SESSION_0582 full close).

### Dirstarter alignment

Not applicable — scripts-only lane (`scripts/*.ts`, `docs/protocols/*.md`), no `apps/web`
surface touched. The rendered HTML is a standalone static-file generator (same shape as the
existing `scripts/build-loop-posters.ts`/`scripts/build-orchestration-hub.ts` precedent), not a
Dirstarter/Next.js component — the L1 component-inventory pre-flight doesn't apply to it.

### Graphify check

- Ran from the CANONICAL checkout per the skill: `graphify query "state of dojo dashboard
  ledger-backlog goals sessions" --budget 1500` — returned a BFS from unrelated
  `/app/dashboard` page nodes (community 12191), not useful for this scripts-only lane (the
  query's nouns matched app-surface dashboard pages, not the governance-tooling scripts this
  lane actually owns). Pivoted to direct file reads instead: `scripts/ledger-backlog.ts`,
  `apps/web/lib/loop-board/ledger-parse.ts`, `docs/knowledge/wiki/goals-ledger.md`,
  `docs/sprints/SESSION_{0587,0582,0581,0580,0579}.md` frontmatters, `scripts/tsconfig.json`,
  `scripts/wiki-lint.ts` (frontmatter-parser precedent), `scripts/build-loop-posters.ts`
  (self-contained-HTML-render precedent).
- Files selected: `scripts/ledger-backlog.ts` (additive edit), `apps/web/lib/loop-board/ledger-parse.ts`
  (read-only — the `Item`/`parsePullRequests` types this lane imports, unmodified).
- Verification note: every file above was opened and read directly; Graphify was a first attempt
  only, not the source of the file list actually used.

### Grill outcome

No re-grill — all forks for this lane were pinned in the SESSION_0582 PM_Plan dispatch prompt
(the v3 mock's design decisions, the owned-file contract, the non-goals). Two implementation
choices this lane made that weren't spelled out verbatim in the prompt (documented here + in
`state-of-project-projection.md`, not escalated — small, reversible, in-scope judgment calls):

1. **Goal→brand classification is a keyword heuristic**, not a formal enum (goals have no `lane`
   frontmatter field yet — that's G-023 Session C, not started). Sessions DO already carry a
   formal `lane:` short-code (ADR 0049) — used directly.
2. **`gh` PR count arrives through the ledger-backlog JSON feed**, not a second direct `gh`
   shell-out from `state-of-project.ts` — the lane brief says "consumes that JSON + gh (PR
   count)"; since the JSON's existing `PR`-ledger rows are already `gh`-sourced (G-007), a
   second call would be redundant/non-DRY. Documented as a deliberate reading, not an omission.

### Drift logged

None new from this lane. Confirmed pre-existing, unrelated to this diff (see Verification):
`apps/baseline` has no generated Prisma client in EITHER the canonical checkout or this
worktree (`apps/baseline/.generated/` absent in both) — a workspace-wide `bun run typecheck`
therefore fails on `baseline` regardless of this lane's changes. Not fixed here (out of owned
scope; `apps/baseline` needs its own `prisma generate` bootstrap step the lane-build skill
doesn't currently mention).

## Petey plan

### Goal

Ship the additive ledger-backlog JSON fields + the new renderer + its lib/tests + the thin
protocol doc, self-review, commit locally on the lane branch — no push.

### Tasks

#### SESSION_0585_TASK_01 — pure parse/classify lib + unit tests

- **Agent:** Cody
- **What:** `scripts/lib/state-of-project-parse.ts` (frontmatter reader, session/goal detail
  types, brand-tab classifiers, the 4-stage phase bucketer, push-gate/operator-pending/
  review-signal detectors) + `scripts/lib/state-of-project-parse.test.ts`.
- **Steps:** design the types against the dispatch's `{number,title,status,lane}` /
  `{id,status,priority,lane?,summary}` shapes; write pure fns; write fixtures covering the real
  ledger's format quirks (em-dash AND middle-dot status separators, inline non-bulleted Lane
  labels, multi-bullet line-wrapping); sanity-probe against the LIVE `goals-ledger.md` +
  `docs/sprints/*` (not just fixtures) and fix 3 real regex bugs the live-data probe surfaced.
- **Done means:** `bun test scripts/lib/state-of-project-parse.test.ts` green; ad hoc probe
  against the real ledger/sprints files returns clean, sane rows.
- **Depends on:** nothing

#### SESSION_0585_TASK_02 — additive `sessions`/`goals` JSON fields on ledger-backlog.ts

- **Agent:** Cody
- **What:** `scripts/ledger-backlog.ts`'s `--json` branch gains `sessions` (frontmatter scan of
  `docs/sprints/SESSION_*.md`) and `goals` (parsed from the already-loaded `GL` ledger content)
  fields, wrapping the pre-existing `items` array into `{ items, sessions, goals }`.
- **Steps:** import the new lib; add a `readSessionsDetail()` helper; reuse `contents.GL`
  (already read for the existing backlog aggregator) instead of a second file read; diff the
  default (non-JSON) text output byte-for-byte against the pre-edit canonical script to prove
  it's untouched.
- **Done means:** `diff` of the default text output (canonical vs worktree) is empty; `--json`
  output has the 3 keys with sane counts.
- **Depends on:** SESSION_0585_TASK_01

#### SESSION_0585_TASK_03 — `scripts/state-of-project.ts` renderer

- **Agent:** Cody
- **What:** new script: shells to `ledger-backlog.ts --json`, renders one self-contained HTML
  file (inline CSS + vanilla-JS tab switcher) to a path argument (default `out/state-of-project.html`,
  gitignored).
- **Steps:** build masthead + provenance note + RDD/BBL/MMB tabs (skin × lane filter, brand
  accent tokens, BBL crit-darkening exception) + work board (sessions-as-cards, mobile
  in-flight-first order, capped `done` column) + goal belt-ladders + goal ladder table (white
  1px edge) + risk watch + needs-you (cross-brand) + honest empties everywhere.
- **Done means:** runs clean against the real repo; headless Playwright proof at 375px (see
  Verification).
- **Depends on:** SESSION_0585_TASK_01, SESSION_0585_TASK_02

#### SESSION_0585_TASK_04 — protocol doc + gates + self-review

- **Agent:** Cody
- **What:** `docs/protocols/state-of-project-projection.md` (sources, projection-only law,
  re-render ritual, known slice-1 gaps) + full gate pass + this session record.
- **Steps:** write the doc; run typecheck/lint/tests directly (root gates don't cover
  `scripts/`); run `bun run wiki:lint`; record everything below.
- **Done means:** gates table filled with verbatim results.
- **Depends on:** SESSION_0585_TASK_01..03

### Parallelism

Sequential — one small owned-file set, each task composes on the previous (lib → feed →
renderer → docs/gates). No sub-agent fan-out justified at this scale.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0585_TASK_01 | Cody | Pure-fn lib + tests |
| SESSION_0585_TASK_02 | Cody | Additive CLI wiring |
| SESSION_0585_TASK_03 | Cody | New renderer script |
| SESSION_0585_TASK_04 | Cody | Docs + gate pass |

### Open decisions

None — see "Grill outcome" for the two documented judgment calls (not escalated; small,
reversible, in-scope).

### Risks

Sibling overnight lanes (0583/0584/0586) may be running concurrently on the same host/DB. This
lane's diff touches zero `apps/web`/`apps/baseline` files, so it carries no DB-contention risk
of its own; the one observed contention was CPU-bound (`bun run typecheck`'s `tsc` step on
`apps/web` took several minutes under load — noted in Verification, not a correctness issue).

### Scope guard

- No edits to `apps/web/lib/loop-board/ledger-parse.ts` (read-only import only) — the formal
  `lane` enum + `--lane=` filter work is G-023 Session C's owned scope, not this lane's.
- No `/app/state` route, no artifact-publishing automation, no loop-board changes, no ledger
  edits (proposals only, below) — all explicit NON-GOALS in the dispatch.
- No edits to `docs/rituals/*` (0584's lane tonight).
- No bulk-reformat of pre-existing `scripts/*.ts` files even though `oxfmt --check` fails on ALL
  of them under default settings (confirmed pre-existing, not a regression — see Verification).

### Dirstarter implementation template

- **Docs read first:** not applicable (no Dirstarter L1 surface touched).
- **Baseline pattern to extend:** the repo's own governance-tooling script idiom
  (`scripts/*.ts` + a colocated `scripts/lib/*.ts` pure module), mirroring
  `apps/web/lib/loop-board/ledger-parse.ts`'s self-contained-parser shape and
  `scripts/build-loop-posters.ts`'s self-contained-HTML-render shape.
- **Custom delta:** the State-of-the-Dojo projection itself is new, Ronin-specific tooling.
- **No-bypass proof:** nothing purchased/Dirstarter is being replaced.

## Cody pre-flight

Component checklist not applicable (no `apps/web` UI/component surface — see "Dirstarter
alignment" above). No schema/backend work. This is a scripts/governance-tooling build; the
closest applicable pre-flight is "existing pattern scan," recorded here:

### Pre-flight: state-of-project-parse.ts + state-of-project.ts

#### 1. Existing pattern scan

- Searched `scripts/` for existing self-contained-parser and self-contained-HTML-render
  precedents.
- Found: `apps/web/lib/loop-board/ledger-parse.ts` (the shared, self-contained,
  no-fs/no-network parser pattern — mirrored, not imported wholesale, to keep the new lib
  independently self-contained per its own doc comment); `scripts/build-loop-posters.ts` /
  `scripts/build-orchestration-hub.ts` (self-contained inline-CSS HTML render pattern, `Bun.write`
  to a path, no runtime deps); `scripts/wiki-lint.ts` (hand-rolled frontmatter parser, same
  flat-key-value shape reused here).

#### 2. L1 template scan

- Not applicable — no Dirstarter component surface.

#### 3. Composition decision

- New files, no existing lib to extend (this is a net-new projection); closest-pattern
  composition as listed above.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0582.md` §PM_Plan + What-landed).
- ADR read: ADR 0049 (session numbering + `lane:` facet — confirms sessions already carry the
  short-code this lane consumes directly).
- Runbook consulted: `docs/protocols/loop-of-loops-ledger-driven-sessions.md`,
  `docs/knowledge/wiki/goals-ledger.md`'s own "Format" section.

#### 5. Dev environment confirmed

- No dev server this lane (scripts-only per the dispatch). Verification commands: `bunx tsc`
  (inline compiler-options, matching `scripts/tsconfig.json` — see Verification for why `-p`
  couldn't be combined with explicit file args), `bun test <file>` (single file, safe per the
  gotcha floor), `bun scripts/state-of-project.ts`, headless Playwright via `node` against the
  rendered file.

#### 6. FAILED_STEPS check

- Prior failures in this area: none found specific to this tooling.
- Mitigation acknowledged: FS-0027 (test-writing hook) — the new test file is a PURE-fn suite
  (no Prisma, no `mock.module`), run as a single file (`bun test <file>`), never a bare
  multi-file invocation.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0585_TASK_01 | landed | `scripts/lib/state-of-project-parse.ts` + `.test.ts` (30 tests). Live-data probe against `goals-ledger.md` surfaced and fixed 3 real regex bugs (see Reflections). |
| SESSION_0585_TASK_02 | landed | `scripts/ledger-backlog.ts` additive `--json` fields; default text output proven byte-identical (canonical vs worktree diff, empty). |
| SESSION_0585_TASK_03 | landed | `scripts/state-of-project.ts`; live-render review surfaced and fixed a `needs-you` signal-quality bug (push-gate-held firing on 15 historical CLOSED sessions) and an unbounded `done`-column length issue (capped to 12 + "+N more"). |
| SESSION_0585_TASK_04 | landed | `docs/protocols/state-of-project-projection.md`; gates run and recorded below. |

## What landed

- **`scripts/lib/state-of-project-parse.ts`** (+ 30-test suite) — pure parse/classify functions
  shared by the feed CLI and the renderer: frontmatter field reader, `SessionDetail`/`GoalDetail`
  types, `classifySessionProduct`/`classifyGoalProduct` (brand-tab filter), `bucketSessionPhase`/
  `bucketGoalPhase` (the shared white/blue/purple/black vocabulary), `detectPushGateHeld`/
  `detectOperatorPending`/`detectReviewSignal`.
- **`scripts/ledger-backlog.ts --json`** now additionally carries `sessions` (350 rows, live
  frontmatter scan) and `goals` (23 rows, live `goals-ledger.md` parse) alongside the pre-existing
  `items` array — confirmed the default text output is byte-identical to the pre-edit canonical
  script.
- **`scripts/state-of-project.ts`** — renders a self-contained "State of the Dojo" HTML
  dashboard: masthead with the "(name pending operator ratification)" provenance note, RDD/BBL/
  MMB brand tabs (skin × lane filter; BBL crimson `hsl(1 79% 51%)` w/ darkened crit; MMB
  `#ff6a1a` w/ neutral belt-ladder labels; semantic good/warn/crit tokens brand-invariant except
  that one named crit exception), a work board (sessions as cards, mobile in-flight-first order,
  `done` column capped to the most recent 12 + honest "+N more"), goal belt-ladders + a plain
  accessible goal-ladder table (white segments get the Desi-noted 1px edge), a cross-brand risk
  watch and needs-you block, and a provenance footer. Every section has an honest empty state.
- **`docs/protocols/state-of-project-projection.md`** — sources, the projection-only law, the
  re-render ritual (publishing via the Artifact tool stays an agent step, not a script step),
  the brand-tab/classification design notes, and the named slice-1 gaps (goal classification is
  a heuristic pending G-023 Session C's formal enum; pre-ADR-0049/missing-`status:` sessions
  default defensively; `/app/state` is a separate, un-built slice 2).

## Files touched

| File | Change |
| --- | --- |
| `scripts/lib/state-of-project-parse.ts` | NEW — pure parse/classify lib (frontmatter reader, session/goal types, brand classifiers, phase bucketers, needs-you signal detectors) |
| `scripts/lib/state-of-project-parse.test.ts` | NEW — 30 pure-fn unit tests, incl. 3 regressions found via the live-ledger probe |
| `scripts/ledger-backlog.ts` | ADDITIVE — `--json` branch gains `sessions`/`goals` fields; default text output untouched (proven byte-identical) |
| `scripts/state-of-project.ts` | NEW — self-contained HTML dashboard renderer |
| `docs/protocols/state-of-project-projection.md` | NEW — thin protocol doc (sources, projection-only law, re-render ritual, known gaps) |
| `docs/sprints/SESSION_0585.md` | This record |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx tsc --noEmit --strict --esModuleInterop --module ESNext --moduleResolution Bundler --target ESNext --types bun-types <new files>` | EXIT 0, clean. **Why not `bun run typecheck` alone:** root `typecheck` = `bun run --filter '*' typecheck`, workspace-filtered — `scripts/` isn't a workspace, so it's NOT covered (confirmed: ran the workspace typecheck too, below, and it never touches `scripts/`). `scripts/tsconfig.json`'s `include: ["*.ts"]` also only covers top-level `scripts/*.ts`, not `scripts/lib/`, and `tsc -p <config> <files>` errors (`TS5042: 'project' cannot be mixed with source files`) — so compiler options were passed inline instead, matching `scripts/tsconfig.json`'s settings exactly. Re-run clean after every fix. |
| `bun test scripts/lib/state-of-project-parse.test.ts` (single file — safe per FS-0027/gotcha floor) | 30 pass / 0 fail, 66 `expect()` calls |
| Live-data probe: `parseGoalsDetail` against the REAL `docs/knowledge/wiki/goals-ledger.md` | 23/23 goals parse cleanly (id/status/priority/lane/product/phase) after fixing 3 real bugs the probe surfaced: (1) the em-dash split regex was cutting "in-progress"/"closed-full" at their OWN internal hyphen; (2) the `[^*]+` capture crossed newlines into the next bullet on 2 real rows (G-012, G-015); (3) G-019's `**Lane:**` label sits inline inside a different bullet's prose (no leading `- **Lane:**` of its own) — the regex's leading-bullet anchor was dropped to handle it. All 3 got regression tests added to the suite (now 30, was 24 originally, before the middle-dot-status + newline-wrap + inline-label tests). |
| Live-data probe: `parseSessionFile` against ALL 350 real `docs/sprints/SESSION_*.md` files | 350/350 parse (0 skipped) — 325 done / 6 planned / 16 in-flight / 3 review; 346 rdd / 1 mmb / 3 bbl (only 6 sessions carry the ADR-0049 `lane:` field at all — expected, it's brand-new). |
| `bun scripts/ledger-backlog.ts --no-pr` (canonical, pre-edit) vs same command (worktree, post-edit) | `diff` — EMPTY. Default text output is byte-stable, as required. |
| `bun scripts/ledger-backlog.ts --no-pr --json` | EXIT 0; `{items, sessions, goals}` — 83 items / 350 sessions / 23 goals, sane values on spot-check. |
| `bun scripts/state-of-project.ts` (against the real, live repo) | EXIT 0 — `out/state-of-project.html` written (gitignored, confirmed `git status --short out/` empty); 350 sessions / 23 goals folded in. |
| Headless Playwright @ 375px (own chromium, `@playwright/test` at root `node_modules`) | Zero horizontal overflow BEFORE and AFTER tab clicks (`scrollWidth === clientWidth === 375`, both checked); tab click correctly flips `data-brand` + toggles `.active`/`hidden` on the right panels; white-belt stop computed `border: 1px solid rgb(224,224,224)` (Desi's edge note, confirmed via `getComputedStyle`, not just class presence); belt-word vs neutral-label toggle confirmed via `getComputedStyle(...).display` under both the BBL tab (belt word `inline`) and the MMB tab (belt word `none`, neutral label `inline`). |
| Headless Playwright brand-token probe (1200px) | `--accent`: rdd `#3f3f46`, bbl `hsl(1 79% 51%)`, mmb `#ff6a1a`; `--crit` under bbl: `hsl(1 60% 34%)` (the darkened exception) vs rdd's `#dc2626` — all via `getComputedStyle`, confirmed the token swap is real, not just authored CSS text. |
| Visual review (screenshots, RDD/MMB goal-ladder crops + mobile fold) | Confirmed: masthead/tabs/metrics render correctly; belt-ladder segments show correct reached/unreached opacity + correct color per stage; goal-ladder table's extra columns scroll inside its own `overflow-x:auto` wrapper (not page-level) — already covered by the zero-overflow check above. Caught and fixed live: the `needs-you` block was flooding with 15 historical CLOSED sessions whose close notes say "push gate held" in past tense — filtered to `phase !== "done"` (4 genuinely-open flags remain, one being `SESSION_0500` which has NO `status:` frontmatter at all — named as a known gap in the protocol doc, not fixed, since backfilling ~300 historical files is out of scope). Also capped the `done` work-board column (was rendering 300+ cards inline, 37,686px page height at 375px) to the most recent 12 + "+N more" (now 8,084px). |
| `bunx oxlint scripts/state-of-project.ts scripts/lib/state-of-project-parse.ts scripts/lib/state-of-project-parse.test.ts scripts/ledger-backlog.ts` | EXIT 0, silent (no warnings) |
| `bunx oxlint .` (repo-wide, since root `bun run lint` filters by workspace and would also WRITE via `--fix`) | EXIT 0 — pre-existing warnings only (all in `apps/web`, none in this diff, none in `scripts/`) |
| `bunx oxfmt --check` on the 4 touched/new `scripts/*.ts` files | FAILS under oxfmt defaults — but confirmed this is **pre-existing, repo-wide, not a regression**: ran the identical check against UNTOUCHED `scripts/ledger-backlog.ts` (pre-edit, canonical) + two other never-touched files (`pr-nudge.ts`, `session-cost.ts`) — ALL fail the same way ("No config found, using defaults"). `scripts/` has no root format gate today (`format:check` is `apps/web`-scoped only) and has apparently never been run through `oxfmt`. Left as-authored (matching the ambient, unformatted style of every neighboring `scripts/*.ts` file) rather than unilaterally reformatting only my new files to a different look, or reformatting the whole directory (scope creep). Flagged below as a drift candidate for the merge sweep. |
| `bun run wiki:lint` (root — covers `docs/`, not workspace-filtered) | 0 errors / 54 warnings, ALL pre-existing (SESSION_0524/0510/0504/etc. R8 formatting nits) — none reference the new `state-of-project-projection.md`. |
| `bun run typecheck` (root, full workspace sweep — run for diligence even though this diff touches zero workspace files) | `@ronin-dojo/ui-kit` EXIT 0 · `@ronin-dojo/api-client` EXIT 0 · `@ronin-dojo/web` EXIT 0 · `baseline` EXIT 2 (`Cannot find module '../.generated/prisma/client'`) — confirmed PRE-EXISTING/environmental: `apps/baseline/.generated/` is absent in BOTH this worktree AND the canonical checkout (checked directly), i.e. `apps/baseline` has never had `prisma generate` run in this environment, unrelated to any file this lane touched. Not fixed (out of owned scope). Took several minutes under host CPU contention (noted, not a correctness issue). |
| `cd apps/web && npx next build` / full `bun run test` | **Deliberately not run.** This diff touches zero files in any workspace (`apps/web`, `apps/baseline`, `packages/*`) — a multi-minute build/full-suite run under active sibling-lane host contention would validate an unmodified tree, not this change. The lane's own explicit GATES list (typecheck-coverage-check · new tests green · render proof) doesn't name these either. Flagging as deliberately skipped per the self-review checklist, not silently omitted. |

## Open decisions / blockers

- **`SESSION_0500.md` has no `status:` frontmatter field** — the projection defensively defaults
  it to `planned`/still-open, which is wrong (it's long done per `goals-ledger.md` G-004). Named
  in `state-of-project-projection.md` as a known gap; backfilling frontmatter across ~300
  historical session files is a separate sweep, not this lane's scope.
- **`scripts/` has no root format/oxfmt gate** — confirmed pre-existing (every file in the
  directory fails `oxfmt --check` under defaults, including untouched files). Worth a
  drift-register candidate for whoever owns `scripts/` tooling hygiene next; not fixed here
  (would be a repo-wide reformat, well outside this lane's owned-file contract).
- **Goal→brand classification is a heuristic**, not the formal `lane` enum (G-023 Session C,
  not started). Documented in the protocol doc; the keyword list may need revisiting once that
  enum lands.

## Next session

### Goal

The SESSION_0587 orchestrator's merge sweep resumes: merge 0584→0585→0586→0583 in order, apply
this lane's "Proposed ledger edits" once, re-verify on the merged tree, hold the push gate for
the operator's coffee word.

### First task

Read this session's Files touched + Verification tables before merging; the additive
`ledger-backlog.ts --json` edit is the one file this lane shares proximity with (not ownership
overlap) with G-023's future Session C work — confirm no conflicting edit landed there from a
sibling lane before merging.

## Review log

### SESSION_0585_REVIEW_01 — Cody self-review (Doug/Giddy/Desi review happens at the merge sweep)

- **Reviewed tasks:** SESSION_0585_TASK_01..04
- **Dirstarter docs check:** not applicable (no L1 surface touched)
- **Verdict:** the additive JSON contract is proven non-breaking (byte-diff on the default text
  output, empty); the pure-fn lib was validated against REAL ledger/session data, not just
  hand-written fixtures, and that probe caught 3 genuine parsing bugs before they shipped; the
  renderer's own live-render review caught and fixed 2 real signal-quality issues (needs-you
  noise, unbounded done-column) that a pure gate-pass (typecheck/lint/test) would never have
  surfaced — the headless Playwright proof was load-bearing, not decorative. Honest gaps: goal
  brand-classification is an acknowledged heuristic; the SESSION_0500 frontmatter gap is a named
  pre-existing data-quality issue, not fixed; risk-watch/needs-you are deliberately cross-brand
  (not tab-filtered) as a slice-1 simplification.
- **Score:** n/a (self-review — the wave's Doug/Giddy score at the merge sweep, per lane
  convention)
- **Follow-up:** merge-sweep items in "Proposed ledger edits" below.

## Hostile close review

Deferred to the merge sweep per the lane dispatch (Doug/Giddy review the wave together, per
SESSION_0582's PM_Plan). Self-review above; no known unresolved severity-medium+ finding beyond
what's already named in "Open decisions / blockers." Candidate hostile angles pre-answered:

- "The additive JSON change silently broke a consumer" — checked: no known consumer parses
  `ledger-backlog.ts --json`'s output programmatically today (grepped for callers repo-wide);
  `opening.md`'s only mention is informal ("`--json` for tooling"). The default text path (what
  `opening.md`'s bow-in step actually runs) is proven byte-identical.
- "The renderer silently hides data" — no: every section has an explicit empty state, the
  `done`-column cap always shows the TRUE total in the header plus an honest "+N more" note, and
  the goal-ladder table's extra columns scroll (don't clip) inside their own container.
- "The brand-token swap is cosmetic-only / not real CSS custom properties" — disproven via
  `getComputedStyle`, not class-presence — see Verification's brand-token probe.
- "Needs-you nags about closed work" — was TRUE until caught in this same session (15 of 19
  flagged sessions were already closed); fixed and verified before close.

## ADR / ubiquitous-language check

- ADR update not required — no architectural decision made; this projection reuses the existing
  ledger-driven-sessions model (`docs/protocols/loop-of-loops-ledger-driven-sessions.md`) and
  ADR 0049's `lane:` facet without amending either.
- Ubiquitous language update not required — no new domain terms; "belt ladder"/"work board"/
  "needs-you"/"brand tab" were already named in the SESSION_0582 v3-mock design decisions this
  lane implements against.

## Reflections

The dispatch prompt gave enough of the v3 mock's design decisions verbatim that not being able
to fetch the actual artifact (no web-fetch tool available, and it's a claude.ai session artifact
rather than a repo file) turned out not to block the build — the written design bullets were
detailed enough to implement against directly. Worth flagging for future lane dispatches: when a
visual mock lives only as a claude.ai artifact link, either fold its decisions into repo-committed
text (as this dispatch did well) or note explicitly that the builder has no way to view it.

The single most valuable step in this session was running each new parser against the REAL, live
`goals-ledger.md` and `docs/sprints/*` — not just the hand-written test fixtures. Three genuine
regex bugs (an em-dash split cutting "in-progress" at its own hyphen, a capture group crossing a
newline into the next bullet, and one goal's `Lane:` label sitting inline inside a different
bullet's prose) only surfaced against real, slightly-inconsistent ledger prose; the fixtures I'd
have written from the format doc alone would have been too clean to catch any of them. Same
lesson applied to the renderer: a green gate pass (typecheck/lint/test) said nothing about the
`needs-you` block being flooded with historical noise, or the `done` column rendering a
37,000-pixel page — only actually looking at the rendered output caught those. "Render proof" in
the GATES list wasn't ceremony; it did real work here.

The `apps/baseline` typecheck failure was a useful reminder that this lane's worktree bootstrap
(per `/seq-lane-build`) only primes `apps/web`'s Prisma client — a full-workspace `bun run
typecheck` will always red-flag `baseline` in a fresh worktree regardless of what a lane
actually touches. Not this lane's problem to fix, but worth naming for whoever next runs a
workspace-wide gate from a fresh worktree and wonders why `baseline` is red.

## Proposed ledger edits

<!-- The SESSION_0587 orchestrator's merge sweep applies these — not edited directly from this lane. -->

- **G-023** (goals-ledger.md): record the SOT-dashboard-slice-1 child as landed —
  `scripts/lib/state-of-project-parse.ts` + `scripts/state-of-project.ts` +
  `docs/protocols/state-of-project-projection.md`, additive `scripts/ledger-backlog.ts --json`
  fields. Slice 2 (`/app/state`) remains open/unbuilt.
- **New D-row candidate (drift-register):** `scripts/` has no root `format:check`/`oxfmt` gate —
  every file in the directory (pre-existing and new alike) fails `oxfmt --check` under default
  settings; `format:check` today only covers `apps/web`. Confirmed via direct probe against
  untouched files (`pr-nudge.ts`, `session-cost.ts`, pre-edit `ledger-backlog.ts`) — not a
  regression, a standing gap.
- **New D-row candidate (drift-register):** `docs/sprints/SESSION_0500.md` has no `status:`
  frontmatter field at all (pre-ADR-0049 era) — any tooling that reads session status via
  frontmatter (this projection included) will default it to "still open," which is wrong (it's
  long closed per `goals-ledger.md` G-004). A frontmatter-backfill sweep across historical
  session files would resolve this class of gap generally.
- **Adjacent-lane note for the merge sweep (not a conflict, proximity only):** this lane's ONLY
  edit inside a file another initiative will eventually touch is `scripts/ledger-backlog.ts`'s
  `--json` branch — G-023 Session C (not started, no branch exists yet) is slated to add a `lane`
  facet + `--lane=` filter to the SAME file. No actual collision this session (Session C hasn't
  started), flagged only so whoever picks up Session C reads this lane's additive `sessions`/
  `goals` fields before extending the file further.
- No new WL-row needed — nothing here fits the wiring-ledger's drift/regression-gap pattern; the
  two D-row candidates above are the right ledger for both findings.

## Full close evidence

Lane close (not a canonical bow-out): the SESSION_0587 orchestrator's merge sweep owns wiki
lint / index / ledger / Graphify steps for the whole wave. This lane's own evidence:

| Step | Proof |
| --- | --- |
| Frontmatter | `lane: rdd`, `goal_ids: [G-023]`, pairs SESSION_0582/0587 |
| Wiki lint (this lane's own new doc) | `bun run wiki:lint` — 0 errors, 54 warnings all pre-existing, none on `state-of-project-projection.md` |
| Kaizen reflection | Reflections section above |
| Self-review | SESSION_0585_REVIEW_01 |
| Review & Recommend | Next session goal (orchestrator merge sweep) written |
| Git hygiene | local commit on `session-0585-sot-dashboard` (hash below; NO push per dispatch) |
| Graphify update | deferred to the merge sweep (per lane convention — the wave-wide refresh happens once, at the sweep) |
