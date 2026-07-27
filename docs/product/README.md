---
title: "Product Documentation Index"
slug: product-documentation-index
type: index
status: active
created: 2026-05-18
updated: 2026-07-27
author: Brian + Giddy
last_agent: claude-session-0712
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/repo-truth-index.md
  - docs/protocols/WORKFLOW_5.0.md
pairs_with:
  - docs/knowledge/wiki/ronin-project-context.md
  - docs/knowledge/wiki/doc-pruning-register.md
  - docs/product/black-belt-legacy/PRD.md
  - docs/product/black-belt-legacy/STORIES.md
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
| Black Belt Legacy | Preserve martial arts legacy | `black-belt-legacy/PRD.md`, `black-belt-legacy/STORIES.md` | active |

Since the ADR 0055 brand-repo fork (Phase C2), this repo carries **Black Belt Legacy only**. The
other brand lanes (Baseline Martial Arts, Mammoth Build, WEKAF USA, Ronin Dojo Design) live in
their own sibling repos; RDD-Monorepo retains the full pre-fork history.

## Current priority

Black Belt Legacy preserves martial arts legacy through profiles, claims, rank history, lineage, curriculum, certifications, and community trust.

## Supporting canon

- `docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md`
- `docs/architecture/source/Launch-OS-baseline-martial-arts-.md`
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
