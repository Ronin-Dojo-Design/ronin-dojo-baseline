import type { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { resolveDisplayAvatar } from "~/lib/media"
import { db } from "~/services/db"

/**
 * Resolve the signed-in user's display avatar for site chrome (header / nav drawer):
 * `Passport.avatarUrl ?? user.image`, falling back to the brand gi default for guests
 * (and avatar-less users).
 *
 * Server-only — it queries Passport and reads the session, and `resolveDisplayAvatar`
 * lives in `lib/media` which pulls the Prisma client. NEVER import this (or lib/media)
 * into a client component; resolve here and pass the string down as a prop.
 */
export const getCurrentUserAvatar = async (brand: Brand): Promise<string | null> => {
  const session = await getServerSession()
  const user = session?.user
  if (!user) return resolveDisplayAvatar(null, brand)

  const passport = await db.passport.findFirst({
    where: { userId: user.id },
    select: { avatarUrl: true },
  })

  return resolveDisplayAvatar(passport?.avatarUrl ?? user.image, brand)
}
