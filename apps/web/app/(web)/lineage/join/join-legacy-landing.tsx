"use client"

import { BarChart3Icon, CheckIcon, NetworkIcon, SwordsIcon, TrophyIcon } from "lucide-react"
import { useState, type ComponentType, type ReactNode } from "react"
import { EmailCapture } from "~/app/(web)/_components/bbl-teaser/email-capture"
import { PhoneMarquee } from "~/app/(web)/_components/bbl-teaser/phone-marquee"
import {
  BBL_LOGO_WHITE,
  HERO_IMAGES,
  type MarqueeColumn,
} from "~/app/(web)/_components/bbl-teaser/bbl-teaser-types"
import { Badge } from "~/components/common/badge"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/common/drawer"
import { Note } from "~/components/common/note"
import { cx } from "~/lib/utils"
import {
  faqs,
  faqSection,
  featureHighlights,
  featuresSection,
  heroContent,
  newMemberFeatures,
  valueProps,
  valuePropsSection,
} from "~/app/(web)/(home)/bbl/bbl-landing-content"
import { JoinLegacyForm } from "./join-legacy-form"
import { LineageMembershipCheckout } from "./lineage-membership-checkout"
import type { findLineageMembershipPlans } from "~/server/web/billing/lineage-membership"

type MembershipPlans = Awaited<ReturnType<typeof findLineageMembershipPlans>>

type ClaimableTree = {
  id: string
  name: string
  members: { nodeId: string; displayName: string }[]
} | null

const VALUE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  trophy: TrophyIcon,
  chart: BarChart3Icon,
  swords: SwordsIcon,
}

// BBL display heading: Poppins extrabold (800) — the weight must be explicit because
// Tailwind preflight makes headings inherit the body weight (400), and Poppins is only
// loaded at 600/700/800. Mirrors the landing hero's font-extrabold.
const HEADING = "[font-family:var(--font-bbl-heading),system-ui,sans-serif] font-extrabold"

// Scrolling-phone background for the hero — three columns dealt from the 10 hero
// photos (mirrors the teaser / holding page).
const pickPhones = (indexes: number[]): string[] => indexes.map(index => HERO_IMAGES[index]!)
const PHONE_COLUMNS: MarqueeColumn[] = [
  { images: pickPhones([0, 3, 6, 9]), durationSec: 40, direction: "up" },
  { images: pickPhones([1, 4, 7]), durationSec: 48, direction: "down" },
  { images: pickPhones([2, 5, 8]), durationSec: 44, direction: "up" },
]

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.7rem] font-black uppercase tracking-[0.24em] text-red-500">
      {children}
    </span>
  )
}

