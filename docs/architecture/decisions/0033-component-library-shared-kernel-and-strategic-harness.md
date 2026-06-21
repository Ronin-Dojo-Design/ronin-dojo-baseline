---
title: ADR 0033 — Component library as a shared kernel + strategic-harness posture
slug: adr-0033-component-library-shared-kernel-and-strategic-harness
type: decision
status: accepted
created: 2026-06-21
updated: 2026-06-21
last_agent: claude-session-0421
pairs_with:
  - docs/epics/mammoth-rebuild-crm-001.md
  - docs/epics/post-launch-clean-repo-001.md
  - docs/knowledge/wiki/files/admin-kanban-board.md
  - docs/knowledge/wiki/files/bbl-admin-task-board.md
  - docs/knowledge/wiki/files/m-card-pattern.md
  - docs/knowledge/wiki/component-design-system.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - architecture
  - ddd
  - strategic-programming
  - component-library
  - harness
  - adminkanban
---

# ADR 0033 — Component library as a shared kernel + strategic-harness posture

## Status

Accepted — SESSION_0421 ratified all decisions, including D1: the kernel lives in `packages/ui-kit`;
Mammoth consumes it in-repo for now.

## Context

A strategic-architecture pass (Giddy, through Ousterhout's *A Philosophy of Software Design* + DDD)
and a harness pass (against Matt Pocock's agentic-engineering framing) reviewed the
**AdminKanban / component-library epic** (`m-card` PWCC-002, `AdminTaskBoard` PWCC-001, `AdminKanban`
PWCC-007, the design system, `mammoth-rebuild-crm-001`) and how this session's work integrates.

The epic's thesis is sound: **boards are deep, general-purpose modules** — "config + data, zero
per-project code; brand = token swap" — and a CRM is `m-card` + magnetic drawer + task/pipeline board
with design tokens, so **Mammoth is just another token block**. That is a DDD **Shared Kernel** consumed
by two **bounded contexts** (BBL heritage/lineage; Mammoth construction-CRM), and a strategic
(not tactical) investment — the rare one in a session of mostly tactical wins.

Two unresolved tensions and one integration insight drove this ADR:

1. The same session **collapsed the repo to single-brand BBL** (README / glossary / project-context)
   while the epic **adds a second product (Mammoth) into the same repo** — pruning multi-tenancy with
   one hand, re-introducing it with the other.
2. The "brand-agnostic" board **leaks BBL at the persistence layer** (`wp-json/bbl/v1/...`), and
   "zero per-project code" is **aspirational** — domain logic is already creeping into config
   (`requires: orderConfirmed`, `reasonOnLost`, `sla`).
3. The **AdminTaskBoard is a task board** — and the session's worst accidental complexity is the
   markdown session/ledger sprawl (number collisions, 21 retro-closed sessions, six ledgers). The
   board is the deep module that can **replace** that shallow, collision-prone substitute.

Matt's framing converges with Ousterhout: invest strategic, lean the harness (procedure-based skills
over ability-based), push human checkpoints **far right** (toward deploy), keep **observability**,
sandbox + parallelize, and don't over-optimize for a model.

## Decision

**D1 — The component library is a real shared kernel, extracted from the BBL app. DECIDED.**
Extract `m-card`, the boards, and the design-system tokens into a workspace **package**
(`packages/ui-kit`), depended on by the BBL app *and* Mammoth — **not** ad-hoc shared
`apps/web/components`. Mammoth's surfaces consume the package; they do **not** bloat the
single-brand BBL app. (Revisit Mammoth-in-its-own-repo only when client isolation/billing demands it.)

**D2 — Persistence is a port, not a hardcoded endpoint.**
Boards persist through a `BoardStore` interface; `localStorage`, `wp-json/bbl/v1/...`, and any
Mammoth backend are **adapters**. No brand-specific endpoint in the reusable core. (Ousterhout:
stop the information leak; "brand-agnostic" must be true, not asserted.)

**D3 — `m-card` is a presentation view-model over distinct domain aggregates.**
One card for `task | deal | record` at the **UI** layer (deep module); **not** one data model.
A Task, a Deal, and a Lead keep separate aggregates/invariants behind the existing `DTO` +
`view-model` seam. The card never becomes the domain model.

**D4 — Separate the platform/CRM ubiquitous language from the BBL domain language.**
CRM/board vocabulary (stage, pipeline, lead, deal, intake, rotting, SLA, `m-card`, PWCC) is a
**distinct bounded context** and must **not** be merged into the BBL domain glossary
(`ubiquitous-language.md`: Passport, Lineage, Rank, Claim). The `files/` spec catalog is that
platform context's language.

**D5 — The first build must prove the "zero per-project code" thesis with a number.**
The first consumer (m-card + one board + one Mammoth surface) **reports the per-project config/LOC
delta**. If config sprouts conditionals (config-that-is-code), the thesis is failing — complexity
moved, not removed. This is a gate, not a vibe.

**D6 — The AdminTaskBoard is the target queue / observability / governance surface.**
Direction: spike whether cards replace the markdown SESSION files + the six ledgers. Matt's
"queue + observability over infinite loops + markdown" and the Ousterhout deep-module argument
converge here — this is the highest-leverage integration.

**D7 — Lean the harness toward procedure-based skills (Matt's blank-slate).**
Audit `.claude/` + `CLAUDE.md`: classify every skill/auto-trigger as **procedure** (user-invoked,
e.g. `/pr-fix-loop`, `disable-model-invocation`) vs **ability** (auto-invoked). Demote/delete
ability-based bloat (the every-turn autopilot) until the base model is legible; re-layer only
controlled procedures. (Reinforces the SESSION_0421 Kaizen "trim CLAUDE.md / two-tier rituals" rec.)

**D8 — Keep human checkpoints far-right; sandbox + parallelize the builds.**
Affirm `pause-on-merge` (the checkpoint sits at the merge/deploy — the far right). Builds run as
**sandboxed, parallel** units (worktree isolation, branch-only fixes, cloud prompts; next step:
sandboxed CI / GitHub Actions).

## Consequences

- The single-brand prune and the multi-client reuse **stop contradicting**: the kernel is shared
  code, each product is a thin consumer. The BBL app stays lean.
- "Brand-agnostic" becomes verifiable (D2) and falsifiable (D5) rather than aspirational.
- The board epic gains a strategic payoff beyond UI: it becomes the **operating surface** (D6).
- The harness gets smaller and more legible (D7); checkpoints and sandboxing already align (D8).
- Cost: D1 + D2 add upfront indirection (a package boundary, a store port) before the first board
  ships — deliberate strategic investment, per Ousterhout/Matt.

## Alternatives considered

- **In-repo shared `apps/web/components` + Mammoth in-repo** (status quo of the spec): least upfront
  work, but re-bloats the repo being pruned and keeps the persistence leak — rejected (D1/D2).
- **No port; localStorage + wp-json inline** (the spec as written): fastest to a BBL demo, but
  brand-agnosticism is then false on first contact with Mammoth — rejected (D2).
- **One universal card data-model**: simpler types, but collapses three aggregates' invariants —
  rejected (D3).

## References

- Ousterhout, *A Philosophy of Software Design* — deep modules, information hiding, strategic vs
  tactical, pull complexity down, different-layer-different-abstraction.
- Evans, *Domain-Driven Design* — bounded context, ubiquitous language, shared kernel,
  anti-corruption layer, aggregates.
- Matt Pocock (agentic engineering) — procedure vs ability skills, push checkpoints right,
  observability, sandbox + parallelize, blank-slate the harness, don't over-optimize for a model.
- Session: SESSION_0421 (Giddy + Matt passes); DDD lesson-ledger at `docs/learning/ddd/`.
