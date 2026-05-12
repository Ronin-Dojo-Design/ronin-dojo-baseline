import { notFound } from "next/navigation"
import { ProgramForm } from "~/app/admin/programs/_components/program-form"
import { ProgramCoursesEditor } from "~/app/admin/programs/_components/program-courses-editor"
import { ProgramWaiversEditor } from "~/app/admin/programs/_components/program-waivers-editor"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { Separator } from "~/components/common/separator"
import { findAvailableCourses, findAvailableWaivers, findDisciplineOptions, findOrganizationOptions, findProgramById } from "~/server/admin/programs/queries"

export default withAdminPage(async ({ params }) => {
  const { id } = await params
  const [program, organizations, disciplines, availableCourses, availableWaivers] = await Promise.all([
    findProgramById(id),
    findOrganizationOptions(),
    findDisciplineOptions(),
    findAvailableCourses(id),
    findAvailableWaivers(id),
  ])

  if (!program) {
    return notFound()
  }

  const linkedCourses = program.courses.map(pc => ({
    id: pc.course.id,
    title: pc.course.title,
    slug: pc.course.slug,
  }))

  const linkedWaivers = program.waivers.map(pw => ({
    id: pw.waiver.id,
    title: pw.waiver.title,
    type: pw.waiver.type,
    required: pw.required,
  }))

  return (
    <Wrapper size="md" gap="sm">
      <ProgramForm title={`Edit ${program.name}`} program={program} organizations={organizations} disciplines={disciplines} />
      <Separator />
      <ProgramCoursesEditor programId={program.id} linkedCourses={linkedCourses} availableCourses={availableCourses} />
      <Separator />
      <ProgramWaiversEditor
        programId={program.id}
        linkedWaivers={linkedWaivers}
        availableWaivers={availableWaivers}
      />
    </Wrapper>
  )
})
