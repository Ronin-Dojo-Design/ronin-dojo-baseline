---
title: "SESSION 0739 — #380 G-011 RankAward table-drop: ratified migration plan (plan-only)"
slug: session-0739
type: session--plan
status: in-progress
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
next_session:
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

NO schema edit, NO migration file, NO writer-code change, NO push without explicit word. #380
execution (PR1–PR3) is a separate attended lane. WL-P2-83 beltFamily price-gate stays read-only
proof — do not wire. Pre-#380 code polish is out of scope (issue rule 4).

## Cody pre-flight

n/a — no code written (plan-only session; TASK_02 output is a docs file).

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0739_TASK_01 | landed | Explore sweep (7 runtime flows via ONE sync seam `rank-entry-compatibility.ts:37`; 5 no-sync seed/import writers; GamificationEvent FK dead; no read-guard escapes) + prodsnap evidence (stale snapshot caveat: 14 entries vs prod's recorded 111; 22 orphan awards = 7/30–31 import runs). Fork A RESOLVED: keep `source` (real reader `belt-gate.ts:88`). |
| SESSION_0739_TASK_02 | landed | `docs/product/black-belt-legacy/380-rankaward-drop-plan.md` — full ratifiable plan (3-PR sequence, trigger DDL, B0–B2 backfill SQL, V1–V9 + P1–P5, rollback per stage, PR3 point-of-no-return, §7 writer-cutover inventory). Giddy verdict PASS-WITH-FIXES; all 12 findings (1 blocker: relax `RankEntry.rankAwardId` NOT NULL/Cascade at PR2 · 3 majors: delete-orphan awards, post-swap fact-sync gap, V2/V7 PR3-unsatisfiability · 8 minors) applied to the doc. wiki-lint 0 errors. |
| SESSION_0739_TASK_03 | landed | Operator RATIFIED the plan 2026-08-03 (one-word pick); doc flipped `draft → ratified`; PR1-execution baton staged in Next session. Push still HELD. |

**Decisions resolved:** Forks A–D picked at bow-in (Evidence · Trigger · Direct · 3-PR); Fable 5
model-fit confirmed.

## Verification

| Command / smoke | Result |
| --- | --- |
| read-only evidence queries vs `ronindojo_prodsnap` (scratchpad `380-evidence.ts`) | ran clean; snapshot flagged stale (14 entries vs prod's recorded 111) |
| `bun run wiki:lint` | 0 errors / 115 warnings, all pre-existing (0 on the two new files) |
| Giddy architecture review (subagent) | PASS-WITH-FIXES → all 12 findings applied |

## Artifacts

| Artifact | Purpose | Status |
| --- | --- | --- |
| None. | | |

## Open decisions / blockers

- Plan RATIFIED 2026-08-03. Push of this session's branch still HELD for explicit authorization.
- Pre-execution action carried into the plan: refresh `ronindojo_prodsnap` (stale: 14 entries vs
  prod's recorded 111) before shadow-replay rehearsal.
- Latent bug routed out-of-lane: `seed-baseline-owner.ts:260` probes the dropped `userId` column
  (spawn-task chip issued this session).

## Next session

- **Goal:** Execute **#380 PR1** — the additive expand + backfill stage of the ratified plan
  (attended; reversible; no destructive step).
- **First task:** refresh `ronindojo_prodsnap`, shadow-replay the PR1 migration on
  `ronindojo_shadow`, run preflight P1/P3/P4/P5 against live prod (read-only, DB-identity check
  first), then hand-author `expand_rank_entry_facts` exactly per plan §4-PR1. Read-before-build:
  `docs/product/black-belt-legacy/380-rankaward-drop-plan.md` (§1, §4-PR1, §6) ·
  `apps/web/prisma/schema.prisma` RankAward/RankEntry · migration
  `20260709000000_add_rank_entry_compatibility_anchor` · ADR 0058.
- **Kickoff prompt:**

  ```text
  /bow-in — execute #380 PR1 (expand+backfill) per the RATIFIED plan at
  docs/product/black-belt-legacy/380-rankaward-drop-plan.md (SESSION_0739; forks pinned
  Evidence/Trigger/Direct/3-PR — do NOT reopen them). ATTENDED lane. Order: (1) refresh
  ronindojo_prodsnap; (2) shadow-replay the hand-authored PR1 migration (migrate dev stays
  BANNED); (3) foreground preflight P1/P3/P4/P5 vs live prod, read-only, DB-identity first,
  record numbers in the SESSION file; (4) author migration + schema.prisma additive changes +
  PR1 JETTY annotations ONLY (no writer/reader code changes); (5) gates green; (6) HOLD —
  build → verify → show → operator word to push/merge. Post-merge: V1–V6 vs prod, numbers into
  the SESSION file. Rollback rider: inverse SQL in the PR body; rollback = forward-inverse PR.
  Laws: ADR 0035/0058 display law; provenance immutable; never scope by rank.brand.
  ```

## Close evidence

**/ggr composite:** · **Caps applied:**
**Systemic health:** CI = · findings routed · FS patterns:
**Reviewer verdicts:** Giddy · Doug · Desi
**Findings ≥ medium:**
**ADR / ubiquitous-language check:**

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | |
| Wiki lint | |
| Reflections routing receipt | |
| Code-quality gate (Class-A) | |
| Runtime verification (Doug) + artifact URL | |
| Deferral guard (§6.8) | |
| Memory sweep · next-session unblock | |
| Git hygiene · Graphify update | |

## Reflections

- 
