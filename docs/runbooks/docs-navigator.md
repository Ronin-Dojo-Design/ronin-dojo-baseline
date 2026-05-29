---
title: "Docs Navigator — searchable HTML browser for docs/"
slug: docs-navigator
type: runbook
status: active
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0298
pairs_with:
  - docs/knowledge/wiki/index.md
  - docs/runbooks/graphify-repo-memory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Docs Navigator

A self-contained, searchable HTML browser for everything under `docs/`. It is a generated
artifact — open it locally, no server or network needed.

## Generate / regenerate

```bash
bun run docs:nav        # or: python3 scripts/generate-docs-nav.py
open docs/index.html    # macOS; or open the file in any browser
```

The output (`docs/index.html`, ~7 MB) is **git-ignored** — regenerate it whenever you want
the latest docs. It is rebuilt from scratch each run, so it never drifts.

## What it does

- **Full-text search** across every doc's title, path, and body (space-separated terms are AND-ed).
- **Virtual module tree** grouped by area → group, without moving any files:
  - `runbooks` are grouped into domains (Database, Deploy & Infra, Dev Environment,
    Integrations, Domain Features, SOPs, Porting) via a mapping in the generator.

  - other areas group by sub-directory or frontmatter `type`; `sprints` split Active vs Archive.
- **In-pane markdown rendering** with working internal links — clicking a relative `.md` link
  loads that doc inside the navigator.

- **Status badges + stale markers** (frontmatter `status`; `updated` older than 30 days flagged),
  mirroring the `wiki:lint` staleness threshold.

## Scope

Mirrors `scripts/wiki-lint.ts` exactly — skips `templates`, `_imports`, `source`,
`ronin_dojo_baseline_systems_pack`, `graphify-out`, and `_template*` files.

## Relationship to other tools

- **Graphify** ([graphify-repo-memory.md](graphify-repo-memory.md)) answers "what code/files relate
  to X" across the whole repo (code + docs graph). The Docs Navigator is doc-only, human-facing
  reading/search.

- **`wiki:lint`** enforces doc structure (links, backlinks, frontmatter, formatting). The navigator
  consumes that same well-formed frontmatter for grouping and badges.

## Implementation

- Generator: `scripts/generate-docs-nav.py` (parses frontmatter + body, embeds all docs as JSON,
  renders a single HTML file with inline CSS/JS — a compact markdown renderer, tree, and search).

- The embedded data escapes `</` → `<\/` so no doc body can prematurely close the `<script>` block.
