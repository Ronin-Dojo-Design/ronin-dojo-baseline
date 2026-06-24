import { z } from "zod"

const joinLegacyRoles = ["STUDENT", "BLACK_BELT", "INSTRUCTOR", "SCHOOL_OWNER", "OTHER"] as const
const joinLegacyMembershipPaths = ["FREE", "PREMIUM", "ELITE"] as const
const joinLegacyGoals = [
  "CLAIM_PROFILE",
  "PRESERVE_LINEAGE",
  "PROMOTE_SCHOOL",
  "CONNECT_COMMUNITY",
  "EXPLORE",
] as const
const joinLegacyDiscoverySources = [
  "INSTAGRAM",
  "FACEBOOK",
  "GOOGLE",
  "FRIEND",
  "INSTRUCTOR",
  "EVENT",
  "OTHER",
] as const

const httpUrlSchema = z
  .string()
  .trim()
  .url("Use a valid http or https URL")
  .refine(
    value => {
      // new URL() THROWS on invalid/empty input — an uncaught throw here escapes the
      // refine and aborts the whole form validation, which is the "Continue" no-op
      // bug. Empty values are handled by the `.or(z.literal(""))` branch; here we
      // just fail closed instead of throwing.
      try {
        return ["http:", "https:"].includes(new URL(value).protocol)
      } catch {
        return false
      }
    },
    { message: "Use a valid http or https URL" },
  )

const optionalTrimmedString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""))

export const joinLegacyFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(120),
  lastName: optionalTrimmedString(120),
  preferredName: optionalTrimmedString(120),
  email: z.string().trim().email("Valid email is required"),
  phoneE164: optionalTrimmedString(32),
  currentRank: optionalTrimmedString(200),
  // Creatable-combobox refs (SESSION_0441): a registered pick persists the *Id; a
  // custom entry leaves it empty and only the text label above survives. The steward
  // review surface reads the ref when present, else the text.
  currentRankId: optionalTrimmedString(64),
  role: z.enum(joinLegacyRoles),
  schoolName: optionalTrimmedString(160),
  schoolOrgId: optionalTrimmedString(64),
  location: optionalTrimmedString(160),
  trainedUnder: optionalTrimmedString(500),
  trainedUnderNodeId: optionalTrimmedString(64),
  represent: optionalTrimmedString(500),
  representTreeId: optionalTrimmedString(64),
  evidenceUrl: httpUrlSchema.optional().or(z.literal("")),
  bio: optionalTrimmedString(2000),
  profileUrl: httpUrlSchema.optional().or(z.literal("")),
  instagramUrl: httpUrlSchema.optional().or(z.literal("")),
  martialArtsExperience: optionalTrimmedString(1200),
  primaryGoal: z.enum(joinLegacyGoals),
  discoverySource: z.enum(joinLegacyDiscoverySources),
  discoverySourceOther: optionalTrimmedString(160),
  shareConsent: z.boolean().refine(Boolean, "Confirm that reviewers may use this private intake."),
  membershipPath: z.enum(joinLegacyMembershipPaths),
  treeId: z.string().optional(),
  nodeId: z.string().optional(),
})

export type JoinLegacyFormValues = z.infer<typeof joinLegacyFormSchema>

export const STEP_FIELDS: ReadonlyArray<ReadonlyArray<keyof JoinLegacyFormValues>> = [
  ["membershipPath", "primaryGoal"],
  [
    "firstName",
    "lastName",
    "preferredName",
    "email",
    "phoneE164",
    "role",
    "location",
    "discoverySource",
    "discoverySourceOther",
  ],
  [
    "currentRank",
    "schoolName",
    "trainedUnder",
    "represent",
    "profileUrl",
    "instagramUrl",
    "evidenceUrl",
    "martialArtsExperience",
    "bio",
    "shareConsent",
  ],
]
