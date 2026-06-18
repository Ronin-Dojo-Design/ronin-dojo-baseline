import { Link } from "~/components/common/link"
import { beltColorForRank, BBL_ROUTES, timeline, timelineSection } from "../bbl-landing-content"
import { BeltBadge } from "./belt-badge"
import { RegisterButtons, SectionHeading } from "./landing-chrome"

export const BblTimeline = () => (
  <section className="w-full space-y-8">
    <SectionHeading
      eyebrow={timelineSection.eyebrow}
      title={timelineSection.title}
      description={timelineSection.description}
    />
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {timeline.map(entry => (
        <Link
          key={entry.name}
          href={BBL_ROUTES.lineage}
          className="group block rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-square bg-muted overflow-hidden">
            <img
              src={entry.image}
              alt={entry.name}
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
              loading="lazy"
            />
            <BeltBadge
              rank={entry.rank}
              colorHex={beltColorForRank(entry.rank)}
              className="absolute bottom-3 left-3"
            />
          </div>
          <div className="p-4 space-y-1.5">
            <p className="font-semibold group-hover:text-primary transition-colors">{entry.name}</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{entry.copy}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              View Profile →
            </span>
          </div>
        </Link>
      ))}
    </div>
    <RegisterButtons />
  </section>
)