export function JoinLegacyLanding({
  claimableTree,
  initialNodeId,
  membershipPlans,
  isCancelled,
  isSubmitted,
  riganSlot,
  videoSlot,
}: {
  claimableTree: ClaimableTree
  initialNodeId?: string
  membershipPlans: MembershipPlans
  isCancelled: boolean
  isSubmitted: boolean
  // Server-rendered sections passed as slots (they're server components).
  riganSlot?: ReactNode
  videoSlot?: ReactNode
}) {
  // Auto-open the join modal when arriving from a "Claim this profile" card.
  const [open, setOpen] = useState(Boolean(initialNodeId))

  const openJoin = () => setOpen(true)

  return (
    <div
      className={cx(
        "[font-family:var(--font-bbl-body),system-ui,sans-serif]",
        // BBL display headings: Poppins extrabold (800) italic uppercase — applied to
        // every h1/h2 so the slotted Rigan + video section headings (H2) match the hero.
        "[&_:is(h1,h2)]:[font-family:var(--font-bbl-heading)]! [&_:is(h1,h2)]:font-extrabold! [&_:is(h1,h2)]:uppercase [&_:is(h1,h2)]:italic [&_:is(h1,h2)]:tracking-[0.02em]",
      )}
    >
      {/* Section 1 — holding-page hero with the scrolling-phone background */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#050505] text-white">
        {/* Phone marquee — full-bleed band, right-weighted on desktop (matches the teaser). */}
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-full opacity-25 sm:w-3/5 sm:opacity-40 lg:w-1/2"
        >
          <div className="h-full px-4 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]">
            <PhoneMarquee columns={PHONE_COLUMNS} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent sm:via-[#050505]/40" />
        </div>

        {/* Red glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10rem] top-[-12rem] h-[40rem] w-[40rem] rounded-full bg-red-600/20 blur-[160px]" />
        </div>

        {/* Hero content — left-weighted, like the holding page */}
        <div className="relative z-10 px-6 py-16 sm:px-10 sm:py-24">
          <div className="max-w-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BBL_LOGO_WHITE}
              alt="Black Belt Legacy"
              width="120"
              height="69"
              className="h-14 w-auto"
            />

            <span className="mt-8 block text-[0.7rem] font-black uppercase tracking-[0.28em] text-red-500">
              {heroContent.eyebrow}
            </span>

            <h1
              className={cx(
                "mt-4 text-balance text-4xl uppercase italic tracking-[0.01em] sm:text-6xl",
                HEADING,
              )}
            >
              {heroContent.titleLead}{" "}
              <span className="text-red-500">{heroContent.titleAccent}</span>
            </h1>

            <p className="mt-5 max-w-lg text-pretty text-base/7 text-white/65">
              {heroContent.description}
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openJoin}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-8 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
              >
                {initialNodeId ? "Claim Your Profile" : "Join the Legacy"}
              </button>
              <a
                href="/lineage/bbl-lineage"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-8 text-sm font-bold uppercase tracking-[0.12em] text-white/80 transition hover:bg-white/[0.06]"
              >
                Explore the lineage
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Rigan (heritage) */}
      {riganSlot && <div className="mt-14">{riganSlot}</div>}

      {/* Section 3 — Rigan video */}
      {videoSlot && <div className="mt-16">{videoSlot}</div>}

      {(isCancelled || isSubmitted) && (
        <div className="mt-6 space-y-3">
          {isCancelled && (
            <div
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
              data-testid="lineage-checkout-cancelled"
            >
              <Badge variant="warning">Checkout cancelled</Badge>
              <Note className="mt-1 text-sm">
                No lineage membership payment was completed. Your claim intake is still available.
              </Note>
            </div>
          )}
          {isSubmitted && (
            <div
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
              data-testid="join-legacy-submitted"
            >
              <Badge variant="success">Intake saved</Badge>
              <Note className="mt-1 text-sm">
                Your lineage information was received. Free profiles wait for steward review;
                Premium and Elite paths continue through lineage membership checkout.
              </Note>
            </div>
          )}
        </div>
      )}

      {/* Value props */}
      <section className="mt-14">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow>{valuePropsSection.eyebrow}</SectionEyebrow>
          <h2 className={cx("mt-3 text-balance text-3xl uppercase italic sm:text-4xl", HEADING)}>
            {valuePropsSection.title}
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">{valuePropsSection.description}</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {valueProps.map(prop => {
            const Icon = VALUE_ICONS[prop.icon] ?? NetworkIcon
            return (
              <div
                key={prop.title}
                className="rounded-2xl border border-border bg-card p-6 transition hover:border-red-500/40"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-red-600/10 text-red-500">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{prop.title}</h3>
                <p className="mt-2 text-sm/6 text-muted-foreground">{prop.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="mt-16">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow>{featuresSection.eyebrow}</SectionEyebrow>
          <h2 className={cx("mt-3 text-balance text-3xl uppercase italic sm:text-4xl", HEADING)}>
            {featuresSection.title}
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">{featuresSection.description}</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featureHighlights.map(feature => (
            <div
              key={feature.title}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              {/* Local public asset; plain img avoids next/image remote config. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={feature.image} alt="" className="h-40 w-full object-cover" loading="lazy" />
              <div className="p-5">
                <span className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-red-500">
                  {feature.kicker}
                </span>
                <h3 className="mt-2 text-base font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm/6 text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {newMemberFeatures.map(feature => (
            <div key={feature.title} className="flex gap-3 rounded-xl border border-border p-4">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
              <div>
                <div className="text-sm font-semibold">{feature.title}</div>
                <div className="mt-1 text-xs/5 text-muted-foreground">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Membership / pricing — only when plans are configured. */}
      {membershipPlans.length > 0 && (
        <section id="lineage-membership" className="mt-16 scroll-mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Membership</SectionEyebrow>
            <h2 className={cx("mt-3 text-balance text-3xl uppercase italic sm:text-4xl", HEADING)}>
              Choose your path
            </h2>
          </div>
          <div className="mt-8">
            <LineageMembershipCheckout plans={membershipPlans} />
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mt-16">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow>{faqSection.eyebrow}</SectionEyebrow>
          <h2 className={cx("mt-3 text-balance text-3xl uppercase italic sm:text-4xl", HEADING)}>
            {faqSection.title}
          </h2>
        </div>
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {faqs.map(faq => (
            <details
              key={faq.question}
              className="group rounded-xl border border-border bg-card p-4 [&_summary]:cursor-pointer"
            >
              <summary className="flex items-center justify-between gap-3 font-semibold marker:content-none">
                {faq.question}
                <span className="text-red-500 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm/6 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-16 rounded-[2rem] border border-red-500/20 bg-red-600/5 px-6 py-12 text-center">
        <h2 className={cx("text-balance text-3xl uppercase italic sm:text-4xl", HEADING)}>
          Your place in the lineage is waiting
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
          Share your history, claim your profile, and preserve your legacy for the next generation.
        </p>
        <button
          type="button"
          onClick={openJoin}
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-8 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
        >
          {initialNodeId ? "Claim Your Profile" : "Join the Legacy"}
        </button>
      </section>

      {/* Email capture — mailing-list signup at the bottom of the landing. */}
      <section className="mt-16 flex flex-col items-center gap-4 text-center">
        <EmailCapture />
      </section>

      {/* Join modal — the existing intake form, in a responsive drawer. */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[92vh] w-full max-w-full overflow-x-hidden overflow-y-auto sm:max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Join the Legacy</DrawerTitle>
            <DrawerDescription>
              Share your martial arts history and, when signed in, claim your lineage profile.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 sm:px-6">
            <JoinLegacyForm claimableTree={claimableTree} initialNodeId={initialNodeId} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
