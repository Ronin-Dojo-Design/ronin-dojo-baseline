// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import { assertSafeSeedTarget } from "./seed-target-guard"

describe("assertSafeSeedTarget", () => {
  it("accepts the documented local e2e, dev, and named scratch targets", () => {
    for (const target of [
      "postgresql://local@localhost:5432/ronindojo_e2e",
      "postgres://local@127.0.0.1/ronindojo_e2e",
      "postgresql://local@[::1]:5432/ronindojo_e2e",
      "postgresql://local@localhost:5432/ronindojo_dev",
      "postgresql://local@localhost:5432/ronindojo_schema_scratch",
    ]) {
      expect(() => assertSafeSeedTarget(target, { isCi: false })).not.toThrow()
    }
  })

  it("accepts the exact local test target only in explicit CI mode", () => {
    const testTarget = "postgresql://ci@localhost:5432/ronindojo_test"
    expect(() => assertSafeSeedTarget(testTarget, { isCi: true })).not.toThrow()
    expect(() => assertSafeSeedTarget(testTarget, { isCi: false })).toThrow(
      "Expected exact local ronindojo_e2e, ronindojo_dev, or ronindojo_*scratch*",
    )
  })

  it("refuses protected databases and e2e/scratch lookalikes", () => {
    for (const dbName of [
      "ronindojo_prodsnap",
      "neondb",
      "ronindojo_prodsnap_e2e_backup",
      "ronindojo_e2e_copy",
      "other_schema_scratch",
    ]) {
      expect(() =>
        assertSafeSeedTarget(`postgresql://local@localhost:5432/${dbName}`, { isCi: false }),
      ).toThrow("Refusing to seed")
    }
  })

  it("refuses remote/spoofed hosts, endpoint overrides, invalid protocols, and missing URLs", () => {
    for (const target of [
      "postgresql://local@db.example.test:5432/ronindojo_e2e",
      "postgresql://local@localhost.example.test:5432/ronindojo_e2e",
      "postgresql://local@localhost:5432/ronindojo_e2e?host=db.example.test",
      "postgresql://local@localhost:5432/ronindojo_e2e?port=6543",
      "https://localhost:5432/ronindojo_e2e",
      "not-a-url",
      undefined,
    ]) {
      expect(() => assertSafeSeedTarget(target, { isCi: false })).toThrow("Refusing to seed")
    }
  })
})
