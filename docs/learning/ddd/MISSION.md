# Mission — Domain-Driven Design

## Why this matters (the grounding)

Black Belt Legacy is becoming a **platform**: a shared component library (`m-card`, AdminTaskBoard,
AdminKanban, design system) that stands up *two different products* — BBL (heritage/lineage) and the
Mammoth construction CRM. That only works if the **domain boundaries** are right. DDD is the toolkit
for that: bounded contexts, ubiquitous language, shared kernel, aggregates, anti-corruption layers.

The immediate, real decisions this learning grounds (see [ADR 0033](../../architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md)):

- Where does the **shared kernel** live so BBL and Mammoth share code without bleeding domains?
- Why must the **CRM/board language** (stage, lead, deal, pipeline) stay separate from the **BBL
  domain language** (Passport, Lineage, Rank, Claim)?
- How does `m-card`-as-one-card stay healthy when a Task, a Deal, and a Lead are different aggregates?

## Goal

Be able to **name the boundary** of any new feature, choose the right DDD pattern for crossing it,
and defend it — using BBL/Mammoth/AdminKanban as the running example.

## Format

- Lessons are tightly-scoped and tied to the decisions above.
- Each lesson ends with a quiz (desirable difficulty → storage strength, not just fluency).
- Insights land in `learning-records/` (the lesson-ledger); references in `RESOURCES.md`.
