---
title: "Dirstarter L1 Baseline"
slug: dirstarter-l1-baseline
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + Copilot
last_agent: copilot-session-0012
pairs_with:
  - knowledge/wiki/files/schema-prisma
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0012
  - architecture/program-plan
health: 8
tags: [dirstarter, l1, components, baseline, architecture]
---

# Dirstarter L1 Baseline

**Upstream:** `https://github.com/dirstarter/dirstarter.git` (Polarsoft template)
**Copied at:** commit `c42e8bb` on 2026-04-25
**Provenance file:** `apps/web/.dirstarter-upstream`
**Local reference copy:** `/Users/brianscott/Local Sites/DirStarter /dirstarter_template/`

## What this covers

Everything in `apps/web/` that came from Dirstarter and has **not been modified** by the Ronin Dojo build. This is the L1 code layer — framework choices, file organization, HOC patterns, and the shared component library.

### Key directories (L1, unmodified)

| Directory | Contents |
| --- | --- |
| `components/common/` | 39 shared UI components (shadcn/Radix primitives) |
| `components/web/ui/` | 7 page-level layout components |
| `components/web/tools/` | Tool directory UI (Dirstarter's original use case) |
| `components/web/posts/` | Blog post cards/lists |
| `components/web/products/` | Stripe product UI |
| `components/web/auth/` | Login form/dialog/button |
| `components/admin/` | Admin shell, nav, sidebar, metrics |
| `components/data-table/` | Data table with sorting/filtering |
| `lib/` | Auth, i18n, utils, parsers, safe-actions, analytics |
| `hooks/` | Custom React hooks |
| `config/` | Site config, links, metadata |
| `emails/` | React Email templates |
| `services/` | DB client, external service wrappers |
| `content/` | Content collections (MDX blog) |

### Full component inventory

See the [UI Components table in the wiki index](../index.md#ui-components-dirstarter-common-library) for the complete list with paths and notes.

## Rules

1. **Don't modify L1 files unless necessary.** If Dirstarter has a component that does 90% of what you need, use it as-is and wrap or compose on top.

2. **If you modify an L1 file, JETTY it.** Create an individual file doc in `docs/knowledge/wiki/files/` explaining what changed and why. This converts it from "inherited L1" to "owned by Ronin Dojo."

3. **Track modifications here.** Add the file to the table below so future sessions know what's been touched.

4. **The `dirstarter_template/` workspace folder is read-only reference.** Never edit it. Use it to diff against when unsure if a file was modified.

## Modified L1 files

Files that started as Dirstarter copies but have been modified by the Ronin Dojo build. Each has its own JETTY 3.0 wiki file doc.

| File | Modified in | Wiki doc | What changed |
| --- | --- | --- | --- |
| `proxy.ts` | SESSION_0008 | — | Merged brand resolution from deleted `middleware.ts`; added auth guards |
| `server/web/organization/queries.ts` | SESSION_0012 | — | Added `getOrganizationBySlug(brand, slug)` |

## Unmodified L1 files

Everything else in `apps/web/` that isn't listed above or in `components/web/organizations/` (which is new Ronin Dojo code). The wiki index component tables serve as the inventory. No individual JETTY docs needed until modification.

## How to check if a file was modified

```bash
# Compare a file against the upstream reference copy
diff apps/web/components/common/button.tsx \
     "/Users/brianscott/Local Sites/DirStarter /dirstarter_template/components/common/button.tsx"
```

If the diff is empty, it's still pure L1. If it has changes, JETTY it and add to the Modified table above.
