/**
 * SESSION_0325 — Passport avatar projection integration test for the directory read models.
 *
 * Proves the directory list projection:
 *  - prefers `Passport.avatarUrl` over `User.image`,
 *  - falls back to `User.image` when no Passport avatar is set,
 *  - still excludes HIDDEN DirectoryProfiles (visibility preserved).
 *
 * Imports the real `directoryProfileListPayload`, so a regression that drops
 * `passport.avatarUrl` from the select fails this test.
 *
 * Uses the real Postgres dev DB. Fixtures are cleaned up after.
 *
 * Run: cd apps/web && bun test server/web/directory/queries.avatar-projection.integration.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { type Brand, type DirectoryVisibility, MembershipStatus } from "~/.generated/prisma/client"
import { directoryProfileListPayload } from "~/server/web/directory/payloads"
import { db } from "~/services/db"

/**
 * Inline replica of the getDirectoryProfiles / searchDirectoryProfiles list
 * projection, without the cache wrapper that requires Next.js runtime. Uses the
 * real list payload + the real `passport.avatarUrl ?? user.image` projection.
 */
async function listDirectoryAvatars(brand: Brand, viewerUserId: string | null) {
  const allowedVisibility: DirectoryVisibility[] = viewerUserId
    ? ["PUBLIC", "MEMBERS_ONLY"]
    : ["PUBLIC"]

  const profiles = await db.directoryProfile.findMany({
    where: {
      visibility: { in: allowedVisibility },
      passport: { user: { memberships: { some: { organization: { brand } } } } },
    },
    select: {
      ...directoryProfileListPayload,
      passport: {
        select: {
          ...directoryProfileListPayload.passport.select,
          user: {
            select: {
              ...directoryProfileListPayload.passport.select.user.select,
              memberships: {
                where: { organization: { brand } },
                select: directoryProfileListPayload.passport.select.user.select.memberships.select,
              },
            },
          },
        },
      },
    },
  })

  return profiles.map(profile => ({
    userId: profile.passport.user?.id ?? null,
    image: profile.passport.avatarUrl ?? profile.passport.user?.image ?? null,
  }))
}

// -----------------------------------------------------------------------------
// Fixtures
// -----------------------------------------------------------------------------

const TS = Date.now()
const TAG_PREFIX = "session-0325-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

const USER_IMAGE_WITH = `https://example.com/user-with-${TS}.jpg`
const PASSPORT_AVATAR = `https://example.com/passport-avatar-${TS}.jpg`
const USER_IMAGE_FALLBACK = `https://example.com/user-fallback-${TS}.jpg`
const USER_IMAGE_HIDDEN = `https://example.com/user-hidden-${TS}.jpg`

let brand: Brand
let orgId: string
let disciplineId: string
let withAvatarUserId: string
let fallbackUserId: string
let hiddenUserId: string

beforeAll(async () => {
  const org = await db.organization.findFirst()
  if (!org) throw new Error("No organization in DB — run seed first")
  orgId = org.id
  brand = org.brand

  // Membership.disciplineId is a required FK; any valid discipline satisfies it.
  // The directory read model only filters on organization.brand, not discipline.
  const discipline = await db.discipline.findFirst()
  if (!discipline) throw new Error("No discipline in DB — run seed first")
  disciplineId = discipline.id

  // PUBLIC user WITH a promoted Passport avatar — projection should prefer it.
  const withAvatar = await db.user.create({
    data: {
      name: tag("with"),
      email: `${tag("with")}@test.local`,
      emailVerified: true,
      image: USER_IMAGE_WITH,
      passport: {
        create: {
          avatarUrl: PASSPORT_AVATAR,
          directoryProfile: { create: { visibility: "PUBLIC" } },
        },
      },
    },
  })
  withAvatarUserId = withAvatar.id

  // PUBLIC user with NO Passport avatar — projection should fall back to User.image.
  const fallback = await db.user.create({
    data: {
      name: tag("fallback"),
      email: `${tag("fallback")}@test.local`,
      emailVerified: true,
      image: USER_IMAGE_FALLBACK,
      passport: { create: { directoryProfile: { create: { visibility: "PUBLIC" } } } },
    },
  })
  fallbackUserId = fallback.id

  // HIDDEN user — must never appear (visibility preserved).
  const hidden = await db.user.create({
    data: {
      name: tag("hidden"),
      email: `${tag("hidden")}@test.local`,
      emailVerified: true,
      image: USER_IMAGE_HIDDEN,
      passport: {
        create: {
          avatarUrl: `https://example.com/hidden-avatar-${TS}.jpg`,
          directoryProfile: { create: { visibility: "HIDDEN" } },
        },
      },
    },
  })
  hiddenUserId = hidden.id

  for (const userId of [withAvatarUserId, fallbackUserId, hiddenUserId]) {
    await db.membership.create({
      data: {
        brand,
        status: MembershipStatus.ACTIVE,
        userId,
        organizationId: orgId,
        disciplineId,
      },
    })
  }
})

afterAll(async () => {
  // Phase 1 — delete this run's fixtures by ID (fast, no false positives).
  const userIds = [withAvatarUserId, fallbackUserId, hiddenUserId]
  await db.membership.deleteMany({ where: { userId: { in: userIds } } })
  await db.directoryProfile.deleteMany({ where: { passport: { userId: { in: userIds } } } })
  await db.passport.deleteMany({ where: { userId: { in: userIds } } })
  await db.user.deleteMany({ where: { id: { in: userIds } } })

  // Phase 2 — sweep zombie rows from any crashed prior run (tag-based).
  const zombies = await db.user.findMany({
    where: { email: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  if (zombies.length > 0) {
    const zombieIds = zombies.map(z => z.id)
    await db.membership.deleteMany({ where: { userId: { in: zombieIds } } })
    await db.directoryProfile.deleteMany({ where: { passport: { userId: { in: zombieIds } } } })
    await db.passport.deleteMany({ where: { userId: { in: zombieIds } } })
    await db.user.deleteMany({ where: { id: { in: zombieIds } } })
  }
})

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("directory avatar projection — passport.avatarUrl ?? user.image", () => {
  it("prefers the promoted Passport avatar over User.image", async () => {
    const results = await listDirectoryAvatars(brand, null)
    const row = results.find(r => r.userId === withAvatarUserId)

    expect(row).toBeDefined()
    expect(row!.image).toBe(PASSPORT_AVATAR)
  })

  it("falls back to User.image when no Passport avatar is set", async () => {
    const results = await listDirectoryAvatars(brand, null)
    const row = results.find(r => r.userId === fallbackUserId)

    expect(row).toBeDefined()
    expect(row!.image).toBe(USER_IMAGE_FALLBACK)
  })

  it("excludes HIDDEN profiles for both anonymous and authenticated viewers", async () => {
    const anon = await listDirectoryAvatars(brand, null)
    const authed = await listDirectoryAvatars(brand, withAvatarUserId)

    expect(anon.some(r => r.userId === hiddenUserId)).toBe(false)
    expect(authed.some(r => r.userId === hiddenUserId)).toBe(false)
  })
})
