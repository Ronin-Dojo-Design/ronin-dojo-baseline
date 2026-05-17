---
title: "Lineage Prisma Schema Patch Proposal"
slug: lineage-prisma-schema-patch-proposal
type: spec
status: active
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0177
backlinks:
  - docs/sprints/SESSION_0177.md
  - docs/sprints/SESSION_0178.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/knowledge/wiki/index.md
---

# Lineage Prisma Schema Patch Proposal

## Summary

This is the proposed additive Prisma shape for Lineage Tree v1. It is not an applied migration. The next implementation session must follow `docs/runbooks/schema-migration.md`, use additive `migrate dev` discipline, and verify the generated migration against the current `RankAward`, `LineageNode`, `LineageRelationship`, `AuditLog`, `Media`, `Organization`, `Discipline`, `Style`, `Membership`, and `Role` models.

The proposal keeps the existing person/profile spine. `LineageNode` remains the reusable lineage profile tied to a `User`. Tree-specific placement, row grouping, display rank, and public display flags move into `LineageTreeMember`.

## New Enums

```prisma
enum LineageVerificationStatus {
  PENDING
  VERIFIED
  DISPUTED
}

enum LineageTreeScopeType {
  BRAND
  ORGANIZATION
  DISCIPLINE
  STYLE
  PERSON
  CUSTOM
}

enum LineageTreeAccessRole {
  TREE_ADMIN
  TREE_EDITOR
  BRANCH_EDITOR
  NODE_EDITOR
}

enum LineageClaimStatus {
  PENDING
  APPROVED
  DENIED
  NEEDS_INFO
  CANCELLED
}

enum LineageVisualGroupType {
  PROMOTION_DATE
  RANK
  GENERATION
  TEAM
  CUSTOM
}
```

## Existing Enum Change

Add `PROMOTED_BY` to `LineageRelationType`.

```prisma
enum LineageRelationType {
  INSTRUCTOR_STUDENT
  PROMOTED_BY
  TOURNAMENT_PARTNER
  AFFILIATION
  TRAINING_PARTNER
  SEMINAR
  COMPETITION_TEAM
}
```

Implementation note: do not relabel all historical `INSTRUCTOR_STUDENT` rows blindly. The migration should add the enum value first. A backfill script can create or update `PROMOTED_BY` rows from rank actions where the promotion fact is known.

## Existing Model Changes

`RankAward` becomes canonical for promotion facts and must allow unknown dates.

```prisma
model RankAward {
  id        String    @id @default(cuid())
  awardedAt DateTime?
  notes     String?
  location  String?
  mediaUrls Json?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user        User    @relation("EarnedBy", fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  rank        Rank    @relation(fields: [rankId], references: [id], onDelete: Restrict)
  rankId      String
  awardedBy   User?   @relation("AwardedBy", fields: [awardedById], references: [id])
  awardedById String?

  lineageTreeMembers   LineageTreeMember[]
  lineageRelationships LineageRelationship[]
  gamificationEvents   GamificationEvent[]

  @@unique([userId, rankId])
  @@index([userId, awardedAt])
  @@index([rankId])
  @@index([awardedById])
}
```

`LineageNode` gets an explicit status while keeping `isVerified` for transitional compatibility.

```prisma
model LineageNode {
  id                 String                    @id @default(cuid())
  visibility         LineageVisibility          @default(PUBLIC)
  isVerified         Boolean                   @default(false)
  verificationStatus LineageVerificationStatus @default(PENDING)
  slug               String?                   @unique
  bio                String?
  archivedAt         DateTime?
  createdAt          DateTime                  @default(now())
  updatedAt          DateTime                  @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String @unique

  relationshipsFrom LineageRelationship[] @relation("LineageFrom")
  relationshipsTo   LineageRelationship[] @relation("LineageTo")
  treeMembers       LineageTreeMember[]
  claimRequests     LineageClaimRequest[]
}
```

`LineageRelationship` gets `PROMOTED_BY`, verification status, and an optional `RankAward` link. Preserve current edge orientation for compatibility: `fromNodeId` is the promoter and `toNodeId` is the promoted person. For `PROMOTED_BY`, read the row as "`toNode` was promoted by `fromNode`."

