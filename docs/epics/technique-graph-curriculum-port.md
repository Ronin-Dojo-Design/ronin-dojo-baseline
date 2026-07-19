# Epic — Port the BJJ Technique Graph + Curriculum Library into BBL

> Hand-off epic for a cloud session. Self-contained (cloud sessions have no memory). Port the
> **TechniqueGraph** + **Curriculum Library** (BJJ only for now) from the old Vite monorepo into the
> BBL Next/Prisma app. Land it incrementally — each phase compiles.

## Repos

- **SOURCE (reference, READ-ONLY — do not modify):** `/Users/brianscott/dev/ronin-dojo-monorepo`
  — the older, feature-complete Vite/JSX app. A `blackbeltlegacy` brand variant exists at
  `src/brands/blackbeltlegacy/`.
- **TARGET:** `ronin-dojo-baseline` (a.k.a. `black-belt-legacy`) — Next 16, React 19, TSX, Prisma,
  oRPC. Single-brand BBL (pruning in place; deploys to `blackbeltlegacy.com`; the full site is behind
  the `/preview?token=bob-tony-BBL-preview` cookie; keep `bun run typecheck` + `next build` green).

## Scope

> **AMENDED (SESSION_0578, G-022):** the technique system's scope is now **grappling arts —
> BJJ + judo + wrestling takedowns; never striking or weapons**. See
> [`technique-graph-ga-fanout.md`](technique-graph-ga-fanout.md) + goals-ledger G-022; the
> ratifying ADR is a blocking merge-gate on lane SESSION_0579. The line below is historical.

**BJJ ONLY for now.** Defer eskrima / muay thai / boxing / karate (the source ships them; import only
the BJJ slices).

## Sources

**TechniqueGraph** — a *custom* canvas, NOT a graph lib:

- PREFER a BBL variant: search `src/brands/blackbeltlegacy/` (and `git log`) for a TechniqueGraph/canvas
  first; FALL BACK to `src/brands/tuffbuffs/components/canvas/`:
  `TechniqueGraphShell.jsx`, `useFlowCanvas.jsx`, `FlowCanvas.jsx`, `FlowNode.jsx`,
  `flowNodeConstants.js`, `TechniqueDetailModal`, `bjjCanvasData.js` (`BJJ_NODES` / `BJJ_EDGES`).
- Features to preserve: zoom / pan / fit controls, keyboard-navigable nodes (a11y), node-click detail
  modal, PNG export (`html2canvas`).

**Curriculum Library:**

- `src/brands/tuffbuffs/components/curriculum/*` — `CurriculumBrowser`, `CurriculumLayout`,
  `CurriculumNav`, `CurriculumCardCarousel`, `CurriculumDetailDrawer`, `CurriculumQuestPanel`,
  `ComboBuilder`, `AppendixViewer`.
- Data: `src/brands/tuffbuffs/data/curriculum/` — `bjj.js`, `bjjHistory.js`, `crossReferences.js`,
  `appendices.js`, `index.js`. Also shared `src/curriculum/`.

## Target anchors

- Prisma models **already exist**: `Technique` (schema ~3460), `TechniquePrerequisite` (~3518),
  `CurriculumItem` (~2218), `CurriculumItemCompletion`.
- Surface: `app/(web)/techniques/` (`[slug]`, `_components`, `categories`, `tags`, `page.tsx`).

## Phases

0. **Discover.** Locate the BBL-variant source (else tuffbuffs). Map the static data shape
   (`BJJ_NODES`/`BJJ_EDGES`, `bjj.js`) onto the Prisma `Technique` / `TechniquePrerequisite` /
   `CurriculumItem` models. Write a short gap list (fields/relations missing).
1. **Data.** Seed the BJJ technique-graph (nodes → `Technique`, edges → `TechniquePrerequisite`) and
   curriculum (→ `CurriculumItem`) into Prisma via an idempotent seed/import script (mirror existing
   importer patterns). Add a migration only if fields are genuinely missing.
2. **Port graph.** JSX → TSX, Vite → Next client component; port the custom `FlowCanvas` / `FlowNode` /
   `useFlowCanvas` + `html2canvas` export; load nodes/edges from Prisma (server → props or oRPC), not
   static JS. BJJ-only. Mount on the techniques surface (e.g. `/techniques` or `/techniques/graph`).
   BBL dark theme via theme tokens (no hardcoded brand colors).
3. **Port curriculum.** Port `CurriculumBrowser` / `Layout` / `Nav` / `Carousel` / `DetailDrawer` → TSX/
   Next; wire to `CurriculumItem`; BJJ-only; new route (`/curriculum` or under `/techniques`).
4. **Integrate.** Nav entry; link technique nodes ↔ `/techniques/[slug]` detail + curriculum items;
   consistent with the SESSION_0414 premium card styling.
5. **Verify.** `bun run typecheck` + `next build` green; browser-check (via the bob-tony preview) the
   graph renders + pans + node modal + PNG export, and the curriculum browses; confirm it's BJJ-only.

## Guardrails

- Monorepo is read-only reference; modernize the older React patterns to React 19 / Next 16.
- Single-brand BBL; BJJ-only; theme tokens only.
- Don't regress the SESSION_0414 directory / lineage / cards work.
- See [`docs/prune-roadmap.md`](../prune-roadmap.md) for the parallel brand-prune lanes — this port is
  independent of those (it touches `/techniques` + curriculum, not the brand harness).
