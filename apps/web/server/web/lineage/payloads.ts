import type { Prisma } from "~/.generated/prisma/client"
import { publicPassportPayload } from "~/server/web/passport/public-payloads"

/**
 * Lineage payload selects.
 *
 * Strict allowlist shapes that the lineage tree section + profile drawer
 * consume. New consumers add a new payload — do NOT widen an existing one.
 *
 * Author: Cody / SESSION_0175 TASK_02.
 * Refs:
 *  - schema.prisma:2209-2242 (LineageNode + LineageRelationship)
 *  - docs/knowledge/wiki/component-porting/specs/lineage-family-tree-port-spec.md
 *  - docs/knowledge/wiki/component-porting/specs/lineage-profile-drawer-port-spec.md
 */

// ---------------------------------------------------------------------------
// Passport identity snippet — used everywhere a LineageNode carries its person
// identity. Phase 3c (SOT-ADR D1): identity is Passport-rooted. The optional
// `user` is the *attached account* (a null `user` = accountless placeholder,
// replacing the old `User.isPlaceholder` flag); `name`/`image` are the account
// mirror used as a fallback behind Passport's own `displayName`/`avatarUrl`.
//
// Spreads `publicPassportPayload` as the base (issue #134 surface 3a/3b) so the
// public identity core has one canonical definition, then merges in the lineage-
// specific directoryProfile location fields.
// ---------------------------------------------------------------------------

const lineagePassportPayload = {
  ...publicPassportPayload,
  // Merge directoryProfile: public base has { slug, visibility, showRanks };
  // lineage also needs location fields. Union them:
  directoryProfile: {
    select: {
      slug: true,
      visibility: true,
      showRanks: true,
      locationCity: true,
      locationRegion: true,
      locationCountry: true,
    },
  },
} satisfies Prisma.PassportSelect

// Promoter identity snippet for a RankAward — prefers the historical Passport
// promoter (`awardedByPassport`, SESSION_0391), with the real-account actor
// (`awardedBy`) carried for accounts that performed the award.
const rankAwardPromoterPayload = {
  awardedByPassport: {
    select: { id: true, displayName: true, avatarUrl: true },
  },
  awardedBy: {
    select: { id: true, name: true, image: true },
  },
} satisfies Prisma.RankAwardSelect

// ---------------------------------------------------------------------------
// Row payload — used for tree nodes (tree section in TASK_03).
//
// Minimal fields the tree card needs: identity (name + image), verified flag,
// slug for deep-link, visibility for client-side double-check, and a single
// "latest RankAward" join for the rank label line.
// ---------------------------------------------------------------------------

export const lineageNodeRowPayload = {
  id: true,
  slug: true,
  visibility: true,
  isVerified: true,
  verificationStatus: true,
  bio: true,
  passportId: true,
  claimRequests: {
    where: { status: { in: ["APPROVED", "PENDING", "NEEDS_INFO"] } },
    select: { status: true },
  },
  passport: {
    select: {
      ...lineagePassportPayload,
      // Attached account (nullable) — null = accountless placeholder. Memberships
      // are account-side (CARRY) so they hang off the account, not the Passport.
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          // Latest active membership → Baseline enrollment fallback for the school label.
          memberships: {
            where: { status: "ACTIVE" as const },
            select: {
              id: true,
              discipline: {
                select: { id: true, name: true, slug: true },
              },
              organization: {
                // @added SESSION_0496 — logoUrl on BOTH row-payload org selects so the
                // V2 student card's school logo comes from the SAME org that
                // `memberSchoolLabel` resolves (affiliation-first), never a mismatched pair.
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true,
                  state: true,
                  logoUrl: true,
                },
              },
            },
            orderBy: { joinedAt: "desc" as const },
            take: 1,
          },
        },
      },
      // The member's awarded belts (ordered highest-first). Display reads the top
      // one via `memberTopRank(node, disciplineId?)`; verification is a separate
      // node-level axis (ADR 0035) and never filters the award shown here.
      // ⚠ NO `take` — the discipline-scoped resolver `.find()`s the highest award
      //   IN the tree's discipline (ADR 0035 §3), so a `take: 1` here would hand it
      //   only the GLOBAL top award and blank out any multi-discipline member whose
      //   top belt is in another discipline. Rank awards per person are few, so
      //   loading all is cheap; the tree card still reads only `[0]` / the first match.
      rankAwardsEarned: {
        select: {
          id: true,
          awardedAt: true,
          location: true,
          rank: {
            select: {
              id: true,
              name: true,
              shortName: true,
              colorHex: true,
              sortOrder: true,
              // @added SESSION_0493 — degree stripes + coral panels for the
              // ancestry-timeline flat-bar swatch.
              degree: true,
              secondaryColorHex: true,
              rankSystem: {
                select: {
                  id: true,
                  name: true,
                  discipline: {
                    select: { id: true, name: true, slug: true, code: true },
                  },
                },
              },
            },
          },
          ...rankAwardPromoterPayload,
        },
        // Ordered highest belt first (Rank.sortOrder desc, awardedAt as tiebreak — a plain
        // `awardedAt desc` floats NULL-dated awards to [0] via Postgres NULLS-FIRST, which
        // under-ranked 7/10 multi-award founders, SESSION_0430). NO `take` — see the comment
        // above: the discipline-scoped resolver `.find()`s within the tree's discipline, so
        // truncating to the global top award blanks multi-discipline members.
        orderBy: [{ rank: { sortOrder: "desc" as const } }, { awardedAt: "desc" as const }],
      },
      // Current affiliation → the canonical school/affiliation axis (Passport model, SESSION_0357).
      // Affiliation is display-only person↔org; `memberSchoolLabel` reads this first.
      affiliations: {
        where: { isCurrent: true },
        select: {
          id: true,
          schoolName: true,
          organization: {
            // @added SESSION_0496 — logoUrl (see the membership org select note above).
            select: { id: true, name: true, slug: true, city: true, state: true, logoUrl: true },
          },
        },
        orderBy: { updatedAt: "desc" as const },
        take: 1,
      },
    },
  },
  // Secondary promoter edges — PUBLIC INSTRUCTOR_STUDENT relationships where
  // this node is the student. Used by the View A secondary-link overlay (0379-4).
  // Fields inlined (not using lineageRelationshipPayload) to avoid a forward reference.
  relationshipsTo: {
    where: {
      type: "INSTRUCTOR_STUDENT" as const,
      fromNode: { visibility: "PUBLIC" as const },
    },
    select: {
      id: true,
      type: true,
      fromNodeId: true,
      toNodeId: true,
    },
  },
} satisfies Prisma.LineageNodeSelect

