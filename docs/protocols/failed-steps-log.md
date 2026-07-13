---
title: "FAILED_STEPS Log"
slug: failed-steps-log
type: protocol
status: active
created: 2026-04-27
updated: 2026-07-13
last_agent: claude-session-0532
pairs_with:
  - docs/rituals/closing.md
backlinks:
  - docs/protocols/cody-preflight.md
  - docs/agents/cody.md
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0025.md
  - docs/sprints/SESSION_0139.md
  - docs/sprints/SESSION_0158.md
---

# FAILED_STEPS Log

## Purpose

Append-only log of SOP/guardrail violations. Every entry must have:

- **What failed** — the specific step that was skipped or done wrong
- **Which SOP** — the document that defined the correct behavior
- **Root cause** — why it was skipped
- **Impact** — what broke or had to be reworked
- **Corrective action** — what was changed to prevent recurrence
- **Verification method** — how we prove the fix works (not "I'll try harder")

This log is **read during bow-in** (Tier 1 loading). If an agent has a prior failure pattern, it must acknowledge it before starting work.

---

## Log format

```markdown
### FS-NNNN — {one-line title}

- **Session:** SESSION_NNNN
- **Agent:** Petey | Cody | Doug
- **Step failed:** {exact step from SOP}
- **SOP source:** {doc path}
- **Root cause:** {why}
- **Impact:** {what broke}
- **Corrective action:** {what changed}
- **Verification:** {how to prove it}
- **Status:** open | mitigated | closed
```

---

## Entries

### FS-0001 — Cody built scratch components instead of using L1

- **Session:** SESSION_0014
- **Agent:** Cody
- **Step failed:** "load lane docs → inspect target files" (Cody workflow step 2–3)
- **SOP source:** `docs/ronin_dojo_baseline_systems_pack/10_SOP_AGENT_WORKFLOWS_AND_RITUALS_BASELINE.md` §5
- **Root cause:** Baseline systems pack SOPs were never wired into the active protocol/runbook structure. Cody's workflow definition existed but wasn't in the loading path. Agent jumped from "clear task" to "implement" without inspecting existing components.
- **Impact:** Built `directory-filters.tsx` from scratch with raw HTML. Required full rewrite to use existing `FiltersProvider`/`Filters`/`Sort` + nuqs. ~30 min wasted.
- **Corrective action:**
  1. L1 pre-flight checklist added to `docs/agents/cody.md`
  2. `docs/protocols/cody-preflight.md` created with proof-required gates
  3. This log created and added to Tier 1 loading order

- **Verification:** Cody must produce `## Pre-flight output` in SESSION file before any code. Reviewable artifact, not a promise.
- **Status:** mitigated

### FS-0002 — Dev server startup command not known

- **Session:** SESSION_0014
- **Agent:** Cody
- **Step failed:** "load lane docs" — prior sessions documented the working command
- **SOP source:** `docs/ronin_dojo_baseline_systems_pack/07_NEXT_SESSION_LOADING_ORDER_BASELINE.md` Tier 1 (read latest SESSION)
- **Root cause:** Did not read prior SESSION's "Next session" section carefully. No canonical runbook for dev environment.
- **Impact:** 5+ failed attempts to start dev server. ~10 min wasted.
- **Corrective action:**
  1. `docs/runbooks/dev-environment.md` to be created (SESSION_0015 task)
  2. Bow-in checklist requires confirming dev server command

- **Verification:** Dev server command appears in `dev-environment.md` runbook. Bow-in checklist has explicit field for it.
- **Status:** closed — `docs/runbooks/dev-environment.md` created with dev server command, DB connection, brand hosts, Prisma commands, import paths, rollback steps.

### FS-0003 — Baseline systems pack SOPs not adopted

- **Session:** SESSION_0014 (systemic, spans all sessions since import)
- **Agent:** Petey (planning failure)
- **Step failed:** Adoption checklist item: "move/rename/wire the imported docs into proper repo homes"
- **SOP source:** `docs/ronin_dojo_baseline_systems_pack/baseline_repo_docs_adoption_checklist.md` §3
- **Root cause:** The systems pack was imported but never normalized into `docs/protocols/`, `docs/runbooks/`, etc. The adoption checklist itself defines the exact target paths but was never executed.
- **Impact:** All SOPs in the pack are invisible to the agent loading order. Cody workflow, loading tiers, boundary registry — none are consulted because they're not where the agent looks.
- **Corrective action:**
  1. SESSION_0015 or dedicated session: execute the adoption checklist
  2. Wire `07_NEXT_SESSION_LOADING_ORDER` → `docs/protocols/next-session-loading-order.md`
  3. Wire `10_SOP_AGENT_WORKFLOWS` → `docs/runbooks/sop-agent-workflows.md`
  4. Wire `04_MANUAL_BOUNDARY_REGISTRY` → `docs/knowledge/wiki/manual-boundary-registry.md`
  5. Update `docs/rituals/opening.md` to reference the loading order protocol

- **Verification:** `docs/protocols/next-session-loading-order.md` exists and is referenced in bow-in ritual. Wiki index links to all adopted docs.
- **Status:** closed — all 12 canonical files exist with JETTY frontmatter, all cross-links wired per §8, wiki index has all 14 entries. Verified SESSION_0014.

### FS-0004 — Full close claimed but steps 3, 6.5, 7, 8 skipped

- **Session:** SESSION_0015
- **Agent:** Cody
- **Step failed:** Closing ritual steps 3 (JETTY 3.0 sweep), 6.5 (Review & Recommend), 7 (Memory sweep), 8 (Confirm next session unblocked)
- **SOP source:** `docs/rituals/closing.md` — Full close steps
- **Root cause:** Agent committed and pushed, then stated "Bowed out" without actually executing the full close steps. Treated the bow-out statement as the ritual itself instead of running each step. Pattern: agent rushes to declare "done" instead of methodically completing the checklist.
- **Impact:** Wiki index not updated (new files orphaned), seed-ts wiki article not updated, JETTY frontmatter not bumped on touched files, no memory sweep performed. User had to call it out. Trust erosion — this is the same class of failure as FS-0001 (skipping documented steps).
- **Corrective action:**
  1. Add explicit gate to self-review checklist: "If full close: have I executed EVERY numbered step in closing.md, not just steps 1-2 and 4-5?"
  2. Full close must produce a **close checklist artifact** in the SESSION file proving each step was run — not just the outputs, but a checkmark per step
  3. The bow-out statement ("Bowed out — SESSION_NNNN closed") must be the LAST thing said, after ALL steps are verified complete

- **Verification:** SESSION file must contain `## Close checklist` with checkmarks for each step before `Status: closed-full` is set. Any step without a checkmark blocks the status change.
- **Status:** mitigated

### FS-0005 — Full close proof was too vague; wiki-lint not enforced

- **Session:** SESSION_0025
- **Agent:** Giddy + Doug
- **Step failed:** Full close evidence for closing ritual steps 3, 6, 6.5, 7, and 8 was not concrete enough; wiki-lint was referenced but not actually run or recorded.
- **SOP source:** `docs/rituals/closing.md` — Full close steps; `docs/protocols/wiki-lint.md` — Trigger and rules
- **Root cause:** The close checklist allowed generic checkmarks such as "JETTY/frontmatter sweep ran" without requiring per-file proof, backlink/index evidence, wiki-lint command output, or Kaizen/reflection evidence. The protocol named wiki-lint but did not make the run command a hard close artifact.
- **Impact:** A full close could still hide missing frontmatter updates, asymmetric backlinks, stale wiki index entries, or skipped Kaizen reflections. User had to call out the ambiguity.
- **Corrective action:**
  1. `docs/rituals/closing.md` now defines a strict mode contract: user-requested quick close means quick close; user-requested full close means every quick + full step.
  2. Full close must include a `## Full close evidence` artifact with JETTY/backlink proof, wiki-lint result, Kaizen reflections, review/recommend result, memory sweep decision, and next-session unblock check.
  3. `docs/protocols/wiki-lint.md` and root `package.json` now expose an explicit `bun run wiki:lint` command.
  4. `docs/architecture/ubiquitous-language.md` now defines Quick close, Full close, JETTY sweep, Wiki lint, Kaizen reflection, and Hostile close review.

