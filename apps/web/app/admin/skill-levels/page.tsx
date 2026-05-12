import { Suspense } from "react"
import { SkillLevelsTable } from "~/app/admin/skill-levels/_components/skill-levels-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findSkillLevels } from "~/server/admin/skill-levels/queries"
import { skillLevelsTableParamsCache } from "~/server/admin/skill-levels/schema"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/skill-levels">) => {
  const search = skillLevelsTableParamsCache.parse(await searchParams)
  const skillLevelsPromise = findSkillLevels(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Skill Levels" />}>
      <SkillLevelsTable skillLevelsPromise={skillLevelsPromise} />
    </Suspense>
  )
})
