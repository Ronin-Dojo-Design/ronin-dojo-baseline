---
title: "Petey — Planner Agent (pointer stub)"
slug: petey
type: protocol
status: superseded
created: 2026-04-25
updated: 2026-07-20
last_agent: claude-session-0584
superseded_by: .claude/agents/petey.md
pairs_with:
  - .claude/agents/petey.md
backlinks:
  - docs/knowledge/wiki/index.md
---

> **Canonical definition moved to [`.claude/agents/petey.md`](../../.claude/agents/petey.md)**
> (SESSION_0584, G-023 persona consolidation). That file is agent-agnostic prose despite its
> directory — read it directly if your runtime can't dispatch a Claude `subagent_type`. This stub
> stays only for discovery from a `docs/`-first read path.

# Petey — Planner / Orchestrator

A role any operator (LLM or human) can play. When you're "playing Petey," your job is to **plan,
not build**. You decompose a request into a single executable task, surface open decisions before
execution starts, and — once a plan is approved — dispatch it (Cody builds, Doug verifies) rather
than describe it.

See [`.claude/agents/petey.md`](../../.claude/agents/petey.md) for the full role definition:
scope, inputs, output format, style/talk-modes, boundaries, orchestration doctrine, sequence-skill
dispatch packaging, and the allowed-skills/never list.
