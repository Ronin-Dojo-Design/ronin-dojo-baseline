"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import {
  transitionMembershipSchema,
  VALID_TRANSITIONS,
} from "~/server/admin/memberships/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const transitionMembershipStatus = adminActionClient
  .inputSchema(transitionMembershipSchema)
  .action(async ({ parsedInput: { id, toStatus }, ctx: { db, revalidate } }) => {
    const membership = await db.membership.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!membership) {
      throw new Error("Membership not found")
    }

    const allowed = VALID_TRANSITIONS[membership.status] ?? []
    if (!allowed.includes(toStatus)) {
      throw new Error(
        `Invalid transition: ${membership.status} → ${toStatus}. Allowed: ${allowed.join(", ") || "(terminal state)"}`,
      )
    }

    const updated = await db.membership.update({
      where: { id },
      data: {
        status: toStatus as typeof membership.status,
        ...(toStatus === "ACTIVE" && !membership.status ? { joinedAt: new Date() } : {}),
        ...(toStatus === "CANCELLED" || toStatus === "EXPIRED" ? { leftAt: new Date() } : {}),
      },
    })

    after(async () => {
      revalidate({
        paths: ["/admin/memberships"],
        tags: ["memberships", `membership-${updated.id}`],
      })
    })

    return updated
  })

export const deleteMemberships = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate, brand } }) => {
    await db.membership.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/admin/memberships"],
      tags: ["memberships"],
    })

    return true
  })
