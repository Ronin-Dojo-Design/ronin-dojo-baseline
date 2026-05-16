import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

/**
 * seed-baseline-platform.ts
 *
 * Production-safe seed for platform-level data missing from production:
 *   - 6 system Roles
 *   - 4 S3_UPLOAD Entitlements (all brands)
 *   - 4 system Tournament Roles
 *   - 6 system Gamification Event Types
 *   - 6 Subscription Tiers (1 universal FREE + 5 BBL)
 *   - 5 Karate Styles (substyles)
 *   - 3 OrganizationDiscipline links (bjj, muay-thai, eskrima → baseline org)
 *   - 4 ContentAtom + ContentVariant (video seeds)
 *   - 6 ClassSchedules (CU Rec Summer 2026 — real schedule from tuffbuffs.com / colorado.edu/recreation)
 *
 * Idempotency: every insert uses findFirst + create if missing. Re-running is a no-op.
 *
 * NOT seeded: test users, Passport, DirectoryProfile, Membership,
 * MembershipRoleAssignment, RankAward, CourseEnrollment, CurriculumItemCompletion.
 * Those are dev-only fixtures that require synthetic users.
 *
 * Usage:
 *   bun run apps/web/prisma/seed-baseline-platform.ts
 *
 * @see docs/sprints/SESSION_0174.md
 * @see apps/web/prisma/seed.ts (source data)
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const BRAND = "BASELINE_MARTIAL_ARTS" as const
const ORG_SLUGS = ["baseline-martial-arts", "baseline-academy"] as const

async function main() {
  console.log("\n🌱 seed-baseline-platform.ts — Roles, Entitlements, TournamentRoles, GamificationEventTypes, SubscriptionTiers, Styles, OrgDisciplines, Content, Schedules\n")

  // -----------------------------------------------------------------------
  // 0. Look up the Baseline org
  // -----------------------------------------------------------------------
  let org: { id: string; ownerId: string | null } | null = null
  let orgSlug = ""
  for (const slug of ORG_SLUGS) {
    org = await db.organization.findFirst({
      where: { brand: BRAND, slug },
      select: { id: true, ownerId: true },
    })
    if (org) { orgSlug = slug; break }
  }
  if (!org) {
    throw new Error(`Organization not found: brand=${BRAND}, slugs=${ORG_SLUGS.join(",")}. Run seed-baseline-launch.ts first.`)
  }
  console.log(`   Found org: ${orgSlug} (id=${org.id})`)

  // -----------------------------------------------------------------------
  // 1. System Roles (6)
  // F-06: @@unique([code, brand]) with brand=null — must use findFirst+create
  // -----------------------------------------------------------------------
  const systemRoles = [
    { code: "STUDENT", name: "Student", description: "Standard member/student role", isSystem: true },
    { code: "INSTRUCTOR", name: "Instructor", description: "Teaches classes and can verify curriculum completions", isSystem: true },
    { code: "OWNER", name: "Owner", description: "Organization owner with full administrative access", isSystem: true },
    { code: "COACH", name: "Coach", description: "Coaches students, can award ranks and manage rosters", isSystem: true },
    { code: "ORG_ADMIN", name: "Organization Admin", description: "Administrative access to organization settings and membership", isSystem: true },
    { code: "STYLE_APPROVER", name: "Style Approver", description: "Can approve user-submitted styles within their organization", isSystem: true },
  ]
  let rolesCreated = 0
  let rolesSkipped = 0
  for (const role of systemRoles) {
    const existing = await db.role.findFirst({ where: { code: role.code, brand: null, isSystem: true } })
    if (existing) { rolesSkipped++ } else { await db.role.create({ data: role }); rolesCreated++ }
  }
  console.log(`   Roles: Created ${rolesCreated}, Skipped ${rolesSkipped}`)

  // -----------------------------------------------------------------------
  // 2. Entitlements — S3_UPLOAD for all 4 brands
  // -----------------------------------------------------------------------
  const brands = ["RONIN_DOJO_DESIGN", "BASELINE_MARTIAL_ARTS", "BBL", "WEKAF"] as const
  let entCreated = 0
  let entSkipped = 0
  for (const brand of brands) {
    const existing = await db.entitlement.findFirst({ where: { brand, key: "S3_UPLOAD" } })
    if (existing) { entSkipped++ } else {
      await db.entitlement.create({
        data: {
          brand,
          key: "S3_UPLOAD",
          name: "Media Upload",
          description: "Allows uploading images and videos to S3 storage (avatar, cover photo, video intro)",
        },
      })
      entCreated++
    }
  }
  console.log(`   Entitlements: Created ${entCreated}, Skipped ${entSkipped}`)

  // -----------------------------------------------------------------------
  // 3. Tournament Roles (4)
  // F-06: @@unique([code, brand]) with brand=null
  // -----------------------------------------------------------------------
  const tournamentRoles = [
    { code: "COMPETITOR", name: "Competitor", description: "Participates in divisions as a competitor", isSystem: true },
    { code: "COACH", name: "Coach", description: "Corners/coaches competitors during events", isSystem: true },
    { code: "JUDGE", name: "Judge", description: "Judges or referees matches/forms", isSystem: true },
    { code: "VOLUNTEER", name: "Volunteer", description: "General volunteer staff", isSystem: true },
  ]
  let trCreated = 0
  let trSkipped = 0
  for (const tr of tournamentRoles) {
    const existing = await db.tournamentRole.findFirst({ where: { code: tr.code, brand: null, isSystem: true } })
    if (existing) { trSkipped++ } else { await db.tournamentRole.create({ data: tr }); trCreated++ }
  }
  console.log(`   Tournament Roles: Created ${trCreated}, Skipped ${trSkipped}`)

  // -----------------------------------------------------------------------
  // 4. Gamification Event Types (6)
  // F-06: @@unique([code, brand]) with brand=null
  // -----------------------------------------------------------------------
  const gamificationEventTypes = [
    { code: "BELT_PROMOTION", name: "Belt/Rank Promotion", description: "Awarded when a student receives a new rank", defaultPoints: 100, isSystem: true },
    { code: "CLASS_ATTENDANCE", name: "Class Attendance", description: "Awarded for attending a class session", defaultPoints: 10, isSystem: true },
    { code: "TOURNAMENT_WIN", name: "Tournament Win", description: "Awarded for winning a division in a tournament", defaultPoints: 50, isSystem: true },
    { code: "TOURNAMENT_PARTICIPATION", name: "Tournament Participation", description: "Awarded for participating in a tournament", defaultPoints: 25, isSystem: true },
    { code: "COURSE_COMPLETION", name: "Course Completion", description: "Awarded for completing an entire course", defaultPoints: 75, isSystem: true },
    { code: "CURRICULUM_ITEM_COMPLETION", name: "Curriculum Item Completion", description: "Awarded for completing a single curriculum item", defaultPoints: 5, isSystem: true },
  ]
  let geCreated = 0
  let geSkipped = 0
  for (const ge of gamificationEventTypes) {
    const existing = await db.gamificationEventType.findFirst({ where: { code: ge.code, brand: null, isSystem: true } })
    if (existing) { geSkipped++ } else { await db.gamificationEventType.create({ data: ge }); geCreated++ }
  }
  console.log(`   Gamification Event Types: Created ${geCreated}, Skipped ${geSkipped}`)

  // -----------------------------------------------------------------------
  // 5. Subscription Tiers (1 universal FREE + 5 BBL)
  // F-06: universal FREE tier has brand=null
  // -----------------------------------------------------------------------
  let stCreated = 0
  let stSkipped = 0

  const existingFreeTier = await db.subscriptionTier.findFirst({ where: { code: "FREE", brand: null, isSystem: true } })
  if (existingFreeTier) { stSkipped++ } else {
    await db.subscriptionTier.create({ data: { code: "FREE", name: "Free", description: "Basic free tier", level: 0, isSystem: true } })
    stCreated++
  }

  const bblTiers = [
    { code: "FREE", name: "Free", description: "BBL free tier", level: 0, isSystem: false, brand: "BBL" as const },
    { code: "PREMIUM", name: "Premium", description: "BBL premium membership", level: 10, isSystem: false, brand: "BBL" as const },
    { code: "INSTRUCTOR", name: "Instructor", description: "BBL instructor tier", level: 20, isSystem: false, brand: "BBL" as const },
    { code: "SCHOOL_OWNER", name: "School Owner", description: "BBL school owner tier", level: 30, isSystem: false, brand: "BBL" as const },
    { code: "LEGEND", name: "Legend", description: "BBL legend tier", level: 40, isSystem: false, brand: "BBL" as const },
  ]
  for (const tier of bblTiers) {
    const existing = await db.subscriptionTier.findFirst({ where: { code: tier.code, brand: tier.brand } })
    if (existing) { stSkipped++ } else { await db.subscriptionTier.create({ data: tier }); stCreated++ }
  }
  console.log(`   Subscription Tiers: Created ${stCreated}, Skipped ${stSkipped}`)

  // -----------------------------------------------------------------------
  // 6. Karate Styles (5 substyles)
  // -----------------------------------------------------------------------
  const karateDiscipline = await db.discipline.findFirst({ where: { code: "karate", isSystem: true } })
  let stylesCreated = 0
  let stylesSkipped = 0
  if (karateDiscipline) {
    const karateStyles = [
      { code: "shotokan", name: "Shotokan Karate", status: "APPROVED" as const },
      { code: "wado-ryu", name: "Wado-Ryu", status: "APPROVED" as const },
      { code: "goju-ryu", name: "Goju-Ryu", status: "APPROVED" as const },
      { code: "hawaiian-kenpo", name: "Hawaiian Kenpo", status: "APPROVED" as const },
      { code: "kajukenbo", name: "Kajukenbo", status: "APPROVED" as const },
    ]
    for (const style of karateStyles) {
      const existing = await db.style.findFirst({ where: { code: style.code, disciplineId: karateDiscipline.id } })
      if (existing) { stylesSkipped++ } else {
        await db.style.create({ data: { ...style, disciplineId: karateDiscipline.id } })
        stylesCreated++
      }
    }
  }
  console.log(`   Karate Styles: Created ${stylesCreated}, Skipped ${stylesSkipped}`)

  // -----------------------------------------------------------------------
  // 7. OrganizationDiscipline links (bjj, muay-thai, eskrima, boxing, self-defense)
  // -----------------------------------------------------------------------
  const orgDisciplineCodes = ["bjj", "muay-thai", "eskrima", "boxing", "self-defense"]
  let odCreated = 0
  let odSkipped = 0
  for (const code of orgDisciplineCodes) {
    const disc = await db.discipline.findFirst({ where: { code, isSystem: true }, select: { id: true } })
    if (!disc) continue
    const existing = await db.organizationDiscipline.findFirst({
      where: { organizationId: org.id, disciplineId: disc.id },
    })
    if (existing) { odSkipped++ } else {
      await db.organizationDiscipline.create({ data: { organizationId: org.id, disciplineId: disc.id } })
      odCreated++
    }
  }
  console.log(`   OrganizationDiscipline: Created ${odCreated}, Skipped ${odSkipped}`)

  // -----------------------------------------------------------------------
  // 8. ContentAtom + ContentVariant (4 atoms with video variants)
  // Requires a createdById — use org owner if available, otherwise first admin user
  // -----------------------------------------------------------------------
  let contentCreated = 0
  let contentSkipped = 0
  let creatorId: string | null = org.ownerId
  if (!creatorId) {
    const adminUser = await db.user.findFirst({ where: { role: "admin" }, select: { id: true } })
    creatorId = adminUser?.id ?? null
  }

  if (creatorId) {
    const bjjDisc = await db.discipline.findFirst({ where: { code: "bjj" }, select: { id: true } })
    const mtDisc = await db.discipline.findFirst({ where: { code: "muay-thai" }, select: { id: true } })
    const eskDisc = await db.discipline.findFirst({ where: { code: "eskrima" }, select: { id: true } })

    const contentAtoms = [
      {
        canonicalId: "atom-2026-bjj-guard-passing-001",
        title: "Guard Passing Fundamentals",
        slug: "guard-passing-fundamentals",
        status: "PUBLISHED" as const,
        hook: "The #1 skill white belts need",
        teachingTruth: "Guard passing starts with posture and grips, not speed.",
        disciplineId: bjjDisc?.id ?? null,
        createdById: creatorId,
        siteTargets: [BRAND],
        channelTargets: ["YOUTUBE_LONG" as const],
        variants: [
          { brand: BRAND, channel: "YOUTUBE_LONG" as const, status: "PUBLISHED" as const, publicTitle: "Guard Passing 101 — Full Breakdown", publicSlug: "guard-passing-101", videoUrl: "https://www.youtube.com/watch?v=example-bjj-guard-001", thumbnailUrl: "https://placehold.co/640x360?text=Guard+Passing" },
          { brand: BRAND, channel: "YOUTUBE_SHORT" as const, status: "PUBLISHED" as const, publicTitle: "Guard Passing in 60 Seconds", publicSlug: "guard-passing-60s", videoUrl: "https://www.youtube.com/watch?v=example-bjj-guard-002", thumbnailUrl: "https://placehold.co/640x360?text=Guard+Pass+Short" },
        ],
      },
      {
        canonicalId: "atom-2026-bjj-mount-escapes-001",
        title: "Mount Escapes for Beginners",
        slug: "mount-escapes-beginners",
        status: "PUBLISHED" as const,
        hook: "Stop getting stuck on bottom",
        teachingTruth: "Hip escape (shrimp) is the foundation of all mount escapes.",
        disciplineId: bjjDisc?.id ?? null,
        createdById: creatorId,
        siteTargets: [BRAND],
        channelTargets: ["YOUTUBE_LONG" as const],
        variants: [
          { brand: BRAND, channel: "YOUTUBE_LONG" as const, status: "PUBLISHED" as const, publicTitle: "3 Mount Escapes Every White Belt Needs", publicSlug: "mount-escapes-white-belt", videoUrl: "https://www.youtube.com/watch?v=example-bjj-mount-001", thumbnailUrl: "https://placehold.co/640x360?text=Mount+Escapes" },
        ],
      },
      {
        canonicalId: "atom-2026-muay-thai-clinch-001",
        title: "Muay Thai Clinch Basics",
        slug: "muay-thai-clinch-basics",
        status: "PUBLISHED" as const,
        hook: "Control the clinch, control the fight",
        teachingTruth: "Double collar tie with proper posture is the starting point for all clinch work.",
        disciplineId: mtDisc?.id ?? null,
        createdById: creatorId,
        siteTargets: [BRAND],
        channelTargets: ["YOUTUBE_LONG" as const],
        variants: [
          { brand: BRAND, channel: "YOUTUBE_LONG" as const, status: "PUBLISHED" as const, publicTitle: "Muay Thai Clinch — Complete Beginner Guide", publicSlug: "muay-thai-clinch-guide", videoUrl: "https://www.youtube.com/watch?v=example-mt-clinch-001", thumbnailUrl: "https://placehold.co/640x360?text=MT+Clinch" },
        ],
      },
      {
        canonicalId: "atom-2026-eskrima-sinawali-001",
        title: "Sinawali Double Stick Drills",
        slug: "sinawali-double-stick-drills",
        status: "PUBLISHED" as const,
        hook: "The partner drill that builds timing and flow",
        teachingTruth: "Heaven Six is the foundational sinawali pattern — master it before moving to variations.",
        disciplineId: eskDisc?.id ?? null,
        createdById: creatorId,
        siteTargets: [BRAND],
        channelTargets: ["YOUTUBE_LONG" as const],
        variants: [
          { brand: BRAND, channel: "YOUTUBE_LONG" as const, status: "PUBLISHED" as const, publicTitle: "Heaven Six Sinawali — Step by Step", publicSlug: "heaven-six-sinawali", videoUrl: "https://www.youtube.com/watch?v=example-eskrima-sinawali-001", thumbnailUrl: "https://placehold.co/640x360?text=Sinawali+Drill" },
        ],
      },
    ]

    for (const atom of contentAtoms) {
      const { variants, ...atomData } = atom
      const existing = await db.contentAtom.findFirst({ where: { canonicalId: atom.canonicalId } })
      if (existing) { contentSkipped++; continue }
      const created = await db.contentAtom.create({ data: atomData })
      for (const v of variants) {
        await db.contentVariant.create({ data: { ...v, atomId: created.id } })
      }
      contentCreated++
    }
  } else {
    console.log("   ⚠️  No user found to own ContentAtoms — skipping content seeding")
  }
  console.log(`   ContentAtoms: Created ${contentCreated}, Skipped ${contentSkipped}`)

  // -----------------------------------------------------------------------
  // 9. ClassSchedules — CU Rec Summer 2026 (real schedule from colorado.edu/recreation)
  // Source: https://www.colorado.edu/recreation/fitness-and-wellness/instruction-classes/martial-arts
  // -----------------------------------------------------------------------
  let schedCreated = 0
  let schedSkipped = 0

  // Look up programs and disciplines
  const bjjProgram = await db.program.findFirst({
    where: { brand: BRAND, slug: "adult-brazilian-jiu-jitsu" },
    select: { id: true, organizationId: true, disciplineId: true },
  })
  const mtProgram = await db.program.findFirst({
    where: { brand: BRAND, slug: "muay-thai-striking" },
    select: { id: true, organizationId: true, disciplineId: true },
  })

  // We need Self Defense and Eskrima programs — create if missing
  const sdDisc = await db.discipline.findFirst({ where: { code: "self-defense" }, select: { id: true } })
  const eskDiscId = (await db.discipline.findFirst({ where: { code: "eskrima" }, select: { id: true } }))?.id

  let sdProgram = await db.program.findFirst({
    where: { brand: BRAND, organizationId: org.id, slug: "self-defense" },
    select: { id: true, organizationId: true, disciplineId: true },
  })
  if (!sdProgram && sdDisc) {
    const created = await db.program.create({
      data: {
        brand: BRAND, organizationId: org.id, disciplineId: sdDisc.id,
        name: "Self Defense", slug: "self-defense",
        description: "Practical self-defense techniques for real-world situations. Covers awareness, de-escalation, and physical responses.",
        status: "ACTIVE", sortOrder: 30,
      },
      select: { id: true, organizationId: true, disciplineId: true },
    })
    sdProgram = created
    console.log("   Created Self Defense program")
  }

  let eskProgram = await db.program.findFirst({
    where: { brand: BRAND, organizationId: org.id, slug: "eskrima" },
    select: { id: true, organizationId: true, disciplineId: true },
  })
  if (!eskProgram && eskDiscId) {
    const created = await db.program.create({
      data: {
        brand: BRAND, organizationId: org.id, disciplineId: eskDiscId,
        name: "Doce Pares Eskrima", slug: "eskrima",
        description: "Filipino stick fighting — single stick, double stick, and empty hand techniques through partner drills.",
        status: "ACTIVE", sortOrder: 40,
      },
      select: { id: true, organizationId: true, disciplineId: true },
    })
    eskProgram = created
    console.log("   Created Eskrima program")
  }

  const schedules = [
    // BJJ Level 1 — Mon/Wed 3-4pm
    {
      program: bjjProgram,
      name: "BJJ Level 1 — Mon/Wed Afternoons",
      description: "All levels welcome. Ground fighting, submissions, and positional control fundamentals. CU Rec Center Mat Room.",
      daysOfWeek: ["MON", "WED"],
      startTime: "15:00",
      endTime: "16:00",
      status: "ACTIVE" as const,
      locationName: "CU Boulder Recreation Center — Mat Room",
      capacity: 30,
      effectiveFrom: new Date("2026-05-18"),
      effectiveTo: new Date("2026-08-05"),
    },
    // BJJ Level 2 — Tue/Thu 3-4pm
    {
      program: bjjProgram,
      name: "BJJ Level 2 — Tue/Thu Afternoons",
      description: "Intermediate/advanced BJJ. Prerequisite: experience in BJJ and skills test during first week. CU Rec Center Mat Room.",
      daysOfWeek: ["TUE", "THU"],
      startTime: "15:00",
      endTime: "16:00",
      status: "ACTIVE" as const,
      locationName: "CU Boulder Recreation Center — Mat Room",
      capacity: 30,
      effectiveFrom: new Date("2026-05-19"),
      effectiveTo: new Date("2026-08-06"),
    },
    // Muay Thai Basics — Mon/Wed 4:15-5:15pm
    {
      program: mtProgram,
      name: "Muay Thai Basics — Mon/Wed Afternoons",
      description: "Basic Muay Thai striking — punches, kicks, elbows, knees. Intense cardio workout. CU Rec Center Mat Room.",
      daysOfWeek: ["MON", "WED"],
      startTime: "16:15",
      endTime: "17:15",
      status: "ACTIVE" as const,
      locationName: "CU Boulder Recreation Center — Mat Room",
      capacity: 30,
      effectiveFrom: new Date("2026-05-18"),
      effectiveTo: new Date("2026-08-05"),
    },
    // Muay Thai Level 2 — Tue/Thu 4:15-5:15pm
    {
      program: mtProgram,
      name: "Muay Thai Level 2 — Tue/Thu Afternoons",
      description: "Intermediate/advanced Muay Thai. Conditioning drills, heavy bag work, sparring prep. Prerequisite: MT experience + skills test.",
      daysOfWeek: ["TUE", "THU"],
      startTime: "16:15",
      endTime: "17:15",
      status: "ACTIVE" as const,
      locationName: "CU Boulder Recreation Center — Mat Room",
      capacity: 30,
      effectiveFrom: new Date("2026-05-19"),
      effectiveTo: new Date("2026-08-06"),
    },
    // Self Defense — Tue 5:30-6:30pm (6-week session)
    {
      program: sdProgram,
      name: "Self Defense — Tuesday Evenings",
      description: "Empowering verbal and physical self-defense skills. Covers awareness, boundaries, and responses to real-life scenarios. No experience necessary.",
      daysOfWeek: ["TUE"],
      startTime: "17:30",
      endTime: "18:30",
      status: "ACTIVE" as const,
      locationName: "CU Boulder Recreation Center — Mat Room",
      capacity: 25,
      effectiveFrom: new Date("2026-05-19"),
      effectiveTo: new Date("2026-06-23"),
    },
    // Eskrima — Returning Fall 2026
    {
      program: eskProgram,
      name: "Eskrima — Fall 2026",
      description: "Doce Pares Eskrima — single stick, double stick, and empty hand techniques. Returning fall 2026.",
      daysOfWeek: [] as string[],
      startTime: "TBD",
      endTime: "TBD",
      status: "PAUSED" as const,
      locationName: "CU Boulder Recreation Center — Mat Room",
      capacity: 25,
      effectiveFrom: null as Date | null,
      effectiveTo: null as Date | null,
    },
  ]

  for (const sched of schedules) {
    if (!sched.program) {
      console.log(`   ⚠️  Skipping schedule "${sched.name}" — program not found`)
      continue
    }
    const existing = await db.classSchedule.findFirst({
      where: { brand: BRAND, programId: sched.program.id, name: sched.name },
    })
    if (existing) { schedSkipped++; continue }
    await db.classSchedule.create({
      data: {
        brand: BRAND,
        organizationId: sched.program.organizationId,
        programId: sched.program.id,
        disciplineId: sched.program.disciplineId,
        name: sched.name,
        description: sched.description,
        status: sched.status,
        daysOfWeek: sched.daysOfWeek,
        startTime: sched.startTime,
        endTime: sched.endTime,
        timezone: "America/Denver",
        locationName: sched.locationName,
        capacity: sched.capacity,
        effectiveFrom: sched.effectiveFrom,
        effectiveTo: sched.effectiveTo,
      },
    })
    schedCreated++
  }
  console.log(`   ClassSchedules: Created ${schedCreated}, Skipped ${schedSkipped}`)

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  console.log("\n🎉 seed-baseline-platform.ts complete.\n")
}

main()
  .catch((error) => {
    console.error("❌ Error in seed-baseline-platform:", error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
