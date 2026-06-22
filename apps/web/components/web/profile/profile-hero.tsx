import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"

/**
 * Presentation-only profile "above-the-fold" hero (SESSION_0354).
 *
 * Shared by the public claim teaser (rendered from already-public/projected row
 * data) and the owner live-preview inside the create/edit forms (rendered from
 * live form state). It holds NO data-fetching and NO private fields — callers
 * pass only display values, so it can never leak a HIDDEN profile.
 */

export type ProfileHeroBadge = {
  label: string
  variant?: "primary" | "soft" | "outline"
}

export type ProfileHeroProps = {
  name: string | null
  /** Secondary line — location (people) or owning org (trees/orgs). */
  subtitle?: string | null
  avatarUrl?: string | null
  /** Optional cover photo rendered as the hero background (FI-007 / WL-P2-14). */
  coverPhotoUrl?: string | null
  initials: string
  /** Neutral chips — disciplines, top rank/belt. */
  tags?: string[]
  /** Emphasis badges — paid tier, org type, claim status. */
  badges?: ProfileHeroBadge[]
  className?: string
}

export function ProfileHero({
  name,
  subtitle,
  avatarUrl,
  coverPhotoUrl,
  initials,
  tags = [],
  badges = [],
  className,
}: ProfileHeroProps) {
  return (
    <Stack
      direction="row"
      className={cx(
        "relative items-center gap-4 overflow-hidden rounded-lg border bg-card p-4 sm:p-6",
        className,
      )}
    >
      {coverPhotoUrl && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url("${coverPhotoUrl}")` }}
          />
          {/* Legibility scrim — keep avatar + text readable over any cover image. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-card via-card/85 to-card/50"
          />
        </>
      )}

      <Avatar className="relative z-10 size-16 shrink-0 sm:size-20">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? "Profile"} />}
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>

      <div className="relative z-10 min-w-0 flex-1">
        <h2 className="truncate font-semibold text-foreground text-xl sm:text-2xl">
          {name?.trim() || "Your name"}
        </h2>

        {subtitle && <p className="truncate text-muted-foreground text-sm">{subtitle}</p>}

        {(tags.length > 0 || badges.length > 0) && (
          <Stack direction="row" className="mt-2 min-w-0 flex-wrap gap-1">
            {badges.map(badge => (
              <Badge
                key={badge.label}
                variant={badge.variant ?? "outline"}
                className="max-w-full whitespace-normal break-words text-left"
              >
                {badge.label}
              </Badge>
            ))}
            {tags.map(tag => (
              <Badge
                key={tag}
                variant="soft"
                className="max-w-full whitespace-normal break-words text-left"
              >
                {tag}
              </Badge>
            ))}
          </Stack>
        )}
      </div>
    </Stack>
  )
}
