import { LockKeyholeIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"

type UpgradePanelProps = {
  /** The short lock headline ("Premium technique" / the community locked_heading). */
  heading: string
  /** One-sentence teaser under the headline. */
  description: string
  /** Primary CTA label ("Unlock with Premium"). */
  ctaLabel: string
  /** The paid-tier upgrade funnel route the CTA links to. */
  href: string
}

/**
 * The "all-locked upgrade panel" idiom (WL-P2-63) — dashed border, `size-14` lock circle,
 * heading/description pair, one primary CTA. ONE shared primitive for the two formerly
 * byte-identical inline copies: the community locked post detail (FI-028b,
 * `app/(web)/posts/[slug]`) and the technique watch fully-premium case (SESSION_0526/0527,
 * `technique-media.tsx`).
 *
 * No-leak by construction: the props are STRINGS ONLY — there is no url/poster/media prop to
 * misuse, so this panel can never emit gated content. The server-side gates
 * (`gateTechniqueMedia`, `gateCommunityPost`) remain the single strip point; this component is
 * pure presentation downstream of them. i18n stays with the caller (community passes translated
 * strings; technique passes its hardcoded copy).
 */
export function UpgradePanel({ heading, description, ctaLabel, href }: UpgradePanelProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-background text-muted-foreground">
        <LockKeyholeIcon className="size-7" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-foreground">{heading}</p>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="primary" size="md" prefix={<LockKeyholeIcon />} render={<Link href={href} />}>
        {ctaLabel}
      </Button>
    </div>
  )
}
