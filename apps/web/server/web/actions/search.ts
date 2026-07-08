"use server"

import { z } from "zod"
import { ToolStatus } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { actionClient } from "~/lib/safe-actions"
import { can } from "~/server/orpc/permissions"
import { db } from "~/services/db"

export const searchItems = actionClient
  .inputSchema(z.object({ query: z.string() }))
  .action(async ({ parsedInput: { query } }) => {
    const start = performance.now()
    const session = await getServerSession()

    // Action gate (authz-conformance sweep item 3): "may this account see
    // unpublished tools in search?" is a capability question → `can(user,
    // "tools.manage")`, not a raw role check. `tools.manage` is held by no
    // non-admin role, so admins still see drafts (via `["*"]`) and everyone else
    // sees only Published — behavior preserved.
    const canSeeUnpublished = can(session?.user, "tools.manage")

    const [tools, categories, tags] = await Promise.all([
      db.tool.findMany({
        where: {
          status: canSeeUnpublished ? undefined : ToolStatus.Published,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { tagline: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { name: "asc" },
        take: 10,
      }),

      db.category.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        orderBy: { name: "asc" },
        take: 10,
      }),

      db.tag.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        orderBy: { name: "asc" },
        take: 10,
      }),
    ])

    console.log(`Search: ${Math.round(performance.now() - start)}ms`)

    return { tools, categories, tags }
  })
