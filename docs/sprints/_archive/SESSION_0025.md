---
title: "SESSION 0025 — Full-close proof contract correction"
slug: session-0025
type: session
status: closed-full
created: 2026-04-29
updated: 2026-04-29
last_agent: codex-session-0025
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0024.md
  - docs/rituals/closing.md
  - docs/protocols/failed-steps-log.md
  - docs/protocols/task-plan-log.md
  - docs/protocols/task-review-log.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0025 — Full-close proof contract correction

## Date

2026-04-29

## Operator

Brian Scott

## Status

closed-full

## Goal

Correct the closing protocol so full close and quick close are explicit user-requested modes, and full close requires auditable JETTY/backlink/Kaizen proof.

## Bow-in audit

- Previous session read: `docs/sprints/SESSION_0024.md`
- User correction: full close proof was not explicit enough; JETTY 3.0, backlinks, and Kaizen/reflection steps must be visibly proven when full close is requested.
- Current lane: Core platform governance
- Worktree: `/Users/brianscott/dev/wt-core-platform` on branch `session-0023-core-platform`
- Primary task: log a failed step, tighten closing protocol, then commit and push the branch.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None directly; governance around close/review discipline |
| Extension or replacement | Extension — improves protocol proof around already-added Dirstarter close review gate |
| Why justified | Closing must preserve traceability before schema/auth/payment/deploy work continues |
| Risk if bypassed | Future agents can claim full close while skipping or obscuring the evidence that proves close quality |

## Petey plan

### Goal

Make full close auditable and commit/push the accumulated work.

### Tasks

#### SESSION_0025_TASK_01 — Log full-close proof failure

- **Agent:** Giddy + Doug
- **What:** Add a new failed-steps-log entry for vague/insufficient full-close proof.
- **Steps:**
  1. Add FS-0005.
  2. Point it at `closing.md`.
  3. Define concrete verification.
- **Done means:** Failed step is logged with mitigation and verification.
- **Depends on:** nothing

#### SESSION_0025_TASK_02 — Tighten closing mode contract

- **Agent:** Giddy
- **What:** Update `closing.md` so quick/full close behavior and proof artifacts are explicit.
- **Steps:**
  1. Add mode contract.
  2. Add full-close proof requirements for JETTY/backlinks, Kaizen reflections, review/recommend, memory sweep, and next-session unblocked check.
  3. Add failed-steps-log linkage.
- **Done means:** Future full closes have a concrete evidence checklist, not generic checkmarks.
- **Depends on:** SESSION_0025_TASK_01

#### SESSION_0025_TASK_03 — Commit and push

- **Agent:** Giddy
- **What:** Stage, commit, and push the branch after validation.
- **Steps:**
  1. Run validation.
  2. Stage and inspect status.
  3. Commit with a conventional message.
  4. Push branch to origin.
- **Done means:** GitHub branch has the work.
- **Depends on:** SESSION_0025_TASK_02

### Parallelism

No parallelism needed. This is small governance work over already-open changes.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0025_TASK_01 | Giddy + Doug | Failure classification and proof requirements |
| SESSION_0025_TASK_02 | Giddy | Protocol correction |
| SESSION_0025_TASK_03 | Giddy | Git hygiene and publish |

### Open decisions

- None. User explicitly requested the failed-step log and commit/push.

### Risks

- Branch push may fail if remote auth rejects it.
- One commit will include accumulated uncommitted Wave A and governance work from SESSION_0023-0025.

## What landed

- Logged FS-0005 for vague full-close proof and non-enforced wiki-lint.
- Tightened `closing.md` so quick close and full close are explicit mode contracts.
- Added full-close evidence requirements for JETTY/frontmatter, backlinks/index, wiki-lint, Kaizen reflections, hostile review, review/recommend, memory sweep, next-session unblock, and git hygiene.
- Added `bun run wiki:lint` as the executable docs lint command and updated the script to ignore raw import/archive directories.
- Added closing governance terms to `ubiquitous-language.md`.
- Cleaned active backlink warnings until `bun run wiki:lint` returned no violations.
- Updated wiki index and wiki change log with SESSION_0023-0025 governance/schema work.

