import { ProgramForm } from "~/app/app/programs/_components/program-form"
import { Wrapper } from "~/components/common/wrapper"
import { findAgeGroupList } from "~/server/admin/age-groups/queries"
import { findDisciplineOptions, findOrganizationOptions } from "~/server/admin/programs/queries"
import { findSkillLevelList } from "~/server/admin/skill-levels/queries"

export default async () => {
  const [organizations, disciplines, ageGroups, skillLevels] = await Promise.all([
    findOrganizationOptions(),
    findDisciplineOptions(),
    findAgeGroupList(),
    findSkillLevelList(),
  ])

  return (
    <Wrapper size="md" gap="sm">
      <ProgramForm
        title="Create program"
        organizations={organizations}
        disciplines={disciplines}
        ageGroups={ageGroups}
        skillLevels={skillLevels}
      />
    </Wrapper>
  )
}
