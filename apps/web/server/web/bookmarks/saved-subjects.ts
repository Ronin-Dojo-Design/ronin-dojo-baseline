import type { BookmarkSubjectType, Prisma } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * checkBookmarkSubjects — SESSION_0495 (D6). The BATCH sibling of the per-mount `checkBookmarkSubject`
 * action: given a user and a list of `{ subjectType, subjectId }` subjects, resolve which the user
 * has saved in ONE query instead of N per-card round-trips.
 *
 * A listing page (`/posts`) calls this server-side after fetching its rows and threads the resulting
 * `Set` down to each card's `ListingSaveButton initialSaved=…`, so a feed of N cards costs one query
 * on the server render instead of N `checkBookmarkSubject` actions on mount (the "30-action storm").
 *
 * Plain server function keyed on `userId` (the page has already resolved + guarded the session and
 * only calls this for a signed-in viewer) — mirrors `findBookmarkedToolIds` / `getSavedListings`,
 * not a safe-action. Signed-out callers never invoke it.
 */

/** The nullable FK column that backs each subject type (mirrors `subject.ts`'s BOOKMARK_SUBJECT_FK). */
const BOOKMARK_SUBJECT_FK = {
  TOOL: "toolId",
  PERSON: "passportId",
  ORGANIZATION: "organizationId",
  TECHNIQUE: "techniqueId",
  POST: "postId",
  TREE: "lineageTreeId",
  COMMUNITY_POST: "communityPostId",
} as const satisfies Record<BookmarkSubjectType, keyof Prisma.BookmarkWhereInput>

export type BookmarkSubjectRef = { subjectType: BookmarkSubjectType; subjectId: string }

/**
 * The set of `subjectId`s (from `subjects`) this user has bookmarked. One `findMany` with an OR over
 * the per-type FK columns; empty input short-circuits (no query). IDs are globally unique (cuid), so
 * membership can be tested by `subjectId` alone — the caller already knows each id's subject type.
 */
export const checkBookmarkSubjects = async (
  userId: string,
  subjects: BookmarkSubjectRef[],
): Promise<Set<string>> => {
  if (subjects.length === 0) return new Set()

  // Group the requested ids by their FK column so the OR carries one `{ column: { in: [...] } }`
  // clause per subject type present (usually just one on a single-type feed like /posts).
  const idsByColumn = new Map<string, string[]>()
  for (const { subjectType, subjectId } of subjects) {
    const column = BOOKMARK_SUBJECT_FK[subjectType]
    const ids = idsByColumn.get(column)
    if (ids) ids.push(subjectId)
    else idsByColumn.set(column, [subjectId])
  }

  const bookmarks = await db.bookmark.findMany({
    where: {
      userId,
      OR: [...idsByColumn].map(([column, ids]) => ({ [column]: { in: ids } })),
    },
    select: Object.fromEntries([...idsByColumn.keys()].map(column => [column, true])),
  })

  const saved = new Set<string>()
  for (const bookmark of bookmarks) {
    for (const column of idsByColumn.keys()) {
      const id = (bookmark as Record<string, string | null>)[column]
      if (id) saved.add(id)
    }
  }
  return saved
}
