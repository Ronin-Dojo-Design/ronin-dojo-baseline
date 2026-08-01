// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import { spawnSync } from "node:child_process"
import { resolve } from "node:path"

const repoRoot = resolve(import.meta.dirname, "../../..")

describe("pre-commit staged-format guard", () => {
  it("defeats partial staging without mutating the index or worktree", () => {
    const result = spawnSync("bash", ["scripts/githooks/pre-commit.test.sh"], {
      cwd: repoRoot,
      encoding: "utf8",
    })

    if (result.status !== 0) {
      throw new Error(
        ["pre-commit integration harness failed", result.stdout, result.stderr]
          .filter(Boolean)
          .join("\n"),
      )
    }

    expect(result.stdout).toContain(
      "PASS — staged source/config authority, installation, and read-only behavior",
    )
  }, 30_000)
})
