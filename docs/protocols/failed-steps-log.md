---
title: "FAILED_STEPS Log"
slug: failed-steps-log
type: protocol
status: active
created: 2026-04-27
updated: 2026-04-28
last_agent: copilot-session-0026
pairs_with:
  - docs/rituals/closing.md
backlinks:
  - docs/protocols/cody-preflight.md
  - docs/agents/cody.md
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0025.md
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
