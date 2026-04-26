import { slugify } from "@primoui/utils"
import { Prisma } from "~/.generated/prisma/client"

/**
 * Generates a unique slug by checking for collisions and appending a suffix if necessary.
 */
const generateUniqueSlug = async (
  baseName: string,
  checkExists: (slug: string) => Promise<boolean>,
  currentSlug?: string,
): Promise<string> => {
  const baseSlug = slugify(baseName)

  // If the generated slug matches the existing one, no changes are needed
  if (currentSlug === baseSlug) {
    return baseSlug
  }

  // Check if the base slug is available
  if (!(await checkExists(baseSlug))) {
    return baseSlug
  }

  // Try appending suffixes (e.g., -2, -3) up to a limit
  let suffix = 2
  const MAX_ATTEMPTS = 20

  while (suffix <= MAX_ATTEMPTS) {
    const candidate = `${baseSlug}-${suffix}`

    if (!(await checkExists(candidate))) {
      return candidate
    }

    suffix++
  }

  throw new Error(`Failed to generate unique slug for "${baseName}".`)
}

export const uniqueSlugsExtension = Prisma.defineExtension(client => {
  const findUniqueRecord = async (model: "Tool" | "Category" | "Tag", slug: string) => {
    const payload = {
      where: { slug },
      select: { slug: true },
    }

    switch (model) {
      case "Tool":
        return Boolean(await client.tool.findUnique(payload))
      case "Category":
        return Boolean(await client.category.findUnique(payload))
      case "Tag":
        return Boolean(await client.tag.findUnique(payload))
    }
  }

  return client.$extends({
    name: "unique-slugs",
    query: {
      $allModels: {
        async create({ model, args, query }) {
          if (model !== "Tool" && model !== "Category" && model !== "Tag") {
            return query(args)
          }

          // Safely cast data to expected shape for slugified models
          const { name, slug } = args.data
          const source = slug || name

          if (!source) {
            return query(args)
          }

          const uniqueSlug = await generateUniqueSlug(source, slug => findUniqueRecord(model, slug))

          // Return query with updated slug
          return query({ ...args, data: { ...args.data, slug: uniqueSlug } } as any)
        },

        async update({ model, args, query }) {
          if (model !== "Tool" && model !== "Category" && model !== "Tag") {
            return query(args)
          }

          const { name, slug } = args.data
          const source = (slug || name) as string

          // Skip if neither name nor slug is being updated
          if (!source) {
            return query(args)
          }

          // Get the existing record to know its current slug
          let existingRecord: { slug: string } | null = null

          switch (model) {
            case "Tool":
              existingRecord = await client.tool.findUnique({
                where: args.where,
                select: { slug: true },
              })
              break
            case "Category":
              existingRecord = await client.category.findUnique({
                where: args.where,
                select: { slug: true },
              })
              break
            case "Tag":
              existingRecord = await client.tag.findUnique({
                where: args.where,
                select: { slug: true },
              })
              break
          }

          if (!existingRecord) {
            return query(args)
          }

          const uniqueSlug = await generateUniqueSlug(
            source,
            slug => findUniqueRecord(model, slug),
            existingRecord.slug,
          )

          return query({ ...args, data: { ...args.data, slug: uniqueSlug } })
        },
      },
    },
  })
})
