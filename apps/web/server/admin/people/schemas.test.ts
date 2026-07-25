/**
 * Admin Passport schemas — consent-field omission (SESSION_0705, PR #339 Doug P2).
 *
 * `Passport.allowSocialCelebration` (fork F2) is the member's affirmative publicity opt-in:
 * consent must come from the MEMBER, so ONLY the self-serve owner path may write it. The
 * admin schemas `.omit()` the field, and the admin actions write their parsed input verbatim
 * by arbitrary `passportId` — so this schema-level strip is the whole defense against an
 * admin manufacturing consent. These tests pin it: a crafted admin submit carrying the field
 * parses SUCCESSFULLY but the field is GONE from the output (and from the schema shape), and
 * the owner schema still carries it.
 *
 * Run: cd apps/web && bun run test (never a bare multi-file `bun test` — FS-0027)
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  updatePassportAndProfileAsAdminSchema,
  updatePassportAsAdminSchema,
} from "~/server/admin/people/schemas"
import {
  splitPassportAndProfileInput,
  updatePassportAndProfileSchema,
  updatePassportSchema,
} from "~/server/web/passport/schemas"

/** A crafted admin submit trying to flip another member's consent bit ON. */
const craftedAdminSubmit = {
  passportId: "p-target",
  displayName: "Jane Doe",
  allowSocialCelebration: true,
}

describe("admin Passport schemas CANNOT write allowSocialCelebration (manufactured-consent guard)", () => {
  it("updatePassportAsAdminSchema strips the field from a crafted submit", () => {
    const parsed = updatePassportAsAdminSchema.parse(craftedAdminSubmit)
    expect("allowSocialCelebration" in parsed).toBe(false)
    // The rest of the submit still parses — the strip is surgical, not a rejection.
    expect(parsed).toMatchObject({ passportId: "p-target", displayName: "Jane Doe" })
  })

  it("updatePassportAndProfileAsAdminSchema (the editor's ONE-Save admin payload) strips it too", () => {
    const parsed = updatePassportAndProfileAsAdminSchema.parse(craftedAdminSubmit)
    expect("allowSocialCelebration" in parsed).toBe(false)
  })

  it("the field is absent from BOTH admin schema shapes (type-level proof, checked at runtime)", () => {
    expect("allowSocialCelebration" in updatePassportAsAdminSchema.shape).toBe(false)
    expect("allowSocialCelebration" in updatePassportAndProfileAsAdminSchema.shape).toBe(false)
  })

  it("belt & braces: the combined-action split routes NOTHING for the field from an admin parse", () => {
    // The admin combined action strips `passportId` then splits — even if a future refactor
    // re-widened the schema, only keys PRESENT on the parsed input are copied to the
    // Passport half. With the omit in place, the field never arrives.
    const { passportId: _passportId, ...data } =
      updatePassportAndProfileAsAdminSchema.parse(craftedAdminSubmit)
    const { passport } = splitPassportAndProfileInput(data)
    expect("allowSocialCelebration" in passport).toBe(false)
  })
})

describe("the self-serve owner path is UNCHANGED — the member can still consent", () => {
  it("updatePassportSchema (owner) carries the field through", () => {
    const parsed = updatePassportSchema.parse({ allowSocialCelebration: true })
    expect(parsed.allowSocialCelebration).toBe(true)
  })

  it("updatePassportAndProfileSchema (the owner ONE-Save payload) carries it through, and absent stays absent", () => {
    expect(
      updatePassportAndProfileSchema.parse({ allowSocialCelebration: false })
        .allowSocialCelebration,
    ).toBe(false)
    // Absent field must SURVIVE as undefined (Prisma partial-update skip semantics).
    expect(updatePassportAndProfileSchema.parse({}).allowSocialCelebration).toBeUndefined()
  })
})
