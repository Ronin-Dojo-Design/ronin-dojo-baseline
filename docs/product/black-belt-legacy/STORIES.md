---
title: "Black Belt Legacy Stories"
slug: black-belt-legacy-stories
type: stories
status: active
created: 2026-05-18
updated: 2026-06-05
author: Brian + Giddy
last_agent: codex-session-0348
backlinks:
  - docs/product/README.md
  - docs/product/black-belt-legacy/PRD.md
  - docs/architecture/lineage/lineage-tree-v1-requirements.md
  - docs/architecture/lineage/lineage-editor-permissions-spec.md
pairs_with:
  - docs/product/black-belt-legacy/PRD.md
tags:
  - product
  - black-belt-legacy
  - stories
  - backlog
  - lineage
---

# Black Belt Legacy Stories

## Story map

Black Belt Legacy preserves martial arts legacy through this product chain:

```txt
Profile -> Claim -> Rank History -> Lineage -> Curriculum -> Certification -> Community Trust
```

## Epic 1 — Public Legacy Profile

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BBL-PROFILE-001 | As a visitor, I want to view a martial artist listing/profile so I can understand who they are, what they train, and where they fit in the community. | Free public listing shows name, avatar/initials fallback, and rank summary only. Premium/elite listing owners publish the full public profile with bio, contact/share affordances, rank history, school/team, and verification status. |
| BBL-PROFILE-002 | As a practitioner, I want to claim my profile so I can correct and maintain my own legacy information. | Claim flow accepts evidence, creates pending review, and does not expose evidence publicly. |
| BBL-PROFILE-003 | As an admin, I want to approve or deny profile claims so that placeholder profiles can become owned profiles safely. | Admin can approve/deny with audit note; claimant gets ownership/edit rights only after approval. |
| BBL-PROFILE-004 | As a visitor, I want to see whether a profile is verified, unverified, disputed, imported, or claimed so I can judge trust level. | Profile displays trust badge consistently across card, drawer, and detail page. |
| BBL-PROFILE-005 | As a profile owner, I want to edit public bio, photo, social links, and school affiliation so my public identity is current. | Owner edits only allowed fields; private account data is never exposed. |

## Epic 2 — Lineage Tree Viewer

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BBL-LINEAGE-001 | As a visitor, I want to view a lineage tree so I can understand who promoted whom. | Tree renders public members, supports forest fragments, and opens profile drawer on node click. |
| BBL-LINEAGE-002 | As a visitor, I want to click a practitioner and see their path back to the root so I can understand their lineage quickly. | Selected node highlights root path; unrelated branches dim. |
| BBL-LINEAGE-003 | As a visitor, I want to see grouped promotion rows so I can understand cohorts promoted together. | Public group labels show only when `showPublicLabel=true`. |
| BBL-LINEAGE-004 | As a visitor, I want unknown promotion dates handled gracefully so the tree does not show fake certainty. | Unknown dates are omitted or shown as `Unknown date` depending on display flag. |
| BBL-LINEAGE-005 | As a visitor, I want verified/disputed/unverified badges so I can evaluate lineage confidence. | Node card and drawer show lineage trust state. |

## Epic 3 — Lineage Editor

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BBL-EDITOR-001 | As a tree admin, I want to add a person to a lineage tree so that historical and current practitioners can be represented. | Admin can add existing or placeholder person; action is brand-scoped. |
| BBL-EDITOR-002 | As a tree editor, I want to set a person's promoter/visual parent so the lineage is accurate. | Requires modal, warning, promoter selection, audit note, and cycle prevention. |
| BBL-EDITOR-003 | As a branch editor, I want to edit only my assigned branch so I can help maintain lineage without overreaching. | Branch editor cannot move members outside branch scope. |
| BBL-EDITOR-004 | As a node editor, I want to edit my assigned profile without changing lineage truth. | Node editor can edit profile fields but cannot rewrite promoter/parent placement. |
| BBL-EDITOR-005 | As a tree admin, I want to manage lineage ACLs so trusted people can maintain branches. | Admin can grant/revoke tree, branch, and node access with audit log. |
| BBL-EDITOR-006 | As a tree admin, I want to create and manage visual groups so cohorts can be shown clearly. | Admin can create, rename, hide label, reorder, and collapse group rows. |

