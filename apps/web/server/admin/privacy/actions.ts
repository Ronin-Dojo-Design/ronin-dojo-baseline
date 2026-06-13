"use server"

import { after } from "next/server"
import { z } from "zod"
import { notifyUserOfDsrStatusUpdate } from "~/lib/notifications"
import { adminActionClient } from "~/lib/safe-actions"

const transitionDsrSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
  toStatus: z.enum(["PENDING", "IN_PROGRESS", "FULFILLED", "REJECTED"]),
  notes: z.string().trim().max(2000).optional(),
})

/**
 * Valid DSR status transitions.
 * PENDING → IN_PROGRESS → FULFILLED | REJECTED
 * REJECTED is terminal. FULFILLED is terminal.
 */
const DSR_VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["FULFILLED", "REJECTED"],
  FULFILLED: [],
  REJECTED: [],
}

export const transitionDataSubjectRequestStatus = adminActionClient
  .inputSchema(transitionDsrSchema)
  .action(
    async ({ parsedInput: { id, toStatus, notes }, ctx: { db, revalidate, brand, user } }) => {
      const request = await db.dataSubjectRequest.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          type: true,
          user: { select: { email: true, name: true } },
        },
      })

      if (!request) {
        throw new Error("Data Subject Request not found")
      }

      const allowed = DSR_VALID_TRANSITIONS[request.status] ?? []
      if (!allowed.includes(toStatus)) {
        throw new Error(
          `Invalid transition: ${request.status} → ${toStatus}. Allowed: ${allowed.join(", ") || "(terminal state)"}`,
        )
      }

      const previousStatus = request.status
      const isFinal = toStatus === "FULFILLED" || toStatus === "REJECTED"

      const updated = await db.dataSubjectRequest.update({
        where: { id },
        data: {
          status: toStatus as typeof request.status,
          ...(notes !== undefined ? { notes } : {}),
          ...(isFinal ? { fulfilledAt: new Date(), fulfilledBy: user.id } : {}),
        },
      })

      after(async () => {
        try {
          await db.auditLog.create({
            data: {
              brand,
              action: "dsr.transition",
              entityType: "DataSubjectRequest",
              entityId: id,
              before: { status: previousStatus },
              after: { status: toStatus, notes },
              userId: user.id,
            },
          })
        } catch (error) {
          console.error("[AuditLog] Failed to write dsr.transition audit entry", {
            entityId: id,
            action: "dsr.transition",
            error,
          })
        }

        revalidate({
          paths: ["/app/privacy/requests", `/app/privacy/requests/${id}`],
        })

        const recipient = request.user?.email
        if (recipient) {
          try {
            await notifyUserOfDsrStatusUpdate({
              to: recipient,
              firstName: request.user?.name?.split(" ")[0] ?? null,
              requestId: id,
              type: request.type,
              previousStatus,
              newStatus: toStatus,
              notes: notes ?? null,
            })
          } catch (error) {
            console.error("[notifyUserOfDsrStatusUpdate] Failed to send status email", {
              requestId: id,
              error,
            })
          }
        }
      })

      return updated
    },
  )
