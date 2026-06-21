import type { Metadata } from "next"
// The board is the first consumer of the shared kernel m-card (ADR 0033 D1), so it
// loads the kernel CSS once here: tokens.css defines the --mk-* variables the card
// reads, m-card.css the .mk-card classes. Both ship from @ronin-dojo/ui-kit.
import "@ronin-dojo/ui-kit/tokens.css"
import "@ronin-dojo/ui-kit/m-card.css"
import { AdminTaskBoard } from "~/app/admin/task-board/_components/admin-task-board"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { seedBoard } from "~/lib/task-board/seed"

export const metadata: Metadata = {
  title: "Task Board",
}

/**
 * AdminTaskBoard route (PWCC-001). Admin-gated (operator-internal surface — no
 * public DTO; spec "Security / redaction gates"). The board is localStorage-first,
 * so the server only ships a deterministic seed; the client hydrates from the
 * BoardStore (localStorage now; wp-json adapter later) on mount.
 */
export default withAdminPage(() => {
  // Deterministic-on-the-day seed; client overrides with stored / migrated data.
  const initial = seedBoard(new Date())

  return (
    <Wrapper size="lg" gap="sm">
      <AdminTaskBoard initial={initial} />
    </Wrapper>
  )
})
