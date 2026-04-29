---
title: Wiki Lint Protocol
slug: wiki-lint
type: protocol
status: active
created: 2026-04-26
updated: 2026-04-29
last_agent: codex-session-0025
health: 8
pairs_with:
  - docs/protocols/code-guardrails.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0025.md
---

# Wiki Lint Protocol

## Purpose

Catch broken links, orphan pages, stale frontmatter, and missing backlinks in the LLM wiki before they compound across sessions. Inspired by the lint rules in [llm-wiki-compiler](https://github.com/atomicmemory/llm-wiki-compiler).

## Trigger

Run during the closing ritual (step 3), after updating the SESSION file but before committing. Also run ad-hoc when creating or reorganizing wiki pages.

## Rules

### R1 — Broken internal links

Every `[text](relative-path.md)` and `pairs_with` / `backlinks` / `parent` entry in frontmatter must resolve to an existing file.

**Check:** Scan all `.md` files in `docs/` for markdown links and frontmatter references. Flag any that point to non-existent files.

### R2 — Missing backlinks (bidirectional)

If page A links to page B (in `pairs_with` or body links), page B's `backlinks` frontmatter must include page A.

**Check:** For each `pairs_with` entry, verify the target page lists the source in its `backlinks` or `pairs_with`. Flag asymmetric links.

### R3 — Orphan pages

Every wiki page should be reachable from `docs/knowledge/wiki/index.md` (directly or transitively via links).

**Check:** Scan `docs/knowledge/wiki/` for `.md` files not listed in `index.md`. Flag orphans.

### R4 — Stale frontmatter

If a file was modified this session but its `updated` date wasn't bumped, flag it.

**Check:** Compare `git diff --name-only` against frontmatter `updated` dates. Flag files where the file changed but `updated` didn't.

### R5 — Missing required frontmatter

Every wiki page must have: `title`, `slug`, `type`, `status`, `created`, `updated`, `health`.

**Check:** Parse YAML frontmatter. Flag pages missing required fields per JETTY 3.0 spec.

### R6 — Empty or thin pages

Pages with fewer than 50 characters of body content (excluding frontmatter) are likely stubs.

**Check:** Flag pages with body length < 50 characters.

### R7 — Health score drift

If a page's health score hasn't been re-evaluated in 30+ days (`updated` > 30 days old), flag for review.

**Check:** Flag pages where `updated` is > 30 days from current date.

## How to run

From the repo root:

```bash
bun run wiki:lint
```

This calls `scripts/wiki-lint.ts`. The command exits `0` when clean, `1` when
violations are found, and `2` if the lint process itself crashes.

During full close, record the command and result in the SESSION file's
`## Full close evidence` table. If the command fails because of known legacy
violations, list the count and state whether any touched file introduced a new
violation.

## Manual fallback

Use this only if the script cannot run:

1. **Files touched this session** — did each get `updated` bumped and `last_agent` set?
2. **New pages** — are they in `index.md`? Do referenced pages have backlinks updated?
3. **Pairs_with** — is it bidirectional?
4. **Links in body** — do they resolve?

If using the fallback, record why the script could not run.

## Automation

The current script implements static analysis only: no LLM calls and no writes.
It checks broken links, missing backlinks, orphan wiki pages, stale frontmatter,
missing frontmatter, thin pages, and health drift.

## Outputs

A list of violations, grouped by rule. Example:

```
R2 — Missing backlink: data-model.md pairs_with s1-schema-design, but s1-schema-design does not backlink data-model
R3 — Orphan page: content-engine/curriculum-extract-schema.md not in index.md
R5 — Missing frontmatter: closing.md missing 'health' field
```
