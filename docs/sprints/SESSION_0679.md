---
title: "SESSION 0679 — canonize the overnight-orchestrator pattern + Ronin bots concept (/gq dojo bots) (auto lane, wave 13/14)"
slug: session-0679
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0679
sprint: S12
lane: repo
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0679 — canonize the overnight-orchestrator pattern + Ronin bots concept (/gq dojo bots) (auto lane, wave 13/14)

> Staged by the SESSION_0635 orchestrator (waves 13+14, operator-directed). Adopted; work complete;
> PR held at the gate per the standing authorization. Branch: `auto/session-0679-orchestrator-canon`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

canonize the overnight-orchestrator pattern + Ronin bots concept (/gq dojo bots).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0679_TASK_01 | landed | **Recipe card** `docs/protocols/recipes/overnight-orchestrator-waves.md` — house recipe-card shape (format read from `merge-wave.md` + `orchestrator.md`, neither edited). Distilled from the run's actual record (`git show origin/session-0635-rdd-golive:docs/sprints/SESSION_0641.md` + `SESSION_0635.md`): serial minting + sanity guards (FS-0038; mint-parse clobber as failure mode №1), worktree-per-lane + parent-shell bootstrap (RESEND_API_KEY stripped), HARD-RULES preamble anatomy (7 parts incl. Proposed-ledger-edits + no-shared-ledgers), driver selection (Claude Fable/Sonnet vs codex gpt-5.6-sol commit-only — Keychain boundary, proven incantation, Claude same-worktree salvage), declared stacks (MERGE-AFTER), reference-reads via `git show origin/<branch>:<path>`, AM-stub-as-baton (pushed on the orchestrator's PR), outcome-driven wave pacing, operator-gate law (holding at the PR gate = CORRECT). Honest failure-modes section: mint-parse clobber · PL-010 pipe-masked deploy exit · stale-spec/verify-first · browser-pane contention · codex Keychain SIGSEGV. |
| SESSION_0679_TASK_02 | landed | **Ronin bots concept** `docs/architecture/research/ronin-bots-concept.md`. Archaeology ran as dispatched: `graphify query "dojo bots" --budget 1200` from canonical (lexical `robots.ts` noise only) + `grep -ri "dojo bots\|dojobots" docs/` — **original FOUND: "DojoBots" = the BBL feature-request widget (SESSION_0422**, `feature-request-dialog.md` wiki page, toast "the DojoBots are on it. 🤖", refs in SESSION_0420/0423 + POST_LAUNCH_SOT). Concept: ADR 0051 kernel→brand→app applied to the agents — internal roster (Petey/Cody/Doug/Giddy/Desi/Brandon + Larry/Iggy per PR #301) as the kernel, per-brand bot families (Ronin Building bots, Ronin Plumbing bots, DojoBots) as the skin; feeds the SESSION_0680 /process page (named as its cast + naming source); trademark (USPTO 87300933 via PR #291) + never-oversell-autonomy voice cautions; 5 open forks (fixed vs custom names, invoice/deliverable attribution, persona surfacing, DojoBots convergence, copy-only vs kernel module). |

## What landed

- `docs/protocols/recipes/overnight-orchestrator-waves.md` — the 14-wave overnight run
  (SESSION_0635, ~40 lanes, PRs #264+) made repeatable canon in the house recipe-card format.
- `docs/architecture/research/ronin-bots-concept.md` — the client-facing naming layer over the
  agent OS, with the original DojoBots idea found and cited (SESSION_0422 BBL widget).
- This session record. Docs-only; no bootstrap; no app code; no shared-ledger writes.

## Files touched

| File | Change |
| --- | --- |
| `docs/protocols/recipes/overnight-orchestrator-waves.md` | NEW — recipe card canonizing the overnight multi-wave orchestrator pattern |
| `docs/architecture/research/ronin-bots-concept.md` | NEW — Ronin bots concept + DojoBots archaeology |
| `docs/sprints/SESSION_0679.md` | This session record (adopted staged stub) |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` before writes | `/Users/brianscott/dev/ronin-0679` · `auto/session-0679-orchestrator-canon` ✓ |
| `git show origin/session-0635-rdd-golive:docs/sprints/SESSION_0641.md` (+ `SESSION_0635.md`) | Read in full (263 lines / waves 1–12 records + results; 0635 TASK_07/08/09 dispatch records incl. the mint-parse-bug note + `e5803af6` restore) |
| `graphify query "dojo bots" --budget 1200` (from canonical, read-only) | REAL_EXIT=0 — 437 nodes, all lexical `robots.ts`/`robots()` noise; concept not a graph node |
| `grep -ri "dojo bots\|dojobots" docs/` (canonical, read-only) | REAL_EXIT=0 — 5 files; original DojoBots located (SESSION_0420/0423, POST_LAUNCH_SOT, feature-request-dialog wiki page, wiki index) |
| `bun scripts/wiki-lint.ts` | REAL_EXIT=0 — 0 errors (first pass: 2 R1 errors from link syntax inside proposal fences → converted to backticked paths per the SESSION_0676 pattern); 112 warnings all pre-existing in files this lane does not own |
| Write-scope check | Only the 3 owned files created/modified; explicit-path staging; no ledger/wiki/app/product/recipe-card-existing edits |

## Proposed ledger edits

<!-- NO ids minted in-lane. Merge owner assigns ids via ledger-id-next and applies in ONE commit. -->

1. **SOT_Cookbook router row** (`docs/protocols/SOT_Cookbook.md`, the task→recipe table — merge
   owner converts the backticked path to the file's standard link form):

   ```markdown
   | An overnight/AFK block converted into PRs via rolling autonomous waves | `recipes/overnight-orchestrator-waves.md` | extends `orchestrator.md`; standing branch+PR authorization required; AM stub is the baton |
   ```

2. **Wiki-index row** (`docs/knowledge/wiki/index.md`, wherever protocol/recipe files are indexed —
   merge owner places + links per index convention):

   ```markdown
   | `docs/protocols/recipes/overnight-orchestrator-waves.md` | protocol | active — rolling multi-wave overnight orchestrator (canonized from the SESSION_0635 14-wave run: mint guards, HARD-RULES anatomy, driver selection, AM-stub baton, operator-gate law + failure modes) |
   ```

3. **Goals-ledger row — "Ronin bots / agent-OS productization"** (id via `ledger-id-next`):

   ```markdown
   ### G-0XX — Ronin bots: productize the agent OS as a client-facing per-brand bot family

   - **Status:** open — P3 (concept; naming unratified)
   - **Objective:** ADR 0051 kernel→brand→app applied to the agents — ONE agent kernel (roster +
     recipes + orchestrator waves) presented per client brand as a named bot family (Ronin Building
     bots for Mammoth, DojoBots on BBL, …): naming scheme, /process-page cast (SESSION_0680), and
     eventually a small bot-family config consumable by any app's surfaces.
   - **Why:** the 14-wave overnight run proved the engine ("this is the agent's OS" — operator);
     the naming layer is how clients buy it without being taught git. Original seed: the BBL
     DojoBots widget (SESSION_0422).
   - **Lane:** rdd / productization. **Born:** SESSION_0679 (wave-14 auto lane, operator-directed).
   - **Cross-refs:** `docs/architecture/research/ronin-bots-concept.md` (5 open forks incl.
     trademark check), `docs/protocols/recipes/overnight-orchestrator-waves.md`, PR #301
     (Larry/Iggy), PR #291 (USPTO 87300933 flag), PL-013 (Iggy social automation).
   ```

4. **Planning-ledger rows tying tonight's run to the ledgers** (operator-directed; ids via
   `ledger-id-next`):

   ```markdown
   ### PL-0XX — Overnight-run debrief: fold the 14-wave outcomes into the ledgers — queued

   The SESSION_0635 run (waves 1–14, lanes 0636–0680, PRs #264+) produced ledger-relevant outcomes
   beyond each lane's Proposed-ledger-edits: the stale-ledger corrections surfaced mid-run (G-013
   superseded by G-022 · 5 stale WL rows · graph Wave-2 already landed), the PL-010 pipe-masking
   recurrence, the FS-0038 mint-parse near-miss (now a failure mode in
   `recipes/overnight-orchestrator-waves.md`), and the operator's decision batch (18+ open forks
   across #277/#280/#281/#282 + consent default + trademark check). Sweep these into FS/WL/D/goals
   at (or after) the SESSION_0641 AM merge so the run's lessons live in ledgers, not only in the
   orchestrator stub.

   ### PL-0XX — Ronin bots naming ratification + /process alignment — queued

   Operator ratifies the Ronin-bots forks (fixed vs custom family names · invoice/deliverable
   attribution · persona surfacing · DojoBots convergence · copy-only vs kernel module) from
   `ronin-bots-concept.md`, then align the SESSION_0680 /process page vocabulary to the ratified
   scheme (0680 was told to treat the concept doc as the naming source).
   ```

## Open decisions / blockers

- None in-lane. All concept forks deliberately left open for the operator (listed in the concept
  doc + proposed goals row).

## Residual for AM merge

- **Operator ratifies the recipe card** (it's written as `status: active`; the PR review is the
  ratification gate) **and the "Ronin bots" naming** before anything client-facing uses it.
- Merge owner applies the 4 Proposed-ledger-edits blocks above (ids via `ledger-id-next`, ONE
  canonical commit), and checks SESSION_0680's /process language against the concept doc.
- Cross-link note: the recipe card cites `SESSION_0635.md`/`SESSION_0641.md` "on
  `session-0635-rdd-golive` until merged" — once the orchestrator's PR lands, those become plain
  repo paths (no edit needed; the parenthetical self-resolves).
