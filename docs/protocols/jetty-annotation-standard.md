---
title: JETTY Schema Annotation Standard
slug: jetty-annotation-standard
type: protocol
status: active
created: 2026-05-09
updated: 2026-05-09
last_agent: copilot-session-0109
pairs_with:
  - apps/web/prisma/schema.prisma
  - docs/protocols/code-guardrails.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# JETTY Schema Annotation Standard

Simple inline comments on Prisma schema additions so future agents and humans can trace *why* something exists without reading git blame.

## Format

Every new model, enum, or significant field addition gets a comment block above it:

```prisma
// @added   SESSION_NNNN (YYYY-MM-DD)
// @why     One-line reason this exists
// @wired   Key consumers: file paths or feature names
```

## Rules

1. **One block per model/enum.** Don't annotate every field — just the model header.
2. **Keep `@why` to one line.** Link to the SESSION file for full context.
3. **`@wired` names the consumers**, not the schema itself. Where does code read/write this?
4. **Don't backfill.** Only annotate new additions going forward. Existing models stay as-is unless touched.
5. **Update `@wired` when consumers change.** If a new file starts querying the model, add it.

## Example

```prisma
// @added   SESSION_0109 (2026-05-09)
// @why     Replace hardcoded gear collections with DB-managed discipline→product mappings
// @wired   server/web/affiliate-products/queries.ts, app/(web)/gear/page.tsx, prisma/seed-gear-recommendations.ts
model GearRecommendation {
  ...
}
```

## Scope

Applies to `apps/web/prisma/schema.prisma` only. Code files use standard JSDoc/TSDoc. Docs use JETTY 3.0 frontmatter.
