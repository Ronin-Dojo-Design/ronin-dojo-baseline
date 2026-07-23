---
title: "FAILED_STEPS Log"
slug: failed-steps-log
type: protocol
status: active
created: 2026-04-27
updated: 2026-07-23
last_agent: claude-session-0624
pairs_with:
  - docs/rituals/closing.md
backlinks:
  - docs/protocols/cody-preflight.md
  - docs/agents/cody.md
  - docs/knowledge/wiki/index.md
  - docs/sprints/_archive/SESSION_0025.md
  - docs/sprints/_archive/SESSION_0139.md
  - docs/sprints/_archive/SESSION_0158.md
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
  `next.config.ts` redirect map). SESSION_0549 re-swept `revalidatePath("/admin` across `apps/web/server` and
  `apps/web/app`; grep is clean, and the `/admin` route tree is no longer mounted in app code.
- **Status:** closed for admin-route residue as of SESSION_0549; keep applying the checklist to future route moves.

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
- **Mechanization (SESSION_0575):** `scripts/ledger-id-next.ts` landed — `--prefix=<X>` prints the
  next safe ID (max+1 over every occurrence in `docs/`, pad-tolerant `0*` matching, archives
  included); `--check` flags IDs with more than one defining row/heading (exit 1) plus phantom
  references (cited but defined nowhere — informational). First run caught a live collision:
  WL-P3-37 defined twice in `wiring-ledger.md` (resolved SESSION_0575). Wired into the bow-out
  read-path at closing.md §6.7 (the finding router — the moment IDs get minted).
- **Status:** mitigated (mechanized — `scripts/ledger-id-next.ts`, closing.md §6.7).

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
  `bun dev`: start the e2e dev server `bun run dev:e2e`, then `bun run test:e2e:local -- <spec> -g "<name>"
  --project=chromium` (SESSION_0534: use `test:e2e:local`, NOT a direct `CI= npx playwright test …` — the
  latter's `auth-db.ts` bridge subprocess auto-loads `.env`/prodsnap, minting the admin session in the wrong
  DB, so every `/app/*` route 307s and no table renders; `reuseExistingServer: !CI` still reuses the server);
  (c) prefer selectors a *passing* sibling
  test already exercises over role-NAME on components that set `aria-label`; (d) **queued next-session infra
  (the real fix):** a dedicated small **seeded e2e DB** (not the prodsnap) so heavy pages render locally, + a
  bow-out/pre-push guard that blocks an `e2e/`-touching diff without evidence the affected spec ran (or an
  explicit waiver). Belongs to [Pattern 2 — "green isn't verified"] alongside FS-0028 / the 0495/0511 e2e misses.
- **Verification:** `bun run test:e2e:local -- admin-collection-conformance -g "Draft editorial queue"
  --project=chromium` renders the real table + the Drafts facet (against the seeded `ronindojo_e2e`, after
  `bun run dev:e2e`; CI green at `33e7b275`). CI E2E green at `33e7b275`.
- **Status:** **RESOLVED (SESSION_0533).** Infra mechanization LANDED: a dedicated small seeded
  `ronindojo_e2e` DB (`apps/web/scripts/setup-e2e-db.ts`, idempotent, refuses non-e2e DB names) + a local-run
  launcher (`scripts/run-e2e-local.ts` + `.env.e2e`) that sidesteps the prodsnap tx-timeout + an
  `e2e/**`-diff run-evidence guard (`scripts/check-e2e-run-evidence.ts`, wired into closing.md §4c — NOT an
  installed hook). Doug independently reproduced 9 passed locally + runtime-proved the server queries the
  seeded DB. Residual (ledgered, non-blocking): the `bun --env-file … next dev` recipe form poisons
  Turbopack's PostCSS-worker `NODE_OPTIONS` → the closing.md §4c recipe should move to a `loadEnvFile`
  launcher; and the WL-P2-60 kebab codemod left 11 empty `import {}` lines (a codemod should prune emptied
  imports).