// ---------------------------------------------------------------------------
// Relationship payload — the edges between nodes in the tree.
// ---------------------------------------------------------------------------

export const lineageRelationshipPayload = {
  id: true,
  type: true,
  description: true,
  isVerified: true,
  verificationStatus: true,
  startedAt: true,
  endedAt: true,
  fromNodeId: true,
  toNodeId: true,
} satisfies Prisma.LineageRelationshipSelect

// ---------------------------------------------------------------------------
// Profile payload — Info tab content for the drawer (TASK_03).
//
// Widens row payload with: full rank-award history, school memberships, and
// the instructor relationships pointing INTO this node. Tournament results,
// achievements, belt-story media are NOT joined here — they're SESSION_0176
// schema work and the drawer renders empty states.
// ---------------------------------------------------------------------------

export const lineageNodeProfilePayload = {
  id: true,
  slug: true,
  visibility: true,
  isVerified: true,
  verificationStatus: true,
  bio: true,
  passportId: true,
  claimRequests: {
    where: { status: { in: ["APPROVED", "PENDING", "NEEDS_INFO"] } },
    select: { status: true },
  },
  createdAt: true,
  updatedAt: true,
  passport: {
    select: {
      ...lineagePassportPayload,
      // Attached account (nullable) — memberships are account-side (CARRY).
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          memberships: {
            where: { status: "ACTIVE" as const },
            select: {
              id: true,
              joinedAt: true,
              discipline: {
                select: { id: true, name: true, slug: true, code: true },
              },
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  type: true,
                  city: true,
                  state: true,
                  country: true,
                  // @added SESSION_0410 — null-safe school logo (data backfilled in the supervised lane).
                  logoUrl: true,
                },
              },
              rank: {
                select: { id: true, name: true, shortName: true },
              },
            },
            orderBy: { joinedAt: "desc" as const },
          },
        },
      },
      rankAwardsEarned: {
        select: {
          id: true,
          awardedAt: true,
          location: true,
          rank: {
            select: {
              id: true,
              name: true,
              shortName: true,
              colorHex: true,
              sortOrder: true,
              rankSystem: {
                select: {
                  id: true,
                  name: true,
                  discipline: {
                    select: { id: true, name: true, slug: true, code: true },
                  },
                  ranks: {
                    // @added SESSION_0332 — Trophy.so rank-progression proof.
                    // Widened from {id, sortOrder} so the belt-ladder can render unearned levels
                    // with canonical name + colorHex. No schema change.
                    select: {
                      id: true,
                      sortOrder: true,
                      name: true,
                      shortName: true,
                      colorHex: true,
                    },
                    orderBy: { sortOrder: "asc" as const },
                  },
                },
              },
            },
          },
          ...rankAwardPromoterPayload,
          organization: {
            select: { id: true, name: true, slug: true, city: true, state: true },
          },
          // @added SESSION_0318 — read-only PromotionEvent (ceremony) link for Rank History.
          promotionEvent: {
            select: { id: true, title: true, slug: true, eventDate: true },
          },
        },
        // [0] is read as "current rank" by the drawer (deriveDrawerProfileView) +
        // canvas-model + students-carousel. Order by highest belt (Rank.sortOrder)
        // first so a NULL-dated lower-belt award can't float to the top via the
        // Postgres NULLS-FIRST default (SESSION_0430). The rank-history + progression
        // panels are order-independent (they self-sort), so this is safe for them.
        orderBy: [{ rank: { sortOrder: "desc" as const } }, { awardedAt: "desc" as const }],
      },
    },
  },
  // Instructors who pointed AT this node (this user is the student).
  relationshipsTo: {
    where: {
      type: "INSTRUCTOR_STUDENT" as const,
      fromNode: { visibility: "PUBLIC" as const },
    },
    select: {
      ...lineageRelationshipPayload,
      fromNode: {
        select: {
          id: true,
          slug: true,
          isVerified: true,
          visibility: true,
          passport: { select: lineagePassportPayload },
        },
      },
    },
  },
} satisfies Prisma.LineageNodeSelect

