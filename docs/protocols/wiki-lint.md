---
title: Wiki Lint Protocol
slug: wiki-lint
type: protocol
status: active
created: 2026-04-26
updated: 2026-06-03
last_agent: claude-session-0335
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

**Check:** Compare the working-tree diff (`git status --porcelain -- docs`) against frontmatter `updated` dates. Flag any doc with uncommitted changes whose `updated` isn't today. Historical bulk commits (renames/reformats) are ignored, and a clean tree yields zero R4 warnings — so this nags only the doc you actually edited this session, not stable reference docs that simply haven't changed.

> **Implementation note (SESSION_0335):** the script previously drifted to a 30-day calendar threshold, which produced recurring false positives on stable docs. It now matches this spec (working-tree-diff vs `updated`). Closed sessions, ADRs, and `stable: true` docs are exempt (see the field table below).

**Opt out:** set `stable: true` in frontmatter on intentionally-static reference docs (canonical-ID registries, point-in-time audits) so R4 never checks them even when edited.

### R5 — Missing required frontmatter

Every wiki page must have: `title`, `slug`, `type`, `status`, `created`, `updated` (see the canonical field table below). `health` was **removed** in SESSION_0027 and is no longer required.

**Check:** Parse YAML frontmatter. Flag pages missing required fields.

### R6 — Empty or thin pages

Pages with fewer than 50 characters of body content (excluding frontmatter) are likely stubs.

**Check:** Flag pages with body length < 50 characters.

### R7 — ~~Health score drift~~ (REMOVED)

> **Removed (SESSION_0027).** Health scores dropped from JETTY frontmatter. The `status` field handles doc freshness. No replacement rule needed.

## Frontmatter fields (canonical)

The single source of truth for what frontmatter a doc should carry (SESSION_0335). New docs and templates should follow this; do not mass-rewrite existing docs to match — fields are migrated when a doc is next touched.

| Field | Tier | Notes |
| --- | --- | --- |
| `title` | required | Human title. |
| `slug` | required | kebab-case; usually the filename stem. |
| `type` | required | `concept` \| `protocol` \| `reference` \| `runbook` \| `session--*` \| `plan` \| `adr`/`decision` \| `file`. |
| `status` | required | `active` \| `draft` \| `in-progress` \| `closed` \| `superseded` \| `archived` \| `deprecated`. |
| `created` | required | Set once. |
| `updated` | required | Bump to today whenever you change the doc (R4 enforces on the working-tree diff). |
| `last_agent` | recommended | `<agent>-session-NNNN` of the last editor. **Canonical provenance field.** |
| `pairs_with` / `backlinks` | recommended | Bidirectional links (R1/R2 enforce). |
| `domain` | optional | Domain tag(s) — `lineage` \| `auth` \| `payments` \| `media` \| `tournaments` \| `platform` \| `docs-system` … Powers `docs/domains/` context cards; a doc may list more than one. |
| `stable` | optional | `true` = intentionally-static reference doc; exempts it from R4. |
| `tags` | optional | Free-form keyword tags. |
| `sprint` / `source_pages` / `parent` | optional | Context-specific. |
| ~~`author`~~ | **deprecated** | Superseded by `last_agent` (only ~13% of docs ever carried it). Stop adding it. |
| ~~`use_count`~~ | **deprecated** | Aspirational metadata that was never maintained (mostly `0`). Drop it. |

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
