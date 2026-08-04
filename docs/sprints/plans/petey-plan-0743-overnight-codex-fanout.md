---
title: "Petey plan 0743 — overnight Codex fanout (Claudex commit-only) + autonomous-session enablement"
slug: petey-plan-0743-overnight-codex-fanout
type: plan
status: proposed
created: 2026-08-03
updated: 2026-08-03
last_agent: claude-fable-session-0743
pairs_with:

  - docs/sprints/SESSION_0743.md
  - docs/sprints/plans/petey-plan-0741-next-session-automation.md
  - docs/protocols/recipes/overnight-orchestrator-waves.md
  - docs/protocols/recipes/am-coffee-merge-review.md
backlinks:

  - docs/sprints/SESSION_0743.md
---

# Petey plan 0743 — overnight Codex fanout + autonomous-session enablement

**Mode:** plan + recipe extension + staged launch stub; NO product build this session. **Ratify:**
one word flips `status: proposed → ratified`. **Runs tonight only if ratified** — the fanout itself
executes in SESSION_0744 (staged stub, operator pastes `/bow-in`).

## The one sentence

Tonight's unattended block = a Fable 5 orchestrator (SESSION_0744) dispatching **5 Codex
commit-only lanes** (Claudex pattern) that each clear the hard auto-safety bar, ending at
branches + open PRs — **never a merge** — with Brian's AM sequence = AM_Coffee_Merge_Review
first, THEN attended #380 PR2.

## Pinned decisions (SESSION_0743 grill, operator-elected)

