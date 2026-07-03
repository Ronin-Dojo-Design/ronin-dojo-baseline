import type { BookmarkSubjectType, Prisma } from "~/.generated/prisma/client"

/**
 * Polymorphic Bookmark subject mapping (SESSION_0397; COMMUNITY_POST added SESSION_0493). A
 * Bookmark targets exactly one of the nullable FK columns, discriminated by `subjectType`. These
 * helpers translate the generic `{ subjectType, subjectId }` contract used by the actions/UI into
 * the concrete, fully-typed Prisma selectors — keeping the "exactly one set, matching subjectType"
 * invariant in one place.
 */

export type BookmarkSubject = { subjectType: BookmarkSubjectType; subjectId: string }

/** The nullable FK column that backs each subject type. */
const BOOKMARK_SUBJECT_FK = {
  TOOL: "toolId",
  PERSON: "passportId",
  ORGANIZATION: "organizationId",
  TECHNIQUE: "techniqueId",
  POST: "postId",
  TREE: "lineageTreeId",
  COMMUNITY_POST: "communityPostId",
} as const satisfies Record<BookmarkSubjectType, keyof Prisma.BookmarkUncheckedCreateInput>

/** Prisma compound-unique selector for (user, subject) — drives findUnique/upsert. */
export function bookmarkSubjectWhereUnique(
  userId: string,
  { subjectType, subjectId }: BookmarkSubject,
): Prisma.BookmarkWhereUniqueInput {
  switch (subjectType) {
    case "TOOL":
      return { userId_toolId: { userId, toolId: subjectId } }
    case "PERSON":
      return { userId_passportId: { userId, passportId: subjectId } }
    case "ORGANIZATION":
      return { userId_organizationId: { userId, organizationId: subjectId } }
    case "TECHNIQUE":
      return { userId_techniqueId: { userId, techniqueId: subjectId } }
    case "POST":
      return { userId_postId: { userId, postId: subjectId } }
    case "TREE":
      return { userId_lineageTreeId: { userId, lineageTreeId: subjectId } }
    case "COMMUNITY_POST":
      return { userId_communityPostId: { userId, communityPostId: subjectId } }
  }
}

/** Create payload — subjectType + the single matching FK set. */
export function bookmarkSubjectCreate(
  userId: string,
  { subjectType, subjectId }: BookmarkSubject,
): Prisma.BookmarkUncheckedCreateInput {
  return { userId, subjectType, [BOOKMARK_SUBJECT_FK[subjectType]]: subjectId }
}

/** Non-unique where (user + FK) — drives deleteMany. */
export function bookmarkSubjectWhere(
  userId: string,
  { subjectType, subjectId }: BookmarkSubject,
): Prisma.BookmarkWhereInput {
  return { userId, [BOOKMARK_SUBJECT_FK[subjectType]]: subjectId }
}

/** Cache tag for a single subject's saved-state. */
export function bookmarkSubjectTag({ subjectType, subjectId }: BookmarkSubject) {
  return `bookmark-${subjectType}-${subjectId}`
}
