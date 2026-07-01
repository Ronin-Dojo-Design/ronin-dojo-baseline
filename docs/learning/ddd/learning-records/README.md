---
title: "Giddy Learning Records — index"
slug: learning-records-index
type: index
updated: 2026-06-30
---

# Giddy Learning Records — index

One-line-per-record index of the **Giddy learning records** — the durable *lessons* of past sessions
(the reasoning behind a fix, not the fix itself). Bow-in (`opening.md` §3b) points here so a fresh
session can skim for a record touching today's lane **before** re-deriving a model or re-incurring a
lesson. Read the one(s) on your lane; don't bulk-read. Newest first.

| # | Record | The lesson in one line |
| --- | --- | --- |
| 0008 | [One source read everywhere; "display-dead" isn't "removable"](0008-one-source-read-everywhere-and-the-display-dead-field.md) | Consistency across surfaces = **one resolver read everywhere**, not N surfaces hand-synced; a field with no readers today can still be load-bearing tomorrow — prove it dead before deleting. |
| 0007 | [The discoverability heuristic; "built" isn't "pointed"](0007-the-discoverability-heuristic-and-built-not-pointed.md) | The dead-code heuristic over-flags the **load-bearing**; and building an artifact (doc/board/agent) does nothing until the **read-path points at it**. (This audit's own root cause.) |
| 0006 | [Design systems & UI kits](0006-design-systems-and-ui-kits.md) | A design system = **one foundation + a few single-purpose pieces**, not three half-systems or a `kind`-union god-component; tokens are the contract. |
| 0005 | [Extract the L1 down, don't clean-room it](0005-extract-the-l1-down-dont-cleanroom-it.md) | When the kernel can't import an app's L1 component, **extract it down** into the kernel — don't reinvent a clean-room copy that drifts. |
| 0004 | [From a read projection to a stored table without drift](0004-projection-to-stored-table-without-drift.md) | Promoting a derived read-model to a persisted table needs a **single write path + backfill**, or the store and the projection drift. |
| 0003 | [Context mapping & database-per-context](0003-context-mapping-and-database-per-context.md) | Draw the bounded-context boundary; **a database per context** (separate DB per product) keeps the seam honest. |
| 0002 | [The shared kernel, in practice](0002-shared-kernel-in-practice.md) | What actually belongs in the shared kernel (`ui-kit`) vs a product — and how a token travels while Tailwind doesn't. |
| 0001 | [Bounded contexts, ubiquitous language, the shared kernel](0001-bounded-contexts-and-shared-kernel.md) | The DDD foundation: bounded contexts, one ubiquitous language per context, and the shared kernel as the deliberate exception. |

> Maintenance: when a session writes a new learning record, add its row here (newest first) and — per
> `closing.md` — add a one-line row to `docs/knowledge/wiki/index.md` **Learning Records** section so the
> master index and the read-path both surface it. Filename-addressed-only records are invisible to the
> next session (LR 0007).
