import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

/**
 * seed-baseline-programs.ts
 *
 * Production-safe seed for BASELINE_MARTIAL_ARTS program surface:
 *   - 12 Disciplines (system, brand=null)
 *   - 13 Rank Systems with ~200 Ranks
 *   - 2 Programs (Adult BJJ, Muay Thai Striking)
 *   - 1 ClassSchedule (Adult BJJ — Tue/Thu Evenings)
 *   - ~240 Courses (Safety + Fundamentals-per-rank + Coaches, per discipline)
 *   - ~720 CurriculumItems (3 per course)
 *
 * Idempotency: every insert uses findFirst on unique/composite keys + create
 * if missing. Re-running is a no-op.
 *
 * NOT ported from seed.ts: test users, Passport, DirectoryProfile, Membership,
 * MembershipRoleAssignment, RankAward, ContentAtom/Variant, Roles, Entitlements,
 * TournamentRoles, GamificationEventTypes, SubscriptionTiers, Styles.
 *
 * Usage:
 *   bun run apps/web/prisma/seed-baseline-programs.ts
 *
 * @see docs/sprints/SESSION_0174.md TASK_02
 * @see apps/web/prisma/seed-baseline-listings.ts (pattern reference)
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const BRAND = "BASELINE_MARTIAL_ARTS" as const
// Production org slug is "baseline-martial-arts" (seed-baseline-launch.ts);
// Dev org slug is "baseline-academy" (seed.ts). Try production first, fall back to dev.
const ORG_SLUGS = ["baseline-martial-arts", "baseline-academy"] as const

// =========================================================================
// Data: Disciplines
// =========================================================================

const DISCIPLINES = [
  { name: "Brazilian Jiu-Jitsu", slug: "bjj", code: "bjj", isSystem: true, foundedBy: "Hélio Gracie, Carlos Gracie", yearEstablished: 1925, history: "Developed in Brazil from Kodokan judo ground fighting (newaza) fundamentals by the Gracie family. Emphasizes leverage-based submissions and positional control." },
  { name: "Doce Pares Eskrima", slug: "eskrima", code: "eskrima", isSystem: true, foundedBy: "Lorenzo Saavedra", yearEstablished: 1932, history: "Founded in Cebu City, Philippines. One of the oldest and most influential Filipino martial arts organizations, blending stick, blade, and empty-hand combat." },
  { name: "Muay Thai", slug: "muay-thai", code: "muay-thai", isSystem: true, yearEstablished: 1238, history: "Thailand's national combat sport, known as the Art of Eight Limbs for its use of fists, elbows, knees, and shins. Evolved from ancient Muay Boran battlefield techniques." },
  { name: "Boxing", slug: "boxing", code: "boxing", isSystem: true, yearEstablished: 1867, history: "Western boxing codified under the Marquess of Queensberry Rules. Focuses on footwork, head movement, and punching combinations." },
  { name: "Self Defense", slug: "self-defense", code: "self-defense", isSystem: true, history: "Practical self-defense training drawing from multiple martial arts disciplines, situational awareness, and de-escalation techniques." },
  { name: "Judo", slug: "judo", code: "judo", isSystem: true, foundedBy: "Kanō Jigorō", yearEstablished: 1882, history: "Created in Japan as a modern martial art emphasizing throws and grappling. Became an Olympic sport in 1964." },
  { name: "Kajukenbo", slug: "kajukenbo", code: "kajukenbo", isSystem: true, foundedBy: "Adriano Emperado, Peter Choo, Joe Holck, Frank Ordonez, Clarence Chang", yearEstablished: 1947, history: "Hybrid martial art founded in Honolulu, Hawaii by the Black Belt Society. Name derives from KA-rate, JU-do/jujitsu, KEN-po, BO-xing." },
  { name: "Karate", slug: "karate", code: "karate", isSystem: true, foundedBy: "Gichin Funakoshi", yearEstablished: 1922, history: "Okinawan striking art brought to mainland Japan. Emphasizes kata, kihon, and kumite across numerous styles including Shotokan, Goju-Ryu, and Shito-Ryu." },
  { name: "Taekwondo", slug: "tkd", code: "tkd", isSystem: true, foundedBy: "Choi Hong-hi", yearEstablished: 1955, history: "Korean martial art known for dynamic kicking techniques. Olympic sport since 2000." },
  { name: "Wrestling", slug: "wrestling", code: "wrestling", isSystem: true, yearEstablished: -708, history: "One of the oldest combat sports, dating to ancient Greece. Modern styles include folkstyle, freestyle, and Greco-Roman." },
  { name: "Krav Maga", slug: "krav-maga", code: "krav-maga", isSystem: true, foundedBy: "Imi Lichtenfeld", yearEstablished: 1948, history: "Developed for the Israel Defense Forces. Emphasizes real-world threat neutralization, combining techniques from boxing, wrestling, judo, and aikido." },
  { name: "Wing Chun", slug: "wing-chun", code: "wing-chun", isSystem: true, foundedBy: "Ng Mui (legendary)", yearEstablished: 1700, history: "Southern Chinese kung fu style emphasizing close-range combat, centerline theory, and simultaneous attack-defense. Popularized by Ip Man and Bruce Lee." },
]

// =========================================================================
// Data: Rank Systems + Ranks
// =========================================================================

type RankDef = { name: string; shortName?: string; colorHex?: string }

interface RankSystemDef {
  /** code of the parent discipline */
  disciplineCode: string
  name: string
  kind: "BELT" | "PRAJIOUD" | "GRADE" | "KYU_DAN" | "OTHER"
  isSystem: boolean
  brand: typeof BRAND | null
  ranks: RankDef[]
}

