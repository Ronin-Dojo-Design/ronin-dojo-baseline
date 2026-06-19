import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import type { TechniqueOne } from "~/server/web/techniques/payloads"
import { formatEnumLabel } from "./technique-detail-format"

type TechniqueBadgesProps = {
  technique: TechniqueOne
}

/**
 * Attribute badges (category / position / difficulty / discipline / flags). Already
 * token-clean — semantic `Badge` variants, no hex literals (techniques carry no
 * `Rank.colorHex`, so no `BeltSwatch` applies here).
 */
export function TechniqueBadges({ technique }: TechniqueBadgesProps) {
  return (
    <Section>
      <Stack size="sm" className="flex-wrap">
        {technique.category && (
          <Badge variant="outline">{formatEnumLabel(technique.category)}</Badge>
        )}
        {technique.position && (
          <Badge variant="outline">{formatEnumLabel(technique.position)}</Badge>
        )}
        {technique.difficultyLevel && (
          <Badge variant="soft">{formatEnumLabel(technique.difficultyLevel)}</Badge>
        )}
        {technique.discipline && <Badge variant="soft">{technique.discipline.name}</Badge>}
        {technique.isFoundational && <Badge variant="success">Foundational</Badge>}
        {technique.isGi !== null && (
          <Badge variant="outline">{technique.isGi ? "Gi" : "No-Gi"}</Badge>
        )}
        {technique.requiresPartner && <Badge variant="outline">Partner required</Badge>}
        {technique.requiresEquipment && <Badge variant="outline">Equipment required</Badge>}
      </Stack>
    </Section>
  )
}
