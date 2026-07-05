import { revalidatePath, revalidateTag } from "next/cache"

export type RevalidateOptions = {
  paths?: Array<string>
  tags?: Array<string>
}

/**
 * Build per-slug detail cache tags for one entity. Pairs with the read-side
 * `cacheTag("<prefix>", "<prefix>-<slug>")` convention.
 *
 * Pass every slug a mutation touches — typically the row's previous slug and its
 * new one. A slug change must invalidate BOTH, or the old URL keeps serving a
 * stale page. Falsy slugs are dropped and duplicates collapse, so an unchanged
 * slug yields a single tag.
 */
export const detailTags = (prefix: string, ...slugs: Array<string | undefined | null>) => {
  const unique = [...new Set(slugs.filter((slug): slug is string => Boolean(slug)))]
  return unique.map(slug => `${prefix}-${slug}`)
}

/**
 * Queue path + tag revalidations after a mutation.
 *
 * Ronin delta: uses `revalidateTag(tag, { expire: 0 })`, NOT `updateTag`. Every
 * oRPC mutation reaches this seam through `/api/rpc` — a Route Handler — and
 * Next 16 hard-throws `updateTag` outside a Server Action (error E872; surfaced
 * live by the first tag-passing oRPC procedure, SESSION_0498 storyboard). The
 * `{ expire: 0 }` profile expires the tagged entries IMMEDIATELY (the next
 * request recomputes — `revalidation-utils.js` maps it to `durations.expire = 0`),
 * matching the `updateTag` semantics `lib/safe-actions.ts` keeps in its true
 * Server-Action context. A named profile like `"max"` would instead serve
 * stale-while-revalidate — one request behind, verified live on :3497.
 */
export const revalidate = ({ paths = [], tags = [] }: RevalidateOptions) => {
  for (const path of paths) {
    revalidatePath(path)
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 })
  }
}
