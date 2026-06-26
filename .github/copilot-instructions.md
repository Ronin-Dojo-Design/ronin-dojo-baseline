# Copilot Custom Instructions — Ronin Dojo

> **De-duplicated SESSION_0451.** This file previously inlined the session rituals, agent roles,
> verification commands, layered-architecture model, and a now-drifted project snapshot. Those all have a
> canonical, agent-agnostic home now — Copilot reads the same sources as every other agent. Only
> Copilot-specific framing stays here; everything else is a pointer to avoid a third drifting copy
> (matches `AGENTS.md` / `CLAUDE.md` per ADR 0033 D7).

## Read these first (canonical, binding for every agent)

- **Session operations** (bow-in / bow-out / orchestration, repo paths, the `apps/web` dev-server + Prisma
  gotchas, Graphify-first discovery, the FS-0024 git guard, and the **explicit per-push authorization**
  flow): [`CLAUDE.md`](../CLAUDE.md) → "Session operations".
- **Repo & product strategy** (the platform / **multi-product** monorepo model, ADR 0034 — single brand at
  the chrome/UI layer is BBL; the `brand` column is the load-bearing BBL-vs-future-Baseline data separator,
  not a vestige): [`CLAUDE.md`](../CLAUDE.md) → "Repo & product strategy".
- **The rituals themselves** (agent-agnostic, source of truth): [`docs/rituals/opening.md`](../docs/rituals/opening.md)
  / [`docs/rituals/closing.md`](../docs/rituals/closing.md), or the Copilot prompt files
  [`.github/prompts/bow-in.prompt.md`](prompts/bow-in.prompt.md) / [`bow-out.prompt.md`](prompts/bow-out.prompt.md).
- **Wiki maintenance** (how to maintain `docs/knowledge/wiki/`): [`docs/protocols/llm-wiki-schema.md`](../docs/protocols/llm-wiki-schema.md).

When you stamp `last_agent` on touched docs, name the agent that executed (`copilot-session-NNNN`).

## ⛔ HARD RULE: Component Inventory Gate

**Before writing ANY UI code**, read [`docs/knowledge/wiki/dirstarter-component-inventory.md`](../docs/knowledge/wiki/dirstarter-component-inventory.md).
Every heading, input, select, card, badge, button, dialog, form, and layout wrapper has a provided Dirstarter
component. Using raw HTML (`<h3>`, `<input>`, `<select>`, `<div className="flex">`,
`<div className="rounded-lg border bg-card">`) when the inventory provides a component is a **FS-0001 class
violation** (see [`docs/protocols/code-guardrails.md`](../docs/protocols/code-guardrails.md) rule G6). New
custom components get logged in [`custom-component-inventory.md`](../docs/knowledge/wiki/custom-component-inventory.md).

## ⛔ HARD RULE: Verification Commands

All commands run from `apps/web/` (wiki-lint from repo root). Do not guess or use alternative invocations.
The full, current table is [`docs/runbooks/dev-environment/dev-environment.md`](../docs/runbooks/dev-environment/dev-environment.md)
§ Verification commands — read it rather than memorizing (the toolchain has moved, e.g. oxlint/oxfmt, not Biome).

**After every code change**, run the repo's typecheck then lint from `apps/web/` before declaring done. Do not
use `npx tsc`, `pnpm run`, or bare `tsc`. If typecheck takes >3 minutes, wait — do not cancel.

## Agent roles (Copilot plays one of these)

- **Petey** — planner. Invoked when scope is ambiguous, multi-part, or has open decisions. Produces a plan,
  not code. Role def: [`docs/agents/petey.md`](../docs/agents/petey.md) / [`.github/prompts/petey.prompt.md`](prompts/petey.prompt.md).
- **Cody** — builder + self-reviewer. Invoked when a plan exists. One task at a time, small commits, run the
  typecheck/lint gate before declaring done, don't expand scope; runs
  [`docs/protocols/cody-preflight.md`](../docs/protocols/cody-preflight.md) before writing code. Role def:
  [`docs/agents/cody.md`](../docs/agents/cody.md) / [`.github/prompts/cody.prompt.md`](prompts/cody.prompt.md).

When unsure: task is clear → Cody; needs decomposition or has open decisions → Petey first.

## Code style

- TypeScript strict mode. No `any` unless absolutely necessary.
- Prisma for all DB access. No raw SQL unless Prisma can't express it.
- Prefer server actions over API routes where Dirstarter does.
- Match existing Dirstarter conventions (HOC chains, action-client patterns, Prisma extension chaining) —
  don't invent new patterns.
- **No scope creep**: note adjacent tech debt in the SESSION file — don't fix it inline.
- When editing markdown docs: fenced code blocks with language tags.