## Epic 4 — Rank History + Promotion Facts

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BBL-RANK-001 | As a visitor, I want to see a practitioner's rank history so I can understand their progression. | Drawer/profile shows rank, date, promoter, discipline, and verification status. |
| BBL-RANK-002 | As an editor, I want to link a lineage tree member to a selected rank award so the displayed rank is accurate for that tree. | Tree member can display tree-specific selected rank award. |
| BBL-RANK-003 | As an admin, I want promoter relationships synchronized with rank awards so promotion lineage and rank history do not drift. | `PROMOTED_BY` relationship updates when promotion data changes. |
| BBL-RANK-004 | As an admin, I want disputed promotion facts flagged instead of deleted so history remains transparent. | Disputed status appears in admin and public views according to visibility rules. |

## Epic 5 — Curriculum + Certification

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BBL-CURRICULUM-001 | As a student, I want to browse curriculum by discipline, rank, and topic so I can learn in a structured way. | Curriculum list filters by discipline/rank/topic and hides drafts. |
| BBL-CURRICULUM-002 | As an instructor, I want to attach techniques to curriculum paths so I can teach from reusable content. | Technique-to-curriculum relationships display in course pages. |
| BBL-CURRICULUM-003 | As a student, I want to track progress through curriculum so I can see what I have learned. | Progress records completion, date, and current status. |
| BBL-CERT-001 | As an instructor/admin, I want to issue certificates so training achievements become durable records. | Certificate issuance links user, course/curriculum/rank, issuer, and date. |
| BBL-CERT-002 | As a visitor, I want to verify a certificate so I can trust that a credential is real. | Public verification page shows certificate status without exposing private account data. |

## Epic 6 — Migration + Data Stewardship

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BBL-MIGRATE-001 | As an admin, I want to import legacy BBL people so the new platform starts with useful history. | Import creates placeholder users/nodes with source metadata. |
| BBL-MIGRATE-002 | As an admin, I want to deduplicate imported people so the same martial artist is not represented twice. | Merge candidates are surfaced; merge requires approval and audit note. |
| BBL-MIGRATE-003 | As an admin, I want imported lineage data marked with source confidence so old data is not treated as automatically verified. | Imported records start pending/unverified unless explicitly verified. |
| BBL-MIGRATE-004 | As a claimant, I want to attach evidence to a profile claim so reviewers can confirm identity. | Evidence is private to reviewers and never included in public payloads. |

## Epic 7 — Search + Discovery

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BBL-DISCOVER-001 | As a visitor, I want to search people by name, discipline, rank, school, and location so I can find practitioners. | Search returns public profiles only, respects brand/visibility, and uses `/directory` as the canonical browse slug. |
| BBL-DISCOVER-002 | As a visitor, I want to filter lineage trees by discipline/style/school so I can explore the right branch. | Filters update tree/list results without exposing private trees. |
| BBL-DISCOVER-003 | As a visitor, I want related profiles suggested from a profile page so I can explore instructors, students, and schools. | Suggestions use visible relationships only. |

## First implementation story slice

Recommended first product slice after the current lineage viewer/editor foundation:

1. `BBL-EDITOR-001` — add person to tree.
2. `BBL-EDITOR-002` — set promoter/visual parent through audited modal.
3. `BBL-EDITOR-006` — create/manage visual group rows.
4. `BBL-PROFILE-002` — claim placeholder profile.
5. `BBL-PROFILE-003` — approve/deny profile claim.

## Four-brand story grouping

| Brand | Theme | Story chain |
| --- | --- | --- |
| Baseline Martial Arts | Run a school | Lead -> Trial -> Household -> Membership -> Schedule -> Attendance -> Billing -> Promotion |
| Black Belt Legacy | Preserve martial arts legacy | Profile -> Claim -> Rank History -> Lineage -> Curriculum -> Certification -> Community Trust |
| WEKAF USA | Run tournaments | Event -> Division -> Registration -> Check-in -> Bracket -> Scoring -> Results -> Rankings |
| Ronin Dojo Design | Sell and operate white-label systems | Demo -> Intake -> Tenant/Brand Setup -> Template -> Launch -> Support -> Upsell |