| # | Fork | Pick |
| --- | --- | --- |
| P1 | Orchestrator model | **Fable 5** (this session's family); lanes = Codex `gpt-5.6-sol`, commit-only, `model_reasoning_effort="high"` |
| P2 | 0742 B1 baton `model:` facet | **Fable 5** (operator-elected over "Opus 5 fast"; see §E model note) |
| P3 | PR #361 (member-settings parity) | **OFF the overnight run** — untouched, stays open for a later attended lane |
| P4 | Lane sourcing | Epics/wayfinder maps + wiring ledger + goals ledger, ~5–6 sessions worth (operator's words) |
| P5 | Merge policy | **No merges overnight, ever** — no active merge owner (0641 closed); server-enforced PR-only main + required checks (`CI complete` + `Playwright complete`, fail-closed) is the backstop |

## The hard auto-safety bar (a lane fans out ONLY if ALL hold)

1. **Fully specified** — written acceptance criteria, zero open operator forks.
2. **Machine-gate-able** — green `bunx tsc --noEmit` / `bun run test --parallel=1` / `bun run lint`
   (lint writes files → stage explicitly), clear pass/fail, no human/visual judgment. Gates must be
   **sandbox-runnable** (Codex Keychain boundary: `prisma generate`/`next build` SIGSEGV in-sandbox
   = ENVIRONMENTAL — the orchestrator runs `next build` FOREGROUND in a normal shell).
3. **Disjoint** — provably empty-intersection owned file sets vs every other overnight lane AND vs
   the live/staged lanes (0742 staged B1 · #380 PR2 · PR #361 · the 0743 plan PR). See the matrix.
4. **No risky class** — no deploys, DNS, contracts, money, real client PII, external-account
   changes, no schema migration against a real DB. Preserve: ADR 0035/0058 display law ·
   IMPORTED-lock stays LIFTED · technique-media NO-LEAK · WL-P2-83 beltFamily gate read-only ·
   writes stay on RankAward until the PR2 cutover · Graphify refresh POST-MERGE only · SotD kernel
   + shared ledgers frozen (findings → lane SESSION `## Proposed ledger edits`; AM owner applies).

## §A — The auto-safe lane list (5 lanes)

### L1 — B2: recipe-card contract block + `recipe:` lint (petey-plan-0741 §B2, D3 pinned)

- **Goal:** additive frontmatter contract block (`personas/load_set/inputs/gates/output_contract`)
  on every `docs/protocols/recipes/*.md` card (lift `lane.md`'s 6-item minimum-output contract as
  the first `output_contract`) + a wiki-lint check that any SESSION `recipe:` value names an
  existing card. Ratified in petey-plan-0741 (D3) — grill nothing.
- **Owned files:** `docs/protocols/recipes/*.md` (all cards) · `scripts/wiki-lint.ts` ·
  `docs/protocols/llm-wiki-schema.md` (rule doc) · own `SESSION_NNNN.md`.
- **Disjointness:** B1∥B2 disjoint by design (lint pinned to wiki-lint, NOT the gate runner B1
  owns). **DECLARED STACK:** branches from the 0743 plan branch (both touch
  `overnight-orchestrator-waves.md`) — PR body + lane inventory carry **MERGE-AFTER the 0743 plan
  PR** (recipe §5, proven 0663/0673).
- **Lane-prompt outline:** HARD-RULES preamble → read petey-plan-0741 §B2 + llm-wiki-schema →
  add block to every card → extend wiki-lint with the `recipe:`-value check + a fixture negative
  test → gates → commit, STOP.
- **Machine gate:** `bun run wiki:lint` green on the tree AND fails on a synthetic bogus
  `recipe:` value (negative proof committed as a test/fixture) · every card carries the 5-key
  block (`grep -L` sweep = empty) · `bunx tsc --noEmit` green.

### L2 — Drift-docs conform sweep: D-063 + D-057 + D-059

- **Goal:** three mechanical, fully-specified drift fixes: (a) D-063 —
  `docs/knowledge/wiki/ronin-project-context.md` five-repo conform pass (kill the :72-77
  monorepo-era hosting claims; supersession banner pointing at ADR 0055/0059); (b) D-057 —
  "hardlink" → "symlink" wording in `docs/petey-plan-tier1-autonomous-lanes.md` (the one live
  non-archive, non-SESSION cite; closed SESSION files + `_archive/` + generated `docs/index.html`
  are history — never rewritten); (c) D-059 — comment-only corrections at
  `apps/web/server/belt/router.ts:371` + `apps/web/server/belt/verify-rank-entry.ts:28` (stale
  IMPORTED-authority-lock assertions; zero behavior change).
- **Owned files:** exactly the four files above + own `SESSION_NNNN.md`.
- **Disjointness:** no overlap with L1 (recipes/), L3 (lineage tests), L4 (workflows/scripts),
  0742 B1 set, or the 0743 plan PR. D-059's belt files may later be touched by #380 PR2 — PR2 is
  attended AM and starts AFTER the merge review lands this lane (sequential, rebase handles).
- **Lane-prompt outline:** HARD-RULES → read D-063/D-057/D-059 register rows + ADR 0055/0059 →
  the three fixes, comment/wording-only in code → grep-proofs → status flips proposed in the lane
  SESSION file only (drift-register is a frozen shared ledger).
- **Machine gate:** `grep -c` proofs = 0 (monorepo-era hosting claims in ronin-project-context ·
  "hardlink" in the live plan doc · IMPORTED-lock comment assertions at the two sites) ·
  `bun run wiki:lint` green · `bunx tsc --noEmit` green (comments can't break it; cheap proof).

### L3 — #378: lineage test-gate fix (Discipline-code collision + cross-suite flakes)

- **Goal:** the issue is pre-specified and pre-labeled "**Agent: autonomous (Claude or codex) —
  test-only, AFK-safe**": fix the `slice(0,16)` Discipline-code truncation-collision in
  `node-profile-actions.test.ts` (unique collision-free codes) + stabilize the P2002/P2034
  cross-suite concurrency flakes in `lineage-member-placement.test.ts` +
  `reconcile-pending-claims.test.ts`.
- **Owned files:** those test/fixture/seed-helper files only (issue's own allowlist) + own
  `SESSION_NNNN.md`.
- **Disjointness:** test files only; empty intersection with every other lane. **DB rule:** L3 and
  L5 both run the full suite against the local test DB → they run in **different waves**
  (serialized) or with per-lane test DB names — never concurrently.
- **Lane-prompt outline:** HARD-RULES (+ "tests NEVER weakened/skipped — a fix that deletes or
  loosens an assertion is a failed lane") → read #378 → fix → repeat-gate.
- **Machine gate:** issue's own acceptance —
  `bun test --parallel=1 --path-ignore-patterns='e2e/**'` **green across 3 repeats**, `REAL_EXIT`
  recorded each run.

### L4 — FS-0046: CI typecheck covers the root `scripts/` tree

- **Goal:** the FS row's proposed fix — add a `tsc -p scripts/tsconfig.json --noEmit` step to CI
  (`.github/workflows/ci.yml`) so a type error in root scripts can't merge green + fix any type
  errors the new step surfaces.
- **Owned files:** `.github/workflows/ci.yml` · `scripts/**/*.ts` type-fixes **EXCLUDING
  `scripts/wiki-lint.ts`** (L1-owned; a type error there = finding routed to the lane SESSION
  file, not fixed here) + own `SESSION_NNNN.md`.
- **Disjointness:** workflows are touched by no other lane; the wiki-lint carve-out keeps
  L4 ∩ L1 = ∅. Does NOT touch `scripts/bow-out-gates.sh` (0742 B1-owned; it's bash anyway).
- **Lane-prompt outline:** HARD-RULES → read FS-0046 → run `tsc -p scripts/tsconfig.json
  --noEmit` first (inventory errors) → add CI step (changes-machinery aware: step must not break
  docs-only PR passes) → fix surfaced errors within the allowlist → gates.
- **Machine gate:** `tsc -p scripts/tsconfig.json --noEmit` green in-sandbox · full
  `bunx tsc --noEmit` green · the PR's own required checks green at open (the new step runs on
  the PR itself — self-proving).

### L5 — TFF-006: billing portal/checkout flake — bounded repro-or-report

- **Goal:** the one open TFF row ("needs local repro"): reproduce the billing portal/checkout
  cluster flake under `--parallel=1` at 105-file scale. **Bounded contract:** if reproduced →
  root-cause fix (never weaken a test); if NOT reproduced after 3 full-suite runs → commit a
  forensics report (runs, timings, suspect shared-state analysis) to the lane SESSION file and
  STOP. Either outcome is a clean exit.
- **Owned files:** billing/checkout test + fixture files only (enumerated in the dispatch prompt
  at mint time) + own `SESSION_NNNN.md`.
- **Disjointness:** billing tests ∩ lineage tests (L3) = ∅. Same DB rule as L3: different wave or
  per-lane test DB.
- **Machine gate:** fix path — full suite green ×3 repeats with `REAL_EXIT`; report path — the
  committed forensics section (structured: repro attempts, exit codes, hypothesis ranking).

### Rejected / borderline (surveyed, did NOT clear the bar — honest list)

| Candidate | Bar failed | Why |
| --- | --- | --- |
| **WL-P2-10 dep-removal slice** | stale | All 4 deps already gone from package.json (verified 2026-08-03) — stale ledger row; **proposed edit:** mark the removal slice done, sidebar-complexity remainder stays open |
| D-060 + D-061 (build-output hygiene) | 2 | Gate = warning-free `next build` — not sandbox-runnable; fix loop needs foreground build iteration → attended or Claude-driver lane |
| #379 straggler sweep (script + dry-run) | 1/4 | Write-shape (RankAward vs RankEntry) is a live fork mid-#380-window → attended after PR2 |
| #381 env hygiene (.env.prod creds) | 4 | Secrets/prod creds — never autonomous |
| WL-P3-38 (e2e self-skip assertions) | 2 | Playwright-in-Codex-sandbox unproven; candidate for a later Claude-driver night |
| WL-P2-3 (list-row consolidation) | 2 | UI parity = visual judgment |
| Wayfinder #384–#395 schema gap-fills | 1/4 | `wayfinder:grilling` forks open + schema migrations = attended |
| RISK #4–#13 | 4 | Security/credential class — attended |
| WL-P2-73/78, WL-P2-79 | 3 | Collide with 0742 B1 (gate runner) / petey-plan-0741 B5 (auto-session.sh) file sets |

## Disjointness matrix (owned-set intersections — all ∅)

| | L1 recipes+lint | L2 drift docs | L3 lineage tests | L4 CI+scripts | L5 billing tests |
| --- | --- | --- | --- | --- | --- |
| **L1** | — | ∅ | ∅ | ∅ (wiki-lint.ts carved out of L4) | ∅ |
| **L2** | | — | ∅ | ∅ | ∅ |
| **L3** | | | — | ∅ | ∅ (files); DB serialized by wave |
| **L4** | | | | — | ∅ |
| **vs 0742 B1** (templates · bow-out-gates.sh · bow-in-gates.sh · closing.md · bow-out SKILL) | ∅ | ∅ | ∅ | ∅ | ∅ |
| **vs #380 PR2** (rank writer/reader + schema — attended AM) | ∅ | comments only, sequenced after AM merge | ∅ | ∅ | ∅ |
| **vs PR #361** (member settings) | ∅ | ∅ | ∅ | ∅ | ∅ |
| **vs 0743 plan PR** | **declared stack, MERGE-AFTER** | ∅ | ∅ | ∅ | ∅ |

## §D — DEFERRED CONTINUATION: #380 PR2 (attended, morning — ⛔ excluded from overnight)

**#380 PR2 — the writer/reader CUTOVER — must NOT run overnight.** It flips the write path off
RankAward (provenance-immutability trigger §3 · anchor relax: `RankEntry.rankAwardId` DROP NOT
NULL + Cascade→SetNull) — high blast radius, operator-attended only.

- **Resume from:** `docs/product/black-belt-legacy/380-rankaward-drop-plan.md` **§4-PR2** (plan
  status: ratified; PR1 landed #418 + prod-verified V1–V6, SESSION_0740).
- **Brian's AM sequence:** ① **AM_Coffee_Merge_Review** (recipe card) — recon → quarantine check →
  per-lane rebase + full gates → merge L1–L5 PRs on the operator's word → apply all lanes'
  proposed ledger edits in ONE canonical commit → Graphify refresh (post-merge only) → ② **then**
  the attended #380 PR2 lane, rebased on the merged main.
- **Overnight exclusion list:** #380 PR2 write-path files · any schema migration · 0742 B1's file
  set (staged, attended-only facet) · PR #361 · SotD kernel · all shared ledgers · anything in the
  risky class (bar 4).

## §E — Automation-B1 enablement (per the 0742 baton)

- **0742 stays the staged B1 lane, attended-only** (`autonomy: attended-only`, D8 — never
  headless by default). It is NOT in tonight's fanout; Brian pastes its in-stub kickoff whenever
  elected. Its file set stays frozen to every overnight lane (matrix above).
- **Model facet flipped: `model: "Opus 5 (fast mode)"` → `model: "Fable 5"`** — operator-elected
  at the SESSION_0743 grill (P2). **Model note for the record:** the 0743 kickoff claimed "no
  released Opus 5; flagship = Opus 4.8" — per the executing agent's environment, **Opus 5
  (`claude-opus-5`) IS a released Claude 5-family model** (fast mode runs on Opus 5/4.8/4.7), so
  the original baton label was not a misnomer; the flip to Fable 5 is an operator preference, not
  a correction. Baton corrected accordingly.
- **B2 executes tonight as L1** (declared stack) — the first automation slice to land
  autonomously, which is itself Phase-2-style calibration signal for the D7 policy (docs-only
  lanes first).
- **B3/B4/B5 stay queued** per petey-plan-0741 order (B3 wide-touch solo · B4 convergence ·
  B5 auto-session.sh refit after B1).

## Ops notes (SESSION_0744 orchestrator, runtime)

- **Caffeinate:** confirmed live at 0743 bow-in — `caffeinate -dimsu -t 86400`, ~12.1h remaining
  (expires ≈11:30 AM) — covers the overnight window + AM start.
- **Mint discipline:** serial mint via `ledger-id-next` + sanity guards (recipe §1, FS-0038
  killer); reservation branch per lane; the AM stub is staged BEFORE wave 1 (recipe §7
  precondition) and pushed on the orchestrator's own PR after every wave.
- **Codex incantation** (memory `codex-exec-authenticates-from-sandbox`):
  `codex exec --cd <worktree> -s workspace-write --add-dir <canonical>/.git
  --ignore-user-config -m gpt-5.6-sol -c 'model_reasoning_effort="high"' -o lane-final.md -
  < lane-prompt.md`
- **Gates:** in-sandbox tsc/test/lint per lane; orchestrator foreground `next build` (normal
  shell, `REAL_EXIT`, never `| tail` — PL-010) at push time; push branch + `gh pr create` → STOP.
- **Wave shape:** wave 1 = L1 + L2 + L4 (no-DB lanes, concurrent) · wave 2 = L3 · wave 3 = L5
  (test-suite lanes serialized — shared local test DB).
- **Salvage rule:** Codex limit-wall mid-lane → a Claude session adopts the same worktree, disk
  truth first (recipe §4).

## Risks

1. **Stale-spec hazard** (recipe failure mode 3, proven again tonight by WL-P2-10): every lane
   prompt opens with "verify current state before building" — L1 re-greps card list, L2 re-reads
   the drift rows, L4 re-runs the scripts tsc inventory.
2. **L1 stack timing** — if the 0743 plan PR gets AM-merged before L1, the stack rebases clean;
   if L1's PR is reviewed first, MERGE-AFTER in the PR body blocks a wrong-order merge.
3. **Test-DB contention** — mitigated by wave serialization (ops notes).
4. **Codex judgment drift on L5** (investigation-flavored) — bounded by the repro-or-report exit
   contract; no fix without a reproduced failure.
5. **Headless breach of push/merge law** — unchanged backstops: server-enforced PR-only main,
   required checks fail-closed, no merge owner exists overnight.

## Scope guard

No product features · no schema/migrations · no deploys · no ledger writes in-lane · no merges ·
no #380 PR2 surface · no 0742 B1 surface · no PR #361 surface. The fanout produces branches +
open PRs + lane SESSION files, full stop.
