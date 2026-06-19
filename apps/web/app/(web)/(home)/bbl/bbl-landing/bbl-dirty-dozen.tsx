import Image from "next/image"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Carousel, CarouselSlide } from "~/components/common/carousel"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import {
  BBL_ROUTES,
  dirtyDozen,
  dirtyDozenSection,
  type StaticBblRankColorMap,
} from "../bbl-landing-content"
import { BeltBadge } from "./belt-badge"
import { SectionHeading } from "./landing-chrome"

export const BblDirtyDozen = ({ rankColors }: { rankColors: StaticBblRankColorMap }) => (
  <section className="w-full space-y-8">
    <div className="space-y-4 text-center">
      <Badge variant="outline" className="mx-auto">
        <span className="inline-block size-2 rounded-full bg-primary" aria-hidden="true" />
        {dirtyDozenSection.pill}
      </Badge>
      <SectionHeading eyebrow={dirtyDozenSection.eyebrow} title={dirtyDozenSection.title} />
    </div>

    <Carousel ariaLabel="Dirty Dozen black belts" edgeFades controls="desktop">
      {dirtyDozen.map(member => (
        <CarouselSlide key={member.name} className="basis-[78%] sm:basis-[260px]">
          <Link
            href={BBL_ROUTES.lineage}
            className="block h-full rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square bg-muted">
              {member.image ? (
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(min-width: 640px) 260px, 78vw"
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-muted-foreground">
                  {member.name
                    .split(" ")
                    .map(part => part[0])
                    .join("")}
                </div>
              )}
            </div>
            <div className="p-4 space-y-1.5">
              <p className="font-semibold leading-snug">
                {member.dirtyDozenRank ? `#${member.dirtyDozenRank} ` : ""}
                {member.name}
              </p>
              <BeltBadge rank={member.rank} colorHex={rankColors[member.rank] ?? null} />
              <p className="text-sm text-muted-foreground truncate">{member.school}</p>
              <p className="text-xs text-muted-foreground">{member.location}</p>
            </div>
          </Link>
        </CarouselSlide>
      ))}
    </Carousel>

    <div className="w-full text-center space-y-3">
      <H3>{dirtyDozenSection.footerTitle}</H3>
      <p className="text-muted-foreground max-w-2xl mx-auto">{dirtyDozenSection.footerCopy}</p>
      <Button size="lg" variant="primary" render={<Link href={BBL_ROUTES.join} />}>
        Join the Legacy
      </Button>
    </div>
  </section>
)
