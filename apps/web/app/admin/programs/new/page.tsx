import { ProgramForm } from "~/app/admin/programs/_components/program-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findDisciplineOptions, findOrganizationOptions } from "~/server/admin/programs/queries"

export default withAdminPage(async () => {
  const [organizations, disciplines] = await Promise.all([
    findOrganizationOptions(),
    findDisciplineOptions(),
  ])

  return (
    <Wrapper size="md" gap="sm">
      <ProgramForm title="Create program" organizations={organizations} disciplines={disciplines} />
    </Wrapper>
  )
})
