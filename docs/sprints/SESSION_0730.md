---
title: "SESSION 0730 — Review + simplify the #376 rank-read seam (Fable → Codex); greenfield RankEntry"
slug: session-0730
type: session--open
status: in-progress
created: 2026-07-31
updated: 2026-07-31
last_agent: claude-session-0729
sprint: S13
lane: bbl
recipe: "seq-review-wave"
goal_ids: ["G-011"]
tickets: ["#376", "#380"]
next_session:
pairs_with:
  - docs/sprints/SESSION_0729.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0730 — Review + simplify the #376 seam; greenfield RankEntry

> **Continuation of SESSION_0729** (not a fresh lane). #376 is **BUILT + verified LAUNCH-SAFE**
> (Doug 9.2/10, no P1) but **unmerged**, sitting in worktree `wt-0729-rank-seam` on branch
> `auto/session-0729-rank-read-seam` (63 files, WIP-committed locally, **NOT pushed**). This session
> reviews/simplifies it before the operator's merge. Adopt: continue in that worktree; flip
> `status:` → `in-progress`.

## Orchestration (operator-specified)

- **Fable = orchestrator.** **Hand off FULLY to Codex** to (a) attempt the simplification/refactor
  and offer review/refactor solutions, and (b) run **`/ggr` + code-quality + fallow-fix-loop** on
  the #376 diff. (Codex exec sandbox — mind the Keychain build wall; gates on Claude/foreground if
  codex can't build. See [[orchestration-and-lanes]].) Include a **hostile review** pass.

## Agenda

1. **Open with the greenfield question (the lens):** *If we wrote `RankEntry` from scratch today —
   no `RankAward` backlog, no migration bridge, no compat anchor — knowing everything it needs to be
   now, what is the SIMPLEST shape that still does the job?* Ask what the model, the two axes
   (`status` mutable / `provenance` immutable), and the fact-set (awardedAt/promoter/event) *should*
   have been in the first place, and how to simplify toward that while still shipping. Use the answer
   to grade the current seam, not to rewrite it blindly.
2. **Codex simplify + review:** refactor/simplification proposals on the #376 diff; then `/ggr` (QAR
   gate — ≥9.0 clears; Doug's 9.2 is the standing score to beat/confirm), code-quality-matrix, and
   fallow-fix-loop (CRAP/dupes/dead-code/complexity delta). Hostile-review the seam.
