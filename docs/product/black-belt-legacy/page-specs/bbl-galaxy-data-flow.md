---
title: "BBL Galaxy data flow (public lineage → cinematic viewer)"
slug: bbl-galaxy-data-flow
type: file
status: active
lifecycle: WIP
created: 2026-06-21
updated: 2026-06-21
author: Brian + Claude
last_agent: claude-session-0428
pairs_with:

  - docs/epics/post-launch-clean-repo-001.md
  - docs/knowledge/wiki/files/public-passport-dto.md
  - docs/runbooks/sops/lineage-data-wiring-flow.md
backlinks:

  - docs/knowledge/wiki/index.md
  - docs/epics/post-launch-clean-repo-001.md
wiring:

  - "apps/web/app/(web)/lineage/galaxy/page.tsx — server route; flag gate + getBblGalaxyData()"
  - "apps/web/config/galaxy.ts — NEXT_PUBLIC_GALAXY_ENABLED flag (route 404s when off)"
  - "apps/web/server/web/lineage/galaxy-data.ts — getBblGalaxyData(): pick published tree + project + eager-load profiles"
  - "apps/web/components/web/lineage/galaxy/bbl-galaxy-from-lineage.ts — lineageTreeToGalaxyGraph (pure, verified-only projection)"
  - "apps/web/components/web/lineage/galaxy/galaxy-route.tsx — 'use client' ssr:false dynamic wrapper (three.js is browser-only)"
  - "apps/web/components/web/lineage/galaxy/BblLineageGalaxyDemo.tsx — viewer + real LineageProfileDrawer (mock drawer = no-data dev fallback)"
tags: [bbl, galaxy, lineage, three-js, dto, flow, spec, post-launch]
---

# BBL Galaxy data flow (public lineage → cinematic viewer)

## Summary

How the flag-gated BBL Galaxy (PR #133) gets data: a server route projects a **published public**
lineage tree into a verified-only galaxy graph and eager-loads drawer profiles, then a browser-only
(R3F/three.js, `ssr:false`) viewer renders it. No private data — it consumes the public lineage
payload and a node click opens the real lineage profile drawer. Mock data is the no-DB dev fallback only.

## Data wiring flow (ASCII)

```text
/lineage/galaxy (server page)
  |  galaxyConfig.enabled (NEXT_PUBLIC_GALAXY_ENABLED)  --off--> notFound()
  v
getBblGalaxyData()
  |  findPublishedLineageTreeSlugs() -> first BBL published tree
  |  getLineageTreeBySlug({ brand, slug })  (PUBLIC-scoped)
  |  lineageTreeToGalaxyGraph(result)   (PURE: verified-only; gen/orbit; primary-lineage edges)
  |  getLineageProfilesByIds(nodeIds)   (eager drawer profiles, public-redacted)
  v
GalaxyRoute ('use client', dynamic ssr:false)  -> BblLineageGalaxyDemo
  |   <BblLineageGalaxy graph={...}>            (R3F canvas; node click -> nodeId)
  |   <LineageProfileDrawer profile={profilesById[nodeId]}>   (real drawer; mock = no-data fallback)
  v
Browser (three.js / drei / gsap) — lazy chunk, loads only on this route
```

## Data wiring flow (mermaid)

```mermaid
flowchart TD
  PAGE[/lineage/galaxy server page/] -->|flag off| NF[notFound]
  PAGE -->|flag on| GD[getBblGalaxyData]
  GD --> Q[getLineageTreeBySlug PUBLIC]
  Q --> T[lineageTreeToGalaxyGraph\nverified-only · gen/orbit · edges]
  GD --> PR[getLineageProfilesByIds\neager drawer profiles]
  T --> RT[GalaxyRoute client · ssr:false]
  PR --> RT
  RT --> V[BblLineageGalaxy R3F canvas]
  V -->|node click → nodeId| DR[LineageProfileDrawer\nprofilesById nodeId]
```

## Logic / decision chart (node → DTO → render)

```mermaid
flowchart TD
  M[tree member] --> Vf{node.isVerified}
  Vf -->|false| DROP[drop node + dangling edges]
  Vf -->|true| GEN[generation from visual parent chain]
  GEN --> ROLE[role: 0 ROOT · 1 LEGEND · 2 INSTRUCTOR · 3+ STUDENT]
  ROLE --> NODE[BblGalaxyNode\nname/photo/rankLabel/orbit/group]
```

## Where it lives (field / surface map)

| Galaxy field | Source | Notes |
| --- | --- | --- |
| `displayName` / `photoUrl` | member `node.passport` (→ account fallback) | same chain as the public Passport DTO |
| `rankLabel` | `selectedRankAward ?? rankAwardsEarned[0]` → `rank.name · discipline` | — |
| `role` / `generation` | visual parent chain depth | deterministic layout |
| `orbitIndex/Total` | `visualSortOrder` within generation band | — |
| `groupId/Label` | `LineageVisualGroup` (public labels only) | `showPublicLabel` honored |
| `verifiedStatus` | filtered to `node.isVerified === true` | verified-only galaxy (spec security rule) |

## Security / redaction gates

- **Flag-gated:** route 404s unless `NEXT_PUBLIC_GALAXY_ENABLED=1` — half-built feature never ships to prod.
- **Verified-only:** unverified nodes (and dangling edges) are dropped in the pure projection.
- **Public payload only:** consumes `getLineageTreeBySlug` (PUBLIC scope) + `getLineageProfilesByIds`
  (public-redacted); no private fields. Belt colors via `Rank.colorHex`.
- **Client-only:** three.js never hits SSR (`dynamic … { ssr: false }`), lazy-loaded per route.

## Provenance

PR #133 (slice 1 prototype + slice 2 public DTO/drawer + verified-only). Spec:
`docs/product/black-belt-legacy/BBL-Galaxy-spec.md` (lands with PR #133). Should converge on the
[public Passport DTO](../../../knowledge/wiki/files/public-passport-dto.md) for its identity fields (epic
[post-launch-clean-repo-001](../../../epics/post-launch-clean-repo-001.md)).
