---
description: "Opening ritual — start a new session (v5.0)"
mode: "agent"
---

# Bow In — Opening Ritual

**Source of truth:** [`docs/rituals/opening.md`](../../docs/rituals/opening.md). **Read and execute it as
written** — it is agent-agnostic and binding for every agent (Claude, Copilot, **Codex**). This file is a
**thin pointer, not a second copy** of the steps: a duplicated step-list rots out of sync (it did — this was
leaned at SESSION_0453, matching the `AGENTS.md` / `copilot-instructions.md` de-dup, ADR 0033 D7).

When you stamp `last_agent` on the SESSION file or touched docs, name the agent that actually executed
(`claude-session-NNNN`, `copilot-session-NNNN`, `codex-session-NNNN`).

## Must-not-skip gates (the ritual has the full, current procedure)

- **Read the latest SESSION file** — highest-numbered `docs/sprints/SESSION_NNNN.md`: its `Goal`,
  `Open decisions / blockers`, and `Next session` block — plus the operator's `/goal` (which wins).
- **Scan the ledger backlog (inbound loop)** — run `bun scripts/ledger-backlog.ts` and bundle **3–5 coherent
  open items** into the Petey plan on one axis (domain hub / risk class / deploy unit). The operator `/goal` +
  prior `Next session` block take **precedence** (opening.md step 1b).
- **Check FAILED_STEPS + Drift Register** for `open`/`mitigated` entries in today's lane; acknowledge before proceeding.
- **Graphify-first** for cross-area lanes — `graphify stats` then `graphify query "<lane nouns>"` before any
  repo-wide `grep`/`rg`/`find`. Skip only for small single-file tasks.
- **Number tasks in the SESSION file's `## Task log`** with stable IDs (`SESSION_NNNN_TASK_01`, …). The
  cross-session `project-log.md` is **retired (SESSION_0228)** — the SESSION file is canonical; do not write to it.
- **Create the new SESSION file** from the template — `cp docs/sprints/_template/SESSION_TEMPLATE.md
  docs/sprints/SESSION_NNNN.md` — never from scratch. Set frontmatter `status: in-progress`.
- **Branch check** — `git branch --show-current` / `git status --short`; raise any prior-session carryover before new work.

## Cross-references

- [Opening ritual (source of truth)](../../docs/rituals/opening.md) · [Closing ritual](../../docs/rituals/closing.md)
- [Loop of Loops — ledger-driven sessions](../../docs/protocols/loop-of-loops-ledger-driven-sessions.md) (the `scripts/ledger-backlog.ts` aggregator)
- [WORKFLOW 5.0](../../docs/protocols/WORKFLOW_5.0.md) · [Graphify Repo Memory](../../docs/runbooks/dev-environment/graphify-repo-memory.md) · [Petey Plan](../../docs/protocols/petey-plan.md) · [Cody Pre-flight](../../docs/protocols/cody-preflight.md)
