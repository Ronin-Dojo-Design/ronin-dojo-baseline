import { Badge } from "~/components/common/badge"
import { Carousel, CarouselSlide } from "~/components/common/carousel"
import { Link } from "~/components/common/link"
import { promotionMarquee } from "../bbl-landing-content"
import { BeltBadge } from "./belt-badge"
import type { MarqueeMemberView, MarqueeRow } from "./bbl-promotion-marquee-data"
import { SectionHeading } from "./landing-chrome"

const MarqueeCard = ({ name, rank, colorHex, image, date }: MarqueeMemberView) => (
  <div className="w-[230px] shrink-0 rounded-xl border bg-card overflow-hidden">
    <div className="relative aspect-[5/4] bg-muted">
      {date && (
        <Badge variant="outline" className="absolute top-2 right-2 z-10 bg-background/80">
          {date}
        </Badge>
      )}
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground">
          {name
            .split(" ")
            .map(part => part[0])
            .join("")}
        </div>
      )}
    </div>
    <div className="p-3 space-y-1">
      <p className="font-semibold leading-snug">{name}</p>
      <BeltBadge rank={rank} colorHex={colorHex} />
    </div>
  </div>
)

export const BblPromotionMarquee = ({ rows }: { rows: MarqueeRow[] }) => (
  <section className="w-full space-y-8">
    <SectionHeading eyebrow={promotionMarquee.eyebrow} title={promotionMarquee.title} />
    <div className="space-y-8">
      {rows.map(row => (
        <div key={row.key} className="space-y-3">
          <Link
            href={row.href}
            className="block text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
          >
            {row.label}
          </Link>
          <Carousel ariaLabel={row.label} edgeFades controls="desktop">
            {row.members.map(member => (
              <CarouselSlide key={member.name} className="basis-[230px]">
                <MarqueeCard {...member} />
              </CarouselSlide>
            ))}
          </Carousel>
        </div>
      ))}
    </div>
  </section>
)
