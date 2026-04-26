---
status: active
pairs_with: CLAUDE.md
version: 1
---

# LLM Wiki Knowledge Layer

This folder defines the persistent knowledge-base layer for Ronin Dojo Baseline.

The purpose is to prevent the project from relying only on retrieval from scattered files. Instead, important source material is ingested once, summarized, cross-linked, and maintained as a living wiki that compounds over time.

## Why this exists

RAG answers questions by searching raw files every time. That is useful, but it does not automatically build memory, reconcile contradictions, or maintain a stable synthesis.

The LLM Wiki pattern adds a maintained middle layer:

1. Raw sources stay immutable.
2. Wiki pages become the synthesized working knowledge.
3. A schema file tells the AI how to ingest, write, link, lint, and maintain the wiki.

## Repo role

This layer is not a replacement for the product database, Prisma schema, or SESSION_0003 schema lock.

It is an architectural support system for:

- product research
- martial arts history and lineage notes
- Baseline curriculum planning
- content atoms and article research
- architecture decisions
- AI-agent continuity
- contradiction tracking
- source-backed synthesis

## Folder model

Recommended local or repo-backed structure:

```txt
knowledge/
  raw/
    articles/
    PDFs/
    transcripts/
    notes/
  wiki/
    index.md
    log.md
    concepts/
    people/
    arts/
    organizations/
    architecture/
    curriculum/
    content-engine/
  templates/
    source-summary.md
    concept-page.md
    person-page.md
    art-page.md
    decision-page.md
```

The repo may keep docs and templates under `docs/knowledge/`. Large raw PDFs, videos, and clipped web assets should usually live in Obsidian, cloud storage, or a local vault unless they are small and appropriate for Git.

## Three layers

### Layer 1 — Raw Sources

Raw sources are read-only truth inputs.

Examples:

- PDFs
- clipped articles
- transcripts
- pasted research notes
- historical sources
- meeting notes
- design notes
- repo planning packets

Rules:

- Do not rewrite raw sources.
- Do not summarize over the original source file.
- Prefer stable source IDs or filenames.
- Treat raw material as evidence, not as finished knowledge.

### Layer 2 — Wiki

The wiki is AI-maintained synthesized markdown.

Examples:

- `wiki/concepts/passport-and-shells.md`
- `wiki/arts/eskrima.md`
- `wiki/architecture/brand-as-column.md`
- `wiki/content-engine/content-atoms.md`

Rules:

- Every page should link to related pages.
- Every claim should trace back to source notes when practical.
- Contradictions should be noted, not hidden.
- Useful answers from chat sessions may be promoted into wiki pages.

### Layer 3 — Schema

The schema is the rulebook for AI behavior.

In this repo, the first schema file is root `CLAUDE.md`.

It defines:

- what the wiki is for
- how to ingest sources
- how to format pages
- how to update index/log files
- how to lint contradictions, orphan pages, and missing links
- how to avoid AI-generated entropy

## Required special files

### `wiki/index.md`

Content-oriented catalog of wiki pages.

Each entry should include:

- page title
- link
- one-line summary
- source count or confidence note when useful
- tags or category

### `wiki/log.md`

Chronological append-only record of wiki maintenance.

Entry format:

```md
## [YYYY-MM-DD] ingest | Source Title

- Source: `raw/articles/example.md`
- Pages created:
  - [[concepts/example-concept]]
- Pages updated:
  - [[index]]
- Notes:
  - Key contradiction or follow-up question.
```

## Relationship to SESSION_0002 / SESSION_0003

SESSION_0002 defined the schema design and AI-safe architecture guardrails.

SESSION_0003 should still focus on schema lock and reality alignment. The LLM Wiki layer should not introduce new Prisma models or product scope during SESSION_0003.

This layer supports the work by preserving source-backed decisions and making future AI sessions less likely to rediscover or rename concepts from scratch.

## Immediate next use cases

1. Ingest the Passport + Shells architecture into `wiki/concepts/passport-and-shells.md`.
2. Ingest the Baseline brand doctrine into `wiki/concepts/baseline-martial-arts.md`.
3. Ingest content atom architecture into `wiki/content-engine/content-atoms.md`.
4. Ingest SESSION_0001 and SESSION_0002 summaries into `wiki/architecture/session-history.md`.
5. Run a weekly lint pass for contradictions, stale names, and orphan pages.

## Hard boundary

The wiki is a knowledge system.

The product database is the operational system.

Do not let wiki pages become hidden requirements. Any product requirement discovered in the wiki must be promoted into an architecture doc, sprint doc, issue, or schema design before implementation.
