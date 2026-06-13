import { notFound } from "next/navigation"
import { ProgramCoursesEditor } from "~/app/app/programs/_components/program-courses-editor"
import { ProgramForm } from "~/app/app/programs/_components/program-form"
import { ProgramWaiversEditor } from "~/app/app/programs/_components/program-waivers-editor"
import { Separator } from "~/components/common/separator"
import { Wrapper } from "~/components/common/wrapper"
import { findAgeGroupList } from "~/server/admin/age-groups/queries"
import {
  findAvailableCourses,
  findAvailableWaivers,
  findDisciplineOptions,
  findOrganizationOptions,
  findProgramById,
} from "~/server/admin/programs/queries"
import { findSkillLevelList } from "~/server/admin/skill-levels/queries"

export default async ({ params }: PageProps<"/app/programs/[id]">) => {
  const { id } = await params
  const [
    program,
    organizations,
    disciplines,
    availableCourses,
    availableWaivers,
    ageGroups,
    skillLevels,
  ] = await Promise.all([
    findProgramById(id),
    findOrganizationOptions(),
    findDisciplineOptions(),
    findAvailableCourses(id),
    findAvailableWaivers(id),
    findAgeGroupList(),
    findSkillLevelList(),
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
      <ProgramForm
        title={`Edit ${program.name}`}
        program={program}
        organizations={organizations}
        disciplines={disciplines}
        ageGroups={ageGroups}
        skillLevels={skillLevels}
      />
      <Separator />
      <ProgramCoursesEditor
        programId={program.id}
        linkedCourses={linkedCourses}
        availableCourses={availableCourses}
      />
      <Separator />
      <ProgramWaiversEditor
        programId={program.id}
        linkedWaivers={linkedWaivers}
        availableWaivers={availableWaivers}
      />
    </Wrapper>
  )
}
