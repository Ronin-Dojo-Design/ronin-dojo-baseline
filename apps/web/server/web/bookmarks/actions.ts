"use server"

import { userActionClient } from "~/lib/safe-actions"
import {
  bookmarkSubjectInputSchema,
  setBookmarkSubjectInputSchema,
} from "~/server/web/bookmarks/schema"
import {
  bookmarkSubjectCreate,
  bookmarkSubjectTag,
  bookmarkSubjectWhere,
  bookmarkSubjectWhereUnique,
} from "~/server/web/bookmarks/subject"

// =============================================================================
// Polymorphic Save actions (SESSION_0397) — Save any listing subject: Tool / person (Passport) /
// Organization / Technique / Post / LineageTree. The tool Save button (`ListingBookmarkButton`) is now
// a thin adapter over `ListingSaveButton` (subjectType TOOL), so these two actions back every entity —
// the old tool-only check/set/removeBookmark actions retired with that consolidation.
// =============================================================================

export const checkBookmarkSubject = userActionClient
  .inputSchema(bookmarkSubjectInputSchema)
  .action(async ({ parsedInput, ctx: { db, user } }) => {
    const bookmark = await db.bookmark.findUnique({
      where: bookmarkSubjectWhereUnique(user.id, parsedInput),
      select: { id: true },
    })

    return { bookmarked: Boolean(bookmark) }
  })

export const setBookmarkSubject = userActionClient
  .inputSchema(setBookmarkSubjectInputSchema)
  .action(async ({ parsedInput: { bookmarked, ...subject }, ctx: { db, user, revalidate } }) => {
    if (bookmarked) {
      await db.bookmark.upsert({
        where: bookmarkSubjectWhereUnique(user.id, subject),
        update: {},
        create: bookmarkSubjectCreate(user.id, subject),
      })
    } else {
      await db.bookmark.deleteMany({ where: bookmarkSubjectWhere(user.id, subject) })
    }

    revalidate({
      paths: ["/app/profile"],
      tags: ["bookmarks", bookmarkSubjectTag(subject)],
    })

    return { bookmarked }
  })
