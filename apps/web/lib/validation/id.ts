import { z } from "zod"

const cuid2Pattern = /^[a-z][a-z0-9]{23}$/
const legacyCuidSchema = z.string().cuid()

export const databaseIdSchema = z
  .string()
  .refine(value => legacyCuidSchema.safeParse(value).success || cuid2Pattern.test(value), {
    message: "Invalid id",
  })

export const optionalDatabaseIdSchema = z
  .union([z.literal(""), z.literal("none"), databaseIdSchema])
  .optional()
