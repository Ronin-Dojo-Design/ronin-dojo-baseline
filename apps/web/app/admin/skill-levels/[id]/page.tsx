import { notFound } from "next/navigation"
import { SkillLevelForm } from "~/app/admin/skill-levels/_components/skill-level-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { findSkillLevelById } from "~/server/admin/skill-levels/queries"

export default withAdminPage(async ({ params }: PageProps<"/admin/skill-levels/[id]">) => {
  const { id } = await params
  const skillLevel = await findSkillLevelById(id)

  if (!skillLevel) {
    notFound()
  }

  return <SkillLevelForm title="Edit Skill Level" skillLevel={skillLevel} />
})
