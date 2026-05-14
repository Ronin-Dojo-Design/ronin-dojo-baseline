---
title: Graphify Repo Memory Runbook
slug: graphify-repo-memory
type: runbook
status: active
created: 2026-05-06
updated: 2026-05-14
author: Brian + Codex
last_agent: codex-session-0166
pairs_with:
  - docs/knowledge/wiki/content-engine/graphify-token-efficiency-pipeline.md
  - docs/knowledge/wiki/component-porting/graphify-component-port-map.md
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/runbooks/mcp-usage-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0158.md
  - docs/sprints/SESSION_0159.md
  - docs/sprints/SESSION_0160.md
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/runbooks/mcp-usage-runbook.md
tags:
  - graphify
  - repo-memory
  - token-efficiency
  - opening-ritual
---

# Graphify Repo Memory Runbook

## Summary

Use Graphify as the first local repo map before large search-heavy work. The graph is navigation aid, not proof. It helps decide which files to open, then exact source/doc review still verifies the answer.

## When to use

Use this when the session is likely to cross multiple repo areas:

- legacy React component porting
- Dirstarter upstream update analysis
- auth, payment, entitlement, security, or brand-scope review
- hostile repo review
- old monorepo vs new repo mapping
- unfamiliar feature area where repo-wide text search would produce too many files
- a task where the agent says it needs to "search everything"

Do not use it for tiny, obvious, single-file work.

## Inputs

- `.graphifyignore`
- `.graphify/graph_report.md` — main report (current tooling)
- `.graphify/graph.json` — graph data (current tooling)
- `graphify-out/GRAPH_REPORT.md` — legacy output (if present)
- active wiki/index docs for the lane

## Installation

Graphify is `@nodesify/graphify` on npm. The bin is named `nodesify-graphify`, so we symlink it:

```bash
sudo npm install -g @nodesify/graphify
sudo ln -sf /usr/local/lib/node_modules/@nodesify/graphify/dist/index.js /usr/local/bin/graphify
graphify --version  # should print 0.2.1+
```

## Basic commands

```bash
graphify run .                          # Full rebuild from scratch
graphify update .                       # Incremental AST-only rebuild (fast, no API cost)
graphify query "brand context admin" --budget 2000  # BFS/DFS graph traversal
graphify path "Registration" "Entitlement"          # Shortest path between nodes
graphify explain "getRequestBrand"                  # Explain a node + connections
graphify stats                          # Show graph statistics
graphify watch .                        # Auto-rebuild on file changes (long-running)
graphify export --format html           # Export to HTML (also: json, graphml)
```

Use `GRAPHIFY_VIZ_NODE_LIMIT=6000` env var if the graph exceeds the default 5000-node HTML viz limit.

## Runbook

### 1. Decide whether Graphify is worth it

Ask:

- Is this task cross-domain?
- Will raw grep likely return too much?
- Does the task involve porting, security, payments, auth, or Dirstarter upgrades?

If no, skip Graphify and work normally.

### 2. Check freshness

Check graph stats and compare the report header to current `HEAD` if the report records a commit.

```bash
graphify stats
git rev-parse --short HEAD
sed -n '1,40p' .graphify/graph_report.md
```

If stale and the task depends on current code, refresh:

```bash
graphify update .
```

If the graph exceeds the default HTML viz node limit (5000), set the env var:

```bash
GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .
```

If Graphify is not installed, do not block the session. Use the wiki index, direct directory listings, and exact-file reads. Reserve repo-wide text search as the fallback after graph/wiki paths fail.

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

- open the exact files named by the graph
- confirm imports/calls/relations in source
- check relevant docs or ADRs
- record any useful discovery back into a wiki page or session file

For confirmation inside a known file, use a direct exact-file check such as editor find, a bounded `sed` read, or a single-file `awk` counter. Do not go back to repo-wide text search for task planning after Graphify has narrowed the file set.

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

> During bow-in, the agent sees the session is about Dirstarter update strategy, component porting, or payment/security review. Instead of running repo-wide text search, it checks graph freshness, runs one targeted query, and opens only the files the graph points to.

This belongs in `opening.md` as an optional step after reading lane docs, not as a mandatory step for every session.

> **Note:** The current tooling (`@nodesify/graphify` v0.2.1) outputs to `.graphify/`. The legacy `graphify-out/` directory was generated by an earlier tool and can be kept for reference or deleted.

## Guardrails

- Do not install assistant hooks by default.
- Do not commit `.graphify/` or `graphify-out/` unless the team explicitly decides to version graph output.
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
