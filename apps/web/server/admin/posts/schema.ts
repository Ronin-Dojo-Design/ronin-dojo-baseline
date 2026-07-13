import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import { PostStatus } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"
import { DEFAULT_POST_SORT } from "./constants"
import type { PostAdminRow } from "./queries"

export const postsTableParamsSchema = {
  title: parseAsString.withDefault(""),
  sort: getSortingStateParser<PostAdminRow>().withDefault(DEFAULT_POST_SORT),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  status: parseAsArrayOf(parseAsStringEnum<PostStatus>(Object.values(PostStatus))).withDefault([
    PostStatus.Draft,
  ]),
}

export const postsTableParamsCache = createSearchParamsCache(postsTableParamsSchema)
export type PostsTableSchema = Awaited<ReturnType<typeof postsTableParamsCache.parse>>

export const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().optional(),
  publishedAt: z.coerce.date().nullish(),
  status: z.enum(PostStatus).default("Draft"),
  tools: z.array(z.string()).optional(),
})

export type PostSchema = z.infer<typeof postSchema>
