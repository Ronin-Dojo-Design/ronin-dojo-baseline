import { isTruthy } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import type { ProgramsTableSchema } from "~/server/admin/programs/schema"
import { getRequestBrand } from "~/lib/brand-context"
import { db } from "~/services/db"

export const findPrograms = async (search: ProgramsTableSchema, where?: Prisma.ProgramWhereInput) => {
  const { name, status, sort, page, perPage, from, to, operator } = search
  const brand = await getRequestBrand()

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.ProgramWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    status ? { status: status as any } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.ProgramWhereInput = {
    brand,
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [programs, total] = await db.$transaction([
    db.program.findMany({
      where: { ...whereQuery, ...where },
      include: {
        organization: { select: { id: true, name: true } },
        discipline: { select: { id: true, name: true } },
        _count: { select: { programEnrollments: true, courses: true, classSchedules: true } },
      },
      orderBy: [...orderBy, { createdAt: "asc" }],
      take: perPage,
      skip: offset,
    }),

    db.program.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(total / perPage)
  return { programs, total, pageCount }
}

export const findProgramById = async (id: string) => {
  const brand = await getRequestBrand()

  return db.program.findUnique({
    where: { id, brand },
    include: {
      organization: { select: { id: true, name: true } },
      discipline: { select: { id: true, name: true } },
      courses: {
        include: {
          course: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  })
}

export const findProgramList = async (where?: Prisma.ProgramWhereInput) => {
  const brand = await getRequestBrand()

  return db.program.findMany({
    where: { brand, ...where },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}
