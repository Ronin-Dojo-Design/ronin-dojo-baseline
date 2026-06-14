---
title: "Lineage future ideas — tier-gated tree + carousel (notes, not a committed plan)"
slug: petey-plan-0387
type: notes
status: notes
created: 2026-06-14
updated: 2026-06-14
last_agent: claude-opus-4-8-session-0387
pairs_with:
  - docs/petey-plan-0379.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/architecture/source/raw/SESSION_0387_lineage_students_carousel_watershed_60b_raw.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Lineage future ideas — tier-gated tree + carousel

> **Notes, not a committed epic.** SESSION_0387 grilled this as a 5-slice epic, then the operator
> deliberately **stripped it back to KISS**: ship the one fun thing (the drawer StudentsCarousel) and
> keep the bigger vision as ideas here. The carousel **shipped in SESSION_0387**. Everything below is a
> parking lot — pull an item into a real plan only when it earns its own session.

## What shipped (SESSION_0387)

- **StudentsCarousel** in `LineageProfileDrawer` (info tab): belt-grouped collapsible cards → horizontal
  avatar rail → tap to recursively swap the drawer to that student. Lineage students = the focal
  member's visual children, read from the in-memory member set. No schema, no gating. ~50-line
  self-contained component + native scroll + inline grouping.
- A **KISS `DrawerBody` refactor** that fell out of it: `deriveDrawerProfileView()` + `<DrawerIdentityHeader>`
  (DrawerBody CRITICAL 51 cyclo → HIGH 8).

## Parking lot (future, only if each earns a session)

- **Tier-gated main tree** — make the tree sparse/prestige: nodes = senior-belt (Black/Coral/Red) School
  Owners, Elite tier or invited; everyone else lives in the carousel. The monorepo did this with
  `canShowStudentsCarousel(tier)` + an `isLegacyProfileType` override for historical figures (Dirty Dozen
  aren't subscribers) — see the raw source. **Needs schema/policy.**
- **Per-instructor school sub-tree canvas** (`scopeType=SCHOOL`) — students as real nodes on a second canvas.
- **Member roles + partner lanes** — PARTNER/ASSISTANT/INSTRUCTOR/STUDENT placement (the `petey-plan-0379`
  §0379-B1 gap). Needs schema.
- **Focal-zoom refinement** (operator note) — the View A re-center/zoom feel.
- **Cohort containers on the main tree** (the original "0379-7 cohort stacking") — `LineageVisualGroup`
  already models this (`groupType`/`promotionDate`/`parentMemberId`); synthesize group-as-node in the
  client adapter (`buildChildGroups`). Tier-gating reduces its urgency (fewer nodes on the tree).
- **Carousel polish** — squircle action row (View Profile / Share), Verified badges on avatars, Embla
  `Carousel` (snap/controls) in place of native scroll, recursion back-stack/breadcrumb.
- **Drawer hotspots** — `InfoTab` (cyclo ~28, 6 presentational sections) and `LineageTab` could be split
  next time the drawer is opened up.

## Cross-references

- [Petey Plan 0379](petey-plan-0379.md) — View A engine epic; §0379-B1 = roles/partner gap.
- [Lineage Hub](runbooks/domain-features/lineage-hub.md) · [ADR 0026](architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md)
- Raw source: [Watershed 60B/60C StudentsCarousel](architecture/source/raw/SESSION_0387_lineage_students_carousel_watershed_60b_raw.md)
