---
title: "SESSION 0632 — Client-intake kernel: one module, three brand instances (WS-A/B/C)"
slug: session-0632
type: session--open
status: staged
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0625
sprint: S12
lane: repo
goal_ids: ["G-021", "G-027"]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0625.md
  - docs/protocols/recipes/Client_Meeting_Intake.md
  - docs/product/rdd/brand-brief.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0632 — Client-intake kernel (WS-A/B/C)

> **Pre-staged stub (ADR 0049), staged by [SESSION_0625](SESSION_0625.md).** Operator directive:
> *"We need this client intake setup for RDD but also for MMB for their clients (Metal Building
> Sales) — set that up as next session or in a WS ABC."*

## Goal

Turn SESSION_0625's single-app `/app/client-intake` into **one brand-agnostic kernel feature-module
with per-brand questionnaires**, and stand up the **Metal Building Sales** instance so Mammoth can
run discovery on *their* prospects — not just RDD on *its* clients.

This is the ADR 0051 model made literal: *any feature-module can run on any app.* The intake stops
being a BBL page and becomes a module the RDD app and the Mammoth CRM both mount.

## Where it stands (built SESSION_0625 — read before planning)

| Piece | Where | State |
| --- | --- | --- |
| Pure core — `Questionnaire` data, `toMarkdown`, `answeredCount`, `clientSlug` | `apps/web/components/app/client-intake/questions.ts` | ✅ built, 10 tests, zero deps |
| Interactive form (L1 primitives, localStorage, copy/download, no server call) | `apps/web/components/app/client-intake/client-intake-form.tsx` | ✅ built |
| Route + authz key `client-intake.manage` | `apps/web/app/app/client-intake/page.tsx`, `server/orpc/roles.ts` | ✅ built |
| RDD's 15 discovery questions (de-Tableau'd from the `.docx`) | same `questions.ts` | ✅ built |

**The problem it leaves:** the core is pure and portable, but it lives inside `apps/web` and the form
is built on `~/components/common/*` L1 primitives. `clients/mammoth-build-crm` is a **standalone bun
app** (not a workspace member; consumes `packages/ui-kit` via `file:`) and **cannot import either**.
That is the exact "kernel can't import an app L1" shape from [ADR 0040 Option B / G-005] — extract
the core down, don't fork it up.

## `/gq` discovery (SESSION_0625, canonical graph — 19,797 nodes)

Query: *client intake questionnaire form reuse ui-kit kernel extraction mammoth-build-crm feature
module portability*. Surfaced **[`docs/product/rdd/brand-brief.md` §7 "Kernel feature-modules RDD's
app runs"](../product/rdd/brand-brief.md)** — the canon table this module belongs in (it currently
lists "Leads / contact intake" as `[REUSE]`; client intake is its missing sibling). Also surfaced the
`new-brand-interview-*` recipe family as the doc-side cousins of the same intake motion.

## Work streams

### WS-A — Extract the intake kernel (gates B and C; run FIRST, inline)

- **Owns:** `packages/ui-kit/src/intake/*` (new) · `packages/ui-kit/src/index.ts` ·
  `packages/ui-kit/package.json` (add an `./intake` export) · then retarget
  `apps/web/components/app/client-intake/questions.ts` to re-export from the kernel.
- **Shape:** a `Questionnaire` type (`{ id, title, sections: { title, questions }[] }`) plus the
  serializer/counters. **Zero runtime deps, zero React** — ui-kit's React is a *peer* dep, and a
  standalone bun app has to import this without pulling one in.
- **Done means:** the 10 existing `questions.test.ts` assertions pass **unchanged** against the
  kernel (behavior-preserving extraction, not a rewrite); `apps/web` typecheck + build green.
- **Size:** small. One coherent inline Cody — not a fan-out.

### WS-B — The Metal Building Sales questionnaire (MMB content)

