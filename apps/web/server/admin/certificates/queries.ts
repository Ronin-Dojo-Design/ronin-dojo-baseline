import { isTruthy } from "@dirstack/utils"
import { endOfDay, startOfDay } from "date-fns"
import { Brand, type Prisma } from "~/.generated/prisma/client"
import type { CertificatesTableSchema } from "~/server/admin/certificates/schema"
import { db } from "~/services/db"

export const findCertificateTemplates = async (
  search: CertificatesTableSchema,
  where?: Prisma.CertificateTemplateWhereInput,
) => {
  const { name, sort, page, perPage, from, to, operator } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.CertificateTemplateWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.CertificateTemplateWhereInput = {
    brand: Brand.BBL,
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [templates, total] = await db.$transaction([
    db.certificateTemplate.findMany({
      where: { ...whereQuery, ...where },
      include: {
        organization: { select: { id: true, name: true } },
      },
      orderBy: [...orderBy, { createdAt: "asc" }],
      take: perPage,
      skip: offset,
    }),

    db.certificateTemplate.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(total / perPage)
  return { templates, total, pageCount }
}

export const findCertificateTemplateById = async (id: string) => {
  return db.certificateTemplate.findUnique({
    where: { id, brand: Brand.BBL },
    include: {
      organization: { select: { id: true, name: true } },
    },
  })
}

export const findCertificateTemplateList = async (where?: Prisma.CertificateTemplateWhereInput) => {
  return db.certificateTemplate.findMany({
    where: { brand: Brand.BBL, ...where },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  })
}
