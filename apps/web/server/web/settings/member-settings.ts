import { z } from "zod"

/**
 * Member Settings — the shape persisted to `Passport.memberPreferences` (a single additive
 * JSON column on the identity SoT). Mirrors BBLApp's `BBLSettingsPage` sections: privacy /
 * directory visibility, notification opt-ins, security alerts, and the readiness snapshot.
 *
 * Stored as one typed blob rather than a dozen scattered preference columns. `null` (an
 * un-provisioned column, or a Passport that predates the feature) resolves to all defaults.
 */
export const memberSettingsSchema = z.object({
  profile: z.object({
    /** Show my profile in the member directory. */
    directory: z.boolean(),
    /** Allow instructors to view contact details. */
    contact: z.boolean(),
    /** Display belt lineage on my profile. */
    lineage: z.boolean(),
  }),
  notifications: z.object({
    /** Invite approvals and roster updates. */
    approvals: z.boolean(),
    /** Event and tournament announcements. */
    events: z.boolean(),
    /** Posts and techniques from my lineage. */
    posts: z.boolean(),
  }),
  security: z.object({
    /** Email me new login activity. */
    sessions: z.boolean(),
    /** Enable recovery alerts. */
    recovery: z.boolean(),
  }),
  readiness: z.object({
    /** Primary competition division. */
    primaryDivision: z.string().max(120),
    /** Primary coach for event registration / routing. */
    primaryCoach: z.string().max(120),
  }),
})

export type MemberSettings = z.infer<typeof memberSettingsSchema>

/** BBLApp `SECTIONS` parity — the `defaultChecked` values verbatim; text inputs start empty. */
export const MEMBER_SETTINGS_DEFAULTS: MemberSettings = {
  profile: {
    directory: true,
    contact: false,
    lineage: true,
  },
  notifications: {
    approvals: true,
    events: true,
    posts: false,
  },
  security: {
    sessions: false,
    recovery: true,
  },
  readiness: {
    primaryDivision: "",
    primaryCoach: "",
  },
}

/**
 * A tolerant view of the stored blob: every group/field is optional so a partial or
 * legacy JSON payload still parses. Unknown keys are stripped; missing keys fall back
 * to {@link MEMBER_SETTINGS_DEFAULTS} in {@link normalizeMemberSettings}.
 */
const partialMemberSettingsSchema = z
  .object({
    profile: memberSettingsSchema.shape.profile.partial(),
    notifications: memberSettingsSchema.shape.notifications.partial(),
    security: memberSettingsSchema.shape.security.partial(),
    readiness: memberSettingsSchema.shape.readiness.partial(),
  })
  .partial()

/**
 * Resolve the persisted `Passport.memberPreferences` JSON (which may be `null`, partial, or
 * malformed) into a fully-populated {@link MemberSettings}, layering each field over the
 * defaults. Pure + total — never throws, so the page always renders a stable form.
 */
export function normalizeMemberSettings(raw: unknown): MemberSettings {
  const parsed = partialMemberSettingsSchema.safeParse(raw)
  const value = parsed.success ? parsed.data : {}

  return {
    profile: { ...MEMBER_SETTINGS_DEFAULTS.profile, ...value.profile },
    notifications: { ...MEMBER_SETTINGS_DEFAULTS.notifications, ...value.notifications },
    security: { ...MEMBER_SETTINGS_DEFAULTS.security, ...value.security },
    readiness: { ...MEMBER_SETTINGS_DEFAULTS.readiness, ...value.readiness },
  }
}
