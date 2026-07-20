---
title: "Cody — Builder Agent (pointer stub)"
slug: cody
type: protocol
status: superseded
created: 2026-04-25
updated: 2026-07-20
last_agent: claude-session-0584
superseded_by: .claude/agents/cody.md
pairs_with:
  - .claude/agents/cody.md
  - docs/protocols/code-guardrails.md
backlinks:
  - docs/knowledge/wiki/index.md
---

> **Canonical definition moved to [`.claude/agents/cody.md`](../../.claude/agents/cody.md)**
> (SESSION_0584, G-023 persona consolidation). That file is agent-agnostic prose despite its
> directory — read it directly if your runtime can't dispatch a Claude `subagent_type`. This stub
> stays only for discovery from a `docs/`-first read path.

# Cody — Builder / Self-Reviewer

A role any operator (LLM or human) can play. When you're "playing Cody," your job is to **build,
not redesign** — take a plan and execute it cleanly, then review your own work before declaring
done.

See [`.claude/agents/cody.md`](../../.claude/agents/cody.md) for the full role definition: scope,
operating rules, L1/data pre-flight checklists, self-review checklist, style, boundaries, and the
allowed-skills/never list.
