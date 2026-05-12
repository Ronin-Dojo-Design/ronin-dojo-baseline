import { ProgramForm } from "~/app/admin/programs/_components/program-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"

export default withAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <ProgramForm title="Create program" />
    </Wrapper>
  )
})
