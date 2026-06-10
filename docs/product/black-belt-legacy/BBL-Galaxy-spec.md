# Black Belt Legacy Galaxy v1 Spec

## Intent

Create a premium, public-facing Three.js lineage visualization for Black Belt Legacy that turns verified public lineage into a cinematic star-map experience.

This is not the editing surface. The existing 2D lineage tree remains the truth/editing mode. Galaxy mode is the prestige discovery layer.

## Visual target

The visual reference is a neural/star-map style interface:

- Three.js + Next.js + GSAP.
- Nodes represent important objects.
- Connections animate or evolve.
- Clicking a node zooms into details.
- Smaller connected nodes show related people/features.
- Scroll can later drive story/timeline transitions.

For Black Belt Legacy, translate that as:

```txt
Big stars        = Rigan / major lineage anchors / Dirty Dozen
Planets          = black belts / instructors
Moons            = students / direct descendants
Orbits           = promotion cohorts / timeline bands
Constellations   = grouped public trees
Click node       = existing lineage profile drawer
Camera path      = follow-lineage cosmic zoom
```

## Product decision log

| Decision | v1 choice |
|---|---|
| Brand focus | Black Belt Legacy only |
| Public scope | Whole galaxy of published public trees |
| Visual tone | NASA star map + historical museum + luxury documentary archive |
| Person identity | Person appears once per discipline per tree |
| Relationship display | One primary lineage path first |
| Trust state | Verified/published only; no disputed/unverified public stars |
| Click behavior | Reuse existing lineage profile drawer |
| Lineage animation | Yes, zoom/fly through lineage path |
| Grouping style | Timeline bands and grouped constellations |
| Initial size | About 50 nodes |
| Node media | Photo when available; initials fallback |
| Layout storage | Deterministic auto-layout for v1; cached/curated layout later |

## Why deterministic layout first

For a 50-node Dirty Dozen/Rigan demo, deterministic layout is the best first move:

- tiny storage footprint
- repeatable rendering
- no admin layout editor required yet
- easy to swap mock data for API data
- easy to cache approved positions later

Future layout maturity:

```txt
v1: deterministic layout from node generation/orbit metadata
v2: admin-pinned featured nodes
v3: approved cached coordinates per public tree
v4: story-mode camera paths per timeline chapter
```

## Architecture

```txt
Public lineage data
  -> safe BBL galaxy DTO
  -> deterministic layout
  -> Three.js galaxy viewer
  -> existing lineage profile drawer
```

Recommended repo paths:

```txt
apps/web/components/web/lineage/galaxy/
  BblLineageGalaxy.tsx
  BblLineageGalaxyDemo.tsx
  bbl-galaxy-layout.ts
  bbl-galaxy-mock-data.ts
  bbl-galaxy-types.ts

apps/web/app/(public)/lineage/galaxy/page.tsx
```

## Install

```bash
bun add three @react-three/fiber @react-three/drei gsap
bun add -d @types/three
```

## Data model projection

Galaxy mode should not query private profile data directly. It should receive a sanitized public DTO.

```ts
type BblGalaxyNode = {
  id: string;
  displayName: string;
  initials: string;
  slug: string;
  role: "ROOT_STAR" | "LEGEND_STAR" | "INSTRUCTOR_PLANET" | "STUDENT_MOON";
  discipline: "BJJ";
  rankLabel?: string;
  title?: string;
  photoUrl?: string;
  verifiedStatus: "VERIFIED";
  generation: number;
  orbitIndex: number;
  orbitTotal: number;
  groupId?: string;
  groupLabel?: string;
  timelineYear?: number;
  size?: number;
};
```

```ts
type BblGalaxyEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: "PRIMARY_LINEAGE" | "PROMOTED_BY" | "TRAINED_UNDER";
  verifiedStatus: "VERIFIED";
  groupId?: string;
};
```

## Security rules

Public galaxy data must include only:

- published tree data
- public display name
- public slug
- public rank label
- public-safe image URL if allowed
- verified relationships only
- public group labels only

Public galaxy data must not include:

- email
- phone
- private claim evidence
- private audit notes
- draft relationships
- disputed/unverified relationships unless a future explicit public mode is approved
- internal admin permissions

## UX behavior

### Default view

- black/gold luxury archive background
- starfield
- Rigan/lineage anchor centered
- Dirty Dozen/legend orbit around root
- instructors and students in outer rings
- timeline/group bands visible as subtle orbital rings

### Click node

- select node
- pulse/glow selected star
- GSAP camera flies toward node
- existing lineage profile drawer opens

### Reset view

- clears selection
- camera returns to overview

### Follow lineage

v1 starts at root. Future version should animate along:

```txt
Root -> Dirty Dozen legend -> instructor -> student branch
```

## v1 acceptance criteria

- Public route renders without SSR errors.
- Three.js scene loads client-side only.
- Mock graph renders about 50 nodes.
- Node hierarchy is visually distinct: root star, legend stars, instructor planets, student moons.
- Timeline/group rings render.
- Edges render between nodes.
- Node click selects node.
- Camera zooms to selected node.
- Profile drawer bridge works with mock drawer first and can be swapped for existing lineage profile drawer.
- Reset view works.
- No private data appears in mock/public graph.

## Follow-up tasks

```txt
TASK_01 Add docs/product/black-belt-legacy/BBL-Galaxy-spec.md
TASK_02 Add galaxy component folder and mock graph
TASK_03 Add public /lineage/galaxy route
TASK_04 Install Three.js/R3F/Drei/GSAP dependencies
TASK_05 Replace mock drawer with existing lineage profile drawer
TASK_06 Add search overlay
TASK_07 Add true follow-lineage path animation
TASK_08 Add public-safe API projection
TASK_09 Add postprocessing bloom/premium polish
TASK_10 Add scroll/timeline story mode
```
