import Image from "next/image"
import { Card } from "~/components/common/card"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Prose } from "~/components/common/prose"
import { cx } from "~/lib/utils"
import { BBL_ROUTES, heroContent, type StaticBblRankColorMap } from "../bbl-landing-content"
import { BeltBadge } from "./belt-badge"
import { BBL_FLOAT_CLASSES } from "./landing-chrome"

export const BblHero = ({ rankColors }: { rankColors: StaticBblRankColorMap }) => (
  <section className="relative grid w-full overflow-hidden rounded-2xl md:rounded-[2.25rem] border border-primary/15 bg-gradient-to-br from-background via-card to-primary/10 px-5 py-10 shadow-sm md:px-10 md:py-14 lg:grid-cols-2 lg:items-center lg:gap-12">
    <div
      className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/20 blur-3xl"
      aria-hidden="true"
    />
    <div
      className="absolute -bottom-28 -left-24 size-72 rounded-full bg-primary/10 blur-3xl"
      aria-hidden="true"
    />
    <div className="relative z-10 space-y-7">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
        {heroContent.eyebrow}
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-pretty sm:text-5xl lg:text-7xl">
        {heroContent.titleLead} <span className="text-primary">{heroContent.titleAccent}</span>
      </h1>
      <Prose className="max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">
        {heroContent.description}
      </Prose>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" variant="primary" render={<Link href={BBL_ROUTES.register} />}>
          Register Now
        </Button>
        <Button size="lg" variant="secondary" render={<Link href={BBL_ROUTES.moreInfo} />}>
          More Info
        </Button>
      </div>
    </div>

    <Card
      hover={false}
      className={cx(
        "relative z-10 p-0! overflow-hidden max-w-xs sm:max-w-sm w-full mx-auto border-primary/20 mt-6 lg:mt-0 lg:ml-auto",
        BBL_FLOAT_CLASSES,
      )}
    >
      <div className="relative aspect-[4/3] bg-muted">
        <Image
          src={heroContent.card.image}
          alt={heroContent.card.name}
          fill
          priority
          sizes="(min-width: 1024px) 384px, (min-width: 640px) 384px, 320px"
          className="object-cover object-top"
        />
        <BeltBadge
          rank={heroContent.card.badge}
          colorHex={rankColors[heroContent.card.badge] ?? null}
          className="absolute bottom-3 left-3"
        />
      </div>
      <div className="space-y-3 p-5 bg-gradient-to-br from-card to-primary/5">
        <div className="flex items-start gap-3">
          <Image
            src={heroContent.card.logo}
            alt=""
            width={48}
            height={48}
            sizes="48px"
            className="size-12 rounded-lg border bg-muted object-contain p-1"
          />
          <div>
            <p className="font-semibold">{heroContent.card.name}</p>
            <p className="text-sm text-muted-foreground">{heroContent.card.role}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{heroContent.card.credentials}</p>
      </div>
    </Card>
  </section>
)