3. **MERGE GATE (do NOT merge without this):** re-run the orphan count against **live prod**
   (`RankAward` with no `RankEntry` — expect 0 per map #374 2026-07-30). **Blocked** until the
   `.env.prod` Neon credential is rotated (see the spawned chip; rotated in RDD, not yet BBL).
4. **Fold Doug's P2:** the unguarded 0-orphan invariant → design a runtime guard, routed to the
   **#380 cutover** lane (a 2nd award at an already-entried rank can never sync → permanent orphan).
5. **Housekeeping:** the migration folder + seam files were untracked (now WIP-committed) — confirm
   they ride the eventual PR; oxfmt/gates re-green after any Codex edits.

## Resolved upstream (do not re-open)

- #376 is behavior-parity-verified (Doug): trust-resolver no-flip, belt-gate provenance identical,
  ordering parity, no crash. The reviews here are for SIMPLIFICATION + confidence, not correctness
  re-litigation.
- Sequencing law (operator 0729): the RankAward correctness arc (#376 → cutover → #380 drop) is
  **BEFORE** the FI-001 send, never post-send ([[fi001-send-gated-on-correct-site]]).

## Also staged (candidate lanes — grill/plan, do NOT auto-execute)

- **Baseline-cut de-scope (BIG):** cut **Baseline Martial Arts + all non-lineage code/DBs** from this
  repo — courses/curriculum, programs, and anything not lineage. Operator (0729): barely-started, dead
  weight, dragging down what should be lineage-simple. Needs a grill/plan first (what exactly, DB
  disposition, dependency untangle, risk, the `apps/baseline` + Baseline seams). Likely its own lane.
- **CAND deepening candidates:** the 9 candidates from the SESSION_0711 `/improve-codebase-architecture`
  artifact (`claude.ai/code/artifact/dcd046d6-c770-42ac-81c3-80a3c44adfe2`) — re-verify post-fork
  applicability, wayfinder-chart, sequence. (DRY: reference the artifact, don't re-doc.)

## Baton (paste-ready)

```
/bow-in — CONTINUATION of #376 (SESSION_0729). Fable orchestrates; hand off FULLY to Codex.
Repo: black-belt-legacy (ONE repo, ADR 0059). Worktree ALREADY EXISTS: /Users/brianscott/dev/
wt-0729-rank-seam, branch auto/session-0729-rank-read-seam — do NOT create a new one. #376 is
BUILT + Doug-verified LAUNCH-SAFE (9.2), green (1953 tests), unmerged, HELD.

FIRST: the greenfield question — if RankEntry were written from scratch today (no RankAward
backlog/migration bridge), what's the simplest shape that still does the job? Grade the seam by it.
THEN Codex: simplification/refactor proposals + /ggr + code-quality + fallow-fix-loop + hostile
review on the #376 diff. Re-green all gates after edits.

MERGE GATE (AFK-NEVER without it): re-run the live-prod orphan count (0 expected) — blocked on the
.env.prod credential rotation. Fold Doug's P2 (unguarded 0-orphan invariant → #380 guard).

HOLD every push/merge for the operator's word. Also on deck (grill/plan only): the Baseline-cut
de-scope + the SESSION_0711 CAND deepening candidates.
```

## Bow-in

Adopted the staged SESSION_0730 stub found on 0729's branch (elected via SESSION_0729's
`next_session` pointer + this stub — not by highest-number, FS-0050). **Continuing in
`wt-0729-rank-seam` / `auto/session-0729-rank-read-seam` per the stub's "do NOT create a new
worktree"** — that supersedes the generic `worktree add ../ronin-0730` line in the bow-in prompt
(the worktree already exists, is bootstrapped, and holds the WIP commit `a0c53b68`). Canonical
claim: free (session runs here, not in canonical — FS-0035); githooks doctor PASS **run from this
worktree** (FS-0040). Working tree clean at adoption. Orchestrator: Fable 5 (Petey role); heavy
review/refactor hands off to Codex per the stub.

**Prior goal (0729): EXTENDED** — the #376 seam is BUILT + Doug-verified LAUNCH-SAFE (9.2/10, no
P1), 1953 tests green, unmerged/unpushed by design; reviews + merge gate deferred to this session.

**FS-0048 read-before-build sweep (read, not name-matched):** map #374 incl. Decisions-so-far ·
tickets #376 / #380 · SESSION_0729 close (Doug verdict, MERGE GATE, P2 orphan invariant) · ADR 0058
+ legacy ADR 0035/0036 truths (ratified — grill grades the model shape, never re-opens them) ·
`server/belt/member-ranks.ts` (the seam) · `rank-entry-compatibility.ts` (`syncRankEntryFromAward`)
· `belt-gate.ts` (provenance wiring, fact-editability) · `prisma/schema.prisma` RankEntry/RankAward
+ the 4 rank enums.

**Parallel-lane assessment (G-023):** single continuation lane by design. Live sibling lanes noted
(wayfinder RankEntry planner = map #374, already consumed as input; 0728 closed; North Star + 0720
orchestrators untouched). No file overlap expected outside this branch's own diff; will flag if
that changes.

## Ratified forks (operator, 2026-07-31 — the greenfield grill)

Grill inputs: map #374 Decisions-so-far · tickets #376/#380 · ADR 0058 + legacy 0035/0036 (truths
untouched) · the seam/compat/gate/schema reads above. Grill finding that sharpened the tree:
`RankAward` ALREADY carries `@@unique([passportId, rankId])` — state-not-history is landed law on
BOTH tables, and today's `RankEntry` is a **derived projection** (status+provenance computed from
the award; every fact + satellite still award-anchored).

