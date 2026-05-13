---
title: Code Guardrails
slug: code-guardrails
type: protocol
status: active
created: 2026-04-26
updated: 2026-05-12
last_agent: copilot-session-0150
---

# Code Guardrails

Standards enforced every session before declaring any code task "done." Referenced by the [closing ritual](../rituals/closing.md) step 3 and by [Cody](../agents/cody.md).

## Rules

### G1 — No nested ternaries

Maximum one level of ternary. If you need a second level, refactor to `if`/`else`, a `switch`, or a helper function.

```typescript
// ✅ OK — single ternary
const label = isActive ? "Active" : "Inactive";

// ❌ BAD — nested ternary
const label = isActive ? (isPaid ? "Paid" : "Unpaid") : "Inactive";

// ✅ Refactored
function getLabel(isActive: boolean, isPaid: boolean) {
  if (!isActive) return "Inactive";
  return isPaid ? "Paid" : "Unpaid";
}
```

### G2 — Biome lint clean

`bun run check` (Biome) must pass with zero errors before declaring done. Warnings are acceptable if documented.

### G3 — TypeScript strict — no `any`

`tsc --noEmit` must be clean. No `any` unless a comment explains why and links to a follow-up issue.

### G4 — Conventional commits

Every commit uses a tag: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`. Don't bundle unrelated changes.

### G5 — JETTY 3.0 sweep on touched docs

Every doc file touched during a session must have:
- JETTY 3.0 frontmatter present
- `updated` date current
- `last_agent` set
- Backlinks bidirectional

This is the same as closing ritual step 3 — referenced here, not duplicated.

### G6 — Prisma schema hygiene

After any schema change:
1. `prisma generate` clean
2. `tsc --noEmit` clean (catches stale Prisma Client types)
3. Seed runs against fresh DB

### G7 — No scope creep

If you find adjacent tech debt during a task, note it in the SESSION file `Open decisions / blockers` — don't fix it inline.

### G8 — Zod form schemas: `.optional()` not `.nullish()` for strings

When a Zod schema feeds into React Hook Form → HTML inputs, use `.optional()` for string fields. HTML `<input value={null}>` is a React error. Reserve `.nullish()` for fields where `null` has distinct DB meaning (dates, enums, JSON columns with `Prisma.JsonNull`).

```typescript
// ✅ OK — form-bound string field
displayName: z.string().max(100).optional(),

// ❌ BAD — null flows into <Input value={null}>
displayName: z.string().max(100).nullish(),

// ✅ OK — date where null means "not set" in Prisma
dob: z.coerce.date().nullish(),
```

### G9 — Zod v4 `z.record()` requires key schema

`z.record(valueSchema)` is Zod v3. Zod v4 requires two arguments: `z.record(keySchema, valueSchema)`.

```typescript
// ✅ Zod v4
socialLinks: z.record(z.string(), z.string().url()),

// ❌ Zod v3 syntax — compile error in v4
socialLinks: z.record(z.string().url()),
```

## When to run

- **During session**: after completing each code task, before moving to the next
- **At close**: closing ritual step 3 references these rules
- **At PR review**: Doug (QA persona) checks these when activated

## Cross-references

- [Closing ritual](../rituals/closing.md) — embeds G5 as step 3
- [Cody agent](../agents/cody.md) — follows these rules during execution
- [Wiki lint](wiki-lint.md) — automates G5 checks for docs

### G6 — No raw HTML when a Dirstarter component exists

Consult [`dirstarter-component-inventory.md`](../knowledge/wiki/dirstarter-component-inventory.md) before writing any UI. The following raw elements are NEVER acceptable when the inventory provides a component:

| ❌ Raw HTML | ✅ Use instead |
|---|---|
| `<h1>` – `<h6>` | `H1` – `H6` from `components/common/heading.tsx` |
| `<input>` | `Input` from `components/common/input.tsx` |
| `<select>` | `Select` from `components/common/select.tsx` |
| `<label>` | `Label` / `FormLabel` from `components/common/label.tsx` / `form.tsx` |
| `<form>` (with manual state) | `Form` + React Hook Form from `components/common/form.tsx` |
| `<textarea>` | `TextArea` from `components/common/textarea.tsx` |
| `<div className="flex ...">` | `Stack` from `components/common/stack.tsx` |
| `<div className="rounded-lg border bg-card">` | `Card` from `components/common/card.tsx` |
| `<a href=...>` | `Link` from `components/common/link.tsx` |

Violations are classified as **FS-0001** in the failed-steps log.

### G7 — No nuqs/server imports in client components

Never import from a file that uses `nuqs/server` (e.g., `createSearchParamsCache`) in a `"use client"` component. Turbopack chunks `nuqs/server` as server-only, causing runtime errors like `Cannot use import statement outside a module`.

**Pattern:** Extract shared constants (state machines, enum maps, config objects) to a separate `constants.ts` file with no server-only imports. Import from `constants.ts` in client components.

```typescript
// ❌ BAD — client component importing from schema.ts that uses nuqs/server
"use client"
import { VALID_TRANSITIONS } from "~/server/admin/memberships/schema" // 💥 runtime error

// ✅ GOOD — shared constants in a separate file
"use client"
import { VALID_TRANSITIONS } from "~/server/admin/memberships/constants" // ✅ no server deps
```

**Discovery:** SESSION_0149 — Turbopack chunk error when `membership-status-actions.tsx` imported from `schema.ts`.
