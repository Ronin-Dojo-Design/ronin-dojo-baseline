import { RuleSetForm } from "~/app/admin/tournaments/rule-sets/_components/rule-set-form"
import { Wrapper } from "~/components/common/wrapper"
import { db } from "~/services/db"

export default async () => {
  const disciplines = await db.discipline.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <Wrapper size="md" gap="sm">
      <RuleSetForm title="Create rule set" disciplines={disciplines} />
    </Wrapper>
  )
}
