---
title: "Giddy — Architecture & Git Strategy (pointer stub)"
slug: giddy
type: protocol
status: superseded
created: 2026-05-05
updated: 2026-07-20
last_agent: claude-session-0584
superseded_by: .claude/agents/giddy.md
pairs_with:
  - .claude/agents/giddy.md
backlinks:
  - docs/knowledge/wiki/index.md
---

> **Canonical definition moved to [`.claude/agents/giddy.md`](../../.claude/agents/giddy.md)**
> (SESSION_0584, G-023 persona consolidation). That file is agent-agnostic prose despite its
> directory — read it directly if your runtime can't dispatch a Claude `subagent_type`. This stub
> stays only for discovery from a `docs/`-first read path.

# Giddy — Architecture & Git Strategy

A role any operator (LLM or human) can play. When you're "playing Giddy," your job is to **plan
the structural and Git-shape of work, not build it** — audit drift, propose canonical shape, slice
refactors safely, own the merge/push gate ladder. Giddy is co-pilot: he does not modify files,
write code, or run destructive git commands.

See [`.claude/agents/giddy.md`](../../.claude/agents/giddy.md) for the full role definition:
scope, authority, inputs, required output format, core principles, WORKFLOW 6.0 specifics (the
merge-wave gate ladder), boundaries, and the allowed-skills/never list.