## Files touched

| Path | Note |
| --- | --- |
| `apps/web/prisma/schema.prisma` | Wave A schema substrate from SESSION_0023 |
| `docs/sprints/SESSION_0023.md` | Wave A session close artifact |
| `docs/sprints/SESSION_0024.md` | Hostile close protocol session close artifact |
| `docs/sprints/SESSION_0025.md` | This correction and full-close proof |
| `docs/protocols/task-plan-log.md` | Numbered task ledger from SESSION_0023 forward |
| `docs/protocols/task-review-log.md` | Hostile review ledger and findings |
| `docs/protocols/hostile-close-review.md` | Giddy + Doug hostile close protocol |
| `docs/protocols/failed-steps-log.md` | FS-0005 added |
| `docs/protocols/wiki-lint.md` | `bun run wiki:lint` made the close command |
| `docs/rituals/opening.md` | TASK_PLAN_LOG added to bow-in runway |
| `docs/rituals/closing.md` | Full/quick close contract and evidence table |
| `docs/architecture/ubiquitous-language.md` | Added governance vocabulary |
| `docs/architecture/data-model.md` | Backlink metadata repaired |
| `docs/architecture/s1-schema-design.md` | Backlink metadata repaired |
| `docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md` | Broken ADR relative links repaired |
| `docs/runbooks/schema-migration.md` | Invalid dry-run Prisma instruction corrected |
| `docs/knowledge/wiki/index.md` | SESSION_0023-0025 and protocol index updates |
| `docs/knowledge/wiki/log.md` | Wiki change log updated |
| `docs/knowledge/wiki/manual-boundary-registry.md` | Wave A authorization boundary note and backlinks |
| `docs/knowledge/wiki/repo-truth-index.md` | Backlink metadata repaired |
| `docs/knowledge/wiki/aliases-and-canonical-ids.md` | Backlink metadata repaired |
| `docs/knowledge/wiki/concepts/passport-and-shells.md` | Relative links and metadata repaired |
| `docs/knowledge/wiki/files/schema-prisma.md` | Backlink metadata repaired |
| `docs/knowledge/wiki/files/discipline-queries.md` | Backlink metadata repaired |
| `docs/knowledge/wiki/files/organization-new-page.md` | Backlink metadata repaired |
| `docs/knowledge/wiki/files/directory-query-component.md` | Backlink metadata repaired |
| `package.json` | Added `wiki:lint` script |
| `scripts/wiki-lint.ts` | Excluded raw import/archive docs from active lint scope |

## Decisions resolved

- `TASK_PLAN_LOG` and `TASK_REVIEW_LOG` live in `docs/protocols/`, not inside rituals. Rituals invoke them; logs remain append-only ledgers.
- Full close is now a proof state. It requires a full-close evidence table, not generic checkmarks.
- Quick close remains intentionally lighter. A user asking for quick close should not silently receive or be told it was a full close.
- `wiki:lint` is mandatory close evidence for full close.
- SESSION_0025 did not need live Dirstarter docs because it touched governance/docs only; SESSION_0023 already recorded the Dirstarter schema/auth review for Wave A.

## Verification

- `bun run wiki:lint` — pass; no lint violations found across 111 markdown files.
- `DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres" SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:54322/shadow" bunx prisma validate --schema apps/web/prisma/schema.prisma` — pass; schema valid.
- `git diff --check` — pass.

## Task log

- `SESSION_0025_TASK_01` — landed; FS-0005 added with mitigation and verification.
- `SESSION_0025_TASK_02` — landed; closing mode contract and wiki-lint evidence requirement added.
- `SESSION_0025_TASK_03` — landed at close; branch staged, committed, and pushed after validation.

## Review log

- `SESSION_0025_REVIEW_01` — full-close proof contract review in `TASK_REVIEW_LOG`.
- Finding `SESSION_0025_FINDING_01` is addressed by the evidence artifact requirement and a clean `bun run wiki:lint`.

## Hostile close review