- **Verification:** A SESSION may only set `status: closed-full` when it contains `## Full close evidence` with the required proof fields and a recorded `wiki:lint` pass/fail summary. Closing without those fields is a failed step.
- **Status:** mitigated

### FS-0006 — Petey not invoked; WORKFLOW 5.0 not followed for multi-model schema work

- **Session:** SESSION_0026
- **Agent:** Cody (should have been Petey first)
- **Step failed:** WORKFLOW 5.0 session lifecycle — Petey bow-in audit, lane selection, Dirstarter alignment table, deliverable scoping, review pass loop. Also: Cody pre-flight protocol not run before schema additions.
- **SOP source:** `docs/protocols/WORKFLOW_5.0.md` (session lifecycle, five hard rules); `docs/protocols/cody-preflight.md` (pre-flight checklist); `docs/agents/petey.md` (role: invoked when scope is multi-part or has open decisions)
- **Root cause:** User said "more schema waves, BCD" and the agent jumped directly to implementation without routing through Petey. The task was clearly multi-part (26 models, 21 enums across 3 passes) and should have triggered Petey for lane selection, deliverable scoping, and TASK_PLAN_LOG entries. Instead, Cody acted as both planner and builder without any planning artifact. The `next-session-loading-order.md` protocol was also not consulted — no Tier 1/2/3 loading was performed.
- **Impact:** No lane selection, no score rubric applied during work, no review pass loop, TASK_PLAN_LOG entries created retroactively at close instead of at planning time. Hostile close review scored session 7.5/10. The schema itself validates, but the process failure means no architectural review caught potential issues before implementation was complete. Sets a precedent that protocols are optional when the task feels clear.
- **Corrective action:**
  1. Any request involving 3+ models or spanning multiple design doc passes must route through Petey before Cody touches schema
  2. Cody pre-flight must be run for schema changes, not just component work — expand scope of `cody-preflight.md` to cover schema/backend tasks
  3. TASK_PLAN_LOG entries must be created at planning time, not backfilled at close
  4. Agent must explicitly state "Invoking Petey" or "Petey waived because {reason}" in the SESSION file before starting work

- **Verification:** SESSION file must contain either a `## Petey plan` with task plan entries created before implementation, or an explicit `Petey waived: {reason}` with the waiver meeting the criteria in `docs/agents/petey.md`. Hostile close review checks WORKFLOW 5.0 compliance (question 7). Additionally, `cody-preflight.md` now includes a Schema Checklist with a mandatory Petey invocation gate for 3+ model changes.
- **Status:** mitigated — SESSION_0027 expanded `cody-preflight.md` with schema/backend checklists that require Petey invocation evidence. Enforcement: any schema pre-flight without a Petey plan or waiver is a FAILED_STEPS violation.

### FS-0007 — Protocols not enforced; governance artifacts decaying

- **Session:** SESSION_0026 (systemic, spans multiple sessions)
- **Agent:** All agents
- **Step failed:** Systematic non-enforcement of: `next-session-loading-order.md` (Tier 1/2/3 loading), `cody-preflight.md` (pre-flight checklist for non-UI work), `WORKFLOW_5.0.md` (score rubric, review passes), and general protocol consultation during execution.
- **SOP source:** `docs/protocols/next-session-loading-order.md`; `docs/protocols/cody-preflight.md`; `docs/protocols/WORKFLOW_5.0.md`; `docs/rituals/opening.md`; `docs/rituals/closing.md`
- **Root cause:** Protocols exist but are not in the agent's execution path. The wiki has grown to 112+ markdown files, but agents don't consult the loading order, don't run pre-flight for non-component work, and don't apply the score rubric during execution. The protocols are written as if enforcement is automatic, but nothing forces an agent to read them. Additionally, several governance artifacts (build-log, task-plan-log, session calendar in WORKFLOW_5.0) are drifting out of sync with actual work.
- **Impact:** Protocols become decoration. The more protocols that exist without enforcement, the less any individual protocol is trusted or consulted. Users lose confidence that the system works. Governance artifacts (build-log, session calendar) become stale, making them unreliable inputs for planning.
- **Corrective action:**
  1. Next session (SESSION_0027): Petey-led audit of all governance artifacts — identify stale, unused, or redundant docs
  2. Consolidate or archive artifacts that aren't earning their keep
  3. Reduce protocol surface area to what agents actually enforce, rather than expanding it further
  4. Consider adding protocol names to copilot-instructions.md so they're in every agent's system prompt, not just discoverable via wiki
  5. Expand `cody-preflight.md` scope to cover schema/backend/migration work, not just UI components

- **Verification:** SESSION_0027 governance audit completed:
  - 107 files had `health` field stripped (was decoration, not measurement)
  - 3 logs merged into `docs/protocols/project-log.md` (build-log + task-plan-log + task-review-log)
  - 2 stale runbooks archived (database.md, prisma-workflow.md)
  - 2 one-time docs deprecated (baseline-docs-adoption-checklist, dirstarter-gap-audit)
  - 3 SOP runbooks wired into cody-preflight.md as mandatory references
  - `cody-preflight.md` expanded to cover schema + backend work
  - `drift-register.md` wired into opening ritual step 3b
  - `agents/README.md` updated with all 6 WORKFLOW 5.0 personas
  - Protocol count reduced from 14 to 11 (3 merged into 1)
  - Every remaining protocol either active-enforced or explicitly wired into a ritual

- **Status:** mitigated — SESSION_0027 reduced protocol surface, merged redundant logs, wired unenforced docs into active touchpoints, and expanded pre-flight to cover all work types.

### FS-0008 — Primitive API and Prisma enum lookups skipped during pre-flight

- **Session:** SESSION_0031
- **Agent:** Cody
- **Step failed:** Cody pre-flight Component checklist (L1 template scan) and
  Schema checklist (Existing schema scan) — neither sub-step required reading
  the actual primitive component files or the actual `schema.prisma` source
  before composing/importing them. Cody inferred prop shapes and enum spellings
  from plan prose instead of from source.

- **SOP source:** `docs/protocols/cody-preflight.md` — Component checklist
  field 2 (L1 template scan), Schema checklist field 3 (Existing schema scan).

- **Root cause:** Pre-flight allowed "matched L1 pattern" / "related models
  listed" without proof that the actual prop names, variant unions, enum
  values, or field types had been read from source. Plan prose used the
  human-natural spelling `CANCELLED` and described primitives by behavior
  rather than by exact API; Cody copied that prose into the implementation.
  Both classes of mistake were caught only at typecheck time, not at
  pre-flight.

- **Impact:** During SESSION_0031 schedule-slice work, two recurring slips
  surfaced: (a) `Avatar` and `Badge variant` props were imported with the
  wrong shape (e.g., a non-existent `size` value or a missing required prop)
  and had to be reworked after typecheck failed; (b) a Prisma enum reference
  used the spelling `CANCELLED` when the actual enum value defined in
  `schema.prisma` was `CANCELED`. Both required edit-and-retypecheck loops
  that pre-flight was supposed to prevent. Pattern matches FS-0001's class —
  agent skipped a documented inspection step because the protocol allowed a
  vague checkmark instead of a paste-from-source artifact.

