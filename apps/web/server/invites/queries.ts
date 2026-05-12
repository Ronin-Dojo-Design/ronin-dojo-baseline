/**
 * @added   SESSION_0147 (2026-05-12)
 * @why     Public query to validate invite codes for the claim flow
 * @wired   app/(web)/invite/[code]/page.tsx
 */
import type { Prisma } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Find a valid invite by code for the public claim flow.
 * Returns null if the invite doesn't exist, is not PENDING, is expired, or is at max uses.
 */
export const findValidInviteByCode = async (code: string) => {
  const invite = await db.invite.findUnique({
    where: { code },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          disciplines: {
            select: { discipline: { select: { id: true, name: true } } },
          },
        },
      },
    },
  })

  if (!invite) return null
  if (invite.status !== "PENDING") return null
  if (invite.expiresAt && invite.expiresAt < new Date()) return null
  if (invite.maxUses && invite.currentUses >= invite.maxUses) return null

  return invite
}
