// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { findViolations, lintButtonType } from "./lint-button-type"

describe("findViolations", () => {
  it("flags an L1 Button inside a form with no explicit type prop — the FI-025 shape", () => {
    // This is the exact shape SESSION_0520's FI-025 shipped: a save Button inside a <form>
    // with no `type`. Base UI never infers "submit" for it, so it renders inert. If this
    // fixture ever stops failing, the guard has regressed.
    const code = `
      import { Button } from "~/components/common/button"

      export function UserForm() {
        return (
          <form onSubmit={handleSubmitWithAction}>
            <Button size="md" isPending={action.isPending}>
              Update user
            </Button>
          </form>
        )
      }
    `

    const violations = findViolations(code, "fixture-inert.tsx")
    expect(violations.length).toBe(1)
    expect(violations[0]?.file).toBe("fixture-inert.tsx")
  })

  it("flags a self-closing Button inside a form with no type", () => {
    const code = `
      import { Button } from "~/components/common/button"

      export function IconSave() {
        return (
          <form onSubmit={onSubmit}>
            <Button size="icon" prefix={<SaveIcon />} />
          </form>
        )
      }
    `

    expect(findViolations(code, "fixture-self-closing.tsx").length).toBe(1)
  })

  it("passes when type is explicit, including a dynamic expression", () => {
    const code = `
      import { Button } from "~/components/common/button"

      export function UserForm({ cond }) {
        return (
          <form onSubmit={handleSubmitWithAction}>
            <Button type="submit" size="md">Update user</Button>
            <Button type={cond ? "submit" : "button"}>Go</Button>
          </form>
        )
      }
    `

    expect(findViolations(code, "fixture-typed.tsx")).toEqual([])
  })

  it("passes when Button uses render (swaps the underlying tag, e.g. a Link)", () => {
    const code = `
      import { Button } from "~/components/common/button"
      import { Link } from "~/components/common/link"

      export function CancelButton() {
        return (
          <form onSubmit={onSubmit}>
            <Button size="md" variant="secondary" render={<Link href="/app/users" />}>
              Cancel
            </Button>
          </form>
        )
      }
    `

    expect(findViolations(code, "fixture-render.tsx")).toEqual([])
  })

  it("ignores a Button outside any form", () => {
    const code = `
      import { Button } from "~/components/common/button"

      export function Toolbar() {
        return <Button size="md">Click</Button>
      }
    `

    expect(findViolations(code, "fixture-outside-form.tsx")).toEqual([])
  })

  it("ignores a Button-named component that isn't the L1 Button import", () => {
    const code = `
      import { Button } from "some-other-design-system"

      export function Foo() {
        return (
          <form onSubmit={onSubmit}>
            <Button>Go</Button>
          </form>
        )
      }
    `

    expect(findViolations(code, "fixture-non-l1.tsx")).toEqual([])
  })

  it("does not flag a file that never imports the L1 Button at all", () => {
    const code = `
      export function Foo() {
        return <form onSubmit={onSubmit}><button type="submit">Go</button></form>
      }
    `

    expect(findViolations(code, "fixture-no-import.tsx")).toEqual([])
  })
})

describe("lintButtonType (full apps/web scan)", () => {
  it("finds zero inert-Button-in-form violations in the current codebase", () => {
    // Regression enforcement: SESSION_0520 fixed all 14 known call sites. This scan proves no
    // new violation has shipped since — it's the "run the guard over apps/web" gate, wired
    // into `bun run test` so CI re-checks it on every PR, not just at `lint` time. Walking and
    // parsing ~1000 .tsx files is slower than the 5s bun:test default, hence the raised timeout.
    const violations = lintButtonType()
    if (violations.length > 0) {
      const list = violations.map(v => `  ${v.file}:${v.line}:${v.column}`).join("\n")
      throw new Error(`Found ${violations.length} inert Button(s) in a <form>:\n${list}`)
    }
    expect(violations).toEqual([])
  }, 30_000)
})
