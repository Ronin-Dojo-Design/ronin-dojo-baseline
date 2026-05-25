"use server"

import type { DataSubjectRequestStatus } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export async function findDataSubjectRequests(options?: { status?: DataSubjectRequestStatus }) {
  return db.dataSubjectRequest.findMany({
    where: options?.status ? { status: options.status } : undefined,
    orderBy: { submittedAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      fulfiller: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function findDataSubjectRequestById(id: string) {
  return db.dataSubjectRequest.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      fulfiller: { select: { id: true, name: true, email: true } },
    },
  })
}
