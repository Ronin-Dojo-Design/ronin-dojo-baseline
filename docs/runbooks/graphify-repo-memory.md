---
title: Graphify Repo Memory Runbook
slug: graphify-repo-memory
type: runbook
status: active
created: 2026-05-06
updated: 2026-05-06
author: Brian + Codex
last_agent: codex-graphify-runbook
pairs_with:
  - docs/knowledge/wiki/content-engine/graphify-token-efficiency-pipeline.md
  - docs/knowledge/wiki/component-porting/graphify-component-port-map.md
  - docs/rituals/opening.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - graphify
  - repo-memory
  - token-efficiency
  - opening-ritual
---

# Graphify Repo Memory Runbook

## Summary

Use Graphify as a local repo map before large search-heavy work. The graph is navigation aid, not proof. It helps decide which files to open, then normal code/doc review still verifies the answer.

## When to use

Use this when the session is likely to cross multiple repo areas:

- legacy React component porting
- Dirstarter upstream update analysis
- auth, payment, entitlement, security, or brand-scope review
- hostile repo review
- old monorepo vs new repo mapping
- unfamiliar feature area where raw grep would produce too many files
- a task where the agent says it needs to "search everything"

Do not use it for tiny, obvious, single-file work.

## Inputs

- `.graphifyignore`
- `graphify-out/GRAPH_REPORT.md` if present
- `graphify-out/graph.json` if present
- active wiki/index docs for the lane

## Basic commands

Prefer the local CLI if available:

```bash
graphify update .
graphify query "brand context admin authorization tournament registration" --budget 2000
graphify benchmark graphify-out/graph.json
open graphify-out/graph.html
```

Current local trial venv command shape:

```bash
/tmp/graphify-venv/bin/graphify update .
/tmp/graphify-venv/bin/graphify query "component porting Dirstarter inventory" --budget 2000
```

## Runbook

### 1. Decide whether Graphify is worth it

Ask:

- Is this task cross-domain?
- Will raw grep likely return too much?
- Does the task involve porting, security, payments, auth, or Dirstarter upgrades?

If no, skip Graphify and work normally.

### 2. Check freshness

Open `graphify-out/GRAPH_REPORT.md` if it exists and compare its commit line to current `HEAD`.

```bash
git rev-parse --short HEAD
rg -n "Built from commit" graphify-out/GRAPH_REPORT.md
```

If stale and the task depends on current code, refresh:

```bash
graphify update .
```

If Graphify is not installed, do not block the session. Use the wiki index and normal file search.

### 3. Read the high-signal report sections

Read:

- Summary
- God Nodes
- Surprising Connections
- Knowledge Gaps
- Suggested Questions

Ignore noisy community lists unless they point to a relevant file group.

### 4. Ask one or two targeted graph queries

Use noun phrases, not long prompts.

Examples:

```bash
graphify query "auth brand context admin authorization" --budget 2000
graphify query "Stripe checkout entitlement payment webhook" --budget 2000
graphify query "Dirstarter component inventory component porting" --budget 2000
graphify path "Registration" "Entitlement"
graphify explain "getRequestBrand"
```

### 5. Open the files Graphify identifies

Treat graph output as a file-selection tool. Verify by reading the actual files before making claims or edits.

Minimum verification:

- open the files named by the graph
- confirm imports/calls/relations in source
- check relevant docs or ADRs
- record any useful discovery back into a wiki page or session file

### 6. Record use in the session

If Graphify affected file selection, add a short line to the SESSION file:

```md
### Graphify check

- Graph status: current | stale | skipped
- Query used:
- Files selected from graph:
- Verification note:
```

## Opening ritual use case

Add Graphify to bow-in only as an optional lane check.

Use case:

> During bow-in, the agent sees the session is about Dirstarter update strategy, component porting, or payment/security review. Instead of grepping the whole repo, it checks whether `graphify-out/GRAPH_REPORT.md` is current, runs one targeted query, and opens only the files the graph points to.

This belongs in `opening.md` as an optional step after reading lane docs, not as a mandatory step for every session.

## Guardrails

- Do not install assistant hooks by default.
- Do not commit `graphify-out/` unless the team explicitly decides to version graph output.
- Do not treat inferred edges as truth.
- Do not let Graphify replace `docs/knowledge/wiki/index.md`.
- Do not run deep LLM extraction over private/raw corpora without explicitly choosing the backend and understanding API exposure.

## Closeout

If Graphify helped, update one of:

- current SESSION file
- component port map
- Graphify token efficiency pipeline
- relevant architecture/wiki page

**Planned Passion Produces Purpose.**
**OSSS.**
