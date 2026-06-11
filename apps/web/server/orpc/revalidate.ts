import { revalidatePath, updateTag } from "next/cache"

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
 * Ronin delta: uses `updateTag` to match the existing `lib/safe-actions.ts`
 * revalidate semantics (upstream calls `revalidateTag(tag, "infinite")`) —
 * both layers must invalidate identically while they coexist during the
 * migration.
 */
export const revalidate = ({ paths = [], tags = [] }: RevalidateOptions) => {
  for (const path of paths) {
    revalidatePath(path)
  }

  for (const tag of tags) {
    updateTag(tag)
  }
}
