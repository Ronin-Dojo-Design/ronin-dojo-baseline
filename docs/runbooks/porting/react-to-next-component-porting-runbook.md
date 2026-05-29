---
title: React to Next Component Porting Runbook
slug: react-to-next-component-porting-runbook
type: runbook
status: active
created: 2026-05-06
updated: 2026-05-06
author: Brian + ChatGPT
last_agent: chatgpt-hostile-review-pack
pairs_with:
  - docs/knowledge/wiki/dirstarter-component-inventory.md
  - docs/knowledge/wiki/component-porting/graphify-component-port-map.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - component-porting
  - nextjs
  - legacy-react
  - dirstarter
---

# React to Next Component Porting Runbook

## Summary

Repeatable pipeline for porting old monorepo React components into the new Next/Dirstarter baseline repo without burning tokens, bypassing Dirstarter primitives, or creating duplicate UI.

## Status

Active runbook. Use before porting any old React component.

## When to use

Use when:

- bringing old monorepo React components into `apps/web`
- converting client-only React to Next server/client component boundaries
- replacing legacy UI with Dirstarter primitives
- mapping old Bubble/Mad Bubble/Ronin components to new repo components
- deciding whether to port, rewrite, delete, or keep as reference

## Steps

### 0. Pre-flight rule

Do not port a component until the component has a mapping record.

Every mapping record must answer:

- What is the old component?
- Where is it in the old monorepo?
- What job does it do?
- What current Dirstarter/Ronin component already does this job?
- Is this a port, rewrite, adapter, or deletion?
- What data contract does it need?
- What proof closes it?

### 1. Discovery

Inputs:

- old component path
- old imports
- old props
- screenshots or expected UI
- behavior notes
- target route/page in baseline repo

Output:

- mapping record in `graphify-component-port-map.md`

### 2. Classification

Classify the component:

| Class | Meaning | Default action |
| --- | --- | --- |
| primitive duplicate | old component duplicates Button/Input/Card/etc. | do not port; replace with Dirstarter primitive |
| listing pattern | old list/card/search/filter pattern | map to Query -> Listing -> List -> Card |
| form pattern | old form/manual state | rewrite with repo form/action stack |
| admin table | old table/list management UI | rewrite with DataTable system |
| domain component | actual martial arts domain UI | port carefully after mapping |
| dead visual | cosmetic old UI with no current product value | archive/delete |

### 3. Dirstarter inventory check

Before writing code, check:

- `docs/knowledge/wiki/dirstarter-component-inventory.md`
- relevant L1 primitive/component sections
- existing custom Ronin components in wiki index
- server/web domain patterns

If the inventory has a fit, use it.

### 4. Data boundary decision

Decide:

- server component?
- client component?
- server action?
- route handler?
- query in `server/web/{domain}/queries.ts`?
- schema in `server/web/{domain}/schema.ts`?

Do not let a visual component invent its own data layer.

### 5. Port strategy

Pick one:

- **replace** with existing component
- **wrap** existing component with domain props
- **rewrite** into Dirstarter pattern
- **port** with minimal changes
- **archive** as reference only

### 6. Implementation guardrails

- no raw forms when Form/FormField pattern exists
- no raw table when DataTable system applies
- no raw button/input/card if Dirstarter primitives exist
- no bypass of `safe-actions`
- no unscoped brand queries
- no client-only rewrite unless interactivity requires it
- no duplicate domain component without inventory update

### 7. Proof

Minimum proof:

- TypeScript passes
- lint passes
- component renders in target route or story/test harness
- behavior parity checklist completed
- Dirstarter compliance line recorded
- mapping record updated

### 8. Closeout

Update:

- session file
- hostile repo review if required
- component port map
- wiki index if new pages/components were added
- Dirstarter inventory if a reusable pattern was discovered

## Rollback

If the port goes wrong:

1. revert code changes
2. preserve mapping record
3. mark status `blocked` or `replace-instead`
4. record why the port failed
5. choose a smaller component

## Last verified

2026-05-06 by ChatGPT draft pass. Needs first live repo port to validate.

## Petey close

Porting is not copying.

Porting is translation with proof.

**Planned Passion Produces Purpose.**
**OSSS.**
