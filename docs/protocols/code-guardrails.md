---
title: Code Guardrails
slug: code-guardrails
type: protocol
status: active
created: 2026-04-26
updated: 2026-04-26
health: 7
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

## When to run

- **During session**: after completing each code task, before moving to the next
- **At close**: closing ritual step 3 references these rules
- **At PR review**: Doug (QA persona) checks these when activated

## Cross-references

- [Closing ritual](../rituals/closing.md) — embeds G5 as step 3
- [Cody agent](../agents/cody.md) — follows these rules during execution
- [Wiki lint](wiki-lint.md) — automates G5 checks for docs
