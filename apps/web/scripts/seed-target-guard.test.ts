// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import { assertSafeSeedTarget } from "./seed-target-guard"

describe("assertSafeSeedTarget", () => {
  it("accepts only the disposable local/CI targets and explicitly named scratch databases", () => {
    for (const dbName of [
      "ronindojo_test",
      "ronindojo_e2e",
      "ronindojo_dev",
      "ronindojo_schema_scratch",
    ]) {
      expect(() =>
        assertSafeSeedTarget(`postgresql://local@localhost:5432/${dbName}`),
      ).not.toThrow()
    }
  })

  it("refuses prodsnap, Neon, e2e-lookalikes, invalid, and missing targets", () => {
    for (const target of [
      "postgresql://local@localhost:5432/ronindojo_prodsnap",
      "postgresql://local@localhost:5432/neondb",
      "postgresql://local@localhost:5432/ronindojo_prodsnap_e2e_backup",
      "not-a-url",
      undefined,
    ]) {
      expect(() => assertSafeSeedTarget(target)).toThrow("Refusing to seed")
    }
  })
})
