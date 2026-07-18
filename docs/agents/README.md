---
title: Agents README
slug: agents-readme
type: protocol
status: active
created: 2026-04-25
updated: 2026-07-18
last_agent: codex-session-0570
backlinks:
  - docs/knowledge/wiki/index.md
---

# BaselineDashboard

The operating framework for working on this project across sessions and across operators (LLM or human). It captures *how* we work, separately from *what* we're building.

This is a fresh start that draws on the operational lessons from the legacy `RoninDashboard/` system in the prior monorepo, but is leaner and **model-agnostic** — it works whether the operator is Claude, Codex, Copilot, ChatGPT, Cursor, or you opening a text editor and writing the code yourself.

## Operating principles

1. **One task per session.** If a session has more than one task, split it into multiple sessions. The handoff between sessions catches drift early.
2. **Single source of state.** The latest `docs/sprints/SESSION_NNNN.md` is the canonical "where are we" file. No parallel `CHAT_HANDOFF.md` or `NEXT_SESSION_PROMPT.md` files — the SESSION file is the handoff.
3. **Model-agnostic.** No tool-specific commands, no LLM-specific features. If a procedure can't be followed by a different LLM or by a human, rewrite it.
4. **Philosophy lives outside the repo.** Personal/cultural/philosophical content (Sensei Brian's preferences, the Ronin creed, blend-of-influences notes) belongs in operator-side memory or persistent context — *not* in this repo. The repo stays focused on the product and the work.
5. **Lean by default.** When in doubt, leave it out. We can always add a protocol later when the work justifies it. Bringing forward bloat from the prior project would betray the rebuild.

## Components

| Component | Where | Purpose |
|---|---|---|
| Agents (personas) | [agents/](.) | Reusable role definitions any operator can play |
| Protocols | [../protocols/](../protocols/) | Procedures that span multiple sessions or roles |
| Rituals | [../rituals/](../rituals/) | Per-session opening/closing checklists |
| Sprints | [../sprints/](../sprints/) | Numbered SESSION files; the operational log |

## Active personas (WORKFLOW 5.0)

All six personas are now active per WORKFLOW_5.0.md:

| Persona | Role | Key outputs |
|---|---|---|
| [Petey](petey.md) | Orchestrator | Session scope, lane selection, score gate |
| [Cody](cody.md) | Implementation + code review | Code quality gate, pre-flight protocol |
| Giddy | Architecture + Git strategy | Worktree boundaries, branch strategy, Dirstarter compliance |
| Doug | QA + release readiness | Failure modes, test gates, migration rehearsal |
| Desi | UX + design consistency | Screen→backend contract verification |
| [Brandon](brandon.md) | Brand + marketing rollout | Brand truth, mission/motto, message hierarchy, voice, rollout + PRD/STORIES deltas |

> All six personas have canonical prose definitions under `docs/agents/`. Claude dispatch adapters live
> in `.claude/agents/*.md`; Brandon also exposes the model-agnostic `.agents/skills/brandon/SKILL.md` adapter
> so Codex and other skill-aware runtimes consume the same role rather than a forked prompt.

## Active rituals + protocols

| File | Purpose |
|---|---|
| [../rituals/opening.md](../rituals/opening.md) | Bow-in checklist before any work in a session |
| [../rituals/closing.md](../rituals/closing.md) | Bow-out checklist before ending a session |
| [../protocols/chat-handoff.md](../protocols/chat-handoff.md) | How sessions hand off context to each other |

## How to start a session

The short version:
1. Run the [opening ritual](../rituals/opening.md).
2. Decide the one task for this session.
3. If the task is plan-heavy: act as Petey first, then hand off to Cody (or yourself) for execution.
4. Do the work.
5. Run the [closing ritual](../rituals/closing.md).

## Project context (read once, recall on demand)

These docs describe *what* we're building. The Dashboard above describes *how*.

- [../architecture/program-plan.md](../architecture/program-plan.md) — 12-sprint MVP plan, layer model, brand sequencing
- [../architecture/plan-vs-current.md](../architecture/plan-vs-current.md) — ChatGPT plan's behavioral spec vs. current schema
- [../architecture/source/chatgpt-original-plan.md](../architecture/source/chatgpt-original-plan.md) — full GPT plan (sections 1–7 are the spec)
- [../architecture/decisions/](../architecture/decisions/) — ADRs 0001–0041
