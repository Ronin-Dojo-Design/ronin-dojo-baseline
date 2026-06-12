import { BarChart3Icon, CheckIcon, SwordsIcon, TrophyIcon } from "lucide-react"
import { Inter, Poppins } from "next/font/google"
import type { ComponentProps, ReactNode } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/common/accordion"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Carousel, CarouselSlide } from "~/components/common/carousel"
import { H2, H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Prose } from "~/components/common/prose"
import { cx } from "~/lib/utils"
import { db } from "~/services/db"
import {
  BBL_IMAGES,
  BBL_ROUTES,
  celebrationContent,
  redBeltCelebration,
  dirtyDozen,
  dirtyDozenSection,
  faqs,
  faqSection,
  featureHighlights,
  featuresSection,
  finalCta,
  heritageContent,
  heroContent,
  newMemberFeatures,
  promos,
  MARQUEE_PHOTOS,
  promotionMarquee,
  schoolOwnerFeatures,
  testimonials,
  testimonialsSection,
  timeline,
  timelineSection,
  treeSection,
  valueProps,
  valuePropsSection,
  videoContent,
} from "./bbl-landing-content"
import { BblReveal } from "./bbl-reveal"

// Legacy BBL type system (BlackBeltLegacyLanding.jsx): Poppins headings
// (italic extrabold uppercase) + Inter body. Scoped to this landing via vars.
const headingFont = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-bbl-heading",
})
const bodyFont = Inter({ subsets: ["latin"], variable: "--font-bbl-body" })

/**
 * Black Belt Legacy landing page — content/IA from the legacy
 * `BlackBeltLegacyLanding.jsx`, rebuilt on current primitives with semantic
 * theme tokens (brand colors come from BrandSettings via `layout.tsx`).
 * Rendered by the home page only when the request brand is BBL.
 */

const VALUE_PROP_ICONS = {
  trophy: TrophyIcon,
  chart: BarChart3Icon,
  swords: SwordsIcon,
} as const

const BELT_BADGE_CLASSES: Record<string, string> = {
  founder: "bg-muted text-foreground border-border",
  red: "bg-red-700 text-white border-red-800",
  coral: "bg-gradient-to-r from-red-600 via-white to-red-600 text-black border-red-600",
}

const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow: string
  title: string
  description?: string
  align?: "center" | "left"
  className?: string
}) => (
  <div className={cx("w-full space-y-3", align === "center" && "text-center", className)}>
    <p className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">{eyebrow}</p>
    <H2>{title}</H2>
    {description && (
      <Prose className={cx("max-w-3xl text-muted-foreground", align === "center" && "mx-auto")}>
        {description}
      </Prose>
    )}
  </div>
)

const RegisterButtons = ({ size = "lg" }: { size?: ComponentProps<typeof Button>["size"] }) => (
  <div className="flex flex-col sm:flex-row gap-3 justify-center">
    <Button size={size} variant="primary" render={<Link href={BBL_ROUTES.register} />}>
      Register Now
    </Button>
    <Button size={size} variant="secondary" render={<Link href={BBL_ROUTES.moreInfo} />}>
      More Info
    </Button>
  </div>
)

const CheckRow = ({ title, children }: { title?: string; children: ReactNode }) => (
  <div className="flex gap-3 rounded-xl border bg-card p-4">
    <CheckIcon className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
    <div className="space-y-0.5">
      {title && <p className="font-medium">{title}</p>}
      <p className={cx("text-sm", title ? "text-muted-foreground" : "")}>{children}</p>
    </div>
  </div>
)