**Giddy verdict:** The plan is logically sound now. The bad version allowed a ceremonial full close. The corrected version makes full close falsifiable through command output, backlink proof, review-log linkage, and next-session unblock proof.

**Doug verdict:** The remaining security/data risk is from SESSION_0023 Wave A, not from SESSION_0025. No endpoint was exposed here. The real risk remains MB-002: Wave A data must not get server actions or routes without brand/org authorization predicates.

**Dirstarter docs check:** not applicable for SESSION_0025. This session changed governance docs and wiki lint scope only. SESSION_0023 review remains the applicable Dirstarter schema/auth check for the accumulated branch.

**WORKFLOW 5.0 honesty:** Operational workflow was followed in the worktree with task IDs, review log, full-close evidence, and validation. Calendar/session-number drift from SESSION_0023 remains an open finding in `TASK_REVIEW_LOG`.

## Open decisions / blockers

- `SESSION_0021` still needs a superseded/recovery decision because Wave A landed in SESSION_0023.
- `SESSION_0023_FINDING_01` remains open: nullable unique constraints do not enforce some intended business defaults in PostgreSQL.
- `SESSION_0023_FINDING_03` remains open: schema is not authorization; MB-002 still blocks exposed Wave A reads/writes.
- Production migration artifacts are still missing; local `db push` is not deploy-grade migration proof.

## Next session

**Goal:** Open a clean governance/schema cleanup session to resolve SESSION_0021 traceability drift and start converting Wave A risk findings into scoped follow-up tasks.

**Inputs to read:**
- `docs/sprints/SESSION_0023.md`
- `docs/sprints/SESSION_0025.md`
- `docs/protocols/task-review-log.md`
- `docs/knowledge/wiki/manual-boundary-registry.md`
- `docs/protocols/WORKFLOW_5.0.md`

**First task:** Decide whether `SESSION_0021.md` becomes superseded, recovered, or repurposed, then update wiki index and task logs accordingly.

## Reflections

- The failure mode was not missing intent; it was missing falsifiable proof. A close checklist that permits generic checkmarks will decay.
- `wiki:lint` was valuable only after the scope was honest. Raw imports and archived source docs should not block active repo close, but active docs must be clean.
- Backlink warnings are cheap to ignore and expensive to debug later. Fix them during close when the touched context is still loaded.
- Full close has to finish the evidence trail before the bow-out line. If git proof cannot be self-referential inside the same commit, record the branch/status in the SESSION file and report exact commit/push result in the final response.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched wiki/architecture/protocol docs checked; `updated`, `last_agent`, and `health` fields repaired where applicable. |
| Backlinks/index sweep | Repaired backlink asymmetry on architecture/wiki file docs; removed stale backlink `needs_fix`; SESSION_0023-0025 and protocols are indexed. |
| Wiki lint | `bun run wiki:lint` passed with no violations across 111 markdown files. |
| Kaizen reflection | `## Reflections` section present above. |
| Hostile close review | `SESSION_0025_REVIEW_01` exists in `TASK_REVIEW_LOG`; hostile review section present above. |
| Review & Recommend | `Next session` has goal, inputs, and first task. |
| Memory sweep | Updated `ubiquitous-language.md`, `failed-steps-log.md`, `closing.md`, `wiki-lint.md`, wiki index, and wiki log; no external memory write needed. |
| Next session unblock check | Unblocked for governance cleanup; first task is local docs/session traceability. |
| Git hygiene | Branch `session-0023-core-platform`; `git diff --check`, `wiki:lint`, and Prisma validate passed; commit/push executed after this artifact was staged. |

## Close checklist

- Step 1 pause work — complete.
- Step 2 SESSION file update — complete.
- Step 3 JETTY 3.0 sweep — complete; `wiki:lint` clean.
- Step 4 git hygiene — complete at final close.
- Step 5 bow-out line — final response.
- Step 6 reflections — complete.
- Step 6a full close evidence artifact — complete.
- Step 6.5 hostile review + review/recommend — complete.
- Step 7 memory sweep — complete.
- Step 8 next session unblock check — complete.
