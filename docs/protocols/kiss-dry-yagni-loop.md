---
title: "KISS / DRY / YAGNI Loop (superseded)"
slug: kiss-dry-yagni-loop
type: protocol
status: superseded
created: 2026-06-20
updated: 2026-06-29
last_agent: claude-session-0468
pairs_with:
  - docs/protocols/code-quality-matrix.md
  - docs/protocols/three-pass-loop.md
  - .claude/skills/fallow-fix-loop/SKILL.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - quality-gate
  - refactor
  - superseded
---

# KISS / DRY / YAGNI Loop (superseded — SESSION_0468)

> **Retired at SESSION_0468 (S48 hostile-repo-review, HRR-002).** This standalone loop re-described a
> workflow that three **wired** surfaces now own. It was promoted from the monorepo (SESSION_0423) before
> those skills existed; keeping it as a third copy was the redundancy the review hunts. The idea is fully
> preserved — only the duplicate doc is gone.

## Where it went

| What this loop did | Canonical home now |
| --- | --- |
| The KISS/DRY/YAGNI **scored verdict** | [`code-quality-matrix`](code-quality-matrix.md) **D3 — Simplicity (KISS/DRY/YAGNI)** |
| "Measure deltas with `fallow`, don't assert them" (before/after CRAP, dupes, dead code) | the [`/fallow-fix-loop`](../../.claude/skills/fallow-fix-loop/SKILL.md) skill |
| Apply the simplification fixes | the [`/simplify`](../../.claude/skills/code-quality/SKILL.md) + `/code-quality` skills |
| The score→fix→review structure it ran on | [`three-pass-loop`](three-pass-loop.md) (the engine — still active) |

## Rubric (preserved for reference)

The original 10-point breakdown, kept so nothing is lost — but score **D3** in the
[`code-quality-matrix`](code-quality-matrix.md) instead:

- **KISS** (`0–3`) — the smallest design that works; minimal complexity.
- **DRY** (`0–3`) — shared logic reused (existing component / L1 primitive / helper), not re-implemented.
- **YAGNI** (`0–3`) — no scope beyond the acceptance criteria; no speculative options/flags/abstractions.
- **Evidence** (`0–1`) — every finding maps to a concrete file, command, or measured `fallow` delta.
