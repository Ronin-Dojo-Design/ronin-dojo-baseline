---
title: "Product Documentation Index"
slug: product-documentation-index
type: index
status: active
created: 2026-05-18
updated: 2026-06-20
author: Brian + Giddy
last_agent: claude-session-0425
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/repo-truth-index.md
  - docs/protocols/WORKFLOW_5.0.md
pairs_with:
  - docs/knowledge/wiki/ronin-project-context.md
  - docs/knowledge/wiki/doc-pruning-register.md
  - docs/product/baseline-martial-arts/PRD.md
  - docs/product/baseline-martial-arts/STORIES.md
tags:
  - product
  - prd
  - stories
  - canon
---

# Product Documentation Index

This folder holds concise, canonical product artifacts for the Ronin Dojo Baseline platform.

The goal is to reduce active-doc sprawl by separating product truth from architecture notes, session logs, raw imports, deep research, and historical planning packets.

## Product doc rule

Product docs should answer:

1. What are we building?
2. Who is it for?
3. What problem does it solve?
4. What stories define the product?
5. What acceptance criteria prove the slice is usable?
6. Which architecture docs support the product?

They should not duplicate every schema detail, every session note, or every historical report.

## Brand product lanes

| Brand | Product theme | Canonical docs | Status |
| --- | --- | --- | --- |
| Baseline Martial Arts | Run a school and training system | `baseline-martial-arts/PRD.md`, `baseline-martial-arts/STORIES.md` | active |
| Black Belt Legacy | Preserve martial arts legacy | `black-belt-legacy/PRD.md`, `black-belt-legacy/STORIES.md` | active |
| WEKAF USA | Run tournaments and competition operations | `wekaf-usa/` | planned |
| Ronin Dojo Design | Sell and operate white-label systems | `ronin-dojo-design/` | planned |
| Mammoth Build | Custom CRM for a metal-building client — lead→order with build-photo proof (replaces HubSpot) | `mammoth-build/PRD.md`, `mammoth-build/STORIES.md` | draft |

## Current priority

Baseline Martial Arts and Black Belt Legacy now have canonical PRD/story packs.

Baseline proves the operating system through Brian's real school/program first, then becomes the reusable school-ops SaaS, course-certification, and affiliation model for other schools and university programs.

Black Belt Legacy preserves martial arts legacy through profiles, claims, rank history, lineage, curriculum, certifications, and community trust.

## Supporting canon

- `docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md`
- `docs/architecture/source/Launch-OS-Baseline-Martial-Arts-.md`
- `docs/architecture/lineage/lineage-tree-v1-requirements.md`
- `docs/architecture/lineage/lineage-editor-permissions-spec.md`
- `docs/knowledge/wiki/repo-truth-index.md`
- `docs/protocols/WORKFLOW_5.0.md`

## Product-doc health rules

- Keep PRDs short enough to load quickly.
- Put detailed implementation notes in architecture docs, not product docs.
- Put completed session history in `docs/sprints/`, not product docs.
- Move superseded planning packets toward reference/archive after summaries are preserved.
- Use `docs/knowledge/wiki/doc-pruning-register.md` before moving or deleting older docs.
