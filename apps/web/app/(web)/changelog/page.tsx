import type { Metadata } from "next"
import { cache } from "react"
import { H3 } from "~/components/common/heading"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import {
  BETA_FEATURES,
  CHANGELOG,
  FEATURE_LOG,
  type FeatureItem,
  type FeatureStatus,
  LIVE_FEATURES,
  PLANNED_FEATURES,
} from "~/lib/feature-log"
import { getPageData, getPageMetadata } from "~/lib/pages"

const PAGE_URL = "/changelog"
const PAGE_TITLE = "What's New"
const PAGE_DESCRIPTION = `What's set and live in Black Belt Legacy (BBLApp ${FEATURE_LOG.version}), what's in beta, and what's coming next — we build continuously.`

const getData = cache(async () =>
  getPageData(PAGE_URL, PAGE_TITLE, PAGE_DESCRIPTION, {
    breadcrumbs: [{ url: PAGE_URL, title: PAGE_TITLE }],
  }),
)

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

// Token-driven, dark-safe status colors (the site ships a dark theme). Semantic status hue at low
// opacity + light text reads on `bg-background`; planned uses pure tokens.
const STATUS_STYLES: Record<FeatureStatus, string> = {
  live: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  beta: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  planned: "bg-muted text-muted-foreground ring-border",
}

const STATUS_LABEL: Record<FeatureStatus, string> = {
  live: "Live",
  beta: "Beta",
  planned: "Planned",
}

const SECTION_LABEL: Record<FeatureStatus, string> = {
  live: "text-emerald-400",
  beta: "text-amber-400",
  planned: "text-muted-foreground",
}

const StatusBadge = ({ status, label }: { status: FeatureStatus; label?: string }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${STATUS_STYLES[status]}`}
  >
    {label ?? STATUS_LABEL[status]}
  </span>
)

const FeatureList = ({ items, status }: { items: FeatureItem[]; status: FeatureStatus }) => (
  <ul className="mt-4 flex flex-col gap-3">
    {items.map(item => (
      <li key={item.name} className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">{item.name}</span>
          <StatusBadge status={status} />
          {item.note && <StatusBadge status={status} label={item.note} />}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
      </li>
    ))}
  </ul>
)

export default async function () {
  const { breadcrumbs, structuredData } = await getData()

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <Intro>
        <IntroTitle>{PAGE_TITLE}</IntroTitle>
        <IntroDescription>{PAGE_DESCRIPTION}</IntroDescription>
      </Intro>

      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <StatusBadge status="live" label={`Milestone · ${FEATURE_LOG.milestone}`} />
          <span>
            BBLApp {FEATURE_LOG.version} · launched {FEATURE_LOG.launchedOn}
          </span>
        </div>

        <H3 className="mt-8">✅ Live — set and in production</H3>
        <FeatureList items={LIVE_FEATURES} status="live" />

        <H3 className="mt-10">🧪 In beta — built, hardening toward GA</H3>
        <FeatureList items={BETA_FEATURES} status="beta" />

        <H3 className="mt-10">🛠️ Planned</H3>
        <FeatureList items={PLANNED_FEATURES} status="planned" />

        <H3 className="mt-10">Recent highlights</H3>
        {CHANGELOG.map(entry => (
          <div key={entry.period} className="mt-4">
            <p
              className={`text-xs font-bold uppercase tracking-[0.18em] ${SECTION_LABEL.live} mb-0`}
            >
              {entry.period}
            </p>
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
              {entry.items.map(line => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}

        <p className="mt-10 text-sm text-muted-foreground">
          Have an idea? Reply to any Black Belt Legacy email and a human will read it.
        </p>
      </div>

      <StructuredData data={structuredData} />
    </>
  )
}
