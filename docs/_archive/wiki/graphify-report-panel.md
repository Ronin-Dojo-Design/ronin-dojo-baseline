---
title: Graphify Report Panel
slug: graphify-report-panel
type: concept
status: active
created: 2026-05-06
updated: 2026-05-06
last_agent: codex-session-0085
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/component-porting/graphify-component-port-map.md
tags:
  - graphify
  - component-porting
  - repo-memory
---

┌──────────────────────────────────────────────────────────────┐
│ GRAPHIFY / OPEN BRAIN REPO MEMORY                            │
├──────────────────────────────────────────────────────────────┤
│ graphify_out/                                                │
│   ├─ graph.html          interactive graph                    │
│   ├─ GRAPH_REPORT.md     agent-readable repo map              │
│   ├─ graph.json          machine graph                        │
│   └─ cache/              local cache                          │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐ ┌──────────────────────────────┐
│ Hot Component Clusters       │ │ Likely Port Targets          │
├─────────────────────────────┤ ├──────────────────────────────┤
│ directory/*                 │ │ ToolListing pattern           │
│ organizations/*             │ │ Card / Stack / Badge          │
│ tournaments/*               │ │ DataTable                     │
│ techniques/*                │ │ Form / safe-actions           │
└─────────────────────────────┘ └──────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Agent Rule                                                    │
├──────────────────────────────────────────────────────────────┤
│ Read graph report first.                                     │
│ Open only targeted files.                                    │
│ Save new discoveries back into the wiki.                     │
└──────────────────────────────────────────────────────────────┘
