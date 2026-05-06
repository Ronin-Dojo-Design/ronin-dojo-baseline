import { notFound } from "next/navigation"
import { RuleSetForm } from "~/app/admin/tournaments/rule-sets/_components/rule-set-form"
import { withTournamentAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findRuleSetById } from "~/server/admin/tournaments/queries"
import { db } from "~/services/db"

export default withTournamentAdminPage(async ({ params }) => {
  const { id } = await params
  const [ruleSet, disciplines] = await Promise.all([
    findRuleSetById(id),
    db.discipline.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  if (!ruleSet) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <RuleSetForm title="Update rule set" ruleSet={ruleSet} disciplines={disciplines} />
    </Wrapper>
  )
})
