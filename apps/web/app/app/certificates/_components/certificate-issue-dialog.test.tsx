// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterEach, describe, expect, it, mock } from "bun:test"

/**
 * WL-P3-63 — WL-P3-37 (PR #256) added a cancel/close → `form.reset()` fix to this
 * dialog but shipped with zero covering tests. Proves the actual regression class:
 * open → type a value → cancel → reopen → the field must be EMPTY, not stale.
 *
 * Real DOM interaction (not the repo's usual SSR-string assertions) because the
 * bug lives in react-hook-form state that only exists across an open/close/reopen
 * cycle. `expiresAt` is used as the probe field — it's a plain `<Input>`, so it
 * doesn't require driving the portaled `ComboboxSelector` popup to prove the fix.
 *
 * `@happy-dom/global-registrator` MUST register `window`/`document` before
 * `@testing-library/react`/`dom` is ever `require()`'d — `@testing-library/dom`'s
 * `screen` export is a module-eval-time singleton (`typeof document !== "undefined"`
 * checked ONCE at import), so a static import that merely happens to be textually
 * first is not enough; only a dynamic `await import(...)` after `.register()`
 * guarantees the ordering. This is also why it's a per-file dynamic import, not a
 * `bunfig.toml [test].preload` — a global preload registers `window` for EVERY test
 * file in the run, which breaks `@t3-oss/env-core`'s server/client gate elsewhere
 * (SESSION_0706 full-suite verification).
 *
 * `next/navigation` is mocked BEFORE importing the dialog (SOP §3 mock-before-import
 * order): `useRouter()` throws "invariant expected app router to be mounted" outside
 * a real Next app-router tree, and this test never submits (only cancels), so
 * `router.refresh()` is never actually invoked — the mock only needs to satisfy the
 * unconditional top-of-component `useRouter()` call.
 */
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
const { CertificateIssueDialog } = await import("./certificate-issue-dialog")

describe("CertificateIssueDialog cancel→reopen reset (WL-P3-63)", () => {
  afterEach(() => {
    cleanup()
  })

  // `base-ui`'s Dialog mounts its popup content after an effect (not
  // synchronously with the click), so post-open queries use `findBy*`
  // (retrying) instead of `getBy*`. Per-test timeout bumped past the
  // bun:test 5000ms default: under load (e.g. running alongside the
  // walk-in-registration-dialog sibling suite) this consistently needs
  // more than 5s of real happy-dom + userEvent interaction. Test-only
  // knobs; no dialog behavior changes.
  it("clears a typed expiry date after Cancel, then reopening the dialog", async () => {
    const user = userEvent.setup()
    render(<CertificateIssueDialog templateId="tpl_1" users={[]} />)

    await user.click(screen.getByRole("button", { name: "Issue certificate" }))

    const expiresInput = (await screen.findByLabelText("Expires (optional)")) as HTMLInputElement
    await user.type(expiresInput, "2030-01-01")
    expect(expiresInput.value).toBe("2030-01-01")

    await user.click(screen.getByRole("button", { name: "Cancel" }))

    // Reopen via the same trigger.
    await user.click(screen.getByRole("button", { name: "Issue certificate" }))

    const reopenedInput = (await screen.findByLabelText("Expires (optional)")) as HTMLInputElement
    expect(reopenedInput.value).toBe("")
  }, 15000)

  it("clears the field via the dialog's own X close control too (not just Cancel)", async () => {
    const user = userEvent.setup()
    render(<CertificateIssueDialog templateId="tpl_1" users={[]} />)

    await user.click(screen.getByRole("button", { name: "Issue certificate" }))

    const expiresInput = (await screen.findByLabelText("Expires (optional)")) as HTMLInputElement
    await user.type(expiresInput, "2030-06-15")

    await user.click(screen.getByRole("button", { name: "Close" }))
    await user.click(screen.getByRole("button", { name: "Issue certificate" }))

    const reopenedInput = (await screen.findByLabelText("Expires (optional)")) as HTMLInputElement
    expect(reopenedInput.value).toBe("")
  }, 15000)
})
