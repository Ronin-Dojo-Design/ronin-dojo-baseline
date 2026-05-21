"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  LayersIcon,
  LayoutGridIcon,
  ListIcon,
} from "lucide-react"
import { useRef, useState } from "react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H2, H3, H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/common/tooltip"
import { ExternalLink } from "~/components/web/external-link"
import { AffiliateGearCard } from "~/components/web/tuffbuffs/affiliate-gear-card"
import { resolvePublicMediaUrl } from "~/lib/public-media-url"
import { formatGearPrice } from "~/lib/tuffbuffs/gear-utils"
import { cx } from "~/lib/utils"
import type { TuffBuffsAffiliateGearProduct } from "~/types/tuffbuffs-gear"

type GearViewMode = "grid" | "list" | "carousel"

export type AffiliateGearViewItem = {
  product: TuffBuffsAffiliateGearProduct
  badge?: string
}

export type AffiliateGearViewSection = {
  id: string
  title: string
  description?: string
  countLabel: string
  items: AffiliateGearViewItem[]
}

type AffiliateGearBrowserProps = {
  programSections: AffiliateGearViewSection[]
  categorySections: AffiliateGearViewSection[]
}

type AffiliateGearSectionProps = {
  section: AffiliateGearViewSection
  viewMode: GearViewMode
}

type AffiliateGearListItemProps = {
  item: AffiliateGearViewItem
}

const categoryLabel: Record<TuffBuffsAffiliateGearProduct["category"], string> = {
  training: "Training",
  accessories: "Accessory",
  recovery: "Recovery",
}

const viewModes = [
  { value: "grid", label: "Grid", icon: LayoutGridIcon },
  { value: "list", label: "List", icon: ListIcon },
  { value: "carousel", label: "Carousel", icon: LayersIcon },
] as const satisfies readonly {
  value: GearViewMode
  label: string
  icon: typeof LayoutGridIcon
}[]

function AffiliateGearViewToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: GearViewMode
  onViewModeChange: (viewMode: GearViewMode) => void
}) {
  return (
    <TooltipProvider delay={0}>
      <div className="inline-flex overflow-hidden rounded-lg border bg-background">
        {viewModes.map(({ value, label, icon: Icon }, index) => (
          <Tooltip key={value}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label={`${label} view`}
                  aria-pressed={viewMode === value}
                  onClick={() => onViewModeChange(value)}
                  className={cx(
                    "inline-flex h-9 items-center gap-2 px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    index > 0 && "border-l",
                    viewMode === value
                      ? "bg-foreground text-background hover:bg-foreground hover:text-background"
                      : "text-secondary-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="max-sm:sr-only">{label}</span>
                </button>
              }
            />
            <TooltipContent>{`${label} view`}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}

function AffiliateGearListItem({ item }: AffiliateGearListItemProps) {
  const { product, badge } = item
  const imageSrc =
    resolvePublicMediaUrl(product.imagePath ?? "/images/merch/placeholder.svg") ??
    "/images/merch/placeholder.svg"

  return (
    <Card hover className="grid gap-4 p-4 sm:grid-cols-[8rem_1fr_auto] sm:items-center">
      <div className="flex h-28 w-full items-center justify-center rounded-md bg-muted/50 p-3 sm:w-32">
        <img src={imageSrc} alt="" loading="lazy" className="h-full w-full object-contain" />
      </div>

      <div className="min-w-0 space-y-2">
        <Stack size="sm" className="flex-wrap">
          <Badge variant="outline">{categoryLabel[product.category]}</Badge>
          {badge && <Badge variant="soft">{badge}</Badge>}
        </Stack>
        <H4 render={props => <h3 {...props}>{props.children}</h3>} className="text-base">
          {product.name}
        </H4>
        <p className="text-sm text-secondary-foreground">{product.description}</p>
      </div>

      <Stack className="justify-between gap-3 sm:flex-col sm:items-end" wrap={false}>
        <span className="text-sm font-semibold">{formatGearPrice(product.amountCents)}</span>
        <Button
          size="sm"
          variant="secondary"
          suffix={<ExternalLinkIcon />}
          render={
            <ExternalLink
              href={product.affiliateUrl}
              doTrack
              eventName="click_affiliate_gear"
              eventProps={{ productId: product.id, source: "tuffbuffs_gear_list" }}
            />
          }
        >
          Amazon
        </Button>
      </Stack>
    </Card>
  )
}

function AffiliateGearCarousel({ section }: { section: AffiliateGearViewSection }) {
  const trackRef = useRef<HTMLDivElement>(null)

  const shift = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return

    const firstCard = track.querySelector<HTMLElement>("[data-gear-carousel-card]")
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 304
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || "16") || 16
    track.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" })
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-background to-transparent" />

      <div className="absolute right-2 top-2 z-20 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
          aria-label={`Scroll ${section.title} left`}
          onClick={() => shift(-1)}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
          aria-label={`Scroll ${section.title} right`}
          onClick={() => shift(1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>

      <div
        ref={trackRef}
        data-gear-carousel-track
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pr-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {section.items.map(item => (
          <div
            key={`${section.id}-${item.product.id}-${item.badge ?? "item"}`}
            data-gear-carousel-card
            className="w-[19rem] shrink-0 snap-start"
          >
            <AffiliateGearCard product={item.product} badge={item.badge} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AffiliateGearSection({ section, viewMode }: AffiliateGearSectionProps) {
  if (section.items.length === 0) return null

  return (
    <section className="space-y-4" data-gear-section={section.id}>
      <Stack className="w-full justify-between gap-3" wrap={false}>
        <div className="space-y-1">
          <H3>{section.title}</H3>
          {section.description && (
            <p className="max-w-2xl text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
        <Badge variant="outline">{section.countLabel}</Badge>
      </Stack>

      {viewMode === "grid" && (
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {section.items.map(item => (
            <AffiliateGearCard
              key={`${section.id}-${item.product.id}-${item.badge ?? "item"}`}
              product={item.product}
              badge={item.badge}
            />
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-3">
          {section.items.map(item => (
            <AffiliateGearListItem
              key={`${section.id}-${item.product.id}-${item.badge ?? "item"}`}
              item={item}
            />
          ))}
        </div>
      )}

      {viewMode === "carousel" && <AffiliateGearCarousel section={section} />}
    </section>
  )
}

export function AffiliateGearBrowser({
  programSections,
  categorySections,
}: AffiliateGearBrowserProps) {
  const [viewMode, setViewMode] = useState<GearViewMode>("grid")

  return (
    <div className="space-y-14" data-gear-view-mode={viewMode}>
      <section className="space-y-6">
        <Stack className="w-full justify-between gap-4" wrap={false}>
          <div className="space-y-2">
            <H2>Program Lists</H2>
            <p className="max-w-2xl text-sm text-secondary-foreground">
              These lists mirror the legacy TuffBuffs class gear map. Stripe/ship-to-you TuffBuffs
              merch is intentionally separate from the Amazon affiliate links.
            </p>
          </div>
          <AffiliateGearViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </Stack>

        <div className="space-y-10">
          {programSections.map(section => (
            <AffiliateGearSection key={section.id} section={section} viewMode={viewMode} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <Stack className="w-full justify-between gap-4" wrap={false}>
          <div className="space-y-2">
            <H2>All Amazon Gear</H2>
            <p className="max-w-2xl text-sm text-secondary-foreground">
              Full affiliate catalog pulled forward from the monorepo TuffBuffs merch source.
            </p>
          </div>
          <AffiliateGearViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </Stack>

        <div className="space-y-10">
          {categorySections.map(section => (
            <AffiliateGearSection key={section.id} section={section} viewMode={viewMode} />
          ))}
        </div>
      </section>
    </div>
  )
}