- **In-session recurrence — reddened `main` TWICE (FS-0031's own lesson, immediately):** the SESSION_0533
  close push reddened `main`'s chromium e2e. The new A1 test (`admin-collection-conformance.spec.ts`)
  asserted a Posts row-action on `/app/blog`, which needs a **real post row**. The **local `ronindojo_e2e`
  seed has 4 posts** (WL-P2-58/setup-e2e-db) so it passed locally + the evidence guard was green; but
  **CI's e2e DB has ZERO posts** (`migrate deploy` + the tournament fixture only — no post seed). **The
  diagnosis itself took two tries** (each a red push): (1) first assumed CI had "published but 0 drafts" →
  "fixed" by acting on the All view (`?status=`) — but that ALSO failed, because (2) CI has **zero posts at
  all**, and the `tbody tr` assertion was satisfied by the empty-state **"No results." row** (masking the
  true 0-posts), so `getByRole("Open menu")` still timed out. **Correct fix (3rd, verified):** the A1 test
  **seeds its own Draft post in-test** via a new `create-post`/`delete-post` `auth-db.ts` bridge
  (`createTestPost`/`deleteTestPost`) — fully seed-independent; verified locally against a **reproduced
  0-posts/0-orgs CI state** (10/10) AND the seeded state (10/10). **Root gap + standing rule:** never verify
  a data-dependent e2e assertion against a **richer-than-CI local seed** — reproduce CI's ACTUAL data state
  (delete the rows to mirror CI's empty DB) before pushing, OR (preferred) **seed the fixture in-test** so
  the assertion carries its own data. The empty-state "No results." row is a `tbody tr` — asserting `tbody
  tr` visible does NOT prove real data exists. Candidate infra: align `setup-e2e-db.ts` to CI's minimal
  shape so local == CI by default.
- **Candidate infra LANDED (SESSION_0534, `f101ac30`+`66fa0763`).** `setup-e2e-db.ts` stripped to CI's minimal
  shape (`migrate deploy` only — zero posts/orgs; the tournament fixture is added by Playwright `globalSetup`,
  matching CI), so a local run reproduces CI's data state **by default**. The two conformance assertions that
  needed data now **self-seed in-test** via `createOrg`/`deleteOrg` bridges (the A1 pattern). The org-sort test
  briefly **re-introduced this very anti-pattern** (an absolute desc-first-row `toContainText("Zenith")` coupled
  to global DB state — two sibling specs seed lexically-greater org names); caught by Doug's full-suite run +
  collation probe and replaced with a hermetic relative-flip assertion (5/5 isolation). Also fixed the
  `NODE_OPTIONS`-poisoning dev recipe (→ `bun run dev:e2e` `loadEnvFile` launcher; corrective-action (b) above +
  `closing.md §4c` updated). The 0533 kebab-codemod empty-import residual did **not** recur (both 0534 Codys
  pruned emptied imports). **Residual:** the `check-e2e-run-evidence.ts` guard's own printed recipe still shows
  the poisoning `bun --env-file … next dev` form — fixed to `bun run dev:e2e` at SESSION_0534 close.

### FS-0032 — Raw E2E Prisma reset targeted the non-disposable local production snapshot

- **Session:** SESSION_0542
- **Agent:** Codex
- **Step failed:** The database-target guard in the closing ritual's local E2E verification step was bypassed
  by running `bun --env-file=.env.e2e x prisma migrate reset --force` directly. The command was intended for
  disposable `ronindojo_e2e`, but the effective Prisma child-process target was not guarded and re-verified before
  the destructive command. The real `.env.e2e` already named `ronindojo_e2e` in both URLs; that file content did
  not survive as the effective target across the raw `bun x` child boundary.
- **SOP source:** `docs/rituals/closing.md` §4c; `docs/runbooks/dev-environment/verification-and-testing.md`
  (database roles and effective-target guard).
- **Root cause:** Bun's raw `x`/`bunx` hop re-resolved the default `.env` and selected its `DIRECT_URL`, allowing
  the intended E2E command to resolve to local, non-disposable `ronindojo_prodsnap`. This was reproduced with the
  read-only `migrate status`: the parent named `.env.e2e` and that file contained both correct E2E URLs, while
  Prisma still reported prodsnap. Stale local-development and database runbooks also presented raw reset/`db push`
  or Playwright recipes without consistently distinguishing a guarded child environment from a named env file.
- **Impact:** The local `ronindojo_prodsnap` schema and data were dropped. Remote production and its durable live
  data were never targeted or changed, and that live state was restored locally. There was no pre-incident local
  backup, so any prodsnap-only drift that existed before the reset is unknown and unrecoverable; the retained empty
  casualty database and recovery dumps document the incident but cannot reconstruct that prior local-only state.
- **Corrective action:** Restored `ronindojo_prodsnap` from a new read-only custom dump of live production;
  made `DATABASE_URL` and `DIRECT_URL` explicit in both `.env` and `.env.e2e`; added a guarded E2E environment
  helper with tests; reconciled the verification, local-development, database, seed, catalog, and curriculum
  runbooks; and forbade raw reset/`db push` commands from inheriting `ronindojo_prodsnap`. Disposable rebuilds now
  use the guarded E2E setup or a literally named scratch database with both URLs pinned at the child boundary.
  The web package no longer exposes generic reset/push/migrate aliases; its deploy alias is exact, and its default
  E2E alias routes through the validated local launcher. CI retains its raw command only under workflow-pinned URLs.
- **Verification:** The restored snapshot matched the dump's core counts: 12 users, 15 organizations,
  96 passports, 100 rank entries, and 77 applied migrations. After the reviewed migration preflight,
  migration 78 was deliberately deployed to `ronindojo_prodsnap`, then realigned to the reviewed expand-only
  rollout; migration 79 then added only the rollout-safe `PROPOSAL_PENDING` enum value. The restored mirror and
  E2E fixture each have 79 applied migrations, four nullable proposal columns, zero pending rank reviews, and no
  proposal-integrity contract constraint yet. WL-P1-9 owns the post-rollout preflight and contract migration. The
  guarded E2E helper tests passed. The retained empty casualty database plus both dumps preserve recovery evidence,
  not a byte-for-byte record of the unknowable pre-reset local-only state.
- **Status:** resolved — SESSION_0542.

<!-- SESSION_0074_TASK_02: pattern clustering for quick bow-in scan -->

Read this section at bow-in instead of skimming every individual entry.

### FS-0033 — Negative asserted from a silently-failing filesystem search (lost-intake false negative)

- **Session:** SESSION_0573 (Claude, Petey orchestrator).
- **Step failed:** operator asked for `MMB_INITIAL_INTAKE_RVT.md`. A multi-path `find` (iCloud + `~/Vaults` +
  `~/Desktop` + repo) returned zero matches with stderr suppressed (`2>/dev/null`), and the agent asserted
  "**doesn't exist anywhere**." The file had existed at `~/Desktop/Baseline_Vault/MMB_INITIAL_INTAKE.md` since
  13:45 that day — a later explicit `ls ~/Desktop` + Obsidian vault-registry check found it in minutes. The
  operator had to paste the content into chat to unblock (rescue worked, but the assertion was false).
- **Root cause:** the sweep's failure mode was invisible — `2>/dev/null` swallowed whatever blocked the Desktop
  path (sandbox/TCC or find-expression precedence), so "no output" was read as "no matches." This is the exact
  anti-pattern already ratified for grep/graphify ("never assert a negative from an errored/empty search" —
  discovery memory, opening.md §3d) applied to `find`.
- **Impact:** LOW-MEDIUM — wrong factual claim to the operator; recovery cost one paste + one re-search. No data
  lost (content-identical copy verified by diff).
- **Corrective action:** before asserting any filesystem negative: (1) run the sweep **with stderr visible**
  (or explicitly checked), (2) confirm each root actually enumerated (`ls` one known child), (3) prefer
  authoritative registries over raw sweeps when they exist (Obsidian's `obsidian.json` vault registry answered
  in one call). Re-searched with errors surfaced before the SOT_Vault answer in the same session.
- **Status:** mitigated (corrective recipe applied in-session; this entry is the durable record).

### FS-0034 — Parallel plan session ran in the canonical checkout, stranding a live session's work

- **Session:** SESSION_0593 (Claude). Caught live by the operator ("one was having colliding issues");
  diagnosed by Giddy merge-strategy (read-only, ×2).
- **Step failed:** a parallel PLAN lane (SESSION_0599 admin-consolidation) ran in the **canonical checkout**
  (`/Users/brianscott/dev/ronin-dojo-app`) instead of its own worktree. It `git switch`ed the shared checkout
  to its own branch while SESSION_0593 was live there with uncommitted edits to `SESSION_0593.md` — git carried
  the dirty file onto 0599's branch, leaving 0593's branch empty and its work stranded on the wrong branch.
  0599 also wrote a cross-lane note directly into 0593's SESSION file and left it uncommitted "for the owner."
- **Root cause:** worktree isolation was treated as a build-lane nicety, not a law for *any* parallel lane.
  The canonical checkout is one lane's home; switching it to another lane's branch strands whatever the home
  lane hasn't committed. (0598, the RDD lane, did it right — its own `../ronin-dojo-app-0598` worktree — and
  caused zero ripple, proving the rule.)
- **Impact:** LOW — no work lost (recovered clean, commit `dc7ecc01`), caught pre-merge. But it cost a full
  Giddy merge-strategy pass and a recovery runbook; the identical hazard is latent in every fan-out.
- **Corrective action:** (a) this entry; (b) the rule — **every parallel lane, plan OR build, gets its own
  `../ronin-dojo-app-NNNN` worktree; the canonical checkout never `git switch`es off its home lane's branch**
  (already in `merge-wave.md` §Hard-guards + `fan-out-session-recipe.md`; 0599 bypassed it); (c) shared ledgers
  are append-only with one merge owner + no per-lane `last_agent` bump; (d) cross-lane contracts travel as a
  committed freeze the owner commits, never a dangling edit in another lane's file; (e) back up a dirty file
  before dispatching any Bash subagent (workflow-over-dirty-tree clobber). Full teaching write-up:
  [LR 0018](../learning/ddd/learning-records/0018-parallel-lanes-and-the-canonical-checkout-squat.md).
- **Verification:** SESSION_0593 recovered onto its own branch + committed (`dc7ecc01`); per-lane worktrees
  established (`git worktree list` shows 0593/0598/0599 each isolated); land order + append-only discipline
  produced for the merge-wave.
- **Status:** **RECURRED → corrective superseded.** Was "mitigated" (worktrees re-isolated in-session; rule
  promoted to LR 0018 + this entry), but the corrective was **documentation-only**. The exact open question it
  flagged — "is worktree isolation an *enforced* gate or only documented?" — was answered by the recurrence at
  **SESSION_0610/0611**: only documented. Now **mechanized as an enforced bow-in gate** → see **FS-0035**.

### FS-0035 — FS-0034 recurred: canonical-squat corrective was documentation-only, never enforced

- **Session:** SESSION_0610 (Claude) — caught by the operator at close ("the other lane thinks there's an
  uncommitted SESSION_0610.md"). Same failure class as FS-0034 (SESSION_0593), one recurrence later.
- **Step failed:** SESSION_0611 (a *planned* `live-fanout-sweep` orchestrator) initialized inside the
  **canonical checkout** while SESSION_0610 was live there with uncommitted work — writing its
  `SESSION_0611.md` into the shared tree. 0610's bow-out had to stage **selectively by hand** to keep
  `git add -A` from sweeping 0611's file into 0610's commit. No work lost (caught pre-commit), but the
  isolation guarantee held only by manual vigilance.
- **Which SOP:** [`opening.md`](../rituals/opening.md) (bow-in) + [`live-fanout-sweep.md`](recipes/live-fanout-sweep.md) /
  [`orchestrator.md`](recipes/orchestrator.md) + the FS-0034 rule (worktree isolation for *any* parallel lane; LR 0018).
- **Root cause:** the FS-0034 corrective was **prose in three docs** (merge-wave, fan-out-session-recipe, LR 0018)
  that the bow-in read-path never consumes — "built-not-pointed"
  ([LR 0007](../learning/ddd/learning-records/0007-the-discoverability-heuristic-and-built-not-pointed.md)). It
  also only covered *build/plan lanes*; the **attended orchestrator** runs in canonical by default and nothing
  detected a SECOND orchestrator joining it. FS-0034 named the gap and left it a PL-010 candidate — never mechanized.
- **Impact:** LOW this time (selective staging saved it), but the hazard is latent in every attended-orchestrator
  session and already burned a Giddy merge-strategy pass once (FS-0034).
- **Corrective action:** **mechanized enforcement in the bow-in read-path** — `scripts/canonical-claim.sh`
  (`check` / `claim` / `release`): a stateless occupancy signal (an uncommitted `docs/sprints/SESSION_MMMM.md`
  from another number ⇒ another live session in canonical) + a gitignored `.canonical-session` claim covering the
  pre-SESSION-file bow-in window. Wired into **opening.md** ("Canonical-occupancy guard" — run
  `check --session NNNN`; if OCCUPIED, bootstrap `../ronin-NNNN` and run the whole session there, never in
  canonical) and **closing.md** (run `release`; stage explicit paths, **never `git add -A`** in a shared tree).
  Recipe cards `live-fanout-sweep` / `orchestrator` gain the precondition. Memory: [[canonical-occupancy-guard]].
- **Verification:** tested against the live collision — `check --session 0610` reported **OCCUPIED by
  SESSION_0611** (exit 3) while `check --session 0611` read free; `claim`/`release` round-tripped. The guard now
  trips on exactly the state that strands work, at bow-in, before any edit.
- **Status:** mitigated → **enforced** (mechanized gate, not prose). Escalate to a hard shell block (like the
  FS-0024 git guard) if it recurs despite the check.

### FS-0036 — the FS-0035 guard was a silent no-op on a clean tree (enforced-but-broken)

- **Session:** SESSION_0618 (Claude) — found at bow-in running the FS-0035 step: `check --session 0618`
  exited **1 with no output** on a clean working tree.
- **Step failed:** [`opening.md`](../rituals/opening.md) "Canonical-occupancy guard" — `bash
  scripts/canonical-claim.sh check|claim --session NNNN`. On a **clean tree** (no matching SESSION file — the
  normal bow-in state) it silently exited 1 and, for `claim`, **never wrote `.canonical-session`**. So the
  gate that FS-0035 mechanized to *enforce* isolation did nothing on the exact path most sessions hit.
- **Which SOP:** [`opening.md`](../rituals/opening.md) bow-in guard; `scripts/canonical-claim.sh` (FS-0035 corrective).
- **Root cause:** `occ_git="$(other_uncommitted_sessions | head -1)"` under `set -euo pipefail`. When the
  tree is clean the function's first `grep -oE 'SESSION_…'` matches nothing and exits 1; `pipefail`
  propagates it and `set -e` aborts the command-substitution assignment **before** the `✅ free` echo / the
  claim-file write. The FS-0035 verification only ever exercised the **occupied** path (a live collision with
  an uncommitted SESSION file), so the empty-match free path was never tested — the guard was verified in the
  one state it *didn't* break.
- **Impact:** LOW (no work stranded — the free case is benign, and it fails safe rather than falsely claiming
  free), but the enforced gate provided **zero protection on its most common path**: a real second-session
  collision would not have been blocked because `claim` never persisted the claim file.
- **Corrective action:** made `other_uncommitted_sessions()` tolerant of the no-match case (trailing `|| true`
  on its pipeline), so "no other sessions" reads as the free case (exit 0) instead of a fatal pipeline error —
  fixed at the function so both `check` and `claim` (and any future caller) benefit.
- **Verification:** on a clean tree, `check --session 0618` → `✅ canonical is free` (exit 0); `claim
  --session 0618` → writes `.canonical-session` (exit 0); occupancy still fires — `check --session 9999`
  against the uncommitted `SESSION_0618.md` → **OCCUPIED by SESSION_0618** (exit 3). All three paths proven.
- **Lesson:** a mechanized gate's verification must exercise the **default/negative path** (nothing found),
  not only the positive trigger — "tested" against the occupied state hid a break in the free state. Sibling
  of the "built-not-pointed" thread (LR 0007): here it's *enforced-but-broken*.
- **Status:** mitigated (fix landed + all paths verified SESSION_0618).

### FS-0037 — the bow-in "three Petey questions + State-of-Dojo ask" was skipped the session after it was added

- **Session:** SESSION_0618 (Claude) — **caught by the operator** ("where is the SotD build question? Didn't we
  wire in the three Petey questions in opening and closing last session, and already it didn't work?").
- **Step failed:** [`opening.md`](../rituals/opening.md) State-of-Dojo bow-in ask — cite `/app/state` + ask
  Petey's three questions (*what are we doing? / what's queued? / are we pivoting?*) **+ the "publish a frozen
  State-of-Dojo snapshot?" ask** — via `AskUserQuestion` before "Begin work." The agent ran steps 0–7,
  proceeded straight into the build, and never asked; the operator had to prompt for it.
- **Which SOP:** `opening.md` (bow-in) "State-of-Dojo at bow-in" + `closing.md` §6d — both **added SESSION_0617**.
- **Root cause:** the step lived **only as trailing prose** — `opening.md`'s "State-of-Dojo at bow-in" section
  sits *after* step 7 ("Begin work") and the "What this ritual is NOT" tail, and it was **not in the executed
  `.claude/skills/bow-in/SKILL.md` body**. An agent executing the numbered steps finishes at step 7 and never
  reaches it. Identical mechanism to FS-0035 (guard was prose) and LR 0007 "built-not-pointed": a step the
  executed read-path doesn't traverse does not fire — proven here by failing at the **very next session** after
  it was authored.
- **Impact:** LOW (no work lost; the operator caught it), but it defeated a deliberately-added governance
  loop on its first live run and would silently recur every session.
- **Corrective action (both halves):** (1) added a **MANDATORY `AskUserQuestion` step to the `/bow-in` and
  `/bow-out` skill bodies** — the executed path — enumerating the three questions + the SotD publish ask; (2)
  **promoted the prose to a numbered step** — `opening.md` **step 6b** (before "Begin work") and strengthened
  `closing.md` §6d to point at the skill-body enforcement. The trailing prose is now rationale-only, pointing
  at 6b, so the two can't drift.
- **Verification:** exercised live this session — after the operator's prompt, the ask ran via `AskUserQuestion`
  (SotD publish = yes → Artifact published + logged in `## Artifacts`; mechanization approach elected). The
  skill-body step is now what a fresh `/bow-in` loads and executes.
- **Lesson (meta, 3× this session):** FS-0035 (prose→script), FS-0036 (script broken on the default path), and
  FS-0037 (governance step as unreachable prose) are one pattern — **a rule only fires from the read-path that
  actually executes.** Put mandatory asks in the skill body, not in doc prose the numbered steps run past.
- **Status:** mitigated (both-halves fix landed + verified live SESSION_0618).

### FS-0038 — "highest-numbered SESSION file = the current session" breaks when a merge lands a higher-numbered *closed* record

- **Session:** SESSION_0624 (Claude) — surfaced by the agent at close, not by a failure in the wild.
- **Step failed:** none yet — this is a **latent** trap armed by this session, logged before it fires.
- **Which SOP:** [`opening.md`](../rituals/opening.md) step 1 ("Find the highest-numbered file in
  `docs/sprints/`. That's the previous session.") + the ADR 0049 staged-stub rule ("if the highest-numbered
  file has `status: staged`, it is the pre-staged stub for **this** session").
- **What happened:** two sibling Codex lanes each adopted the same staged `SESSION_0622` stub, so PRs #256 and
  #257 both carried `SESSION_0622.md` + `SESSION_0623.md`. Resolving the duplicate meant renumbering #256's
  record to the next free number — **`SESSION_0631`**. `ledger-id-next` mints `max(all claims)+1` across
  checkout ∪ worktrees ∪ `session-*` refs, and the highest live claim was `SESSION_0630` (staged in the
  `ronin-wl-lane` worktree hours earlier), so 0631 was genuinely next-free. (Precisely: 0623/0625/0630 were
  *claimed*; 0626–0629 are **burned gaps**, not claims — ADR 0049 burns gaps either way, so the answer is the
  same, but "0623–0630 are all claimed" overstates it.) That is the correct ADR 0049 answer, but it
  leaves the **highest-numbered file on `main` as a `closed` record that is 7 numbers ahead of the actual
  session**, and it is neither the previous session nor a staged stub.
- **Root cause (downstream symptom):** the bow-in heuristic conflates *numerically highest* with *most
  recent*. That holds while numbers are minted in execution order; it breaks the moment a number is minted
  for **collision avoidance** rather than sequence — which is exactly what a dup-resolution renumber does.
  Three stubs (`SESSION_0605`, `SESSION_0623`, `SESSION_0625`) sit staged *below* the highest number and are
  invisible to the rule.
- **Root cause (upstream — the actual generator; Giddy, 0624 review):** the **auto-lane harness numbers its
  perpetuation stubs locally** (`SESSION_<thisNumber+1>`) instead of minting via
  `bun scripts/ledger-id-next.ts --prefix=SESSION`. Two sibling Codex lanes therefore both numbered off the
  same base and both emitted `SESSION_0622` + `SESSION_0623` — while a third lane (`wl-lane-base`) had
  already staged `SESSION_0630` hours earlier. Local increment cannot see sibling branches; the mint can
  (it scans checkout ∪ worktrees ∪ `session-*` refs). **The renumber trap is the consequence; unminted
  stub numbering is the cause.** Fixing only the bow-in selector would leave the collisions coming.
- **Impact:** MEDIUM if unmitigated — the next bow-in reads a closed 0631 as "the previous session," finds no
  `Next session` thread it owns, and silently skips three genuinely-queued lanes (including `SESSION_0625`,
  the staged MMB pair to this very session).
- **Corrective action (landed this session):** (1) `SESSION_0624`'s frontmatter sets
  `next_session: docs/sprints/SESSION_0625.md` and its `## Next session` block names 0625 as the follow-on
  with an explicit "do not use highest-numbered" warning — the inherited stub's own task block was renamed
  to `## This session's task` so the two can't be confused; (2) `SESSION_0623`'s perpetuation step now says
  to **mint** the next number rather than increment locally, which stops the generator inside the
  self-copying chain.
- **Corrective action (NOT yet built — the real close):** bow-in step 1 should select the current session by
  **`status: staged` first** (highest staged number wins), falling back to highest-numbered only when no
  stub is staged. Not done here: it edits the ritual that every live sibling lane (0593/0598/0599/0600-02/
  0610/0611/0612/0620) is mid-flight against, and this session is an attended merge lane, not a ritual lane.
- **Lesson:** a renumber for collision-avoidance is not a renumber for sequence — any rule that infers
  *recency* from an ID must state what happens when IDs are minted out of order. And a self-perpetuating
  stub propagates its numbering bug once per iteration; fix the copier, not the copy.
- **Status:** open (pointer + generator mitigations landed SESSION_0624; the bow-in selector fix is the close).

### Pattern 1: L1 component inventory gate bypass (FS-0001 → FS-0008 → FS-0014)

**3 occurrences** across 3 different agent contexts (Claude SESSION_0014, Claude SESSION_0031, Copilot SESSION_0049). Root cause: agent jumps from "clear task" to "implement" without reading `components/common/` or `dirstarter-component-inventory.md`. Mitigations exist in 5+ places but are not consulted. **Current status: mitigated but repeat-prone.** The `.github/copilot-instructions.md` HARD RULE section is the strongest gate — it's in every agent's system prompt.

### Pattern 2: Close ritual step skipping / drift (FS-0004 → FS-0005 → FS-0015 → FS-0017 → FS-0019 → FS-0025)

**6 occurrences.** Root cause: agent declares "done" before completing all checklist steps, or copies the prior session's drift instead of the ritual's intent. FS-0004 skipped JETTY/review/memory steps. FS-0005 allowed vague proof. FS-0015 showed project-log entries never written for 20 sessions. FS-0017 skipped project-log gate, JETTY sweep, wiki-lint, and wiki index update in SESSION_0100. FS-0019: wiki index and JETTY frontmatter drifted across 10 sessions (SESSION_0104–0113) because the sweep step lacked explicit sub-steps. FS-0025: a two-pass close commit (graphify stats + hash chased with a second push) regressed across SESSION_0301–0304, undoing the SESSION_0140 single-commit intent. **Current status: mitigated.** Full close evidence artifact required; closing.md step 3 hardened (SESSION_0113); single-push order locked in closing.md §4/§4b/§6a (SESSION_0304 post-close fix).

### Pattern 3: Governance artifacts drift (FS-0006 → FS-0007)

**2 occurrences.** Root cause: protocols exist but aren't in the execution path. WORKFLOW 5.0 calendar drifted 38 sessions behind; pre-flight wasn't run for non-UI work. **Current status: mitigated.** Protocol surface reduced SESSION_0027; pre-flight expanded to all work types.

### Pattern 4: Git operation footguns (FS-0010 → FS-0011 → FS-0012 → FS-0013)

**4 occurrences** in one session (SESSION_0034). Root cause: first time running multi-branch rebase in automated context. All mitigated via `merge-to-main.md`. **Current status: mitigated, low recurrence risk.**

### Pattern 5: Deploy chain drift — config + lockfile + migrations + env all desynced (FS-0022 → FS-0023 + lockfile gap)
