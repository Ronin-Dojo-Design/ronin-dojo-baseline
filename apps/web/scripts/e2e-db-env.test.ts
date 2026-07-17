// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import {
  assertLiteralLocalE2eUrl,
  assertLiteralLocalE2eUrls,
  e2ePrismaChildEnv,
} from "./e2e-db-env"

const LOCAL_E2E = "postgresql://local@localhost:5432/ronindojo_e2e"
const CI_TEST = "postgresql://ci@localhost:5432/ronindojo_test"

describe("local e2e database target guard", () => {
  it("accepts postgres/postgresql URLs on the explicit loopback hosts", () => {
    for (const target of [
      LOCAL_E2E,
      "postgres://local@127.0.0.1:5432/ronindojo_e2e",
      "postgresql://local@[::1]:5432/ronindojo_e2e",
    ]) {
      expect(() => assertLiteralLocalE2eUrl(target, "DATABASE_URL", { isCi: false })).not.toThrow()
    }
  })

  it("allows the exact local test database only when CI is explicit", () => {
    expect(() => assertLiteralLocalE2eUrl(CI_TEST, "DATABASE_URL", { isCi: true })).not.toThrow()
    expect(() => assertLiteralLocalE2eUrl(CI_TEST, "DATABASE_URL", { isCi: false })).toThrow(
      'expected "ronindojo_e2e"',
    )
  })

  it("refuses non-Postgres protocols and non-loopback hosts", () => {
    for (const target of [
      "https://localhost:5432/ronindojo_e2e",
      "file://localhost/ronindojo_e2e",
      "postgresql://local@db.example.test:5432/ronindojo_e2e",
      "postgresql://local@localhost.example.test:5432/ronindojo_e2e",
      "postgresql://local@127.0.0.2:5432/ronindojo_e2e",
    ]) {
      expect(() => assertLiteralLocalE2eUrl(target, "DATABASE_URL", { isCi: false })).toThrow(
        /Refusing/,
      )
    }
  })

  it("refuses query parameters that override the parsed endpoint", () => {
    for (const suffix of ["?host=db.example.test", "?port=6543"]) {
      expect(() =>
        assertLiteralLocalE2eUrl(`${LOCAL_E2E}${suffix}`, "DATABASE_URL", { isCi: false }),
      ).toThrow("endpoint overrides")
    }
  })

  it("refuses database names that merely contain the e2e token", () => {
    for (const dbName of ["ronindojo_prodsnap_e2e_backup", "ronindojo_e2e_copy", "e2e"]) {
      expect(() =>
        assertLiteralLocalE2eUrl(`postgresql://local@localhost:5432/${dbName}`, "DATABASE_URL", {
          isCi: false,
        }),
      ).toThrow('expected "ronindojo_e2e"')
    }
  })

  it("requires both URLs and their normalized host, port, and database to match", () => {
    expect(() => assertLiteralLocalE2eUrls(LOCAL_E2E, undefined, { isCi: false })).toThrow(
      "DIRECT_URL is required",
    )

    // URL host casing and the omitted default port normalize to the same endpoint.
    expect(() =>
      assertLiteralLocalE2eUrls("postgresql://local@LOCALHOST/ronindojo_e2e", LOCAL_E2E, {
        isCi: false,
      }),
    ).not.toThrow()

    for (const directUrl of [
      "postgresql://local@127.0.0.1:5432/ronindojo_e2e",
      "postgresql://local@localhost:6543/ronindojo_e2e",
      CI_TEST,
    ]) {
      expect(() => assertLiteralLocalE2eUrls(LOCAL_E2E, directUrl, { isCi: true })).toThrow(
        /divergent|non-e2e/,
      )
    }
  })

  it("overrides a stale DIRECT_URL only after validating the local endpoint", () => {
    expect(
      e2ePrismaChildEnv(
        {
          NODE_ENV: "test",
          DIRECT_URL: "postgresql://local@localhost:5432/ronindojo_prodsnap",
        },
        LOCAL_E2E,
        { isCi: false },
      ),
    ).toMatchObject({ NODE_ENV: "test", DATABASE_URL: LOCAL_E2E, DIRECT_URL: LOCAL_E2E })

    expect(() =>
      e2ePrismaChildEnv({}, "postgresql://local@db.example.test:5432/ronindojo_e2e", {
        isCi: false,
      }),
    ).toThrow("Refusing non-loopback Prisma host")
  })
})
