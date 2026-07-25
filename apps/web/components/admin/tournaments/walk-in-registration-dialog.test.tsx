// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterEach, describe, expect, it, mock } from "bun:test"
import { useState } from "react"

/**
 * WL-P3-63 — WL-P3-37 (PR #256) added a cancel/close → `form.reset()` fix to this
 * dialog but shipped with zero covering tests. Proves the same regression class as
 * the certificate-issue-dialog sibling test: open → type a value → cancel → reopen
 * → the field must be EMPTY, not stale.
 *
 * See the certificate-issue-dialog sibling test for why `@happy-dom/global-registrator`
 * is dynamic-imported + `.register()`'d BEFORE `@testing-library/react` (module-eval-time
 * `screen` singleton) instead of a `bunfig.toml [test].preload` (breaks the
 * `@t3-oss/env-core` server/client gate for every other test file in the run).
 *
 * `~/server/admin/tournaments/actions` is mocked BEFORE importing the dialog (SOP
 * §3 mock-before-import order): the real `createWalkInRegistration` is a
 * `tournamentAdminActionClient` action whose module chain pulls in Prisma/env
 * validation, and this test never submits the form (only cancels), so the real
 * action is never invoked — the mock only needs to satisfy the static import.
 */
mock.module("~/server/admin/tournaments/actions", () => ({
  createWalkInRegistration: async () => ({ data: undefined }),
}))

// `useRouter()` throws outside a real app-router tree, and this test never
// submits, so `router.refresh()` is never actually invoked.
mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
    prefetch: () => {},
  }),
}))

const { GlobalRegistrator } = await import("@happy-dom/global-registrator")
GlobalRegistrator.register()

const { cleanup, render, screen } = await import("@testing-library/react")
const { default: userEvent } = await import("@testing-library/user-event")
const { WalkInRegistrationDialog } = await import("./walk-in-registration-dialog")

/** Test-only harness: the dialog is externally controlled (`isOpen`/`setIsOpen` props,
 * no internal trigger of its own), so this stands in for whatever admin-page parent
 * flips the flag in production. */
function Harness() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Reopen (test harness)
      </button>
      <WalkInRegistrationDialog
        tournamentId="trn_1"
        divisions={[{ id: "div_1", name: "Adult", roleRequiredId: null }]}
        roles={[{ id: "role_1", name: "Competitor" }]}
        users={[]}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  )
}

// This dialog renders 3 controlled <Select>s + react-hook-form/zod validation on
// every keystroke on top of the plain <Input>s the certificate-issue-dialog sibling
// test exercises — real happy-dom + userEvent interaction across that tree
// consistently runs ~9-10s (verified via manual timestamp instrumentation), well
// past the bun:test 5000ms default. Both `it()` calls below pass an explicit 15000ms
// timeout; that is a test-only knob and does not change dialog behavior.
describe("WalkInRegistrationDialog cancel→reopen reset (WL-P3-63)", () => {
  afterEach(() => {
    cleanup()
  })

  it("clears typed guest email/name after Cancel, then reopening the dialog", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const emailInput = screen.getByPlaceholderText("competitor@example.com") as HTMLInputElement
    const nameInput = screen.getByPlaceholderText("Full name") as HTMLInputElement

    await user.type(emailInput, "walkin@example.com")
    await user.type(nameInput, "Walkin Guest")
    expect(emailInput.value).toBe("walkin@example.com")
    expect(nameInput.value).toBe("Walkin Guest")

    await user.click(screen.getByRole("button", { name: "Cancel" }))
    await user.click(screen.getByRole("button", { name: "Reopen (test harness)" }))

    const reopenedEmail = screen.getByPlaceholderText("competitor@example.com") as HTMLInputElement
    const reopenedName = screen.getByPlaceholderText("Full name") as HTMLInputElement
    expect(reopenedEmail.value).toBe("")
    expect(reopenedName.value).toBe("")
  }, 15000)

  it("clears the field via the dialog's own X close control too (not just Cancel)", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const emailInput = screen.getByPlaceholderText("competitor@example.com") as HTMLInputElement
    await user.type(emailInput, "another@example.com")

    await user.click(screen.getByRole("button", { name: "Close" }))
    await user.click(screen.getByRole("button", { name: "Reopen (test harness)" }))

    const reopenedEmail = screen.getByPlaceholderText("competitor@example.com") as HTMLInputElement
    expect(reopenedEmail.value).toBe("")
  }, 15000)
})
