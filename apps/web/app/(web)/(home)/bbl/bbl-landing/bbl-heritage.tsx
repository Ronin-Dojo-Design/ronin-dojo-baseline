import Image from "next/image"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { Prose } from "~/components/common/prose"
import { cx } from "~/lib/utils"
import {
  BBL_IMAGES,
  BBL_ROUTES,
  heritageContent,
  type StaticBblRankColorMap,
} from "../bbl-landing-content"
import { BeltBadge } from "./belt-badge"
import { BBL_SECTION_CLASSES, SectionHeading } from "./landing-chrome"

export const BblHeritage = ({
  rankColors,
  hideAction = false,
}: {
  rankColors: StaticBblRankColorMap
  hideAction?: boolean
}) => (
  <section className={cx(BBL_SECTION_CLASSES, "grid gap-8 md:grid-cols-2 md:items-center")}>
    <Card hover={false} className="p-0! overflow-hidden relative">
      <Image
        src={BBL_IMAGES.bobAndRigan}
        alt="Bob Bass and Rigan Machado"
        width={900}
        height={675}
        sizes="(min-width: 768px) 50vw, 100vw"
        className="h-auto w-full object-cover"
      />
      <BeltBadge
        rank={heritageContent.badge}
        colorHex={rankColors[heritageContent.badge] ?? null}
        className="absolute bottom-4 left-4"
      />
    </Card>

    <div className="space-y-5">
      <SectionHeading
        eyebrow={heritageContent.eyebrow}
        title={heritageContent.title}
        align="left"
      />
      <Prose className="text-muted-foreground">{heritageContent.lead}</Prose>
      <Prose className="text-muted-foreground text-sm">{heritageContent.body}</Prose>
      {!hideAction && (
        <Button
          variant="ghost"
          className="text-primary px-0"
          render={<Link href={BBL_ROUTES.lineage} />}
        >
          {heritageContent.ctaLabel} →
        </Button>
      )}
    </div>
  </section>
)
