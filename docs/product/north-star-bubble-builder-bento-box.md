---
title: "North Star — Bubble Builder Bento Box (Custom Card Component Catalog Creator)"
slug: north-star-bubble-builder-bento-box
type: reference
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0604
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/knowledge/wiki/custom-component-inventory.md
  - docs/product/obsidian-dashboard/Obsidian_Dashboard_Epic.md
  - docs/sprints/SESSION_0605.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - product
  - north-star
  - design-system
  - canvas
---

# North Star — Bubble Builder Bento Box

> **Vault name:** `ULTIMATE_NORTH_STAR.md-Bubble-Builder-Bento-Box-Custom-Card-Component-Catalog-Creator-Curation-Center-Sliding-Tile-Premier-RDD-Flagship-Feature.md` (RDD_Master_Vault).
> This is the in-repo canonical capture (the vault file was operator-relayed on SESSION_0604 — no on-disk
> copy existed to pull; this doc is now the SoT and can be projected back to the vault). **Ratification +
> the full grill are a dedicated `/pp` session** — see [PL-012](../knowledge/wiki/planning-ledger.md). Do NOT
> build against this yet; it is the operator's flagship vision, captured for the epic plan (RDD phase 14).

**The one line:** the entire design system — kit + components — lives on a zoomable, pixelated **canvas
of canvases** of **custom component cards**; every surface can wear a **shell** (feature-behavior + auth
gating); one **passport** travels through every shell; and the whole thing is **tappable, swipeable,
Apple-Pencil / iPad-native**. Build all the engines **once**, as reusable card components + a custom
component inventory, shipped as **starter + brand kits**. This is the flagship RDD feature and the main
mission — it filters and applies to every other surface, brand, client, and interaction.

## Pillars

1. **Canvas of canvases** — the design system on one big, wide, pixelated interactive Canvas (Milanote-like)
   with menu buttons for quick-travel to any component. Zoom-in triggers a **shell or no-shell** (feature +
   behavior shells). Each chunk of the canvas is itself a canvas / surface / card / page → recursive
   zoom-in focus states.
2. **Bubble Builder Bento Box** — resizable bento boxes; the constant **Component Catalog inside a Shell**
   becomes a page builder — a **Next.js + TypeScript "Beaver Builder"**. Reusable card components + a custom
   component inventory, packaged as starter + brand kits.
3. **Shells everywhere** — any surface can carry its own shell for feature behavior + auth gating; tier
   membership gates the set. Zoom-in can trigger shell or no-shell.
4. **Zoom-in extends to the domains:**
   - **School rosters → family tree** — chunks-with-shells / card-sections-with-shells / buckets (the
     Bento Box idea). Card-roster mobile **lineage list-style drag-and-drops** (from the BBL app).
   - **Tournaments → bird's-eye venue blueprint** — overhead blueprint of the real venue (square footage,
     spacing, staging); **drag-and-drop, resizable** sections (add chairs to a 4×4 block); judges' seating
     around a form/fighting ring clickable for filled/empty + an on-deck roster; clicking a judges' area
     opens **magnetic drawers / jars / bubble-jars** — swipeable drawers with actions + horizontal/vertical
     scroll containers. Canvases within canvases, draggable + repositionable. **iPad/iPhone-native, Pencil-first.**
5. **One passport across organizations** — a single passport travels through every shell, each skinned by
   brand / client / school-org: WEKAF-USA first, then USA Karate, USA Boxing, USA Judo, and eventually all
   martial-arts orgs (the automatic dojo/tournament software).
6. **Sliding-tile mats** — swipe between mats, each with its own roster / divisions / judges; the feel of a
   **sliding-tile puzzle game** (a behavior-research item). Smooth, futuristic-yet-intuitive, organic.
7. **Mobile-first + Desi UX micro-delights** — swipeable student carousels, swipeable school carousels,
   dropdown accordion-chevron containers; the **Ronin Dojo Monorepo is the North Star for look + feel.**

## The mandate

- **Build all engines once.** Reusable card components + a custom component inventory (the CCC), as starter
  + brand kits. This is where the leverage is — the engine of everything.
- **User delight + experience is the whole point of the plan session.** Break each feature into: feature
  highlights · key necessities · desired behaviors. Mobile optimization is always priority; DESI UI/UX
  satisfaction + micro-delights throughout.

## Research + review (behavior/tech precedents)

- **Milanote** — layout + technology for the canvas-of-canvases.
- **Sliding-tile puzzle games** — the mat-swipe behavior.
- **Beaver Builder** — the page-builder interaction model (reimagined in Next.js + TS).

## How it ties to what already exists

