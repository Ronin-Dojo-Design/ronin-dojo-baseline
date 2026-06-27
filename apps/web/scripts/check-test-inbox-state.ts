import "dotenv/config"

import { db } from "~/services/db"

/**
 * SESSION_0457 — STRICTLY READ-ONLY pre-send check for the FI-001 test inbox.
 * Surfaces any leftover state for ronindojodesign@gmail.com that could cause the 0444
 * stale-binding auto-claim trap when the operator clicks the test magic link.
 *
 *   cd apps/web
 *   SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod scripts/check-test-inbox-state.ts
 */

const TEST_EMAIL = "ronindojodesign@gmail.com"

async function main() {
  const normalized = TEST_EMAIL.trim().toLowerCase()

  const user = await db.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
    select: { id: true, email: true, createdAt: true },
  })

  const pendingClaims = await db.lineagePendingClaim.findMany({
    where: { email: { equals: normalized, mode: "insensitive" } },
    select: {
      id: true,
      email: true,
      brand: true,
      expiresAt: true,
      consumedAt: true,
      node: { select: { slug: true } },
    },
  })

  // Any node already claimed BY this test account (passport.userId === user.id).
  const claimedNodes = user
    ? await db.lineageNode.findMany({
        where: { passport: { userId: user.id } },
        select: { slug: true, passport: { select: { displayName: true } } },
      })
    : []

  console.log(`── test-inbox state for ${TEST_EMAIL} ──────────────`)
  console.log(`User row:            ${user ? `EXISTS (${user.id})` : "none ✓"}`)
  console.log(
    `LineagePendingClaim: ${pendingClaims.length === 0 ? "none ✓" : pendingClaims.length}`,
  )
  if (pendingClaims.length)
    console.table(
      pendingClaims.map(
        (p: {
          email: string
          brand: string
          node: { slug: string | null } | null
          expiresAt: Date | null
          consumedAt: Date | null
        }) => ({
          email: p.email,
          brand: p.brand,
          node: p.node?.slug ?? "(none)",
          expiresAt: p.expiresAt,
          consumedAt: p.consumedAt,
        }),
      ),
    )
  console.log(`Nodes claimed by it: ${claimedNodes.length === 0 ? "none ✓" : claimedNodes.length}`)
  if (claimedNodes.length)
    console.table(
      claimedNodes.map((n: { slug: string | null; passport: { displayName: string | null } }) => ({
        slug: n.slug,
        name: n.passport?.displayName,
      })),
    )

  const clean = !user && pendingClaims.length === 0 && claimedNodes.length === 0
  console.log(
    `\n${clean ? "✅ CLEAN — safe to test-send." : "⚠ LEFTOVER STATE — clean before the operator clicks."}`,
  )

  await db.$disconnect()
}

main().catch(async error => {
  console.error(error)
  await db.$disconnect()
  process.exit(1)
})