1. **FORK 1 — End-state = ONE TABLE.** At #380, `RankEntry` absorbs the promotion facts
   (awardedAt / promoter pair / school pair / event link); satellites (milestone, lineage edges,
   media, gamification) re-anchor entry-side. The two-table split was the accident; the columns
   were right. (Feeds #380; ADR lands with #380's ratified drop plan.)
2. **FORK 2 — Cardinality = STATE.** One row per (passport, rank) survives the drop; a re-award
   updates facts. Doug's P2 guard = **alert on sync conflict**, never silent orphan → #380.
3. **FORK 3 — Trust axes = FOLD.** `status` (mutable trust) + `provenance` (immutable origin)
   survive; the authority FK migrates over; `verificationStatus` dies (absorbed); authorship
   (`source`) kept only if not derivable. Exact minimal set = #380 grill; direction is ratified.
4. **FORK 4 — 0730 scope = CODE-SHAPE ONLY.** Codex refactor touches no schema/migration; the
   additive #376 migration + Doug's 9.2 stand. All model moves ride #380.

## Petey plan

- `SESSION_0730_TASK_01` — Greenfield grill → 4 forks ratified (above). **DONE**
- `SESSION_0730_TASK_02` — Record picks on map #374 (Decisions-so-far comment).
- `SESSION_0730_TASK_03` — Codex handoff (Claudex, commit-only): hostile review +
  code-quality-matrix + simplification refactor of the #376 diff (`a0c53b68` vs `main`), hard
  constraints encoded (no schema; ADR 0035/0058 display law; belt-gate contracts; technique-media
  NO-LEAK; tests stay green).
- `SESSION_0730_TASK_04` — Foreground verification on Claude: full gates (tsc / oxlint / oxfmt /
  tests / next build) + `/fallow-fix-loop` metrics + `/ggr` (≥9.0 clears; 9.2 to beat/confirm).
- `SESSION_0730_TASK_05` — Show the operator; **HOLD** push/PR/merge for the word. MERGE GATE
  (live-prod orphan count) stays blocked on #381 credential rotation.

**Deferrals registered (operator, 0730 correction message):** the **Graphify refresh WAITS until
#376 actually merges** — do not refresh at bow-out if the branch is still unmerged. FI-001 drift
corrections are ALREADY posted on #380 + map #374 (0729's close) — never re-post; this session's
#374 comment is the NEW fork-decision record, distinct content. Baseline-cut de-scope stays a
grill-first candidate lane (memory: [[cut-baseline-and-non-lineage-from-bbl-repo]]).

## Review log (TASK_03/04 — Codex handoff + foreground verification)

- **Codex** (exec sandbox, high reasoning, commit-only): 9 commits on top of `a0c53b68`; report =
  3 P1 claims "fixed", self-score 8.9/10 GO-WITH-NOTE; its sandbox could NOT run the DB suite
  (Postgres unavailable) — flagged honestly in its own gate report.
- **Giddy /ggr adjudication (delta-scoped): 9.2 CLEARS** pre-gate — schema freeze respected, no
  write repoint, #376 seam contract intact; ruled nulls-last ordering a safe ADR-0035 improvement;
  caught 2 behavior changes Codex's summary hid (bracket seeding most-recent→highest-belt;
  related-profiles tiebreak createdAt→awardedAt).
- **Foreground full gate caught what both missed:** 9 DB-backed test failures. Root cause: two of
  Codex's "P1 fixes" undid deliberate 0729 design —
  (1) create-only provenance in `syncRankEntryFromAward` removed the update-branch HEAL, so a
  column-default (EARNED) entry under an IMPORTED award made the award **member-editable**
  (authority-truth regression, the exact inverse of the claimed fix);
  (2) `rankAwardProvenance` null/fail-closed + provenance-keyed `resolveAnchorAward` broke the
  SESSION_0501 fill-blanks policy and the SESSION_0540 promoter-anchor tree for unsynced awards.