- **Corrective action:**
  1. `docs/protocols/cody-preflight.md` Component checklist field 2 now
     requires a "Primitive API spot-check" sub-step: read each composed
     primitive's `components/common/<name>.tsx` file and paste the exposed
     prop names + variant string union into the pre-flight output. Importing
     a primitive without listing its props is itself a FAILED_STEPS violation.
  2. `docs/protocols/cody-preflight.md` Schema checklist field 3 now requires
     a "Schema spot-check" sub-step: read each touched Prisma model and enum
     directly from `schema.prisma` and paste the exact enum values and back-
     relation field names into the pre-flight output. Inferring enum spelling
     from plan prose is itself a FAILED_STEPS violation.
  3. Both sub-steps include concrete examples of correct pre-flight output so
     the bar is unambiguous.

- **Verification:** Future SESSION pre-flight artifacts must contain the
  primitive-prop list and the enum-paste-from-source list. Doug's bow-out
  scan flags any pre-flight that names a primitive or enum without those
  fields. The cody-preflight update landed in SESSION_0031.5 TASK_03 is the
  verification artifact.

- **Status:** mitigated

### FS-0010 — Blind `--theirs` conflict resolution without content inspection

- **Date:** 2026-05-03
- **Session:** SESSION_0034 (TASK_06 attendance PR merge)
- **Class:** Process shortcut — conflict resolution skipped semantic review.
- **SOP source:** `docs/protocols/merge-to-main.md` — Conflict heuristics table.
- **Root cause:** During rebase conflict resolution, the operator accepted
  `--theirs` (incoming branch) for all conflicts without inspecting whether
  the "ours" side (main) contained newer content from a different session that
  should be preserved. The assumption was "branch has the latest" without
  verifying that main might have independently-landed parallel work.

- **Impact:** In TASK_06, the attendance PR conflicts were ultimately correct
  to resolve as "theirs" because the branch was the canonical source. But the
  practice of blanket `--theirs` without `diff` inspection is dangerous when
  multiple branches land concurrently. Caught by operator review before merge.

- **Corrective action:**
  1. Authored `docs/protocols/merge-to-main.md` with explicit conflict
     heuristics: "doc-only files → keep both sides; code files → diff first."
  2. Anti-pattern documented: "Never `git checkout --theirs .` without reading
     the diff."

- **Verification:** SESSION_0034 TASK_08 (session-0033 rebase) applied the
  corrected approach — inspected conflicts, kept both sides of doc entries.

- **Status:** mitigated

### FS-0011 — Git editor hanging on rebase continue

- **Date:** 2026-05-03
- **Session:** SESSION_0034 (TASK_06, TASK_08)
- **Class:** Tooling — automated agent blocked by interactive editor prompt.
- **SOP source:** N/A (new discovery).
- **Root cause:** `git rebase --continue` opens the configured editor
  (`$GIT_EDITOR` or `$EDITOR`) for commit message confirmation. In an
  automated/agent context this causes the process to hang indefinitely waiting
  for user input that never arrives.

- **Impact:** Rebase operations stalled until the operator manually identified
  the editor was blocking and killed the process. Multiple minutes lost per
  occurrence.

- **Corrective action:**
  1. Use `GIT_EDITOR=true git rebase --continue` to accept the default commit
     message without opening an editor.
  2. Documented in `merge-to-main.md` step 4.

- **Verification:** TASK_08 rebase completed successfully with
  `GIT_EDITOR=true`.

- **Status:** mitigated

### FS-0012 — Stacked branch rebase attempted on already-merged code

- **Date:** 2026-05-03
- **Session:** SESSION_0034 (TASK_07 session-0031 assessment)
- **Class:** Process waste — unnecessary rebase of a branch whose code was
  already on main via a different merge path.

- **SOP source:** `docs/protocols/merge-to-main.md` — Step 1 (assess
  divergence).

