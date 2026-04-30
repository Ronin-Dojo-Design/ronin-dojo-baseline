"use server"

import { headers } from "next/headers"
import { Brand } from "~/.generated/prisma/client"
import { canEditOrganization } from "~/lib/authz"
import { userActionClient } from "~/lib/safe-actions"
import { archiveProgramSchema, saveProgramSchema } from "~/server/web/program/schemas"

const HOST_TO_BRAND: Record<string, Brand> = {
  "ronindojo.local": Brand.RONIN_DOJO_DESIGN,
  "baseline.local": Brand.BASELINE_MARTIAL_ARTS,
  "bbl.local": Brand.BBL,
  "wekaf.local": Brand.WEKAF,
  localhost: Brand.BASELINE_MARTIAL_ARTS,
}

const BRANDS = new Set<string>(Object.values(Brand))

const isBrand = (value: string | null): value is Brand => {
  return !!value && BRANDS.has(value)
}

const getRequestBrand = async (): Promise<Brand> => {
  const requestHeaders = await headers()
  const headerBrand = requestHeaders.get("x-brand")

  if (isBrand(headerBrand)) {
    return headerBrand
  }

  const host = requestHeaders.get("host")?.split(":")[0]?.toLowerCase()
  return host ? (HOST_TO_BRAND[host] ?? Brand.RONIN_DOJO_DESIGN) : Brand.RONIN_DOJO_DESIGN
}

export const saveProgram = userActionClient
  .inputSchema(saveProgramSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()
    const { organizationId, ...programInput } = parsedInput
    const id = programInput.id && programInput.id !== "none" ? programInput.id : undefined
    const disciplineId =
      programInput.disciplineId && programInput.disciplineId !== "none"
        ? programInput.disciplineId
        : undefined
    const description = programInput.description?.trim() || undefined

    const organization = await db.organization.findFirst({
      where: {
        id: organizationId,
        brand: requestBrand,
      },
      select: {
        id: true,
        brand: true,
        slug: true,
        disciplines: { select: { disciplineId: true } },
      },
    })

    if (!organization) {
      throw new Error("Organization not found for the active brand")
    }

    const canEdit = await canEditOrganization(user, organization.id)
    if (!canEdit) {
      throw new Error("You are not authorized to manage programs for this organization")
    }

    if (disciplineId) {
      const disciplineBelongsToOrganization = organization.disciplines.some(
        discipline => discipline.disciplineId === disciplineId,
      )

      if (!disciplineBelongsToOrganization) {
        throw new Error("Selected discipline is not linked to this organization")
      }
    }

    if (id) {
      const existingProgram = await db.program.findFirst({
        where: {
          id,
          brand: requestBrand,
        },
        select: { organizationId: true },
      })

      if (!existingProgram || existingProgram.organizationId !== organization.id) {
        throw new Error("Program not found for this organization")
      }
    }

    const program = id
      ? await db.program.update({
          where: { id },
          data: {
            name: programInput.name,
            slug: programInput.slug,
            status: programInput.status,
            description,
            disciplineId,
          },
        })
      : await db.program.create({
          data: {
            name: programInput.name,
            slug: programInput.slug,
            status: programInput.status,
            description,
            brand: organization.brand,
            organizationId: organization.id,
            disciplineId,
          },
        })

    revalidate({
      paths: [
        "/programs",
        `/programs/${program.id}`,
        `/programs/${program.id}/edit`,
        `/organizations/${organization.slug}`,
      ],
    })

    return program
  })

export const archiveProgram = userActionClient
  .inputSchema(archiveProgramSchema)
  .action(async ({ parsedInput: { id }, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    const program = await db.program.findFirst({
      where: {
        id,
        brand: requestBrand,
      },
      select: {
        id: true,
        organizationId: true,
        organization: { select: { slug: true } },
      },
    })

    if (!program) {
      throw new Error("Program not found for the active brand")
    }

    const canEdit = await canEditOrganization(user, program.organizationId)
    if (!canEdit) {
      throw new Error("You are not authorized to archive this program")
    }

    const archived = await db.program.update({
      where: { id: program.id },
      data: { status: "ARCHIVED" },
    })

    revalidate({
      paths: [
        "/programs",
        `/programs/${program.id}`,
        `/programs/${program.id}/edit`,
        `/organizations/${program.organization.slug}`,
      ],
    })

    return archived
  })
