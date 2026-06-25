---
title: "ADR 0037 — Lineage branch heads & visual placement seeded from provenance"
slug: adr-0037-lineage-branch-heads-and-visual-placement
type: adr
status: accepted
created: 2026-06-24
updated: 2026-06-24
last_agent: claude-session-0444
pairs_with:
  - apps/web/prisma/schema.prisma
  - apps/web/server/admin/lineage/claim-finalize.ts
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/architecture/ubiquitous-language.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0037 — Lineage branch heads & visual placement seeded from provenance

> **Status / Applied (SESSION_0444, PR #162 `720a54da`):** the tree consolidation, slug rename
> (`bbl-lineage` → `rigan-machado-lineage`), and clone retirement described here are now APPLIED on prod
> (77 members, root Rigan, bjj discipline; clone + standalone `bbl-dirty-dozen` tree unpublished). See
> drift `D-033` (resolved).

## Context

The lineage tree must scale by *decentralizing* who maintains it: a single Rigan Machado root is
not enough — real instructors / school owners (Bob Bass, John Will, …) need to sit beneath the root
as **branch heads**, and their students need to be **filed under them** automatically when they join
or claim. The dual-model (ADR 0016) already separates **provenance** (`RankAward` +
`LineageRelationship PROMOTED_BY/INSTRUCTOR_STUDENT` — a multi-parent truth graph) from **display**
(`LineageTreeMember.primaryVisualParentMemberId` — a single visual parent per tree). SESSION_0442's
claim-finalize materialized the *provenance* edge for "trained under X" but left the new member's
`primaryVisualParentMemberId` **null**, so students landed as floating root-level orphans rather than
under their instructor's branch — the visual filing that is the entire point of branch heads never
happened.

## Decision

1. **Branch head is not a new entity — it is a role in the display projection.** A branch head is a
   real person-node placed directly beneath the tree root whose `LineageTreeMember` is the placement
   anchor (`primaryVisualParentMemberId` target) for that instructor's students. It is typically a
   placeholder node an admin adds; the holder later **claims it or accepts an invite**, which grants
   **branch-scoped `LineageTreeAccess`** to maintain the members beneath them. (Multi-tree federation
   per branch — `LineageTree.ownerNodeId` — is the eventual state, not now.)

2. **One canonical, brand-agnostic tree.** Collapse to a single `rigan-machado-lineage` tree (renamed
   from `bbl-lineage`, the full-roster import). Retire the Baseline→BBL clone projection
   (`seed-bbl-org.ts`) and the strict `{brand, slug}` scoping. The public discipline viewer resolves
   this one tree; the public tree and the real roster are the same row. (Follows the single-brand
   collapse — ADR 0034 / "multi-brand is dead".)

3. **Visual placement is a projection seeded from provenance, at finalize.** When a claim carries a
   `trainedUnderNodeId` and the claimed node lands in a tree, `finalizePassportClaim` sets the new
   member's `primaryVisualParentMemberId` to the **instructor's `LineageTreeMember` in that tree**.
   The `INSTRUCTOR_STUDENT` edge stays the truth; the visual parent is seeded from it and remains
   editable by a steward afterward.

4. **Edge case — instructor not a member of the tree:** leave the student at root and flag for the
   steward. Finalize never auto-creates the instructor's membership (no silently-fabricated branch
   heads).

## Considered options (placement wiring)

- **Persist at finalize (chosen).** Seed `primaryVisualParentMemberId` from the edge; editable later.
- **Derive at render time** from the `INSTRUCTOR_STUDENT` edge, persist nothing. Rejected: mixes truth
  into display and needs a tie-breaker when a person has multiple instructors (multi-parent provenance
  vs single visual parent).
- **Manual only** — steward drags each student under their branch. Rejected: does not scale; defeats
  the decentralization goal.

## Consequences

- `materializeRepresentTree` must accept/resolve the instructor's member and set the visual parent;
  `materializeTrainedUnder` continues to own the provenance edge. The two stay distinct (truth vs
  projection) but are now wired together at finalize.
- Existing root-orphan members created before this change are not retroactively re-parented by
  finalize; a one-shot backfill (or steward placement) handles them.
- Renaming `bbl-lineage` → `rigan-machado-lineage` on prod is a one-row slug update + a discipline-embed
  repoint, not a re-seed (prod is migrate-only; the roster was imported, not seeded).
