import { UserRoundIcon } from "lucide-react"
import Image from "next/image"
import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H4, H5 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import { Grid } from "~/components/web/ui/grid"
import { Section } from "~/components/web/ui/section"
import type { PromotionEventDetail } from "~/server/web/promotion-events/payloads"

/**
 * The below-the-fold "Ceremony Photos" gallery. Split into its own module so the
 * orchestrator can `next/dynamic` it (SSR kept) — it is the heaviest section and
 * paints last. `H5` titles stay brand-neutral sans; the section heading inherits
 * the BBL heading font.
 */
export function CeremonyPhotos({
  mediaAttachments,
  eventTitle,
}: {
  mediaAttachments: PromotionEventDetail["mediaAttachments"]
  eventTitle: string
}) {
  return (
    <Section>
      <Section.Content className="md:col-span-3">
        <Stack direction="column" size="md" className="w-full">
          <Stack className="justify-between w-full">
            <H4 className={bblHeadingFontClass}>Ceremony Photos</H4>
            <Badge variant="soft" size="sm" prefix={<UserRoundIcon />}>
              Read-only
            </Badge>
          </Stack>

          {mediaAttachments.length === 0 ? (
            <Card hover={false}>
              <CardHeader>
                <H5>No ceremony photos yet</H5>
              </CardHeader>
              <Note>
                Photos can be added once the event editor and upload flow ship in a later slice.
              </Note>
            </Card>
          ) : (
            <Grid>
              {mediaAttachments.map(attachment => {
                const media = attachment.media
                return (
                  <Card key={attachment.id} hover={false} className="overflow-hidden p-0">
                    <Image
                      src={media.thumbnailUrl ?? media.url}
                      alt={media.altText ?? media.title ?? eventTitle}
                      width={720}
                      height={480}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <Stack direction="column" size="xs" className="w-full p-4">
                      <H5>{media.title ?? "Ceremony photo"}</H5>
                      {media.altText && <Note className="text-xs">{media.altText}</Note>}
                    </Stack>
                  </Card>
                )
              })}
            </Grid>
          )}
        </Stack>
      </Section.Content>
    </Section>
  )
}
