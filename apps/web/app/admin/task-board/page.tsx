import type { Metadata } from "next"
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