```prisma
model LineageRelationship {
  id                 String                    @id @default(cuid())
  type               LineageRelationType
  description        String?
  startedAt          DateTime?
  endedAt            DateTime?
  isVerified         Boolean                   @default(false)
  verificationStatus LineageVerificationStatus @default(PENDING)
  createdAt          DateTime                  @default(now())
  updatedAt          DateTime                  @updatedAt

  fromNode   LineageNode @relation("LineageFrom", fields: [fromNodeId], references: [id], onDelete: Cascade)
  fromNodeId String
  toNode     LineageNode @relation("LineageTo", fields: [toNodeId], references: [id], onDelete: Cascade)
  toNodeId   String

  rankAward   RankAward? @relation(fields: [rankAwardId], references: [id], onDelete: SetNull)
  rankAwardId String?

  @@unique([fromNodeId, toNodeId, type])
  @@index([fromNodeId])
  @@index([toNodeId])
  @@index([type, rankAwardId])
  @@index([verificationStatus])
}
```

## New Models

`LineageTree` defines a public/editor tree context. It may be scoped broadly to a brand or narrowly to an org, discipline, style, or person. Optional scope links are validated by application logic based on `scopeType`.

```prisma
model LineageTree {
  id            String               @id @default(cuid())
  brand         Brand
  scopeType     LineageTreeScopeType @default(BRAND)
  slug          String
  name          String
  description   String?
  visibility    LineageVisibility    @default(PUBLIC)
  isPublished   Boolean              @default(false)
  defaultRootMemberId String?
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  organizationId String?
  discipline     Discipline?   @relation(fields: [disciplineId], references: [id], onDelete: SetNull)
  disciplineId   String?
  style          Style?        @relation(fields: [styleId], references: [id], onDelete: SetNull)
  styleId        String?
  ownerNode      LineageNode?  @relation("LineageTreeOwnerNode", fields: [ownerNodeId], references: [id], onDelete: SetNull)
  ownerNodeId    String?

  members       LineageTreeMember[]
  visualGroups  LineageVisualGroup[]
  accessGrants  LineageTreeAccess[]
  claimRequests LineageClaimRequest[]

  @@unique([brand, slug])
  @@index([brand, scopeType])
  @@index([organizationId])
  @@index([disciplineId])
  @@index([styleId])
  @@index([ownerNodeId])
}
```

`LineageTreeMember` is the tree-specific join model. It stores the selected displayed rank, visual parent, visual group, order, and public display controls.

```prisma
model LineageTreeMember {
  id                      String   @id @default(cuid())
  visualSortOrder         Int      @default(0)
  showPromotionDatePublic Boolean  @default(true)
  showRankPublic          Boolean  @default(true)
  isCollapsedDefault      Boolean  @default(false)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  tree   LineageTree @relation(fields: [treeId], references: [id], onDelete: Cascade)
  treeId String
  node   LineageNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  nodeId String

  selectedRankAward   RankAward? @relation(fields: [rankAwardId], references: [id], onDelete: SetNull)
  rankAwardId         String?

  primaryVisualParent LineageTreeMember?  @relation("LineageVisualParent", fields: [primaryVisualParentMemberId], references: [id], onDelete: SetNull)
  primaryVisualParentMemberId String?
  visualChildren      LineageTreeMember[] @relation("LineageVisualParent")

  visualGroup   LineageVisualGroup? @relation(fields: [visualGroupId], references: [id], onDelete: SetNull)
  visualGroupId String?

  accessGrantsAsRoot LineageTreeAccess[] @relation("LineageAccessRootMember")
  accessGrantsAsNode LineageTreeAccess[] @relation("LineageAccessMember")

  @@unique([treeId, nodeId])
  @@index([treeId, primaryVisualParentMemberId])
  @@index([treeId, visualGroupId, visualSortOrder])
  @@index([rankAwardId])
}
```

`LineageVisualGroup` is materialized, not derived only at render time. The app may auto-create groups from promotion dates and then allow admins to rename, hide public labels, collapse, and reorder them.