- **Parity fixes (this session, foreground):** restored the update-branch provenance write (+ pinned
  the heal in `rank-entry-provenance.test.ts`), restored the derive-fallback read (bridge code that
  dies with the award table at #380), reverted the anchor read to `verificationStatus`, removed the
  two fail-closed pins. Domain invariant now documented at both sites: `verificationStatus` never
  crosses the IMPORTED boundary post-create, so derive-on-sync/read is a no-op for correct rows and
  heals mislabeled ones. KEPT from Codex: nulls-last display order, centralized
  `rank-entry-display-order.ts`, renames, projection tightening, dedupes, doc fixes.
- Belt files re-verified: belt-gate 29/29 · provenance 6/6 · router.integration 49/49 · tsc clean.

## IMPORTED-origin ratification (operator, 2026-07-31 — supersedes the B1 IMPORTED lock)

**Domain correction from the operator:** the WP-era belt data was **self-reported by the members
themselves** (Gravity Form → Pods → the one-time import scripts). IMPORTED ≠ curated-archive
authority; it is the member's OWN record, and the claim flow (ADR 0036, Bob-is-Bob) is the identity
gate. Import is one-time-historical — no path ever mints new IMPORTED rows. Ratified picks:

1. **IMPORTED lock LIFTED** — the verified claimant fully edits (set/overwrite/clear-not-promoter)
   their imported facts, exactly like a self-added backfill. Locked classes that REMAIN:
   instructor-stamped (`awardedById`) fill-blanks-only, and DISPUTED fully locked.
2. **Edits keep the VERIFIED badge** — a member edit never drops trust on their imported record;
   new `promoter-proposal-core` guard: promoter transitions preserve `verificationStatus IMPORTED`
   (no keep_unverified downgrade, no verify flip — badge + anchor + provenance all stable).
3. **Provenance = pure historical metadata** — never rendered publicly (verified: no public payload
   carries it), locks nothing; belt-gate no longer reads it at all. Final disposition rides #380.

**Build:** `isFactEditable` drops the provenance clause (imported rows land in the full-edit class
via `source: STATED`, which is literally true — member-stated); `rankAwardProvenance` + the gate's
rankEntry joins deleted (dead once nothing locks on origin); promoter-core IMPORTED status guard;
policy pins flipped in belt-gate + router.integration tests (incl. new badge-intact pins);
prose-only comment updates in schema.prisma (zero DDL — no migration). Doug's parity baseline is
superseded ON PURPOSE for this one policy axis, on the operator's explicit ratification.

## CI watch-and-fix (PR #397)

Pushed on the operator's word; first CI wave went red on: (1) oxfmt drift in 2 test files (edited
after the last repo-wide format pass), (2) Playwright firefox/webkit — **four e2e seeds created
`RankAward` rows with NO `RankEntry`**, so the #376 entries-first reads rendered no belt (the
rank-redaction positive control + the lifecycle drawer flow). Fix `b2025e26`: new shared
`e2e/helpers/seed-rank-entries.ts` (mirrors `syncRankEntryFromAward`) wired into the lifecycle /
rank-redaction / comp-fixture / paywall seeds (belt-journey + belt-review already seeded entries —
the SESSION_0482 lesson, now applied repo-wide); both specs proven 8/8 on the hermetic local e2e DB
before pushing. **Result: every check on #397 green** incl. both required gates + full Playwright
matrix. Finding-router candidate for bow-out: "seed-creates-award-without-entry" = the same fixture
class that bit the unit-test layer this session — one lesson, three surfaces.

## MERGE GATE — CLEARED (2026-07-31, post-#381 rotation)

Operator rotated the BBL `.env.prod` Neon credential; the read-only live-prod check (DIRECT_URL)
ran clean: **111 RankAward / 111 RankEntry / 0 orphans** · 72 IMPORTED awards · entries 99 VERIFIED
+ 12 UNVERIFIED — identical to map #374's 2026-07-30 verification. No award vanishes under the
entries-first reads. **PR #397 is merge-ready; the merge itself is the operator's action** (never
this session's). #381's remaining scope (prodsnap refresh cadence) stays open.

## Next session

<!-- staged by 0730 at its own bow-out -->
