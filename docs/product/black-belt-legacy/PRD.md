---
title: "Black Belt Legacy PRD"
slug: black-belt-legacy-prd
type: prd
status: active
created: 2026-05-18
updated: 2026-06-06
author: Brian + Giddy
last_agent: codex-session-0349
backlinks:
  - docs/product/README.md
  - docs/knowledge/wiki/ronin-project-context.md
  - docs/architecture/lineage/lineage-tree-v1-requirements.md
  - docs/architecture/lineage/lineage-editor-permissions-spec.md
pairs_with:
  - docs/product/black-belt-legacy/STORIES.md
  - docs/sprints/SESSION_0349.md
  - docs/architecture/lineage/lineage-tree-v1-requirements.md
  - docs/architecture/lineage/lineage-editor-permissions-spec.md
tags:
  - product
  - black-belt-legacy
  - prd
  - lineage
  - legacy
---

# Black Belt Legacy PRD

## One-line product statement

Black Belt Legacy helps martial artists preserve, verify, explore, and share their training legacy through profiles, lineage trees, rank history, curriculum, certifications, and community knowledge.

## North Star (SESSION_0421, ADR 0034)

The **verified lineage graph** is the prize — a defensible network/moat, not a feature list. The
**mission** (preserving the Machado / Bob Bass lineage) is the *engine* that makes practitioners want
to claim and verify; **revenue (the listing tiers) is exhaust** that follows coverage. The single
metric to optimize above all is the **claim loop** — each verified node pulling its promoter and
students into the graph. Features serve the graph and the trust; they are not the goal.

## Product identity

Black Belt Legacy is the Ronin platform's heritage and community brand.

It is not primarily a school-operations SaaS lane. It is the place where martial arts identity, lineage, rank history, instructors, schools, stories, and trust signals come together.

## Audience

Primary users:

- martial artists who want an accurate public legacy profile
- instructors who want their lineage represented correctly
- lineage stewards who maintain branches and historical records
- visitors researching martial arts people, schools, systems, and instructor trees
- admins reviewing claims, disputes, and sensitive lineage changes

Secondary users:

- schools and associations that want public lineage credibility
- students researching instructors before joining a school
- content editors preserving historical articles, interviews, and legacy media

## Core problem

Martial arts history is fragmented across personal websites, gym pages, social posts, old photos, stories, certificates, and disputed memories.

A practitioner can be real, influential, and historically important while still being hard to verify online.

Black Belt Legacy solves this by turning identity, lineage, rank history, and trust workflows into a structured, auditable platform.

## Goals

1. Give each practitioner a clear directory listing, with full public profiles reserved for paid listing tiers.
2. Let placeholder historical profiles be claimed through review.
3. Render public lineage trees with grouped rows and trust badges.
4. Provide safe editor workflows for tree, branch, and node stewards.
5. Keep sensitive lineage changes auditable.
6. Support curriculum and certification stories where they connect to legacy.
7. Support discovery across people, disciplines, schools, styles, and trees.

## Non-goals for the first product slice

- Full tournament record joins in the lineage drawer.
- Full achievement model.
- Belt story media UX.
- Public self-serve tree creation without ACL review.
- Automatic duplicate identity merge without admin approval.
- Drag-and-drop rewriting promotion lineage.
- Treating imported or claimed data as verified without review.

## Product pillars

### 1. Legacy Profiles

Public and claimed martial artist listings and profiles.

Free listings should expose a compact public preview: name, avatar/initials fallback, and rank summary. Premium, elite, and legend listings unlock the full public profile: bio, links, school/team affiliation, rank history, lineage position, share/QR affordances, and trust status.

### 2. Lineage Trees

Promotion lineage and relationship history.

The default view should answer: who promoted whom, who belongs to which branch, and where this person sits in the larger tree.

### 3. Rank History

Durable rank/promotion facts with dates, promoters, verification state, and disputed-state support.

Rank facts should not drift away from lineage relationships.

### 4. Curriculum + Certifications

Reusable martial arts learning material and credential records where curriculum, rank, and lineage connect.

This is not the first BBL implementation slice, but the PRD keeps it visible as a product pillar.

### 5. Trust + Governance

Claims, verification, disputes, permissions, audit trails, and privacy rules.

This is the product's credibility layer.

## Product principles

- Public payloads are allowlists.
- Brand scoping is mandatory.
- Sensitive mutations require audit notes.
- Node/profile editing is not the same as lineage-truth editing.
- Disputed history should be flagged, not silently erased.
- Imported data starts with source confidence, not automatic certainty.
- The public viewer should feel premium, calm, and trustworthy.

## MVP capabilities

### Public viewer

- View public lineage tree by slug.
- Render forest fragments, not only a single root.
- Click node to open profile drawer.
- Highlight selected practitioner's path to root.
- Show grouped promotion/cohort rows when public label is enabled.
- Show verified, unverified, disputed, and claimed trust states.
- Exclude private/restricted members from public payloads.

### Profile and claims

- View free public legacy listing preview.
- View full public legacy profile when the profile owner/listing tier is premium, elite, or legend.
- Claim placeholder historical profile.
- Submit private claim evidence.
- Admin approves or denies with audit note.
- Approved claimant receives scoped edit rights.

### Editor foundation

- Tree admins/editors can add people and update placement.
- Branch editors can maintain assigned branches only.
- Node editors can edit assigned profile data without rewriting lineage truth.
- Promoter/parent changes require modal, warning, and audit note.
- Parent cycles are blocked.
- Cross-brand tree access is blocked.

### Rank and promotion facts

- Display rank summary and rank history.
- Link tree member display rank to a selected rank award.
- Keep `PROMOTED_BY` lineage relationship aligned with rank/promotion actions.
- Reset verification state when a promoter changes.

## Success metrics

Product health:

- public tree loads and is navigable
- profile drawer opens from tree node
- selected lineage path is understandable
- claim review does not expose private evidence
- editor actions write audit logs
- branch editor cannot edit outside assigned scope
- public payload does not include account emails, access grants, claims, evidence, or audit logs

Business/content health:

- BBL has a clear product story separate from Baseline Martial Arts
- legacy profile pages support search/discovery
- content and lineage features can support premium heritage storytelling

## Primary risks

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Data leakage | Public heritage pages can accidentally expose account or claim data | Public payload allowlists and visibility tests |
| Lineage corruption | Bad editor UX could rewrite martial arts history | Explicit audited actions, no drag/drop parent mutation |
| Branch overreach | Trusted branch editors could alter unrelated lineages | Branch-scope checks and graph guards |
| Duplicate people | Legacy imports may create multiple profiles for one person | Merge review workflow before destructive merges |
| Verification confusion | Users may mistake imported or claimed data as verified | Clear trust badges and source confidence |
| Doc sprawl | Product truth gets buried in session reports | Canonical PRD/STORIES plus pruning register |

## Supporting architecture docs

- `docs/architecture/lineage/lineage-tree-v1-requirements.md`
- `docs/architecture/lineage/lineage-editor-permissions-spec.md`
- `docs/knowledge/wiki/repo-truth-index.md`
- `docs/product/black-belt-legacy/STORIES.md`

## Open questions

1. Which BBL legacy dataset is the first import candidate?
2. Which trust states are public in v1: verified, unverified, disputed, claimed, imported?
3. Should BBL premium features include private archive/media access?
4. Which certification flows are first: instructor certification, rank certificate, or legacy credential verification?
5. After `/directory` becomes the canonical public browse/profile slug, which faceted surfaces should it include first: people, schools, organizations, lineage trees, or certificates?
