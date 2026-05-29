import type { Prisma } from "~/.generated/prisma/client"
import { db } from "~/services/db"

import type { AttachableEntityType } from "./actions"

export const findMedia = async (params: {
  brand?: string
  type?: string
  q?: string
  page?: number
  perPage?: number
}) => {
  const { brand, type, q, page = 1, perPage = 24 } = params
  const skip = (page - 1) * perPage

  const where: Prisma.MediaWhereInput = {
    ...(brand && { brand: brand as any }),
    ...(type && { type: type as any }),
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  }

  const [media, total] = await db.$transaction([
    db.media.findMany({
      where,
      include: {
        uploadedBy: { select: { id: true, name: true } },
        _count: { select: { attachments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip,
    }),
    db.media.count({ where }),
  ])

  return { media, total, page, perPage }
}

export const findMediaById = async (id: string) => {
  return db.media.findUnique({
    where: { id },
    include: {
      uploadedBy: { select: { id: true, name: true } },
      attachments: true,
    },
  })
}

export const findMediaAttachments = async (entityType: AttachableEntityType, entityId: string) => {
  const fkColumn = `${entityType}Id` as string
  const where: Prisma.MediaAttachmentWhereInput = { [fkColumn]: entityId }

  return db.mediaAttachment.findMany({
    where,
    include: {
      media: {
        select: {
          id: true,
          url: true,
          type: true,
          title: true,
          mimeType: true,
          thumbnailUrl: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  })
}
