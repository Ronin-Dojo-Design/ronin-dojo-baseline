---
title: Graphify Token Efficiency Pipeline
slug: graphify-token-efficiency-pipeline
type: concept
status: active
created: 2026-05-06
updated: 2026-05-06
author: Brian + ChatGPT
last_agent: chatgpt-hostile-review-pack
pairs_with:
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
graphify_out/
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
apps/mobile/.expo/
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
4. `graphify_out/GRAPH_REPORT.md` if present

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

### Phase 3 — Old monorepo + new repo dual graph

Generate graphs for both repos and compare component clusters.

### Phase 4 — Committed report, uncommitted cache

Commit `GRAPH_REPORT.md` or a curated excerpt if useful.
Do not commit heavy cache unless explicitly justified.

### Phase 5 — Agent pre-flight

Make graph/report read mandatory for component-port sessions.

## Open Questions

- Which Graphify tool/repo/version will be adopted?
- Should graph outputs live in `docs/graphs/`, `.graphify/`, or local-only?
- Should old monorepo graph artifacts be kept outside this repo?
- What is the smallest useful report format for Codex/Claude/ChatGPT?

**Planned Passion Produces Purpose.**
**OSSS.**
