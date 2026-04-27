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

## How to run (manual)

Until we automate this, run mentally during closing:

1. **Files touched this session** — did each get `updated` bumped and `last_agent` set?
2. **New pages** — are they in `index.md`? Do referenced pages have backlinks updated?
3. **Pairs_with** — is it bidirectional?
4. **Links in body** — do they resolve?

## Future automation

A `bun run scripts/wiki-lint.ts` script could automate R1–R7 by:
- Globbing `docs/**/*.md`
- Parsing YAML frontmatter
- Extracting markdown links via regex
- Cross-referencing file existence and backlink symmetry
- Reporting violations to stdout

This would be modeled after `llm-wiki-compiler`'s `src/linter/rules.ts` pattern: pure static analysis, no LLM calls, structured diagnostics.

## Outputs

A list of violations, grouped by rule. Example:

```
R2 — Missing backlink: data-model.md pairs_with s1-schema-design, but s1-schema-design does not backlink data-model
R3 — Orphan page: content-engine/curriculum-extract-schema.md not in index.md
R5 — Missing frontmatter: closing.md missing 'health' field
```