const BblHero = () => (
  <section className="grid gap-10 lg:grid-cols-2 lg:items-center w-full">
    <div className="space-y-6">
      <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-semibold">
        {heroContent.eyebrow}
      </p>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-pretty">
        {heroContent.titleLead} <span className="text-primary">{heroContent.titleAccent}</span>
      </h1>
      <Prose className="text-lg text-muted-foreground max-w-xl">{heroContent.description}</Prose>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" variant="primary" render={<Link href={BBL_ROUTES.register} />}>
          Register Now
        </Button>
        <Button size="lg" variant="secondary" render={<Link href={BBL_ROUTES.moreInfo} />}>
          More Info
        </Button>
      </div>
    </div>

    <Card hover={false} className="p-0! overflow-hidden max-w-sm w-full mx-auto lg:ml-auto">
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src={heroContent.card.image}
          alt={heroContent.card.name}
          className="h-full w-full object-cover object-top"
        />
        <Badge
          className={cx("absolute bottom-3 left-3 border", BELT_BADGE_CLASSES.coral)}
          prefix={<SwordsIcon />}
        >
          {heroContent.card.badge}
        </Badge>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={heroContent.card.logo}
            alt=""
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

const BblVideo = () => (
  <section className="w-full max-w-4xl mx-auto space-y-6">
    <SectionHeading
      eyebrow={videoContent.eyebrow}
      title={videoContent.title}
      description={videoContent.description}
    />
    <Card hover={false} className="p-0! overflow-hidden">
      <div className="aspect-video w-full">
        <iframe
          title={videoContent.embedTitle}
          src={videoContent.embedUrl}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Card>
    <p className="text-center text-sm text-muted-foreground">{videoContent.caption}</p>
  </section>
)

const BblDirtyDozen = () => (
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
        <CarouselSlide key={member.name} className="basis-[260px]">
          <Link
            href={BBL_ROUTES.lineage}
            className="block h-full rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="aspect-square bg-muted">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover object-top"
                  loading="lazy"
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
              <Badge
                className={cx(
                  "border",
                  member.rank.includes("Coral") ? BELT_BADGE_CLASSES.coral : "bg-muted",
                )}
              >
                {member.rank}
              </Badge>
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

const BblHeritage = () => (
  <section className="grid gap-8 md:grid-cols-2 md:items-center w-full">
    <Card hover={false} className="p-0! overflow-hidden relative">
      <img
        src={BBL_IMAGES.bobAndRigan}
        alt="Bob Bass and Rigan Machado"
        className="w-full h-auto object-cover"
        loading="lazy"
      />
      <Badge
        className={cx("absolute bottom-4 left-4 border", BELT_BADGE_CLASSES.coral)}
        prefix={<SwordsIcon />}
      >
        {heritageContent.badge}
      </Badge>
    </Card>

    <div className="space-y-5">
      <SectionHeading
        eyebrow={heritageContent.eyebrow}
        title={heritageContent.title}
        align="left"
      />
      <Prose className="text-muted-foreground">{heritageContent.lead}</Prose>
      <Prose className="text-muted-foreground text-sm">{heritageContent.body}</Prose>
      <Button
        variant="ghost"
        className="text-primary px-0"
        render={<Link href={BBL_ROUTES.lineage} />}
      >
        {heritageContent.ctaLabel} →
      </Button>
    </div>
  </section>
)

const BblValueProps = () => (
  <section className="w-full space-y-8">
    <SectionHeading
      eyebrow={valuePropsSection.eyebrow}
      title={valuePropsSection.title}
      description={valuePropsSection.description}
    />
    <div className="grid gap-5 md:grid-cols-3">
      {valueProps.map(item => {
        const Icon = VALUE_PROP_ICONS[item.icon]
        return (
          <Card key={item.title} hover={false} className="space-y-3">
            <div className="inline-flex size-11 items-center justify-center rounded-full border bg-muted text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <H3 className="text-lg">{item.title}</H3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </Card>
        )
      })}
    </div>
  </section>
)

const BblFeatures = () => (
  <section className="w-full">
    <Card hover={false} className="space-y-10 p-6 md:p-8">
      <SectionHeading
        eyebrow={featuresSection.eyebrow}
        title={featuresSection.title}
        description={featuresSection.description}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {featureHighlights.map(feature => (
          <div key={feature.title} className="rounded-xl border overflow-hidden bg-card">
            <div className="relative h-36">
              <img
                src={feature.image}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4 space-y-1.5">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                {feature.kicker}
              </p>
              <p className="font-semibold">{feature.title}</p>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="space-y-3">
          <H3 className="text-lg">{featuresSection.membersHeading}</H3>
          <div className="space-y-2.5">
            {newMemberFeatures.map(feature => (
              <CheckRow key={feature.title} title={feature.title}>
                {feature.description}
              </CheckRow>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <H3 className="text-lg">{featuresSection.ownersHeading}</H3>
          <div className="space-y-2.5">
            {schoolOwnerFeatures.map(item => (
              <CheckRow key={item}>{item}</CheckRow>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{featuresSection.ownersFootnote}</p>
        </div>
      </div>
    </Card>
  </section>
)

const BblTimeline = () => (
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
            <Badge
              className={cx("absolute bottom-3 left-3 border", BELT_BADGE_CLASSES[entry.belt])}
            >
              {entry.rank}
            </Badge>
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

const BblTestimonials = () => (
  <section className="w-full space-y-8">
    <SectionHeading
      eyebrow={testimonialsSection.eyebrow}
      title={testimonialsSection.title}
      description={testimonialsSection.description}
    />
    <div className="grid gap-5 md:grid-cols-2">
      {testimonials.map(item => (
        <Card key={item.name} hover={false} className="space-y-4">
          <p className="italic text-pretty">“{item.quote}”</p>
          <div className="flex items-center gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="size-12 rounded-full object-cover object-top border"
              loading="lazy"
            />
            <div>
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.role}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>

    <Card hover={false} className="p-0! overflow-hidden">
      <div className="w-full aspect-[3/1] overflow-hidden max-md:aspect-[21/9]">
        <img
          src={BBL_IMAGES.communityGroup}
          alt="Black Belt Legacy community group photo"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="w-full p-6 text-center space-y-1">
        <p className="font-semibold">{testimonialsSection.groupPhotoTitle}</p>
        <p className="text-sm text-muted-foreground">{testimonialsSection.groupPhotoCopy}</p>
      </div>
    </Card>
  </section>
)

const BblFaq = () => (
  <section className="w-full max-w-3xl mx-auto space-y-8">
    <SectionHeading eyebrow={faqSection.eyebrow} title={faqSection.title} />
    <Accordion className="space-y-3">
      {faqs.map(item => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </section>
)

const BblFinalCta = () => (
  <section className="w-full">
    <Card
      hover={false}
      className="items-center p-8 md:p-12 text-center space-y-5 bg-gradient-to-br from-card to-muted"
    >
      <H2>{finalCta.title}</H2>
      <p className="text-muted-foreground max-w-2xl mx-auto">{finalCta.description}</p>
      <RegisterButtons />
    </Card>
  </section>
)

const BblCelebration = () => (
  <section className="w-full">
    <Card hover={false} className="relative p-0! overflow-hidden">
      <img
        src={celebrationContent.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full px-6 py-14 md:py-20 text-center space-y-6 text-white">
        <img src={BBL_IMAGES.logoWhite} alt="Black Belt Legacy" className="h-14 md:h-20 mx-auto" />
        <p className="italic text-white/90">{celebrationContent.opener}</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-balance">
          {celebrationContent.titleLead}{" "}
          <span className="text-primary">{celebrationContent.titleAccent}</span>{" "}
          {celebrationContent.titleTail}
        </h2>
        <p className="text-white/90 max-w-3xl mx-auto leading-relaxed">
          as he joins the Dirty Dozen's <span className="font-semibold">Bob Bass</span> and{" "}
          <span className="font-semibold">John Will</span> in promotion by{" "}
          <span className="text-primary font-semibold">Professor Rigan Machado</span> to the rank of{" "}
          <span className="text-primary font-bold">7th Degree Coral Belt</span>
        </p>
        <RegisterButtons />
      </div>
    </Card>
  </section>
)

const BblRedBeltCelebration = () => (
  <section className="w-full">
    <Card hover={false} className="relative p-0! overflow-hidden">
      <img
        src={redBeltCelebration.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/75 via-red-950/60 to-black/85"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full space-y-7 px-6 py-16 text-center text-white md:py-24">
        <img src={BBL_IMAGES.logoWhite} alt="Black Belt Legacy" className="h-14 md:h-20 mx-auto" />
        <p className="italic text-white/90">{redBeltCelebration.opener}</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-balance">
          {redBeltCelebration.titleLead}{" "}
          <span className="text-primary">{redBeltCelebration.titleAccent}</span>{" "}
          {redBeltCelebration.titleTail}
        </h2>
        <p className="text-white/90 max-w-3xl mx-auto leading-relaxed">
          {redBeltCelebration.bodyLead}{" "}
          <span className="text-primary font-bold">{redBeltCelebration.bodyRank}</span>{" "}
          {redBeltCelebration.bodyMid}{" "}
          <span className="font-semibold">{redBeltCelebration.bodyBy}</span>{" "}
          {redBeltCelebration.bodyTail}
        </p>
        <RegisterButtons />
      </div>
    </Card>
  </section>
)

const MarqueeCard = ({
  name,
  rank,
  image,
  date,
}: {
  name: string
  rank: string
  image?: string
  date?: string
}) => (
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
      <Badge
        className={cx(
          "border",
          rank.includes("Coral")
            ? BELT_BADGE_CLASSES.coral
            : rank.includes("Red")
              ? BELT_BADGE_CLASSES.red
              : "bg-muted",
        )}
      >
        {rank}
      </Badge>
    </div>
  </div>
)

type MarqueeRow = {
  key: string
  label: string
  href: string
  direction?: "left" | "right"
  members: Array<{ name: string; rank: string; image?: string; date?: string }>
}

/** "Coral Belt (Red/Black) - 7th Degree" -> "7th Degree Coral Belt" (display only; tree stays SoT). */
const formatRankName = (rank: string) => {
  const gm = rank.includes("Grand Master")
  const cleaned = rank
    .replace(/\s*\(Grand Master\)\s*/, "")
    .replace(/\s*\(Red\/(?:Black|White)\)\s*/, " ")
  const match = cleaned.match(/^(.+?Belt)\s*-\s*(\d+(?:st|nd|rd|th) Degree)$/)
  const base = match ? `${match[2]} ${match[1].trim()}` : rank
  return gm ? `${base} — Grand Master` : base
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

type MarqueeMemberView = { name: string; rank: string; image?: string; date?: string }

const toMember = (award: {
  user: { name: string; image: string | null; passport: { avatarUrl: string | null } | null } | null
  rank: { name: string }
}): MarqueeMemberView[] => {
  if (!award.user?.name) return []
  return [
    {
      name: award.user.name,
      rank: formatRankName(award.rank.name),
      image: award.user.passport?.avatarUrl ?? award.user.image ?? MARQUEE_PHOTOS[award.user.name],
    },
  ]
}

/** Rosters come from the lineage tree (PromotionEvent -> RankAward, ADR 0016). */
const getPromotionMarqueeRows = async (): Promise<MarqueeRow[]> => {
  const memberSelect = {
    user: { select: { name: true, image: true, passport: { select: { avatarUrl: true } } } },
    rank: { select: { name: true } },
  } as const

  const [events, individualAwards] = await Promise.all([
    db.promotionEvent.findMany({
      orderBy: { eventDate: "desc" },
      take: 2,
      select: {
        id: true,
        title: true,
        slug: true,
        eventDate: true,
        location: true,
        rankAwards: { select: memberSelect },
      },
    }),
    // Recent top-rank promotions awarded outside a recorded ceremony (e.g. Meyer, Will).
    db.rankAward.findMany({
      where: {
        promotionEventId: null,
        awardedAt: { gte: new Date("2024-01-01") },
        OR: [{ rank: { name: { contains: "Coral" } } }, { rank: { name: { contains: "Red" } } }],
      },
      orderBy: { awardedAt: "desc" },
      take: 8,
      select: { ...memberSelect, awardedAt: true },
    }),
  ])

  const rows: MarqueeRow[] = events
    .filter(event => event.rankAwards.length > 0)
    .map(event => ({
      key: event.id,
      label: [event.title, formatDate(event.eventDate), event.location].filter(Boolean).join(" · "),
      href: event.slug ? `/events/${event.slug}` : BBL_ROUTES.lineage,
      members: event.rankAwards.flatMap(toMember),
    }))

  if (individualAwards.length > 0) {
    rows.push({
      key: "individual-promotions",
      label: "Individual Ceremonies · Recently Promoted",
      href: BBL_ROUTES.lineage,
      members: individualAwards.flatMap(award =>
        toMember(award).map(member => ({
          ...member,
          date: award.awardedAt ? formatDate(award.awardedAt) : undefined,
        })),
      ),
    })
  }

  return rows.map((row, index) => ({
    ...row,
    direction: index % 2 === 1 ? ("right" as const) : ("left" as const),
  }))
}

const BblPromotionMarquee = ({ rows }: { rows: MarqueeRow[] }) => (
  <section className="w-full space-y-8">
    {/* Auto-scroll keyframes (legacy BlackBeltLegacyLanding carousel pattern) */}
    <style>{`
      @keyframes bbl-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      @keyframes bbl-marquee-reverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
      .bbl-marquee-track { animation: bbl-marquee var(--bbl-marquee-duration, 45s) linear infinite; }
      .bbl-marquee-track[data-direction="right"] { animation-name: bbl-marquee-reverse; }
      .bbl-marquee-track:hover { animation-play-state: paused; }
      @media (prefers-reduced-motion: reduce) { .bbl-marquee-track { animation: none; } }
    `}</style>
    <SectionHeading eyebrow={promotionMarquee.eyebrow} title={promotionMarquee.title} />
    <div className="space-y-6">
      {rows.map(row => (
        <div key={row.key} className="space-y-3">
          <Link
            href={row.href}
            className="block text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
          >
            {row.label}
          </Link>
          <div className="relative overflow-hidden motion-reduce:overflow-x-auto">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-background to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-background to-transparent"
              aria-hidden="true"
            />
            <div
              className="bbl-marquee-track flex w-max gap-5"
              data-direction={row.direction}
              style={
                { "--bbl-marquee-duration": `${row.members.length * 7}s` } as React.CSSProperties
              }
            >
              {[...row.members, ...row.members].map((member, index) => (
                <MarqueeCard key={`${member.name}-${index}`} {...member} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)

const BblTreeTeaser = () => (
  <section className="w-full space-y-6 text-center">
    <SectionHeading
      eyebrow={treeSection.eyebrow}
      title={treeSection.title}
      description={treeSection.description}
    />
    <Button size="lg" variant="primary" render={<Link href={BBL_ROUTES.lineage} />}>
      {treeSection.ctaLabel}
    </Button>
  </section>
)

const BblPromos = () => (
  <>
    {promos.map(promo => (
      <section key={promo.title} className="w-full">
        <Card hover={false} className="relative p-0! overflow-hidden">
          <img
            src={promo.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-10 dark:opacity-15"
            loading="lazy"
            aria-hidden="true"
          />
          <div className="relative w-full grid gap-8 lg:grid-cols-2 lg:items-center p-6 md:p-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                  {promo.eyebrow}
                </p>
                {promo.comingSoon && <Badge variant="outline">Coming Soon</Badge>}
              </div>
              <H2>{promo.title}</H2>
              <p className="text-muted-foreground max-w-xl">{promo.description}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" variant="primary" render={<Link href={promo.primaryCta.href} />}>
                  {promo.primaryCta.label}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  render={<Link href={promo.secondaryCta.href} />}
                >
                  {promo.secondaryCta.label}
                </Button>
              </div>
            </div>
            <Card hover={false} className="bg-card/90">
              <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                {promo.benefitsHeading}
              </p>
              <ul className="mt-3 space-y-2.5">
                {promo.benefits.map(benefit => (
                  <li key={benefit} className="flex items-start gap-2 text-sm">
                    <span className="text-primary" aria-hidden="true">
                      •
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Card>
      </section>
    ))}
  </>
)

export const BblLanding = async () => {
  const marqueeRows = await getPromotionMarqueeRows()

  const sections = [
    <BblHero key="hero" />,
    <BblVideo key="video" />,
    <BblDirtyDozen key="dirty-dozen" />,
    <BblHeritage key="heritage" />,
    <BblValueProps key="value-props" />,
    <BblFeatures key="features" />,
    <BblTimeline key="timeline" />,
    <BblRedBeltCelebration key="red-belt" />,
    ...(marqueeRows.length > 0 ? [<BblPromotionMarquee key="marquee" rows={marqueeRows} />] : []),
    <BblTestimonials key="testimonials" />,
    <BblFaq key="faq" />,
    <BblFinalCta key="final-cta" />,
    <BblCelebration key="celebration" />,
    <BblTreeTeaser key="tree" />,
    <BblPromos key="promos" />,
  ]

  return (
    <div
      className={cx(
        headingFont.variable,
        bodyFont.variable,
        "flex w-full flex-col gap-y-20 pb-10 md:gap-y-28",
        // Legacy type treatment: Poppins italic extrabold uppercase headings, Inter body.
        "[font-family:var(--font-bbl-body)]",
        "[&_:is(h1,h2)]:[font-family:var(--font-bbl-heading)]! [&_:is(h1,h2)]:uppercase [&_:is(h1,h2)]:italic [&_:is(h1,h2)]:font-extrabold! [&_:is(h1,h2)]:tracking-[0.02em]",
        "[&_:is(h3,h4)]:[font-family:var(--font-bbl-heading)]!",
      )}
    >
      {sections.map((node, index) => (
        <BblReveal key={node.key} delay={index === 0 ? 0 : 0.08}>
          {node}
        </BblReveal>
      ))}
    </div>
  )
}
