---
title: Graphify Component Port Map
slug: graphify-component-port-map
type: concept
status: active
created: 2026-05-06
updated: 2026-05-06
author: Brian + ChatGPT
last_agent: chatgpt-hostile-review-pack
pairs_with:
  - docs/runbooks/react-to-next-component-porting-runbook.md
  - docs/knowledge/wiki/content-engine/graphify-token-efficiency-pipeline.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - graphify
  - component-map
  - porting
---

# Graphify Component Port Map

## Summary

This page is the persistent component-port map. It exists so agents do not rediscover component relationships from scratch every session.

## Status

Active concept page. Initially manual/wiki-driven; can later be generated or refreshed by Graphify-like tooling.

## Key Idea

A porting lane needs a graph, not a grep storm.

The graph should connect:

```text
legacy component
  -> old imports
  -> old props
  -> old data assumptions
  -> current Dirstarter/Ronin equivalent
  -> target route
  -> proof artifact
```

## Structure

### Node types

- legacy_component
- baseline_component
- dirstarter_primitive
- domain_component
- route
- server_query
- server_action
- schema
- proof
- decision

### Edge types

- replaces
- wraps
- depends_on
- renders_in
- fetches_from
- submits_to
- blocked_by
- proven_by
- deprecated_by

## Mapping record template

```md
## PORTMAP-0001 — <component name>

**Status:** inbox | mapped | porting | proven | blocked | archive
**Legacy path:**
**Legacy purpose:**
**Target path:**
**Target route/page:**
**Dirstarter primitive fit:**
**Existing Ronin component fit:**
**Port strategy:** replace | wrap | rewrite | port | archive
**Server/client boundary:**
**Data dependency:**
**Proof required:**
**Notes:**

### Edges
- legacy_component -> replaces -> baseline_component
- target_component -> renders_in -> route
- target_component -> depends_on -> query/action/schema
```

## Relationships

- Use with `react-to-next-component-porting-runbook.md`
- Use after checking `dirstarter-component-inventory.md`
- Use during hostile repo review when token burn is suspected

## Sources

- current repo wiki/index pattern
- Dirstarter component inventory
- LLM Wiki / persistent graph doctrine
- user observation that Claude burns tokens grepping raw files

## Open Questions

- Should Graphify output become a committed artifact under `docs/graphs/`?
- Should the graph be generated from both old monorepo and new repo, or only from the new repo first?
- Should mapping records eventually become JSON/YAML for machine use?

**Planned Passion Produces Purpose.**
**OSSS.**
