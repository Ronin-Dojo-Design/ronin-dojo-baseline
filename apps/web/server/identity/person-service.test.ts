// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { db } from "~/services/db"
import {
  attachAccount,
  ClaimantHasPassportError,
  createPassport,
  derivePersonName,
} from "~/server/identity/person-service"

type IdentityClient = typeof db

/**
 * A minimal fake of the Prisma `passport` delegate the identity service uses. No real DB, no email
 * seam — the service touches neither, so these stay pure unit tests (heeds the open Resend finding).
 */
function makeFakeClient(opts: { findUniqueResult?: { id: string } | null } = {}) {
  const calls = {
    create: [] as unknown[],
    update: [] as unknown[],
    findUnique: [] as unknown[],
  }

  const client = {
    passport: {
      create: async (args: { data: { displayName?: string } }) => {
        calls.create.push(args)
        return { id: "passport_created" }
      },
      update: async (args: { where: { id: string }; data: { userId: string } }) => {
        calls.update.push(args)
        return { id: args.where.id, userId: args.data.userId }
      },
      findUnique: async (args: unknown) => {
        calls.findUnique.push(args)
        return opts.findUniqueResult ?? null
      },
    },
  }

  return { client: client as unknown as IdentityClient, calls }
}

describe("derivePersonName", () => {
  it("prefers a trimmed displayName when present", () => {
    expect(derivePersonName({ displayName: "  Rigan Machado  ", legalFirstName: "Carlos" })).toBe(
      "Rigan Machado",
    )
  })

  it("falls back to legal first + last name", () => {
    expect(derivePersonName({ legalFirstName: "Carlos", legalLastName: "Machado" })).toBe(
      "Carlos Machado",
    )
  })

  it("uses first name alone when last name is missing", () => {
    expect(derivePersonName({ legalFirstName: "Helio" })).toBe("Helio")
  })

  it("trims and collapses whitespace-only name parts", () => {
    expect(derivePersonName({ legalFirstName: "  ", legalLastName: "Gracie" })).toBe("Gracie")
  })

  it("returns the stable fallback when nothing is provided", () => {
    expect(derivePersonName({})).toBe("Unnamed Member")
    expect(derivePersonName({ displayName: "   " })).toBe("Unnamed Member")
  })
})

describe("createPassport", () => {
  it("mints an accountless Passport (no userId) with a derived displayName", async () => {
    const { client, calls } = makeFakeClient()

    const result = await createPassport(
      { legalFirstName: "Jean Jacques", legalLastName: "Machado" },
      client,
    )

    expect(result).toEqual({ id: "passport_created" })
    expect(calls.create).toHaveLength(1)
    const args = calls.create[0] as { data: Record<string, unknown> }
    expect(args.data.displayName).toBe("Jean Jacques Machado")
    expect(args.data.legalFirstName).toBe("Jean Jacques")
    // Accountless: userId must never be set by createPassport.
    expect("userId" in args.data).toBe(false)
  })

  it("honors an explicit displayName over legal names", async () => {
    const { client, calls } = makeFakeClient()
    await createPassport(
      { displayName: "Master Rigan", legalFirstName: "Carlos", legalLastName: "Machado" },
      client,
    )
    const args = calls.create[0] as { data: Record<string, unknown> }
    expect(args.data.displayName).toBe("Master Rigan")
  })

  it("rejects input with no name source", async () => {
    const { client } = makeFakeClient()
    await expect(createPassport({ bio: "no name here" }, client)).rejects.toThrow()
  })
})

describe("attachAccount", () => {
  it("attaches the account when the user is not yet on any Passport", async () => {
    const { client, calls } = makeFakeClient({ findUniqueResult: null })

    const result = await attachAccount({ passportId: "passport_1", userId: "user_1" }, client)

    expect(result).toEqual({ id: "passport_1", userId: "user_1" })
    expect(calls.update).toHaveLength(1)
  })

  it("is idempotent when the user is already on the same Passport", async () => {
    const { client, calls } = makeFakeClient({ findUniqueResult: { id: "passport_1" } })

    const result = await attachAccount({ passportId: "passport_1", userId: "user_1" }, client)

    expect(result).toEqual({ id: "passport_1", userId: "user_1" })
    expect(calls.update).toHaveLength(1)
  })

  it("throws CLAIMANT_HAS_PASSPORT when the user is on a different Passport", async () => {
    const { client, calls } = makeFakeClient({ findUniqueResult: { id: "passport_other" } })

    await expect(
      attachAccount({ passportId: "passport_1", userId: "user_1" }, client),
    ).rejects.toBeInstanceOf(ClaimantHasPassportError)
    expect(calls.update).toHaveLength(0)

    try {
      await attachAccount({ passportId: "passport_1", userId: "user_1" }, client)
    } catch (error) {
      expect((error as ClaimantHasPassportError).code).toBe("CLAIMANT_HAS_PASSPORT")
      expect((error as ClaimantHasPassportError).existingPassportId).toBe("passport_other")
    }
  })
})
