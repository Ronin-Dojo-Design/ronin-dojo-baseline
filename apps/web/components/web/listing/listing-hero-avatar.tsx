import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"

/**
 * Premium detail-page hero avatar (SESSION_0415) — the school / org counterpart to the
 * person profile hero and the `FacetResultCard` avatar. Large, `rounded-2xl`, ringed and
 * shadowed so the listing detail surfaces read as the same family of cards. Shows the
 * org logo with `object-cover` when present; otherwise a gradient-initials fallback (no
 * bare letters on a flat swatch). Brand-neutral: theme tokens only.
 */
export function ListingHeroAvatar({
  name,
  logoUrl,
  initials,
}: {
  name: string
  logoUrl?: string | null
  initials: string
}) {
  return (
    <Avatar className="size-16 shrink-0 rounded-2xl ring-2 ring-border shadow-sm sm:size-20">
      {logoUrl && <AvatarImage src={logoUrl} alt={name} className="rounded-2xl" />}
      <AvatarFallback className="rounded-2xl bg-gradient-to-br from-accent to-muted text-xl font-bold text-foreground sm:text-2xl">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
