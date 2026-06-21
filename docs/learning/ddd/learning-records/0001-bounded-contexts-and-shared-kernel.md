# 0001 — Bounded contexts, ubiquitous language, and the shared kernel

**Date:** 2026-06-21 · **Lesson:** 1 · **Tied to:** ADR 0033 (D1, D3, D4)

## The lesson in one breath

A **bounded context** is a boundary inside which one model and one language are consistent. BBL
(Passport/Lineage/Rank/Claim) and Mammoth (Lead/Deal/Pipeline/Stage) are **two bounded contexts** —
the *same word* would mean different things, so they get *different models*. When two contexts must
share code, the safest sanctioned overlap is a **Shared Kernel**: a small, jointly-owned core
(here: `m-card` + design tokens + board engine) that **neither context is allowed to bend toward its
own domain.** That's why the board persistence must be a port (D2) and `m-card` must stay a
*presentation* view-model, not a shared *domain* model (D3).

## Non-obvious insights (what to remember)

1. **The boundary is about *language*, not folders.** Two contexts can live in one repo; what makes
   them separate is that a term (`status`, `member`, `owner`) means different things on each side.
2. **A Shared Kernel is a liability you accept on purpose.** It's tightly co-owned; every change needs
   both contexts' consent. Keep it *small* (UI + tokens), never let domain rules leak in.
3. **Ubiquitous language is per-context.** Merging BBL's glossary with the CRM's would create exactly
   the drift DDD exists to prevent (D4). Two glossaries is correct, not duplication.

## Zone of proximal development (next)

- 0002 — Aggregates & invariants: why Task ≠ Deal ≠ Lead even though they're all `m-card`s (D3).
- 0003 — Context mapping patterns: Shared Kernel vs Customer/Supplier vs Anti-Corruption Layer — and
  which one BBL↔Mammoth actually is.

## Open question to resolve with the operator

D1: does the shared kernel live in `packages/ui-kit` (in-repo) or its own published package
(Mammoth in its own repo)? This is a **context-mapping** decision, not just a build-tooling one.