// --- BJJ — IBJJF Belt System (30 ranks) ---
function buildBjjRanks(): RankDef[] {
  const ranks: RankDef[] = []
  const belts = [
    { belt: "White Belt", prefix: "W", hex: "#FFFFFF" },
    { belt: "Blue Belt", prefix: "BL", hex: "#0000FF" },
    { belt: "Purple Belt", prefix: "P", hex: "#800080" },
    { belt: "Brown Belt", prefix: "BR", hex: "#8B4513" },
  ]
  for (const { belt, prefix, hex } of belts) {
    ranks.push({ name: belt, shortName: `${prefix}0`, colorHex: hex })
    for (let s = 1; s <= 4; s++) {
      ranks.push({
        name: `${belt} - ${s} Stripe${s > 1 ? "s" : ""}`,
        shortName: `${prefix}${s}`,
        colorHex: hex,
      })
    }
  }
  ranks.push(
    { name: "Black Belt - 1st Degree", shortName: "BK1", colorHex: "#000000" },
    { name: "Black Belt - 2nd Degree", shortName: "BK2", colorHex: "#000000" },
    { name: "Black Belt - 3rd Degree", shortName: "BK3", colorHex: "#000000" },
    { name: "Black Belt - 4th Degree", shortName: "BK4", colorHex: "#000000" },
    { name: "Black Belt - 5th Degree", shortName: "BK5", colorHex: "#000000" },
    { name: "Black Belt - 6th Degree", shortName: "BK6", colorHex: "#000000" },
    { name: "Coral Belt (Red/Black) - 7th Degree", shortName: "CB7", colorHex: "#FF0000" },
    { name: "Coral Belt (Red/White) - 8th Degree", shortName: "CB8", colorHex: "#FF0000" },
    { name: "Red Belt - 9th Degree", shortName: "R9", colorHex: "#FF0000" },
    { name: "Red Belt - 10th Degree (Grand Master)", shortName: "R10", colorHex: "#FF0000" },
  )
  return ranks
}

// --- Eskrima — PIMA Denver (22 ranks) ---
function buildPimaDenverRanks(): RankDef[] {
  const ranks: RankDef[] = []
  for (let i = 1; i <= 11; i++) {
    ranks.push({ name: `Level ${i}`, shortName: `L${i}` })
  }
  ranks.push(
    { name: "Black Belt (Guro)", shortName: "BB" },
    { name: "1st Degree Black Belt", shortName: "1D" },
    { name: "2nd Degree Black Belt", shortName: "2D" },
    { name: "3rd Degree Black Belt", shortName: "3D" },
    { name: "4th Degree Black Belt", shortName: "4D" },
    { name: "5th Degree Black Belt (Master)", shortName: "5D" },
    { name: "6th Degree Black Belt", shortName: "6D" },
    { name: "7th Degree Black Belt", shortName: "7D" },
    { name: "8th Degree Black Belt", shortName: "8D" },
    { name: "9th Degree Black Belt (Grandmaster)", shortName: "9D" },
    { name: "10th Degree Red Belt (Supreme Grandmaster)", shortName: "10D" },
  )
  return ranks
}