- The **State-of-Dojo projection framework** (SESSION_0603 `_kernel/*`) is the first working "cards from a
  source, one vocabulary" surface — the Cookbook / Component-Catalog panels (WS-B/C) are the seed of the CCC.
- The **create-\* scaffold commands + component lifecycle (WS-E)** staged in
  [SESSION_0605](../sprints/SESSION_0605.md) are the **tooling substrate** for this vision — `/cac`
  (create-a-card) + the CCC + promote-to-live-component is literally the "Custom Card Component Catalog
  Creator" in miniature. 0605's grill should be scoped as a child of this North Star.
- The **Obsidian dashboard epic** + the vault constellation (ADR 0048) are the docs/canvas precedent.

## Raw vision (operator, SESSION_0604, verbatim)

> Storyboard canvas idea: The entire design system, including the kit and components, can live on a Canvas
> custom component catalog with cards. This big, wide, pixelated canvas board is interactive, with menu
> buttons for quick travel to a component. When it zooms in, it can trigger a shell or no shell, allowing for
> feature and behavior shells. Each chunk of the canvas can also be its own canvas, surface, card, or page,
> allowing for zoom-in focus states. This zoom-in feature can be extended to school rosters, enabling the
> viewing of a family tree. The zoom-in for the family tree consists of chunks with shells, card sections
> with shells, or buckets, reminiscent of the Bubble Builder Bento Box idea. The constant Component Catalog
> inside of Shell allows for a possible page builder like Beaver Builder but for a next.js TypeScript Beaver
> builder. This can also be extended to automatic dojo software or tournament software, such as for WeCalf
> USA and eventually all other martial arts organizations, allowing for passports between different
> organizations like USA Karate, USA Boxing, USA Judo, WeCalf, and more. Inside of this, your one passport
> travels through all the different shells, each based on the brand, client, or organization school. This
> extends to tournaments with an overhead bird's eye view of the tournament venue, like a blueprint. The
> tournament blueprint shows the venue's bird's eye view layout, including square footage, spacing, and
> staging. It is drag-and-drop movable, with resizable sections for adding more chairs to a 4x4 section on
> the blueprint. Judges seating around forms competition or fighting competition can be clicked on to show if
> they are filled or empty, with a roster of who's on deck. Visual representation of the actual event venue
> includes sizing, spacing, and draggable and repositionable canvases within canvases. Clicking onto the
> judges area pulls up judging modals or drawers, which are magnetic drawers with actions, surfaces,
> horizontal and vertical scrolling containers, jars, or bubble jars. Swipeable drawers are also included.
> Research and review of Milanote can provide insights into the layout and technology used for this app.
> This is the engine of everything, where you can make a significant impact. The bento boxes can be
> resizable, and the design feature can be broken down into feature highlights, key necessities, and desired
> behaviors. Mobile optimization is always a priority, with a focus on DESI UI UX satisfaction and
> micro-delights in card roster mobile lineage list style drag-and-drops from the BBL app. The Ronin Dojo
> Monorepo becomes the North Star for look and feel, with swipeable student carousels, swipeable school
> carousels, drop-down accordion chevron containers, and more. Any surface can have its own shell for feature
> behavior and auth gating. Tier membership includes all of the following. A quick note on the add-on for a
> tournament: it is automatically draggable and usable on an iPad/iPhone, with optimized screen size for user
> enjoyment. This planning session focuses on user delight and experience. … This dedicated session will plan
> an epic event, tied into the Ronin Dojo design phase 14. The goal is to build all engines once, creating
> reusable card components and a custom component inventory. These will be part of starter and brand kits,
> all accessible via a tappable, swipeable interface designed for the Apple Pencil. Users can swipe between
> different mats, each with its own roster, divisions, and judges. The interface mimics a sliding tile puzzle
> game… The sliding mats are integrated into a bento box-style canvas… Every action feels futuristic yet
> intuitive… This is the key product feature across everything… this is our ultimate North Star, the main
> mission. It filters and applies to every other surface, brand, client experience, and interaction. The
> Bubble Builder Bento Box is the ultimate North Star.

## Cross-references

- [Planning Ledger — PL-012](../knowledge/wiki/planning-ledger.md) — the intake row for the dedicated `/pp` session.
- [SESSION_0605](../sprints/SESSION_0605.md) — the create-\* / WS-E tooling substrate (a child of this).
- [Custom Component Inventory](../knowledge/wiki/custom-component-inventory.md) — the CCC this vision scales up.
- [Obsidian Dashboard Epic](obsidian-dashboard/Obsidian_Dashboard_Epic.md) — the canvas/vault precedent.
