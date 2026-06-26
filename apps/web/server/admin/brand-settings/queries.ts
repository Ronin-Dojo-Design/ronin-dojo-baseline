import { cache } from "react"
import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

// Request-scoped memoization: the root app/layout.tsx reads BrandSettings twice per
// request (generateMetadata + the layout body), both with Brand.BBL. cache() collapses
// those to a single query per render — same result, one fewer DB round-trip on every page.
export const findBrandSettings = cache(async (brand: Brand) => {
  return db.brandSettings.findUnique({ where: { brand } })
})
