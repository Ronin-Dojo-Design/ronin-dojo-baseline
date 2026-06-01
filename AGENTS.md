# AGENTS.md — Ronin Dojo Baseline

> **Session operations (bow-in / bow-out / orchestration) are binding for every agent, including Codex.**
> They live in [`CLAUDE.md`](CLAUDE.md) → "Session operations" (repo paths, the `apps/web` dev-server +
> Prisma gotchas, Graphify-first discovery, the FS-0024 git guard, and the standing commit/push flow) and
> in the cross-agent rituals [`docs/rituals/opening.md`](docs/rituals/opening.md) /
> [`docs/rituals/closing.md`](docs/rituals/closing.md). Read those first when starting a session — the
> opening ritual is explicitly agent-agnostic and records `last_agent: codex-session-NNNN` for Codex runs.
> The wiki-schema rules below govern knowledge-wiki maintenance.

---

## LLM Wiki Schema

This file defines how AI agents should behave when maintaining the Ronin Dojo Baseline knowledge wiki.

## Purpose

The goal of this wiki is to build a persistent, structured, and continuously improving knowledge base.

The AI should not repeatedly rediscover knowledge from raw sources. Instead, it should:

1. Read sources once
2. Synthesize them into structured pages
3. Link those pages together
4. Update them over time
5. Maintain consistency and accuracy

## Core rules

### 1. Never overwrite raw sources

Files under `raw/` are immutable.

- Do not edit them
- Do not summarize directly over them
- Always create or update wiki pages instead

### 2. Always write to the wiki layer

All synthesized knowledge must live in `wiki/`.

- Concepts go in `wiki/concepts/`
- People go in `wiki/people/`
- Arts go in `wiki/arts/`
- Architecture goes in `wiki/architecture/`
- Content engine knowledge goes in `wiki/content-engine/`

### 3. Link aggressively

Every page must:

- link to related concepts
- link to parent topics
- link to child topics when appropriate

No isolated pages.

### 4. Maintain index and log

After each ingestion or update:

- update `wiki/index.md`
- append a new entry to `wiki/log.md`

### 5. Handle contradictions explicitly

If two sources conflict:

- do not silently merge
- document the contradiction
- note possible interpretations

### 6. Prefer synthesis over duplication

If a concept already exists:

- update the existing page
- do not create a near-duplicate page

### 7. Respect the ubiquitous language

All wiki content must align with the repo’s domain language:

- Passport
- DirectoryProfile
- Organization
- Discipline
- RankSystem
- Rank
- Membership
- RegistrationEntry

Do not introduce alternative names without updating the glossary.

### 8. Do not expand product scope

The wiki is not the product.

- Do not create requirements implicitly
- Do not change schema or API design from wiki edits
- Surface new ideas as notes, not decisions

### 9. Keep pages structured

Preferred format:

```md
# Title

## Summary

Short explanation of the concept.

## Key Ideas

- bullet points

## Relationships

- links to related pages

## Sources

- references to raw material

## Open Questions

- unresolved ideas or contradictions
```

### 10. Periodic linting

The AI should occasionally:

- find orphan pages (no inbound links)
- find duplicated concepts
- find outdated terminology
- find missing relationships

## Workflow

1. New source added to `raw/`
2. AI reads and extracts key concepts
3. AI creates or updates wiki pages
4. AI links pages together
5. AI updates index and log
6. AI flags contradictions or gaps

## Relationship to repo development

This system supports the codebase by:

- preserving architectural decisions
- organizing research
- supporting content creation
- preventing repeated AI rediscovery loops

It does NOT replace:

- Prisma schema
- backend services
- frontend components
- sprint planning

Those remain governed by SESSION docs and architecture files.

## Final rule

Clarity over completeness.

The goal is a growing, connected map of knowledge, not a perfectly exhaustive encyclopedia on day one.