- **Owns:** `packages/ui-kit/src/intake/questionnaires/metal-building-sales.ts` + its test.
- **Content to cover** (from Michael's 2026-07-18 notes + MMB canon): the **four commercial lanes**
  — steel building supply · erection/install · concrete & excavation · building-only vs
  building + install — plus building spec/size, site readiness, permits/jurisdiction, delivery
  window, **Installation Path** (`Mammoth-Installed` / `Customer-Installed`, already canon in
  [`CONTEXT.md`](../product/mammoth-build/CONTEXT.md)), budget/financing, and decision-maker.
- **Why it matters beyond the form:** this is the first real consumer of the commercial-lane
  taxonomy, which SESSION_0625's intake audit found **unrouted** (GAP-1 — only the two Installation
  Paths reached canon; steel-supply-only and concrete+excavation have no home). Landing it here
  gives the drafted `MB-LANE-001/002` stories a reason to exist.
- **Depends on:** WS-A's exported type only — authorable in parallel with WS-C.

### WS-C — Mount the MMB instance in `clients/mammoth-build-crm`

- **Owns:** `clients/mammoth-build-crm/app/intake/*` + its local components. Built on **ui-kit
  m-card/tokens**, never `apps/web`'s `~/components/common/*` (it cannot reach them).
- **Standalone-client gotchas (do not rediscover):** `clients/*` are **not** bun workspace members —
  own `bun install`, own `bun.lock`, `file:` ui-kit resolved by a postinstall symlink. Root
  `test`/`lint` **never** cover them; client CI is **typecheck only**. UAT pattern is scratch-DB +
  fixture-login + in-page fetch.
- **Depends on:** WS-A. Disjoint from WS-B (different package, no shared file).

## Open decisions — pin these BEFORE dispatch (petey-plan: grill the forks first)

1. **Does the MMB intake persist, or export-only like RDD's?** Mammoth has real `Contact` /
   `Company` / `Project` / `Activity` models, so an intake that *creates a lead* is arguably the
   whole point — but that turns a zero-write demo-safe form into a CRM write path. **If persist:**
   reuse the SESSION_0582 `lib/contact-match.ts` dedupe matcher, never a second matcher, and keep
   the "explicit commit, never enrich/overwrite" posture MB-LEAD-002 already ratified.
2. **Where does RDD's own instance live?** It is in `apps/web` (BBL) today because that is what is
   deployed and authed. `apps/rdd` exists (a bare skeleton on ui-kit) and is the *correct* long-term
   home — brand-brief §7 is literally the RDD app's module table. Move, mirror, or leave?
3. **Is the intake a `[REUSE]` row in brand-brief §7?** If yes, add it to that table as part of WS-A
   so the canon stops under-counting the kernel.
4. **Does MMB's intake need the `contains_real_data` toggle at all?** For Mammoth's own prospects,
   real data is the point — the demo-safe switch is an RDD-consulting concept, not a CRM one.

## Parallelism

**WS-A gates both.** Run WS-A inline (small, behavior-preserving), then dispatch **WS-B ∥ WS-C** as a
real two-lane fan-out — separate worktrees, disjoint file sets, one merge owner
([`seq-lane-build`](../../.claude/skills/seq-lane-build/SKILL.md), LR 0018 / FS-0034).

## Done means

- One kernel intake module; **three** questionnaires possible from it (RDD's 15, Metal Building
  Sales, and whatever comes next) with **no forked serializer**.
- `apps/web`'s existing route works unchanged off the kernel — the 10 extraction tests prove it.
- Mammoth can run a Metal Building Sales discovery call end-to-end in their own app.
- The four commercial lanes have a real consumer; GAP-1's `MB-LANE-001/002` are either landed or
  explicitly deferred with a reason.
- Decisions 1–4 above are answered and recorded (ADR where they are architectural).

## Task log

<!-- filled at bow-in -->

## Status

Single source of truth is the frontmatter `status:` field.
