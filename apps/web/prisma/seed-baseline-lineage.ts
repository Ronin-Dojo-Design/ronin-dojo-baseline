import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"
import { DIRTY_DOZEN_LABEL } from "~/lib/lineage/dirty-dozen"

/**
 * seed-baseline-lineage.ts
 *
 * Idempotent seed for Brian's lineage graph. Creates:
 *   - Brian's own LineageNode (links to his existing User).
 *   - Placeholder instructor Users (isVerified=false, display-only — no
 *     credentials) for the lineage instructors gestured at by
 *     seed-baseline-owner.ts (BJJ + Eskrima + Muay Thai + Karate + Kajukenbo).
 *   - LineageNode for each placeholder instructor.
 *   - LineageRelationship INSTRUCTOR_STUDENT rows linking each instructor
 *     (fromNode) → Brian (toNode).
 *   - Depth-2 ladder: at least one instructor's instructor is seeded so the
 *     tree renders depth >= 2 (Rigan Machado → Bob Bass → Brian Scott).
 *
 * Idempotency: every insert uses findFirst + create. Safe to re-run as a
 * no-op. FS-0006 mitigated — no createMany on nullable-unique columns.
 *
 * Usage (LOCAL DEV ONLY — do NOT run against production):
 *   bun run apps/web/prisma/seed-baseline-lineage.ts
 *
 * @see docs/sprints/SESSION_0175.md TASK_02
 * @see apps/web/prisma/seed-baseline-owner.ts (Brian's identity + lineage notes)
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

// Production OWNER_ID — same constant as seed-baseline-owner.ts. On local dev
// where this user may not exist, we fall back to the Baseline org's owner.
const OWNER_ID = "KBYccZGiVxmOhV2l1LpB2XjSgES3MI8T"
const BRAND = "BASELINE_MARTIAL_ARTS" as const
type SeedBrand = typeof BRAND | "BBL"

// Placeholder users — display-only Lineage figures. No password/credentials.
// email pattern: `<firstname-lastname>@placeholder.lineage` (out-of-band
// domain, never resolves, used solely to satisfy User.email @unique).
type PlaceholderUser = {
  key: string
  name: string
  email: string
  image?: string | null
}

type LineageNodeSeed = {
  userKey: string
  slug: string
  bio: string
}

type LineageEdgeSeed = {
  fromKey: string
  toKey: string
  description: string
  isVerified: boolean
}

// Brian's instructors (depth 1) + one depth-2 instructor (Rigan Machado as
// Bob Bass's instructor) so the tree renders depth >= 2 per Petey plan risks.
const PLACEHOLDER_USERS: PlaceholderUser[] = [
  // ========== ROOT LINEAGE (Carlos → Carlos Jr → Rigan) ==========
  {
    key: "carlos-gracie-sr",
    name: "Carlos Gracie Sr",
    email: "carlos-gracie-sr@placeholder.lineage",
  },
  {
    key: "carlos-gracie-jr",
    name: "Carlos Gracie Jr",
    email: "carlos-gracie-jr@placeholder.lineage",
  },
  // @added SESSION_0432 — Hélio Gracie node so Rorion Gracie's promoter link resolves.
  { key: "helio-gracie", name: "Hélio Gracie", email: "helio-gracie@placeholder.lineage" },
  { key: "rorion-gracie", name: "Rorion Gracie", email: "rorion-gracie@placeholder.lineage" },
  { key: "rigan-machado", name: "Rigan Machado", email: "rigan-machado@placeholder.lineage" },

  // ========== Rigan Machado black belt lineage ==========
  { key: "bob-bass", name: "Bob Bass", email: "bob-bass@placeholder.lineage" },
  { key: "rick-williams", name: "Rick Williams", email: "rick-williams@placeholder.lineage" },
  { key: "erik-paulson", name: "Erik Paulson", email: "erik-paulson@placeholder.lineage" },
  { key: "casey-olsen", name: "Casey Olsen", email: "casey-olsen@placeholder.lineage" },
  { key: "rick-minter", name: "Rick Minter", email: "rick-minter@placeholder.lineage" },
  // @added SESSION_0433 — Christopher Alexander Poznik (Black Belt 5th; merged from/replaces chris-posnik per SESSION_0430 C2).
  {
    key: "poznik",
    name: "Christopher Alexander Poznik",
    email: "christopher-alexander-poznik@placeholder.lineage",
  },
  // @added SESSION_0318 — promoted with Bob Bass on June 8, 2024 in Oklahoma City.
  { key: "renato-magno", name: "Renato Magno", email: "renato-magno@placeholder.lineage" },
  { key: "david-meyer", name: "David Meyer", email: "david-meyer@placeholder.lineage" },
  { key: "chris-haueter", name: "Chris Haueter", email: "chris-haueter@placeholder.lineage" },
  { key: "john-will", name: "John Will", email: "john-will@placeholder.lineage" },
  { key: "bill-hosken", name: "Bill Hosken", email: "bill-hosken@placeholder.lineage" },
  { key: "jerry-smith", name: "Jerry Smith", email: "jerry-smith@placeholder.lineage" },

  // ========== NEXT GENERATION ==========
  { key: "brian-truelson", name: "Brian Truelson", email: "brian-truelson@placeholder.lineage" },
  // @added SESSION_0433 — Rikki Rockett, Black Belt 4th Degree under Renato Magno (SESSION_0430 B3).
  { key: "rikki-rockett", name: "Rikki Rockett", email: "rikki-rockett@placeholder.lineage" },

  // ========== Brian's non-BJJ instructors ==========
  { key: "steve-wolk", name: "GM Steve Wolk", email: "steve-wolk@placeholder.lineage" },
  { key: "sak-va-roon", name: "Sak Va Roon", email: "sak-va-roon@placeholder.lineage" },
  { key: "tim-mills", name: "Sifu Tim Mills", email: "tim-mills@placeholder.lineage" },
  { key: "sam-carter", name: "Sifu Sam Carter", email: "sam-carter@placeholder.lineage" },
  { key: "hanyann-ng", name: "Sifu Hanyann Ng", email: "hanyann-ng@placeholder.lineage" },
  { key: "tim-wolchek", name: "Mr. Tim Wolchek", email: "tim-wolchek@placeholder.lineage" },
]

const NODE_SEEDS: LineageNodeSeed[] = [
  // Root lineage
  {
    userKey: "carlos-gracie-sr",
    slug: "carlos-gracie-sr",
    bio: "Founder of Gracie Jiu-Jitsu. Belém, Brazil.",
  },
  {
    userKey: "carlos-gracie-jr",
    slug: "carlos-gracie-jr",
    bio: "Son of Carlos Gracie Sr. Founder of Gracie Barra. 9th Degree Red Belt. Rio de Janeiro, Brazil.",
  },
  // @added SESSION_0432 — Hélio Gracie node (promoter for Rorion Gracie's lineage link).
  {
    userKey: "helio-gracie",
    slug: "helio-gracie",
    bio: "10th Degree Red Belt · Co-founder of Gracie Jiu-Jitsu (with Carlos Gracie Sr) · Rio de Janeiro, Brazil.",
  },
  {
    userKey: "rorion-gracie",
    slug: "rorion-gracie",
    bio: "9th Degree Red Belt · son of Hélio Gracie · co-founder of the UFC and key figure in bringing Gracie Jiu-Jitsu to the United States.",
  },
  {
    userKey: "rigan-machado",
    slug: "rigan-machado",
    bio: "9th Degree Red Belt · Head of Rigan Machado Jiu-Jitsu · Los Angeles, CA. Promoted to Red Belt by Rorion Gracie on April 10, 2026; trained under Carlos Gracie Jr lineage.",
  },

  // Rigan Machado black belt lineage.
  {
    userKey: "bob-bass",
    slug: "bob-bass",
    bio: "7th Degree Coral Belt · promoted by Rigan Machado on June 8, 2024 in Oklahoma City (with Renato Magno) · 1st American Black Belt under Rigan Machado · Founder of South Bay Jiu Jitsu, Hermosa Beach CA. Dirty Dozen #8.",
  },
  {
    userKey: "rick-williams",
    slug: "rick-williams",
    bio: "7th Degree Coral Belt · promoted by Rigan Machado on April 10, 2026 · Dirty Dozen under Rigan Machado · South Bay Jiu Jitsu, Los Angeles CA.",
  },
  {
    userKey: "erik-paulson",
    slug: "erik-paulson",
    bio: "7th Degree Coral Belt · promoted by Rigan Machado on April 10, 2026 at the CSW World Conference · Combat Submission Wrestling founder.",
  },
  {
    userKey: "casey-olsen",
    slug: "casey-olsen",
    bio: "7th Degree Coral Belt · promoted by Rigan Machado on April 10, 2026 at the CSW World Conference.",
  },
  {
    userKey: "rick-minter",
    slug: "rick-minter",
    bio: "7th Degree Coral Belt · promoted by Rigan Machado on April 10, 2026 at the CSW World Conference.",
  },
  {
    // @added SESSION_0433 — Christopher Alexander Poznik (BK5; replaces chris-posnik per SESSION_0430 C2).
    userKey: "poznik",
    slug: "poznik",
    bio: "Black Belt – 5th Degree · Rigan Machado lineage.",
  },
  {
    userKey: "renato-magno",
    slug: "renato-magno",
    bio: "7th Degree Coral Belt · promoted by Rigan Machado on June 8, 2024 in Oklahoma City (with Bob Bass).",
  },
  {
    userKey: "david-meyer",
    slug: "david-meyer",
    bio: "7th Degree Coral Belt · promoted by Rigan Machado on January 17, 2026 · Dirty Dozen under Rigan Machado · David Meyer BJJ, Seattle WA.",
  },
  {
    userKey: "chris-haueter",
    slug: "chris-haueter",
    bio: "6th Degree Black Belt · Dirty Dozen #11 under Rigan Machado · Combat Base, California.",
  },
  {
    userKey: "john-will",
    slug: "john-will",
    bio: "7th Degree Coral Belt · promoted by Rigan Machado on September 14, 2025 · Dirty Dozen under Rigan Machado · John Will Martial Arts, Melbourne, Australia.",
  },
  {
    // @updated SESSION_0433 — SESSION_0430 B1: erroneous Coral Belt corrected to Black Belt – 5th Degree.
    userKey: "bill-hosken",
    slug: "bill-hosken",
    bio: "Black Belt – 5th Degree · Under Rigan Machado · Colorado Springs BJJ, Colorado Springs CO.",
  },
  {
    // @updated SESSION_0433 — SESSION_0430 B2: erroneous Coral Belt award deleted; base Black Belt.
    userKey: "jerry-smith",
    slug: "jerry-smith",
    bio: "Black Belt · Under Rigan Machado · Mat Fitness, California.",
  },

  // Next generation
  {
    userKey: "brian-truelson",
    slug: "brian-truelson",
    bio: "1st Degree Black Belt · Under Bill Hosken (Rigan Machado lineage) · Puyallup BJJ, Puyallup WA.",
  },
  {
    // @added SESSION_0433 — Rikki Rockett, BK4 under Renato Magno (SESSION_0430 B3).
    userKey: "rikki-rockett",
    slug: "rikki-rockett",
    bio: "Black Belt – 4th Degree · Promoted 2024-01-27 by Renato Magno (Rigan Machado lineage).",
  },

  // Brian's non-BJJ instructors
  {
    userKey: "steve-wolk",
    slug: "gm-steve-wolk",
    bio: "Grandmaster · PIMA Denver Doce Pares Eskrima · Brian Scott's Eskrima instructor.",
  },
  {
    userKey: "sak-va-roon",
    slug: "sak-va-roon",
    bio: "Kru-level Thai Boxing instructor (Thailand). Brian Scott's Muay Thai certifying authority.",
  },
  {
    userKey: "tim-mills",
    slug: "sifu-tim-mills",
    bio: "Sifu · Kajukenbo. Co-instructor of Brian Scott's Kajukenbo 1st Degree Black Belt.",
  },
  {
    userKey: "sam-carter",
    slug: "sifu-sam-carter",
    bio: "Sifu · Kajukenbo. Co-instructor of Brian Scott's Kajukenbo 1st Degree Black Belt.",
  },
  {
    userKey: "hanyann-ng",
    slug: "sifu-hanyann-ng",
    bio: "Sifu · Kajukenbo. Co-instructor of Brian Scott's Kajukenbo 1st Degree Black Belt.",
  },
  {
    userKey: "tim-wolchek",
    slug: "mr-tim-wolchek",
    bio: "American Freestyle Karate instructor at Wolchek Academy, CO. Brian Scott's Karate instructor and secondary BJJ training partner/instructor.",
  },
]

// EDGES: fromNode = INSTRUCTOR, toNode = STUDENT
// Tree structure: Carlos Sr → Carlos Jr → Rigan → Dirty Dozen → Next Gen
const EDGE_SEEDS: LineageEdgeSeed[] = [
  // Root lineage chain
  {
    fromKey: "carlos-gracie-sr",
    toKey: "carlos-gracie-jr",
    description: "Carlos Gracie Jr trained under his father Carlos Gracie Sr.",
    isVerified: true,
  },
  // @added SESSION_0432 — Hélio Gracie → Rorion Gracie (father→son) so the promoter link resolves.
  {
    fromKey: "helio-gracie",
    toKey: "rorion-gracie",
    description:
      "Rorion Gracie is the son of Hélio Gracie; trained in Gracie Jiu-Jitsu under Hélio.",
    isVerified: true,
  },
  {
    fromKey: "carlos-gracie-jr",
    toKey: "rigan-machado",
    description: "Rigan Machado trained under Carlos Gracie Jr lineage.",
    isVerified: true,
  },

  // Rigan → black belt lineage and promoted senior students.
  {
    fromKey: "rigan-machado",
    toKey: "bob-bass",
    description:
      "Bob Bass — 1st American Black Belt under Rigan Machado. Promoted to 7th Degree Coral Belt on June 8, 2024 in Oklahoma City.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "rick-williams",
    description:
      "Rick Williams — Dirty Dozen under Rigan Machado. Promoted to 7th Degree Coral Belt on April 10, 2026.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "erik-paulson",
    description:
      "Erik Paulson — Rigan Machado black belt lineage. Promoted to 7th Degree Coral Belt on April 10, 2026.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "casey-olsen",
    description:
      "Casey Olsen — Rigan Machado black belt lineage. Promoted to 7th Degree Coral Belt on April 10, 2026.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "rick-minter",
    description:
      "Rick Minter — Rigan Machado black belt lineage. Promoted to 7th Degree Coral Belt on April 10, 2026.",
    isVerified: true,
  },
  {
    // @added SESSION_0433 — Poznik replaces chris-posnik (SESSION_0430 C2). BK5.
    fromKey: "rigan-machado",
    toKey: "poznik",
    description:
      "Christopher Alexander Poznik — Black Belt 5th Degree under Rigan Machado lineage.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "renato-magno",
    description:
      "Renato Magno — Rigan Machado black belt lineage. Promoted to 7th Degree Coral Belt on June 8, 2024 in Oklahoma City.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "david-meyer",
    description: "David Meyer — Dirty Dozen #10 under Rigan Machado. Now Coral Belt.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "chris-haueter",
    description: "Chris Haueter — Dirty Dozen #11 under Rigan Machado. 6th Degree Black Belt.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "john-will",
    description: "John Will — Dirty Dozen #12 under Rigan Machado. Now Coral Belt.",
    isVerified: true,
  },
  {
    // @updated SESSION_0433 — SESSION_0430 B1: Black Belt – 5th Degree (not Coral).
    fromKey: "rigan-machado",
    toKey: "bill-hosken",
    description: "Bill Hosken — under Rigan Machado. Black Belt – 5th Degree.",
    isVerified: true,
  },
  {
    // @updated SESSION_0433 — SESSION_0430 B2: base Black Belt (erroneous Coral award deleted).
    fromKey: "rigan-machado",
    toKey: "jerry-smith",
    description: "Jerry Smith — under Rigan Machado. Black Belt.",
    isVerified: true,
  },

  // Rorion Gracie → Rigan Machado: secondary instructor relationship (Red Belt promotion, 2026)
  {
    fromKey: "rorion-gracie",
    toKey: "rigan-machado",
    description:
      "Rorion Gracie promoted Rigan Machado to 9th Degree Red Belt on April 10, 2026 at the CSW World Conference. Secondary instructor relationship — primary BJJ lineage is via Carlos Gracie Jr.",
    isVerified: true,
  },

  // Next generation — Bob Bass → Brian Scott
  {
    fromKey: "bob-bass",
    toKey: "OWNER",
    description: "BJJ Black Belt 1st Degree under Bob Bass (Rigan Machado lineage).",
    isVerified: true,
  },

  // Next generation — Bill Hosken → Brian Truelson (CORRECTED: was under Bob Bass in legacy)
  {
    fromKey: "bill-hosken",
    toKey: "brian-truelson",
    description: "Brian Truelson — 1st Degree Black Belt under Bill Hosken.",
    isVerified: false,
  },

  // @added SESSION_0433 — Renato Magno → Rikki Rockett (SESSION_0430 B3).
  {
    fromKey: "renato-magno",
    toKey: "rikki-rockett",
    description:
      "Rikki Rockett — Black Belt 4th Degree under Renato Magno (Rigan Machado lineage). Promoted 2024-01-27.",
    isVerified: true,
  },

  // Brian's non-BJJ instructors → Brian
  {
    fromKey: "steve-wolk",
    toKey: "OWNER",
    description:
      "Eskrima 5th Degree Black Belt (Master) under GM Steve Wolk, PIMA Denver Doce Pares.",
    isVerified: false,
  },
  {
    fromKey: "sak-va-roon",
    toKey: "OWNER",
    description: "Certified Kru under Sak Va Roon Thai Boxing (Thailand).",
    isVerified: false,
  },
  {
    fromKey: "tim-mills",
    toKey: "OWNER",
    description: "Kajukenbo 1st Degree Black Belt (co-instructor of record).",
    isVerified: false,
  },
  {
    fromKey: "sam-carter",
    toKey: "OWNER",
    description: "Kajukenbo 1st Degree Black Belt (co-instructor of record).",
    isVerified: false,
  },
  {
    fromKey: "hanyann-ng",
    toKey: "OWNER",
    description: "Kajukenbo 1st Degree Black Belt (co-instructor of record).",
    isVerified: false,
  },
  {
    fromKey: "tim-wolchek",
    toKey: "OWNER",
    description: "American Freestyle Karate 4th Degree Black Belt under Mr. Tim Wolchek.",
    isVerified: false,
  },
]

// ---------------------------------------------------------------------------
// RankAwards (SESSION_0316)
// ---------------------------------------------------------------------------
// Every BJJ-lineage figure currently has NO rank, so lineage cards render
// blank/yellow. Seed one RankAward per figure (global fact), linking the
// awarding promoter, then point each rigan-tree LineageTreeMember at it.
//
// Approximate historical dates remain flagged in `notes`. Exact 2026 ceremony
// facts are pre-PromotionEvent bridge data until `promotion-event-model.md` is
// implemented with a first-class ceremony/gallery entity.
const RANK_AWARD_NOTE = "Approximate date — SESSION_0316 seed, refine later"
const APRIL_2026_CEREMONY_NOTE =
  "April 10, 2026 CSW World Conference ceremony — pre-PromotionEvent seed bridge; Brian Scott attended and public sources corroborate the ceremony."

type RankAwardSeed = {
  /** Recipient user key (PLACEHOLDER_USERS key or "OWNER"). */
  userKey: string
  /** BJJ rank shortName (looked up in the BJJ rank system). */
  rankShortName: string
  /** Promoter user key, or null when unknown / root of the seeded tree. */
  awardedByKey: string | null
  /** Approximate award date (ISO). */
  awardedAt: string
  notes?: string
  location?: string
}

