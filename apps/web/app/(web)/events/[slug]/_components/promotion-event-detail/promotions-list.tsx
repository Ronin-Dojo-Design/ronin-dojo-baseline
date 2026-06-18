import { Badge } from "~/components/common/badge"
import { EmptyList } from "~/components/common/empty-list"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import type { PromotionEventDetail } from "~/server/web/promotion-events/payloads"
import { AwardCard } from "./award-card"

/**
 * The "Promotions" section: the rank awards linked to this ceremony, or an empty
 * state. The above-the-fold core content of the page — rendered eager.
 */
export function PromotionsList({ awards }: { awards: PromotionEventDetail["rankAwards"] }) {
  return (
    <Stack direction="column" size="md" className="w-full">
      <Stack className="justify-between w-full">
        <H4 className={bblHeadingFontClass}>Promotions</H4>
        <Badge variant="soft" size="sm">
          {awards.length}
        </Badge>
      </Stack>

      {awards.length === 0 ? (
        <EmptyList>No rank awards are linked to this ceremony yet.</EmptyList>
      ) : (
        <Stack direction="column" size="sm" className="w-full">
          {awards.map(award => (
            <AwardCard key={award.id} award={award} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
