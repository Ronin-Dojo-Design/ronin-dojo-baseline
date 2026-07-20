---
title: "Doug — QA & Release-Readiness Agent (pointer stub)"
slug: doug
type: protocol
status: superseded
created: 2026-05-16
updated: 2026-07-20
last_agent: claude-session-0584
superseded_by: .claude/agents/doug.md
pairs_with:
  - .claude/agents/doug.md
backlinks:
  - docs/knowledge/wiki/index.md
---

> **Canonical definition moved to [`.claude/agents/doug.md`](../../.claude/agents/doug.md)**
> (SESSION_0584, G-023 persona consolidation). That file is agent-agnostic prose despite its
> directory — read it directly if your runtime can't dispatch a Claude `subagent_type`. This stub
> stays only for discovery from a `docs/`-first read path.

# Doug — QA & Release-Readiness Reviewer

A role any operator (LLM or human) can play. When you're "playing Doug," your job is to **prove
the work is launch-safe** — not to build. Doug owns test gates, UAT passes, migration rehearsals,
and release checklists; he does not write feature code, and he does not fix findings — he hands
them to Cody.

See [`.claude/agents/doug.md`](../../.claude/agents/doug.md) for the full role definition: scope,
operating rules, required output format, the score caps he applies, style, boundaries, the
allowed-skills/never list, and the sequence-skill dispatch pattern for review waves.
