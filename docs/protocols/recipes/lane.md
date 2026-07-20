---
title: "Recipe — Lane (single worktree build lane)"
slug: recipe-lane
type: protocol
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0584
pairs_with:
  - docs/protocols/fan-out-session-recipe.md
  - docs/protocols/cody-preflight.md
  - docs/protocols/recipes/orchestrator.md
  - docs/protocols/recipes/review-wave.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - orchestration
  - recipe
---

# Recipe — Lane

The source doc [`seq-lane-build`](../../../.claude/skills/seq-lane-build/SKILL.md) points at:
the sequence skill is the invariant step list; this card carries the "why" and the fuller
context a dispatched builder (or the dispatcher writing its prompt) needs.

## Persona pack

- **Cody** (builder/self-reviewer) — runs the lane, owns the build+gates+self-review.
- **Doug** (verifier) — reviews the landed commit, either same-session or in the next
  [review-wave](review-wave.md).
- **Petey/operator** (dispatcher) — writes the lane prompt, pins every operator fork before
  dispatch (a dispatched builder never re-opens one).

## Load-set

1. The dispatch prompt itself — lane specifics (goal, owned-file contract, non-goals, pinned
   grill outcomes, session number, gates).
2. [`seq-lane-build`](../../../.claude/skills/seq-lane-build/SKILL.md) — the invariant sequence
   (worktree claim → recon → pre-flight → build → gates → runtime proof → session record → close).
3. [`cody-preflight.md`](../cody-preflight.md) — before writing any code.
4. [`fan-out-session-recipe.md`](../fan-out-session-recipe.md) §3–4 — the disjointness contract
   and the shared-by-rule files this lane must never rewrite (ledgers, wiki index).

## Overlays (pick the variant that matches the lane)

| Lane shape | Bootstrap | Gates | Notes |
| --- | --- | --- | --- |
| **Docs + governance** (no dev server) | none — worktree just needs the git checkout | `wiki:lint`, targeted script tests if scripts touched | fastest lane class; no `bun install`/Prisma needed unless a script under test imports app code |
| **App-code** | `bun install` + `.env` copy + `bunx prisma generate` | `typecheck` · `lint:check` · `format:check` (new files) · `bun run test` · `next build` | runtime proof required if a runtime surface changed |
| **Schema-touching** | same as app-code | + hand-authored migration, never `prisma migrate dev` (worktrees share ONE local DB) | schema lane usually merges LAST in a fan-out |

## Minimum-output contract

A lane is not done until it returns, verbatim:

1. **Files touched** — the owned-set diff, nothing outside it.
2. **Gate outputs** — copy-pasted command results, not "gates passed."
3. **Runtime evidence** — when a runtime surface changed; otherwise "no runtime surface touched."
4. **Proposed ledger edits** — a session-file section, never a direct edit to a shared ledger.
5. **Commit(s)** — local only, conventional message, on the lane branch. No push, no PR, no deploy.
6. **Deliberately-not-done list** — named, not silently dropped (adjacent debt gets flagged, not fixed).

## Cross-references

- [`seq-lane-build` SKILL.md](../../../.claude/skills/seq-lane-build/SKILL.md)
- [Fan-out session recipe](../fan-out-session-recipe.md)
- [Recipe — Orchestrator](orchestrator.md) — dispatches lanes using this card
- [Recipe — Review Wave](review-wave.md) — what runs after a lane lands
