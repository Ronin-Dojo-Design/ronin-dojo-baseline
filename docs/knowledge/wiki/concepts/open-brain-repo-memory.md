---
title: Open Brain Repo Memory
slug: open-brain-repo-memory
type: concept
status: active
created: 2026-04-27
updated: 2026-04-27
health: 8
source_pages:
  - docs/sprints/SESSION_0017.md
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/log.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Open Brain Repo Memory

## Doctrine

This repo operates as a **compounding knowledge base**, not a stateless codebase. Every session should make the repo smarter, not just bigger.

Inspired by the Karpathy/Open Brain pattern: raw docs stay immutable, wiki pages are agent-maintained synthesis, and protocol files govern how agents maintain them.

## Three brains

The project has three knowledge layers that must stay synchronized:

| Brain | What it knows | Source of truth |
| --- | --- | --- |
| **Dirstarter (L1)** | Proven SaaS boilerplate patterns — file org, HOC chains, action client, payloads, caching, auth wiring | `dirstarter_template/` local copy + upstream repo |
| **Ronin product** | Domain spec — Passport, Shells, Directory, Organizations, Courses, Tournaments, mobile, brand system | `docs/architecture/` design docs, ADRs, schema |
| **Wiki memory** | Compounded decisions, drift tracking, session history, pattern pages | `docs/knowledge/wiki/` |

## Information lifecycle

```
Raw source (session, ADR, code, external doc)
  → Ingested into wiki (file page, concept page, log entry)
  → Indexed in wiki/index.md
  → Cross-referenced via backlinks + source_pages frontmatter
  → Drift detected via drift-register.md
  → Resolved in future sessions
```

## Rules

1. **Raw sources are immutable.** SESSION files, ADRs, and external docs don't get rewritten. Wiki pages synthesize them.
2. **Wiki pages declare provenance.** Every wiki page uses `source_pages` and/or `derived_from` in frontmatter.
3. **The log is append-only.** `wiki/log.md` gets an entry every session. It must never fall behind.
4. **The index is the master registry.** If a doc exists but isn't in `wiki/index.md`, it's invisible to future agents.
5. **Drift is tracked, not ignored.** When two sources contradict, record it in `drift-register.md` — don't silently pick one.
6. **Sessions update memory.** Every session close must update: log, index (if new docs), and drift register (if contradictions found).

## What belongs where

| Artifact | Location | Updated by |
| --- | --- | --- |
| Session-specific work log | `docs/sprints/SESSION_NNNN.md` | During session |
| Chronological change record | `docs/knowledge/wiki/log.md` | Session close |
| Master doc registry | `docs/knowledge/wiki/index.md` | When new docs created |
| Contradictions / stale claims | `docs/knowledge/wiki/drift-register.md` | When detected |
| Pattern reference pages | `docs/knowledge/wiki/files/` | When patterns studied |
| Concept explanations | `docs/knowledge/wiki/concepts/` | When concepts crystallize |
| Architectural decisions | `docs/architecture/decisions/` | When decisions made |
