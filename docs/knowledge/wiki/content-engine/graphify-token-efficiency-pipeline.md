---
title: Graphify Token Efficiency Pipeline
slug: graphify-token-efficiency-pipeline
type: concept
status: active
created: 2026-05-06
updated: 2026-05-06
author: Brian + ChatGPT
last_agent: codex-graphify-trial
pairs_with:
  - docs/runbooks/graphify-repo-memory.md
  - docs/knowledge/wiki/component-porting/graphify-component-port-map.md
  - docs/knowledge/wiki/index.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - graphify
  - token-efficiency
  - llm-wiki
  - content-engine
---

# Graphify Token Efficiency Pipeline

## Summary

This page defines how Graphify-style graph artifacts can reduce token burn and repeated file discovery for agents working in the baseline repo.

## Status

Active concept page. Tool adoption should begin as optional local augmentation, not mandatory launch infrastructure.

## Key Idea

Agents should query compiled repo memory before they grep raw source.

A good graph/report/cache layer should answer:

- what components exist
- what imports what
- what pages render which components
- what server actions/queries connect to which UI
- what Dirstarter primitive replaces a custom component
- what files are likely relevant for a port

## Structure

### Proposed local artifacts

```text
.graphifyignore
graphify-out/
  graph.html
  GRAPH_REPORT.md
  graph.json
  cache/
```

### Recommended ignore file

```text
node_modules/
.next/
dist/
build/
coverage/
.git/
apps/web/.next/
apps/web/.content-collections/
apps/web/.generated/
apps/web/public/content/
apps/web/bun.lock
apps/web/prisma/migrations/
apps/mobile/.expo/
docs/sprints/
docs/architecture/source/
docs/_archive/
```

### Pipeline

```text
repo snapshot
  |
  v
Graphify scan
  |
  +--> graph.json
  +--> GRAPH_REPORT.md
  +--> graph.html
  |
  v
LLM reads report first
  |
  v
LLM opens only targeted files
  |
  v
new discoveries saved into wiki pages
```

## Agent usage rule

Before component porting, the agent should read:

1. `docs/knowledge/wiki/index.md`
2. `docs/knowledge/wiki/dirstarter-component-inventory.md`
3. `docs/knowledge/wiki/component-porting/graphify-component-port-map.md`
4. `graphify-out/GRAPH_REPORT.md` if present

Only then should it open raw source files.

## What this fixes

- repeated grep storms
- token waste
- duplicate component creation
- missed existing primitives
- weak port planning
- unlogged discoveries

## Adoption phases

### Phase 1 — Manual graph doctrine

Use this page and the component port map manually.

### Phase 2 — Local Graphify trial

Run Graphify locally on the new repo only.

Trial result, 2026-05-06:

- Runtime: Python 3.14 venv under `/tmp/graphify-venv`
- Package: `graphifyy==0.7.8`
- Command: `/tmp/graphify-venv/bin/graphify update .`
- Mode: AST/code update path, no LLM API key, no assistant hooks
- Output: `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `graphify-out/graph.html`, local cache
- Scoped result after excluding sessions/source archives: 861 files, 4,715 nodes, 8,477 edges, 378 communities
- Benchmark: ~314,333 naive corpus tokens vs ~2,174 average graph-query tokens, about 144.6x reduction

Important finding:

- `graphify extract` needs an LLM API key, even for a small slice.
- `graphify update .` can bootstrap an AST/code graph without an API key.
- Markdown headings are extracted in this mode, but deep semantic docs/wiki extraction should be treated as a later opt-in run with an explicit backend.
- Default graph should exclude session history and raw source archives; the first broad run produced thousands of weakly connected historical nodes.

Useful local commands:

```bash
/tmp/graphify-venv/bin/graphify update .
/tmp/graphify-venv/bin/graphify query "brand context admin authorization tournament registration" --budget 2000
/tmp/graphify-venv/bin/graphify benchmark graphify-out/graph.json
open graphify-out/graph.html
```

### Command reference

Slash commands are the AI-assistant skill form. Local terminal usage generally calls the `graphify` CLI directly. Check `graphify --help` after upgrades because command flags may vary by installed version.

```bash
/graphify                          # run on current directory
/graphify ./raw                    # run on a specific folder
/graphify ./raw --mode deep        # more aggressive relationship extraction
/graphify ./raw --update           # re-extract only changed files
/graphify ./raw --directed         # preserve edge direction
/graphify ./raw --cluster-only     # rerun clustering on existing graph
/graphify ./raw --no-viz           # skip HTML visualization
/graphify ./raw --obsidian         # generate Obsidian vault
/graphify ./raw --wiki             # build agent-crawlable markdown wiki
/graphify ./raw --svg              # export graph.svg
/graphify ./raw --graphml          # export for Gephi / yEd
/graphify ./raw --neo4j            # generate cypher.txt for Neo4j
/graphify ./raw --neo4j-push bolt://localhost:7687
/graphify ./raw --watch            # auto-sync as files change
/graphify ./raw --mcp              # start MCP stdio server

