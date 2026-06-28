---
title: "Research Review — the repeatable new-client onboarding process (skill vs app vs protocol vs loop vs script)"
slug: research-review-new-client-onboarding
type: research-review
status: active
created: 2026-06-27
updated: 2026-06-28
last_agent: claude-session-0459
pairs_with:
  - docs/runbooks/onboarding/new-client-runbook.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
  - docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - research-review
  - onboarding
  - new-client
  - process-design
  - skills
  - runbooks
---

# Research Review — the repeatable new-client onboarding process

> **Question (operator, SESSION_0459):** we will set up new client projects inside the monorepo (each
> with its own database) **often**. What is the best *form* for that repeatable process — a skill, an
> app, a protocol, a loop, a script, or something else? Thought through as **Petey** (plan) + **Giddy**
> (review) + a research review of the alternatives.

## TL;DR — decision

**A Skill + Runbook pair, with an optional future scaffold script.**

- **Runbook** ([`new-client-runbook.md`](../runbooks/onboarding/new-client-runbook.md)) = the
  agent-agnostic source of truth: every step, gate, and done-criterion.
- **Skill** ([`/new-client-recipe`](../../.claude/skills/new-client-recipe/SKILL.md)) = the invokable
  entrypoint that *executes* the runbook with operator gates and judgment.
- **(Later) a thin scaffold script** for the purely-mechanical bits (copy template, `createdb`,
  stamp names) — built only when the manual copy becomes the bottleneck (YAGNI until then;
  `operator-script-caution` says show it before running).

This exactly mirrors the repo's proven `/bow-in` → `opening.md` and `/bow-out` → `closing.md` pattern:
**a skill is a thin trigger; a doc is the source of truth.** Both were created this session and
dogfooded on Mammoth Build CRM.

## What we already have (the repo's grain)

The repo has a clear, repeated convention for "a repeatable thing an agent does":

| Pattern | Examples | Shape |
| --- | --- | --- |
| **Skill → ritual/runbook doc** | `/bow-in`→`opening.md`, `/bow-out`→`closing.md`, `/code-quality`→matrix | thin invokable trigger; doc is SoT |
| **Runbook** | `schema-migration`, `per-app-db-separation`, `database` | canonical procedure, agent-agnostic |
| **Protocol** | `petey-plan`, `loop-of-loops`, `review-recommend` | *orchestration patterns*, not concrete procedures |
| **Loop (skill)** | `/loop`, `/pr-fix-loop` | recurring/interval/polling work |
| **Script** | `scripts/ledger-backlog.ts` | deterministic mechanical computation |

Designing *with* this grain (not against it) is the whole point — a new mechanism would be the
reinvention the repo's "one card / one kernel" ethos forbids (cf. learning record 0002).

## Options considered

### A. Skill + Runbook — ✅ chosen

- **Why it fits:** onboarding is a *concrete, repeatable procedure with judgment + side-effect gates*
  (schema design from a brief, brand tokens, deploy wiring; install/DB/deploy/push gates). A runbook is
  the canonical home for a procedure; a skill makes it one-command invokable and encodes the gates. It's
  the exact bow-in/bow-out shape, so zero new concepts for the operator or future agents.
- **Cost:** two small docs (done). The skill stays thin; all detail lives in (and stays current in) the
  runbook — single source of truth, no drift.

### B. Standalone scaffolding app / generator — ❌

- A `create-ronin-client` CLI/app could template the boilerplate. **Rejected for now:** it's a new
  artifact to build, version, and maintain; most of onboarding is *judgment* (translate a client brief
  into a schema, choose brand tokens, wire deploys), which a generator can't do. The mechanical 10% can
  become a small *script* the skill calls later (option E) without standing up an app.

### C. Protocol — ❌

- Protocols in this repo are *orchestration patterns* (how Petey plans, how the loop-of-loops runs), not
  step-by-step procedures. New-client setup is a procedure → it belongs in a runbook. (The skill may
  *invoke* `petey-plan` for the intake/brief, but the recipe itself is not a protocol.)

### D. Loop — ❌

- Loops (`/loop`, `/pr-fix-loop`) are for recurring, interval-driven, or polling work. Onboarding a
  client is a **discrete event**, not a loop. "We do it often" ≠ "it runs on a timer." Wrong tool.

### E. Script only — ❌ (but partially yes, later)

- A pure script can't make the judgment calls and can't honor the show-before-run gate culture for the
  side-effecting steps. **But** the mechanical subset (scaffold copy, `createdb`, name stamping) is a
  fine candidate for a `scripts/new-client-scaffold.ts` the *skill* invokes once the manual copy is the
  bottleneck. Defer until then.

## Petey lens (plan sanity)

- **Single coherent slice, dogfooded.** The recipe was authored *and* run against the first real client
  (Mammoth) in the same session — the strongest validation a process doc can get.
- **Gates are explicit and match standing prefs** (`operator-script-caution`,
  `explicit-push-authorization`): install, DB create/migrate, deploy/Neon, push.
- **No throwaway work.** The runbook references the existing `per-app-db-separation` runbook for the DB
  half instead of duplicating it (DRY across docs).

## Giddy lens (review / what could rot)

- **Drift risk:** two docs describing one process can diverge. **Mitigation:** the skill is deliberately
  thin and *defers* to the runbook for all detail — the runbook is the only place steps live.
- **Over-abstraction risk:** building the generator app now (option B) would be speculative for an
  N-of-1 (Mammoth). Correct call is skill+runbook now, script later, app probably never.
- **Completeness:** the runbook ends in a **Done-means checklist** with two non-negotiable proofs
  (standalone `bun.lock` with root untouched; empty isolation diff) — so "done" is verifiable, not
  vibes.
- **Verdict:** designed with the repo's grain, dogfooded, gated, DRY, falsifiable done-criteria.
  **Pass.**

## Outcome

Implemented this session: the [runbook](../runbooks/onboarding/new-client-runbook.md) + the
[`/new-client-recipe` skill](../../.claude/skills/new-client-recipe/SKILL.md), proven on
[Mammoth Build CRM](../product/mammoth-build/PRD.md). Future enhancement: a thin
`scripts/new-client-scaffold.ts` for the mechanical copy, built when manual scaffolding becomes the
bottleneck.
