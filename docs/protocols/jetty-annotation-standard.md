---
title: JETTY Annotation Standard
slug: jetty-annotation-standard
type: protocol
status: active
created: 2026-05-09
updated: 2026-05-12
last_agent: copilot-session-0147
pairs_with:
  - apps/web/prisma/schema.prisma
  - docs/protocols/code-guardrails.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0147.md
---

# JETTY Annotation Standard

Inline annotations on new code and schema additions so future agents and humans can trace *why* something exists without reading git blame.

## 1. Prisma Schema Annotations

Every new model, enum, or significant field addition gets a comment block above it:

```prisma
// @added   SESSION_NNNN (YYYY-MM-DD)
// @why     One-line reason this exists
// @wired   Key consumers: file paths or feature names
```

### Rules (schema)

1. **One block per model/enum.** Don't annotate every field — just the model header.
2. **Keep `@why` to one line.** Link to the SESSION file for full context.
3. **`@wired` names the consumers**, not the schema itself. Where does code read/write this?
4. **Don't backfill.** Only annotate new additions going forward. Existing models stay as-is unless touched.
5. **Update `@wired` when consumers change.** If a new file starts querying the model, add it.

### Example (schema)

```prisma
// @added   SESSION_0109 (2026-05-09)
// @why     Replace hardcoded gear collections with DB-managed discipline→product mappings
// @wired   server/web/affiliate-products/queries.ts, app/(web)/gear/page.tsx, prisma/seed-gear-recommendations.ts
model GearRecommendation {
  ...
}
```

## 2. TypeScript / TSX File Annotations

New server modules (actions, queries, schemas) and significant new components get a JSDoc header:

```typescript
/**
 * @added   SESSION_NNNN (YYYY-MM-DD)
 * @why     One-line reason this file exists
 * @wired   Consumers or pages that import this module
 */
```

### Rules (TypeScript)

1. **One header per file**, at the top, before imports.
2. **Only on new files.** Don't backfill existing files unless they're being substantially rewritten.
3. **`@wired` names the pages/components that consume this module.** For actions/queries, name the admin pages. For components, name the pages that render them.
4. **Update during closing ritual** — if a new consumer is added to an annotated file, update `@wired`.

### Example (TypeScript)

```typescript
/**
 * @added   SESSION_0147 (2026-05-12)
 * @why     Admin CRUD actions for invite management (create, revoke, delete)
 * @wired   app/admin/invites/ (list, new, detail pages)
 */
"use server"

import { adminActionClient } from "~/lib/safe-actions"
// ...
```

## 3. When to Apply

| Trigger | Annotation type |
| --- | --- |
| New Prisma model or enum | Schema annotation |
| New `server/` module (actions, queries, schema) | TSDoc header |
| New admin page directory | TSDoc header on the main page.tsx |
| New public page with server logic | TSDoc header on the page.tsx |
| New shared component | TSDoc header |
| Existing file touched but not rewritten | No annotation needed |
| Closing ritual JETTY sweep | Check touched files, add missing annotations |

## 4. Closing Ritual Integration

During the JETTY 3.0 sweep in the closing ritual:
- Check all new files created this session for annotations
- Add missing annotations before commit
- This is part of the standard closing sweep, not a separate step

## Scope

- **Schema:** `apps/web/prisma/schema.prisma`
- **Code:** `apps/web/server/**/*.ts`, `apps/web/app/**/*.tsx`, `apps/web/components/**/*.tsx`
- **Docs:** Use JETTY 3.0 frontmatter (separate standard)