const BJJ_RANK_AWARD_SEEDS: RankAwardSeed[] = [
  {
    userKey: "carlos-gracie-sr",
    rankShortName: "R10",
    awardedByKey: null,
    awardedAt: "1955-01-01",
  },
  {
    userKey: "carlos-gracie-jr",
    rankShortName: "R9",
    awardedByKey: "carlos-gracie-sr",
    awardedAt: "2012-01-01",
  },
  // @added SESSION_0432 — Hélio Gracie 10th Degree Red Belt (root of his lineage branch).
  {
    userKey: "helio-gracie",
    rankShortName: "R10",
    awardedByKey: null,
    awardedAt: "1960-01-01",
    notes: "10th Degree Red Belt — co-founder of Gracie Jiu-Jitsu. Approximate date.",
  },
  {
    // @updated SESSION_0432 — awardedByKey now links to helio-gracie (node exists).
    // Previously null; SESSION_0386 noted "son of Hélio Gracie" in the notes field.
    userKey: "rorion-gracie",
    rankShortName: "R9",
    awardedByKey: "helio-gracie",
    awardedAt: "2013-01-01",
    notes:
      "9th Degree Red Belt — son of Hélio Gracie. Approximate date; pre-PromotionEvent seed bridge.",
  },
  {
    userKey: "rigan-machado",
    rankShortName: "CB8",
    awardedByKey: "carlos-gracie-jr",
    awardedAt: "2016-01-01",
  },
  {
    userKey: "rigan-machado",
    rankShortName: "R9",
    awardedByKey: "rorion-gracie",
    awardedAt: "2026-04-10",
    location: "Combat Submission Wrestling Headquarters",
    notes: APRIL_2026_CEREMONY_NOTE,
  },
  {
    userKey: "bob-bass",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2024-06-08",
    location: "Oklahoma City, OK",
    notes:
      "Operator-confirmed (SESSION_0318): 7th Degree Coral Belt, June 8, 2024, Oklahoma City — promoted with Renato Magno. Brian Scott attended April 10, 2026 but was not promoted that day.",
  },
  {
    userKey: "rick-williams",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2026-04-10",
    location: "Combat Submission Wrestling Headquarters",
    notes: APRIL_2026_CEREMONY_NOTE,
  },
  {
    userKey: "erik-paulson",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2026-04-10",
    location: "Combat Submission Wrestling Headquarters",
    notes: APRIL_2026_CEREMONY_NOTE,
  },
  {
    userKey: "casey-olsen",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2026-04-10",
    location: "Combat Submission Wrestling Headquarters",
    notes: APRIL_2026_CEREMONY_NOTE,
  },
  {
    userKey: "rick-minter",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2026-04-10",
    location: "Combat Submission Wrestling Headquarters",
    notes: APRIL_2026_CEREMONY_NOTE,
  },
  {
    // @added SESSION_0433 — Poznik replaces chris-posnik (SESSION_0430 C2). Black Belt 5th, not Coral.
    userKey: "poznik",
    rankShortName: "BK5",
    awardedByKey: "rigan-machado",
    awardedAt: "2026-04-10",
  },
  {
    userKey: "renato-magno",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2024-06-08",
    location: "Oklahoma City, OK",
    notes:
      "Operator-confirmed (SESSION_0318): 7th Degree Coral Belt, June 8, 2024, Oklahoma City — promoted with Bob Bass.",
  },
  {
    userKey: "david-meyer",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2026-01-17",
    location: "Northwest Brazilian Jiu-Jitsu Academy, Seattle, WA",
    notes:
      "Public source correction — Dave Meyer 7th Degree Coral Belt ceremony dated January 17, 2026; pre-PromotionEvent seed bridge.",
  },
  {
    // Operator-confirmed (SESSION_0318): Chris Haueter is a 6th Degree BLACK belt,
    // not a coral belt. Public sources (BJJ Heroes, Combat Base) corroborate 6th-degree
    // black belt. Exact 6th-degree date unconfirmed — flagged approximate.
    userKey: "chris-haueter",
    rankShortName: "BK6",
    awardedByKey: "rigan-machado",
    awardedAt: "2019-03-01",
    notes:
      "6th Degree Black Belt (operator-confirmed SESSION_0318). Exact promotion date unconfirmed — approximate.",
  },
  {
    userKey: "john-will",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2025-09-14",
    notes:
      "Public source correction — John Will 7th Degree Coral Belt awarded by Rigan Machado on September 14, 2025.",
  },
  {
    // @updated SESSION_0433 — SESSION_0430 B1: Black Belt 5th Degree (was erroneous CB7).
    userKey: "bill-hosken",
    rankShortName: "BK5",
    awardedByKey: "rigan-machado",
    awardedAt: "2020-06-01",
  },
  {
    // @updated SESSION_0433 — SESSION_0430 B2: base Black Belt BK0 (erroneous CB7 deleted in corrective block).
    userKey: "jerry-smith",
    rankShortName: "BK0",
    awardedByKey: "rigan-machado",
    awardedAt: "2021-06-01",
  },
  {
    // @added SESSION_0433 — Rikki Rockett BK4, promoted 2024-01-27 by Renato Magno (SESSION_0430 B3).
    userKey: "rikki-rockett",
    rankShortName: "BK4",
    awardedByKey: "renato-magno",
    awardedAt: "2024-01-27",
    notes:
      "Public record — 4th Degree Black Belt, January 27, 2024, under Renato Magno (Rigan Machado lineage). SESSION_0430 B3.",
  },
  {
    userKey: "brian-truelson",
    rankShortName: "BK1",
    awardedByKey: "bill-hosken",
    awardedAt: "2008-01-01",
  },
  // OWNER (Brian Scott) → BK1. Spec assumed this was already seeded, but on
  // local dev the owner had no BJJ RankAward, leaving his card blank. Seed it
  // (awardedBy Bob Bass, matching the INSTRUCTOR_STUDENT edge) so the selected
  // rank resolves. SESSION_0316 deviation, documented in the report.
  { userKey: "OWNER", rankShortName: "BK1", awardedByKey: "bob-bass", awardedAt: "2005-01-01" },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Counts = {
  usersCreated: number
  usersFound: number
  nodesCreated: number
  nodesFound: number
  edgesCreated: number
  edgesFound: number
  treeMembersUpdated: number
  rankAwardsCreated: number
  rankAwardsFound: number
}

// Phase 3c (SOT-ADR D1): a lineage placeholder person is an ACCOUNTLESS Passport (no synthetic User
// / @placeholder.invalid email). It is claimable precisely because no account is attached. Idempotency
// keys on the accountless Passport's displayName (seed names are unique).
async function ensureUser(
  pu: PlaceholderUser,
  counts: Counts,
): Promise<{ id: string; created: boolean }> {
  const existing = await db.passport.findFirst({
    where: { displayName: pu.name, userId: null },
    select: { id: true },
  })
  if (existing) {
    counts.usersFound++
    console.log(`   Passport ${pu.key}: already exists (id=${existing.id})`)
    return { id: existing.id, created: false }
  }
  const created = await db.passport.create({
    data: {
      displayName: pu.name,
      avatarUrl: pu.image ?? null,
    },
    select: { id: true },
  })
  counts.usersCreated++
  console.log(`   ✅ Created accountless Passport: ${pu.key} (id=${created.id})`)
  return { id: created.id, created: true }
}

async function ensureLineageNode(
  passportId: string,
  seed: LineageNodeSeed,
  counts: Counts,
): Promise<{ id: string; created: boolean }> {
  const existing = await db.lineageNode.findFirst({
    where: { passportId },
    select: { id: true, slug: true, bio: true, isVerified: true, verificationStatus: true },
  })
  if (existing) {
    // SESSION_0316: flip existing nodes to verified on re-run.
    const updateData: {
      slug?: string
      bio?: string
      isVerified?: boolean
      verificationStatus?: "VERIFIED"
    } = {}
    if (existing.slug !== seed.slug) updateData.slug = seed.slug
    if (existing.bio !== seed.bio) updateData.bio = seed.bio
    if (!existing.isVerified || existing.verificationStatus !== "VERIFIED") {
      updateData.isVerified = true
      updateData.verificationStatus = "VERIFIED"
    }
    if (Object.keys(updateData).length > 0) {
      await db.lineageNode.update({
        where: { id: existing.id },
        data: updateData,
      })
      console.log(
        `   LineageNode ${seed.userKey}: exists, refreshed (${Object.keys(updateData).join(", ")})`,
      )
    }
    counts.nodesFound++
    console.log(`   LineageNode ${seed.userKey}: already exists (id=${existing.id})`)
    return { id: existing.id, created: false }
  }
  const created = await db.lineageNode.create({
    data: {
      passportId,
      slug: seed.slug,
      bio: seed.bio,
      visibility: "PUBLIC",
      isVerified: true,
      verificationStatus: "VERIFIED",
    },
    select: { id: true },
  })
  counts.nodesCreated++
  console.log(`   ✅ Created LineageNode: ${seed.userKey} (id=${created.id})`)
  return { id: created.id, created: true }
}

async function ensureLineageRelationship(
  fromNodeId: string,
  toNodeId: string,
  description: string,
  _isVerified: boolean,
  counts: Counts,
): Promise<void> {
  // SESSION_0316: all seeded relationships are verified facts. Override the
  // per-edge isVerified flag and force VERIFIED status on create + update.
  const existing = await db.lineageRelationship.findFirst({
    where: {
      fromNodeId,
      toNodeId,
      type: "INSTRUCTOR_STUDENT",
    },
    select: { id: true },
  })
  if (existing) {
    await db.lineageRelationship.update({
      where: { id: existing.id },
      data: { isVerified: true, verificationStatus: "VERIFIED", description },
    })
    counts.edgesFound++
    console.log(`   Edge ${fromNodeId.slice(0, 6)} → ${toNodeId.slice(0, 6)}: exists, updated`)
    return
  }
  await db.lineageRelationship.create({
    data: {
      fromNodeId,
      toNodeId,
      type: "INSTRUCTOR_STUDENT",
      description,
      isVerified: true,
      verificationStatus: "VERIFIED",
    },
  })
  counts.edgesCreated++
  console.log(`   ✅ Created Edge ${fromNodeId.slice(0, 6)} → ${toNodeId.slice(0, 6)}`)
}

/**
 * Upsert a BJJ RankAward (global promotion fact). Looks up the BJJ rank by
 * shortName, then findFirst on (userId, rankId) — the @@unique key — and
 * creates or refreshes. Returns the RankAward id (consumed by PromotionEvent
 * linking). Display reads the highest awarded RankAward (ADR 0035).
 * FS-0006: never createMany on a nullable-unique.
 */
async function ensureRankAward(
  passportId: string,
  rankShortName: string,
  // Phase 3c: seeded promoters are historical lineage identity → Passport-side (awardedByPassportId).
  awardedByPassportId: string | null,
  awardedAt: string,
  notes: string | undefined,
  location: string | undefined,
  counts: Counts,
): Promise<string | null> {
  const rank = await db.rank.findFirst({
    where: {
      shortName: rankShortName,
      rankSystem: { discipline: { code: "bjj" } },
    },
    select: { id: true },
  })
  if (!rank) {
    console.log(`   ⚠️  BJJ rank not found: shortName=${rankShortName} — skipping RankAward`)
    return null
  }

  const existing = await db.rankAward.findFirst({
    where: { passportId, rankId: rank.id },
    select: { id: true },
  })
  if (existing) {
    await db.rankAward.update({
      where: { id: existing.id },
      data: {
        awardedByPassportId: awardedByPassportId ?? undefined,
        awardedAt: new Date(awardedAt),
        notes: notes ?? RANK_AWARD_NOTE,
        location,
      },
    })
    counts.rankAwardsFound++
    console.log(`   RankAward ${rankShortName} for ${passportId.slice(0, 6)}: exists, refreshed`)
    return existing.id
  }
  const created = await db.rankAward.create({
    data: {
      passportId,
      rankId: rank.id,
      awardedByPassportId: awardedByPassportId ?? undefined,
      awardedAt: new Date(awardedAt),
      notes: notes ?? RANK_AWARD_NOTE,
      location,
    },
    select: { id: true },
  })
  counts.rankAwardsCreated++
  console.log(
    `   ✅ Created RankAward ${rankShortName} for ${passportId.slice(0, 6)} (id=${created.id})`,
  )
  return created.id
}

// The 7 "Dirty Dozen" cohort members assigned to the visual group.
const DIRTY_DOZEN_KEYS = [
  "bob-bass",
  "rick-williams",
  "david-meyer",
  "chris-haueter",
  "john-will",
  "bill-hosken",
  "jerry-smith",
] as const

// DIRTY_DOZEN_LABEL moved to ~/lib/lineage/dirty-dozen (shared with comp-grant detection).

/**
 * Ensure the Dirty Dozen cohort LineageVisualGroup on the rigan tree and
 * assign the 7 cohort members to it. Idempotent: findFirst by the
 * @@unique [treeId, parentMemberId, groupType, promotionDate].
 */
async function ensureDirtyDozenGroup(
  treeId: string,
  treeMemberIdByKey: Map<string, string>,
): Promise<void> {
  const riganMemberId = treeMemberIdByKey.get("rigan-machado")
  if (!riganMemberId) {
    console.log("   ⚠️  Rigan tree member not found — skipping Dirty Dozen visual group")
    return
  }

  const promotionDate = new Date("1994-01-01")
  const groupType = "PROMOTION_DATE" as const

  let group = await db.lineageVisualGroup.findFirst({
    where: {
      treeId,
      parentMemberId: riganMemberId,
      groupType,
      promotionDate,
    },
    select: { id: true },
  })
  if (group) {
    await db.lineageVisualGroup.update({
      where: { id: group.id },
      data: {
        label: DIRTY_DOZEN_LABEL,
        showPublicLabel: true,
        sortOrder: 0,
      },
    })
    console.log(`   LineageVisualGroup Dirty Dozen: exists (id=${group.id}), refreshed`)
  } else {
    group = await db.lineageVisualGroup.create({
      data: {
        treeId,
        parentMemberId: riganMemberId,
        label: DIRTY_DOZEN_LABEL,
        groupType,
        promotionDate,
        showPublicLabel: true,
        sortOrder: 0,
      },
      select: { id: true },
    })
    console.log(`   ✅ Created LineageVisualGroup Dirty Dozen (id=${group.id})`)
  }

  let assigned = 0
  for (const key of DIRTY_DOZEN_KEYS) {
    const memberId = treeMemberIdByKey.get(key)
    if (!memberId) {
      console.log(`   ⚠️  Dozen member ${key} not found — skipping group assignment`)
      continue
    }
    await db.lineageTreeMember.update({
      where: { id: memberId },
      data: { visualGroupId: group.id },
    })
    assigned++
  }
  console.log(`   LineageVisualGroup Dirty Dozen: assigned ${assigned} members`)
}

// ---------------------------------------------------------------------------
// PromotionEvents (SESSION_0319) — data-driven ceremony seeds.
// ---------------------------------------------------------------------------

type PromotionEventAwardMatch = {
  userKey: string
  rankShortName: string
  awardedAt: string
  location: string
}

type PromotionEventMediaSeed = {
  url: string
  title: string
  altText: string
  sortOrder: number
}

type PromotionEventSeed = {
  key: string
  title: string
  slug: string
  eventDate: string
  location: string
  description: string
  awardMatches: PromotionEventAwardMatch[]
  cohortLabel: string
  cohortKeys: string[]
  cohortSortOrder: number
  media: PromotionEventMediaSeed[]
}

function rankAwardSeedKey({
  userKey,
  rankShortName,
  awardedAt,
  location,
}: PromotionEventAwardMatch) {
  return [userKey, rankShortName, awardedAt, location].join("::")
}

const PROMOTION_EVENTS: PromotionEventSeed[] = [
  {
    key: "csw-2026",
    title: "Coral Belt Ceremony — CSW World Conference",
    slug: "coral-belt-ceremony-csw-world-conference-2026",
    eventDate: "2026-04-10",
    location: "Combat Submission Wrestling Headquarters",
    // @updated SESSION_0433 — removed chris-posnik (merged/deleted per SESSION_0430 C2; Poznik has BK5, not CB7).
    description:
      "Rorion Gracie promoted Rigan Machado to Red Belt (9th degree); Rigan Machado promoted Erik Paulson, Casey Olsen, Rick Minter, and Rick Williams to 7th Degree Coral Belt. Hosted at Erik Paulson's Combat Submission Wrestling during the CSW World Conference.",
    awardMatches: [
      {
        userKey: "rigan-machado",
        rankShortName: "R9",
        awardedAt: "2026-04-10",
        location: "Combat Submission Wrestling Headquarters",
      },
      {
        userKey: "rick-williams",
        rankShortName: "CB7",
        awardedAt: "2026-04-10",
        location: "Combat Submission Wrestling Headquarters",
      },
      {
        userKey: "erik-paulson",
        rankShortName: "CB7",
        awardedAt: "2026-04-10",
        location: "Combat Submission Wrestling Headquarters",
      },
      {
        userKey: "casey-olsen",
        rankShortName: "CB7",
        awardedAt: "2026-04-10",
        location: "Combat Submission Wrestling Headquarters",
      },
      {
        userKey: "rick-minter",
        rankShortName: "CB7",
        awardedAt: "2026-04-10",
        location: "Combat Submission Wrestling Headquarters",
      },
    ],
    // Rick Williams stays in Dirty Dozen; his RankAward still links to this event.
    cohortLabel: "Coral Belt Ceremony — Apr 10, 2026",
    cohortKeys: ["erik-paulson", "casey-olsen", "rick-minter"],
    cohortSortOrder: 1,
    media: [
      {
        url: "/seed/events/csw-2026/rigan-machado.jpg",
        title: "Rigan Machado",
        altText: "Rigan Machado (Red Belt, 9th degree)",
        sortOrder: 0,
      },
      {
        url: "/seed/events/csw-2026/rick-williams.jpg",
        title: "Rick Williams",
        altText: "Rick Williams",
        sortOrder: 1,
      },
      {
        url: "/seed/events/csw-2026/erik-paulson-csw.png",
        title: "Combat Submission Wrestling",
        altText: "Combat Submission Wrestling host school",
        sortOrder: 2,
      },
      {
        url: "/seed/events/csw-2026/belt-ceremony.jpg",
        title: "Black belt instruction",
        altText: "Black belt instruction ceremony context",
        sortOrder: 3,
      },
    ],
  },
  {
    key: "okc-2024",
    title: "Coral Belt Ceremony — Oklahoma City",
    slug: "coral-belt-ceremony-oklahoma-city-2024",
    eventDate: "2024-06-08",
    location: "Oklahoma City, OK",
    description:
      "Rigan Machado promoted Bob Bass and Renato Magno to 7th Degree Coral Belt in Oklahoma City.",
    awardMatches: [
      {
        userKey: "bob-bass",
        rankShortName: "CB7",
        awardedAt: "2024-06-08",
        location: "Oklahoma City, OK",
      },
      {
        userKey: "renato-magno",
        rankShortName: "CB7",
        awardedAt: "2024-06-08",
        location: "Oklahoma City, OK",
      },
    ],
    // Bob Bass already occupies the Dirty Dozen group slot; do not double-assign him.
    cohortLabel: "Coral Belt Ceremony — Jun 8, 2024",
    cohortKeys: ["renato-magno"],
    cohortSortOrder: 2,
    media: [
      {
        url: "/seed/events/okc-2024/bob-bass-coral-belt-group.jpg",
        title: "Bob Bass coral belt group",
        altText:
          "Bob Bass coral belt ceremony with Rigan, Renato Magno, Bill Hosken, and Dave Meyer",
        sortOrder: 0,
      },
      {
        url: "/seed/events/okc-2024/bob-bass-coral-belt.jpg",
        title: "Bob Bass receiving coral belt",
        altText: "Bob Bass receiving his 7th-degree coral belt",
        sortOrder: 1,
      },
      {
        url: "/seed/events/okc-2024/renato-magno.jpg",
        title: "Renato Magno",
        altText: "Renato Magno",
        sortOrder: 2,
      },
      {
        url: "/seed/events/okc-2024/bob-bass-and-rigan.jpeg",
        title: "Bob Bass and Rigan Machado",
        altText: "Bob Bass and Rigan Machado",
        sortOrder: 3,
      },
    ],
  },
]

async function ensurePromotionEventMedia({
  promotionEventId,
  uploadedById,
  media,
}: {
  promotionEventId: string
  uploadedById: string
  media: PromotionEventMediaSeed[]
}) {
  for (const item of media) {
    let row = await db.media.findFirst({
      where: { url: item.url },
      select: { id: true },
    })
    if (row) {
      row = await db.media.update({
        where: { id: row.id },
        data: {
          brand: "BBL",
          type: "IMAGE",
          title: item.title,
          altText: item.altText,
          isPublic: true,
          uploadedById,
        },
        select: { id: true },
      })
    } else {
      row = await db.media.create({
        data: {
          brand: "BBL",
          type: "IMAGE",
          url: item.url,
          title: item.title,
          altText: item.altText,
          mimeType: item.url.endsWith(".png")
            ? "image/png"
            : item.url.endsWith(".jpeg")
              ? "image/jpeg"
              : "image/jpeg",
          isPublic: true,
          uploadedById,
          sortOrder: item.sortOrder,
        },
        select: { id: true },
      })
    }

    const existingAttachment = await db.mediaAttachment.findFirst({
      where: {
        mediaId: row.id,
        promotionEventId,
      },
      select: { id: true },
    })
    if (existingAttachment) {
      await db.mediaAttachment.update({
        where: { id: existingAttachment.id },
        data: { purpose: "promotion-event-gallery", sortOrder: item.sortOrder },
      })
    } else {
      await db.mediaAttachment.create({
        data: {
          mediaId: row.id,
          promotionEventId,
          purpose: "promotion-event-gallery",
          sortOrder: item.sortOrder,
        },
      })
    }
  }
}

/**
 * Upsert global PromotionEvents, link their RankAwards, and seed read-only
 * gallery media. Idempotent: find by slug first, then legacy title+eventDate.
 */
async function ensurePromotionEvents({
  rankAwardIdBySeedKey,
  uploadedById,
}: {
  rankAwardIdBySeedKey: Map<string, string>
  uploadedById: string
}): Promise<Map<string, string>> {
  const eventIdByKey = new Map<string, string>()

  for (const seed of PROMOTION_EVENTS) {
    const eventDate = new Date(seed.eventDate)
    let event = await db.promotionEvent.findFirst({
      where: {
        OR: [{ slug: seed.slug }, { title: seed.title, eventDate }],
      },
      select: { id: true },
    })

    if (event) {
      await db.promotionEvent.update({
        where: { id: event.id },
        data: {
          title: seed.title,
          slug: seed.slug,
          eventDate,
          location: seed.location,
          description: seed.description,
        },
      })
      console.log(`   PromotionEvent ${seed.key}: exists (id=${event.id}), refreshed`)
    } else {
      event = await db.promotionEvent.create({
        data: {
          title: seed.title,
          slug: seed.slug,
          eventDate,
          location: seed.location,
          description: seed.description,
        },
        select: { id: true },
      })
      console.log(`   ✅ Created PromotionEvent ${seed.key} (id=${event.id})`)
    }

    const awardIds = seed.awardMatches
      .map(match => rankAwardIdBySeedKey.get(rankAwardSeedKey(match)))
      .filter((id): id is string => Boolean(id))

    if (awardIds.length > 0) {
      const linked = await db.rankAward.updateMany({
        where: { id: { in: awardIds } },
        data: { promotionEventId: event.id },
      })
      console.log(`   PromotionEvent ${seed.key}: linked ${linked.count} RankAwards`)
    }

    await ensurePromotionEventMedia({
      promotionEventId: event.id,
      uploadedById,
      media: seed.media,
    })
    console.log(`   PromotionEvent ${seed.key}: seeded ${seed.media.length} gallery media`)
    eventIdByKey.set(seed.key, event.id)
  }

  return eventIdByKey
}

/**
 * Ensure a per-tree ceremony cohort LineageVisualGroup, link it to the global
 * PromotionEvent, and assign only cohort members that can safely leave their
 * current visual group. Runs per tree (Baseline + BBL).
 */
async function ensureCeremonyCohortGroup(
  seed: PromotionEventSeed,
  treeId: string,
  treeMemberIdByKey: Map<string, string>,
  promotionEventId: string,
): Promise<void> {
  if (seed.cohortKeys.length === 0) {
    console.log(`   PromotionEvent ${seed.key}: no cohort keys — skipping visual group`)
    return
  }

  const riganMemberId = treeMemberIdByKey.get("rigan-machado")
  if (!riganMemberId) {
    console.log(`   ⚠️  Rigan tree member not found — skipping ${seed.key} ceremony cohort group`)
    return
  }
  const groupType = "PROMOTION_DATE" as const
  const promotionDate = new Date(seed.eventDate)

  let group = await db.lineageVisualGroup.findFirst({
    where: {
      treeId,
      parentMemberId: riganMemberId,
      groupType,
      promotionDate,
    },
    select: { id: true },
  })
  if (group) {
    await db.lineageVisualGroup.update({
      where: { id: group.id },
      data: {
        label: seed.cohortLabel,
        showPublicLabel: true,
        sortOrder: seed.cohortSortOrder,
        promotionEventId,
      },
    })
    console.log(`   LineageVisualGroup ${seed.key}: exists (id=${group.id}), refreshed + linked`)
  } else {
    group = await db.lineageVisualGroup.create({
      data: {
        treeId,
        parentMemberId: riganMemberId,
        label: seed.cohortLabel,
        groupType,
        promotionDate,
        showPublicLabel: true,
        sortOrder: seed.cohortSortOrder,
        promotionEventId,
      },
      select: { id: true },
    })
    console.log(`   ✅ Created LineageVisualGroup ${seed.key} (id=${group.id}) linked to event`)
  }

  let assigned = 0
  for (const key of seed.cohortKeys) {
    const memberId = treeMemberIdByKey.get(key)
    if (!memberId) {
      console.log(`   ⚠️  Ceremony member ${key} not found — skipping group assignment`)
      continue
    }
    await db.lineageTreeMember.update({
      where: { id: memberId },
      data: { visualGroupId: group.id },
    })
    assigned++
  }
  console.log(`   LineageVisualGroup ${seed.key}: assigned ${assigned} members`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n🌱 seed-baseline-lineage.ts — Brian's lineage graph\n")

  const counts: Counts = {
    usersCreated: 0,
    usersFound: 0,
    nodesCreated: 0,
    nodesFound: 0,
    edgesCreated: 0,
    edgesFound: 0,
    treeMembersUpdated: 0,
    rankAwardsCreated: 0,
    rankAwardsFound: 0,
  }

  // ---------------------------------------------------------------------
  // 0. Resolve the owner user (Brian Scott). SESSION_0316 hardening:
  //    Prefer production OWNER_ID; else a User named exactly "Brian Scott";
  //    else the owner of the Baseline Martial Arts org (by name/slug);
  //    else the current arbitrary Baseline-brand org owner fallback.
  // ---------------------------------------------------------------------
  let owner = await db.user.findUnique({
    where: { id: OWNER_ID },
    select: { id: true, email: true, name: true },
  })
  if (owner) {
    console.log(`   Resolved owner via OWNER_ID: ${owner.email}`)
  }

  if (!owner) {
    owner = await db.user.findFirst({
      where: { name: "Brian Scott" },
      select: { id: true, email: true, name: true },
    })
    if (owner) {
      console.log(`   Resolved owner via name="Brian Scott": ${owner.email}`)
    }
  }

  if (!owner) {
    // Owner of the Baseline Martial Arts org, matched by name ILIKE or slug.
    const baselineMaOrg = await db.organization.findFirst({
      where: {
        ownerId: { not: null },
        OR: [
          { name: { equals: "Baseline Martial Arts", mode: "insensitive" } },
          { slug: "baseline-martial-arts" },
        ],
      },
      select: { ownerId: true, slug: true },
    })
    if (baselineMaOrg?.ownerId) {
      owner = await db.user.findUnique({
        where: { id: baselineMaOrg.ownerId },
        select: { id: true, email: true, name: true },
      })
      if (owner) {
        console.log(
          `   Resolved owner via Baseline Martial Arts org owner: ${owner.email} (org=${baselineMaOrg.slug})`,
        )
      }
    }
  }

  if (!owner) {
    // Last resort: any Baseline-brand org owner (legacy arbitrary fallback).
    const baselineOrg = await db.organization.findFirst({
      where: { brand: BRAND, ownerId: { not: null } },
      select: { ownerId: true, slug: true },
    })
    if (baselineOrg?.ownerId) {
      owner = await db.user.findUnique({
        where: { id: baselineOrg.ownerId },
        select: { id: true, email: true, name: true },
      })
      if (owner) {
        console.log(
          `   ⚠️  Falling back to arbitrary Baseline-brand org owner: ${owner.email} (org=${baselineOrg.slug})`,
        )
      }
    }
  }
  if (!owner) {
    throw new Error(
      `No owner user found: tried OWNER_ID=${OWNER_ID}, name="Brian Scott", Baseline Martial Arts org owner, and Baseline-brand org owner. Run seed-baseline-owner.ts (production) or seed.ts (local) first.`,
    )
  }

  // If the resolved owner carries a fixture name (e.g. the local
  // `test-entitlement-*` integration owner), correct it to "Brian Scott" so
  // the lineage tree card reads correctly. Idempotent.
  if (owner.name !== "Brian Scott" && (owner.name?.includes("test-entitlement") || !owner.name)) {
    await db.user.update({
      where: { id: owner.id },
      data: { name: "Brian Scott" },
    })
    console.log(`   ✏️  Corrected owner name "${owner.name}" → "Brian Scott" (id=${owner.id})`)
    owner = { ...owner, name: "Brian Scott" }
  }
  console.log(`   Found owner: ${owner.email} (name=${owner.name}, id=${owner.id})`)

  // ---------------------------------------------------------------------
  // 1. Brian's own LineageNode. Owner is a real account → Passport with userId set (SOT-ADR D1).
  // ---------------------------------------------------------------------
  const ownerPassport = await db.passport.upsert({
    where: { userId: owner.id },
    update: {},
    create: { userId: owner.id, displayName: "Brian Scott" },
    select: { id: true },
  })
  const brianNode = await ensureLineageNode(
    ownerPassport.id,
    {
      userKey: "OWNER",
      slug: "brian-scott",
      bio: "Head Instructor — Baseline Martial Arts. BJJ Black Belt under Bob Bass (Rigan Machado lineage), Eskrima 5th Degree Master under GM Steve Wolk, Muay Thai Kru under Sak Va Roon, Karate 4th Degree under Mr. Tim Wolchek, Kajukenbo 1st Degree under Mills/Carter/Ng.",
    },
    counts,
  )

  // ---------------------------------------------------------------------
  // 2. Placeholder users + their LineageNodes.
  // ---------------------------------------------------------------------
  // Map holds Passport ids (SOT-ADR D1): OWNER = the real account's Passport; everyone else an
  // accountless (claimable) Passport.
  const passportIdByKey = new Map<string, string>()
  passportIdByKey.set("OWNER", ownerPassport.id)

  for (const pu of PLACEHOLDER_USERS) {
    const u = await ensureUser(pu, counts)
    passportIdByKey.set(pu.key, u.id)
  }

  const nodeIdByKey = new Map<string, string>()
  nodeIdByKey.set("OWNER", brianNode.id)

  for (const ns of NODE_SEEDS) {
    const userId = passportIdByKey.get(ns.userKey)
    if (!userId) {
      throw new Error(`No User for node seed key=${ns.userKey}`)
    }
    const n = await ensureLineageNode(userId, ns, counts)
    nodeIdByKey.set(ns.userKey, n.id)
  }

  // ---------------------------------------------------------------------
  // 2b. Identity merge corrections (SESSION_0433 / SESSION_0430).
  //     Must run AFTER passportIdByKey + nodeIdByKey are populated and
  //     BEFORE edges (section 3) are created so stale nodes are gone.
  // ---------------------------------------------------------------------

  // C1: Remove stale accountless "Brian Scott" Passport created by old seed
  // versions before SOT-ADR D1 distinguished user-linked from accountless
  // passports. Brian's canonical Passport is user-linked (userId=owner.id).
  // No-op if already cleaned up or on a fresh DB.
  {
    const stalePassport = await db.passport.findFirst({
      where: { displayName: "Brian Scott", userId: null },
      select: { id: true },
    })
    if (stalePassport) {
      const staleNode = await db.lineageNode.findFirst({
        where: { passportId: stalePassport.id },
        select: { id: true },
      })
      if (staleNode) {
        const staleMembers = await db.lineageTreeMember.findMany({
          where: { nodeId: staleNode.id },
          select: { id: true, treeId: true },
        })
        for (const sm of staleMembers) {
          const canonical = await db.lineageTreeMember.findUnique({
            where: { treeId_nodeId: { treeId: sm.treeId, nodeId: brianNode.id } },
            select: { id: true },
          })
          if (canonical) {
            await db.lineageTreeMember.delete({ where: { id: sm.id } })
          } else {
            await db.lineageTreeMember.update({
              where: { id: sm.id },
              data: { nodeId: brianNode.id },
            })
          }
        }
        await db.lineageRelationship.deleteMany({
          where: { OR: [{ fromNodeId: staleNode.id }, { toNodeId: staleNode.id }] },
        })
        await db.lineageNode.delete({ where: { id: staleNode.id } })
      }
      await db.rankAward.deleteMany({ where: { passportId: stalePassport.id } })
      await db.passport.delete({ where: { id: stalePassport.id } })
      console.log("   C1: Deleted stale accountless 'Brian Scott' Passport + node")
    }
  }

  // C2: Remove stale "Chris Posnik" Passport and merge into canonical "poznik"
  // (Christopher Alexander Poznik, BK5). SESSION_0430 prod correction.
  // Tree memberships that referenced chris-posnik are re-pointed to poznik or
  // dropped if poznik already occupies that tree slot. No-op if cleaned up.
  {
    const stalePassport = await db.passport.findFirst({
      where: { displayName: "Chris Posnik", userId: null },
      select: { id: true },
    })
    if (stalePassport) {
      const staleNode = await db.lineageNode.findFirst({
        where: { passportId: stalePassport.id },
        select: { id: true },
      })
      const poznikNodeId = nodeIdByKey.get("poznik")
      if (staleNode) {
        const staleMembers = await db.lineageTreeMember.findMany({
          where: { nodeId: staleNode.id },
          select: { id: true, treeId: true },
        })
        for (const sm of staleMembers) {
          const canonical = poznikNodeId
            ? await db.lineageTreeMember.findUnique({
                where: { treeId_nodeId: { treeId: sm.treeId, nodeId: poznikNodeId } },
                select: { id: true },
              })
            : null
          if (canonical || !poznikNodeId) {
            await db.lineageTreeMember.delete({ where: { id: sm.id } })
          } else {
            await db.lineageTreeMember.update({
              where: { id: sm.id },
              data: { nodeId: poznikNodeId },
            })
          }
        }
        await db.lineageRelationship.deleteMany({
          where: { OR: [{ fromNodeId: staleNode.id }, { toNodeId: staleNode.id }] },
        })
        await db.lineageNode.delete({ where: { id: staleNode.id } })
      }
      await db.rankAward.deleteMany({ where: { passportId: stalePassport.id } })
      await db.passport.delete({ where: { id: stalePassport.id } })
      console.log("   C2: Deleted stale 'Chris Posnik' Passport + node; merged into poznik")
    }
  }

  // ---------------------------------------------------------------------
  // 3. INSTRUCTOR_STUDENT relationships.
  // ---------------------------------------------------------------------
  for (const e of EDGE_SEEDS) {
    const fromNodeId = nodeIdByKey.get(e.fromKey)
    const toNodeId = nodeIdByKey.get(e.toKey)
    if (!fromNodeId || !toNodeId) {
      throw new Error(
        `Missing LineageNode for edge ${e.fromKey} → ${e.toKey} (from=${fromNodeId}, to=${toNodeId})`,
      )
    }
    await ensureLineageRelationship(fromNodeId, toNodeId, e.description, e.isVerified, counts)
  }

  // ---------------------------------------------------------------------
  // 3b. RankAwards (SESSION_0316). Global promotion facts — one per BJJ
  //     figure, linking the awarding promoter. Display reads the highest
  //     awarded RankAward per member (ADR 0035 — awarded truth).
  // ---------------------------------------------------------------------
  // SESSION_0318 data-quality correction: Chris Haueter was previously seeded as a
  // coral belt (CB7). He is a 6th Degree BLACK belt (BK6). Repoint any stale coral
  // award to BK6 instead of deleting — preserves LineageTreeMember/relationship FKs.
  // No-op on a fresh DB (no stale coral award) or after the first corrected run.
  {
    const haueterId = passportIdByKey.get("chris-haueter")
    const bk6 = await db.rank.findFirst({
      where: { shortName: "BK6", rankSystem: { discipline: { code: "bjj" } } },
      select: { id: true },
    })
    if (haueterId && bk6) {
      const staleCoral = await db.rankAward.findFirst({
        where: {
          passportId: haueterId,
          rank: { shortName: { in: ["CB7", "CB8"] }, rankSystem: { discipline: { code: "bjj" } } },
        },
        select: { id: true },
      })
      if (staleCoral) {
        const existingBk6 = await db.rankAward.findFirst({
          where: { passportId: haueterId, rankId: bk6.id },
          select: { id: true },
        })
        if (existingBk6) {
          await db.rankAward.delete({ where: { id: staleCoral.id } })
        } else {
          await db.rankAward.update({ where: { id: staleCoral.id }, data: { rankId: bk6.id } })
        }
        console.log("   Haueter correction: stale coral award repointed to BK6")
      }
    }
  }

  // SESSION_0433 B1: Bill Hosken — repoint stale CB7 award to BK5. SESSION_0430 prod
  // correction (erroneous Coral Belt; correct rank is Black Belt 5th Degree).
  // No-op on a fresh DB (RANK_AWARD_SEEDS below creates BK5 directly).
  {
    const hoskenId = passportIdByKey.get("bill-hosken")
    const bk5 = await db.rank.findFirst({
      where: { shortName: "BK5", rankSystem: { discipline: { code: "bjj" } } },
      select: { id: true },
    })
    if (hoskenId && bk5) {
      const staleCoral = await db.rankAward.findFirst({
        where: {
          passportId: hoskenId,
          rank: { shortName: { in: ["CB7", "CB8"] }, rankSystem: { discipline: { code: "bjj" } } },
        },
        select: { id: true },
      })
      if (staleCoral) {
        const existingBk5 = await db.rankAward.findFirst({
          where: { passportId: hoskenId, rankId: bk5.id },
          select: { id: true },
        })
        if (existingBk5) {
          await db.rankAward.delete({ where: { id: staleCoral.id } })
        } else {
          await db.rankAward.update({ where: { id: staleCoral.id }, data: { rankId: bk5.id } })
        }
        console.log("   Hosken correction: stale coral award repointed to BK5")
      }
    }
  }

  // SESSION_0433 B2: Jerry Smith — delete stale CB7 award. SESSION_0430 prod correction.
  // The correct rank (BK0 base Black Belt) is seeded by RANK_AWARD_SEEDS below. Display is
  // awarded truth (ADR 0035), so deleting the stale higher award is what corrects the shown
  // belt. No-op on a fresh DB.
  {
    const jerryId = passportIdByKey.get("jerry-smith")
    if (jerryId) {
      const staleCoral = await db.rankAward.findFirst({
        where: {
          passportId: jerryId,
          rank: { shortName: { in: ["CB7", "CB8"] }, rankSystem: { discipline: { code: "bjj" } } },
        },
        select: { id: true },
      })
      if (staleCoral) {
        await db.rankAward.delete({ where: { id: staleCoral.id } })
        console.log("   Jerry Smith correction: stale CB7 award deleted")
      }
    }
  }

  const rankAwardIdBySeedKey = new Map<string, string>()
  for (const ra of BJJ_RANK_AWARD_SEEDS) {
    const userId = passportIdByKey.get(ra.userKey)
    if (!userId) {
      console.log(`   ⚠️  No User for RankAward seed key=${ra.userKey} — skipping`)
      continue
    }
    const awardedById = ra.awardedByKey ? (passportIdByKey.get(ra.awardedByKey) ?? null) : null
    if (ra.awardedByKey && !awardedById) {
      console.log(`   ⚠️  Awarding promoter ${ra.awardedByKey} not found for ${ra.userKey}`)
    }
    const awardId = await ensureRankAward(
      userId,
      ra.rankShortName,
      awardedById,
      ra.awardedAt,
      ra.notes,
      ra.location,
      counts,
    )
    if (awardId) {
      if (ra.location) {
        rankAwardIdBySeedKey.set(
          rankAwardSeedKey({
            userKey: ra.userKey,
            rankShortName: ra.rankShortName,
            awardedAt: ra.awardedAt,
            location: ra.location,
          }),
          awardId,
        )
      }
    }
  }

  // ---------------------------------------------------------------------
  // 3c. PromotionEvents (SESSION_0319). Global ceremony rows group awards
  //     and seed shared gallery media; per-tree cohort boxes link below.
  // ---------------------------------------------------------------------
  const promotionEventIdByKey = await ensurePromotionEvents({
    rankAwardIdBySeedKey,
    uploadedById: owner.id,
  })

  // ---------------------------------------------------------------------
  // 4. Per-discipline LineageTree + LineageTreeMember rows.
  //    Each tree is published + public so /lineage renders them.
  // ---------------------------------------------------------------------

  type TreeSeed = {
    brands?: SeedBrand[]
    slug: string
    name: string
    disciplineCode: string
    /** Node keys to include as members (order = visualSortOrder). */
    memberKeys: string[]
    /** Visual parent mapping: childKey → parentKey. */
    parentMap: Record<string, string>
    /** Per-member claimable override: member key → isClaimable. */
    isClaimable?: Record<string, boolean>
  }

  const TREE_SEEDS: TreeSeed[] = [
    {
      brands: [BRAND, "BBL"],
      slug: "rigan-machado-bjj-lineage",
      name: "Rigan Machado BJJ Lineage",
      disciplineCode: "bjj",
      // @updated SESSION_0433 — chris-posnik removed, poznik + rikki-rockett added (SESSION_0430 B3/C2).
      memberKeys: [
        "carlos-gracie-sr",
        "rorion-gracie", // SESSION_0385: secondary instructor of rigan (Red Belt promotion 2026)
        "carlos-gracie-jr",
        "rigan-machado",
        "bob-bass",
        "rick-williams",
        "erik-paulson",
        "casey-olsen",
        "rick-minter",
        "poznik", // SESSION_0433: Christopher Alexander Poznik (BK5), replaces chris-posnik
        "renato-magno",
        "rikki-rockett", // SESSION_0433: Rikki Rockett (BK4, under Renato Magno)
        "david-meyer",
        "chris-haueter",
        "john-will",
        "bill-hosken",
        "jerry-smith",
        "brian-truelson",
        "tim-wolchek", // SESSION_0385: Brian's secondary BJJ instructor (also Karate)
        "OWNER",
      ],
      parentMap: {
        "rorion-gracie": "carlos-gracie-sr", // sibling branch to carlos-jr
        "carlos-gracie-jr": "carlos-gracie-sr",
        "rigan-machado": "carlos-gracie-jr",
        "bob-bass": "rigan-machado",
        "rick-williams": "rigan-machado",
        "erik-paulson": "rigan-machado",
        "casey-olsen": "rigan-machado",
        "rick-minter": "rigan-machado",
        poznik: "rigan-machado",
        "renato-magno": "rigan-machado",
        "rikki-rockett": "renato-magno",
        "david-meyer": "rigan-machado",
        "chris-haueter": "rigan-machado",
        "john-will": "rigan-machado",
        "bill-hosken": "rigan-machado",
        "jerry-smith": "rigan-machado",
        "brian-truelson": "bill-hosken",
        OWNER: "bob-bass",
        // tim-wolchek: intentionally omitted — null parent (independent root-level instructor)
      },
      // SESSION_0316: Carlos Sr & Jr are historical roots — not claimable.
      // Everyone else (Rigan, the Dozen, Truelson, OWNER) is claimable.
      // SESSION_0385: rorion-gracie and tim-wolchek added as claimable real persons.
      // SESSION_0433: chris-posnik removed; poznik + rikki-rockett added as claimable.
      isClaimable: {
        "carlos-gracie-sr": false,
        "carlos-gracie-jr": false,
        "rorion-gracie": true,
        // The founder roots (Carlos Sr → Carlos Jr → Rigan) are NOT claimable — the untouchable
        // top of the lineage (operator, SESSION_0522). Rigan flipped true→false here.
        "rigan-machado": false,
        "bob-bass": true,
        "rick-williams": true,
        "erik-paulson": true,
        "casey-olsen": true,
        "rick-minter": true,
        poznik: true,
        "renato-magno": true,
        "rikki-rockett": true,
        "david-meyer": true,
        "chris-haueter": true,
        "john-will": true,
        "bill-hosken": true,
        "jerry-smith": true,
        "brian-truelson": true,
        "tim-wolchek": true,
        OWNER: true,
      },
    },
    {
      slug: "doce-pares-eskrima-lineage",
      name: "Doce Pares Eskrima Lineage",
      disciplineCode: "eskrima",
      memberKeys: ["steve-wolk", "OWNER"],
      parentMap: { OWNER: "steve-wolk" },
    },
    {
      slug: "muay-thai-lineage",
      name: "Muay Thai Lineage",
      disciplineCode: "muay-thai",
      memberKeys: ["sak-va-roon", "OWNER"],
      parentMap: { OWNER: "sak-va-roon" },
    },
    {
      slug: "kajukenbo-lineage",
      name: "Kajukenbo Lineage",
      disciplineCode: "kajukenbo",
      memberKeys: ["tim-mills", "sam-carter", "hanyann-ng", "OWNER"],
      parentMap: { OWNER: "tim-mills" }, // primary visual parent
    },
    {
      slug: "karate-lineage",
      name: "American Freestyle Karate Lineage",
      disciplineCode: "karate",
      memberKeys: ["tim-wolchek", "OWNER"],
      parentMap: { OWNER: "tim-wolchek" },
    },
  ]

  let treesCreated = 0
  let treesFound = 0
  let treeMembersCreated = 0
  let treeMembersFound = 0

  for (const ts of TREE_SEEDS) {
    // Resolve discipline
    const disc = await db.discipline.findFirst({
      where: { code: ts.disciplineCode },
      select: { id: true },
    })
    if (!disc) {
      console.log(`   ⚠️  Discipline ${ts.disciplineCode} not found — skipping tree ${ts.slug}`)
      continue
    }

    const targetBrands = ts.brands ?? [BRAND]

    for (const treeBrand of targetBrands) {
      // Upsert tree
      let tree = await db.lineageTree.findUnique({
        where: { brand_slug: { brand: treeBrand, slug: ts.slug } },
        select: { id: true },
      })
      if (tree) {
        treesFound++
        console.log(`   LineageTree ${treeBrand}/${ts.slug}: already exists (id=${tree.id})`)
      } else {
        tree = await db.lineageTree.create({
          data: {
            brand: treeBrand,
            slug: ts.slug,
            name: ts.name,
            description: `${ts.name} — promotion lineage tree.`,
            visibility: "PUBLIC",
            isPublished: true,
            disciplineId: disc.id,
          },
          select: { id: true },
        })
        treesCreated++
        console.log(`   ✅ Created LineageTree: ${treeBrand}/${ts.slug} (id=${tree.id})`)
      }

      // Create LineageTreeMember rows with visual parent chain
      const treeMemberIdByKey = new Map<string, string>()

      for (let i = 0; i < ts.memberKeys.length; i++) {
        const key = ts.memberKeys[i]
        const nodeId = nodeIdByKey.get(key)
        if (!nodeId) {
          console.log(`   ⚠️  No LineageNode for key=${key} — skipping tree member`)
          continue
        }

        const isClaimable = ts.isClaimable?.[key]
        const parentKey = ts.parentMap[key]
        const parentMemberId = parentKey ? (treeMemberIdByKey.get(parentKey) ?? null) : null

        const member = await db.lineageTreeMember.findUnique({
          where: { treeId_nodeId: { treeId: tree.id, nodeId } },
          select: {
            id: true,
            visualSortOrder: true,
            primaryVisualParentMemberId: true,
            isClaimable: true,
          },
        })
        if (member) {
          let treeMember = member
          const updateData: {
            visualSortOrder?: number
            primaryVisualParentMemberId?: string | null
            isClaimable?: boolean
          } = {}
          if (member.visualSortOrder !== i) {
            updateData.visualSortOrder = i
          }
          if (member.primaryVisualParentMemberId !== parentMemberId) {
            updateData.primaryVisualParentMemberId = parentMemberId
          }
          if (isClaimable !== undefined && member.isClaimable !== isClaimable) {
            updateData.isClaimable = isClaimable
          }
          if (Object.keys(updateData).length > 0) {
            treeMember = await db.lineageTreeMember.update({
              where: { id: member.id },
              data: updateData,
              select: {
                id: true,
                visualSortOrder: true,
                primaryVisualParentMemberId: true,
                isClaimable: true,
              },
            })
            counts.treeMembersUpdated++
            console.log(
              `   LineageTreeMember ${treeBrand}/${ts.slug}/${key}: exists, updated (${Object.keys(updateData).join(", ")})`,
            )
          }
          treeMembersFound++
          treeMemberIdByKey.set(key, treeMember.id)
          continue
        }

        const createdMember = await db.lineageTreeMember.create({
          data: {
            treeId: tree.id,
            nodeId,
            visualSortOrder: i,
            primaryVisualParentMemberId: parentMemberId,
            ...(isClaimable !== undefined ? { isClaimable } : {}),
          },
          select: {
            id: true,
            visualSortOrder: true,
            primaryVisualParentMemberId: true,
            isClaimable: true,
          },
        })
        treeMemberIdByKey.set(key, createdMember.id)
        treeMembersCreated++
      }

      // -------------------------------------------------------------------
      // 4b. Dirty Dozen cohort visual group (rigan tree only). SESSION_0316.
      //     4c. Ceremony cohort groups linked to PromotionEvents
      //     (rigan tree only). SESSION_0318/0319.
      // -------------------------------------------------------------------
      if (ts.slug === "rigan-machado-bjj-lineage") {
        await ensureDirtyDozenGroup(tree.id, treeMemberIdByKey)
        for (const eventSeed of PROMOTION_EVENTS) {
          const promotionEventId = promotionEventIdByKey.get(eventSeed.key)
          if (promotionEventId) {
            await ensureCeremonyCohortGroup(eventSeed, tree.id, treeMemberIdByKey, promotionEventId)
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------
  console.log("\n📊 seed-baseline-lineage summary:")
  console.log(`   Users:          created=${counts.usersCreated}, found=${counts.usersFound}`)
  console.log(`   LineageNodes:   created=${counts.nodesCreated}, found=${counts.nodesFound}`)
  console.log(`   Relationships:  created=${counts.edgesCreated}, found=${counts.edgesFound}`)
  console.log(
    `   RankAwards:     created=${counts.rankAwardsCreated}, found=${counts.rankAwardsFound}`,
  )
  console.log(`   LineageTrees:   created=${treesCreated}, found=${treesFound}`)
  console.log(
    `   TreeMembers:    created=${treeMembersCreated}, found=${treeMembersFound}, updated=${counts.treeMembersUpdated}`,
  )
  console.log("\n🎉 seed-baseline-lineage.ts complete.\n")
}

main()
  .catch(error => {
    console.error("❌ Error in seed-baseline-lineage:", error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
