---
title: "ADR 0024 — Data layer: next-safe-action vs oRPC + TanStack Query"
slug: adr-0024-orpc-vs-next-safe-action
type: decision
status: proposed
created: 2026-06-07
updated: 2026-06-07
last_agent: claude-session-0356
pairs_with:
  - docs/architecture/uplift/epic-2026-05-19.md
  - docs/architecture/dirstarter-baseline-index.md
  - docs/knowledge/wiki/dirstarter-gap-audit.md
  - docs/sprints/SESSION_0356.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0024 — Data layer: next-safe-action vs oRPC + TanStack Query

## Status

**Proposed** — awaiting operator ratification. Written SESSION_0356 to close a long-standing
governing-doc contradiction and a lost goal (the oRPC decision that was never recorded).

## Context

Ronin was forked from Dirstarter at `c42e8bb`, which uses **`next-safe-action`** for its
server-action/mutation layer. **Newer upstream Dirstarter has since moved to `oRPC` +
TanStack Query routers** (`dirstarter-baseline-index.md` §13k). So oRPC is *not* a Ronin
invention or a divergence — it is the data layer of a **later** Dirstarter than the one we
forked. "Use upstream Dirstarter" is already true; we are pinned to the version that predates
oRPC.

Three governing docs **contradict** each other on what to do about it, which is why the goal
kept getting lost:

- `epic-2026-05-19.md` locked: *"oRPC stance — ADR_0019 + lineage canvas pilot (3 sessions)"* → **do a pilot.**
- `dirstarter-gap-audit.md` line 124: *"No migration to oRPC planned. Deliberate long-term choice."* → **don't.**
- `dirstarter-baseline-index.md` §13k: *"oRPC remains ADR-level at L10. Do not mass-replace actions — ADR required before implementation."* → **undecided; ADR owed.**

The deciding ADR was **never written** ("ADR_0019" was reused for membership-lifecycle), and the
planned pilot sessions (epic lanes L10–L14) were **displaced** when the Base UI migration (L6)
ballooned from one lane into eight phases and consumed the session budget. Net: oRPC sits
**undecided and unbuilt**, while being misremembered as "done."

### Verified current state (SESSION_0356)

- `next-safe-action ^8.0.11` is present and drives **all** Ronin mutations, with brand context,
  audit, and rate-limit conventions layered on. It works.
- `@tanstack/react-query`, `@orpc/server`, `@orpc/client` are **absent**; there is **no `/api/rpc`**
  route. The `directory-query.tsx` / `tool-query.tsx` files are nuqs URL-state, not TanStack Query.
- **Toolchain is already modern:** Next `16.0.9`, React `19.2.2`, TypeScript `5.9.3`, Base UI `1.3`.
  → The "needs the Next 16 toolchain bump first" premise is **resolved** — adopting oRPC requires **no**
  toolchain bump. (Correcting an earlier session assumption that L14 never happened; it did, outside the ledger.)

### Why it keeps coming up

`next-safe-action` is server-action/form-shaped: great for mutations + RSC reads, weaker for
**highly interactive client surfaces** that want client-side caching, optimistic updates, and
fine-grained invalidation. The lineage canvas (real-time-shaped, interactive editing) and
directory filtering are the textbook TanStack-Query cases — which is exactly why the epic chose
the lineage canvas as the ideal pilot.

## Decision

**Hybrid, with a scoped pilot — not a mass migration, not a permanent "no".**

1. **`next-safe-action` + RSC remains the default** for all forms, mutations, and existing
   surfaces. **No mass replacement of the ~all existing domain actions** (per baseline-index §13k).
2. **Adopt `oRPC` + TanStack Query only for *new* UX-heavy interactive surfaces** where client-side
   caching / optimistic UX measurably beats RSC + server actions.
3. **Validate with one scoped pilot first: lineage canvas reads → `/api/rpc` + TanStack Query**
   (the epic's original pilot target — real-time-shaped, already-built domain). The pilot must
   preserve the brand-scope + audit/rate-limit + privacy-allowlist guarantees the action layer
   provides today; if it cannot, the pilot fails and we stay on next-safe-action.
4. **Sequencing gate:** the pilot (and any oRPC adoption) comes **before** building the
   profile-redesign Lane A and any new interactive feature, so new UX is not built on a layer
   we are about to change (the SESSION_0356 "do oRPC first for the *big* work" finding).

This supersedes the epic↔gap-audit contradiction: the epic's "pilot" intent wins for *new
interactive* surfaces; the gap-audit's "no migration" intent wins for *existing* surfaces.

## Consequences

- **Positive:** resolves the lost goal with a concrete next step (the pilot), not another "decide
  later"; no big-bang risk; the modern toolchain means low setup friction; new interactive UX gets
  the better data layer; existing working code is untouched.
- **Negative / cost:** during the pilot the app runs **two** data paradigms (acceptable, bounded to
  new surfaces); oRPC + TanStack Query are new deps + patterns to learn; the pilot must re-implement
  brand-scope/audit/rate-limit/privacy in the oRPC middleware or it is a non-starter.
- **Follow-ups:** (a) a dedicated **oRPC pilot session** (scaffold `/api/rpc`, TanStack Query
  provider, migrate lineage canvas reads, Playwright + cache-invalidation proof); (b) update the
  uplift epic + lane-ledger to reflect the true status (L1–L6 done; L7–L15 incl. oRPC not executed;
  `.dirstarter-upstream` still `pending`); (c) on pilot success, write the per-surface adoption
  criteria into this ADR and flip it to `accepted`.

## Alternatives considered

- **Stay on next-safe-action forever (gap-audit's literal stance).** Rejected: gives up real UX
  ceiling on interactive surfaces and permanently diverges from upstream Dirstarter's direction
  with no re-evaluation trigger.
- **Full migration to oRPC (epic's maximalist reading).** Rejected: high blast radius across all
  domain actions, hurts near-term velocity (the operator's stated pain), and risks regressing the
  brand-scope/audit/rate-limit conventions that next-safe-action already enforces.

## References

- `docs/architecture/uplift/epic-2026-05-19.md` (oRPC lock + lane index)
- `docs/architecture/dirstarter-baseline-index.md` §13k (oRPC = ADR-level, do not mass-replace)
- `docs/knowledge/wiki/dirstarter-gap-audit.md` line 124 (no-migration stance)
- `docs/knowledge/wiki/drift-register.md` (the epic↔gap-audit contradiction entry, SESSION_0356)
