import { SkillLevelForm } from "~/app/admin/skill-levels/_components/skill-level-form"
import { withAdminPage } from "~/components/admin/auth-hoc"

export default withAdminPage(async () => {
  return <SkillLevelForm title="New Skill Level" />
})
