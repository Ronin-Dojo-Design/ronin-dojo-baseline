// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import { assertLiteralLocalE2eUrls, e2ePrismaChildEnv } from "./e2e-db-env"

describe("e2ePrismaChildEnv", () => {
  it("overrides a stale prodsnap DIRECT_URL with the validated e2e URL", () => {
    const e2e = "postgresql://local@localhost:5432/ronindojo_e2e"
    expect(
      e2ePrismaChildEnv(
        {
          NODE_ENV: "test",
          DIRECT_URL: "postgresql://local@localhost:5432/ronindojo_prodsnap",
        },
        e2e,
      ),
    ).toMatchObject({ NODE_ENV: "test", DATABASE_URL: e2e, DIRECT_URL: e2e })
  })

  it("refuses a non-e2e database", () => {
    expect(() =>
      e2ePrismaChildEnv({}, "postgresql://local@localhost:5432/ronindojo_prodsnap"),
    ).toThrow("Refusing non-e2e Prisma target")
  })

  it("refuses database names that merely contain the e2e token", () => {
    for (const dbName of ["ronindojo_prodsnap_e2e_backup", "ronindojo_e2e_copy", "e2e"]) {
      expect(() => e2ePrismaChildEnv({}, `postgresql://local@localhost:5432/${dbName}`)).toThrow(
        'expected "ronindojo_e2e"',
      )
    }
  })

  it("requires both local Prisma URLs to name the literal e2e database", () => {
    const e2e = "postgresql://local@localhost:5432/ronindojo_e2e"
    expect(() => assertLiteralLocalE2eUrls(e2e, undefined)).toThrow("DIRECT_URL is required")
    expect(() =>
      assertLiteralLocalE2eUrls(
        e2e,
        "postgresql://local@localhost:5432/ronindojo_prodsnap_e2e_backup",
      ),
    ).toThrow('expected "ronindojo_e2e"')
    expect(() => assertLiteralLocalE2eUrls(e2e, e2e)).not.toThrow()
  })
})
