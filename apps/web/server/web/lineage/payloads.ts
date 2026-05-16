import type { Prisma } from "~/.generated/prisma/client"

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
// User → DirectoryProfile snippet (location string for tree + drawer)
// ---------------------------------------------------------------------------

const lineageUserDirectoryProfilePayload = {
  locationCity: true,
  locationRegion: true,
  locationCountry: true,
  visibility: true,
} satisfies Prisma.DirectoryProfileSelect

// ---------------------------------------------------------------------------
// User snippet used everywhere a LineageNode carries its user identity.
// ---------------------------------------------------------------------------

const lineageUserPayload = {
  id: true,
  name: true,
  image: true,
  passport: {
    select: {
      displayName: true,
    },
  },
  directoryProfile: {
    select: lineageUserDirectoryProfilePayload,
  },
} satisfies Prisma.UserSelect

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
  bio: true,
  userId: true,
  user: {
    select: {
      ...lineageUserPayload,
      // Single most-recent RankAward across any rank-system so the tree card
      // can show "Black Belt — BJJ" without a separate query. Drawer payload
      // joins more.
      rankAwards: {
        select: {
          id: true,
          awardedAt: true,
          notes: true,
          location: true,
          rank: {
            select: {
              id: true,
              name: true,
              shortName: true,
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
          awardedBy: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { awardedAt: "desc" as const },
        take: 1,
      },
      // Latest active membership → school + discipline label.
      memberships: {
        where: { status: "ACTIVE" as const },
        select: {
          id: true,
          discipline: {
            select: { id: true, name: true, slug: true },
          },
          organization: {
            select: { id: true, name: true, slug: true, city: true, state: true },
          },
        },
        orderBy: { joinedAt: "desc" as const },
        take: 1,
      },
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
  bio: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      ...lineageUserPayload,
      rankAwards: {
        select: {
          id: true,
          awardedAt: true,
          notes: true,
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
                },
              },
            },
          },
          awardedBy: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: [{ awardedAt: "desc" as const }],
      },
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
  // Instructors who pointed AT this node (this user is the student).
  relationshipsTo: {
    where: { type: "INSTRUCTOR_STUDENT" as const },
    select: {
      ...lineageRelationshipPayload,
      fromNode: {
        select: {
          id: true,
          slug: true,
          isVerified: true,
          visibility: true,
          user: { select: lineageUserPayload },
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
