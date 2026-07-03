import type { SavedListing } from "~/lib/bookmarks/saved-listing"
import { initialsOf, organizationHref } from "~/lib/directory/facet-result"
import { db } from "~/services/db"

/**
 * getSavedListings — SESSION_0397. Reads a user's polymorphic bookmarks and normalizes each into the
 * shared `SavedListing` card shape so the dashboard "Saved" tab renders mixed entities through the one
 * `ListingCard`. Selects only already-public card fields per subject; subjects whose subject row is
 * gone or unrenderable (e.g. a person with no public directory slug) are dropped.
 */
export async function getSavedListings(userId: string): Promise<SavedListing[]> {
  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      subjectType: true,
      tool: {
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          description: true,
          faviconUrl: true,
        },
      },
      passport: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          user: { select: { name: true, image: true } },
          directoryProfile: { select: { slug: true } },
        },
      },
      organization: {
        select: { id: true, name: true, slug: true, type: true, description: true },
      },
      technique: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          discipline: { select: { name: true } },
        },
      },
      post: { select: { id: true, slug: true, title: true, description: true } },
      communityPost: { select: { id: true, slug: true, title: true } },
      lineageTree: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          discipline: { select: { name: true } },
        },
      },
    },
  })

  return bookmarks.flatMap(bookmark => {
    const listing = SUBJECT_MAPPERS[bookmark.subjectType](bookmark)
    return listing ? [listing] : []
  })
}

type SavedBookmarkRow = {
  id: string
  subjectType: "TOOL" | "PERSON" | "ORGANIZATION" | "TECHNIQUE" | "POST" | "TREE" | "COMMUNITY_POST"
  tool: {
    id: string
    slug: string
    name: string
    tagline: string | null
    description: string | null
    faviconUrl: string | null
  } | null
  passport: {
    id: string
    displayName: string | null
    avatarUrl: string | null
    bio: string | null
    user: { name: string | null; image: string | null } | null
    directoryProfile: { slug: string | null } | null
  } | null
  organization: {
    id: string
    name: string
    slug: string
    type: string
    description: string | null
  } | null
  technique: {
    id: string
    slug: string
    name: string
    description: string | null
    discipline: { name: string } | null
  } | null
  post: { id: string; slug: string; title: string; description: string | null } | null
  communityPost: { id: string; slug: string; title: string } | null
  lineageTree: {
    id: string
    slug: string
    name: string
    description: string | null
    discipline: { name: string } | null
  } | null
}

/**
 * One small mapper per subject type → keeps each builder trivial (and the dispatcher above flat),
 * since every subject reads different card fields. A mapper returns `null` when its subject row is
 * gone or unrenderable (e.g. a person with no public directory slug), and the dispatcher drops it.
 */
const SUBJECT_MAPPERS: Record<
  SavedBookmarkRow["subjectType"],
  (bookmark: SavedBookmarkRow) => SavedListing | null
> = {
  TOOL: ({ id, tool }) =>
    tool && {
      key: id,
      subjectType: "TOOL",
      subjectId: tool.id,
      href: `/${tool.slug}`,
      name: tool.name,
      tagline: tool.tagline,
      description: tool.description,
      imageUrl: tool.faviconUrl,
      initials: initialsOf(tool.name),
      media: "favicon",
    },
  PERSON: ({ id, passport }) => {
    const slug = passport?.directoryProfile?.slug
    if (!passport || !slug) return null
    const name = passport.displayName ?? passport.user?.name ?? "Anonymous"
    return {
      key: id,
      subjectType: "PERSON",
      subjectId: passport.id,
      href: `/directory/${slug}`,
      name,
      tagline: null,
      description: passport.bio,
      imageUrl: passport.avatarUrl ?? passport.user?.image ?? null,
      initials: initialsOf(name),
      media: "avatar",
    }
  },
  ORGANIZATION: ({ id, organization }) =>
    organization && {
      key: id,
      subjectType: "ORGANIZATION",
      subjectId: organization.id,
      href: organizationHref(organization.type, organization.slug),
      name: organization.name,
      tagline: organization.type.replace(/_/g, " "),
      description: organization.description,
      imageUrl: null,
      initials: initialsOf(organization.name),
      media: "avatar",
    },
  TECHNIQUE: ({ id, technique }) =>
    technique && {
      key: id,
      subjectType: "TECHNIQUE",
      subjectId: technique.id,
      href: `/techniques/${technique.slug}`,
      name: technique.name,
      tagline: technique.discipline?.name ?? null,
      description: technique.description,
      imageUrl: null,
      initials: initialsOf(technique.name),
      media: "none",
    },
  POST: ({ id, post }) =>
    post && {
      key: id,
      subjectType: "POST",
      subjectId: post.id,
      href: `/blog/${post.slug}`,
      name: post.title,
      tagline: null,
      description: post.description,
      imageUrl: null,
      initials: initialsOf(post.title),
      media: "none",
    },
  // @added SESSION_0493 — member community post (/posts), distinct from editorial POST (/blog).
  COMMUNITY_POST: ({ id, communityPost }) =>
    communityPost && {
      key: id,
      subjectType: "COMMUNITY_POST",
      subjectId: communityPost.id,
      href: `/posts/${communityPost.slug}`,
      name: communityPost.title,
      tagline: null,
      description: null,
      imageUrl: null,
      initials: initialsOf(communityPost.title),
      media: "none",
    },
  TREE: ({ id, lineageTree }) =>
    lineageTree && {
      key: id,
      subjectType: "TREE",
      subjectId: lineageTree.id,
      href: `/lineage/${lineageTree.slug}`,
      name: lineageTree.name,
      tagline: lineageTree.discipline?.name ?? null,
      description: lineageTree.description,
      imageUrl: null,
      initials: initialsOf(lineageTree.name),
      media: "none",
    },
}
