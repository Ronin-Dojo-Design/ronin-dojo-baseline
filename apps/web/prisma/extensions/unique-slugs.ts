import { Prisma } from "~/.generated/prisma/client"
import { generateUniqueSlug } from "~/lib/slug"

type SluggedModel = "Tool" | "Category" | "Tag" | "Post"

const isSluggedModel = (model: string): model is SluggedModel => {
  return model === "Tool" || model === "Category" || model === "Tag" || model === "Post"
}

export const uniqueSlugsExtension = Prisma.defineExtension(client => {
  const findUniqueRecord = async (model: SluggedModel, slug: string) => {
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
      case "Post":
        return Boolean(await client.post.findUnique(payload))
    }
  }

  return client.$extends({
    name: "unique-slugs",
    query: {
      $allModels: {
        async create({ model, args, query }) {
          if (!isSluggedModel(model)) {
            return query(args)
          }

          // Safely cast data to expected shape for slugified models
          const data = args.data as { name?: string; title?: string; slug?: string }
          const { name, title, slug } = data
          const label = name || title
          const source = slug || label

          if (!source) {
            return query(args)
          }

          const uniqueSlug = await generateUniqueSlug({
            source,
            isSlugTaken: slug => findUniqueRecord(model, slug),
          })

          // Return query with updated slug
          return query({ ...args, data: { ...args.data, slug: uniqueSlug } } as any)
        },

        async update({ model, args, query }) {
          if (!isSluggedModel(model)) {
            return query(args)
          }

          const data = args.data as { name?: string; title?: string; slug?: string }
          const { name, title, slug } = data
          const source = (slug || name || title) as string | undefined

          // Skip if neither name nor slug is being updated
          if (!source) {
            return query(args)
          }

          // Get the existing record to know its current slug
          let existingRecord: { slug: string } | null = null

          switch (model) {
            case "Tool":
              existingRecord = await client.tool.findUnique({
                where: args.where as any,
                select: { slug: true },
              })
              break
            case "Category":
              existingRecord = await client.category.findUnique({
                where: args.where as any,
                select: { slug: true },
              })
              break
            case "Tag":
              existingRecord = await client.tag.findUnique({
                where: args.where as any,
                select: { slug: true },
              })
              break
            case "Post":
              existingRecord = await client.post.findUnique({
                where: args.where as any,
                select: { slug: true },
              })
              break
          }

          if (!existingRecord) {
            return query(args)
          }

          const uniqueSlug = await generateUniqueSlug({
            source,
            isSlugTaken: slug => findUniqueRecord(model, slug),
            currentSlug: existingRecord.slug,
          })

          return query({ ...args, data: { ...args.data, slug: uniqueSlug } } as any)
        },
      },
    },
  })
})
