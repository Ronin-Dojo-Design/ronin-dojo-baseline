import { Carousel, CarouselSlide } from "~/components/common/carousel"
import { H4, H5 } from "~/components/common/heading"
import { Section } from "~/components/web/ui/section"
import type { ProfileMedia, ProfileMediaItem } from "~/server/web/directory/profile-media"
import { ProfileMediaCard } from "./profile-media-card"

/**
 * "Profile Highlights" on the PUBLIC profile (SESSION_0525 C1) — technique-video + podcast rails,
 * parity with the legacy BBLApp (`BBLUserProfile` "Profile Highlights" + `MediaCarousel`).
 *
 * Fetch-free: it consumes only the already-assembled, rich-media-gated `profileMedia` DTO from
 * `loadProfileViewBySlug`, so it never touches the DB and cannot leak a private field — the rails
 * are EMPTY on the free tier, and the whole section self-hides when both rails are empty. The
 * carousel is the shared Embla `Carousel` primitive (reuse-first — no new carousel), fed
 * server-rendered `ProfileMediaCard` slides.
 */

function HighlightRail({
  title,
  subtitle,
  kind,
  items,
}: {
  title: string
  subtitle: string
  kind: "video" | "podcast"
  items: ProfileMediaItem[]
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <H5>{title}</H5>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Carousel ariaLabel={title} controls="desktop" edgeFades>
        {items.map(item => (
          <CarouselSlide key={item.id} width={248}>
            <ProfileMediaCard item={item} kind={kind} />
          </CarouselSlide>
        ))}
      </Carousel>
    </div>
  )
}

export function ProfileHighlightsSection({ media }: { media: ProfileMedia }) {
  if (
    media.featuredMatches.length === 0 &&
    media.techniqueVideos.length === 0 &&
    media.podcasts.length === 0 &&
    media.curriculum.length === 0
  ) {
    return null
  }

  return (
    <Section>
      <H4>Profile Highlights</H4>
      <div className="flex w-full flex-col gap-8">
        <HighlightRail
          title="Featured Matches"
          subtitle="Legendary bouts — opens in a new tab"
          kind="video"
          items={media.featuredMatches}
        />
        <HighlightRail
          title="Technique Videos"
          subtitle="Reels from their curriculum"
          kind="video"
          items={media.techniqueVideos}
        />
        {/* SESSION_0529 Slice 3B (ADR 0046) — AUTHORED techniques (Technique rows keyed by
            authorPassportId), distinct in source from the passport-attachment reels above. Cards
            link internally to the profile-scoped authored watch route. */}
        <HighlightRail
          title="Curriculum"
          subtitle="Techniques they teach"
          kind="video"
          items={media.curriculum}
        />
        <HighlightRail
          title="Podcast Highlights"
          subtitle="Interviews and episodes — opens in a new tab"
          kind="podcast"
          items={media.podcasts}
        />
      </div>
    </Section>
  )
}
