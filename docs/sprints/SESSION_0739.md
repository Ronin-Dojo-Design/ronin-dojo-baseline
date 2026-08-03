---
title: "SESSION 0739 — #380 G-011 RankAward table-drop: ratified migration plan (plan-only)"
slug: session-0739
type: session--plan
status: closed
created: 2026-08-03
updated: 2026-08-03
last_agent: claude-fable-session-0739
sprint: S13
lane: bbl
lane_seq:
recipe:
vault_session:
goal_ids: [G-011]
tickets: ["380"]
next_session: docs/sprints/SESSION_0740.md
pairs_with:

  - docs/sprints/SESSION_0738.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0739 — #380 G-011 RankAward table-drop: ratified migration plan (plan-only)

**Date:** 2026-08-03 · **Operator:** Brian + claude-fable-session-0739

## Goal

Produce the ratified, reversible #380 migration plan (exact SQL, stage order, guards, rollback per
stage, operator proof points) that retires the physical `RankAward` table onto `RankEntry` — the
"Done means" of issue #380. Plan-only: execution is a separate attended lane. Continues
SESSION_0738's Next-session block; #398 closed today removed the last blocker on the FI-001
critical path (#398 → #380 → cutover).

## Status

Frontmatter `status:` is the single source of truth (`in-progress` → `closed`, SESSION_0342). Do not restate it here.

## Bow-in

- Previous session: `docs/sprints/SESSION_0738.md` — EXTENDED close (both lanes landed; #398
  executed LIVE + closed); this session takes its staged Next-session lane (#380).
- Branch/worktree: `session-0739-g011-drop-plan` @ canonical · status: clean · HEAD: `d5f9f33c`
- Parallel-lane assessment (opening.md 1d): ran — single coherent lane (one deliverable doc);
  PR backlog (#361, #410 clean/draft) noted, operator pinned #380.
- On-demand blocks pulled: Grill outcome (below). FS-0048 read-before-build sweep: #380 issue
  body (full) · `apps/web/prisma/schema.prisma` RankAward `:2231` / RankEntry `:2305` + the four
  rank enums `:2184` · `scripts/rank-award-read-guard.ts` header · ADR 0058 (restates legacy 0035
  display law) · SESSION_0738 Next-session + Goal-verdict blocks · opening.md (full ritual).
- MOVE 0 pre-checks: (A) #398 CLOSED 2026-08-03 15:52 UTC, preview-isolation LANDED (`d5f9f33c`)
  → #380 unblocked. (B) Model-fit: Fable 5 confirmed by operator (Fable 5 is the Mythos-class
  tier above Opus 4.8; plan-only lane besides).

### Graphify check (backlink sweep, operator-requested)

`graphify query "rank-entry-compatibility syncRankEntryFromAward …"` + docs-scoped rg on the
touched filenames → 5 live docs needed updates (applied): `rankentry-unification-epic.md` (stale
10-call-site count + closed §G script warning), `wiring-ledger.md` WL-P2-42 (runtime-only scope
addendum), `BBL_PODS_FULL_IMPORT_SPEC.md` (importers now sync entries),
`lineage-rank-promotion-sync-rules.md` (stale-banner: dropped `RankAward.userId`, RankEntry era,
plan pointer), `lineage-hub.md` (new Rank-truth row → ADR 0058 + the ratified plan).
`sop-test-writing.md` checked at operator ask — NO update needed (its RankAward refs are fixture
history, untouched by this session). Archives/closed sessions left alone by policy.

### Grill outcome (crux forks — operator one-word picks, 2026-08-03)

- **Fork A `source` column:** **Evidence** — TASK_01 counts real code readers + prodsnap data
  combos; keep only if a reader/data combo proves need. (Note: source is not fully derivable from
  provenance — post-import self-report = source STATED + provenance EARNED.)
- **Fork B provenance immutability:** **Trigger** — `BEFORE UPDATE` trigger raising on provenance
  change (DB-level, per issue requirement; REVOKE is toothless when the app role owns the table).
- **Fork C dual-write:** **Direct** — no dual-write window; additive expand → backfill → parity
  assertions → attended writer cutover → guard → drop LAST.
- **Fork D staging:** **3-PR** — PR1 additive expand+backfill · PR2 writer cutover+guards ·
  PR3 destructive contract (drop). Drop always last, separately attended.

## Petey plan

### Tasks

#### SESSION_0739_TASK_01 — Writer/reader/satellite inventory + Fork-A evidence pack

- **Agent:** Explore (read-only fan-out) + Petey (DB evidence queries) · **Depends on:** nothing
- **What / steps:** exhaustive `file:line` inventory of (1) every RankAward WRITER (create/update/
  delete/upsert: claims, place-lead/add-person, belt router, promoter proposal/verify, scripts/
  imports/seeds, any remaining minter); (2) every promotion-fact READ still on RankAward (allowed
  fact joins per read-guard); (3) all four satellite FK families (RankMilestone `rankAwardId`
  @unique · LineageRelationship `rankAwardId` @unique/SetNull · MediaAttachment · GamificationEvent);
  (4) `RankAwardSource`/`source` + `verificationStatus` reader sites; (5) prodsnap read-only counts:
  distinct `source × verificationStatus × provenance` combos, row counts, orphan checks,
  `(passportId, rankId)` cardinality proof.
- **Done means:** inventory tables written into the TASK_02 plan doc's appendix; Fork A resolved
  from evidence (keep/drop `source`) and recorded.

#### SESSION_0739_TASK_02 — Author the ratified #380 migration plan doc

- **Agent:** Petey (draft) → Giddy (architecture/git review pass) · **Depends on:** TASK_01
- **What / steps:** write `docs/product/black-belt-legacy/380-rankaward-drop-plan.md` covering the
  issue's Required-plan-output list under the pinned forks (Evidence/Trigger/Direct/3-PR): final
  RankEntry columns + names; provenance-immutability trigger DDL; additive backfill + validation
  SQL (facts, 4 satellite FK re-anchors, 0-orphan/cardinality invariants); writer cutover
  inventory (from TASK_01); LineageRelationship `rankAwardId → rankEntryId` repeated-promotion/
  SetNull semantics; 3-PR migration sequence with per-stage rollback + point-of-no-return; enum/FK/
  index/unique cleanup; foreground prod preflight + post-deploy parity proof; JETTY annotations
  plan for RankEntry/RankAward. Hand-authored SQL in the doc only — no migration file, no schema
  edit this session.
- **Done means:** plan doc exists, passes Giddy review, honors ADR 0035/0058 display law +
  provenance immutability + IMPORTED ratification; wiki-lint clean.

#### SESSION_0739_TASK_04 — Fix sweep: close the no-sync writer gap (operator-added post-ratification)

- **Agent:** Petey/Cody inline · **Depends on:** TASK_02 (inventory §7b named the gap)
- **What / steps:** wire `syncRankEntryFromAward` into the no-sync RankAward writers
  (`prisma/seed.ts` ×2, `prisma/seed-baseline-lineage.ts` ×4 incl. the rankId-remap heals,
  `scripts/import-bbl-members-full.ts`, `scripts/enrich-bbl-members-pods.ts` ×2); widen the seam's
  client type structurally so plain-`PrismaClient` scripts can call it (the old `Pick<typeof db>`
  was WHY they inlined/skipped). SKIP `seed-baseline-owner.ts` — owned by the parallel chip
  session (branch `claude/interesting-haibt-c75613`); its sync wiring follows after that merge.
- **Done means:** tsc 0 errors · lint clean · `bun run test --parallel=1` green · commit shown,
  push HELD for the word.
- **Consolidation rider (operator, mid-session):** the parallel branch
  `claude/interesting-haibt-c75613` turned out to carry a DIFFERENT fix (Tool.tierPriority
  seed repair + FS-0058 row) — cherry-picked here (`-x`) so everything lands as ONE PR; the
  `seed-baseline-owner.ts` chip therefore came back to this lane (probe repointed
  `userId → passportId` + sync wired; chip dismissed). Push + PR-open granted by the operator;
  merge stays the operator's.

#### SESSION_0739_TASK_03 — Operator ratification + execution baton

- **Agent:** Petey · **Depends on:** TASK_02
- **What / steps:** short mobile readout of the plan's crux points; capture Brian's ratification
  (or fork re-picks) on the plan doc; stage the Next-session execution baton (PR1 expand lane,
  attended) in this file's Next-session block.
- **Done means:** plan doc marked ratified (or blockers recorded); baton staged; push HELD for
  explicit operator word.

### Parallelism

TASK_01 sub-searches fan out inside one Explore dispatch (read-only, disjoint queries); TASK_02/03
are sequential on it. Single lane, canonical checkout — no worktree fan-out.

### Open decisions / risks

- Fork A lands only after TASK_01 evidence (operator picked Evidence).
- Risk: `verificationStatus` fold mapping for rows where award status disagrees with the already-
  backfilled `RankEntry.status` — plan doc must specify the conflict rule + alert path (never
  silently orphan/overwrite).
- Risk: GAP_MATRIX stale by record; not an input here. Dirstarter Prisma-layer alignment table
  required in the plan doc (L1 Prisma touched at execution time).

### Scope guard

NO schema edit, NO migration file, NO writer-code change (*amended by the operator's TASK_04
rider: the seed/script no-sync fix was pulled in-lane; app-runtime writer flows remain
untouched*), NO push without explicit word. #380
execution (PR1–PR3) is a separate attended lane. WL-P2-83 beltFamily price-gate stays read-only
proof — do not wire. Pre-#380 code polish is out of scope (issue rule 4).

## Cody pre-flight

TASK_01–03: n/a — no code written (plan outputs are docs files). TASK_04 (operator-added
mid-session): inline Cody; pre-flight compressed into the TASK_02 inventory it executed against —
reuse check = the existing `syncRankEntryFromAward` seam (no new primitive; structural-type
precedent `SyncTx`/`VerifyRankEntryTx`); arch-gate = plan §7b named these exact writers; gates
run twice (tsc/lint/full suite per commit).

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0739_TASK_01 | landed | Explore sweep (7 runtime flows via ONE sync seam `rank-entry-compatibility.ts:37`; 5 no-sync seed/import writers; GamificationEvent FK dead; no read-guard escapes) + prodsnap evidence (stale snapshot caveat: 14 entries vs prod's recorded 111; 22 orphan awards = 7/30–31 import runs). Fork A RESOLVED: keep `source` (real reader `belt-gate.ts:88`). |
| SESSION_0739_TASK_02 | landed | `docs/product/black-belt-legacy/380-rankaward-drop-plan.md` — full ratifiable plan (3-PR sequence, trigger DDL, B0–B2 backfill SQL, V1–V9 + P1–P5, rollback per stage, PR3 point-of-no-return, §7 writer-cutover inventory). Giddy verdict PASS-WITH-FIXES; all 12 findings (1 blocker: relax `RankEntry.rankAwardId` NOT NULL/Cascade at PR2 · 3 majors: delete-orphan awards, post-swap fact-sync gap, V2/V7 PR3-unsatisfiability · 8 minors) applied to the doc. wiki-lint 0 errors. |
| SESSION_0739_TASK_03 | landed | Operator RATIFIED the plan 2026-08-03 (one-word pick); doc flipped `draft → ratified`; PROMPT_TEMPLATE baton + SESSION_0740 stub staged. |
| SESSION_0739_TASK_04 | landed | No-sync writer sweep: seam type widened structurally (`rank-entry-compatibility.ts`), 11 sync sites wired across seed.ts / seed-baseline-lineage.ts / seed-baseline-owner.ts / both BBL import scripts; owner probe repointed `userId → passportId` (runtime thrower); chip commit `62f90c12` cherry-picked (Tool.tierPriority + FS-0058). Commits `0732f622`, `ee7184bf`, `d9fe6a45`; PR #411 opened on operator grant. |

**Decisions resolved:** Forks A–D picked at bow-in (Evidence · Trigger · Direct · 3-PR); Fable 5
model-fit confirmed; plan ratified; PR #411 merged on the operator's go-on-green
(squash `cb452182`); /rr next-session-automation commissioned + delivered (not acted on).

## Goal verdict

**EXTENDED.** The plan-only goal landed (ratified #380 plan, all issue requirements) AND the
session overshot on operator word: no-sync writer fix sweep + seam type fix, chip-branch
consolidation, /ggr 9.15 clear, PR #411 MERGED to main, cross-doc backlink sweep (5 docs),
PROMPT_TEMPLATE baton + SESSION_0740 stub staged, and the /rr next-session-automation report
delivered for the parallel planning session.

## Verification

| Command / smoke | Result |
| --- | --- |
| read-only evidence queries vs `ronindojo_prodsnap` (scratchpad `380-evidence.ts`) | ran clean; snapshot flagged stale (14 entries vs prod's recorded 111) |
| `bun run wiki:lint` | 0 errors / 115 warnings, all pre-existing (0 on session files) |
| Giddy architecture review (subagent) | PASS-WITH-FIXES → all 12 findings applied |
| `bunx tsc --noEmit` ×3 (per code commit) | 0 errors each |
| `bun run test --parallel=1` ×3 (per code commit) | 1972 pass / 0 fail each run |
| Scratch-DB seed proof (`ronindojo_scratch_0739`, dropped after) | seed.ts + seed-baseline-lineage: **25 awards / 25 entries / 0 orphans**; provenance/status derivation correct; owner seed blocked by design (needs Brian's live Better-Auth user) |
| `bunx fallow audit --changed-since origin/main` + `health` | neutral delta — flagged complexity all inherited in one-shot scripts; maintainability 89.8 (good) |
| PR #411 CI | ALL GREEN at merge: `CI complete` + `Playwright complete` (chromium 26m18s) + read-guard/tsc/scripts-tsc/oxc/unit |
| Merge | **MERGED** squash `cb452182` 2026-08-03 19:29 UTC on operator go-on-green; remote+local branches deleted; prod auto-deploy fired (seed/script paths, runtime unchanged) |
| bow-out-gates.sh | all deterministic gates PASS (task-log 3 rows · wiki:lint 0 err · secret scan clean · graphify 15358 nodes/33651 edges); "missing baton" flag = the staged 0740 stub's own empty Next-section (legitimate); G-011 cross-off DECLINED (plan landed, drop pending) |

## Artifacts

| Artifact | Purpose | Status |
| --- | --- | --- |
| None. | | |

## /rr record — next-session-start automation (operator-commissioned, TASK_05-equivalent)

- **Queries:** `graphify query "auto session headless driver bow-in automation scheduled
  overnight orchestrator"` + `"recipe cards staged stub PROMPT_TEMPLATE baton kickoff prompt
  hydrate lane"` → surfaced `scripts/auto-session.sh` (0582 run-rung), recipes set, hooks.
- **Report:** `docs/architecture/research/research-review-next-session-automation.md`
  (Petey pipeline/options + Giddy architecture/overlap, both verified-by-read).
- **Recommendation (one, phased):** Phase 0 baton self-containment (`autonomy:`/`model:` facets
  + prompt-in-stub) + `bow-in-gates.sh` hook hydration → Phase 1 refit `auto-session.sh`
  (operator-fired) → Phase 2 calibrate → Phase 3 queue-gated scheduled fire (behind G-014/G-015).
  Rejected-first alternatives: dynamic Workflow engine (second bow-in SoT), cron-first
  (stale-spec), /loop (cold-process doctrine).
- **Route:** Proposed ledger edit at bow-out — G-023-child goal row for Phases 0–1, sequenced
  against the G-031 S5 collision (one owner). NOT acted on this session per operator word;
  intake for the parallel /ppp + wayfinder planning session (3 collision tickets named in §Overlap).

## Open decisions / blockers

- Plan RATIFIED 2026-08-03; PR #411 pushed + MERGED on the operator's explicit go-on-green.
  Close branch push+merge granted at bow-out (operator Q3).
- Pre-execution action carried into the plan: refresh `ronindojo_prodsnap` (stale: 14 entries vs
  prod's recorded 111) before shadow-replay rehearsal.
- ~~Latent bug routed out-of-lane~~ — superseded: the `seed-baseline-owner.ts` probe fix came
  back in-lane (TASK_04 consolidation rider) and landed in `d9fe6a45`.

## Next session

- **Goal:** Execute **#380 PR1** — the additive expand + backfill stage of the ratified plan
  (attended; reversible; no destructive step).
- **First task:** refresh `ronindojo_prodsnap`, shadow-replay the PR1 migration on
  `ronindojo_shadow`, run preflight P1/P3/P4/P5 against live prod (read-only, DB-identity check
  first), then hand-author `expand_rank_entry_facts` exactly per plan §4-PR1. Read-before-build:
  `docs/product/black-belt-legacy/380-rankaward-drop-plan.md` (§1, §4-PR1, §6) ·
  `apps/web/prisma/schema.prisma` RankAward/RankEntry · migration
  `20260709000000_add_rank_entry_compatibility_anchor` · ADR 0058.
- **Kickoff prompt** (filled from `_template/PROMPT_TEMPLATE.md`, SESSION_0734 convention):

  ```text
  /bow-in — SESSION_0740 = #380 PR1 — RankAward-drop expand+backfill (attended execution lane).
  Act as PETEY orchestrator (Fable 5 — sub-work stays on Fable 5 unless a handoff to Codex says
  otherwise). Repo: black-belt-legacy (ONE repo, ADR 0059).

  FS-0024 GUARD FIRST, before ANY mutating git: pwd + `git remote -v` must be the black-belt-legacy
  canonical (/Users/brianscott/dev/black-belt-legacy, remote Ronin-Dojo-Design/black-belt-legacy)
  — never the read-only dirstarter_template, never a sibling brand repo. On mismatch STOP and paste
  pwd + git remote -v verbatim — do NOT mutate the wrong tree. ADOPT-STUB: SESSION_0740 is
  pre-staged (status: staged) — adopt it (flip to in-progress, no cp, ADR 0049). Worktree-isolation
  law: don't edit in canonical if a co-session is live (canonical-claim.sh check decides).

  RECIPE: seq-lane-build — the plan doc IS the spec:
  docs/product/black-belt-legacy/380-rankaward-drop-plan.md §4-PR1 (+§6 validations, §0 caveats).

  WHY THIS SESSION: #380 (G-011, FI-001 critical path). SESSION_0739 ratified the 3-PR drop plan
  and PR #411 landed it with the no-sync writer sweep. This session executes STAGE 1 only —
  additive expand + idempotent backfill (reversible; no destructive step, no writer cutover).
  Done = PR1 merged, V1–V6 green against live prod, numbers recorded in the SESSION file.

  BRANCH: session-0740-380-pr1-expand off current main (explicit git pull --ff-only origin main
  first). Commit-only in-lane — YOU push foreground on the operator's word. NEVER git add -A
  (FS-0035 — stage explicit paths only).

  SCOPE = n/a — greenfield migration lane: ONE hand-authored migration
  (expand_rank_entry_facts per plan A1–A5/B0–B2) + the matching schema.prisma additive block +
  PR1 JETTY annotations. Nothing else.

  TIERED WORK:
  - T1 DEEP — the new migration SQL + schema.prisma RankEntry/satellite additive block.
  - T3 VERIFY-NOT-REWRITE — preflight/validation query scripts (scratchpad only, read-only vs prod).
  - FROZEN REVIEW-ONLY — ALL app writer/reader code (cutover is PR2), all other docs; findings
    route to the plan doc's PR2 section or ledger rows. Zero edits.

  HARD CONSTRAINTS: behavior parity (additive-only; writers untouched) · ADR 0035/0058 display law
  (awardedAt DESC NULLS LAST; never scope by rank.brand) · provenance immutable · migrate dev
  BANNED on the shared DB — hand-authored + shadow-replayed only · prisma CLI prefers .env's
  DIRECT_URL over a shell DATABASE_URL: override BOTH when targeting scratch/shadow (SESSION_0739
  near-miss) · tests never weakened · no secrets/PII into git.

  INHERITED LAWS (do NOT re-open or regress): forks pinned Evidence-keep-source / Trigger /
  Direct / 3-PR (operator, 2026-08-03) · IMPORTED-lock stays LIFTED · B0's re_ id prefix is
  load-bearing vs the prod rank-entry- prefix (rollback safety) · GamificationEvent gets NO
  replacement column (dead FK, P5-guarded) · B0 fail-closed residual rule (V1b=0 or abort).

  RUN ORDER (grade-drives-fix-drives-re-gate):
  1. Refresh ronindojo_prodsnap + shadow-replay the PR1 migration — grader: Doug — done-means:
     replay clean on refreshed snapshot AND ronindojo_shadow; row counts recorded.
  2. Foreground prod preflight P1/P3/P4/P5 (read-only, SELECT current_database() first) —
     grader: operator readout — done-means: numbers in the SESSION file; P4/P5 = 0 or
     operator-ratified loss.
  3. Author migration + schema additive block + JETTY — grader: Giddy (SQL diffed line-by-line
     against plan §4-PR1) — done-means: migration matches the ratified plan exactly; inverse SQL
     in the PR body.
  4. Gates green → PR → HOLD for the word; post-merge V1–V6 vs prod — grader: Doug — done-means:
     all six at expected values, recorded in ## Verification.
  Final: Giddy /ggr — clear line 9.0+; composite + caps recorded in the SESSION file; anything
  unreached routes to a ledger row, never silently dropped.

  BOW-OUT (closing.md, full close): findings routed N/N with ids (§6.7 router) · Graphify refresh
  POST-MERGE ONLY · re-run bun run wiki:lint after writing close content · stage SESSION_0741
  stub + fill PROMPT_TEMPLATE for it · HOLD the close push for Brian's explicit word — /bow-out
  is NOT push authorization.

  STANDING RULES: you NEVER merge without the operator's explicit word · main is PR-only,
  server-enforced — never push to main from a worktree · hand-authored migrations only · Brian
  may be on mobile — SHORT readouts, one line per step, forks framed for a one-word pick · on any
  limit/config/sandbox error STOP and paste the EXACT error text verbatim; if unknown, say
  "I don't know."

  FIRST LINE BACK: (1) PR #411 merged-to-main confirmed (this lane depends on it), (2) FS-0024
  guard result, (3) prodsnap refresh + shadow-replay verdict.
  ```

## Close evidence

**/ggr composite:** **9.15/10** — Unit 1 seam 9.14 · Unit 2 wiring 8.98 → 9.16 after the
scratch-DB proof lifted D1 (Giddy's stated lift) · Plan lane PASS (all 4 rubric criteria) ·
**Caps applied:** none binding — 9.4 no-credible-verification cleared by the scratch run;
Dirstarter-bypass + undocumented-pattern + regression explicitly ruled out with evidence.
**Systemic health:** CI = green on `CI complete` (run 30841802727; job 91781870311); `Playwright
complete` pending at score time — re-polled before merge word · findings routed 9/9 (Giddy 4×P3
hygiene + Doug 1×P2 + 4×P3, ALL fixed in-session same PR) · FS patterns: none recurred
(FS-0058 new + closed on the cherry-picked branch).
**Reviewer verdicts:** Giddy pass (9.06 → 9.15 with lifts) · Doug pass (9.2/10, no hard cap;
independent gates: tsc 0, suite 1972/0, all 11 sync sites scope+dry-run verified, owner probe
proven a runtime crash trap pre-fix) · Desi n/a — no UI touched.
**Findings ≥ medium:** Doug P2 (plan-doc §0/§7b present-tense staleness vs same-PR TASK_04) —
fixed in-session; nothing residual ≥ medium.
**ADR / ubiquitous-language check:** ADR 0058 confirmed valid + preserved (display law,
provenance immutability, IMPORTED ratification); no new ADR needed — #380 plan doc is the
ratified decision record.

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | seam `@changed`/`@wired` updated; 4 touched docs' `updated:` bumped; plan-doc frontmatter `ratified`; sync-rules stale-banner + `updated:` |
| Wiki lint | `bun run wiki:lint` — 0 errors / 115 warnings (all pre-existing), re-run after every close-content write |
| Reflections routing receipt | 5 lessons → 5 routes (FS-0059 · D-063 · plan-doc §0 · memory ×2 · /rr report §Open) — see Reflections |
| Code-quality gate (Class-A) | /ggr 9.15 recorded above (seam = the Class-A unit, 9.14; no caps binding) |
| Runtime verification (Doug) + artifact URL | Doug independent pass 9.2 (gates re-run, 1972/0 ×2 of 3 runs his+ours) + scratch-DB seed proof 25/25/0; no UI surface touched → no visual artifact |
| Deferral guard (§6.8) | clean — no unrouted deferrals; G-011 cross-off explicitly declined with reason; /rr recommendation routed as Proposed ledger edit (below) |
| Memory sweep · next-session unblock | `dev-environment-gotchas` +FS-0059 trap · `rank-belt-truth` #380-plan-ratified rewrite (post-send drift corrected) · SESSION_0740 stub + baton staged |
| Git hygiene · Graphify update | single close branch `session-0739-close` (2 doc files + ledger rows); PR #411 merged `cb452182`; graphify refreshed post-merge (15358/33651/1796) |

**Proposed ledger edit (single-writer discipline):** goals-ledger — mint a G-023-child row for
next-session-automation Phases 0–1 (per the /rr report), sequenced against the G-031 S5
collision; ownership decided in the operator's parallel /ppp + wayfinder planning session.

## Reflections

- A schema-drop plan hinges on constraints the schema already enforces — Giddy's blocker (the
  NOT NULL + Cascade anchor breaking post-cutover inserts) was visible in `schema.prisma:2313`
  all along; grill the *residual* schema, not just the new design. → route: plan doc §4-PR2 (1i)
- Prevention text buried in another FS row's prose isn't prevention — I hit the DIRECT_URL trap
  hours after FS-0058 documented it in a parallel lane. → route: FS-0059 (+ memory
  dev-environment-gotchas, the agent read path)
- A "stale snapshot" can invert an investigation: the 22 orphan awards were real data pointing at
  a real writer-class gap, but the alarming "live display bug" read was a snapshot artifact —
  date-stamp the evidence base before concluding. → route: plan doc §0 stale-prodsnap caveat
- Seam types are wiring policy: `Pick<typeof db>` silently excluded every plain-client script and
  bred inline copies; a structural parameter type IS the fix, not more copies. → route: memory
  rank-belt-truth (#380 block) + wiring-ledger WL-P2-42 addendum
- /rr with two lens-split researchers (pipeline vs architecture/overlap) converged on the same
  small-first recommendation independently — the split is worth keeping for automation-shaped
  questions. → route: /rr report §Open questions (intake for the parallel planning session)
