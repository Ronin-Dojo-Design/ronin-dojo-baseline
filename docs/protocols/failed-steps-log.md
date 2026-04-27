---
title: "FAILED_STEPS Log"
slug: failed-steps-log
type: protocol
status: active
created: 2026-04-27
updated: 2026-04-27
backlinks:
  - docs/protocols/cody-preflight.md
  - docs/agents/cody.md
  - docs/knowledge/wiki/index.md
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
- **Status:** open — runbook not yet created

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
- **Status:** open — adoption not yet done
