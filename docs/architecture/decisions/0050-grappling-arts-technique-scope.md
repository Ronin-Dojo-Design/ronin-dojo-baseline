---
title: "ADR 0050 — Technique system scope: grappling arts (BJJ + judo + wrestling takedowns), no striking, no weapons"
slug: 0050-grappling-arts-technique-scope
type: adr
status: accepted
created: 2026-07-19
updated: 2026-07-19
last_agent: claude-session-0579
pairs_with:
  - docs/architecture/decisions/0046-technique-ownership-org-nullable-and-authored-by.md
  - docs/epics/technique-graph-curriculum-port.md
  - docs/epics/technique-graph-ga-fanout.md
backlinks:
  - docs/sprints/SESSION_0578.md
  - docs/sprints/SESSION_0579.md
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/goals-ledger.md
---

# ADR 0050 — Technique system scope: grappling arts (BJJ + judo + wrestling takedowns), no striking, no weapons

**Status:** accepted (SESSION_0578 grill, ratified as a blocking merge-gate at SESSION_0579's
close, G-022 Lane C). This is a BLOCKING merge-gate on Lane C per Giddy's SESSION_0578 close
condition — the lane does not push without it.

## Context

The technique-graph/curriculum port epic
([`technique-graph-curriculum-port.md`](../../epics/technique-graph-curriculum-port.md)) originally
scoped the system as **BJJ only** — the monorepo source ships eskrima/muay-thai/boxing/karate
curriculum too, but the epic deferred all of it, importing only the BJJ slices. At SESSION_0578's
operator grill (planning the G-022 "technique graph out of beta" fan-out), the operator's answer
to "what does the graph/curriculum system cover?" came back as a scope amendment, not a
confirmation of the existing BJJ-only line: **"BJJ and judo and wrestling takedowns — grappling
arts only, no striking or weapons."**

This flips the SESSION_0578 harvest-inventory verdict on the monorepo's Judo data (Kodokan Gokyo
no Waza first-20-throws seed + `judo.js`) from REJECT (out of BJJ-only scope) to ADAPT, and names
wrestling takedowns as in-scope content with **no source dataset** in the monorepo (an authoring
gap, tracked as a G-022 child, not a blocker).

## Decision

The BBL technique graph + curriculum library's product scope is **grappling arts**:

- **In scope:** Brazilian Jiu-Jitsu (existing), Judo (Kodokan throws — landed this lane,
  SESSION_0579), wrestling takedowns (named content gap — no dataset exists yet; an authoring
  task, not a lane blocker).
- **Never in scope:** striking arts (boxing, Muay Thai, Kajukenbo, Karate, Taekwondo, Wing Chun,
  Krav Maga's striking components) and weapons arts (Eskrima). These disciplines already exist
  elsewhere in the platform (org/membership/rank-system rows in `prisma/seed.ts`) for their own
  program/membership surfaces — this ADR scopes only the **Technique/TechniqueGraph/Curriculum**
  subsystem, not the platform's discipline roster generally.

This **supersedes** the port epic's "BJJ ONLY for now" line
([`technique-graph-curriculum-port.md`](../../epics/technique-graph-curriculum-port.md) — the epic
carries a forward-pointing stamp to this ADR as of SESSION_0578; that line is now historical).

## Consequences

- **Judo lands as its own discipline + style, not a parallel taxonomy.** `Discipline` (slug
  `judo`, already seeded system-wide in `prisma/seed.ts` alongside its own Kodokan Kyu-Dan
  `RankSystem`/`Rank` rows) + one new `Style` row (`kodokan`, scoped to the Judo discipline —
  mirroring the existing Karate-substyle idiom, the only prior precedent for `Style` rows in this
  schema). No new models, no parallel rank/belt system.
- **The graph (`bbl-bjj-graph.json`) is unaffected by this ADR.** New Judo `Technique` rows land
  **Library-dark for the graph** — visible in curriculum/library surfaces, absent from the
  visual graph — until a design lane (G-022 Lane A) adds multi-art layout slots. The importer
  does not require graph JSON presence to create a technique row.
- **Wrestling takedowns are a named, ledgered authoring gap** (no source dataset in the
  read-only monorepo harvest — SESSION_0578 TASK_02). Tracked as a G-022 child; content must be
  hand-authored (not harvested) when picked up.
- **Striking/weapons data already surveyed in the harvest (SESSION_0578) stays REJECTED** for
  this subsystem — nothing from eskrima/muay-thai/boxing/karate/PII exports is imported here, now
  or later, without a fresh ADR-level scope change.
- **The Technique model gained two additive, nullable/default-only columns** this lane
  (`nativeName String?`, `aliases String[] @default([])`) to carry Judo's Japanese
  terminology — a schema consequence of admitting Judo, not a scope decision in itself; see the
  SESSION_0579 migration (`20260719000000_add_technique_native_name_aliases`).

## Alternatives considered

- **Keep BJJ-only, defer Judo/wrestling indefinitely.** Rejected by direct operator instruction
  at the SESSION_0578 grill — the operator affirmatively broadened scope rather than confirming
  the status quo.
- **Model Judo as a BJJ-adjacent tag/category instead of its own Discipline.** Rejected: the
  platform already treats Judo as a first-class `Discipline` with its own `RankSystem` (seeded
  independently of this technique-graph work); reusing that existing row is the "do not invent a
  parallel taxonomy" instruction from the grill, and a tag cannot carry a rank system.
- **Open the door to all monorepo curriculum disciplines (eskrima/muay-thai/boxing/karate) at
  once.** Rejected — the operator's own wording is exclusionary ("no striking or weapons"), and
  the harvest inventory's REJECT verdict on that content stands.