- **Root cause:** The session-0031 branch was assumed to need rebasing because
  it existed as an unmerged branch. Investigation revealed all its code changes
  had already landed on main through the attendance squash merge (PR#1), making
  the branch a subset of main with no unique commits.

- **Impact:** Six file conflicts appeared during rebase that were all
  no-ops (both sides identical). Time spent resolving before realizing the
  branch was redundant.

- **Corrective action:**
  1. Before rebasing any branch, run `git diff main..<branch> -- <code paths>`
     to confirm the branch actually carries unique changes not on main.
  2. If diff is empty or trivial (docs only), the branch can be deleted without
     merge.
  3. Added to `merge-to-main.md` step 1 as "confirm branch carries unique
     delta."

- **Verification:** TASK_07 concluded by deleting the redundant remote branch
  instead of forcing a merge.

- **Status:** mitigated

### FS-0013 — Doc-only conflicts resolved by dropping one side's entries

- **Date:** 2026-05-03
- **Session:** SESSION_0034 (TASK_08 session-0033 rebase)
- **Class:** Data loss risk — doc conflict resolution defaulted to one side.
- **SOP source:** `docs/protocols/merge-to-main.md` — Conflict heuristics:
  "Append-only logs → keep both."

- **Root cause:** `project-log.md` and `wiki/index.md` had conflicts where
  main carried entries from SESSION_0032.5 and the branch carried entries from
  SESSION_0033. A naive single-side resolution would drop one session's
  documentation entries entirely.

- **Impact:** Caught and resolved correctly by stripping conflict markers and
  preserving both sets of entries. No data loss occurred.

- **Corrective action:**
  1. `merge-to-main.md` heuristics table explicitly states append-only log
     files should keep both sides.
  2. Used scripted regex to strip `<<<<<<<`/`=======`/`>>>>>>>` markers rather
     than manual selection, reducing human error.

- **Verification:** Post-rebase `project-log.md` and `wiki/index.md` contain
  entries from both SESSION_0032.5 and SESSION_0033.

- **Status:** mitigated

### FS-0014 — Cody built hand-rolled HTML form components instead of using Dirstarter L1 primitives (REPEAT of FS-0001)

- **Session:** SESSION_0049
- **Agent:** Cody (Copilot)
- **Step failed:** Cody pre-flight Component checklist — L1 template scan, Primitive API spot-check. Agent created `ScoreMatchForm` and `MatchCard` using raw `<input type="radio">`, `<select>`, `<input type="text">`, `<form>` with manual `useState`, and raw `<div>` wrappers instead of Dirstarter's `Dialog`, `RadioGroup`, `Select`, `Input`, `Form`/`FormField`, and `Card` components.
- **SOP source:** `docs/protocols/cody-preflight.md` — Component checklist field 2 (L1 template scan); `docs/protocols/code-guardrails.md`; `.github/copilot-instructions.md` — "Dirstarter patterns: Match existing conventions"; `docs/architecture/program-plan.md` — L1 layer definition ("How files are organized; framework choices; HOC patterns")
- **Root cause:** Despite FS-0001 documenting this exact failure class (SESSION_0014, directory-filters built from scratch), FS-0008 adding primitive API spot-check requirements, and copilot-instructions.md explicitly stating "Match existing conventions — don't invent new patterns," the agent still jumped from "clear task" to "implement" without inspecting `components/common/` for existing primitives. The L1 rule is documented in at minimum 5 places: copilot-instructions.md, program-plan.md L1 table, cody-preflight.md, code-guardrails.md, and this log (FS-0001). **The mitigation from FS-0001 (pre-flight with proof) was not executed.** No pre-flight output appears in SESSION_0049.
- **Impact:** All 6 form/layout components in `bracket-viewer.tsx` (263 lines) must be refactored. Raw HTML `<input>`, `<select>`, `<form>`, `<label>`, and `<div>` wrappers must be replaced with `RadioGroup`, `Select`, `Input`, `Form`/`FormField`/`FormItem`, `Label`, `Dialog`, and `Card`. SESSION_0050 is now a refactor session instead of pure feature work. Operator trust further eroded — this is the third time (FS-0001, FS-0008, now FS-0014) the same class of violation has occurred.
- **Corrective action:**
  1. SESSION_0050 TASK_01 + TASK_02 refactors all hand-rolled components to Dirstarter primitives
  2. **Escalation**: The existing mitigations (pre-flight checklist, primitive API spot-check) are clearly insufficient. They exist but are not consulted. A stronger mechanism is needed:
     - Add an explicit `## L1 component inventory` section to copilot-instructions.md listing every `components/common/*.tsx` file so it's in the system prompt for every agent invocation — not just discoverable via protocol
     - Cody pre-flight must include a `grep` for raw HTML form elements (`<input`, `<select`, `<form`, `<label`) in any new component file — if found, the pre-flight fails
  3. Future sessions: any PR containing raw HTML form elements when a Dirstarter primitive exists is an automatic failed-step, no excuses

- **Verification:** SESSION_0050 bracket-viewer refactor eliminates all raw HTML form elements. Post-refactor `grep -n '<input\|<select\|<form' bracket-viewer.tsx` returns zero matches. Doug verifies at bow-out.
- **Status:** closed — SESSION_0050 TASK_01+02 refactored all hand-rolled components to Dirstarter L1 primitives. FS-0014 is a repeat of FS-0001; root cause cluster: "L1 component inventory gate" (see pattern summary below).

### FS-0015 — Project-log entries missing for 20 sessions (SESSION_0038.5–0057)

- **Detected:** SESSION_0060 full-close (2026-05-04)
- **Session range:** SESSION_0038.5 through SESSION_0057 (~20 sessions)
- **Rule violated:** Project Log Rules 1 + 2 — "Every Cody task that touches code gets a build log entry" and "Every planned task gets a task plan entry"
- **Root cause:** Agent context switches. Sessions 0038–0057 were executed by different agent contexts (Copilot, Codex) that created SESSION files with task tables but did not append to `docs/protocols/project-log.md`. The closing ritual does not have a hard gate that verifies project-log entries exist before allowing `closed-quick` or `closed-full`.
- **Impact:** 20 sessions of product work (lead intake, Dirstarter baseline index, course/technique/certificate admin CRUD, tournament ops lifecycle, bracket/scoring, L1 audit + refactoring, commerce wiring, enrollment checkout, content/curriculum gaps, hostile-close remediation) have no task plan or build log entries in the project-log. The project-log is incomplete as a historical record and cannot fulfill its purpose as "unified append-only ledger" for these sessions.
- **Corrective action:**
  1. Backfill build log + task plan entries from SESSION files (SESSION_0061 task)
  2. Add project-log verification to closing ritual: closing.md must require `grep "SESSION_NNNN" docs/protocols/project-log.md` returns at least one hit before close is accepted
  3. Consider splitting project-log into archive (≤ SESSION_0033) + active (SESSION_0038+) to reduce file size and context window cost

- **Verification:** Backfill entries exist; closing.md updated with project-log gate
- **Status:** closed — 2026-05-05, SESSION_0074_TASK_01 backfilled task plan log rows for SESSION_0038 through SESSION_0072 (including half-numbered 0038.5, 0041.5, 0046.5). Block prefixed with `<!-- Backfilled SESSION_0074_TASK_01 (FS-0015) -->` in `docs/protocols/project-log.md`. Sessions still in YAML `status: in-progress` were marked `unknown`; closed sessions marked `landed`. Closing.md project-log gate is the next layer (SESSION_0074_TASK_09).

### FS-0016 — Duplicate review block appended to project-log (SESSION_0031_5_REVIEW_01 ×4)

- **Detected:** SESSION_0060 full-close (2026-05-04)
- **Session:** Unknown — corruption introduced by a prior agent context
- **Rule violated:** Project Log Rule 5 — "Entries are never edited after creation (append-only)"
- **Root cause:** An agent appended the same `SESSION_0031_5_REVIEW_01` review block 4 times instead of once. Likely caused by a retry loop or context loss during a previous closing ritual. The append-only design means no agent checked for pre-existing entries before appending.
- **Impact:** ~210 lines of duplicated content inflated the project-log from ~530 to ~740 lines. Wastes LLM context window on redundant data.
- **Corrective action:**
  1. Owner manually removed 3 duplicate blocks (2026-05-04) — file reduced to 667 lines
  2. Future append operations should `grep` for the entry ID before appending: `grep -c "SESSION_NNNN_REVIEW_XX" project-log.md` must return 0 before write

- **Verification:** `grep -c "^### SESSION_0031_5_REVIEW_01" docs/protocols/project-log.md` returns 1
- **Status:** resolved

### FS-0017 — Incomplete bow-out: JETTY sweep, wiki index, project-log gate, and wiki-lint skipped

- **Session:** SESSION_0100 (first close attempt)
- **Agent:** Copilot
- **Step failed:** Quick close steps 2 (project-log gate), 3 (JETTY 3.0 sweep + wiki-lint), and wiki index update
- **SOP source:** `docs/rituals/closing.md` steps 2–3
- **Root cause:** Agent declared "bowed out" after writing the SESSION file and committing, but skipped: (1) project-log gate — no SESSION_0100 entries existed, (2) JETTY 3.0 sweep — wiki/index.md still showed SESSION_0099 as `in-progress`, (3) wiki-lint was never run, (4) no hostile close review or ADR check recorded. The SESSION file's `What landed` and `Files touched` sections were minimal.
- **Impact:** Wiki index showed stale status for SESSION_0099. Project log had no record of SESSION_0100. Next bow-in would have found inconsistent state. User caught the skip and requested correction.
- **Corrective action:**
  1. Second pass completed all missing steps: wiki index corrected, project-log entries added (4 tasks + 1 review), wiki-lint run (0 errors), JETTY sweep done, hostile close review recorded, full close evidence artifact added.
  2. SESSION_0100 upgraded from `closed-quick` to `closed-full` with complete evidence.

- **Verification:** `grep -c SESSION_0100 docs/protocols/project-log.md` returns ≥ 1; `bun run wiki:lint` returns 0 errors; SESSION_0100.md contains Full Close Evidence table.
- **Status:** resolved

### FS-0018 — Invalid Stripe expand parameter broke merch order success page

- **Session:** SESSION_0112 (TASK_04), caught SESSION_0113
- **Agent:** Copilot (Cody)
- **Step failed:** Stripe API call validation during implementation — invalid `expand` field passed to `stripe.checkout.sessions.retrieve`
- **SOP source:** Stripe API docs — `shipping_details` is a top-level property, not an expandable sub-resource
- **Root cause:** `expand: ["line_items", "shipping_details"]` was used in the success page. `shipping_details` is not a valid expandable field on Checkout Sessions, so Stripe threw an error. The `catch` block swallowed the error and rendered "Order Not Found" instead of the order summary.
- **Impact:** Merch checkout completed successfully (Stripe payment processed, webhook fired) but the success page always showed "Order Not Found" — poor customer UX on the confirmation screen.
- **Corrective action:**
  1. Removed `shipping_details` from the `expand` array — it's already returned as a top-level property.
  2. Fix applied in SESSION_0113 smoke test.

- **Verification:** Refresh the success page URL with existing `sessionId` — should render order summary with line items, total, size/color badges, and shipping address.
- **Status:** mitigated

### FS-0019 — Wiki index gap and JETTY frontmatter drift (SESSION_0104–0113)

- **Session:** SESSION_0113 (discovered during full close)
- **What happened:** Ten sessions (SESSION_0104 through SESSION_0113) were never added to `docs/knowledge/wiki/index.md`. Multiple docs touched across those sessions had stale `updated` dates and `last_agent` values. Backlinks were not audited bidirectionally.
- **Root cause:** The JETTY 3.0 sweep step in `closing.md` lists the sweep actions but does not explicitly require (a) wiki index completeness verification for session entries, or (b) a bidirectional backlinks audit on all touched files. Agents treated the sweep as "update frontmatter on files I remember" rather than a systematic check.
- **Impact:** Wiki index drifted 10 sessions behind. Any agent doing bow-in and consulting the wiki index would miss recent session context. Backlinks may be one-directional in several docs.
- **Fix:** Added SESSION_0104–0113 to `wiki/index.md`. Updated stale JETTY frontmatter on `failed-steps-log.md`, `manual-boundary-registry.md`, `project-log.md`. Hardened `closing.md` step 3 with explicit sub-steps for wiki index completeness and bidirectional backlinks audit.
- **Verification:** `grep -c "SESSION_0104\|SESSION_0113" docs/knowledge/wiki/index.md` returns ≥ 1 for both. Closing.md step 3 now has numbered sub-steps.
- **Status:** mitigated

### FS-0020 — Grep-first navigation instead of Graphify queries at bow-in

- **Session:** SESSION_0139
- **Agent:** Copilot (Petey)
- **Step failed:** Opening ritual step 3c ("Optional Graphify check for search-heavy lanes") — agent ran 5+ individual `grep`/`find` commands before using Graphify, despite the session being a cross-domain gap analysis (Course + Program admin CRUD across server, admin, web, and architecture layers).
- **SOP source:** `docs/runbooks/graphify-repo-memory.md` §1–4, `docs/rituals/opening.md` step 3c
- **Root cause:** Agent defaulted to familiar `grep`/`find` patterns instead of treating Graphify as the primary navigation tool for cross-domain work. The runbook says "use Graphify when the task is cross-domain" — this task clearly was.
- **Impact:** ~5 unnecessary grep/find calls before the user intervened. Wasted tokens and time. The 3 Graphify queries that followed answered all questions faster and surfaced connections (ADR 0012, feature-data-prerequisites.md) that grep would have missed.
- **Corrective action:** At bow-in, if the session touches 2+ repo areas (admin + server + architecture + web), run Graphify queries FIRST. Use exact-file checks only after graph narrows the file set.
- **Verification:** SESSION_0158 patched `docs/rituals/opening.md`, `docs/rituals/closing.md`, and `docs/runbooks/graphify-repo-memory.md` so cross-domain lanes use `graphify stats`/`graphify query` before repo-wide text search, and the project-log gate uses Graphify discovery plus a direct `project-log.md` exact-file check.
- **Status:** mitigated

### FS-0021 — Schema migration runbook steps skipped (3 of 8 steps) + runbook accuracy gap

- **Session:** SESSION_0152
- **Agent:** Copilot (Cody)
- **Step failed:** Steps 1 (pre-flight check), 4 (verify model count), 8 (type check post-migration). Used `prisma migrate dev` instead of `prisma db push` per runbook — but investigation revealed the runbook itself is outdated.
- **SOP source:** `docs/runbooks/schema-migration.md` §1–8, `docs/runbooks/prisma-workflow.md`
- **Root cause:** Agent executed schema change without reading the runbook first. Skipped pre-flight, verification, and post-migration type check steps. However, the `migrate dev` vs `db push` guidance in the runbook is also stale: Dirstarter L1 uses `prisma migrate` for production deploys (`prebuild: db:migrate deploy`), and `migrate dev` successfully created the migration file needed for Neon. The "shadow DB hang" known issue (SESSION_0004) did not reproduce.
- **Impact:** Low — migration succeeded, correct migration SQL file was created (`ALTER TABLE "Membership" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0`), schema valid, 109 models confirmed, zero TS errors. Skipped steps were completed retroactively.
- **Corrective action:** (1) Before any schema change, read the runbook steps 1–8 sequentially — do not skip. (2) Update `schema-migration.md` and `prisma-workflow.md` to reflect that `migrate dev` is acceptable (and preferred when migration files are needed for production). Remove blanket "never use migrate dev" guidance. (3) Always run `prisma validate` before and `tsc --noEmit` after.
- **Verification:** Next schema change: agent must cite "schema-migration.md step N" for each step as it executes. Runbook update needed (separate task).
- **Status:** mitigated
- **Mitigation:** Mitigation landed in SESSION_0200_TASK_03 (claude-session-0200). schema-migration.md + prisma-workflow.md now reflect SESSION_0152 evidence per corrective action #2. Shadow-DB retest deferred as non-blocking follow-up.
- **Follow-up:** Update `prisma-workflow.md` known issues — `migrate dev` shadow DB hang may be resolved in Prisma 7.x. Test and confirm. Also reconcile with Dirstarter L1 `prebuild: db:migrate deploy` pattern.

### FS-0022 — pnpm 9 pre/post lifecycle hooks silently disabled on Vercel

- **Session:** SESSION_0188 (continuation)
- **Agent:** Claude (this session)
- **Step failed:** `apps/web/package.json` declared `"prebuild": "bun run db:migrate deploy"`, intending Vercel builds to apply pending Prisma migrations before `next build`. Because pnpm 9 disables npm-style pre/post lifecycle hooks by default (require `enable-pre-post-scripts=true` in `.npmrc`), the hook had never fired on Vercel.
- **SOP source:** Implicit — no SOP existed; the `package.json` script convention was inherited from npm-era assumptions.
- **Root cause:** Default pnpm 9 behavior change. Unknown for how many sessions the `prebuild` hook was a no-op. SESSION_0186 added two `User` migrations (`add_user_placeholder_archival`, `backfill_placeholder_users`); they shipped in `schema.prisma` and the Prisma client started selecting `User.isPlaceholder` via better-auth's user-fallback-join, but the columns never reached the production DB.
- **Impact:** HIGH — production login broken for ~30 minutes. `/api/auth/get-session` returned 500 with P2022 ColumnNotFound after PR #14 unblocked Vercel deploys and the latest Prisma client went live against an un-migrated prod DB.
- **Corrective action:** Added `.npmrc` with `enable-pre-post-scripts=true` (PR #15). On the next Vercel rebuild, `prebuild` ran `prisma migrate deploy` against prod, both migrations applied, login resumed. No manual prod DB touch needed.
- **Verification:** Next session must check Vercel build log shows the `> prebuild` step running `> bun run db:migrate deploy` before `> next build`. If any migration is added in a session, bow-out must verify Vercel build log shows the prebuild step ran successfully.
- **Status:** mitigated
- **Follow-up:** ADR_0001 documents the pnpm pre/post scripts decision and why we don't switch to inlining `migrate deploy` into the build script (see `docs/architecture/decisions/ADR_0001_pnpm_pre_post_scripts.md`).

### FS-0023 — Vercel env vars scoped Production-only, breaking Preview deploys

- **Session:** SESSION_0188 (continuation)
- **Agent:** Claude (this session)
- **Step failed:** Five env vars (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_EMAIL`, `RESEND_API_KEY`) existed in the Vercel project but were only attached to the Production environment. Preview builds for every PR failed `@t3-oss/env-nextjs` validation at module load time with `Invalid environment variables: ... expected string, received undefined`.
- **SOP source:** Implicit — no SOP exists for "every Vercel env var must be attached to Production + Preview unless explicitly different per-env." Adding via Vercel UI defaults to Production only when the user clicks save without checking the Preview box.
- **Root cause:** Vercel UX. When adding env vars 4 days ago, the user did not realize the Preview checkbox was unchecked. Preview deploys silently failed for every PR since.
- **Impact:** MEDIUM — Vercel preview never went green on any PR for ~4 days. Masked further failures (lockfile, TS errors) until install/typecheck advanced. Slowed PR review cycle.
- **Corrective action:** User extended each of the five env vars to also apply to Preview environment via Vercel dashboard. PR previews now build with the same auth/site config as Production.
- **Verification:** At bow-out, if a new env var was added to `apps/web/env.ts` this session, the SESSION file must record which Vercel environments (Production + Preview + Development) it was attached to.
- **Status:** mitigated
- **Follow-up:** Consider adding a script `scripts/check-vercel-env-parity.ts` that uses the Vercel REST API to compare env var presence across Production vs Preview and warns on drift. Tracked as **SESSION_0189 follow-up `vercel-env-parity-check`**.

### FS-0024 — Bash cwd drifted to read-only DirStarter template; git commands ran in wrong repo

- **Session:** SESSION_0209 (post-bow-out, during main-merge step)
- **Agent:** Claude
- **Step failed:** When the operator authorized FF-merge to main, the agent ran `git checkout main && git pull --ff-only origin main && git merge --ff-only session-0209-… && git push origin main` without prefixing with `cd /Users/brianscott/dev/ronin-dojo-app &&`. The Bash shell's cwd had drifted back to `/Users/brianscott/Local Sites/DirStarter /dirstarter_template` (VSCode's primary cwd; the read-only purchased boilerplate). The four git commands therefore ran against the DirStarter template repo, not the Ronin app repo.
- **SOP source:** [[feedback-ronin-dojo-bash-cwd]] in operator memory: *"DirStarter is the VSCode primary cwd; every Bash call in a ronin-dojo-app session must start with `cd /Users/brianscott/dev/ronin-dojo-app &&` — no exceptions."* Also [[feedback-dirstarter-template-readonly]]: *"`/Users/brianscott/Local Sites/DirStarter /dirstarter_template` is a purchased boilerplate reference copy… no `git push`/`fetch`/`commit`/`Write`/`Edit` there."*
- **Root cause:** Earlier in the session, `pnpm --filter dirstarter add` reset the Bash shell's cwd. Subsequent commands prefixed with `cd /Users/brianscott/dev/ronin-dojo-app &&` worked correctly. But after several minutes of post-commit/governance-doc work (Graphify update, `vercel ls`, etc.) the agent stopped prefixing — the operator-memory rule says "no exceptions" and the agent applied it inconsistently.
- **Impact:** LOW (zero damage). `git checkout main` switched the template's branch off `chore/enable-pnpm-pre-post-scripts` (restored). `git pull --ff-only origin main` from `https://github.com/dirstarter/dirstarter.git` returned "Already up to date"; no local refs advanced. `git merge --ff-only session-0209-…` errored ("not something we can merge") because the branch doesn't exist in the template. `git push origin main` returned **403 Write access not granted** — the lack of write access to the upstream dirstarter repo was the safety net that prevented any actual corruption.
- **Corrective action:** Restored template to `chore/enable-pnpm-pre-post-scripts`. Ran the FF-merge correctly with `cd /Users/brianscott/dev/ronin-dojo-app &&` prefix; Ronin `main` advanced `0d36d36..4b3d04b` and pushed.
- **Verification:** Every `git` call in future ronin-dojo-app sessions must either (a) be prefixed with `cd /Users/brianscott/dev/ronin-dojo-app &&` even when the shell's `pwd` *appears* correct, OR (b) be preceded by a `pwd && git remote -v` guard whose output is verified before running mutating git commands. Defensive `pwd` checks before any `git push` / `git merge` / `git checkout main`.
- **Status:** mitigated **and now harness-enforced** (rule existed; agent must apply it without exception, including after extended sessions where context-window pressure encourages dropping per-call prefixes). SESSION_0210 (2026-05-20) hit the same pattern three more times in one session (bow-in `git branch`, mid-session `pnpm --filter dirstarter typecheck`, merge-to-main `git checkout main && git pull origin main --ff-only`). Memory + docs proved insufficient — moved enforcement into the harness layer:
  - **Claude Code:** `~/.claude/hooks/ronin-cwd-guard.sh` (PreToolUse:Bash) blocks any unprefixed `git`/`gh`/`pnpm`/`bun`/`vercel`/`graphify` call. Source-of-truth copy committed to `.claude/hooks/` in this repo. Honors `RONIN_GUARD_BYPASS=1` for legitimate cross-workspace ops.
  - **Cross-LLM (Copilot/Codex/Cursor/any future agent):** `~/.shell-guards/ronin-cwd-guard.sh` defines `git`/`gh`/`pnpm`/`bun`/`vercel`/`graphify` as shell functions that refuse to run from inside the dirstarter_template `$PWD`. Sourced from `~/.zshenv` + `~/.bashrc`, propagated to non-interactive bash via `BASH_ENV`. Source-of-truth copy at `.claude/shell-guards/`.
  - **Companion:** `~/.claude/hooks/dirstarter-readonly-guard.sh` (PreToolUse:Write|Edit|NotebookEdit) blocks any write whose `file_path` is inside the dirstarter_template.

- **Follow-up:** Reinforced in operator memory. ~Consider adding a hook in `~/.claude/settings.json` that gates `git push` to `origin/main` behind a cwd allowlist~ — done (SESSION_0210). See `.claude/hooks/README.md` for the full install + hook map.

### FS-0025 — Two-pass commit on close: graphify stats + commit hash chased with a second "fill close evidence" push

- **Session:** SESSION_0301, 0302, 0303, 0304 (four consecutive closes)
- **Agent:** Claude / Petey
- **Step failed:** [`closing.md`](../rituals/closing.md) §4 sequencing note (SESSION_0140) — *"defer git hygiene until after steps 6–8 … avoiding a two-pass commit cycle"* — and §4b — record graphify stats *"if doing so will not force a second commit loop; otherwise report the final stats in the bow-out response."* Each of the four sessions instead ran git hygiene, **then** graphify, **then** a second `docs(SESSION_NNNN): fill close evidence` commit to write the commit hash + graphify stats into the SESSION file. Two pushes to `main` per close.
- **SOP source:** `docs/rituals/closing.md` §4 / §4b / §6a (Full close evidence table).
- **Root cause:** Two things colliding: (a) `graphify update` was run **after** the close commit rather than before, so its stats weren't available to the first commit; (b) the Full close evidence table asks for the **commit hash**, which can never be self-referential — so writing it always forced a second commit. The ritual wording ("graphify after git hygiene" + "hash in evidence table") actively nudged toward commit #2, and four sessions copied the prior session's pattern instead of the SESSION_0140 intent.
- **Impact:** LOW — cosmetic. Two back-to-back pushes to `main` per session, an extra CI/Vercel build per close, noisier history. No data risk.
- **Corrective action:** Locked the single-push order in `closing.md`. `.graphify/` is git-ignored and graphify indexes the **working tree** (not the commit), so `graphify update` now runs **before** the final commit; stats are written into the SESSION file pre-commit. The commit hash is **reported in the bow-out chat response** (git log is the record); the evidence table's hash cell reads "reported at bow-out — see `git log`" rather than demanding a self-referential value. One commit, one push.
- **Verification:** A clean close from SESSION_0305 forward produces **exactly one** close commit — no `fill close evidence` follow-up commit appears in `git log`.
- **Status:** mitigated

### FS-0026 — Route migration (admin→app) left `revalidatePath()` on the retired path prefix

- **Session:** SESSION_0448 (the admin→app migration); surfaced + fixed SESSION_0451.
- **Agent:** discovered by Claude / Petey (SESSION_0451).
- **Step failed:** the SESSION_0448 `app/admin/*` → `app/app/*` route migration moved the pages and added
  `/admin/*`→`/app/*` redirects in `next.config.ts` (so links keep working), but did **not** update the
  `revalidatePath("/admin/...")` calls in the server actions. No ritual step says "when you move a route, grep
  the old prefix in `revalidatePath`/`redirect`/`<Link>`."
- **SOP source:** none existed — this is the gap. (`closing.md` JETTY sweep checks *touched* files, but a route
  move's revalidate callers are usually NOT in the migration diff.)
- **Root cause:** a `revalidatePath` against a 308 redirect-stub path is a silent no-op for the real page — the
  mutation persists to the DB but the Router Cache for the live `/app/*` page is never busted. The redirects
  *masked* the break (pages loaded, saves persisted) so it read as a save/display bug. Undetected 0448→0451
  until the operator hit "rank saves but reverts" on the lineage admin card.
- **Impact:** MEDIUM — admin-wide. Post-mutation refresh silently broken across lineage, users, memberships,
  entitlements, tournaments, org-settings for ~3 sessions. No data loss (writes persisted); stale views until a
  hard refresh.
- **Corrective action:** SESSION_0451 swept all 8 files (`"/admin/` + `` `/admin/ `` → `/app/`; imports
  untouched). Process fix: a **route-migration checklist** — when moving/renaming a route, grep the old prefix
  across `revalidatePath`, `redirect()`, `<Link href>`, `router.push` and update in the SAME change. Captured in
  `[[admin-app-migration-revalidate-paths]]`.
- **Verification:** typecheck/lint/format + local `next build` green; root cause proven on three legs (prod
  audit log showing persisted-but-unrefreshed saves, `/admin/*`=308-stub vs `/app/*`=live topology, the
  `next.config.ts` redirect map). Live render of the fixed refresh is deploy-gated (verify post-merge).
- **Status:** mitigated (deploy-verify pending).

### FS-0027 — Multi-file `bun test` run without `--parallel=1`; rediscovered a documented SOP

- **Session:** SESSION_0452 (RBAC + security tests); flagged by the operator.
- **Agent:** Claude / Cody (SESSION_0452).
- **Step failed:** verified new tests with `bun test fileA fileB …` (several `mock.module` files in **one**
  invocation) without `--parallel=1`. Bun's non-parallel runner shares the module registry across files, so the
  mocks leaked → ~6 false failures + 2 errors, even though every file passed **alone**. Burned a diagnosis cycle
  re-deriving a lesson that already exists verbatim.
- **SOP source:** the lesson EXISTS — `sop-test-writing.md` §"two-headed concurrency problem" (lines 111-135) +
  `test-fail-fix-ledger` TFF-001..005 literally say *"plain `bun test fileA fileB` (no `--parallel`) is **wrong**."*
  It was simply not read before running multi-file tests, and `cody-preflight.md:74` listed the WRONG command
  (`bun test`, not `bun run test` = `--parallel=1`) — actively steering toward the footgun.
- **Root cause:** the documented rule was not surfaced at the moment of test work. No pre-flight step said
  "touching tests → read `sop-test-writing.md` first," and the single preflight reference to the test command was
  itself wrong.
- **Impact:** LOW — no shipped defect; a wasted diagnosis cycle that briefly *looked* like a regression. Resolved
  correctly by re-running with `--parallel=1` → 41 pass / 0 fail.
- **Corrective action:** (a) fixed `cody-preflight.md` §5 to use `bun run test` (= `--parallel=1`) + added a
  "writing/modifying tests → read `sop-test-writing.md` FIRST" line; (b) this FS entry. Optional hard gate (offered,
  not yet added): a PreToolUse hook that surfaces `sop-test-writing.md` when a `*.test.*` file is created/edited.
- **Verification:** `bun test --parallel=1 <files>` → 41 pass / 0 fail; canonical command is `bun run test`
  (sop-test-writing.md:101).
- **Status:** mitigated.

### FS-0028 — "oxfmt clean" claimed in the task log while two committed files were unformatted

- **Session:** SESSION_0498 (Epic A spine); caught by Doug's end-of-session gate re-run.
- **Agent:** Claude / Cody pass #2 (the `5b230aed` beta commit), recorded by the orchestrator.
- **Step failed:** the TASK_04 report + task-log row claimed "oxfmt clean," but `bunx oxfmt --check .` at
  end-verify failed on **2 files introduced/edited by `5b230aed`** (`app/app/beta/lineage-journey/page.tsx`,
  `server/web/lineage/ancestry.test.ts`). The claim was true when checked mid-task, then a later edit round
  (the in-page permission gate + test additions) landed without a final repo-wide format re-check before the
  claim was carried forward — the same class as the SESSION_0495 gate-runner miss (format checks that don't
  cover the final state of NEW/late-touched files).
- **Root cause:** gate claims were snapshotted per-report, not re-verified against the commit that shipped;
  formatting was re-checked per-file rather than repo-wide (`--check .`) after the last edit.
- **Impact:** LOW — caught pre-push by the Doug end-verify (whose job this is); an unnoticed push would have
  reddened CI `format:check`. Fixed by a whitespace-only commit (`01bb94a5`).
- **Corrective action:** (a) this FS entry; (b) rule of thumb ratified in the SESSION close — **a gate claim
  belongs to a commit SHA, not a task**: any post-claim edit invalidates the claim, and the end-verify re-runs
  ALL gates from scratch (which is exactly what caught it).
- **Verification:** `bunx oxfmt --check .` → "All matched files use the correct format" (1,784 files) after
  `01bb94a5`.
- **Status:** mitigated.

### FS-0029 — Deferred work escaped the ledger; invisible for ~11 sessions

- **Session:** surfaced SESSION_0513 (operator flagged `/me` consolidation mid-conversation); mitigated SESSION_0514.
- **Agent:** original miss at SESSION_0502 close (Claude).
- **Step failed:** SESSION_0502 deferred a real work item — **TICKET-0502-A** (the `/me` + `/directory` profile
  component-tree consolidation) — in prose (SESSION file + a memory note + the page-review recipe) but **never
  routed it to a ledger** (§6.7 finding router). Because the bow-in read-path only reads the ledgers
  (`ledger-backlog.ts` → `/app/loop-board` sync), the deferral was invisible: no session would ever pick it up.
  It stayed lost ~11 sessions until the operator happened to remember it.
- **Root cause:** the finding router *routes* findings but nothing *verified* that every deferral in a SESSION
  file actually landed in a ledger. "Deferred to a later slice" reads as done-enough; the artifact never became
  read-path-consumable (the [[readpath-push-vs-pull-audit]] failure mode).
- **Impact:** LOW-MEDIUM — no broken code, but a launch-relevant consolidation silently fell off the backlog.
- **Corrective action:** (a) this FS entry; (b) `scripts/deferral-guard.ts` — flags any SESSION-file deferral not
  backed by a real ledger id; (c) closing.md **§6.8 Deferral guard** step (gate the close on it); (d) TICKET-0502-A
  itself re-ledgered as `WL-P2-37` (SESSION_0513). Also answered the operator's "should we add a create-card
  script?" — NO: the board already auto-syncs from the ledgers, so a manual card is a second un-synced source of
  truth; fix upstream (ledger the deferral), not the symptom.
- **Verification:** `bun scripts/deferral-guard.ts docs/sprints/SESSION_0502.md` → flags all 7 TICKET-0502-A
  deferrals (exit 1); a clean file → exit 0.
- **Status:** mitigated.

### FS-0030 — Ledger IDs assigned without grepping the full ID space (twice in one session)

- **Session:** SESSION_0520 (Claude). Caught in-session by Doug (hostile diff review → FI-020; hostile
  delta re-verify → FI-021).
- **Step failed:** new POST_LAUNCH_SOT rows were numbered by reading only the visually-adjacent table
  block ("last row is FI-019 → next is FI-020"), not by grepping the whole docs tree. FI-020 was already
  the 0499 pinned 2-axis-explorer idea (a separate table block lower in the SAME file); after fixing
  that, the replacement block STILL reused FI-021, which belonged to 0501's admin-nav item. Three docs
  briefly disagreed on what FI-021 meant.
- **Root cause:** "monotonic IDs" was enforced by local table inspection, not a global uniqueness check.
  The SOT's running list has two visually-separated table blocks, so tail-reading one block lies.
- **Impact:** LOW — docs-only, caught pre-merge both times; but the identical miss twice in one session
  after *explicitly fixing the first instance* makes it a pattern, not a slip.
- **Corrective action:** (a) this entry; (b) the rule: before assigning any `<PREFIX>-NNN` ledger id, run
  `grep -rc "<PREFIX>-0*NNN" docs/` for the candidate and take the first zero-hit number (as done for
  FI-025/FI-026); (c) candidate mechanization: a `ledger-id-next.ts` helper or a deferral-guard extension
  that flags duplicate ledger ids across docs.
- **Verification:** `for id in FI-020..FI-029; grep -rl` sweep run SESSION_0520 — FI-022–026 unique,
  FI-026+ free; SESSION_0520/POST_LAUNCH_SOT/goals-ledger now agree.
- **Status:** mitigated (manual rule); mechanization open.

### FS-0031 — E2E assertions shipped "verified by inspection"; reddened `main` three times in one session

- **Session:** SESSION_0532 (Claude, orchestrator). The originating unrun test came from the SESSION_0531
  Codex-takeover batch; the two failed "fixes" were the orchestrator's own.
- **Step failed:** a new Playwright assertion (`e2e/admin/admin-collection-conformance.spec.ts` — "Posts opens
  on the visible Draft editorial queue") was added and then "fixed" **twice** without ever being *run*, so it
  reddened `main` e2e three consecutive pushes. Each was "verified by inspection": (1) the original test asserted
  column headers by role-NAME, but a sortable `DataTableColumnHeader` sets `aria-label` = the sort-state sentence,
  which OVERRIDES the accessible name — `columnheader { name: /Title/ }` can never match; (2) fix #1 changed only
  the locator's *scope*, not the failing query (couldn't work); (3) fix #2 (`.filter({hasText})`) was plausible
  but untested. Only when the orchestrator finally **drove the real surface** (a throwaway DOM-dump spec) did the
  real cause surface — and fix #3, grounded in the selectors a *passing sibling test* already exercises, went
  green. This is the exact [[learning-record-0009]] failure ("green isn't verified") committed *by the author of
  LR 0009, in the same session as writing it.*
- **Root cause:** the e2e suite **cannot be run locally as-configured**, so authors default to inspection.
  Two stacked blockers: (a) `playwright.config.ts` `webServer.command` is `bun run dev` — **FS-0002-banned**, so
  "just run the e2e" isn't a reflex; (b) the local DB is the full **`ronindojo_prodsnap`**, too heavy for some
  pages — `/app/blog`'s list `$transaction` times out on the cold first hit, so the page never renders locally
  even when you do run it. CI's small seeded DB renders fine, so the gap is invisible until CI.
- **Impact:** LOW for prod (Playwright is decoupled from the Vercel deploy — the feature worked throughout), but
  it reddened `main`'s e2e workflow across three pushes and burned three CI cycles + operator time deep in the
  ~120K "dumb zone."
- **Corrective action:** (a) this FS entry; (b) **the rule — never land a new/changed e2e assertion without
  running the affected spec locally first**, via the reuse-existing-server recipe that sidesteps the banned
  `bun dev`: start `npx next dev --turbo`, then `CI= npx playwright test <spec> -g "<name>" --project=chromium`
  (Playwright's `reuseExistingServer: !CI` reuses the running server); (c) prefer selectors a *passing* sibling
  test already exercises over role-NAME on components that set `aria-label`; (d) **queued next-session infra
  (the real fix):** a dedicated small **seeded e2e DB** (not the prodsnap) so heavy pages render locally, + a
  bow-out/pre-push guard that blocks an `e2e/`-touching diff without evidence the affected spec ran (or an
  explicit waiver). Belongs to [Pattern 2 — "green isn't verified"] alongside FS-0028 / the 0495/0511 e2e misses.
- **Verification:** `CI= npx playwright test admin-collection-conformance -g "Draft editorial queue"` renders the
  real table + the Drafts facet in CI (green at `33e7b275`; local run blocked by the prodsnap tx-timeout, which
  is itself the (b) root cause). CI E2E green at `33e7b275`.
- **Status:** mitigated (rule + recipe); infra mechanization (seeded e2e DB + `e2e/`-diff guard) **open** —
  next-session lane.

<!-- SESSION_0074_TASK_02: pattern clustering for quick bow-in scan -->

Read this section at bow-in instead of skimming all 16 entries.

### Pattern 1: L1 component inventory gate bypass (FS-0001 → FS-0008 → FS-0014)

**3 occurrences** across 3 different agent contexts (Claude SESSION_0014, Claude SESSION_0031, Copilot SESSION_0049). Root cause: agent jumps from "clear task" to "implement" without reading `components/common/` or `dirstarter-component-inventory.md`. Mitigations exist in 5+ places but are not consulted. **Current status: mitigated but repeat-prone.** The `.github/copilot-instructions.md` HARD RULE section is the strongest gate — it's in every agent's system prompt.

### Pattern 2: Close ritual step skipping / drift (FS-0004 → FS-0005 → FS-0015 → FS-0017 → FS-0019 → FS-0025)

**6 occurrences.** Root cause: agent declares "done" before completing all checklist steps, or copies the prior session's drift instead of the ritual's intent. FS-0004 skipped JETTY/review/memory steps. FS-0005 allowed vague proof. FS-0015 showed project-log entries never written for 20 sessions. FS-0017 skipped project-log gate, JETTY sweep, wiki-lint, and wiki index update in SESSION_0100. FS-0019: wiki index and JETTY frontmatter drifted across 10 sessions (SESSION_0104–0113) because the sweep step lacked explicit sub-steps. FS-0025: a two-pass close commit (graphify stats + hash chased with a second push) regressed across SESSION_0301–0304, undoing the SESSION_0140 single-commit intent. **Current status: mitigated.** Full close evidence artifact required; closing.md step 3 hardened (SESSION_0113); single-push order locked in closing.md §4/§4b/§6a (SESSION_0304 post-close fix).

### Pattern 3: Governance artifacts drift (FS-0006 → FS-0007)

**2 occurrences.** Root cause: protocols exist but aren't in the execution path. WORKFLOW 5.0 calendar drifted 38 sessions behind; pre-flight wasn't run for non-UI work. **Current status: mitigated.** Protocol surface reduced SESSION_0027; pre-flight expanded to all work types.

### Pattern 4: Git operation footguns (FS-0010 → FS-0011 → FS-0012 → FS-0013)

**4 occurrences** in one session (SESSION_0034). Root cause: first time running multi-branch rebase in automated context. All mitigated via `merge-to-main.md`. **Current status: mitigated, low recurrence risk.**

### Pattern 5: Deploy chain drift — config + lockfile + migrations + env all desynced (FS-0022 → FS-0023 + lockfile gap)