```prisma
model LineageVisualGroup {
  id                 String                 @id @default(cuid())
  label              String
  groupType          LineageVisualGroupType @default(PROMOTION_DATE)
  promotionDate      DateTime?
  sortOrder          Int                    @default(0)
  showPublicLabel    Boolean                @default(false)
  isCollapsedDefault Boolean                @default(false)
  createdAt          DateTime               @default(now())
  updatedAt          DateTime               @updatedAt

  tree   LineageTree @relation(fields: [treeId], references: [id], onDelete: Cascade)
  treeId String
  parentMember   LineageTreeMember? @relation(fields: [parentMemberId], references: [id], onDelete: Cascade)
  parentMemberId String?

  members LineageTreeMember[]

  @@unique([treeId, parentMemberId, groupType, promotionDate])
  @@index([treeId, parentMemberId, sortOrder])
}
```

`LineageTreeAccess` stores explicit ACL grants. Organization owner and org admin default grants are derived, not stored, unless the implementation later chooses to materialize them.

```prisma
model LineageTreeAccess {
  id        String                @id @default(cuid())
  role      LineageTreeAccessRole
  createdAt DateTime              @default(now())
  revokedAt DateTime?

  tree   LineageTree @relation(fields: [treeId], references: [id], onDelete: Cascade)
  treeId String
  user   User        @relation("LineageTreeAccessUser", fields: [userId], references: [id], onDelete: Cascade)
  userId String
  grantedBy   User?  @relation("LineageTreeAccessGrantedBy", fields: [grantedById], references: [id], onDelete: SetNull)
  grantedById String?

  rootMember   LineageTreeMember? @relation("LineageAccessRootMember", fields: [rootMemberId], references: [id], onDelete: Cascade)
  rootMemberId String?
  member       LineageTreeMember? @relation("LineageAccessMember", fields: [memberId], references: [id], onDelete: Cascade)
  memberId     String?
  node         LineageNode?       @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  nodeId       String?

  @@index([treeId, userId, role])
  @@index([rootMemberId])
  @@index([memberId])
  @@index([nodeId])
}
```

`LineageClaimRequest` and `LineageClaimEvidence` support v1 placeholder profile claims. Evidence is private to reviewers and the claimant.

```prisma
model LineageClaimRequest {
  id            String             @id @default(cuid())
  status        LineageClaimStatus @default(PENDING)
  claimantNote  String?
  reviewerNote  String?
  bypassReason  String?
  reviewedAt    DateTime?
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  tree   LineageTree @relation(fields: [treeId], references: [id], onDelete: Cascade)
  treeId String
  node   LineageNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  nodeId String
  claimant   User   @relation("LineageClaimClaimant", fields: [claimantUserId], references: [id], onDelete: Cascade)
  claimantUserId String
  reviewedBy   User? @relation("LineageClaimReviewer", fields: [reviewedById], references: [id], onDelete: SetNull)
  reviewedById String?

  evidence LineageClaimEvidence[]

  @@index([treeId, status])
  @@index([nodeId, status])
  @@index([claimantUserId, status])
}

model LineageClaimEvidence {
  id        String   @id @default(cuid())
  label     String?
  url       String?
  text      String?
  createdAt DateTime @default(now())

  claimRequest   LineageClaimRequest @relation(fields: [claimRequestId], references: [id], onDelete: Cascade)
  claimRequestId String
  media          Media?              @relation(fields: [mediaId], references: [id], onDelete: SetNull)
  mediaId        String?

  @@index([claimRequestId])
  @@index([mediaId])
}
```

## Required Relation Additions

The exact relation names can change during implementation, but these owning models need relation arrays if the schema is applied:

- `User`: lineage access rows, granted access rows, claim requests, reviewed claims.
- `Organization`: lineage trees.
- `Discipline`: lineage trees.
- `Style`: lineage trees.
- `LineageNode`: owned lineage trees, tree memberships, access rows, claim requests.
- `Media`: claim evidence rows.

## Migration Notes

- Backfill `LineageNode.verificationStatus` from `isVerified`: `true` becomes `VERIFIED`; `false` becomes `PENDING`.
- Backfill `LineageRelationship.verificationStatus` from `isVerified` the same way.
- Keep `isVerified` until all old query payloads and UI badges move to `verificationStatus`.
- Make `RankAward.awardedAt` nullable in an additive migration and verify existing non-null dates are preserved.
- Do not drop D3 or old relationship behavior in the schema migration. The UI port should remove D3 only after the React canvas adapter reaches parity.
- Do not auto-merge duplicate claimant identities. If the claimant already has a `LineageNode`, block automatic approval and require a manual merge workflow.
