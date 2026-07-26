---
title: "Second-Brain Levels — where this repo's knowledge system sits"
slug: second-brain-levels
type: reference
status: active
created: 2026-06-21
updated: 2026-06-21
last_agent: claude-session-0421
pairs_with:
  - docs/knowledge/wiki/ronin-project-context.md
  - docs/runbooks/dev-environment/graphify-repo-memory.md
  - docs/architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - knowledge-system
  - second-brain
  - strategy
  - observability
---

# Second-Brain Levels — where this repo's knowledge system sits

A self-assessment of this repo *as an AI second brain*, against the common 5-level model
(Router → Wiki → Semantic Search → Knowledge Graph → Always-On). The point: stop investing where
we're already heavy, invest where we're thin.

## The map

| Level | This repo | Status |
| --- | --- | --- |
| **1 · Router** — system prompt: roles, routing, folders | `CLAUDE.md` + Petey/Cody/Doug/Giddy/Desi roles, `docs/` structure | ✅ **over-built** — loads every turn; lean toward procedure-based skills (ADR 0033 D7) |
| **2 · Wiki** — LLM-friendly markdown | `docs/knowledge/wiki/` — index, log, concepts, six ledgers, glossary, project-context | ✅ **over-grown** — the session/ledger sprawl (21 retro-closed sessions) |
| **3 · Semantic search** — vectors / embeddings | — *(Graphify = graph; navigator = keyword; memory = description-match)* | ❌ **the gap — skipped** |
| **4 · Knowledge graph** — entity relationships | **Graphify** (code/docs/decisions + edges + communities) | ✅ **strong — leapfrogged L3 → L4** |
| **5 · Always-on autonomous** — continuous sync/ingest | parallel cloud sessions, `/pr-fix-loop`, `/loop`, orchestration-hub, scheduled agents | ⚠️ **emerging** — still session-triggered, not continuous |

**Diagnosis: a lopsided second brain.** Heavy at L1/L2, a hole at L3, genuinely strong at L4
(Graphify), emerging at L5. We went *graph-first* — defensible for code/decisions (graph beats
vectors for "what relates to X"), but it shows when you don't know the term: there is no
"find by *meaning*."

## The connective principle — JSON I/O efficiency

A second brain is only as good as what it **ingests** and how cheaply it **serves**.

- **Ingestion (feeds L2–L5):** pull grounding as clean structured JSON (SerpApi-class search APIs,
  transcript APIs) — *structured JSON > scraped HTML > parametric guessing*. Fewer tokens, typed,
  reliable. Serves the `teach` skill ("never trust parametric knowledge") and the research skill.
- **Serving (our surfaces):** this is our **DTO/payload discipline** (fetch only what's shown — the
  privacy + type contract) and ADR 0033 **D3** (thin per-aggregate DTOs).

Efficient JSON in = efficient JSON out = the same Ousterhout information-hiding move at the data layer.

## Strategic moves (converge with ADR 0033, the Kaizen pass, and Matt's harness framing)

1. **Stop feeding L1/L2** — more markdown/ledgers is negative ROI; lean the router + wiki.
2. **Decide L3** *(open decision below)*.
3. **Make ingestion JSON-efficient** — structured pulls feed teach/research/L5.
4. **L5 via the AdminTaskBoard** — the queue/observability/always-on surface that also retires the
   over-built L2 (ADR 0033 D6).

## Open decision — L3 (semantic layer)

**D-L3 — DECIDED (SESSION_0421): stay graph-first; defer the vector/semantic layer.** Graphify (L4)
already covers relationship retrieval over code/docs/decisions; a vector DB adds infra + sync +
maintenance cost for marginal gain at this scale. Instead, invest in **better memory descriptions**
as the cheap semantic index, and revisit a lightweight embedding layer only if retrieval-by-meaning
becomes a felt bottleneck.

> *Status: decided — graph-first. Reopen if semantic recall becomes a real pain point.*
