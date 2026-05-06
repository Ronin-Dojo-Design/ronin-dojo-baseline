---
title: Component Porting SOP
slug: component-porting-sop
type: file
status: active
created: 2026-05-06
updated: 2026-05-06
author: Brian + ChatGPT
last_agent: chatgpt-hostile-review-pack
pairs_with:
  - docs/runbooks/react-to-next-component-porting-runbook.md
  - docs/knowledge/wiki/dirstarter-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - architecture
  - component-porting
  - legacy-conversion
---

# Component Porting SOP

## Summary

Architecture-level SOP for the upcoming old-monorepo React component conversion lane.

## Status

Active draft. Should be reviewed against the first real port.

## Intent

Keep component conversion fast, repeatable, and Dirstarter-compliant.

## Architecture

```text
old monorepo component
  |
  v
discovery + graph map
  |
  v
classification
  |
  +--> replace with Dirstarter primitive
  +--> wrap existing Ronin component
  +--> rewrite into Next pattern
  +--> port as domain component
  +--> archive
  |
  v
proof + wiki update
```

## Key contracts

### 1. Dirstarter first

The baseline repo already has an L1 component inventory. Any port that bypasses existing primitives without justification is a process failure.

### 2. Server/client boundary first

Before UI work, decide whether the component needs:

- server component
- client component
- server action
- query module
- schema module

### 3. One mapping record per port

No mapping record, no port.

### 4. Graph before grep

Use wiki/index/inventory/graph report first. Raw grep is fallback, not default.

### 5. Proof closes the port

A component is not ported until it is rendered and behavior has been checked.

## Risk register

| Risk | Impact | Control |
| --- | --- | --- |
| Raw grep token burn | slow, expensive agents | Graphify report + wiki map |
| Dirstarter primitive bypass | duplicate UI | mandatory inventory check |
| Client/server boundary confusion | broken Next behavior | boundary decision before code |
| Old props copied blindly | bad architecture | classify + rewrite as needed |
| No proof | false confidence | hostile review + smoke proof |

## First recommended slice

Pick one low-risk, high-value old component:

- simple display card
- no payment/auth mutation
- clear Dirstarter primitive fit
- obvious target route

Run the full pipeline once and update this SOP with real results.

**Planned Passion Produces Purpose.**
**OSSS.**