const RANK_SYSTEMS: RankSystemDef[] = [
  // 1. BJJ — IBJJF
  { disciplineCode: "bjj", name: "IBJJF Belt System", kind: "BELT", isSystem: true, brand: null, ranks: buildBjjRanks() },
  // 2. Eskrima — PIMA Denver
  { disciplineCode: "eskrima", name: "PIMA Denver Doce Pares (GM Steve Wolk)", kind: "BELT", isSystem: true, brand: null, ranks: buildPimaDenverRanks() },
  // 3. Eskrima — PIMA Jersey
  {
    disciplineCode: "eskrima", name: "PIMA Jersey Doce Pares (SGM Dong Cuesta)", kind: "BELT", isSystem: true, brand: null,
    ranks: [
      { name: "White Belt", shortName: "W", colorHex: "#FFFFFF" },
      { name: "Yellow Belt", shortName: "Y", colorHex: "#FFD700" },
      { name: "Orange Belt", shortName: "O", colorHex: "#FFA500" },
      { name: "Green Belt", shortName: "G", colorHex: "#008000" },
      { name: "Blue Belt", shortName: "BL", colorHex: "#0000FF" },
      { name: "Purple Belt", shortName: "P", colorHex: "#800080" },
      { name: "Brown Belt", shortName: "BR", colorHex: "#8B4513" },
      { name: "Brown Belt with Black Stripe", shortName: "BRS", colorHex: "#8B4513" },
      { name: "Brown Belt 1st Grade", shortName: "BR1", colorHex: "#8B4513" },
      { name: "Brown Belt 2nd Grade", shortName: "BR2", colorHex: "#8B4513" },
      { name: "Black Belt with Stripes", shortName: "BKS", colorHex: "#000000" },
      { name: "Black Belt (Guro)", shortName: "BB", colorHex: "#000000" },
      { name: "1st Degree Black Belt", shortName: "1D", colorHex: "#000000" },
      { name: "2nd Degree Black Belt", shortName: "2D", colorHex: "#000000" },
      { name: "3rd Degree Black Belt", shortName: "3D", colorHex: "#000000" },
      { name: "4th Degree Black Belt", shortName: "4D", colorHex: "#000000" },
      { name: "5th Degree Black Belt (Master)", shortName: "5D", colorHex: "#000000" },
      { name: "6th Degree Black Belt", shortName: "6D", colorHex: "#000000" },
      { name: "7th Degree Black Belt", shortName: "7D", colorHex: "#000000" },
      { name: "8th Degree Black Belt", shortName: "8D", colorHex: "#000000" },
      { name: "9th Degree Black Belt (Grandmaster)", shortName: "9D", colorHex: "#000000" },
      { name: "10th Degree Red Belt (Supreme Grandmaster)", shortName: "10D", colorHex: "#FF0000" },
    ],
  },
  // 4. Muay Thai — Prajioud
  {
    disciplineCode: "muay-thai", name: "Sak Va Roon Thai Boxing Prajioud System", kind: "PRAJIOUD", isSystem: true, brand: null,
    ranks: [
      { name: "White (Beginner)", shortName: "W", colorHex: "#FFFFFF" },
      { name: "Yellow", shortName: "Y", colorHex: "#FFD700" },
      { name: "Yellow-Black", shortName: "YB", colorHex: "#FFD700" },
      { name: "Blue (Intermediate)", shortName: "BL", colorHex: "#0000FF" },
      { name: "Blue-Black", shortName: "BLB", colorHex: "#0000FF" },
      { name: "Red (Advanced)", shortName: "R", colorHex: "#FF0000" },
      { name: "Black (Fighter)", shortName: "BK", colorHex: "#000000" },
      { name: "Red-Black (Instructor - Fighter)", shortName: "RB", colorHex: "#FF0000" },
      { name: "Red-Blue-Black (Fighter - Corner/Kru/Head Instructor)", shortName: "RBB", colorHex: "#FF0000" },
    ],
  },
  // 5. Boxing — Skill Levels (Baseline-specific)
  {
    disciplineCode: "boxing", name: "Boxing Skill Levels", kind: "GRADE", isSystem: false, brand: BRAND,
    ranks: [
      { name: "Fundamentals", shortName: "F" },
      { name: "Novice", shortName: "N" },
      { name: "Beginner", shortName: "B" },
      { name: "Intermediate", shortName: "I" },
      { name: "Advanced", shortName: "A" },
      { name: "Sparring Ready", shortName: "SR" },
      { name: "Amateur", shortName: "AM" },
      { name: "Competition Ready", shortName: "CR" },
    ],
  },
  // 6. Self Defense — Levels (Baseline-specific)
  {
    disciplineCode: "self-defense", name: "Self Defense Levels", kind: "GRADE", isSystem: false, brand: BRAND,
    ranks: [
      { name: "Awareness", shortName: "AW" },
      { name: "Fundamentals", shortName: "F" },
      { name: "Basic Responses", shortName: "BR" },
      { name: "Intermediate", shortName: "I" },
      { name: "Advanced", shortName: "A" },
      { name: "Weapons Defense", shortName: "WD" },
      { name: "Ground Defense", shortName: "GD" },
      { name: "Multiple Attackers", shortName: "MA" },
    ],
  },
  // 7. Judo — Kodokan Kyu-Dan (16 ranks)
  {
    disciplineCode: "judo", name: "Kodokan Judo Kyu-Dan System", kind: "KYU_DAN", isSystem: true, brand: null,
    ranks: [
      { name: "6th Kyu (Rokkyu) - White Belt", shortName: "6K", colorHex: "#FFFFFF" },
      { name: "5th Kyu (Gokyu) - Yellow Belt", shortName: "5K", colorHex: "#FFD700" },
      { name: "4th Kyu (Yonkyu) - Orange Belt", shortName: "4K", colorHex: "#FFA500" },
      { name: "3rd Kyu (Sankyu) - Green Belt", shortName: "3K", colorHex: "#008000" },
      { name: "2nd Kyu (Nikyu) - Blue Belt", shortName: "2K", colorHex: "#0000FF" },
      { name: "1st Kyu (Ikkyu) - Brown Belt", shortName: "1K", colorHex: "#8B4513" },
      { name: "1st Dan (Shodan) - Black Belt", shortName: "1D", colorHex: "#000000" },
      { name: "2nd Dan (Nidan) - Black Belt", shortName: "2D", colorHex: "#000000" },
      { name: "3rd Dan (Sandan) - Black Belt", shortName: "3D", colorHex: "#000000" },
      { name: "4th Dan (Yondan) - Black Belt", shortName: "4D", colorHex: "#000000" },
      { name: "5th Dan (Godan) - Black Belt", shortName: "5D", colorHex: "#000000" },
      { name: "6th Dan (Rokudan) - Red-White Belt", shortName: "6D", colorHex: "#FF0000" },
      { name: "7th Dan (Shichidan) - Red-White Belt", shortName: "7D", colorHex: "#FF0000" },
      { name: "8th Dan (Hachidan) - Red-White Belt", shortName: "8D", colorHex: "#FF0000" },
      { name: "9th Dan (Kudan) - Red Belt", shortName: "9D", colorHex: "#FF0000" },
      { name: "10th Dan (Judan) - Red Belt", shortName: "10D", colorHex: "#FF0000" },
    ],
  },
  // 8. Kajukenbo — Belt System (19 ranks)
  {
    disciplineCode: "kajukenbo", name: "Kajukenbo Belt System", kind: "BELT", isSystem: true, brand: null,
    ranks: [
      { name: "White Belt", shortName: "W", colorHex: "#FFFFFF" },
      { name: "Yellow Belt", shortName: "Y", colorHex: "#FFD700" },
      { name: "Orange Belt", shortName: "O", colorHex: "#FFA500" },
      { name: "Purple Belt", shortName: "P", colorHex: "#800080" },
      { name: "Blue Belt", shortName: "BL", colorHex: "#0000FF" },
      { name: "Green Belt", shortName: "G", colorHex: "#008000" },
      { name: "Brown Belt - 3rd Degree", shortName: "BR3", colorHex: "#8B4513" },
      { name: "Brown Belt - 2nd Degree", shortName: "BR2", colorHex: "#8B4513" },
      { name: "Brown Belt - 1st Degree", shortName: "BR1", colorHex: "#8B4513" },
      { name: "Black Belt - 1st Degree", shortName: "BK1", colorHex: "#000000" },
      { name: "Black Belt - 2nd Degree", shortName: "BK2", colorHex: "#000000" },
      { name: "Black Belt - 3rd Degree", shortName: "BK3", colorHex: "#000000" },
      { name: "Black Belt - 4th Degree", shortName: "BK4", colorHex: "#000000" },
      { name: "Black Belt - 5th Degree", shortName: "BK5", colorHex: "#000000" },
      { name: "Black Belt - 6th Degree", shortName: "BK6", colorHex: "#000000" },
      { name: "Black Belt - 7th Degree", shortName: "BK7", colorHex: "#000000" },
      { name: "Black Belt - 8th Degree", shortName: "BK8", colorHex: "#000000" },
      { name: "Black Belt - 9th Degree", shortName: "BK9", colorHex: "#000000" },
      { name: "Black Belt - 10th Degree", shortName: "BK10", colorHex: "#000000" },
    ],
  },
  // 9. Karate — USA Karate Federation Kyu-Dan (20 ranks)
  {
    disciplineCode: "karate", name: "USA Karate Federation Kyu-Dan System", kind: "KYU_DAN", isSystem: true, brand: null,
    ranks: [
      { name: "10th Kyu (Jukyu) - White Belt", shortName: "10K", colorHex: "#FFFFFF" },
      { name: "9th Kyu (Kukyu) - White Belt", shortName: "9K", colorHex: "#FFFFFF" },
      { name: "8th Kyu (Hachikyu) - Yellow Belt", shortName: "8K", colorHex: "#FFD700" },
      { name: "7th Kyu (Shichikyu) - Orange Belt", shortName: "7K", colorHex: "#FFA500" },
      { name: "6th Kyu (Rokkyu) - Green Belt", shortName: "6K", colorHex: "#008000" },
      { name: "5th Kyu (Gokyu) - Blue Belt", shortName: "5K", colorHex: "#0000FF" },
      { name: "4th Kyu (Yonkyu) - Blue Belt", shortName: "4K", colorHex: "#0000FF" },
      { name: "3rd Kyu (Sankyu) - Brown Belt", shortName: "3K", colorHex: "#8B4513" },
      { name: "2nd Kyu (Nikyu) - Brown Belt", shortName: "2K", colorHex: "#8B4513" },
      { name: "1st Kyu (Ikkyu) - Brown Belt", shortName: "1K", colorHex: "#8B4513" },
      { name: "Shodan (1st Dan) - Black Belt", shortName: "1D", colorHex: "#000000" },
      { name: "Nidan (2nd Dan) - Black Belt", shortName: "2D", colorHex: "#000000" },
      { name: "Sandan (3rd Dan) - Black Belt", shortName: "3D", colorHex: "#000000" },
      { name: "Yondan (4th Dan) - Black Belt", shortName: "4D", colorHex: "#000000" },
      { name: "Godan (5th Dan) - Black Belt", shortName: "5D", colorHex: "#000000" },
      { name: "Rokudan (6th Dan) - Black Belt", shortName: "6D", colorHex: "#000000" },
      { name: "Shichidan (7th Dan) - Black Belt", shortName: "7D", colorHex: "#000000" },
      { name: "Hachidan (8th Dan) - Black Belt", shortName: "8D", colorHex: "#000000" },
      { name: "Kudan (9th Dan) - Black Belt", shortName: "9D", colorHex: "#000000" },
      { name: "Judan (10th Dan) - Black Belt", shortName: "10D", colorHex: "#000000" },
    ],
  },
  // 10. TKD — USA Taekwondo Gup-Dan (20 ranks)
  {
    disciplineCode: "tkd", name: "USA Taekwondo Gup-Dan System", kind: "KYU_DAN", isSystem: true, brand: null,
    ranks: [
      { name: "10th Gup - White Belt", shortName: "10G", colorHex: "#FFFFFF" },
      { name: "9th Gup - White Belt with Yellow Stripe", shortName: "9G", colorHex: "#FFFFFF" },
      { name: "8th Gup - Yellow Belt", shortName: "8G", colorHex: "#FFD700" },
      { name: "7th Gup - Yellow Belt with Green Stripe", shortName: "7G", colorHex: "#FFD700" },
      { name: "6th Gup - Green Belt", shortName: "6G", colorHex: "#008000" },
      { name: "5th Gup - Green Belt with Blue Stripe", shortName: "5G", colorHex: "#008000" },
      { name: "4th Gup - Blue Belt", shortName: "4G", colorHex: "#0000FF" },
      { name: "3rd Gup - Blue Belt with Red Stripe", shortName: "3G", colorHex: "#0000FF" },
      { name: "2nd Gup - Red Belt", shortName: "2G", colorHex: "#FF0000" },
      { name: "1st Gup - Red Belt with Black Stripe", shortName: "1G", colorHex: "#FF0000" },
      { name: "1st Dan (Poom/Dan) - Black Belt", shortName: "1D", colorHex: "#000000" },
      { name: "2nd Dan - Black Belt", shortName: "2D", colorHex: "#000000" },
      { name: "3rd Dan - Black Belt", shortName: "3D", colorHex: "#000000" },
      { name: "4th Dan - Black Belt", shortName: "4D", colorHex: "#000000" },
      { name: "5th Dan - Black Belt", shortName: "5D", colorHex: "#000000" },
      { name: "6th Dan - Black Belt", shortName: "6D", colorHex: "#000000" },
      { name: "7th Dan - Black Belt", shortName: "7D", colorHex: "#000000" },
      { name: "8th Dan - Black Belt", shortName: "8D", colorHex: "#000000" },
      { name: "9th Dan - Black Belt", shortName: "9D", colorHex: "#000000" },
      { name: "10th Dan - Black Belt", shortName: "10D", colorHex: "#000000" },
    ],
  },
  // 11. Wrestling — Skill Levels (6 ranks)
  {
    disciplineCode: "wrestling", name: "Wrestling Skill Levels", kind: "GRADE", isSystem: true, brand: null,
    ranks: [
      { name: "Beginner", shortName: "BEG" },
      { name: "Novice", shortName: "NOV" },
      { name: "Intermediate", shortName: "INT" },
      { name: "Advanced", shortName: "ADV" },
      { name: "Elite", shortName: "ELI" },
      { name: "Master", shortName: "MAS" },
    ],
  },
  // 12. Krav Maga — Level System (6 ranks)
  {
    disciplineCode: "krav-maga", name: "Krav Maga Level System", kind: "GRADE", isSystem: true, brand: null,
    ranks: [
      { name: "Practitioner 1 (P1)", shortName: "P1" },
      { name: "Practitioner 2 (P2)", shortName: "P2" },
      { name: "Practitioner 3 (P3)", shortName: "P3" },
      { name: "Practitioner 4 (P4)", shortName: "P4" },
      { name: "Practitioner 5 (P5)", shortName: "P5" },
      { name: "Graduate / Expert", shortName: "EXP" },
    ],
  },
  // 13. Wing Chun — Forms Progression (8 ranks)
  {
    disciplineCode: "wing-chun", name: "Wing Chun Forms Progression", kind: "OTHER", isSystem: true, brand: null,
    ranks: [
      { name: "Siu Nim Tao (Little Idea)", shortName: "SNT" },
      { name: "Chum Kiu (Seeking Bridge)", shortName: "CK" },
      { name: "Biu Jee (Thrusting Fingers)", shortName: "BJ" },
      { name: "Muk Yan Jong (Wooden Dummy)", shortName: "MYJ" },
      { name: "Luk Dim Boon Gwan (Six-and-a-Half Point Pole)", shortName: "LDB" },
      { name: "Baat Jaam Do (Eight Chopping Knives)", shortName: "BJD" },
      { name: "Instructor", shortName: "INS" },
      { name: "Master", shortName: "MAS" },
    ],
  },
]

