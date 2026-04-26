import { type Prisma, ToolStatus } from "~/.generated/prisma/client"

export const tagOnePayload = {
  name: true,
  slug: true,
  _count: { select: { tools: { where: { status: ToolStatus.Published } } } },
} satisfies Prisma.TagSelect

export const tagManyPayload = {
  name: true,
  slug: true,
  _count: { select: { tools: { where: { status: ToolStatus.Published } } } },
} satisfies Prisma.TagSelect

export type TagOne = Prisma.TagGetPayload<{ select: typeof tagOnePayload }>
export type TagMany = Prisma.TagGetPayload<{ select: typeof tagManyPayload }>
