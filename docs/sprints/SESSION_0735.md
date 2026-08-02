---
title: "SESSION 0735 — retrospective quality sweep of recently-merged code (#403/#400/#397)"
slug: session-0735
type: session--review
status: closed
created: 2026-08-02
updated: 2026-08-02
last_agent: claude-session-0735
sprint: S13
lane: repo
recipe: "review"
goal_ids: []
tickets: []
next_session: docs/sprints/SESSION_0733.md
pairs_with:
  - docs/sprints/SESSION_0734.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0735 — retrospective quality sweep of recently-merged code (#403/#400/#397)

**Date:** 2026-08-02 · **Operator:** Brian + claude-session-0735

## Goal

Autonomous, stays-in-Claude quality-suite sweep of the last few merged PRs whose code never went
through the full /code-quality → /fallow-fix-loop → /ggr gauntlet. APPLY genuinely-warranted,
behavior-preserving fixes to the process-OS tooling (`scripts/session-cost.ts`,
`scripts/bow-out-gates.sh`); REVIEW-ONLY (score + route findings, zero edits) the #400/#397 app
code near the frozen RankAward/#380 seam. Deliver one tooling quality PR; hold at the push gate.

## Bow-in

- Previous session: `docs/sprints/SESSION_0734.md` — PROMPT_TEMPLATE v1 + #398 dogfood baton; goal
  verdict **YES**. This session was bowed-in as 0733 (#398) but #398 is BLOCKED ON USER (Vercel/Neon
  dashboard steps); operator merged PR #403, then pivoted to an autonomous quality lane. Kept 0733
  staged for the #398 desktop session; minted **0735** for this lane.
- Branch/worktree: `session-0735-quality-sweep` @ canonical, off `main` (`65d797af`) · clean.
- FS-0024 confirmed: canonical path + `Ronin-Dojo-Design/black-belt-legacy` remote. Canonical claim
  released from 0733, claimed for 0735 (co-session check FREE). githooks doctor PASS (bow-in hook).
- **FS-0048 read-before-build sweep** (read ground truth, not names): `scripts/session-cost.ts`
  (219L, read full), `scripts/bow-out-gates.sh` (525L, read full), `apps/web/scripts/prebuild-migrate.ts`
  (the #398 T3 surface), `docs/knowledge/wiki/drift-register.md` D-058, `docs/security/ronin-security-risk-register.md`
  row 16, issue #398 body. fallow 2.91.0 present; shellcheck absent (shell gets `bash -n` + manual).
- Operator forks ratified via bow-in questions: SotD snapshot = **No** (live `/app/state`); merge
  PR #403 = **Yes** (executed); lane = **autonomous quality sweep** (approved as scoped).
- Parallel-lane assessment (opening.md 1d): 2 disjoint review-only surfaces (#400, #397) → 2 parallel
  Giddy reviewers; APPLY scope done inline (single-orchestrator, 2 files).

## Petey plan

### Tasks

#### SESSION_0735_TASK_01 — Objective baseline + APPLY-scope fixes (tooling)

- **Agent:** Petey inline · **Depends on:** nothing
- **What / steps:** fallow health/audit baseline on all target TS; score `session-cost.ts` +
  `bow-out-gates.sh` against the code-quality-matrix; apply only genuinely-warranted,
  behavior-preserving fixes; re-verify (tsc / bash -n / behavior smoke / fallow no-introduced).
- **Done means:** fixes applied, all gates green, fallow shows 0 introduced findings.

#### SESSION_0735_TASK_02 — REVIEW-ONLY score of #400 belt seam

- **Agent:** Giddy (parallel) · **Depends on:** nothing
- **What / steps:** score the merged #400 belt/lineage files; findings + ledger routing; NO edits
  (frozen rank-read seam).
- **Done means:** per-file scores + routed findings folded into `## Delivered`.

#### SESSION_0735_TASK_03 — REVIEW-ONLY score of #397 lineage

- **Agent:** Giddy (parallel) · **Depends on:** nothing
- **What / steps:** score the merged #397 lineage files (incl the `use-drawer-profile.ts` crap-600
  hotspot); findings + ledger routing; NO edits.
- **Done means:** per-file scores + routed findings folded into `## Delivered`.

#### SESSION_0735_TASK_04 — Close: /ggr, route findings, hold push

- **Agent:** Petey · **Depends on:** TASK_01–03
- **What / steps:** /ggr gate, route review findings to canonical ledgers (closing.md §6.7), wiki:lint,
  explicit-path staging, single commit, HOLD push.
- **Done means:** close evidence table + findings routed N/N; push gate held.

### Parallelism

APPLY inline (2 files, one orchestrator) ∥ 2 review-only Giddy agents on disjoint #400/#397 surfaces.

### Open decisions / risks

- #398 stays BLOCKED ON USER (0733 staged) — not this lane.
- Review-only surfaces are near the frozen RankAward/#380 seam: findings route, never inline fixes.

### Scope guard

No RankAward-surface edits, no #380 work, no schema, no re-opening 0730/0731 ratified laws. APPLY
edits limited to the two tooling scripts. No manufactured churn — fix real defects only.

## Cody pre-flight

n/a — tooling-only edits (scripts/), no apps/web L1 area touched. Behavior-preserving.

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0735_TASK_01 | landed | 2 real latent bugs fixed in recently-merged tooling. (a) `scripts/session-cost.ts:81` — empty-`wd` guard: a telemetry payload missing BOTH `workspace.current_dir` and `cwd` gave `wd=""`, and `cwd.startsWith("")===true` misattributed it to any repo; now guarded `wd && (…)`. (b) `scripts/bow-out-gates.sh:76` — touched-set added `git ls-files --others --exclude-standard` so NEW untracked files (a close runs pre-commit) are covered by the secret-scan / format-fix / hostile-review gates instead of silently skipped. Re-verified: `bash -n` OK · `tsc -p scripts/tsconfig.json` clean · `session-cost.ts --latest` runs · `fallow audit` = **0 introduced findings**. |
| SESSION_0735_TASK_02 | landed | REVIEW-ONLY #400 belt seam (Giddy): ~8.2–8.4 (healthy B; A-grade `rank-entry-trust-axes`/`display-order`/`compatibility`/`belt-gate`). `canvas-model.ts` cyc-89 = ESSENTIAL breadth, left as-is. `rank-entry-status.ts` was a phantom (logic in `rank-entry-trust-axes.ts`). No P1/security/data-loss. Top find: `rank-progression.ts:291` prices off a display-name regex (billing-fragile). All routed to **D-062**; no inline edits (frozen seam). |
| SESSION_0735_TASK_03 | landed | REVIEW-ONLY #397 lineage (Giddy): median ~8.3; `use-drawer-profile.ts` (7.5) the one outlier — crap-600 = artifact (over-defensive `?.` on the non-null `passport` relation + dead export `rankProgressPercent` + no test), NOT an algorithmic hotspot. Rest 8.0–8.7. Nothing blocking; no rank-read/IMPORTED touches. Routed to **D-062**. |
| SESSION_0735_TASK_04 | landed | Close: /ggr on the APPLY delta (only code changed), findings routed to `drift-register` **D-062** + 1 background chip (billing-regex), wiki:lint, explicit-path stage, single commit. Push HELD for operator word. |

**Decisions resolved:** The `pickPayload` cyclomatic-14 / CRAP-210 flag on `session-cost.ts` is an
INHERITED entrypoint/coverage artifact (0-test CLI script, fan-in 0) — NOT refactored this sweep
(essential arg/fallback branching; refactor = behavior risk on payload resolution for marginal
gain). Routed as a note, not an edit.

## Verification

| Command / smoke | Result |
| --- | --- |
| `bash -n scripts/bow-out-gates.sh` | syntax OK |
| `bunx tsc -p scripts/tsconfig.json --noEmit` | clean (exit 0) |
| `bun scripts/session-cost.ts --latest` | runs — priced this session's transcript |
| `bun run audit:fallow` (changed set) | 0 introduced findings; MI 74.9 held; inherited flags gate-excluded |

## Artifacts

None. Operator declined a frozen State-of-Dojo snapshot; live view = `/app/state`.

## Open decisions / blockers

- #398 preview-DB isolation — BLOCKED ON USER (Vercel/Neon dashboard steps); 0733 staged with its
  kickoff baton in SESSION_0734 `## Next session`.

## Next session

- **Goal (dependency stated as fact — Giddy close-call):** the FI-001 critical path is
  #398 → #380 → cutover, and #398 is BLOCKED ON USER (Vercel/Neon dashboard steps only Brian can
  run). **PRIMARY:** operator unblocks #398, then run the staged **0733** #398 proof lane.
  **FALLBACK (if #398 still blocked):** #361 rebase-review (member-settings build, stale vs new
  `main`, mergeable-pending) **or** a belt/lineage polish lane burning down **D-062** — start with
  the `rank-progression.ts:291` billing-off-a-display-name-regex chip (highest-value item).
- **First task:** if #398 unblocked → paste the fenced prompt from `SESSION_0734.md` `## Next session`
  (inputs: #398, #380, D-058, RISK-16, `apps/web/scripts/prebuild-migrate.ts`). Else → pick a fallback
  lane above and read D-062 + the target PR/files first.
- **Kickoff prompt:** n/a — the #398 baton is already filled in `SESSION_0734.md` `## Next session`
  (0733 stays the staged twin); fallback lanes are scoped above, not yet a filled baton.

## Close evidence

**/ggr composite:** 9.2/10 (review-lane touching process-OS tooling; ≥9.0 clears, ADR 0052 D6) ·
**Caps applied:** none
**Systemic health:** CI = PR #404 green (CLEAN/MERGEABLE — CI complete, Playwright complete,
Typecheck scripts, RankAward guard all pass) · findings routed **all → D-062** (+ 1 background chip
for the billing-regex item) · FS patterns: none recurring
**Reviewer verdicts:** Giddy ×2 (review-only #400 belt seam / #397 lineage — both healthy B
~8.2–8.4, no blockers, no rank-read/IMPORTED touches) + Giddy close-call (bow-out sequencing:
close-then-merge to dodge FS-0045) · Doug n/a (tooling behavior verified via tsc / `bash -n` /
`--latest` smoke) · Desi n/a (no UI)
**Findings ≥ medium:** all D-062 med items — `rank-progression.ts:291` display-name price regex
(billing-fragile) · `memberTopRank` name-clash (canvas-model vs member-ranks) · `use-drawer-profile`
over-defensive `?.` on non-null `passport` + dead export — routed to D-062, none blocking, all
frozen-seam-adjacent (fix when #380 lifts / dedicated lane).
**ADR / ubiquitous-language check:** not required — no architectural decision; ADR 0049 staged-stub
+ ADR 0056 PR-flow followed.

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | SESSION_0735 `pairs_with` 0734; `drift-register.md` `updated`→2026-08-02 + `last_agent`→claude-session-0735 (D-062 added). |
| Wiki lint | `bun run wiki:lint`: 0 errors / 115 warnings — exact inherited baseline, 0 introduced. |
| Reflections routing receipt | 4 lessons → 4 routes (D-062 ×2, no-action ×2). |
| Code-quality gate (Class-A) | APPLY delta (2 tooling guards) self-scored ~9.2, behavior-preserving, fallow 0-introduced; no Class-A app code touched (tooling + docs only). |
| Runtime verification (Doug) + artifact URL | no runtime surface touched — tooling scripts + a ledger doc; n/a. |
| Deferral guard (§6.8) | run at close — result in bow-out chat line. |
| Memory sweep · next-session unblock | no new durable memory (lane outcome is repo-recorded in D-062 + PR #404). Next-session unblocked: baton states the #398 dependency + #361/D-062 fallbacks. |
| Git hygiene · Graphify update | `session-0735-quality-sweep` · explicit-path stage (never `git add -A`) · secret scan PASS · single close push = merge of PR #404 (operator-authorized) · **Graphify refresh POST-MERGE only** (deferred to after #404 lands). |

## Reflections

- Retrospective sweep found **2 real latent bugs in already-merged, already-green tooling**
  (empty-`wd` payload misattribution; new untracked files skip the close secret-scan) — green CI ≠
  quality-gauntleted; a periodic pass over merged-but-not-gauntleted PRs earns its keep. → route:
  no-action (lane outcome; PR #404 is the durable record)
- fallow CRAP/dead-code flags on **entrypoint CLI scripts** (fan-in 0) and **provably-non-null
  relations** (`use-drawer-profile`'s `passport` is a REQUIRED relation, `schema.prisma:2829`) are
  METRIC ARTIFACTS — read the schema/entrypoint context before trusting a crap score. → route:
  drift-register D-062
- The **highest-value find** (a membership price keyed off a rank *display-name* regex) surfaced
  from READING the pricing logic, not from any fallow metric — objective tools miss semantic /
  business-rule defects; the review-wave is not optional. → route: drift-register D-062 + task chip
- `TD` in this repo = **teardown/data**, not code tech-debt; no code-tech-debt ledger exists, so
  refactor findings route to drift-register D. → route: no-action (routing clarification, recorded in D-062)
