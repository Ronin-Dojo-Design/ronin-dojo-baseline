import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

/**
 * seed-baseline-owner.ts
 *
 * Production-safe one-time bootstrap of Brian's identity graph on production:
 *   - Ensures User.role = "admin"
 *   - Passport (display name, bio, credentials)
 *   - DirectoryProfile (public, Boulder CO)
 *   - Membership × 5 disciplines (BJJ, Muay Thai, Eskrima, Boxing, Self Defense) as ACTIVE
 *   - MembershipRoleAssignment → OWNER + INSTRUCTOR on each membership
 *   - RankAward for BJJ (Black Belt 1st Degree) and Eskrima (Guro-level)
 *   - Organization.ownerId set
 *
 * Idempotency: every insert uses findFirst/findUnique + create if missing.
 *
 * Usage:
 *   bun run apps/web/prisma/seed-baseline-owner.ts
 *
 * @see docs/sprints/SESSION_0174.md
 * @see apps/web/prisma/seed-baseline-launch.ts (OWNER_ID source)
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const BRAND = "BASELINE_MARTIAL_ARTS" as const
const ORG_SLUGS = ["baseline-martial-arts", "baseline-academy"] as const
// Production user ID from seed-baseline-launch.ts (SESSION_0172)
const OWNER_ID = "KBYccZGiVxmOhV2l1LpB2XjSgES3MI8T"

async function main() {
  const now = new Date()

  console.log("\n🌱 seed-baseline-owner.ts — Brian's identity graph\n")

  // -----------------------------------------------------------------------
  // 0. Find the user + org
  // -----------------------------------------------------------------------
  const user = await db.user.findUnique({ where: { id: OWNER_ID } })
  if (!user) {
    throw new Error(
      `User not found: id=${OWNER_ID}. Log in via magic link first to create your Better-Auth user record.`,
    )
  }
  console.log(`   Found user: ${user.email} (name=${user.name}, role=${user.role})`)

  let org: { id: string } | null = null
  let orgSlug = ""
  for (const slug of ORG_SLUGS) {
    org = await db.organization.findFirst({ where: { brand: BRAND, slug }, select: { id: true } })
    if (org) {
      orgSlug = slug
      break
    }
  }
  if (!org) {
    throw new Error(`Organization not found: brand=${BRAND}, slugs=${ORG_SLUGS.join(",")}`)
  }
  console.log(`   Found org: ${orgSlug} (id=${org.id})`)

  // -----------------------------------------------------------------------
  // 1. Ensure admin role
  // -----------------------------------------------------------------------
  if (user.role !== "admin") {
    await db.user.update({ where: { id: OWNER_ID }, data: { role: "admin" } })
    console.log(`   ✅ Upgraded user role: ${user.role} → admin`)
  } else {
    console.log("   User already admin")
  }

  // Set lastActiveBrandId
  if (!user.lastActiveBrandId) {
    await db.user.update({ where: { id: OWNER_ID }, data: { lastActiveBrandId: BRAND } })
    console.log(`   ✅ Set lastActiveBrandId → ${BRAND}`)
  }

  // -----------------------------------------------------------------------
  // 2. Passport
  // -----------------------------------------------------------------------
  const passportData = {
    displayName: "Brian Scott",
    legalFirstName: "Brian",
    legalLastName: "Scott",
    bio: "Head Instructor — 5th Degree Black Belt (Master) in PIMA Denver Doce Pares Eskrima under GM Steve Wolk. 8x World Champion (WEKAF), 14x National Champion. BJJ Black Belt under Bob Bass (Rigan Machado lineage). 4th Degree Black Belt in American Freestyle Karate under Mr. Tim Wolchek. 1st Degree Black Belt in Kajukenbo under Sifu Tim Mills, Sifu Sam Carter, and Sifu Hanyann Ng. Certified Kru under Sak Va Roon (Thailand). 25+ years of professional teaching experience.",
    socialLinks: {
      instagram: "https://instagram.com/tuffbuffs",
      facebook: "https://facebook.com/tuffbuffs",
      youtube: "https://youtube.com/@tuffbuffs",
      email: "tuffbuffs@colorado.edu",
    },
  }
  const existingPassport = await db.passport.findUnique({ where: { userId: OWNER_ID } })
  if (!existingPassport) {
    await db.passport.create({ data: { userId: OWNER_ID, ...passportData } })
    console.log("   ✅ Created Passport")
  } else {
    await db.passport.update({ where: { userId: OWNER_ID }, data: passportData })
    console.log("   ✅ Updated Passport (bio + social links)")
  }

  // -----------------------------------------------------------------------
  // 3. DirectoryProfile
  // -----------------------------------------------------------------------
  const existingDir = await db.directoryProfile.findUnique({ where: { userId: OWNER_ID } })
  if (!existingDir) {
    await db.directoryProfile.create({
      data: {
        userId: OWNER_ID,
        slug: "brian-scott",
        visibility: "PUBLIC",
        locationCity: "Boulder",
        locationRegion: "CO",
        locationCountry: "US",
        showEmail: true,
        showPhone: false,
        showOrgs: true,
        showRanks: true,
      },
    })
    console.log("   ✅ Created DirectoryProfile")
  } else {
    console.log("   DirectoryProfile already exists")
  }

  // -----------------------------------------------------------------------
  // 4. Ensure org ownership
  // -----------------------------------------------------------------------
  const orgFull = await db.organization.findUnique({
    where: { id: org.id },
    select: { ownerId: true },
  })
  if (orgFull?.ownerId !== OWNER_ID) {
    await db.organization.update({ where: { id: org.id }, data: { ownerId: OWNER_ID } })
    console.log(`   ✅ Set org owner → ${OWNER_ID}`)
  } else {
    console.log("   Org owner already set")
  }

  // -----------------------------------------------------------------------
  // 5. Memberships — one per discipline Brian teaches
  // -----------------------------------------------------------------------
  const disciplineCodes = [
    "bjj",
    "muay-thai",
    "eskrima",
    "boxing",
    "self-defense",
    "karate",
    "kajukenbo",
  ]
  const membershipMap = new Map<string, string>() // code → membershipId

  for (const code of disciplineCodes) {
    const disc = await db.discipline.findFirst({
      where: { code, isSystem: true },
      select: { id: true },
    })
    if (!disc) {
      console.log(`   ⚠️  Discipline ${code} not found, skipping`)
      continue
    }

    const existing = await db.membership.findFirst({
      where: { userId: OWNER_ID, organizationId: org.id, disciplineId: disc.id },
      select: { id: true },
    })
    if (existing) {
      membershipMap.set(code, existing.id)
      console.log(`   Membership ${code}: already exists`)
    } else {
      const m = await db.membership.create({
        data: {
          brand: BRAND,
          status: "ACTIVE",
          userId: OWNER_ID,
          organizationId: org.id,
          disciplineId: disc.id,
          joinedAt: now,
        },
        select: { id: true },
      })
      membershipMap.set(code, m.id)
      console.log(`   ✅ Created Membership: ${code}`)
    }
  }

  // -----------------------------------------------------------------------
  // 6. MembershipRoleAssignment — OWNER + INSTRUCTOR on each membership
  // -----------------------------------------------------------------------
  const ownerRole = await db.role.findFirst({
    where: { code: "OWNER", isSystem: true, brand: null },
  })
  const instructorRole = await db.role.findFirst({
    where: { code: "INSTRUCTOR", isSystem: true, brand: null },
  })

  for (const [code, membershipId] of membershipMap) {
    for (const role of [ownerRole, instructorRole]) {
      if (!role) continue
      const existing = await db.membershipRoleAssignment.findFirst({
        where: { membershipId, roleId: role.id },
      })
      if (!existing) {
        await db.membershipRoleAssignment.create({ data: { membershipId, roleId: role.id } })
        console.log(`   ✅ Assigned ${role.code} role on ${code} membership`)
      }
    }
  }

  // -----------------------------------------------------------------------
  // 7. RankAwards — Brian's verified ranks
  //    awardedById is null for now — instructors aren't platform users yet.
  //    notes captures lineage text; awardedBy gets wired when they join.
  // -----------------------------------------------------------------------

  // Clean up incorrect Eskrima award (was Guro/BB, should be 5th Degree/5D)
  const incorrectEskRank = await db.rank.findFirst({
    where: {
      rankSystem: { discipline: { code: "eskrima" }, name: { contains: "PIMA Denver" } },
      shortName: "BB",
    },
  })
  if (incorrectEskRank) {
    const bad = await db.rankAward.findFirst({
      where: { userId: OWNER_ID, rankId: incorrectEskRank.id },
    })
    if (bad) {
      await db.rankAward.delete({ where: { id: bad.id } })
      console.log("   🧹 Removed incorrect Eskrima rank award (was Guro/BB)")
    }
  }

  async function ensureRankAward(
    label: string,
    rankQuery: Parameters<typeof db.rank.findFirst>[0],
    notes: string,
    location: string | null,
    membershipDiscCode: string,
  ) {
    const rank = await db.rank.findFirst(rankQuery)
    if (!rank) {
      console.log(`   ⚠️  Rank not found for ${label}`)
      return
    }
    const existing = await db.rankAward.findFirst({ where: { userId: OWNER_ID, rankId: rank.id } })
    if (!existing) {
      await db.rankAward.create({
        data: { userId: OWNER_ID, rankId: rank.id, awardedAt: now, notes, location },
      })
      console.log(`   ✅ RankAward: ${label}`)
    } else {
      console.log(`   RankAward ${label}: already exists`)
    }
    // Update membership with current rank
    const mId = membershipMap.get(membershipDiscCode)
    if (mId) {
      await db.membership.update({ where: { id: mId }, data: { rankId: rank.id } })
    }
  }

  // 1. BJJ — 1st Degree Black Belt under Bob Bass (Rigan Machado lineage)
  await ensureRankAward(
    "BJJ Black Belt 1st Degree",
    { where: { rankSystem: { discipline: { code: "bjj" } }, shortName: "BK1" } },
    "1st Degree Black Belt under Bob Bass — 1st American Black Belt under Rigan Machado, 2x Pan American Champion, 8th Degree Coral Belt. Lineage: Mitsuyo Maeda → Carlos Gracie → Rigan Machado → Bob Bass → Brian Scott",
    "South Bay Jiu Jitsu, Hermosa Beach, CA",
    "bjj",
  )

  // 2. Eskrima — 5th Degree Black Belt (Master) under GM Steve Wolk, PIMA Denver
  await ensureRankAward(
    "Eskrima 5th Degree Black Belt (Master)",
    {
      where: {
        rankSystem: { discipline: { code: "eskrima" }, name: { contains: "PIMA Denver" } },
        shortName: "5D",
      },
    },
    "5th Degree Black Belt (Master) under GM Steve Wolk, PIMA Denver Doce Pares Eskrima. 8x World Champion (WEKAF), 14x National Champion.",
    "Denver, CO",
    "eskrima",
  )

  // 3. Muay Thai — Certified Kru (Red-Blue-Black) under Sak Va Roon
  await ensureRankAward(
    "Muay Thai Kru (Red-Blue-Black)",
    { where: { rankSystem: { discipline: { code: "muay-thai" } }, shortName: "RBB" } },
    "Certified Kru under Sak Va Roon Thai Boxing (Thailand)",
    null,
    "muay-thai",
  )

  // 4. Karate — 4th Degree Black Belt American Freestyle Karate under Mr. Tim Wolchek
  //    Uses USA Karate Federation system — Yondan (4th Dan)
  await ensureRankAward(
    "Karate 4th Degree Black Belt (Yondan)",
    { where: { rankSystem: { discipline: { code: "karate" } }, shortName: "4D" } },
    "4th Degree Black Belt, American Freestyle Karate under Mr. Tim Wolchek",
    "Wolchek Academy, CO",
    "karate",
  )

  // 5. Kajukenbo — 1st Degree Black Belt under Sifu Tim Mills, Sifu Sam Carter, Sifu Hanyann Ng
  await ensureRankAward(
    "Kajukenbo 1st Degree Black Belt",
    { where: { rankSystem: { discipline: { code: "kajukenbo" } }, shortName: "BK1" } },
    "1st Degree Black Belt under Sifu Tim Mills, Sifu Sam Carter, and Sifu Hanyann Ng",
    null,
    "kajukenbo",
  )

  // -----------------------------------------------------------------------
  // 8. CourseEnrollment + CurriculumItemCompletion
  //    Enroll Brian in BJJ Safety course, complete all 3 items (self-verified)
  // -----------------------------------------------------------------------
  // 9. Certification — Brian is the author/instructor of BJJ Safety
  // -----------------------------------------------------------------------
  const bjjSafetyCourse = await db.course.findFirst({
    where: { brand: BRAND, slug: "bjj-safety-school" },
    include: { curriculumItems: { orderBy: { order: "asc" } } },
  })
  if (bjjSafetyCourse) {
    let enrollment = await db.courseEnrollment.findFirst({
      where: { userId: OWNER_ID, courseId: bjjSafetyCourse.id },
    })
    if (!enrollment) {
      enrollment = await db.courseEnrollment.create({
        data: { userId: OWNER_ID, courseId: bjjSafetyCourse.id },
      })
      console.log("   ✅ Enrolled in BJJ Safety course")
    } else {
      console.log("   BJJ Safety enrollment already exists")
    }

    let completionsCreated = 0
    for (const item of bjjSafetyCourse.curriculumItems) {
      const existing = await db.curriculumItemCompletion.findFirst({
        where: { enrollmentId: enrollment.id, curriculumItemId: item.id },
      })
      if (!existing) {
        await db.curriculumItemCompletion.create({
          data: {
            enrollmentId: enrollment.id,
            curriculumItemId: item.id,
            verifiedById: OWNER_ID,
          },
        })
        completionsCreated++
      }
    }
    if (completionsCreated > 0) {
      // Mark course as completed
      await db.courseEnrollment.update({
        where: { id: enrollment.id },
        data: { completedAt: now },
      })
      console.log(`   ✅ Completed ${completionsCreated} curriculum items (BJJ Safety)`)
    } else {
      console.log("   BJJ Safety items already completed")
    }

    // 9. Certification — marks Brian as the instructor/author of BJJ Safety
    const existingCert = await db.certification.findFirst({
      where: { userId: OWNER_ID, courseId: bjjSafetyCourse.id, type: "SAFETY" },
    })
    if (!existingCert) {
      await db.certification.create({
        data: {
          type: "SAFETY",
          status: "ACTIVE",
          userId: OWNER_ID,
          organizationId: org.id,
          courseId: bjjSafetyCourse.id,
          issuedById: OWNER_ID,
          notes:
            "Course author and lead instructor. Program designed by Brian Scott for Baseline Martial Arts.",
        },
      })
      console.log("   ✅ Created SAFETY Certification (BJJ Safety — instructor/author)")
    } else {
      console.log("   BJJ Safety certification already exists")
    }
  }

  console.log("\n🎉 seed-baseline-owner.ts complete.\n")
}

main()
  .catch(error => {
    console.error("❌ Error in seed-baseline-owner:", error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
