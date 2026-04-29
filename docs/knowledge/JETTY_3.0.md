---
status: active
version: 1
created: 2026-04-26
updated: 2026-04-26
author: Brian + Copilot (SESSION_0004)
---

# JETTY 3.0 — LLM Wiki Annotation Standard

Lean page annotation standard for the Ronin Dojo LLM Wiki. Successor to JETTY 2.1.

## Why this exists

AI agents lose context between sessions. Structured frontmatter and predictable sections let any agent pick up a page, understand its purpose, assess its health, and know what to do next — without re-reading the entire repo.

## YAML frontmatter (required on every wiki page)

```yaml
---
# Identity
title: Human-readable page title
slug: kebab-case-unique-id          # used in backlinks
type: concept | file | decision | session | runbook | protocol | person | art | org
status: draft | active | stale | deprecated

# Timestamps
created: YYYY-MM-DD
updated: YYYY-MM-DD

# Ownership
author: who created it
last_agent: agent or human who last edited

# Relationships
pairs_with:                         # sibling pages (bidirectional)
  - slug-or-relative-path
parent: slug-or-relative-path       # hierarchical parent
backlinks:                          # auto-maintained reverse links
  - slug-or-relative-path

# Health
needs_fix:                          # list of known issues
  - "description of issue"
bug_flags:                          # critical problems
  - "description"

# Optional
wiring:                             # what this connects to in code
  - "apps/web/prisma/schema.prisma → Passport model"
  - "apps/web/lib/authz.ts → canEditOrganization()"
tags: []
---
```

## Required sections by page type

### All pages

| Section | Purpose |
| --- | --- |
| `# Title` | Same as frontmatter `title` |
| `## Summary` | 1–3 sentences. What is this and why does it matter? |
| `## Status` | Current state. For files: does it compile, is it wired, is it tested? |

### Type: `concept`

| Section | Purpose |
| --- | --- |
| `## Key Idea` | One sentence or diagram |
| `## Structure` | Bullet breakdown of components |
| `## Relationships` | How it connects to other concepts |
| `## Sources` | Where the knowledge came from |
| `## Open Questions` | Unresolved issues (with date flagged) |

### Type: `file`

| Section | Purpose |
| --- | --- |
| `## Intent` | Why this file exists — what problem it solves |
| `## Architecture` | Data flow, logic flow, or code flow (use mermaid or bullets) |
| `## Key exports / models` | What it exposes |
| `## Wiring` | What imports it, what it imports |
| `## Health` | Compiles? Tested? Known bugs? (Prose description, no numeric score) |
| `## Teachable explanation` | Explain it like the next developer (or agent) is new |

### Type: `decision`

| Section | Purpose |
| --- | --- |
| `## Context` | What prompted the decision |
| `## Options considered` | Alternatives evaluated |
| `## Decision` | What was chosen and why |
| `## Consequences` | Trade-offs accepted |
| `## Revisit conditions` | When this decision should be re-evaluated |

### Type: `session`

| Section | Purpose |
| --- | --- |
| `## Goal` | What we set out to do |
| `## What landed` | What actually shipped |
| `## Files touched` | Paths + one-line notes |
| `## Decisions resolved` | Anything signed off |
| `## Open decisions / blockers` | Unresolved items |
| `## Next session` | Goal + Inputs + First task |

### Type: `runbook`

| Section | Purpose |
| --- | --- |
| `## When to use` | Trigger conditions |
| `## Steps` | Numbered procedure |
| `## Rollback` | How to undo |
| `## Last verified` | Date + by whom |

### Type: `protocol`

| Section | Purpose |
| --- | --- |
| `## Purpose` | Why this protocol exists |
| `## Trigger` | When to invoke it |
| `## Steps` | The procedure |
| `## Outputs` | What it produces |

## Health scoring

> **Removed (SESSION_0027).** The 0–10 numeric health score was dropped because agents self-assigned on creation and never re-evaluated — 33 of 43 docs sat at 7. The `status` field (active / stale / deprecated / archived) now carries this responsibility. WORKFLOW_5.0's 10-point rubric scores deliverables; docs don't need a second, weaker scoring system.

## Backlink rules

1. When page A references page B, add page A to page B's `backlinks` list.
2. Backlinks are relative paths from `docs/` root.
3. Agents must update backlinks when creating or editing cross-references.
4. `pairs_with` is bidirectional — both pages must list each other.

## Agent maintenance rules

1. **On create**: Fill all required frontmatter. Set `health` conservatively.
2. **On edit**: Bump `updated`, update `last_agent`, re-evaluate `health`.
3. **On link**: Update both pages' `backlinks` / `pairs_with`.
4. **On session close**: Any wiki page touched gets `updated` bumped.
5. **Stale detection**: If `updated` is >30 days old, flag `status: stale`.
6. **Never delete**: Set `status: deprecated` instead.

## File naming

- Wiki pages: `kebab-case.md`
- Sessions: `SESSION_NNNN.md` (existing convention, keep it)
- ADRs: `NNNN-kebab-case.md` (existing convention, keep it)
- Templates: `_template-{type}.md` (underscore prefix = not a real page)