// =========================================================================
// Data: Programs
// =========================================================================

const PROGRAMS = [
  {
    disciplineCode: "bjj",
    name: "Adult Brazilian Jiu-Jitsu",
    slug: "adult-brazilian-jiu-jitsu",
    description: "Fundamentals, sparring, and rank progression for adult BJJ students.",
    status: "ACTIVE" as const,
    sortOrder: 10,
  },
  {
    disciplineCode: "muay-thai",
    name: "Muay Thai Striking",
    slug: "muay-thai-striking",
    description: "Pad work, clinch basics, conditioning, and safe technical sparring.",
    status: "ACTIVE" as const,
    sortOrder: 20,
  },
]

// =========================================================================
// Main
// =========================================================================

async function main() {
  const now = new Date()

  console.log("\n🌱 seed-baseline-programs.ts — Disciplines, Rank Systems, Programs, Courses\n")

  // -----------------------------------------------------------------------
  // 0. Look up the Baseline org (must already exist via seed-baseline-launch)
  // -----------------------------------------------------------------------
  let org: { id: string } | null = null
  let orgSlug = ""
  for (const slug of ORG_SLUGS) {
    org = await db.organization.findFirst({
      where: { brand: BRAND, slug },
      select: { id: true },
    })
    if (org) {
      orgSlug = slug
      break
    }
  }
  if (!org) {
    throw new Error(
      `Organization not found: brand=${BRAND}, slugs=${ORG_SLUGS.join(",")}. Run seed-baseline-launch.ts first.`,
    )
  }
  console.log(`   Found org: ${orgSlug} (id=${org.id})`)

  // -----------------------------------------------------------------------
  // 1. Disciplines
  // -----------------------------------------------------------------------
  let discCreated = 0
  let discSkipped = 0
  // Map code → id for later use
  const disciplineMap = new Map<string, string>()

  for (const disc of DISCIPLINES) {
    const existing = await db.discipline.findFirst({
      where: { code: disc.code, brand: null, isSystem: true },
      select: { id: true },
    })
    if (existing) {
      disciplineMap.set(disc.code, existing.id)
      discSkipped++
    } else {
      const created = await db.discipline.create({
        data: {
          name: disc.name,
          slug: disc.slug,
          code: disc.code,
          isSystem: disc.isSystem,
          foundedBy: disc.foundedBy ?? null,
          yearEstablished: disc.yearEstablished ?? null,
          history: disc.history ?? null,
        },
        select: { id: true },
      })
      disciplineMap.set(disc.code, created.id)
      discCreated++
    }
  }
  console.log(`   Disciplines: Created ${discCreated}, Skipped ${discSkipped}, Total ${DISCIPLINES.length}`)

  // -----------------------------------------------------------------------
  // 2. Rank Systems + Ranks
  // -----------------------------------------------------------------------
  let rsCreated = 0
  let rsSkipped = 0
  let ranksCreated = 0
  let ranksSkipped = 0

  for (const rsDef of RANK_SYSTEMS) {
    const disciplineId = disciplineMap.get(rsDef.disciplineCode)
    if (!disciplineId) {
      console.warn(`   ⚠️  Discipline not found for code=${rsDef.disciplineCode}, skipping rank system "${rsDef.name}"`)
      continue
    }

    // F-06 safe: findFirst on composite unique (disciplineId, name, brand)
    const existingRs = await db.rankSystem.findFirst({
      where: { disciplineId, name: rsDef.name, brand: rsDef.brand },
      select: { id: true },
    })

    let rankSystemId: string
    if (existingRs) {
      rankSystemId = existingRs.id
      rsSkipped++
    } else {
      const created = await db.rankSystem.create({
        data: {
          name: rsDef.name,
          kind: rsDef.kind,
          isSystem: rsDef.isSystem,
          brand: rsDef.brand,
          disciplineId,
        },
        select: { id: true },
      })
      rankSystemId = created.id
      rsCreated++
    }

    // Ranks — idempotent on (rankSystemId, sortOrder)
    for (let i = 0; i < rsDef.ranks.length; i++) {
      const rankDef = rsDef.ranks[i]
      const sortOrder = i + 1
      const existingRank = await db.rank.findFirst({
        where: { rankSystemId, sortOrder },
        select: { id: true },
      })
      if (existingRank) {
        ranksSkipped++
      } else {
        await db.rank.create({
          data: {
            sortOrder,
            name: rankDef.name,
            shortName: rankDef.shortName ?? null,
            colorHex: rankDef.colorHex ?? null,
            isSystem: rsDef.isSystem,
            brand: rsDef.brand,
            rankSystemId,
          },
        })
        ranksCreated++
      }
    }
  }
  console.log(`   Rank Systems: Created ${rsCreated}, Skipped ${rsSkipped}, Total ${RANK_SYSTEMS.length}`)
  console.log(`   Ranks: Created ${ranksCreated}, Skipped ${ranksSkipped}`)

  // -----------------------------------------------------------------------
  // 3. Programs
  // -----------------------------------------------------------------------
  let progCreated = 0
  let progSkipped = 0

  for (const progDef of PROGRAMS) {
    const disciplineId = disciplineMap.get(progDef.disciplineCode)
    const existing = await db.program.findFirst({
      where: { brand: BRAND, organizationId: org.id, slug: progDef.slug },
      select: { id: true },
    })
    if (existing) {
      progSkipped++
    } else {
      await db.program.create({
        data: {
          brand: BRAND,
          organizationId: org.id,
          disciplineId: disciplineId ?? null,
          name: progDef.name,
          slug: progDef.slug,
          description: progDef.description,
          status: progDef.status,
          sortOrder: progDef.sortOrder,
        },
      })
      progCreated++
    }
  }
  console.log(`   Programs: Created ${progCreated}, Skipped ${progSkipped}, Total ${PROGRAMS.length}`)

  // -----------------------------------------------------------------------
  // 4. ClassSchedule — Adult BJJ Tue/Thu Evenings
  // -----------------------------------------------------------------------
  let schedCreated = 0
  const adultBjjProgram = await db.program.findFirst({
    where: { brand: BRAND, slug: "adult-brazilian-jiu-jitsu" },
    select: { id: true, organizationId: true, disciplineId: true },
  })
  if (adultBjjProgram) {
    const existingSched = await db.classSchedule.findFirst({
      where: {
        brand: BRAND,
        programId: adultBjjProgram.id,
        name: "Adult BJJ — Tue/Thu Evenings",
      },
      select: { id: true },
    })
    if (!existingSched) {
      await db.classSchedule.create({
        data: {
          brand: BRAND,
          organizationId: adultBjjProgram.organizationId,
          programId: adultBjjProgram.id,
          disciplineId: adultBjjProgram.disciplineId,
          name: "Adult BJJ — Tue/Thu Evenings",
          description: "Evening fundamentals and rolling for adult students.",
          status: "ACTIVE",
          daysOfWeek: ["TUE", "THU"],
          startTime: "18:30",
          endTime: "20:00",
          timezone: "America/Denver",
          locationName: "Main Mat",
          capacity: 30,
        },
      })
      schedCreated = 1
    }
  }
  console.log(`   ClassSchedules: Created ${schedCreated}`)

  // -----------------------------------------------------------------------
  // 5. Courses + CurriculumItems
  //    Per discipline: 1 Safety + N Fundamentals (per rank) + 1 Coaches
  // -----------------------------------------------------------------------
  let courseCount = 0
  let courseSkipped = 0
  let ciCount = 0

  for (const [code, disciplineId] of disciplineMap) {
    const disc = await db.discipline.findUnique({
      where: { id: disciplineId },
      select: { name: true, slug: true },
    })
    if (!disc) continue

    // --- Safety Course ---
    const safetySlug = `${disc.slug}-safety-school`
    const existingSafety = await db.course.findFirst({
      where: { brand: BRAND, organizationId: org.id, slug: safetySlug },
      select: { id: true },
    })
    if (!existingSafety) {
      const safetyCourse = await db.course.create({
        data: {
          brand: BRAND,
          organizationId: org.id,
          disciplineId,
          title: `${disc.name} — Safety School`,
          slug: safetySlug,
          description: `Mandatory safety orientation for ${disc.name} students. Covers training etiquette, injury prevention, emergency procedures, and facility rules.`,
          certificationType: "SAFETY",
          isPublished: true,
          publishedAt: now,
        },
      })
      const safetyItems = [
        { order: 1, title: "Training Etiquette & Dojo Rules", notes: "Proper behavior, bowing protocols, hygiene standards, and respect for training partners." },
        { order: 2, title: "Injury Prevention & Warm-Up Protocol", notes: "Dynamic stretching, joint preparation, and common injury patterns specific to this discipline." },
        { order: 3, title: "Emergency Procedures & First Aid Basics", notes: "Emergency contacts, concussion protocol, when to stop training, and basic first aid." },
      ]
      for (const item of safetyItems) {
        await db.curriculumItem.create({ data: { courseId: safetyCourse.id, ...item } })
        ciCount++
      }
      courseCount++
    } else {
      courseSkipped++
    }

    // --- Fundamentals Courses (per rank system, per rank) ---
    const rankSystems = await db.rankSystem.findMany({
      where: { disciplineId },
      include: { ranks: { orderBy: { sortOrder: "asc" } } },
    })

    for (const rs of rankSystems) {
      const rsSlug = rs.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")
      const rsPrefix = rankSystems.length > 1 ? `${rsSlug}-` : ""

      for (const rank of rs.ranks) {
        const rankSlug = (rank.shortName ?? rank.name).toLowerCase().replace(/[^a-z0-9]/g, "-")
        const fundSlug = `${disc.slug}-fundamentals-${rsPrefix}${rankSlug}`

        const existingFund = await db.course.findFirst({
          where: { brand: BRAND, organizationId: org.id, slug: fundSlug },
          select: { id: true },
        })
        if (existingFund) {
          courseSkipped++
          continue
        }

        const fundCourse = await db.course.create({
          data: {
            brand: BRAND,
            organizationId: org.id,
            disciplineId,
            rankId: rank.id,
            title: rankSystems.length > 1
              ? `${disc.name} Fundamentals (${rs.name}) — ${rank.name}`
              : `${disc.name} Fundamentals — ${rank.name}`,
            slug: fundSlug,
            description: `Fundamentals curriculum for ${disc.name} students working toward ${rank.name}. Covers required techniques, concepts, and competency standards.`,
            certificationType: "BELT_RANK",
            isPublished: true,
            publishedAt: now,
          },
        })
        const fundItems = [
          { order: 1, title: "Core Techniques & Drills", notes: `Required techniques for ${rank.name} proficiency. Includes partner drills and solo practice.` },
          { order: 2, title: "Concepts & Principles", notes: `Foundational concepts expected at the ${rank.name} level. Covers strategy, timing, and positioning.` },
          { order: 3, title: "Competency Assessment Criteria", notes: `Evaluation standards for ${rank.name}. What the student must demonstrate to progress.` },
        ]
        for (const item of fundItems) {
          await db.curriculumItem.create({ data: { courseId: fundCourse.id, ...item } })
          ciCount++
        }
        courseCount++
      }
    }

    // --- Coaches Course ---
    const coachSlug = `${disc.slug}-coaches-certification`
    const existingCoach = await db.course.findFirst({
      where: { brand: BRAND, organizationId: org.id, slug: coachSlug },
      select: { id: true },
    })
    if (!existingCoach) {
      const coachesCourse = await db.course.create({
        data: {
          brand: BRAND,
          organizationId: org.id,
          disciplineId,
          title: `${disc.name} — Coaches Certification`,
          slug: coachSlug,
          description: `Coaches certification course for ${disc.name}. Covers teaching methodology, class management, student safety, and curriculum delivery.`,
          certificationType: "COACH",
          isPublished: true,
          publishedAt: now,
        },
      })
      const coachItems = [
        { order: 1, title: "Teaching Methodology & Class Structure", notes: "How to plan and deliver effective classes. Warm-up, technique blocks, drilling, and cool-down." },
        { order: 2, title: "Student Safety & Risk Management", notes: "Spotting fatigue, managing sparring intensity, handling injuries, and safeguarding minors." },
        { order: 3, title: "Curriculum Delivery & Assessment", notes: "How to use the rank curriculum, track student progress, and conduct fair evaluations." },
      ]
      for (const item of coachItems) {
        await db.curriculumItem.create({ data: { courseId: coachesCourse.id, ...item } })
        ciCount++
      }
      courseCount++
    } else {
      courseSkipped++
    }
  }

  console.log(`   Courses: Created ${courseCount}, Skipped ${courseSkipped}`)
  console.log(`   CurriculumItems: Created ${ciCount}`)

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  console.log("\n🎉 seed-baseline-programs.ts complete.\n")
}

main()
  .catch((error) => {
    console.error("❌ Error in seed-baseline-programs:", error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
