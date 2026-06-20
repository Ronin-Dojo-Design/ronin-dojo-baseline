import type { Metadata } from "next"
import { cache } from "react"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
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

const STATUS_STYLES: Record<FeatureStatus, string> = {
  live: "bg-green-100 text-green-800 ring-green-600/20",
  beta: "bg-amber-100 text-amber-900 ring-amber-600/20",
  planned: "bg-neutral-100 text-neutral-700 ring-neutral-500/20",
}

const STATUS_LABEL: Record<FeatureStatus, string> = {
  live: "Live",
  beta: "Beta",
  planned: "Planned",
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
      <li key={item.name} className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-neutral-900">{item.name}</span>
          <StatusBadge status={status} />
          {item.note && <StatusBadge status={status} label={item.note} />}
        </div>
        <p className="mt-1 text-sm text-neutral-600">{item.description}</p>
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

      <Section>
        <Section.Content>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-600">
            <StatusBadge status="live" label={`Milestone · ${FEATURE_LOG.milestone}`} />
            <span>
              BBLApp {FEATURE_LOG.version} · launched {FEATURE_LOG.launchedOn}
            </span>
          </div>

          <h2 className="mt-8 text-xl font-bold text-neutral-900">
            ✅ Live — set and in production
          </h2>
          <FeatureList items={LIVE_FEATURES} status="live" />

          <h2 className="mt-10 text-xl font-bold text-neutral-900">
            🧪 In beta — built, hardening toward GA
          </h2>
          <FeatureList items={BETA_FEATURES} status="beta" />

          <h2 className="mt-10 text-xl font-bold text-neutral-900">🛠️ Planned</h2>
          <FeatureList items={PLANNED_FEATURES} status="planned" />

          <h2 className="mt-10 text-xl font-bold text-neutral-900">Recent highlights</h2>
          {CHANGELOG.map(entry => (
            <div key={entry.period} className="mt-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
                {entry.period}
              </h3>
              <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm text-neutral-700">
                {entry.items.map(line => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}

          <p className="mt-10 text-sm text-neutral-500">
            Have an idea? Reply to any Black Belt Legacy email and a human will read it.
          </p>
        </Section.Content>
      </Section>

      <StructuredData data={structuredData} />
    </>
  )
}
