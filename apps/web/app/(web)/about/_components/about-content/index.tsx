import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H1, H2 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import type { PolicyPageProps } from "~/components/web/ui/policy-layout"
import { BETA_FEATURES, FEATURE_LOG, LIVE_FEATURES } from "~/lib/feature-log"
import { FeatureRequestDialog } from "../feature-request-dialog"
import { AboutBody } from "./body"

/**
 * Premium /about surface for Black Belt Legacy (BBLApp v4.4): hero → story + tech
 * stack (`AboutBody`) → live/beta feature snapshot (from the feature log) → a
 * feature-request CTA that opens the feedback-wired modal. Brand-token styling
 * (primary/card/muted) mirrors the BBL landing chrome.
 */
export const AboutContent = ({ siteName }: PolicyPageProps) => {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-16 px-4 py-8 md:space-y-20 md:py-12">
      {/* Hero */}
      <section className="space-y-4 text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary ring-1 ring-inset ring-primary/20">
          BBLApp {FEATURE_LOG.version} · {FEATURE_LOG.milestone}
        </span>
        <H1 className="mx-auto max-w-3xl">{siteName}</H1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Preserve, verify, explore, and share your martial arts legacy — through profiles, lineage
          trees, rank history, curriculum, certifications, and community knowledge.
        </p>
        <p className="text-sm text-muted-foreground">Launched {FEATURE_LOG.launchedOn}.</p>
      </section>

      <AboutBody siteName={siteName} />

      {/* Live / beta feature snapshot */}
      <section className="space-y-5">
        <H2>What&apos;s live — and what&apos;s coming</H2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-primary/10 bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-400">✅ Live</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {LIVE_FEATURES.slice(0, 8).map(feature => (
                <li key={feature.name}>{feature.name}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-primary/10 bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-400">🧪 In beta</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {BETA_FEATURES.map(feature => (
                <li key={feature.name}>
                  {feature.name}
                  {feature.note ? ` — ${feature.note.toLowerCase()}` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-center">
          <Button variant="secondary" render={<Link href="/changelog" />}>
            See the full feature log →
          </Button>
        </div>
      </section>

      {/* Feature-request CTA */}
      <section>
        <Card
          hover={false}
          className="items-center space-y-4 bg-gradient-to-br from-card to-muted p-8 text-center md:p-12"
        >
          <H2>Have a Feature Request? Let us know!</H2>
          <p className="italic text-muted-foreground">The DojoBots are on it…</p>
          <FeatureRequestDialog />
        </Card>
      </section>
    </div>
  )
}
