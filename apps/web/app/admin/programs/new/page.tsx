import { ProgramForm } from "~/app/admin/programs/_components/program-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findDisciplineOptions, findOrganizationOptions } from "~/server/admin/programs/queries"
import { findAgeGroupList } from "~/server/admin/age-groups/queries"
import { findSkillLevelList } from "~/server/admin/skill-levels/queries"

export default withAdminPage(async () => {
  const [organizations, disciplines, ageGroups, skillLevels] = await Promise.all([
    findOrganizationOptions(),
    findDisciplineOptions(),
    findAgeGroupList(),
    findSkillLevelList(),
  ])

  return (
    <Wrapper size="md" gap="sm">
      <ProgramForm title="Create program" organizations={organizations} disciplines={disciplines} ageGroups={ageGroups} skillLevels={skillLevels} />
    </Wrapper>
  )
})