/graphify add https://arxiv.org/abs/1706.03762
/graphify add <video-url>
/graphify add https://... --author "Name" --contributor "Name"

/graphify query "what connects attention to the optimizer?"
/graphify query "..." --dfs --budget 1500
/graphify path "DigestAuth" "Response"
/graphify explain "SwinTransformer"

graphify hook install              # post-commit + post-checkout hooks
graphify hook uninstall
graphify hook status

graphify claude install / uninstall
graphify codex install / uninstall
graphify opencode install
graphify cursor install / uninstall
graphify gemini install / uninstall
graphify copilot install / uninstall
graphify aider install / uninstall
graphify claw install / uninstall
graphify droid install / uninstall
graphify trae install / uninstall
graphify trae-cn install / uninstall
graphify hermes install / uninstall
graphify kiro install / uninstall
graphify antigravity install / uninstall

graphify extract ./docs                        # headless LLM extraction for CI (no IDE needed)
graphify extract ./docs --backend gemini       # explicit backend: gemini, kimi, claude, openai, or ollama
graphify extract ./docs --backend gemini --model gemini-3.1-pro-preview
graphify extract ./docs --backend ollama       # local Ollama (set OLLAMA_BASE_URL / OLLAMA_MODEL)
graphify extract ./docs --no-cluster           # raw extraction only, skip clustering
graphify extract ./docs --dedup-llm            # LLM tiebreaker for ambiguous entity pairs (uses same API key)
graphify extract ./docs --global --as myrepo   # extract and register into the cross-project global graph
GRAPHIFY_MAX_OUTPUT_TOKENS=32768 graphify extract ./docs --backend claude  # raise output cap for dense corpora

graphify global add graphify-out/graph.json myrepo   # register a project graph into ~/.graphify/global.json
graphify global remove myrepo                         # remove a project from the global graph
graphify global list                                  # show all registered repos + node/edge counts
graphify global path                                  # print path to the global graph file

graphify clone https://github.com/karpathy/nanoGPT
graphify merge-graphs a.json b.json --out merged.json
graphify watch ./src
graphify check-update ./src
graphify update ./src
graphify cluster-only ./my-project
graphify cluster-only ./my-project --graph path/to/graph.json  # custom graph location
```

### Phase 3 — Old monorepo + new repo dual graph

Generate graphs for both repos and compare component clusters.

### Phase 4 — Committed report, uncommitted cache

Commit `GRAPH_REPORT.md` or a curated excerpt if useful.
Do not commit heavy cache unless explicitly justified.

### Phase 5 — Agent pre-flight

Make graph/report read mandatory for component-port sessions.

## Open Questions

- Which Graphify tool/repo/version will be adopted?
- Should graph outputs stay local-only, or should a curated `GRAPH_REPORT.md` excerpt be committed?
- Should old monorepo graph artifacts be kept outside this repo?
- What is the smallest useful report format for Codex/Claude/ChatGPT?

**Planned Passion Produces Purpose.**
**OSSS.**
