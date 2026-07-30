// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  MEMBER_SETTINGS_DEFAULTS,
  memberSettingsSchema,
  normalizeMemberSettings,
} from "~/server/web/settings/member-settings"

/**
 * Pure unit tests for the member-settings domain core. No DB, no email/Resend seam — the
 * normalize/merge logic touches neither, so these stay fast and side-effect-free.
 */
describe("normalizeMemberSettings", () => {
  it("resolves null (un-provisioned column) to BBLApp parity defaults", () => {
    expect(normalizeMemberSettings(null)).toEqual(MEMBER_SETTINGS_DEFAULTS)
  })

  it("resolves malformed JSON to defaults without throwing", () => {
    expect(normalizeMemberSettings("not-an-object")).toEqual(MEMBER_SETTINGS_DEFAULTS)
    expect(normalizeMemberSettings(42)).toEqual(MEMBER_SETTINGS_DEFAULTS)
  })

  it("layers a partial blob over defaults (missing keys keep their default)", () => {
    const result = normalizeMemberSettings({
      profile: { directory: false },
      readiness: { primaryCoach: "Professor Ribeiro" },
    })

    expect(result.profile.directory).toBe(false)
    // Untouched profile keys fall back to defaults.
    expect(result.profile.contact).toBe(MEMBER_SETTINGS_DEFAULTS.profile.contact)
    expect(result.profile.lineage).toBe(MEMBER_SETTINGS_DEFAULTS.profile.lineage)
    expect(result.readiness.primaryCoach).toBe("Professor Ribeiro")
    expect(result.readiness.primaryDivision).toBe("")
    // Whole untouched groups are defaults.
    expect(result.notifications).toEqual(MEMBER_SETTINGS_DEFAULTS.notifications)
    expect(result.security).toEqual(MEMBER_SETTINGS_DEFAULTS.security)
  })

  it("strips unknown keys", () => {
    const result = normalizeMemberSettings({
      profile: { directory: true, bogus: "x" },
      extraneous: true,
    })

    expect(result).toEqual({
      ...MEMBER_SETTINGS_DEFAULTS,
      profile: { ...MEMBER_SETTINGS_DEFAULTS.profile, directory: true },
    })
    expect(result).not.toHaveProperty("extraneous")
    expect(result.profile).not.toHaveProperty("bogus")
  })

  it("round-trips a fully-specified settings object", () => {
    const full = {
      profile: { directory: false, contact: true, lineage: false },
      notifications: { approvals: false, events: false, posts: true },
      security: { sessions: true, recovery: false },
      readiness: { primaryDivision: "Adult / Blue", primaryCoach: "Coach Lee" },
    }

    expect(memberSettingsSchema.parse(full)).toEqual(full)
    expect(normalizeMemberSettings(full)).toEqual(full)
  })
})

describe("memberSettingsSchema", () => {
  it("rejects readiness text past the 120-char cap", () => {
    const result = memberSettingsSchema.safeParse({
      ...MEMBER_SETTINGS_DEFAULTS,
      readiness: { primaryDivision: "x".repeat(121), primaryCoach: "" },
    })

    expect(result.success).toBe(false)
  })

  it("rejects a non-boolean toggle", () => {
    const result = memberSettingsSchema.safeParse({
      ...MEMBER_SETTINGS_DEFAULTS,
      profile: { directory: "yes", contact: false, lineage: true },
    })

    expect(result.success).toBe(false)
  })
})
