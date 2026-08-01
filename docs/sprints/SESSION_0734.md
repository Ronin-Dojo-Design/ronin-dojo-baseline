---
title: "SESSION 0734 — Reusable PROMPT_TEMPLATE + dogfood-fill for 0733 (#398)"
slug: session-0734
type: session--plan
status: in-progress
created: 2026-08-01
updated: 2026-08-01
last_agent: claude-session-0734
sprint: S13
lane: bbl
recipe: "pp"
goal_ids: ["G-011"]
tickets: ["#374", "#398"]
next_session:
pairs_with:
  - docs/sprints/SESSION_0732.md
  - docs/sprints/_template/PROMPT_TEMPLATE.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0734 — Reusable PROMPT_TEMPLATE + dogfood-fill for 0733 (#398)

**Date:** 2026-08-01 · **Operator:** Brian + claude-session-0734

## Goal

Generalize the operator-validated session-kickoff prompt format (the 0731 all-hands-polish stub,
/pp-generated at the 0730 close) into a reusable `PROMPT_TEMPLATE.md` in the house templates
location, then dogfood it by filling the SESSION_0733 (#398 preview-DB isolation) kickoff prompt
the operator will paste at a desktop session.

## Bow-in

- Previous session: `docs/sprints/SESSION_0732.md` — #377 CI rank-read guard built + verified
  (Doug 9.8 / Giddy GO 9.8), sitting as PR #401 all-green; this session writes the reusable
  kickoff-prompt template that format proved out.
- **Previous goal: YES** — 0732 hit #377 at 9.8; operator confirmed at its close.
- Number skew resolved at bow-in: the operator's dispatch prompt said "SESSION_0732" but 0731/0732
  are closed and 0733 is staged (inside PR #401, not yet on `main`). This session minted **0734**
  (`ledger-id-next` next-free); 0733 stays staged for the #398 desktop lane.
- FS-0024 confirmed: canonical path + `Ronin-Dojo-Design/black-belt-legacy` remote. Canonical
  claim free → claimed for 0734; githooks doctor PASS (bow-in gate hook).
- Branch/worktree: `session-0734-prompt-template` @ canonical, off `main` (`5d9771ae`) · clean.
  PR #401's branch left untouched; its files (SESSION_0732/0733 records) not edited here — they
  land when the operator merges #401 (operator elected: merge now, self-serve).
- Wayfinder readout (map #374, confirmed latest rank map): #375 ✅ · #376/#397 ✅ · #377 built +
  verified, PR #401 all-green awaiting merge · left: #398 (operator-manual Vercel/Neon, blocks
  #380) → #380 one-table drop · frontier #378/#379/#381/#391.
- Backlog scan: board leaders FI-001 then G-002; open PRs #401 (this map's merge) + #361 (clean
  P2). Operator-elected lane overrides: template lane.
- Parallel-lane assessment (opening.md 1d): none — single docs/governance lane.
- Operator forks ratified via bow-in questions: lane = **Template lane (mint 0734)** · PR #401 =
  **operator merges now** · State-of-Dojo snapshot = **No** (live `/app/state`).
- On-demand blocks pulled: none (docs-only; no Dirstarter L1 area touched).

## Petey plan

### Tasks

#### SESSION_0734_TASK_01 — Author PROMPT_TEMPLATE.md in the house templates location

- **Agent:** Petey (docs/governance, no production code) · **Depends on:** nothing
- **What / steps:** Generalize the 0731-stub skeleton (header/adopt-stub/FS-0024 · RECIPE ·
  WHY-THIS-SESSION · BRANCH · CODEX ENV · SCOPE-by-commit-set · TIERED work · HARD CONSTRAINTS ·
  RUN ORDER with lens graders + done-means · BOW-OUT · STANDING RULES) into fill-in-the-blanks
  `{CURLY_CAPS}` placeholders; cross-check house style against petey-plan.md, review-wave.md,
  quality-suite.md; save as `docs/sprints/_template/PROMPT_TEMPLATE.md` (sibling of
  SESSION_TEMPLATE.md — record-template + kickoff-template pair; no `_templates`/`90_TEMPLATES`
  dir exists in this repo).
- **Done means:** template file exists with placeholder legend + scissors-delimited paste body;
  wiki:lint clean.

#### SESSION_0734_TASK_02 — Dogfood: fill the template for SESSION_0733 (#398)

- **Agent:** Petey · **Depends on:** TASK_01
- **What / steps:** Fill every placeholder for the staged 0733 lane (#398 preview-DB isolation
  proof) from the 0733 stub + #398/D-058/RISK-16 + prisma-db-migrations law; embed the filled
  prompt below (single-state-file doctrine — no standalone prompt file committed).
- **Done means:** paste-ready 0733 kickoff prompt in this record's `## Dogfood` section; operator
  can paste it verbatim at a desktop session.

#### SESSION_0734_TASK_03 — Close: wiki:lint, commit, hold push

- **Agent:** Petey · **Depends on:** TASK_02
- **What / steps:** wiki:lint re-run, explicit-path staging (never `git add -A`), single commit,
  bow-out per closing.md, HOLD the close push for the operator's word.
- **Done means:** clean close evidence table; push gate held.

### Parallelism

Sequential — one docs lane, three dependent tasks.

### Open decisions / risks

- #398 execution (the dogfood's *run*) is deliberately NOT this session: it needs operator-manual
  Vercel/Neon dashboard steps (MANUAL STEP REQUIRED on the issue) — desktop session, kickoff
  prompt ready below.
- SESSION_0733's record file lives in PR #401; nothing here edits it, so no merge conflict.
  Sequencing note: session 0733 will *run* after 0734 closes — numbers are labels, not order
  (ADR 0049 gaps-burn logic already accepts this).

### Scope guard

No code, no schema, no #380 work, no RankAward-surface edits, no re-opening of 0730/0731 ratified
laws. Template + record only.

## Cody pre-flight

n/a — no code written (docs/governance session).

## Dogfood — SESSION_0733 kickoff prompt (filled from PROMPT_TEMPLATE v1)

Precondition before pasting: **merge PR #401 first** (it carries the staged SESSION_0733.md stub
and the #377 guard; the prompt below assumes both are on `main`).

```text
/bow-in — SESSION_0733 = #398 Preview DB isolation proof (unblock #380) (ops/proof lane). Act as
PETEY orchestrator (Fable 5 — sub-work stays on Fable 5 unless a handoff to Codex says otherwise).
Repo: black-belt-legacy (ONE repo, ADR 0059).

FS-0024 GUARD FIRST, before ANY mutating git: pwd + `git remote -v` must be the black-belt-legacy
canonical (/Users/brianscott/dev/black-belt-legacy, remote Ronin-Dojo-Design/black-belt-legacy) —
never the read-only dirstarter_template, never a sibling brand repo. On mismatch STOP and paste
`pwd` + `git remote -v` verbatim — do NOT mutate the wrong tree. ADOPT-STUB: SESSION_0733 is
pre-staged (status: staged) — adopt it (flip to in-progress, no cp, ADR 0049). Worktree-isolation
law: don't edit in canonical if a co-session is live (canonical-claim.sh check decides).

RECIPE: pp (docs/protocols/petey-plan.md) — grill-first ops lane; external-settings changes are
operator forks, never auto-resolved.

WHY THIS SESSION: Map #374's explicit blocker: #398 (D-058 / RISK-16) — production Neon credentials
are visible beyond Vercel Production and Preview has no explicit, protected migration mechanism.
#380 (one-table RankAward drop) stays blocked until this proof exists. Done = prod creds scoped to
Production only, Preview wired to a Neon branch with a ratified migration mechanism + Deployment
Protection, and a throwaway additive migration PROVEN to change Preview while prod
_prisma_migrations is byte-identical — evidence captured, #398 closed.

BRANCH: session-0733-preview-db-isolation off current main (explicit `git pull --ff-only origin
main` first; #401 must already be merged). Commit-only in-lane; YOU push foreground on the
operator's word. NEVER `git add -A` (FS-0035 — stage explicit paths only).

CODEX ENV: n/a — env/proof lane; any code delta is small and stays foreground. (If a refactor
surfaces, the standing Claudex contract from PROMPT_TEMPLATE applies unchanged.)

SCOPE = n/a — env-proof lane, no bounding commit set. Scope = issue #398's checklist +
`apps/web/scripts/prebuild-migrate.ts` + Vercel env scopes + Neon branches + one throwaway
additive migration (hand-authored, reverted after proof). Out-of-scope findings route to ledgers
(closing.md §6.7), never inline fixes.

TIERED WORK:
- T1 DEEP — Vercel env scoping (Production-only prod DATABASE_URL) + Neon Preview branch wiring +
  the explicit Preview migration mechanism + Deployment Protection: full grill → ratify → apply.
- T3 VERIFY-NOT-REWRITE — apps/web/scripts/prebuild-migrate.ts + vercel.json ignoreCommand: prove
  the VERCEL_ENV gate behaves per #399; touch only what the ratified mechanism demands.
- FROZEN REVIEW-ONLY — production DB + schema.prisma + all #380 files: findings route to #380/#374;
  zero edits.

HARD CONSTRAINTS: NEVER print/log credentials (no hand-parsing prod secrets; DB identity logged
without secrets) · `migrate dev` ALWAYS banned on the shared DB; hand-authored migrations only ·
prod `_prisma_migrations` must be provably unchanged by the throwaway proof · Vercel/Neon dashboard
changes are OPERATOR-FOREGROUND (MANUAL STEP REQUIRED) — grill + stage exact click-paths, Brian
executes · rotation/rollback steps ratified BEFORE any credential change · no secrets/PII into git.

INHERITED LAWS (do NOT re-open or regress): ADR 0035/0058 display law (top rank = highest AWARDED
by sortOrder, awardedAt-desc-NULLS-LAST tiebreak, never scope by rank.brand; status mutable vs
provenance immutable) · IMPORTED-lock stays LIFTED (operator-ratified) · writes stay on RankAward
until #380 · #377 guard (PR #401) is law — no new direct RankAward reads · technique-media NO-LEAK
· Graphify refresh POST-MERGE only.

RUN ORDER (grade-drives-fix-drives-re-gate):
1. Read-only inspection: current Vercel env scopes + Neon branches (no credentials printed) + #398,
   #380, D-058, RISK-16, prebuild-migrate.ts — grader: Petey (plan-quality) — done-means: a written
   current-state map + the fork list.
2. Grill/ratify with Brian: Preview migration mechanism, Deployment Protection, credential
   rotation, rollback — grader: operator one-word picks — done-means: every fork closed in the
   SESSION record before any external setting changes.
3. Apply the ratified scoping/wiring (Brian executes dashboard steps; agent stages exact
   click-paths + verifies after) — grader: Doug (failure-mode: what breaks Preview builds?) —
   done-means: prod creds Production-only; Preview on its Neon branch; protected.
4. Throwaway additive migration proof: hand-authored, applied to Preview only, rendered; prod
   `_prisma_migrations` byte-identical before/after; DB identity logged without secrets; revert —
   grader: Doug — done-means: captured evidence block in the SESSION record; #398 closed with it.
Final: Giddy /ggr — clear line 9.0+ (ops lane; ADR 0052 D6); composite + caps recorded; anything
unreached routes to a ledger row, never silently dropped.

BOW-OUT (closing.md, full close): findings routed N/N with ids (§6.7) · Graphify refresh
POST-MERGE ONLY · re-run `bun run wiki:lint` after close content · stage SESSION_0735 = #380
one-table-fold GRILL (re-read #374/#380, ADR 0058, SESSION_0730's four forks + this session's
proof before any schema work) with its kickoff prompt from PROMPT_TEMPLATE · HOLD the one close
push for Brian's explicit word — /bow-out is NOT push authorization.

STANDING RULES: you NEVER merge (0641 closed) · main is PR-only, server-enforced — never push to
main from a worktree · hand-authored migrations only · SotD kernel + shared ledgers frozen · Brian
may be on mobile — SHORT readouts, one line per step, forks framed for a one-word pick · on any
limit/config/sandbox error STOP and paste the EXACT error text verbatim; if unknown, say "I don't
know."

FIRST LINE BACK: confirm FS-0024 canonical + that PR #401 is merged (STOP and say so if not), then
the #398 current-state map + fork list.
```

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0734_TASK_01 | landed | `docs/sprints/_template/PROMPT_TEMPLATE.md` v1 — placeholder legend + scissors-delimited paste body; house location = sibling of SESSION_TEMPLATE.md (record-template + kickoff-template pair). |
| SESSION_0734_TASK_02 | landed | Filled SESSION_0733 (#398) kickoff prompt embedded in `## Dogfood` above; paste-ready for the desktop session, precondition = PR #401 merged. |
| SESSION_0734_TASK_03 | landed | wiki:lint 0 errors / 115 warnings (all inherited, 0 in new files); single commit on `session-0734-prompt-template`; push held for operator word. |

**Decisions resolved:** Template home = `docs/sprints/_template/` (no `_templates`/`90_TEMPLATES`
dir exists; the kickoff prompt is the SESSION record's natural twin). Filled prompts are embedded
in the staging SESSION record, never committed standalone (single-state-file doctrine).

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | 0 errors / 115 warnings — exact inherited baseline; 0 in PROMPT_TEMPLATE.md or SESSION_0734.md |

## Artifacts

None. Operator declined a frozen State-of-Dojo snapshot; live view = `/app/state`.

## Open decisions / blockers

- PR #401 merge = operator self-serve (elected at bow-in); the 0733 kickoff prompt assumes it.
- #398 run = desktop session (operator-manual dashboard steps).

## Next session

- **Goal:** Run SESSION_0733 (#398 preview-DB isolation proof) via the dogfooded kickoff prompt.
- **First task:** Merge PR #401, then paste the `## Dogfood` prompt above into a fresh session.

## Close evidence

**/ggr composite:** pending · **Caps applied:** pending
**Systemic health:** pending
**Reviewer verdicts:** pending
**Findings ≥ medium:** pending
**ADR / ubiquitous-language check:** pending

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | pending |
| Wiki lint | pending |
| Reflections routing receipt | pending |
| Code-quality gate (Class-A) | pending |
| Runtime verification (Doug) + artifact URL | pending |
| Deferral guard (§6.8) | pending |
| Memory sweep · next-session unblock | pending |
| Git hygiene · Graphify update | pending |

## Reflections

- pending → route: pending
