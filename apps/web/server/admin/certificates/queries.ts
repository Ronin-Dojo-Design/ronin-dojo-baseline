import { Brand, type Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { CertificatesTableSchema } from "~/server/admin/certificates/schema"
import { db } from "~/services/db"

export const findCertificateTemplates = async (
  search: CertificatesTableSchema,
  where?: Prisma.CertificateTemplateWhereInput,
) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.CertificateTemplateOrderByWithRelationInput>(search)

  const expressions: (Prisma.CertificateTemplateWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.CertificateTemplateWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.CertificateTemplateWhereInput>({
    baseWhere: { brand: Brand.BBL },
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: templates,
    total,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.certificateTemplate.findMany({
        where: whereQuery,
        include: {
          organization: { select: { id: true, name: true } },
        },
        orderBy: [...orderBy, { createdAt: "asc" }],
        take: perPage,
        skip: offset,
      }),
    count: () => db.certificateTemplate.count({ where: whereQuery }),
  })

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
