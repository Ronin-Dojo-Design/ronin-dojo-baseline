---
title: "SESSION 0525 — Petey plan: BBL Design & Experience epic (5 streams)"
slug: session-0525
type: session--plan
status: open
created: 2026-07-10
last_agent: claude-session-0525
pairs_with:
  - docs/product/black-belt-legacy/design-experience-epic.md
  - docs/product/black-belt-legacy/BBL_PARITY_SPEC.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0525 — Petey plan: BBL Design & Experience epic

**Planning only — no code.** Fresh planning session (fired off `origin/main` @ `2bf6c06b`, which has
SESSION_0523's galaxy-on-beta + WL-P2-46 read-collapse). Ran in parallel with the Codex **SESSION_0524**
WP-belt-backfill lane — **not touched**. Held at the push gate.

## Goal

Grill the open decisions across the operator's five design/experience streams, produce the old-vs-new diff
per stream, and slice the work into parallel build sessions with dependencies + agent routing. Output =
[`design-experience-epic.md`](../product/black-belt-legacy/design-experience-epic.md).

## What happened

- **Discovery fan-out** — 5 read-only Explore agents (one per stream) produced old-vs-new diffs against the
  original BBLApp (`ronin-dojo-monorepo/src/brands/blackbeltlegacy/`) + confirmed/corrected the dispatch
  facts. Key **corrections to the dispatch note**:
  - **Globe:** `DirectoryProfile` already carries structured `locationCity/Region/Country` (per-member,
    seeded) — the dispatch missed it; makes member-location the lowest-friction pin source. Zero lat/lng
    anywhere, so geocode + coordinate storage is unavoidable either way.
  - **Technique:** the carousel is **fully greenfield** (only `VideoCarousel` is discipline-scoped +
    stubbed); belt is dark end-to-end; no premium field exists.
  - **Directory/profile:** already blueprinted by `BBL_PARITY_SPEC.md` (SESSION_0408) — refresh, not
    restart; tier packaging fully wired (no work); `/me` owner arm is dead-but-present (delete, per
    TICKET-0502-A) — TICKET-0502-A's "two-tree merge" is superseded.
  - **Blog:** both surfaces live — Blog `Post` `/blog` (staff) vs Community `CommunityPost` `/posts`
    (members); the "Community Feed" landing promo is mislinked to `/blog`.
- **Dirty Dozen roster grounded** in the BJJ Heroes canonical list — the five Machado-promoted members
  (#8–#12: Bob Bass, Rick Williams, Chris Haueter, David Meyer, John Will) = the BBL-featured set.

## Decisions resolved (operator, this session)

See [`design-experience-epic.md` §0](../product/black-belt-legacy/design-experience-epic.md). Summary:
D1 proceed-now (additive schema OK) · D2 add pmndrs postprocessing · D3 per-video free/premium toggle
(metadata free) · D4 Dozen = the five Machado members (Bob Bass framed first) · D5 staff-blog gallery below
the community-posts CTA.

## Next session

Execute the epic. Recommended **Wave 1** (pure presentation, zero schema): galaxy-polish (A0→A2),
directory/profile-parity (C0→C5), blog/dozen (E), technique belt-facet + rails (D1–D2). Each is a disjoint
worktree lane → Cody build → Doug/Desi verify → hold at push gate. **Wave 2** (additive schema, coordinate
the two `schema.prisma` edits): globe (B), technique gating (D0/D3). **Wave 3:** directory map (C6, on B0).

## Task log

| Task | Status | Notes |
| --- | --- | --- |
| SESSION_0525_TASK_01 | landed | Discovery fan-out (5 streams) + grill + sliced epic plan → `design-experience-epic.md`. Planning only; no code. Held at push gate. |
