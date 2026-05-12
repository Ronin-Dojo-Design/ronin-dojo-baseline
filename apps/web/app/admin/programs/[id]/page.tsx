import { notFound } from "next/navigation"
import { ProgramForm } from "~/app/admin/programs/_components/program-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findProgramById } from "~/server/admin/programs/queries"

export default withAdminPage(async ({ params }) => {
  const { id } = await params
  const program = await findProgramById(id)

  if (!program) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <ProgramForm title={`Edit ${program.name}`} program={program} />
    </Wrapper>
  )
})