// ---------------------------------------------------------------------------
// Exported types so callers/UI consumers stay aligned with payload shape.
// ---------------------------------------------------------------------------

export type LineageNodeRow = Prisma.LineageNodeGetPayload<{
  select: typeof lineageNodeRowPayload
}>

export type LineageRelationshipRow = Prisma.LineageRelationshipGetPayload<{
  select: typeof lineageRelationshipPayload
}>

export type LineageNodeProfile = Prisma.LineageNodeGetPayload<{
  select: typeof lineageNodeProfilePayload
}>

export type LineageTreeResult = {
  rootId: string
  nodes: LineageNodeRow[]
  edges: LineageRelationshipRow[]
}

// ---------------------------------------------------------------------------
// Lineage Tree v1 — visual-tree payloads (tree-by-slug read model).
//
// Author: Cody / SESSION_0179 TASK_01.
// Refs:
//  - schema.prisma:2306-2395 (LineageTree, LineageTreeMember, LineageVisualGroup)
//  - docs/sprints/SESSION_0179.md
// ---------------------------------------------------------------------------

export const lineageVisualGroupPayload = {
  id: true,
  label: true,
  groupType: true,
  promotionDate: true,
  sortOrder: true,
  showPublicLabel: true,
  isCollapsedDefault: true,
  parentMemberId: true,
  treeId: true,
  promotionEvent: {
    select: { id: true, title: true, slug: true },
  },
} satisfies Prisma.LineageVisualGroupSelect

export const lineageTreeMemberPayload = {
  id: true,
  visualSortOrder: true,
  showPromotionDatePublic: true,
  showRankPublic: true,
  isClaimable: true,
  isCollapsedDefault: true,
  primaryVisualParentMemberId: true,
  visualGroupId: true,
  treeId: true,
  nodeId: true,
  node: { select: lineageNodeRowPayload },
} satisfies Prisma.LineageTreeMemberSelect

export const lineageTreePublicPayload = {
  id: true,
  brand: true,
  scopeType: true,
  slug: true,
  name: true,
  description: true,
  visibility: true,
  isPublished: true,
  isClaimable: true,
  defaultRootMemberId: true,
  organizationId: true,
  disciplineId: true,
  styleId: true,
  ownerNodeId: true,
  members: {
    select: lineageTreeMemberPayload,
    orderBy: { visualSortOrder: "asc" as const },
  },
  visualGroups: {
    select: lineageVisualGroupPayload,
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.LineageTreeSelect

export type LineageVisualGroupRow = Prisma.LineageVisualGroupGetPayload<{
  select: typeof lineageVisualGroupPayload
}>

export type LineageTreeMemberRow = Prisma.LineageTreeMemberGetPayload<{
  select: typeof lineageTreeMemberPayload
}>

export type LineageTreePublicRow = Prisma.LineageTreeGetPayload<{
  select: typeof lineageTreePublicPayload
}>

/**
 * Bare tree metadata — `LineageTreePublicRow` minus the heavy collections.
 * Callers consume the materialized arrays via the dedicated keys on
 * `LineageTreePublicResult` and never need to dig through `tree.members`.
 */
export type LineageTreeSummary = Omit<LineageTreePublicRow, "members" | "visualGroups">

export type LineageTreePublicResult = {
  tree: LineageTreeSummary
  members: LineageTreeMemberRow[]
  visualGroups: LineageVisualGroupRow[]
  defaultRootMemberId: string | null
}
