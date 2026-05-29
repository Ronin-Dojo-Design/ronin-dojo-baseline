"use server"

import { after } from "next/server"
import { ToolStatus, ToolTier } from "~/.generated/prisma/client"
import { removeS3Directories } from "~/lib/media"
import { notifySubmitterOfToolPublished, notifySubmitterOfToolScheduled } from "~/lib/notifications"
import { adminActionClient } from "~/lib/safe-actions"
import { idSchema, idsSchema } from "~/server/admin/shared/schema"
import { toolSchema } from "~/server/admin/tools/schema"

export const upsertTool = adminActionClient
  .inputSchema(toolSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand, user } }) => {
    const { id, categories, tags, notifySubmitter, tier, isFeatured, ...input } = parsedInput
    const categoryIds = categories?.map(id => ({ id }))
    const tagIds = tags?.map(id => ({ id }))
    const existingTool = id ? await db.tool.findUnique({ where: { id } }) : null
    const listingTier = tier ?? (isFeatured ? ToolTier.Premium : ToolTier.Free)
    const featuredListing = listingTier === ToolTier.Premium

    const tool = id
      ? // If the tool exists, update it
        await db.tool.update({
          where: { id },
          data: {
            ...input,
            isFeatured: featuredListing,
            tier: listingTier,
            slug: input.slug || "",
            categories: { set: categoryIds },
            tags: { set: tagIds },
          },
        })
      : // Otherwise, create it
        await db.tool.create({
          data: {
            ...input,
            isFeatured: featuredListing,
            tier: listingTier,
            slug: input.slug || "",
            categories: { connect: categoryIds },
            tags: { connect: tagIds },
          },
        })

    // Handle notifications asynchronously
    after(async () => {
      if (notifySubmitter && (!existingTool || existingTool.status !== tool.status)) {
        // Notify the submitter of the tool published
        await notifySubmitterOfToolPublished(tool, brand)

        // Notify the submitter of the tool scheduled for publication
        await notifySubmitterOfToolScheduled(tool, brand)
      }
    })

    after(async () => {
      if (existingTool) {
        const auditEntries = [
          existingTool.status !== tool.status
            ? {
                action: "STATUS_TRANSITION",
                before: { status: existingTool.status },
                after: { status: tool.status },
              }
            : null,
          existingTool.tier !== tool.tier
            ? {
                action: "TIER_TRANSITION",
                before: { tier: existingTool.tier },
                after: { tier: tool.tier },
              }
            : null,
        ].filter(Boolean)

        for (const entry of auditEntries) {
          if (!entry) continue

          try {
            await db.auditLog.create({
              data: {
                brand,
                action: entry.action,
                entityType: "Tool",
                entityId: tool.id,
                before: entry.before,
                after: entry.after,
                userId: user.id,
              },
            })
          } catch (error) {
            console.error("[AuditLog] Failed to write Tool audit entry", {
              action: entry.action,
              entityId: tool.id,
              error,
            })
          }
        }
      }

      revalidate({
        paths: ["/admin/tools"],
        tags: ["tools", `tool-${tool.slug}`, "schedule"],
      })
    })

    return tool
  })

export const duplicateTool = adminActionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput: { id }, ctx: { db, revalidate } }) => {
    const originalTool = await db.tool.findUnique({
      where: { id },
      include: {
        categories: { select: { id: true } },
        tags: { select: { id: true } },
      },
    })

    if (!originalTool) {
      throw new Error("Tool not found")
    }

    const newName = `${originalTool.name} (Copy)`

    const duplicatedTool = await db.tool.create({
      data: {
        name: newName,
        slug: "", // Slug will be auto-generated
        websiteUrl: originalTool.websiteUrl,
        affiliateUrl: originalTool.affiliateUrl,
        tagline: originalTool.tagline,
        description: originalTool.description,
        content: originalTool.content,
        faviconUrl: originalTool.faviconUrl,
        screenshotUrl: originalTool.screenshotUrl,
        isFeatured: originalTool.isFeatured,
        tier: originalTool.tier,
        categories: { connect: originalTool.categories },
        tags: { connect: originalTool.tags },
      },
    })

    revalidate({
      paths: ["/admin/tools"],
      tags: ["tools"],
    })

    return duplicatedTool
  })

export const deleteTools = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate, brand, user } }) => {
    const tools = await db.tool.findMany({
      where: { id: { in: ids } },
      select: { id: true, slug: true, status: true },
    })
    const softDeletes = tools.filter(tool => tool.status === ToolStatus.Published)
    const hardDeletes = tools.filter(tool => tool.status !== ToolStatus.Published)

    await db.$transaction([
      ...(softDeletes.length
        ? [
            db.tool.updateMany({
              where: { id: { in: softDeletes.map(tool => tool.id) } },
              data: { status: ToolStatus.Deleted },
            }),
          ]
        : []),
      ...(hardDeletes.length
        ? [
            db.tool.deleteMany({
              where: { id: { in: hardDeletes.map(tool => tool.id) } },
            }),
          ]
        : []),
    ])

    after(async () => {
      if (hardDeletes.length) {
        await removeS3Directories(hardDeletes.map(({ slug }) => `tools/${slug}`))
      }

      for (const tool of softDeletes) {
        try {
          await db.auditLog.create({
            data: {
              brand,
              action: "STATUS_TRANSITION",
              entityType: "Tool",
              entityId: tool.id,
              before: { status: tool.status },
              after: { status: ToolStatus.Deleted },
              userId: user.id,
            },
          })
        } catch (error) {
          console.error("[AuditLog] Failed to write Tool soft-delete audit entry", {
            entityId: tool.id,
            error,
          })
        }
      }
    })

    revalidate({
      paths: ["/admin/tools"],
      tags: ["tools", ...softDeletes.map(tool => `tool-${tool.slug}`)],
    })

    return true
  })
